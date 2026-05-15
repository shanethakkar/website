"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const FACTS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Education", value: "B.S. Business Analytics & AI" },
  { label: "School", value: "UT Dallas · May 2026" },
  { label: "Based", value: "Dallas, Texas" },
  { label: "Status", value: "Open to full-time roles" },
  { label: "Focus", value: "Analytics · Data Science · ML · BI" },
  { label: "Stack", value: "Python · SQL · R" },
];

/**
 * About section — text-only by design. Two-column layout: long-form bio on the
 * left (the "voice"), a tight key/value factsheet on the right (the "facts").
 *
 * Bio voice should match the rest of the site: direct, a little dry, lets the
 * work do the talking. Skip LinkedIn-speak, skip platitudes.
 */
export function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14"
    >
      {/* Bio side */}
      <div className="flex flex-col gap-5">
        <p className="text-[19px] leading-[1.55] text-fg-bright">
          I just finished a B.S. in Business Analytics &amp; Artificial
          Intelligence at UT Dallas — data science track, graduated May 2026
          — and I&rsquo;m based in Dallas, Texas.
        </p>
        <p className="text-[16px] leading-[1.65] text-fg-muted">
          Most recently I spent six months as a Business Intelligence Intern
          at Legends Global, working out of Frisco. I analyzed 1M+ POS records
          across professional sports venues in Python, ran market-basket and
          Pareto analyses on FC Dallas concessions, modeled F&amp;B
          performance for ~15 LA28 venues to inform investment tiers, and
          automated weekly SQL Server reconciliation that took roughly ten
          hours of manual validation off the team&rsquo;s plate every week.
        </p>
        <p className="text-[16px] leading-[1.65] text-fg-muted">
          Before that I worked at Supreme Lending and TruGen — Excel + Power
          Automate dashboards coordinating 100+ test cases through a loan
          origination upgrade, and SQL pipelines feeding ML models that hit
          90% accuracy on wireless signal-quality classification. Around all
          of that I&rsquo;ve been building the projects that show up on this
          site: NFL Position Grades, the 4th-down decision analysis, Bayesian
          F1 driver rankings, and the MLB pitcher height study.
        </p>
        <p className="text-[16px] leading-[1.65] text-fg-muted">
          I work in Python, SQL, and R. I care about the boring parts —
          clean schemas, honest uncertainty, decisions that hold up when the
          data changes next week. Looking for a full-time role in analytics,
          data science, ML, or BI.
        </p>
      </div>

      {/* Factsheet side */}
      <div className="liquid-glass rounded-2xl p-6 sm:p-7">
        <div className="mb-5 flex items-baseline justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-fg-bright">
            Quick Facts
          </h3>
          <span className="font-mono text-[10px] tracking-[0.16em] text-fg-dim">
            [ {String(FACTS.length).padStart(2, "0")} ]
          </span>
        </div>
        <dl className="flex flex-col divide-y divide-border-subtle">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="grid grid-cols-[100px_1fr] items-baseline gap-4 py-3 first:pt-0 last:pb-0"
            >
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-fg-dim">
                {fact.label}
              </dt>
              <dd className="text-[14px] leading-[1.45] text-fg">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.div>
  );
}
