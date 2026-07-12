import Link from "next/link";
import type { SiteProfile } from "@/content/types";
import { getFlagshipCaseStudy } from "@/lib/content";

const NAV_ITEMS = [
  { label: "Flagship", href: "/#flagship" },
  { label: "Capabilities", href: "/#capabilities" },
  { label: "Certifications", href: "/#certifications" },
  { label: "Writing", href: "/blog/" },
  { label: "Contact", href: "/#contact" },
] as const;

export default async function SiteHeader({ profile }: { profile: SiteProfile }) {
  const flagship = await getFlagshipCaseStudy();

  return (
    <header className="border-b border-rule">
      {/* System-status microbar — additive telemetry row above the masthead. */}
      <div
        className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-5 pt-2.5 sm:px-8"
        aria-label={`System status: ${flagship.code} online, ${flagship.agents.length} agents, MCP linked`}
      >
        <span className="status-dot" aria-hidden="true" />
        <span className="font-mono text-[0.625rem] font-medium tracking-[0.16em] uppercase text-ink-muted">
          {flagship.code}
          <span className="hidden sm:inline"> online</span>
          <span className="hidden lg:inline">
            {" "}
            · {flagship.agents.length} agents · MCP linked
          </span>
        </span>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-5 pb-4 pt-1 sm:px-8">
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
