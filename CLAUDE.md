# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static portfolio site for **Vasu Kasipuri — NetSuite Architect**. Next.js (App Router) + TypeScript + Tailwind CSS v4, exported as fully static HTML (`output: "export"` in `next.config.ts`) but deliberately architected so a Node.js backend + database can be added later without a rewrite.

**Positioning rule for all copy:** Vasu is a "NetSuite Architect", never "developer". The site is capability-driven, not resume-driven — keep any content edits consistent with that framing.

## Commands

```bash
npm run dev        # dev server at http://localhost:3000
npm run build      # static export → ./out (must pass cleanly; this is also the type check)
npm run preview    # serve ./out locally (npx serve)
npm run generate:og                                      # regenerate public/og.png
npm run generate:portrait -- <photo>                     # regenerate public/portrait.webp
npm run generate:banner -- <slug> "<title>" "<TAG · TAG>"  # blog banner + OG card → public/blog/banners/<slug>.png
```

There is no test suite and no lint script. `npm run build` is the verification gate.

## Architecture

The load-bearing idea is a **content layer shaped like future database tables** with a single seam for the migration:

- `content/` — ALL site content as typed data files (`types.ts`, `site.ts`, `flagship.ts`, `skills.ts`, `certifications.ts`, `posts.ts`). Every interface in `content/types.ts` is deliberately table-shaped: stable `id`, `slug`, ISO timestamps, `sortOrder`.
- `lib/content.ts` — **the ONLY module allowed to import from `/content`.** Components call its async accessors (`getPosts()`, `getSiteProfile()`, …) and never touch the data files. Every accessor is async even though data is in-memory today, so swapping the internals for Prisma queries later requires zero component changes. Keep this rule intact: never import from `@/content/*` in a component or page.
- `components/` — `layout/` (SiteHeader, SiteFooter), `sections/` (one component per homepage section), `schematic/` (AgentSchematic, the animated SYS-001 routing diagram), `blog/PostBody.tsx` (renders post Markdown via react-markdown + remark-gfm, styled to the design system), `ui/` (small primitives).
- `app/` — `page.tsx` (homepage, fetches everything via `lib/content`), `blog/` (index + `[slug]` with `generateStaticParams` and `dynamicParams = false`), `sitemap.ts`, `robots.ts`.
- `scripts/` — Node scripts using `sharp` that render SVG designs to PNG/WebP assets. They hardcode the design-token hex values; if tokens change in `globals.css`, update the scripts to match.

Behavioral details that aren't obvious from one file:

- `lib/content.ts` nulls `resumePath` at build time when `public/resume.pdf` is missing, so resume links (hero, contact, footer) auto-hide and reappear on the next build once the PDF is dropped in.
- Adding a blog post: copy the **POST TEMPLATE** block at the bottom of `content/posts.ts`, fill it in, add it to the array, then generate its banner with `npm run generate:banner`. Route, sitemap entry, index row, and metadata all derive from the content layer — no other files to touch.
- Draft posts (`status: "draft"`) are returned by `getPosts()`; the UI decides how to render them.

## Design system ("Green-Bar")

The visual language is an ERP continuous-feed report: ledger paper, faint green-bar banding, hairline rules, tabular layouts, with a single vermilion "audit stamp" accent reserved for the AI signal layer. Tokens live in `app/globals.css` under `@theme` (`--color-paper`, `--color-band`, `--color-rule`, `--color-ink`, `--color-stamp`, `--color-annotate`, …) — use the tokens, never raw hex, in components. Fonts: Besley (display), Public Sans (body), IBM Plex Mono (data), loaded via `next/font` in `app/layout.tsx`. Light mode only. One orchestrated motion moment (the SYS-001 schematic) with full `prefers-reduced-motion` support — it degrades to a complete static diagram.

## Extending to Node.js + Database (the intended migration)

1. Remove `output: "export"` (and optionally `images.unoptimized`) from `next.config.ts`.
2. Add Prisma + Postgres; model the schema from the interfaces in `content/types.ts`.
3. Swap the internals of `lib/content.ts` accessors for Prisma queries — no component changes.
4. Blog pages can drop `dynamicParams = false` to pick up new DB posts without a rebuild.

Nothing in the codebase may assume static-only behavior — preserve that when adding features.

## Pending content TODOs

Search the repo for `[TODO: Vasu` — markers sit next to the exact lines to change (flagship outcomes/metrics, production domain, remaining certifications, real resume PDF).
