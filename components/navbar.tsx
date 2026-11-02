"use client"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSyncExternalStore, useState } from "react"
import { useTheme } from "next-themes"
import { Aperture, Menu, Moon, Sun, User, X } from "lucide-react"
import { cn } from "cn"
import { Button, buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/studios", label: "Explore Studios" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
]

// Hydration-safe "has mounted" flag (no setState-in-effect, per repo lint rules)
const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

function useMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}

// Circular icon buttons (theme toggle, profile, hamburger)
const iconButtonClasses =
  "flex size-10 items-center justify-center rounded-full border border-black/15 text-neutral-800 transition-colors hover:bg-black/5 dark:border-white/25 dark:text-white dark:hover:bg-white/10"

const authLinkClasses =
  "text-neutral-600 transition-colors hover:text-neutral-900 dark:text-white/85 dark:hover:text-white"

const authPillClasses = cn(
  buttonVariants({ size: "lg" }),
  "h-10 rounded-full bg-sand px-7 font-bold tracking-[0.12em] whitespace-nowrap text-[#17130e] uppercase hover:bg-sand/90"
)

export function Navbar() {

	const { data: session } = authClient.useSession();

const user=session?.user;


  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const isDark = mounted && resolvedTheme === "dark"
  const toggleTheme = () => setTheme(isDark ? "light" : "dark")

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur-md dark:border-transparent dark:bg-transparent dark:bg-gradient-to-b dark:from-black/70 dark:via-black/30 dark:to-transparent">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        {/* Left — logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 lg:justify-self-start"
          onClick={() => setOpen(false)}
        >
          <Aperture
            className="size-7 text-sand-deep dark:text-sand"
            aria-hidden="true"
          />
          <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            StudioSpace
          </span>
        </Link>

        {/* Middle — links (dead-centered by the 1fr auto 1fr grid) */}
        <nav
          aria-label="Main"
          className="hidden items-center gap-8 lg:flex lg:justify-self-center xl:gap-10"
        >
          {navLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap uppercase transition-colors",
                  active
                    ? "text-neutral-900 dark:text-sand"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-white/85 dark:hover:text-white"
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

        {/* Right — theme mode, sign in, sign up, profile (+ mobile hamburger) */}
        <div className="flex items-center gap-4 lg:gap-5 lg:justify-self-end">
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
  <>
    <Link
      href="/signIn"
      onClick={() => setOpen(false)}
      className={cn(
        authLinkClasses,
        "text-sm font-semibold tracking-[0.12em] uppercase"
      )}
    >
      Sign In
    </Link>

    <Link
      href="/signUp"
      onClick={() => setOpen(false)}
      className={cn(
        authPillClasses,
        "self-start text-sm tracking-[0.12em]"
      )}
    >
      Sign Up
    </Link>
  </>
) : (
  <Popover>
 <PopoverTrigger
  render={
    <Button
      variant="outline"
      className="h-10 w-10 rounded-full overflow-hidden p-0"
    />
  }
>
  {user?.image ? (
    <Image
      src={user.image}
      alt="Profile"
      width={40}
      height={40}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <User size={20} />
  )}
</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>{user.email}</PopoverTitle>
      <PopoverDescription>{user.name}</PopoverDescription>
	  <Button variant={"outline"} onClick={async()=>{await authClient.signOut();}}>Sign Out</Button>
    </PopoverHeader>
  </PopoverContent>
</Popover>
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
          className="border-t border-black/10 bg-white/95 backdrop-blur-md lg:hidden dark:border-white/10 dark:bg-[#0b0b10]"
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
                    "flex items-center gap-1.5 rounded-md px-2 py-2.5 text-sm font-semibold tracking-[0.12em] uppercase transition-colors",
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
            <div className="mt-3 flex flex-col gap-3 border-t border-black/10 px-2 pt-4 dark:border-white/10">


			{!user ? (
  <>
    <Link
      href="/signIn"
      onClick={() => setOpen(false)}
      className={cn(
        authLinkClasses,
        "text-sm font-semibold tracking-[0.12em] uppercase"
      )}
    >
      Sign In
    </Link>

    <Link
      href="/signUp"
      onClick={() => setOpen(false)}
      className={cn(
        authPillClasses,
        "self-start text-sm tracking-[0.12em]"
      )}
    >
      Sign Up
    </Link>
  </>
) : (
  <Popover>
  <PopoverTrigger
  render={
    <Button
      variant="outline"
      className="h-10 w-10 rounded-full overflow-hidden p-0"
    />
  }
>
  {user?.image ? (
    <Image
      src={user.image}
      alt="Profile"
      width={40}
      height={40}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <User size={20} />
  )}
</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>{user.email}</PopoverTitle>
      <PopoverDescription>{user.name}</PopoverDescription>
	    <Button onClick={async()=>{await authClient.signOut();}}>Sign Out</Button>
    </PopoverHeader>
  </PopoverContent>
</Popover>
)}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
