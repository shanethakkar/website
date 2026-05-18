# Handoff — Shane Thakkar Portfolio

> One-page orientation for a new agent (Claude Code, etc.) picking up this
> repo. Read this **first**, then `CONTEXT.md`, then `docs/articles.md` if
> you'll be touching articles.

---

## 1. What this site is

A single-page portfolio at **shanethakkar.com** for Shane Thakkar (UT
Dallas '26, Business Analytics & AI). It's the marketing surface for the
job search — flagship project, articles, tech, about, contact — plus a
full MDX-driven article system at `/articles/<slug>`.

Subdomain `nfl-grades.shanethakkar.com` is a **separate repo**
(not this one) — the portfolio just links to it and re-displays its top
QBs via hardcoded data in `FlagshipCard.tsx`.

Stack: **Next.js 16.2.6 (App Router) + TypeScript + Tailwind v4 + MDX
+ Framer Motion + Vercel Analytics**, deployed on Vercel.

---

## 2. Read these in order

1. **`AGENTS.md`** — the "this is not the Next.js you know" warning. Heed it.
   Next 16 has breaking changes vs. anything in training data; consult
   `node_modules/next/dist/docs/` when in doubt.
2. **`CONTEXT.md`** — canonical memory. Has the design system, color
   tokens, section order, file map, decision log, open questions, and the
   "Adding a new article" checklist (§ 8.1).
3. **`docs/articles.md`** — full article-authoring guide (frontmatter,
   components, image handling, Streamlit embeds, the three chart
   strategies). Required reading before porting / editing any article.
4. **This file** — the part that's about *what's done* and *what's next*.

If Shane sends you something article-shaped, also re-read `CONTEXT.md
§ 8.1` before each new article. There are ~5 manual steps the
auto-generated route, OG card, reading bar, and "more posts" footer don't
cover.

---

## 3. State of the site (as of the last commit on `main`)

### Shipped and working

- **Homepage** — hero (status pill, name, role, capability tagline, CTAs),
  flagship card (NFL Grades — static top-4 QBs), projects grid (3 article
  cards with native SVG mini-visuals), tech section (interactive physics
  playground — 15 brand-colored pucks with gravity, collisions, drag),
  about (bio + Quick Facts factsheet + Teams logo row), contact (editorial
  CTA + GitHub / LinkedIn / Email cards), footer.
- **Navigation** — sticky header, numbered links, IntersectionObserver-driven
  active state with a sliding cyan underline, scroll-progress hairline along
  the header's bottom edge, resume button. Active state has a bottom-of-page
  override so `contact` always activates last.
- **Article system** — three articles live, all with native interactive
  charts where appropriate. Per-slug OG + Twitter cards via `next/og`,
  reading progress bar, share button, "more posts" footer, "Source" pill
  if `repo` is in frontmatter.
- **Open Graph cards** — homepage card (Bayesian curves + `Data · AI · ML`
  subtitle) and per-article cards. Fonts are **bundled locally** under
  `assets/fonts/` — do NOT switch back to fetching from Google Fonts at
  build time (Vercel's prerender will time out — that's how we got here).
- **Favicon** — `app/icon.svg`, cyan "S" centered on dark gradient.
- **Theme color meta** — exported from `app/layout.tsx` so mobile browser
  chrome matches the dark theme.
- **SEO foundations** — `app/sitemap.ts` (auto-enumerates articles from
  MDX), `app/robots.ts`, custom `app/not-found.tsx`, Person + WebSite
  JSON-LD on the homepage with `sameAs` linking LinkedIn / GitHub /
  NFL Grades for brand-search consolidation, and BlogPosting JSON-LD on
  each article (`author@id` references the homepage Person). Per-article
  metadata has `canonical`, `og:url`, `modifiedTime`. Submitted to
  Google Search Console.

### Three articles currently published

| Slug | Topic | Charts |
|---|---|---|
| `fourth-down` | NFL 4th-down decisions, 1999–2025 | 5 PNGs + 3 Streamlit `<Interactive>` embeds |
| `f1-bayesian-driver-rankings` | Bayesian driver ranking | 3 native SVG components (forest plot, constructor heatmap, posterior predictive KDE) |
| `mlb-pitcher-height-velocity` | Height vs. velocity selection bias | 1 native SVG scatter |

### Known good build / deploy pipeline

- `npm run dev` → local at `http://localhost:3000` (or 3001 if taken).
- `npm run build` → must pass cleanly. Watch for new
  `/articles/<slug>/opengraph-image` and `/articles/<slug>/twitter-image`
  routes whenever you add an article.
- `git push origin main` → Vercel auto-deploys. The last build failure
  we hit was the OG-image font fetch timing out; bundled fonts fixed it.

---

## 4. What hasn't been built yet (the real "open work")

In rough priority order. None of these are blocking — the site is
shippable as-is — but they're the natural next steps.

### 4.1 Loose ends from earlier sessions

- **Hero tagline copy** — RESOLVED 2026-05-18. Hero now reads
  `DATA · AI · ML` (mono caps) + `"I build projects that follow my
  curiosity."` Same role label propagated to the nav wordmark tail,
  browser title, OG card subtitle, and OG alt text. JSON-LD `jobTitle`
  is `"Data Scientist"`. School credential dropped from the hero and
  now lives only in About Quick Facts + JSON-LD `alumniOf`.
- **Command palette (⌘K)** — designed in `CONTEXT.md § 5 Navigation`
  using the `cmdk` library. `cmdk` is **not installed**. The sticky-nav
  decision in the decisions log (2026-05-14) implies this was deferred.
  Confirm with Shane before adding.

### 4.2 Content that's coming

- **Project 5 — Kalshi Market Intelligence Tool.** Listed in
  `CONTEXT.md § 3` as "in development, NOT yet on the portfolio site."
  When Shane finishes it, add it the same way as any other article-card-
  shaped project (see § 8.1 checklist, but for a project card instead of
  an article — i.e. flagship-style or projects-grid entry).
- **Headshot / portrait** — explicitly deferred. The About section is
  text-only on purpose. Revisit only if a stylized treatment fits the
  brand.
- **GitHub repo URLs per project** — `CONTEXT.md § 8` open question.
  The F1 article has a `repo:` frontmatter and shows a "Source" pill;
  fourth-down and MLB don't. Add when their repos go public.

### 4.3 SEO — shipped (was: gaps)

All four items below were the open SEO gaps in earlier drafts of this
doc. As of 2026-05-16 they're shipped and live. Kept here as a pointer
so future agents know where the SEO plumbing actually lives.

- `app/sitemap.ts` — `/sitemap.xml`, slugs auto-pulled from MDX.
- `app/robots.ts` — allow all + sitemap reference.
- `app/not-found.tsx` — custom on-brand 404.
- JSON-LD via `lib/schema.ts` — Person + WebSite on home (sameAs links
  LinkedIn / GitHub / NFL Grades), BlogPosting on each article.
- Per-article metadata polish — `alternates.canonical`, `og:url`,
  `og:modifiedTime`, `og:authors`.

Verified in Google Search Console (sitemap submitted, domain TXT
verified via KnownHost cPanel). Next time the hero or article copy
changes meaningfully, the homepage / article URLs may need an
explicit "Request Indexing" nudge in Search Console to refresh
Google's cached snippet.

### 4.4 Things to keep an eye on

- **Footer build version string** — `app/page.tsx` hardcodes
  `BUILD · v0.10.1`. Decide if Shane wants this to stay decorative
  (fine) or actually track git SHA (a few lines in next.config.ts +
  `process.env.NEXT_PUBLIC_GIT_SHA`).
- **Reading progress bar physics** — currently spring-smoothed
  (`stiffness: 120, damping: 30`). Feels good on long articles, slightly
  laggy on very short ones. Tunable if Shane complains.
- **Cursor IDE browser MCP hydration warnings** — `data-cursor-ref="..."`
  attributes injected by the dev browser cause harmless hydration
  warnings in console. **Not a bug in the code.** Don't waste cycles
  "fixing" it.

### 4.5 Things we explicitly decided NOT to do

- **GPA anywhere on the site.** Don't add it back.
- **Per-article author photo.** No headshot anywhere (see above).
- **Light theme.** Dark is the brand. The class name `liquid-glass` is
  legacy — cards are solid-dark depth cards, not translucent.
- **`legacy` `TechGrid.tsx`** — superseded by `TechPhysics.tsx`. Don't
  reintroduce it without a reason.
- **First-load hero typewriter.** Built once, reviewed live by Shane on
  2026-05-16, rejected ("I don't like the typewriter, revert please").
  Don't propose or rebuild — see the matching decision log entry.
- **Twitter / X handle anywhere.** Shane has no account. Removed from
  `layout.tsx` `twitter.creator`, from JSON-LD Person `sameAs`, and
  from per-article metadata. The `summary_large_image` Twitter Card
  meta tags stay (they control unfurls on Slack / Discord / iMessage
  independently of whether Shane has a Twitter account). Don't put
  `@shanethakkar` back into `sameAs` or any creator field even though
  some doc text references still mention it.
- **Sports-only / single-domain framing in meta + JSON-LD.** Site copy
  was generalized 2026-05-16 to `"analytics and machine learning
  projects"`. Don't put NFL coaching / F1 driver skill / selection bias
  language back into meta tags or JSON-LD descriptions — Shane
  explicitly said he doesn't want to be pigeonholed. Article bodies
  themselves are still domain-specific; this rule is only about the
  site-wide framing.

---

## 5. Repo conventions Claude Code will care about

- **Article slugs.** `content/articles/foo-bar.mdx` → `/articles/foo-bar`.
  Filenames starting with `_` are skipped by the build (templates, drafts).
- **MDX components.** Only the ones registered in
  `components/article/mdxComponents.tsx` will resolve in article bodies.
  Custom charts get imported there before they can be referenced from MDX.
- **Native chart workflow.** Data lives in `data/`, extractor scripts in
  `scripts/`, React component in `components/article/`. See the MLB and
  F1 articles for two complete worked examples.
- **OG fonts.** `lib/og.ts` reads TTFs from `assets/fonts/`. If you need
  a new weight or family, drop the TTF in there and update the
  `FONT_FILES` map. `scripts/download-og-fonts.mjs` is the one-shot
  downloader that documents how the existing TTFs got there.
- **Color tokens.** Defined in `app/globals.css` (look for `--color-bg`,
  `--color-accent`, etc.). Tailwind utilities map onto these via
  `tailwind.config` / `@theme` blocks. Don't hardcode hex values.
- **Cards.** Use the `.liquid-glass` class for the standard depth-card
  treatment. `.liquid-glass-accent` for the flagship variant with the
  pulsing cyan halo.
- **Section anchors.** Every homepage section has `scroll-mt-20` so
  hash links don't get hidden under the sticky nav.
- **Footer year.** Now driven by `new Date().getFullYear()` in
  `app/page.tsx` — don't hardcode a year string.

---

## 6. First-prompt template for Claude Code

Paste this verbatim into the new chat:

> I'm continuing work on my portfolio site. Please start by reading
> these files, in order:
>
> 1. `AGENTS.md`
> 2. `docs/HANDOFF.md`
> 3. `CONTEXT.md`
>
> Then confirm you've loaded them and summarize back to me, in 4–5
> bullets: what the site is, what state it's currently in, what the open
> work items are, and the conventions you'll follow when editing
> articles or components.
>
> Don't make any code changes until I tell you what I want to work on.

That gets the agent oriented before it touches anything.

If the very next task is **adding an article**, also tell it:

> Open `CONTEXT.md` § 8.1 "Adding a new article — checklist" and walk
> through it as you go — there are about five manual steps the
> auto-generated routes / OG cards don't cover.

If the next task is **a new interactive chart**, point it at the F1 PPC
chart for the cleanest end-to-end reference:

> Use `scripts/extract-f1-ppc.py` → `data/f1-ppc.json` →
> `components/article/F1PosteriorPredictive.tsx` as your template. The
> MLB scatter (`extract-mlb-data.mjs` → `data/mlb-height-velocity.ts` →
> `components/article/MlbHeightVelocityChart.tsx`) is a good Node-only
> alternative.

---

## 7. Quick health-check checklist for the new agent

Run through this once before making changes, just to confirm the dev
loop works on your machine:

- [ ] `npm install` — clean install.
- [ ] `npm run dev` — server starts on 3000 (or 3001 if taken).
      Visit `/`, scroll through all sections, click a couple of nav links.
- [ ] Visit `/articles/f1-bayesian-driver-rankings` — confirm the three
      native SVG charts render (forest plot, constructor heatmap,
      posterior predictive KDE with hover crosshair). The KDE has a layer
      toggle in the legend; both layers should be visible by default.
- [ ] Visit `/opengraph-image` and `/articles/f1-bayesian-driver-rankings/opengraph-image`
      — confirm both render (PNG response).
- [ ] `npm run build` — passes. Output should list ~7 prerendered routes.
- [ ] `npm run lint` — clean.

If any of these fail, that's the first thing to debug. Don't start new
work on top of a broken baseline.
