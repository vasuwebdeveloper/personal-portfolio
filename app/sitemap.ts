import type { MetadataRoute } from "next";
import { getPosts, getSiteProfile } from "@/lib/content";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const profile = await getSiteProfile();
  const posts = await getPosts();
  const base = profile.siteUrl.replace(/\/$/, "");

  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/blog/`, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}/`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
