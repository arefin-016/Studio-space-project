"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSyncExternalStore, useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Aperture, Menu, Moon, Sun, X } from "lucide-react"
import { cn } from "cn"
import { buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import PopOver from "./shared/PopOver"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/studioes", label: "Explore Studios" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#about-us", label: "About Us" },
]

// Hydration-safe "has mounted" flag (no setState-in-effect, per repo lint rules)
const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

function useMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}

// Circular icon buttons (theme toggle, hamburger)
const iconButtonClasses =
  "flex size-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/50 text-neutral-800 transition-colors hover:bg-black/10 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"

const authLinkClasses =
  "text-neutral-700 transition-colors hover:text-neutral-900 dark:text-white/85 dark:hover:text-white"

// Sign Up pill (a little tighter at lg so it never collides with the centered links)
const authPillClasses = cn(
  buttonVariants({ size: "lg" }),
  "h-10 rounded-full bg-sand px-5 font-bold tracking-[0.12em] whitespace-nowrap text-[#17130e] uppercase hover:bg-sand/90 xl:px-7"
)

// Outlined pill used for "Sign In" inside the mobile menu
const authOutlinePillClasses =
  "inline-flex h-11 flex-1 items-center justify-center rounded-full border border-black/20 text-sm font-semibold tracking-[0.12em] whitespace-nowrap text-neutral-800 uppercase transition-colors hover:bg-black/5 dark:border-white/25 dark:text-white dark:hover:bg-white/10"

export function Navbar() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const isDark = mounted && resolvedTheme === "dark"
  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  // Close the mobile menu on Escape, and when the screen grows to desktop size
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    const mq = window.matchMedia("(min-width: 1024px)")
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    mq.addEventListener("change", onChange)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      mq.removeEventListener("change", onChange)
    }
  }, [])

  // Stop the page behind the menu from scrolling while it is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-colors duration-300",
        open
          ? "border-black/10 bg-white dark:border-white/10 dark:bg-[#0b0b10]"
          : "border-black/5 bg-white/60 dark:border-white/10 dark:bg-black/40 dark:bg-gradient-to-b dark:from-black/80 dark:via-black/40 dark:to-transparent"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        {/* Left — logo */}
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5 lg:justify-self-start"
          onClick={() => setOpen(false)}
        >
          <Aperture
            className="size-6 text-sand-deep sm:size-7 dark:text-sand"
            aria-hidden="true"
          />
          <span className="text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
            StudioSpace
          </span>
        </Link>

        {/* Middle — links */}
        <nav
          aria-label="Main"
          className="hidden items-center gap-5 lg:flex lg:justify-self-center xl:gap-10"
        >
          {navLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap uppercase transition-colors xl:text-[13px]",
                  active
                    ? "text-neutral-900 dark:text-sand"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-white/80 dark:hover:text-white"
                )}
              >
                {link.label}
                {active && (
                  <span
                    className="size-1.5 rounded-full bg-sand-deep dark:bg-sand"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right — actions */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-4 lg:justify-self-end xl:gap-5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={iconButtonClasses}
          >
            {isDark ? (
              <Moon className="size-4" aria-hidden="true" />
            ) : (
              <Sun className="size-4" aria-hidden="true" />
            )}
          </button>

          {!user ? (
            <div className="hidden items-center gap-4 sm:flex lg:gap-4 xl:gap-5">
              <Link
                href="/signIn"
                className={cn(
                  authLinkClasses,
                  "text-sm font-semibold tracking-[0.12em] whitespace-nowrap uppercase"
                )}
              >
                Sign In
              </Link>

              <Link
                href="/signUp"
                className={cn(authPillClasses, "text-sm tracking-[0.12em]")}
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <PopOver />
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className={cn(iconButtonClasses, "lg:hidden")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-black/10 bg-white backdrop-blur-md lg:hidden dark:border-white/10 dark:bg-[#0b0b10]"
        >
          <nav
            aria-label="Mobile"
            className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
          >
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2 py-3 text-sm font-semibold tracking-[0.12em] uppercase transition-colors",
                    active
                      ? "bg-neutral-100 text-neutral-900 dark:bg-white/5 dark:text-sand"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-white/85 dark:hover:bg-white/5 dark:hover:text-white"
                  )}
                >
                  {link.label}
                  {active && (
                    <span
                      className="size-1.5 rounded-full bg-sand-deep dark:bg-sand"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              )
            })}

            {!user && (
              <div className="mt-3 flex gap-3 border-t border-black/10 px-2 pt-4 sm:hidden dark:border-white/10">
                <Link
                  href="/signIn"
                  onClick={() => setOpen(false)}
                  className={authOutlinePillClasses}
                >
                  Sign In
                </Link>

                <Link
                  href="/signUp"
                  onClick={() => setOpen(false)}
                  className={cn(
                    authPillClasses,
                    "h-11 flex-1 px-4 text-sm tracking-[0.12em]"
                  )}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}