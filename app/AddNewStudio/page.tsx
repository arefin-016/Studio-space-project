"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Image as ImageIcon,
  DollarSign,
  Users,
  Type,
  ChevronDown,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getTokenClient } from "@/lib/getTokenFromClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const categories = [
  { value: "photo-studio", label: "Photo Studio" },
  { value: "film-stage", label: "Film Stage" },
  { value: "podcast-lounge", label: "Podcast Lounge" },
  { value: "music-suite", label: "Music Suite" },
  { value: "workshop", label: "Workshop" },
  { value: "other", label: "Other" },
];

const amenities = [
  "Wi-Fi",
  "Air Conditioning",
  "Soundproofing",
  "Parking",
  "Lighting Equipment",
  "Professional Cameras",
  "Green Screen",
  "Kitchen",
  "Restroom",
  "24/7 Access",
];

interface Studio {
  _id: string;
  title: string;
  category: string;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  image: string;
  amenities: string[];
  overview: string;
}

const inputClass =
  "w-full rounded-xl border border-[#1a1410]/15 bg-[#faf8f5] px-4 py-3 text-sm text-[#1a1410] outline-none focus:border-[#B8926F] dark:border-white/10 dark:bg-white/5 dark:text-white";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-wider text-[#3d3228]/75 dark:text-white/70";

function getStudioId(item: any): string {
  if (!item?._id) return "";

  if (typeof item._id === "string") {
    return item._id;
  }

  if (item._id.$oid) {
    return item._id.$oid;
  }

  return String(item._id);
}

function AddStudioForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [studio, setStudio] = useState<Studio | null>(null);
  const [editLoading, setEditLoading] = useState(Boolean(editId));
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Fetch existing studio for editing
  useEffect(() => {
    if (!editId || !user?.email) return;

    let active = true;

    const fetchStudio = async () => {
      setEditLoading(true);

      try {
        const jwtToken = await getTokenClient();

        const res = await fetch(
          `${API_URL}/myStudioes/${encodeURIComponent(user.email)}`,
          {
            method: "GET",
            headers: {
              authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const responseData = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(
            responseData?.message || "Failed to fetch your studios."
          );
        }

        const studios: Studio[] = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

        const selectedStudio = studios.find(
          (item) => getStudioId(item) === String(editId)
        );

        if (!selectedStudio) {
          throw new Error("Studio not found.");
        }

        if (active) {
          setStudio(selectedStudio);
          setImageUrl(selectedStudio.image || "");
        }
      } catch (error) {
        console.error("Fetch studio error:", error);

        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to load studio."
          );
        }
      } finally {
        if (active) {
          setEditLoading(false);
        }
      }
    };

    fetchStudio();

    return () => {
      active = false;
    };
  }, [editId, user?.email]);

  // Create or update studio
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!user || submitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") || "").trim();
    const category = String(formData.get("category") || "");
    const hourlyRate = Number(formData.get("hourlyRate"));
    const securityDeposit = Number(
      formData.get("securityDeposit") || 0
    );
    const maxCapacity = Number(formData.get("maxCapacity"));
    const location = String(formData.get("location") || "").trim();
    const image = String(formData.get("image") || "").trim();
    const overview = String(formData.get("overview") || "").trim();

    if (
      !title ||
      !category ||
      !hourlyRate ||
      !maxCapacity ||
      !location ||
      !image ||
      !overview
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (hourlyRate <= 0 || maxCapacity < 1) {
      toast.error("Please enter valid pricing and capacity.");
      return;
    }

    try {
      setSubmitting(true);

      const jwtToken = await getTokenClient();

      const payload = {
        title,
        category,
        hourlyRate,
        securityDeposit,
        maxCapacity,
        location,
        image,
        amenities: formData.getAll("amenities").map(String),
        overview,
        ownerName: user.name,
        ownerEmail: user.email,
      };

      const url = isEditMode
        ? `${API_URL}/studios/${encodeURIComponent(user.email)}`
        : `${API_URL}/addStudio`;

      const res = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          result?.message || "Failed to save studio."
        );
      }

      if (isEditMode) {
        toast.success("Studio updated successfully!");

        // Updated redirect path to the correct owner route[cite: 1]
        router.push(
          `/studioes/owner/${encodeURIComponent(user.email)}`
        );
      } else {
        toast.success("Studio published successfully!");

        form.reset();
        setImageUrl("");
      }
    } catch (error) {
      console.error("Submit error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending || (isEditMode && editLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">
          Please sign in first
        </h1>

        <Link
          href="/signIn"
          className="rounded-full bg-[#C9A98B] px-6 py-3"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (isEditMode && !studio) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-bold">
          Studio not found
        </h1>

        <p className="text-sm text-gray-500">
          Please check the studio ID and try again.
        </p>

        <button
          onClick={() => router.back()}
          className="rounded-full bg-[#C9A98B] px-6 py-3"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] px-4 pb-16 pt-28 text-[#1a1410] dark:bg-[#0e0b09] dark:text-white sm:px-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-10">

        <div className="mb-9">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6a4d]">
            Host your space
          </p>

          <h1 className="text-3xl font-extrabold uppercase sm:text-5xl">
            {isEditMode ? "Update Your Studio" : "List Your Studio"}
          </h1>

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {isEditMode
              ? "Update your studio information."
              : "Share your creative space with professionals and creators."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          <section className="space-y-5">
            <h2 className="border-b border-black/10 pb-3 text-sm font-bold uppercase tracking-widest dark:border-white/10">
              The Basics
            </h2>

            <div>
              <label htmlFor="title" className={labelClass}>
                Studio Title *
              </label>

              <div className="relative">
                <Type className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />

                <input
                  id="title"
                  name="title"
                  required
                  defaultValue={studio?.title || ""}
                  placeholder="Modern Photography Studio"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>
                Studio Category *
              </label>

              <div className="relative">
                <select
                  id="category"
                  name="category"
                  required
                  defaultValue={studio?.category || ""}
                  className={`${inputClass} appearance-none pr-10`}
                >
                  <option value="" disabled>
                    Choose category
                  </option>

                  {categories.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <ChevronDown className="absolute right-4 top-3.5 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="border-b border-black/10 pb-3 text-sm font-bold uppercase tracking-widest dark:border-white/10">
              Pricing & Capacity
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="hourlyRate" className={labelClass}>
                  Hourly Rate ($) *
                </label>

                <div className="relative">
                  <DollarSign className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />

                  <input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    min="1"
                    required
                    defaultValue={studio?.hourlyRate ?? ""}
                    placeholder="50"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="securityDeposit" className={labelClass}>
                  Security Deposit ($)
                </label>

                <div className="relative">
                  <DollarSign className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />

                  <input
                    id="securityDeposit"
                    name="securityDeposit"
                    type="number"
                    min="0"
                    defaultValue={studio?.securityDeposit ?? ""}
                    placeholder="100"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maxCapacity" className={labelClass}>
                  Maximum Capacity *
                </label>

                <div className="relative">
                  <Users className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />

                  <input
                    id="maxCapacity"
                    name="maxCapacity"
                    type="number"
                    min="1"
                    required
                    defaultValue={studio?.maxCapacity ?? ""}
                    placeholder="20"
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="border-b border-black/10 pb-3 text-sm font-bold uppercase tracking-widest dark:border-white/10">
              Location & Photo
            </h2>

            <div>
              <label htmlFor="location" className={labelClass}>
                Location / Address *
              </label>

              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />

                <input
                  id="location"
                  name="location"
                  required
                  defaultValue={studio?.location || ""}
                  placeholder="Enter studio address"
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="image" className={labelClass}>
                Studio Image URL *
              </label>

              <div className="relative">
                <ImageIcon className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />

                <input
                  id="image"
                  name="image"
                  type="url"
                  required
                  defaultValue={studio?.image || ""}
                  placeholder="https://example.com/image.jpg"
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={`${inputClass} pl-11`}
                />
              </div>

              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Studio preview"
                  className="mt-4 h-48 w-full rounded-xl object-cover"
                />
              )}
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="border-b border-black/10 pb-3 text-sm font-bold uppercase tracking-widest dark:border-white/10">
              Studio Amenities
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {amenities.map((amenity) => (
                <label
                  key={amenity}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/10 p-3 text-sm dark:border-white/10"
                >
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity}
                    defaultChecked={
                      studio?.amenities?.includes(amenity) ?? false
                    }
                    className="h-4 w-4 accent-[#B8926F]"
                  />

                  {amenity}
                </label>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="border-b border-black/10 pb-3 text-sm font-bold uppercase tracking-widest dark:border-white/10">
              Detailed Overview
            </h2>

            <div>
              <label htmlFor="overview" className={labelClass}>
                About Your Studio *
              </label>

              <textarea
                id="overview"
                name="overview"
                required
                minLength={20}
                rows={6}
                defaultValue={studio?.overview || ""}
                placeholder="Describe your studio, facilities and equipment..."
                className={inputClass}
              />
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="border-b border-black/10 pb-3 text-sm font-bold uppercase tracking-widest dark:border-white/10">
              Owner Information
            </h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="ownerName" className={labelClass}>
                  Owner Name
                </label>

                <input
                  id="ownerName"
                  value={user.name || ""}
                  readOnly
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="ownerEmail" className={labelClass}>
                  Owner Email
                </label>

                <input
                  id="ownerEmail"
                  value={user.email || ""}
                  readOnly
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-black/10 pt-7 dark:border-white/10 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="rounded-full border border-[#8a6a4d] px-8 py-3 text-sm font-bold uppercase tracking-wider"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-full bg-[#C9A98B] px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#1a1410] disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus size={18} />
              )}

              {submitting
                ? "Saving..."
                : isEditMode
                  ? "Update Studio"
                  : "Publish Studio"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function AddNewStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
      }
    >
      <AddStudioForm />
    </Suspense>
  );
}