"use client";

/**
 * The site's signature element: a live routing schematic of SYS-001, run as
 * a self-looping demonstration of the query lifecycle.
 *
 * Each cycle: a natural-language query types itself into the query node
 * (Phase A), the orchestrator routes it and only the relevant agent paths
 * illuminate in sequence (Phase B), data fetches over MCP and returns, and a
 * synthesized answer streams token-by-token into the answer chip (Phase C),
 * holds, then the next query begins (Phase D). Signal motion is CSS
 * (stroke-dashoffset over pathLength-normalized traces) gated by data
 * attributes; the typewriter and token stream are two small intervals. The
 * loop pauses off-viewport via IntersectionObserver. With JavaScript
 * disabled or prefers-reduced-motion set, the component renders the
 * completed state statically: query shown, route lit, answer displayed.
 *
 * Geometry lives in the two layout constants below; content (agents and
 * queries) comes from the content layer via props. The answer strings are
 * demo choreography — deliberately illustrative, keyed by content-layer
 * query id, and NOT part of the table-shaped content model.
 */

import { useEffect, useRef, useState } from "react";
import type { AgentSpec, ExampleQuery } from "@/content/types";

type Phase =
  | "idle"
  | "type"
  | "ingest"
  | "route"
  | "fetch"
  | "return"
  | "synthesize"
  | "answer"
  | "hold";

const NEXT_PHASE: Record<Exclude<Phase, "idle">, Phase> = {
  type: "ingest",
  ingest: "route",
  route: "fetch",
  fetch: "return",
  return: "synthesize",
  synthesize: "answer",
  answer: "hold",
  hold: "type",
};

const TYPE_MS_PER_CHAR = 26;
const ANSWER_MS_PER_TOKEN = 110;

/** Illustrative demo output per query — plausible, never real client data. */
const DEMO_ANSWERS: Record<string, string> = {
  q_aging: "14 invoices · $86K · 3 flagged",
  q_bills: "9 bills open · $54K due",
  q_deferred: "$412K deferred · 6 rows",
  q_pos: "5 POs waiting · oldest 11 days",
  q_quarter: "AR ↓12% · AP flat · brief ready",
};
const FALLBACK_ANSWER = "synthesized · sources cited";

function phaseDurationMs(
  phase: Exclude<Phase, "idle">,
  promptLength: number,
  tokenCount: number,
  activeCount: number,
): number {
  switch (phase) {
    case "type":
      return promptLength * TYPE_MS_PER_CHAR + 550;
    case "ingest":
      return 750;
    case "route":
      return 700 + Math.max(0, activeCount - 1) * 200;
    case "fetch":
      return 1500;
    case "return":
      return 1250;
    case "synthesize":
      return 1050;
    case "answer":
      return tokenCount * ANSWER_MS_PER_TOKEN + 400;
    case "hold":
      return 2400;
  }
}

/* ------------------------------------------------------ desktop geometry */
const D = {
  viewBox: "0 0 960 560",
  query: { x: 290, y: 24, w: 380, h: 44 },
  answer: { x: 690, y: 24, w: 250, h: 44 },
  orch: { x: 360, y: 148, w: 240, h: 52 },
  agent: { y: 300, w: 148, h: 52, gap: 30 },
  busY: 244, // horizontal routing bus between orchestrator and agents
  mcp: { x: 50, y: 420, w: 860, h: 32 },
  ns: { x: 390, y: 500, w: 180, h: 48 },
};

// Synthesized answer returns from the orchestrator's right edge up to the chip.
const D_SYNTH_PATH = `M${D.orch.x + D.orch.w},${D.orch.y + 26} H${
  D.answer.x + D.answer.w / 2
} V${D.answer.y + D.answer.h}`;

function desktopAgentCenterX(index: number, count: number): number {
  const totalW = count * D.agent.w + (count - 1) * D.agent.gap;
  const startX = (960 - totalW) / 2;
  return startX + D.agent.w / 2 + index * (D.agent.w + D.agent.gap);
}

/* ------------------------------------------------------- mobile geometry */
const M = {
  viewBox: "0 0 360 668",
  query: { x: 20, y: 20, w: 320, h: 40 },
  orch: { x: 70, y: 92, w: 220, h: 48 },
  row: { x: 96, w: 220, h: 44, startY: 176, gap: 12 },
  leftSpineX: 40,
  rightRailX: 340,
  mcp: { x: 20, y: 476, w: 320, h: 32 },
  ns: { x: 90, y: 544, w: 180, h: 44 },
  // On the phone spine the answer reads as the closing totals row.
  answer: { x: 20, y: 608, w: 320, h: 44 },
};

const M_SYNTH_PATH = `M180,${M.ns.y + M.ns.h} V${M.answer.y}`;

function mobileRowTop(index: number): number {
  return M.row.startY + index * (M.row.h + M.row.gap);
}

export default function AgentSchematic({
  agents,
  queries,
}: {
  agents: AgentSpec[];
  queries: ExampleQuery[];
}) {
  const orchestrator = agents.find((a) => a.slug === "orchestrator");
  const specialists = agents.filter((a) => a.slug !== "orchestrator");

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [animate, setAnimate] = useState(false);
  const [inView, setInView] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [queryIndex, setQueryIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [answerTokens, setAnswerTokens] = useState(0);

  const query = queries[queryIndex];
  const answer = DEMO_ANSWERS[query.id] ?? FALLBACK_ANSWER;
  const answerTokenList = answer.split(" ");
  const activeSlugs = new Set(query.targetAgentSlugs);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    // Let the trace draw-in finish before the first query types.
    const timer = setTimeout(() => setPhase("type"), 1400);
    return () => clearTimeout(timer);
  }, []);

  // Pause the loop while the schematic is off-viewport — no background burn.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animate || !inView || phase === "idle") return;

    let interval: number | undefined;
    if (phase === "type") {
      interval = window.setInterval(() => {
        setTypedChars((c) => Math.min(c + 1, query.prompt.length));
      }, TYPE_MS_PER_CHAR);
    } else if (phase === "answer") {
      interval = window.setInterval(() => {
        setAnswerTokens((t) => Math.min(t + 1, answerTokenList.length));
      }, ANSWER_MS_PER_TOKEN);
    }

    const timer = window.setTimeout(
      () => {
        if (phase === "type") setTypedChars(query.prompt.length);
        if (phase === "answer") setAnswerTokens(answerTokenList.length);
        if (phase === "hold") {
          setTypedChars(0);
          setAnswerTokens(0);
          setQueryIndex((i) => (i + 1) % queries.length);
        }
        setPhase(NEXT_PHASE[phase]);
      },
      phaseDurationMs(
        phase,
        query.prompt.length,
        answerTokenList.length,
        query.targetAgentSlugs.length,
      ),
    );

    return () => {
      if (interval !== undefined) window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [phase, animate, inView, queryIndex, query, answerTokenList.length, queries.length]);

  // Static fallbacks (SSR, no JS, reduced motion) show the completed state.
  const shownQuery = animate ? query.prompt.slice(0, typedChars) : query.prompt;
  const shownAnswer = animate
    ? answerTokenList.slice(0, answerTokens).join(" ")
    : answer;
  const typingCaret = animate && phase === "type";
  const answerCaret = animate && phase === "answer";

  const ariaLabel = `Architecture schematic, shown as a self-running demonstration with illustrative data: a natural-language query flows to the ${
    orchestrator?.name ?? "Orchestrator"
  }, which routes it across ${specialists
    .map((a) => a.name)
    .join(", ")} — each reaching NetSuite through MCP — and returns a synthesized answer.`;

  const staggerStyle = (agentSlug: string): React.CSSProperties | undefined => {
    if (!activeSlugs.has(agentSlug)) return undefined;
    const activeOrder = specialists
      .filter((a) => activeSlugs.has(a.slug))
      .findIndex((a) => a.slug === agentSlug);
    return { "--stagger": `${activeOrder * 200}ms` } as React.CSSProperties;
  };

  return (
    <figure className="m-0">
      <div
        ref={rootRef}
        className={`schematic${animate ? " animate-in" : ""}`}
        data-phase={phase}
      >
        {/* Desktop / tablet layout */}
        <svg
          viewBox={D.viewBox}
          role="img"
          aria-label={ariaLabel}
          className="hidden w-full md:block"
        >
          {/* traces */}
          <path className="trace sig-none" pathLength={100} d="M480,68 V148" />
          <g className="layer-route">
            {specialists.map((agent, i) => {
              const cx = desktopAgentCenterX(i, specialists.length);
              return (
                <path
                  key={agent.id}
                  className="trace"
                  pathLength={100}
                  d={`M480,${D.orch.y + D.orch.h} V${D.busY} H${cx} V${D.agent.y}`}
                />
              );
            })}
          </g>
          <g className="layer-fetch">
            {specialists.map((agent, i) => {
              const cx = desktopAgentCenterX(i, specialists.length);
              return (
                <path
                  key={agent.id}
                  className="trace"
                  pathLength={100}
                  d={`M${cx},${D.agent.y + D.agent.h} V${D.mcp.y}`}
                />
              );
            })}
          </g>
          <g className="layer-erp">
            <path
              className="trace"
              pathLength={100}
              d={`M480,${D.mcp.y + D.mcp.h} V${D.ns.y}`}
            />
          </g>
          <g className="layer-synth">
            <path className="trace" pathLength={100} d={D_SYNTH_PATH} />
          </g>

          {/* signals (one per trace, animated by phase) */}
          <path className="signal sig-ingest" pathLength={100} d="M480,68 V148" />
          <path
            className="signal sig-erp"
            pathLength={100}
            d={`M480,${D.mcp.y + D.mcp.h} V${D.ns.y}`}
          />
          <path className="signal sig-synth" pathLength={100} d={D_SYNTH_PATH} />

          {/* query box */}
          <text className="sublabel" x={D.query.x} y={16} fontSize={8.5}>
            NL QUERY
          </text>
          <rect
            className="node"
            x={D.query.x}
            y={D.query.y}
            width={D.query.w}
            height={D.query.h}
          />
          <text
            className="query-text"
            x={D.query.x + 14}
            y={D.query.y + 27}
            fontSize={13}
          >
            {shownQuery}
            {typingCaret && <tspan className="caret">_</tspan>}
          </text>

          {/* synthesized answer chip */}
          <text className="sublabel" x={D.answer.x} y={16} fontSize={8.5}>
            SYNTHESIS · ILLUSTRATIVE
          </text>
          <rect
            className="node node-answer"
            x={D.answer.x}
            y={D.answer.y}
            width={D.answer.w}
            height={D.answer.h}
          />
          <text
            className="answer-text"
            x={D.answer.x + 12}
            y={D.answer.y + 27}
            fontSize={11.5}
          >
            {shownAnswer}
            {answerCaret && <tspan className="caret">_</tspan>}
          </text>

          {/* orchestrator */}
          <g className="orchestrator">
            <rect
              className="node node-orchestrator"
              x={D.orch.x}
              y={D.orch.y}
              width={D.orch.w}
              height={D.orch.h}
            />
            <text
              className="label"
              x={480}
              y={D.orch.y + 24}
              fontSize={11.5}
              textAnchor="middle"
            >
              {orchestrator?.label ?? "ORCHESTRATOR"}
            </text>
            <text
              className="sublabel"
              x={480}
              y={D.orch.y + 40}
              fontSize={8.5}
              textAnchor="middle"
            >
              routes · coordinates · synthesizes
            </text>
          </g>

          {/* specialist agents */}
          {specialists.map((agent, i) => {
            const cx = desktopAgentCenterX(i, specialists.length);
            const x = cx - D.agent.w / 2;
            const active = activeSlugs.has(agent.slug);
            return (
              <g
                key={agent.id}
                className={`agent${active ? " is-active" : ""}`}
                style={staggerStyle(agent.slug)}
              >
                <path
                  className="signal sig-route"
                  pathLength={100}
                  d={`M480,${D.orch.y + D.orch.h} V${D.busY} H${cx} V${D.agent.y}`}
                />
                <path
                  className="signal sig-fetch"
                  pathLength={100}
                  d={`M${cx},${D.agent.y + D.agent.h} V${D.mcp.y}`}
                />
                <rect
                  className="node"
                  x={x}
                  y={D.agent.y}
                  width={D.agent.w}
                  height={D.agent.h}
                />
                <circle
                  className="agent-dot"
                  cx={x + D.agent.w - 12}
                  cy={D.agent.y + 12}
                  r={3.5}
                />
                <text
                  className="label"
                  x={cx}
                  y={D.agent.y + 22}
                  fontSize={11}
                  textAnchor="middle"
                >
                  {agent.label}
                </text>
                <text
                  className="sublabel"
                  x={cx}
                  y={D.agent.y + 38}
                  fontSize={8.5}
                  textAnchor="middle"
                >
                  {agent.domain.toLowerCase()}
                </text>
              </g>
            );
          })}

          {/* MCP bus */}
          <rect
            className="node-band"
            x={D.mcp.x}
            y={D.mcp.y}
            width={D.mcp.w}
            height={D.mcp.h}
          />
          <text
            className="label"
            x={480}
            y={D.mcp.y + 20}
            fontSize={10}
            textAnchor="middle"
          >
            MCP · MODEL CONTEXT PROTOCOL — PYTHON
          </text>

          {/* NetSuite */}
          <rect
            className="node"
            x={D.ns.x}
            y={D.ns.y}
            width={D.ns.w}
            height={D.ns.h}
          />
          <text
            className="label"
            x={480}
            y={D.ns.y + 22}
            fontSize={11}
            textAnchor="middle"
          >
            NETSUITE
          </text>
          <text
            className="sublabel"
            x={480}
            y={D.ns.y + 38}
            fontSize={8.5}
            textAnchor="middle"
          >
            system of record
          </text>
        </svg>

        {/* Mobile layout (vertical spine — answer closes the report at the bottom) */}
        <svg
          viewBox={M.viewBox}
          role="img"
          aria-label={ariaLabel}
          className="w-full md:hidden"
        >
          <path className="trace" pathLength={100} d="M180,60 V92" />
          <g className="layer-route">
            {specialists.map((agent, i) => {
              const cy = mobileRowTop(i) + M.row.h / 2;
              return (
                <path
                  key={agent.id}
                  className="trace"
                  pathLength={100}
                  d={`M180,${M.orch.y + M.orch.h} V158 H${M.leftSpineX} V${cy} H${M.row.x}`}
                />
              );
            })}
          </g>
          <g className="layer-fetch">
            {specialists.map((agent, i) => {
              const cy = mobileRowTop(i) + M.row.h / 2;
              return (
                <path
                  key={agent.id}
                  className="trace"
                  pathLength={100}
                  d={`M${M.row.x + M.row.w},${cy} H${M.rightRailX} V${M.mcp.y}`}
                />
              );
            })}
          </g>
          <g className="layer-erp">
            <path
              className="trace"
              pathLength={100}
              d={`M180,${M.mcp.y + M.mcp.h} V${M.ns.y}`}
            />
          </g>
          <g className="layer-synth">
            <path className="trace" pathLength={100} d={M_SYNTH_PATH} />
          </g>

          <path className="signal sig-ingest" pathLength={100} d="M180,60 V92" />
          <path
            className="signal sig-erp"
            pathLength={100}
            d={`M180,${M.mcp.y + M.mcp.h} V${M.ns.y}`}
          />
          <path className="signal sig-synth" pathLength={100} d={M_SYNTH_PATH} />

          <text className="sublabel" x={M.query.x} y={14} fontSize={8.5}>
            NL QUERY
          </text>
          <rect
            className="node"
            x={M.query.x}
            y={M.query.y}
            width={M.query.w}
            height={M.query.h}
          />
          <text
            className="query-text"
            x={M.query.x + 12}
            y={M.query.y + 25}
            fontSize={11}
          >
            {shownQuery}
            {typingCaret && <tspan className="caret">_</tspan>}
          </text>

          <g className="orchestrator">
            <rect
              className="node node-orchestrator"
              x={M.orch.x}
              y={M.orch.y}
              width={M.orch.w}
              height={M.orch.h}
            />
            <text
              className="label"
              x={180}
              y={M.orch.y + 20}
              fontSize={11}
              textAnchor="middle"
            >
              {orchestrator?.label ?? "ORCHESTRATOR"}
            </text>
            <text
              className="sublabel"
              x={180}
              y={M.orch.y + 36}
              fontSize={8}
              textAnchor="middle"
            >
              routes · coordinates · synthesizes
            </text>
          </g>

          {specialists.map((agent, i) => {
            const top = mobileRowTop(i);
            const cy = top + M.row.h / 2;
            const active = activeSlugs.has(agent.slug);
            return (
              <g
                key={agent.id}
                className={`agent${active ? " is-active" : ""}`}
                style={staggerStyle(agent.slug)}
              >
                <path
                  className="signal sig-route"
                  pathLength={100}
                  d={`M180,${M.orch.y + M.orch.h} V158 H${M.leftSpineX} V${cy} H${M.row.x}`}
                />
                <path
                  className="signal sig-fetch"
                  pathLength={100}
                  d={`M${M.row.x + M.row.w},${cy} H${M.rightRailX} V${M.mcp.y}`}
                />
                <rect
                  className="node"
                  x={M.row.x}
                  y={top}
                  width={M.row.w}
                  height={M.row.h}
                />
                <circle className="agent-dot" cx={300} cy={cy} r={3} />
                <text
                  className="label"
                  x={M.row.x + 14}
                  y={top + 19}
                  fontSize={10.5}
                >
                  {agent.label}
                </text>
                <text
                  className="sublabel"
                  x={M.row.x + 14}
                  y={top + 33}
                  fontSize={8}
                >
                  {agent.domain.toLowerCase()}
                </text>
              </g>
            );
          })}

          <rect
            className="node-band"
            x={M.mcp.x}
            y={M.mcp.y}
            width={M.mcp.w}
            height={M.mcp.h}
          />
          <text
            className="label"
            x={180}
            y={M.mcp.y + 20}
            fontSize={9}
            textAnchor="middle"
          >
            MCP · MODEL CONTEXT PROTOCOL
          </text>

          <rect
            className="node"
            x={M.ns.x}
            y={M.ns.y}
            width={M.ns.w}
            height={M.ns.h}
          />
          <text
            className="label"
            x={180}
            y={M.ns.y + 19}
            fontSize={10.5}
            textAnchor="middle"
          >
            NETSUITE
          </text>
          <text
            className="sublabel"
            x={180}
            y={M.ns.y + 34}
            fontSize={8}
            textAnchor="middle"
          >
            system of record
          </text>

          {/* synthesized answer chip */}
          <rect
            className="node node-answer"
            x={M.answer.x}
            y={M.answer.y}
            width={M.answer.w}
            height={M.answer.h}
          />
          <text
            className="sublabel"
            x={M.answer.x + 12}
            y={M.answer.y + 15}
            fontSize={7.5}
          >
            SYNTHESIS · ILLUSTRATIVE
          </text>
          <text
            className="answer-text"
            x={M.answer.x + 12}
            y={M.answer.y + 32}
            fontSize={10.5}
          >
            {shownAnswer}
            {answerCaret && <tspan className="caret">_</tspan>}
          </text>
        </svg>
      </div>

      <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="meta-label text-stamp-deep">Fig. 01</span>
        <span className="font-mono text-[0.6875rem] tracking-[0.06em] text-ink-muted">
          SYS-001 routing schematic — live query delegation across subledger
          agents · illustrative demo data
        </span>
      </figcaption>
    </figure>
  );
}
