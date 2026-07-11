/**
 * Renders public/og.png (1200×630) from an inline SVG design.
 * Run with: npm run generate:og   (requires devDependency: sharp)
 *
 * The card mirrors the site's "Green-Bar" system: ledger paper, green-bar
 * banding, hairline rules, the SYS-001 mini-schematic, and the vermilion
 * stamp accent.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PAPER = "#faf9f2";
const BAND = "#e9efe4";
const RULE = "#c9d4c5";
const RULE_STRONG = "#8fa48b";
const INK = "#17231d";
const INK_MUTED = "#54655a";
const STAMP = "#b23a18";

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "Consolas, 'Courier New', monospace";

const bands = Array.from({ length: 10 }, (_, i) => {
  const y = i * 64;
  return i % 2 === 0 ? `<rect x="0" y="${y}" width="1200" height="32" fill="${BAND}"/>` : "";
}).join("");

// Mini routing schematic, right side.
const agents = ["AR", "AP", "REV", "PROC", "RPT"];
const agentBoxes = agents
  .map((label, i) => {
    const x = 795 + i * 78;
    return `
      <path d="M990,300 V330 H${x + 29} V360" fill="none" stroke="${RULE_STRONG}" stroke-width="2"/>
      <rect x="${x}" y="360" width="58" height="40" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
      <text x="${x + 29}" y="385" font-family="${MONO}" font-size="15" fill="${INK}" text-anchor="middle">${label}</text>
      <path d="M${x + 29},400 V438" fill="none" stroke="${RULE_STRONG}" stroke-width="2"/>`;
  })
  .join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  ${bands}
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="${INK}" stroke-width="3"/>
  <line x1="64" y1="0" x2="64" y2="630" stroke="${STAMP}" stroke-width="2" opacity="0.6"/>

  <text x="96" y="96" font-family="${MONO}" font-size="22" letter-spacing="4" fill="${INK_MUTED}">VASU KASIPURI · PORTFOLIO / FY2026</text>

  <text x="96" y="210" font-family="${SERIF}" font-size="64" font-weight="700" fill="${INK}">NetSuite Architect.</text>
  <text x="96" y="290" font-family="${SERIF}" font-size="64" font-weight="700" fill="${INK}">Agentic AI for</text>
  <text x="96" y="370" font-family="${SERIF}" font-size="64" font-weight="700" fill="${INK}">enterprise finance.</text>

  <text x="96" y="450" font-family="${MONO}" font-size="24" fill="${INK_MUTED}">12+ years automating ERP and revenue at scale</text>

  <rect x="96" y="500" width="330" height="46" fill="none" stroke="${STAMP}" stroke-width="2.5"/>
  <text x="261" y="530" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${STAMP}" text-anchor="middle">GUARDRAILS FIRST</text>

  <!-- mini schematic -->
  <rect x="900" y="230" width="180" height="44" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
  <text x="990" y="258" font-family="${MONO}" font-size="16" fill="${INK}" text-anchor="middle">ORCHESTRATOR</text>
  <path d="M990,274 V300" fill="none" stroke="${RULE_STRONG}" stroke-width="2"/>
  ${agentBoxes}
  <rect x="795" y="438" width="368" height="34" fill="${BAND}" stroke="${INK}" stroke-width="2"/>
  <text x="979" y="460" font-family="${MONO}" font-size="15" fill="${INK}" text-anchor="middle">MCP · NETSUITE</text>
  <circle cx="990" cy="210" r="6" fill="${STAMP}"/>

  <line x1="96" y1="580" x2="1104" y2="580" stroke="${RULE}" stroke-width="2"/>
</svg>`;

const outDir = path.resolve("public");
await mkdir(outDir, { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, "og.png"));
console.log("Wrote public/og.png");
