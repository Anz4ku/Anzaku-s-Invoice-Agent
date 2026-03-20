"""PDF validation helpers for downloaded invoices."""

from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader


def parse_invoice(pdf_path: str | Path) -> dict:
    """Return a minimal PDF summary for a downloaded invoice."""

    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"Invoice file does not exist: {path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Downloaded file is not a PDF: {path.name}")

    reader = PdfReader(str(path))
    page_count = len(reader.pages)
    first_page_text = ""
    if page_count:
        first_page_text = (reader.pages[0].extract_text() or "").strip()[:500]

    return {
        "source_file": str(path),
        "status": "validated",
        "page_count": page_count,
        "first_page_preview": first_page_text,
    }
