# shanethakkar.com

Portfolio site for Shane Thakkar (UT Dallas '26, Business Analytics &
AI). Single-page homepage + MDX-driven article system, deployed on
Vercel.

**Live:** [shanethakkar.com](https://shanethakkar.com)

---

## For new agents / collaborators

Start with these three files, in order:

1. **[`AGENTS.md`](./AGENTS.md)** — Next.js 16 has breaking changes vs.
   anything in training data; this is the heads-up.
2. **[`docs/HANDOFF.md`](./docs/HANDOFF.md)** — one-page orientation:
   what's done, what's not, where to start, first-prompt template.
3. **[`CONTEXT.md`](./CONTEXT.md)** — canonical memory. Design system,
   color tokens, section order, file map, decision log, repeatable
   workflows (especially § 8.1 *Adding a new article*).

If you're going to touch articles, also read
**[`docs/articles.md`](./docs/articles.md)** for the authoring guide.

---

## Local development

```bash
npm install
npm run dev          # http://localhost:3000 (or 3001 if taken)
npm run build        # full production build — must pass cleanly
npm run lint
```

Deploys happen automatically on push to `main` via Vercel.

---

## Stack

- **Framework:** Next.js 16.2.6 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + custom design tokens in `app/globals.css`
- **Content:** MDX (`next-mdx-remote`, `gray-matter`, `remark-gfm`)
- **Animation:** Framer Motion
- **OG images:** `next/og` (Satori) — fonts bundled locally under `assets/fonts/`
- **Analytics:** Vercel Analytics
- **Deploy:** Vercel

---

## Repo layout (quick view — full map in `CONTEXT.md § 7`)

```
app/                  Next.js App Router — homepage, layout, OG images, article route
components/           UI primitives + section components
  article/            MDX article system (chrome, header, footer, custom charts)
content/articles/     MDX article source — one file per slug
data/                 Pre-computed chart data (extracted via scripts/)
docs/                 HANDOFF + article authoring guide
lib/                  articles loader, OG font helper, color util
public/               Static assets — resume PDF, article images, team logos
scripts/              One-shot data extractors (mlb, f1, f1-ppc) + font downloader
assets/fonts/         TTFs bundled for Satori (do not switch back to runtime fetch)
context/              Raw source material — article drafts, mockups, resume
```
