import { Card } from "../Card";

interface ScenarioPlannerProps {
  evAdoption: number;
  setEvAdoption: (v: number) => void;
  chineseAccess: number;
  setChineseAccess: (v: number) => void;
  activeQuadrant?: string | null;
}

export function ScenarioPlanner({ evAdoption, setEvAdoption, chineseAccess, setChineseAccess, activeQuadrant }: ScenarioPlannerProps) {
  // X: Chinese access (0=blocked → 100=unrestricted)
  // Y: EV adoption (0=stalled → 100=accelerating). For CSS positioning, top=0 so we invert.
  const xPos = Math.max(0, Math.min(100, chineseAccess));
  const yPos = Math.max(0, Math.min(100, 100 - evAdoption));

  return (
    <Card className="p-5 glass-card flex flex-col h-full">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Scenario Planner</h3>
          <div className="mt-1 text-xs text-ink-2">Move the dot across macro conditions to switch playbooks.</div>
        </div>
        <div className="text-[11px] font-semibold text-ink-3">
          Access: {chineseAccess}% · Adoption: {evAdoption}%
        </div>
      </div>
      
      {/* Quadrant Chart */}
      <div className="relative flex-1 min-h-[250px] mb-6 rounded-lg border border-border overflow-hidden grid grid-cols-2 grid-rows-2 text-sm text-ink-2">
        {/* Top Left: Fortress Europe */}
        <div
          className={`border-b border-r border-border p-3 flex items-start justify-center text-center ${
            activeQuadrant === "top-left" ? "bg-teal-bg ring-2 ring-inset ring-teal" : "bg-surface"
          }`}
        >
          <span className={`font-semibold ${activeQuadrant === "top-left" ? "text-teal" : "text-ink-2"}`}>Fortress Europe</span>
        </div>
        
        {/* Top Right: Price War */}
        <div
          className={`border-b border-border p-3 flex items-start justify-center text-center ${
            activeQuadrant === "top-right" ? "bg-amber-bg ring-2 ring-inset ring-amber" : "bg-surface"
          }`}
        >
          <span className={`font-semibold ${activeQuadrant === "top-right" ? "text-amber" : "text-ink-2"}`}>Price War</span>
        </div>
        
        {/* Bottom Left: Slow Burn */}
        <div
          className={`border-r border-border p-3 flex items-end justify-center text-center ${
            activeQuadrant === "bottom-left" ? "bg-ai-bg ring-2 ring-inset ring-ai" : "bg-surface"
          }`}
        >
          <span className={`font-semibold ${activeQuadrant === "bottom-left" ? "text-ai" : "text-ink-2"}`}>Slow Burn</span>
        </div>
        
        {/* Bottom Right: Perfect Storm */}
        <div
          className={`p-3 flex items-end justify-center text-center ${
            activeQuadrant === "bottom-right" ? "bg-surface-2 ring-2 ring-inset ring-navy" : "bg-surface"
          }`}
        >
          <span className={`font-semibold ${activeQuadrant === "bottom-right" ? "text-navy" : "text-ink-2"}`}>Perfect Storm</span>
        </div>

        {/* Axes lines (cross in middle) */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-border"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-border"></div>

        {/* Position Dot */}
        <div 
          className="absolute w-4 h-4 bg-ink rounded-full shadow-depth transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
          style={{ left: `${xPos}%`, top: `${yPos}%` }}
        />

        <div className="pointer-events-none absolute inset-x-3 bottom-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-ink-3">
          <span>Chinese blocked</span>
          <span>Chinese unrestricted</span>
        </div>
        <div className="pointer-events-none absolute left-2 top-3 text-[10px] font-semibold uppercase tracking-wide text-ink-3 [writing-mode:vertical-rl] [text-orientation:mixed]">
          EV adoption →
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-ink-2">EU BEV adoption rate</span>
            <span className="font-medium">{evAdoption}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={evAdoption}
            onChange={(e) => setEvAdoption(Number(e.target.value))}
            className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-navy"
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-ink-2">Chinese OEM EU market access</span>
            <span className="font-medium">{chineseAccess}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={chineseAccess}
            onChange={(e) => setChineseAccess(Number(e.target.value))}
            className="w-full h-2 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-navy"
          />
        </div>
      </div>
    </Card>
  );
}
