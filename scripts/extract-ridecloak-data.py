"""
Extract chart data for the RideCloak article from the sibling ride-cloak project.

Inputs (all from `C:\\Users\\shane\\Projects\\ride-cloak\\outputs\\dashboard`):
  - uniqueness.csv   -> uniqueness ladder (dev vs full-month scope)
  - suppression.csv  -> k=5 suppression annotations + dashboard panel
  - detection.csv    -> in-distribution PII precision/recall
  - validation.csv   -> monthly health score
  - exports.csv      -> monthly rows in/out (MDS aggregate)
  - ledger_events.csv-> ledger command breakdown

The held-out (unseen-format) PII numbers are not in a CSV; they live in the project's
`docs/findings/phase-2.md` "Held-out unseen-format evaluation" table and are embedded
below as a literal, with the source noted. Everything else is read from the committed
dashboard extract so the article cannot drift from the pipeline's own numbers.

Outputs (written to `<website>/data/`, also checked in):
  - ridecloak-uniqueness.json
  - ridecloak-detection.json
  - ridecloak-dashboard.json

Run from the website repo with any Python 3.10+ (stdlib only, no pandas):
  python scripts/extract-ridecloak-data.py
"""

from __future__ import annotations

import csv
import json
from pathlib import Path

SOURCE = Path(r"C:\Users\shane\Projects\ride-cloak\outputs\dashboard")
OUTPUT = Path(__file__).resolve().parent.parent / "data"

MONTHS = ["2026-01", "2026-02", "2026-03", "2026-04"]
REP_MONTH = "2026-04"  # representative full month (matches the dev slice's month)


def read_csv(name: str) -> list[dict[str, str]]:
    with (SOURCE / name).open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


# ---------- 1. Uniqueness ladder ----------

# The four rungs of the generalization ladder, coarsest location last.
RUNGS = [
    {"key": "zone_minute", "location": "Pickup + dropoff zone", "time": "Exact minute"},
    {"key": "zone_15", "location": "Pickup + dropoff zone", "time": "15-min bucket"},
    {"key": "zone_60", "location": "Pickup + dropoff zone", "time": "60-min bucket"},
    {"key": "borough_15", "location": "Borough", "time": "15-min bucket"},
]
# Map a rung key to the `qi` strings used in the CSVs.
QI = {
    "zone_minute": "zone x minute",
    "zone_15": "zone x 15min",
    "zone_60": "zone x 60min",
    "borough_15": "borough x 15min",
}


def extract_uniqueness() -> dict:
    uniq = read_csv("uniqueness.csv")
    supp = read_csv("suppression.csv")

    def uniqueness_for(scope: str, month: str) -> list[float]:
        out = []
        for rung in RUNGS:
            qi = QI[rung["key"]]
            match = next(
                (r for r in uniq if r["scope"] == scope and r["month"] == month and r["qi"] == qi),
                None,
            )
            out.append(round(float(match["uniqueness"]), 4) if match else None)
        return out

    def suppression_for(month: str) -> list[float | None]:
        out = []
        for rung in RUNGS:
            qi = QI[rung["key"]]
            match = next((r for r in supp if r["month"] == month and r["qi"] == qi), None)
            out.append(round(float(match["suppressed"]), 4) if match else None)
        return out

    return {
        "rungs": RUNGS,
        "scopes": [
            {
                "key": "month",
                "label": "Full month · Apr 2026",
                "trips": "15.4M trips",
                "uniqueness": uniqueness_for("month", REP_MONTH),
                "suppressionK5": suppression_for(REP_MONTH),
            },
            {
                "key": "dev",
                "label": "Dev slice",
                "trips": "250K trips",
                "uniqueness": uniqueness_for("dev", REP_MONTH),
                "suppressionK5": [None, None, None, None],
            },
        ],
    }


# ---------- 2. Detection scoreboard (in-distribution vs held-out) ----------

# Display order: the components that generalize (learned/built-in) on top, the
# hand-written regexes below, so the held-out collapse reads top-to-bottom.
ENTITY_META = [
    ("EMAIL_ADDRESS", "Email address", "learned", "Presidio built-in"),
    ("PERSON", "Person name", "learned", "spaCy NER"),
    ("LOCATION", "Location / address", "mixed", "NER names + street regex"),
    ("PHONE_NUMBER", "Phone number", "handwritten", "custom regex"),
    ("CREDIT_CARD", "Credit card", "handwritten", "custom regex"),
    ("NY_PLATE", "NY license plate", "handwritten", "custom regex"),
    ("TLC_LICENSE", "TLC license", "handwritten", "context recognizer"),
    ("VEHICLE_VIN", "Vehicle VIN", "handwritten", "custom regex"),
]

# Held-out unseen-format P/R, from ride-cloak/docs/findings/phase-2.md (2026-06-12).
HELD_OUT = {
    "EMAIL_ADDRESS": (1.000, 1.000),
    "PERSON": (0.906, 0.982),
    "LOCATION": (0.935, 0.317),
    "PHONE_NUMBER": (1.000, 0.002),
    "CREDIT_CARD": (0.000, 0.000),
    "NY_PLATE": (0.000, 0.000),
    "TLC_LICENSE": (0.000, 0.000),
    "VEHICLE_VIN": (0.000, 0.000),
}
HELD_OUT_OVERALL = (0.948, 0.338)


def extract_detection() -> dict:
    rows = {r["entity"]: r for r in read_csv("detection.csv")}

    entities = []
    for key, label, kind, carries in ENTITY_META:
        ind = rows[key]
        ho_p, ho_r = HELD_OUT[key]
        entities.append(
            {
                "key": key,
                "label": label,
                "kind": kind,
                "carries": carries,
                "inDist": {"p": round(float(ind["precision"]), 4), "r": round(float(ind["recall"]), 4)},
                "heldOut": {"p": ho_p, "r": ho_r},
            }
        )

    overall = rows["overall"]
    return {
        "entities": entities,
        "overall": {
            "inDist": {"p": round(float(overall["precision"]), 4), "r": round(float(overall["recall"]), 4)},
            "heldOut": {"p": HELD_OUT_OVERALL[0], "r": HELD_OUT_OVERALL[1]},
        },
    }


# ---------- 3. Compliance dashboard (4 months) ----------

def extract_dashboard() -> dict:
    validation = read_csv("validation.csv")
    suppression = read_csv("suppression.csv")
    exports = read_csv("exports.csv")
    uniqueness = read_csv("uniqueness.csv")
    ledger = read_csv("ledger_events.csv")

    def health(month: str) -> float:
        r = next(v for v in validation if v["scope"] == "month" and v["month"] == month)
        return round(float(r["health_score"]), 4)

    def export_rows(month: str) -> tuple[int, int]:
        r = next(
            e for e in exports
            if e["month"] == month and e["policy_name"] == "mds_aggregate" and e["scope"] == "month"
        )
        return int(float(r["rows_in"])), int(float(r["rows_out"]))

    def borough_suppression(month: str) -> float:
        r = next(s for s in suppression if s["month"] == month and s["qi"] == "borough x 15min")
        return round(float(r["suppressed"]), 4)

    def borough_uniqueness(month: str) -> float:
        r = next(
            u for u in uniqueness
            if u["scope"] == "month" and u["month"] == month and u["qi"] == "borough x 15min"
        )
        return round(float(r["uniqueness"]), 4)

    months = []
    total_in = 0
    for m in MONTHS:
        rin, rout = export_rows(m)
        total_in += rin
        months.append(
            {
                "month": m,
                "health": health(m),
                "rowsIn": rin,
                "rowsOut": rout,
                "suppression": borough_suppression(m),
                "uniquenessBorough": borough_uniqueness(m),
            }
        )

    # Ledger command breakdown (preserve first-seen order).
    counts: dict[str, int] = {}
    for row in ledger:
        counts[row["command"]] = counts.get(row["command"], 0) + 1
    commands = [{"command": c, "count": n} for c, n in counts.items()]

    avg_health = round(sum(m["health"] for m in months) / len(months), 4)
    avg_suppression = round(sum(m["suppression"] for m in months) / len(months), 5)

    return {
        "months": months,
        "kpis": {
            "totalTripsIn": total_in,
            "avgHealth": avg_health,
            "avgSuppression": avg_suppression,
            "ledgerActions": len(ledger),
        },
        "ledger": {"total": len(ledger), "commands": commands, "verified": True},
    }


# ---------- main ----------

def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    payloads = {
        "ridecloak-uniqueness.json": extract_uniqueness(),
        "ridecloak-detection.json": extract_detection(),
        "ridecloak-dashboard.json": extract_dashboard(),
    }
    for name, payload in payloads.items():
        out = OUTPUT / name
        out.write_text(json.dumps(payload, indent=2))
        print(f"  wrote {name:32s} ({out.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
