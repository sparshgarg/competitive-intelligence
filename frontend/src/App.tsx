import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Initiatives } from "./pages/Initiatives";
import { InitiativeDetail } from "./pages/InitiativeDetail";
import { Competitors } from "./pages/Competitors";
import { CompetitorDetail } from "./pages/CompetitorDetail";
import { Signals } from "./pages/Signals";
import { SignalDetail } from "./pages/SignalDetail";
import { Reasoning } from "./pages/Reasoning";
import { MarketAtlas } from "./pages/MarketAtlas";
import { Integrations } from "./pages/Integrations";

function usePageMeta(): { title: string; breadcrumb?: string } {
  const { pathname } = useLocation();
  if (pathname === "/dashboard") return { title: "Dashboard", breadcrumb: "Competitive intelligence / Monday brief" };
  if (pathname.startsWith("/initiatives")) return { title: "Initiatives", breadcrumb: "Portfolio / Initiatives" };
  if (pathname.startsWith("/competitors")) return { title: "Competitors", breadcrumb: "Landscape / Competitors" };
  if (pathname.startsWith("/signals")) return { title: "Signals", breadcrumb: "Signals / Feed" };
  if (pathname.startsWith("/reasoning")) return { title: "Recommendations", breadcrumb: "AI / Recommendations" };
  if (pathname.startsWith("/network")) return { title: "Market Atlas", breadcrumb: "Landscape / Market Atlas" };
  if (pathname.startsWith("/integrations")) return { title: "Integrations", breadcrumb: "Settings / Integrations" };
  return { title: "Competitive OS" };
}

/** Wrapper that adds Sidebar + TopBar chrome for all inner pages */
function AppShell({ children }: { children: React.ReactNode }) {
  const meta = usePageMeta();
  return (
    <div className="min-h-screen bg-surface-2 font-sans text-ink">
      <Sidebar />
      <div className="pl-[220px]">
        <TopBar title={meta.title} breadcrumb={meta.breadcrumb} />
        <main className="mx-auto max-w-[1440px] px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Landing page — no sidebar/topbar chrome */}
      <Route path="/" element={<Landing />} />

      {/* All inner pages share the AppShell layout */}
      <Route
        path="/dashboard"
        element={
          <AppShell>
            <Dashboard />
          </AppShell>
        }
      />
      <Route
        path="/initiatives"
        element={
          <AppShell>
            <Initiatives />
          </AppShell>
        }
      />
      <Route
        path="/initiatives/:initiativeId"
        element={
          <AppShell>
            <InitiativeDetail />
          </AppShell>
        }
      />
      <Route
        path="/competitors"
        element={
          <AppShell>
            <Competitors />
          </AppShell>
        }
      />
      <Route
        path="/competitors/:competitorId"
        element={
          <AppShell>
            <CompetitorDetail />
          </AppShell>
        }
      />
      <Route
        path="/signals"
        element={
          <AppShell>
            <Signals />
          </AppShell>
        }
      />
      <Route
        path="/signals/:signalId"
        element={
          <AppShell>
            <SignalDetail />
          </AppShell>
        }
      />
      <Route
        path="/reasoning"
        element={
          <AppShell>
            <Reasoning />
          </AppShell>
        }
      />
      <Route
        path="/network"
        element={
          <AppShell>
            <MarketAtlas />
          </AppShell>
        }
      />
      <Route
        path="/integrations"
        element={
          <AppShell>
            <Integrations />
          </AppShell>
        }
      />
      <Route path="/war-room" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
