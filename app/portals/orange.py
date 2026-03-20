"""Orange portal scaffold.

This module still does not perform real automation, but it defines the
responsibilities of the first real portal implementation.
"""

from __future__ import annotations

from app.portals.base import BasePortal


class OrangePortal(BasePortal):
    name = "orange"

    def login(self) -> None:
        raise NotImplementedError("TODO: implement Orange login flow using local credentials.")

    def open_billing_area(self) -> None:
        raise NotImplementedError("TODO: implement resilient Orange billing navigation.")

    def find_invoice(self, period: str) -> None:
        raise NotImplementedError("TODO: locate the invoice for the requested Orange period.")

    def download_invoice(self, period: str) -> None:
        raise NotImplementedError("TODO: download the Orange invoice PDF into the configured local folder.")
