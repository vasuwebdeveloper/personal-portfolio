"use client";

import { useRef, useState } from "react";

/**
 * A pre-highlighted (build-time Shiki) code block with a copy control.
 * The only client-side work is the clipboard write.
 */
export default function CodeBlock({
  html,
  code,
  lang,
}: {
  html: string;
  code: string;
  lang: string;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/http); leave the button as-is.
    }
  }

  return (
    <div className="post-code group relative mt-6 border border-rule">
      <div className="flex items-center justify-between border-b border-rule bg-band/60 px-3 py-1.5">
        <span className="font-mono text-[0.625rem] tracking-[0.14em] uppercase text-ink-muted">
          {lang}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code to clipboard"
          className="font-mono text-[0.625rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      <div
        className="[&_pre]:overflow-x-auto [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[0.8125rem] [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
