import Link from "next/link";
import type { Post } from "@/content/types";
import { formatDate, postDate } from "@/lib/blog";

/**
 * The static index rows: the page's real content, rendered at build time.
 * BlogExplorer swaps these for client-filtered rows only while a search
 * query or tag filter is active.
 */
export default function PostListRows({ posts }: { posts: Post[] }) {
  return (
    <div className="border-t border-rule">
      {posts.map((post) => (
        <article
          key={post.id}
          className="grid gap-x-12 gap-y-3 border-b border-rule py-7 md:grid-cols-[1fr_auto]"
        >
          <div>
            <h2 className="font-display text-xl font-semibold tracking-tight">
              <Link
                href={`/blog/${post.slug}/`}
                className="transition-colors hover:text-stamp-deep"
              >
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 max-w-[72ch] text-[0.9375rem] leading-relaxed text-ink-muted">
              {post.summary}
            </p>
            <p className="mt-3 font-mono text-[0.6875rem] tracking-[0.1em] uppercase text-ink-muted">
              {post.tags.join(" · ")}
            </p>
          </div>
          <div className="md:pt-1">
            {post.status === "draft" ? (
              <span className="stamp">In draft</span>
            ) : (
              <span className="font-mono text-[0.75rem] text-ink-muted">
                {formatDate(postDate(post))}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
