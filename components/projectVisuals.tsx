"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Mini visualizations for each project card. Each tells the story of the
 * project at a glance, using the same accent + data motifs as the rest of the
 * site. All draw inside an 88px-tall horizontal slot.
 */

/* ------------------------------------------------------------------ */
/* 4th Down — go-for-it rate climbing 1999 → 2025                      */
/* ------------------------------------------------------------------ */

const FOURTH_DOWN_POINTS: [number, number][] = [
  // (year-progress 0-1, rate 0-1) — modeled after the article's chart
  [0.0, 0.11],
  [0.06, 0.12],
  [0.12, 0.12],
  [0.2, 0.12],
  [0.3, 0.13],
  [0.4, 0.13],
  [0.5, 0.13],
  [0.6, 0.14],
  [0.66, 0.18],
  [0.72, 0.2],
  [0.78, 0.21],
  [0.84, 0.21],
  [0.9, 0.215],
  [1.0, 0.22],
];

export function FourthDownVisual() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const W = 320;
  const H = 88;
  // Extra left padding makes room for a rotated Y-axis label.
  const pad = { top: 10, right: 8, bottom: 18, left: 22 };

  const xy = (px: number, py: number) => ({
    x: pad.left + px * (W - pad.left - pad.right),
    // Map rate range [0.05, 0.25] to plot height
    y: H - pad.bottom - ((py - 0.05) / 0.2) * (H - pad.top - pad.bottom),
  });

  const points = FOURTH_DOWN_POINTS.map(([px, py]) => xy(px, py));
  const linePath = `M ${points[0].x},${points[0].y} ` +
    points
      .slice(1)
      .map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");

  const areaPath =
    `M ${points[0].x},${H - pad.bottom} ` +
    `L ${points[0].x},${points[0].y} ` +
    points
      .slice(1)
      .map((p) => `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ") +
    ` L ${points[points.length - 1].x},${H - pad.bottom} Z`;

  const endpoint = points[points.length - 1];
  const startpoint = points[0];

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-label="NFL go-for-it rate climbing from 11% in 1999 to 22% in 2025."
    >
      <defs>
        <linearGradient id="fd-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Baseline gridlines */}
      {[0.1, 0.15, 0.2].map((rate, i) => {
        const y = xy(0, rate).y;
        return (
          <line
            key={i}
            x1={pad.left}
            y1={y}
            x2={W - pad.right}
            y2={y}
            stroke="rgba(255,255,255,0.05)"
            strokeDasharray="2 4"
            strokeWidth={1}
          />
        );
      })}

      {/* Area fill */}
      <motion.path
        d={areaPath}
        fill="url(#fd-area)"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
      />

      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke="#22d3ee"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.21, 0.47, 0.32, 0.98] }}
      />

      {/* Endpoint dot */}
      <motion.circle
        cx={endpoint.x}
        cy={endpoint.y}
        r={2.5}
        fill="#67e8f9"
        initial={{ opacity: 0, scale: 0 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.3, delay: 1.1 }}
      />

      {/* Endpoint value annotation — anchors the right edge of the trend */}
      <motion.text
        x={endpoint.x - 6}
        y={endpoint.y - 4}
        textAnchor="end"
        fill="rgba(103, 232, 249, 0.9)"
        fontSize="9"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.04em"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 1.2 }}
      >
        22%
      </motion.text>

      {/* Starting value annotation — anchors the left edge so the climb reads */}
      <motion.text
        x={startpoint.x + 4}
        y={startpoint.y - 10}
        fill="rgba(139,138,131,0.7)"
        fontSize="9"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.04em"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: 1.0 }}
      >
        11%
      </motion.text>

      {/* Y-axis title — rotated mono label so a glance reads "what is this" */}
      <text
        x={10}
        y={pad.top + (H - pad.top - pad.bottom) / 2}
        textAnchor="middle"
        transform={`rotate(-90, 10, ${pad.top + (H - pad.top - pad.bottom) / 2})`}
        fill="rgba(139,138,131,0.65)"
        fontSize="8"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.18em"
      >
        GO-FOR-IT %
      </text>

      {/* Year axis labels */}
      <text
        x={pad.left}
        y={H - 4}
        fill="rgba(139,138,131,0.6)"
        fontSize="8"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.1em"
      >
        1999
      </text>
      <text
        x={W - pad.right}
        y={H - 4}
        textAnchor="end"
        fill="rgba(139,138,131,0.6)"
        fontSize="8"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.1em"
      >
        2025
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* F1 — mini forest plot with credible intervals around a zero line    */
/* ------------------------------------------------------------------ */

// Five driver-effect posteriors from the article's actual data file
// (data/f1-driver-rankings.ts). HAM at the headline, PER above VER showing
// the Verstappen Paradox, ALB as the article's "most interesting
// non-headliner" with a credible interval that crosses zero, TSU as the
// honest right-side anchor (most-positive current driver). Each row has a
// faint full-width track so the visual feels grounded even where the
// interval doesn't reach.
const F1_DRIVERS = [
  { code: "HAM", median: -1.04, hdi50: [-1.27, -0.86], hdi94: [-1.64, -0.51] },
  { code: "PER", median: -0.92, hdi50: [-1.13, -0.71], hdi94: [-1.49, -0.34] },
  { code: "VER", median: -0.67, hdi50: [-0.84, -0.45], hdi94: [-1.18, -0.14] },
  { code: "ALB", median: -0.52, hdi50: [-0.75, -0.32], hdi94: [-1.14, 0.09] },
  { code: "TSU", median: 0.49,  hdi50: [0.25, 0.69],   hdi94: [-0.11, 1.12] },
] as const;

export function F1Visual() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const W = 320;
  const H = 88;
  const pad = { top: 6, right: 10, bottom: 8, left: 32 };
  const ROW_H = (H - pad.top - pad.bottom) / F1_DRIVERS.length;
  // X range chosen to fit the real data: HAM's hdi94 lo = -1.64,
  // TSU's hdi94 hi = +1.12. Asymmetric range places zero slightly
  // right of center, which honestly reflects that 4 of the 5 drivers
  // sit on the negative side.
  const xMin = -1.75;
  const xMax = 1.25;
  const xPlot = (v: number) =>
    pad.left + ((v - xMin) / (xMax - xMin)) * (W - pad.left - pad.right);
  const zeroX = xPlot(0);
  const trackX = pad.left;
  const trackW = W - pad.left - pad.right;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-label="Mini forest plot of five F1 driver-effect posteriors against a zero line. Hamilton has the most negative effect; Kubica the most positive."
    >
      {/* Row tracks — faint full-width backgrounds, one per driver, so
          even short intervals feel anchored in their row */}
      {F1_DRIVERS.map((d, i) => {
        const cy = pad.top + i * ROW_H + ROW_H / 2;
        return (
          <rect
            key={`track-${d.code}`}
            x={trackX}
            y={cy - 3}
            width={trackW}
            height={6}
            rx={3}
            fill="rgba(255, 255, 255, 0.025)"
          />
        );
      })}

      {/* Dashed zero line — extends through all rows */}
      <line
        x1={zeroX}
        x2={zeroX}
        y1={pad.top + 1}
        y2={H - pad.bottom - 1}
        stroke="rgba(235,233,227,0.32)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />

      {F1_DRIVERS.map((d, i) => {
        const cy = pad.top + i * ROW_H + ROW_H / 2;
        const x94Lo = xPlot(d.hdi94[0]);
        const x94Hi = xPlot(d.hdi94[1]);
        const x50Lo = xPlot(d.hdi50[0]);
        const x50Hi = xPlot(d.hdi50[1]);
        const xMed = xPlot(d.median);

        return (
          <g key={d.code}>
            {/* Driver code */}
            <text
              x={4}
              y={cy + 3}
              fill="rgba(235,233,227,0.85)"
              fontSize="9"
              fontFamily="var(--font-mono), monospace"
              letterSpacing="0.06em"
            >
              {d.code}
            </text>

            {/* 94% HDI — light bar */}
            <motion.rect
              y={cy - 2.5}
              height={5}
              rx={2}
              fill="rgba(125, 232, 248, 0.28)"
              initial={{ x: xMed, width: 0 }}
              animate={inView ? { x: x94Lo, width: x94Hi - x94Lo } : {}}
              transition={{
                duration: 0.8,
                delay: 0.25 + i * 0.08,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            />

            {/* 50% HDI — darker bar inside the 94% */}
            <motion.rect
              y={cy - 3.5}
              height={7}
              rx={2.5}
              fill="rgba(125, 232, 248, 0.62)"
              initial={{ x: xMed, width: 0 }}
              animate={inView ? { x: x50Lo, width: x50Hi - x50Lo } : {}}
              transition={{
                duration: 0.8,
                delay: 0.4 + i * 0.08,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            />

            {/* Median dot */}
            <motion.circle
              cy={cy}
              cx={xMed}
              r={3}
              fill="rgb(167, 243, 248)"
              stroke="rgba(10, 18, 23, 0.5)"
              strokeWidth={0.6}
              initial={{ opacity: 0, scale: 0 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.25,
                delay: 0.85 + i * 0.08,
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* MLB — height vs velocity scatter with near-flat trend               */
/* ------------------------------------------------------------------ */

const MLB_POINTS: [number, number][] = [
  // (velocity-norm 0-1, height-norm 0-1) — stylized "no correlation" cloud.
  // Velocity sweeps the full X range; heights jitter through a narrow band,
  // so the trend line through them is nearly horizontal — that flatness IS
  // the visual story (height doesn't move with velocity).
  [0.05, 0.42],
  [0.1, 0.78],
  [0.14, 0.5],
  [0.18, 0.35],
  [0.22, 0.62],
  [0.27, 0.55],
  [0.32, 0.7],
  [0.37, 0.4],
  [0.42, 0.66],
  [0.47, 0.5],
  [0.52, 0.58],
  [0.57, 0.74],
  [0.62, 0.45],
  [0.67, 0.6],
  [0.72, 0.52],
  [0.77, 0.7],
  [0.82, 0.55],
  [0.87, 0.62],
  [0.92, 0.48],
  [0.97, 0.66],
];

export function MLBVisual() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const W = 320;
  const H = 88;
  // More room on the left for the rotated "HEIGHT" axis label and at the
  // bottom for the "VELOCITY" axis label.
  const pad = { top: 8, right: 8, bottom: 18, left: 22 };

  const xy = (velNorm: number, heightNorm: number) => ({
    x: pad.left + velNorm * (W - pad.left - pad.right),
    y: H - pad.bottom - heightNorm * (H - pad.top - pad.bottom),
  });

  // Trend line — nearly horizontal across the velocity axis. This is the
  // shape of the article's no-correlation story.
  const trendStart = xy(0, 0.55);
  const trendEnd = xy(1, 0.57);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-label="Scatter of MLB pitcher height vs. fastball velocity. Each height stripe has the same horizontal velocity spread — no correlation."
    >
      {/* Dashed trend line */}
      <motion.line
        x1={trendStart.x}
        y1={trendStart.y}
        x2={trendEnd.x}
        y2={trendEnd.y}
        stroke="#22d3ee"
        strokeWidth={1}
        strokeDasharray="3 3"
        strokeOpacity={0.5}
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: 1.0, delay: 0.5 }}
      />

      {/* Scatter dots */}
      {MLB_POINTS.map(([vel, height], i) => {
        const p = xy(vel, height);
        return (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2}
            fill="#22d3ee"
            initial={{ opacity: 0, scale: 0 }}
            animate={inView ? { opacity: 0.85, scale: 1 } : {}}
            transition={{
              duration: 0.3,
              delay: 0.1 + i * 0.018,
              ease: "easeOut",
            }}
          />
        );
      })}

      {/* Y-axis title — HEIGHT, rotated so it reads bottom-up */}
      <text
        x={10}
        y={pad.top + (H - pad.top - pad.bottom) / 2}
        textAnchor="middle"
        transform={`rotate(-90, 10, ${pad.top + (H - pad.top - pad.bottom) / 2})`}
        fill="rgba(139,138,131,0.65)"
        fontSize="8"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.18em"
      >
        HEIGHT
      </text>

      {/* X-axis title — VELOCITY, centered under the plot */}
      <text
        x={pad.left + (W - pad.left - pad.right) / 2}
        y={H - 4}
        textAnchor="middle"
        fill="rgba(139,138,131,0.65)"
        fontSize="8"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.18em"
      >
        VELOCITY
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* EdgarRisk — precision evolves 46% → 61% → 69%                       */
/* ------------------------------------------------------------------ */

const EDGAR_ROWS = [
  { label: "in-sample", precision: 0.46, color: "rgba(34, 211, 238, 0.55)" },
  { label: "+ distress", precision: 0.61, color: "rgba(34, 211, 238, 0.8)" },
  { label: "+ recovered", precision: 0.69, color: "rgba(103, 232, 249, 0.95)" },
];

export function EdgarRiskVisual() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const W = 320;
  const H = 88;
  const pad = { top: 8, right: 36, bottom: 18, left: 78 };
  const BAR_H = 12;
  const ROW_GAP = (H - pad.top - pad.bottom - BAR_H * 3) / 2;
  const X_MAX = 0.8;
  const xPlot = (v: number) =>
    pad.left + (v / X_MAX) * (W - pad.left - pad.right);
  const yPlot = (i: number) => pad.top + i * (BAR_H + ROW_GAP);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-label="EdgarRisk precision curves rising from 46% in-sample to 69% at extended horizon."
    >
      {/* Faint vertical grid at 25/50/75% */}
      {[0.25, 0.5, 0.75].map((v, i) => (
        <line
          key={i}
          x1={xPlot(v)}
          x2={xPlot(v)}
          y1={pad.top - 1}
          y2={H - pad.bottom + 1}
          stroke="rgba(255,255,255,0.04)"
          strokeDasharray="2 4"
          strokeWidth={1}
        />
      ))}

      {EDGAR_ROWS.map((r, i) => {
        const y = yPlot(i);
        return (
          <g key={i}>
            {/* Row label (left) */}
            <text
              x={pad.left - 6}
              y={y + BAR_H / 2 + 3}
              textAnchor="end"
              fill="rgba(139,138,131,0.75)"
              fontSize="8"
              fontFamily="var(--font-mono), monospace"
              letterSpacing="0.06em"
            >
              {r.label}
            </text>

            {/* Track */}
            <rect
              x={pad.left}
              y={y}
              width={W - pad.left - pad.right}
              height={BAR_H}
              rx={2.5}
              fill="rgba(255,255,255,0.035)"
            />

            {/* Bar */}
            <motion.rect
              x={pad.left}
              y={y}
              height={BAR_H}
              rx={2.5}
              fill={r.color}
              initial={{ width: 0 }}
              animate={
                inView ? { width: xPlot(r.precision) - pad.left } : {}
              }
              transition={{
                duration: 0.95,
                delay: 0.25 + i * 0.18,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
            />

            {/* Percentage label */}
            <motion.text
              x={xPlot(r.precision) + 6}
              y={y + BAR_H / 2 + 3}
              fontSize="9"
              fill={
                i === 2
                  ? "rgba(134, 239, 172, 0.95)"
                  : "rgba(103, 232, 249, 0.9)"
              }
              fontFamily="var(--font-mono), monospace"
              fontWeight={500}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.85 + i * 0.18 }}
            >
              {Math.round(r.precision * 100)}%
            </motion.text>
          </g>
        );
      })}

      {/* X-axis title */}
      <text
        x={pad.left + (W - pad.left - pad.right) / 2}
        y={H - 4}
        textAnchor="middle"
        fill="rgba(139,138,131,0.65)"
        fontSize="8"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.18em"
      >
        PRECISION → HORIZON
      </text>
    </svg>
  );
}
