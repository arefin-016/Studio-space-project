<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Commands (npm; lockfile is `package-lock.json`)

- `npm run lint` — ESLint (flat config); focus on one file with `npx eslint <path>`. `next build` does **not** lint (Next 16 removed `next lint`).
- `npm run typecheck` — `tsc --noEmit`.
- `npm run build` — production build (Turbopack); re-runs the full TS check, no lint step.
- `npm run format` — Prettier over `**/*.{ts,tsx}` only; css/md/json are not covered.
- There is no test suite and no `test` script — don't look for one or invent `npm test`.

Verify with: `npm run format` → `npm run lint` → `npm run typecheck` → `npm run build`. No test step exists.

## Stack quirks

- Next.js 16 App Router + React 19, TypeScript strict, path alias `@/*` → repo root.
- Next 16 differs from older training data (e.g. `middleware` → `proxy`, async-only request APIs). The managed block above points at the authoritative guides in `node_modules/next/dist/docs/` — read them before writing Next.js code.
- Tailwind CSS v4 is CSS-first: there is **no** tailwind.config. Tokens live in `app/globals.css` `@theme` — e.g. `--color-sand: #c9b095` (the accent used by the navbar and hero CTAs) is used as `text-sand`/`bg-sand`. Add tokens there instead of hardcoding colors.
- shadcn style is `base-nova` (`components.json`): `components/ui/*` wrap **Base UI** (`@base-ui/react`) primitives, **not Radix** — never import `@radix-ui/*`; composition uses `render`/`useRender`/`mergeProps` instead of Radix `asChild`.
- `cn` is the standalone `cn` package: `import { cn } from "cn"` (clsx + tailwind-merge drop-in; `@/lib/utils` re-exports it). Prettier's Tailwind plugin sorts classes inside `cn(...)`/`cva(...)` (`tailwindFunctions` in `.prettierrc`).
- Add UI primitives with `npx shadcn@latest add <component>` (lucide icon library).
- Prettier style: no semicolons, double quotes, 2-space indent, LF — run `npm run format` before committing.
- Dark mode: next-themes with `class` attribute; the `d` key toggles theme via a custom hotkey in `components/theme-provider.tsx` (ignored while typing in inputs). Convention: light is the base style, dark via `dark:` variants — `components/navbar.tsx` and `components/home/HeroSlider.tsx` are theme-aware (white wash / dark scrim), and light-theme accents use `--color-sand-deep` instead of `--color-sand`.

## Structure

- `app/` — App Router routes; `app/layout.tsx` mounts `ThemeProvider` + `Navbar` for every page; `app/globals.css` is the only stylesheet.
- `components/ui/` — shadcn primitives; other files in `components/` are app-level components (e.g. `navbar.tsx`).
- `hooks/`, `lib/` — shared hooks (`useIsMobile`, …) and utilities.
- `components/home/HeroSlider.tsx` — home hero banner (Swiper: `swiper/react` + `swiper/modules`, CSS imported per-component); its images live in `public/hero/` (`hero-1.jpg` … `hero-6.jpg`). Slide-reveal animation classes (`.hero-anim`, `.hero-delay-*`) are styled in `app/globals.css`.
