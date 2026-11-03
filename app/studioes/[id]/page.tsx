"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Star,
  Users,
  Clock,
  Camera,
  Wifi,
  Car,
  Wind,
  ShieldCheck,
  CalendarDays,
  X,
  User,
  MessageCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface Studio {
  _id: string;
  name: string;
  category: string;
  hourlyRate: number;
  location: string;
  rating: number;
  image: string;
  images?: string[];
  description?: string;
  capacity?: number;
  amenities?: string[];
  host?: {
    name?: string;
    image?: string;
    email?: string;
  };
  reviews?: {
    _id?: string;
    name: string;
    image?: string;
    rating: number;
    comment: string;
  }[];
}

const API_URL = "http://localhost:8000";

const amenityIcons = [Wifi, Camera, Car, Wind, ShieldCheck];

const StudiosDetailsPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  // Hooks
  const { id } = use(params);
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [studio, setStudio] = useState<Studio | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showBooking, setShowBooking] = useState(false);

  const [booking, setBooking] = useState({
    date: "",
    startTime: "",
    duration: "2",
  });

  // Fetch Studio Details
  useEffect(() => {
    const getStudio = async () => {
      try {
        const res = await fetch(`${API_URL}/getStudio/${id}`);

        if (!res.ok) {
          throw new Error("Studio not found");
        }

        const data = await res.json();
        setStudio(data);
      } catch (error) {
        console.error("Failed to fetch studio:", error);
      } finally {
        setLoading(false);
      }
    };

    getStudio();
  }, [id]);

  // Gallery
  const gallery = studio
    ? [studio.image, ...(studio.images || [])].filter(Boolean)
    : [];

  // Reviews
  const reviews = studio?.reviews || [];

  // Amenities (array)
  const amenities = studio?.amenities || [];

  // Total Price
  const totalPrice = studio
    ? Number(studio.hourlyRate) * Number(booking.duration)
    : 0;

  // Gallery Navigation
  const nextImage = () => {
    if (gallery.length === 0) return;

    setActiveImage((prev) => (prev + 1) % gallery.length);
  };

  const previousImage = () => {
    if (gallery.length === 0) return;

    setActiveImage(
      (prev) => (prev - 1 + gallery.length) % gallery.length
    );
  };

  // Book Now: Check Login
  const handleBookNow = () => {
    if (isPending) return;

    if (!session?.user) {
      router.push(
        `/signIn?callbackURL=${encodeURIComponent(`/studios/${id}`)}`
      );
      return;
    }

    setShowBooking(true);
  };

  // Booking Submit
  const handleBooking = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user) {
      setShowBooking(false);

      router.push(
        `/signIn?callbackURL=${encodeURIComponent(`/studios/${id}`)}`
      );

      return;
    }

    if (!studio) return;

    const bookingData = {
      studioId: studio._id,
      studioName: studio.name,
      userEmail: session.user.email,
      userName: session.user.name,
      date: booking.date,
      startTime: booking.startTime,
      duration: Number(booking.duration),
      totalPrice,
    };

    console.log("Booking Information:", bookingData);

    // TODO: Send bookingData to your backend API.

    alert("Booking details collected successfully!");

    setShowBooking(false);

    setBooking({
      date: "",
      startTime: "",
      duration: "2",
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] dark:bg-[#0e0b09]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#C9A98B]/20 border-t-[#C9A98B]" />

          <p className="mt-4 text-sm font-semibold text-[#8a6a4d] dark:text-[#C9A98B]">
            Loading StudioSpace...
          </p>
        </div>
      </div>
    );
  }

  // Not Found
  if (!studio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-4 text-center dark:bg-[#0e0b09]">
        <Camera size={50} className="text-[#C9A98B]" />

        <h2 className="mt-5 text-2xl font-extrabold dark:text-white">
          Studio Not Found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          This workspace may have been removed.
        </p>

        <Link
          href="/studios"
          className="mt-6 rounded-xl bg-[#C9A98B] px-6 py-3 font-bold text-[#1a1410]"
        >
          Explore Studios
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] text-[#1a1410] dark:bg-[#0e0b09] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Back Navigation */}
        <Link
          href="/studios"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8a6a4d] hover:gap-3 dark:text-[#C9A98B]"
        >
          <ArrowLeft size={17} />
          Back to Studios
        </Link>

        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-8 bg-[#8a6a4d] dark:bg-[#C9A98B]" />

              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8a6a4d] dark:text-[#C9A98B]">
                {studio.category}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
              {studio.name}
            </h1>

            <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={17} />
              {studio.location}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Star
              size={19}
              className="fill-yellow-400 text-yellow-400"
            />

            <span className="font-bold">
              {studio.rating || "New"}
            </span>

            <span className="text-sm text-gray-500">
              ({reviews.length} reviews)
            </span>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="relative h-[300px] overflow-hidden rounded-2xl sm:h-[450px] lg:col-span-3">
            {gallery.length > 0 && (
              <Image
                src={gallery[activeImage]}
                alt={studio.name}
                fill
                priority
                className="object-cover"
              />
            )}

            {gallery.length > 1 && (
              <>
                <button
                  onClick={previousImage}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg"
                >
                  <ArrowLeft size={18} />
                </button>

                <button
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-lg"
                >
                  <ArrowRight size={18} />
                </button>
              </>
            )}

            <span className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white">
              {gallery.length ? activeImage + 1 : 0} / {gallery.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {gallery.slice(0, 3).map((image, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(index)}
                className={`relative h-32 overflow-hidden rounded-xl sm:h-40 lg:h-[145px] ${
                  activeImage === index
                    ? "ring-2 ring-[#C9A98B]"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                <Image
                  src={image}
                  alt={`${studio.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-12 grid gap-12 lg:grid-cols-3">
          <div className="space-y-12 lg:col-span-2">

            {/* Description */}
            <section>
              <h2 className="text-2xl font-extrabold uppercase">
                About This Workspace
              </h2>

              <p className="mt-4 text-sm leading-8 text-gray-600 dark:text-gray-400">
                {studio.description ||
                  "A beautiful creative workspace designed for professionals, creators, and artists. Enjoy a comfortable environment with everything you need for your next project."}
              </p>
            </section>

            {/* Specifications */}
            <section>
              <h2 className="text-2xl font-extrabold uppercase">
                Workspace Specifications
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  {
                    icon: Users,
                    label: "Capacity",
                    value: `${studio.capacity || "N/A"} People`,
                  },
                  {
                    icon: Clock,
                    label: "Booking Type",
                    value: "Hourly",
                  },
                  {
                    icon: Camera,
                    label: "Category",
                    value: studio.category,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#1a1410]"
                  >
                    <item.icon className="mb-3 text-[#8a6a4d] dark:text-[#C9A98B]" />

                    <p className="text-xs text-gray-500">
                      {item.label}
                    </p>

                    <p className="mt-1 font-bold">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h2 className="text-2xl font-extrabold uppercase">
                What This Space Offers
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {amenities.length > 0 ? (
                  amenities.map((amenity, index) => {
                    const Icon =
                      amenityIcons[index % amenityIcons.length];

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#1a1410]"
                      >
                        <Icon
                          size={19}
                          className="shrink-0 text-[#8a6a4d] dark:text-[#C9A98B]"
                        />

                        <span className="text-sm font-medium">
                          {amenity}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">
                    No amenities listed yet.
                  </p>
                )}
              </div>
            </section>

            {/* Host */}
            <section>
              <h2 className="text-2xl font-extrabold uppercase">
                Meet Your Host
              </h2>

              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#1a1410]">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#C9A98B]/20">
                  {studio.host?.image ? (
                    <Image
                      src={studio.host.image}
                      alt="Host"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={30} />
                  )}
                </div>

                <div>
                  <p className="text-lg font-bold">
                    {studio.host?.name || "Studio Host"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Workspace Host
                  </p>
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section>
              <h2 className="text-2xl font-extrabold uppercase">
                Guest Reviews
              </h2>

              {reviews.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {reviews.map((review, index) => (
                    <div
                      key={review._id || index}
                      className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-[#1a1410]"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-bold">
                          {review.name}
                        </p>

                        <span className="flex items-center gap-1 text-sm font-bold">
                          <Star
                            size={14}
                            className="fill-yellow-400 text-yellow-400"
                          />
                          {review.rating}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-dashed border-black/20 p-8 text-center dark:border-white/15">
                  <MessageCircle className="mx-auto mb-3 text-[#C9A98B]" />

                  <p className="font-bold">
                    No reviews yet
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    Be the first to share your experience.
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Booking Card */}
          <aside>
            <div className="sticky top-24 rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-[#1a1410]">
              <p className="text-sm text-gray-500">
                Starting from
              </p>

              <p className="mt-1 text-3xl font-extrabold text-[#8a6a4d] dark:text-[#C9A98B]">
                ${studio.hourlyRate}

                <span className="text-sm font-medium text-gray-500">
                  {" "}/ hour
                </span>
              </p>

              <div className="my-6 space-y-4 border-y border-black/10 py-5 dark:border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Workspace
                  </span>

                  <span className="font-semibold">
                    {studio.category}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Rating
                  </span>

                  <span className="font-semibold">
                    {studio.rating || "New"} / 5
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-gray-500">
                    Location
                  </span>

                  <span className="text-right font-semibold">
                    {studio.location}
                  </span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={isPending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1410] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#8a6a4d] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#C9A98B] dark:text-[#1a1410] dark:hover:bg-[#b8956c]"
              >
                {isPending ? "Checking Login..." : "Book Workspace Now"}

                <ArrowUpRight size={18} />
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Reserve your creative space today.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-[#faf8f5] p-6 text-[#1a1410] shadow-2xl dark:bg-[#1a1410] dark:text-white">

            <button
              onClick={() => setShowBooking(false)}
              aria-label="Close booking modal"
              className="absolute right-5 top-5 rounded-full p-2 hover:bg-black/10 dark:hover:bg-white/10"
            >
              <X size={20} />
            </button>

            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#8a6a4d] dark:text-[#C9A98B]">
              StudioSpace Reservation
            </span>

            <h2 className="mt-3 text-2xl font-extrabold uppercase">
              Book Your Workspace
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {studio.name}
            </p>

            <form onSubmit={handleBooking} className="mt-7 space-y-5">

              {/* Booking Date */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Booking Date
                </label>

                <div className="relative">
                  <CalendarDays
                    size={18}
                    className="absolute left-3 top-3 text-gray-500"
                  />

                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={booking.date}
                    onChange={(e) =>
                      setBooking({
                        ...booking,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-black/10 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#C9A98B] dark:border-white/10 dark:bg-[#0e0b09] dark:[color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Starting Time */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Starting Time
                </label>

                <input
                  type="time"
                  required
                  value={booking.startTime}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      startTime: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A98B] dark:border-white/10 dark:bg-[#0e0b09] dark:[color-scheme:dark]"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Duration
                </label>

                <select
                  value={booking.duration}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      duration: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#C9A98B] dark:border-white/10 dark:bg-[#0e0b09]"
                >
                  {[1, 2, 3, 4, 5, 6, 8].map((hour) => (
                    <option key={hour} value={hour}>
                      {hour} {hour === 1 ? "Hour" : "Hours"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Price */}
              <div className="flex items-center justify-between rounded-xl bg-[#C9A98B]/15 p-4">
                <span className="text-sm font-semibold">
                  Estimated Total
                </span>

                <span className="text-xl font-extrabold text-[#8a6a4d] dark:text-[#C9A98B]">
                  ${totalPrice}
                </span>
              </div>

              {/* Confirm Booking */}
              <button
                type="submit"
                className="w-full rounded-xl bg-[#1a1410] py-4 text-sm font-bold text-white transition hover:bg-[#8a6a4d] dark:bg-[#C9A98B] dark:text-[#1a1410]"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default StudiosDetailsPage;