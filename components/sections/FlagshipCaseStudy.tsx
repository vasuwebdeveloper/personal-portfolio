import SectionHeading from "@/components/ui/SectionHeading";
import ToolContract from "@/components/ui/ToolContract";
import type { CaseStudy } from "@/content/types";

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\s*\n/).map((para) => (
        <p key={para.slice(0, 32)} className="mt-4 first:mt-0 leading-relaxed">
          {para}
        </p>
      ))}
    </>
  );
}

export default function FlagshipCaseStudy({
  caseStudy,
}: {
  caseStudy: CaseStudy;
}) {
  const specialists = caseStudy.agents.filter(
    (agent) => agent.slug !== "orchestrator",
  );
  const orchestrator = caseStudy.agents.find(
    (agent) => agent.slug === "orchestrator",
  );

  return (
    <section
      id="flagship"
      className="mx-auto max-w-6xl scroll-mt-8 px-5 pt-20 sm:px-8"
    >
      <SectionHeading
        code="1000"
        title={caseStudy.title}
        kicker={`${caseStudy.code} · Case study`}
      />

      {/* Printout block: tractor-feed edges at large widths */}
      <div className="border border-rule lg:grid lg:grid-cols-[2rem_1fr_2rem]">
        <div aria-hidden="true" className="tractor-feed hidden border-r border-rule lg:block" />
        <div className="px-5 py-8 sm:px-10 sm:py-10">
          <p className="font-display max-w-[46ch] text-xl leading-normal sm:text-2xl">
            {caseStudy.subtitle}
          </p>

          <div className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
            <div>
              <h3 className="meta-label text-stamp-deep">The problem</h3>
              <div className="mt-3 text-[0.9375rem]">
                <Paragraphs text={caseStudy.problem} />
              </div>
            </div>
            <div>
              <h3 className="meta-label text-stamp-deep">The system</h3>
              <div className="mt-3 text-[0.9375rem]">
                <Paragraphs text={caseStudy.approach} />
              </div>
            </div>
          </div>

          {/* Agent roster — structured like the table it will one day be */}
          <div className="mt-12 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="meta-label mb-3 text-left">
                Agent roster
              </caption>
              <thead>
                <tr className="border-y border-rule">
                  <th scope="col" className="meta-label py-2.5 pr-4">
                    Agent
                  </th>
                  <th scope="col" className="meta-label py-2.5 pr-4">
                    Domain
                  </th>
                  <th scope="col" className="meta-label py-2.5">
                    Answers for
                  </th>
                </tr>
              </thead>
              <tbody>
                {orchestrator ? (
                  <tr className="border-b border-rule bg-band/60">
                    <td className="py-3 pr-4 font-mono text-[0.8125rem] font-semibold">
                      {orchestrator.name}
                    </td>
                    <td className="py-3 pr-4 text-[0.875rem]">
                      {orchestrator.domain}
                    </td>
                    <td className="py-3 text-[0.875rem]">
                      {orchestrator.responsibilities}
                    </td>
                  </tr>
                ) : null}
                {specialists.map((agent, i) => (
                  <tr
                    key={agent.id}
                    className={`border-b border-rule ${i % 2 === 1 ? "bg-band/60" : ""}`}
                  >
                    <td className="py-3 pr-4 font-mono text-[0.8125rem] font-semibold">
                      {agent.name}
                    </td>
                    <td className="py-3 pr-4 text-[0.875rem]">{agent.domain}</td>
                    <td className="py-3 text-[0.875rem]">
                      {agent.responsibilities}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Guardrails */}
          <div className="mt-12 border-l-2 border-stamp pl-5">
            <h3 className="meta-label text-stamp-deep">Guardrails</h3>
            <div className="mt-3 max-w-[70ch] text-[0.9375rem]">
              <Paragraphs text={caseStudy.guardrails} />
            </div>
          </div>

          {caseStudy.outcomes ? (
            <div className="mt-12">
              <h3 className="meta-label text-stamp-deep">Outcomes</h3>
              <div className="mt-3 max-w-[70ch] text-[0.9375rem]">
                <Paragraphs text={caseStudy.outcomes} />
              </div>
            </div>
          ) : null}

          {/* Fig. 03 — what "explicit, typed, and enumerable" looks like */}
          <ToolContract />

          {/* Stack line */}
          <div className="mt-12 flex flex-wrap items-baseline gap-x-3 gap-y-2 border-t border-rule pt-4">
            <span className="meta-label">Stack</span>
            <span className="font-mono text-[0.75rem] tracking-[0.04em] text-ink-muted">
              {caseStudy.stack.join("  ·  ")}
            </span>
          </div>
        </div>
        <div aria-hidden="true" className="tractor-feed hidden border-l border-rule lg:block" />
      </div>
    </section>
  );
}
