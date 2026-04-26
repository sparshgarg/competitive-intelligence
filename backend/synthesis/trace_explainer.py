"""Plain-language explanation of a graph trace (Phase 2)."""
from __future__ import annotations

import json

from ai_client import ai_chat, ai_enabled
from graph_store import GraphStore


def _trace_nodes(node_ids: list[str], store: GraphStore) -> list[dict]:
    out = []
    for nid in node_ids:
        node = store.get_node(nid)
        if not node:
            continue
        out.append({"id": nid, "type": node.get("type"), "label": node.get("name") or node.get("title") or node.get("headline") or nid})
    return out


def explain_trace(node_ids: list[str], store: GraphStore) -> dict:
    nodes = _trace_nodes(node_ids, store)
    if not ai_enabled():
        if not nodes:
            return {"explanation": "No trace nodes found.", "nodes": []}
        labels = " → ".join(n["label"] for n in nodes[:6])
        return {"explanation": f"This recommendation traces through the graph via: {labels}. Each hop is backed by an ingested signal.", "nodes": nodes}

    prompt = (
        "Explain in 2 sentences how these graph nodes connect and why they matter to the strategic decision.\n\n"
        f"NODES: {json.dumps(nodes)}"
    )
    try:
        text = ai_chat(prompt, max_tokens=160, temperature=0.2, json_mode=False)
        return {"explanation": text.strip(), "nodes": nodes}
    except Exception:
        labels = " → ".join(n["label"] for n in nodes[:6])
        return {"explanation": f"This recommendation traces through the graph via: {labels}.", "nodes": nodes}
