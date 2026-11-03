"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Aperture,
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

/* ---------- Config ---------- */
const API_URL = "http://localhost:8000";

interface Booking {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  studio: {
    id: string;
    name?: string;
    image?: string | string[];
    location?: string;
    category?: string;
    hourlyRate?: number;
  };
  booking: {
    date: string;
    startTime: string;
    duration: number;
    totalPrice: number;
  };
}

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// "photo-studio" -> "Photo Studio"
const categoryLabel = (value?: string) =>
  value
    ? value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Studio";

// "2026-11-25" -> "25 Nov 2026"
const formatDate = (value: string) => {
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

// "20:13" -> "8:13 PM"
const formatTime = (value: string) => {
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const getImage = (image?: string | string[]) =>
  Array.isArray(image) ? image[0] : image;

/* ---------- Shared styles ---------- */
const cardSurface =
  "rounded-2xl border border-[#1a1410]/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none";

const tanButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C9A98B] px-7 " +
  "text-xs font-bold uppercase tracking-[0.18em] text-[#1a1410] transition " +
  "hover:bg-[#D8BDA2] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#C9A98B] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-black " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const updateButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#C9A98B] px-4 " +
  "text-xs font-bold uppercase tracking-[0.14em] text-[#1a1410] transition hover:bg-[#D8BDA2]";

const deleteButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-4 " +
  "border-red-500/50 text-xs font-bold uppercase tracking-[0.14em] text-red-600 transition " +
  "hover:bg-red-500/10 dark:border-red-400/50 dark:text-red-400";

const inputStyle =
  "w-full rounded-xl border border-[#1a1410]/15 bg-white px-4 py-3 text-sm outline-none " +
  "focus:border-[#C9A98B] dark:border-white/15 dark:bg-[#0e0b09] dark:[color-scheme:dark]";

/* ---------- Small building blocks ---------- */
const StudioThumb = ({
  image,
  title,
  className,
}: {
  image?: string;
  title: string;
  className: string;
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
);

const DeleteModal = ({
  booking,
  deleting,
  onCancel,
  onConfirm,
}: {
  booking: Booking;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !deleting && onCancel()}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-[#1a1410]/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0e0b09] sm:p-8">
        <span className="mb-5 flex size-12 items-center justify-center rounded-full border border-red-500/40 text-red-600 dark:text-red-400">
          <Trash2 size={20} aria-hidden="true" />
        </span>

        <h2 className="text-2xl font-extrabold uppercase tracking-tight">
          Cancel this booking?
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-[#3d3228]/75 dark:text-white/60">
          Your booking for{" "}
          <span className="font-bold text-[#1a1410] dark:text-white">
            {booking.studio.name || "this studio"}
          </span>{" "}
          on {formatDate(booking.booking.date)} will be removed. This
          can&apos;t be undone.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#8a6a4d]/60 px-7 text-xs font-bold uppercase tracking-[0.18em] text-[#3d3228] transition hover:bg-[#C9A98B]/15 disabled:opacity-60 dark:border-[#C9A98B]/60 dark:text-white"
          >
            Keep it
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-7 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 size={16} aria-hidden="true" />
            )}
            {deleting ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditModal = ({
  booking,
  saving,
  onCancel,
  onSave,
}: {
  booking: Booking;
  saving: boolean;
  onCancel: () => void;
  onSave: (values: {
    date: string;
    startTime: string;
    duration: number;
  }) => void;
}) => {
  const [date, setDate] = useState(booking.booking.date);
  const [startTime, setStartTime] = useState(booking.booking.startTime);
  const [duration, setDuration] = useState(String(booking.booking.duration));

  const hourlyRate = booking.studio.hourlyRate ?? 0;
  const total = hourlyRate * Number(duration);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saving, onCancel]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave({ date, startTime, duration: Number(duration) });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => !saving && onCancel()}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-[#1a1410]/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0e0b09] sm:p-8">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          aria-label="Close"
          className="absolute right-5 top-5 rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X size={18} />
        </button>

        <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8a6a4d] dark:text-[#C9A98B]">
          Edit reservation
        </span>

        <h2 className="mt-3 text-2xl font-extrabold uppercase tracking-tight">
          Update booking
        </h2>

        <p className="mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
          {booking.studio.name || "Studio Booking"}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">Date</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Starting time
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={inputStyle}
            >
              {[1, 2, 3, 4, 5, 6, 8].map((hour) => (
                <option key={hour} value={hour}>
                  {hour} {hour === 1 ? "Hour" : "Hours"}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-[#C9A98B]/15 p-4">
            <span className="text-sm font-semibold">New total</span>
            <span className="text-xl font-extrabold text-[#8a6a4d] dark:text-[#C9A98B]">
              ${total}
            </span>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#8a6a4d]/60 px-7 text-xs font-bold uppercase tracking-[0.18em] text-[#3d3228] transition hover:bg-[#C9A98B]/15 disabled:opacity-60 dark:border-[#C9A98B]/60 dark:text-white"
            >
              Cancel
            </button>

            <button type="submit" disabled={saving} className={tanButton}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */
const MyStudioListingsPage = () => {
  const params = useParams<{ email: string }>();
  const email = safeDecode(params?.email ?? "");

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const isOwner =
    !!user && !!email && user.email.toLowerCase() === email.toLowerCase();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const [toDelete, setToDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toEdit, setToEdit] = useState<Booking | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/bookedStudio/${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
      setStatus("ready");
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setStatus("error");
    }
  }, [email]);

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner, load]);

  const handleDelete = async () => {
    if (!toDelete) return;

    setDeleting(true);

    try {
      const res = await fetch(`${API_URL}/deleteBooking/${toDelete._id}`, {
        method: "DELETE",
      });
      const result = await res.json().catch(() => null);

      if (!res.ok || result?.deletedCount === 0) {
        throw new Error(result?.message ?? "Could not delete the booking.");
      }

      setBookings((prev) => prev.filter((b) => b._id !== toDelete._id));
      toast.success("Booking deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(
        err instanceof TypeError
          ? "Can't reach the server. Make sure your backend is running."
          : err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (values: {
    date: string;
    startTime: string;
    duration: number;
  }) => {
    if (!toEdit) return;

    const totalPrice = (toEdit.studio.hourlyRate ?? 0) * values.duration;

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/updateBooking/${toEdit._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, totalPrice }),
      });
      const result = await res.json().catch(() => null);

      if (!res.ok || result?.matchedCount === 0) {
        throw new Error(result?.message ?? "Could not update the booking.");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b._id === toEdit._id
            ? { ...b, booking: { ...values, totalPrice } }
            : b
        )
      );
      toast.success("Booking updated");
      setToEdit(null);
    } catch (err) {
      toast.error(
        err instanceof TypeError
          ? "Can't reach the server. Make sure your backend is running."
          : err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    /* pt-28 clears the fixed navbar */
    <div className="relative min-h-[100dvh] bg-[#faf8f5] px-4 pb-16 pt-28 text-[#1a1410] dark:bg-[#0e0b09] dark:text-white sm:px-6">
      {/* soft tan glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 50% 0%, rgba(201,169,139,0.18), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Session loading */}
        {isPending && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-[#8a6a4d] dark:text-[#C9A98B]" />
          </div>
        )}

        {/* Not signed in */}
        {!isPending && !user && (
          <div className={`${cardSurface} mx-auto max-w-md p-8 text-center`}>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">
              Sign in first
            </h1>
            <p className="mt-3 text-sm text-[#3d3228]/70 dark:text-white/60">
              Sign in to see your studio bookings.
            </p>
            <Link href="/signIn" className={`${tanButton} mt-6`}>
              Sign In
            </Link>
          </div>
        )}

        {/* Signed in as someone else */}
        {!isPending && user && !isOwner && (
          <div className={`${cardSurface} mx-auto max-w-md p-8 text-center`}>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">
              Not your bookings
            </h1>
            <p className="mt-3 text-sm text-[#3d3228]/70 dark:text-white/60">
              You can only view bookings that belong to your own account.
            </p>
            <Link
              href={`/myStudioListings/${encodeURIComponent(user.email)}`}
              className={`${tanButton} mt-6`}
            >
              Go to my bookings
            </Link>
          </div>
        )}

        {/* Bookings */}
        {!isPending && isOwner && (
          <>
            {/* Header */}
            <div className="mb-9">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#8a6a4d] dark:bg-[#C9A98B]" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6a4d] dark:text-[#C9A98B]">
                  Your reservations
                </span>
              </div>

              <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
                My studio bookings
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
                    {bookings.length === 1 ? "booking" : "bookings"}.
                  </>
                )}
              </p>
            </div>

            {/* Loading */}
            {status === "loading" && (
              <div className="flex justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-[#8a6a4d] dark:text-[#C9A98B]" />
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className={`${cardSurface} p-10 text-center`}>
                <h2 className="text-xl font-extrabold uppercase tracking-tight">
                  Couldn&apos;t load your bookings
                </h2>
                <p className="mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
                  Make sure your backend is running, then try again.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatus("loading");
                    load();
                  }}
                  className={`${tanButton} mt-6`}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty */}
            {status === "ready" && bookings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#1a1410]/20 px-6 py-16 text-center dark:border-white/15">
                <h2 className="text-xl font-extrabold uppercase tracking-tight">
                  No bookings yet
                </h2>
                <p className="mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
                  You haven&apos;t booked any studios yet.
                </p>
                <Link href="/studios" className={`${tanButton} mt-6`}>
                  Explore Studios
                </Link>
              </div>
            )}

            {/* Table (tablet and up) */}
            {status === "ready" && bookings.length > 0 && (
              <>
                <div
                  className={`${cardSurface} hidden overflow-hidden md:block`}
                >
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[#1a1410]/10 text-xs uppercase tracking-[0.18em] text-[#3d3228]/60 dark:border-white/10 dark:text-white/50">
                        <th className="px-6 py-4 font-semibold">Studio</th>
                        <th className="px-6 py-4 font-semibold">Location</th>
                        <th className="px-6 py-4 font-semibold">
                          Date &amp; Time
                        </th>
                        <th className="px-6 py-4 font-semibold">Duration</th>
                        <th className="px-6 py-4 font-semibold">Total</th>
                        <th className="px-6 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#1a1410]/10 dark:divide-white/10">
                      {bookings.map((item) => (
                        <tr key={item._id} className="align-middle">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <StudioThumb
                                image={getImage(item.studio.image)}
                                title={item.studio.name || "Studio"}
                                className="h-14 w-20 rounded-lg"
                              />
                              <div className="min-w-0">
                                <p className="line-clamp-1 font-extrabold tracking-tight">
                                  {item.studio.name || "Studio Booking"}
                                </p>
                                <span className="mt-1 inline-block rounded-full bg-[#C9A98B]/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a6a4d] dark:text-[#C9A98B]">
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

                          <td className="whitespace-nowrap px-6 py-4">
                            <p className="font-bold">
                              {formatDate(item.booking.date)}
                            </p>
                            <p className="text-[#3d3228]/60 dark:text-white/50">
                              {formatTime(item.booking.startTime)}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-[#3d3228]/80 dark:text-white/65">
                            {item.booking.duration}{" "}
                            {item.booking.duration === 1 ? "hour" : "hours"}
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <p className="font-extrabold">
                              ${item.booking.totalPrice}
                            </p>
                            <p className="text-xs text-[#3d3228]/60 dark:text-white/50">
                              ${item.studio.hourlyRate ?? "N/A"} / hr
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-3">
                              <button
                                type="button"
                                onClick={() => setToEdit(item)}
                                className={updateButton}
                              >
                                <Pencil size={13} aria-hidden="true" />
                                Update
                              </button>
                              <button
                                type="button"
                                onClick={() => setToDelete(item)}
                                className={deleteButton}
                              >
                                <Trash2 size={13} aria-hidden="true" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards (phones) */}
                <div className="grid gap-5 md:hidden">
                  {bookings.map((item) => (
                    <article
                      key={item._id}
                      className={`${cardSurface} overflow-hidden`}
                    >
                      <StudioThumb
                        image={getImage(item.studio.image)}
                        title={item.studio.name || "Studio"}
                        className="aspect-[16/9] w-full"
                      />

                      <div className="p-5">
                        <span className="inline-block rounded-full bg-[#C9A98B]/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8a6a4d] dark:text-[#C9A98B]">
                          {categoryLabel(item.studio.category)}
                        </span>

                        <h2 className="mt-2 text-lg font-extrabold tracking-tight">
                          {item.studio.name || "Studio Booking"}
                        </h2>

                        <p className="mt-2 flex items-start gap-1.5 text-sm text-[#3d3228]/70 dark:text-white/60">
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0 text-[#8a6a4d] dark:text-[#C9A98B]"
                            aria-hidden="true"
                          />
                          {item.studio.location || "Not available"}
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

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setToEdit(item)}
                            className={`${updateButton} !h-10`}
                          >
                            <Pencil size={13} aria-hidden="true" />
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => setToDelete(item)}
                            className={`${deleteButton} !h-10`}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Update modal */}
      {toEdit && (
        <EditModal
          booking={toEdit}
          saving={saving}
          onCancel={() => setToEdit(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete confirmation */}
      {toDelete && (
        <DeleteModal
          booking={toDelete}
          deleting={deleting}
          onCancel={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default MyStudioListingsPage;