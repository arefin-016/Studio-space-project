import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Headset,
  ShieldCheck,
  Wrench,
} from "lucide-react"

const guarantees = [
  {
    icon: ShieldCheck,
    title: "Liability Protection",
    description:
      "Every booking is covered by clear studio terms, so hosts and creators both know who is responsible before the shoot begins.",
  },
  {
    icon: BadgeCheck,
    title: "Verified Profiles",
    description:
      "Hosts and guests sign in with an account, and each booking shows who reserved it, so you always know who you are working with.",
  },
  {
    icon: Wrench,
    title: "Equipment Safety",
    description:
      "Studios list their gear and amenities up front. Hosts keep lights, stands and audio equipment checked and ready for your session.",
  },
  {
    icon: Headset,
    title: "24/7 Host Support",
    description:
      "Stuck at the door, or need a last-minute change? Our support team is available around the clock to help you and your host.",
  },
]

const AboutUs = () => {
  return (
    <section
      className="relative scroll-mt-24 overflow-hidden bg-white px-4 py-20 text-[#1a1410] sm:px-6 sm:py-28 dark:bg-[#0a0806] dark:text-white"
      id="about-us"
    >
      {/* soft tan glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(50% 45% at 85% 10%, rgba(201,169,139,0.16), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-14 lg:grid-cols-5 lg:items-center">
        {/* Left: heading */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-[#8a6a4d] dark:bg-[#C9A98B]" />
            <span className="text-xs font-semibold tracking-[0.3em] text-[#8a6a4d] uppercase dark:text-[#C9A98B]">
              Host guarantee
            </span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight uppercase sm:text-5xl">
            Create with confidence
          </h2>

          <p className="mt-5 text-sm leading-relaxed text-[#3d3228]/70 sm:text-base dark:text-white/60">
            Whether you are booking a space or sharing your own, StudioSpace is
            built so both sides feel protected and supported from the first
            click to the last shot.
          </p>

          <Link
            href="/studios"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C9A98B] px-8 text-xs font-bold tracking-[0.18em] text-[#1a1410] uppercase transition hover:bg-[#D8BDA2] focus-visible:ring-2 focus-visible:ring-[#C9A98B] focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none dark:focus-visible:ring-offset-black"
          >
            Find a Studio
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* Right: guarantees */}
        <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-3">
          {guarantees.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-[#1a1410]/10 bg-[#faf8f5] p-6 transition hover:-translate-y-1 hover:border-[#C9A98B]/60 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <span className="flex size-12 items-center justify-center rounded-full border border-[#8a6a4d]/50 text-[#8a6a4d] dark:border-[#C9A98B]/50 dark:text-[#C9A98B]">
                <item.icon size={22} aria-hidden="true" />
              </span>

              <h3 className="mt-5 text-lg font-extrabold tracking-tight uppercase">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-[#3d3228]/70 dark:text-white/60">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default AboutUs
