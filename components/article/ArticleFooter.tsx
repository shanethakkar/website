import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  formatArticleDate,
  getAllArticles,
  type ArticleMeta,
} from "@/lib/articles";

interface ArticleFooterProps {
  currentSlug: string;
}

/**
 * Sits at the bottom of every article. Two pieces:
 *   1. A "back to writing" link to the homepage section.
 *   2. Up to two "more posts" cards — the next-most-recent articles
 *      that aren't the current one.
 */
export function ArticleFooter({ currentSlug }: ArticleFooterProps) {
  const others = getAllArticles()
    .filter((a) => a.slug !== currentSlug)
    .slice(0, 2);

  return (
    <footer className="mx-auto w-full max-w-3xl px-6 pb-24 pt-16 sm:px-8">
      <div className="border-t border-border-subtle pt-10">
        <Link
          href="/#writing"
          className="group inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.22em] text-accent transition-colors hover:text-accent-bright"
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.75}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to all writing
        </Link>

        {others.length > 0 ? (
          <div className="mt-12">
            <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim">
              More posts
            </div>
            <ul className="flex flex-col gap-3">
              {others.map((post) => (
                <li key={post.slug}>
                  <MorePostCard post={post} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </footer>
  );
}

function MorePostCard({ post }: { post: ArticleMeta }) {
  return (
    <Link
      href={`/articles/${post.slug}`}
      className="liquid-glass group flex items-start justify-between gap-6 rounded-xl p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:p-6"
    >
      <div className="min-w-0 flex-1">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim">
          {formatArticleDate(post.date)} · {post.category}
        </div>
        <div className="mt-2 text-[18px] font-medium leading-[1.2] text-fg-bright transition-colors group-hover:text-accent-bright">
          {post.title}
        </div>
        <p className="mt-2 line-clamp-2 text-[14px] leading-[1.55] text-fg-muted">
          {post.dek}
        </p>
      </div>
      <ArrowUpRight
        size={16}
        strokeWidth={1.75}
        className="mt-1 shrink-0 text-fg-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-bright"
      />
    </Link>
  );
}
