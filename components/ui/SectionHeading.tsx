/**
 * Ledger-style section heading: GL account code, rule, and title.
 * e.g.  ACCT 2000 ──────────────────────────────  Capabilities
 */
export default function SectionHeading({
  code,
  title,
  kicker,
}: {
  /** GL-style account code, e.g. "2000". */
  code: string;
  title: string;
  /** Optional mono kicker rendered above the title. */
  kicker?: string;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-4">
        <span className="meta-label shrink-0 text-stamp-deep">
          Acct {code}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-rule" />
        {kicker ? <span className="meta-label text-right">{kicker}</span> : null}
      </div>
      <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
    </div>
  );
}
