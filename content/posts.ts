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
    body: `An LLM API call is the hello world of modern AI, and it is still the fastest way to understand what these models really are. A chat window is something you visit. A model that answers inside your own code is something you can build with.

This guide walks you through your first LLM API call in about ten minutes on Groq's free tier. I set up a fresh account and captured every step while writing it, so the screenshots show exactly what you will see. All you need is an email address. Python helps for the second half, but even that is optional.

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

Then create \`first_call.py\`. This is the exact code I ran while putting this tutorial together, comments and all. This time the model is \`openai/gpt-oss-120b\`, OpenAI's open weight GPT model, which Groq also hosts on the free tier:

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

Here is that code running in my editor. I pasted it into a Jupyter notebook cell in VS Code, which is a comfortable way to try an API one cell at a time:

![The tutorial script running in VS Code: the Python code and the model's one-sentence answer about loop engineering](/images/blog/groq-first-call/07-vscode-run.png "=1920x680")

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
  {
    id: "post_jev_vs_llm",
    slug: "what-is-jev-ai-vs-llm",
    title: "What is Jev? How it differs from an LLM, with a working invoice example",
    summary:
      "Jev is TypeSafe AI's decision model. See how it differs from an LLM on one vendor invoice, the data each returns, and Python code you can run in VS Code.",
    body: `TypeSafe AI released a new model called Jev on 15 September 2026. It does something most AI models don't do. It never writes a sentence.

When I first read about it, I found the difference from an LLM hard to picture. So I built two small Python scripts that check the same vendor invoice. One uses only an LLM. The other uses Jev with an LLM. This post walks through both, with the data each one returns and the code you can run yourself.

## Jev in one minute

- Jev is an AI model from TypeSafe AI, a San Francisco company founded in 2024.
- You give it some data and a few questions.
- For each question, you list the answers it is allowed to give.
- It returns one of those answers with a probability.
- It answers all the questions in one call.
- It never returns free text.

TypeSafe calls this a **System One** model. The name comes from psychology. System One is fast, instinctive judgment. System Two is slow, step by step thinking. Jev is built for the fast part.

Jev supports three types of question:

| Type | What it does | What you get back |
|---|---|---|
| Choice | Picks one option from your list | The option, a probability for each option and a confidence score |
| Score | Rates against levels you define | A score, a probability for each level and a confidence score |
| Noul | Answers yes or no | A probability from 0 to 1 |

## The difference, seen as data

The easiest way to see the difference is to look at what each model gives your system.

Say you ask about three invoices. An LLM gives you text. It is like filling a Memo field:

| Invoice | LLM output |
|---|---|
| INV-2291 | "This looks like a duplicate of a paid invoice. I would treat it as high risk." |
| INV-2317 | "Normal office supplies order. Low risk, no duplicate found." |
| INV-2330 | "Probably IT hardware. Medium risk because the amount is above the PO." |

The wording changes every time. Your code has to read the sentence and work out what it means.

Jev gives you typed values. It is like filling list fields and a checkbox:

| Invoice | Category | Risk (0 to 2) | Duplicate | Confidence |
|---|---|---|---|---|
| INV-2291 | Office supplies | 1.66 | 0.95 | 0.88 |
| INV-2317 | Office supplies | 0.20 | 0.03 | 0.91 |
| INV-2330 | IT hardware | 0.94 | 0.05 | 0.76 |

Every value comes from a list you defined. You can filter on it, route on it and report on it. A low confidence value tells you a person should look at the record.

*The values in these tables are examples to show the shape of the data.*

## Jev and LLM at a glance

| | Jev | LLM |
|---|---|---|
| What it returns | Typed values with probabilities | Text |
| Possible answers | Only the ones you list | Anything |
| Confidence | Included with every answer | Not included |
| Can it write an email? | No | Yes |
| Can it plan several steps? | No | Yes |
| Reported speed | 70 to 500 ms per call | Often a few seconds |
| Best used for | Classify, score, check, route | Write, summarise, explain, investigate |

TypeSafe also says Jev is 40 to 200 times faster and 40 to 400 times cheaper than large LLMs on similar tasks. These numbers come from TypeSafe's own tests, and the company says real results are likely to be lower. Test it on your own data before you rely on them. If you keep [a working ledger of what an LLM costs in production](/blog/real-cost-of-llms-in-production/), you already know why fewer large model calls matter.

## The example: one vendor invoice

Both scripts check this invoice:

- **Invoice:** INV-2291 from Northwind Supplies
- **Amount:** $4,860.00 against PO-7741
- **Vendor note:** "Resubmitting the March invoice, please process."
- **AP record:** INV-2291 was already paid on 12 March

We want three answers:

- Which spend category is it?
- How risky is it to pay?
- Is it a duplicate?

If it is a duplicate, the AP team also needs a review note and an email to the vendor.

![One vendor invoice going into Jev and three structured answers coming out: spend category, payment risk and duplicate probability](/images/blog/jev-vs-llm/slide-1-invoice.png "=2160x2700")

## Without Jev: the LLM does everything

This is how most teams use AI today. One LLM call does the whole job.

1. Your code sends the invoice and the paid invoices to the LLM.
2. The LLM picks the category, judges the risk and checks for duplicates.
3. It writes the AP note and the vendor email in the same reply.
4. Your code parses the JSON and checks every value.
5. If anything is missing or wrong, your code has to retry.
6. This happens for every invoice, including the normal ones.

Here is the script:

\`\`\`python
# Without Jev: one LLM call does every step for every invoice.
# Run:  python without_jev.py          (duplicate invoice)
#       python without_jev.py --clean  (normal invoice)

import json
import os
import sys
import time

from dotenv import load_dotenv
from openai import OpenAI

from invoice import PAID_INVOICES, pick_invoice

load_dotenv()

llm = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1",
)
LLM_MODEL = "openai/gpt-oss-20b"

new_invoice = pick_invoice(sys.argv)

# Step 1: ask the LLM to do everything in one prompt.
prompt = f"""You are an accounts payable assistant.
Check the new invoice against the invoices we already paid.
Reply with JSON only, using exactly these keys:
  "category": one of "Office supplies", "IT hardware", "Facilities"
  "risk": one of "Low", "Medium", "High"
  "duplicate": true or false
  "ap_note": a short note for the AP reviewer
  "vendor_email": a short email to the vendor, or "" if none is needed

New invoice:
{json.dumps(new_invoice, indent=2)}

Invoices already paid:
{json.dumps(PAID_INVOICES, indent=2)}
"""

print(f"\\nInvoice {new_invoice['invoice_number']}: sending everything to the LLM...")
start = time.perf_counter()
reply = llm.chat.completions.create(
    model=LLM_MODEL,
    messages=[{"role": "user", "content": prompt}],
    response_format={"type": "json_object"},
)
seconds = time.perf_counter() - start
text = reply.choices[0].message.content

print("\\n--- Raw LLM reply ---")
print(text)

# Step 2: our code has to parse and check the text before it can use it.
try:
    result = json.loads(text)
except json.JSONDecodeError:
    print("\\nThe reply is not valid JSON. The code would need to retry.")
    sys.exit(1)

problems = []
if result.get("category") not in ["Office supplies", "IT hardware", "Facilities"]:
    problems.append(f"Unknown category: {result.get('category')}")
if result.get("risk") not in ["Low", "Medium", "High"]:
    problems.append(f"Unknown risk level: {result.get('risk')}")
if not isinstance(result.get("duplicate"), bool):
    problems.append(f"Duplicate is not true or false: {result.get('duplicate')}")

print("\\n--- What our code can use ---")
if problems:
    print("The reply needs a retry:")
    for problem in problems:
        print(f"  {problem}")
    sys.exit(1)

print(f"Category:   {result['category']}")
print(f"Risk:       {result['risk']}")
print(f"Duplicate:  {result['duplicate']}")
print("Confidence: not provided by the LLM")

# Step 3: decide the next step.
if result["duplicate"] or result["risk"] == "High":
    print("\\nDecision: hold payment and send to AP review.")
else:
    print("\\nDecision: approve for payment.")

print(f"\\nLLM calls: 1   Time: {seconds:.2f} s   Tokens: {reply.usage.total_tokens}")
\`\`\`

Running it prints something like this. The values are examples, and yours will differ:

\`\`\`
Invoice INV-2291: sending everything to the LLM...

--- Raw LLM reply ---
{"category": "Office supplies", "risk": "High", "duplicate": true,
 "ap_note": "...", "vendor_email": "..."}

--- What our code can use ---
Category:   Office supplies
Risk:       High
Duplicate:  True
Confidence: not provided by the LLM

Decision: hold payment and send to AP review.

LLM calls: 1   Time: 2.84 s
\`\`\`

What to notice:

- The LLM's answers arrive as text inside JSON.
- The code has to check that each value is one it expects.
- There is no confidence score, so you can't tell a sure answer from a guess.
- The normal invoice (\`--clean\`) costs a full LLM call too.

## With Jev: Jev decides, the LLM writes

Now the work is split between Jev, your code and the LLM.

1. Your code sends the invoice and the paid invoices to Jev with three questions.
2. Jev returns the category, the risk score and the duplicate probability.
3. Your code compares those values with your rules.
4. A clean invoice is approved. The LLM is never called.
5. A flagged invoice gets a small handoff built from Jev's answers.
6. The LLM uses the handoff to write the AP note and the vendor email.
7. Jev checks the draft against your policy.
8. The draft goes to an AP reviewer.

![The AP workflow without Jev and with Jev, showing the handoff the LLM receives and the policy check on its draft](/images/blog/jev-vs-llm/slide-2-workflow.png "=2160x2700")

Here is the script:

\`\`\`python
# With Jev: Jev makes the decisions, our code applies the rules,
# and the LLM is called only when a person needs to read something.
# Run:  python with_jev.py          (duplicate invoice)
#       python with_jev.py --clean  (normal invoice)

import json
import os
import sys
import time

from dotenv import load_dotenv
from openai import OpenAI
from typesafe_sdk import Choice, Noul, Score, TypeSafeClient

from invoice import PAID_INVOICES, pick_invoice

load_dotenv()

llm = OpenAI(
    api_key=os.environ["GROQ_API_KEY"],
    base_url="https://api.groq.com/openai/v1",
)
LLM_MODEL = "openai/gpt-oss-20b"

# Our business rules. These stay in code.
DUPLICATE_LIMIT = 0.90   # hold payment at or above this
RISK_LIMIT = 1.5         # risk score runs from 0 (Low) to 2 (High)
CONFIDENCE_MIN = 0.80    # below this, a person should check the category

new_invoice = pick_invoice(sys.argv)
state = {"new_invoice": new_invoice, "paid_invoices": PAID_INVOICES}

# Step 1: ask Jev three questions with fixed answers.
questions = {
    "category": Choice(
        instructions="Which spend category does the new invoice belong to?",
        criteria={
            "Office supplies": "Paper, stationery and desk items",
            "IT hardware": "Laptops, monitors and network equipment",
            "Facilities": "Cleaning, repairs, rent and utilities",
        },
    ),
    "risk": Score(
        instructions="How risky is it to pay the new invoice?",
        criteria=[
            "Low: known vendor, matches the PO, nothing unusual",
            "Medium: a small mismatch or something to check",
            "High: likely duplicate, wrong amount or unusual request",
        ],
    ),
    "duplicate": Noul(
        instructions="The new invoice matches an invoice in paid_invoices "
        "and has already been paid.",
    ),
}

print(f"\\nInvoice {new_invoice['invoice_number']}: asking Jev three questions...")
start = time.perf_counter()
with TypeSafeClient() as jev:
    response = jev.system_one(state=state, questions=questions)
jev_seconds = time.perf_counter() - start

category = response.answers["category"]
risk = response.answers["risk"]
duplicate = response.answers["duplicate"]

print("\\n--- Jev answers (ready to use, no parsing) ---")
print(f"Category:   {category.choice}   confidence {category.confidence:.2f}")
rounded = {label: round(p, 2) for label, p in category.probabilities.items()}
print(f"            probabilities {rounded}")
print(f"Risk score: {risk.score:.2f} out of 2   confidence {risk.confidence:.2f}")
print(f"Duplicate:  P(yes) = {duplicate.noul:.2f}")
print(f"Jev time:   {jev_seconds:.2f} s")

# Step 2: our code applies the rules.
reasons = []
if duplicate.noul >= DUPLICATE_LIMIT:
    reasons.append("likely duplicate")
if risk.score >= RISK_LIMIT:
    reasons.append("high payment risk")
if category.confidence < CONFIDENCE_MIN:
    reasons.append("category unclear")

if not reasons:
    print("\\nDecision: clean invoice. Approve for payment.")
    print(f"\\nLLM calls: 0   Total time: {jev_seconds:.2f} s")
    sys.exit(0)

print(f"\\nDecision: hold payment. Reasons: {', '.join(reasons)}.")

# Step 3: build a small handoff for the LLM from Jev's answers.
handoff = {
    "invoice": new_invoice["invoice_number"],
    "vendor": new_invoice["vendor"],
    "amount": new_invoice["amount"],
    "category": f"{category.choice} ({category.confidence:.2f})",
    "risk_score": f"{risk.score:.2f} out of 2",
    "duplicate_probability": round(duplicate.noul, 2),
    "hold_reasons": reasons,
    "task": "Write a short AP review note and a polite email to the vendor.",
}

print("\\n--- Handoff sent to the LLM ---")
print(json.dumps(handoff, indent=2))

# Step 4: the LLM only writes.
start = time.perf_counter()
reply = llm.chat.completions.create(
    model=LLM_MODEL,
    messages=[
        {
            "role": "system",
            "content": "You write short, polite accounts payable messages. "
            "Use only the facts you are given.",
        },
        {"role": "user", "content": json.dumps(handoff)},
    ],
)
llm_seconds = time.perf_counter() - start
draft = reply.choices[0].message.content

print("\\n--- LLM draft ---")
print(draft)

# Step 5: Jev checks the draft against our policy.
start = time.perf_counter()
with TypeSafeClient() as jev:
    check = jev.system_one(
        state={"facts": handoff, "draft": draft},
        questions={
            "follows_policy": Noul(
                instructions="The draft is polite, uses only the facts given, "
                "does not promise payment, and asks the vendor to confirm "
                "or send a credit note.",
            )
        },
    )
check_seconds = time.perf_counter() - start
policy = check.answers["follows_policy"].noul

print("\\n--- Policy check by Jev ---")
print(f"Follows policy: P(yes) = {policy:.2f}")
if policy >= 0.8:
    print("Send the draft to the AP reviewer for approval.")
else:
    print("Send the case to a person to rewrite.")

total = jev_seconds + llm_seconds + check_seconds
print(f"\\nLLM calls: 1   Jev calls: 2   Total time: {total:.2f} s")
\`\`\`

For the duplicate invoice it prints something like this:

\`\`\`
Invoice INV-2291: asking Jev three questions...

--- Jev answers (ready to use, no parsing) ---
Category:   Office supplies   confidence 0.88
            probabilities {'Office supplies': 0.91, 'IT hardware': 0.07, 'Facilities': 0.02}
Risk score: 1.66 out of 2   confidence 0.70
Duplicate:  P(yes) = 0.95

Decision: hold payment. Reasons: likely duplicate, high payment risk.
\`\`\`

And for the normal invoice:

\`\`\`
Invoice INV-2317: asking Jev three questions...

--- Jev answers (ready to use, no parsing) ---
Category:   Office supplies   confidence 0.91
Risk score: 0.20 out of 2   confidence 0.84
Duplicate:  P(yes) = 0.03

Decision: clean invoice. Approve for payment.

LLM calls: 0
\`\`\`

What to notice:

- Jev's answers are ready to use. There is no parsing step.
- Every answer comes with a probability, so the rules in code are simple.
- The normal invoice finishes with zero LLM calls.
- The LLM only runs when a person needs something to read.

## What the LLM receives

Jev never calls the LLM. Your code reads Jev's answers and builds a small handoff like this one:

\`\`\`json
{
  "invoice": "INV-2291",
  "vendor": "Northwind Supplies",
  "amount": 4860.0,
  "category": "Office supplies (0.88)",
  "risk_score": "1.66 out of 2",
  "duplicate_probability": 0.95,
  "hold_reasons": ["likely duplicate", "high payment risk"],
  "task": "Write a short AP review note and a polite email to the vendor."
}
\`\`\`

The decisions are already made. The LLM only has to turn these facts into a note and an email a person can read.

## How the data moves

\`\`\`
Invoice + paid invoices
        │
        ▼
      Jev  ──►  category, risk score, duplicate probability
        │
        ▼
  Your rules in code
        │
   ┌────┴─────────────┐
   ▼                  ▼
 Clean             Flagged
 Approve            │
 (no LLM)           ▼
            Handoff JSON ──► LLM ──► draft note and email
                                         │
                                         ▼
                                Jev policy check
                                         │
                                         ▼
                                   AP reviewer
\`\`\`

Your code is in the middle of every step. It sends data to Jev, reads the answers, decides what happens and calls the LLM only when it is needed.

## Side by side

| | Without Jev | With Jev |
|---|---|---|
| LLM calls for a normal invoice | 1 | 0 |
| LLM calls for a flagged invoice | 1 | 1 |
| Who makes the decisions | The LLM | Jev |
| Output your code gets | Text to parse and check | Typed values |
| Confidence | None | On every answer |
| What the LLM does | Everything | Writes the note and the email |
| Check on the LLM's draft | None | Jev policy check |

If most of your invoices are normal, that is where Jev saves the most. Those invoices never reach the LLM.

## Run it yourself in VS Code

You need:

- Python 3.10 or newer
- VS Code with the Python extension
- A TypeSafe API key from [console.typesafe.ai](https://console.typesafe.ai/keys). Jev is in early access.
- A Groq API key from [console.groq.com](https://console.groq.com/keys). The free tier is enough. If you have never made an LLM API call, [start with this walkthrough](/blog/first-llm-api-call-groq/).

**Step 1.** Create a folder called \`jev-invoice-demo\` and open it in VS Code.

**Step 2.** Create \`invoice.py\` with the sample data:

\`\`\`python
# Sample data for the demo. All names and numbers are made up.

# Invoices our AP team has already paid.
PAID_INVOICES = [
    {
        "invoice_number": "INV-2291",
        "vendor": "Northwind Supplies",
        "amount": 4860.00,
        "po_number": "PO-7741",
        "paid_on": "2026-03-12",
    },
    {
        "invoice_number": "INV-2240",
        "vendor": "Northwind Supplies",
        "amount": 1275.50,
        "po_number": "PO-7702",
        "paid_on": "2026-02-20",
    },
]

# A new invoice that repeats one we already paid.
DUPLICATE_INVOICE = {
    "invoice_number": "INV-2291",
    "vendor": "Northwind Supplies",
    "amount": 4860.00,
    "po_number": "PO-7741",
    "lines": ["Printer paper, 40 boxes", "Desk organisers, 25 units"],
    "vendor_note": "Resubmitting the March invoice, please process.",
}

# A normal new invoice with nothing unusual.
CLEAN_INVOICE = {
    "invoice_number": "INV-2317",
    "vendor": "Northwind Supplies",
    "amount": 932.40,
    "po_number": "PO-7790",
    "lines": ["Whiteboard markers, 60 packs", "Sticky notes, 30 packs"],
    "vendor_note": "September order as per PO-7790.",
}


def pick_invoice(args):
    """Use the clean invoice when the script is run with --clean."""
    if "--clean" in args:
        return CLEAN_INVOICE
    return DUPLICATE_INVOICE
\`\`\`

**Step 3.** Save the two scripts above as \`without_jev.py\` and \`with_jev.py\`.

**Step 4.** Create \`requirements.txt\`:

\`\`\`
typesafe-sdk
openai
python-dotenv
\`\`\`

**Step 5.** Create a file called \`.env\` with your keys. Keep this file out of Git.

\`\`\`
TYPESAFE_API_KEY=your_typesafe_key_here
GROQ_API_KEY=your_groq_key_here
\`\`\`

**Step 6.** Open a terminal in VS Code and install the packages. On Windows:

\`\`\`powershell
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
\`\`\`

On macOS or Linux:

\`\`\`bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
\`\`\`

**Step 7.** Run both scripts:

\`\`\`bash
python without_jev.py
python with_jev.py
python without_jev.py --clean
python with_jev.py --clean
\`\`\`

Compare the number of LLM calls and the time printed at the end of each run. Your numbers will be different from mine, and they change from run to run.

## Does Jev reason like an LLM?

Jev reads the input once and scores each allowed answer in one pass. It works like fast instinct. It gives you the answer and the probability, without the reasoning behind it.

Some cases need several steps of thinking. For example, a vendor says a credit note was applied to the wrong invoice across three orders. Jev can flag that case as risky. Working out what actually happened is a job for the LLM or a person. A low confidence score is a good sign that a case belongs there.

## Before you use Jev

- **Early access.** Jev is only available in limited early access for now.
- **Self reported numbers.** The speed and cost figures have not been widely tested by others yet.
- **Closed model.** There are no public weights or technical paper.
- **Your answer lists matter.** Jev picks well only when your options are clear and do not overlap.
- **Controls stay in code.** A clear answer can still be wrong. Keep your 3 way match, approval limits and payment rules in your own system.

## Frequently asked questions

### Is Jev an LLM?
Jev never generates text. It returns typed answers with probabilities. TypeSafe describes it as a transformer based model built for decisions.

### Can Jev replace ChatGPT or Claude?
They do different jobs. Jev makes structured decisions. An LLM writes and reasons. Most teams will use both.

### Does Jev hallucinate?
Jev can only return an answer from your list, so it can't make up content. It can still pick the wrong option. That is why the confidence score matters.

### Does Jev send data to the LLM?
Your code sits between them. It reads Jev's answers and builds the request to the LLM when one is needed.

### Can I use Jev for invoice processing?
Yes. It can classify spend, score payment risk and flag likely duplicates. Your ERP rules and AP reviewers still make the final payment decision.

### Why is it called Jev?
It is named after the economist William Stanley Jevons. The Jevons paradox says that when something gets cheaper to use, people use more of it. TypeSafe expects the same to happen with AI decisions.

## Sources

- [Jev (AI model), Wikipedia](https://en.wikipedia.org/wiki/Jev_(AI_model))
- [Introducing System One Models & Jev, TypeSafe AI](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [TypeSafe AI quickstart](https://docs.typesafe.ai/introduction/quickstart)
- [TypeSafe Python SDK](https://docs.typesafe.ai/sdk/python)
- [TypeSafe AI's Jev offers an alternative to LLMs, Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/typesafe-ais-jev-offers-an-alternative-to-llms-that-claims-to-be-193x-faster-and-445x-cheaper-system-one-type-model-is-bespoke-for-probabilistic-decision-making)
- [What Is Jev? A Guide to TypeSafe AI's System One Model, LangChain](https://www.langchain.com/blog/building-a-harness-with-jev)`,
    tags: ["Jev", "TypeSafe AI", "LLM"],
    status: "published",
    banner: {
      src: "/blog/banners/what-is-jev-ai-vs-llm.png",
      alt: "What is Jev? How it differs from an LLM, with a working invoice example",
      width: 1200,
      height: 630,
    },
    publishedAt: "2026-09-26T00:00:00.000Z",
    createdAt: "2026-09-26T00:00:00.000Z",
    updatedAt: "2026-09-26T00:00:00.000Z",
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
