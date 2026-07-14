import {
  createHighlighter,
  type Highlighter,
  type ThemeRegistration,
} from "shiki";

/**
 * Build-time syntax highlighting (Shiki) in the site's own ink.
 *
 * The theme is the Green-Bar palette applied to code: ink for prose-weight
 * tokens, stamp-deep for keywords (the AI/emphasis layer), annotation blue
 * for strings, muted ink for comments. Hex values mirror the tokens in
 * app/globals.css; if those change, update these to match (same doctrine
 * as the asset scripts in /scripts).
 *
 * Runs only inside server components at build time; no highlighting
 * JavaScript ships to the client.
 */

const INK = "#17231d";
const INK_MUTED = "#54655a";
const STAMP_DEEP = "#9c3110";
const ANNOTATE = "#2242a8";
/** --color-band at 60% over paper; matches the pre-existing code-block wash. */
const CODE_BG = "#eff3ea";

const greenBarTheme: ThemeRegistration = {
  name: "green-bar",
  settings: [
    { settings: { foreground: INK, background: CODE_BG } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { foreground: INK_MUTED, fontStyle: "italic" },
    },
    {
      scope: ["keyword", "storage.type", "storage.modifier", "keyword.operator.new"],
      settings: { foreground: STAMP_DEEP },
    },
    {
      scope: ["string", "string.quoted", "punctuation.definition.string"],
      settings: { foreground: ANNOTATE },
    },
    {
      scope: ["constant.numeric", "constant.language", "constant.character"],
      settings: { foreground: STAMP_DEEP },
    },
    {
      scope: ["entity.name.function", "support.function"],
      settings: { foreground: INK, fontStyle: "bold" },
    },
    {
      scope: ["entity.name.type", "entity.name.class", "support.type", "support.class"],
      settings: { foreground: INK },
    },
    {
      scope: ["variable", "variable.parameter", "meta.object-literal.key"],
      settings: { foreground: INK },
    },
    {
      scope: ["keyword.operator", "punctuation"],
      settings: { foreground: INK_MUTED },
    },
  ],
};

/** Languages the template promises plus the ones essays will realistically
 * use. Unknown languages fall back to plain text. */
const LANGS = ["sql", "python", "typescript", "javascript", "json", "bash"];

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [greenBarTheme],
    langs: LANGS,
  });
  return highlighterPromise;
}

export async function highlightCode(
  code: string,
  lang: string,
): Promise<string> {
  const highlighter = await getHighlighter();
  const language = LANGS.includes(lang) ? lang : "text";
  return highlighter.codeToHtml(code, { lang: language, theme: "green-bar" });
}
