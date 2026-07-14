import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogExplorer from "@/components/blog/BlogExplorer";
import Pager from "@/components/blog/Pager";
import PostListRows from "@/components/blog/PostListRows";
import SectionHeading from "@/components/ui/SectionHeading";
import { paginatePosts, POSTS_PER_PAGE } from "@/lib/blog";
import { getPosts } from "@/lib/content";

/**
 * Index pages 2..N; /blog/ is page 1. `output: export` requires at least
 * one generated param, so while everything fits on one page this route
 * emits /blog/page/1/ as a twin of /blog/ whose canonical points there;
 * from two pages onward it emits 2..N as designed.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  if (totalPages === 1) return [{ n: "1" }];
  return Array.from({ length: totalPages - 1 }, (_, i) => ({
    n: String(i + 2),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `Writing · page ${n}`,
    description:
      "Essays on agentic AI for enterprise finance: RAG internals, real LLM cost models, and wiring AI agents into NetSuite over MCP.",
    // Page 1 is an alias of /blog/, so canonicalize it there.
    alternates: { canonical: n === "1" ? "/blog/" : `/blog/page/${n}/` },
  };
}

export default async function BlogIndexPageN({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const page = Number(n);
  const posts = await getPosts();
  const slice = paginatePosts(posts, page);
  if (!Number.isInteger(page) || page < 1 || page > slice.totalPages) {
    notFound();
  }
  const allTags = [...new Set(posts.flatMap((post) => post.tags))].sort();

  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
      <SectionHeading code="4000" title="Writing" kicker="Index of record" />

      <BlogExplorer tags={allTags}>
        <PostListRows posts={slice.posts} />
      </BlogExplorer>

      <Pager slice={slice} />

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
