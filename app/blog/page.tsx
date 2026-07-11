import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays on agentic AI for enterprise finance — RAG internals, real LLM cost models, and wiring AI agents into NetSuite over MCP.",
  alternates: { canonical: "/blog/" },
};

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
      <SectionHeading code="4000" title="Writing" kicker="Index of record" />

      <p className="max-w-[62ch] text-lg leading-relaxed">
        Writing is coming soon. These are the drafts on the desk — working
        notes from building agentic AI against real financial systems, posted
        here as they become essays.
      </p>

      <div className="mt-10 border-t border-rule">
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
                  {post.publishedAt?.slice(0, 10)}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8">
        <Link
          href="/"
          className="font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep"
        >
          ← Back to the ledger
        </Link>
      </p>
    </div>
  );
}
