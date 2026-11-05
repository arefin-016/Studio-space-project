import Link from "next/link"
import {
  ArrowRight,
  Aperture,
  CalendarCheck,
  Clock,
  Search,
} from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Discover Spaces",
    description:
      "Browse photo studios, podcast lounges and creative workspaces on Explore Studios. Compare photos, locations, ratings and hourly rates.",
  },
  {
    number: "02",
    icon: Clock,
    title: "Select Shoot Hours",
    description:
      "Pick your date, start time and how long you need, from 1 to 8 hours. Your estimated total updates as you choose.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Book Instantly",
    description:
      "Sign in, confirm your booking in one click, and it is saved straight to My Studio Bookings. No back-and-forth messages.",
  },
  {
    number: "04",
    icon: Aperture,
    title: "Create & Produce",
    description:
      "Show up and make your best work. Plans changed? Update the time or cancel anytime from My Studio Bookings.",
  },
]

const HowBookingWorks = () => {
  return (
    <section
      className="relative scroll-mt-24 bg-[#faf8f5] px-4 py-20 text-[#1a1410] sm:px-6 sm:py-28 dark:bg-[#0e0b09] dark:text-white"
      id="how-it-works"
    >
      {/* soft tan glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 50% 0%, rgba(201,169,139,0.18), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[#8a6a4d] dark:bg-[#C9A98B]" />
            <span className="text-xs font-semibold tracking-[0.3em] text-[#8a6a4d] uppercase dark:text-[#C9A98B]">
              How booking works
            </span>
            <span className="h-px w-8 bg-[#8a6a4d] dark:bg-[#C9A98B]" />
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight uppercase sm:text-5xl">
            From idea to studio in 4 steps
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-[#3d3228]/70 sm:text-base dark:text-white/60">
            Find the right space, choose your hours, and book it in minutes.
            Then get back to creating.
          </p>
        </div>

        {/* Steps */}
        <ol className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* connecting line (desktop only) */}
          <div
            aria-hidden
            className="absolute top-[3.25rem] right-[12.5%] left-[12.5%] hidden h-px bg-gradient-to-r from-transparent via-[#C9A98B]/60 to-transparent lg:block"
          />

          {steps.map((step) => (
            <li
              key={step.number}
              className="relative rounded-2xl border border-[#1a1410]/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#C9A98B]/60 dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-14 items-center justify-center rounded-full border-2 border-[#C9A98B] bg-[#faf8f5] text-[#8a6a4d] dark:bg-[#0e0b09] dark:text-[#C9A98B]">
                  <step.icon size={22} aria-hidden="true" />
                </span>

                <span className="text-4xl font-black tracking-tight text-[#1a1410]/10 dark:text-white/10">
                  {step.number}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-extrabold tracking-tight uppercase">
                {step.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-[#3d3228]/70 dark:text-white/60">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        
      </div>
    </section>
  )
}

export default HowBookingWorks
