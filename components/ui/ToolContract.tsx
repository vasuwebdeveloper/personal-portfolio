/**
 * Fig. 03 — one MCP tool contract, shown in the shape the system actually
 * enumerates them. Hand-tinted spans in the site's own palette; no
 * syntax-highlighting dependency.
 */

const K = "text-annotate"; // property / field names — ballpoint annotation ink
const T = "text-stamp-deep"; // types — the AI signal layer owns the contract
const C = "text-ink-muted"; // comments

export default function ToolContract() {
  return (
    <figure className="m-0 mt-12">
      <div className="overflow-x-auto border border-rule bg-band/40">
        <pre className="px-5 py-4 font-mono text-[0.8125rem] leading-relaxed text-ink">
          <code>
            <span className={C}>{"// enumerable capability — typed MCP tool contract"}</span>
            {"\n"}
            <span className="font-semibold">tool</span> get_invoice_aging{" {"}
            {"\n  "}
            <span className={K}>input</span>
            {": {"}
            {"\n    "}
            <span className={K}>days_past_due</span>: <span className={T}>number</span>
            {"      "}
            <span className={C}>{"// ≥ 0"}</span>
            {"\n    "}
            <span className={K}>subsidiary?</span>: <span className={T}>string</span>
            {"        "}
            <span className={C}>{"// default: all subsidiaries"}</span>
            {"\n    "}
            <span className={K}>limit?</span>: <span className={T}>number</span>
            {"             "}
            <span className={C}>{"// rows, default 50"}</span>
            {"\n  }"}
            {"\n  "}
            <span className={K}>output</span>
            {": {"}
            {"\n    "}
            <span className={K}>rows</span>: <span className={T}>InvoiceAgingRow[]</span>
            {"    "}
            <span className={C}>{"// typed rows, never free text"}</span>
            {"\n    "}
            <span className={K}>total_exposure</span>: <span className={T}>Money</span>
            {"\n    "}
            <span className={K}>as_of</span>: <span className={T}>Timestamp</span>
            {"        "}
            <span className={C}>{"// live ERP read, not an export"}</span>
            {"\n  }"}
            {"\n}"}
          </code>
        </pre>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="meta-label text-stamp-deep">Fig. 03</span>
        <span className="font-mono text-[0.6875rem] tracking-[0.06em] text-ink-muted">
          get_invoice_aging — one of the system&apos;s enumerable MCP tool
          contracts
        </span>
      </figcaption>
    </figure>
  );
}
