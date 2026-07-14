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
    id: "post_groq_first_call",
    slug: "first-llm-api-call-groq",
    title: "Your first LLM API call: console to completion on Groq",
    summary:
      "Making your first LLM API call? Console to key to a working chat completion in about twenty minutes on Groq's free tier, and why the usage object is the only part of the response worth bookmarking.",
    body: `Groq's pitch is speed: OpenAI-compatible inference served fast enough that you stop thinking about latency. That makes it the console I'd point anyone at for their first LLM API call: the free tier is real, the API shape is the one every SDK already speaks, and the distance from "signed up" to "working chat completion" is about twenty minutes. Here's the whole walk, screenshot by screenshot.

## The console

Signing up lands you in a console that gets to the point: a playground, docs, and a token-usage panel that starts counting from your first request. The usage chart is the part I appreciate: spend is visible from day one, not at invoice time.

![The Groq console after signing in: playground, docs, and a token-usage panel from day one](/images/blog/groq-first-call/01-console.png "=1600x714")

## One key, shown once

API keys live under their own tab, and a fresh account has none.

![The API Keys page before any keys exist](/images/blog/groq-first-call/02-apikeys.png "=1482x362")

Creating one asks for a display name and an expiration. Name keys for the thing that uses them. Once there are twelve of these, "test-key-2" is how leaks go unnoticed.

![Creating an API key: display name and expiration](/images/blog/groq-first-call/03-createkey.png "=907x560")

The key is displayed exactly once. Copy it into your shell's environment and close the dialog. It never belongs in a file, a repo, or a screenshot. The one below is blank on purpose: any key that has been on a screen should be treated as burned and regenerated.

![The created key, shown exactly once and redacted here](/images/blog/groq-first-call/04-key-created.png "=1600x841")

\`\`\`bash
export GROQ_API_KEY="gsk_..."   # PowerShell: $env:GROQ_API_KEY = "gsk_..."
\`\`\`

## The call itself

The endpoint is OpenAI-compatible, so the first call is one curl:

\`\`\`bash
curl https://api.groq.com/openai/v1/chat/completions \\
  -H "Authorization: Bearer $GROQ_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Say hello in exactly five words."}]
  }'
\`\`\`

Same call in Python with the official SDK (\`pip install groq\`):

\`\`\`python
import os

from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {
            "role": "user",
            "content": "One sentence: why does every finance team "
            "ask an ERP for invoice aging first?",
        }
    ],
)

print(response.choices[0].message.content)
print(response.usage)
\`\`\`

Two parts of the response deserve more attention than the answer text. \`choices[0].message.content\` is the reply; \`usage\` is the ledger line: prompt tokens, completion tokens, total. If you make one API call in your life, still print \`usage\`: it is the unit of account every [cost model](/blog/real-cost-of-llms-in-production/) is built on, and the numbers roll up into that console usage chart above.

If the model name has moved on by the time you read this, ask the API instead of a tutorial:

\`\`\`bash
curl -s https://api.groq.com/openai/v1/models \\
  -H "Authorization: Bearer $GROQ_API_KEY"
\`\`\`

## What this actually sets up

The twenty minutes were the easy 80%. A working key and a chat completion is not an AI system. It's a socket. Everything that makes it production-grade happens around this call: guardrails on what it's allowed to touch, observability on what it did, and a cost model that treats \`usage\` as a line item instead of a surprise. That's the 20% the rest of this ledger is about.`,
    tags: ["Groq", "LLM", "API"],
    status: "published",
    banner: {
      src: "/blog/banners/first-llm-api-call-groq.png",
      alt: "Your first LLM API call: console to completion on Groq",
      width: 1200,
      height: 630,
    },
    publishedAt: "2026-07-12T00:00:00.000Z",
    createdAt: "2026-07-12T00:00:00.000Z",
    updatedAt: "2026-07-12T00:00:00.000Z",
  },
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
