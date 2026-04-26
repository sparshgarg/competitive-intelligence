from __future__ import annotations

import csv
from pathlib import Path

from fastapi import APIRouter, HTTPException

from graph_store import EdgeType, get_store
from synthesis.narratives import competitor_narrative

router = APIRouter()
DATA = Path(__file__).resolve().parents[1] / "data"


def _crm_stats(competitor_name: str) -> dict:
    total = 0
    wins = 0
    with (DATA / "crm_winloss.csv").open() as f:
        for row in csv.DictReader(f):
            if row.get("primary_competitor") != competitor_name:
                continue
            total += 1
            if row.get("outcome") == "win":
                wins += 1
    return {"deals_encountered": total, "win_rate": round(wins / total, 3) if total else 0.0}


@router.get("/competitors")
def list_competitors() -> list[dict]:
    return [c.model_dump(mode="json") for c in get_store().list_competitors()]


@router.get("/competitors/{competitor_id}")
def get_competitor(competitor_id: str) -> dict:
    store = get_store()
    competitor = store.get_competitor(competitor_id)
    if competitor is None:
        raise HTTPException(status_code=404, detail="Competitor not found")
    threatened = [{"initiative_id": item["id"], **item["attrs"]} for item in store.neighbors(competitor_id, EdgeType.THREATENS)]
    return {**competitor.model_dump(mode="json"), **_crm_stats(competitor.name), "threatened_initiatives": threatened}


@router.get("/competitors/{competitor_id}/narrative")
def get_competitor_narrative(competitor_id: str) -> dict:
    if get_store().get_competitor(competitor_id) is None:
        raise HTTPException(status_code=404, detail="Competitor not found")
    return competitor_narrative(competitor_id, get_store())

