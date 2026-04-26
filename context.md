# Competitive Intelligence — Project Context

> **Purpose of this file**: Persistent context for agents, AIs, and collaborators working on this project. Read this before touching any code.

---

## What this is

A working prototype of a **Competitive Intelligence module**, evolved into a high-performance executive intelligence platform tailored for the Automotive industry (specifically focused on Skoda/VW Group's current strategic landscape).

**Core thesis**:
1. Heterogeneous market signals are ingested into a structured **competitive knowledge graph**.
2. **GraphRAG** over that graph produces multi-hop reasoning that vector RAG cannot match.
3. Every score, recommendation, and alert traces back through the graph to its source signals. **The reasoning is always visible.**
4. The output surface is built for executives, prioritizing "zero-click" insights, actionable intelligence, and high-fidelity data visualizations.

---

## Current Demo Scenario (Automotive / Skoda)

The system is seeded with real-world strategic data representing the Volkswagen Group and Skoda's current competitive landscape.

**Anchor Signals & Initiatives**:
- **Euro 7 + CO₂ compliance program**: High risk due to massive investment burdens in ICE "cleanup" versus EV electrification.
- **China exit + redeploy to India/ASEAN**: Skoda/VW withdrawal from China is driven by intense domestic EV competition; redeployment to emerging markets is a high-risk, high-reward logistical pivot.
- **UNECE R155 CSMS compliance + cyber resilience**: Existential operational metric; failure to implement the Cyber Security Management System leads to immediate production/sale bans.
- **EV portfolio doubling (Epiq + Peaq rollout)**: Profitability threatened by cooling European EV demand and intense Chinese price competition.
- **UX Product House (in-cabin software turnaround)**: Legacy code complexity and Cariad failures forcing a pivot to external partners (Rivian/Xpeng).

**Competitors**: Tesla, BYD, Hyundai, Kia, Dacia, MG, Renault.

---

## Tech Stack

| Layer | Stack |
|---|---|
| Backend | Python 3.9+, FastAPI |
| Graph Store | NetworkX MultiDiGraph (in-memory) |
| Persistence | SQLite via SQLAlchemy 2.0 |
| AI | Provider-neutral HTTP client (`groq`, `gemini`, `claude`, etc.) |
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Charts & Viz | Recharts (Scatter, Radar, Sparklines), react-force-graph-2d |

---

## Data Model (Backend: `models.py` | Frontend: `types.ts`)

- **Capability**: `{id, name, category}`
- **Competitor**: `{id, name, segment, momentum_score, threat_level, description, capabilities, last_updated, total_signals_30d, deal_loss_exposure_q}`
- **Initiative**: `{id, name, owner_name, budget, target_launch, status, current_risk_score, prior_risk_score, score_history, required_capabilities, risk_rationale}`
- **Signal**: `{id, source_type, source_name, title, content, source_url, published_at, ingested_at, confidence, extracted_entities, weight}`
- **Recommendation**: `{id, headline, why_now, confidence, status, reasoning_path, affected_initiative_id, generated_at}`

*Note: The database is seeded via `python seed.py` from JSON files in `backend/data/`.*

---

## Visual System

- **Light theme only.** Page background uses a subtle gradient (`globals.css`).
- **Glassmorphism**: Cards use `glass-card` / `elevated-card` CSS classes with backdrop blur, layered shadows, and hover lift effects.
- **Color tokens**: defined in `tailwind.config.ts` and `src/lib/colors.ts`.
- **AI Elements**: Purple (`#7C3AED` / `ai` / `ai-bg`) is reserved exclusively for AI-derived elements. Recommendation cards use `.ai-glow` class.
- **Trace Visualization**: Clean, linear flow charts (`[Signal] ➔ [Competitor] ➔ [Capability] ➔ [Initiative]`) via `SubgraphViewer.tsx`.
- **Shadows**: Custom tokens `glass`, `glass-hover`, `elevated`, `depth` in Tailwind config.
- **Animations**: `slide-up`, `fade-in`, `count-up`, `shimmer`, `glow-pulse` keyframes.

---

## Setup (for any agent picking this up)

```bash
# Backend
cd competitive-os/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python seed.py          # Seeds SQLite DB + NetworkX graph
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd competitive-os/frontend
npm install
npm run dev             # → http://localhost:5175 (proxies /api/* to :8000)
```

---

## Project Structure

```
competitive-os/
├── backend/
│   ├── main.py              FastAPI app entry point
│   ├── models.py            Pydantic v2 models (source of truth for entity shapes)
│   ├── graph_store.py       NetworkX + SQLAlchemy wrapper
│   ├── scoring.py           Risk score computation
│   ├── seed.py              Idempotent DB seeder
│   ├── ai_client.py         Provider-neutral AI client
│   ├── api/                 FastAPI routers (competitors, initiatives, signals, recommendations, network)
│   ├── ingestion/           Signal ingestion (mock_loader, rss_ingestor, extractor)
│   ├── synthesis/           AI narratives, recommendations, trace explanations
│   └── data/                Seed JSON/JSONL/CSV files
├── frontend/
│   ├── src/
│   │   ├── pages/           Dashboard, MarketAtlas, Initiatives, Competitors, Signals, Reasoning
│   │   ├── components/      Card, Sidebar, TopBar, NetworkGraph, ExposureRow, RecommendationCard, etc.
│   │   ├── lib/             api.ts, types.ts, colors.ts, accounts.ts
│   │   └── styles/          globals.css (glassmorphism, animations)
│   ├── tailwind.config.ts   Color tokens, shadows, animations
│   └── vite.config.ts       Proxies /api/* to backend
└── context.md               ← this file
```

---

## Current Project Status

The platform is a high-fidelity Automotive Competitive Intelligence dashboard with premium glassmorphic UI.

**Completed Key Features**:
1. **Market Atlas (Network Graph)**: Immersive force-graph with competitor filtering and a dynamic "zero-click" strategic research panel.
2. **Competitors Tab**: Market Pressure scatter plot, Clearbit-powered logos, capability Radar charts.
3. **Initiatives Tab**: Owner avatars, risk trend sparklines, risk deltas, researched `risk_rationale` contexts.
4. **Dashboard**: Clean greeting, circular SVG risk gauge, glassmorphic cards, linear reasoning traces.
5. **Data Pipeline**: SQLite + NetworkX graph with `risk_rationale` fields and realistic budget exposure calculations.

---

## Phased Implementation Plan (Historical Roadmap)

This section documents the steps taken to build the platform.

### Phase 1 — Foundation
- Repo scaffold, backend/frontend setup, defining Pydantic models and TypeScript interfaces.
- Implemented `backend/graph_store.py` (NetworkX + SQLAlchemy) and the idempotent loader (`seed.py`).

### Phase 2 — Backend API + GraphRAG
- Provider-neutral AI client setup.
- Core FastAPI routers: `/api/health`, `/api/competitors`, `/api/initiatives`, `/api/signals`, `/api/recommendations`, `/api/network`.
- Implemented path-weighted scoring and multi-hop graph retrieval logic.

### Phase 3 — Executive Dashboards
- Rebuilt scoring bands, sparklines, bubble momentum charts, and strategic exposure feeds.
- Transitioned reasoning traces from complex D3 SVG hairballs to clean, linear flowchart-style UI components.

### Phase 4 — Detail Pages
- Built functional MVPs for Initiative, Competitor, Signal, and Reasoning detail pages, wired to backend APIs.
- Integrated Recharts for capability Radars and trend Sparklines.

### Phase 5 — Market Atlas (Network Explorer)
- Implemented `react-force-graph-2d` graph view with timeline filtering, node-type filters, right-side detail panels, and click-to-expand node exploration.
- Integrated a contextual research panel to dynamically summarize node importance.

### Phase 6 — Domain Pivot & Polish (Automotive)
- Swapped seed data from SaaS/IT to Automotive (Skoda, VW Group, BYD, Tesla).
- Added deeply researched, real-world strategic risk rationales to all initiatives.
- Fixed UI bugs (e.g., resolving `$0.0M at risk` calculation errors and missing `risk_rationale` fields by updating Pydantic schemas).

### Phase 7 — Visual Premium Polish
- Glassmorphism design system: `glass-card`, `elevated-card`, `ai-glow` CSS classes with backdrop blur and layered shadows.
- Circular SVG risk gauge with animated score counter and glowing ring.
- Simplified hero greeting (removed heavy gradient bar, KPI pills, and status indicators).
- Upgraded TopBar with backdrop blur search, removed "Graph status: live" pill.
- Spread competitor momentum scores for better scatter plot readability.
- Added text shadows to chart labels for legibility.

