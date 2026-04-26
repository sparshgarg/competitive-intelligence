import { useEffect, useMemo, useState } from "react";
import { ScenarioPlanner } from "../components/war-room/ScenarioPlanner";
import { WhatIfSimulator } from "../components/war-room/WhatIfSimulator";
import { ResponsePlaybook } from "../components/war-room/ResponsePlaybook";
import { PortfolioImpact } from "../components/war-room/PortfolioImpact";
import { StrategicBrief } from "../components/war-room/StrategicBrief";
import { api } from "../lib/api";
import type { Scenario, Initiative } from "../lib/types";

export function StrategyWarRoom() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);

  // Quadrant state
  const [evAdoption, setEvAdoption] = useState(50);
  const [chineseAccess, setChineseAccess] = useState(50);

  // What-If Simulator state
  const [sliders, setSliders] = useState<Record<string, number>>({
    byd_price_cut: 0,
    eu_tariff: 20,
    ev_demand_growth: 5,
    regulatory_pull: 0,
    vw_platform_sharing: 50,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [scenariosData, initiativesData] = await Promise.all([
          api.scenarios(),
          api.initiatives(),
        ]);
        setScenarios(scenariosData);
        setInitiatives(initiativesData);
      } catch (e) {
        console.error("Failed to load war room data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Determine active scenario based on quadrant
  const activeScenario = useMemo(() => {
    if (scenarios.length === 0) return null;

    const isHighAccess = chineseAccess >= 50;
    const isHighAdoption = evAdoption >= 50;

    let targetQuadrant = "";
    // X-axis: Chinese OEM EU market access (left=blocked, right=unrestricted)
    // Y-axis: EU BEV adoption (top=accelerating, bottom=stalled)
    if (isHighAccess && isHighAdoption) targetQuadrant = "top-right"; // Price War
    else if (!isHighAccess && isHighAdoption) targetQuadrant = "top-left"; // Fortress Europe
    else if (!isHighAccess && !isHighAdoption) targetQuadrant = "bottom-left"; // Slow Burn (Chinese blocked + EV stalls)
    else targetQuadrant = "bottom-right"; // Perfect Storm (Chinese enter + EV stalls)

    return scenarios.find(s => s.quadrant === targetQuadrant) || null;
  }, [chineseAccess, evAdoption, scenarios]);

  if (loading) {
    return <div className="rounded border border-border bg-surface p-6 text-sm text-ink-2">Loading War Room…</div>;
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-3">Strategy</div>
        <h1 className="mt-1 text-2xl font-semibold text-ink">What‑If Analysis</h1>
        <p className="mt-1 text-sm text-ink-2">
          Scenario planning + what-if simulation + response playbooks, with an AI executive brief on demand.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <ScenarioPlanner
            evAdoption={evAdoption}
            setEvAdoption={setEvAdoption}
            chineseAccess={chineseAccess}
            setChineseAccess={setChineseAccess}
            activeQuadrant={activeScenario?.quadrant ?? null}
          />
          <WhatIfSimulator sliders={sliders} setSliders={setSliders} />
        </div>

        <div className="space-y-6 lg:col-span-5">
          <ResponsePlaybook scenario={activeScenario} />
          <PortfolioImpact initiatives={initiatives} sliders={sliders} />
        </div>
      </div>

      <div className="mt-6">
        <StrategicBrief sliders={sliders} scenarioName={activeScenario?.name || "Custom"} />
      </div>
    </div>
  );
}
