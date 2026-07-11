/**
 * Renders an on-brand blog banner (1200×630 — doubles as the post's Open
 * Graph image) into public/blog/banners/<slug>.png.
 *
 * Usage:
 *   npm run generate:banner -- <slug> "<title>" "<TAG · TAG · TAG>"
 *
 * Example:
 *   npm run generate:banner -- rag-internals-embeddings-layer \
 *     "RAG internals: what the embeddings layer is actually doing" \
 *     "RAG · EMBEDDINGS · AI ARCHITECTURE"
 *
 * Then reference it from the post's `banner` field in content/posts.ts:
 *   banner: { src: "/blog/banners/<slug>.png", alt: "...", width: 1200, height: 630 }
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [slug, title, tagLine = "WRITING"] = process.argv.slice(2);
if (!slug || !title) {
  console.error('Usage: npm run generate:banner -- <slug> "<title>" "<TAG · TAG>"');
  process.exit(1);
}

const PAPER = "#faf9f2";
const BAND = "#e9efe4";
const RULE = "#c9d4c5";
const INK = "#17231d";
const INK_MUTED = "#54655a";
const STAMP = "#b23a18";

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "Consolas, 'Courier New', monospace";

const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

// Greedy word-wrap for the SVG title (no text wrapping in librsvg).
function wrap(text, maxChars = 30, maxLines = 3) {
  const words = text.split(/\s+/);
  const lines = [""];
  for (const word of words) {
    const current = lines[lines.length - 1];
    if (current && (current + " " + word).length > maxChars) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = current ? `${current} ${word}` : word;
    }
  }
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{3}$/, "") + "…";
  }
  return lines;
}

const lines = wrap(title);
const titleSize = lines.length === 3 ? 56 : 62;
const lineHeight = titleSize * 1.18;
const titleStartY = 285 - ((lines.length - 1) * lineHeight) / 2;

const bands = Array.from({ length: 10 }, (_, i) =>
  i % 2 === 0
    ? `<rect x="0" y="${i * 64}" width="1200" height="32" fill="${BAND}"/>`
    : "",
).join("");

const titleText = lines
  .map(
    (line, i) =>
      `<text x="128" y="${Math.round(titleStartY + i * lineHeight)}" font-family="${SERIF}" font-size="${titleSize}" font-weight="700" fill="${INK}">${esc(line)}</text>`,
  )
  .join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${PAPER}"/>
  ${bands}
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="${INK}" stroke-width="3"/>
  <line x1="88" y1="0" x2="88" y2="630" stroke="${STAMP}" stroke-width="2" opacity="0.6"/>

  <text x="128" y="120" font-family="${MONO}" font-size="21" letter-spacing="4" fill="${STAMP}">ACCT 4000 · WRITING</text>
  <text x="128" y="158" font-family="${MONO}" font-size="19" letter-spacing="3" fill="${INK_MUTED}">${esc(tagLine.toUpperCase())}</text>

  ${titleText}

  <line x1="128" y1="520" x2="1104" y2="520" stroke="${RULE}" stroke-width="2"/>
  <text x="128" y="566" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${INK}">VASU KASIPURI</text>
  <text x="1104" y="566" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${INK_MUTED}" text-anchor="end">NETSUITE ARCHITECT</text>
</svg>`;

const outDir = path.resolve("public", "blog", "banners");
await mkdir(outDir, { recursive: true });
const outFile = path.join(outDir, `${slug}.png`);
await sharp(Buffer.from(svg)).png().toFile(outFile);
console.log("Wrote", outFile);
