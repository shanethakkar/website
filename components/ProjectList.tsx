"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import {
  EdgarRiskVisual,
  F1Visual,
  FourthDownVisual,
  MLBVisual,
  RideCloakVisual,
} from "@/components/projectVisuals";

interface Project {
  slug: string;
  title: string;
  subtitle?: string;
  dateLabel: string;
  category: string;
  description: string;
  tags: string[];
  visual: ReactNode;
}

/** Source of truth for the Projects section, newest first. The first
 * VISIBLE_COUNT render immediately; the rest sit behind the "view more"
 * toggle so the page doesn't run long now that there are three flagships
 * above it. */
const PROJECTS: readonly Project[] = [
  {
    slug: "ridecloak",
    title: "I Built the Missing Piece of the Ride-Hail Data Fight",
    category: "Privacy · Regulated Data · DuckDB",
    dateLabel: "JUN 12 '26",
    description:
      "Regulators want trip data; riders don't want to be tracked. RideCloak is the pipeline in the middle — it finds the personal data, generalizes locations until 90% unique trips fall to 0.06%, and logs every step in a tamper-evident ledger. Plus an AI agent that can't be talked into leaking.",
    tags: ["python", "duckdb", "nlp", "k-anonymity", "llm-agents"],
    visual: <RideCloakVisual />,
  },
  {
    slug: "edgar-risk",
    title: "Failing Companies Tell on Themselves in Their Annual Reports",
    dateLabel: "MAY 25 '26",
    category: "SEC · NLP · 10-K Analysis",
    description:
      "A model that reads what companies say about themselves in SEC filings catches 79% of bankruptcies across 24 cases. The 'false positives' include Nordstrom, Walgreens, Macy's, Kohl's, CVS, and Lucid Motors, all of whose decline didn't end in court.",
    tags: ["python", "sklearn", "pandas", "nlp", "edgar"],
    visual: <EdgarRiskVisual />,
  },
  {
    slug: "fourth-down",
    title: "Fourth Down Is Still Football's Biggest Coaching Problem",
    dateLabel: "APR 22 '26",
    category: "NFL · WPA · XGBoost",
    description:
      "107k decisions from 1999–2025, scored against historically optimal calls. Coaches still leave ~one free win on the table every year — and the conservative ones make most of their mistakes in the red zone.",
    tags: ["python", "pandas", "numpy", "xgboost", "nflfastR"],
    visual: <FourthDownVisual />,
  },
  {
    slug: "f1",
    title: "Who Is Actually the Best F1 Driver?",
    subtitle: "A Bayesian approach to separating skill from the car",
    dateLabel: "APR 18 '26",
    category: "F1 · Bayesian",
    description:
      "A hierarchical model on 2014–2025 race data decomposes finishing position into driver effect, car effect, and DNF risk. The result reveals the Verstappen Paradox — and Hamilton at the top with 85% confidence.",
    tags: ["python", "pymc", "bayesian", "arviz", "fastf1"],
    visual: <F1Visual />,
  },
  {
    slug: "mlb-pitcher-height-velocity",
    title: "Why Height Doesn't Predict Velocity in Major League Baseball",
    dateLabel: "MAY 13 '25",
    category: "MLB · Regression",
    description:
      "Physics says taller pitchers should throw harder. The data says they don't. The story is selection bias: by the time you reach MLB, the relationship that dominates youth ball has been compressed away by survival.",
    tags: ["python", "sklearn", "pandas", "numpy", "statcast"],
    visual: <MLBVisual />,
  },
];

/** How many cards show before the viewer opts into the rest. */
const VISIBLE_COUNT = 3;

export function ProjectList() {
  const [expanded, setExpanded] = useState(false);

  const visible = PROJECTS.slice(0, VISIBLE_COUNT);
  const hidden = PROJECTS.slice(VISIBLE_COUNT);
  const hiddenCount = hidden.length;

  return (
    <div className="flex flex-col gap-4">
      {visible.map((p, i) => (
        <ArticleCard key={p.slug} index={i} {...p} />
      ))}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="hidden-projects"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 pt-4">
              {hidden.map((p, i) => (
                <ArticleCard key={p.slug} index={i} {...p} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hiddenCount > 0 && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white/[0.04] px-5 py-2.5 font-mono text-[11.5px] uppercase tracking-[0.16em] text-fg-muted transition-all hover:-translate-y-0.5 hover:border-accent-border hover:bg-accent-soft hover:text-accent-bright"
          >
            {expanded ? "Show fewer" : `View ${hiddenCount} more`}
            <ChevronDown
              size={14}
              strokeWidth={2}
              className={`transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );
}
