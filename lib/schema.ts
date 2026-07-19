import type { Post, SiteProfile } from "@/content/types";
import { postDate } from "./blog";

/**
 * JSON-LD builders: pure functions from content-layer rows to schema.org
 * objects, rendered by components/ui/JsonLd. No imports from /content, so
 * these stay valid unchanged when the data moves to a database.
 *
 * Structured-data rules baked in here:
 *  - every URL is absolute (search engines reject relative URLs in JSON-LD);
 *  - facts must match what the page visibly renders (same title, same
 *    description), or Google discounts the markup;
 *  - Person and WebSite share the page via `@id` so parsers see one entity.
 */
export type SchemaObject = Record<string, unknown>;

/**
 * Person expertise vocabulary for search and AI answer engines. Edit freely;
 * order is cosmetic. Deliberately schema-only (the visible Focus list in the
 * hero serves a different, design-driven purpose).
 */
const KNOWS_ABOUT = [
  "NetSuite",
  "Enterprise Resource Planning",
  "Agentic AI",
  "Revenue Recognition",
  "SuiteScript",
  "System Integration",
];

/** Google displays roughly 110 headline characters; keep within that. */
const HEADLINE_MAX = 110;

export function truncateHeadline(title: string): string {
  if (title.length <= HEADLINE_MAX) return title;
  return `${title.slice(0, HEADLINE_MAX - 1).trimEnd()}…`;
}

/** The role line reads "NetSuite Architect · Agentic AI"; jobTitle wants
 * only the title. */
function jobTitle(profile: SiteProfile): string {
  return profile.role.split(" · ")[0];
}

/** Compact Person for author/publisher fields on pages that don't render
 * the full `#person` entity. */
function inlinePerson(profile: SiteProfile): SchemaObject {
  return {
    "@type": "Person",
    name: profile.name,
    url: `${profile.siteUrl}/`,
    sameAs: profile.links.map((link) => link.href),
  };
}

export function personSchema(profile: SiteProfile): SchemaObject {
  // "Hyderabad, India" → locality + country; a one-part location becomes
  // just the locality.
  const [locality, country] = profile.location.split(", ");
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${profile.siteUrl}/#person`,
    name: profile.name,
    jobTitle: jobTitle(profile),
    description: profile.description,
    url: `${profile.siteUrl}/`,
    image: `${profile.siteUrl}/og.png`,
    email: profile.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: locality,
      ...(country ? { addressCountry: country } : {}),
    },
    sameAs: profile.links.map((link) => link.href),
    knowsAbout: KNOWS_ABOUT,
  };
}

/** Rendered alongside personSchema on the homepage; the `@id` references
 * resolve against the Person block on the same page. */
export function webSiteSchema(profile: SiteProfile): SchemaObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${profile.siteUrl}/#website`,
    name: `${profile.name} · ${jobTitle(profile)}`,
    description: profile.description,
    url: `${profile.siteUrl}/`,
    author: { "@id": `${profile.siteUrl}/#person` },
    creator: { "@id": `${profile.siteUrl}/#person` },
  };
}

export function blogPostingSchema(
  post: Post,
  profile: SiteProfile,
): SchemaObject {
  const url = `${profile.siteUrl}/blog/${post.slug}/`;
  const person = inlinePerson(profile);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: truncateHeadline(post.title),
    description: post.summary,
    datePublished: postDate(post),
    dateModified: post.updatedAt,
    url,
    mainEntityOfPage: url,
    image: post.banner
      ? `${profile.siteUrl}${post.banner.src}`
      : `${profile.siteUrl}/og.png`,
    // Solo site: the author is the publisher.
    author: person,
    publisher: person,
    keywords: post.tags.join(", "),
  };
}
