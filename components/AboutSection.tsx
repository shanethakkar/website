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
          I&rsquo;m Shane. I work with data, and the bar I try to hold on
          every project is the same: do work I&rsquo;d be proud to put my
          name on.
        </p>
        <p className="text-[16px] leading-[1.65] text-fg-muted">
          Most recently I spent six months as a Business Intelligence Intern
          at Legends Global in Frisco, where the work meant pulling
          million-row exports out of point-of-sale systems across
          professional sports venues, cleaning them, finding the story
          inside them, and getting that story in front of stakeholders in a
          form they could actually act on. I had earlier analytics stints at
          Supreme Lending and TruGen.
        </p>
        <p className="text-[16px] leading-[1.65] text-fg-muted">
          I graduated from UT Dallas in May 2026 with a B.S. in Business
          Analytics and Artificial Intelligence, data science track. I work
          in Python, SQL, and R, and I care about the parts of the job that
          don&rsquo;t show up in screenshots: the schema you didn&rsquo;t
          have to redo, the assumption you wrote down before the model ran,
          the report that still made sense a quarter later.
        </p>
        <p className="text-[16px] leading-[1.65] text-fg-muted">
          Outside the work I&rsquo;m a Chicago sports fan, which has trained
          me well for projects where the data tells you exactly
          what&rsquo;s about to go wrong and you decide to keep believing
          anyway.
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
