"use client"

import Link from "next/link"
import { Aperture } from "lucide-react"

import { authClient } from "@/lib/auth-client"

const exploreLinks = [
  { href: "/", label: "Home" },
  { href: "/studios", label: "Explore Studios" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
]

// Column heading: same wide-tracked tan label used across the site
const headingClass =
  "mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#8a6a4d] dark:text-[#C9A98B]"

const linkClass =
  "text-sm text-[#3d3228]/75 transition-colors hover:text-[#1a1410] dark:text-white/65 dark:hover:text-white"

const Footer = () => {
  const { data: session } = authClient.useSession()
  const user = session?.user

  return (
    <footer className="border-t border-[#1a1410]/10 bg-[#faf8f5] text-[#1a1410] dark:border-white/10 dark:bg-[#0e0b09] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2.5">
              <Aperture
                className="size-7 text-[#8a6a4d] dark:text-[#C9A98B]"
                aria-hidden="true"
              />
              <span className="text-2xl font-black tracking-tight">
                StudioSpace
              </span>
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-[#3d3228]/75 dark:text-white/60">
              Find treated podcast lounges, photo studios and music suites.
              Filter by gear, compare rates and lock your slot.
            </p>

            <Link
              href={user ? "/AddNewStudio" : "/signUp"}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#C9A98B] px-7 text-xs font-bold tracking-[0.18em] text-[#1a1410] uppercase transition hover:bg-[#D8BDA2] focus-visible:ring-2 focus-visible:ring-[#C9A98B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f5] focus-visible:outline-none dark:focus-visible:ring-offset-[#0e0b09]"
            >
              Host your space
            </Link>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 lg:col-span-2 lg:grid-cols-2 lg:pl-8">
            <nav aria-label="Explore">
              <h3 className={headingClass}>Explore</h3>
              <ul className="space-y-3">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Account">
              <h3 className={headingClass}>{user ? "Hosting" : "Account"}</h3>
              <ul className="space-y-3">
                {user ? (
                  <li>
                    <Link href="/AddNewStudio" className={linkClass}>
                      Add New Studio
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link href="/signIn" className={linkClass}>
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link href="/signUp" className={linkClass}>
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-[#1a1410]/10 pt-6 text-xs text-[#1a1410]/50 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:text-white/40">
          <p>© 2026 StudioSpace. All rights reserved.</p>
          <p>Book creative spaces, by the hour.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
