import Link from "next/link";
import AgentSchematic from "@/components/schematic/AgentSchematic";
import type { CaseStudy, SiteProfile } from "@/content/types";

export default function Hero({
  profile,
  caseStudy,
}: {
  profile: SiteProfile;
  caseStudy: CaseStudy;
}) {
  return (
    <section className="greenbar border-b border-rule">
      <div className="mx-auto max-w-6xl px-5 pt-14 pb-16 sm:px-8 sm:pt-20">
        <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[220px_1fr]">
          {/* Ledger meta rail */}
          <dl className="flex flex-row flex-wrap gap-x-10 gap-y-4 border-l border-stamp/50 pl-4 lg:flex-col lg:gap-y-6">
            <div>
              <dt className="meta-label">Role</dt>
              <dd className="mt-1 font-mono text-[0.8125rem] leading-snug">
                {profile.role}
              </dd>
            </div>
            <div>
              <dt className="meta-label">Focus</dt>
              <dd className="mt-1">
                <ul className="font-mono text-[0.8125rem] leading-relaxed">
                  {profile.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="meta-label">Base</dt>
              <dd className="mt-1 font-mono text-[0.8125rem] leading-snug">
                {profile.location}
              </dd>
            </div>
          </dl>

          {/* Thesis */}
          <div>
            <h1 className="font-display max-w-[22ch] text-[clamp(2.125rem,5.2vw,4.25rem)] leading-[1.06] font-semibold tracking-tight">
              {profile.thesis}
            </h1>
            <p className="mt-7 max-w-[56ch] text-lg leading-relaxed">
              {profile.identity}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/#flagship"
                className="border border-stamp-deep px-5 py-2.5 font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-stamp-deep transition-colors hover:bg-stamp-deep hover:text-paper"
              >
                {caseStudy.code} · the flagship system
              </Link>
              {profile.resumePath ? (
                <a
                  href={profile.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-ink-muted px-5 py-2.5 font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  Resume (PDF)
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {/* Signature element: the live routing schematic */}
        <div className="mt-16">
          <AgentSchematic
            agents={caseStudy.agents}
            queries={caseStudy.exampleQueries}
          />
        </div>
      </div>
    </section>
  );
}
