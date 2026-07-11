import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostBody from "@/components/blog/PostBody";
import {
  estimateReadingMinutes,
  getPostBySlug,
  getPosts,
} from "@/lib/content";

/**
 * Statically generated from the content layer. When the site moves to a
 * database, these params come from Prisma instead — the route code is
 * already runtime-agnostic.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const images = post.banner ? [{ url: post.banner.src }] : undefined;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: images?.map((image) => image.url),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 pt-12 sm:px-8 sm:pt-16">
      {/* Banner plate — also the post's Open Graph card */}
      {post.banner ? (
        <figure className="mb-10 border border-rule">
          <img
            src={post.banner.src}
            alt=""
            width={post.banner.width}
            height={post.banner.height}
            className="block h-auto w-full"
          />
        </figure>
      ) : null}

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="meta-label text-stamp-deep">Writing / {post.tags[0]}</p>
        <p className="flex items-baseline gap-4">
          <span className="font-mono text-[0.6875rem] tracking-[0.1em] uppercase text-ink-muted">
            ~{estimateReadingMinutes(post)} min
          </span>
          {post.status === "draft" ? (
            <span className="stamp stamp-tilt">In draft</span>
          ) : (
            <span className="font-mono text-[0.75rem] text-ink-muted">
              {post.publishedAt?.slice(0, 10)}
            </span>
          )}
        </p>
      </div>

      <h1 className="font-display mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
        {post.title}
      </h1>

      <p className="mt-4 max-w-[64ch] text-lg leading-relaxed text-ink-muted">
        {post.summary}
      </p>

      <div className="mt-8 border-t border-rule pt-8">
        <PostBody markdown={post.body} />
      </div>

      <p className="mt-6 font-mono text-[0.6875rem] tracking-[0.1em] uppercase text-ink-muted">
        {post.tags.join(" · ")}
      </p>

      <p className="mt-12">
        <Link
          href="/blog/"
          className="font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep"
        >
          ← All writing
        </Link>
      </p>
    </article>
  );
}
