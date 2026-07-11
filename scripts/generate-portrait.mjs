/**
 * Renders public/portrait.webp — the About section's "personnel record"
 * plate — from a source photo, mapped onto the site's ink/paper duotone.
 *
 * Usage: npm run generate:portrait -- <path-to-source-photo>
 *
 * The crop below is tuned for the current source (2134×1984, face centered
 * around x≈1010). For a new photo, adjust CROP so the result is a 4:5
 * portrait centered on the face, or remove `.extract()` if the source is
 * already portrait-shaped.
 */
import sharp from "sharp";

const src = process.argv[2];
if (!src) {
  console.error("Usage: npm run generate:portrait -- <path-to-source-photo>");
  process.exit(1);
}

const OUT = new URL("../public/portrait.webp", import.meta.url).pathname
  .replace(/^\/(\w:)/, "$1");

const INK = [23, 35, 29]; // --color-ink
const PAPER = [250, 249, 242]; // --color-paper
const mult = PAPER.map((p, i) => (p - INK[i]) / 255);
const LUM = [0.2126, 0.7152, 0.0722];

const CROP = { left: 216, top: 0, width: 1587, height: 1984 };

await sharp(src)
  .extract(CROP)
  .recomb([LUM, LUM, LUM]) // 3-band grayscale so linear() can duotone it
  .normalise()
  .linear(mult, INK) // shadows → ink, highlights → paper
  .resize(640, 800)
  .webp({ quality: 80 })
  .toFile(OUT);

console.log("wrote", OUT);
