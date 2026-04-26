from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter, HTTPException

from graph_store import EdgeType, get_store

router = APIRouter()


class SimulationRequest(BaseModel):
    toggles: list[str] = []


def _top_competitor(initiative_id: str) -> dict | None:
    store = get_store()
    candidates = []
    for item in store.neighbors(initiative_id, EdgeType.THREATENS, direction="in"):
        node = store.get_node(item["id"])
        if node:
            candidates.append(
                {
                    "id": item["id"],
                    "name": node.get("name"),
                    "exposure_score": item["attrs"].get("exposure_score", 0),
                }
            )
    return max(candidates, key=lambda row: row["exposure_score"]) if candidates else None


@router.get("/initiatives")
def list_initiatives() -> list[dict]:
    initiatives = []
    for initiative in get_store().list_initiatives():
        initiatives.append({**initiative.model_dump(mode="json"), "top_competitor": _top_competitor(initiative.id)})
    return sorted(initiatives, key=lambda row: row["current_risk_score"], reverse=True)


@router.get("/initiatives/{initiative_id}")
def get_initiative(initiative_id: str) -> dict:
    store = get_store()
    initiative = store.get_initiative(initiative_id)
    if initiative is None:
        raise HTTPException(status_code=404, detail="Initiative not found")
    return {
        **initiative.model_dump(mode="json"),
        "top_competitor": _top_competitor(initiative_id),
        "top_signals": store.top_impact_signals(initiative_id, limit=5),
    }


@router.get("/initiatives/{initiative_id}/trace")
def get_initiative_trace(initiative_id: str) -> dict:
    store = get_store()
    if store.get_initiative(initiative_id) is None:
        raise HTTPException(status_code=404, detail="Initiative not found")
    return store.serialize_subgraph(store.ego_subgraph(initiative_id, k=3))


@router.post("/initiatives/{initiative_id}/simulate")
def simulate_initiative(initiative_id: str, body: SimulationRequest) -> dict:
    store = get_store()
    initiative = store.get_initiative(initiative_id)
    if initiative is None:
        raise HTTPException(status_code=404, detail="Initiative not found")
    deltas = {
        "close_healthcare_ai_gap": -1.2,
        "lose_2_more_deals": 1.0,
        "increase_analyst_engagement": -0.6,
    }
    delta = sum(deltas.get(toggle, 0.0) for toggle in body.toggles)
    projected = max(0.0, min(10.0, initiative.current_risk_score + delta))
    return {"projected_score": round(projected, 2), "delta": round(delta, 2), "explanation": "Deterministic demo deltas applied to current risk score."}

