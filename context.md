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
| Backend | Python 3.11+, FastAPI |
| Graph Store | NetworkX MultiDiGraph (in-memory) |
| Persistence | SQLite via SQLAlchemy 2.0 |
| AI | Provider-neutral HTTP client (`groq`, `gemini`, `claude`, `xai`, `openai_compatible`). Groq is the default for high-speed inference. |
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Charts & Viz | Recharts (Scatter, Radar, Sparklines, Bar), react-force-graph-2d, react-markdown |
| Deployment | Render (Free Tier), Single-service architecture (FastAPI serves static frontend) |

---

## Data Model (Backend: `models.py` | Frontend: `types.ts`)

- **Capability**: `{id, name, category}`
- **Competitor**: `{id, name, segment, momentum_score, threat_level, description, capabilities, last_updated, total_signals_30d, deal_loss_exposure_q}`
- **Initiative**: `{id, name, owner_name, budget, target_launch, status, current_risk_score, prior_risk_score, score_history, required_capabilities, risk_rationale, price_sensitivity, tariff_dampening, demand_elasticity, compliance_urgency}`
- **Signal**: `{id, source_type, source_name, title, content, source_url, published_at, ingested_at, confidence, extracted_entities, weight}`
- **Recommendation**: `{id, headline, why_now, confidence, status, reasoning_path, affected_initiative_id, generated_at}`
- **Scenario**: `{id, name, quadrant, description, responses: {defend, attack, partner, retreat}}`

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
- **Strategy War Room**: Interactive quadrant-based simulation with parameter sliders and real-time chart synchronization. Uses standard-lib `difflib` for fuzzy matching to avoid C-extension build issues in cloud environments.

---

### Local Development
```bash
# Backend
cd competitive-os/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Create .env from .env.example and add your GROQ_API_KEY or GEMINI_API_KEY
python seed.py          # Seeds SQLite DB + NetworkX graph
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd competitive-os/frontend
npm install
npm run dev             # → http://localhost:5175 (proxies /api/* to :8000)
```

### Deployment (Render)
The project is configured for **one-click deployment** on Render's free tier.
1. Connect GitHub repo.
2. Build Command: `chmod +x build.sh && ./build.sh`
3. Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Env Vars: `PYTHON_VERSION=3.11.0`, `NODE_VERSION=20`, `GROQ_API_KEY=your_key`.

*Note: In production, FastAPI serves the built React frontend from the `backend/static` directory.*

---

## Project Structure

```
competitive-os/
├── backend/
│   ├── main.py              FastAPI app entry point (handles static serving in prod)
│   ├── models.py            Pydantic v2 models (source of truth for entity shapes)
│   ├── graph_store.py       NetworkX + SQLAlchemy wrapper
│   ├── scoring.py           Risk score computation
│   ├── seed.py              Idempotent DB seeder
│   ├── ai_client.py         Provider-neutral AI client (Groq, Gemini, Claude, xAI)
│   ├── api/                 FastAPI routers (competitors, initiatives, signals, recommendations, network, strategy)
│   ├── ingestion/           Signal ingestion (mock_loader, rss_ingestor, extractor)
│   ├── synthesis/           AI narratives, recommendations, trace explanations
│   ├── data/                Seed JSON/JSONL/CSV files (includes seed_scenarios.json)
│   └── static/              (Generated) Built frontend for production serving
├── frontend/
│   ├── src/
│   │   ├── pages/           Dashboard, MarketAtlas, Initiatives, Competitors, Signals, Reasoning, StrategyWarRoom
│   │   ├── components/      Card, Sidebar, TopBar, NetworkGraph, ExposureRow, RecommendationCard, war-room/
│   │   ├── lib/             api.ts, types.ts, colors.ts, accounts.ts
│   │   └── styles/          globals.css (glassmorphism, animations)
│   ├── tailwind.config.ts   Color tokens, shadows, animations
│   └── vite.config.ts       Proxies /api/* to backend
├── build.sh                 Render build script (installs deps, builds FE, seeds DB)
├── render.yaml              Render Blueprint configuration
├── .python-version          Pinned to 3.11.0 for binary wheel compatibility
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
6. **AI Provider Agnosticism**: Seamless switching between Groq, Gemini, Claude, and xAI via `.env`. Defaulted to Groq for sub-second inference.
7. **Strategy War Room**: Implemented but **currently hidden from navigation** (will be re-enabled later).
8. **CEO account (Vic Chynoweth)**: Dashboard exists in code but is **currently disabled** (account toggle removed; only CSO view is active).
8. **Cloud-Ready Deployment**: Automated build pipeline for Render with single-service architecture and pure-python dependency tree.

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

### Phase 8 — AI Agnosticism & Deployment
- Overhauled the AI client to be provider-neutral, supporting Groq (Llama 3.3), Gemini, Claude, and xAI.
- Replaced binary-heavy `rapidfuzz` with stdlib `difflib` to ensure clean cloud builds without C-extension failures.
- Implemented a unified `build.sh` and `render.yaml` for zero-config deployment on Render.
- Configured FastAPI to serve static frontend assets in production, consolidating the app into a single service.

### Phase 9 — Strategy War Room & Scenario Simulation
- Added interactive "What-If" modeling capabilities.
- Implemented `ScenarioPlanner` (2x2 quadrant logic) and `WhatIfSimulator` (parametric sliders).
- Built `PortfolioImpact` bar charts that recompute exposure based on competitive sensitivity coefficients.
- Integrated AI Strategic Briefing to synthesize scenario outcomes into executive summaries.
- Expanded the data model to include `Scenario` entities and response playbooks (Defend/Attack/Partner/Retreat).

