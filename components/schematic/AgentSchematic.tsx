"use client";

/**
 * The site's signature element: a live routing schematic of SYS-001.
 *
 * A canned natural-language query travels from the query box to the
 * orchestrator, fans out to the agents that own the answer, reaches NetSuite
 * through the MCP bus, and returns for synthesis. All motion is CSS
 * (stroke-dashoffset over pathLength-normalized traces) gated by data
 * attributes — with JavaScript disabled or prefers-reduced-motion set, the
 * component renders as a complete static diagram.
 *
 * Geometry lives in the two layout constants below; content (agents and
 * queries) comes from the content layer via props.
 */

import { useEffect, useState } from "react";
import type { AgentSpec, ExampleQuery } from "@/content/types";

type Phase =
  | "idle"
  | "ingest"
  | "route"
  | "fetch"
  | "return"
  | "synthesize"
  | "hold";

const NEXT_PHASE: Record<Exclude<Phase, "idle">, Phase> = {
  ingest: "route",
  route: "fetch",
  fetch: "return",
  return: "synthesize",
  synthesize: "hold",
  hold: "ingest",
};

const PHASE_DURATION_MS: Record<Exclude<Phase, "idle">, number> = {
  ingest: 750,
  route: 800,
  fetch: 1500,
  return: 1250,
  synthesize: 1000,
  hold: 1900,
};

/* ------------------------------------------------------ desktop geometry */
const D = {
  viewBox: "0 0 960 560",
  query: { x: 290, y: 24, w: 380, h: 44 },
  orch: { x: 360, y: 148, w: 240, h: 52 },
  agent: { y: 300, w: 148, h: 52, gap: 30 },
  busY: 244, // horizontal routing bus between orchestrator and agents
  mcp: { x: 50, y: 420, w: 860, h: 32 },
  ns: { x: 390, y: 500, w: 180, h: 48 },
};

function desktopAgentCenterX(index: number, count: number): number {
  const totalW = count * D.agent.w + (count - 1) * D.agent.gap;
  const startX = (960 - totalW) / 2;
  return startX + D.agent.w / 2 + index * (D.agent.w + D.agent.gap);
}

/* ------------------------------------------------------- mobile geometry */
const M = {
  viewBox: "0 0 360 608",
  query: { x: 20, y: 20, w: 320, h: 40 },
  orch: { x: 70, y: 92, w: 220, h: 48 },
  row: { x: 96, w: 220, h: 44, startY: 176, gap: 12 },
  leftSpineX: 40,
  rightRailX: 340,
  mcp: { x: 20, y: 476, w: 320, h: 32 },
  ns: { x: 90, y: 544, w: 180, h: 44 },
};

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

  const [animate, setAnimate] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [queryIndex, setQueryIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    // Let the trace draw-in finish before the first query runs.
    const timer = setTimeout(() => setPhase("ingest"), 1400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!animate || phase === "idle") return;
    const timer = setTimeout(() => {
      if (phase === "hold") {
        setQueryIndex((i) => (i + 1) % queries.length);
      }
      setPhase(NEXT_PHASE[phase]);
    }, PHASE_DURATION_MS[phase]);
    return () => clearTimeout(timer);
  }, [phase, animate, queries.length]);

  const query = queries[queryIndex];
  const activeSlugs = new Set(query.targetAgentSlugs);
  const ariaLabel = `Architecture schematic: a natural-language query flows to the ${
    orchestrator?.name ?? "Orchestrator"
  }, which routes it across ${specialists
    .map((a) => a.name)
    .join(", ")} — each reaching NetSuite through MCP.`;

  return (
    <figure className="m-0">
      <div
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

          {/* signals (one per trace, animated by phase) */}
          <path className="signal sig-ingest" pathLength={100} d="M480,68 V148" />
          <path
            className="signal sig-erp"
            pathLength={100}
            d={`M480,${D.mcp.y + D.mcp.h} V${D.ns.y}`}
          />

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
            key={queryIndex}
            className="query-text"
            x={480}
            y={D.query.y + 27}
            fontSize={13}
            textAnchor="middle"
          >
            {query.prompt}
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

        {/* Mobile layout (vertical spine) */}
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

          <path className="signal sig-ingest" pathLength={100} d="M180,60 V92" />
          <path
            className="signal sig-erp"
            pathLength={100}
            d={`M180,${M.mcp.y + M.mcp.h} V${M.ns.y}`}
          />

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
            key={queryIndex}
            className="query-text"
            x={180}
            y={M.query.y + 25}
            fontSize={11}
            textAnchor="middle"
          >
            {query.prompt}
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
        </svg>
      </div>

      <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className="meta-label text-stamp-deep">Fig. 01</span>
        <span className="font-mono text-[0.6875rem] tracking-[0.06em] text-ink-muted">
          SYS-001 routing schematic — live query delegation across subledger
          agents
        </span>
      </figcaption>
    </figure>
  );
}
