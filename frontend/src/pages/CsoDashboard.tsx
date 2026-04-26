import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/Card";
import { ExposureRow } from "../components/ExposureRow";
import { MomentumMap } from "../components/MomentumMap";
import { RecommendationCard } from "../components/RecommendationCard";
import { RiskScoreBand } from "../components/RiskScoreBand";
import { api } from "../lib/api";
import { useAccount } from "../lib/accounts";
import { Sparkles } from "lucide-react";

export function CsoDashboard() {
  const { account } = useAccount();
  const queryClient = useQueryClient();
  const competitors = useQuery({ queryKey: ["competitors"], queryFn: api.competitors });
  const initiatives = useQuery({ queryKey: ["initiatives"], queryFn: api.initiatives });
  const signals = useQuery({ queryKey: ["signals"], queryFn: () => api.signals({ days: 90 }) });
  const recommendations = useQuery({ queryKey: ["recommendations"], queryFn: () => api.recommendations({ status: "pending", limit: 3 }) });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "defer" }) => api.recommendationAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });

  const isLoading = competitors.isLoading || initiatives.isLoading || signals.isLoading || recommendations.isLoading;
  const hasError = competitors.isError || initiatives.isError || signals.isError || recommendations.isError;

  if (isLoading) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-navy border-t-transparent" />
        <div className="mt-3 text-sm text-ink-2">Loading competitive graph...</div>
      </div>
    );
  }
  if (hasError) {
    return (
      <div className="rounded-xl border border-amber/30 bg-amber-bg/60 p-6 text-sm text-amber backdrop-blur-sm">
        Unable to load dashboard data. Confirm the backend is running and the frontend is proxying `/api/*` correctly.
      </div>
    );
  }

  const topInitiatives = [...(initiatives.data ?? [])].sort((a, b) => b.current_risk_score - a.current_risk_score).slice(0, 5);
  const top = topInitiatives[0];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="animate-slide-up [animation-delay:0ms]">
        <div className="text-lg font-bold text-ink">Good morning, {account.name.split(" ")[0]}</div>
        <div className="mt-0.5 text-sm text-ink-2">{account.title} · Competitive Intelligence Briefing</div>
      </div>

      {/* Risk Score Band */}
      {top ? <div className="animate-slide-up [animation-delay:150ms]"><RiskScoreBand title={top.name} current={top.current_risk_score} prior={top.prior_risk_score} history={top.score_history} /></div> : null}

      {/* Momentum Map */}
      <div className="animate-slide-up [animation-delay:300ms]">
        <Card title="Competitive momentum" subtitle="Who is moving fastest, how much of the portfolio they threaten, and how much deal exposure is at stake." variant="elevated">
          <MomentumMap competitors={competitors.data ?? []} initiatives={initiatives.data ?? []} />
        </Card>
      </div>

      {/* Strategic exposure + Recommendations */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr] animate-slide-up [animation-delay:450ms]">
        <Card title="Strategic exposure" subtitle="Plain-English reason each initiative moved. Click through for multi-hop trace evidence." variant="elevated">
          <div>
            {topInitiatives.map((i) => (
              <ExposureRow
                key={i.id}
                initiative={i}
                signal={(signals.data ?? []).find((signal) => signal.initiative_ids.includes(i.id))}
              />
            ))}
          </div>
        </Card>

        <Card variant="elevated">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-ai" />
            <div className="text-sm font-bold text-ink tracking-tight">AI Recommendations</div>
          </div>
          <div className="text-xs text-ink-2 mb-4">Pending recommendations generated from score deltas.</div>
          <div className="grid gap-4">
            {(recommendations.data ?? []).map((r) => (
              <RecommendationCard 
                key={r.id} 
                recommendation={r} 
                onAccept={(id) => actionMutation.mutate({ id, action: "accept" })}
                onDefer={(id) => actionMutation.mutate({ id, action: "defer" })}
                actionsDisabled={actionMutation.isPending}
              />
            ))}
            {(recommendations.data ?? []).length === 0 ? <div className="text-sm text-ink-2">No recommendations yet.</div> : null}
          </div>
          <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-navy to-ai px-4 py-2.5 text-sm font-semibold text-white shadow-depth transition-all hover:shadow-glass-hover hover:brightness-110">
            Generate report
          </button>
        </Card>
      </div>
    </div>
  );
}
