import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Post } from "@/content/types";

export default function WritingTeaser({ posts }: { posts: Post[] }) {
  return (
    <section
      id="writing"
      className="mx-auto max-w-6xl scroll-mt-8 px-5 pt-20 sm:px-8"
    >
      <SectionHeading code="4000" title="Writing" kicker="Ledger of drafts" />

      <div className="border-t border-rule">
        {posts.map((post) => (
          <article
            key={post.id}
            className="grid gap-x-12 gap-y-3 border-b border-rule py-6 md:grid-cols-[1fr_auto]"
          >
            <div>
              <h3 className="font-display text-lg font-semibold tracking-tight">
                <Link
                  href={`/blog/${post.slug}/`}
                  className="transition-colors hover:text-stamp-deep"
                >
                  {post.title}
                </Link>
              </h3>
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
                  {post.publishedAt?.slice(0, 10)}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-6">
        <Link
          href="/blog/"
          className="font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-stamp-deep transition-colors hover:text-ink"
        >
          Full writing index →
        </Link>
      </p>
    </section>
  );
}
