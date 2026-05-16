# Shane Thakkar — Portfolio Site: Agent Context

> This file is the canonical memory for all future agent sessions working on this repo.
> Update it whenever new decisions are made or new content is added.

---

## 1. About Shane

| Field | Value |
|---|---|
| Name | Shane Thakkar |
| Degree | Business Analytics & Artificial Intelligence (Data Science Track) |
| School | University of Texas at Dallas (UT Dallas) |
| Graduated | May 2026 |
| Based | Dallas, Texas (Frisco area) |
| Phone | 469-989-3585 |
| Status | Actively interviewing, available immediately |
| Email | shane.thakkar@gmail.com |
| LinkedIn | /in/shanethakkar |
| GitHub | @shanethakkar |
| Twitter/X | @shanethakkar |

> **Important:** GPA is intentionally **not displayed** anywhere on the site. Don't add it back.

### Bio / tagline (from mockup)
> "I build data science projects on the things I can't stop thinking about — usually NFL coaching decisions, F1 driver skill, or whether the wisdom of crowds beats expert scouts."

### Work Experience
- **Intern, Business Intelligence** — Legends Global, Frisco, TX (Jul 2025 – Dec 2025)
  Analyzed 1M+ POS records across 8+ pro sports venues; market-basket + Pareto on FC Dallas concessions; F&B clustering for ~15 LA28 venues; SQL Server reconciliation automation (~10 hrs/week saved).
- **Intern, Project Management & Data Analytics** — Supreme Lending, Dallas, TX (Jun 2024 – Nov 2024)
  Excel-based PM system for 100+ test cases through loan origination upgrade; Power Automate workflow for Azure DevOps; led 14-intern team in 30-min executive pitch.
- **Intern, Business Analyst** — TruGen, Frisco, TX (May 2023 – May 2024)
  SQL pipelines on wireless network performance data feeding ML models that hit 90% classification accuracy on signal quality.

### Skills
**Languages:** Python, R, SQL, JavaScript, HTML/CSS, C++, Visual Basic  
**Libraries / ML:** NumPy, Pandas, Scikit-learn, TensorFlow, PyTorch, PyMC, XGBoost  
**Analytics / BI:** Tableau, Power BI, R Shiny, LangChain  
**Web / Infra:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Vercel, Neon (Postgres serverless)  
**Data sources used:** nflfastR / nflverse, nflreadpy, FastF1, Statcast / Baseball Savant  

---

## 2. Current Site (shanethakkar.com)

- Built on a simple CMS/blog platform (Substack-style)
- Light theme, minimal design
- Navigation: Home | Projects | Resume | NFL Grades Site
- Contains 3 published articles (see §4)
- Has a "Projects" page and a link to resume PDF
- Subdomain `nfl-grades.shanethakkar.com` — separate live app (dark, sports-analytics aesthetic)

---

## 3. Projects

### Flagship — NFL Position Grades
- **URL:** nfl-grades.shanethakkar.com
- **Status:** Live, actively maintained
- **What it does:** Grades every NFL player on a 0–100 scale using advanced stats. Per-season grades + recency-weighted career grades + full depth charts for all 32 teams.
- **Coverage:** 2018–present, positions: QB, RB, WR, TE, CB, S, EDGE, iDL, LB, K, P (OL deferred — no public per-player blocking data)
- **Methodology highlights:**
  - Per-target/per-opportunity efficiency as foundation (not counting stats)
  - Empirical Bayes shrinkage for small-sample players
  - Sigmoid z-score → 0–100 mapping (scale never rescales)
  - Recency-weighted career grades (Kalman-style smoothing)
  - Role-based sub-classification (e.g., TE blocking vs. receiving)
  - Every grade traceable back to raw data components
- **Tech stack:** Python pipeline (pandas, numpy, scipy, sqlalchemy) → Neon Postgres → Next.js 15 + TypeScript + Tailwind → Vercel
- **Architecture:** 3 layers: data pipeline / database / web app. 20+ ADRs in `docs/adr/`
- **Honest limitations documented:** per-target efficiency contaminated by offensive context; cross-position grades ordinally comparable but not cardinally; no OL individual grades

### Project 2 — NFL 4th Down Decision Analysis
- **Status:** Published article + interactive tools on the site
- **What it does:** Analyzes 107,000 fourth-down decisions (NFL 1999–2025) using Win Probability Added (WPA) to grade coaches on decision quality
- **Key metrics:** DQS (Decision Quality Score), ODR (Optimal Decision Rate)
- **Methodology:** 4-dimension game-state binning (field pos, yards-to-go, score diff, time remaining) → up to 700 unique states; recency weighting `w = 0.85^(2025 - season)`; XGBoost model for Decision Boundary Map
- **Interactive tools built:** 4th Down Decision Calculator, 4th Down Decision Boundary Map
- **Data:** nflfastR via nflverse, 1999–2025 regular seasons
- **Key finding:** Teams left ~371 WPA on the table in 1999; down to ~25.7 by 2025 (~0.8 WPA/team/season = ~1 free win unclaimed)
- **Tech:** Python, nflfastR, XGBoost

### Project 3 — F1 Driver Bayesian Ranking
- **Status:** Published article
- **What it does:** Separates driver skill from car performance in F1 using Bayesian hierarchical modeling (2014–2025)
- **Core metric:** "Value Added on Sunday" = how much better/worse a driver finishes relative to starting position, after controlling for car quality
- **Model:** `finish_residual ~ Student-T(v, μ, σ) = a + Driver_Effect + TeamSeason_Effect + β_dnf * dnf_driver_fault`
- **Interesting finding (Verstappen Paradox):** Model ranks Perez above Verstappen because Verstappen dominates from pole (near-zero residuals) while Perez frequently recovers positions
- **Validation:** R-hat ≈ 1.0; holdout RMSE 3.114 vs naive baseline 3.146
- **Tech:** PyMC, FastF1, Python

### Project 4 — MLB Pitcher Height ≠ Velocity
- **Status:** Published article
- **What it does:** Regression analysis showing height doesn't predict fastball velocity among MLB pitchers; explains via selection bias
- **Key insight:** Physics works as expected at youth/high school levels (R² = 92.5%), but at MLB level R² drops to 33.6% because only shorter pitchers with compensating elite skills survive the selection process
- **Tech:** Python, Scikit-learn, Statcast data

### Project 5 — Kalshi Market Intelligence Tool (in development)
- **Status:** In development — NOT yet on the portfolio site (Shane: "I don't have the Kalshi project done yet so don't worry about that")
- **What it does:** Prediction-market opportunity detector with live dashboards
- **Tech:** Flask, React, Claude API
- **Plan:** Add to project grid once it's built

---

## 4. Published Articles

| Title | Published | Key Topics |
|---|---|---|
| Fourth Down Is Still Football's Biggest Coaching Problem | Apr 22, 2026 | WPA, coach grading, XGBoost, NFL 1999–2025 |
| Who Is Actually the Best F1 Driver? A Bayesian Approach to Separating Skill from the Car | Apr 18, 2026 | Bayesian hierarchical model, PyMC, FastF1, 2014–2025 |
| Why Height Doesn't Predict Velocity in Major League Baseball | May 13, 2025 | Regression, selection bias, Statcast, MLB 2024 |

---

## 5. New Portfolio Site — Design Direction

### Design System (from mockup `context/shane_portfolio_centered_v9.html`)
- **Theme:** Dark, terminal/data-aesthetic
- **Background:** `#0c0c0e`
- **Primary text:** `#ebe9e3` / `#fafaf6`
- **Muted text:** `#8b8a83` / `#5a5953`
- **Accent / cyan:** `#22d3ee` (primary CTA, highlights) / `#67e8f9` (hover states)
- **Borders:** `rgba(255,255,255,0.08)` — very subtle
- **Font roles:** `var(--font-mono)` for labels/nav/chips, `var(--font-sans)` for headings/body, `var(--font-serif)` for hero bio
- **Border radius:** 6–12px; cards use 8–12px
- **Browser chrome mockup:** macOS-style traffic lights (red/yellow/green dots), dark bar, URL pill — used as a decorative outer frame

### Color Motif: Grade Tiers
- The QB Leaderboard on nfl-grades.shanethakkar.com colors grades with discrete tiers (high = emerald, low = red), not a continuous gradient. This is a brand motif Shane uses throughout that site.
- We're carrying this into the portfolio: any grade values displayed (flagship card grade numbers + bars) use the same tier map via `lib/gradeColor.ts`.
- Tiers (Tailwind 400 palette): ≥90 emerald `#34d399`, ≥80 green `#4ade80`, ≥70 lime `#a3e635`, ≥55 yellow `#facc15`, ≥40 orange `#fb923c`, <40 red `#f87171`. `gradeColorSoft` returns the same hex at 18% alpha for tinted backgrounds.
- Cyan (`#22d3ee`) remains the primary brand accent for everything else.

### Layout / Sections (CONFIRMED ORDER)
```
[top nav: sticky — ● SHANE THAKKAR | work · writing · about · contact]
[hero: status pill + name + role + capability-focused tagline + CTAs]
[/ 01  Selected work    — flagship card (NFL Grades) + project grid]
[/ 02  Writing          — articles with dates]
[/ 03  Tech / Skills    — what I work with]
[/ 04  About / Bio      — short personal section]
[/ 05  Get in touch     — contact icon links]
[footer]
```
**Rationale:** Lead with proof of work (projects + articles) before listing tools. Recruiters and hiring managers care about what you've built before what you've used.

### Key UI Patterns (CONFIRMED)
- **Hero:** split layout (asymmetric). Left = name + status pill + capability tagline + CTAs. Right = live data widget (mini NFL Grades leaderboard pulling from real API as the hero "moment"). Stacks on mobile.
- **Background:** reactive subtle dot/line grid that responds to cursor + scroll position. Tuned low — barely there at rest, slightly amplified near cursor. Toned down if it distracts.
- **Layout width:** hybrid — full-bleed hero, `max-w-6xl` (~1152px) for content sections, flagship project card breaks out wider.
- **Section numbers:** `/ 01`, `/ 02`, etc. in cyan mono caps.
- **Chips:** small mono labels (`next.js`, `python`, `pymc`).
- **Flagship project card:** wide breakout, cyan border with soft glow, gradient background, live data preview (NFL grades top-5).
- **Project cards (grid):** interactive live previews. Real data viz at rest (sparkline / mini chart / top-N list pulled from project). On hover: chart redraws, numbers tick, accent border lights up, subtle lift.
- **Hero status pill:** pulsing cyan dot + "AVAILABLE — ACTIVELY INTERVIEWING".
- **CTAs:** primary cyan-filled `view work ↓` + secondary outlined `resume.pdf ↗`.

### Navigation (CONFIRMED — distinctive)
- **Initial state:** clean top nav over the hero (`● SHANE THAKKAR` left, section links right).
- **On scroll past hero:** lifts off and morphs into a floating frosted-glass pill at top center, showing current section (e.g., `02 / writing`).
- **Thin cyan progress bar** underneath the pill, filling as user scrolls.
- **Command palette:** click the pill OR `⌘K` / `Ctrl+K` to open an overlay with all sections, quick-jump to articles + projects, plus search. Built with `cmdk` library.
- **Mobile:** pill collapses to icon, palette opens fullscreen.

### First Load Treatment
- On first visit (sessionStorage flag), hero name **types itself in** like a terminal — small, theatrical, ~600ms total. Skipped on subsequent navigations within the session to keep things fast.
- Sections below hero fade/stagger in via Framer Motion as they enter viewport.

### Easter Eggs / Personality
- Deferred for now. Revisit after v1 ships.

### Tech Stack for the New Site (confirmed)
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Fonts:** Geist Sans + Geist Mono (`next/font/google`)
- **Animations:** Framer Motion (rich, premium feel)
- **Page transitions:** Browser-native View Transitions API (modern, smooth)
- **Command palette:** `cmdk` library (cmd+K palette wired to nav)
- **Content:** MDX files in `/content` for articles + project deep-dives. MDX components for code blocks, KaTeX math, callouts, embedded charts.
- **Article treatment:** Editorial × technical hybrid — editorial typography (serif headlines, generous reading column) with full technical capability (code blocks, KaTeX, embedded interactive viz).
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel → shanethakkar.com
- **Mobile:** first-class — full polish, animations, and command palette work on mobile
- No database needed for portfolio itself (NFL Grades widget pulls from existing nfl-grades subdomain API)

---

## 6. Decisions Log

| Date | Decision | Notes |
|---|---|---|
| 2026-05-14 | Repo initialized, context gathered | Repo was empty; context folder had HTML mockup, NFL Grades summary, resume PDF |
| 2026-05-14 | Design direction: dark terminal aesthetic per `v9.html` mockup | Not following exactly, just inspiration |
| 2026-05-14 | Shane graduated May 2026, actively interviewing | Update hero pill copy accordingly |
| 2026-05-14 | Cards = "depth-card" treatment, NOT translucent liquid glass | Cards use ~94% solid dark gradient + inset highlights + outer drop shadow. Earlier translucent version let dot grid bleed through and hurt readability. The class name `liquid-glass` is kept for stability but the look is solid-dark. |
| 2026-05-14 | Flagship card breathes via `flagship-glow` keyframe (5.5s) | Cyan halo box-shadow opacity oscillates 0.20 → 0.36 → 0.20 to give the page a subtle living pulse. Hover overrides animation with stronger static glow. Respects `prefers-reduced-motion`. |
| 2026-05-14 | Writing card hover = cyan tint, not white | On hover, articles pick up a soft cyan diagonal gradient + cyan border + cyan halo glow — same language as the flagship at lower intensity. Lift reduced from 4px to 2px so it feels expensive, not cheap. |
| 2026-05-14 | No headshot — text-only About | Site is too clean for a photo to fit. About will be bio paragraphs only. Stylized AI portrait remains a "maybe later" idea. |
| 2026-05-14 | Hero bottom padding halved (`pb-12 sm:pb-16`) | Tightens hero → Selected Work transition. Top padding stays generous (`pt-20 sm:pt-28`). |
| 2026-05-14 | Top nav redesigned for legibility + richness | Type bumped 11px → 12.5px. Wordmark gains "/ DATA SCIENTIST" tail. Each nav link gets a cyan two-digit prefix (matches section header convention) and an active state synced to the IntersectionObserver. Slim "RESUME ↓" CTA on the far right. Subtle cyan gradient hairline at top of header. |
| 2026-05-14 | Tech grid = 3 depth-card columns + secondary row | `Languages` / `ML & Stats` / `Web & Infra` as primary cards; `Data & BI` as a thinner outline footer row for tertiary tools. Each chip is mono lowercase with cyan-tint hover + small lift. Categories stagger in on scroll, then chips stagger in as a second wave. |
| 2026-05-14 | About = bio paragraphs (left) + Quick Facts factsheet (right) | Voice is direct, anti-LinkedIn-speak. 4 paragraphs covering education, projects, internship, current search. Factsheet is 6 mono key/value rows on a depth card. Drafted by assistant; Shane to revise copy later. |
| 2026-05-14 | Contact = big editorial CTA + 4 brand cards | Left: clamp-sized "Let's build something worth shipping." headline with cyan-emphasis on the verb, "say hi" + "resume.pdf" buttons. Right: 4 frosted depth cards (Email, LinkedIn, GitHub, X). Brand glyphs (GitHub/LinkedIn/X) inlined as SVGs because lucide-react has dropped trademarked brand icons. |
| 2026-05-14 | Resume PDF copied to `public/Shane-Thakkar-Resume-May-2026.pdf` | Source of truth remains `context/`; copy in `public/` so the resume CTA works as a static asset. Update both when resume changes. |
| 2026-05-14 | About bio rewritten from accurate resume content | Internship is **Legends Global** (BI Intern, Jul–Dec 2025, Frisco), prior internships at Supreme Lending and TruGen. Based **Dallas, Texas**. Stack **Python · SQL · R**. **No GPA mention** anywhere on the site. Quick Facts factsheet matches. |
| 2026-05-14 | Tech grid trimmed to 3 analytics-focused sections, strict resume sourcing | Dropped frontend chips (c++, javascript, typescript, html/css) — Shane is targeting analytics roles, not frontend. Final 3 cards: **Programming & Analytics** (Python, SQL, R, Git, Bash/UNIX), **ML & Statistics** (Scikit-learn, TensorFlow, Keras, Optuna, Time-Series, Regression, Clustering), **BI, Cloud & Tools** (Tableau, Power BI, Plotly, Databricks, Snowflake, Azure, Alteryx, Excel). Removed the secondary "Data & BI" footer chip row entirely — it was visually disconnected. |
| 2026-05-14 | Contact cards stack single-column on the right | Previous 2-col grid truncated handles ("shane.thakkar_", "in/shanethakk_"). Single column lets every handle render in full at 13.5px mono. Bigger 40×40 icon tiles to match. |
| 2026-05-14 | Contact CTA reworked, no informal copy | Headline → "Open to the next problem worth solving." (analytics-leaning, professional). Subhead drops the "dumb football take" line in favor of "what the data actually says." Primary button label "say hi" → "get in touch". |
| 2026-05-14 | Top nav further hardened for legibility | Nav links 12.5px → **14px**, numbers 10px → 11px, gap 7 → 8. Wordmark 12.5 → 13px. Header now has a near-solid dark gradient bg + 8px backdrop blur so the dot grid never bleeds through. Cyan top hairline brightened to `0.22`. |
| 2026-05-14 | DotGrid: top safe-zone fade | Dots are fully suppressed in the top **92px** of the viewport and ramp back in over the next **36px**. Lives in viewport space (not document space) so the nav band always stays clean even after scroll. Constants `SAFE_TOP_FULL` / `SAFE_TOP_FADE` in `DotGrid.tsx`. |
| 2026-05-14 | Tech grid energy pass — icons, primary/secondary chips, divider | Each card now leads with a cyan glyph (Code2 / Brain / BarChart3) in a bordered tile, brighter title, readable subtitle (was nearly invisible at `fg-dim`), cyan-tinted gradient divider, and chips split into **primary** (brighter `text-fg-bright` with thicker border) vs **secondary** (default) so the eye lands on the headline tools first. Hover lifts chip 2px and adds a cyan halo glow. Chip font 11px → 12.5px. |
| 2026-05-14 | Floating pill removed — header is sticky now | Pill felt off-brand against the editorial layout. The expanded header now uses `position: sticky; top: 0; z-50` and stays pinned during scroll. IntersectionObserver still tracks the active section. **Active link gets a sliding cyan underline** via framer-motion `layoutId="nav-active-underline"` — it springs between items as you scroll, with a soft cyan box-shadow for glow. The scroll-progress hairline now lives along the bottom edge of the sticky header instead of the pill. |
| 2026-05-14 | All sections get `scroll-mt-24` | So anchor jumps (#tech, #about, etc.) land below the sticky nav instead of being hidden underneath it. |
| 2026-05-14 | Spacing tightened across the whole page | Hero `pt-20 pb-12 sm:pt-28 sm:pb-16` → `pt-14 pb-8 sm:pt-20 sm:pb-10`. Sections `py-10 sm:py-14` → `py-8 sm:py-10`. SectionHeader `mb-8 pb-4` → `mb-6 pb-3`. Page now reads with much less dead space between content blocks. |
| 2026-05-14 | Sticky nav slimmed | Container padding `py-5 sm:py-6` → `py-3.5 sm:py-4`. Resume button `py-2` → `py-1.5` so it doesn't dictate bar height. Nav is now ~58–64px tall. DotGrid safe zone shrunk to match: `SAFE_TOP_FULL` 92 → 64, `SAFE_TOP_FADE` 36 → 28. Section `scroll-mt-24` → `scroll-mt-20`. |
| 2026-05-14 | Contact never activated — fixed with bottom-of-page detector | The IntersectionObserver activation band (`-30% 0px -55% 0px`) sat above the contact section because contact is the final block. Added a scroll listener that force-sets `activeSection = contact` when `scrollY + innerHeight >= scrollHeight - 80`. The IO callback also early-returns when at-bottom so it can't bounce activation back to "about" during scroll inertia. |

---

## 7. Files in This Repo

```
/
├── CONTEXT.md                            ← this file (agent memory)
├── app/
│   ├── globals.css                       ← design tokens + .liquid-glass card classes + .article-body typography
│   ├── layout.tsx                        ← Geist fonts, metadata, viewport themeColor, Vercel Analytics
│   ├── icon.svg                          ← site favicon (bold cyan "S" on dark gradient,
│   │                                       Next.js App Router auto-serves this as the icon)
│   ├── opengraph-image.tsx               ← homepage OG card at /opengraph-image.png:
│   │                                       "Shane Thakkar — Data Analyst" + Bayesian curves.
│   │                                       Generated by Satori; loads Geist Bold/Medium and
│   │                                       Geist Mono Medium as TTF via the Google Fonts CSS API.
│   ├── twitter-image.tsx                 ← re-exports opengraph-image so Twitter cards match.
│   ├── page.tsx                          ← homepage: hero + 5 sections + footer
│   └── articles/
│       └── [slug]/page.tsx               ← dynamic article route — generateStaticParams over MDX files
├── components/
│   ├── DotGrid.tsx                       ← reactive canvas dot grid background
│   ├── MorphingNav.tsx                   ← top header (numbered links + resume CTA) + scroll pill
│   ├── SectionHeader.tsx                 ← reusable / 0X — Title — META row
│   ├── FlagshipCard.tsx                  ← NFL Grades depth card (pulsing cyan halo)
│   ├── ArticleCard.tsx                   ← stacked editorial article cards (writing section)
│   ├── projectVisuals.tsx                ← SVG mini-charts for the 3 article previews.
│   │                                       Fourth-down: trend line with rotated "GO-FOR-IT %"
│   │                                       y-axis title and 11% / 22% endpoint annotations.
│   │                                       MLB: scatter with height on Y, velocity on X, both
│   │                                       axes titled in mono caps, "r ≈ 0" callout.
│   │                                       F1: forest plot — driver names are the labels.
│   ├── TechPhysics.tsx                   ← physics playground: 15 brand-colored icons with
│   │                                       gravity, collisions, drag-and-throw. Pucks drop
│   │                                       on scroll-into-view via IntersectionObserver.
│   │                                       Icon size + collision radius scale with arena.
│   ├── TechGrid.tsx                      ← (legacy) 3 depth-card columns — superseded by
│   │                                       TechPhysics, kept on disk in case we want it back
│   ├── AboutSection.tsx                  ← bio paragraphs + Quick Facts factsheet
│   ├── icons.tsx                         ← shared inline-SVG brand glyphs (GitHub, LinkedIn)
│   ├── ContactSection.tsx                ← editorial CTA + 3 brand cards (GitHub, LinkedIn, email)
│   └── article/                          ← MDX article system
│       ├── ArticleChrome.tsx             ← slim sticky top bar (back · name · resume)
│       ├── ArticleHeader.tsx             ← eyebrow + title + dek + meta row + actions
│       ├── ArticleActions.tsx            ← (client) Source pill + Share button (Web Share + clipboard)
│       ├── ArticleFooter.tsx             ← back-to-writing link + "more posts" cards
│       ├── Figure.tsx                    ← inline figure: real <Image> when src set, else placeholder
│       ├── Interactive.tsx               ← inline tool: iframe when embedUrl set, else placeholder
│       ├── Callout.tsx                   ← cyan-bordered aside for definitions / tables
│       ├── MlbHeightVelocityChart.tsx    ← (client) native SVG scatter for MLB article — replaces Plotly iframe
│       ├── F1DriverRankings.tsx          ← (client) native forest plot, 46 drivers × 94%/50% HDIs
│       ├── F1ConstructorHeatmap.tsx      ← (client) native diverging heatmap, 23 teams × 12 seasons
│       └── mdxComponents.tsx             ← MDXRemote component map (Figure, Interactive, Callout, custom charts)
├── content/
│   └── articles/                         ← MDX article source — one .mdx per slug
│       ├── _TEMPLATE.mdx                 ← starter — copy to <slug>.mdx and edit
│       ├── fourth-down.mdx               ← article 1 — NFL 4th down (3 Streamlit interactives, 5 figures)
│       ├── f1-bayesian-driver-rankings.mdx  ← article 2 — F1 Bayesian rankings (2 native SVG charts, 1 PNG, GitHub repo)
│       └── mlb-pitcher-height-velocity.mdx  ← article 3 — MLB height vs velocity (1 native SVG chart)
├── data/
│   ├── mlb-height-velocity.ts            ← AUTO-GENERATED scatter data (346 pitchers + trend line)
│   ├── f1-driver-rankings.ts             ← AUTO-GENERATED forest-plot data (46 drivers + HDIs)
│   └── f1-constructor-heatmap.ts         ← AUTO-GENERATED heatmap data (23 teams × 12 seasons, 123 cells)
├── docs/
│   └── articles.md                       ← authoring guide (what to send, conventions, components)
├── lib/
│   ├── articles.ts                       ← MDX article loader (frontmatter + reading-time, skips _-prefixed files)
│   └── gradeColor.ts                     ← grade → HSL gradient utility
├── public/
│   ├── Shane-Thakkar-Resume-May-2026.pdf ← linked from nav + contact resume buttons
│   ├── excel-icon.png                    ← Fluent Excel logo used in TechPhysics
│   └── articles/                         ← per-article image folders
│       ├── fourth-down/                  ← 5 chart images for the NFL 4th-down piece
│       └── f1-bayesian-driver-rankings/  ← 1 PNG (posterior predictive); rankings + heatmap are native components
├── scripts/
│   ├── extract-mlb-data.mjs              ← one-shot extractor: MLB scatter from a Plotly HTML export
│   └── extract-f1-data.mjs               ← one-shot extractor: F1 rankings + heatmap from Plotly HTML exports
└── context/
    ├── shane_portfolio_centered_v9.html  ← HTML mockup (design inspiration only)
    ├── NFL GRADES SUMMARY.txt            ← detailed NFL Grades project description
    ├── 4th-down.txt                      ← raw paste of article 1 (pre-conversion)
    ├── Who Is Actually the Best F1 Driver.txt  ← raw paste of article 2
    ├── driver_rankings_interactive(1).html    ← Plotly source for F1 forest plot
    ├── team_season_heatmap_interactive.html   ← Plotly source for F1 heatmap
    ├── 2interactive_height_vs_velocity.html    ← Plotly source for MLB scatter
    └── Shane-Thakkar-Resume-May-2026.pdf ← canonical resume (copy lives in public/)
```

---

## 7b. Article authoring

When porting a new article, read **`docs/articles.md`** first — it
documents every frontmatter field, every custom component, image
handling, Streamlit embed conventions, and the handoff workflow. The
template at `content/articles/_TEMPLATE.mdx` is the starting point;
copy it to `<slug>.mdx` and fill in.

Files starting with `_` in `content/articles/` are skipped by the build
(handled in `lib/articles.ts`). Use that prefix for templates and
drafts.

**Interactive charts — three rendering options, in increasing effort:**

1. **`<Figure src=...>`** — static PNG export. Simplest and lightest.
2. **`<Interactive embedUrl=...>`** — iframe pointing at a hosted tool
   (Streamlit Cloud, or any self-contained HTML in `public/`). Used by
   the 4th-down article for its Streamlit apps. Heavy: Plotly HTML
   exports are 4–5 MB, and the iframe's white default clashes with the
   dark theme.
3. **Native React/SVG chart** — extract the data with a one-shot
   `scripts/extract-*.mjs` Node script, store it in `data/*.ts`, build
   a `components/article/*Chart.tsx` Client Component that fits the
   site's dark + cyan palette, and register it in `mdxComponents.tsx`.
   Used by the MLB article (`MlbHeightVelocityChart` — 346 points +
   trend line). Best looking, no iframe load, fully responsive. Use
   this for any chart that's the marquee visual of an article.

---

## 8. Open Questions / TODOs

- [x] Email: shane.thakkar@gmail.com
- [x] Subdomain: nfl-grades.shanethakkar.com
- [x] LinkedIn/GitHub/Twitter: @shanethakkar across all
- [x] Framework: Next.js 15 + TypeScript + Tailwind (confirmed)
- [x] Articles: hosted on new site (not linked out), will build full blog/article system
- [x] Domain: shanethakkar.com (confirmed)
- [x] Blog/CMS: MDX files in repo — write markdown, commit, Vercel auto-deploys
- [x] Interactive tools: rebuild as native React components embedded in article pages
- [x] Theme: dark only — terminal aesthetic is the brand
- [x] Photo: placeholder for now, Shane will provide headshot later
- [x] Site structure: HYBRID — homepage is single-page scroll (hero→tech→projects→writing→contact); articles get /blog/[slug]; projects get /projects/[slug]
- [x] Articles: build page templates with placeholder content first, fill real text later
- [x] Resume: PDF in context/ folder is current — link it as downloadable
- [x] Role targeting: Broadly Data / AI / Analytics / Business Intelligence
- [x] Contact: icon links only — email, LinkedIn, GitHub, Twitter/X (no form)
- [x] GitHub: all projects are public — link repos when building project cards
- [x] Animations: rich / premium feel (framer-motion or similar)
- [x] Analytics: Vercel Analytics
- [x] Fonts: Geist Sans + Geist Mono (Next.js native via `next/font/google`)
- [x] Nav: sticky top
- [x] Hero tagline: capability-focused placeholder — polish copy later
- [x] Headshot: skipped — About is text-only. Revisit later only if a stylized/abstract treatment fits the brand.
- [ ] GitHub repo URLs: fill in per-project when building cards
- [ ] Hero tagline: final copy TBD with Shane
