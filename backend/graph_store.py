"""GraphStore — NetworkX MultiDiGraph fronted by SQLAlchemy persistence.

All entity reads/writes go through this class. The API layer never talks
to NetworkX or SQLAlchemy directly. The graph is the runtime store; SQLite
is the durable record (one row per entity, one row per edge, plus a
serialized snapshot blob for fast cold start).
"""
from __future__ import annotations

import json
import os
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable, Optional

import networkx as nx
from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import declarative_base, Session

from models import (
    Capability,
    Competitor,
    EdgeType,
    Initiative,
    NodeType,
    Recommendation,
    RecommendationStatus,
    Signal,
)

Base = declarative_base()


# ---------- SQLAlchemy schema --------------------------------------------

class CompetitorRow(Base):
    __tablename__ = "competitors"
    id = Column(String, primary_key=True)
    payload = Column(Text, nullable=False)  # full JSON for now; columns later if needed
    last_updated = Column(DateTime, nullable=False)


class CapabilityRow(Base):
    __tablename__ = "capabilities"
    id = Column(String, primary_key=True)
    payload = Column(Text, nullable=False)


class InitiativeRow(Base):
    __tablename__ = "initiatives"
    id = Column(String, primary_key=True)
    payload = Column(Text, nullable=False)
    current_risk_score = Column(Float, nullable=False)


class SignalRow(Base):
    __tablename__ = "signals"
    id = Column(String, primary_key=True)
    source_type = Column(String, nullable=False, index=True)
    payload = Column(Text, nullable=False)
    published_at = Column(DateTime, nullable=False, index=True)


class RecommendationRow(Base):
    __tablename__ = "recommendations"
    id = Column(String, primary_key=True)
    payload = Column(Text, nullable=False)
    affected_initiative_id = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False, index=True)


class EdgeRow(Base):
    __tablename__ = "edges"
    rowid = Column(Integer, primary_key=True, autoincrement=True)
    src_id = Column(String, nullable=False, index=True)
    dst_id = Column(String, nullable=False, index=True)
    edge_type = Column(String, nullable=False, index=True)
    attrs_json = Column(Text, nullable=False, default="{}")


class KVRow(Base):
    __tablename__ = "kv_store"
    key = Column(String, primary_key=True)
    value = Column(Text, nullable=False)


# ---------- JSON helpers --------------------------------------------------

def _to_iso(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def _dump(obj: Any) -> str:
    if hasattr(obj, "model_dump"):
        return json.dumps(obj.model_dump(mode="json"), default=_to_iso)
    return json.dumps(obj, default=_to_iso)

def _load(payload: str, model: Any) -> Any:
    return model.model_validate_json(payload)


# ---------- GraphStore ----------------------------------------------------

class GraphStore:
    """In-memory graph + SQLite persistence."""

    def __init__(self, database_url: str):
        self.database_url = database_url
        self._engine = create_engine(database_url, future=True)
        self.graph: nx.MultiDiGraph = nx.MultiDiGraph()

    # ---------- lifecycle ------------------------------------------------

    def init_schema(self, drop_first: bool = False) -> None:
        if drop_first:
            Base.metadata.drop_all(self._engine)
        Base.metadata.create_all(self._engine)

    def reset(self) -> None:
        """Drop all rows and reset the in-memory graph. Idempotent."""
        self.graph = nx.MultiDiGraph()
        Base.metadata.drop_all(self._engine)
        Base.metadata.create_all(self._engine)

    # ---------- entity upserts ------------------------------------------

    def add_capability(self, c: Capability) -> None:
        self.graph.add_node(
            c.id,
            type=NodeType.CAPABILITY.value,
            name=c.name,
            category=c.category.value,
        )
        with Session(self._engine) as s:
            s.merge(CapabilityRow(id=c.id, payload=_dump(c)))
            s.commit()

    def add_competitor(self, c: Competitor) -> None:
        self.graph.add_node(
            c.id,
            type=NodeType.COMPETITOR.value,
            name=c.name,
            segment=c.segment,
            momentum_score=c.momentum_score,
            threat_level=c.threat_level.value,
        )
        with Session(self._engine) as s:
            s.merge(CompetitorRow(id=c.id, payload=_dump(c), last_updated=c.last_updated))
            s.commit()
        # HAS_CAPABILITY edges
        for cs in c.capabilities:
            self.link(
                c.id,
                EdgeType.HAS_CAPABILITY,
                cs.capability_id,
                strength=cs.strength,
                trend=cs.trend.value,
            )

    def add_initiative(self, i: Initiative) -> None:
        self.graph.add_node(
            i.id,
            type=NodeType.INITIATIVE.value,
            name=i.name,
            owner_name=i.owner_name,
            current_risk_score=i.current_risk_score,
            status=i.status.value,
        )
        with Session(self._engine) as s:
            s.merge(InitiativeRow(id=i.id, payload=_dump(i), current_risk_score=i.current_risk_score))
            s.commit()
        for rc in i.required_capabilities:
            self.link(i.id, EdgeType.REQUIRES, rc.capability_id, priority=rc.priority.value)

    def add_signal(self, sig: Signal) -> None:
        self.graph.add_node(
            sig.id,
            type=NodeType.SIGNAL.value,
            source_type=sig.source_type.value,
            source_name=sig.source_name,
            title=sig.title,
            published_at=sig.published_at.isoformat(),
            weight=sig.weight,
        )
        with Session(self._engine) as s:
            s.merge(
                SignalRow(
                    id=sig.id,
                    source_type=sig.source_type.value,
                    payload=_dump(sig),
                    published_at=sig.published_at,
                )
            )
            s.commit()
        # MENTIONS edges from extracted_entities that resolved to a graph node
        for ent in sig.extracted_entities:
            if ent.resolved_id and ent.resolved_id in self.graph:
                self.link(
                    sig.id,
                    EdgeType.MENTIONS,
                    ent.resolved_id,
                    confidence=ent.confidence,
                    entity_type=ent.type.value,
                )

    def add_recommendation(self, r: Recommendation) -> None:
        self.graph.add_node(
            r.id,
            type=NodeType.RECOMMENDATION.value,
            headline=r.headline,
            confidence=r.confidence,
            status=r.status.value,
            generated_at=r.generated_at.isoformat(),
        )
        with Session(self._engine) as s:
            s.merge(
                RecommendationRow(
                    id=r.id,
                    payload=_dump(r),
                    affected_initiative_id=r.affected_initiative_id,
                    status=r.status.value,
                )
            )
            s.commit()
        for node_id in r.reasoning_path:
            if node_id in self.graph:
                self.link(r.id, EdgeType.TRACES_TO, node_id)

    def update_initiative_risk(self, initiative_id: str, score: float) -> None:
        initiative = self.get_initiative(initiative_id)
        if initiative is None:
            return
        updated = initiative.model_copy(update={"current_risk_score": round(score, 2)})
        if initiative_id in self.graph:
            self.graph.nodes[initiative_id]["current_risk_score"] = updated.current_risk_score
        with Session(self._engine) as s:
            s.merge(
                InitiativeRow(
                    id=updated.id,
                    payload=_dump(updated),
                    current_risk_score=updated.current_risk_score,
                )
            )
            s.commit()

    def update_recommendation_status(
        self, recommendation_id: str, status: RecommendationStatus
    ) -> Optional[Recommendation]:
        recommendation = self.get_recommendation(recommendation_id)
        if recommendation is None:
            return None
        updated = recommendation.model_copy(update={"status": status})
        if recommendation_id in self.graph:
            self.graph.nodes[recommendation_id]["status"] = updated.status.value
        with Session(self._engine) as s:
            s.merge(
                RecommendationRow(
                    id=updated.id,
                    payload=_dump(updated),
                    affected_initiative_id=updated.affected_initiative_id,
                    status=updated.status.value,
                )
            )
            s.commit()
        return updated

    # ---------- edges ----------------------------------------------------

    def link(self, src_id: str, edge_type: EdgeType, dst_id: str, **attrs: Any) -> None:
        if src_id not in self.graph or dst_id not in self.graph:
            # Skip silently — caller is responsible for ordering.
            return
        et = edge_type.value if isinstance(edge_type, EdgeType) else str(edge_type)
        self.graph.add_edge(src_id, dst_id, key=et, edge_type=et, **attrs)
        with Session(self._engine) as s:
            s.add(EdgeRow(src_id=src_id, dst_id=dst_id, edge_type=et, attrs_json=json.dumps(attrs)))
            s.commit()

    # ---------- reads ----------------------------------------------------

    def get_node(self, node_id: str) -> Optional[dict[str, Any]]:
        if node_id not in self.graph:
            return None
        return dict(self.graph.nodes[node_id]) | {"id": node_id}

    def get_capability(self, capability_id: str) -> Optional[Capability]:
        with Session(self._engine) as s:
            row = s.get(CapabilityRow, capability_id)
            return _load(row.payload, Capability) if row else None

    def list_capabilities(self) -> list[Capability]:
        with Session(self._engine) as s:
            return [_load(r.payload, Capability) for r in s.query(CapabilityRow).all()]

    def get_competitor(self, competitor_id: str) -> Optional[Competitor]:
        with Session(self._engine) as s:
            row = s.get(CompetitorRow, competitor_id)
            return _load(row.payload, Competitor) if row else None

    def list_competitors(self) -> list[Competitor]:
        with Session(self._engine) as s:
            return [_load(r.payload, Competitor) for r in s.query(CompetitorRow).all()]

    def get_initiative(self, initiative_id: str) -> Optional[Initiative]:
        with Session(self._engine) as s:
            row = s.get(InitiativeRow, initiative_id)
            return _load(row.payload, Initiative) if row else None

    def list_initiatives(self) -> list[Initiative]:
        with Session(self._engine) as s:
            return [_load(r.payload, Initiative) for r in s.query(InitiativeRow).all()]

    def get_signal(self, signal_id: str) -> Optional[Signal]:
        with Session(self._engine) as s:
            row = s.get(SignalRow, signal_id)
            return _load(row.payload, Signal) if row else None

    def list_signals(self) -> list[Signal]:
        with Session(self._engine) as s:
            return [_load(r.payload, Signal) for r in s.query(SignalRow).all()]

    def signal_exists(self, signal_id: str) -> bool:
        with Session(self._engine) as s:
            return s.get(SignalRow, signal_id) is not None

    def get_recommendation(self, recommendation_id: str) -> Optional[Recommendation]:
        with Session(self._engine) as s:
            row = s.get(RecommendationRow, recommendation_id)
            return _load(row.payload, Recommendation) if row else None

    def list_recommendations(
        self, status: Optional[RecommendationStatus] = None
    ) -> list[Recommendation]:
        with Session(self._engine) as s:
            q = s.query(RecommendationRow)
            if status is not None:
                q = q.filter(RecommendationRow.status == status.value)
            return [_load(r.payload, Recommendation) for r in q.all()]

    def kv_get(self, key: str) -> Optional[str]:
        with Session(self._engine) as s:
            row = s.get(KVRow, key)
            return row.value if row else None

    def kv_set(self, key: str, value: str) -> None:
        with Session(self._engine) as s:
            s.merge(KVRow(key=key, value=value))
            s.commit()

    def latest_signal_ingested_at(self) -> Optional[str]:
        with Session(self._engine) as s:
            row = s.query(SignalRow).order_by(SignalRow.published_at.desc()).first()
            return row.published_at.isoformat() if row else None

    def top_impact_signals(self, initiative_id: str, limit: int = 5) -> list[dict[str, Any]]:
        rows: list[dict[str, Any]] = []
        for src, _, data in self.graph.in_edges(initiative_id, data=True):
            if data.get("edge_type") != EdgeType.IMPACTS.value:
                continue
            node = self.get_node(src)
            if node:
                rows.append(
                    {
                        "id": src,
                        "title": node.get("title"),
                        "source_type": node.get("source_type"),
                        "source_name": node.get("source_name"),
                        "published_at": node.get("published_at"),
                        "weight": data.get("weight", 0.0),
                    }
                )
        return sorted(rows, key=lambda r: float(r["weight"]), reverse=True)[:limit]

    def serialize_subgraph(self, graph: Optional[nx.MultiDiGraph] = None) -> dict[str, Any]:
        g = graph or self.graph
        nodes = []
        for node_id, attrs in g.nodes(data=True):
            label = attrs.get("name") or attrs.get("title") or attrs.get("headline") or node_id
            nodes.append({"id": node_id, "label": label, **attrs})
        edges = []
        for src, dst, attrs in g.edges(data=True):
            edges.append({"src": src, "dst": dst, "edge_type": attrs.get("edge_type"), **attrs})
        return {"nodes": nodes, "edges": edges}

    def neighbors(
        self, node_id: str, edge_type: Optional[EdgeType] = None, direction: str = "out"
    ) -> list[dict[str, Any]]:
        if node_id not in self.graph:
            return []
        et = edge_type.value if isinstance(edge_type, EdgeType) else None
        out: list[dict[str, Any]] = []
        if direction in ("out", "both"):
            for _, dst, data in self.graph.out_edges(node_id, data=True):
                if et is None or data.get("edge_type") == et:
                    out.append({"id": dst, "edge_type": data.get("edge_type"), "attrs": data})
        if direction in ("in", "both"):
            for src, _, data in self.graph.in_edges(node_id, data=True):
                if et is None or data.get("edge_type") == et:
                    out.append({"id": src, "edge_type": data.get("edge_type"), "attrs": data})
        return out

    def ego_subgraph(self, node_id: str, k: int = 2) -> nx.MultiDiGraph:
        """k-hop subgraph (undirected reachability)."""
        if node_id not in self.graph:
            return nx.MultiDiGraph()
        undirected = self.graph.to_undirected(as_view=True)
        nodes = nx.ego_graph(undirected, node_id, radius=k).nodes()
        return self.graph.subgraph(nodes).copy()

    def paths(
        self, src_id: str, dst_id: str, max_len: int = 3
    ) -> list[list[str]]:
        if src_id not in self.graph or dst_id not in self.graph:
            return []
        undirected = self.graph.to_undirected(as_view=True)
        try:
            return list(nx.all_simple_paths(undirected, src_id, dst_id, cutoff=max_len))
        except nx.NetworkXNoPath:
            return []

    def signals_in_window(self, days: int = 90) -> list[str]:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        out = []
        for nid, data in self.graph.nodes(data=True):
            if data.get("type") != NodeType.SIGNAL.value:
                continue
            pub = data.get("published_at")
            if pub and datetime.fromisoformat(pub) >= cutoff:
                out.append(nid)
        return out

    # ---------- snapshot / summary --------------------------------------

    def snapshot(self) -> None:
        data = nx.readwrite.json_graph.node_link_data(self.graph, link="edges")
        with Session(self._engine) as s:
            s.merge(KVRow(key="graph_snapshot", value=json.dumps(data, default=_to_iso)))
            s.commit()

    def restore(self) -> bool:
        with Session(self._engine) as s:
            row = s.get(KVRow, "graph_snapshot")
            if not row:
                return False
            data = json.loads(row.value)
            self.graph = nx.readwrite.json_graph.node_link_graph(
                data, directed=True, multigraph=True, link="edges"
            )
            return True

    def summary(self) -> dict[str, Any]:
        node_counts: Counter = Counter(d.get("type", "unknown") for _, d in self.graph.nodes(data=True))
        edge_counts: Counter = Counter(d.get("edge_type", "unknown") for _, _, d in self.graph.edges(data=True))
        return {
            "nodes": dict(node_counts),
            "edges": dict(edge_counts),
            "total_nodes": self.graph.number_of_nodes(),
            "total_edges": self.graph.number_of_edges(),
        }


# ---------- Module-level singleton helper --------------------------------

_store: Optional[GraphStore] = None


def get_store(database_url: Optional[str] = None) -> GraphStore:
    global _store
    if _store is None:
        url = database_url or os.environ.get("DATABASE_URL", "sqlite:///./competitive_os.db")
        _store = GraphStore(url)
    return _store
