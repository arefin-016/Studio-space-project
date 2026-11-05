"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  CalendarCheck,
  Inbox,
  LogOut,
  Plus,
  User,
} from "lucide-react"
import { toast } from "sonner"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "../ui/button"
import { authClient } from "@/lib/auth-client"

// Menu row: same uppercase, wide-tracked type as your navbar links
const rowClasses =
  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold " +
  "uppercase tracking-[0.14em] text-neutral-700 transition-colors " +
  "hover:bg-sand/20 hover:text-neutral-900 " +
  "dark:text-white/85 dark:hover:bg-white/10 dark:hover:text-white"

// Round icon badge shown at the left of each menu row
const iconBadgeClasses =
  "flex size-7 items-center justify-center rounded-full border border-sand-deep/50 " +
  "text-sand-deep dark:border-sand/50 dark:text-sand"

// Same tan pill as "Sign Up" in the navbar
const pillClasses =
  "flex h-10 w-full items-center justify-center gap-2 rounded-full bg-sand px-6 " +
  "text-xs font-bold uppercase tracking-[0.12em] whitespace-nowrap text-[#17130e] " +
  "transition-colors hover:bg-sand/90 disabled:cursor-not-allowed disabled:opacity-60"

// Profile photo, or the first letter of the name if there is no photo
const UserAvatar = ({
  name,
  image,
}: {
  name?: string | null
  image?: string | null
}) => {
  if (image) {
    return (
      <Image
        src={image}
        alt={name ? `${name} profile photo` : "Profile photo"}
        width={44}
        height={44}
        unoptimized
        className="h-full w-full object-cover"
      />
    )
  }

  return name ? (
    <span className="text-sm font-black uppercase">{name.charAt(0)}</span>
  ) : (
    <User size={18} aria-hidden="true" />
  )
}

const PopOver = () => {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const user = session?.user

  const [open, setOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    setSigningOut(true)
    const { error } = await authClient.signOut()
    setSigningOut(false)

    if (error) {
      toast.error(error.message || "Sign out failed. Please try again.")
      return
    }

    setOpen(false)
    toast.success("Signed out successfully")
    router.push("/")
    router.refresh() // clears the avatar from the navbar
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* Trigger: round outlined button, like the theme toggle, with a tan ring */}
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label="Open account menu"
            className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-sand bg-transparent p-0 text-neutral-800 hover:bg-sand/20 dark:text-white"
          />
        }
      >
        <UserAvatar name={user.name} image={user.image} />
      </PopoverTrigger>

      {/* Panel: dark warm-black in dark mode, white in light mode */}
      <PopoverContent
        align="end"
        sideOffset={12}
        className="!w-72 gap-0 !rounded-2xl !border !border-black/10 !bg-white !p-0 shadow-2xl !ring-0 dark:!border-white/10 dark:!bg-[#0e0b09]"
      >
        {/* Account */}
        <PopoverHeader className="gap-0 px-5 pt-5 pb-4">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-sand-deep dark:bg-sand" />
            <span className="text-[11px] font-semibold tracking-[0.3em] text-sand-deep uppercase dark:text-sand">
              Signed in
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-sand text-neutral-800 dark:text-white">
              <UserAvatar name={user.name} image={user.image} />
            </span>

            <div className="min-w-0">
              <PopoverTitle className="truncate text-base font-black tracking-tight text-neutral-900 dark:text-white">
                {user.name}
              </PopoverTitle>
              <PopoverDescription className="truncate text-xs text-neutral-500 dark:text-white/60">
                {user.email}
              </PopoverDescription>
            </div>
          </div>
        </PopoverHeader>

        <div className="h-px bg-black/10 dark:bg-white/10" />

        {/* Links */}
        <div className="space-y-1 p-2">
          <Link
            href="/AddNewStudio"
            onClick={() => setOpen(false)}
            className={rowClasses}
          >
            <span className={iconBadgeClasses}>
              <Plus size={14} aria-hidden="true" />
            </span>
            Add New Studio
          </Link>

          <Link
            href={`/studioes/owner/${encodeURIComponent(user.email)}`}
            onClick={() => setOpen(false)}
            className={rowClasses}
          >
            <span className={iconBadgeClasses}>
              <Building2 size={14} aria-hidden="true" />
            </span>
            My Studio Listings
          </Link>

          <Link
            href={`/myStudioListings/${encodeURIComponent(user.email)}`}
            onClick={() => setOpen(false)}
            className={rowClasses}
          >
            <span className={iconBadgeClasses}>
              <CalendarCheck size={14} aria-hidden="true" />
            </span>
            My Bookings
          </Link>

          <Link
            href="/my-booking-requests"
            onClick={() => setOpen(false)}
            className={rowClasses}
          >
            <span className={iconBadgeClasses}>
              <Inbox size={14} aria-hidden="true" />
            </span>
            Booking Requests
          </Link>
        </div>

        <div className="h-px bg-black/10 dark:bg-white/10" />

        {/* Sign out */}
        <div className="p-4">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className={pillClasses}
          >
            <LogOut size={15} aria-hidden="true" />
            {signingOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default PopOver
