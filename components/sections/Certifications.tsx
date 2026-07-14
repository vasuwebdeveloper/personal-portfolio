import SectionHeading from "@/components/ui/SectionHeading";
import type { Certification } from "@/content/types";

export default function Certifications({
  certifications,
}: {
  certifications: Certification[];
}) {
  return (
    <section
      id="certifications"
      className="mx-auto max-w-6xl scroll-mt-8 px-5 pt-20 sm:px-8"
    >
      <SectionHeading
        code="3000"
        title="Certifications"
        kicker="Registered credentials"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px] border-collapse text-left">
          <thead>
            <tr className="border-y border-rule">
              <th scope="col" className="meta-label py-2.5 pr-4 w-20">
                No.
              </th>
              <th scope="col" className="meta-label py-2.5 pr-4">
                Credential
              </th>
              <th scope="col" className="meta-label py-2.5 pr-4">
                Issuer
              </th>
              <th scope="col" className="meta-label py-2.5 pr-4 w-20">
                Year
              </th>
              {/* `relative` keeps the absolutely-positioned sr-only text inside
                  the scroll container; without it the span escapes clipping
                  and stretches the page horizontally on small screens. */}
              <th scope="col" className="meta-label py-2.5 w-28 relative">
                <span className="sr-only">Featured</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {certifications.map((cert, i) => (
              <tr
                key={cert.id}
                className={`border-b border-rule ${i % 2 === 1 ? "bg-band/60" : ""}`}
              >
                <td className="py-3 pr-4 font-mono text-[0.75rem] text-ink-muted">
                  {`3${String((i + 1) * 100).padStart(3, "0")}`}
                </td>
                <td className="py-3 pr-4 text-[0.9375rem] font-medium">
                  {cert.title}
                </td>
                <td className="py-3 pr-4 text-[0.875rem] text-ink-muted">
                  {cert.issuer}
                </td>
                <td className="py-3 pr-4 font-mono text-[0.8125rem]">
                  {cert.earnedYear ?? "-"}
                </td>
                <td className="py-3">
                  {cert.featured ? (
                    <span className="stamp stamp-tilt">Featured</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
