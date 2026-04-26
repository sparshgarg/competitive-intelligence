import { Link } from "react-router-dom";
import type { SignalSummary, Initiative } from "../lib/types";
import { SourcePill } from "./SourcePill";

export function TraceChain({ signal, initiative }: { signal?: SignalSummary; initiative: Initiative }) {
  const competitorName = initiative.top_competitor?.name ?? "competitive pressure";
  return (
    <div className="flex flex-wrap items-center gap-1 text-[11px]">
      {signal ? (
        <Link to={`/signals/${signal.id}`}>
          <SourcePill sourceType={signal.source_type} />
        </Link>
      ) : (
        <span className="rounded-full bg-surface-2 px-2 py-1 font-medium text-ink-2">Signal</span>
      )}
      <span className="text-ai">›</span>
      {initiative.top_competitor?.id ? (
        <Link to={`/competitors/${initiative.top_competitor.id}`} className="rounded-full bg-ai-bg px-2 py-1 font-medium text-ai">
          {competitorName}
        </Link>
      ) : (
        <span className="rounded-full bg-ai-bg px-2 py-1 font-medium text-ai">{competitorName}</span>
      )}
      <span className="text-ai">›</span>
      <Link to={`/initiatives/${initiative.id}`} className="rounded-full bg-ai-bg px-2 py-1 font-medium text-ai">
        {initiative.name}
      </Link>
    </div>
  );
}

