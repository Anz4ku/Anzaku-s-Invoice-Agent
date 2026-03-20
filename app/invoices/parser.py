"""Invoice parser scaffold for future local processing."""

from __future__ import annotations

from pathlib import Path


def parse_invoice(pdf_path: str | Path) -> dict:
    """Return placeholder parsed data for a future PDF parser."""

    path = Path(pdf_path)
    return {
        "source_file": str(path),
        "status": "placeholder",
        "message": "TODO: implement invoice PDF parsing and field extraction.",
    }
