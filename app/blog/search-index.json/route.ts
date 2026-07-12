import { getPosts } from "@/lib/content";
import { postDate } from "@/lib/blog";

/**
 * Build-time search index for the writing index. Emitted as a static file
 * by the export (`force-static`), lazy-loaded by the client on first
 * interaction with the search box or tag chips.
 */
export const dynamic = "force-static";

export async function GET() {
  const posts = await getPosts();
  return Response.json(
    posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.summary,
      tags: post.tags,
      date: postDate(post).slice(0, 10),
      draft: post.status === "draft",
    })),
  );
}
