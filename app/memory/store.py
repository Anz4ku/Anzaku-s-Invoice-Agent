"""Local JSON persistence for portal configuration and agent state."""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path
from typing import Any


DEFAULT_STATE: dict[str, Any] = {
    "status": {
        "current_status": "Local API ready for operator guidance",
        "configured_portals": "1 pilot portal, 2 future candidates",
        "next_run": "April 3, 2026 at 09:00",
        "last_invoice": "Orange Spain · March 2026 · PDF saved",
    },
    "portals": [
        {
            "id": "orange-spain",
            "name": "Orange Spain",
            "status": "active",
            "frequency": "monthly",
            "invoice_window": "Days 3 to 7",
            "target_email": "billing@company.com",
            "download_folder": "C:\\Invoices\\Orange",
            "notes": "First real portal planned for implementation.",
            "credentials_label": "ORANGE_MAIN",
            "login_url": "https://www.orange.es/",
            "billing_url": "",
            "billing_link_text": "Facturas",
            "invoice_match_text": "",
            "download_button_text": "Descargar PDF",
            "username_selector": "input[type='email'], input[type='text']",
            "password_selector": "input[type='password']",
            "submit_selector": "button[type='submit']",
            "headless": True,
        },
        {
            "id": "utility-provider",
            "name": "Utility Provider",
            "status": "inactive",
            "frequency": "manual",
            "invoice_window": "Days 10 to 15",
            "target_email": "finance@company.com",
            "download_folder": "C:\\Invoices\\Utilities",
            "notes": "Placeholder example used to show multi-portal setup.",
            "credentials_label": "UTILITY_MAIN",
            "login_url": "",
            "billing_url": "",
            "billing_link_text": "Billing",
            "invoice_match_text": "",
            "download_button_text": "Download PDF",
            "username_selector": "input[type='email'], input[type='text']",
            "password_selector": "input[type='password']",
            "submit_selector": "button[type='submit']",
            "headless": True,
        },
    ],
    "runs": [
        {
            "title": "Orange monthly check",
            "state": "success",
            "timestamp": "March 19, 2026 · 09:12",
            "details": "Invoice found, PDF saved, parsing confidence 0.94.",
        },
        {
            "title": "Orange retry after login timeout",
            "state": "failed",
            "timestamp": "March 18, 2026 · 09:06",
            "details": "Session expired before reaching the billing page.",
        },
    ],
    "invoices": [
        {
            "title": "Orange Spain · INV-2026-03",
            "timestamp": "Downloaded March 19, 2026",
            "details": "Total EUR 128.40 · Stored in C:\\Invoices\\Orange",
        }
    ],
    "errors": [
        {
            "title": "Login page changed",
            "timestamp": "Observed March 18, 2026",
            "details": "The sign-in form wording changed, so the agent needs a safer detection rule.",
        }
    ],
    "agent": {
        "memory": [
            "Orange portal should be checked monthly.",
            "Preferred folder: C:\\Invoices\\Orange",
            "Operator wants resilient navigation over fragile selectors.",
        ],
        "conversation": [
            {
                "role": "agent",
                "text": "I can help shape how the future worker should behave. Tell me what to look for, what to verify, or what I should remember.",
            }
        ],
    },
}


class LocalStateStore:
    """Simple JSON-backed state store for the local worker API."""

    def __init__(self, path: str | Path = "data/state.json") -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.save_state(deepcopy(DEFAULT_STATE))

    def load_state(self) -> dict[str, Any]:
        raw = self.path.read_text(encoding="utf-8")
        state = json.loads(raw)
        return self._merge_defaults(state)

    def save_state(self, state: dict[str, Any]) -> None:
        self.path.write_text(
            json.dumps(state, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    def get_status(self) -> dict[str, Any]:
        return self.load_state()["status"]

    def get_portals(self) -> list[dict[str, Any]]:
        return self.load_state()["portals"]

    def update_portal(self, portal_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        state = self.load_state()
        for portal in state["portals"]:
            if portal["id"] == portal_id:
                portal.update(updates)
                self.save_state(state)
                return portal
        raise KeyError(f"Unknown portal id: {portal_id}")

    def add_run(self, run: dict[str, Any]) -> None:
        state = self.load_state()
        state["runs"].insert(0, run)
        state["runs"] = state["runs"][:20]
        self.save_state(state)

    def get_activity(self) -> dict[str, Any]:
        state = self.load_state()
        return {
            "runs": state["runs"],
            "invoices": state["invoices"],
            "errors": state["errors"],
        }

    def add_invoice_entry(self, entry: dict[str, Any]) -> None:
        state = self.load_state()
        state["invoices"].insert(0, entry)
        state["invoices"] = state["invoices"][:20]
        self.save_state(state)

    def add_error_entry(self, entry: dict[str, Any]) -> None:
        state = self.load_state()
        state["errors"].insert(0, entry)
        state["errors"] = state["errors"][:20]
        self.save_state(state)

    def update_status(self, **updates: Any) -> dict[str, Any]:
        state = self.load_state()
        state["status"].update(updates)
        self.save_state(state)
        return state["status"]

    def get_agent_state(self) -> dict[str, Any]:
        return self.load_state()["agent"]

    def append_conversation(self, role: str, text: str) -> None:
        state = self.load_state()
        state["agent"]["conversation"].append({"role": role, "text": text})
        state["agent"]["conversation"] = state["agent"]["conversation"][-20:]
        self.save_state(state)

    def add_memory_item(self, item: str) -> None:
        state = self.load_state()
        memory = state["agent"]["memory"]
        if item not in memory:
            memory.insert(0, item)
        state["agent"]["memory"] = memory[:10]
        self.save_state(state)

    def reset_agent_state(self) -> dict[str, Any]:
        state = self.load_state()
        state["agent"] = deepcopy(DEFAULT_STATE["agent"])
        self.save_state(state)
        return state["agent"]

    def _merge_defaults(self, state: dict[str, Any]) -> dict[str, Any]:
        merged = deepcopy(DEFAULT_STATE)
        for key, value in state.items():
            if isinstance(value, dict) and isinstance(merged.get(key), dict):
                merged[key].update(value)
            else:
                merged[key] = value
        return merged
