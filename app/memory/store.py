"""Memory store scaffold for future local persistence."""

from __future__ import annotations


def remember(key: str, value: str) -> dict:
    """Return a placeholder memory record."""

    return {
        "key": key,
        "value": value,
        "status": "placeholder",
        "message": "TODO: persist successful paths and operator notes locally.",
    }
