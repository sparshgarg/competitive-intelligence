"""Pydantic models for Competitive_OS entities.

Single source of truth for entity shapes on the backend. The TypeScript
mirror lives at frontend/src/lib/types.ts and is kept in sync manually.
"""
from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---------- Enums ---------------------------------------------------------

class SourceType(str, Enum):
    NEWS = "news"
    ANALYST = "analyst"
    CRM = "crm"
    CPQ = "cpq"
    SOCIAL = "social"


class ThreatLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class InitiativeStatus(str, Enum):
    ACTIVE = "active"
    AT_RISK = "at_risk"
    BLOCKED = "blocked"


class Trend(str, Enum):
    RISING = "rising"
    STABLE = "stable"
    DECLINING = "declining"


class Priority(str, Enum):
    HIGH = "high"
    MED = "med"
    LOW = "low"


class CapabilityCategory(str, Enum):
    DELIVERY = "delivery"
    INTELLIGENCE = "intelligence"
    UX = "ux"
    PLATFORM = "platform"


class RecommendationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DEFERRED = "deferred"


class EntityType(str, Enum):
    COMPETITOR = "competitor"
    CAPABILITY = "capability"
    DOLLAR_AMOUNT = "dollar_amount"
    DATE = "date"
    DEAL_OUTCOME = "deal_outcome"
    RATING_CHANGE = "rating_change"


class NodeType(str, Enum):
    """Node type tag used inside the graph and SQLite serialization."""
    COMPETITOR = "competitor"
    CAPABILITY = "capability"
    INITIATIVE = "initiative"
    SIGNAL = "signal"
    RECOMMENDATION = "recommendation"


class EdgeType(str, Enum):
    HAS_CAPABILITY = "HAS_CAPABILITY"
    REQUIRES = "REQUIRES"
    MENTIONS = "MENTIONS"
    IMPACTS = "IMPACTS"
    THREATENS = "THREATENS"
    TRACES_TO = "TRACES_TO"


# ---------- Sub-models ----------------------------------------------------

class CapabilityStrength(BaseModel):
    capability_id: str
    strength: int = Field(ge=0, le=5)
    trend: Trend


class RequiredCapability(BaseModel):
    capability_id: str
    priority: Priority


class ScoreHistoryPoint(BaseModel):
    date: str  # ISO yyyy-mm-dd
    score: float


class ExtractedEntity(BaseModel):
    type: EntityType
    value: str
    confidence: float = Field(ge=0.0, le=1.0)
    # Optional resolved id once fuzzy-matched against the graph.
    resolved_id: Optional[str] = None


# ---------- Top-level entities --------------------------------------------

class Capability(BaseModel):
    model_config = ConfigDict(use_enum_values=False)
    id: str
    name: str
    category: CapabilityCategory


class Competitor(BaseModel):
    model_config = ConfigDict(use_enum_values=False)
    id: str
    name: str
    segment: str
    momentum_score: float = Field(ge=0.0, le=1.0)
    threat_level: ThreatLevel
    description: str
    capabilities: list[CapabilityStrength] = Field(default_factory=list)
    last_updated: datetime
    total_signals_30d: int = 0
    deal_loss_exposure_q: float = 0.0


class Initiative(BaseModel):
    model_config = ConfigDict(use_enum_values=False)
    id: str
    name: str
    owner_name: str
    budget: float
    target_launch: str
    status: InitiativeStatus
    current_risk_score: float = Field(ge=0.0, le=10.0)
    prior_risk_score: float = Field(ge=0.0, le=10.0)
    score_history: list[ScoreHistoryPoint] = Field(default_factory=list)
    required_capabilities: list[RequiredCapability] = Field(default_factory=list)
    risk_rationale: Optional[str] = None


class Signal(BaseModel):
    model_config = ConfigDict(use_enum_values=False)
    id: str
    source_type: SourceType
    source_name: str
    title: str
    content: str
    source_url: str
    published_at: datetime
    ingested_at: datetime
    confidence: float = Field(ge=0.0, le=1.0)
    extracted_entities: list[ExtractedEntity] = Field(default_factory=list)
    weight: float = 1.0


class Recommendation(BaseModel):
    model_config = ConfigDict(use_enum_values=False)
    id: str
    headline: str
    why_now: str
    confidence: float = Field(ge=0.0, le=1.0)
    status: RecommendationStatus = RecommendationStatus.PENDING
    reasoning_path: list[str] = Field(default_factory=list)
    affected_initiative_id: str
    generated_at: datetime
