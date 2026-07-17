# Vasu Kasipuri · Portfolio

Source for [heyvasu.com](https://heyvasu.com), the portfolio of
**Vasu Kasipuri, NetSuite Architect**. Built with Next.js (App Router),
TypeScript, and Tailwind CSS v4, exported as fully static HTML
(`output: 'export'`), and deliberately architected so a Node.js backend and
database can be added later **without a rewrite**.

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server at http://localhost:3000
npm run build      # static export → ./out (must pass cleanly)
npm run preview    # serve ./out locally
npm run generate:og  # regenerate public/og.png from scripts/generate-og.mjs
npm run generate:portrait -- <photo>  # regenerate public/portrait.webp (ink duotone)
npm run generate:banner -- <slug> "<title>" "<TAG · TAG>"  # blog banner + OG card
```

`npm run build` is the verification gate: it type-checks, exports the site,
and runs a postbuild check (`scripts/verify-og.mjs`) that fails the build if
any blog post is missing its own Open Graph banner or if `feed.xml` and the
search index did not make it into the export.

## Architecture

The load-bearing idea is a **content layer shaped like future database
tables**, with a single seam where a real database slots in later:

```
content/          ← ALL site content, typed like future database tables
  types.ts        ← Post, SkillPillar, Certification, CaseStudy, SiteProfile…
  site.ts         ← identity, thesis, links, about copy
  flagship.ts     ← the SYS-001 multi-agent case study (agents, queries)
  skills.ts       ← capability pillars
  certifications.ts
  posts.ts        ← blog posts (data files today, DB rows tomorrow)
lib/
  content.ts      ← THE ONLY module allowed to import from /content.
                    Async accessors: the seam where Prisma slots in.
  blog.ts         ← pure blog helpers (headings, pagination, related posts)
  site.ts         ← SITE_URL (NEXT_PUBLIC_SITE_URL + fallback), the single
                    source of truth for the site's public URL.
components/
  layout/         ← SiteHeader, SiteFooter
  sections/       ← one component per homepage section
  schematic/      ← AgentSchematic (the animated routing diagram)
  concierge/      ← AskConcierge (deterministic keyword router)
  blog/           ← post body renderer, search, ToC, share row, pagination
  ui/             ← small shared primitives (SectionHeading)
app/
  page.tsx        ← homepage (fetches everything via lib/content)
  blog/           ← /blog index + /blog/[slug] via generateStaticParams
  feed.xml/       ← RSS 2.0 feed (published posts only)
  globals.css     ← "Green-Bar" design tokens + schematic animation system
  sitemap.ts, robots.ts, icon.svg
scripts/          ← asset generators (sharp) + the verify-og postbuild gate
public/
  og.png          ← site-wide Open Graph card
  blog/banners/   ← per-post banners, doubling as per-post OG cards
```

**The one rule:** components never import from `/content` directly; they call
`lib/content.ts`. Content shapes carry `id`, `slug`, timestamps, and
`sortOrder` so they map 1:1 onto database tables later.

## Design system ("Green-Bar")

The visual language is an ERP continuous-feed report: ledger paper with faint
green-bar banding, hairline rules, tabular layouts, and a single vermilion
"audit stamp" accent reserved for the AI signal layer. Tokens live in
`app/globals.css` under `@theme`. Type: Besley (display), Public Sans (body),
IBM Plex Mono (data), self-hosted via `next/font`. Light mode only, one
orchestrated motion moment (the SYS-001 routing schematic), and full
`prefers-reduced-motion` support (the schematic degrades to a complete
static diagram).

## Adding a blog post

1. Open `content/posts.ts`, copy the **POST TEMPLATE** block at the bottom of
   the file, fill it in, and add it to the array. The `body` is Markdown:
   headings, lists, links, blockquotes, code blocks, and GFM tables are all
   styled to the design system by `components/blog/PostBody.tsx`.
2. Generate its banner (shown at the top of the post and used as its Open
   Graph image):
   ```bash
   npm run generate:banner -- my-new-essay "My new essay title" "TAG1 · TAG2"
   ```
   The banner is required; the postbuild gate fails the build without it.
3. `npm run build`. The route, sitemap entry, index row, search index, feed
   entry, and metadata are all generated from the content layer automatically.

## Deployment

Hosted on Vercel with Git integration; there is no manual deploy step:

- **Push to `main`** → production deploy at https://heyvasu.com
- **Push to any other branch** → a unique preview URL per commit

The site URL lives in exactly ONE place: the `NEXT_PUBLIC_SITE_URL` env var,
with a fallback constant in `lib/site.ts`. Everything absolute (metadataBase,
canonical URLs, Open Graph URLs, `sitemap.xml`, `robots.txt`) derives from it
at build time. Domain and DNS specifics live in `docs/operations.md`.

## Extending to Node.js + Database

The site is deliberately shaped so this is an afternoon, not a rewrite:

1. **Remove `output: 'export'`** (and optionally `images.unoptimized`) from
   `next.config.ts`. The app now runs on the Next.js Node server
   (`next start`); nothing in the codebase assumes static-only behavior.
2. **Add Prisma + Postgres:**
   ```bash
   npm install prisma @prisma/client && npx prisma init
   ```
   Model the schema by copying the interfaces in `content/types.ts`; they are
   already table-shaped (`Post`, `SkillPillar`, `Certification`, `CaseStudy`,
   `AgentSpec`). Seed the database from the existing `/content` data files.
3. **Swap the internals of `lib/content.ts`**, e.g. `getPosts()` becomes
   `prisma.post.findMany({ orderBy: { createdAt: 'desc' } })`. Every accessor
   is already async, so **no component changes at all**.
4. **Add route handlers** under `app/api/*` for any write paths (e.g. a CMS,
   comments, contact form). Blog pages can drop `dynamicParams = false` to
   pick up new DB posts without a rebuild.
5. Delete `/content` once the database is the source of truth (or keep it as
   seed data).
