import type { Tool } from "./types";

/**
 * Free, in-browser utilities. Each tool is a static page under /tools/<slug>/;
 * the interactive part is a client component and all processing stays in the
 * visitor's browser. The index page and sitemap derive from this array, so a
 * new tool means: add a row here, then create its page directory.
 */
export const tools: Tool[] = [
  {
    id: "tool_nacha_validator",
    slug: "nacha-validator",
    code: "TOOL-001",
    title: "NACHA File Validator",
    description:
      "Check an ACH payment file for the formatting problems banks reject, with fix hints for NetSuite Electronic Bank Payments. Runs entirely in your browser.",
    status: "live",
    sortOrder: 1,
    createdAt: "2026-07-19T00:00:00.000Z",
    updatedAt: "2026-07-19T00:00:00.000Z",
  },
];
