import { useState } from "react";
import { ChevronDown, ChevronRight, Shield, Swords, Handshake, CornerUpLeft } from "lucide-react";
import { Card } from "../Card";
import type { Scenario, StrategyResponse } from "../../lib/types";

interface ResponsePlaybookProps {
  scenario: Scenario | null;
}

export function ResponsePlaybook({ scenario }: ResponsePlaybookProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!scenario) {
    return (
      <Card className="p-5 h-full flex items-center justify-center text-ink-muted">
        Select a scenario to view playbooks
      </Card>
    );
  }

  const renderCard = (type: "defend" | "attack" | "partner" | "retreat", data: StrategyResponse, icon: React.ReactNode, colorClass: string) => {
    const isExpanded = expanded === type;
    
    return (
      <div 
        className={`border rounded-lg overflow-hidden transition-all duration-200 ${
          isExpanded ? "border-ink shadow-sm" : "border-surface-border hover:border-ink/30"
        }`}
      >
        <button 
          onClick={() => setExpanded(isExpanded ? null : type)}
          className={`w-full flex items-center gap-3 p-3 text-left ${colorClass} bg-opacity-10 transition-colors`}
        >
          <div className={`p-1.5 rounded-md ${colorClass} text-white`}>
            {icon}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm uppercase tracking-wider opacity-80">{type}</h4>
            <p className="text-sm font-medium leading-snug">{data.headline}</p>
          </div>
          <div className="text-ink-muted opacity-50">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-4 bg-surface border-t border-surface-border text-sm">
            <ul className="space-y-2 mb-4">
              {data.steps.map((step, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-ai mt-0.5">•</span>
                  <span className="text-ink">{step}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center pt-3 border-t border-surface-border border-opacity-50 text-xs">
              <span className="text-ink-muted">
                Est. Cost: <strong className="text-ink">${(data.cost / 1000000).toFixed(1)}M</strong>
              </span>
              <span className="text-ink-muted">
                Timeline: <strong className="text-ink">{data.timeline}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="p-5 h-full">
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-ink">Response Playbook</h3>
        <p className="text-xs text-ink-muted">Active: <strong className="text-ink">{scenario.name}</strong></p>
      </div>
      
      <div className="space-y-3">
        {renderCard("defend", scenario.responses.defend, <Shield size={16} />, "bg-blue-600")}
        {renderCard("attack", scenario.responses.attack, <Swords size={16} />, "bg-emerald-600")}
        {renderCard("partner", scenario.responses.partner, <Handshake size={16} />, "bg-purple-600")}
        {renderCard("retreat", scenario.responses.retreat, <CornerUpLeft size={16} />, "bg-amber-600")}
      </div>
    </Card>
  );
}
