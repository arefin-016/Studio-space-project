"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Camera,
  AudioLines,
  Mic,
  Music,
  Palette,
  ArrowUpRight,
} from "lucide-react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`

const categories = [
  {
    slug: "photo-studio",
    name: "Photo Studios",
    blurb: "Cycloramas, natural light and lighting rigs for shoots.",
    Icon: Camera,
  },
  {
    slug: "sound-stage",
    name: "Sound Stages",
    blurb: "Large, treated spaces for film, video and live sessions.",
    Icon: AudioLines,
  },
  {
    slug: "podcast-room",
    name: "Podcast Rooms",
    blurb: "Quiet rooms with mics, mixers and seats for guests.",
    Icon: Mic,
  },
  {
    slug: "music-suite",
    name: "Music Suites",
    blurb: "Recording and rehearsal rooms for bands and producers.",
    Icon: Music,
  },
  {
    slug: "art-workshop",
    name: "Art Workshops",
    blurb: "Open, well-lit rooms for painting, craft and classes.",
    Icon: Palette,
  },
];

export default function StudioCategories() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const results = await Promise.all(
          categories.map(async (category) => {
            const res = await fetch(
              `${API_URL}/studios/category/${category.slug}`
            );

            if (!res.ok) {
              throw new Error(`Failed to fetch ${category.name}`);
            }

            const data = await res.json();

            return {
              slug: category.slug,
              count: Array.isArray(data) ? data.length : 0,
            };
          })
        );

        const counts: Record<string, number> = {};
        results.forEach((item) => {
          counts[item.slug] = item.count;
        });

        setCategoryCounts(counts);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="bg-[#faf8f5] px-4 py-16 text-[#1a1410] sm:px-6 sm:py-20 lg:px-8 dark:bg-[#0e0b09] dark:text-white">
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mb-10 max-w-2xl sm:mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight uppercase sm:text-5xl">
            Find the right kind of studio
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#3d3228]/70 dark:text-white/60">
            Pick a category to see the studios available for it.
          </p>
        </div>

        {/* Category Cards */}
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map(({ slug, name, blurb, Icon }) => {
            const count = categoryCounts[slug] ?? 0;

            return (
              <li key={slug}>
                <Link
                  href={`/studioes/category/${slug}`}
                  className="group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#8a6a4d]/50 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-[#8a6a4d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f5] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 dark:bg-[#1a1410] dark:hover:border-[#C9A98B]/50 dark:focus-visible:ring-[#C9A98B] dark:focus-visible:ring-offset-[#0e0b09]"
                >
                  {/* Large watermark icon */}
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1}
                    className="pointer-events-none absolute -top-6 -right-6 h-40 w-40 text-[#8a6a4d]/10 transition duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:text-[#8a6a4d]/20 motion-reduce:transition-none dark:text-[#C9A98B]/10 dark:group-hover:text-[#C9A98B]/20"
                  />

                  {/* Icon badge */}
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#8a6a4d]/30 bg-[#faf8f5] text-[#8a6a4d] transition-colors group-hover:border-[#8a6a4d] group-hover:bg-[#8a6a4d] group-hover:text-white dark:border-[#C9A98B]/30 dark:bg-[#0e0b09] dark:text-[#C9A98B] dark:group-hover:border-[#C9A98B] dark:group-hover:bg-[#C9A98B] dark:group-hover:text-[#1a1410]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>

                  {/* Text */}
                  <div className="relative mt-auto pt-12">
                    <h3 className="text-xl font-bold">{name}</h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#3d3228]/60 dark:text-white/60">
                      {blurb}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="relative mt-6 flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
                    {loading ? (
                      <span
                        className="h-4 w-24 animate-pulse rounded bg-black/10 dark:bg-white/10"
                        aria-label="Loading studio count"
                      />
                    ) : (
                      <p className="text-sm font-bold text-[#8a6a4d] dark:text-[#C9A98B]">
                        {count}
                        <span className="font-medium text-gray-500">
                          {" "}
                          {count === 1 ? "studio" : "studios"}
                        </span>
                      </p>
                    )}

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1410] text-white transition-colors group-hover:bg-[#8a6a4d] dark:bg-[#C9A98B] dark:text-[#1a1410] dark:group-hover:bg-[#b8956c]">
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}