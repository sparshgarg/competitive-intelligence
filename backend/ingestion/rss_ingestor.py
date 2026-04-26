"""Live RSS ingestion (Phase 2)."""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Iterable, Optional

import feedparser

from graph_store import GraphStore
from ingestion.extractor import extract_entities
from models import Signal, SourceType, utcnow


def _entry_id(url: str) -> str:
    return "sig-rss-" + hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]


def _published_at(entry) -> Optional[datetime]:
    for key in ("published_parsed", "updated_parsed"):
        value = getattr(entry, key, None)
        if value:
            return datetime(*value[:6], tzinfo=timezone.utc)
    return None


def fetch_rss_signals(feed_urls: Iterable[str], store: GraphStore) -> int:
    added = 0
    for url in feed_urls:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            link = getattr(entry, "link", "") or ""
            if not link:
                continue
            sig_id = _entry_id(link)
            if store.signal_exists(sig_id):
                continue
            published = _published_at(entry) or utcnow()
            sig = Signal(
                id=sig_id,
                source_type=SourceType.NEWS,
                source_name="Google News",
                title=getattr(entry, "title", "") or link,
                content=getattr(entry, "summary", "") or getattr(entry, "description", "") or "",
                source_url=link,
                published_at=published,
                ingested_at=utcnow(),
                confidence=0.75,
                extracted_entities=[],
                weight=0.85,
            )
            sig.extracted_entities = extract_entities(sig, store)
            store.add_signal(sig)
            added += 1
    return added
