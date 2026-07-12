import type { MetadataRoute } from "next";
import { POSTS_PER_PAGE } from "@/lib/blog";
import { getPosts, getSiteProfile } from "@/lib/content";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profile = await getSiteProfile();
  const posts = await getPosts();
  const base = profile.siteUrl.replace(/\/$/, "");
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/blog/`, changeFrequency: "weekly", priority: 0.8 },
    // Index pages 2..N only — /blog/page/1/ canonicalizes to /blog/.
    ...Array.from({ length: totalPages - 1 }, (_, i) => ({
      url: `${base}/blog/page/${i + 2}/`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}/`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
