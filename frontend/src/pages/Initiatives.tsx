import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { api } from "../lib/api";
import { Avatar } from "../components/Avatar";
import { Sparkline } from "../components/Sparkline";
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Activity, Settings2, Target } from "lucide-react";

function riskLabel(score: number) {
  if (score >= 7.5) return { label: "High Risk", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", icon: AlertTriangle };
  if (score >= 5.5) return { label: "Elevated", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: Activity };
  return { label: "Stable", bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", icon: Target };
}

export function Initiatives() {
  const initiatives = useQuery({ queryKey: ["initiatives"], queryFn: api.initiatives });

  if (initiatives.isLoading) {
    return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Loading initiatives...</div>;
  }
  if (initiatives.isError) {
    return <div className="rounded border border-border bg-amber-bg p-6 text-sm text-amber">Failed to load initiatives.</div>;
  }

  return (
    <div className="space-y-6">
      <Card title="Active Initiatives" subtitle="Portfolio risk monitoring and resource allocation.">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 mt-4">
          {(initiatives.data ?? []).map((i) => {
            const risk = riskLabel(i.current_risk_score);
            const riskDelta = i.current_risk_score - i.prior_risk_score;
            const RiskIcon = risk.icon;

            return (
              <div key={i.id} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border transition-all hover:shadow-md">
                <div className={`p-5 flex-1 flex flex-col border-b border-border bg-gradient-to-b from-surface/50 to-transparent`}>
                  
                  {/* Header: Title & Risk Score */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ${risk.bg} ${risk.border} ${risk.text}`}>
                          <RiskIcon className="h-3 w-3" />
                          {risk.label}
                        </div>
                        {i.status === "blocked" && (
                          <div className="rounded-full bg-ink text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                            Blocked
                          </div>
                        )}
                      </div>
                      <Link to={`/initiatives/${i.id}`} className="truncate text-lg font-bold text-ink hover:text-navy transition-colors">
                        {i.name}
                      </Link>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-end justify-end gap-1">
                        <span className="text-2xl font-bold leading-none text-ink">{i.current_risk_score.toFixed(1)}</span>
                        <span className="text-xs font-semibold text-ink-3 mb-0.5">/10</span>
                      </div>
                      <div className={`mt-1 flex items-center justify-end gap-1 text-xs font-semibold ${riskDelta > 0 ? "text-rose-600" : "text-teal-600"}`}>
                        {riskDelta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(riskDelta).toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Owner & Meta Info */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-2">
                    <div className="flex items-center gap-2">
                      <Avatar name={i.owner_name} size={24} />
                      <span className="font-semibold">{i.owner_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 border-l border-border pl-4">
                      <span className="text-ink-3">Target:</span>
                      <span className="font-semibold text-ink">{i.target_launch}</span>
                    </div>
                    {i.budget && (
                      <div className="flex items-center gap-1.5 border-l border-border pl-4">
                        <span className="text-ink-3">Budget:</span>
                        <span className="font-semibold text-ink">${(i.budget / 1000000).toFixed(1)}M</span>
                      </div>
                    )}
                  </div>

                  {/* Risk Rationale */}
                  {i.risk_rationale && (
                    <div className="mt-5 rounded-lg bg-surface p-3 ring-1 ring-inset ring-border">
                      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase tracking-widest text-ink">
                        <Activity className="h-3.5 w-3.5 text-ink-3" /> Risk Context
                      </div>
                      <p className="text-sm text-ink-2 leading-relaxed">
                        {i.risk_rationale}
                      </p>
                    </div>
                  )}

                  {/* Sparkline & Top Threat */}
                  <div className="mt-5 flex items-center gap-4">
                    <div className="flex-1 min-w-0 border border-border rounded-lg bg-surface p-2 h-[80px]">
                      {i.score_history?.length > 0 ? (
                        <Sparkline history={i.score_history} height={60} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-ink-3">No history</div>
                      )}
                    </div>
                    
                    {i.top_competitor && (
                      <div className="shrink-0 w-32">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-ink-3 mb-1">Top Threat</div>
                        <div className="text-sm font-semibold text-ink truncate">{i.top_competitor.name}</div>
                        {i.top_competitor.exposure_score !== undefined && (
                          <div className="text-xs text-rose-600 mt-1 font-medium">
                            ${i.budget ? (i.budget * Math.min(1, i.top_competitor.exposure_score / 10) / 1000000).toFixed(1) : "0.0"}M at risk
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

                {/* Footer Action Buttons */}
                <div className="bg-surface-2 p-3 flex items-center justify-end gap-2">
                  <Link to={`/network`} className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-ink-2 hover:bg-surface transition-colors shadow-sm">
                    <Settings2 className="h-3.5 w-3.5" /> View in Atlas
                  </Link>
                  <Link to={`/initiatives/${i.id}`} className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-2 transition-colors shadow-sm">
                    Investigate Risk
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

