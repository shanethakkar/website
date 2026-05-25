# New Machine Setup — Complete Workflow

Reference guide for setting up a fresh Windows machine to work on **all** of Shane Thakkar's projects: portfolio website, NFL 4th-down analysis, F1 Bayesian driver rankings, and NFL Player Grading Platform.

**Estimated time:** ~45 min of installers + ~10 min per project you actually want to set up.

> **Just want the website?** Skip to [Project A — Website](#project-a--website). You only need Git + Node + Cursor from Part 1.

---

## Part 1 — Machine-wide installs (do once)

Install these in order. All have Windows installers, all are free.

| # | Tool | Where | Why | Needed for |
|---|---|---|---|---|
| 1 | **Git** | [git-scm.com/download/win](https://git-scm.com/download/win) | Source control. Installer defaults are fine. | Everything |
| 2 | **Node.js 22 LTS** | [nodejs.org](https://nodejs.org) (pick "LTS") | Runs the Next.js dev server. Bundles `npm`. | Website, NFL Player Grades web app |
| 3 | **Anaconda Python 3.11+** | [anaconda.com/download](https://anaconda.com/download) | Python + scientific stack (pandas, scipy, etc). Installer adds `python.exe` at `C:\Users\<you>\anaconda3\python.exe`. | NFL 4th-Down, F1, NFL Player Grades pipeline |
| 4 | **Cursor** | [cursor.com](https://cursor.com) | Editor. **Sign in with GitHub during setup** so Settings Sync pulls your extensions/keybindings/theme from this machine. | Everything |
| 5 | **GitHub CLI** *(optional but recommended)* | [cli.github.com](https://cli.github.com) | Handles git auth via browser OAuth — no more credential prompts on `git push`. | Everything |
| 6 | **Docker Desktop** *(only if running NFL Player Grades pipeline locally)* | [docker.com/products/docker-desktop](https://docker.com/products/docker-desktop) | Local Postgres for dev work on the grading pipeline. Skip if you'll just connect to the production Neon database. | NFL Player Grades only |

---

## Part 2 — Authenticate (do once)

In PowerShell or Cursor's terminal:

```powershell
# GitHub auth — browser OAuth, never prompts again
gh auth login
```

In a browser, sign in to:

- **[vercel.com](https://vercel.com)** with your GitHub account → see all your deploys
- **[search.google.com/search-console](https://search.google.com/search-console)** with `shane.thakkar@gmail.com` → SEO monitoring for the website
- **[streamlit.io/cloud](https://streamlit.io/cloud)** with your GitHub account → for the NFL 4th-down deployed apps

You don't need to install Vercel CLI or Streamlit CLI for any of this — git push to GitHub auto-deploys both.

---

## Part 3 — Clone all repos

Pick where you want them and clone. **Pay attention to the local folder name for NFL 4th-Down** — the extraction script in the website project hardcodes `C:\Users\<you>\Projects\NFL_4thDown` as the path.

```powershell
mkdir C:\Users\<your-username>\Projects
cd C:\Users\<your-username>\Projects

# Website (portfolio)
git clone https://github.com/shanethakkar/website.git

# NFL 4th down — IMPORTANT: clone into NFL_4thDown so the website's
# extraction script can find it
git clone https://github.com/shanethakkar/nfl-4th-down-analysis.git NFL_4thDown

# F1 Bayesian driver rankings
git clone https://github.com/shanethakkar/f1_driver_ranking.git

# NFL Player Grading Platform (the flagship)
git clone https://github.com/shanethakkar/nfl-player-grades.git
```

Only clone the projects you actually intend to work on. If you only want the website, just clone that one.

---

## Project A — Website

```powershell
cd C:\Users\<your-username>\Projects\website
npm install            # ~1–2 min first time
npm run dev            # starts on http://localhost:3000 (or 3001 if taken)
```

That's it. Visit the URL.

### Things to know
- **Next.js 16, not the older Next.js most docs reference.** `AGENTS.md` in the repo flags this for AI assistants. If you ask Cursor/Claude to write Next code, point them at `node_modules/next/dist/docs/` for current APIs.
- **`context/` is gitignored.** That's where the source-of-truth resume PDF lives by convention. You don't need it on a new machine — `public/Shane-Thakkar-Resume-May-2026.pdf` is the actual served file and it's tracked.
- **`data/fourth-down-*.json` is committed** so the article charts render without needing the NFL_4thDown repo. You only need that sibling project + Python if you want to **regenerate** the data.

### Useful commands

```
npm run dev      # dev server + hot reload
npm run build    # full production build — run before any risky push
npm run lint     # ESLint
```

---

## Project B — NFL 4th Down Analysis

Python project. Streamlit apps deployed separately to Streamlit Cloud.

```powershell
cd C:\Users\<your-username>\Projects\NFL_4thDown

# Create an isolated conda env
conda create -n nfl4d python=3.11 -y
conda activate nfl4d

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-ml.txt   # extra ML deps (XGBoost, etc.)
```

### About the data

The repo has `data/raw/pbp_1999.parquet` through `pbp_2025.parquet` (one file per season, large). On a fresh clone these may **not be present** if they're gitignored.

To check after cloning:

```powershell
ls data/raw/
```

If empty, regenerate with the project's data ingest workflow — open `notebooks/` and run the early notebooks in order (they pull from `nflreadpy` / nflverse). First-time fetch will take several minutes.

If populated, you're good.

### Running the Streamlit apps locally

```powershell
cd streamlit/decision_calculator
streamlit run app.py
```

Repeat for `decision_boundary_map/` and `coach_explorer/`. Each has its own `requirements.txt` for the lighter Streamlit Cloud deployment.

### Re-running the extraction script for the website's charts

If you update the analysis and want to refresh the JSON files the website article reads:

```powershell
cd C:\Users\<your-username>\Projects\website
& 'C:\Users\<your-username>\anaconda3\python.exe' scripts/extract-fourth-down-data.py
```

This reads parquet + CSV from `NFL_4thDown/` and writes to `website/data/fourth-down-*.json`.

---

## Project C — F1 Bayesian Driver Rankings

Python project, lighter setup than NFL 4th Down.

```powershell
cd C:\Users\<your-username>\Projects\f1_driver_ranking

conda create -n f1 python=3.11 -y
conda activate f1
pip install -r requirements.txt
```

### About the data

Uses **FastF1** which caches race data locally to `data/raw/<year>/<grand_prix>/`. On first run the cache rebuilds from the F1 API — slow the first time, fast after.

### Running the analysis

Open notebooks and run them in order:

```powershell
jupyter notebook
```

or open them in Cursor with the Jupyter extension.

### Re-running the website's PPC chart extraction

```powershell
cd C:\Users\<your-username>\Projects\website
& 'C:\Users\<your-username>\anaconda3\python.exe' scripts/extract-f1-ppc.py
```

This needs the sibling `f1_driver_ranking` repo to be set up with its conda env first.

---

## Project D — NFL Player Grading Platform

**The most complex project — a Python pipeline + Postgres database + Next.js web app monorepo.** Follow the project's own `README.md` for full detail. Quick start:

### Python pipeline

```powershell
cd C:\Users\<your-username>\Projects\nfl-player-grades

conda create -n nflgrades python=3.11 -y
conda activate nflgrades

cd pipeline
pip install -e .          # installs the `nflgrades` CLI
```

### Database (one of two paths)

**Option 1 — Connect to production Neon directly (recommended for read/edit work):**

Get the `DATABASE_URL` connection string from your Neon dashboard at [console.neon.tech](https://console.neon.tech) and put it in a `.env` file at the project root. Skip Docker entirely.

**Option 2 — Run local Docker Postgres for pipeline development:**

```powershell
# In the nfl-player-grades root
docker-compose up -d
nflgrades migrate          # applies all SQL migrations to local DB
```

Local DB and Neon are independent. The web app reads whichever `DATABASE_URL` is set — be careful which one you point at.

### Web app

```powershell
cd web
npm install
npm run dev               # starts on http://localhost:3000
```

Set `DATABASE_URL` in `web/.env.local` to either local Docker or Neon.

### Required environment variables

| Var | Where | What |
|---|---|---|
| `DATABASE_URL` | `.env` (pipeline) + `web/.env.local` (web) | Postgres connection string |
| `REPLICATE_API_TOKEN` | `.env` (pipeline) | Only if you want to regenerate the AI player headshots |

Get the values from your existing 1Password / password manager.

### Full reference

The detailed methodology, CLI commands, and ADRs are in:
- `nfl-player-grades/README.md`
- `nfl-player-grades/AGENTS.md`
- `nfl-player-grades/docs/adr/*.md`
- `nfl-player-grades/nfl_grades_resume_context.txt` *(also mirrored in `resume-context/` — see below)*

---

## Part 4 — Resume context files

The local-only folder at `C:\Users\<you>\Projects\resume-context\` holds 5 `.txt` files + a README that feed your resume agent. **These are not in any git repo.**

To sync to the new machine, pick one:

| Option | How | Pros | Cons |
|---|---|---|---|
| **OneDrive / Dropbox / Google Drive** *(recommended)* | Move `resume-context/` into the synced folder, replace local with a symlink or just point both machines at the cloud path | Auto-syncs on edit | Requires cloud account |
| **Private GitHub repo** | Create `shanethakkar/resume-context` set to Private, push, clone on new machine | Same git workflow you already know | One more repo to manage |
| **Manual copy** | Email or USB once | Simplest | Drifts if updated on one machine and not the other |

The NFL Player Grades context (`nfl-player-grades-context.txt`) is also a mirror of `nfl-player-grades/nfl_grades_resume_context.txt` (which IS in git). On a new machine, you can re-copy from the repo if you don't have OneDrive set up yet:

```powershell
cp nfl-player-grades/nfl_grades_resume_context.txt resume-context/nfl-player-grades-context.txt
```

---

## Part 5 — Daily workflow

When you sit down to work on a project:

```powershell
cd C:\Users\<you>\Projects\<project>
git pull origin main       # grab anything from the other machine
# Python projects: also `conda activate <env>` and re-run `pip install -r requirements.txt` if requirements changed
# Node projects: re-run `npm install` if package.json changed
```

When you're done — especially before switching machines:

```powershell
git status                 # see what changed
git add <files>
git commit -m "..."
git push origin main
```

**Discipline:** Commit and push before walking away. The painful failure mode is uncommitted changes stranded on machine A while you start fresh on machine B. Git can recover from it but it's annoying.

### What auto-deploys on push

| Push to | Triggers |
|---|---|
| `shanethakkar/website` main | Vercel deploys → shanethakkar.com updates in 1–2 min |
| `shanethakkar/nfl-player-grades` main | Vercel deploys → nfl-grades.shanethakkar.com updates |
| `shanethakkar/nfl-4th-down-analysis` main | Streamlit Cloud redeploys the 3 apps |
| `shanethakkar/f1_driver_ranking` main | Nothing automated (analysis project, no deployed surface) |

---

## Part 6 — Things you do NOT need

| If you only want to work on… | You can skip… |
|---|---|
| Website | Anaconda, Docker, Streamlit, any sibling repo |
| NFL 4th-Down | Node, Docker, the website / F1 / Player Grades repos |
| F1 driver ranking | Node, Docker, Streamlit, other sibling repos |
| NFL Player Grades pipeline | Streamlit (only used by 4th-down) |

Vercel CLI, Streamlit CLI, and most "official" CLIs for these services are **not needed** — git push to GitHub triggers all deployments automatically.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `git push` prompts for username/password every time | Install GitHub CLI and run `gh auth login` |
| `python` not found in PowerShell | Anaconda installer didn't add to PATH. Either re-run installer with "Add to PATH" checked, or invoke as `& 'C:\Users\<you>\anaconda3\python.exe'` |
| Dev server says port 3000 is taken | Next will try 3001 automatically. Or run `npm run dev -- -p 3002` to pin a port |
| Website build fails after pulling fresh code | Run `npm install` — `package.json` probably changed |
| Cursor doesn't have your settings/extensions | Sign in with GitHub via Settings → Sync |
| Charts in the fourth-down article are blank | `data/fourth-down-*.json` is missing from the website repo. Should be tracked — try `git pull` again |
| `nflgrades` command not found | You forgot to `conda activate nflgrades` after opening a new terminal, or `pip install -e .` didn't run cleanly |

---

## Last updated

2026-05-21 — covers website (Next.js 16), NFL_4thDown (Python + Streamlit), f1_driver_ranking (PyMC + FastF1), and nfl-player-grades (Python + Next 15 + Postgres).
