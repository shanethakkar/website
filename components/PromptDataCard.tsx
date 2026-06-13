"use client";

import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

const CHIPS = ["Python", "FastAPI", "Claude API", "next.js", "SQLite"];

/** Palette borrowed from the site's grade tiers so the trust chart speaks the
 * same visual language as the NFL card. Red = the danger metric (high is bad),
 * cyan = Prompt Data's measured result, green = the "good at zero" control. */
const ACCENT = "#22d3ee";
const RED = "#f87171";
const GREEN = "#34d399";

/**
 * The confidently-wrong ablation — Prompt Data's signature result from the
 * committed eval harness (rendered live on its /evals page). A no-trust
 * baseline confidently answers 100% of questions it shouldn't; the trust layer
 * drops that to 41% while over-declining 0% of clear controls.
 */
interface Bar {
  label: string;
  /** 0–100, drives both the fill width and the displayed % value. */
  value: number;
  color: string;
  /** Faint tracks (the 0% control) still want a visible value label. */
  valueColor: string;
}

const BARS: readonly Bar[] = [
  { label: "Baseline (no trust)", value: 100, color: RED, valueColor: RED },
  { label: "Prompt Data", value: 41, color: ACCENT, valueColor: ACCENT },
  { label: "Over-decline (clear)", value: 0, color: GREEN, valueColor: GREEN },
];

/**
 * Prompt Data flagship card for the homepage. Sits between NFL Position Grades
 * and Venue Insights in the "Selected work" stack.
 *
 * Unlike the other two flagship previews, this one is static (no auto-cycle):
 * a single hand-built bar chart of the project's headline trust metric — the
 * confidently-wrong reduction — with two supporting eval stats beneath it.
 * Bars grow from 0 on first viewport entry, then hold.
 */
export function PromptDataCard() {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <motion.a
      ref={ref}
      href="https://prompt-data.vercel.app"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE }}
      whileHover={{ y: -3 }}
      className="liquid-glass-accent group relative block overflow-hidden rounded-2xl p-6 sm:p-8"
    >
      {/* Top row: live chip + URL */}
      <div className="mb-7 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-accent-border bg-accent-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-bright">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Flagship — Live
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-accent-bright transition-colors group-hover:text-fg-bright">
          prompt-data.vercel.app
          <ArrowUpRight
            size={13}
            strokeWidth={1.75}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>

      {/* Body: 2-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* Static trust-metric preview */}
        <div
          className="relative rounded-xl border border-border-subtle p-5 transition-colors duration-300 group-hover:border-accent-border/60 sm:p-6"
          style={{ background: "rgba(0, 0, 0, 0.42)" }}
        >
          <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            <span>Confidently-Wrong Rate</span>
            <span className="text-accent">●</span>
          </div>

          <div className="flex flex-col gap-4">
            {BARS.map((bar, i) => (
              <div key={bar.label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[12.5px] text-fg">{bar.label}</span>
                  <span
                    className="font-mono text-[12px] font-medium tabular-nums"
                    style={{ color: bar.valueColor }}
                  >
                    {bar.value}%
                  </span>
                </div>
                <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/[0.04]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: bar.color }}
                    initial={{ width: 0 }}
                    animate={inView ? { width: `${bar.value}%` } : { width: 0 }}
                    transition={{
                      duration: 0.9,
                      delay: 0.4 + i * 0.12,
                      ease: EASE,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Supporting eval stats */}
          <div className="mt-6 flex items-center gap-5 border-t border-border-subtle pt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-muted">
            <span>
              ECE{" "}
              <span className="text-fg-bright">0.44 → 0.15</span>
            </span>
            <span>
              EXEC ACC <span className="text-fg-bright">55.8%</span>
            </span>
          </div>
        </div>

        {/* Info side */}
        <div className="flex flex-col gap-4">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-muted">
            Text-to-SQL · Trust Layer
          </div>
          <h3 className="text-[26px] font-medium leading-[1.1] tracking-[-0.012em] text-fg-bright sm:text-[30px]">
            Prompt Data
          </h3>
          <p className="text-[14.5px] leading-[1.6] text-fg-muted">
            Ask an e-commerce database a question in plain English, and trust the
            answer. The product is trust, not query generation: it asks instead
            of guessing on ambiguous questions, surfaces the assumptions behind
            every query, and attaches a calibrated confidence score. A
            reproducible eval harness on the BIRD benchmark backs every claim,
            cutting confidently-wrong answers from 100% to 41% while
            over-declining none of the clear questions.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1 font-mono text-[11.5px] text-fg"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.04em] text-accent transition-colors group-hover:text-accent-bright">
            visit the site
            <ArrowUpRight
              size={14}
              strokeWidth={1.75}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
