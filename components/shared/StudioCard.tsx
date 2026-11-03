import Image from "next/image";
import Link from "next/link";
import { Aperture, MapPin, Star } from "lucide-react";

export type Studio = {
  _id: string;
  title: string;
  image?: string;
  category?: string;
  hourlyRate: string | number;
  location: string;
  rating?: string | number;
  maxCapacity?: string | number;
  amenities?: string | string[];
  overview?: string;
  ownerName?: string;
  ownerEmail?: string;
  securityDeposit?: string | number;
};

const categoryLabels: Record<string, string> = {
  "photo-studio": "Photo Studio",
  "film-stage": "Film Stage",
  "podcast-lounge": "Podcast Lounge",
  "music-suite": "Music Suite",
  workshop: "Workshop",
  other: "Other",
};

// "podcast-lounge" -> "Podcast Lounge"; missing category -> "Studio"
const toCategoryLabel = (value?: string) => {
  if (!value) return "Studio";
  return (
    categoryLabels[value] ??
    value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
};

const StudioCard = ({ studio }: { studio?: Studio }) => {
  // The card needs the whole studio object in a prop called `studio`
  if (!studio) {
    console.error("StudioCard: the `studio` prop is missing. Use <StudioCard studio={item} />");
    return null;
  }

  const { _id, title, image, category, hourlyRate, location, rating } = studio;

  const ratingNumber = Number(rating);
  const hasRating = Number.isFinite(ratingNumber) && ratingNumber > 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#1a1410]/10 bg-white shadow-sm transition-colors hover:border-[#B8926F] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:hover:border-[#C9A98B]/70">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1410]/5 dark:bg-white/5">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#8a6a4d] dark:text-[#C9A98B]">
            <Aperture size={40} aria-hidden="true" />
          </div>
        )}

        {/* soft fade so the badges stay readable on bright photos */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full bg-[#0e0b09]/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#C9A98B] backdrop-blur-sm">
          {toCategoryLabel(category)}
        </span>

        {/* Rating badge */}
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#C9A98B] px-2.5 py-1 text-xs font-bold text-[#1a1410]">
          <Star
            size={12}
            className={hasRating ? "fill-current" : ""}
            aria-hidden="true"
          />
          {hasRating ? ratingNumber.toFixed(1) : "New"}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-extrabold tracking-tight text-[#1a1410] dark:text-white">
          {title}
        </h3>

        <p className="mt-2 flex items-start gap-1.5 text-sm text-[#3d3228]/70 dark:text-white/60">
          <MapPin
            size={15}
            className="mt-0.5 shrink-0 text-[#8a6a4d] dark:text-[#C9A98B]"
            aria-hidden="true"
          />
          <span className="line-clamp-1">{location}</span>
        </p>

        <div className="mt-4 flex items-baseline gap-1 border-t border-[#1a1410]/10 pt-4 dark:border-white/10">
          <span className="text-2xl font-black tracking-tight text-[#1a1410] dark:text-white">
            ${hourlyRate}
          </span>
          <span className="text-sm font-medium text-[#3d3228]/60 dark:text-white/50">
            / hr
          </span>
        </div>

        {/* View Details — same tan pill as Sign Up */}
        <Link
          href={`/studioes/${_id}`}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-[#C9A98B] px-6 text-xs font-bold uppercase tracking-[0.18em] text-[#1a1410] transition hover:bg-[#D8BDA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A98B] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
        >
          View Details
        </Link>
      </div>
    </article>
  );
};

export default StudioCard;