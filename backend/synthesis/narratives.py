"""Strategic trajectory paragraphs (Phase 2)."""
from __future__ import annotations

import json
from datetime import datetime, timezone

from ai_client import ai_cache_namespace, ai_chat, ai_enabled
from graph_store import EdgeType, GraphStore


def _evidence_signals(store: GraphStore, competitor_id: str, limit: int = 6) -> list[str]:
    ids = []
    for src, _, data in store.graph.in_edges(competitor_id, data=True):
        if data.get("edge_type") == EdgeType.MENTIONS.value:
            ids.append(src)
    # prefer most recent by node attribute
    def key(sig_id: str) -> float:
        node = store.get_node(sig_id) or {}
        pub = node.get("published_at")
        try:
            return datetime.fromisoformat(str(pub)).timestamp() if pub else 0.0
        except ValueError:
            return 0.0

    ids = sorted(set(ids), key=key, reverse=True)
    return ids[:limit]


def _serialize_competitor_context(store: GraphStore, competitor_id: str) -> str:
    sg = store.ego_subgraph(competitor_id, k=3)
    payload = store.serialize_subgraph(sg)
    return json.dumps(payload, ensure_ascii=False)[:8000]


def _fallback_narrative(store: GraphStore, competitor_id: str) -> dict:
    comp = store.get_competitor(competitor_id)
    if not comp:
        return {"narrative": "No competitor found.", "citations": []}
    sigs = _evidence_signals(store, competitor_id, limit=4)
    narrative = (
        f"{comp.name} is showing elevated momentum in {comp.segment}, driven by repeated signals tied to key capabilities. "
        f"Recent evidence suggests their positioning is pressuring portfolio initiatives where those capabilities are required."
    )
    return {"narrative": narrative, "citations": sigs}


def competitor_narrative(competitor_id: str, store: GraphStore) -> dict:
    cache_key = f"narr:{ai_cache_namespace()}:{competitor_id}:{store.latest_signal_ingested_at()}"
    cached = store.kv_get(cache_key)
    if cached:
        try:
            return json.loads(cached)
        except Exception:
            pass

    if not ai_enabled():
        payload = _fallback_narrative(store, competitor_id)
        store.kv_set(cache_key, json.dumps(payload))
        return payload

    context = _serialize_competitor_context(store, competitor_id)
    evidence = _evidence_signals(store, competitor_id, limit=6)
    prompt = (
        "You are a strategic analyst. In 3–4 sentences, describe this competitor's strategic trajectory based on the evidence below.\n"
        "Be specific about capability direction and portfolio threat.\n\n"
        f"EVIDENCE_SIGNAL_IDS: {evidence}\n"
        f"SUBGRAPH_JSON: {context}\n"
        "\nReturn JSON: {\"narrative\": string, \"citations\": [signal_id,...]}"
    )
    try:
        text = ai_chat(prompt, max_tokens=400, temperature=0.2, json_mode=True)
        payload = json.loads(text or "{}")
        out = {
            "narrative": str(payload.get("narrative") or ""),
            "citations": [c for c in (payload.get("citations") or []) if isinstance(c, str)],
        }
    except Exception:
        out = _fallback_narrative(store, competitor_id)

    store.kv_set(cache_key, json.dumps(out))
    return out
