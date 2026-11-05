// Shared booking-status rules used by the owner API routes and the
// Booking Requests page. Pure/isomorphic: safe to import from both
// server route handlers and client components.

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled"

// The only two statuses a studio owner may write (confirm / reject)
export const OWNER_ALLOWED_STATUSES = ["Confirmed", "Cancelled"] as const

export type OwnerStatus = (typeof OWNER_ALLOWED_STATUSES)[number]

export const isOwnerStatus = (
  value: string | null | undefined
): value is OwnerStatus => OWNER_ALLOWED_STATUSES.includes(value as OwnerStatus)

// Bookings are created as "Pending". Older documents may not have the
// field at all, and "canceled" (US spelling) is tolerated — those all
// count as Pending so confirm/reject/cancel actions stay available.
export const normalizeBookingStatus = (
  value?: string | null
): BookingStatus => {
  const v = value?.trim().toLowerCase()

  if (v === "confirmed") return "Confirmed"
  if (v === "completed") return "Completed"
  if (v === "cancelled" || v === "canceled") return "Cancelled"

  return "Pending"
}

export const isPendingBooking = (value?: string | null): boolean =>
  normalizeBookingStatus(value) === "Pending"
