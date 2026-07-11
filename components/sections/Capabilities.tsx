import SectionHeading from "@/components/ui/SectionHeading";
import type { SkillPillar } from "@/content/types";

export default function Capabilities({ pillars }: { pillars: SkillPillar[] }) {
  return (
    <section
      id="capabilities"
      className="mx-auto max-w-6xl scroll-mt-8 px-5 pt-20 sm:px-8"
    >
      <SectionHeading
        code="2000"
        title="What I architect"
        kicker="Capabilities, not a tag cloud"
      />

      <div className="border-t border-rule">
        {pillars.map((pillar) => (
          <article
            key={pillar.id}
            className="grid gap-x-12 gap-y-2 border-b border-rule py-7 md:grid-cols-[minmax(200px,280px)_1fr]"
          >
            <div className="flex items-baseline gap-4 md:block">
              <span className="meta-label text-stamp-deep">{pillar.code}</span>
              <h3 className="font-display text-xl font-semibold tracking-tight md:mt-1">
                {pillar.title}
              </h3>
            </div>
            <div>
              <p className="max-w-[62ch] leading-relaxed">{pillar.thesis}</p>
              <p className="mt-3 font-mono text-[0.75rem] leading-relaxed tracking-[0.04em] text-ink-muted">
                {pillar.items.join("  ·  ")}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
