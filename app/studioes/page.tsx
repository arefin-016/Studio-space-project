import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, ArrowUpRight } from "lucide-react";

interface Studio {
  _id: string;
  name: string;
  category: string;
  hourlyRate: number;
  location: string;
  rating: number;
  image: string;
}

const API_URL = "http://localhost:8000";

const getStudios = async (): Promise<Studio[]> => {
  try {
    const res = await fetch(`${API_URL}/getStudio`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const AllStudio = async () => {
  const studios = await getStudios();

  return (
    <section className="bg-[#faf8f5] px-4 py-16 text-[#1a1410] dark:bg-[#0e0b09] dark:text-white sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-10 sm:mb-12">
          <div className="mb-3 flex items-center gap-3">


          </div>

          <h2 className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
            Explore Studio Spaces
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#3d3228]/70 dark:text-white/60">
            Fresh listings from hosts near you. Compare rates and lock your slot.
          </p>
        </div>

        {/* Studio Grid */}
        {studios.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <div
                key={studio._id}
                className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#1a1410]"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={studio.image}
                    alt={studio.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />

                  {/* Category Badge */}
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#8a6a4d] shadow-sm">
                    {studio.category}
                  </span>

                  {/* Rating Badge */}
                  <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-[#1a1410] shadow-sm">
                    <Star size={13} className="fill-yellow-400 text-yellow-400" />
                    {studio.rating ?? "New"}
                  </span>
                </div>

                {/* Studio Information */}
                <div className="p-5">

                  <h3 className="line-clamp-1 text-xl font-bold">
                    {studio.name}
                  </h3>

                  {/* Location */}
                  <p className="mt-2 flex items-center gap-2 text-sm text-[#3d3228]/60 dark:text-white/60">
                    <MapPin size={16} />
                    {studio.location}
                  </p>

                  {/* Price and Button */}
                  <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
                    <div>
                      <p className="text-xl font-extrabold text-[#8a6a4d] dark:text-[#C9A98B]">
                        ${studio.hourlyRate}
                        <span className="text-sm font-medium text-gray-500">
                          {" "} / hr
                        </span>
                      </p>
                    </div>

                    <Link
                      href={`/studios/${studio._id}`}
                      className="flex items-center gap-2 rounded-lg bg-[#1a1410] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8a6a4d] dark:bg-[#C9A98B] dark:text-[#1a1410] dark:hover:bg-[#b8956c]"
                    >
                      View Details
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (

          /* Empty State */
          <div className="rounded-2xl border border-dashed border-[#1a1410]/20 px-6 py-16 text-center dark:border-white/15">
            <h3 className="text-lg font-extrabold uppercase tracking-tight">
              No Studios to Show Yet
            </h3>

            <p className="mt-2 text-sm text-[#3d3228]/70 dark:text-white/60">
              New listings will appear here as soon as hosts publish them.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllStudio;