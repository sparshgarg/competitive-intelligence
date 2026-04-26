"""Portfolio recommendations from subgraphs (Phase 2)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from ai_client import ai_chat, ai_enabled
from graph_store import GraphStore
from models import Recommendation, RecommendationStatus, utcnow


def _fallback_payload(initiative_id: str, delta: float, store: GraphStore) -> Recommendation:
    now = utcnow()
    headline = "Rebalance roadmap to reduce near-term exposure"
    why = "Risk moved materially this week based on recent signals; validate assumptions and adjust the plan."
    reasoning = [initiative_id]
    return Recommendation(
        id=f"rec-{initiative_id}-{int(now.timestamp())}",
        headline=headline,
        why_now=why,
        confidence=0.72,
        status=RecommendationStatus.PENDING,
        reasoning_path=reasoning,
        affected_initiative_id=initiative_id,
        generated_at=now,
    )


def _ai_payload(initiative_id: str, delta: float, store: GraphStore) -> Recommendation:
    sg = store.serialize_subgraph(store.ego_subgraph(initiative_id, k=3))
    prompt = (
        "You are a strategic advisor to a CSO.\n"
        f"Given this competitive subgraph and a risk score change of {delta:.2f}, "
        "write a one-line headline recommendation, a one-sentence why-now, "
        "and identify the 3–5 graph node IDs that constitute your reasoning path.\n\n"
        f"SUBGRAPH_JSON: {json.dumps(sg)[:12000]}\n\n"
        "Return JSON: {\"headline\": string, \"why_now\": string, \"confidence\": number, \"reasoning_path\": [node_id,...]}"
    )
    text = ai_chat(prompt, max_tokens=450, temperature=0.2, json_mode=True)
    payload = json.loads(text or "{}")
    now = utcnow()
    reasoning = [x for x in (payload.get("reasoning_path") or []) if isinstance(x, str)]
    reasoning = [x for x in reasoning if x in store.graph][:5]
    return Recommendation(
        id=f"rec-{initiative_id}-{int(now.timestamp())}",
        headline=str(payload.get("headline") or "").strip() or "Rebalance roadmap to reduce near-term exposure",
        why_now=str(payload.get("why_now") or "").strip() or "Risk moved materially this week based on recent signals.",
        confidence=float(payload.get("confidence") or 0.75),
        status=RecommendationStatus.PENDING,
        reasoning_path=reasoning or [initiative_id],
        affected_initiative_id=initiative_id,
        generated_at=now,
    )


def generate_recommendation(initiative_id: str, delta: float, store: GraphStore) -> Recommendation | None:
    # avoid duplicates in last 7 days
    now = datetime.now(timezone.utc)
    for rec in store.list_recommendations():
        if rec.affected_initiative_id != initiative_id:
            continue
        if (now - rec.generated_at).days <= 7:
            return None

    if not ai_enabled():
        rec = _fallback_payload(initiative_id, delta, store)
        store.add_recommendation(rec)
        return rec

    try:
        rec = _ai_payload(initiative_id, delta, store)
    except Exception:
        rec = _fallback_payload(initiative_id, delta, store)

    store.add_recommendation(rec)
    return rec
