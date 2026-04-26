export type TempoCompetitor = {
  id: "planview" | "servicenow" | "planisware" | "jira_align";
  name: string;
  archetype: string;
  ai_posture: string;
  primary_weakness: string;
  what_we_pitch: string;
};

export const TEMPO_LANDSCAPE = {
  marketShift: [
    {
      title: "Shift to adaptive, execution-aware SPM",
      detail:
        "Enterprises are rejecting rigid, top-down planning systems in favor of real-time orchestration that ties strategy + finance + capacity directly to execution telemetry (Jira).",
    },
    {
      title: "AI arms race: assistive → agentic",
      detail:
        "Generative copilots are table stakes; agentic automation (autonomous rebalancing, optimization, simulations) is becoming the real differentiator.",
    },
    {
      title: "Consolidation + ecosystem lock-in",
      detail:
        "Legacy vendors are acquiring into the execution layer; ITSM ecosystems push governance from IT outward—raising switching costs and rigidity.",
    },
  ],
  competitors: [
    {
      id: "planview",
      name: "Planview",
      archetype: "Monolithic enterprise planner (acquired aggregation)",
      ai_posture: "Anvi (conversational insights) + Viz analytics",
      primary_weakness: "Configuration fatigue, fragmented UI/codebases",
      what_we_pitch: "Deploys in days on Jira telemetry; avoids “configuration hell” and data-sync latency.",
    },
    {
      id: "servicenow",
      name: "ServiceNow SPM",
      archetype: "IT-led governance engine (Now Platform / ITSM)",
      ai_posture: "Now Assist (generative) + strategic planning workspaces",
      primary_weakness: "Rigidity + ecosystem lock‑in; ITSM paradigm friction for product teams",
      what_we_pitch: "Product-led orchestration above Jira; governance without forcing teams into helpdesk workflows.",
    },
    {
      id: "planisware",
      name: "Planisware",
      archetype: "AI-powered pure play (single codebase)",
      ai_posture: "Oscar (agentic) + optimization algorithms",
      primary_weakness: "Lower brand penetration in general IT portfolios",
      what_we_pitch: "Execution reality advantage + land-and-expand in Atlassian accounts; match agentic roadmap with Loop recommendations.",
    },
    {
      id: "jira_align",
      name: "Atlassian Jira Align",
      archetype: "Framework dictator (SAFe-centric rollups)",
      ai_posture: "No prominent AI differentiator",
      primary_weakness: "Brittle adoption; requires perfect data hygiene; methodological rigidity",
      what_we_pitch: "Off-ramp from Align fatigue: flexible hierarchies + roadmaps + capacity planning without enforcing SAFe.",
    },
  ] as TempoCompetitor[],
  strategicVectors: [
    {
      title: "Weaponize the “execution reality” advantage",
      bullets: [
        "Expose the “watermelon effect” (green exec dashboards, red execution reality).",
        "Anchor Loop as “Execution-aware SPM” built on Jira telemetry + real capacity math (timesheets/capacity planner).",
      ],
    },
    {
      title: "Evolve from BI export to native AI synthesis",
      bullets: [
        "Don’t just connect to PowerBI/Tableau—synthesize insights inside Loop.",
        "Compete with one-click executive dashboards and recommendations that act on real-time flow + capacity signals.",
      ],
    },
    {
      title: "Unify packaging to reduce cloud sticker shock",
      bullets: [
        "Collections/Loop tiering must abstract module fragmentation.",
        "Win against “big bang” procurement by shortening time-to-value and simplifying licensing.",
      ],
    },
  ],
} as const;

