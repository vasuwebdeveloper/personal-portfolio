import type { Finding } from "@/lib/nacha/types";
import { RECORD_LENGTH } from "@/lib/nacha/parse";

/**
 * Raw-record inspector: the 94-character line in monospace under a
 * character-position ruler, with the finding's field highlighted and
 * underlined by a caret row. Everything sits in one horizontally scrollable
 * block so the three rows can never drift out of alignment.
 */
export default function NachaLineInspector({
  rawLine,
  finding,
}: {
  rawLine: string;
  finding: Finding;
}) {
  const line = rawLine.padEnd(RECORD_LENGTH, " ");
  const start = Math.max(1, Math.min(finding.start, RECORD_LENGTH));
  const end = Math.max(start, Math.min(finding.end, RECORD_LENGTH));

  // Ruler rows: tens digits above, ones digits below, both 94 chars.
  let tens = "";
  let ones = "";
  for (let pos = 1; pos <= RECORD_LENGTH; pos++) {
    tens += pos % 10 === 0 ? String(Math.floor(pos / 10) % 10) : " ";
    ones += String(pos % 10);
  }

  const caret =
    " ".repeat(start - 1) + "^".repeat(end - start + 1);
  const isError = finding.severity === "error";

  return (
    <div className="mt-1 mb-4">
      <div className="overflow-x-auto border border-rule bg-paper">
        <div className="min-w-max px-4 py-3 font-mono text-[0.75rem] leading-5 whitespace-pre">
          <div aria-hidden="true" className="text-ink-muted/60 select-none">
            {tens}
          </div>
          <div aria-hidden="true" className="text-ink-muted/60 select-none">
            {ones}
          </div>
          <div>
            {line.slice(0, start - 1)}
            <mark
              className={
                isError
                  ? "bg-stamp/15 font-semibold text-stamp-deep"
                  : "bg-annotate/10 font-semibold text-annotate"
              }
            >
              {line.slice(start - 1, end)}
            </mark>
            {line.slice(end)}
          </div>
          <div
            aria-hidden="true"
            className={`select-none ${isError ? "text-stamp-deep" : "text-annotate"}`}
          >
            {caret}
          </div>
        </div>
      </div>
      <p className="meta-label mt-2">
        Line {finding.line} · {finding.field} · positions {finding.start}-
        {finding.end}
      </p>
    </div>
  );
}
