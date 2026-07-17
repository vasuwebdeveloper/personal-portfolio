import { getPosts, getSiteProfile } from "@/lib/content";

/**
 * RSS 2.0 feed, generated at build time from the content layer and emitted
 * as a static file by the export.
 *
 * Published posts only. getPosts() already excludes drafts site-wide; the
 * publishedAt filter below is belt and suspenders for the feed, which must
 * never carry an undated item. Validly empty until the first post ships.
 */
export const dynamic = "force-static";

function esc(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const [posts, profile] = await Promise.all([getPosts(), getSiteProfile()]);
  const base = profile.siteUrl;
  const published = posts.filter(
    (post) => post.status === "published" && post.publishedAt,
  );

  const items = published
    .map(
      (post) => `    <item>
      <title>${esc(post.title)}</title>
      <link>${base}/blog/${post.slug}/</link>
      <guid isPermaLink="true">${base}/blog/${post.slug}/</guid>
      <pubDate>${new Date(post.publishedAt as string).toUTCString()}</pubDate>
      <description>${esc(post.summary)}</description>
${post.tags.map((tag) => `      <category>${esc(tag)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  const newest = posts
    .map((post) => post.updatedAt)
    .sort()
    .at(-1);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(`Writing · ${profile.name}`)}</title>
    <link>${base}/blog/</link>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>${esc(
      "Essays on agentic AI for enterprise finance, from your first LLM API call to a production cost model you can reconcile.",
    )}</description>
    <language>en</language>
${newest ? `    <lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
