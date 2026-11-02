
import Link from "next/link";
import {
  Aperture,
  Camera,
  Mic2,
  Music2,
  ArrowLeft,
} from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0c0c0c] px-6 text-white">
      <div className="mx-auto max-w-2xl text-center">

        {/* Creative Studio Illustration */}
        <div className="relative mx-auto mb-8 flex h-52 w-64 items-center justify-center rounded-3xl border border-[#c9a77c]/30 bg-[#1a1714]">

          <div className="absolute left-8 top-8 rounded-xl bg-[#c9a77c]/10 p-4">
            <Camera size={35} className="text-[#c9a77c]" />
          </div>

          <div className="absolute right-8 top-8 rounded-xl bg-[#c9a77c]/10 p-4">
            <Mic2 size={35} className="text-[#c9a77c]" />
          </div>

          <Aperture size={85} className="text-[#c9a77c]" />

          <div className="absolute bottom-7 left-12">
            <Music2 size={28} className="text-[#c9a77c]" />
          </div>

          <div className="absolute bottom-7 right-12">
            <Music2 size={28} className="text-[#c9a77c]" />
          </div>
        </div>

        {/* Error Message */}
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#c9a77c]">
          Lost in Creativity?
        </p>

        <h1 className="mb-4 text-7xl font-extrabold md:text-9xl">
          404
        </h1>

        <h2 className="mb-4 text-2xl font-bold md:text-3xl">
          This Studio Doesn't Exist
        </h2>

        <p className="mx-auto mb-8 max-w-md text-gray-400">
          Looks like you've wandered into an empty studio.
          The page you're looking for might have been moved
          or doesn't exist anymore.
        </p>

        {/* Return Home Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#c9a77c] px-7 py-3 font-semibold text-black transition hover:bg-[#dfbd94]"
        >
          <ArrowLeft size={18} />
          Return to Home
        </Link>

      </div>
    </div>
  );
};

export default NotFound;
