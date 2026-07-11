/**
 * Deployment config — the single source of truth for the site's public URL.
 *
 * Everything that emits an absolute URL (metadataBase → canonical + Open
 * Graph URLs, sitemap.xml, robots.txt) reads from here via the site profile.
 * The URL is read at build time (`output: "export"`), so changing it means
 * changing the env var (or fallback) and rebuilding.
 *
 * When the custom domain is purchased:
 *   1. Update NEXT_PUBLIC_SITE_URL in Vercel → Project → Settings →
 *      Environment Variables.
 *   2. Update the fallback below to match.
 *   3. Push — done. No other file references the URL.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vasukasipuri.vercel.app"
).replace(/\/$/, "");
