"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Aperture,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"

const API_URL = "http://localhost:8000"

type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled"

interface Booking {
  _id: string
  status?: string
  user: {
    name: string
    email: string
  }
  studio: {
    id: string
    name?: string
    title?: string
    image?: string | string[]
    location?: string
    category?: string
    hourlyRate?: number
  }
  booking: {
    date: string
    startTime: string
    duration: number
    totalPrice: number
  }
}

const normalizeStatus = (value?: string): BookingStatus => {
  const v = value?.trim().toLowerCase()

  if (v === "confirmed") return "Confirmed"
  if (v === "completed") return "Completed"
  if (v === "cancelled" || v === "canceled") return "Cancelled"

  // Bookings are created as "Pending"; anything unknown stays Pending
  return "Pending"
}

const statusBadgeClasses: Record<BookingStatus, string> = {
  Pending:
    "bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-400",
  Confirmed:
    "bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/30 dark:text-sky-400",
  Completed:
    "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-400",
  Cancelled:
    "bg-red-500/15 text-red-700 ring-1 ring-red-500/30 dark:text-red-400",
}

const StatusBadge = ({ status }: { status: BookingStatus }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] uppercase ${statusBadgeClasses[status]}`}
  >
    {status}
  </span>
)

const categoryLabel = (value?: string) =>
  value
    ? value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Studio"

const formatDate = (value: string) => {
  const d = new Date(`${value}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
}

const formatTime = (value: string) => {
  const [h, m] = value.split(":").map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return value
  const suffix = h >= 12 ? "PM" : "AM"
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`
}

const getImage = (image?: string | string[]) =>
  Array.isArray(image) ? image[0] : image

const studioName = (studio: Booking["studio"]) =>
  studio.name || studio.title || "Studio Booking"

const cardSurface =
  "rounded-2xl border border-[#1a1410]/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"

const tanButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C9A98B] px-7 " +
  "text-xs font-bold uppercase tracking-[0.18em] text-[#1a1410] transition " +
  "hover:bg-[#D8BDA2] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#C9A98B] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-black " +
  "disabled:cursor-not-allowed disabled:opacity-60"

const cancelButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-4 " +
  "border-red-500/50 text-xs font-bold uppercase tracking-[0.14em] text-red-600 transition " +
  "hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:border-red-400/50 dark:text-red-400 dark:hover:bg-red-500/10"

const StudioThumb = ({
  image,
  title,
  className,
}: {
  image?: string
  title: string
  className: string
}) => (
  <div
    className={`relative shrink-0 overflow-hidden bg-[#1a1410]/5 dark:bg-white/5 ${className}`}
  >
    {image ? (
      <Image
        src={image}
        alt={title}
        fill
        sizes="160px"
        unoptimized
        className="object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-[#8a6a4d] dark:text-[#C9A98B]">
        <Aperture size={22} aria-hidden="true" />
      </div>
    )}
  </div>
)

const CancelModal = ({
  booking,
  cancelling,
  onCancel,
  onConfirm,
}: {
  booking: Booking
  cancelling: boolean
  onCancel: () => void
  onConfirm: () => void
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !cancelling) onCancel()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [cancelling, onCancel])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !cancelling && onCancel()}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-[#1a1410]/10 bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-[#0e0b09]">
        <span className="mb-5 flex size-12 items-center justify-center rounded-full border border-red-500/40 text-red-600 dark:text-red-400">
          <Trash2 size={20} aria-hidden="true" />
        </span>

        <h2 className="text-2xl font-extrabold tracking-tight uppercase">
          Cancel this booking?
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-[#3d3228]/75 dark:text-white/60">
          Your booking for{" "}
          <span className="font-bold text-[#1a1410] dark:text-white">
            {studioName(booking.studio)}
          </span>{" "}
          on {formatDate(booking.booking.date)} will be removed. This can&apos;t
          be undone.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={cancelling}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#8a6a4d]/60 px-7 text-xs font-bold tracking-[0.18em] text-[#3d3228] uppercase transition hover:bg-[#C9A98B]/15 disabled:opacity-60 dark:border-[#C9A98B]/60 dark:text-white"
          >
            Keep it
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={cancelling}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-7 text-xs font-bold tracking-[0.18em] text-white uppercase transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 size={16} aria-hidden="true" />
            )}
            {cancelling ? "Cancelling..." : "Yes, cancel booking"}
          </button>
        </div>
      </div>
    </div>
  )
}

const MyBookingsPage = () => {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const email = user?.email ?? ""

  const [bookings, setBookings] = useState<Booking[]>([])
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  const [toCancel, setToCancel] = useState<Booking | null>(null)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/bookedStudio/${encodeURIComponent(email)}`,
        { cache: "no-store" }
      )

      if (!res.ok) throw new Error("Failed to load")

      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
      setStatus("ready")
    } catch (error) {
      console.error("Failed to load bookings:", error)
      setStatus("error")
    }
  }, [email])

  useEffect(() => {
    if (!email) return

    // Schedule the fetch instead of running it synchronously inside the
    // effect (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      load()
    })
  }, [email, load])

  const handleCancel = async () => {
    if (!toCancel) return

    setCancelling(true)

    try {
      const res = await fetch(`${API_URL}/bookings/${toCancel._id}`, {
        method: "DELETE",
      })

      const result = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(
          result?.message ?? `Cancel failed (server error ${res.status}).`
        )
      }

      if (result?.deletedCount === 0) {
        throw new Error("Booking not found. It may already be cancelled.")
      }

      setBookings((prev) => prev.filter((b) => b._id !== toCancel._id))

      toast.success("Booking cancelled", {
        description: `${studioName(toCancel.studio)} on ${formatDate(
          toCancel.booking.date
        )} was removed.`,
      })

      setToCancel(null)
    } catch (err) {
      toast.error(
        err instanceof TypeError
          ? "Can't reach the server. Make sure your backend is running."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
      )
    } finally {
      setCancelling(false)
    }
  }

  const pendingCount = bookings.filter(
    (b) => normalizeStatus(b.status) === "Pending"
  ).length

  return (
    <div className="relative min-h-[100dvh] bg-[#faf8f5] px-4 pt-28 pb-16 text-[#1a1410] sm:px-6 dark:bg-[#0e0b09] dark:text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 50% 0%, rgba(201,169,139,0.18), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl">
        {isPending && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-[#8a6a4d] dark:text-[#C9A98B]" />
          </div>
        )}

        {!isPending && !user && (
          <div className={`${cardSurface} mx-auto max-w-md p-8 text-center`}>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase">
              Sign in first
            </h1>
            <p className="mt-3 text-sm text-[#3d3228]/70 dark:text-white/60">
              Sign in to see your bookings.
            </p>
            <Link
              href={`/signIn?callbackURL=${encodeURIComponent("/my-bookings")}`}
              className={`${tanButton} mt-6`}
            >
              Sign In
            </Link>
          </div>
        )}

        {!isPending && user && (
          <>
            <div className="mb-9">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#8a6a4d] dark:bg-[#C9A98B]" />
                <span className="text-xs font-semibold tracking-[0.3em] text-[#8a6a4d] uppercase dark:text-[#C9A98B]">
                  Your reservations
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight uppercase sm:text-5xl">
                My bookings
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#3d3228]/70 dark:text-white/60">
                All the studios you have booked on StudioSpace.
                {status === "ready" && bookings.length > 0 && (
                  <>
                    {" "}
                    You have{" "}
                    <span className="font-bold text-[#1a1410] dark:text-white">
                      {bookings.length}
                    </span>{" "}
                    {bookings.length === 1 ? "booking" : "bookings"}
                    {pendingCount > 0 && (
                      <>
                        ,{" "}
                        <span className="font-bold text-[#1a1410] dark:text-white">
                          {pendingCount}
                        </span>{" "}
                        awaiting confirmation
                      </>
                    )}
                    .
                  </>
                )}
              </p>
            </div>

            {status === "loading" && (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-[#8a6a4d] dark:text-[#C9A98B]" />
              </div>
            )}

            {status === "error" && (
              <div className={`${cardSurface} p-10 text-center`}>
                <h2 className="text-xl font-extrabold tracking-tight uppercase">
                  Couldn&apos;t load your bookings
                </h2>
                <p className="mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
                  Make sure your backend is running, then try again.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("loading")
                    load()
                  }}
                  className={`${tanButton} mt-6`}
                >
                  Try again
                </button>
              </div>
            )}

            {status === "ready" && bookings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#1a1410]/20 px-6 py-16 text-center dark:border-white/15">
                <h2 className="text-xl font-extrabold tracking-tight uppercase">
                  No bookings yet
                </h2>
                <p className="mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
                  You haven&apos;t booked any studios yet.
                </p>
                <Link href="/studioes" className={`${tanButton} mt-6`}>
                  Explore Studios
                </Link>
              </div>
            )}

            {status === "ready" && bookings.length > 0 && (
              <>
                <div
                  className={`${cardSurface} hidden overflow-x-auto md:block`}
                >
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#1a1410]/10 text-xs tracking-[0.18em] text-[#3d3228]/60 uppercase dark:border-white/10 dark:text-white/50">
                        <th className="px-6 py-4 font-semibold">Studio</th>
                        <th className="px-6 py-4 font-semibold">Location</th>
                        <th className="px-6 py-4 font-semibold">
                          Date &amp; Time
                        </th>
                        <th className="px-6 py-4 font-semibold">Duration</th>
                        <th className="px-6 py-4 font-semibold">Total</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#1a1410]/10 dark:divide-white/10">
                      {bookings.map((item) => {
                        const itemStatus = normalizeStatus(item.status)
                        const canCancel = itemStatus === "Pending"

                        return (
                          <tr key={item._id} className="align-middle">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <StudioThumb
                                  image={getImage(item.studio.image)}
                                  title={studioName(item.studio)}
                                  className="h-14 w-20 rounded-lg"
                                />
                                <div className="min-w-0">
                                  <p className="line-clamp-1 font-extrabold tracking-tight">
                                    {studioName(item.studio)}
                                  </p>
                                  <span className="mt-1 inline-block rounded-full bg-[#C9A98B]/20 px-2.5 py-0.5 text-[11px] font-bold tracking-[0.12em] text-[#8a6a4d] uppercase dark:text-[#C9A98B]">
                                    {categoryLabel(item.studio.category)}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-[#3d3228]/80 dark:text-white/65">
                              <span className="line-clamp-2">
                                {item.studio.location || "Not available"}
                              </span>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-bold">
                                {formatDate(item.booking.date)}
                              </p>
                              <p className="text-[#3d3228]/60 dark:text-white/50">
                                {formatTime(item.booking.startTime)}
                              </p>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap text-[#3d3228]/80 dark:text-white/65">
                              {item.booking.duration}{" "}
                              {item.booking.duration === 1 ? "hour" : "hours"}
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-extrabold">
                                ${item.booking.totalPrice}
                              </p>
                              <p className="text-xs text-[#3d3228]/60 dark:text-white/50">
                                ${item.studio.hourlyRate ?? "N/A"} / hr
                              </p>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={itemStatus} />
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex justify-end">
                                {canCancel ? (
                                  <button
                                    type="button"
                                    onClick={() => setToCancel(item)}
                                    disabled={cancelling}
                                    className={cancelButton}
                                  >
                                    <Trash2 size={13} aria-hidden="true" />
                                    Cancel Booking
                                  </button>
                                ) : (
                                  <span className="text-sm text-[#3d3228]/45 dark:text-white/35">
                                    —
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-5 md:hidden">
                  {bookings.map((item) => {
                    const itemStatus = normalizeStatus(item.status)
                    const canCancel = itemStatus === "Pending"

                    return (
                      <article
                        key={item._id}
                        className={`${cardSurface} overflow-hidden`}
                      >
                        <StudioThumb
                          image={getImage(item.studio.image)}
                          title={studioName(item.studio)}
                          className="aspect-[16/9] w-full"
                        />

                        <div className="p-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full bg-[#C9A98B]/20 px-2.5 py-0.5 text-[11px] font-bold tracking-[0.12em] text-[#8a6a4d] uppercase dark:text-[#C9A98B]">
                              {categoryLabel(item.studio.category)}
                            </span>
                            <StatusBadge status={itemStatus} />
                          </div>

                          <h2 className="mt-2 text-lg font-extrabold tracking-tight">
                            {studioName(item.studio)}
                          </h2>

                          <p className="mt-2 flex items-start gap-1.5 text-sm text-[#3d3228]/70 dark:text-white/60">
                            <MapPin
                              size={15}
                              className="mt-0.5 shrink-0 text-[#8a6a4d] dark:text-[#C9A98B]"
                              aria-hidden="true"
                            />
                            <span className="min-w-0 break-words">
                              {item.studio.location || "Not available"}
                            </span>
                          </p>

                          <div className="mt-3 space-y-1.5 text-sm text-[#3d3228]/70 dark:text-white/60">
                            <p className="flex items-center gap-1.5">
                              <CalendarDays
                                size={15}
                                className="text-[#8a6a4d] dark:text-[#C9A98B]"
                                aria-hidden="true"
                              />
                              {formatDate(item.booking.date)}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Clock
                                size={15}
                                className="text-[#8a6a4d] dark:text-[#C9A98B]"
                                aria-hidden="true"
                              />
                              {formatTime(item.booking.startTime)} ·{" "}
                              {item.booking.duration}{" "}
                              {item.booking.duration === 1 ? "hour" : "hours"}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-[#1a1410]/10 pt-4 dark:border-white/10">
                            <p className="text-sm text-[#3d3228]/60 dark:text-white/50">
                              ${item.studio.hourlyRate ?? "N/A"} / hr
                            </p>
                            <p className="text-xl font-black tracking-tight">
                              ${item.booking.totalPrice}
                            </p>
                          </div>

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => setToCancel(item)}
                              disabled={cancelling}
                              className={`${cancelButton} mt-4 h-11 w-full`}
                            >
                              <Trash2 size={14} aria-hidden="true" />
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {toCancel && (
        <CancelModal
          booking={toCancel}
          cancelling={cancelling}
          onCancel={() => setToCancel(null)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  )
}

export default MyBookingsPage
