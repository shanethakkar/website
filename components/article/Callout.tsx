import type { ReactNode } from "react";

interface CalloutProps {
  /** Optional small caps label shown at the top of the callout. */
  label?: string;
  children: ReactNode;
}

/**
 * Sidebar-style callout for definitions, methodology asides, etc. Sits at
 * the same width as body text and uses a cyan left border + soft tint to
 * mark it as a related-but-distinct block. Used in MDX directly.
 */
export function Callout({ label, children }: CalloutProps) {
  return (
    <aside className="my-10 rounded-lg border border-accent-border/60 bg-accent-soft px-5 py-5 sm:px-6 sm:py-6">
      {label ? (
        <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.22em] text-accent">
          {label}
        </div>
      ) : null}
      <div className="article-callout-body">{children}</div>
    </aside>
  );
}
