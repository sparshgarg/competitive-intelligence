import { Card } from "../Card";

interface WhatIfSimulatorProps {
  sliders: Record<string, number>;
  setSliders: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
}

const PARAMETERS = [
  { id: "byd_price_cut", label: "BYD Price Cut %", min: 0, max: 30, format: (v: number) => `-${v}%` },
  { id: "eu_tariff", label: "EU Tariff Rate %", min: 0, max: 45, format: (v: number) => `${v}%` },
  { id: "ev_demand_growth", label: "EV Demand Growth (YoY) %", min: -20, max: 40, format: (v: number) => `${v > 0 ? "+" : ""}${v}%` },
  { id: "regulatory_pull", label: "Regulatory Acceleration (mo)", min: 0, max: 24, format: (v: number) => `${v} mo` },
  { id: "vw_platform_sharing", label: "VW Group Platform Sharing %", min: 0, max: 100, format: (v: number) => `${v}%` },
];

export function WhatIfSimulator({ sliders, setSliders }: WhatIfSimulatorProps) {
  const handleChange = (id: string, val: number) => {
    setSliders(prev => ({ ...prev, [id]: val }));
  };

  return (
    <Card className="p-5 h-full">
      <h3 className="font-semibold text-lg mb-4 text-ink">What-If Simulator</h3>
      <p className="text-xs text-ink-muted mb-6">
        Note: Current sensitivities are based on true probability derived from internal CRM data, 
        analyst reports, and supply chain intelligence.
      </p>

      <div className="space-y-5">
        {PARAMETERS.map((param) => (
          <div key={param.id}>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-muted">{param.label}</span>
              <span className="font-medium bg-surface-hover px-2 py-0.5 rounded text-xs">
                {param.format(sliders[param.id] ?? 0)}
              </span>
            </div>
            <input
              type="range"
              min={param.min}
              max={param.max}
              value={sliders[param.id] ?? 0}
              onChange={(e) => handleChange(param.id, Number(e.target.value))}
              className="w-full h-1.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-ink"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
