import AskConcierge from "@/components/concierge/AskConcierge";
import SectionHeading from "@/components/ui/SectionHeading";
import type { SiteProfile } from "@/content/types";
import {
  getCertifications,
  getFlagshipCaseStudy,
  getPosts,
  getSkillPillars,
} from "@/lib/content";

export default async function AboutContact({
  profile,
}: {
  profile: SiteProfile;
}) {
  const [certifications, pillars, flagship, posts] = await Promise.all([
    getCertifications(),
    getSkillPillars(),
    getFlagshipCaseStudy(),
    getPosts(),
  ]);

  const conciergeFacts = {
    name: profile.name,
    role: profile.role,
    identity: profile.identity,
    thesis: profile.thesis,
    guardrailLine: `${flagship.guardrails.split(". ")[0]}.`,
    email: profile.email,
    location: profile.location,
    hasResume: Boolean(profile.resumePath),
    links: profile.links.map((l) => ({ label: l.label, href: l.href })),
    pillars: pillars.map((p) => `${p.code} ${p.title} · ${p.thesis}`),
    certifications: certifications.map(
      (c) => `${c.title} · ${c.issuer}${c.earnedYear ? ` · ${c.earnedYear}` : ""}`,
    ),
    stack: flagship.stack,
    posts: posts.map((p) => ({ title: p.title, status: p.status })),
    flagship: {
      code: flagship.code,
      title: flagship.title,
      agentNames: flagship.agents.map((a) => a.name),
    },
  };

  return (
    <section
      id="contact"
      className="mx-auto max-w-6xl scroll-mt-8 px-5 pt-20 sm:px-8"
    >
      <SectionHeading code="5000" title="About & contact" kicker="The narrative line" />

      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[1fr_minmax(260px,320px)]">
        <div className="max-w-[68ch]">
          {profile.about.split(/\n\s*\n/).map((para) => (
            <p key={para.slice(0, 32)} className="mt-5 first:mt-0 text-lg leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        <div className="space-y-6">
          {/* Personnel-record plate: the portrait printed in the site's own
              ink, not pasted on top of it. */}
          {profile.portrait ? (
            <figure className="border border-rule">
              <div className="relative border-b border-rule">
                <img
                  src={profile.portrait.src}
                  alt={profile.portrait.alt}
                  width={profile.portrait.width}
                  height={profile.portrait.height}
                  loading="lazy"
                  decoding="async"
                  className="block h-auto w-full"
                />
                <span className="stamp stamp-tilt absolute right-3 bottom-3 bg-paper">
                  On file
                </span>
              </div>
              <figcaption className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                <span className="meta-label text-stamp-deep">Fig. 02</span>
                <span className="meta-label">Personnel record</span>
              </figcaption>
            </figure>
          ) : null}

          {/* Contact ledger */}
          <dl className="h-fit border border-rule">
          <div className="flex items-baseline justify-between gap-4 border-b border-rule bg-band/60 px-4 py-3 last:border-b-0">
            <dt className="meta-label">Email</dt>
            <dd className="text-right">
              <a
                href={`mailto:${profile.email}`}
                className="link-annotate font-mono text-[0.8125rem] break-all"
              >
                {profile.email}
              </a>
            </dd>
          </div>
          {profile.links.map((link) => (
            <div
              key={link.id}
              className="flex items-baseline justify-between gap-4 border-b border-rule px-4 py-3 last:border-b-0"
            >
              <dt className="meta-label">{link.label}</dt>
              <dd className="text-right">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-annotate font-mono text-[0.8125rem]"
                >
                  {link.href.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </a>
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 border-b border-rule px-4 py-3 last:border-b-0">
            <dt className="meta-label">Base</dt>
            <dd className="font-mono text-[0.8125rem]">{profile.location}</dd>
          </div>
          {profile.resumePath ? (
            <div className="flex items-baseline justify-between gap-4 border-b border-rule px-4 py-3 last:border-b-0">
              <dt className="meta-label">Resume</dt>
              <dd>
                <a
                  href={profile.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-annotate font-mono text-[0.8125rem]"
                >
                  Download PDF
                </a>
              </dd>
            </div>
          ) : null}
          </dl>
        </div>
      </div>

      {/* ASK-000: the deterministic concierge (the joke IS the brand). */}
      <div className="mt-12">
        <AskConcierge facts={conciergeFacts} />
      </div>
    </section>
  );
}
