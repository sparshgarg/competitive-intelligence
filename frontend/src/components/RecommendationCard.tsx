import { useState } from "react";
import type { Recommendation } from "../lib/types";
import { SubgraphViewer } from "./SubgraphViewer";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";

export function RecommendationCard({
  recommendation,
  onAccept,
  onDefer,
  actionsDisabled = false,
}: {
  recommendation: Recommendation;
  onAccept?: (id: string) => void;
  onDefer?: (id: string) => void;
  actionsDisabled?: boolean;
}) {
  const [showTrace, setShowTrace] = useState(false);

  return (
    <article className="ai-glow rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ai/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ai ring-1 ring-ai/15">
          <Sparkles className="h-3 w-3" />
          AI Derived
        </span>
        <span className="rounded-full bg-surface-2/80 px-2.5 py-1 text-[10px] font-bold text-ink-2 ring-1 ring-border/40">
          CONF {Math.round(recommendation.confidence * 100)}%
        </span>
      </div>
      <h3 className="line-clamp-2 text-sm font-bold text-ink leading-snug">{recommendation.headline}</h3>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-ink-2">{recommendation.why_now}</p>
      
      {/* Reasoning path pills */}
      <div className="mt-4 flex flex-wrap items-center gap-1">
        {recommendation.reasoning_path.slice(0, 5).map((nodeId, index) => (
          <span key={`${nodeId}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span className="h-px w-2.5 bg-ai/30" />}
            <span className="max-w-[110px] truncate rounded-full bg-ai/8 px-2 py-0.5 text-[10px] font-medium text-ai ring-1 ring-ai/10">
              {nodeId.replace(/^(sig|comp|cap|init|rec)-/, "")}
            </span>
          </span>
        ))}
      </div>

      {/* Action buttons */}
      {onAccept || onDefer ? (
        <div className="mt-4 flex items-center gap-2">
          <button
            disabled={actionsDisabled || !onAccept}
            onClick={() => onAccept?.(recommendation.id)}
            className="rounded-lg bg-navy px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 disabled:opacity-60"
          >
            Accept
          </button>
          <button
            disabled={actionsDisabled || !onDefer}
            onClick={() => onDefer?.(recommendation.id)}
            className="rounded-lg border border-border/60 bg-white/60 px-3.5 py-1.5 text-xs font-semibold text-ink-2 transition-all hover:bg-surface-2 disabled:opacity-60"
          >
            Defer
          </button>
        </div>
      ) : null}
      
      <button
        className="mt-3 flex items-center gap-1 text-xs font-semibold text-ai transition-colors hover:text-ai-active-text"
        onClick={() => setShowTrace((value) => !value)}
      >
        {showTrace ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {showTrace ? "Hide trace" : "View full trace"}
      </button>
      {showTrace && (
        <div className="mt-3">
          <SubgraphViewer subgraph={recommendation.subgraph} height={320} />
        </div>
      )}
    </article>
  );
}
