"use client";

/**
 * Native forest plot of F1 driver-effect posteriors for the Bayesian
 * rankings article. Replaces a Plotly HTML iframe.
 *
 * For each of 46 drivers (≥20 races):
 *   - light cyan bar  = 94% credible interval
 *   - darker cyan bar = 50% credible interval
 *   - bright dot      = posterior median
 *
 * Data extracted from the Plotly export — see scripts/extract-f1-data.mjs.
 */

import { useMemo, useState } from "react";
import { f1DriverRankings, type F1Driver } from "@/data/f1-driver-rankings";

const W = 900;
const ROW_H = 22;
const PAD = { top: 40, right: 30, bottom: 72, left: 80 };
const PLOT_H = f1DriverRankings.length * ROW_H;
const H = PAD.top + PLOT_H + PAD.bottom;
const PLOT_W = W - PAD.left - PAD.right;

const HDI_94_FILL = "rgba(125, 232, 248, 0.16)";
const HDI_50_FILL = "rgba(125, 232, 248, 0.5)";
const MEDIAN_FILL = "rgb(125, 232, 248)";

function formatNumber(value: number, digits = 2): string {
  const fixed = value.toFixed(digits);
  return value < 0 ? fixed.replace("-", "−") : fixed;
}

export function F1DriverRankings() {
  const [hover, setHover] = useState<number | null>(null);

  const { xMin, xMax, xTicks } = useMemo(() => {
    const lo = Math.min(...f1DriverRankings.map((d) => d.hdi94[0]));
    const hi = Math.max(...f1DriverRankings.map((d) => d.hdi94[1]));
    const min = Math.floor(lo * 2) / 2 - 0.1;
    const max = Math.ceil(hi * 2) / 2 + 0.1;
    const ticks: number[] = [];
    for (let v = Math.ceil(min * 2) / 2; v <= max; v += 0.5) {
      ticks.push(Number(v.toFixed(1)));
    }
    return { xMin: min, xMax: max, xTicks: ticks };
  }, []);

  const xPlot = (v: number) =>
    PAD.left + ((v - xMin) / (xMax - xMin)) * PLOT_W;
  const rowY = (i: number) => PAD.top + i * ROW_H + ROW_H / 2;

  const zeroX = xPlot(0);

  const hovered: F1Driver | null = hover !== null ? f1DriverRankings[hover] : null;

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              R
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              F1 Driver Rankings — Hybrid Era (2014–2025)
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            46 drivers · 20+ races
          </div>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Forest plot of driver-effect posteriors for 46 F1 drivers (2014–2025, minimum 20 races). Hamilton at the top with the strongest negative effect; Kubica at the bottom with the strongest positive effect."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Vertical gridlines at each major x-tick */}
          {xTicks.map((v) => (
            <line
              key={`xg-${v}`}
              x1={xPlot(v)}
              x2={xPlot(v)}
              y1={PAD.top - 8}
              y2={PAD.top + PLOT_H + 4}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          ))}

          {/* Zero line — dashed, slightly brighter */}
          <line
            x1={zeroX}
            x2={zeroX}
            y1={PAD.top - 8}
            y2={PAD.top + PLOT_H + 4}
            stroke="rgba(255,255,255,0.32)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {/* Row hover stripes — drawn below the bars so hover highlights
              don't obscure the data. */}
          {f1DriverRankings.map((d, i) => (
            <rect
              key={`hr-${d.code}`}
              x={PAD.left - 36}
              y={PAD.top + i * ROW_H}
              width={PLOT_W + 36}
              height={ROW_H}
              fill={hover === i ? "rgba(34, 211, 238, 0.06)" : "transparent"}
              pointerEvents="none"
            />
          ))}

          {/* For each driver: 94% bar, 50% bar, median dot. We render one
              transparent "row hit" rect over the whole row so the user can
              hover anywhere on the row to activate the tooltip, not just
              the bar itself. */}
          {f1DriverRankings.map((d, i) => {
            const y = rowY(i);
            const x94a = xPlot(d.hdi94[0]);
            const x94b = xPlot(d.hdi94[1]);
            const x50a = xPlot(d.hdi50[0]);
            const x50b = xPlot(d.hdi50[1]);
            const xm = xPlot(d.median);
            const isHover = hover === i;
            return (
              <g key={d.code}>
                <rect
                  x={x94a}
                  y={y - 7}
                  width={Math.max(2, x94b - x94a)}
                  height={14}
                  fill={HDI_94_FILL}
                  rx={2}
                />
                <rect
                  x={x50a}
                  y={y - 5}
                  width={Math.max(2, x50b - x50a)}
                  height={10}
                  fill={HDI_50_FILL}
                  rx={2}
                />
                <circle
                  cx={xm}
                  cy={y}
                  r={isHover ? 4.5 : 3.5}
                  fill={MEDIAN_FILL}
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth={1}
                  style={{ transition: "r 120ms ease" }}
                />
                {/* Row label — driver code on the left */}
                <text
                  x={PAD.left - 10}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontFamily="var(--font-mono), ui-monospace, monospace"
                  fontSize={11}
                  fontWeight={isHover ? 600 : 400}
                  fill={isHover ? "rgb(255,255,255)" : "rgba(255,255,255,0.78)"}
                  style={{ transition: "fill 120ms ease" }}
                >
                  {d.code}
                </text>
                {/* Invisible row hitbox for hover */}
                <rect
                  x={PAD.left - 60}
                  y={PAD.top + i * ROW_H}
                  width={PLOT_W + 60}
                  height={ROW_H}
                  fill="transparent"
                  onMouseEnter={() => setHover(i)}
                  style={{ cursor: "pointer" }}
                />
              </g>
            );
          })}

          {/* X-axis baseline */}
          <line
            x1={PAD.left}
            x2={PAD.left + PLOT_W}
            y1={PAD.top + PLOT_H + 4}
            y2={PAD.top + PLOT_H + 4}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={1}
          />

          {/* X-axis tick labels */}
          {xTicks.map((v) => (
            <text
              key={`xl-${v}`}
              x={xPlot(v)}
              y={PAD.top + PLOT_H + 22}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={11}
              fill="rgba(255,255,255,0.5)"
            >
              {formatNumber(v, v % 1 === 0 ? 1 : 1)}
            </text>
          ))}

          {/* X-axis title */}
          <text
            x={PAD.left + PLOT_W / 2}
            y={H - 22}
            textAnchor="middle"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={11}
            letterSpacing="0.16em"
            fill="rgba(255,255,255,0.6)"
          >
            DRIVER EFFECT &nbsp;·&nbsp; NEGATIVE = BETTER
          </text>

          {/* Hover tooltip — positioned near the row, flipped horizontally
              if the row's median is on the right half so the tooltip never
              clips outside the chart. The description line uses
              <foreignObject> so it can word-wrap (SVG <text> can't). */}
          {hovered && hover !== null
            ? (() => {
                const TW = 280;
                const TH = 120;
                const px = xPlot(hovered.median);
                const py = rowY(hover);
                const flipX = px + TW + 16 > W - PAD.right ? -1 : 1;
                const flipY = py - TH - 12 < PAD.top ? 1 : -1;
                const tx = px + flipX * 14 - (flipX < 0 ? TW : 0);
                const ty = py + flipY * 12 - (flipY < 0 ? TH : 0);
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
                      {hovered.code}
                      <tspan
                        fontFamily="var(--font-mono), ui-monospace, monospace"
                        fontSize={11}
                        fontWeight={400}
                        fill="rgba(255,255,255,0.55)"
                      >
                        {"  "}· {hovered.races} races
                      </tspan>
                    </text>
                    <text
                      x={tx + 14}
                      y={ty + 42}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11.5}
                      fill="rgba(255,255,255,0.78)"
                    >
                      Median: {formatNumber(hovered.median, 3)}
                    </text>
                    <text
                      x={tx + 14}
                      y={ty + 58}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11.5}
                      fill="rgba(255,255,255,0.6)"
                    >
                      94% HDI: [{formatNumber(hovered.hdi94[0], 2)},{" "}
                      {formatNumber(hovered.hdi94[1], 2)}]
                    </text>
                    <foreignObject
                      x={tx + 14}
                      y={ty + 70}
                      width={TW - 28}
                      height={TH - 78}
                    >
                      <div
                        style={{
                          fontFamily:
                            "var(--font-sans), ui-sans-serif, system-ui",
                          fontSize: "11.5px",
                          lineHeight: 1.35,
                          fontStyle: "italic",
                          color: "rgba(34,211,238,0.9)",
                          wordBreak: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        {hovered.description}
                      </div>
                    </foreignObject>
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-5 rounded-[2px]"
              style={{ background: HDI_94_FILL }}
            />
            <span>94% HDI</span>
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-5 rounded-[2px]"
              style={{ background: HDI_50_FILL }}
            />
            <span>50% HDI</span>
          </span>
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full border border-white/80"
              style={{ background: MEDIAN_FILL }}
            />
            <span>Median</span>
          </span>
        </div>
      </div>
    </div>
  );
}
