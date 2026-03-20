"""Playwright runtime helpers for local portal automation."""

from __future__ import annotations

from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from playwright.sync_api import BrowserContext, Page, Playwright, sync_playwright


@contextmanager
def browser_session(download_dir: str | Path, headless: bool = True) -> Iterator[tuple[Playwright, BrowserContext, Page]]:
    """Yield a Playwright page configured for downloads."""

    target_dir = Path(download_dir)
    target_dir.mkdir(parents=True, exist_ok=True)

    playwright = sync_playwright().start()
    browser = playwright.chromium.launch(headless=headless)
    context = browser.new_context(accept_downloads=True)
    page = context.new_page()

    try:
        yield playwright, context, page
    finally:
        context.close()
        browser.close()
        playwright.stop()
