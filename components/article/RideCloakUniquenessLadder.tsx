"use client";

/**
 * The article's headline finding in one interaction: how the share of *unique*
 * trips collapses as you make the location coarser. Describe a trip by zone +
 * exact minute and ~90% of a month's trips are one of a kind; roll the location
 * up to whole boroughs and that falls to ~0.06%.
 *
 * Toggle the scope between the full month (~15M trips) and the 250K-row dev
 * slice — the same staircase shape holds at both scales, which is the point:
 * fine-grained location is identifying no matter how much data you pour in.
 *
 * Where the pipeline measured the cost of k-anonymity at k=5, each rung also
 * shows how much data that rule would suppress — the contrast between the
 * zone level (most of it gone) and the borough level (a rounding error) is
 * why the design generalizes first and anonymizes second.
 *
 * Data: scripts/extract-ridecloak-data.py -> data/ridecloak-uniqueness.json.
 */

import { useState } from "react";
import data from "@/data/ridecloak-uniqueness.json";

interface Rung {
  key: string;
  location: string;
  time: string;
}
interface Scope {
  key: string;
  label: string;
  trips: string;
  uniqueness: number[];
  suppressionK5: (number | null)[];
}

const RUNGS = data.rungs as Rung[];
const SCOPES = data.scopes as Scope[];

function fmtUniq(v: number): string {
  const p = v * 100;
  return p >= 1 ? p.toFixed(1) : p.toFixed(2);
}
function fmtSupp(v: number): string {
  const p = v * 100;
  return p >= 10 ? Math.round(p).toString() : p.toFixed(2);
}

export function RideCloakUniquenessLadder() {
  const [scopeKey, setScopeKey] = useState<string>("month");
  const scope = SCOPES.find((s) => s.key === scopeKey) ?? SCOPES[0];

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[11px] text-accent">
              ▤
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              How unique is a trip?
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            {scope.trips}
          </div>
        </div>

        {/* Scope toggle */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle px-4 py-3 sm:px-5">
          {SCOPES.map((s) => {
            const active = s.key === scopeKey;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setScopeKey(s.key)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${
                  active
                    ? "border-accent-border bg-accent-soft text-accent-bright"
                    : "border-border-subtle bg-white/[0.025] text-fg-muted hover:border-accent-border/60 hover:text-fg-bright"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Ladder */}
        <div className="flex flex-col gap-3.5 px-4 py-5 sm:px-6 sm:py-6">
          {RUNGS.map((rung, i) => {
            const u = scope.uniqueness[i];
            const supp = scope.suppressionK5[i];
            const widthPct = Math.max(u * 100, 0.5);
            return (
              <div key={rung.key} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                {/* Granularity label */}
                <div className="sm:w-[34%] sm:shrink-0">
                  <div className="text-[14px] font-medium leading-tight text-fg-bright">
                    {rung.location}
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-fg-dim">
                    {rung.time}
                  </div>
                </div>

                {/* Bar + value */}
                <div className="flex flex-1 items-center gap-3">
                  <div className="relative h-7 flex-1 overflow-hidden rounded-md bg-white/[0.04]">
                    <div
                      className="absolute inset-y-0 left-0 rounded-md"
                      style={{
                        width: `${widthPct}%`,
                        background:
                          "linear-gradient(90deg, rgba(34,211,238,0.85) 0%, rgba(103,232,249,0.95) 100%)",
                        transition: "width 420ms cubic-bezier(0.21,0.47,0.32,0.98)",
                      }}
                    />
                  </div>
                  <div className="w-[68px] shrink-0 text-right font-mono text-[13.5px] tabular-nums text-fg-bright">
                    {fmtUniq(u)}%
                  </div>
                </div>

                {/* k=5 suppression annotation, where measured */}
                {supp != null ? (
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-fg-muted sm:w-[120px] sm:shrink-0 sm:text-right">
                    k=5 cuts {fmtSupp(supp)}%
                  </div>
                ) : (
                  <div className="hidden sm:block sm:w-[120px] sm:shrink-0" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="border-t border-border-subtle px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-fg-dim sm:px-5">
          % of trips that are one of a kind · generalize first, then anonymize
        </div>
      </div>
    </div>
  );
}
