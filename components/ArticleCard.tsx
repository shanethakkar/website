"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRef, type ReactNode } from "react";

interface ArticleCardProps {
  slug: string;
  title: string;
  subtitle?: string;
  dateLabel: string;
  category: string;
  description: string;
  tags: string[];
  visual: ReactNode;
  index: number;
}

/**
 * Full-width stacked editorial article card. Used in the Writing section.
 * Visualization on the left, title + meta + description + tags + CTA on the right.
 * Click anywhere → /blog/[slug].
 */
export function ArticleCard({
  slug,
  title,
  subtitle,
  dateLabel,
  category,
  description,
  tags,
  visual,
  index,
}: ArticleCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <Link
        href={`/blog/${slug}`}
        className="liquid-glass group relative block overflow-hidden rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:p-7"
      >
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[5fr_6fr] lg:gap-9">
          {/* Visual preview pane */}
          <div
            className="relative overflow-hidden rounded-xl border border-border-subtle p-5 transition-colors duration-300 group-hover:border-accent-border/60"
            style={{ background: "rgba(0, 0, 0, 0.42)" }}
          >
            {/* Reserve a consistent height across all article cards */}
            <div className="flex h-[150px] items-center sm:h-[170px]">
              <div className="w-full">{visual}</div>
            </div>
          </div>

          {/* Text side */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em]">
              <span className="text-fg-dim">Published · {dateLabel}</span>
              <span className="text-accent">{category}</span>
            </div>

            <h3 className="text-[24px] font-medium leading-[1.15] tracking-[-0.012em] text-fg-bright transition-colors group-hover:text-accent-bright sm:text-[28px]">
              {title}
              {subtitle ? (
                <span className="mt-1.5 block text-[16px] font-normal leading-[1.3] text-fg-muted sm:text-[18px]">
                  {subtitle}
                </span>
              ) : null}
            </h3>

            <p className="text-[14.5px] leading-[1.6] text-fg-muted">
              {description}
            </p>

            <div className="mt-1 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-border-subtle bg-white/[0.03] px-2 py-0.5 font-mono text-[10.5px] text-fg-muted"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.04em] text-accent transition-colors group-hover:text-accent-bright">
              read article
              <ArrowUpRight
                size={14}
                strokeWidth={1.75}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
