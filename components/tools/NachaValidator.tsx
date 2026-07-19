"use client";

import { useMemo, useRef, useState } from "react";
import NachaFindings from "@/components/tools/NachaFindings";
import NachaPaymentsTable from "@/components/tools/NachaPaymentsTable";
import { formatUsd, validateNachaFile } from "@/lib/nacha/parse";
import { SAMPLE_FILE_NAME, SAMPLE_NACHA_FILE } from "@/lib/nacha/sample";
import type { Severity, ValidationResult } from "@/lib/nacha/types";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * The NACHA validator, in full: input (drop zone, file picker, paste box,
 * bundled sample), then the report. Everything runs synchronously in the
 * browser; no network request ever carries file data.
 */
export default function NachaValidator() {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  function runValidation(text: string, name: string) {
    setInputError(null);
    setFileName(name);
    setResult(validateNachaFile(text));
    // Move the report into view; the aria-live region announces the outcome.
    requestAnimationFrame(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setInputError(
        `"${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB; the limit is 10 MB. NACHA files this large are usually something else entirely.`,
      );
      return;
    }
    file
      .text()
      .then((text) => runValidation(text, file.name))
      .catch(() => {
        setInputError(`Could not read "${file.name}". Try again, or paste the file contents instead.`);
      });
  }

  function handlePaste() {
    if (pasted.trim() === "") {
      setInputError("Paste the contents of a NACHA file first, then validate.");
      return;
    }
    if (pasted.length > MAX_FILE_BYTES) {
      setInputError("The pasted contents exceed the 10 MB limit.");
      return;
    }
    runValidation(pasted, "pasted contents");
  }

  function reset() {
    setResult(null);
    setFileName("");
    setInputError(null);
    setPasted("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const statusByLine = useMemo(() => {
    const map = new Map<number, Severity>();
    for (const f of result?.findings ?? []) {
      if (f.severity === "error" || map.get(f.line) !== "error") {
        map.set(f.line, f.severity);
      }
    }
    return map;
  }, [result]);

  const clean =
    result !== null &&
    result.stats.errorCount === 0 &&
    result.stats.warningCount === 0;

  return (
    <div>
      {/* ---- input ------------------------------------------------------ */}
      <div className="border border-rule">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`border-b px-5 py-10 text-center transition-colors sm:py-12 ${
            dragActive
              ? "border-stamp-deep bg-band/70"
              : "border-rule bg-band/30"
          }`}
        >
          <p className="meta-label">Drop a NACHA file here</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <input
              ref={fileInputRef}
              id="nacha-file-input"
              type="file"
              accept=".ach,.txt,.nacha,text/plain"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border border-stamp-deep px-5 py-2.5 font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-stamp-deep transition-colors hover:bg-stamp-deep hover:text-paper"
            >
              Choose file
            </button>
            <button
              type="button"
              onClick={() => runValidation(SAMPLE_NACHA_FILE, SAMPLE_FILE_NAME)}
              className="border border-ink-muted px-5 py-2.5 font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              Load sample file
            </button>
          </div>
          <p className="mt-5 font-mono text-[0.6875rem] tracking-[0.08em] text-ink-muted">
            .ach or .txt · max 10 MB · processed on this page, never uploaded
          </p>
        </div>

        <details>
          <summary className="meta-label cursor-pointer px-5 py-3 transition-colors hover:text-ink">
            Paste file contents instead
          </summary>
          <div className="px-5 pb-5">
            <label htmlFor="nacha-paste" className="sr-only">
              NACHA file contents
            </label>
            <textarea
              id="nacha-paste"
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={8}
              spellCheck={false}
              placeholder="101 987654320 1122334455…"
              className="w-full border border-rule bg-paper p-3 font-mono text-[0.75rem] leading-5 text-ink placeholder:text-ink-muted/50 focus:outline-none focus-visible:outline-2 focus-visible:outline-annotate"
            />
            <button
              type="button"
              onClick={handlePaste}
              className="mt-3 border border-stamp-deep px-5 py-2.5 font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-stamp-deep transition-colors hover:bg-stamp-deep hover:text-paper"
            >
              Validate pasted contents
            </button>
          </div>
        </details>
      </div>

      {inputError ? (
        <p
          role="alert"
          className="mt-4 border-l-2 border-stamp-deep bg-stamp/5 px-4 py-3 text-[0.9375rem] leading-relaxed"
        >
          {inputError}
        </p>
      ) : null}

      {/* Screen-reader announcement of each run's outcome. */}
      <p aria-live="polite" className="sr-only">
        {result
          ? clean
            ? `Validation complete for ${fileName}: no problems found.`
            : `Validation complete for ${fileName}: ${result.stats.errorCount} errors and ${result.stats.warningCount} warnings.`
          : ""}
      </p>

      {/* ---- report ----------------------------------------------------- */}
      {result ? (
        <div ref={reportRef} className="mt-10 scroll-mt-8">
          <div className="rule-total flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 py-3">
            <span className="meta-label">
              Validation report ·{" "}
              <span className="text-ink normal-case tracking-[0.06em]">
                {fileName}
              </span>
            </span>
            <button
              type="button"
              onClick={reset}
              className="font-mono text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-stamp-deep transition-colors hover:text-ink"
            >
              Validate another file ×
            </button>
          </div>

          {/* Summary tiles */}
          <dl className="mt-6 grid grid-cols-2 gap-px border border-rule bg-rule lg:grid-cols-4">
            <SummaryTile
              label="Errors"
              value={String(result.stats.errorCount)}
              tone={result.stats.errorCount > 0 ? "error" : "ok"}
            />
            <SummaryTile
              label="Warnings"
              value={String(result.stats.warningCount)}
              tone={result.stats.warningCount > 0 ? "warning" : "ok"}
            />
            <SummaryTile
              label="Payments"
              value={String(result.stats.paymentCount)}
              tone="neutral"
            />
            <SummaryTile
              label="File total"
              value={formatUsd(result.stats.totalCents)}
              tone="neutral"
            />
          </dl>

          {clean ? (
            <div className="mt-8 border border-rule-strong bg-band px-6 py-6">
              <p className="font-mono text-[0.8125rem] font-semibold tracking-[0.14em] uppercase">
                ✓ No problems found
              </p>
              <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-relaxed">
                All {result.stats.recordCount} records passed every check:
                structure, header fields, routing check digits, amounts, and
                the batch and file control totals all reconcile. Run your
                bank's own validation before submitting; this pre-flight can't
                see their account-level rules.
              </p>
            </div>
          ) : null}

          {result.payments.length > 0 ? (
            <NachaPaymentsTable
              payments={result.payments}
              statusByLine={statusByLine}
            />
          ) : null}

          {result.findings.length > 0 ? (
            <NachaFindings findings={result.findings} lines={result.lines} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "error" | "warning" | "ok" | "neutral";
}) {
  return (
    <div className="bg-paper px-4 py-4">
      <dt className="meta-label">{label}</dt>
      <dd
        className={`mt-1.5 font-mono text-2xl font-semibold tabular-nums ${
          tone === "error"
            ? "text-stamp-deep"
            : tone === "warning"
              ? "text-annotate"
              : "text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
