import Link from "next/link";
import type { SiteProfile } from "@/content/types";

const NAV_ITEMS = [
  { label: "Flagship", href: "/#flagship" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Certifications", href: "/#certifications" },
  { label: "Writing", href: "/blog/" },
  { label: "Contact", href: "/#contact" },
] as const;

export default function SiteHeader({ profile }: { profile: SiteProfile }) {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-5 py-4 sm:px-8">
        <Link href="/" className="group flex flex-col leading-tight">
          <span className="font-mono text-sm font-semibold tracking-[0.14em] uppercase">
            {profile.name}
          </span>
          <span className="meta-label group-hover:text-ink transition-colors">
            {profile.role}
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-mono text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
