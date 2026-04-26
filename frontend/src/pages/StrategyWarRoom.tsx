import { useState, useEffect, useMemo } from "react";
import { TopBar } from "../components/TopBar";
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
    if (isHighAccess && isHighAdoption) targetQuadrant = "top-left"; // Price War (Chinese enter + EV booms)
    else if (!isHighAccess && isHighAdoption) targetQuadrant = "top-right"; // Green Rush (Chinese blocked + EV booms)
    else if (!isHighAccess && !isHighAdoption) targetQuadrant = "bottom-left"; // Slow Burn (Chinese blocked + EV stalls)
    else targetQuadrant = "bottom-right"; // Perfect Storm (Chinese enter + EV stalls)

    return scenarios.find(s => s.quadrant === targetQuadrant) || null;
  }, [chineseAccess, evAdoption, scenarios]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar title="Strategy War Room" breadcrumb="Strategy / War Room" />
        <div className="flex-1 p-8 flex items-center justify-center text-ink-muted">Loading War Room...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Strategy War Room" breadcrumb="Strategy / War Room" />
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Strategy War Room</h1>
          <p className="text-ink-muted mt-1">Interactive scenario planning & response recommendations</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Column (60%) */}
          <div className="lg:col-span-7 space-y-6">
            <ScenarioPlanner 
              evAdoption={evAdoption} 
              setEvAdoption={setEvAdoption}
              chineseAccess={chineseAccess}
              setChineseAccess={setChineseAccess}
            />
            <WhatIfSimulator sliders={sliders} setSliders={setSliders} />
          </div>

          {/* Right Column (40%) */}
          <div className="lg:col-span-5 space-y-6">
            <ResponsePlaybook scenario={activeScenario} />
            <PortfolioImpact initiatives={initiatives} sliders={sliders} />
          </div>
        </div>

        {/* Bottom Full Width */}
        <StrategicBrief sliders={sliders} scenarioName={activeScenario?.name || "Custom"} />
      </main>
    </div>
  );
}
