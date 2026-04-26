import { Cell, LabelList, ReferenceArea, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, ResponsiveContainer } from "recharts";
import { COLORS } from "../lib/colors";
import type { Competitor, Initiative } from "../lib/types";

function threatenedShare(c: Competitor, initiatives: Initiative[]) {
  const count = initiatives.filter((i) => i.top_competitor?.id === c.id).length;
  return initiatives.length ? Math.max(count / initiatives.length, c.threat_level === "high" ? 0.55 : 0.18) : 0.2;
}

export function MomentumMap({ competitors, initiatives }: { competitors: Competitor[]; initiatives: Initiative[] }) {
  const data = competitors.map((c) => ({
    ...c,
    portfolio_share: threatenedShare(c, initiatives),
    exposure_m: c.deal_loss_exposure_q / 1_000_000,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 24, right: 36, bottom: 32, left: 12 }}>
            <ReferenceArea x1={0.65} x2={1} y1={0.5} y2={1} fill={COLORS.amberBg} fillOpacity={0.55} strokeOpacity={0} />
            <XAxis
              type="number"
              dataKey="momentum_score"
              name="30-day signal velocity"
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round(Number(v) * 100)}`}
              stroke={COLORS.ink3}
              label={{ value: "30-day signal velocity", position: "insideBottom", offset: -18, fill: COLORS.ink2, fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="portfolio_share"
              name="Portfolio threatened"
              domain={[0, 1]}
              tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
              stroke={COLORS.ink3}
              label={{ value: "Portfolio threatened", angle: -90, position: "insideLeft", fill: COLORS.ink2, fontSize: 12 }}
            />
            <ZAxis dataKey="deal_loss_exposure_q" range={[80, 900]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: COLORS.ink3 }}
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const row = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded border-2 border-border bg-surface p-3 text-xs transition-all duration-300">
                    <div className="mb-2 border-b border-border pb-2 font-semibold text-ink flex justify-between items-center">
                      <span>{row.name}</span>
                      {row.threat_level === "high" && <span className="ml-2 rounded-full bg-amber-bg px-1.5 py-0.5 text-[10px] text-amber">High Threat</span>}
                    </div>
                    <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-1">
                      <span className="text-ink-2">Momentum:</span>
                      <span className="font-medium text-ink">{Math.round(row.momentum_score * 100)}/100</span>
                      <span className="text-ink-2">Threat area:</span>
                      <span className="font-medium text-ink">{Math.round(row.portfolio_share * 100)}%</span>
                      <span className="text-ink-2">Exposure:</span>
                      <span className="font-medium text-amber">${row.exposure_m.toFixed(1)}M</span>
                    </div>
                  </div>
                );
              }}
            />
            <Scatter data={data} fill={COLORS.navy} isAnimationActive={true} animationDuration={1500}>
              {data.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={entry.threat_level === "high" ? COLORS.amber : COLORS.navy}
                  stroke={entry.threat_level === "high" ? COLORS.ink : COLORS.navy}
                  strokeWidth={entry.threat_level === "high" ? 2 : 1}
                  className={entry.threat_level === "high" ? "animate-pulse-soft" : "transition-all duration-300 hover:opacity-80"}
                />
              ))}
              <LabelList 
                dataKey="name" 
                content={(props: any) => {
                  const { x, y, value, index } = props;
                  const competitor = data[index];
                  const isHigh = competitor.threat_level === "high";
                  // Always place label above the dot; offset further for larger bubbles
                  const yOffset = isHigh ? -22 : -16;
                  
                  return (
                    <text
                      x={x}
                      y={y + yOffset}
                      fill={COLORS.ink}
                      fontSize={11}
                      fontWeight={isHigh ? 700 : 600}
                      textAnchor="middle"
                      style={{ textShadow: "0 1px 3px rgba(255,255,255,0.9), 0 0px 6px rgba(255,255,255,0.7)" }}
                    >
                      {value}
                    </text>
                  );
                }} 
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <div className="rounded border border-amber bg-amber-bg p-3">
          <div className="text-xs font-semibold text-amber">Danger zone</div>
          <div className="mt-1 text-xs leading-5 text-amber">
            Top-right competitors are moving fast and touching a large share of the portfolio. These deserve exec-level attention.
          </div>
        </div>
        <div className="rounded border border-border bg-surface-2 p-3">
          <div className="text-xs font-semibold text-ink">Bubble size</div>
          <div className="mt-1 text-xs leading-5 text-ink-2">Represents quarterly deal-loss exposure or commercial pressure.</div>
        </div>
        <div className="rounded border border-border bg-surface-2 p-3">
          <div className="text-xs font-semibold text-ink">CSO readout</div>
          <div className="mt-1 text-xs leading-5 text-ink-2">
            Use this map to decide where to request deeper trace evidence, not as a vanity chart.
          </div>
        </div>
      </div>
    </div>
  );
}

