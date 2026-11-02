
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const EmptyState = ({
  icon: Icon = SearchX,
  title,
  description,
  buttonText,
  buttonLink,
}: EmptyStateProps) => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">

      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#c9a77c]/10">
        <Icon size={38} className="text-[#c9a77c]" />
      </div>

      {/* Title */}
      <h2 className="mb-3 text-2xl font-bold text-white">
        {title}
      </h2>

      {/* Description */}
      <p className="mb-7 max-w-md text-gray-400">
        {description}
      </p>

      {/* CTA Button */}
      <Link
        href={buttonLink}
        className="rounded-full bg-[#c9a77c] px-7 py-3 font-semibold text-black transition hover:bg-[#dfbd94]"
      >
        {buttonText}
      </Link>

    </div>
  );
};

export default EmptyState;
