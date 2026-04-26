"""FastAPI app entry. Serves API routes and the built frontend as a single service."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.competitors import router as competitors_router
from api.initiatives import router as initiatives_router
from api.network import router as network_router
from api.recommendations import router as recommendations_router
from api.signals import router as signals_router
from api.strategy import router as strategy_router
from graph_store import get_store
from ingestion.rss_ingestor import fetch_rss_signals
from scoring import bulk_recompute
from seed import derive_impacts, derive_threatens

load_dotenv()

app = FastAPI(title="Competitive Intelligence", version="0.1.0")

cors_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
if not cors_origins:
    cors_origins = ["http://localhost:5173", "http://localhost:5175"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(competitors_router, prefix="/api")
app.include_router(initiatives_router, prefix="/api")
app.include_router(signals_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(network_router, prefix="/api")
app.include_router(strategy_router, prefix="/api")


@app.on_event("startup")
def startup() -> None:
    store = get_store()
    store.init_schema()
    restored = store.restore()
    if restored:
        print(f"Graph restored: {store.summary()}")


@app.get("/api/health")
def health() -> dict:
    return {"ok": True}


@app.get("/api/summary")
def summary() -> dict:
    return get_store().summary()


@app.post("/api/ingest/refresh")
def refresh_ingest() -> dict:
    store = get_store()
    feed_urls = [url.strip() for url in os.environ.get("RSS_FEEDS", "").split(",") if url.strip()]
    new_signals = fetch_rss_signals(feed_urls, store) if feed_urls else 0
    threatens = derive_threatens(store)
    impacts = derive_impacts(store)
    recompute = bulk_recompute(store)
    return {"new_signals": new_signals, "derived_edges": {"THREATENS": threatens, "IMPACTS": impacts}, **recompute}


@app.post("/api/report/generate")
def generate_report() -> dict:
    store = get_store()
    summary = store.summary()
    return {
        "markdown": (
            "# Competitive intelligence brief\n\n"
            f"- Graph: {summary['total_nodes']} nodes, {summary['total_edges']} edges\n"
            f"- Last signal ingested: {store.latest_signal_ingested_at()}\n"
            "- Priority: accelerate Euro 7 + fleet CO₂ compliance execution; validate cost-down levers and exposure.\n"
        )
    }


# ---------- Serve frontend static files in production ----------
STATIC_DIR = Path(__file__).resolve().parent / "static"

if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        """Serve index.html for any non-API route (SPA client-side routing)."""
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(STATIC_DIR / "index.html"))

