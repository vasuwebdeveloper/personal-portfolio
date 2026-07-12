"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

/**
 * Search + tag filtering for the writing index — progressive enhancement
 * over the statically rendered rows (passed in as children).
 *
 * The index JSON is generated at build time from the content layer and
 * fetched once, on the first interaction with the box or a chip. Matching
 * is plain case-insensitive substring across title, description, and tags:
 * at tens of posts, exact matching is predictable and debuggable in a way
 * fuzzy scoring is not — Fuse.js earns its bytes only when typo tolerance
 * across hundreds of entries starts to matter.
 */

interface IndexEntry {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  draft: boolean;
}

export default function BlogExplorer({
  tags,
  children,
}: {
  tags: string[];
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [index, setIndex] = useState<IndexEntry[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const fetching = useRef(false);

  function ensureIndex() {
    if (index || fetching.current) return;
    fetching.current = true;
    fetch("/blog/search-index.json")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: IndexEntry[]) => setIndex(data))
      .catch(() => {
        fetching.current = false;
        setLoadFailed(true);
      });
  }

  function toggleTag(tag: string) {
    ensureIndex();
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  const filtering = query.trim() !== "" || activeTags.length > 0;

  const results = useMemo(() => {
    if (!filtering || !index) return null;
    const q = query.trim().toLowerCase();
    return index.filter((entry) => {
      const tagPass =
        activeTags.length === 0 ||
        entry.tags.some((tag) => activeTags.includes(tag));
      if (!tagPass) return false;
      if (q === "") return true;
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [filtering, index, query, activeTags]);

  return (
    <div>
      {/* Locate controls */}
      <div className="mt-10 border border-rule">
        <div className="flex items-baseline gap-2 border-b border-rule px-4 py-2.5">
          <label
            htmlFor="blog-locate"
            className="font-mono text-[0.8125rem] text-stamp-deep"
            aria-label="Search the writing index"
          >
            &gt;
          </label>
          <input
            id="blog-locate"
            type="search"
            value={query}
            onFocus={ensureIndex}
            onChange={(e) => {
              ensureIndex();
              setQuery(e.target.value);
            }}
            placeholder="locate entries — title, summary, or tag"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-[0.8125rem] text-ink placeholder:text-ink-muted/60 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-baseline gap-2 px-4 py-2.5">
          <span className="meta-label mr-1">Filter</span>
          {tags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={active}
                onClick={() => toggleTag(tag)}
                className={`border px-2 py-0.5 font-mono text-[0.625rem] font-medium tracking-[0.12em] uppercase transition-colors ${
                  active
                    ? "border-stamp-deep text-stamp-deep"
                    : "border-rule text-ink-muted hover:border-rule-strong hover:text-ink"
                }`}
              >
                {tag}
              </button>
            );
          })}
          {filtering ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveTags([]);
              }}
              className="ml-auto font-mono text-[0.625rem] font-medium tracking-[0.12em] uppercase text-stamp-deep"
            >
              clear ×
            </button>
          ) : null}
        </div>
      </div>

      {/* Result set (filtering) or the static rows (default) */}
      {filtering ? (
        results ? (
          <div aria-live="polite">
            <p className="meta-label mt-6">
              {results.length} of {index?.length ?? 0} entries
            </p>
            {results.length > 0 ? (
              <div className="mt-4 border-t border-rule">
                {results.map((entry) => (
                  <article
                    key={entry.slug}
                    className="grid gap-x-12 gap-y-3 border-b border-rule py-7 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <h2 className="font-display text-xl font-semibold tracking-tight">
                        <Link
                          href={`/blog/${entry.slug}/`}
                          className="transition-colors hover:text-stamp-deep"
                        >
                          {entry.title}
                        </Link>
                      </h2>
                      <p className="mt-2 max-w-[72ch] text-[0.9375rem] leading-relaxed text-ink-muted">
                        {entry.description}
                      </p>
                      <p className="mt-3 font-mono text-[0.6875rem] tracking-[0.1em] uppercase text-ink-muted">
                        {entry.tags.join(" · ")}
                      </p>
                    </div>
                    <div className="md:pt-1">
                      {entry.draft ? (
                        <span className="stamp">In draft</span>
                      ) : (
                        <span className="font-mono text-[0.75rem] text-ink-muted">
                          {entry.date}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 border-t border-rule py-7 font-mono text-[0.8125rem] text-ink-muted">
                No entries match — clear the filters or try a tag like{" "}
                {tags.slice(0, 2).join(" or ")}.
              </p>
            )}
          </div>
        ) : (
          <p className="meta-label mt-6">
            {loadFailed ? "search index unavailable" : "loading index…"}
          </p>
        )
      ) : (
        <div className="mt-10">{children}</div>
      )}
    </div>
  );
}
