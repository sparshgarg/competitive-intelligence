"""Provider-backed entity extraction with deterministic fallback."""
from __future__ import annotations

import hashlib
import json
from typing import Any

from thefuzz import fuzz

from ai_client import ai_cache_namespace, ai_chat, ai_enabled
from graph_store import GraphStore
from models import EntityType, ExtractedEntity, NodeType, Signal


def _entity_index(store: GraphStore) -> list[tuple[str, str, str]]:
    rows: list[tuple[str, str, str]] = []
    for node_id, attrs in store.graph.nodes(data=True):
        t = attrs.get("type")
        if t not in (NodeType.COMPETITOR.value, NodeType.CAPABILITY.value):
            continue
        name = (attrs.get("name") or "").strip()
        if name:
            rows.append((node_id, name, t))
    return rows


def _resolve(value: str, entity_type: EntityType, index: list[tuple[str, str, str]]) -> str | None:
    target = value.strip().lower()
    if not target:
        return None
    want_type = NodeType.COMPETITOR.value if entity_type == EntityType.COMPETITOR else NodeType.CAPABILITY.value
    best = (0, None)
    for node_id, name, t in index:
        if t != want_type:
            continue
        score = fuzz.ratio(target, name.lower())
        if score > best[0]:
            best = (score, node_id)
    return best[1] if best[0] >= 85 else None


def _fallback_extract(signal: Signal, store: GraphStore) -> list[ExtractedEntity]:
    # deterministic: match known competitor/capability node names by substring
    content = f"{signal.title}\n{signal.content}".lower()
    out: list[ExtractedEntity] = []
    for node_id, name, t in _entity_index(store):
        if name.lower() in content:
            out.append(
                ExtractedEntity(
                    type=EntityType.COMPETITOR if t == NodeType.COMPETITOR.value else EntityType.CAPABILITY,
                    value=name,
                    confidence=0.75,
                    resolved_id=node_id,
                )
            )
    return out[:12]


def _ai_extract(signal: Signal, store: GraphStore) -> list[ExtractedEntity]:
    prompt = (
        "Extract entities from this market signal.\n\n"
        "Return JSON: {\"entities\": [{\"type\": \"competitor\"|\"capability\"|\"dollar_amount\"|\"date\"|\"deal_outcome\"|\"rating_change\","
        " \"value\": string, \"confidence\": number}]}\n\n"
        f"TITLE: {signal.title}\n"
        f"CONTENT: {signal.content}\n"
    )
    text = ai_chat(prompt, max_tokens=800, temperature=0.0, json_mode=True)
    data = json.loads(text or "{}")
    entities = data.get("entities") or []
    index = _entity_index(store)
    out: list[ExtractedEntity] = []
    for raw in entities:
        try:
            ent = ExtractedEntity.model_validate(raw)
        except Exception:
            continue
        if ent.type in (EntityType.COMPETITOR, EntityType.CAPABILITY):
            ent.resolved_id = _resolve(ent.value, ent.type, index)
        out.append(ent)
    return out


def extract_entities(signal: Signal, store: GraphStore) -> list[ExtractedEntity]:
    cache_key = f"extract:{ai_cache_namespace()}:{signal.id}"
    cached = store.kv_get(cache_key)
    if cached:
        try:
            payload = json.loads(cached)
            return [ExtractedEntity.model_validate(item) for item in payload]
        except Exception:
            pass

    if not ai_enabled():
        return _fallback_extract(signal, store)

    try:
        ents = _ai_extract(signal, store)
    except Exception:
        ents = _fallback_extract(signal, store)

    store.kv_set(cache_key, json.dumps([e.model_dump(mode="json") for e in ents]))
    return ents
