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
    body: `I made my first LLM API call from a short Python script, and it changed how I think about these models. A chat window is something you visit. A model that answers inside your own code is something you can build with.

This guide walks you through your first LLM API call in about ten minutes on Groq's free tier, the same route I took. All you need is an email address. Python helps for the second half, but even that is optional.

One thing to clear up before we start, because the names trip everyone up. **Groq is not Grok.** Grok is the chatbot from xAI. Groq is a company that runs open AI models on chips built for speed. Similar names, completely different things.

Here is the plan:

1. Create a free Groq account
2. Generate an API key
3. Make your first LLM API call with curl
4. Make the call from Python
5. Try other models

## Why Groq for your first LLM API call

Three reasons, and price is only the first. Groq's free tier is a standing offer, not a trial. There is no card on file and no countdown clock, so nothing can surprise you later.

Speed is the second. Groq builds its own inference chips, and answers come back fast enough that the whole loop feels alive. For a first call, that instant feedback matters more than you would think.

The third reason pays off the longest. Groq's API copies OpenAI's request format, and so does much of the industry. Everything you learn here transfers almost anywhere you go next.

## Step 1: create your free Groq account

Go to [console.groq.com](https://console.groq.com) and sign in with your Google account, GitHub, or a plain email address. There is no payment step. No card, no trial countdown, nothing to cancel later.

![The Groq console sign-in page: continue with Google, GitHub, SSO, or email](/images/blog/groq-first-call/01-signin.png "=1845x844")

After signing in, you land in the Groq console. This is home base. The playground lets you chat with models right in the browser, and the token usage chart starts counting from your very first request. Mine reads 14.5K tokens for the last 30 days, all of it from writing this tutorial.

![The Groq console home: token usage chart, playground, docs, and the API Keys tab](/images/blog/groq-first-call/02-console.png "=1896x685")

## Step 2: create your API key

An API key is a password for your code. It tells Groq that a request came from you and counts the usage against your account.

In the console, open the **API Keys** tab. A fresh account has none.

![The API Keys page in the Groq console before any keys exist](/images/blog/groq-first-call/03-apikeys.png "=1905x463")

Click **Create API Key** and give it a name you will recognize later. I named mine \`First LLM API Call\`, after this tutorial. Name keys for the thing that uses them. Once there are twelve of these, \`test-key-2\` is how leaks go unnoticed. The dialog also offers an expiration date; for a learning key, no expiration is fine.

![Creating a Groq API key: display name and expiration](/images/blog/groq-first-call/04-createkey.png "=915x573")

Copy the key the moment it appears. Groq shows it in full exactly once. Paste it somewhere safe for now.

![The created Groq API key, shown exactly once and redacted here](/images/blog/groq-first-call/05-key-created.png "=857x312")

Back on the API Keys page, the console now lists your key with everything but the tail masked. If you closed the dialog without copying, there is no way to see the key again. Delete it and create a new one; they are free.

![The API Keys list after creation, showing only the masked tail of the key](/images/blog/groq-first-call/06-keys-list.png "=1759x417")

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

## Step 4: the call from Python

The terminal is fine for a test. Real projects live in code. Install two small packages (Python 3.8 or newer):

\`\`\`bash
pip install groq python-dotenv
\`\`\`

Create a file named \`.env\` in your project folder. This file holds your key so your code does not have to:

\`\`\`
GROQ_API_KEY=your_key_here
\`\`\`

If you use Git, add \`.env\` to your \`.gitignore\` right now, before you forget.

Then create \`first_call.py\`. This is the exact code from my own first call, comments and all. This time the model is \`openai/gpt-oss-120b\`, OpenAI's open weight GPT model, which Groq also hosts on the free tier:

\`\`\`python
# first_call.py - your first LLM API call (GPT-OSS on Groq, free)

from dotenv import load_dotenv
from groq import Groq

load_dotenv()  # reads GROQ_API_KEY from your .env file

client = Groq()

response = client.chat.completions.create(
    model="openai/gpt-oss-120b",  # OpenAI's open weight GPT model, free on Groq
    messages=[
        {"role": "user", "content": "What is loop engineering in prompt engineering? Keep it brief in one sentence."}
    ],
)

print(response.choices[0].message.content)
\`\`\`

Run it:

\`\`\`bash
python first_call.py
\`\`\`

Here is my actual run. I pasted the same code into a Jupyter notebook cell in VS Code, which is a comfortable way to try an API one cell at a time:

![My real first call in VS Code: the Python code and the model's one-sentence answer about loop engineering](/images/blog/groq-first-call/07-vscode-run.png "=1920x680")

The model answered in one sentence, describing loop engineering as the practice of building iterative feedback cycles, where a model's outputs are evaluated, corrected, and fed back into later prompts to improve the results.

Notice what you did not do. You never typed the key into the script. \`load_dotenv\` reads the \`.env\` file, and the Groq client finds \`GROQ_API_KEY\` on its own. This is the habit that keeps keys out of leaked repositories, and now you have it from day one.

## Step 5: try other models

One key opens every model Groq hosts: Llama models, OpenAI's open weight gpt-oss models, and more. You already used one of each. The curl call ran Llama, and the Python script ran gpt-oss. Switching means changing one line:

\`\`\`python
model="llama-3.3-70b-versatile",
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

## What you have now

You created a key, made a raw LLM API call from the terminal, and then made a call from Python without ever exposing that key. This is the foundation under every AI feature you have used. Chatbots, summarizers, agents: all of them start with this exact request and response.

From here you can play with settings like \`temperature\`, feed the model your own data, or wire it into the software you already run at work.

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
    body: `Every provider publishes a price sheet, and every price sheet says the same thing: a few dollars per million input tokens, a few more per million output tokens. That number is clean, official, and almost useless on its own. The real cost of an LLM in production is not a rate. It is a ledger, and the rate is one line on it.

I have spent my career building and auditing finance systems. When I need to understand a cost, I do not read the brochure. I list the line items, name the driver behind each one, and check the total against the invoice at month end. This essay builds that ledger for an LLM workload, with arithmetic you can redo on a napkin.

One prerequisite. If you have never seen a token bill up close, read [your first LLM API call](/blog/first-llm-api-call-groq/) first. Every API response includes a \`usage\` block that counts prompt tokens and completion tokens. Those counts are the atoms this whole essay is made of.

## Token pricing is the smallest part of LLM cost

A token is a chunk of text, roughly three quarters of an English word. Providers charge one rate for input tokens, which is everything you send, and a higher rate for output tokens, which is everything the model writes back. Two rates, printed on the pricing page. So far it looks like buying electricity.

The trap is that the pricing page prices a single call, and production systems do not make single calls. They hold conversations, run tool loops, retry failures, and replay test suites. The rate tells you what a token costs. It says nothing about how many tokens your architecture is about to buy.

That quantity is set by four drivers. All four live in your code, not in the price sheet.

### Driver 1: context grows with every turn

Chat APIs are stateless, which means the model remembers nothing between calls. Your code resends the entire conversation history with every new message. Turn one sends a system prompt and a question. Turn ten sends the system prompt, nine full exchanges, and the new question.

Run the numbers on a modest chat. With a 1,500 token system prompt and exchanges that average 400 tokens, turn ten's input is 1,500 plus 3,600 plus the new question. That is over 5,000 tokens to ask one thing. A twenty turn conversation does not cost twenty times the first turn. It costs far more, because every turn buys back all the turns before it.

### Driver 2: one request is many calls

An agent is a system where the model can use tools, such as a database query or a search, before it answers. The loop looks like this: the model plans, calls a tool, reads the result, sometimes calls another tool, then writes the answer. Each step is a separate API call, and each call carries the full context of every step before it.

Four to eight model calls per user request is a normal range for agent workloads. Whatever you calculated for a single call, an agent multiplies it.

### Driver 3: retries are full price purchases

Models return malformed JSON. Requests hit rate limits and time out. Your code retries, as it should, and the failed attempt is still billed, because the provider sold those tokens either way. A retry rate of five to ten percent is common, invisible in any demo, and it compounds with both drivers above.

### Driver 4: evaluation is CI for prompts

Change a prompt and you need proof that nothing else broke. That proof is an evaluation suite: a few hundred recorded cases replayed against the new prompt and scored automatically. Teams that care about quality run it on every change, the way they run tests on every commit.

Those runs consume the same tokens at the same rates, in the background, where no user ever sees them. Skipping them does not save the money. It moves the cost to production incidents, which are more expensive and arrive without an invoice.

## Caching is a finance decision in an engineering costume

Prompt caching is the one big discount on the menu. If the beginning of your request is byte for byte identical to a recent request, the provider can reuse its work and charge a fraction of the input rate for those tokens. A tenth of the price is a common figure; check your provider's sheet for the real one.

The catch is discipline. The discount only applies to a stable prefix, so the fixed parts of your prompt, meaning the system prompt and the tool definitions, must sit at the front and never churn. Put a timestamp or a session ID at the top of your system prompt and you quietly void the discount on every call.

That is why I call caching a finance decision. It behaves exactly like a volume discount with terms attached, and the terms are enforced by your architecture. Somebody has to decide that the prompt layout is a contract.

## The working ledger

Here is the model for a concrete, made up but realistic workload: an internal assistant handling 1,000 requests a day as an agent, averaging 4 model calls per request. Each call carries about 6,000 input tokens once history and tool definitions are counted, and returns about 500.

The rates below are round numbers chosen to keep the arithmetic readable, not a quote from any provider. Swap in your own price sheet; the structure is what matters. Input: $1 per million tokens. Output: $3 per million.

| Line item      | Driver                                            | Tokens per month | Cost per month |
| -------------- | ------------------------------------------------- | ---------------- | -------------- |
| Base input     | 4,000 calls a day at 6,000 tokens                 | 720M             | $720           |
| Base output    | 4,000 calls a day at 500 tokens                   | 60M              | $180           |
| Retries        | 8% of calls, billed in full                       | 62M              | $72            |
| Evaluation     | 400 cases, 25 runs a month                        | 44M              | $52            |
| **Subtotal**   |                                                   | 886M             | **$1,024**     |
| Prompt caching | two thirds of input is stable prefix, at 90% off  |                  | -$467          |
| **Total**      |                                                   |                  | **$557**       |

Evaluation runs cache well too; I left that credit out to keep the arithmetic short. Three things jump out of this table once you read it the way a controller would.

First, the per token rate is not a decision anywhere in it. It is a constant multiplied through every line. The decisions are calls per request, context per call, retry rate, evaluation cadence, and cache discipline, and all five belong to your architecture.

Second, architecture beats shopping. Halving the context per call saves about $390 a month before caching. Switching to a provider that is 20 percent cheaper saves about $205. The bigger lever is the one nobody puts on a pricing page.

Third, the scariest number is not in the table. Every line scales with request volume, so growth doubles the total without changing a single assumption. A cost model that looks fine at pilot volume can become the largest line in your tooling budget a year later, with nothing having gone wrong.

## Reconcile it like a subledger

Finance teams close the month by reconciling subledgers against the general ledger. Do the same here. The provider's usage dashboard is your subledger, the invoice is the ledger, and your model is the budget. Once a month, make the three agree and chase every variance until it has a name.

Between closes, watch one metric: tokens per request. It is the earliest warning you will get. A prompt edit that doubles the context reads as a quality improvement in the pull request. On the invoice it reads as a cost increase, and the invoice arrives weeks later. Treat drift in tokens per request the way you would treat scope creep.

Keep the rates in exactly one place in your model, because they change often and usually downward. When a provider cuts prices, a clean ledger tells you within a minute what the cut is worth to you. A model you cannot reconcile to the invoice is not a model. It is a brochure with formulas in it.`,
    tags: ["LLM", "Cost", "Agentic Systems"],
    status: "published",
    banner: {
      src: "/blog/banners/real-cost-of-llms-in-production.png",
      alt: "The real cost of an LLM in production: a working ledger",
      width: 1200,
      height: 630,
    },
    publishedAt: "2026-07-17T00:00:00.000Z",
    createdAt: "2026-07-11T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
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
