"""Orange portal scaffold.

This file only defines the future integration shape.
No real automation is implemented in this phase.
"""

from __future__ import annotations

from app.portals.base import BasePortal


class OrangePortal(BasePortal):
    name = "orange"

    def login(self) -> None:
        # TODO: add Orange login flow using local credentials and browser automation.
        raise NotImplementedError("Orange login is not implemented yet.")

    def open_billing_area(self) -> None:
        # TODO: navigate to the Orange billing page in a resilient way.
        raise NotImplementedError("Orange billing navigation is not implemented yet.")

    def find_invoice(self, period: str) -> None:
        # TODO: find the invoice corresponding to the requested billing period.
        raise NotImplementedError("Orange invoice detection is not implemented yet.")

    def download_invoice(self, period: str) -> None:
        # TODO: download the invoice PDF and save it to the local folder.
        raise NotImplementedError("Orange invoice download is not implemented yet.")
