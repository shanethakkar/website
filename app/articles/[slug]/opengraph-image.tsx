import { ImageResponse } from "next/og";

import { formatArticleDate, getArticle, getArticleSlugs } from "@/lib/articles";
import { loadGoogleFont } from "@/lib/og";

/** Per-article Open Graph card.
 *
 * One PNG is generated per article slug at build time (via the shared
 * generateStaticParams below, which mirrors page.tsx). The design is
 * editorial: category eyebrow → title (big) → dek (lighter) → byline
 * footer. Same dot-grid background and cyan accent as the homepage card
 * so the brand stays consistent across every share preview on LinkedIn,
 * Twitter, iMessage, etc. */

export const alt = "Article preview — shanethakkar.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

/** Pick a comfortable title size based on character count so very long titles
 * (the F1 piece's ~88-char dek-style title) still fit in 3-ish lines while
 * shorter titles get the punchy big-headline treatment. */
function titleFontSize(length: number): number {
  if (length <= 36) return 96;
  if (length <= 56) return 82;
  if (length <= 80) return 68;
  return 60;
}

/** Same idea but tighter — the dek can be long-form copy. */
function dekFontSize(length: number): number {
  if (length <= 90) return 30;
  if (length <= 150) return 26;
  return 23;
}

/** Pre-computed dot positions for the background grid. Rendered as individual
 * SVG <circle>s because Satori's <pattern> support is patchy. */
const DOT_GRID: ReadonlyArray<{ x: number; y: number }> = (() => {
  const dots: { x: number; y: number }[] = [];
  for (let x = 14; x < 1200; x += 28) {
    for (let y = 14; y < 630; y += 28) {
      dots.push({ x, y });
    }
  }
  return dots;
})();

export default async function ArticleOpenGraphImage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) {
    throw new Error(`Article not found for OG image: ${slug}`);
  }

  const [geistBold, geistMedium, geistMonoMedium] = await Promise.all([
    loadGoogleFont("Geist", 700),
    loadGoogleFont("Geist", 500),
    loadGoogleFont("Geist Mono", 500),
  ]);

  const titleSize = titleFontSize(article.title.length);
  const dekSize = dekFontSize(article.dek.length);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#0a0a0c",
          fontFamily: "Geist",
        }}
      >
        {/* Background: gradient + dot grid + vignette. Pure decoration,
            stays behind the text content above. */}
        <svg
          width={1200}
          height={630}
          viewBox="0 0 1200 630"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="artBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#101116" />
              <stop offset="1" stopColor="#0a0a0c" />
            </linearGradient>
            <radialGradient id="artVignette" cx="0.5" cy="0.5" r="0.7">
              <stop offset="0.6" stopColor="rgba(0,0,0,0)" />
              <stop offset="1" stopColor="rgba(0,0,0,0.55)" />
            </radialGradient>
          </defs>
          <rect width={1200} height={630} fill="url(#artBg)" />
          {DOT_GRID.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={1.3}
              fill="rgba(235,233,227,0.07)"
            />
          ))}
          <rect width={1200} height={630} fill="url(#artVignette)" />
          {/* Thin cyan accent line below the eyebrow so the layout reads
              top-down like an editorial page. */}
          <line
            x1={72}
            y1={146}
            x2={1128}
            y2={146}
            stroke="#22d3ee"
            strokeOpacity={0.22}
            strokeWidth={1}
          />
        </svg>

        {/* Top row: brand mark (left) + category eyebrow (right). */}
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 72,
            right: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#22d3ee",
              }}
            />
            <div
              style={{
                marginLeft: 14,
                fontFamily: "Geist Mono",
                fontWeight: 500,
                fontSize: 16,
                letterSpacing: 3.6,
                color: "#b9b7af",
              }}
            >
              SHANETHAKKAR.COM
            </div>
          </div>
          <div
            style={{
              fontFamily: "Geist Mono",
              fontWeight: 500,
              fontSize: 14,
              letterSpacing: 3,
              color: "#22d3ee",
            }}
          >
            {article.category.toUpperCase()}
          </div>
        </div>

        {/* Title + dek block — vertically centered between the top eyebrow
            and the bottom byline. We use absolute positioning + a fixed
            content band so very long titles wrap into the band rather than
            shoving everything else around. */}
        <div
          style={{
            position: "absolute",
            top: 180,
            left: 72,
            right: 72,
            bottom: 130,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Geist",
              fontWeight: 700,
              fontSize: titleSize,
              lineHeight: 1.05,
              letterSpacing: -2.5,
              color: "#ebe9e3",
            }}
          >
            {article.title}
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: "Geist",
              fontWeight: 500,
              fontSize: dekSize,
              lineHeight: 1.4,
              letterSpacing: -0.3,
              color: "#b9b7af",
              maxWidth: 1000,
            }}
          >
            {article.dek}
          </div>
        </div>

        {/* Bottom byline: name on the left, date · reading time on the
            right. Mono caps to match the rest of the site's metadata
            chrome. */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: 72,
            right: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "Geist Mono",
            fontWeight: 500,
            fontSize: 16,
            letterSpacing: 3,
            color: "#7b7a73",
          }}
        >
          <div style={{ color: "#ebe9e3" }}>SHANE THAKKAR</div>
          <div>{`${formatArticleDate(article.date)} · ${article.readingMinutes} MIN READ`}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistBold, weight: 700, style: "normal" },
        { name: "Geist", data: geistMedium, weight: 500, style: "normal" },
        {
          name: "Geist Mono",
          data: geistMonoMedium,
          weight: 500,
          style: "normal",
        },
      ],
    },
  );
}
