from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException

from graph_store import EdgeType, NodeType, get_store

router = APIRouter()


@router.get("/signals")
def list_signals(
    source_type: Optional[str] = None,
    days: int = 30,
    q: Optional[str] = None,
) -> list[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    rows = []
    for signal in get_store().list_signals():
        if source_type and signal.source_type.value != source_type:
            continue
        if signal.published_at < cutoff:
            continue
        if q and q.lower() not in f"{signal.title} {signal.content}".lower():
            continue
        competitor_ids = []
        initiative_ids = []
        for entity in signal.extracted_entities:
            if entity.resolved_id and entity.resolved_id.startswith("comp-"):
                competitor_ids.append(entity.resolved_id)
        for item in get_store().neighbors(signal.id, EdgeType.IMPACTS):
            initiative_ids.append(item["id"])
        rows.append(
            {
                "id": signal.id,
                "source_type": signal.source_type.value,
                "source_name": signal.source_name,
                "title": signal.title,
                "published_at": signal.published_at.isoformat(),
                "competitor_ids": sorted(set(competitor_ids)),
                "initiative_ids": sorted(set(initiative_ids)),
            }
        )
    return rows


@router.get("/signals/{signal_id}")
def get_signal(signal_id: str) -> dict:
    signal = get_store().get_signal(signal_id)
    if signal is None:
        raise HTTPException(status_code=404, detail="Signal not found")
    return signal.model_dump(mode="json")


@router.get("/signals/{signal_id}/propagation")
def get_signal_propagation(signal_id: str) -> dict:
    store = get_store()
    signal = store.get_signal(signal_id)
    if signal is None:
        raise HTTPException(status_code=404, detail="Signal not found")
    downstream = []
    for item in store.neighbors(signal_id):
        node = store.get_node(item["id"])
        if not node:
            continue
        delta = item["attrs"].get("weight") or item["attrs"].get("confidence") or 0
        downstream.append(
            {
                "node_id": item["id"],
                "node_type": node.get("type", NodeType.SIGNAL.value),
                "node_label": node.get("name") or node.get("title") or item["id"],
                "delta": float(delta) if isinstance(delta, (int, float)) else 0.0,
                "edge_type": item["edge_type"],
            }
        )
    return {"signal": {"id": signal.id, "title": signal.title}, "downstream": downstream}

