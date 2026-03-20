"""Audit logger scaffold for future local runs."""

from __future__ import annotations

from datetime import datetime, timezone


def log_event(step: str, message: str) -> dict:
    """Create a simple structured event placeholder."""

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "step": step,
        "message": message,
        "status": "placeholder",
    }
