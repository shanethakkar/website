"use client";

/**
 * The honest half of the PII story. Eight identifier types, each scored two
 * ways: "in-distribution" (the detectors tuned and tested on the same note
 * formats) and "held-out" (the same detectors run, unchanged, on formats they
 * had never seen). Toggle between them.
 *
 * In-distribution everything is near-perfect. On held-out, the learned
 * components — Presidio's built-in email detector, spaCy's name NER — hold,
 * while every hand-written regex collapses to ~0 recall. Precision stays high
 * throughout, so the failure mode is silence (missed PII), not false alarms.
 *
 * Data: scripts/extract-ridecloak-data.py -> data/ridecloak-detection.json.
 */

import { useState } from "react";
import data from "@/data/ridecloak-detection.json";

interface PR {
  p: number;
  r: number;
}
interface Entity {
  key: string;
  label: string;
  kind: string;
  carries: string;
  inDist: PR;
  heldOut: PR;
}

const ENTITIES = data.entities as Entity[];
const OVERALL = data.overall as { inDist: PR; heldOut: PR };

type View = "inDist" | "heldOut";

const VIEWS: Record<View, { label: string }> = {
  inDist: { label: "In-distribution" },
  heldOut: { label: "Held-out · unseen formats" },
};

const KIND_DOT: Record<string, string> = {
  learned: "rgba(34, 211, 238, 0.9)",
  mixed: "rgba(251, 146, 60, 0.9)",
  handwritten: "rgba(255, 255, 255, 0.28)",
};

function recallColor(r: number): string {
  if (r >= 0.5) return "rgba(34, 211, 238, 0.9)";
  if (r >= 0.05) return "rgba(251, 146, 60, 0.92)";
  return "rgba(248, 113, 113, 0.92)";
}

function fmt(v: number): string {
  if (v <= 0) return "0";
  const p = v * 100;
  if (p >= 99.95) return "100";
  return p.toFixed(1);
}

function MetricBar({
  letter,
  value,
  color,
}: {
  letter: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-fg-dim">
        {letter}
      </span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.max(value * 100, 0)}%`,
            background: color,
            transition: "width 380ms cubic-bezier(0.21,0.47,0.32,0.98), background 380ms ease",
          }}
        />
      </div>
      <span
        className="w-[42px] shrink-0 text-right font-mono text-[12px] tabular-nums"
        style={{ color }}
      >
        {fmt(value)}
      </span>
    </div>
  );
}

export function RideCloakDetectionScoreboard() {
  const [view, setView] = useState<View>("inDist");
  const overall = OVERALL[view];

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[11px] text-accent">
              ◎
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              PII detection — 8 identifiers
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            overall {fmt(overall.p)} / {fmt(overall.r)} P/R
          </div>
        </div>

        {/* View toggle */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-3 sm:px-5">
          {(Object.keys(VIEWS) as View[]).map((v) => {
            const active = v === view;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${
                  active
                    ? "border-accent-border bg-accent-soft text-accent-bright"
                    : "border-border-subtle bg-white/[0.025] text-fg-muted hover:border-accent-border/60 hover:text-fg-bright"
                }`}
              >
                {VIEWS[v].label}
              </button>
            );
          })}
        </div>

        {/* Rows */}
        <div className="flex flex-col">
          {ENTITIES.map((e, i) => {
            const m = e[view];
            return (
              <div
                key={e.key}
                className={`grid grid-cols-1 items-center gap-x-5 gap-y-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:px-5 ${
                  i % 2 === 0 ? "bg-white/[0.012]" : ""
                }`}
              >
                {/* Identifier + what carries it */}
                <div className="flex items-center gap-2.5">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ background: KIND_DOT[e.kind] }}
                  />
                  <span className="text-[14px] font-medium text-fg-bright">{e.label}</span>
                  <span className="truncate font-mono text-[10.5px] uppercase tracking-[0.1em] text-fg-dim">
                    {e.carries}
                  </span>
                </div>

                {/* Precision (steady) + recall (colored by value) */}
                <div className="flex flex-col gap-1.5">
                  <MetricBar letter="P" value={m.p} color="rgba(34, 211, 238, 0.5)" />
                  <MetricBar letter="R" value={m.r} color={recallColor(m.r)} />
                </div>
              </div>
            );
          })}

          {/* Overall */}
          <div className="grid grid-cols-1 items-center gap-x-5 gap-y-2 border-t border-border-subtle px-4 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-transparent" />
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-fg-bright">
                Overall
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <MetricBar letter="P" value={overall.p} color="rgba(34, 211, 238, 0.55)" />
              <MetricBar letter="R" value={overall.r} color={recallColor(overall.r)} />
            </div>
          </div>
        </div>

        {/* Footer legend */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-fg-dim sm:px-5">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: KIND_DOT.learned }} />
              learned
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: KIND_DOT.mixed }} />
              mixed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: KIND_DOT.handwritten }} />
              hand-written
            </span>
          </span>
          <span>P = precision · R = recall</span>
        </div>
      </div>
    </div>
  );
}
