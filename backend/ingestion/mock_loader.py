"""Loads curated mock signals from data/seed_signals.jsonl."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from models import Signal


def load_signals(path: Path) -> list[Signal]:
    out: list[Signal] = []
    with path.open() as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            out.append(Signal.model_validate_json(line))
    return out


def load_json_list(path: Path) -> list[dict]:
    with path.open() as f:
        return json.load(f)
