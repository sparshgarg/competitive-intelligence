import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card } from "../Card";
import type { Initiative } from "../../lib/types";

interface PortfolioImpactProps {
  initiatives: Initiative[];
  sliders: Record<string, number>;
}

export function PortfolioImpact({ initiatives, sliders }: PortfolioImpactProps) {
  const data = useMemo(() => {
    return initiatives.map((init) => {
      const baseExposure = init.budget * (init.current_risk_score / 10);
      
      // Calculate adjusted exposure based on sliders
      const priceFactor = 1 + (sliders.byd_price_cut / 100) * (init.price_sensitivity || 0);
      const tariffFactor = 1 - (sliders.eu_tariff / 100) * (init.tariff_dampening || 0);
      const demandFactor = 1 + (sliders.ev_demand_growth / 100) * (init.demand_elasticity || 0);
      const regFactor = 1 + (sliders.regulatory_pull / 24) * (init.compliance_urgency || 0);
      // Simplify vw platform sharing as a cost reducer
      const platformFactor = 1 - (sliders.vw_platform_sharing / 100) * 0.1;

      const adjustedExposure = baseExposure * priceFactor * tariffFactor * demandFactor * regFactor * platformFactor;
      
      return {
        name: init.name.substring(0, 25) + (init.name.length > 25 ? "..." : ""),
        base: baseExposure / 1000000,
        adjusted: adjustedExposure / 1000000,
        difference: (adjustedExposure - baseExposure) / 1000000
      };
    }).sort((a, b) => b.adjusted - a.adjusted);
  }, [initiatives, sliders]);

  return (
    <Card className="p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-ink">Portfolio Impact</h3>
        <span className="text-xs text-ink-muted">Exposure ($M)</span>
      </div>
      
      <div className="h-[250px] w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-surface-border)" />
            <XAxis type="number" tickFormatter={(val) => `$${val}M`} stroke="var(--color-ink-muted)" fontSize={11} />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={120} 
              stroke="var(--color-ink-muted)"
              fontSize={11}
              tick={{ fill: "var(--color-ink)" }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [`$${value.toFixed(1)}M`, name === 'adjusted' ? 'Adjusted Exposure' : 'Base Exposure']}
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-surface-border)', backgroundColor: 'var(--color-surface)' }}
            />
            <Bar dataKey="adjusted" radius={[0, 4, 4, 0]} animationDuration={500}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.difference > 0.5 ? '#ef4444' : entry.difference < -0.5 ? '#22c55e' : '#1e293b'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 justify-center mt-4 text-xs text-ink-muted">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Exposure Up</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-800"></div> Stable</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Exposure Down</div>
      </div>
    </Card>
  );
}
