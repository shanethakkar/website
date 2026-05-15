import { BarChart3 } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

interface FigureProps {
  /** Path to the image (e.g. `/articles/fourth-down/x.png`). When set,
   * we render a real `<Image>` instead of the placeholder slot. */
  src?: string;
  /** Short description that doubles as alt text. Required even when src
   * is set so screen readers always have a label. */
  alt: string;
  /** Italic caption shown below the figure. CSS auto-numbers it as
   * "Fig. N · ..." via the .article-body counter. */
  caption?: ReactNode;
  /** CSS aspect-ratio for the figure box. Defaults to 16/9; chart charts
   * with wider or narrower native aspects should override (e.g. "1536/349"). */
  aspect?: string;
}

/**
 * Inline figure used in MDX article bodies.
 *
 * Two modes:
 *   1. `src` provided — renders a real `next/image` at the given aspect
 *      ratio, contained (never cropped) within a rounded liquid-glass
 *      surface. This is the production path.
 *   2. No `src` — renders a labeled placeholder slot with the alt text
 *      visible so the article still reads correctly during dev.
 *
 * Either way the wrapping `<figure>` + `<figcaption>` is identical, so
 * the CSS figure counter and the surrounding rhythm stay consistent.
 */
export function Figure({ src, alt, caption, aspect = "16 / 9" }: FigureProps) {
  return (
    <figure className="article-figure my-12">
      <div
        className="relative overflow-hidden rounded-xl border border-border-subtle"
        style={{
          aspectRatio: aspect,
          background:
            "linear-gradient(180deg, rgba(22, 23, 27, 0.94) 0%, rgba(15, 16, 20, 0.94) 100%)",
          boxShadow:
            "inset 0 1px 0 rgba(255, 255, 255, 0.04), inset 0 -1px 0 rgba(0, 0, 0, 0.45)",
        }}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1280px) 1152px, (min-width: 768px) 90vw, 100vw"
            className="object-contain"
          />
        ) : (
          <>
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
              Pending image
            </div>
            <div className="relative flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent-border bg-accent-soft text-accent">
                <BarChart3 size={22} strokeWidth={1.5} />
              </div>
              <div className="max-w-md text-[14px] leading-[1.5] text-fg-muted">
                {alt}
              </div>
            </div>
          </>
        )}
      </div>

      {caption ? (
        <figcaption className="mt-3 text-[14px] italic leading-[1.55] text-fg-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
