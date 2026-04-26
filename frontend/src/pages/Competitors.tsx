import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { api } from "../lib/api";
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

function formatCapName(id: string) {
  return id.replace("cap-", "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function Competitors() {
  const competitors = useQuery({ queryKey: ["competitors"], queryFn: api.competitors });

  if (competitors.isLoading) {
    return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Loading competitors...</div>;
  }
  if (competitors.isError || !competitors.data) {
    return <div className="rounded border border-border bg-amber-bg p-6 text-sm text-amber">Failed to load competitors.</div>;
  }

  // Prep data for Scatter Chart
  const scatterData = competitors.data.map(c => ({
    name: c.name,
    momentum: c.momentum_score * 100,
    exposure: c.deal_loss_exposure_q / 1000000,
    signals: c.total_signals_30d,
    threat: c.threat_level
  }));

  const getThreatColor = (level: string) => {
    if (level === "high") return "#e11d48"; // Rose-600
    if (level === "medium") return "#d97706"; // Amber-600
    return "#0d9488"; // Teal-600
  };

  const getThreatBg = (level: string) => {
    if (level === "high") return "bg-rose-50 border-rose-200";
    if (level === "medium") return "bg-amber-50 border-amber-200";
    return "bg-teal-50 border-teal-200";
  };

  const getThreatBadge = (level: string) => {
    if (level === "high") return "bg-rose-100 text-rose-700 ring-rose-500/30";
    if (level === "medium") return "bg-amber-100 text-amber-700 ring-amber-500/30";
    return "bg-teal-100 text-teal-700 ring-teal-500/30";
  };

  return (
    <div className="space-y-6">
      <Card title="Market Pressure Atlas" subtitle="Commercial exposure vs. competitive velocity across all tracked OEMs.">
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis type="number" dataKey="momentum" name="Momentum" unit="/100" tick={{ fill: '#737373', fontSize: 12 }} stroke="#a3a3a3" />
              <YAxis type="number" dataKey="exposure" name="Deal Exposure" unit="M" tick={{ fill: '#737373', fontSize: 12 }} stroke="#a3a3a3" />
              <ZAxis type="number" dataKey="signals" range={[100, 600]} name="Signal Volume" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e5e5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value, name) => {
                  if (name === "Deal Exposure") return [`$${value}M`, name];
                  return [value, name];
                }}
              />
              <Scatter data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getThreatColor(entry.threat)} fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {competitors.data.map((c) => {
          const radarData = c.capabilities.map(cap => ({
            subject: formatCapName(cap.capability_id),
            A: cap.strength,
            fullMark: 5
          }));

          return (
            <Link key={c.id} to={`/competitors/${c.id}`} className="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-navy/50 flex flex-col">
              <div className={`h-2 w-full ${getThreatColor(c.threat_level) === '#e11d48' ? 'bg-gradient-to-r from-rose-400 to-rose-600' : getThreatColor(c.threat_level) === '#d97706' ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-teal-400 to-teal-600'}`} />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 shrink-0 rounded-lg border border-border bg-surface flex items-center justify-center overflow-hidden">
                      <img 
                        src={`https://logo.clearbit.com/${c.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`} 
                        alt={c.name}
                        className="h-full w-full object-contain p-1"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `<span class="text-xl font-bold text-ink-3">${c.name.charAt(0)}</span>`;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-lg font-bold text-ink group-hover:text-navy transition-colors">{c.name}</div>
                      <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-ink-2">{c.segment}</div>
                    </div>
                  </div>
                  <div className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1 ring-inset ${getThreatBadge(c.threat_level)}`}>
                    {c.threat_level} Threat
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink-2 line-clamp-2 min-h-[40px]">
                  {c.description}
                </p>

                <div className="mt-6 flex flex-1 gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1.5">
                        <span>Momentum</span>
                        <span>{(c.momentum_score * 100).toFixed(0)}/100</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full bg-navy rounded-full" style={{ width: `${c.momentum_score * 100}%` }} />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-ink mb-1.5">
                        <span>Deal Loss Exposure</span>
                        <span>${(c.deal_loss_exposure_q / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full bg-amber rounded-full" style={{ width: `${Math.min(100, (c.deal_loss_exposure_q / 5000000) * 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  {radarData.length > 0 && (
                    <div className="h-28 w-28 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid gridType="polygon" stroke="#e5e5e5" />
                          <PolarAngleAxis dataKey="subject" tick={false} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                          <Radar name={c.name} dataKey="A" stroke={getThreatColor(c.threat_level)} fill={getThreatColor(c.threat_level)} fillOpacity={0.4} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

