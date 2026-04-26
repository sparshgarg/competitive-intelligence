import type { SourceType } from "./colors";

export type ThreatLevel = "low" | "medium" | "high";
export type InitiativeStatus = "active" | "at_risk" | "blocked";
export type Trend = "rising" | "stable" | "declining";

export interface CapabilityStrength {
  capability_id: string;
  strength: number;
  trend: Trend;
}

export interface RequiredCapability {
  capability_id: string;
  priority: "high" | "med" | "low";
}

export interface ScoreHistoryPoint {
  date: string;
  score: number;
}

export interface Competitor {
  id: string;
  name: string;
  segment: string;
  momentum_score: number;
  threat_level: ThreatLevel;
  description: string;
  capabilities: CapabilityStrength[];
  last_updated: string;
  total_signals_30d: number;
  deal_loss_exposure_q: number;
}

export interface ThreatenedInitiative {
  initiative_id: string;
  exposure_score?: number;
  via_capabilities?: string[];
}

export interface CompetitorDetail extends Competitor {
  deals_encountered: number;
  win_rate: number;
  threatened_initiatives: ThreatenedInitiative[];
}

export interface SignalSummary {
  id: string;
  source_type: SourceType;
  source_name: string;
  title: string;
  published_at: string;
  competitor_ids: string[];
  initiative_ids: string[];
}

export interface ExtractedEntity {
  type: string;
  value: string;
  confidence: number;
  resolved_id?: string | null;
}

export interface Signal {
  id: string;
  source_type: SourceType;
  source_name: string;
  title: string;
  content: string;
  source_url: string;
  published_at: string;
  ingested_at: string;
  confidence: number;
  extracted_entities: ExtractedEntity[];
  weight: number;
}

export interface SignalPropagation {
  signal: { id: string; title: string };
  downstream: {
    node_id: string;
    node_type: string;
    node_label: string;
    delta: number;
    edge_type: string;
  }[];
}

export interface Initiative {
  id: string;
  name: string;
  owner_name: string;
  budget: number;
  target_launch: string;
  status: InitiativeStatus;
  current_risk_score: number;
  prior_risk_score: number;
  score_history: ScoreHistoryPoint[];
  required_capabilities: RequiredCapability[];
  top_competitor?: { id: string; name: string; exposure_score?: number } | null;
  top_signals?: SignalSummary[];
  risk_rationale?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "competitor" | "capability" | "initiative" | "signal" | "recommendation";
  name?: string;
  title?: string;
  source_type?: SourceType;
  current_risk_score?: number;
  published_at?: string;
  budget?: number;
  target_launch?: string;
  status?: string;
  url?: string;
  source_name?: string;
}

export interface GraphEdge {
  src: string;
  dst: string;
  edge_type: string;
  weight?: number;
  confidence?: number;
  exposure_score?: number;
}

export interface Subgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface NetworkPayload extends Subgraph {
  stats: {
    nodes: Record<string, number>;
    edges: Record<string, number>;
    total_nodes: number;
    total_edges: number;
    last_signal_ingested_at?: string | null;
    visible_nodes?: number;
    visible_edges?: number;
  };
  agent_steps?: string[];
  hits?: { id: string; label: string; type: string; score: number }[];
  focus?: {
    id: string;
    label: string;
    type: string;
    connections: Record<string, { id: string; label: string; type: string; attrs: Record<string, unknown> }[]>;
  };
}

export interface Recommendation {
  id: string;
  headline: string;
  why_now: string;
  confidence: number;
  status: "pending" | "accepted" | "deferred";
  reasoning_path: string[];
  affected_initiative_id: string;
  generated_at: string;
  initiative_name?: string;
  subgraph?: Subgraph;
}

export interface Summary {
  nodes: Record<string, number>;
  edges: Record<string, number>;
  total_nodes: number;
  total_edges: number;
}

