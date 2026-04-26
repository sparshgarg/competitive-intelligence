import { Line, LineChart, ResponsiveContainer, Tooltip, ReferenceDot } from "recharts";
import { COLORS } from "../lib/colors";
import type { ScoreHistoryPoint } from "../lib/types";

function inflection(history: ScoreHistoryPoint[]) {
  for (let i = 7; i < history.length; i += 1) {
    if (Math.abs(history[i].score - history[i - 7].score) > 1.5) return history[i];
  }
  return history[history.length - 1];
}

export function Sparkline({ history, height = 72 }: { history: ScoreHistoryPoint[]; height?: number }) {
  const point = history.length ? inflection(history) : undefined;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Tooltip
            contentStyle={{ border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }}
            formatter={(value) => [Number(value).toFixed(2), "risk"]}
            labelFormatter={(label) => String(label)}
          />
          <Line type="monotone" dataKey="score" stroke={COLORS.navy} strokeWidth={2} dot={false} isAnimationActive={true} animationDuration={1500} animationEasing="ease-in-out" />
          {point ? <ReferenceDot x={point.date} y={point.score} r={4} fill={COLORS.amber} stroke={COLORS.surface} /> : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

