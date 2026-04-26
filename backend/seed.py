"""Idempotent seed loader.

Drops & recreates the SQLite db, builds the in-memory NetworkX graph
fresh, writes a snapshot, and prints a sanity report.

Load order (so edge targets exist):
  capabilities → competitors (+ HAS_CAPABILITY) → initiatives (+ REQUIRES)
  → signals (+ MENTIONS via extracted_entities)
  → derive THREATENS edges (competitor → initiative when their signals
    overlap on a required capability)
  → derive IMPACTS edges (signal → initiative via shared capability or
    threatened-competitor path).

Run:  python seed.py
"""
from __future__ import annotations

import csv
import json
import math
import os
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv

from graph_store import EdgeType, GraphStore, NodeType
from ingestion.mock_loader import load_json_list, load_signals
from models import (
    Capability,
    Competitor,
    Initiative,
    ScoreHistoryPoint,
    Signal,
)
from scoring import bulk_recompute

DATA = Path(__file__).parent / "data"
TODAY = datetime(2026, 4, 24, tzinfo=timezone.utc)


# ---------- score history synthesis --------------------------------------

def synthesize_history(curve: str, current: float, prior: float) -> list[ScoreHistoryPoint]:
    """90 daily points ending today. `prior` is the value 7 days ago."""
    rng = random.Random(curve)  # deterministic per curve
    points: list[ScoreHistoryPoint] = []

    if curve == "healthcare_inflection":
        # Long flat trend in low-6s, then the 4 anchor signals push current to current.
        for d in range(89, -1, -1):
            date = TODAY - timedelta(days=d)
            if d > 7:
                base = 5.5 + 0.7 * (1 - d / 90)
                score = base + rng.uniform(-0.15, 0.15)
            elif d > 0:
                # ramp from prior toward current over the last 7 days
                t = (7 - d) / 7
                score = prior + (current - prior) * t + rng.uniform(-0.1, 0.1)
            else:
                score = current
            points.append(ScoreHistoryPoint(date=date.date().isoformat(), score=round(score, 2)))
        return points

    if curve == "improving":
        # declining (improving) score from prior down to current over 90 days
        start = prior + 1.5
        for d in range(89, -1, -1):
            date = TODAY - timedelta(days=d)
            t = (89 - d) / 89
            score = start + (current - start) * t + rng.uniform(-0.2, 0.2)
            points.append(ScoreHistoryPoint(date=date.date().isoformat(), score=round(score, 2)))
        return points

    if curve == "oscillating":
        for d in range(89, -1, -1):
            date = TODAY - timedelta(days=d)
            phase = math.sin(d / 8.0)
            score = (prior + current) / 2 + 0.7 * phase + rng.uniform(-0.15, 0.15)
            points.append(ScoreHistoryPoint(date=date.date().isoformat(), score=round(score, 2)))
        # ensure ends at current
        points[-1] = ScoreHistoryPoint(date=TODAY.date().isoformat(), score=current)
        return points

    # default: stable_low
    for d in range(89, -1, -1):
        date = TODAY - timedelta(days=d)
        score = current + rng.uniform(-0.3, 0.3)
        points.append(ScoreHistoryPoint(date=date.date().isoformat(), score=round(score, 2)))
    points[-1] = ScoreHistoryPoint(date=TODAY.date().isoformat(), score=current)
    return points


# ---------- loaders -------------------------------------------------------

def load_all(store: GraphStore) -> dict[str, int]:
    counts: dict[str, int] = {"capability": 0, "competitor": 0, "initiative": 0, "signal": 0}

    # 1. Capabilities
    for raw in load_json_list(DATA / "seed_capabilities.json"):
        cap = Capability.model_validate(raw)
        store.add_capability(cap)
        counts["capability"] += 1

    # 2. Competitors (HAS_CAPABILITY edges added inside add_competitor)
    for raw in load_json_list(DATA / "seed_competitors.json"):
        comp = Competitor.model_validate(raw)
        store.add_competitor(comp)
        counts["competitor"] += 1

    # 3. Initiatives (REQUIRES edges added inside add_initiative)
    for raw in load_json_list(DATA / "seed_initiatives.json"):
        curve = raw.pop("_history_curve", "stable_low")
        # synthesize history before validation since model expects ScoreHistoryPoint list
        raw["score_history"] = [p.model_dump() for p in synthesize_history(curve, raw["current_risk_score"], raw["prior_risk_score"])]
        init = Initiative.model_validate(raw)
        store.add_initiative(init)
        counts["initiative"] += 1

    # 4. Signals (MENTIONS edges added inside add_signal from extracted_entities)
    for sig in load_signals(DATA / "seed_signals.jsonl"):
        store.add_signal(sig)
        counts["signal"] += 1

    return counts


# ---------- derived edges -------------------------------------------------

def derive_threatens(store: GraphStore) -> int:
    """Competitor THREATENS Initiative when:
       (a) the competitor has HAS_CAPABILITY edge to a capability,
       (b) the initiative REQUIRES that capability (priority high or med),
       (c) at least one signal MENTIONS both competitor and capability in
           the last 90 days.
    Edge stores exposure_score = sum over qualifying capabilities of
    (competitor_strength * required_priority_weight * recent_signal_count).
    """
    PRIORITY_WEIGHT = {"high": 1.0, "med": 0.6, "low": 0.3}
    g = store.graph
    competitor_ids = [n for n, d in g.nodes(data=True) if d.get("type") == NodeType.COMPETITOR.value]
    initiative_ids = [n for n, d in g.nodes(data=True) if d.get("type") == NodeType.INITIATIVE.value]
    recent_signals = set(store.signals_in_window(90))
    added = 0

    for comp in competitor_ids:
        comp_caps = {
            dst: data
            for _, dst, data in g.out_edges(comp, data=True)
            if data.get("edge_type") == EdgeType.HAS_CAPABILITY.value
        }
        for init in initiative_ids:
            init_caps = {
                dst: data
                for _, dst, data in g.out_edges(init, data=True)
                if data.get("edge_type") == EdgeType.REQUIRES.value
            }
            shared = set(comp_caps.keys()) & set(init_caps.keys())
            if not shared:
                continue
            exposure = 0.0
            shared_qualifying: set[str] = set()
            for cap in shared:
                strength = float(comp_caps[cap].get("strength", 0))
                priority = init_caps[cap].get("priority", "low")
                pw = PRIORITY_WEIGHT.get(priority, 0.3)
                # need at least one recent signal mentioning both comp and cap
                hits = 0
                for sig in recent_signals:
                    sig_targets = {
                        dst
                        for _, dst, data in g.out_edges(sig, data=True)
                        if data.get("edge_type") == EdgeType.MENTIONS.value
                    }
                    if comp in sig_targets and cap in sig_targets:
                        hits += 1
                if hits == 0:
                    continue
                shared_qualifying.add(cap)
                exposure += strength * pw * hits
            if exposure > 0 and shared_qualifying:
                store.link(
                    comp,
                    EdgeType.THREATENS,
                    init,
                    exposure_score=round(exposure, 2),
                    via_capabilities=sorted(shared_qualifying),
                )
                added += 1
    return added


def derive_impacts(store: GraphStore) -> int:
    """Signal IMPACTS Initiative when the signal MENTIONS a capability that
    the initiative REQUIRES, OR when it mentions a competitor that
    THREATENS the initiative. Weight = signal weight * source authority *
    recency_decay * mean(edge confidences).
    """
    SOURCE_AUTHORITY = {
        "analyst": 1.0,
        "news": 0.7,
        "crm": 0.9,
        "cpq": 0.8,
        "social": 0.4,
    }
    g = store.graph
    initiative_ids = [n for n, d in g.nodes(data=True) if d.get("type") == NodeType.INITIATIVE.value]
    init_required = {
        i: {
            dst
            for _, dst, data in g.out_edges(i, data=True)
            if data.get("edge_type") == EdgeType.REQUIRES.value
        }
        for i in initiative_ids
    }
    init_threatened_by = {
        i: {
            src
            for src, _, data in g.in_edges(i, data=True)
            if data.get("edge_type") == EdgeType.THREATENS.value
        }
        for i in initiative_ids
    }

    added = 0
    signal_ids = [n for n, d in g.nodes(data=True) if d.get("type") == NodeType.SIGNAL.value]

    for sig in signal_ids:
        sig_data = g.nodes[sig]
        published_at = datetime.fromisoformat(sig_data["published_at"])
        age_days = max(0.0, (TODAY - published_at).total_seconds() / 86400.0)
        recency_decay = math.exp(-age_days / 30.0)
        authority = SOURCE_AUTHORITY.get(sig_data.get("source_type", "news"), 0.5)
        mentions: list[tuple[str, float]] = []
        for _, dst, data in g.out_edges(sig, data=True):
            if data.get("edge_type") == EdgeType.MENTIONS.value:
                mentions.append((dst, float(data.get("confidence", 0.5))))
        if not mentions:
            continue
        mentioned_caps = {m[0] for m in mentions if g.nodes[m[0]].get("type") == NodeType.CAPABILITY.value}
        mentioned_comps = {m[0] for m in mentions if g.nodes[m[0]].get("type") == NodeType.COMPETITOR.value}
        mean_conf = sum(c for _, c in mentions) / len(mentions)

        for init in initiative_ids:
            via_capabilities = mentioned_caps & init_required[init]
            via_competitors = mentioned_comps & init_threatened_by[init]
            if not via_capabilities and not via_competitors:
                continue
            weight = float(sig_data.get("weight", 1.0)) * authority * recency_decay * mean_conf
            store.link(
                sig,
                EdgeType.IMPACTS,
                init,
                weight=round(weight, 4),
                via_capabilities=sorted(via_capabilities),
                via_competitors=sorted(via_competitors),
            )
            added += 1
    return added


# ---------- sanity report -------------------------------------------------

ANCHOR_SIGNALS = [
    "sig-acea-co2-penalties-001",
    "sig-frontier-euro7-cost-001",
    "sig-skoda-lfp-line-001",
    "sig-market-eu-bev-share-001",
]
ANCHOR_INITIATIVE = "init-euro7-co2-compliance"


def print_summary(store: GraphStore) -> None:
    summary = store.summary()
    nodes = summary["nodes"]
    edges = summary["edges"]
    print("GraphStore summary")
    print(
        "  nodes: "
        + "  ".join(f"{k}={v}" for k, v in sorted(nodes.items()))
    )
    print(
        "  edges: "
        + "  ".join(f"{k}={v}" for k, v in sorted(edges.items()))
    )

    reachable = []
    missing = []
    for sig_id in ANCHOR_SIGNALS:
        paths = store.paths(sig_id, ANCHOR_INITIATIVE, max_len=3)
        if paths:
            reachable.append(sig_id)
        else:
            missing.append(sig_id)
    if missing:
        print(f"  WARN: anchor signals NOT reaching {ANCHOR_INITIATIVE}: {missing}")
    print(
        f"  demo anchor: {ANCHOR_INITIATIVE} has path(s) of length<=3 to "
        + ", ".join(reachable)
    )


# ---------- main ----------------------------------------------------------

def main() -> None:
    load_dotenv()
    db_url = os.environ.get("DATABASE_URL", "sqlite:///./competitive_os.db")
    store = GraphStore(db_url)
    store.reset()
    counts = load_all(store)
    threatens = derive_threatens(store)
    impacts = derive_impacts(store)
    recompute = bulk_recompute(store)
    store.snapshot()

    print(f"Loaded: {counts}")
    print(f"Derived edges: THREATENS={threatens}  IMPACTS={impacts}")
    if recompute.get("recommendations_generated"):
        print(f"Generated recommendations: {recompute['recommendations_generated']}")
    print_summary(store)


if __name__ == "__main__":
    main()
