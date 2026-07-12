import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/blog/CodeBlock";
import { slugifyHeading } from "@/lib/blog";
import { highlightCode } from "@/lib/highlight";

/**
 * Renders a post's Markdown body in the site's design language.
 *
 * Async server component: fenced code blocks are highlighted with Shiki
 * before render (react-markdown itself is synchronous), headings get anchor
 * ids that match the table of contents, and none of this ships JavaScript —
 * the one client island is the copy button inside CodeBlock.
 */

function childrenToText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return childrenToText(
      (children as { props: { children?: ReactNode } }).props.children,
    );
  }
  return "";
}

export default async function PostBody({ markdown }: { markdown: string }) {
  // Pre-highlight every fence, keyed by its source, so the synchronous
  // `pre` renderer below can swap in the finished HTML.
  const fences = [...markdown.matchAll(/```(\w*)[^\n]*\n([\s\S]*?)```/g)];
  const highlighted = new Map<string, { html: string; lang: string }>();
  for (const [, lang, source] of fences) {
    const code = source.replace(/\n$/, "");
    const language = lang || "text";
    highlighted.set(code, {
      html: await highlightCode(code, language),
      lang: language,
    });
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => (
          <p
            className="mt-6 first:mt-0 text-[1.125rem] leading-[1.8]"
            {...props}
          />
        ),
        h2: ({ children, ...props }) => (
          <h2
            id={slugifyHeading(childrenToText(children))}
            className="font-display mt-14 scroll-mt-24 text-2xl font-semibold tracking-tight"
            {...props}
          >
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3
            id={slugifyHeading(childrenToText(children))}
            className="meta-label mt-10 scroll-mt-24 text-stamp-deep"
            {...props}
          >
            {children}
          </h3>
        ),
        a: (props) => <a className="link-annotate" {...props} />,
        ul: (props) => (
          <ul
            className="mt-6 list-disc space-y-2.5 pl-5 text-[1.125rem] leading-[1.8] marker:text-stamp-deep"
            {...props}
          />
        ),
        ol: (props) => (
          <ol
            className="mt-6 list-decimal space-y-2.5 pl-5 text-[1.125rem] leading-[1.8] marker:font-mono marker:text-[0.8125rem] marker:text-stamp-deep"
            {...props}
          />
        ),
        li: (props) => <li className="leading-[1.8]" {...props} />,
        blockquote: (props) => (
          <blockquote
            className="font-display mt-7 border-l-2 border-stamp pl-5 text-xl leading-normal"
            {...props}
          />
        ),
        hr: () => (
          <hr
            className="my-12 border-0 border-t border-rule"
            aria-hidden="true"
          />
        ),
        img: ({ title, ...props }) => {
          // Alt text comes from the Markdown itself: ![alt](src).
          // A title of the form "=WIDTHxHEIGHT" declares intrinsic size so
          // images reserve their space from first paint (zero CLS):
          //   ![alt](/path.png "=1600x714")
          const size = title?.match(/^=(\d+)x(\d+)$/);
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              loading="lazy"
              decoding="async"
              width={size ? Number(size[1]) : undefined}
              height={size ? Number(size[2]) : undefined}
              title={size ? undefined : title}
              className="mt-6 h-auto w-full border border-rule"
              {...props}
            />
          );
        },
        code: (props) => (
          <code
            className="rounded-none bg-band px-1.5 py-0.5 font-mono text-[0.85em]"
            {...props}
          />
        ),
        pre: ({ children }) => {
          const code = childrenToText(children).replace(/\n$/, "");
          const entry = highlighted.get(code);
          if (entry) {
            return <CodeBlock html={entry.html} code={code} lang={entry.lang} />;
          }
          // Fence the highlighter didn't see (shouldn't happen) — plain style.
          return (
            <pre className="mt-6 overflow-x-auto border border-rule bg-band/60 p-4 font-mono text-[0.8125rem] leading-relaxed [&_code]:bg-transparent [&_code]:p-0">
              {children}
            </pre>
          );
        },
        table: (props) => (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse text-left" {...props} />
          </div>
        ),
        th: (props) => (
          <th className="meta-label border-y border-rule py-2.5 pr-4" {...props} />
        ),
        td: (props) => (
          <td
            className="border-b border-rule py-2.5 pr-4 text-[0.9375rem]"
            {...props}
          />
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
}
