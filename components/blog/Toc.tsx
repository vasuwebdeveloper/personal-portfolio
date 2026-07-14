import type { TocEntry } from "@/lib/blog";

/**
 * Table of contents: the essay's H2 spine as a ledger contents column.
 * Rendered only when the post has 3+ H2s; the page decides placement
 * (inline on mobile, sticky aside on wide screens).
 */
export default function Toc({ entries }: { entries: TocEntry[] }) {
  return (
    <nav aria-label="Contents">
      <p className="meta-label text-stamp-deep">Contents</p>
      <ol className="mt-3 space-y-2 border-l border-rule pl-4">
        {entries.map((entry, i) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="group flex items-baseline gap-2.5 font-mono text-[0.8125rem] leading-snug text-ink-muted transition-colors hover:text-stamp-deep"
            >
              <span className="text-[0.625rem] tracking-[0.1em]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{entry.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
