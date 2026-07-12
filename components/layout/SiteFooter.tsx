import type { SiteProfile } from "@/content/types";

export default function SiteFooter({ profile }: { profile: SiteProfile }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24">
      <div className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        {/* Closing entry — the ledger's totals row. */}
        <div className="rule-total py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <span className="meta-label">Closing entry · FY{year}</span>
            <span className="font-mono text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-stamp-deep">
              All sections reconciled ✓
            </span>
          </div>
          <p className="meta-label mt-1.5">
            Drafted in pair with Claude Code — human architecture, agent hands.
          </p>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 pt-4">
          <p className="font-mono text-xs text-ink-muted">
            © {year} {profile.name}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="font-mono text-xs text-ink-muted transition-colors hover:text-stamp-deep"
              >
                Email
              </a>
            </li>
            {profile.links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-ink-muted transition-colors hover:text-stamp-deep"
                >
                  {link.label}
                </a>
              </li>
            ))}
            {profile.resumePath ? (
              <li>
                <a
                  href={profile.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-ink-muted transition-colors hover:text-stamp-deep"
                >
                  Resume (PDF)
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </footer>
  );
}
