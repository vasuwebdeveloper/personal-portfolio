import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a post's Markdown body in the site's design language.
 * Runs at build time (server component) — ships zero JavaScript.
 */
export default function PostBody({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => (
          <p className="mt-5 first:mt-0 leading-relaxed" {...props} />
        ),
        h2: (props) => (
          <h2
            className="font-display mt-12 text-2xl font-semibold tracking-tight"
            {...props}
          />
        ),
        h3: (props) => (
          <h3 className="meta-label mt-10 text-stamp-deep" {...props} />
        ),
        a: (props) => <a className="link-annotate" {...props} />,
        ul: (props) => (
          <ul
            className="mt-5 list-disc space-y-2 pl-5 marker:text-stamp-deep"
            {...props}
          />
        ),
        ol: (props) => (
          <ol
            className="mt-5 list-decimal space-y-2 pl-5 marker:font-mono marker:text-[0.8125rem] marker:text-stamp-deep"
            {...props}
          />
        ),
        li: (props) => <li className="leading-relaxed" {...props} />,
        blockquote: (props) => (
          <blockquote
            className="font-display mt-6 border-l-2 border-stamp pl-5 text-xl leading-normal"
            {...props}
          />
        ),
        hr: () => (
          <hr className="my-10 border-0 border-t border-rule" aria-hidden="true" />
        ),
        code: (props) => (
          <code
            className="rounded-none bg-band px-1.5 py-0.5 font-mono text-[0.85em]"
            {...props}
          />
        ),
        pre: (props) => (
          <pre
            className="mt-5 overflow-x-auto border border-rule bg-band/60 p-4 font-mono text-[0.8125rem] leading-relaxed [&_code]:bg-transparent [&_code]:p-0"
            {...props}
          />
        ),
        table: (props) => (
          <div className="mt-5 overflow-x-auto">
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
