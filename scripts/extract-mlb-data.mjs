// One-shot extractor: pulls the (height, velocity, name) arrays out of the
// Plotly HTML export and writes a clean TS data module the article page can
// import. Not part of the build pipeline; run on demand with `node`.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = resolve(
  __dirname,
  "..",
  "context",
  "2interactive_height_vs_velocity.html",
);
const OUT_PATH = resolve(__dirname, "..", "data", "mlb-height-velocity.ts");

const html = readFileSync(HTML_PATH, "utf8");

const callIdx = html.lastIndexOf("Plotly.newPlot(");
if (callIdx < 0) {
  throw new Error("Could not locate Plotly.newPlot(...) in HTML");
}

const after = html.slice(callIdx);
// Plotly.newPlot("<id>", <data>, <layout>, <config>); — we want the second arg
// (data), which is an array of trace objects.
const argStart = after.indexOf(",");
const dataStart = after.indexOf("[", argStart);

let depth = 0;
let inStr = false;
let esc = false;
let dataEnd = -1;
for (let i = dataStart; i < after.length; i++) {
  const ch = after[i];
  if (esc) {
    esc = false;
    continue;
  }
  if (inStr) {
    if (ch === "\\") {
      esc = true;
    } else if (ch === '"') {
      inStr = false;
    }
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
      dataEnd = i + 1;
      break;
    }
  }
}
if (dataEnd < 0) throw new Error("Could not match closing bracket for data");

const dataJson = after.slice(dataStart, dataEnd);
const traces = JSON.parse(dataJson);

const scatter = traces.find(
  (t) => t.mode === "markers" || (t.x && t.y && Array.isArray(t.hovertext)),
);
if (!scatter) throw new Error("Could not find scatter trace");
const trend = traces.find((t) => t !== scatter && t.x && t.y);

const xs = scatter.x;
const ys = scatter.y;
const names = scatter.hovertext;
const heightLabels = (scatter.customdata ?? []).map((row) =>
  Array.isArray(row) ? row[0] : row,
);

if (xs.length !== ys.length || ys.length !== names.length) {
  throw new Error(
    `Mismatched lengths: x=${xs.length} y=${ys.length} names=${names.length}`,
  );
}

const points = xs.map((x, i) => ({
  name: names[i],
  heightIn: x,
  heightLabel: heightLabels[i] ?? "",
  velocity: ys[i],
}));

// Pull the correlation from the title text if present.
const titleText =
  scatter.title?.text ??
  (typeof scatter.name === "string" ? scatter.name : null);

const trendX = trend?.x ?? null;
const trendY = trend?.y ?? null;

const out = `// AUTO-GENERATED — re-run scripts/extract-mlb-data.mjs to refresh.
// Source: context/2interactive_height_vs_velocity.html (Plotly export).

export interface MlbPoint {
  name: string;
  heightIn: number;
  heightLabel: string;
  velocity: number;
}

export const mlbHeightVelocity: MlbPoint[] = ${JSON.stringify(points, null, 2)};

export const mlbTrendLine: { x: [number, number]; y: [number, number] } | null = ${
  trendX && trendY
    ? `{
  x: [${trendX[0]}, ${trendX[trendX.length - 1]}],
  y: [${trendY[0]}, ${trendY[trendY.length - 1]}],
}`
    : "null"
};
`;

mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, out, "utf8");
console.log(
  `Wrote ${points.length} points to ${OUT_PATH} (title hint: ${titleText ?? "n/a"})`,
);
