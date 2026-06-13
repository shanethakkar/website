"use client";

/**
 * The article's closing "the dashboard tracks this over time" rendered native.
 * Four months of RideCloak compliance metrics (Jan–Apr 2026): the quality-gate
 * health score, the volume of trips processed, the share suppressed under k=5
 * at borough level, and the residual borough-level uniqueness — plus the
 * hash-chained ledger's command breakdown.
 *
 * Data: scripts/extract-ridecloak-data.py -> data/ridecloak-dashboard.json.
 */

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import dashboard from "@/data/ridecloak-dashboard.json";

interface MonthRow {
  month: string;
  health: number;
  rowsIn: number;
  rowsOut: number;
  suppression: number;
  uniquenessBorough: number;
}
interface Dashboard {
  months: MonthRow[];
  kpis: {
    totalTripsIn: number;
    avgHealth: number;
    avgSuppression: number;
    ledgerActions: number;
  };
  ledger: { total: number; commands: { command: string; count: number }[]; verified: boolean };
}

const DATA = dashboard as Dashboard;

const MONTH_LABEL: Record<string, string> = {
  "2026-01": "Jan",
  "2026-02": "Feb",
  "2026-03": "Mar",
  "2026-04": "Apr",
};

const fmtM = (n: number) => `${(n / 1e6).toFixed(1)}M`;
const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;

function Kpi({
  value,
  label,
  sub,
  accent = false,
}: {
  value: string;
  label: string;
  sub?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-white/[0.02] px-4 py-3.5">
      <div
        className={`font-mono text-[26px] leading-none tracking-[-0.02em] tabular-nums sm:text-[30px] ${
          accent ? "text-accent-bright" : "text-fg-bright"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-fg-muted">
        {label}
      </div>
      {sub ? <div className="mt-0.5 text-[11px] text-fg-dim">{sub}</div> : null}
    </div>
  );
}

export function RideCloakComplianceDashboard() {
  const { months, kpis, ledger } = DATA;

  return (
    <div className="article-chart my-12">
      <div className="liquid-glass relative overflow-hidden rounded-xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle px-4 py-2.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-border bg-accent-soft font-mono text-[11px] text-accent">
              ▦
            </div>
            <div className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-fg-bright">
              Compliance dashboard
            </div>
          </div>
          <div className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.2em] text-fg-muted">
            Jan–Apr 2026
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 gap-3 px-4 py-5 sm:px-5 lg:grid-cols-4">
          <Kpi value={fmtM(kpis.totalTripsIn)} label="Trips processed" sub="4 months of Uber HVFHV" accent />
          <Kpi value={kpis.avgHealth.toFixed(2)} label="Avg health score" sub="out of 100 · gate passed" />
          <Kpi value={fmtPct(kpis.avgSuppression)} label="k=5 suppression" sub="borough level" />
          <Kpi
            value={String(kpis.ledgerActions)}
            label="Ledger actions"
            sub={
              <span className="inline-flex items-center gap-1 text-[rgba(52,211,153,0.95)]">
                <Check size={11} strokeWidth={2.5} /> chain verified
              </span>
            }
          />
        </div>

        {/* Per-month breakdown */}
        <div className="px-4 pb-2 sm:px-5">
          {/* Column header */}
          <div className="grid grid-cols-[44px_1fr_1fr_1fr_1fr] items-center gap-3 border-b border-border-subtle pb-2 font-mono text-[9.5px] uppercase tracking-[0.14em] text-fg-dim">
            <span>Mo</span>
            <span>Health</span>
            <span>Trips</span>
            <span>k=5 supp.</span>
            <span>Unique</span>
          </div>

          {months.map((m) => (
            <div
              key={m.month}
              className="grid grid-cols-[44px_1fr_1fr_1fr_1fr] items-center gap-3 border-b border-border-subtle/60 py-2.5 last:border-b-0"
            >
              <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-fg-bright">
                {MONTH_LABEL[m.month]}
              </span>

              {/* Health: value + thin bar */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12.5px] tabular-nums text-fg-bright">
                  {m.health.toFixed(2)}
                </span>
                <div className="relative hidden h-1.5 w-full max-w-[64px] overflow-hidden rounded-full bg-white/[0.05] sm:block">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${m.health}%`,
                      background: "rgba(52, 211, 153, 0.8)",
                    }}
                  />
                </div>
              </div>

              <span className="font-mono text-[12.5px] tabular-nums text-fg">{fmtM(m.rowsIn)}</span>
              <span className="font-mono text-[12.5px] tabular-nums text-fg-muted">
                {fmtPct(m.suppression)}
              </span>
              <span className="font-mono text-[12.5px] tabular-nums text-accent">
                {fmtPct(m.uniquenessBorough)}
              </span>
            </div>
          ))}
        </div>

        {/* Ledger command strip */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-border-subtle px-4 py-3 sm:px-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
            Ledger:
          </span>
          {ledger.commands.map((c) => (
            <span
              key={c.command}
              className="rounded-md border border-border-subtle bg-white/[0.03] px-2 py-0.5 font-mono text-[10.5px] text-fg-muted"
            >
              {c.command} ×{c.count}
            </span>
          ))}
          <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(52,211,153,0.95)]">
            <Check size={11} strokeWidth={2.5} /> hash-chained
          </span>
        </div>
      </div>
    </div>
  );
}
