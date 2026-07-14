/**
 * Post-build gate: every blog post in the export must carry its OWN
 * Open Graph image, and the file it points at must exist in out/.
 *
 * This is what LinkedIn renders when a post is shared: a post that falls
 * back to the site-wide /og.png (or to a dead path) fails the build with
 * instructions instead of shipping a broken card. Also confirms feed.xml
 * and the search index made it into the export.
 *
 * Runs automatically via the `postbuild` npm script.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const OUT = path.resolve("out");
const BLOG = path.join(OUT, "blog");
const NOT_POSTS = new Set(["banners", "page"]);

if (!existsSync(BLOG)) {
  console.error("verify-og: out/blog missing; run after `next build`.");
  process.exit(1);
}

const failures = [];

const postDirs = readdirSync(BLOG, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      !NOT_POSTS.has(entry.name) &&
      !entry.name.startsWith("__next") &&
      existsSync(path.join(BLOG, entry.name, "index.html")),
  )
  .map((entry) => entry.name);

for (const slug of postDirs) {
  const htmlPath = path.join(BLOG, slug, "index.html");
  const html = readFileSync(htmlPath, "utf8");
  const match = html.match(/<meta property="og:image" content="([^"]+)"/);

  if (!match) {
    failures.push(`${slug}: no og:image meta tag in the rendered page.`);
    continue;
  }

  let pathname;
  try {
    pathname = new URL(match[1], "https://placeholder.invalid").pathname;
  } catch {
    failures.push(`${slug}: og:image is not a valid URL (${match[1]}).`);
    continue;
  }

  if (pathname === "/og.png") {
    failures.push(
      `${slug}: og:image is the site-wide card, not its own. ` +
        `Generate one: npm run generate:banner -- ${slug} "<title>" "<TAG · TAG>" ` +
        `and set the post's banner field.`,
    );
    continue;
  }

  const file = path.join(OUT, decodeURIComponent(pathname));
  if (!existsSync(file)) {
    failures.push(`${slug}: og:image points at ${pathname} but no such file is in out/.`);
  }
}

for (const artifact of ["feed.xml", path.join("blog", "search-index.json")]) {
  if (!existsSync(path.join(OUT, artifact))) {
    failures.push(`missing build artifact: ${artifact}`);
  }
}

if (failures.length > 0) {
  console.error("verify-og: FAILED");
  for (const failure of failures) console.error(" ✗ " + failure);
  process.exit(1);
}

console.log(
  `verify-og: OK. ${postDirs.length} post(s) each carry their own og:image; feed.xml and search index present.`,
);
