from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from graph_store import get_store
from models import RecommendationStatus

router = APIRouter()


class RecommendationAction(BaseModel):
    action: str


def _recommendation_payload(recommendation) -> dict:
    store = get_store()
    initiative = store.get_initiative(recommendation.affected_initiative_id)
    subgraph = store.serialize_subgraph(store.ego_subgraph(recommendation.id, k=2))
    return {**recommendation.model_dump(mode="json"), "initiative_name": initiative.name if initiative else None, "subgraph": subgraph}


@router.get("/recommendations")
def list_recommendations(
    status: str = "all",
    limit: Optional[int] = None,
    initiative_id: Optional[str] = None,
) -> list[dict]:
    parsed_status = None if status == "all" else RecommendationStatus(status)
    rows = [rec for rec in get_store().list_recommendations(parsed_status) if initiative_id is None or rec.affected_initiative_id == initiative_id]
    rows = sorted(rows, key=lambda rec: rec.generated_at, reverse=True)
    if limit is not None:
        rows = rows[:limit]
    return [_recommendation_payload(rec) for rec in rows]


@router.post("/recommendations/{recommendation_id}/action")
def update_recommendation(recommendation_id: str, body: RecommendationAction) -> dict:
    if body.action not in {"accept", "defer"}:
        raise HTTPException(status_code=400, detail="Action must be accept or defer")
    status = RecommendationStatus.ACCEPTED if body.action == "accept" else RecommendationStatus.DEFERRED
    updated = get_store().update_recommendation_status(recommendation_id, status)
    if updated is None:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return _recommendation_payload(updated)

