"use client";

/**
 * ASK-000: the deterministic concierge.
 *
 * The joke is the brand: this is the site's own thesis in miniature. Visitor
 * questions are scored against a keyword index over facts the server
 * component pre-shaped from the content layer: no network calls, no model,
 * no fuzzy matching. The route with the most keyword hits answers; zero hits
 * is an honest "no agent". The one artificial delay is a short beat
 * (RESPONSE_DELAY_MS) so answers land like a terminal, not a popup.
 */

import { useRef, useState } from "react";

export interface ConciergeFacts {
  name: string;
  role: string;
  identity: string;
  thesis: string;
  guardrailLine: string;
  email: string;
  location: string;
  hasResume: boolean;
  links: { label: string; href: string }[];
  pillars: string[];
  certifications: string[];
  stack: string[];
  posts: { title: string; status: string }[];
  flagship: { code: string; title: string; agentNames: string[] };
}

type Entry = { id: number; query: string; route: string; lines: string[] };

const RESPONSE_DELAY_MS = 280;

type Route = {
  name: string;
  keywords: string[];
  lines: (f: ConciergeFacts) => string[];
};

const linkByLabel = (f: ConciergeFacts, label: string) =>
  f.links.find((l) => l.label.toLowerCase() === label)?.href ??
  "not on file. email instead.";

/** Keyword index over the content layer. Highest hit count wins; ties go to
 * the earlier route. Tokens are whole words, so "do" can't hide in "London". */
const ROUTES: Route[] = [
  {
    name: "github",
    keywords: ["github", "repo", "repos", "repository", "source"],
    lines: (f) => [`github: ${linkByLabel(f, "github")}`],
  },
  {
    name: "linkedin",
    keywords: ["linkedin", "connect"],
    lines: (f) => [`linkedin: ${linkByLabel(f, "linkedin")}`],
  },
  {
    name: "resume",
    keywords: ["resume", "cv"],
    lines: (f) =>
      f.hasResume
        ? ["resume: Download PDF in the contact ledger above."]
        : ["resume: being re-typeset. email for the latest copy."],
  },
  {
    name: "contact",
    keywords: [
      "contact",
      "email",
      "mail",
      "reach",
      "hire",
      "hiring",
      "touch",
      "available",
      "availability",
      "call",
    ],
    lines: (f) => [
      `email: ${f.email}`,
      `base: ${f.location}`,
      ...f.links.map((l) => `${l.label.toLowerCase()}: ${l.href}`),
    ],
  },
  {
    name: "location",
    keywords: ["location", "based", "base", "where", "city", "hyderabad", "india", "timezone"],
    lines: (f) => [`base: ${f.location}`],
  },
  {
    name: "certifications",
    keywords: [
      "cert",
      "certs",
      "certified",
      "certification",
      "certifications",
      "credential",
      "credentials",
      "suitefoundation",
    ],
    lines: (f) => f.certifications,
  },
  {
    name: "flagship",
    keywords: [
      "flagship",
      "sys-001",
      "sys001",
      "agent",
      "agents",
      "mcp",
      "orchestrator",
      "demo",
      "schematic",
      "multi-agent",
    ],
    lines: (f) => [
      `${f.flagship.code} · ${f.flagship.title}`,
      `agents: ${f.flagship.agentNames.join(" · ")}`,
      "full write-up in the case study above.",
    ],
  },
  {
    name: "writing",
    keywords: [
      "writing",
      "write",
      "written",
      "wrote",
      "blog",
      "blogs",
      "post",
      "posts",
      "article",
      "articles",
      "essay",
      "essays",
      "read",
      "rag",
      "embeddings",
      "cost",
      "costs",
    ],
    lines: (f) => [
      ...f.posts.map(
        (p) => `${p.title}${p.status === "draft" ? " · draft" : ""}`,
      ),
      "index: /blog/",
    ],
  },
  {
    name: "capabilities",
    keywords: [
      "capability",
      "capabilities",
      "skill",
      "skills",
      "pillar",
      "pillars",
      "services",
      "architect",
      "integration",
      "integrations",
      "suitescript",
      "netsuite",
      "erp",
      "experience",
    ],
    lines: (f) => f.pillars,
  },
  {
    name: "stack",
    keywords: ["stack", "tech", "technology", "technologies", "tools", "python", "built"],
    lines: (f) => [`flagship stack: ${f.stack.join(" · ")}`],
  },
  {
    name: "thesis",
    keywords: [
      "thesis",
      "philosophy",
      "guardrails",
      "guardrail",
      "approach",
      "deterministic",
      "llm",
      "llms",
      "ai",
    ],
    lines: (f) => [`"${f.thesis}"`, f.guardrailLine],
  },
  {
    // Deliberately no generic tokens ("you", "about") because they hijack
    // questions whose real subject lives in another route.
    name: "about",
    keywords: ["who", "vasu", "kasipuri", "yourself", "background", "bio", "role"],
    lines: (f) => [f.identity, `base: ${f.location}`],
  },
  {
    name: "help",
    keywords: ["help", "menu", "routes", "options", "commands"],
    lines: () => [
      "known routes: flagship · capabilities · certifications · writing · stack · thesis · github · linkedin · resume · contact",
    ],
  },
  {
    name: "greeting",
    keywords: ["hello", "hi", "hey", "namaste", "yo"],
    lines: () => [
      "hello. deterministic concierge here. try 'flagship', 'writing', or 'github'.",
    ],
  },
];

function routeQuery(
  facts: ConciergeFacts,
  raw: string,
): { route: string; lines: string[] } {
  const tokens = new Set(raw.toLowerCase().match(/[a-z0-9+#.-]+/g) ?? []);
  let best: Route | null = null;
  let bestScore = 0;
  for (const route of ROUTES) {
    const score = route.keywords.reduce(
      (n, keyword) => n + (tokens.has(keyword) ? 1 : 0),
      0,
    );
    if (score > bestScore) {
      best = route;
      bestScore = score;
    }
  }
  if (!best) {
    return {
      route: "no agent",
      lines: [
        "that routes to no agent. try 'flagship', 'writing', 'github', or 'help'.",
      ],
    };
  }
  return { route: best.name, lines: best.lines(facts) };
}

export default function AskConcierge({ facts }: { facts: ConciergeFacts }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const nextId = useRef(0);
  const logRef = useRef<HTMLDivElement | null>(null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const query = value.trim();
    if (!query || pending) return;
    setValue("");
    setPending(true);
    const result = routeQuery(facts, query);
    window.setTimeout(() => {
      setEntries((prev) => [
        ...prev.slice(-19),
        { id: nextId.current++, query, ...result },
      ]);
      setPending(false);
      requestAnimationFrame(() => {
        const el = logRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    }, RESPONSE_DELAY_MS);
  }

  return (
    <div className="border border-rule">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule bg-band/60 px-4 py-2.5">
        <span className="meta-label text-stamp-deep">
          ASK-000 · deterministic concierge
        </span>
        <span className="meta-label">this is the 80%: no LLM involved</span>
      </div>
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="h-52 overflow-y-auto px-4 py-3 font-mono text-[0.8125rem] leading-relaxed"
      >
        <p className="text-ink-muted">
          ASK-000 ready: pure keyword routing over the site&apos;s content
          layer. Try &ldquo;flagship&rdquo;, &ldquo;writing&rdquo;,
          &ldquo;github&rdquo;, or &ldquo;help&rdquo;.
        </p>
        {entries.map((entry) => (
          <div key={entry.id} className="mt-3">
            <p className="text-ink">&gt; {entry.query}</p>
            <p className="text-[0.625rem] uppercase tracking-[0.14em] text-stamp-deep">
              route: {entry.route}
            </p>
            {entry.lines.map((line, i) => (
              <p key={`${entry.id}-${i}`} className="text-ink-muted">
                {line}
              </p>
            ))}
          </div>
        ))}
        {pending ? <p className="mt-3 text-ink-muted">routing…</p> : null}
      </div>
      <form
        onSubmit={submit}
        className="flex items-baseline gap-2 border-t border-rule px-4 py-2.5"
      >
        <label
          htmlFor="ask000-input"
          className="font-mono text-[0.8125rem] text-stamp-deep"
          aria-label="Ask the concierge"
        >
          &gt;
        </label>
        <input
          id="ask000-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ask the concierge, e.g. what certifications?"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent font-mono text-[0.8125rem] text-ink placeholder:text-ink-muted/60 focus:outline-none"
        />
      </form>
    </div>
  );
}
