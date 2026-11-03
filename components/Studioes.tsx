import StudioCard, { type Studio } from "@/components/shared/StudioCard";

const API_URL = "http://localhost:8000";

const getStudios = async (): Promise<Studio[]> => {
  try {
    // no-store: always fetch the newest listings, never a cached copy
    const res = await fetch(`${API_URL}/getStudio`, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 6) : [];
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
            <span className="h-px w-8 bg-[#8a6a4d] dark:bg-[#C9A98B]" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6a4d] dark:text-[#C9A98B]">
              Just listed
            </span>
          </div>

          <h2 className="text-3xl font-extrabold uppercase tracking-tight sm:text-5xl">
            Newest studio spaces
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#3d3228]/70 dark:text-white/60">
            Fresh listings from hosts near you. Compare rates and lock your slot.
          </p>
        </div>

        {/* Cards */}
        {studios.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {studios.map((studio) => (
              <StudioCard key={studio._id} studio={studio} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#1a1410]/20 px-6 py-16 text-center dark:border-white/15">
            <h3 className="text-lg font-extrabold uppercase tracking-tight">
              No studios to show yet
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