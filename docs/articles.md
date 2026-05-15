# Authoring Articles

How articles are formatted, structured, and added to this site. Written
for both Shane (what to send) and the agent (what to do with it).

---

## TL;DR — Handing off a new article

To port an article, drop a single chat message with:

1. **Body text** — full article, pasted verbatim. Don't format anything.
2. **Frontmatter values** — title, publish date, dek (one-line summary),
   category (eyebrow tag like `NFL · WPA · XGBoost`), tags, GitHub repo URL.
3. **Images** — drop the files in `context/<topic> images/` (or attach to
   chat). Tell me the order they appear in the article. Use either the
   original filenames or numbered prefixes; I'll rename + place them.
4. **Interactive tools** — Streamlit URLs (or any other embeddable URL).
   One per tool. Optional: rough iframe height in pixels.
5. **Anything special** — math equations (KaTeX will be wired in when the
   first article needs it), pull-quotes, footnotes, etc.

Then say "port this one" and I:

- Copy `_TEMPLATE.mdx` to `content/articles/<slug>.mdx`
- Fill frontmatter, split body into sections, drop in Figure / Interactive components
- Copy images into `public/articles/<slug>/` with clean filenames
- Run the build to verify

The first article (`fourth-down.mdx`) is the working reference. Anything in
this doc is captured from how that one came together.

---

## File layout

```
content/articles/
  <slug>.mdx                  ← article source (frontmatter + MDX body)
  _TEMPLATE.mdx               ← starter template; files starting with "_" are skipped by the build
  _draft-anything.mdx         ← draft / WIP convention (also skipped by build)

public/articles/<slug>/
  figure-name.png             ← per-article image folder
  another-figure.png

lib/articles.ts               ← article loader (frontmatter parser, reading-time, sort)
components/article/           ← article-only UI primitives (see below)
app/articles/[slug]/page.tsx  ← dynamic route, statically generated per slug
```

Slugs become URLs: `content/articles/foo-bar.mdx` → `/articles/foo-bar`.

The homepage `ArticleCard`s in `app/page.tsx` are still hand-wired to
their slugs. When you add a new article, update the matching card's
`slug` so it links to the new MDX. (We can later flip this to be
auto-driven by `getAllArticles()` if it ever becomes a chore.)

---

## Frontmatter reference

```yaml
title: "Article Title"          # Required. The H1 on the page.
date: "2026-04-22"              # Required. ISO date. Drives the meta row + sort order.
dek: "One-line summary."        # Required. Subtitle under the H1 + share-sheet text.
category: "NFL · WPA · XGBoost" # Required. Cyan eyebrow above the title.
tags: ["NFL", "ML"]             # Optional. Used by the homepage chips later (not by the article page).
repo: "https://github.com/..."  # Optional. Renders the "Source" pill in the article header.
```

Reading time is auto-computed (~220 wpm). No need to set it.

---

## Body conventions

The article body is **MDX**, which is markdown plus inline React components.
For Shane, that means: write markdown the way you always do; if you need
an image or an interactive, drop in a `<Figure>` / `<Interactive>` /
`<Callout>` tag. Don't worry about formatting tags otherwise.

### Headings

- `## Section Title` — major section. Renders with a thin full-width
  rule above it (the section divider). Use these for the named sections
  you'd put in a table of contents.
- `### Subsection` — minor break inside a section. No rule. Used
  sparingly.
- Don't use `#` — the page H1 lives in the article header, not the body.

### Inline emphasis

- `**bold**` — names, numbers, key terms. Renders brighter than body.
- `*italic*` — titles of works (*The Ringer*), quiet emphasis.
- `` `inline code` `` — variable names, short snippets.

### Links

- `[label](https://example.com)` — cyan with a subtle underline. Hover
  brightens both. No special config for external vs internal.

### Lists

- `-` for bulleted, `1.` for numbered. Markers are dim by default.

### Blockquotes

```markdown
> A single set-off line. Cyan rule on the left. Italic. Bigger than body.
```

Use for definitions, formulas, or a single quoted line you want to
spotlight. Multi-paragraph blockquotes work but feel heavy.

### Tables

GFM tables work out of the box (we ship `remark-gfm`):

```markdown
| Header | Header | Header |
| --- | --- | --- |
| Cell | Cell | Cell |
```

Renders with mono uppercase headers + subtle row dividers. Inside a
`<Callout>` they pick up a cyan tint instead.

### Code blocks

Fenced with triple backticks. Add a language for clarity even if no
highlighter is wired yet:

````markdown
```python
import pandas as pd
```
````

For prose formulas, use `text`:

````markdown
```text
w = 0.85^(2025 − season)
```
````

### Horizontal rule

`---` renders as a centered three-dot ornament. Use one above the
closing citation / methodology line. Don't sprinkle them inside the
article.

---

## Custom MDX components

Three components are pre-imported into every article — no imports
needed inside the MDX.

### `<Figure>`

A chart, screenshot, or any image with a caption. Two modes:

**Production (real image):**

```mdx
<Figure
  src="/articles/<slug>/figure-name.png"
  alt="Short description of what the image shows."
  caption="Italic caption shown below the figure."
  aspect="16 / 9"
/>
```

**Placeholder (before the image is dropped in):**

```mdx
<Figure
  alt="What the chart will eventually show."
  caption="..."
  aspect="16 / 9"
/>
```

Notes:

- `aspect` should match the image's native aspect (e.g. `"1536 / 906"` for
  a 1536×906 PNG) to avoid letterboxing.
- Captions are auto-numbered: `Fig. 1 · …`, `Fig. 2 · …`. Don't manually
  prefix them.
- Images use `next/image` with `object-contain` — they're never cropped.

### `<Interactive>`

An embedded tool. Two modes:

**Embed (production):**

```mdx
<Interactive
  title="Coach Explorer"
  embedUrl="https://4th-down-coach-explorer.streamlit.app/"
  embedHeight={760}
  openUrl="https://4th-down-coach-explorer.streamlit.app/"
/>
```

**Placeholder (before the embed is wired):**

```mdx
<Interactive
  title="Tool Name"
  description="One line on what the tool does."
  href="https://github.com/shanethakkar/your-repo"
/>
```

Notes:

- Streamlit URLs auto-get `?embed=true` appended so their platform
  chrome is hidden.
- `embedHeight` defaults to `720`. Bump if the tool has lots of vertical
  content (e.g. a long table); shrink if it's compact.
- `openUrl` is the "Open in new tab" fallback shown in the iframe header
  strip. Usually the same URL without the embed flag.
- Streamlit Cloud free-tier apps sleep after inactivity — first visitor
  takes ~30s to wake them up, then they're fast.

### Native React charts (advanced)

For a marquee chart that deserves the full dark-theme treatment instead
of a static PNG or a 4 MB Plotly iframe, build it native:

1. Extract the data from the source export with a one-shot Node script.
   The MLB article's `scripts/extract-mlb-data.mjs` is the working
   example — it parses the `Plotly.newPlot(...)` call out of an
   exported HTML file and writes `data/<slug>.ts`.
2. Build a Client Component at
   `components/article/<Name>Chart.tsx`. Pure SVG with a viewBox keeps
   it dependency-free and responsive. Match the site palette: cyan
   points (`rgba(34,211,238,0.55)`), dim white axes, mono tick labels,
   liquid-glass shell with header + footer strips like `<Interactive>`.
3. Register it in `components/article/mdxComponents.tsx` so MDX files
   can use it as `<NameChart />` with no imports.

Used by the MLB article for the height-vs-velocity scatter
(`<MlbHeightVelocityChart />`, 346 points + OLS trend line). The result
is ~20 KB on the wire (vs. 4.4 MB for the equivalent Plotly export)
and looks native to the site.

### `<Callout>`

A sidebar-style aside for definitions or methodology blocks:

```mdx
<Callout label="Optional small-caps label">

A callout body. Cyan left border + soft cyan tint. Can hold any markdown
including tables, lists, and links.

</Callout>
```

Used in the 4th-down article for the DQS / ODR definition table.

---

## Images — practical notes

- Store under `public/articles/<slug>/`.
- Rename to kebab-case descriptive filenames (`field-decision-map.png`,
  not `26_field_decision_map-1536x906.png`). The agent does this on
  intake.
- PNG is fine. If a chart has a white background and you want it to
  blend with the dark theme, re-export with `transparent=True` in
  matplotlib (or `savefig(..., facecolor='none')`). White-bg images
  render as white panels inside the dark frame — sometimes that's
  intentional, sometimes not.
- Aspect ratio in MDX should match the native image (e.g.,
  `aspect="1536 / 906"`). If you don't know it, the agent can read it
  from the file.

---

## Streamlit embed checklist

When sending a Streamlit URL, you don't have to format it — both forms
work:

- `https://my-app.streamlit.app/`
- `https://my-app.streamlit.app/?utm_medium=oembed`

The `Interactive` component auto-appends `embed=true` for any
streamlit.app URL that doesn't already have it.

Pixel heights that work in the 4th-down article:

- Coach Explorer (tall table): `760`
- 4th Down Decision Calculator (compact form): `720`
- Decision Boundary Map (sliders + viz): `760`

For other tools, eyeball the default and dial in based on what you see.

---

## Section-break spacing

H2 spacing is intentionally tight (margin-top `1.8em`, padding-top
`1.1em`) so section breaks read as intentional, not as a void. The
full-width rule above each H2 is the visual signal that a new section
started; the typography size carries the rest. If you ever want it
even tighter, drop those values in `app/globals.css` under
`.article-body > h2`.

---

## What "good" looks like

A well-formatted article on this site:

- Opens with one or two paragraphs of context before the first H2 if
  that helps (or jumps straight into `## The First Section` — both work).
- Uses 6–10 H2 sections for a long-form piece (the 4th-down article has 9).
- Embeds figures inline with the paragraph that introduces them, not in
  big batches.
- Bolds the names and numbers that matter, italicizes titles of works.
- Uses one or two blockquotes for set-off definitions or formulas — not
  a wall of them.
- Ends with a centered `---` ornament followed by a single italicized
  citation / methodology / source-code line.
