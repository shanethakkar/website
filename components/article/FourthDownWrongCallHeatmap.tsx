"use client";

/**
 * Wrong-call rate heatmap — 5 field-position bands × 4 yards-to-go buckets.
 * Each cell colors by how often coaches make the suboptimal call in that
 * situation; hover reveals the optimal call and sample size.
 *
 * Data: data/fourth-down-situational.json
 * (see scripts/extract-fourth-down-data.py).
 */

import { useMemo, useState } from "react";
import situational from "@/data/fourth-down-situational.json";

interface Cell {
  fieldPos: string;
  ydstogo: string;
  optimalDecision: string;
  wrongCallRate: number;
  n: number;
  goPctActual: number;
  puntPctActual: number;
  fgPctActual: number;
}

const DATA = situational as {
  fieldOrder: string[];
  ydstogoOrder: string[];
  cells: Cell[];
};

const FIELD_LABELS: Record<string, string> = {
  deep_own: "Own end",
  own_territory: "Own 20–50",
  midfield: "Midfield",
  opp_territory: "Opp 20–50",
  red_zone: "Red zone",
};

const YDSTOGO_LABELS: Record<string, string> = {
  short_1: "4th & 1",
  short_2_3: "4th & 2–3",
  medium_4_6: "4th & 4–6",
  long_7plus: "4th & 7+",
};

const DECISION_LABELS: Record<string, string> = {
  go_for_it: "Go for it",
  punt: "Punt",
  field_goal: "Field goal",
};

const COLS = DATA.fieldOrder;
const ROWS = DATA.ydstogoOrder;

const W = 900;
const H = 470;
const PAD = { top: 78, right: 40, bottom: 64, left: 130 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const CELL_W = PLOT_W / COLS.length;
const CELL_H = PLOT_H / ROWS.length;
const CELL_GAP = 2;

/** Cool-steel → amber → red color ramp, anchored at 0% / 50% / 100%. */
const COLOR_STOPS = [
  { r: 60, g: 90, b: 110, a: 0.25 },
  { r: 251, g: 146, b: 60, a: 0.68 },
  { r: 248, g: 113, b: 113, a: 0.92 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function heatColor(rate: number): string {
  const t = Math.max(0, Math.min(1, rate));
  const seg = t < 0.5 ? 0 : 1;
  const localT = seg === 0 ? t / 0.5 : (t - 0.5) / 0.5;
  const a = COLOR_STOPS[seg];
  const b = COLOR_STOPS[seg + 1];
  return `rgba(${Math.round(lerp(a.r, b.r, localT))}, ${Math.round(lerp(a.g, b.g, localT))}, ${Math.round(lerp(a.b, b.b, localT))}, ${lerp(a.a, b.a, localT).toFixed(2)})`;
}

function cellLookup(rows: Cell[]): Record<string, Cell> {
  const m: Record<string, Cell> = {};
  for (const c of rows) m[`${c.ydstogo}|${c.fieldPos}`] = c;
  return m;
}

export function FourthDownWrongCallHeatmap() {
  const [hover, setHover] = useState<string | null>(null);
  const lookup = useMemo(() => cellLookup(DATA.cells), []);

  const hovered = hover ? lookup[hover] : null;
  const totalN = useMemo(
    () => DATA.cells.reduce((s, c) => s + c.n, 0),
    [],
  );

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              ⚠
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              Wrong-call rate by field position × yards to go
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            darker red = more wrong calls
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Heatmap of NFL coaches' wrong-call rate on fourth down, broken down by field position and yards to go. Outside the obvious-punt and obvious-kick zones, coaches are wrong about half the time."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Column headers (field positions) */}
          {COLS.map((col, ci) => (
            <text
              key={`ch-${col}`}
              x={PAD.left + CELL_W * (ci + 0.5)}
              y={PAD.top - 38}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={11}
              letterSpacing="0.14em"
              fill="rgba(255,255,255,0.75)"
            >
              {FIELD_LABELS[col].toUpperCase()}
            </text>
          ))}
          <text
            x={PAD.left + PLOT_W / 2}
            y={PAD.top - 16}
            textAnchor="middle"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={10}
            letterSpacing="0.22em"
            fill="rgba(255,255,255,0.35)"
          >
            ← OWN GOAL · OPPONENT END ZONE →
          </text>

          {/* Row labels */}
          {ROWS.map((row, ri) => (
            <text
              key={`rh-${row}`}
              x={PAD.left - 14}
              y={PAD.top + CELL_H * (ri + 0.5)}
              textAnchor="end"
              dominantBaseline="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={12}
              fill="rgba(255,255,255,0.75)"
            >
              {YDSTOGO_LABELS[row]}
            </text>
          ))}

          {/* Cells */}
          {ROWS.flatMap((row, ri) =>
            COLS.map((col, ci) => {
              const key = `${row}|${col}`;
              const c = lookup[key];
              if (!c) return null;
              const x = PAD.left + CELL_W * ci + CELL_GAP / 2;
              const y = PAD.top + CELL_H * ri + CELL_GAP / 2;
              const w = CELL_W - CELL_GAP;
              const h = CELL_H - CELL_GAP;
              const isHover = hover === key;
              return (
                <g key={key}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx={4}
                    fill={heatColor(c.wrongCallRate)}
                    stroke={
                      isHover
                        ? "rgba(255,255,255,0.85)"
                        : "rgba(0,0,0,0.25)"
                    }
                    strokeWidth={isHover ? 1.5 : 0.5}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHover(key)}
                  />
                  <text
                    x={x + w / 2}
                    y={y + h / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="var(--font-mono), ui-monospace, monospace"
                    fontSize={14}
                    fontWeight={500}
                    fill={
                      c.wrongCallRate > 0.45
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(255,255,255,0.7)"
                    }
                    pointerEvents="none"
                  >
                    {(c.wrongCallRate * 100).toFixed(0)}%
                  </text>
                </g>
              );
            }),
          )}

          {/* Hover tooltip */}
          {hovered
            ? (() => {
                const ci = COLS.indexOf(hovered.fieldPos);
                const ri = ROWS.indexOf(hovered.ydstogo);
                const cx = PAD.left + CELL_W * (ci + 0.5);
                const cy = PAD.top + CELL_H * (ri + 0.5);
                const TW = 240;
                const TH = 96;
                const flipX = cx + TW / 2 + 16 > W ? -1 : 1;
                const tx =
                  flipX > 0
                    ? Math.min(cx + 14, W - TW - 8)
                    : Math.max(cx - TW - 14, 8);
                const ty =
                  cy + TH + 16 > H - PAD.bottom
                    ? Math.max(cy - TH - 14, 8)
                    : cy + 14;
                return (
                  <g pointerEvents="none">
                    <rect
                      x={tx}
                      y={ty}
                      width={TW}
                      height={TH}
                      rx={6}
                      fill="rgba(10, 14, 18, 0.96)"
                      stroke="rgba(34, 211, 238, 0.35)"
                      strokeWidth={1}
                    />
                    <text
                      x={tx + 12}
                      y={ty + 22}
                      fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                      fontSize={13}
                      fontWeight={500}
                      fill="rgba(255,255,255,0.95)"
                    >
                      {FIELD_LABELS[hovered.fieldPos]} ·{" "}
                      {YDSTOGO_LABELS[hovered.ydstogo]}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 42}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill="rgba(248, 113, 113, 0.95)"
                    >
                      {(hovered.wrongCallRate * 100).toFixed(1)}% wrong call
                      rate
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 60}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill="rgba(74, 222, 128, 0.95)"
                    >
                      Optimal: {DECISION_LABELS[hovered.optimalDecision]}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 80}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill="rgba(255,255,255,0.5)"
                    >
                      n = {hovered.n.toLocaleString()} decisions
                    </text>
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span>20 game-state bins · n = {totalN.toLocaleString()} decisions</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: heatColor(0.05) }} />
            <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: heatColor(0.5) }} />
            <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: heatColor(0.95) }} />
            <span>0% → 100% wrong</span>
          </span>
        </div>
      </div>
    </div>
  );
}
