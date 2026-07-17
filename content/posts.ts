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
    title: "Your first LLM API call on Groq's free tier",
    summary:
      "Make your first LLM API call in about ten minutes on Groq's free tier. Step-by-step tutorial with curl and Python, API key setup, and common error fixes.",
    body: `Everyone talks about AI. Very few people have actually made an LLM API call from their own code. That first call is a small moment, but it changes how you see all of this. The model stops being a chat window and becomes a building block you can use anywhere.

This guide walks you through your first LLM API call in about ten minutes on Groq's free tier. All you need is an email address. Python helps for the second half, but even that is optional.

One thing to clear up before we start, because the names trip everyone up. **Groq is not Grok.** Grok is the chatbot from xAI. Groq is a company that runs open AI models on chips built for speed. Similar names, completely different things.

Here is the plan:

1. Create a free Groq account
2. Generate an API key
3. Make your first LLM API call with curl
4. Make the same call from Python
5. Try other models

## Why Groq for your first LLM API call

Three reasons, and price is only the first. Groq's free tier is a standing offer, not a trial. There is no card on file and no countdown clock, so nothing can surprise you later.

Speed is the second. Groq builds its own inference chips, and answers come back fast enough that the whole loop feels alive. For a first call, that instant feedback matters more than you would think.

The third reason pays off the longest. Groq's API copies OpenAI's request format, and so does much of the industry. Everything you learn here transfers almost anywhere you go next.

## Step 1: create your free Groq account

Go to [console.groq.com](https://console.groq.com) and sign in with your Google account or an email address. There is no payment step. No card, no trial countdown, nothing to cancel later.

After signing in, you land in the Groq console. This is home base. The playground lets you chat with models right in the browser, and the usage panel starts counting tokens from your very first request.

![The Groq console after signing in: playground, docs, and a token usage panel from day one](/images/blog/groq-first-call/01-console.png "=1600x714")

## Step 2: create your API key

An API key is a password for your code. It tells Groq that a request came from you and counts the usage against your account.

In the console, open the **API Keys** tab. A fresh account has none.

![The API Keys page in the Groq console before any keys exist](/images/blog/groq-first-call/02-apikeys.png "=1482x362")

Click **Create API Key** and give it a name you will recognize later, something like \`my-first-key\`. Name keys for the thing that uses them. Once there are twelve of these, \`test-key-2\` is how leaks go unnoticed.

![Creating a Groq API key: display name and expiration](/images/blog/groq-first-call/03-createkey.png "=907x560")

Copy the key the moment it appears. Groq shows it in full exactly once. Paste it somewhere safe for now.

![The created Groq API key, shown exactly once and redacted here](/images/blog/groq-first-call/04-key-created.png "=1600x841")

Two rules about keys, and I mean both of them:

1. Never paste a key directly into a code file.
2. Never commit a key to Git. If a key ever lands in a repository, treat it as leaked. Delete it in the console and create a new one.

We will handle the key the safe way in step 4.

## Step 3: your first LLM API call with curl

curl is a small tool for making web requests from your terminal. It is already installed on Mac and Linux. On Windows, the smoothest option is Git Bash, which comes free with Git. PowerShell treats curl a little differently, so Git Bash saves you a headache.

Replace \`YOUR_KEY_HERE\` with your key and run this. Typing the key in your own terminal for a one-time test is fine; the no-key rule from step 2 is about code files.

\`\`\`bash
curl https://api.groq.com/openai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_KEY_HERE" \\
  -d '{
    "model": "llama-3.3-70b-versatile",
    "messages": [
      { "role": "user", "content": "Explain what an API is in one short sentence." }
    ]
  }'
\`\`\`

A wall of JSON comes back in about a second. That wall is your first AI response over an API. Trimmed to the parts that matter, it looks like this:

\`\`\`json
{
  "model": "llama-3.3-70b-versatile",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "An API is a set of rules that lets one program request data or actions from another program."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 46,
    "completion_tokens": 20,
    "total_tokens": 66
  }
}
\`\`\`

The answer lives in \`choices[0].message.content\`. Everything else is packaging: the model name, timing, token counts. One piece of that packaging deserves a bookmark, though. The \`usage\` block counts the tokens you spent. Tokens are the unit every [LLM cost model](/blog/real-cost-of-llms-in-production/) is built on, and these numbers roll up into the usage chart from step 1.

Two parts of the request will follow you everywhere:

- \`model\` picks which AI answers you.
- \`messages\` is the conversation so far. Each message has a \`role\` (you are the \`user\`) and \`content\` (what you said).

That is the whole shape of a chat completion. Groq copied OpenAI's format on purpose, so this exact structure will greet you at almost every LLM API you touch next.

## Step 4: the same call from Python

The terminal is fine for a test. Real projects live in code. Install two small packages (Python 3.8 or newer):

\`\`\`bash
pip install groq python-dotenv
\`\`\`

Create a file named \`.env\` in your project folder. This file holds your key so your code does not have to:

\`\`\`
GROQ_API_KEY=your_key_here
\`\`\`

If you use Git, add \`.env\` to your \`.gitignore\` right now, before you forget.

Then create \`first_call.py\`:

\`\`\`python
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq()

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {"role": "user", "content": "Explain what an API is in one short sentence."}
    ],
)

print(response.choices[0].message.content)
\`\`\`

Run it:

\`\`\`bash
python first_call.py
\`\`\`

One clean sentence comes back, along these lines:

\`\`\`
An API is a set of rules that lets two programs talk to each other.
\`\`\`

Notice what you did not do. You never typed the key into the script. \`load_dotenv\` reads the \`.env\` file, and the Groq client finds \`GROQ_API_KEY\` on its own. This is the habit that keeps keys out of leaked repositories, and now you have it from day one.

## Step 5: try other models

One key opens every model Groq hosts: Llama models, OpenAI's open weight gpt-oss models, and more. Switching means changing one line:

\`\`\`python
model="openai/gpt-oss-120b",
\`\`\`

Model names retire as new versions arrive, so trust the console's **Models** page over any blog post, including this one. You can also ask the API itself for the current list:

\`\`\`bash
curl -s https://api.groq.com/openai/v1/models \\
  -H "Authorization: Bearer YOUR_KEY_HERE"
\`\`\`

## When the call does not work

Three errors cover almost every first-day problem with a Groq API call:

- **401 Unauthorized** means the key is wrong or missing. Check for extra spaces from when you pasted it.
- **429 Too Many Requests** means you are sending requests faster than the free tier allows. Wait a minute and try again.
- **Model not found** means the model name has been retired. Check the Models page and update that one line.

## What you just unlocked

You created a key, made a raw LLM API call from the terminal, and then made the same call from Python without ever exposing that key. This is the foundation under every AI feature you have used. Chatbots, summarizers, agents: all of them start with this exact request and response.

From here you can play with settings like \`temperature\`, feed the model your own data, or wire it into the software you already run at work. That last one is where this blog is headed, starting with [calling an LLM from inside an ERP](/blog/ai-agents-netsuite-mcp/).

If you got your first response today, that is a win. Save the script. You will build on it.`,
    tags: ["Groq", "LLM", "API"],
    status: "published",
    banner: {
      src: "/blog/banners/first-llm-api-call-groq.png",
      alt: "Your first LLM API call on Groq's free tier",
      width: 1200,
      height: 630,
    },
    publishedAt: "2026-07-12T00:00:00.000Z",
    createdAt: "2026-07-12T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
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
