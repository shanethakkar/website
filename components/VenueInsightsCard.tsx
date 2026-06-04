"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Match the NFL card's auto-cycle cadence so the two flagship previews
 * breathe in sync. */
const CYCLE_MS = 10000;

const CHIPS = ["TypeScript", "next.js", "Web Workers", "Papa Parse", "SVG viz"];

/** Bright cyan for the Pareto cumulative line + crossover marker. Tile and
 * bar fills use inline rgba() with per-element opacity ramps. */
const ACCENT_BRIGHT = "#67e8f9";
// Quadrant / categorical colors, borrowed from the site's grade palette so
// the menu-engineering chart speaks the same visual language as the NFL card.
const GREEN = "#34d399";
const YELLOW = "#facc15";
const ORANGE = "#fb923c";
const RED = "#f87171";

/** Fixed drawing height for the preview chart area. Keeps the panel from
 * reflowing as modules crossfade in and out. */
const CHART_H = 168;

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

interface ChartProps {
  /** Gates entrance animations until the card scrolls into view (module 0)
   * — later modules mount already-active and animate immediately. */
  active: boolean;
  /** Live pixel width of the chart area, from a ResizeObserver. 0 until the
   * first measurement, in which case the chart renders nothing. */
  width: number;
}

interface ModuleSpec {
  key: string;
  label: string;
  render: (p: ChartProps) => ReactNode;
}

/* ── 01 · Category Performance — revenue treemap ─────────────────────────── */
// Manual squarified-ish layout: fractions of the drawing box. Areas track the
// share values so the tiles read proportionally without a runtime treemap.
const TREEMAP_TILES = [
  { label: "Beer", share: "34%", x: 0, y: 0, w: 0.34, h: 1, o: 0.42 },
  { label: "Food", share: "28%", x: 0.34, y: 0, w: 0.42, h: 0.667, o: 0.3 },
  { label: "Soda", share: "16%", x: 0.76, y: 0, w: 0.24, h: 0.667, o: 0.22 },
  { label: "Water", share: "12%", x: 0.34, y: 0.667, w: 0.36, h: 0.333, o: 0.16 },
  { label: "Merch", share: "10%", x: 0.7, y: 0.667, w: 0.3, h: 0.333, o: 0.12 },
] as const;

function CategoryTreemap({ active, width }: ChartProps) {
  if (width === 0) return null;
  const gap = 2;
  return (
    <svg width={width} height={CHART_H} aria-hidden="true">
      {TREEMAP_TILES.map((t, i) => {
        const x = t.x * width + gap;
        const y = t.y * CHART_H + gap;
        const w = t.w * width - gap * 2;
        const h = t.h * CHART_H - gap * 2;
        const showLabel = w > 52 && h > 30;
        return (
          <motion.g
            key={t.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={active ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.05 + i * 0.07, ease: EASE }}
            style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}
          >
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={4}
              fill={`rgba(34, 211, 238, ${t.o})`}
              stroke="rgba(34, 211, 238, 0.4)"
              strokeWidth={1}
            />
            {showLabel && (
              <>
                <text
                  x={x + 8}
                  y={y + 16}
                  fill="rgba(250, 250, 246, 0.92)"
                  fontSize="10.5"
                  fontFamily="var(--font-sans), sans-serif"
                  fontWeight={500}
                >
                  {t.label}
                </text>
                <text
                  x={x + 8}
                  y={y + 29}
                  fill="rgba(103, 232, 249, 0.85)"
                  fontSize="9"
                  fontFamily="var(--font-mono), monospace"
                  letterSpacing="0.06em"
                >
                  {t.share}
                </text>
              </>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

/* ── 02 · Pareto / tail-SKU finder — bars + cumulative line ──────────────── */
const PARETO_VALUES = [100, 72, 50, 34, 22, 14, 8, 5];
const PARETO_TOTAL = PARETO_VALUES.reduce((a, b) => a + b, 0);
// Running cumulative share, 0–1, used for the line + 80% crossover.
const PARETO_CUM = PARETO_VALUES.reduce<number[]>((acc, v) => {
  const prev = acc.length ? acc[acc.length - 1] : 0;
  acc.push(prev + v / PARETO_TOTAL);
  return acc;
}, []);

function ParetoChart({ active, width }: ChartProps) {
  if (width === 0) return null;
  const pad = { top: 12, right: 10, bottom: 16, left: 10 };
  const plotW = width - pad.left - pad.right;
  const plotH = CHART_H - pad.top - pad.bottom;
  const n = PARETO_VALUES.length;
  const slot = plotW / n;
  const barW = slot * 0.58;
  const maxV = PARETO_VALUES[0];

  const cumPt = (i: number) => ({
    x: pad.left + slot * (i + 0.5),
    y: pad.top + (1 - PARETO_CUM[i]) * plotH,
  });
  const linePath =
    `M ${cumPt(0).x.toFixed(1)},${cumPt(0).y.toFixed(1)} ` +
    PARETO_CUM.slice(1)
      .map((_, i) => {
        const p = cumPt(i + 1);
        return `L ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(" ");

  const y80 = pad.top + (1 - 0.8) * plotH;
  // First item whose cumulative share clears 80% — the "vital few" cutoff.
  const crossIdx = PARETO_CUM.findIndex((c) => c >= 0.8);

  return (
    <svg width={width} height={CHART_H} aria-hidden="true">
      {/* 80% reference line */}
      <line
        x1={pad.left}
        x2={width - pad.right}
        y1={y80}
        y2={y80}
        stroke="rgba(235, 233, 227, 0.28)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <text
        x={width - pad.right}
        y={y80 - 4}
        textAnchor="end"
        fill="rgba(139, 138, 131, 0.8)"
        fontSize="8"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="0.1em"
      >
        80%
      </text>

      {/* Bars */}
      {PARETO_VALUES.map((v, i) => {
        const h = (v / maxV) * plotH;
        const x = pad.left + slot * i + (slot - barW) / 2;
        const isVital = i <= crossIdx;
        return (
          <motion.rect
            key={i}
            x={x}
            width={barW}
            rx={1.5}
            fill={
              isVital ? "rgba(34, 211, 238, 0.7)" : "rgba(34, 211, 238, 0.22)"
            }
            initial={{ height: 0, y: pad.top + plotH }}
            animate={
              active ? { height: h, y: pad.top + plotH - h } : {}
            }
            transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: EASE }}
          />
        );
      })}

      {/* Cumulative line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={ACCENT_BRIGHT}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={active ? { pathLength: 1 } : {}}
        transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
      />
      {/* Crossover marker */}
      {crossIdx >= 0 && (
        <motion.circle
          cx={cumPt(crossIdx).x}
          cy={cumPt(crossIdx).y}
          r={3}
          fill={ACCENT_BRIGHT}
          stroke="rgba(10, 18, 23, 0.6)"
          strokeWidth={0.8}
          initial={{ opacity: 0, scale: 0 }}
          animate={active ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 1.2 }}
        />
      )}
    </svg>
  );
}

/* ── 03 · Menu Engineering — popularity × margin quadrants ───────────────── */
// (popularity 0–1, margin 0–1, quadrant color). Spread so each quadrant is
// populated; the crosshair sits at the median split.
const MENU_POINTS: [number, number, string][] = [
  [0.82, 0.86, GREEN], // stars
  [0.7, 0.74, GREEN],
  [0.9, 0.66, GREEN],
  [0.64, 0.9, GREEN],
  [0.22, 0.82, YELLOW], // puzzles
  [0.34, 0.7, YELLOW],
  [0.16, 0.62, YELLOW],
  [0.78, 0.3, ORANGE], // plowhorses
  [0.88, 0.18, ORANGE],
  [0.66, 0.36, ORANGE],
  [0.24, 0.26, RED], // dogs
  [0.14, 0.34, RED],
  [0.36, 0.16, RED],
  [0.3, 0.4, RED],
];

function MenuQuadrants({ active, width }: ChartProps) {
  if (width === 0) return null;
  const pad = 10;
  const plotW = width - pad * 2;
  const plotH = CHART_H - pad * 2;
  const px = (v: number) => pad + v * plotW;
  const py = (v: number) => pad + (1 - v) * plotH;
  const midX = pad + plotW / 2;
  const midY = pad + plotH / 2;

  const corners: [string, string, number, number, string][] = [
    ["STARS", "end", width - pad - 4, pad + 10, GREEN],
    ["PUZZLES", "start", pad + 4, pad + 10, YELLOW],
    ["PLOWHORSE", "end", width - pad - 4, CHART_H - pad - 4, ORANGE],
    ["DOGS", "start", pad + 4, CHART_H - pad - 4, RED],
  ];

  return (
    <svg width={width} height={CHART_H} aria-hidden="true">
      {/* Crosshair split */}
      <line
        x1={midX}
        x2={midX}
        y1={pad}
        y2={CHART_H - pad}
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />
      <line
        x1={pad}
        x2={width - pad}
        y1={midY}
        y2={midY}
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />

      {corners.map(([label, anchor, x, y, color]) => (
        <text
          key={label}
          x={x}
          y={y}
          textAnchor={anchor as "start" | "end"}
          fill={color}
          fillOpacity={0.7}
          fontSize="7.5"
          fontFamily="var(--font-mono), monospace"
          letterSpacing="0.12em"
        >
          {label}
        </text>
      ))}

      {MENU_POINTS.map(([popn, margin, color], i) => (
        <motion.circle
          key={i}
          cx={px(popn)}
          cy={py(margin)}
          r={3.2}
          fill={color}
          fillOpacity={0.85}
          stroke="rgba(10, 12, 14, 0.5)"
          strokeWidth={0.6}
          initial={{ opacity: 0, scale: 0 }}
          animate={active ? { opacity: 0.85, scale: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.1 + i * 0.03, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

/* ── 04 · Market Basket — item co-occurrence lift heatmap ────────────────── */
const BASKET_ITEMS = ["Beer", "Dog", "Nach", "Soda", "Pretz"];
// Symmetric lift matrix (1 = independent). Diagonal is self (muted). A couple
// of standout pairs (Beer×Dog, Nachos×Soda) read as bright bundling signals.
const BASKET_LIFT = [
  [0, 2.4, 1.1, 1.6, 1.3],
  [2.4, 0, 1.2, 1.8, 1.0],
  [1.1, 1.2, 0, 2.1, 1.4],
  [1.6, 1.8, 2.1, 0, 1.1],
  [1.3, 1.0, 1.4, 1.1, 0],
];

function liftColor(lift: number): string {
  if (lift === 0) return "rgba(255, 255, 255, 0.04)"; // self/diagonal
  // Map lift 1.0–2.4 → opacity 0.1–0.85, brighter = stronger association.
  const t = Math.min(1, Math.max(0, (lift - 1) / 1.4));
  return `rgba(34, 211, 238, ${(0.1 + t * 0.75).toFixed(3)})`;
}

function BasketHeatmap({ active, width }: ChartProps) {
  if (width === 0) return null;
  const n = BASKET_ITEMS.length;
  const labelPad = 22;
  const avail = Math.min(width - labelPad, CHART_H - labelPad);
  const cell = avail / n;
  const gridX = (width - (labelPad + cell * n)) / 2 + labelPad;
  const gridY = (CHART_H - (labelPad + cell * n)) / 2 + labelPad;

  return (
    <svg width={width} height={CHART_H} aria-hidden="true">
      {/* Column labels */}
      {BASKET_ITEMS.map((it, c) => (
        <text
          key={`col-${it}`}
          x={gridX + cell * (c + 0.5)}
          y={gridY - 6}
          textAnchor="middle"
          fill="rgba(139, 138, 131, 0.8)"
          fontSize="7.5"
          fontFamily="var(--font-mono), monospace"
        >
          {it}
        </text>
      ))}
      {/* Row labels */}
      {BASKET_ITEMS.map((it, r) => (
        <text
          key={`row-${it}`}
          x={gridX - 5}
          y={gridY + cell * (r + 0.5) + 3}
          textAnchor="end"
          fill="rgba(139, 138, 131, 0.8)"
          fontSize="7.5"
          fontFamily="var(--font-mono), monospace"
        >
          {it}
        </text>
      ))}

      {BASKET_LIFT.map((row, r) =>
        row.map((lift, c) => {
          const idx = r * n + c;
          return (
            <motion.rect
              key={`${r}-${c}`}
              x={gridX + cell * c + 1}
              y={gridY + cell * r + 1}
              width={cell - 2}
              height={cell - 2}
              rx={2}
              fill={liftColor(lift)}
              initial={{ opacity: 0 }}
              animate={active ? { opacity: 1 } : {}}
              transition={{
                duration: 0.3,
                delay: 0.05 + idx * 0.012,
                ease: "easeOut",
              }}
            />
          );
        }),
      )}
    </svg>
  );
}

const MODULES: readonly ModuleSpec[] = [
  {
    key: "category",
    label: "Category Performance",
    render: (p) => <CategoryTreemap {...p} />,
  },
  {
    key: "pareto",
    label: "Pareto · Tail SKUs",
    render: (p) => <ParetoChart {...p} />,
  },
  {
    key: "menu",
    label: "Menu Engineering",
    render: (p) => <MenuQuadrants {...p} />,
  },
  {
    key: "basket",
    label: "Market-Basket Lift",
    render: (p) => <BasketHeatmap {...p} />,
  },
];

/**
 * Venue Insights flagship card. Mirrors the NFL card's layout and cadence: a
 * live-styled preview panel on the left auto-cycles through the project's
 * hand-built analysis modules (treemap → Pareto → menu-engineering quadrants
 * → market-basket lift) every CYCLE_MS, pausing on hover.
 *
 * Because the real product runs entirely client-side (no public API), the
 * preview numbers are synthetic-demo figures — the same data the live app
 * ships as its sample dataset.
 */
export function VenueInsightsCard() {
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  const [moduleIndex, setModuleIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Measured width of the chart drawing area, so the SVG charts draw in real
  // pixels (round dots, square heatmap cells) instead of a distorted viewBox.
  const chartAreaRef = useRef<HTMLDivElement>(null);
  const [chartW, setChartW] = useState(0);
  useEffect(() => {
    const el = chartAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setChartW(e.contentRect.width);
    });
    ro.observe(el);
    setChartW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Auto-cycle the analysis modules. Paused on hover and until the card has
  // entered view — no point animating off-screen.
  useEffect(() => {
    if (!inView || paused) return;
    const id = window.setInterval(() => {
      setModuleIndex((i) => (i + 1) % MODULES.length);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [inView, paused]);

  const current = MODULES[moduleIndex];

  return (
    <motion.a
      ref={ref}
      href="https://venue-insights.shanethakkar.com"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: EASE }}
      whileHover={{ y: -3 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="liquid-glass-accent group relative block overflow-hidden rounded-2xl p-6 sm:p-8"
    >
      {/* Top row: live chip + URL */}
      <div className="mb-7 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-accent-border bg-accent-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-bright">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
          Flagship — Live
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap font-mono text-[11px] text-accent-bright transition-colors group-hover:text-fg-bright">
          venue-insights.shanethakkar.com
          <ArrowUpRight
            size={13}
            strokeWidth={1.75}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>

      {/* Body: 2-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        {/* Cycling analysis-module preview */}
        <div
          className="relative rounded-xl border border-border-subtle p-5 transition-colors duration-300 group-hover:border-accent-border/60 sm:p-6"
          style={{ background: "rgba(0, 0, 0, 0.42)" }}
        >
          <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
            {/* Module label crossfades on cycle. Fixed-height container so the
             * absolute-positioned label doesn't collapse the row. */}
            <div className="relative h-[1.1em] flex-1">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={current.key}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  {current.label}
                </motion.span>
              </AnimatePresence>
            </div>
            <span className="text-accent">●</span>
          </div>

          {/* Chart area — fixed height, measured width. Charts crossfade. */}
          <div
            ref={chartAreaRef}
            className="relative w-full"
            style={{ height: CHART_H }}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={current.key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {current.render({ active: inView, width: chartW })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Info side */}
        <div className="flex flex-col gap-4">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-muted">
            F&amp;B Analytics · Fully In-Browser
          </div>
          <h3 className="text-[26px] font-medium leading-[1.1] tracking-[-0.012em] text-fg-bright sm:text-[30px]">
            Venue Insights
          </h3>
          <p className="text-[14.5px] leading-[1.6] text-fg-muted">
            A privacy-first analytics tool for venue food &amp; beverage
            operators. Drag in a raw point-of-sale CSV and, entirely in the
            browser, it infers the schema, cleans the data while documenting
            every fix, scores its health, and renders ~13 operator-grade
            analyses as hand-built charts — menu engineering, market-basket
            lift, staffing curves, price elasticity. No backend, no upload, no
            AI black box.
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-md border border-border-subtle bg-surface px-2.5 py-1 font-mono text-[11.5px] text-fg"
              >
                {chip}
              </span>
            ))}
          </div>
          <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[12px] tracking-[0.04em] text-accent transition-colors group-hover:text-accent-bright">
            visit the site
            <ArrowUpRight
              size={14}
              strokeWidth={1.75}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
