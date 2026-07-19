import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PostBody from "@/components/blog/PostBody";
import ShareRow from "@/components/blog/ShareRow";
import Toc from "@/components/blog/Toc";
import JsonLd from "@/components/ui/JsonLd";
import {
  extractH2s,
  formatDate,
  postDate,
  relatedPosts,
  wasUpdated,
} from "@/lib/blog";
import {
  estimateReadingMinutes,
  getPostBySlug,
  getPosts,
  getSiteProfile,
} from "@/lib/content";
import { blogPostingSchema } from "@/lib/schema";

/**
 * Statically generated from the content layer. When the site moves to a
 * database, these params come from Prisma instead; the route code is
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
  const profile = await getSiteProfile();
  const images = post.banner ? [{ url: post.banner.src }] : undefined;
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: {
      type: "article",
      // Explicit og:url: LinkedIn re-canonicalizes shares to this tag, so
      // without it a share can resolve to the site root instead of the post.
      url: `/blog/${post.slug}/`,
      siteName: `${profile.name} · NetSuite Architect`,
      title: post.title,
      description: post.summary,
      authors: [profile.name],
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
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

  const [posts, profile] = await Promise.all([getPosts(), getSiteProfile()]);
  const postUrl = `${profile.siteUrl}/blog/${post.slug}/`;
  const headings = extractH2s(post.body);
  const showToc = headings.length >= 3;
  const related = relatedPosts(post, posts);
  const index = posts.findIndex((p) => p.id === post.id);
  const newer = index > 0 ? posts[index - 1] : null;
  const older = index < posts.length - 1 ? posts[index + 1] : null;
  const linkedIn = profile.links.find((l) => l.label === "LinkedIn");

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 sm:px-8 sm:pt-16">
      <JsonLd data={blogPostingSchema(post, profile)} />

      <div
        className={
          showToc
            ? "lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-x-14"
            : ""
        }
      >
        <article className="max-w-[70ch]">
          {/* Banner plate, also the post's Open Graph card. Decorative here:
              the title it carries is the h1 right below. */}
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
            <p className="meta-label text-stamp-deep">
              Writing / {post.tags[0]}
            </p>
            {post.status === "draft" ? (
              <span className="stamp stamp-tilt">In draft</span>
            ) : null}
          </div>

          <h1 className="font-display mt-5 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
            {post.title}
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-ink-muted">
            {post.summary}
          </p>

          {/* Document control block: the entry's own totals row. */}
          <div className="rule-total mt-7 flex flex-wrap items-baseline gap-x-6 gap-y-2 py-3">
            <span className="meta-label">
              {post.status === "draft" ? "Drafted" : "Posted"}{" "}
              <time
                dateTime={postDate(post)}
                className="text-ink normal-case tracking-[0.06em]"
              >
                {formatDate(postDate(post))}
              </time>
            </span>
            {wasUpdated(post) ? (
              <span className="meta-label">
                Updated{" "}
                <time
                  dateTime={post.updatedAt}
                  className="text-ink normal-case tracking-[0.06em]"
                >
                  {formatDate(post.updatedAt)}
                </time>
              </span>
            ) : null}
            <span className="meta-label">
              ~{estimateReadingMinutes(post)} min read
            </span>
            <span className="ml-auto">
              <ShareRow url={postUrl} title={post.title} />
            </span>
          </div>

          {/* Contents: inline on small screens, aside on large. */}
          {showToc ? (
            <div className="mt-8 border-b border-rule pb-8 lg:hidden">
              <Toc entries={headings} />
            </div>
          ) : null}

          <div className="mt-8">
            <PostBody markdown={post.body} />
          </div>

          <p className="mt-10 font-mono text-[0.6875rem] tracking-[0.1em] uppercase text-ink-muted">
            {post.tags.join(" · ")}
          </p>

          {/* Filed by: compact author card */}
          <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border border-rule px-5 py-4">
            <div className="max-w-[52ch]">
              <p className="meta-label">Filed by</p>
              <p className="mt-1.5 font-mono text-sm font-semibold tracking-[0.1em] uppercase">
                {profile.name}
              </p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-muted">
                {profile.identity}
              </p>
            </div>
            {linkedIn ? (
              <a
                href={linkedIn.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-annotate font-mono text-[0.8125rem]"
              >
                LinkedIn
              </a>
            ) : null}
          </div>

          {/* Related entries: shared tags only; absent when nothing shares. */}
          {related.length > 0 ? (
            <div className="mt-12">
              <p className="meta-label text-stamp-deep">Related entries</p>
              <ul className="mt-3 border-t border-rule">
                {related.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule py-3.5"
                  >
                    <Link
                      href={`/blog/${r.slug}/`}
                      className="font-display font-semibold tracking-tight transition-colors hover:text-stamp-deep"
                    >
                      {r.title}
                    </Link>
                    <span className="font-mono text-[0.6875rem] tracking-[0.1em] uppercase text-ink-muted">
                      {r.tags.filter((t) => post.tags.includes(t)).join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Newer / older navigation */}
          <nav
            aria-label="Adjacent posts"
            className="mt-12 grid gap-6 border-t border-rule pt-6 sm:grid-cols-2"
          >
            <div>
              {newer ? (
                <>
                  <p className="meta-label">← Newer entry</p>
                  <Link
                    href={`/blog/${newer.slug}/`}
                    className="mt-1.5 inline-block font-display font-semibold tracking-tight transition-colors hover:text-stamp-deep"
                  >
                    {newer.title}
                  </Link>
                </>
              ) : null}
            </div>
            <div className="sm:text-right">
              {older ? (
                <>
                  <p className="meta-label">Older entry →</p>
                  <Link
                    href={`/blog/${older.slug}/`}
                    className="mt-1.5 inline-block font-display font-semibold tracking-tight transition-colors hover:text-stamp-deep"
                  >
                    {older.title}
                  </Link>
                </>
              ) : null}
            </div>
          </nav>

          <p className="mt-12">
            <Link
              href="/blog/"
              className="font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep"
            >
              ← All writing
            </Link>
          </p>
        </article>

        {showToc ? (
          <aside className="hidden lg:block">
            <div className="sticky top-10">
              <Toc entries={headings} />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
