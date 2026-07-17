# Operations runbook

Internal notes for running the site. Nothing here affects the codebase;
see the README for architecture and day-to-day commands.

## Vercel project

Deploys, logs, and settings: https://vercel.com → team `AI_Portfolio` →
project `vasukasipuri`
(repo: https://github.com/vasuwebdeveloper/personal-portfolio).
Vercel deploys via Git integration only; never run `vercel deploy` manually.

## Custom domain: heyvasu.com

The domain `heyvasu.com` (registered at Spaceship) is attached to the Vercel
project: apex is the primary production domain, `www.heyvasu.com`
308-redirects to it, and `NEXT_PUBLIC_SITE_URL` (plus the fallback in
`lib/site.ts`) is `https://heyvasu.com`.

**The one manual dependency is DNS at Spaceship.** If the domain ever shows
"Invalid Configuration" in Vercel → Settings → Domains, set these records in
Spaceship → Domain → **DNS/Nameservers → Advanced DNS**:

| Type  | Host  | Value                                 |
| ----- | ----- | ------------------------------------- |
| A     | `@`   | `216.198.79.1`                        |
| A     | `@`   | `64.29.17.1`                          |
| CNAME | `www` | `92f4fe9e11d6dedf.vercel-dns-017.com` |

…and delete any Spaceship parking/ALIAS records on `@` and `www` first.
(Records current as of July 2026; if Vercel's Domains screen shows different
values, trust the dashboard.)

After DNS propagates, verify:

1. `https://heyvasu.com` loads over HTTPS.
2. `https://www.heyvasu.com` 308-redirects to the apex.
3. `curl -s https://heyvasu.com/sitemap.xml` lists heyvasu.com URLs.
4. Add the domain to Google Search Console (DNS TXT verification or the
   HTML-file method) and submit `https://heyvasu.com/sitemap.xml`.
5. Validate the Open Graph card with LinkedIn's Post Inspector:
   https://www.linkedin.com/post-inspector/

## Pending content markers

Search the repo for `[TODO: Vasu`; each marker sits next to the exact line
to change. Current markers cover the flagship outcomes/metrics
(`content/flagship.ts`), profile details (`content/site.ts`), and the
resume PDF (`public/resume.pdf`; resume links auto-hide while the file is
missing and reappear on the next build).
