# Competitive OS — Project Context

> **Purpose of this file**: Single source of truth for anyone working on this project — engineers,
> AI agents, or collaborators building a deck. Read this before touching code or slides.

---

## 1. The Business Problem

### The gap every strategy team lives in

Companies operate in competitive markets. Their strategic decisions — which products to build, which
markets to enter, where to invest — are directly affected by what competitors are doing. Yet most
strategy teams still manage competitive intelligence through a patchwork of:

- Manual Google Alerts and RSS feeds read by junior analysts
- Quarterly analyst reports (Gartner, Forrester) that are already 3 months stale
- CRM win/loss data that never gets connected to roadmap decisions
- Slack channels full of "did you see this?" links that disappear into noise

The result: **competitive signals reach decision-makers too late, too fragmented, and without any
connection to what the company is actually trying to do**. A Reuters article about a competitor's
healthcare AI acquisition should immediately surface a risk flag on the three initiatives it
threatens. Today, it doesn't — someone has to read it, recognise the connection, and manually
escalate it. That loop takes days or weeks. By then, the window for a response has narrowed.

### What Competitive OS does differently

Competitive OS treats competitive intelligence as a **graph problem, not a search problem**.

Every signal (news article, analyst report, CRM loss, job posting) is connected to the competitors
it mentions, the capabilities those competitors are building, and the initiatives in your portfolio
that depend on those capabilities. Risk scores propagate automatically through that graph. When a
new signal arrives, its implications ripple outward in milliseconds — not after a weekly review.

The output is not a dashboard full of charts. It is a **set of actionable recommendations**, each
with a full chain of evidence, ready for an executive to accept or dismiss in a single click.

---

## 2. Product Vision

**Competitive OS is an AI-powered competitive intelligence platform for companies that need to
connect external market signals to internal strategic priorities in real time.**

It is not a news aggregator. It is not a CRM add-on. It is not a BI tool.

It is the layer that sits between raw market data and executive decision-making — translating
"BYD launched a €20,000 EV in Europe" into "your EV Platform Acceleration initiative's risk
score just moved from 6.8 to 8.1, and here is the recommended response."

### Who it's for

| Role | What they get |
|---|---|
| **Chief Strategy Officer** | Morning brief: top 3 risks to the portfolio, with one-click accept/reject on AI recommendations |
| **Initiative Owner** | Real-time risk score for their initiative, with the specific signals driving it |
| **Competitive Intelligence Analyst** | Live signal feed, confidence scoring, entity extraction, and a graph view of how competitors are connected |
| **Executive Team** | A single source of truth for competitive exposure across the full portfolio |

### Industry applicability

The platform is industry-agnostic. The same architecture works for:

- **Automotive** (this demo: Škoda/VW navigating EV transition vs. Tesla, BYD, Hyundai)
- **Enterprise SaaS** (e.g. Jira/Atlassian vs. ServiceNow, Asana, Monday)
- **Pharma** (pipeline competitive monitoring, patent signals, FDA approvals)
- **Fintech** (regulatory signals, new entrant threats, pricing moves)
- **Retail/FMCG** (market share signals, promotional patterns, supply chain signals)

The demo uses Škoda because it's a vivid, real-world example with publicly available competitive
dynamics. It is not a product built specifically for automakers.

---

## 3. Core Technical Thesis

The platform is built on three ideas that differentiate it from conventional competitive
intelligence tools:

### 3a. Knowledge Graph over Vector Search

Most AI-powered tools dump content into a vector database and retrieve "similar" chunks. This
works for semantic search. It fails for competitive intelligence, where the key question is not
"what is similar to X?" but "**what does X mean for initiative Y, given that competitor Z has
capability C?**"

That is a multi-hop reasoning problem. It requires traversing a graph:

```
Signal → Competitor → Capability → Initiative
```

Competitive OS uses a **NetworkX MultiDiGraph** as the knowledge graph. Every entity (competitor,
capability, initiative, signal, recommendation) is a node. Relationships (MENTIONS, HAS_CAPABILITY,
REQUIRES, THREATENS, IMPACTS, TRACES_TO) are typed, weighted edges. Risk scores are computed by
traversing paths of length ≤ 3, weighting each hop by confidence and recency.

This is **GraphRAG** — Retrieval-Augmented Generation over a graph, not a vector index.

### 3b. Full Traceability

Every recommendation has a `reasoning_path` — a list of nodes from signal to competitor to
capability to initiative. The UI renders this as a visual chain:

```
[Reuters: BYD battery breakthrough] → [BYD] → [Battery cost leadership] → [EV Platform initiative]
```

Nothing in the system is a black box. Every score change, every recommendation, every risk flag
can be clicked and traced back to the raw signal that caused it.

### 3c. Provider-neutral AI

The platform uses a provider-neutral AI client (`ai_client.py`) that can route to:

- **Groq** (Llama 3.3 70b) — default; sub-second inference for real-time entity extraction
- **Google Gemini** — used for long-context synthesis (full analyst reports)
- **Anthropic Claude** — used for nuanced recommendation generation
- **xAI** — fallback / experimentation
- Any OpenAI-compatible endpoint

This means the platform is not dependent on any single AI provider — a critical property for
enterprise deployments where procurement, data residency, and cost constraints vary.

---

## 4. Feature-by-Feature Breakdown

### 4a. Dashboard (CSO Morning Brief)

**What it is**: The entry screen for the Chief Strategy Officer. It opens every morning with the
current state of the competitive portfolio.

**What it shows**:
- A greeting and date-contextualised brief ("Monday brief", "Q2 review")
- A circular **risk gauge** showing the aggregate portfolio risk score (0–10)
- The top 3 **AI Recommendations** — each a natural-language action item with a confidence score,
  a reasoning path pill-chain, and accept/dismiss buttons
- A **strategic exposure feed** — the initiatives most at risk, sorted by risk delta

**Why it's there**: Strategy executives don't have time to read 35 signals. They need to know the
three things that matter this week, and they need to be able to act on them without opening five
other tabs. The dashboard is designed to support a "zero-click morning" — all critical information
in one screen, action possible without drilling down.

**Design decision**: Recommendations are purple (AI colour token `#7C3AED`). This is deliberate —
AI-derived content is visually distinct from human-authored data. The user always knows when they
are reading AI output.

---

### 4b. Initiatives

**What it is**: The portfolio view. Every strategic initiative the company is running, with its
current risk score, trend, and budget.

**What it shows**:
- List/grid of all initiatives with owner, budget, launch target, and status
- Risk score with a 90-day sparkline (trend over time)
- Risk delta (how much has the score moved this week?)
- Click-through to a detail page with: full risk rationale, required capabilities, signal trace
  subgraph, and a **Jira panel** showing linked epics and sprint status

**Why it's there**: Initiatives are the unit of strategy. The competitive intelligence system only
matters if it connects to the work people are actually doing. The Jira integration closes the loop
— a competitive signal that raises an initiative's risk score can be immediately connected to the
sprint tickets affected.

**Key concept**: Each initiative has a `required_capabilities` list. If a competitor is assessed as
strong in a capability that an initiative requires, that path directly raises the initiative's risk
score. This is the graph traversal in action.

---

### 4c. Competitors

**What it is**: The competitive landscape view — all tracked rivals with momentum scores, threat
levels, and capability profiles.

**What it shows**:
- A **market pressure scatter plot** (momentum score vs. threat level) — visual positioning of all
  rivals in one chart
- Individual competitor cards with signal volume, deal loss exposure, and a capability radar chart
- Click-through to detail pages with full competitor narrative (AI-generated), signal history, and
  the specific capabilities driving their threat score

**Why it's there**: Analysts need a fast way to assess "who is moving fast and where?" The scatter
plot answers that in 5 seconds. The radar chart answers "where specifically is this competitor
strong?" The narrative synthesises it into language.

**Design decision**: The competitor narrative is AI-generated but cached — it doesn't re-run on
every page load. This keeps the UI fast while still providing depth.

---

### 4d. Signals

**What it is**: The raw evidence layer — every ingested signal with source, confidence, extracted
entities, and graph connections.

**What it shows**:
- Filterable feed of all signals (by source type, competitor, date, confidence)
- Each signal card shows: title, source, published date, confidence score, and the entities
  extracted from it
- Click-through to a detail page with full signal content, the graph edges it created, and the
  initiatives it is connected to

**Why it's there**: Transparency and auditability. Analysts need to be able to verify that the
signals driving a risk score are credible. They also need to find signals manually — if they know
a competitor made an announcement, they should be able to search for it and see how the system
interpreted it.

**Technical detail**: Entity extraction is powered by Claude (or Groq for speed). The `extractor.py`
module sends the signal content to the AI client with a structured prompt, and the response is
parsed into a typed `ExtractedEntity` list (competitor mentions, capability references, sentiment).
These entities become the graph edges.

---

### 4e. Recommendations (Reasoning)

**What it is**: The AI reasoning layer — all generated recommendations with full evidence chains.

**What it shows**:
- All pending, accepted, and dismissed recommendations
- Each recommendation card: headline, why-now rationale, confidence, affected initiative, and a
  visual reasoning path (pill chain from signal → competitor → capability → initiative)
- A **Slack delivery badge** — showing that the recommendation was delivered to the relevant
  Slack channel and when
- Accept / Dismiss actions

**Why it's there**: This is the output surface. Recommendations are the translation of raw signals
into executive actions. The reasoning path is critical — it turns "our AI says to do X" into
"here is the exact chain of evidence that led to this recommendation." That auditability is what
makes AI-generated recommendations trustable in a strategy context.

**Design decision**: The Slack badge makes the recommendation feel "real" — it connects the
analytical system to the operational workflow where decisions actually happen.

---

### 4f. Market Atlas (Network Graph)

**What it is**: An interactive force-directed graph of the full competitive knowledge graph.

**What it shows**:
- All nodes (competitors, capabilities, initiatives, signals) rendered as a force graph
- Node size proportional to connectivity (more edges = larger node)
- Edge colour by type (MENTIONS, THREATENS, REQUIRES, etc.)
- Filtering by competitor, node type, and time window
- Click any node to open a right-side detail panel with a dynamic AI research summary
- The visual makes the graph structure of the platform tangible — you can see how a signal
  connects to a competitor, which connects to a capability, which connects to an initiative

**Why it's there**: This is the "wow" screen for demos and for analysts who think visually. It
makes the abstract concept of a knowledge graph concrete and navigable. It also serves a real
analytical function — spotting clusters (competitors with many shared capabilities) and bridges
(signals that connect otherwise unrelated parts of the graph).

**Demo tip**: Let the force simulation settle before presenting. The graph looks best when nodes
are distributed, not bouncing. Click on Tesla or BYD to see how deeply they are connected to
Škoda's initiatives.

---

### 4g. Integrations

**What it is**: A configuration and status page for all connected data sources.

**What it shows**:
- Active integration cards: Jira, Salesforce, Slack, Google News RSS — each with status badge,
  last sync time, key stats, and a link to the API docs
- An architecture explainer showing how all sources route through the same ingestion pipeline
  into the knowledge graph
- A roadmap of planned integrations (GitHub, LinkedIn Jobs, Gartner, SEC EDGAR, HubSpot, G2)

**Why it's there**: For a technical audience or a buyer evaluating the platform, the integrations
page answers the question "how does data get in?" It also communicates that the platform is
not a closed system — it connects to the tools companies already use (Jira for execution, Salesforce
for revenue, Slack for communication, News feeds for intelligence).

**Architecture principle**: Every integration produces a `Signal` node. Signals are the uniform
unit of input regardless of source. A Jira epic status change, a Salesforce loss record, and a
Reuters article all become `Signal` nodes and are treated identically by the graph and scoring
engine. This is what makes the platform extensible — adding a new integration means writing a new
ingestion module, not redesigning the graph.

---

## 5. Demo Scenario (Škoda Auto)

The live demo is seeded with Škoda's competitive landscape as of Q2 2025. This scenario was
chosen because it has vivid, publicly documented competitive dynamics across multiple dimensions
(cost competition, regulatory pressure, software capability gaps, market share defence).

### Tracked Competitors

| Competitor | Threat Level | Key Dynamic |
|---|---|---|
| Tesla | Critical | Software-defined EV benchmark; price aggression in EU |
| BYD | Critical | Cost leadership + vertical integration; €20K EU entry |
| Hyundai | High | IONIQ platform; premium EV execution above Škoda's tier |
| Kia | High | EV9/EV6 halo effect pulling segment perception upward |
| MG Motor | High | Chinese-owned, UK-branded; undercutting on price in EU |
| Dacia | Medium | Value segment overlap; Spring EV at aggressive price point |
| Renault | Medium | Collaborative (VW alliance discussions) but also competitor |

### Strategic Initiatives

| Initiative | Risk Score | Key Driver |
|---|---|---|
| EV Platform Acceleration | 8.1 | BYD cost pressure + cooling EU EV demand |
| Euro 7 Compliance Pack | 7.6 | Regulatory deadline + ICE investment conflict |
| Software-Defined Vehicle | 6.3 | Cariad failures + Rivian/Xpeng partnership complexity |
| Market Share Defence — SE | 5.9 | Dacia/MG price undercutting in Southern Europe |
| Connected Services Platform | 4.2 | Moderate risk; no direct competitive threat yet |

### Demo Walk-through (suggested order)

1. **Landing page** — set context: "this is Škoda, but the system works for any company"
2. **Dashboard** — show the morning brief, the risk gauge, the top recommendations
3. **Market Atlas** — click Tesla node, show how it connects to EV Platform initiative
4. **Recommendations** — click a recommendation, show the full reasoning path chain
5. **Initiative detail** — open EV Platform, show the Jira panel and the trace subgraph
6. **Integrations** — show the architecture callout: "every source becomes a Signal node"

---

## 6. Technical Architecture

### Backend

```
backend/
├── main.py              FastAPI entry point (CORS, static serving in prod)
├── models.py            Pydantic v2 models — single source of truth for entity shapes
├── graph_store.py       NetworkX MultiDiGraph + SQLAlchemy persistence layer
├── scoring.py           Path-weighted risk score computation
├── ai_client.py         Provider-neutral AI client (Groq, Gemini, Claude, xAI)
├── seed.py              Idempotent DB + graph seeder
├── api/                 FastAPI routers: competitors, initiatives, signals,
│                        recommendations, network, strategy
├── ingestion/           Signal ingestion: mock_loader, rss_ingestor, extractor
├── synthesis/           AI narratives, recommendation generation, trace explanations
└── data/                Seed files: JSON, JSONL, CSV
```

### Frontend

```
frontend/src/
├── pages/               Landing, Dashboard, MarketAtlas, Initiatives, InitiativeDetail,
│                        Competitors, CompetitorDetail, Signals, SignalDetail,
│                        Reasoning, Integrations
├── components/          Sidebar, TopBar, Card, NetworkGraph, ExposureRow,
│                        RecommendationCard, JiraPanel, SubgraphViewer, war-room/
├── lib/                 api.ts, types.ts, colors.ts, accounts.tsx
└── styles/              globals.css (glassmorphism, animations, Inter font)
```

### Graph Schema

**Node types**: `competitor`, `capability`, `initiative`, `signal`, `recommendation`

**Edge types**:

| Edge | From → To | Meaning |
|---|---|---|
| `HAS_CAPABILITY` | competitor → capability | Competitor is assessed as having this capability |
| `REQUIRES` | initiative → capability | Initiative needs this capability to succeed |
| `MENTIONS` | signal → competitor | Signal references this competitor |
| `MENTIONS` | signal → capability | Signal references this capability |
| `THREATENS` | competitor → initiative | Competitor poses a direct threat to this initiative |
| `IMPACTS` | signal → initiative | Signal has a bearing on this initiative's risk |
| `TRACES_TO` | recommendation → signal | Recommendation is grounded in this signal |

**Risk score formula** (simplified):
```
risk_score(initiative) = Σ over paths of length ≤ 3:
  signal.weight × signal.confidence × edge_recency_decay × path_specificity
```

### Data Flow

```
Source (RSS / Salesforce / Jira) 
  → ingestion module 
  → Signal node created in graph 
  → extractor.py runs Claude entity extraction 
  → MENTIONS edges created to competitor/capability nodes 
  → scoring.py recomputes affected initiative risk scores 
  → recommendations synthesised if score delta > threshold 
  → Slack alert dispatched 
  → Dashboard surface updated
```

---

## 7. Tech Stack

| Layer | Stack |
|---|---|
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Graph Store | NetworkX MultiDiGraph (in-memory) |
| Persistence | SQLite via SQLAlchemy 2.0 |
| AI | Provider-neutral client (Groq default, Gemini, Claude, xAI, OpenAI-compat) |
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS (custom tokens: navy, ai/purple, amber, teal) |
| Charts | Recharts (scatter, radar, sparkline, bar), react-force-graph-2d |
| Routing | React Router v6 |
| Data fetching | TanStack Query v5 |
| Deployment | Render Free Tier (FastAPI serves static frontend) |

---

## 8. Visual Design System

- **Light theme only**. Page background: subtle gradient (`#F8FAFC` → `#EEF2FF`)
- **Glassmorphism**: Cards use `glass-card` / `elevated-card` CSS classes with `backdrop-blur`,
  layered box shadows, and hover-lift transitions
- **AI colour** (`#7C3AED` purple): reserved exclusively for AI-derived content. Used on
  recommendation cards, reasoning paths, AI narrative panels. This creates a visual language —
  purple means "AI said this."
- **Risk colours**: Red for critical (≥8.0), amber for elevated (≥6.5), teal/green for healthy
- **Tailwind colour tokens**: `navy` (#1E3A8A), `ai` (#7C3AED), `amber` (#D97706), `teal`
  (#0D9488), `ink` (#111827), `ink-2` (#4B5563), `ink-3` (#9CA3AF)
- **Custom shadows**: `glass`, `glass-hover`, `elevated`, `depth`
- **Animations**: `slide-up`, `fade-in`, `count-up`, `shimmer`, `glow-pulse`
- **Font**: Inter (variable), with `cv11`, `ss01`, `tabular-nums` enabled

---

## 9. Key Design Decisions (and why)

| Decision | Rationale |
|---|---|
| Graph over vector DB | Multi-hop reasoning requires traversal, not similarity. "What does X mean for initiative Y?" is a path question. |
| Full traceability as a first-class feature | AI recommendations are only trustable if the reasoning is auditable. Every recommendation shows its evidence chain. |
| Provider-neutral AI | Enterprise deployments have procurement and data-residency constraints. Locking to one provider is a deal-breaker. |
| Groq as default (not OpenAI) | Groq's Llama 3.3 70b offers sub-100ms inference. For real-time entity extraction on live signal streams, latency matters. |
| Purple reserved for AI content | Users must always know when they are reading AI output vs. factual data. Purple = AI. No exceptions. |
| Mock data over live APIs | Demo stability. Live RSS feeds and real CRM data introduce non-determinism. The demo must work offline and identically every time. |
| Jira panel in initiative detail | Closes the loop between intelligence (risk score) and execution (sprint tickets). The insight becomes actionable without leaving the platform. |
| Slack badge on recommendations | Makes the platform feel operational, not just analytical. Decisions don't happen in a dashboard — they happen in Slack. |

---

## 10. Local Development

```bash
# Backend
cd competitive-os/backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # Add GROQ_API_KEY or GEMINI_API_KEY
python seed.py                # Seeds SQLite + NetworkX graph
uvicorn main:app --reload --port 8001

# Frontend (separate terminal)
cd competitive-os/frontend
npm install
npm run dev                   # → http://localhost:5175 (proxies /api/* to :8001)
```

## 11. Deployment (Render)

One-click deployment on Render Free Tier:
1. Connect GitHub repo (`sparshgarg/competitive-intelligence`)
2. Build Command: `chmod +x build.sh && ./build.sh`
3. Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Env Vars: `PYTHON_VERSION=3.11.0`, `NODE_VERSION=20`, `GROQ_API_KEY=your_key`

In production, FastAPI serves the built React frontend from `backend/static/`.

---

## 12. Current Status

| Area | Status |
|---|---|
| Backend API | ✅ Complete — all routes live on :8001 |
| Graph + seed data | ✅ Complete — 36 nodes, 103 edges |
| Landing page | ✅ Complete — generic, industry-agnostic |
| Dashboard | ✅ Complete — CSO morning brief |
| Initiatives + detail | ✅ Complete — includes Jira panel |
| Competitors + detail | ✅ Complete — scatter, radar, narrative |
| Signals + detail | ✅ Complete — entity extraction display |
| Recommendations | ✅ Complete — reasoning paths, Slack badge |
| Market Atlas | ✅ Complete — force graph, research panel |
| Integrations page | ✅ Complete — 4 active, 6 roadmap |
| Strategy War Room | ⏸ Built, hidden from nav (re-enable later) |
| CEO Dashboard | ⏸ Built, account toggle removed (re-enable later) |
| Live RSS ingestion | 🔲 Mock only — real ingestion path wired but not active |
| Production deploy | 🔲 Render config ready, not yet deployed |
