"""Extract data for the F1 posterior-predictive-check plot.

The original chart (outputs/posterior_predictive_check.png in the
f1_driver_ranking repo) overlays two KDEs:

  • Observed `finish_residual` across all ~4.9k Hybrid-Era races.
  • Posterior-predictive samples from the fitted Student-T model
    (see src/validation.py → check_posterior_predictive).

We replicate it in TypeScript / SVG. Re-running the MCMC takes several
minutes and a heavy PyMC stack, so this script reconstructs the posterior-
predictive samples deterministically from the posterior means already
written to outputs/arviz_summary_full.txt:

  • Observed array → re-built from FastF1 cache via the repo's
    `build_features()` (fast — race results only, no model).
  • Posterior-predictive array → for each row i, draw
        y_pp_i ~ StudentT(ν̂, μ̂_i, σ̂),
        μ̂_i = α̂ + Driver_Effect[d_i] + TeamSeason_Effect[ts_i] + β̂_dnf · dnf_i
    using the posterior MEANS of every parameter. The parameter posteriors
    are tight (sd ≪ mean for every effect we care about), so this differs
    from the true integrated PPC by a negligible amount at KDE resolution.

KDE settings mirror the seaborn call exactly:
    sns.kdeplot(y_obs,  bw_adjust=1.0, ...)
    sns.kdeplot(y_pp,   bw_adjust=1.5, ...)

Output: website/data/f1-ppc.json with
  { observed: { x: [...], y: [...] },
    posterior: { x: [...], y: [...] },
    summary: { n_observed, n_pp, params: {...}, model_eq } }
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import gaussian_kde, t as student_t

# ---------------------------------------------------------------------------
# Paths — F1 repo lives next to the website repo.
# ---------------------------------------------------------------------------
F1_REPO = Path(r"C:\Users\shane\Projects\f1_driver_ranking")
WEBSITE_REPO = Path(__file__).resolve().parent.parent

sys.path.insert(0, str(F1_REPO))

import fastf1  # noqa: E402
fastf1.set_log_level("ERROR")

from src.features import build_features  # type: ignore  # noqa: E402

SUMMARY_PATH = F1_REPO / "outputs" / "arviz_summary_full.txt"
OUT_PATH = WEBSITE_REPO / "data" / "f1-ppc.json"

# Match the source plot: PPC sample size is downsampled to 5000 there.
N_PP_SAMPLES = 5000
RNG_SEED = 42

# KDE evaluation grid — same x-range as the static figure for parity.
X_MIN, X_MAX = -20.0, 20.0
KDE_GRID_N = 401  # 0.1-residual resolution


def parse_posterior_means(path: Path) -> dict[str, float | dict[str, float]]:
    """Parse arviz summary text into {scalar_name: mean} + nested dicts for vector effects."""
    text = path.read_text(encoding="utf-8")
    scalars: dict[str, float] = {}
    driver_effect: dict[str, float] = {}
    team_season_effect: dict[str, float] = {}

    # Each row is: "<name>   <mean>   <sd>   ..."  (whitespace-separated)
    for raw_line in text.splitlines()[1:]:  # skip header
        line = raw_line.strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        name = parts[0]
        try:
            mean = float(parts[1])
        except ValueError:
            continue

        m_driver = re.match(r"^Driver_Effect\[(.+)\]$", name)
        m_team = re.match(r"^TeamSeason_Effect\[(.+)\]$", name)
        if m_driver:
            driver_effect[m_driver.group(1)] = mean
        elif m_team:
            team_season_effect[m_team.group(1)] = mean
        elif name in {"alpha", "beta_dnf", "nu", "sigma", "sigma_driver", "sigma_team"}:
            scalars[name] = mean

    return {
        **scalars,
        "Driver_Effect": driver_effect,
        "TeamSeason_Effect": team_season_effect,
    }


def main() -> None:
    print("Loading features (FastF1 cache)...")
    model_df, _ = build_features()
    model_df = model_df[np.isfinite(model_df["finish_residual"])].copy()
    print(f"  rows: {len(model_df):,}")

    print("Parsing posterior means from arviz summary...")
    post = parse_posterior_means(SUMMARY_PATH)
    alpha = float(post["alpha"])
    beta_dnf = float(post["beta_dnf"])
    nu = float(post["nu"])
    sigma = float(post["sigma"])
    de_map: dict[str, float] = post["Driver_Effect"]  # type: ignore[assignment]
    te_map: dict[str, float] = post["TeamSeason_Effect"]  # type: ignore[assignment]
    print(
        f"  alpha={alpha:.4f}  beta_dnf={beta_dnf:.4f}  "
        f"nu={nu:.4f}  sigma={sigma:.4f}"
    )
    print(f"  drivers in summary: {len(de_map)}; team-seasons: {len(te_map)}")

    # Map each observed row to its posterior-mean (Driver_Effect + TeamSeason_Effect).
    # Rows whose driver / team-season are not in the trace (very rare; happens
    # only if the summary excludes some ZeroSum coords, which it does not for
    # this model) get 0.0 — matching the validation.py holdout convention.
    de_vec = model_df["driver_id"].astype(str).map(de_map).fillna(0.0).to_numpy()
    te_vec = (
        model_df["team_season_id"].astype(str).map(te_map).fillna(0.0).to_numpy()
    )
    dnf_vec = model_df["dnf_driver_fault"].astype(float).to_numpy()
    mu = alpha + de_vec + te_vec + beta_dnf * dnf_vec

    print(
        f"Sampling posterior-predictive y_pp ~ StudentT(nu={nu:.2f}, mu_i, sigma={sigma:.2f}) "
        f"for {len(mu):,} rows..."
    )
    rng = np.random.default_rng(RNG_SEED)
    # One draw per row (matches the per-row PPC strategy used by PyMC's
    # sample_posterior_predictive); then downsample to N_PP_SAMPLES like the
    # source plot.
    y_pp_full = student_t.rvs(df=nu, loc=mu, scale=sigma, random_state=rng)
    if y_pp_full.size > N_PP_SAMPLES:
        flat_pp = rng.choice(y_pp_full, size=N_PP_SAMPLES, replace=False)
    else:
        flat_pp = y_pp_full
    y_obs = model_df["finish_residual"].to_numpy()

    print(
        f"  y_obs n={y_obs.size:,}, "
        f"mean={y_obs.mean():+.3f}, "
        f"median={np.median(y_obs):+.3f}, "
        f"sd={y_obs.std():.3f}"
    )
    print(
        f"  y_pp  n={flat_pp.size:,}, "
        f"mean={flat_pp.mean():+.3f}, "
        f"median={np.median(flat_pp):+.3f}, "
        f"sd={flat_pp.std():.3f}"
    )

    # Match the matplotlib version's display window: ±20 truncated.
    n_obs_outside = int(np.sum((y_obs < X_MIN) | (y_obs > X_MAX)))
    n_pp_outside = int(np.sum((flat_pp < X_MIN) | (flat_pp > X_MAX)))
    print(
        f"  truncated outside ±20: observed={n_obs_outside}, posterior={n_pp_outside}"
    )

    # KDEs — match seaborn defaults (Gaussian, Scott's bandwidth) and use
    # bw_adjust=1.5 on the posterior-predictive curve, exactly as the source
    # script does.
    x_grid = np.linspace(X_MIN, X_MAX, KDE_GRID_N)
    kde_obs = gaussian_kde(y_obs, bw_method="scott")
    kde_pp = gaussian_kde(flat_pp, bw_method="scott")
    kde_pp.set_bandwidth(kde_pp.factor * 1.5)

    obs_density = kde_obs(x_grid)
    pp_density = kde_pp(x_grid)

    payload = {
        "observed": {
            "x": [round(float(x), 4) for x in x_grid],
            "y": [round(float(v), 6) for v in obs_density],
            "n": int(y_obs.size),
            "stats": {
                "mean": float(y_obs.mean()),
                "median": float(np.median(y_obs)),
                "sd": float(y_obs.std()),
                "min": float(y_obs.min()),
                "max": float(y_obs.max()),
                "outsideRange": n_obs_outside,
            },
        },
        "posterior": {
            "x": [round(float(x), 4) for x in x_grid],
            "y": [round(float(v), 6) for v in pp_density],
            "n": int(flat_pp.size),
            "stats": {
                "mean": float(flat_pp.mean()),
                "median": float(np.median(flat_pp)),
                "sd": float(flat_pp.std()),
                "min": float(flat_pp.min()),
                "max": float(flat_pp.max()),
                "outsideRange": n_pp_outside,
            },
        },
        "model": {
            "likelihood": "StudentT(ν, μ, σ)",
            "mu": "α + Driver_Effect + TeamSeason_Effect + β_dnf · dnf_driver_fault",
            "params": {
                "alpha": alpha,
                "beta_dnf": beta_dnf,
                "nu": nu,
                "sigma": sigma,
            },
            "nDrivers": len(de_map),
            "nTeamSeasons": len(te_map),
        },
        "displayRange": [X_MIN, X_MAX],
        "source": "f1_driver_ranking/outputs/arviz_summary_full.txt (posterior means)",
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(
        json.dumps(payload, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
