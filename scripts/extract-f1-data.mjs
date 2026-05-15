// One-shot extractor: pulls the F1 driver-rankings forest plot and the
// constructor team-season heatmap out of the two Plotly HTML exports.
// Writes two typed TS data modules the article components import.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CTX = resolve(__dirname, "..", "context");
const OUT = resolve(__dirname, "..", "data");

mkdirSync(OUT, { recursive: true });

function extractPlotlyData(htmlPath) {
  const html = readFileSync(htmlPath, "utf8");
  const idx = html.lastIndexOf("Plotly.newPlot(");
  if (idx < 0) throw new Error(`No Plotly.newPlot in ${htmlPath}`);
  const after = html.slice(idx);
  const dataStart = after.indexOf("[", after.indexOf(","));

  // Bracket-balanced JSON scan, string-aware so brackets inside string
  // literals don't confuse the counter.
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = dataStart; i < after.length; i++) {
    const ch = after[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (inStr) {
      if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error("Could not match closing bracket");
  const data = JSON.parse(after.slice(dataStart, end));
  return { html: after, data };
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Driver rankings — forest plot
// ─────────────────────────────────────────────────────────────────────────
{
  const { data } = extractPlotlyData(
    resolve(CTX, "driver_rankings_interactive(1).html"),
  );

  // Trace 0: 94% HDI bars (base + x = width)
  // Trace 1: 50% HDI bars
  // Trace 2: median scatter markers
  const t94 = data[0];
  const t50 = data[1];
  const tMed = data[2];

  const drivers = t94.customdata.map((row, i) => {
    const [code, median, lo94, hi94, races, meanResid, description] = row;
    const base50 = t50.base[i];
    const width50 = t50.x[i];
    return {
      code,
      median,
      hdi94: [lo94, hi94],
      hdi50: [base50, base50 + width50],
      races,
      meanResidual: meanResid,
      description,
    };
  });

  const out = `// AUTO-GENERATED — re-run scripts/extract-f1-data.mjs to refresh.
// Source: context/driver_rankings_interactive(1).html (Plotly export).

export interface F1Driver {
  code: string;
  median: number;
  hdi94: [number, number];
  hdi50: [number, number];
  races: number;
  meanResidual: number;
  description: string;
}

export const f1DriverRankings: F1Driver[] = ${JSON.stringify(drivers, null, 2)};
`;
  writeFileSync(resolve(OUT, "f1-driver-rankings.ts"), out, "utf8");
  console.log(`drivers: ${drivers.length}`);
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Constructor team-season heatmap
// ─────────────────────────────────────────────────────────────────────────
{
  const { html, data } = extractPlotlyData(
    resolve(CTX, "team_season_heatmap_interactive.html"),
  );
  const heat = data[0];
  const constructors = heat.y;
  const seasons = heat.x;

  // The z-matrix is encoded as a base64-packed Float64 array. Easier path:
  // every cell value also lives in the layout's `annotations` array as a
  // pre-formatted string, with x = season, y = constructor name, text = value.
  // Pull that block out and parse it.
  const annoStart = html.indexOf('"annotations":[');
  if (annoStart < 0) throw new Error("No annotations in heatmap HTML");

  let depth = 0;
  let inStr = false;
  let esc = false;
  let annoEnd = -1;
  for (
    let i = html.indexOf("[", annoStart);
    i < html.length;
    i++
  ) {
    const ch = html[i];
    if (esc) {
      esc = false;
      continue;
    }
    if (inStr) {
      if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) {
        annoEnd = i + 1;
        break;
      }
    }
  }
  const annos = JSON.parse(
    html.slice(html.indexOf("[", annoStart), annoEnd),
  );

  const cells = [];
  for (const a of annos) {
    if (typeof a.x !== "number") continue; // skip the page-level title
    const value = Number(a.text);
    if (!Number.isFinite(value)) continue;
    cells.push({
      constructor: a.y,
      season: a.x,
      value,
    });
  }

  const out = `// AUTO-GENERATED — re-run scripts/extract-f1-data.mjs to refresh.
// Source: context/team_season_heatmap_interactive.html (Plotly export).

export interface F1HeatCell {
  constructor: string;
  season: number;
  value: number;
}

export const f1Constructors: string[] = ${JSON.stringify(constructors)};
export const f1Seasons: number[] = ${JSON.stringify(seasons)};
export const f1HeatCells: F1HeatCell[] = ${JSON.stringify(cells, null, 2)};
`;
  writeFileSync(resolve(OUT, "f1-constructor-heatmap.ts"), out, "utf8");
  console.log(
    `heatmap: ${constructors.length} constructors × ${seasons.length} seasons, ${cells.length} cells`,
  );
}
