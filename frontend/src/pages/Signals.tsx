import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { api } from "../lib/api";

export function Signals() {
  const [q, setQ] = useState("");
  const [source, setSource] = useState<string>("all");

  const queryKey = useMemo(() => ["signals", { q, source }], [q, source]);
  const signals = useQuery({
    queryKey,
    queryFn: () => api.signals({ days: 90, q: q.trim() || undefined, source_type: source === "all" ? undefined : source }),
  });

  return (
    <Card title="Signals" subtitle="Filter and open a signal to see its downstream propagation.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title/content…"
          className="h-10 w-full rounded border border-border bg-surface px-3 text-sm text-ink placeholder:text-ink-3 sm:max-w-[420px]"
        />
        <select value={source} onChange={(e) => setSource(e.target.value)} className="h-10 rounded border border-border bg-surface px-3 text-sm text-ink">
          <option value="all">All sources</option>
          <option value="news">News</option>
          <option value="analyst">Analyst</option>
          <option value="crm">CRM</option>
          <option value="cpq">CPQ</option>
          <option value="social">Social</option>
        </select>
      </div>

      <div className="mt-4">
        {signals.isLoading ? (
          <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Loading signals...</div>
        ) : signals.isError ? (
          <div className="rounded border border-border bg-amber-bg p-6 text-sm text-amber">Failed to load signals.</div>
        ) : (
          <div className="divide-y divide-border">
            {(signals.data ?? []).map((s) => (
              <Link key={s.id} to={`/signals/${s.id}`} className="block py-4 hover:bg-surface-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">{s.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-2">
                      <span className="rounded px-2 py-0.5 text-[11px] font-medium text-ink-2 ring-1 ring-border">{s.source_type}</span>
                      <span className="truncate">{s.source_name}</span>
                      {(s.competitor_ids ?? []).length ? (
                        <span className="rounded px-2 py-0.5 text-[11px] text-ink-2 ring-1 ring-border">Competitors: {s.competitor_ids.length}</span>
                      ) : null}
                      {(s.initiative_ids ?? []).length ? (
                        <span className="rounded px-2 py-0.5 text-[11px] text-ink-2 ring-1 ring-border">Initiatives: {s.initiative_ids.length}</span>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-[11px] text-ink-3">{new Date(s.published_at).toLocaleDateString()}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

