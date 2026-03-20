"""Base portal interface for future invoice providers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class PortalProfile:
    """Editable operator profile for a portal."""

    id: str
    name: str
    status: str
    frequency: str
    invoice_window: str
    target_email: str
    download_folder: str
    notes: str
    credentials_label: str


class BasePortal(ABC):
    """Contract for a local portal automation module."""

    name: str

    @abstractmethod
    def login(self) -> None:
        """Authenticate into the provider portal."""

    @abstractmethod
    def open_billing_area(self) -> None:
        """Navigate to the billing or invoices section."""

    @abstractmethod
    def find_invoice(self, period: str) -> None:
        """Locate the target invoice for a billing period."""

    @abstractmethod
    def download_invoice(self, period: str) -> None:
        """Save the target invoice PDF locally."""
