import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface Studio {
  _id: string | { $oid: string }; // Supports both plain string and MongoDB $oid format
  title: string;
  image: string;
  category: string;
  hourlyRate: number;
  location: string;
  rating?: number;
}

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

// Helper function to safely extract the string ID regardless of how MongoDB returns it
function getStudioId(item: Studio): string {
  if (!item?._id) return "";
  if (typeof item._id === "string") return item._id;
  if (typeof item._id === "object" && "$oid" in item._id) return item._id.$oid;
  return String(item._id);
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  let studios: Studio[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/studios/category/${encodeURIComponent(category)}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch studios");
    }

    studios = await res.json();
  } catch (error) {
    console.error("Error fetching studios:", error);
  }

  const categoryName = category.replaceAll("-", " ");

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Explore Studios
        </p>

        <h1 className="text-3xl font-bold capitalize text-foreground sm:text-4xl">
          {categoryName}
        </h1>

        <p className="mt-3 text-muted-foreground">
          Explore available {categoryName} for your creative projects.
        </p>

        <p className="mt-4 text-sm text-muted-foreground">
          {studios.length} Studios Available
        </p>
      </div>

      {studios.length === 0 ? (
        <div className="rounded-xl border border-border py-20 text-center">
          <h2 className="text-2xl font-semibold text-foreground">
            No Studios Found
          </h2>

          <p className="mt-3 text-muted-foreground">
            There are currently no studios available in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {studios.map((studio) => {
            const studioId = getStudioId(studio);

            return (
              <div
                key={studioId}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="relative h-56 w-full">
                  <Image
                    src={studio.image}
                    alt={studio.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-5">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    {studio.category}
                  </span>

                  <h2 className="mt-2 text-xl font-semibold text-foreground">
                    {studio.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {studio.location}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-semibold text-foreground">
                      ${studio.hourlyRate} / hr
                    </p>

                    <Link href={`/studioes/${studioId}`}>
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}