"use client";

/**
 * The methodology pivot in one interaction. Same 6 companies (BBBY + 5
 * surviving retail peers), 4 years (2020-2023). Toggle between:
 *
 *   "LM-Negative ratio"    — BBBY sits at the bottom every year. The
 *                            canonical absolute finance-NLP signal would
 *                            have ranked BBBY the HEALTHIEST in this
 *                            cohort going into its 2023 Chapter 11.
 *
 *   "Peer-rank novelty"    — BBBY climbs to rank 1.0 in 2021 and 2023.
 *                            The model's actual signal: rewriting picks
 *                            up BBBY's pre-bankruptcy disclosure churn
 *                            while peers stayed boilerplate.
 *
 * Same data shape, two underlying signals, opposite story.
 *
 * Data: scripts/extract-edgar-risk-data.py reads BBBY + cohort sentiment
 * + novelty JSON from the project and writes
 * data/edgar-risk-cohort-comparator.json.
 */

import { useState } from "react";
import comparator from "@/data/edgar-risk-cohort-comparator.json";

interface CohortMember {
  ticker: string;
  name: string;
  isFocal: boolean;
}

interface ComparatorData {
  cohort: CohortMember[];
  years: string[];
  absolute: Record<string, (number | null)[]>;
  peerRank: Record<string, (number | null)[]>;
  rawNovelty: Record<string, (number | null)[]>;
}

const DATA = comparator as ComparatorData;

type View = "absolute" | "peerRank";

const W = 900;
const H = 460;
const PAD = { top: 40, right: 160, bottom: 70, left: 80 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

const VIEWS: Record<
  View,
  {
    label: string;
    yMax: number;
    yTicks: number[];
    format: (v: number) => string;
    axisTitle: string;
    subtitle: string;
  }
> = {
  absolute: {
    label: "LM-Negative ratio (absolute)",
    yMax: 0.055,
    yTicks: [0, 0.01, 0.02, 0.03, 0.04, 0.05],
    format: (v) => v.toFixed(3),
    axisTitle: "LM-NEGATIVE WORDS / TOTAL TOKENS",
    subtitle: "BBBY sits at the bottom — the canonical absolute sentiment signal would have ranked it the healthiest name in the cohort.",
  },
  peerRank: {
    label: "Peer-rank novelty (the model)",
    yMax: 1.0,
    yTicks: [0, 0.25, 0.5, 0.75, 1.0],
    format: (v) => v.toFixed(2),
    axisTitle: "NOVELTY PERCENTILE RANK IN COHORT",
    subtitle: "BBBY tops out at rank 1.0 in 2021 and 2023 — the model picks up the pre-bankruptcy rewriting that peers weren't doing.",
  },
};

// Cohort line colors — BBBY in bright cyan, surviving peers in muted greys
const LINE_COLORS: Record<string, { stroke: string; dot: string; label: string }> = {
  BBBY: {
    stroke: "rgba(34, 211, 238, 1)",
    dot: "rgb(125, 232, 248)",
    label: "rgb(125, 232, 248)",
  },
  BBY:  { stroke: "rgba(180, 180, 195, 0.55)", dot: "rgba(180, 180, 195, 0.75)", label: "rgba(180, 180, 195, 0.85)" },
  M:    { stroke: "rgba(160, 165, 180, 0.55)", dot: "rgba(160, 165, 180, 0.75)", label: "rgba(160, 165, 180, 0.85)" },
  KSS:  { stroke: "rgba(140, 150, 170, 0.55)", dot: "rgba(140, 150, 170, 0.75)", label: "rgba(140, 150, 170, 0.85)" },
  JWN:  { stroke: "rgba(125, 140, 165, 0.55)", dot: "rgba(125, 140, 165, 0.75)", label: "rgba(125, 140, 165, 0.85)" },
  WSM:  { stroke: "rgba(110, 130, 160, 0.55)", dot: "rgba(110, 130, 160, 0.75)", label: "rgba(110, 130, 160, 0.85)" },
};

export function EdgarRiskCohortComparator() {
  const [view, setView] = useState<View>("absolute");
  const [hover, setHover] = useState<{ ticker: string; yearIdx: number } | null>(null);

  const cfg = VIEWS[view];
  const dataset = view === "absolute" ? DATA.absolute : DATA.peerRank;

  const xPlot = (i: number) =>
    PAD.left + (i / (DATA.years.length - 1)) * PLOT_W;
  const yPlot = (v: number) =>
    PAD.top + (1 - v / cfg.yMax) * PLOT_H;

  const buildPath = (ticker: string) => {
    const values = dataset[ticker];
    const points: string[] = [];
    values.forEach((v, i) => {
      if (v == null) return;
      points.push(`${points.length === 0 ? "M" : "L"} ${xPlot(i)} ${yPlot(v)}`);
    });
    return points.join(" ");
  };

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[10px] text-accent">
              ⇄
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              BBBY vs. retail cohort — the methodology pivot
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            same 6 companies · two signals
          </div>
        </div>

        {/* Chip toggle */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-3 sm:px-5">
          {(Object.keys(VIEWS) as View[]).map((v) => {
            const isActive = view === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${
                  isActive
                    ? "border-accent-border bg-accent-soft text-accent-bright"
                    : "border-border-subtle bg-white/[0.025] text-fg-muted hover:border-accent-border/60 hover:text-fg-bright"
                }`}
                aria-pressed={isActive}
              >
                {VIEWS[v].label}
              </button>
            );
          })}
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Comparison of Bed Bath & Beyond against a 5-peer retail cohort across 2020 to 2023. Toggle between absolute Loughran-McDonald Negative ratio (where BBBY sits at the bottom) and peer-rank novelty (where BBBY climbs to rank 1.0 in 2021 and 2023)."
          className="block h-auto w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHover(null)}
        >
          {/* Gridlines */}
          {cfg.yTicks.map((v) => (
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
          {cfg.yTicks.map((v) => (
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
              {cfg.format(v)}
            </text>
          ))}

          {/* X-axis year labels */}
          {DATA.years.map((y, i) => (
            <text
              key={`xl-${y}`}
              x={xPlot(i)}
              y={H - PAD.bottom + 22}
              textAnchor="middle"
              fontFamily="var(--font-mono), ui-monospace, monospace"
              fontSize={11.5}
              fill="rgba(255,255,255,0.7)"
            >
              FY{y}
            </text>
          ))}

          {/* Y-axis title */}
          <text
            x={20}
            y={PAD.top + PLOT_H / 2}
            textAnchor="middle"
            transform={`rotate(-90, 20, ${PAD.top + PLOT_H / 2})`}
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={10}
            letterSpacing="0.18em"
            fill="rgba(255,255,255,0.55)"
          >
            {cfg.axisTitle}
          </text>

          {/* Annotation: BBBY's Ch.11 */}
          <text
            x={xPlot(DATA.years.length - 1)}
            y={PAD.top + 8}
            textAnchor="middle"
            fontFamily="var(--font-mono), ui-monospace, monospace"
            fontSize={9.5}
            letterSpacing="0.14em"
            fill="rgba(248, 113, 113, 0.75)"
          >
            ↓ BBBY CH.11
          </text>
          <line
            x1={xPlot(DATA.years.length - 1)}
            x2={xPlot(DATA.years.length - 1)}
            y1={PAD.top + 14}
            y2={H - PAD.bottom}
            stroke="rgba(248, 113, 113, 0.3)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />

          {/* Lines — non-focal first, BBBY last so it sits on top */}
          {DATA.cohort
            .filter((c) => !c.isFocal)
            .map((c) => (
              <path
                key={c.ticker}
                d={buildPath(c.ticker)}
                fill="none"
                stroke={LINE_COLORS[c.ticker].stroke}
                strokeWidth={1.5}
                strokeLinejoin="round"
                style={{ transition: "d 320ms ease" }}
              />
            ))}
          {DATA.cohort
            .filter((c) => c.isFocal)
            .map((c) => (
              <path
                key={c.ticker}
                d={buildPath(c.ticker)}
                fill="none"
                stroke={LINE_COLORS[c.ticker].stroke}
                strokeWidth={2.5}
                strokeLinejoin="round"
                style={{ transition: "d 320ms ease" }}
              />
            ))}

          {/* Dots */}
          {DATA.cohort.map((c) =>
            dataset[c.ticker].map((v, i) => {
              if (v == null) return null;
              const isFocalDot = c.isFocal;
              const isHover =
                hover?.ticker === c.ticker && hover?.yearIdx === i;
              return (
                <circle
                  key={`${c.ticker}-${i}`}
                  cx={xPlot(i)}
                  cy={yPlot(v)}
                  r={isHover ? 6 : isFocalDot ? 4.5 : 3}
                  fill={
                    isHover
                      ? "rgb(255,255,255)"
                      : LINE_COLORS[c.ticker].dot
                  }
                  stroke="rgba(10, 14, 18, 0.7)"
                  strokeWidth={isFocalDot ? 1.5 : 1}
                  style={{
                    transition: "cy 320ms ease, r 120ms ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHover({ ticker: c.ticker, yearIdx: i })}
                />
              );
            }),
          )}

          {/* End-of-line labels (right side) */}
          {DATA.cohort.map((c) => {
            const lastIdx = dataset[c.ticker].length - 1;
            const lastV = dataset[c.ticker][lastIdx];
            if (lastV == null) return null;
            return (
              <text
                key={`label-${c.ticker}`}
                x={W - PAD.right + 10}
                y={yPlot(lastV) + 4}
                fontFamily="var(--font-mono), ui-monospace, monospace"
                fontSize={c.isFocal ? 12 : 10.5}
                fontWeight={c.isFocal ? 500 : 400}
                fill={LINE_COLORS[c.ticker].label}
                style={{ transition: "y 320ms ease" }}
              >
                {c.ticker}
              </text>
            );
          })}

          {/* Hover tooltip */}
          {hover
            ? (() => {
                const v = dataset[hover.ticker][hover.yearIdx];
                if (v == null) return null;
                const member = DATA.cohort.find((c) => c.ticker === hover.ticker)!;
                const raw = DATA.rawNovelty[hover.ticker][hover.yearIdx];
                const TW = 220;
                const TH = view === "peerRank" && raw != null ? 80 : 64;
                const px = xPlot(hover.yearIdx);
                const py = yPlot(v);
                const flipX = px + TW + 12 > W - PAD.right ? -1 : 1;
                const tx =
                  flipX > 0
                    ? Math.min(px + 12, W - TW - 8)
                    : Math.max(px - TW - 12, 8);
                const ty = Math.max(py - TH - 8, 8);
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
                      x={tx + 12}
                      y={ty + 22}
                      fontFamily="var(--font-sans), ui-sans-serif, system-ui"
                      fontSize={12.5}
                      fontWeight={500}
                      fill="rgba(255,255,255,0.95)"
                    >
                      {member.name} · FY{DATA.years[hover.yearIdx]}
                    </text>
                    <text
                      x={tx + 12}
                      y={ty + 42}
                      fontFamily="var(--font-mono), ui-monospace, monospace"
                      fontSize={11}
                      fill={
                        view === "absolute"
                          ? "rgba(255,255,255,0.75)"
                          : "rgba(34, 211, 238, 0.95)"
                      }
                    >
                      {view === "absolute"
                        ? `LM-Neg ratio: ${cfg.format(v)}`
                        : `peer rank: ${cfg.format(v)}`}
                    </text>
                    {view === "peerRank" && raw != null ? (
                      <text
                        x={tx + 12}
                        y={ty + 60}
                        fontFamily="var(--font-mono), ui-monospace, monospace"
                        fontSize={10.5}
                        fill="rgba(255,255,255,0.55)"
                      >
                        raw novelty: {raw.toFixed(3)}
                      </text>
                    ) : null}
                  </g>
                );
              })()
            : null}
        </svg>

        <div className="flex items-center justify-between gap-4 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-fg-dim sm:px-5">
          <span>{cfg.subtitle}</span>
        </div>
      </div>
    </div>
  );
}
