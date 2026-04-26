import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { RiskScoreBand } from "../components/RiskScoreBand";
import { SourcePill } from "../components/SourcePill";
import { SubgraphViewer } from "../components/SubgraphViewer";
import { api } from "../lib/api";

export function InitiativeDetail() {
  const { initiativeId } = useParams();
  const id = initiativeId ?? "";

  const initiative = useQuery({ queryKey: ["initiative", id], queryFn: () => api.initiative(id), enabled: Boolean(id) });
  const trace = useQuery({ queryKey: ["initiative-trace", id], queryFn: () => api.initiativeTrace(id), enabled: Boolean(id) });

  if (!id) return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Missing initiative id.</div>;
  if (initiative.isLoading) return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Loading initiative...</div>;
  if (initiative.isError || !initiative.data)
    return <div className="rounded border border-border bg-amber-bg p-6 text-sm text-amber">Initiative not found.</div>;

  const i = initiative.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold text-ink">{i.name}</div>
          <div className="mt-1 text-sm text-ink-2">
            Owner <span className="font-medium text-ink">{i.owner_name}</span> · Target{" "}
            <span className="font-medium text-ink">{i.target_launch}</span>
          </div>
        </div>
        <Link to="/initiatives" className="text-sm font-medium text-navy hover:underline">
          Back to initiatives
        </Link>
      </div>

      <RiskScoreBand title={i.name} current={i.current_risk_score} prior={i.prior_risk_score} history={i.score_history} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card title="Top contributing signals" subtitle="Highest-impact evidence for this initiative.">
          <div className="space-y-3">
            {(i.top_signals ?? []).length ? (
              (i.top_signals ?? []).map((s) => (
                <Link key={s.id} to={`/signals/${s.id}`} className="block rounded border border-border bg-surface-2 p-3 hover:bg-surface">
                  <div className="text-sm font-semibold text-ink">{s.title}</div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-ink-2">
                    {s.source_type ? <SourcePill sourceType={s.source_type} /> : null}
                    <span>{s.source_name}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-sm text-ink-2">No recent signals found for this initiative.</div>
            )}
          </div>
        </Card>

        <Card title="Trace (3-hop subgraph)" subtitle="Graph evidence behind this initiative’s score.">
          {trace.isLoading ? (
            <div className="text-sm text-ink-2">Loading trace...</div>
          ) : trace.isError ? (
            <div className="text-sm text-amber">Unable to load trace.</div>
          ) : (
            <SubgraphViewer subgraph={trace.data} />
          )}
        </Card>
      </div>
    </div>
  );
}

