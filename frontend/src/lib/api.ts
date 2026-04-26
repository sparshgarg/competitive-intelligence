import type {
  Competitor,
  CompetitorDetail,
  Initiative,
  NetworkPayload,
  Recommendation,
  Signal,
  SignalPropagation,
  SignalSummary,
  Subgraph,
  Summary,
  Scenario,
} from "./types";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  return response.json() as Promise<T>;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  return response.json() as Promise<T>;
}

export const api = {
  summary: () => getJson<Summary>("/api/summary"),
  competitors: () => getJson<Competitor[]>("/api/competitors"),
  competitor: (id: string) => getJson<CompetitorDetail>(`/api/competitors/${id}`),
  competitorNarrative: (id: string) => getJson<{ narrative: string; citations: string[] }>(`/api/competitors/${id}/narrative`),

  initiatives: () => getJson<Initiative[]>("/api/initiatives"),
  initiative: (id: string) => getJson<Initiative>(`/api/initiatives/${id}`),
  initiativeTrace: (id: string) => getJson<Subgraph>(`/api/initiatives/${id}/trace`),

  signals: (params?: { days?: number; source_type?: string; q?: string }) => {
    const search = new URLSearchParams();
    search.set("days", String(params?.days ?? 90));
    if (params?.source_type) search.set("source_type", params.source_type);
    if (params?.q) search.set("q", params.q);
    return getJson<SignalSummary[]>(`/api/signals?${search.toString()}`);
  },
  signal: (id: string) => getJson<Signal>(`/api/signals/${id}`),
  signalPropagation: (id: string) => getJson<SignalPropagation>(`/api/signals/${id}/propagation`),

  recommendations: (params?: { status?: "all" | "pending" | "accepted" | "deferred"; limit?: number; initiative_id?: string }) => {
    const search = new URLSearchParams();
    search.set("status", params?.status ?? "pending");
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.initiative_id) search.set("initiative_id", params.initiative_id);
    return getJson<Recommendation[]>(`/api/recommendations?${search.toString()}`);
  },
  recommendationAction: (id: string, action: "accept" | "defer") => postJson<Recommendation>(`/api/recommendations/${id}/action`, { action }),

  network: () => getJson<NetworkPayload>("/api/network"),
  competitorMap: () => getJson<NetworkPayload>("/api/network/competitor-map?k=2"),
  expandNode: (id: string) => getJson<NetworkPayload>(`/api/network/expand/${encodeURIComponent(id)}?k=2`),
  networkSearch: (q: string) => getJson<NetworkPayload>(`/api/network/search?q=${encodeURIComponent(q)}&k=2&limit=4`),

  scenarios: () => getJson<Scenario[]>("/api/scenarios"),
  strategyBrief: (body: { sliders: Record<string, number>; scenario_name: string }) => postJson<{ brief: string; provider: string }>("/api/strategy/brief", body),
};

