import Link from "next/link";
import { ArrowLeft, ArrowDownToLine } from "lucide-react";

/**
 * Slim top-of-page chrome used on article pages. Mirrors the visual weight
 * of `MorphingNav` (sticky, same height, same typography) but stripped down
 * — articles don't have homepage sections to scrollspy, so this just gives
 * the reader a way back and a persistent name/resume affordance.
 */
export function ArticleChrome() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle backdrop-blur-xl">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 sm:px-8 sm:py-4"
        style={{ background: "rgba(12, 12, 14, 0.72)" }}
      >
        <Link
          href="/#writing"
          className="group inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.2em] text-fg-muted transition-colors hover:text-accent-bright"
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.75}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          All writing
        </Link>

        <Link
          href="/"
          className="font-mono text-[11.5px] uppercase tracking-[0.2em] text-fg-bright transition-colors hover:text-accent-bright"
        >
          Shane Thakkar
        </Link>

        <a
          href="/Shane-Thakkar-Resume-May-2026.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.2em] text-fg-muted transition-colors hover:text-accent-bright"
        >
          <ArrowDownToLine size={13} strokeWidth={2} />
          Resume
        </a>
      </div>
    </header>
  );
}
