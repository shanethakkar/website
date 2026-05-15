"use client";

import { motion, useInView } from "framer-motion";
import { BarChart3, Brain, Code2, type LucideIcon } from "lucide-react";
import { useRef } from "react";

interface TechCategory {
  label: string;
  meta: string;
  Icon: LucideIcon;
  /** Items the user will recognize first / most-used skills.
   *  Get a slightly brighter chip treatment to anchor each card. */
  primary: readonly string[];
  /** Supporting tools — same chip language, lighter weight. */
  secondary: readonly string[];
}

const TECH_CATEGORIES: readonly TechCategory[] = [
  {
    label: "Programming & Analytics",
    meta: "Languages I work in",
    Icon: Code2,
    primary: ["python", "sql", "r"],
    secondary: ["git", "bash / unix"],
  },
  {
    label: "ML & Statistics",
    meta: "How I model and forecast",
    Icon: Brain,
    primary: ["scikit-learn", "tensorflow", "keras"],
    secondary: ["optuna", "time-series forecasting", "regression", "clustering"],
  },
  {
    label: "BI, Cloud & Tools",
    meta: "How I deliver and scale",
    Icon: BarChart3,
    primary: ["tableau", "power bi", "databricks"],
    secondary: ["snowflake", "azure", "plotly", "alteryx", "excel"],
  },
] as const;

/**
 * Tech & skills grid. Three depth-card columns of chips drawn from the resume.
 * Each card has a leading cyan glyph, a prominent uppercase title, a count
 * badge, a divider, and a wrap of chips split into "primary" (slightly
 * brighter so the eye lands on the headline tools) and "secondary".
 */
export function TechGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <div ref={ref} className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {TECH_CATEGORIES.map((cat, i) => (
        <CategoryCard key={cat.label} cat={cat} index={i} active={inView} />
      ))}
    </div>
  );
}

function CategoryCard({
  cat,
  index,
  active,
}: {
  cat: TechCategory;
  index: number;
  active: boolean;
}) {
  const total = cat.primary.length + cat.secondary.length;
  const Icon = cat.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="liquid-glass flex flex-col gap-5 rounded-2xl p-6 sm:p-7"
    >
      {/* Header */}
      <div>
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-accent-border/60 bg-accent-soft text-accent-bright">
              <Icon size={14} strokeWidth={2} />
            </span>
            <h3 className="font-mono text-[13px] uppercase tracking-[0.18em] text-fg-bright">
              {cat.label}
            </h3>
          </div>
          <span className="font-mono text-[12px] tracking-[0.12em] text-accent">
            {String(total).padStart(2, "0")}
          </span>
        </div>
        <p className="ml-[38px] font-mono text-[11.5px] tracking-[0.03em] text-fg-muted">
          {cat.meta}
        </p>
      </div>

      {/* Divider */}
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(34, 211, 238, 0.3) 0%, rgba(255, 255, 255, 0.06) 25%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {cat.primary.map((item, j) => (
          <Chip
            key={item}
            label={item}
            variant="primary"
            index={j}
            active={active}
            delay={0.3 + index * 0.1}
          />
        ))}
        {cat.secondary.map((item, j) => (
          <Chip
            key={item}
            label={item}
            variant="secondary"
            index={cat.primary.length + j}
            active={active}
            delay={0.3 + index * 0.1}
          />
        ))}
      </div>
    </motion.div>
  );
}

function Chip({
  label,
  variant,
  index,
  active,
  delay,
}: {
  label: string;
  variant: "primary" | "secondary";
  index: number;
  active: boolean;
  delay: number;
}) {
  const baseStyle =
    variant === "primary"
      ? "border-white/15 bg-white/[0.06] text-fg-bright"
      : "border-border-subtle bg-white/[0.025] text-fg";

  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.4,
        delay: delay + index * 0.05,
        ease: "easeOut",
      }}
      className={`cursor-default rounded-md border px-3 py-1.5 font-mono text-[12.5px] tracking-[0.02em] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-accent-soft hover:text-accent-bright hover:shadow-[0_6px_18px_-6px_rgba(34,211,238,0.5)] ${baseStyle}`}
    >
      {label}
    </motion.span>
  );
}
