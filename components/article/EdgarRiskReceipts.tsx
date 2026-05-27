"use client";

/**
 * The 6 "false positives" that subsequently underwent material distress
 * events. Each row is one company: flag window (cyan bar) on the left,
 * event marker (warm dot) at the time the distress crystallized.
 *
 * The visual evidence behind the article's central reframing: the model
 * isn't a Chapter 11 predictor, it's a 1-3 year leading indicator of
 * distress. Same signals that flagged BBBY two years before bankruptcy
 * also flagged Nordstrom three years before its take-private.
 *
 * Data: scripts/extract-edgar-risk-data.py reads
 * phase5_longitudinal_classification.csv and writes
 * data/edgar-risk-receipts.json.
 */

import { useState } from "react";
import receipts from "@/data/edgar-risk-receipts.json";

interface Row {
  ticker: string;
  company: string;
  flagStart: number;
  flagEnd: number;
  eventYear: number;
  eventMonth: string;
  event: string;
}

const ROWS: Row[] = receipts;

/** Measure rendered text width with the 2D canvas API so the tooltip
 * box can size to its content instead of using a fixed width. We
 * reuse a single canvas across calls (created lazily browser-side). */
function measureTextWidth(text: string, font: string): number {
  if (typeof document === "undefined") return text.length * 7;
  const w = window as unknown as { __edgarReceiptsCanvas?: HTMLCanvasElement };
  const canvas = w.__edgarReceiptsCanvas ?? document.createElement("canvas");
  w.__edgarReceiptsCanvas = canvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 7;
  ctx.font = font;
  return ctx.measureText(text).width;
}

const W = 900;
const H = 380;
const PAD = { top: 56, right: 28, bottom: 44, left: 200 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const ROW_H = PLOT_H / ROWS.length;
const BAR_H = 16;

const YEAR_MIN = 2019;
const YEAR_MAX = 2026;
const YEAR_TICKS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

const xPlot = (year: number) =>
  PAD.left + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * PLOT_W;

/** Convert "Q1"/"Q3"/"May"/"Oct"/"Mar" to a fractional year offset so the
 * event marker sits at a more honest position within its year. */
function monthFraction(month: string): number {
  const m = month.toLowerCase();
  const monthMap: Record<string, number> = {
    jan: 0.05, feb: 0.15, mar: 0.2, apr: 0.3, may: 0.35, jun: 0.45,
    jul: 0.55, aug: 0.65, sep: 0.7, oct: 0.8, nov: 0.9, dec: 0.97,
    q1: 0.15, q2: 0.4, q3: 0.6, q4: 0.85,
  };
  return monthMap[m] ?? 0.5;
}

export function EdgarRiskReceipts() {
  const [hover, setHover] = useState<number | null>(null);

  const hovered = hover !== null ? ROWS[hover] : null;

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              ◉
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              Six flagged companies: flag window and later distress event
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            flagged 2019–2022 · distressed 2024–2025
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Six companies flagged by the model in 2019 to 2022 that later underwent material distress events in 2024 to 2025: Nordstrom, Walgreens, Macy's, Kohl's, CVS, Lucid Motors."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Year tick lines (faint vertical gridlines) */}
          {YEAR_TICKS.map((y) => (
            <line
              key={`yg-${y}`}
              x1={xPlot(y)}
              x2={xPlot(y)}
              y1={PAD.top - 4}
              y2={H - PAD.bottom + 4}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          ))}

          {/* Year labels (top axis) */}
          {YEAR_TICKS.map((y) => (
            <text
              key={`yl-${y}`}
              x={xPlot(y)}
              y={PAD.top - 16}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={11}
              fill="rgba(255,255,255,0.5)"
            >
              {y}
            </text>
          ))}

          {/* Flag-window phase label (top) */}
          <text
            x={PAD.left + (xPlot(2022) - xPlot(2019)) / 2 + (xPlot(2019) - PAD.left)}
            y={PAD.top - 32}
            textAnchor="middle"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={9.5}
            letterSpacing="0.16em"
            fill="rgba(34, 211, 238, 0.7)"
          >
            ─── MODEL FIRED ───
          </text>
          <text
            x={xPlot(2024.5)}
            y={PAD.top - 32}
            textAnchor="middle"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={9.5}
            letterSpacing="0.16em"
            fill="rgba(251, 113, 113, 0.75)"
          >
            ─── DISTRESS ───
          </text>

          {/* Rows */}
          {ROWS.map((r, i) => {
            const isHover = hover === i;
            const y = PAD.top + i * ROW_H;
            const cy = y + ROW_H / 2;
            const flagX1 = xPlot(r.flagStart);
            const flagX2 = xPlot(r.flagEnd + 1); // inclusive end
            const eventX = xPlot(r.eventYear + monthFraction(r.eventMonth));

            return (
              <g
                key={r.ticker}
                onMouseEnter={() => setHover(i)}
                style={{ cursor: "pointer" }}
              >
                {/* Row hover background */}
                <rect
                  x={0}
                  y={y}
                  width={W}
                  height={ROW_H}
                  fill={isHover ? "rgba(34, 211, 238, 0.04)" : "transparent"}
                />

                {/* Label (ticker + company) */}
                <text
                  x={PAD.left - 14}
                  y={cy - 4}
                  textAnchor="end"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={12.5}
                  fontWeight={500}
                  fill={
                    isHover ? "rgb(255,255,255)" : "rgba(255,255,255,0.92)"
                  }
                >
                  {r.ticker}
                </text>
                <text
                  x={PAD.left - 14}
                  y={cy + 11}
                  textAnchor="end"
                  fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                  fontSize={11}
                  fill="rgba(255,255,255,0.55)"
                >
                  {r.company}
                </text>

                {/* Connecting hairline from flag-end to event */}
                <line
                  x1={flagX2}
                  x2={eventX - 8}
                  y1={cy}
                  y2={cy}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={1}
                  strokeDasharray="3 4"
                />

                {/* Flag window bar (cyan) */}
                <rect
                  x={flagX1}
                  y={cy - BAR_H / 2}
                  width={flagX2 - flagX1}
                  height={BAR_H}
                  rx={3}
                  fill={
                    isHover
                      ? "rgba(103, 232, 249, 0.7)"
                      : "rgba(34, 211, 238, 0.45)"
                  }
                  stroke="rgba(34, 211, 238, 0.85)"
                  strokeWidth={1}
                />

                {/* Event marker (warm dot) */}
                <circle
                  cx={eventX}
                  cy={cy}
                  r={isHover ? 7.5 : 6}
                  fill={
                    isHover
                      ? "rgb(252, 165, 165)"
                      : "rgba(248, 113, 113, 0.95)"
                  }
                  stroke="rgba(10, 14, 18, 0.7)"
                  strokeWidth={1.5}
                  style={{ transition: "r 120ms ease" }}
                />

                {/* Event month label (small, above the dot) */}
                <text
                  x={eventX + 12}
                  y={cy + 4}
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={10.5}
                  fill={
                    isHover ? "rgb(254, 202, 202)" : "rgba(248, 113, 113, 0.8)"
                  }
                  pointerEvents="none"
                >
                  {r.eventMonth} {r.eventYear}
                </text>
              </g>
            );
          })}

          {/* Hover tooltip showing the event description */}
          {hovered && hover !== null
            ? (() => {
                const y = PAD.top + hover * ROW_H + ROW_H / 2;
                const line1 = `${hovered.company} (${hovered.ticker})`;
                const line2 = hovered.event;
                const line1W = measureTextWidth(
                  line1,
                  '500 12.5px system-ui, -apple-system, "Segoe UI", sans-serif',
                );
                const line2W = measureTextWidth(
                  line2,
                  '11.5px system-ui, -apple-system, "Segoe UI", sans-serif',
                );
                const TW = Math.max(
                  220,
                  Math.min(W - 40, Math.ceil(Math.max(line1W, line2W)) + 28),
                );
                const TH = 62;
                const tx = (W - TW) / 2;
                const ty = y - TH - 12 < PAD.top ? y + 20 : y - TH - 12;
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
                      x={tx + 14}
                      y={ty + 22}
                      fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                      fontSize={12.5}
                      fontWeight={500}
                      fill="rgba(255,255,255,0.95)"
                    >
                      {hovered.company} ({hovered.ticker})
                    </text>
                    <text
                      x={tx + 14}
                      y={ty + 42}
                      fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                      fontSize={11.5}
                      fill="rgba(255,255,255,0.7)"
                    >
                      {hovered.event}
                    </text>
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-3 rounded-sm bg-accent/45 border border-accent/85" />
            <span>Model fired</span>
            <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full" style={{ background: "rgba(248, 113, 113, 0.95)" }} />
            <span>Distress event</span>
          </span>
          <span>hover any row for details</span>
        </div>
      </div>
    </div>
  );
}
