import { useState } from "react";
import { Link } from "react-router-dom";
import type { Initiative, SignalSummary } from "../lib/types";
import { TraceChain } from "./TraceChain";
import { Avatar } from "./Avatar";
import { TrendingUp, TrendingDown } from "lucide-react";

function riskLabel(score: number) {
  if (score >= 7.5) return { text: "High urgency", cls: "bg-rose-50 text-rose-600 ring-rose-200/60" };
  if (score >= 5.5) return { text: "Watch", cls: "bg-amber-50 text-amber ring-amber-200/60" };
  return { text: "Stable", cls: "bg-teal-bg text-teal ring-teal/20" };
}

export function ExposureRow({ initiative, signal }: { initiative: Initiative; signal?: SignalSummary }) {
  const delta = initiative.current_risk_score - initiative.prior_risk_score;
  const label = riskLabel(initiative.current_risk_score);
  const fallbackReason = signal
    ? `${signal.source_name} signal is connected through the graph to this initiative, increasing urgency.`
    : `${initiative.top_competitor?.name ?? "Competitive pressure"} is linked to required capabilities for this initiative.`;
  const reason = initiative.risk_rationale || fallbackReason;

  const [isAllocating, setIsAllocating] = useState(false);
  const [budgetOffset, setBudgetOffset] = useState(0);
  const displayBudget = initiative.budget + budgetOffset;

  return (
    <div className="group border-b border-border/40 py-4 last:border-b-0 transition-colors hover:bg-surface-2/30 -mx-2 px-2 rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/initiatives/${initiative.id}`} className="truncate text-sm font-bold text-ink hover:text-navy transition-colors">
              {initiative.name}
            </Link>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${label.cls}`}>{label.text}</span>
          </div>
          
          <div className="mt-2 flex items-center gap-2">
            <Avatar name={initiative.owner_name} size={24} />
            <div className="text-xs text-ink-2">
              <span className="font-semibold text-ink">{initiative.owner_name}</span>
              <span className="mx-1.5 text-ink-3">·</span>
              Target: {initiative.target_launch}
              <span className="mx-1.5 text-ink-3">·</span>
              Budget: ${(displayBudget / 1_000_000).toFixed(1)}M
            </div>
          </div>

          <p className="mt-2 text-xs leading-5 text-ink-2">{reason}</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <TraceChain signal={signal} initiative={initiative} />
            <div className="flex shrink-0 items-center gap-2">
              {!isAllocating ? (
                <button 
                  onClick={() => setIsAllocating(true)}
                  className="rounded-lg border border-border/60 bg-white/60 px-2.5 py-1 text-[11px] font-semibold text-ink-2 transition-all hover:bg-surface-2 hover:shadow-sm"
                >
                  Allocate Budget
                </button>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-navy/20 bg-ai-bg/60 px-2 py-1 shadow-sm">
                  <button onClick={() => setBudgetOffset(v => v - 500_000)} className="flex h-5 w-5 items-center justify-center rounded-full text-ink-3 hover:bg-white hover:text-ink hover:shadow-sm transition-all">-</button>
                  <span className="text-[11px] font-semibold text-navy w-12 text-center tabular">
                    {budgetOffset > 0 ? "+" : ""}{(budgetOffset / 1_000_000).toFixed(1)}M
                  </span>
                  <button onClick={() => setBudgetOffset(v => v + 500_000)} className="flex h-5 w-5 items-center justify-center rounded-full text-ink-3 hover:bg-white hover:text-ink hover:shadow-sm transition-all">+</button>
                  <button onClick={() => setIsAllocating(false)} className="ml-1 rounded-md bg-navy px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">Save</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="tabular text-xl font-bold text-ink">{initiative.current_risk_score.toFixed(1)}</div>
          <div className={`mt-1 flex items-center justify-end gap-1 text-xs font-bold ${delta >= 0 ? "text-amber" : "text-teal"}`}>
            {delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {delta >= 0 ? "+" : ""}{delta.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
