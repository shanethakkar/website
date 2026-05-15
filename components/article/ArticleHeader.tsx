import { formatArticleDate, type ArticleMeta } from "@/lib/articles";
import { ArticleActions } from "./ArticleActions";

/**
 * Editorial article header. Eyebrow category + title + dek + meta row
 * with optional Source / Share actions. Ends with a divider so the body
 * reads as a separate column of text.
 */
export function ArticleHeader({
  title,
  dek,
  category,
  date,
  readingMinutes,
  repo,
}: ArticleMeta) {
  return (
    <header className="mx-auto w-full max-w-3xl px-6 pt-14 sm:px-8 sm:pt-20">
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
        {category}
      </div>

      <h1 className="mt-6 text-[clamp(36px,5.6vw,60px)] font-medium leading-[1.05] tracking-[-0.022em] text-fg-bright">
        {title}
      </h1>

      <p className="mt-6 text-[20px] leading-[1.5] text-fg-muted sm:text-[22px]">
        {dek}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12.5px] uppercase tracking-[0.16em]">
          <span className="font-medium text-fg-bright">Shane Thakkar</span>
          <span aria-hidden="true" className="text-fg-dim">
            ·
          </span>
          <span className="text-fg-muted">{formatArticleDate(date)}</span>
          <span aria-hidden="true" className="text-fg-dim">
            ·
          </span>
          <span className="text-fg-muted">{readingMinutes} min read</span>
        </div>

        <ArticleActions title={title} text={dek} repo={repo} />
      </div>

      <div className="mt-8 border-t border-border-subtle" />
    </header>
  );
}
