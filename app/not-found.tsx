import type { Metadata } from "next";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Not on file",
  description: "No document exists at this address.",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-16 pb-24 sm:px-8">
      <SectionHeading code="0404" title="Not on file" kicker="Document search" />

      <p className="max-w-[62ch] text-lg leading-relaxed">
        No document exists at this address. It may have been reclassified, or
        the reference was mistyped.
      </p>

      <p className="mt-6">
        <span className="stamp">404 · No match</span>
      </p>

      <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
        <Link
          href="/"
          className="font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep"
        >
          ← Back to the ledger
        </Link>
        <Link
          href="/blog/"
          className="font-mono text-[0.75rem] font-medium tracking-[0.14em] uppercase text-ink-muted transition-colors hover:text-stamp-deep"
        >
          Writing index →
        </Link>
      </div>
    </div>
  );
}
