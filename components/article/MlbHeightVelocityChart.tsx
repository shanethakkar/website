"use client";

/**
 * Native dark-theme scatter for the MLB pitcher height-vs-velocity article.
 * Replaces the original Plotly HTML embed so the chart matches the site's
 * dark palette and never lives inside a sandboxed iframe.
 *
 * Data is precomputed from the original Plotly export in
 * scripts/extract-mlb-data.mjs and stored in data/mlb-height-velocity.ts.
 */

import { useMemo, useState } from "react";
import { mlbHeightVelocity, mlbTrendLine } from "@/data/mlb-height-velocity";

const W = 900;
const H = 520;
const PAD = { top: 32, right: 40, bottom: 64, left: 64 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function inchesToLabel(inches: number): string {
  const feet = Math.floor(inches / 12);
  const rem = inches % 12;
  return `${feet}'${rem}"`;
}

interface Domain {
  min: number;
  max: number;
}

function niceFloor(value: number, step: number) {
  return Math.floor(value / step) * step;
}
function niceCeil(value: number, step: number) {
  return Math.ceil(value / step) * step;
}

export function MlbHeightVelocityChart() {
  const [hover, setHover] = useState<number | null>(null);

  const { xDomain, yDomain, xTicks, yTicks } = useMemo(() => {
    const xs = mlbHeightVelocity.map((p) => p.heightIn);
    const ys = mlbHeightVelocity.map((p) => p.velocity);
    const x: Domain = {
      min: niceFloor(Math.min(...xs), 1),
      max: niceCeil(Math.max(...xs), 1),
    };
    const y: Domain = {
      min: niceFloor(Math.min(...ys) - 1, 5),
      max: niceCeil(Math.max(...ys) + 1, 5),
    };
    const xt: number[] = [];
    for (let v = x.min; v <= x.max; v += 2) xt.push(v);
    const yt: number[] = [];
    for (let v = y.min; v <= y.max; v += 5) yt.push(v);
    return { xDomain: x, yDomain: y, xTicks: xt, yTicks: yt };
  }, []);

  const xPlot = (h: number) =>
    PAD.left + ((h - xDomain.min) / (xDomain.max - xDomain.min)) * PLOT_W;
  const yPlot = (v: number) =>
    PAD.top + (1 - (v - yDomain.min) / (yDomain.max - yDomain.min)) * PLOT_H;

  const trend = mlbTrendLine
    ? {
        x1: xPlot(mlbTrendLine.x[0]),
        y1: yPlot(mlbTrendLine.y[0]),
        x2: xPlot(mlbTrendLine.x[1]),
        y2: yPlot(mlbTrendLine.y[1]),
      }
    : null;

  const hovered = hover !== null ? mlbHeightVelocity[hover] : null;

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              R
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              Height vs. Fastball Velocity — 2024
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            r = −0.001
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Scatter plot of MLB pitcher height vs. average fastball velocity for every pitcher with 50+ innings in the 2024 season. The points form a flat cloud with no upward trend."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Horizontal gridlines */}
          {yTicks.map((v) => (
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

          {/* Vertical gridlines */}
          {xTicks.map((v) => (
            <line
              key={`xg-${v}`}
              x1={xPlot(v)}
              x2={xPlot(v)}
              y1={PAD.top}
              y2={H - PAD.bottom}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          ))}

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

          {/* Y-axis tick labels (velocity, mph) */}
          {yTicks.map((v) => (
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
              {v}
            </text>
          ))}

          {/* X-axis tick labels (pitcher height) */}
          {xTicks.map((v) => (
            <text
              key={`xl-${v}`}
              x={xPlot(v)}
              y={H - PAD.bottom + 22}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={11}
              fill="rgba(255,255,255,0.5)"
            >
              {inchesToLabel(v)}
            </text>
          ))}

          {/* Axis titles */}
          <text
            x={PAD.left + PLOT_W / 2}
            y={H - 14}
            textAnchor="middle"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={11}
            letterSpacing="0.18em"
            fill="rgba(255,255,255,0.6)"
          >
            PITCHER HEIGHT
          </text>
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
            FASTBALL VELOCITY (MPH)
          </text>

          {/* Trend line — dashed, near-flat (slope ~0) */}
          {trend ? (
            <line
              x1={trend.x1}
              y1={trend.y1}
              x2={trend.x2}
              y2={trend.y2}
              stroke="rgba(34, 211, 238, 0.55)"
              strokeWidth={1.5}
              strokeDasharray="6 5"
            />
          ) : null}

          {/* Data points */}
          {mlbHeightVelocity.map((p, i) => {
            const isHover = hover === i;
            return (
              <circle
                key={`${p.name}-${i}`}
                cx={xPlot(p.heightIn)}
                cy={yPlot(p.velocity)}
                r={isHover ? 6 : 4}
                fill={
                  isHover ? "rgb(125, 232, 248)" : "rgba(34, 211, 238, 0.55)"
                }
                stroke={
                  isHover ? "rgba(255,255,255,0.85)" : "rgba(10, 18, 23, 0.7)"
                }
                strokeWidth={isHover ? 1.5 : 0.75}
                style={{ cursor: "pointer", transition: "r 120ms ease" }}
                onMouseEnter={() => setHover(i)}
              />
            );
          })}

          {/* Hover tooltip — drawn last so it sits on top of everything. */}
          {hovered && hover !== null
            ? (() => {
                const px = xPlot(hovered.heightIn);
                const py = yPlot(hovered.velocity);
                const TW = 220;
                const TH = 64;
                const flipX = px + TW + 16 > W ? -1 : 1;
                const flipY = py - TH - 16 < 0 ? -1 : 1;
                const tx = px + flipX * 12 - (flipX < 0 ? TW : 0);
                const ty = py + flipY * 12 - (flipY < 0 ? TH : 0);
                return (
                  <g pointerEvents="none">
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
                      {hovered.name}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 44}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill="rgba(255,255,255,0.6)"
                    >
                      {hovered.heightLabel} · {hovered.velocity.toFixed(1)} mph
                    </text>
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span>{mlbHeightVelocity.length} pitchers · 50+ IP · 2024 season</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-[1.5px] w-5 bg-accent/55" />
            <span>Trend line</span>
          </span>
        </div>
      </div>
    </div>
  );
}
