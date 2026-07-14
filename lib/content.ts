/**
 * Content accessor: the ONLY module allowed to import from /content.
 *
 * Components call these functions and never touch the data files, so moving
 * to a database later means swapping the internals here for Prisma queries
 * (e.g. `prisma.post.findMany(...)`) and nothing else. Every accessor is
 * async for exactly that reason, even though today's data is in-memory.
 */
import fs from "node:fs";
import path from "node:path";
import { certifications } from "@/content/certifications";
import { flagshipCaseStudy } from "@/content/flagship";
import { posts } from "@/content/posts";
import { siteProfile } from "@/content/site";
import { skillPillars } from "@/content/skills";
import type {
  CaseStudy,
  Certification,
  Post,
  SiteProfile,
  SkillPillar,
} from "@/content/types";

export async function getSiteProfile(): Promise<SiteProfile> {
  return {
    ...siteProfile,
    // Hide resume links (hero, contact, footer) until the PDF actually
    // exists in /public (no dead downloads). Runs at build time only.
    resumePath:
      siteProfile.resumePath && resumeExists(siteProfile.resumePath)
        ? siteProfile.resumePath
        : null,
  };
}

function resumeExists(publicPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", publicPath));
}

export async function getFlagshipCaseStudy(): Promise<CaseStudy> {
  return {
    ...flagshipCaseStudy,
    agents: [...flagshipCaseStudy.agents].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    ),
  };
}

export async function getSkillPillars(): Promise<SkillPillar[]> {
  return [...skillPillars].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCertifications(): Promise<Certification[]> {
  return [...certifications].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** All posts, newest first. Drafts included; the UI decides how to render them. */
export async function getPosts(): Promise<Post[]> {
  return [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  return posts.find((post) => post.slug === slug) ?? null;
}

/** Derived, not stored; stays valid when posts move to a database. */
export function estimateReadingMinutes(post: Post): number {
  const words = post.body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
