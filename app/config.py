"""Configuration and secret loading helpers for the local worker."""

from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


load_dotenv()


@dataclass
class Credentials:
    username: str
    password: str


def _normalized_label(label: str) -> str:
    return label.strip().upper().replace("-", "_").replace(" ", "_")


def load_credentials(label: str) -> Credentials:
    """Load credentials using a portal-specific label."""

    normalized = _normalized_label(label)
    username = os.getenv(f"{normalized}_USERNAME")
    password = os.getenv(f"{normalized}_PASSWORD")

    if username and password:
        return Credentials(username=username, password=password)

    if normalized.startswith("ORANGE"):
        username = username or os.getenv("ORANGE_USERNAME")
        password = password or os.getenv("ORANGE_PASSWORD")

    if not username or not password:
        raise RuntimeError(
            f"Missing credentials for label '{label}'. Set {normalized}_USERNAME and {normalized}_PASSWORD in .env."
        )

    return Credentials(username=username, password=password)
