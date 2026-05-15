"use client";

import { motion, useInView, animate } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gradeColor } from "@/lib/gradeColor";

// Top 4 quarterbacks from the live 2025 leaderboard at nfl-grades.shanethakkar.com.
// Hardcoded since the season is complete.
const TOP_QBS = [
  { rank: 1, name: "Drake Maye", team: "NE", grade: 94.2 },
  { rank: 2, name: "Jordan Love", team: "GB", grade: 84.2 },
  { rank: 3, name: "Brock Purdy", team: "SF", grade: 83.5 },
  { rank: 4, name: "Matthew Stafford", team: "LA", grade: 81.8 },
] as const;

const CHIPS = ["next.js", "typescript", "postgres", "vercel", "nflfastR"];

/**
 * Flagship project card for the homepage. Showcases NFL Position Grades —
 * the active subdomain at nfl-grades.shanethakkar.com.
 *
 * Animation choreography on viewport entry:
 *   1. Card fades + lifts in.
 *   2. Each grade row staggers in, bottom-up.
 *   3. Each bar grows from 0% to its grade%.
 *   4. Each grade number ticks up to its target value.
 */
export function FlagshipCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <motion.a
      ref={ref}
      href="https://nfl-grades.shanethakkar.com"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={{ y: -3 }}
      className="liquid-glass-accent group relative block overflow-hidden rounded-2xl p-6 sm:p-8"
    >
      {/* Top row: tag + URL */}
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em] text-accent">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Flagship — Live
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-accent-bright transition-colors group-hover:text-fg-bright">
          nfl-grades.shanethakkar.com
          <ArrowUpRight
            size={13}
            strokeWidth={1.75}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>

      {/* Body: 2-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* Live data preview */}
        <div
          className="relative rounded-xl border border-border-subtle p-5 transition-colors duration-300 group-hover:border-accent-border/60 sm:p-6"
          style={{ background: "rgba(0, 0, 0, 0.42)" }}
        >
          <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-fg-dim">
            <span>QB Leaderboard — 2025</span>
            <span className="text-accent">●</span>
          </div>
          <div className="flex flex-col gap-3.5">
            {TOP_QBS.map((row, i) => (
              <GradeRow key={row.rank} {...row} index={i} active={inView} />
            ))}
          </div>
        </div>

        {/* Info side */}
        <div className="flex flex-col gap-4">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim">
            NFL · Interactive Web App
          </div>
          <h3 className="text-[26px] font-medium leading-[1.1] tracking-[-0.012em] text-fg-bright sm:text-[30px]">
            NFL Position Grades
          </h3>
          <p className="text-[14.5px] leading-[1.6] text-fg-muted">
            A live analytics platform that grades every NFL player on a 0–100
            scale using position-specific advanced stats. Per-season grades,
            recency-weighted career grades with uncertainty, and full depth
            charts for all 32 teams.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-md border border-border-subtle bg-surface px-2 py-1 font-mono text-[10.5px] text-fg-muted"
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

interface GradeRowProps {
  rank: number;
  name: string;
  team: string;
  grade: number;
  index: number;
  active: boolean;
}

function GradeRow({ rank, name, team, grade, index, active }: GradeRowProps) {
  const color = gradeColor(grade);
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={active ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 0.4 + index * 0.09,
        ease: "easeOut",
      }}
    >
      <div className="flex items-baseline gap-3">
        <span className="w-5 font-mono text-[10px] tabular-nums text-fg-dim">
          {rank}
        </span>
        <span className="flex-1 truncate text-[13px] text-fg">{name}</span>
        <span className="font-mono text-[10px] tracking-[0.08em] text-fg-dim">
          {team}
        </span>
        <TickingNumber
          value={grade}
          active={active}
          delay={0.6 + index * 0.09}
          color={color}
        />
      </div>
      <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={active ? { width: `${grade}%` } : {}}
          transition={{
            duration: 0.9,
            delay: 0.55 + index * 0.09,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
        />
      </div>
    </motion.div>
  );
}

function TickingNumber({
  value,
  active,
  delay,
  color,
}: {
  value: number;
  active: boolean;
  delay: number;
  color: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    const controls = animate(0, value, {
      duration: 0.9,
      delay,
      ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [active, value, delay]);

  return (
    <span
      className="w-12 text-right font-mono text-[12px] font-medium tabular-nums"
      style={{ color }}
    >
      {display.toFixed(1)}
    </span>
  );
}
