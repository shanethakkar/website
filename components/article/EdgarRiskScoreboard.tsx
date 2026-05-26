"use client";

/**
 * 24 corporate failures × 3 signal columns. Each cell shows whether that
 * signal fired for that failure. The bottom 5 rows are the "structurally
 * undetectable" failures — for them no signal fires, and the class-hint
 * column explains why (industry shock, sudden shock, etc.).
 *
 * Hover any row → tooltip with the underlying metrics: max novelty rank,
 * t0 rank, own raw novelty.
 *
 * Data: scripts/extract-edgar-risk-data.py reads phase4_failure_detection.csv
 * and writes data/edgar-risk-scoreboard.json.
 */

import { useMemo, useState } from "react";
import scoreboard from "@/data/edgar-risk-scoreboard.json";

interface Row {
  ticker: string;
  sector: string;
  classHint: string;
  noveltySpike: boolean;
  decliningUd: boolean;
  chronicUd: boolean;
  detected: boolean;
  maxRank: number;
  t0Rank: number;
  ownMaxRaw: number;
  nYears: number;
}

const RAW_ROWS: Row[] = scoreboard;

// Sort: detected first (by which signal fired), then the 5 undetected at the bottom
const SORT_ORDER = ["novelty_spike", "declining_ud", "chronic_ud", "undetected"];
const PRIMARY_SIGNAL = (r: Row) => {
  if (!r.detected) return "undetected";
  if (r.noveltySpike) return "novelty_spike";
  if (r.decliningUd) return "declining_ud";
  if (r.chronicUd) return "chronic_ud";
  return "undetected";
};

const W = 900;
const ROW_H = 24;
const HEADER_H = 36;
const PAD = { top: 24, right: 24, bottom: 32, left: 32 };
const H = PAD.top + HEADER_H + ROW_H * 24 + PAD.bottom;

const COL_TICKER = PAD.left + 36; // center of ticker col
const COL_SECTOR = PAD.left + 80; // left edge of sector col
const COL_SIG1 = PAD.left + 360; // center of novelty spike col
const COL_SIG2 = PAD.left + 440; // center of declining ud
const COL_SIG3 = PAD.left + 520; // center of chronic ud
const COL_CLASS = PAD.left + 580; // left edge of class hint

const SIG_COLORS = {
  novelty_spike: { active: "rgba(34, 211, 238, 0.92)", soft: "rgba(34, 211, 238, 0.18)" },
  declining_ud: { active: "rgba(251, 146, 60, 0.92)", soft: "rgba(251, 146, 60, 0.18)" },
  chronic_ud: { active: "rgba(74, 222, 128, 0.92)", soft: "rgba(74, 222, 128, 0.18)" },
};

export function EdgarRiskScoreboard() {
  const [hover, setHover] = useState<number | null>(null);

  const rows = useMemo(() => {
    return [...RAW_ROWS].sort((a, b) => {
      const aOrder = SORT_ORDER.indexOf(PRIMARY_SIGNAL(a));
      const bOrder = SORT_ORDER.indexOf(PRIMARY_SIGNAL(b));
      if (aOrder !== bOrder) return aOrder - bOrder;
      // Within a group, sort by ticker
      return a.ticker.localeCompare(b.ticker);
    });
  }, []);

  const detectedCount = rows.filter((r) => r.detected).length;

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              ⊞
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              Detection scoreboard — 24 failures × 3 signals
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            {detectedCount}/{rows.length} detected · 79% recall
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="A 24-row scoreboard showing whether each of the project's failure cases was detected by the novelty spike, declining under-disclosure, or chronic under-disclosure signal. Five failures at the bottom are structurally undetectable, with their reasons listed in the class column."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Header row */}
          <g>
            <text
              x={COL_TICKER}
              y={PAD.top + 22}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={9.5}
              letterSpacing="0.18em"
              fill="rgba(255,255,255,0.55)"
            >
              TICKER
            </text>
            <text
              x={COL_SECTOR}
              y={PAD.top + 22}
              textAnchor="start"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={9.5}
              letterSpacing="0.18em"
              fill="rgba(255,255,255,0.55)"
            >
              SECTOR
            </text>
            {([
              ["NOVELTY SPIKE", COL_SIG1, SIG_COLORS.novelty_spike.active],
              ["DECLINING UD", COL_SIG2, SIG_COLORS.declining_ud.active],
              ["CHRONIC UD", COL_SIG3, SIG_COLORS.chronic_ud.active],
            ] as const).map(([label, x, color]) => (
              <text
                key={label}
                x={x}
                y={PAD.top + 22}
                textAnchor="middle"
                fontFamily="var(--font-mono), ui-monospace, monospace"
                fontSize={9}
                letterSpacing="0.16em"
                fill={color}
              >
                {label}
              </text>
            ))}
            <text
              x={COL_CLASS}
              y={PAD.top + 22}
              textAnchor="start"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={9.5}
              letterSpacing="0.18em"
              fill="rgba(255,255,255,0.55)"
            >
              CLASS / MISS REASON
            </text>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={PAD.top + HEADER_H - 4}
              y2={PAD.top + HEADER_H - 4}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth={1}
            />
          </g>

          {/* Data rows */}
          {rows.map((r, i) => {
            const isHover = hover === i;
            const rowY = PAD.top + HEADER_H + i * ROW_H;
            const cy = rowY + ROW_H / 2;

            return (
              <g
                key={r.ticker}
                onMouseEnter={() => setHover(i)}
                style={{ cursor: "pointer" }}
              >
                {/* Row hover/striping background */}
                <rect
                  x={PAD.left - 4}
                  y={rowY}
                  width={W - PAD.left - PAD.right + 8}
                  height={ROW_H}
                  fill={
                    isHover
                      ? "rgba(34, 211, 238, 0.06)"
                      : i % 2 === 0
                        ? "rgba(255,255,255,0.015)"
                        : "transparent"
                  }
                />

                {/* Detected-status left rail */}
                <rect
                  x={PAD.left - 4}
                  y={rowY + 3}
                  width={3}
                  height={ROW_H - 6}
                  fill={
                    r.detected
                      ? "rgba(34, 211, 238, 0.5)"
                      : "rgba(248, 113, 113, 0.6)"
                  }
                />

                {/* Ticker */}
                <text
                  x={COL_TICKER}
                  y={cy + 4}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={11.5}
                  fontWeight={500}
                  fill={
                    isHover ? "rgb(255,255,255)" : "rgba(255,255,255,0.92)"
                  }
                >
                  {r.ticker}
                </text>

                {/* Sector */}
                <text
                  x={COL_SECTOR}
                  y={cy + 4}
                  textAnchor="start"
                  fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                  fontSize={11.5}
                  fill={
                    isHover ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)"
                  }
                >
                  {r.sector}
                </text>

                {/* Signal cells — dot if fired, faint ring if not */}
                {([
                  [r.noveltySpike, COL_SIG1, SIG_COLORS.novelty_spike],
                  [r.decliningUd, COL_SIG2, SIG_COLORS.declining_ud],
                  [r.chronicUd, COL_SIG3, SIG_COLORS.chronic_ud],
                ] as const).map(([fired, x, palette], si) => (
                  <g key={si}>
                    {fired ? (
                      <circle
                        cx={x}
                        cy={cy}
                        r={5}
                        fill={palette.active}
                        stroke="rgba(0,0,0,0.4)"
                        strokeWidth={0.5}
                      />
                    ) : (
                      <circle
                        cx={x}
                        cy={cy}
                        r={3.5}
                        fill="none"
                        stroke="rgba(255,255,255,0.18)"
                        strokeWidth={1}
                      />
                    )}
                  </g>
                ))}

                {/* Class hint — italic for caught, regular for miss reason */}
                <text
                  x={COL_CLASS}
                  y={cy + 4}
                  textAnchor="start"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={10.5}
                  fill={
                    r.detected
                      ? "rgba(255,255,255,0.55)"
                      : "rgba(248, 113, 113, 0.85)"
                  }
                  fontStyle={r.detected ? "normal" : "italic"}
                >
                  {r.classHint}
                </text>
              </g>
            );
          })}

          {/* Hover tooltip with row metrics */}
          {hover !== null
            ? (() => {
                const r = rows[hover];
                const rowY = PAD.top + HEADER_H + hover * ROW_H;
                const TW = 240;
                const TH = 84;
                const tx = W - PAD.right - TW;
                const ty = rowY + ROW_H + 6 > H - PAD.bottom - TH
                  ? rowY - TH - 6
                  : rowY + ROW_H + 6;
                return (
                  <g pointerEvents="none">
                    <rect
                      x={tx}
                      y={ty}
                      width={TW}
                      height={TH}
                      rx={6}
                      fill="rgba(10, 14, 18, 0.97)"
                      stroke="rgba(34, 211, 238, 0.4)"
                      strokeWidth={1}
                    />
                    <text
                      x={tx + 12}
                      y={ty + 20}
                      fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                      fontSize={12.5}
                      fontWeight={500}
                      fill="rgba(255,255,255,0.95)"
                    >
                      {r.ticker} · {r.sector}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 40}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={10.5}
                      fill="rgba(255,255,255,0.7)"
                    >
                      max rank {r.maxRank.toFixed(2)} · t0 rank {r.t0Rank.toFixed(2)}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 56}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={10.5}
                      fill="rgba(255,255,255,0.7)"
                    >
                      own raw novelty {r.ownMaxRaw.toFixed(3)}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 72}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={10.5}
                      fill={
                        r.detected
                          ? "rgba(34, 211, 238, 0.95)"
                          : "rgba(248, 113, 113, 0.95)"
                      }
                    >
                      {r.detected ? "✓ detected" : "✗ undetectable"} · {r.nYears}y lookback
                    </text>
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SIG_COLORS.novelty_spike.active }} />
              <span>Spike</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SIG_COLORS.declining_ud.active }} />
              <span>Declining</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SIG_COLORS.chronic_ud.active }} />
              <span>Chronic</span>
            </span>
          </span>
          <span>hover any row for cohort metrics</span>
        </div>
      </div>
    </div>
  );
}
