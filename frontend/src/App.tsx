import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { Dashboard } from "./pages/Dashboard";
import { Initiatives } from "./pages/Initiatives";
import { InitiativeDetail } from "./pages/InitiativeDetail";
import { Competitors } from "./pages/Competitors";
import { CompetitorDetail } from "./pages/CompetitorDetail";
import { Signals } from "./pages/Signals";
import { SignalDetail } from "./pages/SignalDetail";
import { Reasoning } from "./pages/Reasoning";
import { MarketAtlas } from "./pages/MarketAtlas";

function usePageMeta(): { title: string; breadcrumb?: string } {
  const { pathname } = useLocation();
  if (pathname === "/") return { title: "Dashboard", breadcrumb: "Competitive intelligence / Monday brief" };
  if (pathname.startsWith("/initiatives")) return { title: "Initiatives", breadcrumb: "Portfolio / Initiatives" };
  if (pathname.startsWith("/competitors")) return { title: "Competitors", breadcrumb: "Landscape / Competitors" };
  if (pathname.startsWith("/signals")) return { title: "Signals", breadcrumb: "Signals / Feed" };
  if (pathname.startsWith("/reasoning")) return { title: "Recommendations", breadcrumb: "AI / Recommendations" };
  if (pathname.startsWith("/network")) return { title: "Market Atlas", breadcrumb: "Landscape / Market Atlas" };
  return { title: "Competitive Intelligence" };
}

export default function App() {
  const meta = usePageMeta();
  return (
    <div className="min-h-screen bg-surface-2 font-sans text-ink">
      <Sidebar />
      <div className="pl-[220px]">
        <TopBar title={meta.title} breadcrumb={meta.breadcrumb} />
        <main className="mx-auto max-w-[1440px] px-6 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/initiatives/:initiativeId" element={<InitiativeDetail />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/competitors/:competitorId" element={<CompetitorDetail />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/signals/:signalId" element={<SignalDetail />} />
            <Route path="/reasoning" element={<Reasoning />} />
            <Route path="/network" element={<MarketAtlas />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
