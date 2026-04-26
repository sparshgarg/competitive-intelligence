import { useEffect, useMemo, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Card } from "../Card";
import { api } from "../../lib/api";
import ReactMarkdown from "react-markdown";

interface StrategicBriefProps {
  sliders: Record<string, number>;
  scenarioName: string;
}

export function StrategicBrief({ sliders, scenarioName }: StrategicBriefProps) {
  const [brief, setBrief] = useState<string | null>(null);
  const [rendered, setRendered] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingSource = useMemo(() => brief ?? null, [brief]);

  useEffect(() => {
    if (!typingSource) {
      setRendered(null);
      return;
    }
    setRendered("");
    let i = 0;
    const step = () => {
      i = Math.min(typingSource.length, i + 6);
      setRendered(typingSource.slice(0, i));
      if (i >= typingSource.length) return;
      window.setTimeout(step, 12);
    };
    const t = window.setTimeout(step, 80);
    return () => window.clearTimeout(t);
  }, [typingSource]);

  const generateBrief = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.strategyBrief({ sliders, scenario_name: scenarioName });
      setBrief(res.brief);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate brief");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 relative overflow-hidden group border-ai/30 ai-glow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-ai">
          <Sparkles size={20} />
          <h3 className="font-semibold text-lg">AI Strategic Brief</h3>
        </div>
        <button
          onClick={generateBrief}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-ai text-white rounded-md hover:bg-ai/90 disabled:opacity-50 transition-colors"
        >
          {loading ? <RefreshCw className="animate-spin" size={16} /> : "Generate Brief"}
        </button>
      </div>

      <div className="min-h-[100px] text-sm text-ink leading-relaxed">
        {loading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-4 bg-surface-hover rounded w-3/4"></div>
            <div className="h-4 bg-surface-hover rounded w-full"></div>
            <div className="h-4 bg-surface-hover rounded w-5/6"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 bg-red-50/50 rounded-md border border-red-100">
            {error}
          </div>
        ) : rendered ? (
          <div className="prose prose-sm prose-slate max-w-none">
            <ReactMarkdown>{rendered}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-ink-muted flex items-center justify-center h-full border-2 border-dashed border-surface-border rounded-lg py-8">
            Click 'Generate Brief' to synthesize the current scenario parameters into an executive summary.
          </div>
        )}
      </div>
    </Card>
  );
}
