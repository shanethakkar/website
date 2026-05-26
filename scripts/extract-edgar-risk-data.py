"""
Extract chart data for the EdgarRisk article from the sibling RiskAnalyzer
project.

Inputs (all from `C:\\Users\\shane\\Projects\\RiskAnalyzer`):
  - outputs/phase5_adjusted_metrics.csv         -> precision-evolves chart
  - outputs/phase5_longitudinal_classification.csv  -> receipts timeline
  - outputs/phase4_failure_detection.csv        -> 24-failure x 3-signal scoreboard
  - data/processed/{BBBY,BBY,M,KSS,JWN,WSM}_sentiment_risk_factors.json
                                                -> BBBY cohort comparator

Outputs (written to `<website>/data/`):
  - edgar-risk-precision-curves.json
  - edgar-risk-receipts.json
  - edgar-risk-scoreboard.json
  - edgar-risk-cohort-comparator.json

Run from the website repo with Anaconda Python:
  & 'C:\\Users\\shane\\anaconda3\\python.exe' scripts/extract-edgar-risk-data.py
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

SOURCE = Path(r"C:\Users\shane\Projects\RiskAnalyzer")
OUTPUT = Path(__file__).resolve().parent.parent / "data"


# ---------- 1. Precision-evolves chart (hero) ----------

def extract_precision_curves() -> list[dict]:
    """3 horizons: in-sample / extended / +stress-recovered.

    Annotate each step with the company names added so the chart tooltip
    can show what drives each precision jump.
    """
    df = pd.read_csv(SOURCE / "outputs" / "phase5_adjusted_metrics.csv")
    # The 6 distressed names that move precision from 46% -> 61%
    distressed = ["JWN", "WBA", "CVS", "LCID", "KSS", "M"]
    # The 4 stress-recovered names that move precision from 61% -> 69%
    recovered = ["WAL", "CLX", "ALK", "WSM"]
    extras = [[], distressed, recovered]

    rows = []
    for i, (_, row) in enumerate(df.iterrows()):
        rows.append({
            "label": str(row["metric"]),
            "horizon": ["In-sample (Ch.11 only)",
                        "Extended horizon (+ distress to May 2026)",
                        "Including stress-recovered"][i],
            "precision": float(str(row["value"]).rstrip("%")) / 100,
            "tp": int(row["tp"]),
            "fp": int(row["fp"]),
            "addedTickers": extras[i],
        })
    return rows


# ---------- 2. Receipts timeline ----------

def extract_receipts() -> list[dict]:
    """The 6 'false positives' that subsequently underwent distress events.

    Each gets an approximate flag window (the years they appeared in failure
    cohorts) and an event date. Windows are approximations based on which
    failure cohorts each company was peer-grouped against — not single
    canonical numbers in the underlying data.
    """
    df = pd.read_csv(SOURCE / "outputs" / "phase5_longitudinal_classification.csv")
    distressed = df[df["status"] == "subsequent_distress"]

    # Hand-set windows (the cohort years each was peer-evaluated against)
    # and the public event dates for the distress that ultimately landed.
    flag_windows = {
        "JWN":  {"flagStart": 2019, "flagEnd": 2022, "eventYear": 2025, "eventMonth": "May"},
        "WBA":  {"flagStart": 2019, "flagEnd": 2022, "eventYear": 2025, "eventMonth": "Mar"},
        "CVS":  {"flagStart": 2019, "flagEnd": 2022, "eventYear": 2024, "eventMonth": "Oct"},
        "LCID": {"flagStart": 2020, "flagEnd": 2022, "eventYear": 2024, "eventMonth": "Q3"},
        "KSS":  {"flagStart": 2019, "flagEnd": 2022, "eventYear": 2024, "eventMonth": "Q2"},
        "M":    {"flagStart": 2019, "flagEnd": 2022, "eventYear": 2024, "eventMonth": "Q1"},
    }

    out = []
    for _, row in distressed.iterrows():
        t = str(row["ticker"])
        if t not in flag_windows:
            continue
        out.append({
            "ticker": t,
            "company": str(row["company"]),
            "event": str(row["event"]),
            **flag_windows[t],
        })
    return out


# ---------- 3. Detection scoreboard (24 x 3) ----------

# Class-hint overrides — the CSV has "unknown" for Phase 3 additions, but the
# Phase 4 findings doc and README both name the actual subclass for each:
CLASS_HINT_OVERRIDES = {
    "EXPR": "chronic under-disclosure",
    "SDC": "frozen disclosure",
    "HTZ": "static cohort",
    "RAD": "expanding disclosure",
    "NKLA": "expanding disclosure",
    "RIDE": "expanding disclosure",
    "FSR": "expanding + under-disclosure",
    "CHK": "expanding + under-disclosure",
    "WLL": "under-disclosure",
    "ENDP": "under-disclosure (litigation suppression)",
    "MNK": "under-disclosure (litigation suppression)",
}


def extract_scoreboard() -> list[dict]:
    df = pd.read_csv(SOURCE / "outputs" / "phase4_failure_detection.csv")

    out = []
    for _, row in df.iterrows():
        t = str(row["subject"])
        hint = CLASS_HINT_OVERRIDES.get(t, str(row["class_hint"]))
        out.append({
            "ticker": t,
            "sector": str(row["sector"]),
            "classHint": hint,
            "noveltySpike": bool(row["novelty_spike"]),
            "decliningUd": bool(row["declining_ud"]),
            "chronicUd": bool(row["chronic_ud"]),
            "detected": bool(row["any_signal"]),
            "maxRank": round(float(row["max_rank"]), 2),
            "t0Rank": round(float(row["t0_rank"]), 2),
            "ownMaxRaw": round(float(row["own_max_raw"]), 3),
            "nYears": int(row["n_years"]),
        })
    return out


# ---------- 4. Cohort comparator (BBBY case) ----------

BBBY_COHORT = ["BBBY", "BBY", "M", "KSS", "JWN", "WSM"]
COHORT_LABELS = {
    "BBBY": "Bed Bath & Beyond",
    "BBY":  "Best Buy",
    "M":    "Macy's",
    "KSS":  "Kohl's",
    "JWN":  "Nordstrom",
    "WSM":  "Williams-Sonoma",
}
COHORT_YEARS = ["2020", "2021", "2022", "2023"]


def extract_cohort_comparator() -> dict:
    """Two views toggled by a chip in the chart:

      View 1 ("Absolute LM-Negative"): each cohort member's raw Loughran-
        McDonald Negative-word ratio. BBBY sits at the bottom every year,
        making it look healthier than its surviving peers. This is the
        canonical finance-NLP signal — and on this metric it would have
        flagged BBBY as the lowest-risk name in retail.

      View 2 ("Peer-rank novelty"): each member's percentile rank within
        the cohort of TF-IDF year-over-year cosine novelty in Risk
        Factors. BBBY tops out at rank 1.0 in 2021 and 2023, signaling
        the heavy rewriting episodes the cohort wasn't doing.

    Same chart, two underlying signals, opposite story. That's the
    methodology pivot in one interaction.
    """
    # Absolute LM-Negative ratio (view 1)
    sentiment = {}
    for ticker in BBBY_COHORT:
        path = SOURCE / "data" / "processed" / f"{ticker}_sentiment_risk_factors.json"
        sent = json.loads(path.read_text())
        sentiment[ticker] = {
            year: float(sent[year]["Negative_ratio"])
            for year in COHORT_YEARS if year in sent
        }

    # Raw novelty (used to compute peer-rank for view 2)
    raw_novelty = {}
    for ticker in BBBY_COHORT:
        path = SOURCE / "data" / "processed" / f"{ticker}_novelty.json"
        nov = json.loads(path.read_text())
        raw_novelty[ticker] = {
            year: float(nov[year]["novelty"])
            for year in COHORT_YEARS
            if year in nov and nov[year]["novelty"] is not None
        }

    # Compute peer rank of novelty per year: 0.0 = lowest novelty, 1.0 = highest.
    # This is the "max rank" the project's three-signal detector reads off of.
    peer_rank = {ticker: {} for ticker in BBBY_COHORT}
    for year in COHORT_YEARS:
        present = [(t, raw_novelty[t][year]) for t in BBBY_COHORT if year in raw_novelty[t]]
        if len(present) < 2:
            continue
        ranked = sorted(present, key=lambda x: x[1])
        n = len(ranked) - 1
        for i, (t, _) in enumerate(ranked):
            peer_rank[t][year] = round(i / n, 3)

    return {
        "cohort": [
            {"ticker": t, "name": COHORT_LABELS[t], "isFocal": t == "BBBY"}
            for t in BBBY_COHORT
        ],
        "years": COHORT_YEARS,
        "absolute": {
            t: [sentiment[t].get(y) for y in COHORT_YEARS]
            for t in BBBY_COHORT
        },
        "peerRank": {
            t: [peer_rank[t].get(y) for y in COHORT_YEARS]
            for t in BBBY_COHORT
        },
        "rawNovelty": {
            t: [raw_novelty[t].get(y) for y in COHORT_YEARS]
            for t in BBBY_COHORT
        },
    }


# ---------- main ----------

def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    payloads = {
        "edgar-risk-precision-curves.json": extract_precision_curves(),
        "edgar-risk-receipts.json":         extract_receipts(),
        "edgar-risk-scoreboard.json":       extract_scoreboard(),
        "edgar-risk-cohort-comparator.json": extract_cohort_comparator(),
    }

    for name, payload in payloads.items():
        out = OUTPUT / name
        out.write_text(json.dumps(payload, indent=2))
        kb = out.stat().st_size / 1024
        if isinstance(payload, list):
            print(f"  wrote {name:42s} ({len(payload):3d} rows, {kb:.1f} KB)")
        else:
            print(f"  wrote {name:42s} ({kb:.1f} KB)")


if __name__ == "__main__":
    main()
