import { ImageResponse } from "next/og";

import { loadGoogleFont } from "@/lib/og";

/** Static Open Graph card for the homepage. Next.js auto-wires this into the
 * <meta property="og:image"> tags at /opengraph-image.png, so every LinkedIn /
 * iMessage / Slack share of shanethakkar.com gets the same image without us
 * touching metadata by hand. Design = Variant 3 from the mockup page:
 *   - dot-grid background matching the rest of the site
 *   - three overlapping Bayesian posterior curves in cyan
 *   - centered "Shane Thakkar" in Geist Bold + "Data Analyst" subtitle */

export const alt = "Shane Thakkar — Data Analyst";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Pre-computed dot positions for the background grid (28px spacing).
 * Rendered as individual SVG <circle>s because Satori's <pattern> support is
 * patchy; 989 circles is fine for a one-time render. */
const DOT_GRID: ReadonlyArray<{ x: number; y: number }> = (() => {
  const dots: { x: number; y: number }[] = [];
  for (let x = 14; x < 1200; x += 28) {
    for (let y = 14; y < 630; y += 28) {
      dots.push({ x, y });
    }
  }
  return dots;
})();

export default async function OpenGraphImage() {
  const [geistBold, geistMedium, geistMonoMedium] = await Promise.all([
    loadGoogleFont("Geist", 700),
    loadGoogleFont("Geist", 500),
    loadGoogleFont("Geist Mono", 500),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          position: "relative",
          background: "#0a0a0c",
          fontFamily: "Geist",
        }}
      >
        {/* Background layer: gradient + dot grid + vignette + bell curves.
            One <svg> handles everything pictorial; text goes on top as
            HTML divs so font kerning / letter-spacing render crisply. */}
        <svg
          width={1200}
          height={630}
          viewBox="0 0 1200 630"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="ogBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#101116" />
              <stop offset="1" stopColor="#0a0a0c" />
            </linearGradient>
            <radialGradient id="ogVignette" cx="0.5" cy="0.5" r="0.7">
              <stop offset="0.6" stopColor="rgba(0,0,0,0)" />
              <stop offset="1" stopColor="rgba(0,0,0,0.55)" />
            </radialGradient>
          </defs>

          <rect width={1200} height={630} fill="url(#ogBg)" />
          {DOT_GRID.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={1.3}
              fill="rgba(235,233,227,0.07)"
            />
          ))}
          <rect width={1200} height={630} fill="url(#ogVignette)" />

          {/* Bell curves: three overlapping normal distributions, shifted
              into the lower half of the canvas (translate y=290). */}
          <g transform="translate(0,290)">
            <line
              x1={80}
              y1={310}
              x2={1120}
              y2={310}
              stroke="rgba(235,233,227,0.10)"
              strokeWidth={1.5}
            />

            {/* Left distribution (lighter) */}
            <path
              d="M 80 310 C 280 310, 320 60, 420 60 C 520 60, 560 310, 760 310 Z"
              fill="#22d3ee"
              fillOpacity={0.1}
              stroke="#22d3ee"
              strokeOpacity={0.45}
              strokeWidth={2}
            />
            <line
              x1={420}
              y1={60}
              x2={420}
              y2={310}
              stroke="#22d3ee"
              strokeOpacity={0.4}
              strokeDasharray="4 6"
              strokeWidth={1.5}
            />

            {/* Center distribution (brightest) */}
            <path
              d="M 240 310 C 460 310, 510 30, 620 30 C 730 30, 780 310, 1000 310 Z"
              fill="#22d3ee"
              fillOpacity={0.18}
              stroke="#22d3ee"
              strokeOpacity={0.85}
              strokeWidth={2.5}
            />
            <line
              x1={620}
              y1={30}
              x2={620}
              y2={310}
              stroke="#22d3ee"
              strokeOpacity={0.7}
              strokeDasharray="4 6"
              strokeWidth={1.5}
            />

            {/* Right distribution (lighter) */}
            <path
              d="M 440 310 C 640 310, 700 100, 820 100 C 940 100, 980 310, 1120 310 Z"
              fill="#22d3ee"
              fillOpacity={0.1}
              stroke="#22d3ee"
              strokeOpacity={0.45}
              strokeWidth={2}
            />
            <line
              x1={820}
              y1={100}
              x2={820}
              y2={310}
              stroke="#22d3ee"
              strokeOpacity={0.4}
              strokeDasharray="4 6"
              strokeWidth={1.5}
            />
          </g>
        </svg>

        {/* Top-left brand mark: cyan dot + site URL in mono caps */}
        <div
          style={{
            position: "absolute",
            top: 72,
            left: 72,
            display: "flex",
            alignItems: "center",
          }}
        >
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

        {/* Top-right tiny "P(θ | DATA)" caption — Bayesian wink */}
        <div
          style={{
            position: "absolute",
            top: 78,
            right: 72,
            fontFamily: "Geist Mono",
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: 3,
            color: "#5e5d57",
          }}
        >
          P(θ | DATA)
        </div>

        {/* Centered name + subtitle in the upper-middle, so the bell
            curves below it are visually grounded by the headline above. */}
        <div
          style={{
            position: "absolute",
            top: 130,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: "Geist",
              fontWeight: 700,
              fontSize: 116,
              letterSpacing: -4,
              color: "#ebe9e3",
              lineHeight: 1,
            }}
          >
            Shane Thakkar
          </div>
          <div
            style={{
              marginTop: 22,
              fontFamily: "Geist",
              fontWeight: 500,
              fontSize: 32,
              letterSpacing: -0.4,
              color: "#22d3ee",
            }}
          >
            Data Analyst
          </div>
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
