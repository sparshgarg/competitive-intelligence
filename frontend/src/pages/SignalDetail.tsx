import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { api } from "../lib/api";

export function SignalDetail() {
  const { signalId } = useParams();
  const id = signalId ?? "";

  const signal = useQuery({ queryKey: ["signal", id], queryFn: () => api.signal(id), enabled: Boolean(id) });
  const propagation = useQuery({ queryKey: ["signal-propagation", id], queryFn: () => api.signalPropagation(id), enabled: Boolean(id) });

  if (!id) return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Missing signal id.</div>;
  if (signal.isLoading) return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Loading signal...</div>;
  if (signal.isError || !signal.data) return <div className="rounded border border-border bg-amber-bg p-6 text-sm text-amber">Signal not found.</div>;

  const s = signal.data;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xl font-semibold text-ink">{s.title}</div>
          <div className="mt-2 text-xs text-ink-2">
            {s.source_type} · {s.source_name} · {new Date(s.published_at).toLocaleString()}
          </div>
        </div>
        <Link to="/signals" className="shrink-0 text-sm font-medium text-navy hover:underline">
          Back to signals
        </Link>
      </div>

      <Card title="Content" subtitle="Raw signal text ingested into the graph.">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{s.content}</div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        <Card title="Extracted entities" subtitle="What extraction produced for this signal.">
          {(s.extracted_entities ?? []).length ? (
            <div className="space-y-2">
              {(s.extracted_entities ?? []).map((e, idx) => (
                <div key={`${e.type}-${e.value}-${idx}`} className="flex items-center justify-between rounded border border-border bg-surface-2 p-2 text-xs">
                  <div className="min-w-0">
                    <div className="font-semibold text-ink">{e.value}</div>
                    <div className="text-[11px] text-ink-3">{e.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-semibold text-ink">{Math.round((e.confidence ?? 0) * 100)}%</div>
                    <div className="text-[11px] text-ink-3">{e.resolved_id ?? "unresolved"}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-ink-2">No entities extracted.</div>
          )}
        </Card>

        <Card title="Propagation" subtitle="Downstream nodes touched by this signal.">
          {propagation.isLoading ? (
            <div className="text-sm text-ink-2">Loading propagation…</div>
          ) : propagation.isError ? (
            <div className="text-sm text-amber">Unable to load propagation.</div>
          ) : (
            <div className="divide-y divide-border">
              {(propagation.data?.downstream ?? []).map((row) => (
                <div key={`${row.edge_type}-${row.node_id}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">{row.node_label}</div>
                    <div className="mt-1 text-xs text-ink-3">
                      {row.edge_type} → {row.node_type}
                    </div>
                  </div>
                  <div className="shrink-0 rounded bg-surface-2 px-2 py-1 text-xs font-semibold text-ink-2">Δ {row.delta.toFixed(2)}</div>
                </div>
              ))}
              {(propagation.data?.downstream ?? []).length === 0 ? <div className="py-6 text-sm text-ink-2">No downstream edges found.</div> : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

