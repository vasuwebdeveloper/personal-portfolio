import type { Post } from "@/content/types";

/**
 * Blog presentation helpers: pure functions over content-layer rows.
 * No imports from /content: everything arrives as arguments, so these stay
 * valid unchanged when the data moves to a database.
 */

export const POSTS_PER_PAGE = 10;

/** Anchor ids for headings must match between the ToC and the rendered
 * heading, so both sides use this one function. */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export interface TocEntry {
  id: string;
  text: string;
}

/** H2s only: the ToC mirrors the essay's top-level structure, not every
 * ledger-label subhead. */
export function extractH2s(markdown: string): TocEntry[] {
  return [...markdown.matchAll(/^## +(.+?)\s*$/gm)].map((match) => {
    const text = match[1].replace(/[*_`]/g, "");
    return { id: slugifyHeading(text), text };
  });
}

/** A post's public date: published if it has one, else the filing date. */
export function postDate(post: Post): string {
  return post.publishedAt ?? post.createdAt;
}

/** Ledger-style date: the ISO day, machine-readable at a glance. */
export function formatDate(iso: string): string {
  return iso.slice(0, 10);
}

/** Show the updated stamp only when it says something the posted date
 * doesn't. */
export function wasUpdated(post: Post): boolean {
  return formatDate(post.updatedAt) !== formatDate(postDate(post));
}

export interface PageSlice {
  posts: Post[];
  page: number;
  totalPages: number;
  /** 1-based entry numbers for the ledger line ("entries 11-20"). */
  firstEntry: number;
  lastEntry: number;
  total: number;
}

export function paginatePosts(posts: Post[], page: number): PageSlice {
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const start = (page - 1) * POSTS_PER_PAGE;
  return {
    posts: posts.slice(start, start + POSTS_PER_PAGE),
    page,
    totalPages,
    firstEntry: total === 0 ? 0 : start + 1,
    lastEntry: Math.min(start + POSTS_PER_PAGE, total),
    total,
  };
}

/** Up to `max` related posts ranked by shared-tag count, then recency. */
export function relatedPosts(post: Post, all: Post[], max = 3): Post[] {
  const tags = new Set(post.tags);
  return all
    .filter((other) => other.id !== post.id)
    .map((other) => ({
      other,
      shared: other.tags.filter((tag) => tags.has(tag)).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        postDate(b.other).localeCompare(postDate(a.other)),
    )
    .slice(0, max)
    .map((entry) => entry.other);
}
