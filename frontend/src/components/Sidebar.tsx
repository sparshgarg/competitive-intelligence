import { Bot, Gauge, Compass, Radio, Settings, Target, Trophy, Swords } from "lucide-react";
import { NavLink } from "react-router-dom";
import tempoLogo from "../assets/tempo-logo.png";
import { ACCOUNTS, useAccount } from "../lib/accounts";

const items = [
  { label: "Dashboard", href: "/", icon: Gauge },
  { label: "War Room", href: "/war-room", icon: Swords },
  { label: "Market Atlas", href: "/network", icon: Compass },
  { label: "Initiatives", href: "/initiatives", icon: Target },
  { label: "Competitors", href: "/competitors", icon: Trophy },
  { label: "Signals", href: "/signals", icon: Radio },
  { label: "Recommendations", href: "/reasoning", icon: Bot },
];

export function Sidebar() {
  const { account, setAccountId } = useAccount();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[220px] flex-col border-r border-border bg-sidebar-bg">
      <div className="flex h-14 items-center gap-3 px-4">
        <img src={tempoLogo} alt="Tempo" className="h-8 w-8 shrink-0 rounded bg-surface object-contain ring-1 ring-border" />
        <span className="overflow-hidden whitespace-nowrap text-sm font-semibold text-ink">
          Tempo CI
        </span>
      </div>

      <nav className="mt-3 flex-1 space-y-1 px-2">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) =>
              `flex h-10 items-center gap-3 rounded px-3 text-sm transition ${
                isActive ? "bg-ai-active text-ai-active-text" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="overflow-hidden whitespace-nowrap">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded border border-border bg-surface p-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ai-bg text-xs font-semibold text-ai">
            {account.initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-semibold text-ink">{account.name}</div>
            <div className="truncate text-[11px] text-ink-3">{account.title}</div>
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          {ACCOUNTS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAccountId(a.id)}
              className={`flex-1 rounded px-2 py-1 text-[11px] font-semibold ring-1 ring-border transition ${
                a.id === account.id ? "bg-ai-active text-ai-active-text" : "bg-surface text-ink-2 hover:bg-surface-2"
              }`}
            >
              {a.initials}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

