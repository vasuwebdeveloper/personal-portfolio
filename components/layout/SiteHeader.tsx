import Link from "next/link";
import type { SiteProfile } from "@/content/types";

/**
 * Masthead as a printed report's form header: the identity block set in the
 * display serif, then the primary nav as the report's column-header strip:
 * a band-tinted row where each destination carries the GL account code its
 * section already uses (SectionHeading), so the navigation is literally the
 * site's chart of accounts.
 */
const NAV_ITEMS = [
  { code: "1000", label: "Flagship", href: "/#flagship" },
  { code: "2000", label: "Capabilities", href: "/#capabilities" },
  { code: "3000", label: "Certifications", href: "/#certifications" },
  { code: "4000", label: "Writing", href: "/blog/" },
  { code: "5000", label: "Contact", href: "/#contact" },
] as const;

export default function SiteHeader({ profile }: { profile: SiteProfile }) {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto max-w-6xl px-5 pt-6 pb-5 sm:px-8">
        <Link href="/" className="group inline-block leading-tight">
          <span className="font-display text-[1.4375rem] font-semibold tracking-tight">
            {profile.name}
          </span>
          <span className="meta-label mt-1 block transition-colors group-hover:text-ink">
            {profile.role}
          </span>
        </Link>
      </div>
      <nav aria-label="Primary" className="border-t border-rule bg-band/60">
        <ul className="mx-auto flex max-w-6xl flex-wrap gap-x-7 gap-y-0 px-5 sm:px-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-baseline gap-1.5 py-1.5 font-mono text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-ink sm:py-2.5"
              >
                <span
                  aria-hidden="true"
                  className="text-[0.625rem] tracking-[0.08em] text-stamp-deep"
                >
                  {item.code}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
