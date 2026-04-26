import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { NetworkGraph } from "../components/NetworkGraph";
import { api } from "../lib/api";
import type { NetworkPayload } from "../lib/types";
import { Bot, Maximize, Search, Activity } from "lucide-react";

type NodeTypeFilter = "competitor" | "initiative" | "capability" | "signal" | "recommendation";

const NODE_TYPE_STYLES: Record<NodeTypeFilter, { dot: string; active: string }> = {
  competitor: { dot: "bg-navy", active: "bg-blue-50 text-navy ring-1 ring-navy/25" },
  initiative: { dot: "bg-ai", active: "bg-ai-bg text-ai ring-1 ring-ai/25" },
  signal: { dot: "bg-navy-2", active: "bg-blue-50 text-src-news ring-1 ring-src-news/25" },
  recommendation: { dot: "bg-teal", active: "bg-teal-bg text-teal ring-1 ring-teal/25" },
  capability: { dot: "bg-amber", active: "bg-amber-bg text-amber ring-1 ring-amber/25" },
};

function daysToLabel(days: number) {
  if (days <= 7) return "Last 7 days";
  if (days <= 14) return "Last 14 days";
  if (days <= 30) return "Last 30 days";
  if (days <= 90) return "Last 90 days";
  return `Last ${days} days`;
}

function mergeNetwork(base: NetworkPayload | null, incoming: NetworkPayload): NetworkPayload {
  if (!base) return incoming;
  const nodeMap = new Map(base.nodes.map((n) => [n.id, n]));
  for (const node of incoming.nodes) nodeMap.set(node.id, { ...nodeMap.get(node.id), ...node });

  const edgeMap = new Map(base.edges.map((e) => [`${e.src}->${e.dst}:${e.edge_type}`, e]));
  for (const edge of incoming.edges) edgeMap.set(`${edge.src}->${edge.dst}:${edge.edge_type}`, { ...edgeMap.get(`${edge.src}->${edge.dst}:${edge.edge_type}`), ...edge });

  return {
    ...base,
    ...incoming,
    stats: { ...base.stats, ...incoming.stats },
    nodes: [...nodeMap.values()],
    edges: [...edgeMap.values()],
    agent_steps: [...(base.agent_steps ?? []), ...(incoming.agent_steps ?? [])].slice(-8),
  };
}

export function MarketAtlas() {
  const network = useQuery({ queryKey: ["network", "competitor-map"], queryFn: api.competitorMap, refetchInterval: 30000 });
  const [days, setDays] = useState(30);
  const [q, setQ] = useState("");
  const [agentQuery, setAgentQuery] = useState("");
  const [graphPayload, setGraphPayload] = useState<NetworkPayload | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState<Record<NodeTypeFilter, boolean>>({
    competitor: true,
    initiative: true,
    capability: true,
    signal: false,
    recommendation: false,
  });
  const [focusedCompetitors, setFocusedCompetitors] = useState<Set<string>>(new Set(["comp-tesla", "comp-byd"]));

  useEffect(() => {
    if (network.data && !graphPayload) setGraphPayload(network.data);
  }, [graphPayload, network.data]);

  const now = useMemo(() => Date.now(), []);
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const data = graphPayload ?? network.data;

  const filtered = useMemo(() => {
    const nodeById = new Map((data?.nodes ?? []).map((node) => [node.id, node]));
    const enabledNodeIds = new Set(
      (data?.nodes ?? [])
        .filter((n) => Boolean(enabledTypes[n.type as NodeTypeFilter]))
        .map((n) => n.id)
    );
    let edges = (data?.edges ?? []).filter((e) => enabledNodeIds.has(e.src) && enabledNodeIds.has(e.dst));

    const signalFresh = new Set(
      (data?.nodes ?? [])
        .filter((n) => n.type === "signal" && typeof n.published_at === "string")
        .filter((n) => enabledNodeIds.has(n.id))
        .filter((n) => {
          const t = Date.parse(n.published_at ?? "");
          return Number.isFinite(t) ? t >= cutoff : true;
        })
        .map((n) => n.id)
    );
    
    edges = edges.filter((e) => {
      if (e.edge_type === "MENTIONS" || e.edge_type === "IMPACTS") return signalFresh.has(e.src);
      return true;
    });

    let visibleNodeIds = new Set<string>();
    for (const edge of edges) {
      visibleNodeIds.add(edge.src);
      visibleNodeIds.add(edge.dst);
    }

    if (focusedCompetitors.size > 0) {
      const allowedCompIds = new Set(focusedCompetitors);

      // Keep a compact 3-hop undirected neighborhood around focused competitors.
      // This makes signal/recommendation toggles visible: those nodes are often
      // connected through capabilities or initiatives, not directly to competitors.
      visibleNodeIds = new Set([...allowedCompIds].filter((id) => enabledNodeIds.has(id)));
      for (let hop = 0; hop < 3; hop += 1) {
        const next = new Set(visibleNodeIds);
        for (const edge of edges) {
          const srcNode = nodeById.get(edge.src);
          const dstNode = nodeById.get(edge.dst);
          if (visibleNodeIds.has(edge.src) && (dstNode?.type !== "competitor" || allowedCompIds.has(edge.dst))) {
            next.add(edge.dst);
          }
          if (visibleNodeIds.has(edge.dst) && (srcNode?.type !== "competitor" || allowedCompIds.has(edge.src))) {
            next.add(edge.src);
          }
        }
        visibleNodeIds = next;
      }
    }

    let nodes = (data?.nodes ?? []).filter((n) => {
      if (!enabledNodeIds.has(n.id) || !visibleNodeIds.has(n.id)) return false;
      if (focusedCompetitors.size > 0 && n.type === "competitor") {
        return focusedCompetitors.has(n.id);
      }
      return true;
    });
    const finalNodeIds = new Set(nodes.map(n => n.id));
    edges = edges.filter(e => finalNodeIds.has(e.src) && finalNodeIds.has(e.dst));

    return { nodes, edges };
  }, [cutoff, data?.edges, data?.nodes, enabledTypes, focusedCompetitors]);

  const visibleNodeIds = useMemo(() => new Set(filtered.nodes.map((n) => n.id)), [filtered.nodes]);
  const searchHitIds = useMemo(() => new Set((data?.hits ?? []).map((h) => h.id)), [data?.hits]);
  const competitorNodes = useMemo(() => (data?.nodes ?? []).filter(n => n.type === "competitor"), [data?.nodes]);

  const selectedNode = useMemo(() => filtered.nodes.find((n) => n.id === selectedId) ?? null, [filtered.nodes, selectedId]);
  
  // Fetch intelligent narrative if competitor is selected
  const narrativeQuery = useQuery({
    queryKey: ["narrative", selectedId],
    queryFn: () => selectedId ? api.competitorNarrative(selectedId) : null,
    enabled: selectedNode?.type === "competitor" && !!selectedId,
  });

  const selectedEdges = useMemo(
    () => filtered.edges.filter((e) => selectedId && (e.src === selectedId || e.dst === selectedId)).slice(0, 18),
    [filtered.edges, selectedId]
  );

  async function expandAround(nodeId: string) {
    setSelectedId(nodeId);
    setIsExpanding(true);
    try {
      const expanded = await api.expandNode(nodeId);
      setGraphPayload((prev) => mergeNetwork(prev, expanded));
    } finally {
      setIsExpanding(false);
    }
  }

  async function runAgentSearch(event: FormEvent) {
    event.preventDefault();
    const query = agentQuery.trim();
    if (!query) return;
    setIsExpanding(true);
    try {
      const result = await api.networkSearch(query);
      setGraphPayload((prev) => mergeNetwork(prev, result));
      setSelectedId(result.hits?.[0]?.id ?? result.nodes[0]?.id ?? null);
    } finally {
      setIsExpanding(false);
    }
  }

  async function refreshBaseMap() {
    const refreshed = await network.refetch();
    if (refreshed.data) setGraphPayload(refreshed.data);
    setSelectedId(null);
  }

  if (network.isLoading) return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Loading atlas...</div>;
  if (network.isError || !data) return <div className="rounded border border-border bg-amber-bg p-6 text-sm text-amber">Failed to load atlas.</div>;

  return (
    <div className="h-[calc(100vh-140px)] relative flex flex-col lg:flex-row overflow-hidden rounded-lg border border-border bg-surface-2 shadow-sm">
      {/* Immersive Map Container */}
      <div className="relative flex-1 bg-white">
        
        {/* Floating Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 w-full max-w-md space-y-3 pointer-events-none">
          <form onSubmit={runAgentSearch} className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-surface/95 px-4 py-2 shadow-sm backdrop-blur">
            <Bot className="h-4 w-4 text-ai" />
            <input
              value={agentQuery}
              onChange={(e) => setAgentQuery(e.target.value)}
              placeholder="Agentic search: e.g. Tesla pricing..."
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            />
            <button type="submit" disabled={isExpanding} className="text-xs font-semibold text-ai hover:text-ai-active-text disabled:opacity-50">
              {isExpanding ? "..." : "Search"}
            </button>
          </form>

          <div className="pointer-events-auto rounded-xl border border-border bg-surface/95 p-3 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold text-ink-2">
              <span>{daysToLabel(days)}</span>
              <span>{filtered.nodes.length} nodes active</span>
            </div>
            <input type="range" min={7} max={90} step={1} value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full accent-navy" />
            <div className="mt-4 flex flex-wrap gap-2">
              {(["competitor", "initiative", "signal", "recommendation", "capability"] as NodeTypeFilter[]).map((t) => {
                const style = NODE_TYPE_STYLES[t];
                
                return (
                  <button
                    key={t}
                    onClick={() => setEnabledTypes((prev) => ({ ...prev, [t]: !prev[t] }))}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition ${
                      enabledTypes[t] ? style.active : "bg-surface-2 text-ink-3 ring-1 ring-border/50 hover:bg-border"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {t}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Focus Competitors</span>
                {focusedCompetitors.size > 0 && (
                  <button onClick={() => setFocusedCompetitors(new Set())} className="text-[10px] font-semibold text-ai hover:underline">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {competitorNodes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setFocusedCompetitors(prev => {
                        const next = new Set(prev);
                        if (next.has(c.id)) next.delete(c.id);
                        else next.add(c.id);
                        return next;
                      });
                    }}
                    className={`rounded px-2 py-1 text-[10px] font-semibold transition ${
                      focusedCompetitors.has(c.id) ? "bg-navy text-white" : "bg-surface-2 text-ink-3 hover:bg-border hover:text-ink"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <NetworkGraph graph={filtered} selectedNodeId={selectedId} hitNodeIds={searchHitIds} onNodeSelect={expandAround} />
        
        <button onClick={refreshBaseMap} className="absolute bottom-4 left-4 z-10 rounded-full bg-surface px-4 py-2 text-xs font-semibold text-ink shadow-sm ring-1 ring-border hover:bg-surface-2">
          Recenter Atlas
        </button>
      </div>

      {/* Intelligent Research Panel */}
      <div className="w-full lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-surface flex flex-col h-full overflow-y-auto">
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur border-b border-border p-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink">Research Panel</h2>
        </div>
        
        <div className="p-4 space-y-6">
          {selectedNode ? (
            <div className="animate-fade-in">
              <div className="mb-4">
                <div className="inline-block rounded-full bg-ai-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ai mb-2">
                  {selectedNode.type}
                </div>
                <h3 className="text-xl font-bold text-ink">{selectedNode.label}</h3>
              </div>

              {selectedNode.type === "competitor" && narrativeQuery.isLoading && (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-full bg-surface-2 rounded" />
                  <div className="h-4 w-3/4 bg-surface-2 rounded" />
                </div>
              )}

              {selectedNode.type === "competitor" && narrativeQuery.data && (
                <div className="rounded border border-ai-active bg-ai-bg/30 p-4">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold text-ai uppercase tracking-wider">
                    <Bot className="h-4 w-4" /> AI Synthesis
                  </div>
                  <p className="text-sm leading-relaxed text-ink-2">{narrativeQuery.data.narrative}</p>
                </div>
              )}

            {selectedNode.type === "initiative" && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedNode.budget && <div className="rounded bg-surface-2 px-2 py-1 text-xs text-ink-2">Budget: ${(selectedNode.budget / 1000000).toFixed(1)}M</div>}
                  {selectedNode.target_launch && <div className="rounded bg-surface-2 px-2 py-1 text-xs text-ink-2">Target: {selectedNode.target_launch}</div>}
                  {selectedNode.status && <div className="rounded bg-surface-2 px-2 py-1 text-xs text-ink-2">Status: <span className="capitalize">{selectedNode.status.replace("_", " ")}</span></div>}
                </div>
                
                {(() => {
                  const recs = selectedEdges
                    .map(e => filtered.nodes.find(n => n.id === (e.src === selectedNode.id ? e.dst : e.src)))
                    .filter(n => n?.type === "recommendation");
                  
                  if (recs.length > 0) {
                    return (
                      <div className="rounded border border-border bg-surface-2 p-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">Strategic Rationale</h4>
                        {recs.map(r => (
                          <div key={r!.id} className="text-sm text-ink mb-2 last:mb-0">
                            {r!.label}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {selectedNode.type === "capability" && (
              <div className="mt-4">
                {(() => {
                  const signals = selectedEdges
                    .map(e => filtered.nodes.find(n => n.id === (e.src === selectedNode.id ? e.dst : e.src)))
                    .filter(n => n?.type === "signal");
                  
                  if (signals.length > 0) {
                    return (
                      <div className="rounded border border-border bg-surface-2 p-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-2">Sources & Evidence</h4>
                        <div className="space-y-2">
                          {signals.map(s => (
                            <div key={s!.id} className="text-xs">
                              {s!.url ? (
                                <a href={s!.url as string} target="_blank" rel="noreferrer" className="font-medium text-ai hover:underline">
                                  {s!.label}
                                </a>
                              ) : (
                                <span className="font-medium text-ink">{s!.label}</span>
                              )}
                              {s!.source_name && <span className="ml-1 text-ink-3">- {s!.source_name}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-3">Connected Graph Nodes</h4>
                <button onClick={() => expandAround(selectedNode.id)} className="text-[10px] font-semibold text-ai hover:underline bg-ai-bg px-2 py-1 rounded">
                  +2 Hops
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {selectedEdges.map((edge) => {
                  const otherId = edge.src === selectedNode.id ? edge.dst : edge.src;
                  const other = filtered.nodes.find((n) => n.id === otherId);
                  return (
                    <button
                      key={`${edge.src}-${edge.dst}-${edge.edge_type}`}
                      onClick={() => otherId && visibleNodeIds.has(otherId) && expandAround(otherId)}
                      className="group flex w-full items-center justify-between rounded border border-border bg-surface p-2 text-left hover:border-navy hover:bg-surface-2 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-ink-3">{edge.edge_type}</span>
                          <span className="text-[9px] text-ink-3 bg-surface-2 px-1 rounded">{other?.type}</span>
                        </div>
                        <div className="truncate text-xs font-medium text-ink group-hover:text-navy">{other?.label ?? otherId}</div>
                      </div>
                      <Activity className="h-3 w-3 text-ink-3 group-hover:text-navy shrink-0" />
                    </button>
                  );
                })}
              </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
              <Maximize className="h-8 w-8 text-ink-3 mb-3" />
              <p className="text-sm font-medium text-ink-2">Select a node to begin research</p>
              <p className="mt-1 text-xs text-ink-3 max-w-[200px]">Click any competitor, signal, or capability in the atlas to load executive insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
