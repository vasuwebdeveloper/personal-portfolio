# Vasu Kasipuri — Portfolio

Static portfolio site for **Vasu Kasipuri, NetSuite Architect** — built with
Next.js (App Router) + TypeScript + Tailwind CSS v4, exported as fully static
HTML (`output: 'export'`), and architected so a Node.js backend and database
can be added later **without a rewrite**.

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

## Adding a blog post

1. Open `content/posts.ts`, copy the **POST TEMPLATE** block at the bottom of
   the file, fill it in, and add it to the array. The `body` is Markdown —
   headings, lists, links, blockquotes, code blocks, and GFM tables are all
   styled to the design system by `components/blog/PostBody.tsx`.
2. Generate its banner (shown at the top of the post and used as its Open
   Graph image):
   ```bash
   npm run generate:banner -- my-new-essay "My new essay title" "TAG1 · TAG2"
   ```
   Reference it from the post's `banner` field (`/blog/banners/my-new-essay.png`),
   or set `banner: null` to skip it.
3. `npm run build`. The route, sitemap entry, index row, and metadata are all
   generated from the content layer automatically.

## Deployment

Hosted on Vercel (free Hobby tier) with Git integration — there is no manual
deploy step:

- **Push to `main`** → production deploy at https://heyvasu.com
- **Push to any other branch** → a unique preview URL per commit
- Deploys, logs, and settings: https://vercel.com → team `AI_Portfolio` →
  project `vasukasipuri`
  (repo: https://github.com/vasuwebdeveloper/personal-portfolio)

The site URL lives in exactly ONE place: the `NEXT_PUBLIC_SITE_URL` env var,
with a fallback constant in `lib/site.ts`. Everything absolute — metadataBase,
canonical URLs, Open Graph URLs, `sitemap.xml`, `robots.txt` — derives from it
at build time.

### Custom domain — heyvasu.com

The domain `heyvasu.com` (registered at Spaceship) is attached to the Vercel
project: apex is the primary production domain, `www.heyvasu.com` 308-redirects
to it, and `NEXT_PUBLIC_SITE_URL` (+ the fallback in `lib/site.ts`) is
`https://heyvasu.com`.

**The one manual dependency is DNS at Spaceship.** If the domain ever shows
"Invalid Configuration" in Vercel → Settings → Domains, set these records in
Spaceship → Domain → **DNS/Nameservers → Advanced DNS**:

| Type  | Host  | Value                              |
| ----- | ----- | ---------------------------------- |
| A     | `@`   | `216.198.79.1`                     |
| A     | `@`   | `64.29.17.1`                       |
| CNAME | `www` | `92f4fe9e11d6dedf.vercel-dns-017.com` |

…and delete any Spaceship parking/ALIAS records on `@` and `www` first.
(Records current as of July 2026 — if Vercel's Domains screen shows different
values, trust the dashboard.)

After DNS propagates, verify:

1. `https://heyvasu.com` loads over HTTPS.
2. `https://www.heyvasu.com` 308-redirects to the apex.
3. `curl -s https://heyvasu.com/sitemap.xml` lists heyvasu.com URLs.
4. Add the domain to Google Search Console (DNS TXT verification or the
   HTML-file method) and submit `https://heyvasu.com/sitemap.xml`.
5. Validate the Open Graph card with LinkedIn's Post Inspector:
   https://www.linkedin.com/post-inspector/

## Architecture

```
content/          ← ALL site content, typed like future database tables
  types.ts        ← Post, SkillPillar, Certification, CaseStudy, SiteProfile…
  site.ts         ← identity, thesis, links, about copy
  flagship.ts     ← the SYS-001 multi-agent case study (agents, queries)
  skills.ts       ← capability pillars
  certifications.ts
  posts.ts        ← blog posts (drafts today, DB rows tomorrow)
lib/
  content.ts      ← THE ONLY module allowed to import from /content.
                    Async accessors — the seam where Prisma slots in.
  site.ts         ← SITE_URL (NEXT_PUBLIC_SITE_URL + fallback) — the single
                    source of truth for the site's public URL.
components/
  layout/         ← SiteHeader, SiteFooter
  sections/       ← one component per homepage section
  schematic/      ← AgentSchematic (the animated routing diagram)
  ui/             ← small shared primitives (SectionHeading)
app/
  page.tsx        ← homepage (fetches everything via lib/content)
  blog/           ← /blog index + /blog/[slug] via generateStaticParams
  globals.css     ← "Green-Bar" design tokens + schematic animation system
  sitemap.ts, robots.ts, icon.svg
scripts/
  generate-og.mjs ← renders public/og.png (1200×630) from an SVG design
public/
  og.png          ← Open Graph card
  resume.pdf      ← ← drop the real resume PDF here (linked site-wide)
```

**The one rule:** components never import from `/content` directly — they call
`lib/content.ts`. Content shapes carry `id`, `slug`, timestamps, and
`sortOrder` so they map 1:1 onto database tables later.

## Design system ("Green-Bar")

The visual language is an ERP continuous-feed report: ledger paper with faint
green-bar banding, hairline rules, tabular layouts, and a single vermilion
"audit stamp" accent reserved for the AI signal layer. Tokens live in
`app/globals.css` under `@theme`. Type: Besley (display), Public Sans (body),
IBM Plex Mono (data), self-hosted via `next/font`. Light mode only, one
orchestrated motion moment (the SYS-001 routing schematic), and full
`prefers-reduced-motion` support — the schematic degrades to a complete
static diagram.

## Extending to Node.js + Database

The site is deliberately shaped so this is an afternoon, not a rewrite:

1. **Remove `output: 'export'`** (and optionally `images.unoptimized`) from
   `next.config.ts`. The app now runs on the Next.js Node server
   (`next start`) — nothing in the codebase assumes static-only behavior.
2. **Add Prisma + Postgres:**
   ```bash
   npm install prisma @prisma/client && npx prisma init
   ```
   Model the schema by copying the interfaces in `content/types.ts` — they are
   already table-shaped (`Post`, `SkillPillar`, `Certification`, `CaseStudy`,
   `AgentSpec`). Seed the database from the existing `/content` data files.
3. **Swap the internals of `lib/content.ts`** — e.g. `getPosts()` becomes
   `prisma.post.findMany({ orderBy: { createdAt: 'desc' } })`. Every accessor
   is already async, so **no component changes at all**.
4. **Add route handlers** under `app/api/*` for any write paths (e.g. a CMS,
   comments, contact form). Blog pages can drop `dynamicParams = false` to
   pick up new DB posts without a rebuild.
5. Delete `/content` once the database is the source of truth (or keep it as
   seed data).

## TODOs for Vasu

Search the repo for `[TODO: Vasu` — each marker sits next to the exact line
to change:

- `content/flagship.ts` — outcomes/metrics + screenshot or demo link for SYS-001
- `content/site.ts` — GitHub username spelling, Hyderabad vs Bengaluru
  (the production URL is handled by `lib/site.ts` — see Deployment)
- `content/certifications.ts` — remaining certifications + earned years
- `public/resume.pdf` — drop in the real (architect-positioned) PDF. Resume
  links auto-hide while the file is missing and reappear on the next build.
  Note: the old "NetSuite Developer / 8yrs" resume contradicts the site's
  positioning — use the current architect resume.
