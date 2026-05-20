"use client";

/**
 * Field decision map — for a given yards-to-go bucket, shows the historically
 * optimal call across each of 5 field-position bands.
 *
 * UX: chip toggle picks the yards-to-go bucket (1 / 2–3 / 4–6 / 7+), the
 * field below recolors. Hover a zone for actual decision breakdown.
 *
 * Data: data/fourth-down-situational.json (same source as the heatmap).
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

const DECISION_SHORT: Record<string, string> = {
  go_for_it: "GO",
  punt: "PUNT",
  field_goal: "FG",
};

const DECISION_COLORS: Record<
  string,
  { fill: string; border: string; text: string }
> = {
  go_for_it: {
    fill: "rgba(74, 222, 128, 0.32)",
    border: "rgba(74, 222, 128, 0.7)",
    text: "rgb(167, 243, 208)",
  },
  punt: {
    fill: "rgba(251, 146, 60, 0.32)",
    border: "rgba(251, 146, 60, 0.7)",
    text: "rgb(253, 186, 116)",
  },
  field_goal: {
    fill: "rgba(96, 165, 250, 0.32)",
    border: "rgba(96, 165, 250, 0.7)",
    text: "rgb(147, 197, 253)",
  },
};

const COLS = DATA.fieldOrder;
const ROWS = DATA.ydstogoOrder;

const W = 900;
const H = 300;
const PAD = { top: 36, right: 24, bottom: 56, left: 24 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const SEG_W = PLOT_W / COLS.length;
const SEG_GAP = 4;

export function FourthDownFieldDecisionMap() {
  const [bucket, setBucket] = useState<string>("short_1");
  const [hover, setHover] = useState<string | null>(null);

  const lookup = useMemo(() => {
    const m: Record<string, Cell> = {};
    for (const c of DATA.cells) m[`${c.ydstogo}|${c.fieldPos}`] = c;
    return m;
  }, []);

  const cells = COLS.map((field) => lookup[`${bucket}|${field}`]);
  const hovered = hover ? lookup[hover] : null;

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              ↦
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              Historically optimal 4th-down call
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            choose yards to go
          </div>
        </div>

        {/* Chip toggle row */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-3 sm:px-5">
          {ROWS.map((r) => {
            const isActive = bucket === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setBucket(r)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] transition-all ${
                  isActive
                    ? "border-accent-border bg-accent-soft text-accent-bright"
                    : "border-border-subtle bg-white/[0.025] text-fg-muted hover:border-accent-border/60 hover:text-fg-bright"
                }`}
                aria-pressed={isActive}
              >
                {YDSTOGO_LABELS[r]}
              </button>
            );
          })}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Field map showing the historically optimal fourth-down call across five field zones for ${YDSTOGO_LABELS[bucket]} situations.`}
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Zone segments */}
          {cells.map((c, ci) => {
            if (!c) return null;
            const key = `${c.ydstogo}|${c.fieldPos}`;
            const isHover = hover === key;
            const x = PAD.left + SEG_W * ci + SEG_GAP / 2;
            const y = PAD.top;
            const w = SEG_W - SEG_GAP;
            const h = PLOT_H;
            const colors = DECISION_COLORS[c.optimalDecision];
            return (
              <g key={key}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  rx={8}
                  fill={colors.fill}
                  stroke={
                    isHover ? "rgba(255,255,255,0.65)" : colors.border
                  }
                  strokeWidth={isHover ? 1.75 : 1.25}
                  style={{
                    cursor: "pointer",
                    transition:
                      "fill 220ms ease, stroke 160ms ease, stroke-width 160ms ease",
                  }}
                  onMouseEnter={() => setHover(key)}
                />
                {/* Zone label (small caps, top) */}
                <text
                  x={x + w / 2}
                  y={y + 22}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={10}
                  letterSpacing="0.18em"
                  fill="rgba(255,255,255,0.55)"
                  pointerEvents="none"
                >
                  {FIELD_LABELS[c.fieldPos].toUpperCase()}
                </text>
                {/* Decision label (big, centered) */}
                <text
                  x={x + w / 2}
                  y={y + h / 2 + 4}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                  fontSize={28}
                  fontWeight={600}
                  letterSpacing="-0.01em"
                  fill={colors.text}
                  pointerEvents="none"
                >
                  {DECISION_SHORT[c.optimalDecision]}
                </text>
                {/* Wrong-call rate (bottom) */}
                <text
                  x={x + w / 2}
                  y={y + h - 18}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={10.5}
                  letterSpacing="0.12em"
                  fill="rgba(255,255,255,0.45)"
                  pointerEvents="none"
                >
                  WRONG {(c.wrongCallRate * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Field direction indicator */}
          <text
            x={PAD.left + 8}
            y={H - 24}
            textAnchor="start"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={10}
            letterSpacing="0.22em"
            fill="rgba(255,255,255,0.32)"
          >
            ← OWN GOAL
          </text>
          <text
            x={W - PAD.right - 8}
            y={H - 24}
            textAnchor="end"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={10}
            letterSpacing="0.22em"
            fill="rgba(255,255,255,0.32)"
          >
            OPP END ZONE →
          </text>

          {/* Hover tooltip */}
          {hovered
            ? (() => {
                const ci = COLS.indexOf(hovered.fieldPos);
                const cx = PAD.left + SEG_W * (ci + 0.5);
                const TW = 248;
                const TH = 92;
                const flipX = cx + TW / 2 + 16 > W ? -1 : 1;
                const tx =
                  flipX > 0
                    ? Math.min(cx + 14, W - TW - 8)
                    : Math.max(cx - TW - 14, 8);
                const ty = PAD.top + 8;
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
                      {FIELD_LABELS[hovered.fieldPos]}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 42}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill={DECISION_COLORS[hovered.optimalDecision].text}
                    >
                      Optimal: {DECISION_LABELS[hovered.optimalDecision]}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 58}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill="rgba(255,255,255,0.6)"
                    >
                      Coaches chose: GO {(hovered.goPctActual * 100).toFixed(0)}%
                      · PUNT {(hovered.puntPctActual * 100).toFixed(0)}% · FG{" "}
                      {(hovered.fgPctActual * 100).toFixed(0)}%
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 76}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill="rgba(255,255,255,0.5)"
                    >
                      n = {hovered.n.toLocaleString()} · wrong{" "}
                      {(hovered.wrongCallRate * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })()
            : null}
        </svg>

        {/* Footer / legend */}
        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span>weighted by recency · 1999–2025</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-3 rounded-sm border"
                style={{
                  background: DECISION_COLORS.go_for_it.fill,
                  borderColor: DECISION_COLORS.go_for_it.border,
                }}
              />
              <span>Go</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-3 rounded-sm border"
                style={{
                  background: DECISION_COLORS.punt.fill,
                  borderColor: DECISION_COLORS.punt.border,
                }}
              />
              <span>Punt</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-3 rounded-sm border"
                style={{
                  background: DECISION_COLORS.field_goal.fill,
                  borderColor: DECISION_COLORS.field_goal.border,
                }}
              />
              <span>FG</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
