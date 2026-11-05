"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Aperture,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  User,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"
import {
  normalizeBookingStatus,
  type BookingStatus,
  type OwnerStatus,
} from "@/lib/booking-status"

interface BookingRequest {
  _id: string
  status: BookingStatus
  studio: {
    title: string
    image?: string | string[] | null
    location?: string
    category?: string
    hourlyRate?: number | null
  }
  customer: {
    name: string
    email: string
  }
  booking: {
    date: string
    startTime: string
    duration: number
    totalPrice: number
  }
}

/* ---------- display helpers (same conventions as My Bookings) ---------- */

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

const to12h = (h: number, m: number) => {
  const suffix = h >= 12 ? "PM" : "AM"
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`
}

// "10:00 AM – 1:00 PM" — start time plus the end time derived from duration
const timeRange = (startTime?: string, duration?: number) => {
  if (!startTime) return "Not available"

  const [h, m] = startTime.split(":").map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return startTime

  const total = h * 60 + m + Math.max(0, duration ?? 0) * 60
  const endH = Math.floor(total / 60) % 24
  const endM = total % 60

  return `${to12h(h, m)} – ${to12h(endH, endM)}`
}

const getImage = (image?: string | string[] | null) =>
  Array.isArray(image) ? image[0] : (image ?? undefined)

/* ---------- shared styles ---------- */

const cardSurface =
  "rounded-2xl border border-[#1a1410]/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"

const tanButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C9A98B] px-7 " +
  "text-xs font-bold uppercase tracking-[0.18em] text-[#1a1410] transition " +
  "hover:bg-[#D8BDA2] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#C9A98B] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-black " +
  "disabled:cursor-not-allowed disabled:opacity-60"

// Small tan pill (Confirm) — same shape as the old "Update" action
const confirmButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#C9A98B] px-4 " +
  "text-xs font-bold uppercase tracking-[0.14em] text-[#1a1410] transition " +
  "hover:bg-[#D8BDA2] disabled:cursor-not-allowed disabled:opacity-60"

// Small red outline pill (Reject)
const rejectButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-4 " +
  "border-red-500/50 text-xs font-bold uppercase tracking-[0.14em] text-red-600 transition " +
  "hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60 " +
  "dark:border-red-400/50 dark:text-red-400 dark:hover:bg-red-500/10"

/* ---------- status badge ---------- */

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

/* ---------- reject confirmation modal ---------- */

const RejectModal = ({
  request,
  rejecting,
  onCancel,
  onConfirm,
}: {
  request: BookingRequest
  rejecting: boolean
  onCancel: () => void
  onConfirm: () => void
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !rejecting) onCancel()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [rejecting, onCancel])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !rejecting && onCancel()}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-[#1a1410]/10 bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-[#0e0b09]">
        <span className="mb-5 flex size-12 items-center justify-center rounded-full border border-red-500/40 text-red-600 dark:text-red-400">
          <X size={20} aria-hidden="true" />
        </span>

        <h2 className="text-2xl font-extrabold tracking-tight uppercase">
          Reject this booking?
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-[#3d3228]/75 dark:text-white/60">
          Decline the request from{" "}
          <span className="font-bold text-[#1a1410] dark:text-white">
            {request.customer.name || "this customer"}
          </span>{" "}
          for{" "}
          <span className="font-bold text-[#1a1410] dark:text-white">
            {request.studio.title}
          </span>{" "}
          on {formatDate(request.booking.date)}. The booking will be marked as
          Cancelled and the customer will see it in their bookings.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={rejecting}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#8a6a4d]/60 px-7 text-xs font-bold tracking-[0.18em] text-[#3d3228] uppercase transition hover:bg-[#C9A98B]/15 disabled:opacity-60 dark:border-[#C9A98B]/60 dark:text-white"
          >
            Keep it
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={rejecting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-7 text-xs font-bold tracking-[0.18em] text-white uppercase transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {rejecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X size={16} aria-hidden="true" />
            )}
            {rejecting ? "Rejecting..." : "Yes, reject"}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- page ---------- */

const MyBookingRequestsPage = () => {
  const { data: session, isPending } = authClient.useSession()
  const user = session?.user
  const email = user?.email ?? ""

  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
    "loading"
  )

  const [toReject, setToReject] = useState<BookingRequest | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<OwnerStatus | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/booking-requests", { cache: "no-store" })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to load booking requests.")
      }

      setRequests(Array.isArray(data?.requests) ? data.requests : [])
      setLoadState("ready")
    } catch (error) {
      console.error("Failed to load booking requests:", error)
      setLoadState("error")
    }
  }, [])

  useEffect(() => {
    if (!email) return

    // Schedule the fetch instead of running it synchronously inside the
    // effect (react-hooks/set-state-in-effect) — state updates then happen
    // in a later microtask, after the fetch resolves.
    queueMicrotask(() => {
      load()
    })
  }, [email, load])

  // Confirm or reject — updates MongoDB and the local state, no page refresh
  const updateStatus = async (
    item: BookingRequest,
    next: OwnerStatus
  ): Promise<boolean> => {
    if (updatingId) return false

    setUpdatingId(item._id)
    setPendingStatus(next)

    try {
      const res = await fetch(`/api/booking-requests/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      })

      const result = await res.json().catch(() => null)

      if (!res.ok) {
        // 409 = someone already decided this booking; resync with the server
        if (res.status === 409) load()
        throw new Error(
          result?.message ?? `Update failed (server error ${res.status}).`
        )
      }

      setRequests((prev) =>
        prev.map((r) => (r._id === item._id ? { ...r, status: next } : r))
      )

      if (next === "Confirmed") {
        toast.success("Booking confirmed", {
          description: `${item.studio.title} on ${formatDate(
            item.booking.date
          )} is now confirmed.`,
        })
      } else {
        toast.success("Booking rejected", {
          description: `${item.studio.title} on ${formatDate(
            item.booking.date
          )} was moved to Cancelled.`,
        })
      }

      return true
    } catch (err) {
      toast.error(
        err instanceof TypeError
          ? "Can't reach the server. Please try again."
          : err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
      )
      return false
    } finally {
      setUpdatingId(null)
      setPendingStatus(null)
    }
  }

  const handleReject = async () => {
    if (!toReject) return

    const rejected = await updateStatus(toReject, "Cancelled")
    if (rejected) setToReject(null)
  }

  const pendingCount = requests.filter(
    (r) => normalizeBookingStatus(r.status) === "Pending"
  ).length

  const isRejecting =
    !!toReject && updatingId === toReject._id && pendingStatus === "Cancelled"

  const isConfirming = (id: string) =>
    updatingId === id && pendingStatus === "Confirmed"

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
              Sign in as a studio owner to manage your booking requests.
            </p>
            <Link
              href={`/signIn?callbackURL=${encodeURIComponent("/my-booking-requests")}`}
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
                  Studio owner
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight uppercase sm:text-5xl">
                Booking requests
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#3d3228]/70 dark:text-white/60">
                Requests from customers who want to book your studios.
                {loadState === "ready" && requests.length > 0 && (
                  <>
                    {" "}
                    You have{" "}
                    <span className="font-bold text-[#1a1410] dark:text-white">
                      {requests.length}
                    </span>{" "}
                    {requests.length === 1 ? "request" : "requests"}
                    {pendingCount > 0 && (
                      <>
                        ,{" "}
                        <span className="font-bold text-[#1a1410] dark:text-white">
                          {pendingCount}
                        </span>{" "}
                        {pendingCount === 1 ? "awaiting" : "awaiting"} a
                        decision
                      </>
                    )}
                    .
                  </>
                )}
              </p>
            </div>

            {loadState === "loading" && (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-[#8a6a4d] dark:text-[#C9A98B]" />
              </div>
            )}

            {loadState === "error" && (
              <div className={`${cardSurface} p-10 text-center`}>
                <h2 className="text-xl font-extrabold tracking-tight uppercase">
                  Couldn&apos;t load your booking requests
                </h2>
                <p className="mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
                  Please try again in a moment.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLoadState("loading")
                    load()
                  }}
                  className={`${tanButton} mt-6`}
                >
                  Try again
                </button>
              </div>
            )}

            {loadState === "ready" && requests.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#1a1410]/20 px-6 py-16 text-center dark:border-white/15">
                <h2 className="text-xl font-extrabold tracking-tight uppercase">
                  No booking requests yet
                </h2>
                <p className="mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
                  When someone books one of your studios, their request shows up
                  here.
                </p>
                <Link href="/studioes" className={`${tanButton} mt-6`}>
                  Explore Studios
                </Link>
              </div>
            )}

            {loadState === "ready" && requests.length > 0 && (
              <>
                {/* Desktop table */}
                <div
                  className={`${cardSurface} hidden overflow-hidden md:block`}
                >
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#1a1410]/10 text-xs tracking-[0.18em] text-[#3d3228]/60 uppercase dark:border-white/10 dark:text-white/50">
                        <th className="px-6 py-4 font-semibold">Studio</th>
                        <th className="px-6 py-4 font-semibold">Customer</th>
                        <th className="px-6 py-4 font-semibold">
                          Date &amp; Time
                        </th>
                        <th className="px-6 py-4 font-semibold">Total</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#1a1410]/10 dark:divide-white/10">
                      {requests.map((item) => {
                        const itemStatus = normalizeBookingStatus(item.status)
                        const canDecide = itemStatus === "Pending"
                        const rowBusy = updatingId === item._id

                        return (
                          <tr key={item._id} className="align-middle">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <StudioThumb
                                  image={getImage(item.studio.image)}
                                  title={item.studio.title}
                                  className="h-14 w-20 rounded-lg"
                                />
                                <div className="min-w-0">
                                  <p className="line-clamp-1 font-extrabold tracking-tight">
                                    {item.studio.title}
                                  </p>
                                  <span className="mt-1 inline-block rounded-full bg-[#C9A98B]/20 px-2.5 py-0.5 text-[11px] font-bold tracking-[0.12em] text-[#8a6a4d] uppercase dark:text-[#C9A98B]">
                                    {categoryLabel(item.studio.category)}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <p className="flex items-center gap-1.5 font-bold">
                                <User
                                  size={14}
                                  className="shrink-0 text-[#8a6a4d] dark:text-[#C9A98B]"
                                  aria-hidden="true"
                                />
                                {item.customer.name || "Customer"}
                              </p>
                              <p className="mt-0.5 line-clamp-1 text-xs text-[#3d3228]/60 dark:text-white/50">
                                {item.customer.email || "Not available"}
                              </p>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-bold">
                                {formatDate(item.booking.date)}
                              </p>
                              <p className="text-[#3d3228]/60 dark:text-white/50">
                                {timeRange(
                                  item.booking.startTime,
                                  item.booking.duration
                                )}
                              </p>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="font-extrabold">
                                ${item.booking.totalPrice}
                              </p>
                              <p className="text-xs text-[#3d3228]/60 dark:text-white/50">
                                $
                                {item.studio.hourlyRate != null
                                  ? item.studio.hourlyRate
                                  : "N/A"}{" "}
                                / hr
                              </p>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={itemStatus} />
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex flex-wrap justify-end gap-3">
                                {canDecide ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateStatus(item, "Confirmed")
                                      }}
                                      disabled={updatingId !== null}
                                      className={confirmButton}
                                    >
                                      {isConfirming(item._id) ? (
                                        <Loader2
                                          size={13}
                                          className="animate-spin"
                                          aria-hidden="true"
                                        />
                                      ) : (
                                        <Check size={13} aria-hidden="true" />
                                      )}
                                      Confirm
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setToReject(item)}
                                      disabled={rowBusy}
                                      className={rejectButton}
                                    >
                                      <X size={13} aria-hidden="true" />
                                      Reject
                                    </button>
                                  </>
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

                {/* Mobile / tablet cards */}
                <div className="grid gap-5 md:hidden">
                  {requests.map((item) => {
                    const itemStatus = normalizeBookingStatus(item.status)
                    const canDecide = itemStatus === "Pending"
                    const rowBusy = updatingId === item._id

                    return (
                      <article
                        key={item._id}
                        className={`${cardSurface} overflow-hidden`}
                      >
                        <StudioThumb
                          image={getImage(item.studio.image)}
                          title={item.studio.title}
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
                            {item.studio.title}
                          </h2>

                          <div className="mt-3 space-y-1.5 text-sm text-[#3d3228]/70 dark:text-white/60">
                            <p className="flex items-center gap-1.5">
                              <User
                                size={15}
                                className="shrink-0 text-[#8a6a4d] dark:text-[#C9A98B]"
                                aria-hidden="true"
                              />
                              <span className="min-w-0">
                                <span className="font-bold text-[#1a1410] dark:text-white">
                                  {item.customer.name || "Customer"}
                                </span>
                                {item.customer.email && (
                                  <span className="line-clamp-1 block text-xs">
                                    {item.customer.email}
                                  </span>
                                )}
                              </span>
                            </p>

                            <p className="flex items-center gap-1.5">
                              <CalendarDays
                                size={15}
                                className="shrink-0 text-[#8a6a4d] dark:text-[#C9A98B]"
                                aria-hidden="true"
                              />
                              {formatDate(item.booking.date)}
                            </p>

                            <p className="flex items-center gap-1.5">
                              <Clock
                                size={15}
                                className="shrink-0 text-[#8a6a4d] dark:text-[#C9A98B]"
                                aria-hidden="true"
                              />
                              {timeRange(
                                item.booking.startTime,
                                item.booking.duration
                              )}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-[#1a1410]/10 pt-4 dark:border-white/10">
                            <p className="text-sm text-[#3d3228]/60 dark:text-white/50">
                              $
                              {item.studio.hourlyRate != null
                                ? item.studio.hourlyRate
                                : "N/A"}{" "}
                              / hr
                            </p>
                            <p className="text-xl font-black tracking-tight">
                              ${item.booking.totalPrice}
                            </p>
                          </div>

                          {canDecide && (
                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  updateStatus(item, "Confirmed")
                                }}
                                disabled={updatingId !== null}
                                className={`${confirmButton} h-11`}
                              >
                                {isConfirming(item._id) ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Check size={14} aria-hidden="true" />
                                )}
                                Confirm
                              </button>

                              <button
                                type="button"
                                onClick={() => setToReject(item)}
                                disabled={rowBusy}
                                className={`${rejectButton} h-11`}
                              >
                                <X size={14} aria-hidden="true" />
                                Reject
                              </button>
                            </div>
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

      {toReject && (
        <RejectModal
          request={toReject}
          rejecting={isRejecting}
          onCancel={() => {
            if (!updatingId) setToReject(null)
          }}
          onConfirm={handleReject}
        />
      )}
    </div>
  )
}

export default MyBookingRequestsPage
