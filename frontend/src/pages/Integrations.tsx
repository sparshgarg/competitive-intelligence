/**
 * Integrations page — shows all connected data sources with live status,
 * sync stats, and configuration options.
 *
 * All data is mock/static for the demo. The architecture section explains
 * how new sources can be wired in via the backend ingestion pipeline.
 */

import { CheckCircle2, RefreshCw, ExternalLink, AlertCircle, Zap } from "lucide-react";

type IntegrationStatus = "connected" | "live" | "disconnected";

type Integration = {
  id: string;
  name: string;
  category: "execution" | "crm" | "comms" | "intelligence";
  description: string;
  status: IntegrationStatus;
  detail: string;
  stats: { label: string; value: string }[];
  lastSync: string;
  docsUrl: string;
  color: string;
  textColor: string;
  iconBg: string;
  logo: React.ReactNode;
};

const INTEGRATIONS: Integration[] = [
  {
    id: "jira",
    name: "Jira",
    category: "execution",
    description: "Bidirectional sync of epics, sprints, and issues. Competitive risk scores are written back as Jira labels so affected tickets surface automatically in team backlogs.",
    status: "connected",
    detail: "competitive-os.atlassian.net",
    stats: [
      { label: "Projects linked", value: "5" },
      { label: "Epics mapped", value: "23" },
      { label: "Open issues tracked", value: "148" },
      { label: "Risk labels written back", value: "12" },
    ],
    lastSync: "4 min ago",
    docsUrl: "https://developer.atlassian.com/cloud/jira/platform/rest/v3/",
    color: "border-[#DBEAFE] bg-[#DBEAFE]/40",
    textColor: "text-[#1E40AF]",
    iconBg: "bg-[#1868DB]",
    logo: (
      <svg viewBox="0 0 32 32" className="h-5 w-5 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.89 0C11.66 0 8.23 3.43 8.23 7.66v.77H4.16A4.16 4.16 0 0 0 0 12.59v15.25A4.16 4.16 0 0 0 4.16 32h11.73a4.16 4.16 0 0 0 4.16-4.16v-.77h4.07A4.16 4.16 0 0 0 28.28 22.9V7.66C28.28 3.43 24.85 0 20.62 0h-4.73Z" fill="white"/>
      </svg>
    ),
  },
  {
    id: "salesforce",
    name: "Salesforce",
    category: "crm",
    description: "Win/loss records, opportunity stage data, and deal amounts pulled from Salesforce CRM. Each loss feeds into the competitive graph as a signal and updates competitor exposure scores in real time.",
    status: "connected",
    detail: "competitive-os.salesforce.com",
    stats: [
      { label: "Deals synced (90d)", value: "20" },
      { label: "Win/loss records", value: "20" },
      { label: "ARR at competitive risk", value: "$4.8M" },
      { label: "Loss reasons extracted", value: "9" },
    ],
    lastSync: "12 min ago",
    docsUrl: "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/",
    color: "border-[#DCFCE7] bg-[#DCFCE7]/40",
    textColor: "text-[#166534]",
    iconBg: "bg-[#00A1E0]",
    logo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.07 3.45a4.57 4.57 0 0 1 3.28-1.39c1.55 0 2.93.77 3.77 1.95a5.22 5.22 0 0 1 2.17-.47 5.27 5.27 0 0 1 5.27 5.27c0 .5-.07.97-.2 1.42A4.13 4.13 0 0 1 21.5 18H5.63A4.63 4.63 0 0 1 1 13.37c0-2.2 1.54-4.04 3.6-4.52a4.37 4.37 0 0 1 5.47-5.4Z"/>
      </svg>
    ),
  },
  {
    id: "slack",
    name: "Slack",
    category: "comms",
    description: "Outbound alerts for new recommendations, risk score spikes, and newly ingested high-impact signals. Alerts are routed to configurable channels by initiative owner or risk tier.",
    status: "connected",
    detail: "competitive-os.slack.com · #strategy-alerts",
    stats: [
      { label: "Alerts sent (7d)", value: "14" },
      { label: "Channels configured", value: "3" },
      { label: "Accepted via Slack", value: "4" },
      { label: "Avg response time", value: "23 min" },
    ],
    lastSync: "Live",
    docsUrl: "https://api.slack.com/messaging/webhooks",
    color: "border-[#E0E7FF] bg-[#E0E7FF]/40",
    textColor: "text-[#4338CA]",
    iconBg: "bg-[#4A154B]",
    logo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.04 15.5a2.04 2.04 0 0 1-2.04 2.04A2.04 2.04 0 0 1 .96 15.5a2.04 2.04 0 0 1 2.04-2.04h2.04v2.04Zm1.02 0a2.04 2.04 0 0 1 2.04-2.04 2.04 2.04 0 0 1 2.04 2.04v5.1a2.04 2.04 0 0 1-2.04 2.04A2.04 2.04 0 0 1 6.06 20.6v-5.1ZM8.1 5.04a2.04 2.04 0 0 1-2.04-2.04A2.04 2.04 0 0 1 8.1.96a2.04 2.04 0 0 1 2.04 2.04v2.04H8.1Zm0 1.02a2.04 2.04 0 0 1 2.04 2.04 2.04 2.04 0 0 1-2.04 2.04H2.96a2.04 2.04 0 0 1-2.04-2.04A2.04 2.04 0 0 1 2.96 6.06H8.1ZM18.96 8.1a2.04 2.04 0 0 1 2.04-2.04 2.04 2.04 0 0 1 2.04 2.04 2.04 2.04 0 0 1-2.04 2.04h-2.04V8.1Zm-1.02 0a2.04 2.04 0 0 1-2.04 2.04 2.04 2.04 0 0 1-2.04-2.04V2.96a2.04 2.04 0 0 1 2.04-2.04 2.04 2.04 0 0 1 2.04 2.04V8.1ZM15.9 18.96a2.04 2.04 0 0 1 2.04 2.04 2.04 2.04 0 0 1-2.04 2.04 2.04 2.04 0 0 1-2.04-2.04v-2.04h2.04Zm0-1.02a2.04 2.04 0 0 1-2.04-2.04 2.04 2.04 0 0 1 2.04-2.04h5.1a2.04 2.04 0 0 1 2.04 2.04 2.04 2.04 0 0 1-2.04 2.04h-5.1Z"/>
      </svg>
    ),
  },
  {
    id: "google-news",
    name: "Google News RSS",
    category: "intelligence",
    description: "Live RSS ingestion from Google News search queries for each tracked competitor. Every article is run through the Claude entity extraction pipeline, and relevant signals are added to the competitive graph within seconds of publication.",
    status: "live",
    detail: "5 feed queries active · polling every 15 min",
    stats: [
      { label: "Signals ingested (30d)", value: "35" },
      { label: "Competitors tracked", value: "7" },
      { label: "Avg extraction confidence", value: "91%" },
      { label: "Last article ingested", value: "14 min ago" },
    ],
    lastSync: "14 min ago",
    docsUrl: "https://news.google.com/rss",
    color: "border-[#CCFBF1] bg-[#CCFBF1]/40",
    textColor: "text-[#0D9488]",
    iconBg: "bg-[#0D9488]",
    logo: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-1-5h2v2h-2v-2Zm0-8h2v6h-2V7Z"/>
      </svg>
    ),
  },
];

const PLANNED: { name: string; description: string }[] = [
  { name: "GitHub", description: "Competitor open-source activity as an engineering velocity signal." },
  { name: "LinkedIn Jobs", description: "Competitor hiring patterns as a capability investment proxy." },
  { name: "Gartner Peer Insights", description: "Review velocity and sentiment delta as an analyst engagement signal." },
  { name: "SEC EDGAR", description: "10-K / 10-Q filings for competitor investment and risk disclosures." },
  { name: "HubSpot CRM", description: "Alternative CRM source for win/loss records." },
  { name: "G2 Reviews", description: "Review score changes as a product sentiment signal." },
];

const CATEGORY_LABEL: Record<string, string> = {
  execution: "Execution",
  crm: "CRM",
  comms: "Comms",
  intelligence: "Intelligence",
};

const STATUS_BADGE: Record<IntegrationStatus, { label: string; classes: string; dot: string }> = {
  connected: { label: "Connected", classes: "bg-[#DCFCE7] text-[#166534]", dot: "bg-[#166534]" },
  live: { label: "Live", classes: "bg-[#CCFBF1] text-[#0D9488]", dot: "bg-[#0D9488] animate-pulse" },
  disconnected: { label: "Disconnected", classes: "bg-surface-2 text-ink-3", dot: "bg-ink-3" },
};

export function Integrations() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink">Integrations</h2>
        <p className="mt-1 text-sm text-ink-2">
          Competitive OS ingests signals from execution tools, CRM, comms, and live intelligence feeds.
          Each source routes into the same knowledge graph — giving every recommendation a traceable chain
          back to raw evidence.
        </p>
      </div>

      {/* Architecture callout */}
      <div className="flex items-start gap-3 rounded-xl border border-ai/20 bg-ai-bg/60 p-4">
        <Zap className="mt-0.5 h-5 w-5 shrink-0 text-ai" />
        <div>
          <div className="text-sm font-semibold text-ai">How the ingestion pipeline works</div>
          <p className="mt-1 text-xs leading-5 text-ink-2">
            Every source maps to a <span className="font-medium text-ink">Signal</span> in the knowledge graph.
            Signals are entity-extracted by Claude, then connected to <span className="font-medium text-ink">Competitor</span> and{" "}
            <span className="font-medium text-ink">Capability</span> nodes via MENTIONS edges.
            Multi-hop graph traversal (GraphRAG) then scores each <span className="font-medium text-ink">Initiative</span>'s risk
            across the full three-hop path — so a news article that mentions a competitor capability gap
            flows through to the correct portfolio initiative risk score within seconds.
          </p>
        </div>
      </div>

      {/* Connected integrations */}
      <div>
        <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-3">Active sources</div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {INTEGRATIONS.map((integration) => {
            const badge = STATUS_BADGE[integration.status];
            return (
              <div
                key={integration.id}
                className={`glass-card rounded-xl border p-5 ${integration.color}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${integration.iconBg}`}>
                      {integration.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">{integration.name}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.classes}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </div>
                      <div className={`text-[11px] mt-0.5 ${integration.textColor} opacity-80`}>{integration.detail}</div>
                    </div>
                  </div>
                  <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-medium text-ink-3">
                    {CATEGORY_LABEL[integration.category]}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs leading-5 text-ink-2">{integration.description}</p>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {integration.stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg bg-white/50 px-3 py-2">
                      <div className="text-base font-bold tabular text-ink">{stat.value}</div>
                      <div className="text-[10px] text-ink-3">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-ink-3">
                    <RefreshCw className="h-3 w-3" />
                    Last sync: {integration.lastSync}
                  </div>
                  <a
                    href={integration.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${integration.textColor} hover:underline`}
                  >
                    API docs
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Planned integrations */}
      <div>
        <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-ink-3">On the roadmap</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLANNED.map((p) => (
            <div key={p.name} className="rounded-xl border border-dashed border-border bg-surface/40 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-ink-3" />
                <span className="text-sm font-semibold text-ink-2">{p.name}</span>
              </div>
              <p className="mt-1.5 text-xs text-ink-3">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
