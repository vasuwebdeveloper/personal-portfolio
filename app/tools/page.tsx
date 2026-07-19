import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { getSiteProfile, getTools } from "@/lib/content";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Free, in-browser utilities for enterprise teams: validate NACHA (ACH) payment files before the bank rejects them. Nothing you load is ever uploaded.",
  alternates: { canonical: "/tools/" },
};

export default async function ToolsIndexPage() {
  const [tools, profile] = await Promise.all([getTools(), getSiteProfile()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Tools · ${profile.name}`,
    url: `${profile.siteUrl}/tools/`,
    description: metadata.description,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${profile.siteUrl}/tools/${tool.slug}/`,
      name: tool.title,
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
      <script
        type="application/ld+json"
        // Static JSON derived from the content layer; no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SectionHeading
        code="6000"
        title="Tools"
        kicker="In-browser utilities"
      />

      <p className="max-w-[62ch] text-lg leading-relaxed">
        Small, sharp utilities for everyday enterprise work. Each one runs
        entirely in your browser: nothing you load here is uploaded,
        logged, or stored.
      </p>

      {/* Card grid; scales to a dozen tools before it needs rethinking. */}
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link
              href={`/tools/${tool.slug}/`}
              className="group flex h-full flex-col border border-rule bg-paper px-5 py-5 transition-colors hover:border-rule-strong"
            >
              <p className="flex items-baseline justify-between gap-4">
                <span className="meta-label text-stamp-deep">{tool.code}</span>
                <span className="meta-label">
                  {tool.status === "live" ? "In service" : "Coming soon"}
                </span>
              </p>
              <h2 className="font-display mt-3 text-xl font-semibold tracking-tight transition-colors group-hover:text-stamp-deep">
                {tool.title}
              </h2>
              <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-ink-muted">
                {tool.description}
              </p>
              <p className="meta-label mt-4 transition-colors group-hover:text-stamp-deep">
                Open tool →
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-12">
        <Link
          href="/"
          className="font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep"
        >
          ← Back to the ledger
        </Link>
      </p>
    </div>
  );
}
