import type { Post } from "./types";

/**
 * Blog posts. Rows here move 1:1 into a `posts` database table later.
 *
 * ── Adding a post ─────────────────────────────────────────────────────────
 * 1. Copy the POST TEMPLATE at the bottom of this file and fill it in.
 * 2. Generate its banner (also used as the post's Open Graph image):
 *      npm run generate:banner -- <slug> "<title>" "<TAG · TAG>"
 * 3. Set `status: "published"` and `publishedAt` when it ships.
 * Routes, sitemap entries, and metadata all pick it up automatically.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * The `body` is Markdown: ## headings, ### ledger-label subheads, lists,
 * links, blockquotes, `inline code`, fenced code blocks, GFM tables, and
 * --- rules are all styled to the design system.
 */
export const posts: Post[] = [
  {
    id: "post_rag_internals",
    slug: "rag-internals-embeddings-layer",
    title: "RAG internals: what the embeddings layer is actually doing",
    summary:
      "Past the vector-database marketing: how text becomes geometry, why chunking strategy decides retrieval quality, and where similarity search quietly fails.",
    body: `Most RAG explainers stop at "embed your documents, search by similarity." The interesting engineering lives one layer down: what the embedding model preserves and discards, why chunk boundaries decide what can ever be retrieved, and the failure modes that only show up when your corpus is financial data instead of a demo wiki.

### What this essay will cover

- How text becomes geometry, and what an embedding model quietly throws away
- Chunking as an architecture decision, not a preprocessing step
- Where cosine similarity fails on numbers, dates, and ledger language
- Evaluating retrieval the way you would reconcile a subledger

*This essay is in draft. The full write-up lands here when it's ready.*`,
    tags: ["RAG", "Embeddings", "AI Architecture"],
    status: "draft",
    banner: {
      src: "/blog/banners/rag-internals-embeddings-layer.png",
      alt: "RAG internals: what the embeddings layer is actually doing",
      width: 1200,
      height: 630,
    },
    publishedAt: null,
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-11T00:00:00.000Z",
  },
  {
    id: "post_llm_costs",
    slug: "real-cost-of-llms-in-production",
    title: "The real cost of an LLM in production: a working ledger",
    summary:
      "Token pricing is the smallest line item. A cost model for agentic workloads (context windows, retries, caching, evaluation) built the way finance would build it.",
    body: `Everyone prices the happy path: tokens in, tokens out. Production agentic systems spend differently: context that grows with every hop, retries on malformed tool calls, evaluation runs, and the caching decisions that make or break the unit economics.

### What this essay will cover

- The line items nobody budgets: retries, evaluation, growing context
- Why caching strategy is a finance decision wearing an engineering costume
- A working cost model you can hold to account, line by line

*This essay is in draft. The full write-up lands here when it's ready.*`,
    tags: ["LLM", "Cost", "Agentic Systems"],
    status: "draft",
    banner: {
      src: "/blog/banners/real-cost-of-llms-in-production.png",
      alt: "The real cost of an LLM in production: a working ledger",
      width: 1200,
      height: 630,
    },
    publishedAt: null,
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-11T00:00:00.000Z",
  },
  {
    id: "post_agents_mcp",
    slug: "ai-agents-netsuite-mcp",
    title: "Wiring AI agents into NetSuite over MCP",
    summary:
      "What it takes to put a natural-language interface on an ERP without handing a language model the keys: tool contracts, scoped agents, and an orchestrator that knows when not to use AI.",
    body: `The Model Context Protocol makes "connect an LLM to your ERP" sound like an afternoon project. The part that takes real architecture is everything around the connection: designing tool contracts an agent can't misuse, scoping each agent to one financial domain, and building an orchestrator that treats the LLM as a routing and synthesis layer, not a database client.

### What this essay will cover

- Tool contracts as the guardrail: typed, scoped, enumerable
- One agent per subledger: why domain boundaries beat one mega-agent
- The orchestrator's real job: knowing when *not* to use the LLM

*This essay is in draft. The full write-up lands here when it's ready.*`,
    tags: ["MCP", "NetSuite", "Agents"],
    status: "draft",
    banner: {
      src: "/blog/banners/ai-agents-netsuite-mcp.png",
      alt: "Wiring AI agents into NetSuite over MCP",
      width: 1200,
      height: 630,
    },
    publishedAt: null,
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-11T00:00:00.000Z",
  },
];

/* ── POST TEMPLATE: copy, fill in, add to the array above ───────────────────
{
  id: "post_my_new_essay",              // unique, stable, never reuse
  slug: "my-new-essay",                 // URL: /blog/my-new-essay/
  title: "My new essay title",
  summary: "One or two sentences shown on the index and in search results.",
  body: `Opening paragraph.

## A big section heading

Body text with [links](https://example.com), **bold**, *italics*, and
\\\`inline code\\\`.

### A ledger-label subhead

- Bullet lists
- Numbered lists work too (1. 2. 3.)

> A pull-quote or callout worth setting apart.

\\\`\\\`\\\`sql
-- fenced code blocks, e.g. SuiteQL
SELECT id, tranid FROM transaction WHERE daysopen > 60
\\\`\\\`\\\`

| Column | Notes            |
| ------ | ---------------- |
| GFM    | tables render too |
`,
  tags: ["Tag1", "Tag2"],
  status: "draft",                      // "published" when it ships
  banner: {                             // npm run generate:banner -- my-new-essay "My new essay title" "TAG1 · TAG2"
    src: "/blog/banners/my-new-essay.png",
    alt: "My new essay title",
    width: 1200,
    height: 630,
  },                                    // or null for no banner
  publishedAt: null,                    // "2026-08-01T00:00:00.000Z" when published
  createdAt: "2026-07-11T00:00:00.000Z",
  updatedAt: "2026-07-11T00:00:00.000Z",
},
─────────────────────────────────────────────────────────────────────────── */
