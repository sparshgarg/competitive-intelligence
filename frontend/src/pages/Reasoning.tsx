import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../components/Card";
import { RecommendationCard } from "../components/RecommendationCard";
import { api } from "../lib/api";

export function Reasoning() {
  const queryClient = useQueryClient();
  const recommendations = useQuery({ queryKey: ["recommendations", "all"], queryFn: () => api.recommendations({ status: "all" }) });

  const act = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "defer" }) => api.recommendationAction(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
  });

  return (
    <Card title="Reasoning log" subtitle="All recommendations with persisted Accept/Defer actions.">
      {recommendations.isLoading ? (
        <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Loading recommendations...</div>
      ) : recommendations.isError ? (
        <div className="rounded border border-border bg-amber-bg p-6 text-sm text-amber">Failed to load recommendations.</div>
      ) : (
        <div className="space-y-3">
          {(recommendations.data ?? []).map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              actionsDisabled={act.isPending}
              onAccept={(id) => act.mutate({ id, action: "accept" })}
              onDefer={(id) => act.mutate({ id, action: "defer" })}
            />
          ))}
          {(recommendations.data ?? []).length === 0 ? <div className="text-sm text-ink-2">No recommendations yet.</div> : null}
        </div>
      )}
    </Card>
  );
}

