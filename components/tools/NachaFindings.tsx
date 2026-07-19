"use client";

import { useState } from "react";
import NachaLineInspector from "@/components/tools/NachaLineInspector";
import { NETSUITE_HINTS } from "@/lib/nacha/netsuite-hints";
import type { Finding, Severity } from "@/lib/nacha/types";

/** Keep the DOM sane on pathological files; the counts stay honest. */
const MAX_SHOWN_PER_SEVERITY = 150;

/**
 * Findings grouped by severity. Each finding is a disclosure: clicking it
 * opens the line inspector on the offending record. A "Fix in NetSuite"
 * annotation renders under every finding whose code has a hint; codes
 * without hints simply have no box.
 */
export default function NachaFindings({
  findings,
  lines,
}: {
  findings: Finding[];
  lines: string[];
}) {
  const errors = findings.filter((f) => f.severity === "error");
  const warnings = findings.filter((f) => f.severity === "warning");

  return (
    <div>
      {([
        ["error", errors],
        ["warning", warnings],
      ] as const)
        .filter(([, group]) => group.length > 0)
        .map(([severity, group]) => (
          <FindingGroup
            key={severity}
            severity={severity}
            findings={group}
            lines={lines}
          />
        ))}
    </div>
  );
}

function FindingGroup({
  severity,
  findings,
  lines,
}: {
  severity: Severity;
  findings: Finding[];
  lines: string[];
}) {
  const isError = severity === "error";
  const shown = findings.slice(0, MAX_SHOWN_PER_SEVERITY);

  return (
    <section className="mt-8">
      <h3
        className={`meta-label ${isError ? "text-stamp-deep" : "text-annotate"}`}
      >
        {isError ? "✗ Errors" : "△ Warnings"} ({findings.length})
      </h3>
      <ul className="mt-3 border-t border-rule">
        {shown.map((finding, i) => (
          <FindingRow
            key={`${finding.code}-${finding.line}-${finding.start}-${i}`}
            finding={finding}
            rawLine={lines[finding.line - 1] ?? ""}
          />
        ))}
      </ul>
      {findings.length > shown.length ? (
        <p className="mt-3 font-mono text-[0.75rem] text-ink-muted">
          …and {findings.length - shown.length} more{" "}
          {isError ? "errors" : "warnings"} not shown.
        </p>
      ) : null}
    </section>
  );
}

function FindingRow({
  finding,
  rawLine,
}: {
  finding: Finding;
  rawLine: string;
}) {
  const [open, setOpen] = useState(false);
  const hint = NETSUITE_HINTS[finding.code];
  const isError = finding.severity === "error";

  return (
    <li className="border-b border-rule">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid w-full grid-cols-[1fr_auto] items-baseline gap-x-4 py-3.5 text-left transition-colors hover:bg-band/50"
      >
        <span>
          <span className="block text-[0.9375rem] leading-relaxed">
            {finding.message}
          </span>
          <span
            className={`mt-1.5 block font-mono text-[0.6875rem] font-medium tracking-[0.1em] uppercase ${
              isError ? "text-stamp-deep" : "text-annotate"
            }`}
          >
            {isError ? "✗" : "△"} {finding.code} · line {finding.line} ·{" "}
            {finding.field}
          </span>
        </span>
        <span className="meta-label transition-colors group-hover:text-ink">
          {open ? "Close ×" : "Inspect line →"}
        </span>
      </button>

      {open ? (
        <NachaLineInspector rawLine={rawLine} finding={finding} />
      ) : null}

      {hint ? (
        <div className="mb-4 border-l-2 border-annotate bg-band/50 py-3 pr-4 pl-4">
          <p className="font-mono text-[0.6875rem] font-medium tracking-[0.14em] text-annotate uppercase">
            Fix in NetSuite
          </p>
          <p className="mt-1.5 max-w-[72ch] text-[0.9375rem] leading-relaxed">
            {hint}
          </p>
        </div>
      ) : null}
    </li>
  );
}
