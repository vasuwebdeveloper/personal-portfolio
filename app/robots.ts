import type { MetadataRoute } from "next";
import { getSiteProfile } from "@/lib/content";

export const dynamic = "force-static";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const profile = await getSiteProfile();
  const base = profile.siteUrl.replace(/\/$/, "");

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
