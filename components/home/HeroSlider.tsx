"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  A11y,
  Autoplay,
  EffectFade,
  Keyboard,
  Navigation,
  Pagination,
} from "swiper/modules"
import "swiper/css"
import "swiper/css/effect-fade"
import "swiper/css/pagination"
import { Swiper, SwiperSlide } from "swiper/react"

type SlideCta = {
  label: string
  href: string
}

type HeroSlide = {
  id: string
  image: string
  alt: string
  eyebrow: string
  headline: string[]
  description: string
  primaryCta: SlideCta
  secondaryCta: SlideCta
}

const slides: HeroSlide[] = [
  {
    id: "find-your-space",
    image: "/hero/hero-1.jpg",
    alt: "Warm wood-lined recording studio with a large mixing console, studio monitors and a lounge sofa",
    eyebrow: "Curated Creative Spaces",
    headline: ["Find Your", "Creative Space"],
    description:
      "Discover inspiring studios and production spaces designed to bring your creative ideas to life.",
    primaryCta: { label: "Explore Studios", href: "/studios" },
    secondaryCta: { label: "Host Your Space", href: "/studios" },
  },
  {
    id: "your-vision",
    image: "/hero/hero-2.jpg",
    alt: "Film set inside a production studio with brick walls, softbox lights, cameras and a dolly track",
    eyebrow: "Photography · Film · Podcast · Music",
    headline: ["Your Vision.", "Your Studio."],
    description:
      "From professional photography studios to music production spaces, find the perfect environment for your next project.",
    primaryCta: { label: "Explore Studios", href: "/studios" },
    secondaryCta: { label: "Host Your Space", href: "/studios" },
  },
  {
    id: "host-opportunity",
    image: "/hero/hero-3.jpg",
    alt: "Busy production floor with cinema cameras on tripods, overhead light panels and crew at work",
    eyebrow: "For Studio Hosts",
    headline: ["Turn Your Space", "Into Opportunity"],
    description:
      "Share your creative workspace, connect with talented creators, and earn from your studio.",
    primaryCta: { label: "Host Your Space", href: "/studios" },
    secondaryCta: { label: "Explore Studios", href: "/studios" },
  },
  {
    id: "cyc-studio",
    image: "/hero/hero-4.jpg",
    alt: "Bright white cyclorama studio with curved sofas, arched niches and a large octabox light",
    eyebrow: "Cyclorama & Set Studios",
    headline: ["Where Ideas", "Take Shape"],
    description:
      "Bright cyc walls, styled sets and daylight lofts — inspect every corner, see live availability and book your session in seconds.",
    primaryCta: { label: "Explore Studios", href: "/studios" },
    secondaryCta: { label: "Host Your Space", href: "/studios" },
  },
  {
    id: "podcast-lounge",
    image: "/hero/hero-5.jpg",
    alt: "Studio condenser microphone with headphones in front of an editing workstation",
    eyebrow: "Podcast & Recording",
    headline: ["Hit Record", "Today"],
    description:
      "Treated podcast lounges and vocal booths with pro mics ready to go — filter by gear, compare rates and lock your slot.",
    primaryCta: { label: "Explore Studios", href: "/studios" },
    secondaryCta: { label: "Host Your Space", href: "/studios" },
  },
  {
    id: "art-workshop",
    image: "/hero/hero-6.jpg",
    alt: "Paint brushes loaded with red and yellow paint resting on a canvas",
    eyebrow: "Art & Maker Workshops",
    headline: ["Make Your", "Mark"],
    description:
      "Painting studios, ceramics benches and maker workshops — reserve a bench, bring your tools and get creating.",
    primaryCta: { label: "Explore Studios", href: "/studios" },
    secondaryCta: { label: "Host Your Space", href: "/studios" },
  },
]

const primaryCtaClasses =
  "inline-flex items-center justify-center rounded-full bg-sand px-8 py-4 text-sm font-bold whitespace-nowrap uppercase tracking-[0.12em] text-[#17130e] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_40px_-16px_rgba(201,176,149,0.8)] focus-visible:ring-2 focus-visible:ring-sand focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"

const secondaryCtaClasses =
  "inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-4 text-sm font-bold whitespace-nowrap uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none"

const arrowClasses =
  "hero-nav-btn flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-md transition-all duration-300 hover:border-sand hover:bg-sand hover:text-[#17130e] focus-visible:ring-2 focus-visible:ring-sand focus-visible:outline-none lg:size-12"

export function HeroSlider() {
  return (
    <section
      aria-label="Featured studios"
      className="relative isolate overflow-x-hidden"
    >
      <Swiper
        modules={[A11y, Autoplay, EffectFade, Keyboard, Navigation, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={800}
        loop
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        navigation={{ prevEl: ".hero-nav-prev", nextEl: ".hero-nav-next" }}
        keyboard={{ enabled: true }}
        className="hero-slider h-svh min-h-[640px] w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            {/* High-resolution background */}
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              sizes="100vw"
              priority={index === 0}
              className="object-cover"
            />
            {/* Gradient overlays for text readability */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/15"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40"
            />
            {/* Slide content — left aligned */}
            <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center gap-5 px-4 pt-24 pb-32 text-left sm:px-6 sm:pb-36 lg:px-8 lg:pb-28">
              <p className="hero-anim hero-delay-1 flex items-center gap-3 text-xs font-semibold tracking-[0.3em] text-sand uppercase sm:text-sm">
                <span aria-hidden="true" className="h-px w-10 bg-sand/70" />
                {slide.eyebrow}
              </p>
              <h1 className="hero-anim hero-delay-2 max-w-3xl text-4xl font-black tracking-tight text-white uppercase sm:text-5xl md:text-6xl lg:text-7xl">
                {slide.headline.map((line) => (
                  <span key={line} className="block leading-[0.95]">
                    {line}{" "}
                  </span>
                ))}
              </h1>
              <p className="hero-anim hero-delay-3 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                {slide.description}
              </p>
              <div className="hero-anim hero-delay-4 flex flex-wrap gap-4 pt-2">
                <Link
                  href={slide.primaryCta.href}
                  className={primaryCtaClasses}
                >
                  {slide.primaryCta.label}
                </Link>
                <Link
                  href={slide.secondaryCta.href}
                  className={secondaryCtaClasses}
                >
                  {slide.secondaryCta.label}
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Prev / next navigation arrows */}
      <div className="absolute right-4 bottom-6 z-20 flex items-center gap-3 sm:right-6 lg:right-8 lg:bottom-1/2 lg:-translate-y-1/2">
        <button
          type="button"
          className={`${arrowClasses} hero-nav-prev`}
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${arrowClasses} hero-nav-next`}
          aria-label="Next slide"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
