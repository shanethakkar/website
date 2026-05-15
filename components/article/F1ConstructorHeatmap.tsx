"use client";

/**
 * Native team-season effect heatmap for the F1 Bayesian rankings article.
 * Replaces a Plotly HTML iframe.
 *
 * 23 constructors × 12 seasons (2014–2025), 123 non-empty cells. Cell
 * color encodes the posterior mean TeamSeason Effect on a diverging
 * blue↔red scale: blue = car finished better than grid position would
 * predict, red = worse. Missing cells indicate the team didn't exist (or
 * didn't race) that season.
 */

import { useMemo, useState } from "react";
import {
  f1Constructors,
  f1HeatCells,
  f1Seasons,
  type F1HeatCell,
} from "@/data/f1-constructor-heatmap";

const CELL_W = 58;
const CELL_H = 32;
const PAD = { top: 48, right: 24, bottom: 48, left: 168 };
const W = PAD.left + f1Seasons.length * CELL_W + PAD.right;
const H = PAD.top + f1Constructors.length * CELL_H + PAD.bottom;

// Symmetric color domain so zero maps to neutral grey.
const COLOR_MAX = 3;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const COLD: RGB = { r: 56, g: 189, b: 248 }; // sky-400 — best
const NEUTRAL: RGB = { r: 28, g: 33, b: 40 }; // near-dark — zero
const WARM: RGB = { r: 248, g: 113, b: 113 }; // red-400 — worst

function cellColor(value: number): string {
  // Map value ∈ [−COLOR_MAX, +COLOR_MAX] → 0..1, then interpolate two
  // segments: [0, 0.5] cold→neutral, [0.5, 1] neutral→warm.
  const t = Math.max(-1, Math.min(1, value / COLOR_MAX));
  const u = (t + 1) / 2; // 0..1
  let r: number, g: number, b: number;
  if (u < 0.5) {
    const k = u / 0.5;
    r = lerp(COLD.r, NEUTRAL.r, k);
    g = lerp(COLD.g, NEUTRAL.g, k);
    b = lerp(COLD.b, NEUTRAL.b, k);
  } else {
    const k = (u - 0.5) / 0.5;
    r = lerp(NEUTRAL.r, WARM.r, k);
    g = lerp(NEUTRAL.g, WARM.g, k);
    b = lerp(NEUTRAL.b, WARM.b, k);
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function textColor(value: number): string {
  const abs = Math.abs(value);
  if (abs > 0.6) return "rgba(255, 255, 255, 0.95)";
  return "rgba(255, 255, 255, 0.6)";
}

function formatValue(value: number): string {
  const fixed = value.toFixed(2);
  return value < 0 ? fixed.replace("-", "−") : fixed;
}

interface IndexedCell extends F1HeatCell {
  row: number;
  col: number;
}

export function F1ConstructorHeatmap() {
  const [hover, setHover] = useState<number | null>(null);

  const cells = useMemo<IndexedCell[]>(() => {
    return f1HeatCells.map((c) => ({
      ...c,
      row: f1Constructors.indexOf(c.constructor),
      col: f1Seasons.indexOf(c.season),
    }));
  }, []);

  const hovered = hover !== null ? cells[hover] : null;

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              C
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              Constructor Performance — Hybrid Era (2014–2025)
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            TeamSeason Effect
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Heatmap of constructor team-season effects from 2014 to 2025. Blue cells indicate cars that finished better than grid position predicts; red cells indicate cars that finished worse. Mercedes 2022 and Red Bull 2022 are the deepest blue; Haas 2023 and Alpine 2025 are the deepest red."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Constructor row labels — right-aligned in the left margin. */}
          {f1Constructors.map((name, i) => {
            const cy = PAD.top + i * CELL_H + CELL_H / 2;
            const isHover = hovered?.row === i;
            return (
              <text
                key={`yl-${name}`}
                x={PAD.left - 10}
                y={cy}
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                fontSize={12}
                fontWeight={isHover ? 600 : 400}
                fill={isHover ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.72)"}
                style={{ transition: "fill 120ms ease" }}
              >
                {name}
              </text>
            );
          })}

          {/* Season column labels — centered under each column. */}
          {f1Seasons.map((year, i) => {
            const cx = PAD.left + i * CELL_W + CELL_W / 2;
            const isHover = hovered?.col === i;
            return (
              <text
                key={`xl-${year}`}
                x={cx}
                y={PAD.top + f1Constructors.length * CELL_H + 24}
                textAnchor="middle"
                fontFamily="var(--font-mono), ui-monospace, monospace"
                fontSize={11}
                fontWeight={isHover ? 600 : 400}
                fill={isHover ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.55)"}
                style={{ transition: "fill 120ms ease" }}
              >
                {year}
              </text>
            );
          })}

          {/* Cells — rendered in two passes so the hovered cell can carry
              a brighter border on top of all surrounding cells. */}
          {cells.map((c, idx) => {
            const x = PAD.left + c.col * CELL_W;
            const y = PAD.top + c.row * CELL_H;
            return (
              <g key={`${c.constructor}-${c.season}`}>
                <rect
                  x={x + 1}
                  y={y + 1}
                  width={CELL_W - 2}
                  height={CELL_H - 2}
                  fill={cellColor(c.value)}
                  rx={3}
                  onMouseEnter={() => setHover(idx)}
                  style={{ cursor: "pointer" }}
                />
                <text
                  x={x + CELL_W / 2}
                  y={y + CELL_H / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={11}
                  fontWeight={500}
                  fill={textColor(c.value)}
                  pointerEvents="none"
                >
                  {formatValue(c.value)}
                </text>
              </g>
            );
          })}

          {/* Hover ring on top of the active cell. */}
          {hovered
            ? (() => {
                const x = PAD.left + hovered.col * CELL_W;
                const y = PAD.top + hovered.row * CELL_H;
                return (
                  <rect
                    x={x + 1}
                    y={y + 1}
                    width={CELL_W - 2}
                    height={CELL_H - 2}
                    fill="none"
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth={1.5}
                    rx={3}
                    pointerEvents="none"
                  />
                );
              })()
            : null}

          {/* Tooltip — pinned just above the hovered cell, flipped below
              when near the top of the SVG. */}
          {hovered
            ? (() => {
                const TW = 240;
                const TH = 70;
                const cx = PAD.left + hovered.col * CELL_W + CELL_W / 2;
                const cy = PAD.top + hovered.row * CELL_H;
                const flipY = cy - TH - 10 < 0 ? 1 : -1;
                const tx = Math.max(
                  6,
                  Math.min(W - TW - 6, cx - TW / 2),
                );
                const ty =
                  flipY < 0 ? cy - TH - 10 : cy + CELL_H + 10;
                return (
                  <g pointerEvents="none">
                    <rect
                      x={tx}
                      y={ty}
                      width={TW}
                      height={TH}
                      rx={6}
                      fill="rgba(10, 14, 18, 0.96)"
                      stroke="rgba(34, 211, 238, 0.4)"
                      strokeWidth={1}
                    />
                    <text
                      x={tx + 14}
                      y={ty + 22}
                      fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                      fontSize={13}
                      fontWeight={600}
                      fill="rgba(255,255,255,0.96)"
                    >
                      {hovered.constructor} · {hovered.season}
                    </text>
                    <text
                      x={tx + 14}
                      y={ty + 42}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11.5}
                      fill="rgba(255,255,255,0.78)"
                    >
                      Posterior mean: {formatValue(hovered.value)}
                    </text>
                    <text
                      x={tx + 14}
                      y={ty + 58}
                      fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                      fontSize={11}
                      fontStyle="italic"
                      fill={
                        hovered.value < 0
                          ? "rgba(125, 232, 248, 0.92)"
                          : "rgba(248, 113, 113, 0.92)"
                      }
                    >
                      Finished {Math.abs(hovered.value).toFixed(2)} positions{" "}
                      {hovered.value < 0 ? "better" : "worse"} than expected
                    </text>
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span>{cells.length} team-seasons · 23 constructors</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-5 rounded-[2px]"
                style={{ background: cellColor(-COLOR_MAX) }}
              />
              <span>Better</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-5 rounded-[2px]"
                style={{ background: cellColor(0) }}
              />
              <span>Zero</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-5 rounded-[2px]"
                style={{ background: cellColor(COLOR_MAX) }}
              />
              <span>Worse</span>
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
