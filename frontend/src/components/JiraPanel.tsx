/**
 * JiraPanel — shows mock Jira data linked to an initiative.
 *
 * Data is deterministically generated from the initiative id so every
 * initiative shows different but consistent ticket counts. No network
 * request is made; this is demo-mode mock data.
 */

import { ExternalLink, AlertCircle, CheckCircle2, Clock } from "lucide-react";

type MockJiraData = {
  epicKey: string;
  epicName: string;
  sprint: string;
  openIssues: number;
  blockers: number;
  inProgress: number;
  done: number;
  tickets: { key: string; summary: string; status: "done" | "in-progress" | "blocked" | "todo" }[];
};

// Simple deterministic hash so each initiative id produces stable mock data
function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mockDataForInitiative(initiativeId: string, initiativeName: string): MockJiraData {
  const h = hashId(initiativeId);
  const projectKey = initiativeName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "X")
    .join("");
  const epicNum = 100 + (h % 900);
  const sprint = 20 + (h % 15);
  const openIssues = 8 + (h % 20);
  const blockers = h % 4;
  const inProgress = 2 + (h % 6);
  const done = 5 + (h % 12);

  const STATUSES: Array<"done" | "in-progress" | "blocked" | "todo"> = [
    "done",
    "in-progress",
    "blocked",
    "todo",
  ];
  const SUMMARIES = [
    "Define acceptance criteria for MVP scope",
    "Integrate data pipeline with graph store",
    "Stakeholder review and sign-off",
    "Risk assessment and mitigation plan",
    "Performance benchmark against baseline",
    "Update architecture decision record",
    "QA cycle — regression suite",
    "Align with legal and compliance",
  ];

  const tickets = Array.from({ length: 4 }, (_, idx) => ({
    key: `${projectKey}-${epicNum + idx + 1}`,
    summary: SUMMARIES[(h + idx) % SUMMARIES.length],
    status: STATUSES[(h + idx) % STATUSES.length],
  }));

  return {
    epicKey: `${projectKey}-${epicNum}`,
    epicName: initiativeName,
    sprint: `Sprint ${sprint}`,
    openIssues,
    blockers,
    inProgress,
    done,
    tickets,
  };
}

const STATUS_CONFIG = {
  done: { label: "Done", icon: CheckCircle2, color: "text-teal bg-teal-bg" },
  "in-progress": { label: "In progress", icon: Clock, color: "text-navy bg-[#DBEAFE]" },
  blocked: { label: "Blocked", icon: AlertCircle, color: "text-amber bg-amber-bg" },
  todo: { label: "To do", icon: Clock, color: "text-ink-2 bg-surface-2" },
};

export function JiraPanel({
  initiativeId,
  initiativeName,
}: {
  initiativeId: string;
  initiativeName: string;
}) {
  const data = mockDataForInitiative(initiativeId, initiativeName);
  const jiraUrl = `https://competitive-os.atlassian.net/browse/${data.epicKey}`;

  return (
    <div className="space-y-4">
      {/* Epic header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {/* Jira logo mark */}
            <svg viewBox="0 0 32 32" className="h-4 w-4 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15.89 0C11.66 0 8.23 3.43 8.23 7.66v.77H4.16A4.16 4.16 0 0 0 0 12.59v15.25A4.16 4.16 0 0 0 4.16 32h11.73a4.16 4.16 0 0 0 4.16-4.16v-.77h4.07A4.16 4.16 0 0 0 28.28 22.9V7.66C28.28 3.43 24.85 0 20.62 0h-4.73ZM8.23 11.59v8.31a4.16 4.16 0 0 0 4.16 4.16h3.6v.77a.92.92 0 0 1-.92.92H4.16a.92.92 0 0 1-.92-.92V12.59c0-.51.41-.92.92-.92h4.07v-.08Zm16.81-3.93v15.24c0 .51-.41.92-.92.92h-4.07v-.08V15.5a4.16 4.16 0 0 0-4.16-4.16h-3.6v-.77c0-.51.41-.92.92-.92h11.11c.5 0 .72.41.72.92Z"
                fill="#1868DB"
              />
            </svg>
            <span className="text-xs font-bold text-ink">{data.epicKey}</span>
            <span className="rounded-full bg-[#DBEAFE] px-2 py-0.5 text-[10px] font-semibold text-[#1E40AF]">
              Epic
            </span>
          </div>
          <div className="mt-0.5 text-xs text-ink-2 line-clamp-1">{data.epicName}</div>
        </div>
        <a
          href={jiraUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border/60 bg-surface px-2.5 py-1 text-[11px] font-semibold text-[#1E40AF] hover:bg-[#DBEAFE] transition-colors"
        >
          View in Jira
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Sprint + stats */}
      <div className="rounded-lg border border-border/60 bg-surface-2/60 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-ink-3">
          {data.sprint} · Active
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-base font-bold tabular text-ink">{data.openIssues}</span>
            <span className="ml-1 text-ink-3">open</span>
          </div>
          {data.blockers > 0 && (
            <div>
              <span className="text-base font-bold tabular text-amber">{data.blockers}</span>
              <span className="ml-1 text-ink-3">blocked</span>
            </div>
          )}
          <div>
            <span className="text-base font-bold tabular text-[#1E40AF]">{data.inProgress}</span>
            <span className="ml-1 text-ink-3">in progress</span>
          </div>
          <div>
            <span className="text-base font-bold tabular text-teal">{data.done}</span>
            <span className="ml-1 text-ink-3">done</span>
          </div>
        </div>
      </div>

      {/* Ticket list */}
      <div className="space-y-2">
        {data.tickets.map((ticket) => {
          const cfg = STATUS_CONFIG[ticket.status];
          const Icon = cfg.icon;
          return (
            <div
              key={ticket.key}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-surface px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 text-[11px] font-semibold text-[#1E40AF]">{ticket.key}</span>
                <span className="truncate text-xs text-ink-2">{ticket.summary}</span>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.color}`}
              >
                <Icon className="h-2.5 w-2.5" />
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
