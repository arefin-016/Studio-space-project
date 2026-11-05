import { headers } from "next/headers"
import { ObjectId } from "mongodb"

import { auth, db } from "@/lib/auth"
import {
  normalizeBookingStatus,
  type BookingStatus,
} from "@/lib/booking-status"

const studios = db.collection("newStudio")
const bookings = db.collection("BookedItems")

// Statuses this endpoint may write and the status each one requires.
// Confirm / Cancel act on a Pending booking; Complete acts on Confirmed.
const TRANSITIONS: Record<string, readonly BookingStatus[]> = {
  Confirmed: ["Pending"],
  Cancelled: ["Pending"],
  Completed: ["Confirmed"],
}

/**
 * PATCH /api/booking-requests/:id
 * Body: { status: "Confirmed" | "Completed" | "Cancelled" }
 *
 * Moves a booking through its lifecycle (Pending → Confirmed → Completed).
 * Ownership is verified on the server against the Better Auth session: the
 * caller must be the booking's customer or the studio's owner — never a
 * value taken from the client.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 1. Authenticated caller (session cookie), never a value from the body
    const session = await auth.api.getSession({ headers: await headers() })
    const sessionEmail = session?.user?.email?.trim().toLowerCase()

    if (!sessionEmail) {
      return Response.json({ message: "Unauthorized." }, { status: 401 })
    }

    // 2. Accepted transitions only
    const body = await request.json().catch(() => null)
    const nextStatus = typeof body?.status === "string" ? body.status : ""

    if (!(nextStatus in TRANSITIONS)) {
      return Response.json(
        { message: "Status must be 'Confirmed', 'Completed' or 'Cancelled'." },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(id)) {
      return Response.json({ message: "Invalid booking id." }, { status: 400 })
    }

    const booking = await bookings.findOne({ _id: new ObjectId(id) })

    if (!booking) {
      return Response.json({ message: "Booking not found." }, { status: 404 })
    }

    // 3. Ownership FIRST: caller must be the booking's customer or the
    //    studio's owner. Checked before any status logic so a stranger can
    //    never learn (via 409 vs 403) whether a booking they can't touch
    //    is pending.
    const isCustomer =
      String(booking.user?.email ?? "")
        .trim()
        .toLowerCase() === sessionEmail

    let isOwner = false

    if (!isCustomer) {
      const studioId = String(booking.studio?.id ?? "")

      if (!studioId || !ObjectId.isValid(studioId)) {
        return Response.json(
          { message: "The studio for this booking was not found." },
          { status: 404 }
        )
      }

      const studio = await studios.findOne({ _id: new ObjectId(studioId) })

      if (!studio) {
        return Response.json(
          { message: "The studio for this booking was not found." },
          { status: 404 }
        )
      }

      isOwner =
        typeof studio.ownerEmail === "string" &&
        studio.ownerEmail.trim().toLowerCase() === sessionEmail
    }

    if (!isCustomer && !isOwner) {
      return Response.json(
        { message: "You can only manage your own bookings." },
        { status: 403 }
      )
    }

    // 4. The transition must be valid for the booking's current status
    const currentStatus = normalizeBookingStatus(booking.status)
    const allowedFrom: readonly BookingStatus[] | undefined =
      TRANSITIONS[nextStatus]

    if (!allowedFrom || !allowedFrom.includes(currentStatus)) {
      const how =
        nextStatus === "Completed"
          ? "completed"
          : nextStatus === "Confirmed"
            ? "confirmed"
            : "cancelled"
      const required = nextStatus === "Completed" ? "confirmed" : "pending"

      return Response.json(
        {
          message: `Only ${required} bookings can be ${how}. This booking is ${currentStatus}.`,
        },
        { status: 409 }
      )
    }

    // 5. Write the transition
    const result = await bookings.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: nextStatus } }
    )

    if (result.matchedCount === 0) {
      return Response.json({ message: "Booking not found." }, { status: 404 })
    }

    return Response.json({
      message:
        nextStatus === "Confirmed"
          ? "Booking confirmed."
          : nextStatus === "Completed"
            ? "Booking completed."
            : "Booking cancelled.",
      status: nextStatus,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    console.error("Failed to update booking request:", error)
    return Response.json(
      { message: "Failed to update booking." },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/booking-requests/:id
 *
 * Cancel means remove: the booking is deleted outright. The caller must be
 * the booking's customer or the studio's owner, verified on the server
 * against the Better Auth session.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await auth.api.getSession({ headers: await headers() })
    const sessionEmail = session?.user?.email?.trim().toLowerCase()

    if (!sessionEmail) {
      return Response.json({ message: "Unauthorized." }, { status: 401 })
    }

    if (!ObjectId.isValid(id)) {
      return Response.json({ message: "Invalid booking id." }, { status: 400 })
    }

    const booking = await bookings.findOne({ _id: new ObjectId(id) })

    if (!booking) {
      return Response.json({ message: "Booking not found." }, { status: 404 })
    }

    // Ownership first — same rule as PATCH: customer or studio owner.
    const isCustomer =
      String(booking.user?.email ?? "")
        .trim()
        .toLowerCase() === sessionEmail

    if (!isCustomer) {
      const studioId = String(booking.studio?.id ?? "")

      if (!studioId || !ObjectId.isValid(studioId)) {
        return Response.json(
          { message: "The studio for this booking was not found." },
          { status: 404 }
        )
      }

      const studio = await studios.findOne({ _id: new ObjectId(studioId) })

      if (!studio) {
        return Response.json(
          { message: "The studio for this booking was not found." },
          { status: 404 }
        )
      }

      const isOwner =
        typeof studio.ownerEmail === "string" &&
        studio.ownerEmail.trim().toLowerCase() === sessionEmail

      if (!isOwner) {
        return Response.json(
          { message: "You can only manage your own bookings." },
          { status: 403 }
        )
      }
    }

    const result = await bookings.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return Response.json({ message: "Booking not found." }, { status: 404 })
    }

    return Response.json({
      message: "Booking removed.",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Failed to delete booking:", error)
    return Response.json(
      { message: "Failed to remove booking." },
      { status: 500 }
    )
  }
}
