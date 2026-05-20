"use client";

/**
 * NFL-wide go-for-it rate on fourth down, 1999–2025.
 * Native line chart with hover crosshair.
 *
 * Data: data/fourth-down-league-trends.json
 * (see scripts/extract-fourth-down-data.py).
 */

import { useState } from "react";
import trends from "@/data/fourth-down-league-trends.json";

interface Row {
  season: number;
  goRate: number;
  wpaGap: number;
  era: string;
}

const ROWS: Row[] = trends;
const FIRST = ROWS[0];
const LAST = ROWS[ROWS.length - 1];

const W = 900;
const H = 420;
const PAD = { top: 32, right: 40, bottom: 64, left: 64 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const Y_MAX = 0.25;
const Y_TICKS = [0, 0.05, 0.1, 0.15, 0.2, 0.25];
const X_TICKS = [1999, 2005, 2010, 2015, 2020, 2025];

const ANALYTICS_ERA_START = 2019;

const X_DOMAIN = { min: FIRST.season, max: LAST.season };
const xPlot = (s: number) =>
  PAD.left + ((s - X_DOMAIN.min) / (X_DOMAIN.max - X_DOMAIN.min)) * PLOT_W;
const yPlot = (v: number) => PAD.top + (1 - v / Y_MAX) * PLOT_H;

const LINE_PATH = ROWS.map(
  (r, i) => `${i === 0 ? "M" : "L"} ${xPlot(r.season)} ${yPlot(r.goRate)}`,
).join(" ");
const AREA_PATH = `${LINE_PATH} L ${xPlot(LAST.season)} ${yPlot(0)} L ${xPlot(FIRST.season)} ${yPlot(0)} Z`;

export function FourthDownGoForItTrend() {
  const [hover, setHover] = useState<number | null>(null);

  const hovered = hover !== null ? ROWS[hover] : null;

  // Map mouse position onto the nearest row
  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const { x } = pt.matrixTransform(ctm.inverse());
    if (x < PAD.left || x > W - PAD.right) {
      setHover(null);
      return;
    }
    const t = (x - PAD.left) / PLOT_W;
    const season = X_DOMAIN.min + t * (X_DOMAIN.max - X_DOMAIN.min);
    let bestIdx = 0;
    let bestDiff = Infinity;
    ROWS.forEach((r, i) => {
      const d = Math.abs(r.season - season);
      if (d < bestDiff) {
        bestDiff = d;
        bestIdx = i;
      }
    });
    setHover(bestIdx);
  };

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              ↗
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              League-wide go-for-it rate
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            {(FIRST.goRate * 100).toFixed(1)}% → {(LAST.goRate * 100).toFixed(1)}%
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="NFL-wide go-for-it rate on fourth down, 1999 to 2025. Rate roughly doubled from 11.2% in 1999 to 22.0% in 2025, with most of the growth concentrated after 2018."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="goRateArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.32)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.02)" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {Y_TICKS.map((v) => (
            <line
              key={`yg-${v}`}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yPlot(v)}
              y2={yPlot(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}

          {/* Analytics-era marker (subtle vertical line at 2019) */}
          <line
            x1={xPlot(ANALYTICS_ERA_START)}
            x2={xPlot(ANALYTICS_ERA_START)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="rgba(34, 211, 238, 0.22)"
            strokeWidth={1}
            strokeDasharray="3 5"
          />
          <text
            x={xPlot(ANALYTICS_ERA_START) + 6}
            y={PAD.top + 14}
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={10}
            letterSpacing="0.16em"
            fill="rgba(34, 211, 238, 0.7)"
          >
            ANALYTICS ERA
          </text>

          {/* Axis baselines */}
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={H - PAD.bottom}
            y2={H - PAD.bottom}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1}
          />
          <line
            x1={PAD.left}
            x2={PAD.left}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={1}
          />

          {/* Y-axis tick labels */}
          {Y_TICKS.map((v) => (
            <text
              key={`yl-${v}`}
              x={PAD.left - 10}
              y={yPlot(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={11}
              fill="rgba(255,255,255,0.5)"
            >
              {Math.round(v * 100)}%
            </text>
          ))}

          {/* X-axis tick labels */}
          {X_TICKS.map((y) => (
            <text
              key={`xl-${y}`}
              x={xPlot(y)}
              y={H - PAD.bottom + 22}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={11}
              fill="rgba(255,255,255,0.5)"
            >
              {y}
            </text>
          ))}

          {/* Axis titles */}
          <text
            x={20}
            y={PAD.top + PLOT_H / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${PAD.top + PLOT_H / 2})`}
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={11}
            letterSpacing="0.18em"
            fill="rgba(255,255,255,0.6)"
          >
            GO-FOR-IT %
          </text>

          {/* Area fill */}
          <path d={AREA_PATH} fill="url(#goRateArea)" />

          {/* Line */}
          <path
            d={LINE_PATH}
            fill="none"
            stroke="rgba(34, 211, 238, 0.95)"
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {/* Data points */}
          {ROWS.map((r, i) => (
            <circle
              key={r.season}
              cx={xPlot(r.season)}
              cy={yPlot(r.goRate)}
              r={hover === i ? 5 : 2.5}
              fill={
                hover === i ? "rgb(125, 232, 248)" : "rgba(34, 211, 238, 0.85)"
              }
              stroke="rgba(10, 18, 23, 0.7)"
              strokeWidth={hover === i ? 1.5 : 0.75}
              style={{ transition: "r 120ms ease" }}
            />
          ))}

          {/* Hover crosshair + tooltip */}
          {hovered && hover !== null
            ? (() => {
                const px = xPlot(hovered.season);
                const py = yPlot(hovered.goRate);
                const TW = 200;
                const TH = 64;
                const flipX = px + TW + 16 > W ? -1 : 1;
                const tx =
                  flipX > 0
                    ? Math.min(px + 16, W - TW - 8)
                    : Math.max(px - TW - 16, 8);
                const ty = Math.max(py - TH - 12, 8);
                return (
                  <g pointerEvents="none">
                    <line
                      x1={px}
                      x2={px}
                      y1={PAD.top}
                      y2={H - PAD.bottom}
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth={1}
                      strokeDasharray="3 4"
                    />
                    <rect
                      x={tx}
                      y={ty}
                      width={TW}
                      height={TH}
                      rx={6}
                      fill="rgba(10, 14, 18, 0.95)"
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
                      {hovered.season} season
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 44}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill="rgba(255,255,255,0.6)"
                    >
                      {(hovered.goRate * 100).toFixed(1)}% went for it ·{" "}
                      {hovered.era.toLowerCase()}
                    </text>
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span>nflfastR · all 4th-down decisions</span>
          <span>{ROWS.length} seasons · 1999–2025</span>
        </div>
      </div>
    </div>
  );
}
