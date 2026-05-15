/**
 * Landing page — the entry point for the Competitive OS demo.
 * Communicates what the system is, who it's for, and what it does
 * before the user enters the live dashboard.
 */

import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  GitBranch,
  Radio,
  Brain,
  Shield,
  TrendingUp,
  Globe2,
  Users,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Activity,
} from "lucide-react";

const STATS = [
  { value: "7", label: "Competitors tracked", icon: Users },
  { value: "5", label: "Strategic initiatives", icon: Target2 },
  { value: "35+", label: "Signals ingested", icon: Radio },
  { value: "3", label: "Active recommendations", icon: Brain },
];

function Target2({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

const FEATURES = [
  {
    icon: GitBranch,
    color: "text-[#7C3AED]",
    bg: "bg-[#F5F3FF]",
    border: "border-[#DDD6FE]",
    title: "GraphRAG Multi-hop Reasoning",
    description:
      "Signals connect to competitor capabilities, which connect to your initiatives — giving every risk score a full traceable chain across the knowledge graph.",
  },
  {
    icon: Radio,
    color: "text-[#0D9488]",
    bg: "bg-[#CCFBF1]/60",
    border: "border-[#99F6E4]",
    title: "Live Multi-source Ingestion",
    description:
      "Google News RSS, Salesforce win/loss records, Jira epics, and Slack alerts — all routed into the same graph in real time, with Claude-powered entity extraction.",
  },
  {
    icon: Brain,
    color: "text-[#1E3A8A]",
    bg: "bg-[#DBEAFE]/60",
    border: "border-[#BFDBFE]",
    title: "Executive-grade Recommendations",
    description:
      "Natural-language recommendations with three-hop evidence paths from raw signals to portfolio risk — each one reviewable, traceable, and Slack-delivered.",
  },
];

const COMPETITORS = [
  { name: "Tesla", threat: "critical", flag: "🇺🇸" },
  { name: "BYD", threat: "critical", flag: "🇨🇳" },
  { name: "Hyundai", threat: "high", flag: "🇰🇷" },
  { name: "Kia", threat: "high", flag: "🇰🇷" },
  { name: "Dacia", threat: "medium", flag: "🇷🇴" },
  { name: "MG Motor", threat: "high", flag: "🇨🇳" },
  { name: "Renault", threat: "medium", flag: "🇫🇷" },
];

const THREAT_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-yellow-400",
};

const INITIATIVES_PREVIEW = [
  { name: "EV Platform Acceleration", risk: 8.1, delta: +1.4, owner: "K. Müller" },
  { name: "Euro 7 Compliance Pack", risk: 7.6, delta: +0.8, owner: "A. Novák" },
  { name: "Software-Defined Vehicle", risk: 6.3, delta: +0.3, owner: "P. Vogt" },
  { name: "Market Share Defence — SE", risk: 5.9, delta: -0.2, owner: "L. Bernard" },
  { name: "Connected Services Platform", risk: 4.2, delta: -0.5, owner: "J. Horák" },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#111827]">
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#7C3AED]">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-[#111827]">Competitive OS</span>
            <span className="ml-1 rounded-full bg-[#F5F3FF] px-2 py-0.5 text-[10px] font-semibold text-[#7C3AED]">
              Demo
            </span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 rounded-lg bg-[#1E3A8A] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1e3a8a]/90"
          >
            Open Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF2FF] via-[#F8FAFC] to-[#F8FAFC] pb-16 pt-20">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#1E3A8A 1px, transparent 1px), linear-gradient(90deg, #1E3A8A 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-[900px] px-6 text-center">
          {/* Context pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1 text-xs text-[#1E40AF] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488] animate-pulse" />
            Live demo · Works for any industry · Škoda Auto example
          </div>

          <h1 className="mt-5 text-[48px] font-extrabold leading-[1.1] tracking-tight text-[#111827]">
            Turn market signals into <br />
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#7C3AED] bg-clip-text text-transparent">
              strategic decisions
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-[620px] text-lg leading-7 text-[#4B5563]">
            Competitive OS ingests signals from any industry, connects them to your
            strategic portfolio via a knowledge graph, and surfaces{" "}
            <strong className="text-[#111827]">executive-grade recommendations</strong>{" "}
            — each backed by a full, auditable evidence trail.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#1E3A8A]/90 hover:shadow-xl"
            >
              <Zap className="h-4 w-4" />
              Open live dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/network")}
              className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-semibold text-[#374151] shadow-sm transition hover:border-[#C7D2FE] hover:shadow"
            >
              <Globe2 className="h-4 w-4 text-[#7C3AED]" />
              View Market Atlas
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-[#E5E7EB] bg-white py-6">
        <div className="mx-auto grid max-w-[900px] grid-cols-2 gap-4 px-6 sm:grid-cols-4">
          {[
            { value: "7", label: "Competitors tracked", icon: Users, color: "text-[#1E40AF]", bg: "bg-[#EFF6FF]" },
            { value: "5", label: "Strategic initiatives", icon: Target2, color: "text-[#7C3AED]", bg: "bg-[#F5F3FF]" },
            { value: "35+", label: "Signals ingested", icon: Radio, color: "text-[#0D9488]", bg: "bg-[#F0FDFA]" },
            { value: "3", label: "Pending recommendations", icon: Brain, color: "text-[#D97706]", bg: "bg-[#FFFBEB]" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <div className="text-xl font-extrabold tabular-nums text-[#111827]">{s.value}</div>
                <div className="text-[11px] text-[#6B7280]">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Context: demo example ── */}
      <section className="mx-auto max-w-[900px] px-6 py-14">
        <div className="rounded-2xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1E3A8A] text-2xl shadow">
              🚗
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#1E40AF]">Demo loaded with a real-world example</div>
              <h2 className="mt-1 text-xl font-bold text-[#111827]">Škoda Auto — Volkswagen Group</h2>
              <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#4B5563]">
                This demo is seeded with Škoda's competitive landscape — navigating the EV transition,
                Euro 7 emissions legislation, and software-defined vehicle investment against rivals
                including Tesla and BYD. It illustrates how Competitive OS works for{" "}
                <strong>any company</strong> managing a portfolio of strategic initiatives against an
                active competitive field. The same system applies equally to SaaS, pharma, fintech,
                retail, or any industry where competitive signals drive portfolio risk.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {COMPETITORS.map((c) => (
                  <span
                    key={c.name}
                    className="flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-medium text-[#374151]"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${THREAT_DOT[c.threat]}`} />
                    {c.flag} {c.name}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-[#9CA3AF]">
                Competitors tracked in this example · any rival set can be substituted for your industry
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-[900px] px-6 pb-14">
        <div className="mb-8 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">How it works</div>
          <h2 className="mt-2 text-2xl font-bold text-[#111827]">Three layers of intelligence</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl border p-5 ${f.bg} ${f.border}`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 ${f.color} shadow-sm`}>
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-sm font-bold text-[#111827]">{f.title}</div>
              <p className="mt-1.5 text-xs leading-5 text-[#4B5563]">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live preview: initiatives + competitors split ── */}
      <section className="border-t border-[#E5E7EB] bg-white py-14">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="mb-8 text-center">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">Live data preview</div>
            <h2 className="mt-2 text-2xl font-bold text-[#111827]">Risk across Škoda's portfolio</h2>
            <p className="mt-1.5 text-sm text-[#6B7280]">Current competitive risk scores for each strategic initiative</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Initiative</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Owner</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Risk score</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">30d trend</th>
                </tr>
              </thead>
              <tbody>
                {INITIATIVES_PREVIEW.map((init, i) => {
                  const riskColor =
                    init.risk >= 8 ? "text-red-600" : init.risk >= 6.5 ? "text-amber-600" : "text-[#059669]";
                  const riskBg =
                    init.risk >= 8 ? "bg-red-50" : init.risk >= 6.5 ? "bg-amber-50" : "bg-emerald-50";
                  const trendUp = init.delta > 0;
                  return (
                    <tr
                      key={init.name}
                      className={`border-b border-[#F3F4F6] ${i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-[#111827]">{init.name}</td>
                      <td className="px-4 py-3 text-xs text-[#6B7280]">{init.owner}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${riskBg} ${riskColor}`}>
                          {init.risk.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`flex items-center justify-end gap-0.5 text-xs font-semibold tabular-nums ${trendUp ? "text-red-500" : "text-emerald-600"}`}>
                          {trendUp ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <Activity className="h-3 w-3" />
                          )}
                          {trendUp ? "+" : ""}{init.delta.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Integrations strip ── */}
      <section className="mx-auto max-w-[900px] px-6 py-14">
        <div className="mb-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">Integrations</div>
          <h2 className="mt-2 text-2xl font-bold text-[#111827]">Connected data sources</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { name: "Jira", detail: "Epics + sprint data", color: "border-[#DBEAFE] bg-[#EFF6FF]", dot: "bg-[#1E40AF]", label: "Connected" },
            { name: "Salesforce", detail: "Win/loss records", color: "border-[#DCFCE7] bg-[#F0FDF4]", dot: "bg-[#166534]", label: "Connected" },
            { name: "Slack", detail: "Alert delivery", color: "border-[#E0E7FF] bg-[#EEF2FF]", dot: "bg-[#4338CA]", label: "Connected" },
            { name: "Google News", detail: "Live RSS signals", color: "border-[#CCFBF1] bg-[#F0FDFA]", dot: "bg-[#0D9488] animate-pulse", label: "Live" },
          ].map((s) => (
            <div key={s.name} className={`rounded-xl border p-3.5 ${s.color}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#111827]">{s.name}</span>
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#374151]">
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#6B7280]">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[#E5E7EB] bg-gradient-to-br from-[#1E3A8A] to-[#4C1D95] py-16 text-center">
        <div className="mx-auto max-w-[600px] px-6">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-white/10">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Ready to explore?</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            The live dashboard is running with graph data, AI-generated recommendations,
            and full traceability from raw market signals to portfolio risk scores —
            using Škoda Auto as the demo scenario.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#1E3A8A] shadow-lg transition hover:shadow-xl"
            >
              <BarChart3 className="h-4 w-4" />
              Open dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/integrations")}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Shield className="h-4 w-4" />
              See integrations
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-white/50">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> GraphRAG reasoning</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Full evidence trails</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Provider-neutral AI</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#E5E7EB] bg-white py-5 text-center">
        <p className="text-xs text-[#9CA3AF]">
          Competitive OS · AI competition demo · All data is illustrative and auto-generated
        </p>
      </footer>
    </div>
  );
}
