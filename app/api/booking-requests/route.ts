import { headers } from "next/headers"

import { auth, db } from "@/lib/auth"
import { normalizeBookingStatus } from "@/lib/booking-status"

const studios = db.collection("newStudio")
const bookings = db.collection("BookedItems")

// Escape the session email before it goes into a $regex so it is matched
// as a literal string (emails are compared case-insensitively).
const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * GET /api/booking-requests
 *
 * Returns every booking request for the studios owned by the
 * authenticated user. The owner email always comes from the Better Auth
 * session — nothing from the request (query/body) is trusted.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const ownerEmail = session?.user?.email

    if (!ownerEmail) {
      return Response.json({ message: "Unauthorized." }, { status: 401 })
    }

    // 1. Owner's studios (matched on the stored ownerEmail field)
    const ownerStudios = await studios
      .find({
        ownerEmail: {
          $regex: `^${escapeRegExp(ownerEmail)}$`,
          $options: "i",
        },
      })
      .toArray()

    if (ownerStudios.length === 0) {
      return Response.json({ requests: [] })
    }

    const studioById = new Map(
      ownerStudios.map((studio) => [String(studio._id), studio] as const)
    )

    // 2. Bookings that point at one of those studios
    const docs = await bookings
      .find({ "studio.id": { $in: [...studioById.keys()] } })
      .sort({ _id: -1 }) // newest first, same as /getStudio
      .toArray()

    // 3. Shape the response: studio title/image come from the live studio
    //    document (bookings embed a snapshot that can be missing/outdated).
    const requests = docs.map((doc) => {
      const studio = studioById.get(String(doc.studio?.id))

      return {
        _id: String(doc._id),
        status: normalizeBookingStatus(doc.status),
        studio: {
          title: studio?.title ?? doc.studio?.name ?? "Studio",
          image: studio?.image ?? doc.studio?.image ?? null,
          location: studio?.location ?? doc.studio?.location ?? "",
          category: studio?.category ?? doc.studio?.category ?? "",
          hourlyRate: studio?.hourlyRate ?? doc.studio?.hourlyRate ?? null,
        },
        customer: {
          name: doc.user?.name ?? "",
          email: doc.user?.email ?? "",
        },
        booking: {
          date: doc.booking?.date ?? "",
          startTime: doc.booking?.startTime ?? "",
          duration: Number(doc.booking?.duration ?? 0),
          totalPrice: Number(doc.booking?.totalPrice ?? 0),
        },
      }
    })

    return Response.json({ requests })
  } catch (error) {
    console.error("Failed to load booking requests:", error)
    return Response.json(
      { message: "Failed to load booking requests." },
      { status: 500 }
    )
  }
}
