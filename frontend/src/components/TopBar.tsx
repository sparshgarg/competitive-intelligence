import { Search, Activity, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Integration status pills shown beneath the main bar
const INTEGRATIONS = [
  {
    label: "Jira",
    status: "connected",
    color: "text-[#1E40AF] bg-[#DBEAFE]",
    dot: "bg-[#1E40AF]",
  },
  {
    label: "Salesforce",
    status: "connected",
    color: "text-[#166534] bg-[#DCFCE7]",
    dot: "bg-[#166534]",
  },
  {
    label: "Slack",
    status: "connected",
    color: "text-[#4338CA] bg-[#E0E7FF]",
    dot: "bg-[#4338CA]",
  },
  {
    label: "Google News",
    status: "live",
    color: "text-[#0D9488] bg-[#CCFBF1]",
    dot: "bg-[#0D9488]",
    pulse: true,
  },
];

function GraphUpdatedPill() {
  const [minutes, setMinutes] = useState(14);
  useEffect(() => {
    const t = setInterval(() => setMinutes((m) => m + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-bg px-2.5 py-1 text-[10px] font-semibold text-teal ring-1 ring-teal/20">
      <Activity className="h-3 w-3" />
      Graph updated {minutes} min ago
    </span>
  );
}

export function TopBar({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-white/70 backdrop-blur-md">
      {/* Main row */}
      <div className="flex h-14 items-center justify-between px-6">
        <div>
          <div className="text-sm font-bold text-ink tracking-tight">{title}</div>
          {breadcrumb ? <div className="text-[11px] text-ink-3">{breadcrumb}</div> : null}
        </div>
        <div className="flex items-center gap-3">
          <GraphUpdatedPill />
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-surface-2/60 px-3 py-1.5 text-[11px] font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink"
          >
            <Home className="h-3 w-3" />
            Overview
          </Link>
          <div className="hidden md:flex items-center h-9 w-[220px] rounded-lg border border-border/60 bg-surface-2/60 px-3 gap-2 transition-colors focus-within:border-navy/30 focus-within:ring-2 focus-within:ring-navy/10">
            <Search className="h-3.5 w-3.5 text-ink-3 shrink-0" />
            <input
              placeholder="Search signals, competitors…"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 outline-none"
            />
          </div>
          <button className="rounded-lg bg-gradient-to-r from-navy to-navy-2/80 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110">
            Share
          </button>
        </div>
      </div>

      {/* Integration strip */}
      <div className="flex items-center gap-2 px-6 pb-2">
        <span className="text-[10px] font-medium text-ink-3 mr-1">Connected sources</span>
        {INTEGRATIONS.map((integration) => (
          <span
            key={integration.label}
            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ring-current/10 ${integration.color}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${integration.dot} ${integration.pulse ? "animate-pulse" : ""}`}
            />
            {integration.label}
            <span className="opacity-60">{integration.status === "live" ? "· live" : "· synced"}</span>
          </span>
        ))}
      </div>
    </header>
  );
}
