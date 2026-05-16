/**
 * Shared helpers for the ImageResponse-based OG card routes.
 *
 * The TTFs that next/og (Satori) needs are checked into the repo at
 * `assets/fonts/`, so building the OG cards has zero runtime network
 * dependencies. This used to fetch live from fonts.googleapis.com, but
 * Vercel build workers occasionally time out reaching Google and crashed
 * the entire prerender step. Re-run `scripts/download-og-fonts.mjs` if
 * the weights below ever change.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const FONTS_DIR = path.join(process.cwd(), "assets", "fonts");

const FONT_FILES: Record<string, Record<number, string>> = {
  Geist: {
    500: "Geist-Medium.ttf",
    700: "Geist-Bold.ttf",
  },
  "Geist Mono": {
    500: "GeistMono-Medium.ttf",
  },
};

export async function loadGoogleFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer> {
  const filename = FONT_FILES[family]?.[weight];
  if (!filename) {
    throw new Error(
      `No bundled TTF for ${family} ${weight}. Add it to ` +
        `scripts/download-og-fonts.mjs and re-run that script.`,
    );
  }
  const buf = await readFile(path.join(FONTS_DIR, filename));
  // `Uint8Array#buffer` includes the whole underlying ArrayBuffer, so we
  // slice to the exact byte range Node read (avoids accidentally handing
  // Satori extra padding).
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength,
  ) as ArrayBuffer;
}
