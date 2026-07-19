/**
 * Content-layer types.
 *
 * Every interface here is deliberately shaped like a future database table
 * (stable `id`, `slug`, timestamps, `sortOrder`) so the static data files in
 * /content can later be replaced by Prisma models without touching any
 * component. Components never import these data files directly; they go
 * through lib/content.ts, which is the single seam for that migration.
 */

/** Row shape for a future `posts` table. */
export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /**
   * Markdown body. Supports headings (## / ###), lists, links, blockquotes,
   * inline `code`, fenced code blocks, tables (GFM), bold/italics, and `---`
   * rules, all styled to the design system by components/blog/PostBody.tsx.
   */
  body: string;
  tags: string[];
  status: "draft" | "published";
  /**
   * Banner plate shown at the top of the post page; also used as the post's
   * Open Graph image. Generate an on-brand one with:
   *   npm run generate:banner -- <slug> "<title>" "<TAG · TAG>"
   * Null = no banner (post still renders fine).
   */
  banner: {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null;
  publishedAt: string | null; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/** Row shape for a future `skill_pillars` table. */
export interface SkillPillar {
  id: string;
  slug: string;
  /** Ledger-style account code used as the visual index, e.g. "2100". */
  code: string;
  title: string;
  /** One-sentence architect framing for the pillar. */
  thesis: string;
  items: string[];
  sortOrder: number;
}

/** Row shape for a future `certifications` table. */
export interface Certification {
  id: string;
  slug: string;
  title: string;
  issuer: string;
  earnedYear: number | null;
  /** Featured rows get the vermilion stamp treatment in the UI. */
  featured: boolean;
  sortOrder: number;
}

/** Row shape for a future `agents` table (children of a case study). */
export interface AgentSpec {
  id: string;
  slug: string;
  /** Full name, e.g. "AR Agent". */
  name: string;
  /** Short schematic label, e.g. "AR". */
  label: string;
  domain: string;
  responsibilities: string;
  sortOrder: number;
}

/** A canned natural-language query used by the routing schematic. */
export interface ExampleQuery {
  id: string;
  prompt: string;
  /** Slugs of the agents this query routes to. */
  targetAgentSlugs: string[];
}

/** Row shape for a future `case_studies` table. */
export interface CaseStudy {
  id: string;
  slug: string;
  /** Document code shown in the UI, e.g. "SYS-001". */
  code: string;
  title: string;
  subtitle: string;
  /** Paragraphs separated by blank lines. */
  problem: string;
  approach: string;
  guardrails: string;
  stack: string[];
  agents: AgentSpec[];
  exampleQueries: ExampleQuery[];
  /** Outcome/metrics copy. Null until provided. */
  outcomes: string | null;
}

/** Row shape for a future `tools` table. */
export interface Tool {
  id: string;
  slug: string;
  /** Document code shown in the UI, e.g. "TOOL-001". */
  code: string;
  title: string;
  /** One-line description for the index card and metadata. */
  description: string;
  status: "live" | "coming-soon";
  sortOrder: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
}

/** Singleton profile: a future `site_profile` table with one row. */
export interface SiteProfile {
  name: string;
  role: string;
  /** One-line identity used in the hero and metadata. */
  identity: string;
  /** The hero thesis line. */
  thesis: string;
  /** Alternate thesis lines, kept for future rotation. */
  thesisAlternates: string[];
  /** The working vocabulary that shapes copy and design. */
  focus: string[];
  location: string;
  email: string;
  links: SocialLink[];
  /**
   * Public path to the resume PDF. lib/content.ts nulls this at build time
   * when the file is missing from /public, so the UI never renders a dead
   * download link.
   */
  resumePath: string | null;
  siteUrl: string;
  description: string;
  /** Short narrative for the About section (paragraphs, blank-line separated). */
  about: string;
  /** Duotone portrait plate for the About section. Null hides the figure. */
  portrait: {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | null;
}
