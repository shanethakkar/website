"use client";

/**
 * Native dark-theme bar chart of NFL 4th-down conversion rates by
 * yards-to-go bucket (1999–2025, go-for-it attempts only).
 *
 * Source data: scripts/extract-fourth-down-data.py reads
 * NFL_4thDown/data/fourth_downs_clean.parquet and writes
 * data/fourth-down-conversion-rates.json.
 */

import { useState } from "react";
import conversionRates from "@/data/fourth-down-conversion-rates.json";

interface Row {
  bucket: string;
  attempts: number;
  conversions: number;
  rate: number;
}

const ROWS: Row[] = conversionRates;
const TOTAL_ATTEMPTS = ROWS.reduce((acc, r) => acc + r.attempts, 0);

const W = 900;
const H = 460;
const PAD = { top: 32, right: 40, bottom: 80, left: 72 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const Y_MAX = 0.8;
const Y_TICKS = [0, 0.2, 0.4, 0.6, 0.8];

export function FourthDownConversionRates() {
  const [hover, setHover] = useState<number | null>(null);

  const bandWidth = PLOT_W / ROWS.length;
  const barWidth = bandWidth * 0.58;

  const yPlot = (v: number) => PAD.top + (1 - v / Y_MAX) * PLOT_H;
  const xCenter = (i: number) => PAD.left + bandWidth * (i + 0.5);

  const hovered = hover !== null ? ROWS[hover] : null;

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              %
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              4th Down Conversion Rate — 1999–2025
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            n = {TOTAL_ATTEMPTS.toLocaleString()} attempts
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Bar chart of NFL fourth-down conversion rates by yards to go, 1999 to 2025. Teams convert 66% on fourth and one, 52% on fourth and 2 to 3, 43% on fourth and 4 to 6, and 28% on fourth and 7+."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Horizontal gridlines */}
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
          {ROWS.map((r, i) => (
            <text
              key={`xl-${r.bucket}`}
              x={xCenter(i)}
              y={H - PAD.bottom + 24}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={13}
              fill="rgba(255,255,255,0.7)"
            >
              4th & {r.bucket}
            </text>
          ))}

          {/* Axis titles */}
          <text
            x={PAD.left + PLOT_W / 2}
            y={H - 16}
            textAnchor="middle"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={11}
            letterSpacing="0.18em"
            fill="rgba(255,255,255,0.6)"
          >
            YARDS TO GO
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
            CONVERSION RATE
          </text>

          {/* Bars */}
          {ROWS.map((r, i) => {
            const isHover = hover === i;
            const x = xCenter(i) - barWidth / 2;
            const y = yPlot(r.rate);
            const h = H - PAD.bottom - y;
            return (
              <g key={r.bucket}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={h}
                  fill={
                    isHover
                      ? "rgba(103, 232, 249, 0.85)"
                      : "rgba(34, 211, 238, 0.7)"
                  }
                  stroke={
                    isHover
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(34, 211, 238, 0.95)"
                  }
                  strokeWidth={1}
                  rx={3}
                  style={{ cursor: "pointer", transition: "fill 120ms ease" }}
                  onMouseEnter={() => setHover(i)}
                />
                <text
                  x={xCenter(i)}
                  y={y - 8}
                  textAnchor="middle"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={13}
                  fontWeight={500}
                  fill={
                    isHover ? "rgb(255,255,255)" : "rgba(255,255,255,0.85)"
                  }
                  pointerEvents="none"
                >
                  {Math.round(r.rate * 100)}%
                </text>
              </g>
            );
          })}

          {/* Hover tooltip */}
          {hovered && hover !== null
            ? (() => {
                const px = xCenter(hover);
                const py = yPlot(hovered.rate);
                const TW = 220;
                const TH = 70;
                const flipX = px + TW / 2 + 16 > W ? -1 : 1;
                const tx =
                  flipX > 0
                    ? Math.min(px + 16, W - TW - 8)
                    : Math.max(px - TW - 16, 8);
                const ty = Math.max(py - TH - 8, 8);
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
                      4th &amp; {hovered.bucket}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 42}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill="rgba(255,255,255,0.7)"
                    >
                      {(hovered.rate * 100).toFixed(1)}% converted
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 58}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill="rgba(255,255,255,0.5)"
                    >
                      {hovered.conversions.toLocaleString()} of{" "}
                      {hovered.attempts.toLocaleString()} attempts
                    </text>
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span>nflfastR · go-for-it attempts only</span>
          <span>1999–2025 regular season</span>
        </div>
      </div>
    </div>
  );
}
