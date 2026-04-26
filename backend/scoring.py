"""Risk score computation (Phase 2).

Computes path-weighted initiative risk by enumerating paths (<=3 hops)
from recent Signal nodes to an Initiative through competitor/capability
nodes. Persists updated scores back into GraphStore.
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from graph_store import EdgeType, GraphStore
from models import NodeType, RecommendationStatus
from synthesis.recommendations import generate_recommendation

SOURCE_AUTHORITY = {
    "analyst": 1.0,
    "news": 0.7,
    "crm": 0.9,
    "cpq": 0.8,
    "social": 0.4,
}


def _parse_dt(value: Any) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        except ValueError:
            return None
    return None


def _edge_weight(attrs: dict[str, Any]) -> float:
    # Prefer "weight" (IMPACTS), fallback to "confidence" (MENTIONS).
    if "weight" in attrs and attrs["weight"] is not None:
        try:
            return float(attrs["weight"])
        except (TypeError, ValueError):
            return 0.0
    if "confidence" in attrs and attrs["confidence"] is not None:
        try:
            return float(attrs["confidence"])
        except (TypeError, ValueError):
            return 0.0
    return 1.0


def _best_edge_weight(store: GraphStore, src: str, dst: str) -> float:
    best = 0.0
    # MultiDiGraph stores a dict of edges keyed by edge key
    edges = store.graph.get_edge_data(src, dst, default={}) or {}
    for _, attrs in edges.items():
        if isinstance(attrs, dict):
            best = max(best, _edge_weight(attrs))
    return best or 1.0


def path_contributions(store: GraphStore, initiative_id: str, days: int = 90) -> list[dict[str, Any]]:
    """Return per-signal contributions into an initiative risk score."""
    init = store.get_node(initiative_id)
    if not init:
        return []

    now = datetime.now(timezone.utc)
    contributions: dict[str, float] = {}
    sources: dict[str, str] = {}

    for sig_id in store.signals_in_window(days=days):
        sig_node = store.get_node(sig_id) or {}
        src_type = sig_node.get("source_type") or "news"
        authority = SOURCE_AUTHORITY.get(str(src_type), 0.6)
        published_at = _parse_dt(sig_node.get("published_at"))
        age_days = (now - published_at).total_seconds() / 86400.0 if published_at else 30.0
        recency = math.exp(-age_days / 30.0)
        sig_weight = float(sig_node.get("weight") or 1.0)

        paths = store.paths(sig_id, initiative_id, max_len=3)
        if not paths:
            continue

        best_path = 0.0
        for path in paths:
            # multiply edge weights along the path
            w = 1.0
            for a, b in zip(path, path[1:]):
                w *= _best_edge_weight(store, a, b)
            best_path = max(best_path, w)

        score = sig_weight * authority * recency * best_path
        contributions[sig_id] = contributions.get(sig_id, 0.0) + score
        sources[sig_id] = str(src_type)

    rows = [{"signal_id": k, "source_type": sources.get(k, "news"), "score": v} for k, v in contributions.items()]
    rows.sort(key=lambda r: float(r["score"]), reverse=True)
    return rows


def compute_initiative_risk(store: GraphStore, initiative_id: str) -> float:
    """Compute and persist the initiative risk score (0–10)."""
    node = store.get_node(initiative_id)
    if node is None:
        return 0.0

    prior = float(node.get("current_risk_score", 0.0))
    contribs = path_contributions(store, initiative_id, days=90)
    total = sum(float(r["score"]) for r in contribs)

    # Normalize into 0–10 with a soft saturation curve.
    # Tuned for a small demo graph (keeps scores in a readable range).
    scaled = 10.0 * (1.0 - math.exp(-total / 1.25))
    scaled = max(0.0, min(10.0, scaled))

    store.update_initiative_risk(initiative_id, scaled)
    return round(scaled, 2)


def bulk_recompute(store: GraphStore) -> dict[str, Any]:
    """Recompute all initiatives; optionally trigger recommendations."""
    updated: list[str] = []
    recommendations_generated: list[str] = []

    for node_id, attrs in list(store.graph.nodes(data=True)):
        if attrs.get("type") != NodeType.INITIATIVE.value:
            continue
        prior = float(attrs.get("current_risk_score", 0.0))
        new_score = compute_initiative_risk(store, node_id)
        updated.append(node_id)

        delta = new_score - prior
        if abs(delta) > 1.5:
            try:
                rec = generate_recommendation(node_id, delta, store)
                if rec:
                    recommendations_generated.append(rec.id)
            except Exception:
                # deterministic demo must continue
                pass

    return {"initiatives_updated": updated, "recommendations_generated": recommendations_generated}
