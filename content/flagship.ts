import type { CaseStudy } from "./types";

export const flagshipCaseStudy: CaseStudy = {
  id: "cs_sys001",
  slug: "netsuite-multi-agent-finance-intelligence",
  code: "SYS-001",
  title: "Multi-agent finance intelligence for NetSuite",
  subtitle:
    "A production-grade system of specialized AI agents that lets people ask their ERP real questions, in plain language, in real time.",
  problem: `An ERP already holds the answer to almost every question a finance team asks. What it lacks is the interface. Getting from "which invoices are about to age past 60 days" to an actual number means saved searches, report builders, and someone who knows exactly where to look.

The harder questions are worse, because they cross subledgers. Collections exposure touches receivables and reporting; a clean quarter summary touches AR, AP, and revenue at once. No single report answers them. A person does, slowly, by stitching modules together.`,
  approach: `This system puts a natural-language chat interface on NetSuite, built in Python on the Model Context Protocol (MCP). One orchestrator agent reads each query, routes it to the specialists that own the answer, coordinates them, and synthesizes a single response, including cross-functional answers no individual agent could produce alone.

Each specialist agent is scoped to one financial domain and reaches NetSuite only through MCP tool contracts, so every capability the system has is explicit, typed, and enumerable. Queries resolve against live ERP data, not an export.`,
  guardrails: `The design rule behind it is the same thesis as the rest of my work: the deterministic 80% stays deterministic. The LLM is reserved for what actually needs language (understanding the question, routing it, and synthesizing the answer) while the data access underneath stays scoped, observable, and auditable per agent. Guardrails are the architecture, not a feature flag.`,
  stack: [
    "Python",
    "Model Context Protocol (MCP)",
    "NetSuite (live ERP data)",
    "Multi-agent orchestration",
    "LLM-backed routing & synthesis",
  ],
  agents: [
    {
      id: "agent_orchestrator",
      slug: "orchestrator",
      name: "Orchestrator Agent",
      label: "ORCHESTRATOR",
      domain: "Coordination",
      responsibilities:
        "Routes queries, coordinates the specialist agents, and synthesizes cross-functional answers.",
      sortOrder: 0,
    },
    {
      id: "agent_ar",
      slug: "ar",
      name: "AR Agent",
      label: "AR",
      domain: "Accounts Receivable",
      responsibilities:
        "Invoices, customer payments, aging, and collections insights.",
      sortOrder: 1,
    },
    {
      id: "agent_ap",
      slug: "ap",
      name: "AP Agent",
      label: "AP",
      domain: "Accounts Payable",
      responsibilities: "Vendor bills, expenses, and payment status.",
      sortOrder: 2,
    },
    {
      id: "agent_revenue",
      slug: "revenue",
      name: "Revenue Agent",
      label: "REVENUE",
      domain: "Revenue Recognition",
      responsibilities:
        "Revenue recognition, deferred revenue, and ARR/MRR breakdowns.",
      sortOrder: 3,
    },
    {
      id: "agent_procurement",
      slug: "procurement",
      name: "Procurement Agent",
      label: "PROCUREMENT",
      domain: "Procure to Pay",
      responsibilities: "Purchase orders, vendor records, and approval workflows.",
      sortOrder: 4,
    },
    {
      id: "agent_reporting",
      slug: "reporting",
      name: "Reporting Agent",
      label: "REPORTING",
      domain: "Analytics",
      responsibilities: "Financial summaries and ad-hoc analytics.",
      sortOrder: 5,
    },
  ],
  exampleQueries: [
    {
      id: "q_aging",
      prompt: "Which invoices are 60+ days past due?",
      targetAgentSlugs: ["ar"],
    },
    {
      id: "q_bills",
      prompt: "Any vendor bills still awaiting payment?",
      targetAgentSlugs: ["ap"],
    },
    {
      id: "q_deferred",
      prompt: "Break down deferred revenue by month.",
      targetAgentSlugs: ["revenue"],
    },
    {
      id: "q_pos",
      prompt: "Which POs are stuck in approval?",
      targetAgentSlugs: ["procurement"],
    },
    {
      id: "q_quarter",
      prompt: "Summarize the quarter across AR and AP.",
      targetAgentSlugs: ["ar", "ap", "reporting"],
    },
  ],
  // [TODO: Vasu - add 2-3 sentences on outcomes/metrics and a screenshot or
  // demo link if available. Rendered in the case study once non-null.]
  outcomes: null,
};
