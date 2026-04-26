import { useEffect, useState } from "react";
import type { ScoreHistoryPoint } from "../lib/types";
import { Sparkline } from "./Sparkline";
import { TrendingUp, TrendingDown } from "lucide-react";

export function RiskScoreBand({
  title,
  current,
  prior,
  history,
}: {
  title: string;
  current: number;
  prior: number;
  history: ScoreHistoryPoint[];
}) {
  const delta = current - prior;
  const urgent = current >= 7.5 || delta >= 1.5;

  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = current / (duration / 16);
    
    const animate = () => {
      start += increment;
      if (start < current) {
        setDisplayScore(start);
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(current);
      }
    };
    requestAnimationFrame(animate);
  }, [current]);

  // Calculate circumference for the circular progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (current / 10) * circumference;

  return (
    <section className={`rounded-xl p-6 animate-fade-in transition-all duration-500 ${urgent ? "urgency-band" : "glass-card"}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-2/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-3 ring-1 ring-border/50">
            Top risk initiative
          </div>
          <div className="mt-3 text-lg font-bold text-ink leading-snug">{title}</div>
          
          <div className="mt-5 flex items-center gap-6">
            {/* Circular Score Gauge */}
            <div className="relative flex h-[130px] w-[130px] items-center justify-center shrink-0">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(229,231,235,0.5)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r={radius}
                  fill="none"
                  stroke={urgent ? "#D97706" : "#1E3A8A"}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  className="transition-all duration-1000 ease-out"
                  style={{ filter: urgent ? "drop-shadow(0 0 8px rgba(217,119,6,0.35))" : "drop-shadow(0 0 6px rgba(30,58,138,0.2))" }}
                />
              </svg>
              <div className="text-center relative z-10">
                <div className={`tabular text-4xl font-bold ${urgent ? "text-amber" : "text-navy"} animate-count-up`}>
                  {displayScore.toFixed(1)}
                </div>
                <div className="text-[10px] font-semibold text-ink-3 uppercase tracking-widest">out of 10</div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${delta >= 0 ? "bg-amber-bg/60 text-amber" : "bg-teal-bg/60 text-teal"}`}>
                {delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {delta >= 0 ? "+" : ""}{delta.toFixed(1)} risk delta
              </div>
              <p className="text-sm leading-relaxed text-ink-2">
                This score combines recent market signals, source authority, recency decay, and graph proximity. A high score means the CSO should decide whether to reallocate attention or budget now.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-white/50 backdrop-blur-sm p-4 shadow-glass">
          <div className="mb-2 flex items-center justify-between text-xs text-ink-2">
            <span className="font-semibold">90-day risk trajectory</span>
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium">Prior: {prior.toFixed(1)}</span>
          </div>
          <Sparkline history={history} height={120} />
        </div>
      </div>
    </section>
  );
}
