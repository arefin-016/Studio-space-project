"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Image as ImageIcon,
  DollarSign,
  Users,
  Type,
  ChevronDown,
  Check,
  Plus,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";

/* ---------- Config ---------- */
const API_URL = "http://localhost:8000";

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

/* ---------- Validation ---------- */
type FieldName =
  | "title"
  | "category"
  | "hourlyRate"
  | "securityDeposit"
  | "maxCapacity"
  | "location"
  | "image"
  | "overview";

type Errors = Partial<Record<FieldName, string>>;

// Order used to focus the first field with a problem
const FIELD_ORDER: FieldName[] = [
  "title",
  "category",
  "hourlyRate",
  "securityDeposit",
  "maxCapacity",
  "location",
  "image",
  "overview",
];

const isValidUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const validate = (v: Record<FieldName, string>): Errors => {
  const errors: Errors = {};

  if (!v.title) errors.title = "Studio title is required.";
  else if (v.title.length < 3)
    errors.title = "Title must be at least 3 characters.";

  if (!v.category) errors.category = "Please choose a studio category.";

  if (!v.hourlyRate) errors.hourlyRate = "Hourly rate is required.";
  else if (Number(v.hourlyRate) <= 0)
    errors.hourlyRate = "Enter a rate greater than 0.";

  // Security deposit is optional, but if filled it must not be negative
  if (v.securityDeposit && Number(v.securityDeposit) < 0)
    errors.securityDeposit = "Deposit can't be negative.";

  if (!v.maxCapacity) errors.maxCapacity = "Maximum capacity is required.";
  else if (!Number.isInteger(Number(v.maxCapacity)) || Number(v.maxCapacity) < 1)
    errors.maxCapacity = "Enter a whole number of 1 or more.";

  if (!v.location) errors.location = "Studio address is required.";
  else if (v.location.length < 5)
    errors.location = "Please enter the complete address.";

  if (!v.image) errors.image = "Studio image URL is required.";
  else if (!isValidUrl(v.image))
    errors.image = "Enter a valid URL starting with http:// or https://";

  if (!v.overview) errors.overview = "Please describe your studio.";
  else if (v.overview.length < 20)
    errors.overview = "Overview must be at least 20 characters.";

  return errors;
};

/* ---------- Shared styles (light + dark, same as Sign In / Sign Up) ---------- */
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] " +
  "text-[#3d3228]/75 dark:text-white/70";

const fieldClass =
  "w-full rounded-xl border text-sm outline-none transition " +
  "border-[#1a1410]/15 bg-[#faf8f5] text-[#1a1410] placeholder:text-[#1a1410]/40 " +
  "dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/35 " +
  "focus:border-[#B8926F] focus:ring-2 focus:ring-[#C9A98B]/40 " +
  "dark:focus:border-[#C9A98B] dark:focus:ring-[#C9A98B]/30";

const inputClass = `${fieldClass} h-11 pl-11 pr-4`;

const errorFieldClass =
  "!border-red-500/70 focus:!ring-red-500/25 dark:!border-red-400/70";

const iconClass =
  "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 " +
  "text-[#1a1410]/40 dark:text-white/40";

// Dropdown options need solid colors: the select itself is semi-transparent in dark
// mode, and browsers paint the open list on white, which hid the white option text.
const optionClass =
  "bg-white text-[#1a1410] dark:bg-[#1a1511] dark:text-white";

const hintClass = "mt-2 text-xs text-[#1a1410]/50 dark:text-white/45";

// Tan pill (same as "Sign Up" in the navbar)
const buttonClass =
  "flex h-11 items-center justify-center gap-2 rounded-full bg-[#C9A98B] px-8 " +
  "text-sm font-bold uppercase tracking-[0.18em] text-[#1a1410] transition " +
  "hover:bg-[#D8BDA2] focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#C9A98B] focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-black " +
  "disabled:cursor-not-allowed disabled:opacity-60";

// Outlined pill (same idea as "Host your space" on the hero)
const outlineButtonClass =
  "flex h-11 items-center justify-center rounded-full border border-[#8a6a4d]/60 px-8 " +
  "text-sm font-bold uppercase tracking-[0.18em] text-[#3d3228] transition " +
  "hover:bg-[#C9A98B]/15 dark:border-[#C9A98B]/60 dark:text-white " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/* ---------- Small building blocks ---------- */
const Field = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label htmlFor={htmlFor} className={labelClass}>
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
    {children}
    {error ? (
      <p
        role="alert"
        className="mt-2 text-xs font-medium text-red-600 dark:text-red-400"
      >
        {error}
      </p>
    ) : (
      hint && <p className={hintClass}>{hint}</p>
    )}
  </div>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="border-t border-[#1a1410]/10 pt-7 dark:border-white/10">
    <h2 className="mb-5 flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.2em]">
      <span className="h-px w-6 bg-[#8a6a4d] dark:bg-[#C9A98B]" />
      {title}
    </h2>
    <div className="space-y-5">{children}</div>
  </section>
);

/* ---------- Page ---------- */
const AddStudioPage = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  const invalid = (name: FieldName) => (errors[name] ? errorFieldClass : "");

  // Clear a field's error as soon as the user edits it
  const handleChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    const name = (e.target as HTMLInputElement).name as FieldName;
    if (name && errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    // Keep a reference: e.currentTarget is cleared after the first await
    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    const values = {
      title: String(form.get("title") ?? "").trim(),
      category: String(form.get("category") ?? ""),
      hourlyRate: String(form.get("hourlyRate") ?? "").trim(),
      securityDeposit: String(form.get("securityDeposit") ?? "").trim(),
      maxCapacity: String(form.get("maxCapacity") ?? "").trim(),
      location: String(form.get("location") ?? "").trim(),
      image: String(form.get("image") ?? "").trim(),
      overview: String(form.get("overview") ?? "").trim(),
    };

    /* ----- Validate ----- */
    const found = validate(values);
    setErrors(found);

    const problems = Object.keys(found).length;
    if (problems > 0) {
      toast.error("Please complete the form", {
        description: `${problems} ${
          problems === 1 ? "field needs" : "fields need"
        } your attention.`,
      });

      const first = FIELD_ORDER.find((key) => found[key]);
      if (first) {
        (formEl.elements.namedItem(first) as HTMLElement | null)?.focus();
      }
      return;
    }

    /* ----- Submit ----- */
    const payload = {
      title: values.title,
      category: values.category,
      hourlyRate: Number(values.hourlyRate),
      securityDeposit: Number(values.securityDeposit || 0),
      maxCapacity: Number(values.maxCapacity),
      location: values.location,
      image: values.image,
      // getAll keeps every ticked amenity (Object.fromEntries would keep only the last one)
      amenities: form.getAll("amenities").map(String),
      overview: values.overview,
      ownerName: user.name,
      ownerEmail: user.email,
    };

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/addStudio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Could not publish the studio.");

      await res.json();

      toast.success("Studio published!", {
        description: "Your studio was submitted successfully.",
      });

      // Refresh the form after a successful submission
      formEl.reset();
      setErrors({});
      setImageUrl("");
      setImageFailed(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* pt-28 clears the fixed navbar */
    <div className="relative min-h-[100dvh] bg-[#faf8f5] px-4 pb-16 pt-28 text-[#1a1410] dark:bg-[#0e0b09] dark:text-white sm:px-6">
      {/* soft tan glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 50% 0%, rgba(201,169,139,0.18), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-3xl">
        {/* Loading */}
        {isPending && (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-[#8a6a4d] dark:text-[#C9A98B]" />
          </div>
        )}

        {/* Not signed in */}
        {!isPending && !user && (
          <div className="mx-auto max-w-md rounded-2xl border border-[#1a1410]/10 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">
              Sign in first
            </h1>
            <p className="mt-3 text-sm text-[#3d3228]/70 dark:text-white/60">
              You need an account to list your studio.
            </p>
            <Link href="/signIn" className={`${buttonClass} mt-6`}>
              Sign In
            </Link>
          </div>
        )}

        {/* Form */}
        {user && (
          <form
            onSubmit={handleSubmit}
            onChange={handleChange}
            noValidate
            className="rounded-2xl border border-[#1a1410]/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none sm:p-10"
          >
            {/* Header */}
            <div className="mb-9">
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-8 bg-[#8a6a4d] dark:bg-[#C9A98B]" />
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6a4d] dark:text-[#C9A98B]">
                  Host your space
                </span>
              </div>

              <h1 className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
                List your studio
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#3d3228]/70 dark:text-white/60">
                Share your creative space with professionals and creators. Fill
                in the details below to publish your studio listing. Fields
                marked <span className="text-red-500">*</span> are required.
              </p>
            </div>

            <div className="space-y-8">
              {/* The basics */}
              <Section title="The basics">
                <Field
                  label="Studio title"
                  htmlFor="title"
                  required
                  error={errors.title}
                >
                  <div className="relative">
                    <Type className={iconClass} />
                    <input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="e.g. Modern Photography Studio"
                      aria-invalid={!!errors.title}
                      className={`${inputClass} ${invalid("title")}`}
                    />
                  </div>
                </Field>

                <Field
                  label="Studio category"
                  htmlFor="category"
                  required
                  error={errors.category}
                >
                  <div className="relative">
                    <select
                      id="category"
                      name="category"
                      defaultValue=""
                      aria-invalid={!!errors.category}
                      className={`${fieldClass} h-11 appearance-none px-4 pr-11 [color-scheme:light] dark:[color-scheme:dark] ${invalid("category")}`}
                    >
                      <option value="" disabled className={optionClass}>
                        Choose studio category
                      </option>
                      {categories.map((c) => (
                        <option
                          key={c.value}
                          value={c.value}
                          className={optionClass}
                        >
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a1410]/50 dark:text-white/50" />
                  </div>
                </Field>
              </Section>

              {/* Pricing and capacity */}
              <Section title="Pricing & capacity">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Hourly rate ($)"
                    htmlFor="hourlyRate"
                    required
                    error={errors.hourlyRate}
                  >
                    <div className="relative">
                      <DollarSign className={iconClass} />
                      <input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        placeholder="50"
                        aria-invalid={!!errors.hourlyRate}
                        className={`${inputClass} ${invalid("hourlyRate")}`}
                      />
                    </div>
                  </Field>

                  <Field
                    label="Security deposit ($)"
                    htmlFor="securityDeposit"
                    hint="Optional"
                    error={errors.securityDeposit}
                  >
                    <div className="relative">
                      <DollarSign className={iconClass} />
                      <input
                        id="securityDeposit"
                        name="securityDeposit"
                        type="number"
                        placeholder="100"
                        aria-invalid={!!errors.securityDeposit}
                        className={`${inputClass} ${invalid("securityDeposit")}`}
                      />
                    </div>
                  </Field>

                  <Field
                    label="Maximum capacity"
                    htmlFor="maxCapacity"
                    required
                    error={errors.maxCapacity}
                  >
                    <div className="relative">
                      <Users className={iconClass} />
                      <input
                        id="maxCapacity"
                        name="maxCapacity"
                        type="number"
                        placeholder="e.g. 20 people"
                        aria-invalid={!!errors.maxCapacity}
                        className={`${inputClass} ${invalid("maxCapacity")}`}
                      />
                    </div>
                  </Field>
                </div>
              </Section>

              {/* Location and photo */}
              <Section title="Location & photo">
                <Field
                  label="Location / address"
                  htmlFor="location"
                  required
                  error={errors.location}
                >
                  <div className="relative">
                    <MapPin className={iconClass} />
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="Enter complete studio address"
                      aria-invalid={!!errors.location}
                      className={`${inputClass} ${invalid("location")}`}
                    />
                  </div>
                </Field>

                <Field
                  label="Studio image URL"
                  htmlFor="image"
                  required
                  hint="Provide a direct image URL of your studio."
                  error={errors.image}
                >
                  <div className="relative">
                    <ImageIcon className={iconClass} />
                    <input
                      id="image"
                      name="image"
                      type="url"
                      placeholder="https://example.com/studio-image.jpg"
                      aria-invalid={!!errors.image}
                      className={`${inputClass} ${invalid("image")}`}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImageFailed(false);
                      }}
                    />
                  </div>

                  {imageUrl && !imageFailed && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="Studio preview"
                      onError={() => setImageFailed(true)}
                      className="mt-3 h-44 w-full rounded-xl border border-[#1a1410]/10 object-cover dark:border-white/10"
                    />
                  )}
                </Field>
              </Section>

              {/* Amenities */}
              <Section title="Studio amenities">
                <p className="-mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
                  Select all facilities available in your studio.
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {amenities.map((amenity) => (
                    <label key={amenity} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="amenities"
                        value={amenity}
                        className="peer sr-only"
                      />
                      <span
                        className={
                          "flex h-full items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-colors " +
                          "border-[#1a1410]/15 bg-[#faf8f5] text-[#1a1410]/80 hover:border-[#B8926F] " +
                          "dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-[#C9A98B] " +
                          "peer-checked:border-[#B8926F] peer-checked:bg-[#C9A98B]/20 peer-checked:text-[#1a1410] " +
                          "dark:peer-checked:border-[#C9A98B] dark:peer-checked:bg-[#C9A98B]/15 dark:peer-checked:text-white " +
                          "peer-focus-visible:ring-2 peer-focus-visible:ring-[#C9A98B]/50 " +
                          "[&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
                        }
                      >
                        <Check
                          size={14}
                          className="shrink-0 text-[#8a6a4d] transition-opacity dark:text-[#C9A98B]"
                          aria-hidden="true"
                        />
                        {amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </Section>

              {/* Overview */}
              <Section title="Detailed overview">
                <Field
                  label="About your studio"
                  htmlFor="overview"
                  required
                  hint="Give potential customers a clear idea of your creative space."
                  error={errors.overview}
                >
                  <textarea
                    id="overview"
                    name="overview"
                    placeholder="Describe your studio, facilities, equipment, atmosphere and what makes it special..."
                    aria-invalid={!!errors.overview}
                    className={`${fieldClass} min-h-40 resize-none p-4 ${invalid("overview")}`}
                  />
                </Field>
              </Section>

              {/* Owner */}
              <Section title="Owner information">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Owner name" htmlFor="ownerName">
                    <input
                      id="ownerName"
                      name="ownerName"
                      value={user.name ?? ""}
                      readOnly
                      className={`${fieldClass} h-11 cursor-not-allowed px-4 opacity-70`}
                    />
                  </Field>

                  <Field label="Owner email" htmlFor="ownerEmail">
                    <input
                      id="ownerEmail"
                      name="ownerEmail"
                      value={user.email ?? ""}
                      readOnly
                      className={`${fieldClass} h-11 cursor-not-allowed px-4 opacity-70`}
                    />
                  </Field>
                </div>

                <p className={hintClass}>
                  Your account information will be associated with this listing.
                </p>
              </Section>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#1a1410]/10 pt-7 dark:border-white/10 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={submitting}
                  className={outlineButtonClass}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`${buttonClass} sm:min-w-52`}
                >
                  {submitting ? (
                    <Loader2 className="h-[18px] w-[18px] animate-spin" />
                  ) : (
                    <Plus size={18} />
                  )}
                  {submitting ? "Publishing..." : "Publish Studio"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddStudioPage;