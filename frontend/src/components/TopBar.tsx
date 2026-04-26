import { Search } from "lucide-react";

export function TopBar({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border/60 bg-white/70 backdrop-blur-md px-6">
      <div>
        <div className="text-sm font-bold text-ink tracking-tight">{title}</div>
        {breadcrumb ? <div className="text-[11px] text-ink-3">{breadcrumb}</div> : null}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center h-9 w-[280px] rounded-lg border border-border/60 bg-surface-2/60 px-3 gap-2 transition-colors focus-within:border-navy/30 focus-within:ring-2 focus-within:ring-navy/10">
          <Search className="h-3.5 w-3.5 text-ink-3 shrink-0" />
          <input
            placeholder="Search…"
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 outline-none"
          />
        </div>
        <button className="rounded-lg bg-gradient-to-r from-navy to-navy-2/80 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110">
          Share
        </button>
      </div>
    </header>
  );
}
