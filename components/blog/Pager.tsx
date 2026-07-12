import Link from "next/link";
import type { PageSlice } from "@/lib/blog";

const linkClass =
  "font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep";
// Layout placeholder for an absent direction — keeps the ledger line
// centered without painting low-contrast "disabled" text.
const disabledClass =
  "invisible font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase";

/** Ledger-styled pagination: "Page 2 of 3 · entries 11–20 of 24". */
export default function Pager({ slice }: { slice: PageSlice }) {
  const { page, totalPages, firstEntry, lastEntry, total } = slice;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-rule pt-4"
    >
      {page > 1 ? (
        <Link
          href={page === 2 ? "/blog/" : `/blog/page/${page - 1}/`}
          className={linkClass}
        >
          ← Prev
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden="true">
          ← Prev
        </span>
      )}
      <span className="meta-label">
        Page {page} of {totalPages} · entries {firstEntry}–{lastEntry} of{" "}
        {total}
      </span>
      {page < totalPages ? (
        <Link href={`/blog/page/${page + 1}/`} className={linkClass}>
          Next →
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden="true">
          Next →
        </span>
      )}
    </nav>
  );
}
