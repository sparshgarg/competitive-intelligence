import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { Card } from "../components/Card";
import { api } from "../lib/api";

export function CompetitorDetail() {
  const { competitorId } = useParams();
  const id = competitorId ?? "";

  const competitor = useQuery({ queryKey: ["competitor", id], queryFn: () => api.competitor(id), enabled: Boolean(id) });
  const narrative = useQuery({ queryKey: ["competitor-narrative", id], queryFn: () => api.competitorNarrative(id), enabled: Boolean(id) });

  if (!id) return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Missing competitor id.</div>;
  if (competitor.isLoading) return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Loading competitor...</div>;
  if (competitor.isError || !competitor.data)
    return <div className="rounded border border-border bg-amber-bg p-6 text-sm text-amber">Competitor not found.</div>;

  const c = competitor.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold text-ink">{c.name}</div>
          <div className="mt-1 text-sm text-ink-2">
            {c.segment} · Threat <span className="font-medium text-ink">{c.threat_level}</span>
          </div>
        </div>
        <Link to="/competitors" className="text-sm font-medium text-navy hover:underline">
          Back to competitors
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
        <Card title="Trajectory" subtitle="Provider-backed synthesis with deterministic fallback.">
          {narrative.isLoading ? (
            <div className="text-sm text-ink-2">Generating narrative...</div>
          ) : narrative.isError ? (
            <div className="text-sm text-amber">Unable to load narrative.</div>
          ) : (
            <div className="space-y-2">
              <div className="text-sm leading-relaxed text-ink">{narrative.data?.narrative}</div>
              {(narrative.data?.citations ?? []).length ? (
                <div className="text-xs text-ink-3">Citations: {(narrative.data?.citations ?? []).join(", ")}</div>
              ) : null}
            </div>
          )}
        </Card>

        <Card title="Commercial pressure" subtitle="CRM-derived stats (mock).">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded border border-border bg-surface-2 p-3">
              <div className="text-[11px] text-ink-3">Deals encountered</div>
              <div className="mt-1 text-lg font-semibold text-ink">{c.deals_encountered}</div>
            </div>
            <div className="rounded border border-border bg-surface-2 p-3">
              <div className="text-[11px] text-ink-3">Win rate</div>
              <div className="mt-1 text-lg font-semibold text-ink">{Math.round(c.win_rate * 100)}%</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

