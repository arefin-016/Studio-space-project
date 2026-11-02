
import { Aperture } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0c0c]">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-20 w-20 animate-ping rounded-full bg-[#c9a77c]/10" />

        <Aperture
          size={55}
          className="animate-spin text-[#c9a77c]"
        />
      </div>

      <h2 className="mt-6 text-2xl font-bold tracking-wide text-white">
        StudioSpace
      </h2>

      <p className="mt-2 text-sm text-gray-400">
        Preparing your creative space...
      </p>

      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-gray-800">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-[#c9a77c]" />
      </div>
    </div>
  );
};

export default Loading;
