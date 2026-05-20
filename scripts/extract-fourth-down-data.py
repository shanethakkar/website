"""
Extract chart data for the fourth-down article from the sibling NFL_4thDown
analysis repo.

Inputs (all from `C:\\Users\\shane\\Projects\\NFL_4thDown`):
  - data/fourth_downs_clean.parquet  -> conversion rates by ydstogo bucket
  - outputs/league_trends.csv        -> per-season go-for-it rate + WPA gap
  - outputs/situational_guide.csv    -> 5x4 grid (wrong-call rate + optimal decision)

Outputs (written to `<website>/data/`):
  - fourth-down-conversion-rates.json
  - fourth-down-league-trends.json
  - fourth-down-situational.json   (used by both the heatmap and the field map)

Run from the website repo with Anaconda Python:
  & 'C:\\Users\\shane\\anaconda3\\python.exe' scripts/extract-fourth-down-data.py
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

SOURCE = Path(r"C:\Users\shane\Projects\NFL_4thDown")
OUTPUT = Path(__file__).resolve().parent.parent / "data"


# ---------- 1. Conversion rates by yards-to-go ----------

def extract_conversion_rates() -> list[dict]:
    """For each ydstogo bucket, compute conversion % among go-for-it attempts."""
    df = pd.read_parquet(SOURCE / "data" / "fourth_downs_clean.parquet")
    go = df[df["decision"] == "go_for_it"].copy()

    # Bucket scheme matches the situational_guide.csv ydstogo_bin labels and
    # the article narrative (1, 2-3, 4-6, 7+).
    def bucket(yds: int) -> str:
        if yds == 1:
            return "1"
        if yds <= 3:
            return "2-3"
        if yds <= 6:
            return "4-6"
        return "7+"

    go["bucket"] = go["ydstogo"].apply(bucket)

    rows = []
    for label in ["1", "2-3", "4-6", "7+"]:
        sub = go[go["bucket"] == label]
        n = int(len(sub))
        converted = int(sub["fourth_down_converted"].sum())
        rate = converted / n if n else 0.0
        rows.append(
            {
                "bucket": label,
                "attempts": n,
                "conversions": converted,
                "rate": round(rate, 4),
            }
        )
    return rows


# ---------- 2. League trends (go-for-it rate + WPA left on table) ----------

def extract_league_trends() -> list[dict]:
    df = pd.read_csv(SOURCE / "outputs" / "league_trends.csv")
    df = df.sort_values("season")
    return [
        {
            "season": int(row["season"]),
            "goRate": round(float(row["go_rate"]), 4),
            "wpaGap": round(float(row["total_gap"]), 2),
            "era": str(row["era"]),
        }
        for _, row in df.iterrows()
    ]


# ---------- 3. Situational grid (5 field zones x 4 ydstogo buckets) ----------

# Display order — left to right on the field for the cheat sheet, top to bottom
# in the heatmap. own goal -> red zone (offensive perspective).
FIELD_ORDER = ["deep_own", "own_territory", "midfield", "opp_territory", "red_zone"]
YDSTOGO_ORDER = ["short_1", "short_2_3", "medium_4_6", "long_7plus"]


def extract_situational() -> dict:
    df = pd.read_csv(SOURCE / "outputs" / "situational_guide.csv")

    cells = []
    for _, row in df.iterrows():
        cells.append(
            {
                "fieldPos": str(row["field_pos_bin"]),
                "ydstogo": str(row["ydstogo_bin"]),
                "optimalDecision": str(row["optimal_decision"]),
                "wrongCallRate": round(float(row["wrong_call_rate"]), 4),
                "n": int(row["n"]),
                "goPctActual": round(float(row["go_pct_actual"]), 4),
                "puntPctActual": round(float(row["punt_pct_actual"]), 4),
                "fgPctActual": round(float(row["fg_pct_actual"]), 4),
            }
        )

    return {
        "fieldOrder": FIELD_ORDER,
        "ydstogoOrder": YDSTOGO_ORDER,
        "cells": cells,
    }


# ---------- main ----------

def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    payloads = {
        "fourth-down-conversion-rates.json": extract_conversion_rates(),
        "fourth-down-league-trends.json": extract_league_trends(),
        "fourth-down-situational.json": extract_situational(),
    }

    for name, payload in payloads.items():
        out = OUTPUT / name
        with out.open("w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        size_kb = out.stat().st_size / 1024
        if isinstance(payload, list):
            print(f"  wrote {name:42s} ({len(payload)} rows, {size_kb:.1f} KB)")
        else:
            n_cells = len(payload.get("cells", []))
            print(f"  wrote {name:42s} ({n_cells} cells, {size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
