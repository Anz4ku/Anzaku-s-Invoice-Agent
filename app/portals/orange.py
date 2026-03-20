"""Configurable Orange portal automation."""

from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from playwright.sync_api import Download, Error, TimeoutError as PlaywrightTimeoutError

from app.browser import browser_session
from app.config import load_credentials
from app.invoices.parser import parse_invoice
from app.portals.base import BasePortal, PortalProfile


class OrangePortal(BasePortal):
    name = "orange"

    def login(self) -> None:
        raise NotImplementedError("Use run_download with a configured profile.")

    def open_billing_area(self) -> None:
        raise NotImplementedError("Use run_download with a configured profile.")

    def find_invoice(self, period: str) -> None:
        raise NotImplementedError("Use run_download with a configured profile.")

    def download_invoice(self, period: str) -> None:
        raise NotImplementedError("Use run_download with a configured profile.")

    def run_download(self, profile: PortalProfile) -> dict:
        credentials = load_credentials(profile.credentials_label)
        if not profile.login_url:
            raise RuntimeError("login_url is required for a real Orange run.")

        with browser_session(profile.download_folder, headless=profile.headless) as (_, _context, page):
            self._goto(page, profile.login_url)
            self._fill_credentials(page, profile, credentials.username, credentials.password)
            self._submit_login(page, profile)

            if profile.billing_url:
                self._goto(page, profile.billing_url)
            elif profile.billing_link_text:
                self._click_text(page, profile.billing_link_text)

            if profile.invoice_match_text:
                page.get_by_text(profile.invoice_match_text, exact=False).first.wait_for(timeout=15000)

            download = self._trigger_download(page, profile.download_button_text)
            saved_path = self._save_download(download, Path(profile.download_folder), profile.name)
            invoice_info = parse_invoice(saved_path)

            return {
                "portal": profile.name,
                "status": "success",
                "saved_path": str(saved_path),
                "invoice": invoice_info,
            }

    def _goto(self, page, url: str) -> None:
        page.goto(url, wait_until="domcontentloaded", timeout=30000)

    def _fill_credentials(self, page, profile: PortalProfile, username: str, password: str) -> None:
        page.locator(profile.username_selector).first.fill(username)
        page.locator(profile.password_selector).first.fill(password)

    def _submit_login(self, page, profile: PortalProfile) -> None:
        page.locator(profile.submit_selector).first.click()
        page.wait_for_load_state("domcontentloaded")

    def _click_text(self, page, text: str) -> None:
        page.get_by_text(text, exact=False).first.click()
        page.wait_for_load_state("domcontentloaded")

    def _trigger_download(self, page, download_text: str) -> Download:
        try:
            with page.expect_download(timeout=20000) as download_info:
                page.get_by_text(download_text, exact=False).first.click()
            return download_info.value
        except (PlaywrightTimeoutError, Error):
            with page.expect_download(timeout=20000) as download_info:
                page.locator("a[href$='.pdf'], button:has-text('PDF')").first.click()
            return download_info.value

    def _save_download(self, download: Download, download_folder: Path, portal_name: str) -> Path:
        download_folder.mkdir(parents=True, exist_ok=True)
        suggested = download.suggested_filename or f"{portal_name.lower().replace(' ', '-')}.pdf"
        base = Path(suggested)
        filename = f"{portal_name.lower().replace(' ', '-')}-{uuid4().hex[:8]}{base.suffix or '.pdf'}"
        target = download_folder / filename
        download.save_as(str(target))
        return target
