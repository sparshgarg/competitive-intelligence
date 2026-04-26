import { Card } from "../Card";

interface ScenarioPlannerProps {
  evAdoption: number;
  setEvAdoption: (v: number) => void;
  chineseAccess: number;
  setChineseAccess: (v: number) => void;
}

export function ScenarioPlanner({ evAdoption, setEvAdoption, chineseAccess, setChineseAccess }: ScenarioPlannerProps) {
  // Map values to 0-100% for positioning
  // Chinese Access: 0 = blocked, 100 = unrestricted
  // EV Adoption: 0 = stalled, 100 = booms
  const xPos = Math.max(0, Math.min(100, chineseAccess));
  const yPos = Math.max(0, Math.min(100, 100 - evAdoption)); // Invert Y for top=100%

  return (
    <Card className="p-5 flex flex-col h-full">
      <h3 className="font-semibold text-lg mb-4 text-ink">Scenario Planner</h3>
      
      {/* Quadrant Chart */}
      <div className="relative flex-1 min-h-[250px] mb-6 rounded-lg border border-surface-border overflow-hidden grid grid-cols-2 grid-rows-2 text-sm text-ink-muted">
        {/* Top Left: Price War */}
        <div className="bg-blue-50/50 border-b border-r border-surface-border p-3 flex items-start justify-center text-center">
          <span className="font-medium text-blue-700">Price War</span>
        </div>
        
        {/* Top Right: Green Rush */}
        <div className="bg-green-50/50 border-b border-surface-border p-3 flex items-start justify-center text-center">
          <span className="font-medium text-green-700">Green Rush</span>
        </div>
        
        {/* Bottom Left: Slow Burn */}
        <div className="bg-purple-50/50 border-r border-surface-border p-3 flex items-end justify-center text-center">
          <span className="font-medium text-purple-700">Slow Burn</span>
        </div>
        
        {/* Bottom Right: Perfect Storm / Fortress Europe */}
        <div className="bg-amber-50/50 p-3 flex items-end justify-center text-center">
          <span className="font-medium text-amber-700">Perfect Storm</span>
        </div>

        {/* Axes lines (cross in middle) */}
        <div className="absolute top-1/2 left-0 w-full h-px bg-surface-border"></div>
        <div className="absolute top-0 left-1/2 w-px h-full bg-surface-border"></div>

        {/* Position Dot */}
        <div 
          className="absolute w-4 h-4 bg-ink rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
          style={{ left: `${xPos}%`, top: `${yPos}%` }}
        />
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-ink-muted">EU EV Adoption Rate</span>
            <span className="font-medium">{evAdoption}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={evAdoption}
            onChange={(e) => setEvAdoption(Number(e.target.value))}
            className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-ink"
          />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-ink-muted">Chinese Market Access</span>
            <span className="font-medium">{chineseAccess}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={chineseAccess}
            onChange={(e) => setChineseAccess(Number(e.target.value))}
            className="w-full h-2 bg-surface-hover rounded-lg appearance-none cursor-pointer accent-ink"
          />
        </div>
      </div>
    </Card>
  );
}
