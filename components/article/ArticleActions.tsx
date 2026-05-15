"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { GitHubLogo } from "@/components/icons";

interface ArticleActionsProps {
  /** Article title, used as the share-sheet title on supported devices. */
  title: string;
  /** Dek / summary, used as the share-sheet text. */
  text?: string;
  /** Optional GitHub repo URL (from frontmatter). */
  repo?: string;
}

/**
 * Sits at the top-right of the article header. Two pill buttons:
 *
 *   1. Source — links to the article's GitHub repo if present in frontmatter.
 *   2. Share — opens the native share sheet on devices that support
 *      `navigator.share` (most mobile, some desktop). Falls back to copying
 *      the URL to the clipboard with a transient "Copied" confirmation.
 *
 * Pure client component because it relies on the Web Share API, the
 * clipboard, and `window.location`.
 */
export function ArticleActions({ title, text, repo }: ArticleActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // user dismissed the share sheet — fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  const pillBase =
    "group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white/[0.02] px-3.5 py-1.5 font-mono text-[11.5px] uppercase tracking-[0.18em] text-fg-muted transition-all hover:-translate-y-0.5 hover:border-accent-border hover:bg-accent-soft hover:text-accent-bright";

  return (
    <div className="flex items-center gap-2">
      {repo ? (
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
          className={pillBase}
        >
          <GitHubLogo size={13} />
          Source
        </a>
      ) : null}
      <button
        type="button"
        onClick={handleShare}
        aria-label={copied ? "Link copied" : "Share this article"}
        className={pillBase}
      >
        {copied ? (
          <Check size={13} strokeWidth={2.25} />
        ) : (
          <Share2 size={13} strokeWidth={1.75} />
        )}
        {copied ? "Copied" : "Share"}
      </button>
    </div>
  );
}
