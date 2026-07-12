"use client";

/**
 * ASK-000 — the deterministic concierge.
 *
 * The joke is the brand: this is the site's own thesis in miniature. Visitor
 * questions are routed by a keyword switch — no network calls, no model, no
 * fake thinking — over facts the server component pre-shaped from the
 * content layer. The one artificial delay is a short, honest beat
 * (RESPONSE_DELAY_MS) so answers land like a terminal, not a popup.
 */

import { useRef, useState } from "react";

export interface ConciergeFacts {
  name: string;
  role: string;
  email: string;
  location: string;
  hasResume: boolean;
  pillars: string[];
  certifications: string[];
  flagship: { code: string; title: string; agentNames: string[] };
}

type Entry = { id: number; query: string; route: string; lines: string[] };

const RESPONSE_DELAY_MS = 280;

function routeQuery(
  facts: ConciergeFacts,
  raw: string,
): { route: string; lines: string[] } {
  const q = raw.toLowerCase();

  if (/cert|credential|suitefoundation/.test(q)) {
    return { route: "certifications", lines: facts.certifications };
  }
  if (/flagship|sys.?001|agent|mcp|orchestr|demo|schematic/.test(q)) {
    return {
      route: "flagship",
      lines: [
        `${facts.flagship.code} — ${facts.flagship.title}`,
        `agents: ${facts.flagship.agentNames.join(" · ")}`,
        "full write-up in the case study above.",
      ],
    };
  }
  if (/capab|skill|pillar|stack|service|what (do|can)|build/.test(q)) {
    return { route: "capabilities", lines: facts.pillars };
  }
  if (/resume|\bcv\b/.test(q)) {
    return {
      route: "contact",
      lines: facts.hasResume
        ? ["resume: Download PDF in the contact ledger above."]
        : ["resume: being re-typeset — email for the latest copy."],
    };
  }
  if (/contact|email|reach|hire|touch|available/.test(q)) {
    return {
      route: "contact",
      lines: [`email: ${facts.email}`, `base: ${facts.location}`],
    };
  }
  if (/who|about|vasu|yourself/.test(q)) {
    return {
      route: "about",
      lines: [`${facts.name} — ${facts.role}. ${facts.location}.`],
    };
  }
  if (/help|menu|route/.test(q)) {
    return {
      route: "help",
      lines: [
        "known routes: flagship · capabilities · certifications · contact · resume",
      ],
    };
  }
  return {
    route: "no agent",
    lines: ["that routes to no agent — try 'certifications' or 'flagship'."],
  };
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
        <span className="meta-label">this is the 80% — no LLM involved</span>
      </div>
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        className="h-52 overflow-y-auto px-4 py-3 font-mono text-[0.8125rem] leading-relaxed"
      >
        <p className="text-ink-muted">
          ASK-000 ready — pure keyword routing over the site&apos;s content
          layer. Try &ldquo;flagship&rdquo;, &ldquo;certifications&rdquo;, or
          &ldquo;contact&rdquo;.
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
          placeholder="ask the concierge — e.g. what certifications?"
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-transparent font-mono text-[0.8125rem] text-ink placeholder:text-ink-muted/60 focus:outline-none"
        />
      </form>
    </div>
  );
}
