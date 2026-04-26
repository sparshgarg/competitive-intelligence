from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from graph_store import get_store
from models import NodeType

router = APIRouter()


@router.get("/network")
def get_network() -> dict:
    store = get_store()
    payload = store.serialize_subgraph()
    return {
        **payload,
        "stats": {**store.summary(), "last_signal_ingested_at": store.latest_signal_ingested_at()},
    }


def _compose_ego(node_ids: list[str], k: int = 2):
    store = get_store()
    nodes: set[str] = set()
    for node_id in node_ids:
        if node_id in store.graph:
            nodes.update(store.ego_subgraph(node_id, k=k).nodes())
    return store.graph.subgraph(nodes).copy()


def _node_label(node_id: str) -> str:
    node = get_store().get_node(node_id) or {}
    return str(node.get("name") or node.get("title") or node.get("headline") or node_id)


def _connection_summary(node_id: str) -> dict:
    store = get_store()
    node = store.get_node(node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    grouped: dict[str, list[dict]] = {}
    for item in store.neighbors(node_id, direction="both"):
        edge_type = item["edge_type"]
        grouped.setdefault(edge_type, []).append(
            {
                "id": item["id"],
                "label": _node_label(item["id"]),
                "type": (store.get_node(item["id"]) or {}).get("type"),
                "attrs": item["attrs"],
            }
        )
    return {
        "id": node_id,
        "label": _node_label(node_id),
        "type": node.get("type"),
        "connections": grouped,
    }


@router.get("/network/competitor-map")
def get_competitor_map(k: int = Query(default=2, ge=1, le=3)) -> dict:
    """Initial network: 2-hop neighborhoods around every competitor."""
    store = get_store()
    competitor_ids = [node_id for node_id, attrs in store.graph.nodes(data=True) if attrs.get("type") == NodeType.COMPETITOR.value]
    graph = _compose_ego(competitor_ids, k=k)
    payload = store.serialize_subgraph(graph)
    return {
        **payload,
        "stats": {**store.summary(), "visible_nodes": len(payload["nodes"]), "visible_edges": len(payload["edges"])},
        "agent_steps": [
            f"Started from {len(competitor_ids)} competitor nodes.",
            f"Expanded each competitor to {k} relational hops.",
            "Included signals, capabilities, initiatives, and recommendation traces connected through graph edges.",
        ],
    }


@router.get("/network/expand/{node_id}")
def expand_node(node_id: str, k: int = Query(default=2, ge=1, le=3)) -> dict:
    store = get_store()
    if node_id not in store.graph:
        raise HTTPException(status_code=404, detail="Node not found")
    graph = store.ego_subgraph(node_id, k=k)
    payload = store.serialize_subgraph(graph)
    return {
        **payload,
        "focus": _connection_summary(node_id),
        "agent_steps": [
            f"Focused on {_node_label(node_id)}.",
            f"Expanded {k} hops around the selected node.",
            "Pulled adjacent evidence so the CSO can inspect upstream signals and downstream initiative impact.",
        ],
    }


@router.get("/network/search")
def agentic_search(q: str = Query(min_length=1), k: int = Query(default=2, ge=1, le=3), limit: int = Query(default=4, ge=1, le=8)) -> dict:
    """Graph-native 'agentic' search: find matching nodes, expand neighborhoods, explain steps."""
    store = get_store()
    query = q.strip().lower()
    scored = []
    for node_id, attrs in store.graph.nodes(data=True):
        label = _node_label(node_id)
        haystack = f"{node_id} {label} {attrs.get('type','')} {attrs.get('source_name','')}".lower()
        if query in haystack:
            score = 1.0 if query in label.lower() else 0.75
            scored.append((score, node_id, label, attrs.get("type")))

    # If no direct label match, fallback to high-risk initiatives / high-momentum competitors for broad strategic terms.
    if not scored and any(term in query for term in ["risk", "urgent", "threat", "pressure", "competitor"]):
        for node_id, attrs in store.graph.nodes(data=True):
            if attrs.get("type") in {NodeType.INITIATIVE.value, NodeType.COMPETITOR.value}:
                scored.append((0.4, node_id, _node_label(node_id), attrs.get("type")))

    scored = sorted(scored, key=lambda row: row[0], reverse=True)[:limit]
    hit_ids = [row[1] for row in scored]
    graph = _compose_ego(hit_ids, k=k)
    payload = store.serialize_subgraph(graph)
    return {
        **payload,
        "hits": [{"id": node_id, "label": label, "type": node_type, "score": score} for score, node_id, label, node_type in scored],
        "agent_steps": [
            f"Interpreted query: '{q}'.",
            f"Matched {len(hit_ids)} graph node(s) using labels, ids, source names, and node types.",
            f"Expanded top matches to {k} hops to reveal related signals, capabilities, competitors, and initiatives.",
        ],
    }

