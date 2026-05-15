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
/* F1 — top driver effects with credible intervals                     */
/* ------------------------------------------------------------------ */

const F1_DRIVERS = [
  { name: "Hamilton", effect: 0.85, ci: 0.12 },
  { name: "Perez", effect: 0.7, ci: 0.18 },
  { name: "Verstappen", effect: 0.66, ci: 0.14 },
  { name: "Alonso", effect: 0.58, ci: 0.16 },
];

export function F1Visual() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  const W = 320;
  const H = 88;
  const ROW_H = 18;
  const NAME_W = 70;
  const BAR_PAD = 6;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      {F1_DRIVERS.map((d, i) => {
        const y = i * ROW_H + 8;
        const barX = NAME_W + BAR_PAD;
        const barW = (W - barX - 4) * d.effect;
        const ciW = (W - barX - 4) * d.ci;

        return (
          <g key={d.name}>
            <text
              x={4}
              y={y + 7}
              fill="rgba(235,233,227,0.78)"
              fontSize="9"
              fontFamily="var(--font-mono), monospace"
              letterSpacing="0.02em"
            >
              {d.name}
            </text>

            {/* Track */}
            <rect
              x={barX}
              y={y + 4}
              width={W - barX - 4}
              height={5}
              rx={2.5}
              fill="rgba(255,255,255,0.04)"
            />

            {/* Credible interval */}
            <motion.rect
              y={y + 4}
              height={5}
              rx={2.5}
              fill="rgba(34,211,238,0.25)"
              initial={{ width: 0, x: barX + barW }}
              animate={
                inView
                  ? { width: ciW, x: barX + barW - ciW / 2 }
                  : {}
              }
              transition={{
                duration: 0.7,
                delay: 0.4 + i * 0.1,
                ease: "easeOut",
              }}
            />

            {/* Effect bar */}
            <motion.rect
              x={barX}
              y={y + 4}
              height={5}
              rx={2.5}
              fill="#22d3ee"
              initial={{ width: 0 }}
              animate={inView ? { width: barW } : {}}
              transition={{
                duration: 0.9,
                delay: 0.2 + i * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
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
