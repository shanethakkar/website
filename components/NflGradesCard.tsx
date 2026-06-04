"use client";

import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { gradeColor } from "@/lib/gradeColor";

// Top 4 per position from nfl-grades.shanethakkar.com (2025 season).
// Hardcoded since the season is complete and the API isn't public.
interface Player {
  rank: number;
  name: string;
  team: string;
  grade: number;
}

interface PositionLeaderboard {
  key: string;
  label: string;
  players: readonly Player[];
}

const POSITIONS: ReadonlyArray<PositionLeaderboard> = [
  {
    key: "QB",
    label: "QB Leaderboard — 2025",
    players: [
      { rank: 1, name: "Drake Maye", team: "NE", grade: 94.2 },
      { rank: 2, name: "Jordan Love", team: "GB", grade: 84.2 },
      { rank: 3, name: "Brock Purdy", team: "SF", grade: 83.5 },
      { rank: 4, name: "Matthew Stafford", team: "LA", grade: 81.8 },
    ],
  },
  {
    key: "RB",
    label: "RB Leaderboard — 2025",
    players: [
      { rank: 1, name: "Bijan Robinson", team: "ATL", grade: 82.1 },
      { rank: 2, name: "Jaylen Warren", team: "PIT", grade: 75.8 },
      { rank: 3, name: "Derrick Henry", team: "BAL", grade: 74.3 },
      { rank: 4, name: "James Cook", team: "BUF", grade: 73.7 },
    ],
  },
  {
    key: "WR",
    label: "WR Leaderboard — 2025",
    players: [
      { rank: 1, name: "Puka Nacua", team: "LA", grade: 88.6 },
      { rank: 2, name: "George Pickens", team: "DAL", grade: 85.1 },
      { rank: 3, name: "Jaxon Smith-Njigba", team: "SEA", grade: 81.4 },
      { rank: 4, name: "Jameson Williams", team: "DET", grade: 80.1 },
    ],
  },
  {
    key: "TE",
    label: "TE Leaderboard — 2025",
    players: [
      { rank: 1, name: "Tucker Kraft", team: "GB", grade: 89.8 },
      { rank: 2, name: "Sam LaPorta", team: "DET", grade: 80.8 },
      { rank: 3, name: "Dalton Kincaid", team: "BUF", grade: 79.3 },
      { rank: 4, name: "Trey McBride", team: "ARI", grade: 71.1 },
    ],
  },
  {
    key: "EDGE",
    label: "EDGE Leaderboard — 2025",
    players: [
      { rank: 1, name: "Myles Garrett", team: "CLE", grade: 95.1 },
      { rank: 2, name: "Micah Parsons", team: "GB", grade: 84.3 },
      { rank: 3, name: "Josh Sweat", team: "ARI", grade: 83.9 },
      { rank: 4, name: "Nik Bonitto", team: "DEN", grade: 83.9 },
    ],
  },
  {
    key: "iDL",
    label: "iDL Leaderboard — 2025",
    players: [
      { rank: 1, name: "Jeffery Simmons", team: "TEN", grade: 95.9 },
      { rank: 2, name: "Brandon Dorlus", team: "ATL", grade: 91.5 },
      { rank: 3, name: "DeForest Buckner", team: "IND", grade: 90.4 },
      { rank: 4, name: "Chris Jones", team: "KC", grade: 88.1 },
    ],
  },
  {
    key: "LB",
    label: "LB Leaderboard — 2025",
    players: [
      { rank: 1, name: "Eric Wilson", team: "MIN", grade: 76.4 },
      { rank: 2, name: "Devin Lloyd", team: "JAX", grade: 73.1 },
      { rank: 3, name: "Jordyn Brooks", team: "MIA", grade: 72.5 },
      { rank: 4, name: "Devin Bush", team: "CLE", grade: 69.4 },
    ],
  },
  {
    key: "CB",
    label: "CB Leaderboard — 2025",
    players: [
      { rank: 1, name: "Derek Stingley Jr.", team: "HOU", grade: 86.6 },
      { rank: 2, name: "Joey Porter Jr.", team: "PIT", grade: 86.6 },
      { rank: 3, name: "Quinyon Mitchell", team: "PHI", grade: 84.2 },
      { rank: 4, name: "James Pierre", team: "PIT", grade: 83.8 },
    ],
  },
  {
    key: "S",
    label: "S Leaderboard — 2025",
    players: [
      { rank: 1, name: "Antonio Johnson", team: "JAX", grade: 78.8 },
      { rank: 2, name: "Derwin James", team: "LAC", grade: 77.5 },
      { rank: 3, name: "Xavier McKinney", team: "GB", grade: 76.4 },
      { rank: 4, name: "Brian Branch", team: "DET", grade: 74.5 },
    ],
  },
  {
    key: "K",
    label: "K Leaderboard — 2025",
    players: [
      { rank: 1, name: "Will Reichard", team: "MIN", grade: 90.5 },
      { rank: 2, name: "Nick Folk", team: "NYJ", grade: 89.7 },
      { rank: 3, name: "Ka'imi Fairbairn", team: "HOU", grade: 87.9 },
      { rank: 4, name: "Zane Gonzalez", team: "ATL", grade: 84.4 },
    ],
  },
  {
    key: "P",
    label: "P Leaderboard — 2025",
    players: [
      { rank: 1, name: "Jordan Stout", team: "BAL", grade: 82.3 },
      { rank: 2, name: "Rigoberto Sanchez", team: "IND", grade: 80.4 },
      { rank: 3, name: "Tress Way", team: "WAS", grade: 79.5 },
      { rank: 4, name: "Ryan Rehkow", team: "CIN", grade: 77.0 },
    ],
  },
];

/** Auto-cycle interval between positions. 10s gives enough read time
 * across 11 positions while keeping the full loop under ~2 minutes. */
const CYCLE_MS = 10000;

const CHIPS = ["Python", "next.js", "PostgreSQL", "vercel", "nflverse"];

/**
 * NFL Position Grades flagship card for the homepage. Showcases the active
 * subdomain at nfl-grades.shanethakkar.com.
 *
 * The leaderboard panel auto-cycles through positions every CYCLE_MS, pausing
 * on hover so the viewer can read what's there. On every cycle:
 *   - Position label crossfades old → new
 *   - Each row's name + team crossfades (staggered top-down)
 *   - Bar widths tween smoothly to new grades (framer-motion `animate`)
 *   - Grade numbers tick from current displayed value to new target
 *
 * Initial entrance (on viewport enter): card fades up, rows stagger in,
 * bars grow from 0%, numbers tick from 0.
 */
export function NflGradesCard() {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const [positionIndex, setPositionIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-cycle through positions. Stops while paused (hover) and while the
  // card hasn't entered view yet — no point animating off-screen.
  useEffect(() => {
    if (!inView || paused) return;
    const id = window.setInterval(() => {
      setPositionIndex((i) => (i + 1) % POSITIONS.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [inView, paused]);

  const current = POSITIONS[positionIndex];

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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="liquid-glass-accent group relative block overflow-hidden rounded-2xl p-6 sm:p-8"
    >
      {/* Top row: live chip + URL. Stacks on mobile so neither element gets
       * squished when the card is narrow; side-by-side from sm up. */}
      <div className="mb-7 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-accent-border bg-accent-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-bright">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Flagship — Live
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-accent-bright transition-colors group-hover:text-fg-bright">
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
          <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            {/* Position label crossfades on cycle. Fixed-height container so
             * the absolute-positioned label doesn't collapse the row. */}
            <div className="relative h-[1.1em] flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={current.key}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  {current.label}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-accent">●</span>
          </div>
          <div className="flex flex-col gap-3.5">
            {current.players.map((player, i) => (
              <GradeRow
                key={i}
                index={i}
                rank={player.rank}
                name={player.name}
                team={player.team}
                grade={player.grade}
                active={inView}
                positionKey={current.key}
              />
            ))}
          </div>
        </div>

        {/* Info side */}
        <div className="flex flex-col gap-4">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-muted">
            NFL · Statistical Grading Platform
          </div>
          <h3 className="text-[26px] font-medium leading-[1.1] tracking-[-0.012em] text-fg-bright sm:text-[30px]">
            NFL Position Grades
          </h3>
          <p className="text-[14.5px] leading-[1.6] text-fg-muted">
            A live analytics platform that grades every NFL player on a 0–100
            scale across 12 positions, using statistical models tuned per
            position. 10 seasons of play-by-play and tracking data flow through
            a Python pipeline into Postgres; the web app surfaces per-season
            grades, career trends with uncertainty, and full depth charts for
            all 32 teams.
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

interface GradeRowProps {
  rank: number;
  name: string;
  team: string;
  grade: number;
  index: number;
  active: boolean;
  /** Used as the AnimatePresence key so name/team crossfade when the
   * leaderboard cycles to a new position. */
  positionKey: string;
}

function GradeRow({
  rank,
  name,
  team,
  grade,
  index,
  active,
  positionKey,
}: GradeRowProps) {
  const color = gradeColor(grade);
  // Stagger row entrances on first viewport entry (entrance animation).
  // Cycle transitions don't reuse this delay — they use the per-row stagger
  // baked into the AnimatePresence transition's `delay` below.
  const entranceDelay = 0.4 + index * 0.09;
  // Stagger crossfade per row top-down — small offset, feels coherent
  // without looking like a wave.
  const cycleStagger = index * 0.05;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={active ? { opacity: 1, x: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: entranceDelay,
        ease: "easeOut",
      }}
    >
      <div className="flex items-baseline gap-3">
        <span className="w-5 font-mono text-[10px] tabular-nums text-fg-dim">
          {rank}
        </span>
        {/* Name + team — crossfade on cycle. Fixed-height inline container
         * with absolute-positioned content so adjacent flex siblings
         * (grade number) stay anchored to the right while the name
         * transitions in/out. */}
        <div className="relative h-[1.2em] flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={positionKey}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{
                duration: 0.28,
                ease: "easeOut",
                delay: cycleStagger,
              }}
              className="absolute inset-0 flex items-baseline gap-3"
            >
              <span className="flex-1 truncate text-[13px] text-fg">
                {name}
              </span>
              <span className="font-mono text-[10px] tracking-[0.08em] text-fg-dim">
                {team}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
        <TickingNumber
          value={grade}
          active={active}
          initialDelay={0.6 + index * 0.09}
          color={color}
        />
      </div>
      <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-white/[0.04]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={active ? { width: `${grade}%` } : { width: 0 }}
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

/** Animates the displayed grade. On initial viewport entry, ticks 0 →
 * target (delayed for stagger). On subsequent value changes (position
 * cycle), tweens from the currently-shown value to the new target so the
 * number doesn't snap back to 0 between positions. */
function TickingNumber({
  value,
  active,
  initialDelay,
  color,
}: {
  value: number;
  active: boolean;
  initialDelay: number;
  color: string;
}) {
  const [display, setDisplay] = useState(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    const isFirst = !hasStartedRef.current;
    hasStartedRef.current = true;
    const controls = animate(isFirst ? 0 : display, value, {
      duration: isFirst ? 0.9 : 0.7,
      delay: isFirst ? initialDelay : 0,
      ease: [0.21, 0.47, 0.32, 0.98],
      onUpdate: setDisplay,
    });
    return () => controls.stop();
    // `display` intentionally omitted from deps — we want each new animation
    // to start from whatever's currently on screen, not retrigger on every
    // intermediate tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, value, initialDelay]);

  return (
    <span
      className="w-12 text-right font-mono text-[12px] font-medium tabular-nums"
      style={{ color }}
    >
      {display.toFixed(1)}
    </span>
  );
}
