# Competitive Intelligence

A working prototype of a Competitive Intelligence module for Tempo
Software.

The thesis prototype demonstrates end-to-end:

1. Heterogeneous market signals — news, analyst content, CRM win/loss data,
   CPQ pricing patterns, and social/G2 reviews — are ingested into a
   structured competitive knowledge graph.
2. GraphRAG over that graph produces multi-hop reasoning that vector RAG
   cannot match.
3. Every score, recommendation, and alert traces back through the graph to
   its source signals. The reasoning is always visible.
4. The output surface is built for a Chief Strategy Officer with five
   minutes on Monday morning, not for a competitive analyst with two hours.

## Status — Phase 1

Scaffold + seed data only. The backend data layer (pydantic models,
SQLAlchemy, NetworkX) is wired and `python seed.py` hydrates the full demo
dataset: 5 competitors, 5 initiatives, 10 capabilities, 35 hand-authored
signals, 20 CRM win/loss records. Phase 2 onward layers on the API,
frontend pages, and Claude-driven extraction and synthesis.

The demo scenario the seed data is built around: four anchor signals
(Reuters Verily acquisition, Gartner healthcare PPM upgrade, Salesforce
Aetna loss, Apttus CPQ bundling) push the Healthcare vertical expansion
initiative's risk score from 6.2 to 8.4 over a single week.

## Setup

```
cd competitive-os/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# add ANTHROPIC_API_KEY in .env (required for Phase 2; not yet for Phase 1)
python seed.py
uvicorn main:app --reload
```

In a second terminal:

```
cd competitive-os/frontend
npm install
npm run dev
```

The frontend boots at http://localhost:5173 and proxies `/api/*` to the
FastAPI backend on port 8000.

## Troubleshooting

**No “AI recommendations” on the dashboard:** Recommendations are stored in
SQLite and created during `scoring.bulk_recompute` (on ingest/seed). If the DB
is empty or stale, run `python seed.py` again from `competitive-os/backend` so
pending recommendations are (re)generated.

## Verification

After `python seed.py`, the sanity report should look like:

```
Loaded: {'capability': 10, 'competitor': 5, 'initiative': 5, 'signal': 35}
Derived edges: THREATENS=N  IMPACTS=N
GraphStore summary
  nodes: capability=10  competitor=5  initiative=5  signal=35
  edges: HAS_CAPABILITY=...  IMPACTS=...  MENTIONS=...  REQUIRES=...  THREATENS=...
  demo anchor: init-healthcare-expansion has path(s) of length<=3 to
               sig-reuters-verily-001, sig-gartner-healthcare-001,
               sig-salesforce-aetna-001, sig-cpq-servicenow-bundling-001
```

The "demo anchor" line is the proof that the seed data wired up correctly:
all four anchor signals are reachable from the Healthcare initiative within
three hops through the competitive graph.

## Architecture

Three-layer pipeline:

```
Layer 1: Market signals
  News, analyst content, CRM win/loss, CPQ pricing, social/reviews
                  ↓
Layer 2: GraphRAG core
  NetworkX MultiDiGraph: Competitor, Initiative, Capability, Signal,
  Recommendation nodes connected by HAS_CAPABILITY, REQUIRES, MENTIONS,
  IMPACTS, THREATENS, TRACES_TO edges. SQLite for durable persistence.
                  ↓
Layer 3: Executive surfaces
  Dashboard (5-minute Monday view), Initiative / Competitor / Signal
  detail pages, Network view, Reasoning log. Every recommendation
  includes the subgraph it traces to.
```

The runtime store is the in-memory NetworkX graph. SQLite is the durable
record. All entity reads and writes go through `graph_store.GraphStore`;
the API layer never talks to NetworkX or SQLAlchemy directly.

## Visual system

Light theme, navy data, purple reserved for AI surfaces only. Inter
typography. The reference is Tempo's own roadmap product: white surfaces,
navy data blocks, lavender pill for active sidebar item, gray gridlines,
no drop shadows. Color tokens are defined once in
`frontend/tailwind.config.ts` and mirrored in `frontend/src/lib/colors.ts`.

## Production source roadmap

For the prototype, one live ingestion path (Google News RSS) plus a
curated mock dataset prove the pipeline. In production Tempo would
connect:

- **News** — NewsAPI, Bloomberg, Reuters Connect
- **Analyst** — Gartner Peer Insights API, Forrester Decisions API,
  G2 API, TrustRadius
- **CRM** — Salesforce REST API, HubSpot API
- **CPQ** — Salesforce CPQ, Apttus, PROS
- **Tracking platforms** — Crayon, Klue, Kompyte (positioned as input
  sources rather than competitors)
- **Public filings** — SEC EDGAR
- **Hiring signals** — LinkedIn job postings as a capability investment proxy

## Phased build

- **Phase 1** (this commit) — scaffold, models, graph store, seed data,
  frontend tooling.
- **Phase 2** — `scoring.py` (path-weighted risk), `extractor.py` (Claude
  extraction), all GET endpoints, narrative + recommendation synthesis,
  `/api/ingest/refresh` live RSS path.
- **Phase 3** — frontend reusable components and the Dashboard page.
- **Phase 4** — Initiative / Competitor / Signal / Reasoning detail pages,
  including the multi-layer SubgraphViewer (the visual centerpiece).
- **Phase 5** — `/network` force-directed graph with timeline scrubber.
- **Phase 6** — `DEMO.md` script and Loom walkthrough.
