// One-shot downloader for the TTF fonts used by the next/og image routes.
// Re-run only if we add or change a font weight in `lib/og.ts`.
//
// Why this exists: Vercel build workers occasionally time out reaching
// fonts.googleapis.com, which crashes the whole prerender for the OG card
// routes (those routes need the binary at build time). Caching the TTFs
// in the repo removes that network dependency entirely.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "assets", "fonts");

mkdirSync(OUT_DIR, { recursive: true });

const FONTS = [
  { family: "Geist", weight: 700, filename: "Geist-Bold.ttf" },
  { family: "Geist", weight: 500, filename: "Geist-Medium.ttf" },
  { family: "Geist Mono", weight: 500, filename: "GeistMono-Medium.ttf" },
];

// Same User-Agent trick lib/og.ts used: the legacy /css endpoint serves
// TTF URLs when it thinks the client is too old to understand woff2.
const USER_AGENT =
  "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) Gecko/20061204 Firefox/2.0.0.1";

for (const { family, weight, filename } of FONTS) {
  const familyParam = family.replace(/\s+/g, "+");
  const cssUrl = `https://fonts.googleapis.com/css?family=${familyParam}:${weight}`;
  const cssRes = await fetch(cssUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!cssRes.ok) {
    throw new Error(`CSS fetch failed for ${family} ${weight}: ${cssRes.status}`);
  }
  const css = await cssRes.text();
  const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!fontUrl) {
    throw new Error(`Could not locate TTF URL for ${family} ${weight}`);
  }
  const ttfRes = await fetch(fontUrl);
  if (!ttfRes.ok) {
    throw new Error(`TTF fetch failed for ${family} ${weight}: ${ttfRes.status}`);
  }
  const bytes = new Uint8Array(await ttfRes.arrayBuffer());
  const outPath = resolve(OUT_DIR, filename);
  writeFileSync(outPath, bytes);
  console.log(`wrote ${filename} (${bytes.byteLength.toLocaleString()} bytes)`);
}
