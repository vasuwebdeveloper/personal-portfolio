import type { Metadata } from "next";
import Link from "next/link";
import BlogExplorer from "@/components/blog/BlogExplorer";
import Pager from "@/components/blog/Pager";
import PostListRows from "@/components/blog/PostListRows";
import SectionHeading from "@/components/ui/SectionHeading";
import { paginatePosts, postDate } from "@/lib/blog";
import { getPosts, getSiteProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays on agentic AI for enterprise finance, from your first LLM API call to a production cost model you can reconcile.",
  alternates: { canonical: "/blog/" },
};

export default async function BlogIndexPage() {
  const [posts, profile] = await Promise.all([getPosts(), getSiteProfile()]);
  const slice = paginatePosts(posts, 1);
  const allTags = [...new Set(posts.flatMap((post) => post.tags))].sort();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `Writing · ${profile.name}`,
    url: `${profile.siteUrl}/blog/`,
    description: metadata.description,
    author: {
      "@type": "Person",
      name: profile.name,
      url: profile.siteUrl,
      sameAs: profile.links.map((link) => link.href),
    },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${profile.siteUrl}/blog/${post.slug}/`,
      datePublished: postDate(post),
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8">
      <script
        type="application/ld+json"
        // Static JSON derived from the content layer; no user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <SectionHeading code="4000" title="Writing" kicker="Index of record" />

      <p className="max-w-[62ch] text-lg leading-relaxed">
        Working notes from building agentic AI against real financial
        systems, written up as essays. New entries post here as the work
        ships.
      </p>

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
