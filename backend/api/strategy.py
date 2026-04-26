"""Scenarios + Strategy War Room API."""
from __future__ import annotations

import json
import os
from pathlib import Path

from fastapi import APIRouter

from ai_client import ai_chat, ai_enabled
from graph_store import get_store

router = APIRouter(tags=["strategy"])

SCENARIOS_FILE = Path(__file__).resolve().parent.parent / "data" / "seed_scenarios.json"


@router.get("/scenarios")
def list_scenarios() -> list[dict]:
    """Return all strategic scenarios with response playbooks."""
    if SCENARIOS_FILE.is_file():
        return json.loads(SCENARIOS_FILE.read_text())
    return []


@router.post("/strategy/brief")
def generate_brief(body: dict) -> dict:
    """Generate an AI strategic brief based on current scenario parameters."""
    store = get_store()

    # Get initiatives for context
    initiatives = []
    for node_id, attrs in store.graph.nodes(data=True):
        if attrs.get("type") == "initiative":
            initiatives.append({
                "name": attrs.get("name", ""),
                "budget": attrs.get("budget", 0),
                "risk_score": attrs.get("current_risk_score", 0),
                "risk_rationale": attrs.get("risk_rationale", ""),
                "price_sensitivity": attrs.get("price_sensitivity", 0.5),
                "tariff_dampening": attrs.get("tariff_dampening", 0.3),
                "demand_elasticity": attrs.get("demand_elasticity", 0.4),
                "compliance_urgency": attrs.get("compliance_urgency", 0.2),
            })

    # Extract slider values
    sliders = body.get("sliders", {})
    scenario_name = body.get("scenario_name", "Custom scenario")

    prompt = f"""You are a Chief Strategy Officer's AI advisor for Škoda Auto (VW Group).

CURRENT SCENARIO: "{scenario_name}"

SLIDER PARAMETERS:
- BYD EU price cut: {sliders.get('byd_price_cut', 0)}%
- EU tariff on Chinese EVs: {sliders.get('eu_tariff', 0)}%
- EV demand growth YoY: {sliders.get('ev_demand_growth', 0)}%
- Regulatory acceleration: {sliders.get('regulatory_pull', 0)} months forward
- VW Group platform sharing: {sliders.get('vw_platform_sharing', 50)}%

PORTFOLIO INITIATIVES:
{json.dumps(initiatives, indent=2)}

Write a concise 3-paragraph executive strategic brief (max 200 words total):
1. SITUATION: What this scenario means for Škoda in plain language
2. EXPOSURE: Which initiatives are most/least affected and why (reference $ amounts)
3. RECOMMENDED PRIORITY: Rank the top 3 actions the CSO should take THIS QUARTER

Be specific, quantitative, and actionable. No jargon. Write for a busy executive."""

    if not ai_enabled():
        # Deterministic fallback when no AI provider is configured
        top_init = max(initiatives, key=lambda i: i["risk_score"]) if initiatives else None
        top_name = top_init["name"] if top_init else "your top initiative"
        total_exposure = sum(
            i["budget"] * i["price_sensitivity"] * (sliders.get("byd_price_cut", 0) / 100)
            for i in initiatives
        )
        return {
            "brief": (
                f"**Situation:** Under the \"{scenario_name}\" scenario with a {sliders.get('byd_price_cut', 0)}% BYD price cut "
                f"and {sliders.get('eu_tariff', 0)}% EU tariff, competitive pressure is "
                f"{'elevated' if sliders.get('byd_price_cut', 0) > 10 else 'moderate'}. "
                f"EV demand growth at {sliders.get('ev_demand_growth', 0)}% shapes the total addressable market.\n\n"
                f"**Exposure:** {top_name} faces the highest risk (score: {top_init['risk_score'] if top_init else 'N/A'}). "
                f"Estimated incremental exposure from price pressure: ${total_exposure/1_000_000:.1f}M. "
                f"Regulation-sensitive initiatives {'accelerate in urgency' if sliders.get('regulatory_pull', 0) > 6 else 'remain on current timelines'}.\n\n"
                f"**Priority:** (1) Review and stress-test the most exposed initiative's budget allocation, "
                f"(2) Evaluate partnership opportunities to offset capability gaps, "
                f"(3) Update the board on revised exposure estimates for the next earnings cycle."
            ),
            "provider": "fallback"
        }

    try:
        brief = ai_chat(prompt, max_tokens=500, temperature=0.3)
        return {"brief": brief, "provider": "ai"}
    except Exception as e:
        return {"brief": f"AI generation failed: {str(e)}. Please check your API key configuration.", "provider": "error"}
