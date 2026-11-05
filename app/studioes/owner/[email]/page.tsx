"use client"

import { useCallback, use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Building2,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getTokenClient } from "@/lib/getTokenFromClient";



const API_URL = "http://localhost:8000"

// Adjust to match your MongoDB documents
type Studio = {
  _id: string
  // Listings created by the form store `title`/`hourlyRate`;
  // older documents used `name`/`price` — render whichever exists.
  title?: string
  name?: string
  hourlyRate?: number
  price?: number
  location?: string
  category?: string
  status?: string
}

// ---------- Shared classes (matching navbar / popover) ----------
const eyebrowClasses =
  "text-[11px] font-semibold tracking-[0.3em] text-sand-deep uppercase dark:text-sand"

const panelClasses =
  "rounded-2xl border border-black/10 bg-white shadow-sm " +
  "dark:border-white/10 dark:bg-white/[0.03]"

const headCellClasses =
  "px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.2em] " +
  "text-neutral-500 dark:text-white/50"

const updateBtnClasses =
  "inline-flex h-9 items-center justify-center gap-2 rounded-full bg-sand px-4 " +
  "text-[11px] font-bold uppercase tracking-[0.12em] whitespace-nowrap text-[#17130e] " +
  "transition-colors hover:bg-sand/90"

const deleteBtnClasses =
  "inline-flex h-9 items-center justify-center gap-2 rounded-full border border-red-500/40 px-4 " +
  "text-[11px] font-bold uppercase tracking-[0.12em] whitespace-nowrap text-red-600 " +
  "transition-colors hover:bg-red-500/10 dark:border-red-400/40 dark:text-red-400"

const iconBadgeClasses =
  "flex size-7 items-center justify-center rounded-full border border-sand-deep/50 " +
  "text-sand-deep dark:border-sand/50 dark:text-sand"

// ---------- Small pieces ----------
const StatusBadge = ({ status }: { status: string }) => {
  const active = status === "Active"
  return (
    <span
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase " +
        (active
          ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
          : "border-neutral-400/50 text-neutral-500 dark:border-white/20 dark:text-white/50")
      }
    >
      <span
        className={
          "size-1.5 rounded-full " +
          (active ? "bg-emerald-500" : "bg-neutral-400 dark:bg-white/40")
        }
      />
      {status}
    </span>
  )
}

const Thumb = () => (
  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-sand-deep/30 bg-sand/20 text-sand-deep dark:border-sand/30 dark:bg-sand/10 dark:text-sand">
    <Building2 size={22} aria-hidden="true" />
  </div>
)

// ---------- Page ----------
const Page = ({ params }: { params: Promise<{ email: string }> }) => {

  const { email } = use(params)
  const router = useRouter()




  const decodedEmail = decodeURIComponent(email)

  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Studio | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch only — callers decide how to store the result
  const fetchStudios = useCallback(async (): Promise<Studio[]> => {
	const jwtToken=await getTokenClient()
    try {
      const res = await fetch(
        `${API_URL}/myStudioes/${encodeURIComponent(decodedEmail)}`,

		{
			headers:{
				authorization:`Bearer ${jwtToken}`
			}
		},

      )
      const data = res.ok ? await res.json() : []
      return Array.isArray(data) ? (data as Studio[]) : []
    } catch {
      return []
    }
  }, [decodedEmail])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const list = await fetchStudios()

      if (!cancelled) {
        setStudios(list)
        setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [fetchStudios])

  // Runs from the confirmation modal: delete, then refresh the list
  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return

    setDeleting(true)

    try {
      const res = await fetch(
        `${API_URL}/studios/${encodeURIComponent(decodedEmail)}`,
        { method: "DELETE" }
      )

      if (!res.ok) throw new Error("Delete failed")

      toast.success("Studio deleted", {
        description: `${
          deleteTarget.title ?? deleteTarget.name ?? "Your studio"
        } has been removed.`,
      })

      setDeleteTarget(null)
      setStudios(await fetchStudios()) // refresh the list automatically
    } catch {
      toast.error("Failed to delete the studio. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  const openEditor = (studio: Studio) => {
    router.push(`/AddNewStudio?edit=${encodeURIComponent(studio._id)}`)
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-sand-deep dark:bg-sand" />
            <span className={eyebrowClasses}>Owner Dashboard</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
            My Studio Listings
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-white/60">
            {loading
              ? "Loading your studios..."
              : `${studios.length} ${studios.length === 1 ? "studio" : "studios"} listed under your account`}
          </p>
        </div>

        <Link
          href="/AddNewStudio"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-sand px-6 text-xs font-bold tracking-[0.12em] whitespace-nowrap text-[#17130e] uppercase transition-colors hover:bg-sand/90"
        >
          <Plus size={15} aria-hidden="true" />
          Add New Studio
        </Link>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className={`${panelClasses} space-y-4 p-6`}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-4">
              <div className="size-14 rounded-xl bg-black/10 dark:bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded bg-black/10 dark:bg-white/10" />
                <div className="h-3 w-1/4 rounded bg-black/10 dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && studios.length === 0 && (
        <div
          className={`${panelClasses} flex flex-col items-center px-6 py-16 text-center`}
        >
          <span className="mb-5 flex size-14 items-center justify-center rounded-full border-2 border-sand text-sand-deep dark:text-sand">
            <Building2 size={22} aria-hidden="true" />
          </span>
          <p className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
            No studios yet
          </p>
          <p className="mt-2 max-w-xs text-sm text-neutral-500 dark:text-white/60">
            Studios you add will show up here so you can update or remove them.
          </p>
        </div>
      )}

      {!loading && studios.length > 0 && (
        <>
          {/* Desktop table */}
          <div className={`${panelClasses} hidden overflow-x-auto md:block`}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10">
                  <th className={headCellClasses}>Studio</th>
                  <th className={headCellClasses}>Category</th>
                  <th className={headCellClasses}>Price / hr</th>
                  <th className={headCellClasses}>Status</th>
                  <th className={`${headCellClasses} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                {studios.map((studio) => (
                  <tr
                    key={studio._id}
                    className="transition-colors hover:bg-sand/10 dark:hover:bg-white/[0.04]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Thumb />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black tracking-tight text-neutral-900 dark:text-white">
                            {studio.title ?? studio.name}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-neutral-500 dark:text-white/60">
                            <MapPin
                              size={12}
                              className="shrink-0"
                              aria-hidden="true"
                            />
                            <span className="min-w-0 truncate">
                              {studio.location}
                            </span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold tracking-[0.14em] text-neutral-700 uppercase dark:text-white/85">
                      {studio.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-neutral-900 dark:text-white">
                      $
                      {Number(
                        studio.hourlyRate ?? studio.price ?? 0
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={studio.status ?? "Active"} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditor(studio)}
                          className={updateBtnClasses}
                        >
                          <Pencil size={13} aria-hidden="true" />
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(studio)}
                          className={deleteBtnClasses}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-4 md:hidden">
            {studios.map((studio) => (
              <div key={studio._id} className={`${panelClasses} p-5`}>
                <div className="flex items-start gap-4">
                  <Thumb />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black tracking-tight text-neutral-900 dark:text-white">
                      {studio.title ?? studio.name}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-neutral-500 dark:text-white/60">
                      <MapPin
                        size={12}
                        className="shrink-0"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate">
                        {studio.location}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="my-4 h-px bg-black/10 dark:bg-white/10" />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={iconBadgeClasses}>
                      <Building2 size={14} aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold tracking-[0.14em] text-neutral-700 uppercase dark:text-white/85">
                      {studio.category}
                    </span>
                  </div>
                  <StatusBadge status={studio.status ?? "Active"} />
                </div>

                <p className="mt-4 text-sm text-neutral-500 dark:text-white/60">
                  <span className="text-lg font-black text-neutral-900 dark:text-white">
                    ৳
                    {Number(
                      studio.hourlyRate ?? studio.price ?? 0
                    ).toLocaleString()}
                  </span>{" "}
                  / hour
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => openEditor(studio)}
                    className={updateBtnClasses}
                  >
                    <Pencil size={13} aria-hidden="true" />
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(studio)}
                    className={deleteBtnClasses}
                  >
                    <Trash2 size={13} aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirmation modal (one instance for the whole page) */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="!w-[calc(100%-2rem)] !max-w-md gap-0 !rounded-2xl !border !border-black/10 !bg-white !p-0 shadow-2xl !ring-0 dark:!border-white/10 dark:!bg-[#0e0b09]">
          <DialogHeader className="gap-0 px-6 pt-6 pb-5">
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-sand-deep dark:bg-sand" />
              <span className={eyebrowClasses}>Confirm Delete</span>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-red-500/50 text-red-600 dark:text-red-400">
                <TriangleAlert size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-base font-black tracking-tight text-neutral-900 dark:text-white">
                  Delete this studio?
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm leading-relaxed text-neutral-500 dark:text-white/60">
                  <span className="font-semibold text-neutral-800 dark:text-white/85">
                    {deleteTarget?.name}
                  </span>{" "}
                  will be permanently removed. This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="h-px bg-black/10 dark:bg-white/10" />

          <DialogFooter className="m-0 flex-row gap-3 !rounded-b-2xl !border-0 !bg-transparent p-4 sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-black/15 px-6 text-xs font-bold tracking-[0.12em] text-neutral-700 uppercase transition-colors hover:bg-sand/20 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none dark:border-white/20 dark:text-white/85 dark:hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-xs font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none"
            >
              {deleting ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Trash2 size={14} aria-hidden="true" />
              )}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default Page
