/**
 * Shared helpers for the ImageResponse-based OG card routes.
 *
 * Satori (which next/og uses under the hood) can only parse TTF/OTF font
 * data, not woff2. Modern browsers get woff2 from the Google Fonts CSS API,
 * but the legacy `/css` (v1) endpoint with an old User-Agent still serves
 * TTF URLs — that's the trick we use here so we can pipe Geist straight
 * into the OG card without bundling font binaries in the repo.
 */
export async function loadGoogleFont(
  family: string,
  weight: number,
): Promise<ArrayBuffer> {
  const familyParam = family.replace(/\s+/g, "+");
  const url = `https://fonts.googleapis.com/css?family=${familyParam}:${weight}`;
  const css = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) Gecko/20061204 Firefox/2.0.0.1",
    },
  }).then((r) => r.text());
  const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
  if (!fontUrl) {
    throw new Error(`Failed to locate TTF URL for ${family} ${weight}`);
  }
  return fetch(fontUrl).then((r) => r.arrayBuffer());
}
