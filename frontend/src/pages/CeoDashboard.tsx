import { Card } from "../components/Card";
import tempoLogo from "../assets/tempo-logo.png";
import { useAccount } from "../lib/accounts";
import { TEMPO_LANDSCAPE } from "../lib/tempoLandscapeData";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface-2 px-2 py-1 text-[11px] font-semibold text-ink-2 ring-1 ring-border">
      {children}
    </span>
  );
}

export function CeoDashboard() {
  const { account } = useAccount();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded border border-border bg-surface p-4 animate-slide-up [animation-delay:0ms]">
        <div className="flex items-center gap-3">
          <img src={tempoLogo} alt="Tempo" className="h-8 w-8 rounded bg-surface object-contain ring-1 ring-border" />
          <div>
            <div className="text-sm font-semibold text-ink">
              {account.name}, {account.title}
            </div>
            <div className="text-xs text-ink-2">Tempo competitive landscape · 2025–2026</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill>Market: SPM</Pill>
          <Pill>Product: Loop</Pill>
        </div>
      </div>

      <div className="animate-slide-up [animation-delay:150ms]">
        <Card title="What changed in the market" subtitle="From `Tempo.io Competitive Analysis & Strategy.md`.">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {TEMPO_LANDSCAPE.marketShift.map((s) => (
              <div key={s.title} className="rounded border border-border bg-surface p-4 transition-colors hover:border-ink-3/30">
                <div className="text-sm font-semibold text-ink">{s.title}</div>
                <div className="mt-2 text-xs leading-5 text-ink-2">{s.detail}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="animate-slide-up [animation-delay:300ms]">
        <Card title="Competitive archetypes (board-ready)" subtitle="The four forces Tempo Loop competes against.">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {TEMPO_LANDSCAPE.competitors.map((c) => (
              <div key={c.id} className="rounded border border-border bg-surface p-4 transition-colors hover:border-ink-3/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink">{c.name}</div>
                    <div className="mt-1 text-xs text-ink-2">{c.archetype}</div>
                  </div>
                  <div className="shrink-0 rounded bg-ai-bg px-2 py-1 text-[11px] font-semibold text-ai">AI posture</div>
                </div>

                <div className="mt-3 grid gap-2 text-xs">
                  <div className="rounded border border-border bg-surface-2 p-2">
                    <div className="text-[11px] font-semibold text-ink">AI</div>
                    <div className="mt-1 text-ink-2">{c.ai_posture}</div>
                  </div>
                  <div className="rounded border border-border bg-amber-bg p-2">
                    <div className="text-[11px] font-semibold text-amber">Primary weakness</div>
                    <div className="mt-1 text-amber">{c.primary_weakness}</div>
                  </div>
                  <div className="rounded border border-border bg-surface-2 p-2">
                    <div className="text-[11px] font-semibold text-ink">Tempo pitch</div>
                    <div className="mt-1 text-ink-2">{c.what_we_pitch}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="animate-slide-up [animation-delay:450ms]">
        <Card title="CEO strategic vectors" subtitle="How Tempo Loop responds to competitive pressure.">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {TEMPO_LANDSCAPE.strategicVectors.map((v) => (
              <div key={v.title} className="rounded border border-border bg-surface p-4 transition-colors hover:border-ink-3/30">
                <div className="text-sm font-semibold text-ink">{v.title}</div>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-xs leading-5 text-ink-2">
                  {v.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

