"use client";

/**
 * EdgarRisk hero chart — precision evolves as the time horizon extends.
 * Three horizontal bars showing 46% → 61% → 69% precision, with hover
 * tooltips listing which companies are added at each step.
 *
 * Data: scripts/extract-edgar-risk-data.py reads phase5_adjusted_metrics.csv
 * and writes data/edgar-risk-precision-curves.json.
 */

import { useState } from "react";
import precisionCurves from "@/data/edgar-risk-precision-curves.json";

interface Row {
  label: string;
  horizon: string;
  precision: number;
  tp: number;
  fp: number;
  addedTickers: string[];
}

const ROWS: Row[] = precisionCurves;

const W = 900;
const H = 360;
const PAD = { top: 36, right: 200, bottom: 36, left: 240 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const BAR_H = 44;
const ROW_GAP = (PLOT_H - BAR_H * ROWS.length) / (ROWS.length - 1);
const X_MAX = 0.8;
const X_TICKS = [0, 0.2, 0.4, 0.6, 0.8];

/** Step colour ramp — gets warmer as the horizon (and precision) extends.
 * Same hue family as the heatmap but each row sits at a distinct shade. */
const BAR_COLORS = [
  { fill: "rgba(34, 211, 238, 0.55)", border: "rgba(34, 211, 238, 0.95)" },
  { fill: "rgba(251, 146, 60, 0.55)", border: "rgba(251, 146, 60, 0.95)" },
  { fill: "rgba(74, 222, 128, 0.55)", border: "rgba(74, 222, 128, 0.95)" },
];
const BAR_COLORS_HOVER = [
  { fill: "rgba(103, 232, 249, 0.85)", border: "rgba(255,255,255,0.7)" },
  { fill: "rgba(253, 186, 116, 0.85)", border: "rgba(255,255,255,0.7)" },
  { fill: "rgba(134, 239, 172, 0.85)", border: "rgba(255,255,255,0.7)" },
];

export function EdgarRiskPrecisionCurves() {
  const [hover, setHover] = useState<number | null>(null);

  const xPlot = (v: number) =>
    PAD.left + (Math.min(v, X_MAX) / X_MAX) * PLOT_W;
  const yPlot = (i: number) => PAD.top + i * (BAR_H + ROW_GAP);

  const hovered = hover !== null ? ROWS[hover] : null;

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              ↗
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              Precision evolves with horizon
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            46% → 61% → 69%
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Three horizontal bars showing the model's precision rising from 46% in-sample to 61% at extended horizon to 69% including stress-recovered companies. Hover any bar to see which companies move precision up at each step."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Vertical gridlines */}
          {X_TICKS.map((v) => (
            <line
              key={`xg-${v}`}
              x1={xPlot(v)}
              x2={xPlot(v)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}

          {/* Baseline */}
          <line
            x1={PAD.left}
            x2={PAD.left}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1}
          />

          {/* X tick labels */}
          {X_TICKS.map((v) => (
            <text
              key={`xl-${v}`}
              x={xPlot(v)}
              y={H - PAD.bottom + 22}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={11}
              fill="rgba(255,255,255,0.5)"
            >
              {Math.round(v * 100)}%
            </text>
          ))}

          {/* Bars + labels */}
          {ROWS.map((r, i) => {
            const isHover = hover === i;
            const palette = isHover ? BAR_COLORS_HOVER[i] : BAR_COLORS[i];
            const x = PAD.left;
            const y = yPlot(i);
            const w = xPlot(r.precision) - PAD.left;
            return (
              <g key={r.label}>
                {/* Row label (left) */}
                <text
                  x={PAD.left - 14}
                  y={y + BAR_H / 2 - 6}
                  textAnchor="end"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={11}
                  letterSpacing="0.06em"
                  fill="rgba(255,255,255,0.85)"
                >
                  {r.horizon.split(" (")[0]}
                </text>
                <text
                  x={PAD.left - 14}
                  y={y + BAR_H / 2 + 10}
                  textAnchor="end"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={10}
                  fill="rgba(255,255,255,0.45)"
                >
                  {r.horizon.includes("(") ? `(${r.horizon.split("(")[1]}` : ""}
                </text>

                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={BAR_H}
                  rx={5}
                  fill={palette.fill}
                  stroke={palette.border}
                  strokeWidth={isHover ? 1.5 : 1}
                  style={{ cursor: "pointer", transition: "fill 120ms ease" }}
                  onMouseEnter={() => setHover(i)}
                />

                {/* % label inside or after the bar */}
                <text
                  x={x + w + 12}
                  y={y + BAR_H / 2 + 5}
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={16}
                  fontWeight={500}
                  fill={
                    isHover ? "rgb(255,255,255)" : "rgba(255,255,255,0.95)"
                  }
                  pointerEvents="none"
                >
                  {Math.round(r.precision * 100)}%
                </text>

                {/* TP / FP detail next to %, dimmer */}
                <text
                  x={x + w + 56}
                  y={y + BAR_H / 2 + 5}
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={10.5}
                  fill="rgba(255,255,255,0.45)"
                  pointerEvents="none"
                >
                  {r.tp} TP · {r.fp} FP
                </text>
              </g>
            );
          })}

          {/* Hover tooltip — shows what's added at this step */}
          {hovered && hover !== null && hovered.addedTickers.length > 0
            ? (() => {
                const x = xPlot(hovered.precision);
                const y = yPlot(hover);
                const TW = 280;
                const TH = 74;
                const tx = Math.min(x + 16, W - TW - 12);
                const ty = y + BAR_H + 6 > H - PAD.bottom - TH
                  ? y - TH - 8
                  : y + BAR_H + 6;
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
                      fontSize={12}
                      fontWeight={500}
                      fill="rgba(255,255,255,0.95)"
                    >
                      +{hovered.addedTickers.length} added at this horizon
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 44}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11.5}
                      fill="rgba(34, 211, 238, 0.95)"
                    >
                      {hovered.addedTickers.join(" · ")}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 62}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={10.5}
                      fill="rgba(255,255,255,0.55)"
                    >
                      precision {Math.round(hovered.precision * 100)}% · {hovered.tp}/{hovered.tp + hovered.fp} positives
                    </text>
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span>24 failures · 42 sector-matched survivors · 15 sectors</span>
          <span>recall 79% (held constant across rows)</span>
        </div>
      </div>
    </div>
  );
}
