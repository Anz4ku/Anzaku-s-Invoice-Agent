"""Base portal interface for future invoice providers."""

from __future__ import annotations

from abc import ABC, abstractmethod


class BasePortal(ABC):
    """Contract for a local portal automation module."""

    name: str

    @abstractmethod
    def login(self) -> None:
        """TODO: authenticate into the provider portal."""

    @abstractmethod
    def open_billing_area(self) -> None:
        """TODO: navigate to the billing or invoices section."""

    @abstractmethod
    def find_invoice(self, period: str) -> None:
        """TODO: locate the target invoice for a billing period."""

    @abstractmethod
    def download_invoice(self, period: str) -> None:
        """TODO: save the target invoice PDF locally."""
