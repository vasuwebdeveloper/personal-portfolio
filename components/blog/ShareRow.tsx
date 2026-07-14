"use client";

import { useRef, useState } from "react";

/**
 * Share controls: two plain intent links and a clipboard write. No SDKs,
 * no embeds, no trackers; the LinkedIn/X anchors are ordinary hrefs.
 */
export default function ShareRow({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<number | undefined>(undefined);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; nothing to show.
    }
  }

  const itemClass =
    "font-mono text-[0.6875rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep";

  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-4 gap-y-1">
      <span className="meta-label" aria-hidden="true">
        Share
      </span>
      <a
        className={itemClass}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <a
        className={itemClass}
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        X
      </a>
      <button
        type="button"
        onClick={copyLink}
        className={`${itemClass} ${copied ? "text-stamp-deep" : ""}`}
        aria-label="Copy link to this post"
      >
        {copied ? "copied ✓" : "Copy link"}
      </button>
    </span>
  );
}
