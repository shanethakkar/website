import { ArrowUpRight, ToggleRight } from "lucide-react";
import type { ReactNode } from "react";
import { GitHubLogo } from "@/components/icons";

interface InteractiveProps {
  /** Display name of the tool (e.g. "Coach Explorer"). */
  title: string;
  /** Short description of what the tool does. */
  description?: ReactNode;
  /** Optional GitHub URL for the source. */
  href?: string;
  /** Optional embed URL. When provided we render the tool in an iframe
   * inline; otherwise we fall back to the placeholder slot. Streamlit
   * Cloud apps should append `?embed=true` to hide the platform chrome. */
  embedUrl?: string;
  /** Optional public URL — shown as "Open in new tab" link below the
   * embed for cases where it loads slowly or you want it fullscreen. */
  openUrl?: string;
  /** Pixel height for the iframe. Streamlit apps typically scroll
   * internally, so a fixed height between 640–840 works well. */
  embedHeight?: number;
  /** CSS aspect-ratio for the placeholder box. Ignored when `embedUrl`
   * is set (the iframe uses `embedHeight` instead). Defaults to 16/9. */
  aspect?: string;
}

/**
 * Inline interactive widget slot used in MDX article bodies.
 *
 * Two modes:
 *   1. `embedUrl` provided — renders an iframe at `embedHeight` inside
 *      the liquid-glass shell, with a small header strip showing the
 *      tool name and an "Open in new tab" affordance.
 *   2. No `embedUrl` — placeholder card with title, description, and a
 *      "Source on GitHub" link. Useful while the React rebuild or the
 *      Streamlit deploy is still in progress.
 */
export function Interactive({
  title,
  description,
  href,
  embedUrl,
  openUrl,
  embedHeight = 720,
  aspect = "16 / 9",
}: InteractiveProps) {
  // When given a Streamlit URL without an embed param, add it so the
  // platform chrome is hidden inside the iframe.
  const iframeSrc =
    embedUrl && embedUrl.includes("streamlit.app") && !embedUrl.includes("embed=")
      ? `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}embed=true`
      : embedUrl;

  const externalUrl = openUrl ?? embedUrl;

  if (iframeSrc) {
    return (
      <div className="article-interactive my-12">
        <div className="liquid-glass relative overflow-hidden rounded-xl">
          <div className="flex items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-accent">
                <ToggleRight size={13} strokeWidth={1.75} />
              </div>
              <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
                {title}
              </div>
            </div>
            {externalUrl ? (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex shrink-0 items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted transition-colors hover:text-accent-bright"
              >
                Open in new tab
                <ArrowUpRight
                  size={12}
                  strokeWidth={1.75}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            ) : null}
          </div>
          <iframe
            src={iframeSrc}
            title={title}
            loading="lazy"
            className="block w-full"
            style={{
              height: embedHeight,
              border: "0",
              background: "transparent",
              colorScheme: "normal",
            }}
            allow="fullscreen"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="article-interactive my-12">
      <div
        className="liquid-glass relative overflow-hidden rounded-xl"
        style={{ aspectRatio: aspect }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />

        <div className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.22em] text-fg-dim">
          Interactive · embed pending
        </div>

        <div className="relative flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-accent">
            <ToggleRight size={22} strokeWidth={1.5} />
          </div>
          <div className="text-[20px] font-medium leading-[1.2] text-fg-bright">
            {title}
          </div>
          {description ? (
            <div className="max-w-lg text-[14.5px] leading-[1.55] text-fg-muted">
              {description}
            </div>
          ) : null}
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-muted transition-colors hover:text-accent-bright"
            >
              <GitHubLogo size={13} />
              Source on GitHub
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
