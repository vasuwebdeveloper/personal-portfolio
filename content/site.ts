import { SITE_URL } from "@/lib/site";
import type { SiteProfile } from "./types";

export const siteProfile: SiteProfile = {
  name: "Vasu Kasipuri",
  role: "NetSuite Architect · Agentic AI for Enterprise Finance",
  identity:
    "NetSuite Architect building production-grade agentic AI for enterprise finance — 12+ years automating ERP and revenue at scale.",
  thesis:
    "80% is a solved problem pretending to need AI. The other 20% actually needs an LLM.",
  thesisAlternates: [
    "The hard part of enterprise AI isn't the model. It's the ledger it has to answer to.",
    "Intelligence you can't reconcile is a liability. I build the kind you can audit.",
  ],
  focus: [
    "Guardrails",
    "Observability",
    "Orchestration",
    "Reconciliation",
    "Audit-ready",
  ],
  // [TODO: Vasu — LinkedIn shows Bengaluru; pick which city to display.]
  location: "Hyderabad, India",
  email: "kasipurivasu@gmail.com",
  links: [
    {
      id: "link_linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/vasu-kasipuri/",
    },
    {
      id: "link_github",
      // [TODO: Vasu — verify exact GitHub username spelling.]
      label: "GitHub",
      href: "https://github.com/vasuwebdeveloper",
    },
  ],
  resumePath: "/resume.pdf",
  // Single source of truth: NEXT_PUBLIC_SITE_URL env var with a fallback in
  // lib/site.ts. Do not hardcode a URL here.
  siteUrl: SITE_URL,
  description:
    "NetSuite Architect building production-grade agentic AI for enterprise finance — 12+ years designing reliable, observable, audit-ready ERP and revenue automation at scale.",
  about: `Twelve years ago I started automating the unglamorous middle of the enterprise — orders, invoices, ledgers, the systems that have to be right. Since then I have designed and scaled back-office platforms for high-growth businesses: API-driven architectures, financial and operational workflows, and SOX-compliant systems that pass audits without heroics.

That work now converges somewhere specific: AI-driven financial automation. Not chatbots bolted onto an ERP — agentic systems with guardrails, observability, and reconciliation designed in from day one, so the people who actually run the business can ask their systems real questions and trust the answers.`,
  // Regenerate with: npm run generate:portrait -- <path-to-source-photo>
  portrait: {
    src: "/portrait.webp",
    alt: "Vasu Kasipuri — portrait printed as an ink duotone plate",
    width: 640,
    height: 800,
  },
};
