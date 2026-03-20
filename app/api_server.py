"""Local HTTP API used by the frontend to manage worker state and real runs."""

from __future__ import annotations

import json
from datetime import datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from app.audit.logger import AuditLogger
from app.memory.store import LocalStateStore
from app.portals.base import PortalProfile
from app.portals.orange import OrangePortal


class AgentService:
    """Coordinates portal state, memory, and real local actions."""

    def __init__(self, store: LocalStateStore, audit_logger: AuditLogger) -> None:
        self.store = store
        self.audit_logger = audit_logger
        self.orange_portal = OrangePortal()

    def status(self) -> dict[str, Any]:
        return {
            "connected": True,
            "api": "local-worker",
            "status": self.store.get_status(),
        }

    def portals(self) -> list[dict[str, Any]]:
        return self.store.get_portals()

    def update_portal(self, portal_id: str, updates: dict[str, Any]) -> dict[str, Any]:
        portal = self.store.update_portal(portal_id, updates)
        self.audit_logger.log_event("portal_update", f"Updated portal {portal_id}", updates)
        return portal

    def activity(self) -> dict[str, Any]:
        return self.store.get_activity()

    def agent_state(self) -> dict[str, Any]:
        return self.store.get_agent_state()

    def reset_agent_state(self) -> dict[str, Any]:
        agent = self.store.reset_agent_state()
        self.audit_logger.log_event("agent_reset", "Reset prototype agent state", {})
        return agent

    def chat(self, message: str) -> dict[str, Any]:
        self.store.append_conversation("operator", message)
        for item in self._memory_hints(message):
            self.store.add_memory_item(item)
        reply = self._build_reply(message)
        self.store.append_conversation("agent", reply)
        self.audit_logger.log_event("agent_chat", "Processed operator coaching", {"message": message})
        return {"reply": reply, "agent": self.store.get_agent_state()}

    def run_portal_test(self, portal_id: str) -> dict[str, Any]:
        portal = self._portal_by_id(portal_id)
        timestamp = datetime.now().strftime("%B %d, %Y · %H:%M")
        run = {
            "title": f"{portal['name']} operator test",
            "state": "success",
            "timestamp": timestamp,
            "details": "Prototype test queued through the local API. Real browser automation not connected yet.",
        }
        self.store.add_run(run)
        self.audit_logger.log_event("portal_test", f"Queued portal test for {portal_id}", run)
        return {"run": run, "activity": self.store.get_activity()}

    def download_latest_invoice(self, portal_id: str) -> dict[str, Any]:
        portal = self._portal_by_id(portal_id)
        profile = PortalProfile(**portal)

        if portal_id != "orange-spain":
            raise RuntimeError(f"Real download flow is not implemented yet for portal '{portal_id}'.")

        try:
            result = self.orange_portal.run_download(profile)
        except Exception as exc:
            return self._record_failed_download(portal, portal_id, str(exc))

        return self._record_successful_download(portal, portal_id, result)

    def _record_failed_download(self, portal: dict[str, Any], portal_id: str, error_text: str) -> dict[str, Any]:
        timestamp = datetime.now().strftime("%B %d, %Y · %H:%M")
        error_entry = {
            "title": f"{portal['name']} download failed",
            "timestamp": timestamp,
            "details": error_text,
        }
        run = {
            "title": f"{portal['name']} invoice download",
            "state": "failed",
            "timestamp": timestamp,
            "details": error_text,
        }
        self.store.add_error_entry(error_entry)
        self.store.add_run(run)
        self.audit_logger.log_event("portal_download_failed", f"Download failed for {portal_id}", {"error": error_text})
        raise RuntimeError(error_text)

    def _record_successful_download(
        self,
        portal: dict[str, Any],
        portal_id: str,
        result: dict[str, Any],
    ) -> dict[str, Any]:
        timestamp = datetime.now().strftime("%B %d, %Y · %H:%M")
        invoice = result["invoice"]
        invoice_entry = {
            "title": f"{portal['name']} · {Path(result['saved_path']).name}",
            "timestamp": f"Downloaded {timestamp}",
            "details": f"Saved to {result['saved_path']} · {invoice['page_count']} pages",
        }
        run = {
            "title": f"{portal['name']} invoice download",
            "state": "success",
            "timestamp": timestamp,
            "details": f"Invoice saved to {result['saved_path']}",
        }
        status = self.store.update_status(
            last_invoice=invoice_entry["title"],
            current_status=f"Last run succeeded for {portal['name']}",
        )
        self.store.add_invoice_entry(invoice_entry)
        self.store.add_run(run)
        self.audit_logger.log_event("portal_download_success", f"Downloaded invoice for {portal_id}", result)
        return {"result": result, "status": status, "activity": self.store.get_activity()}

    def _portal_by_id(self, portal_id: str) -> dict[str, Any]:
        portal = next((item for item in self.store.get_portals() if item["id"] == portal_id), None)
        if portal is None:
            raise KeyError(f"Unknown portal id: {portal_id}")
        return portal

    def _memory_hints(self, message: str) -> list[str]:
        lowered = message.lower()
        hints: list[str] = []
        if "billing" in lowered or "facturas" in lowered:
            hints.append("Check for Billing or Facturas labels before navigating deeper.")
        if "pdf" in lowered:
            hints.append("Verify that the final download is a PDF before closing the run.")
        if "orange" in lowered:
            hints.append("Orange-specific coaching has been provided by the operator.")
        if "screenshot" in lowered:
            hints.append("If the expected page is missing, capture a screenshot before retrying.")
        if "window" in lowered or "days" in lowered:
            hints.append("Invoice availability may depend on a specific billing window.")
        return hints

    def _build_reply(self, message: str) -> str:
        lowered = message.lower()
        if "orange" in lowered and ("billing" in lowered or "facturas" in lowered):
            return (
                "Understood. For Orange, I would first observe the page, confirm I can "
                "see Billing or Facturas, and only then continue toward invoices."
            )
        if "pdf" in lowered:
            return (
                "I would treat PDF validation as part of verification: confirm the file "
                "downloaded correctly, confirm the extension is PDF, and record the saved location."
            )
        if "remember" in lowered or "learn" in lowered or "aprende" in lowered:
            return (
                "I would save that as operator guidance for future runs. In the real "
                "product, this becomes portal memory that the local worker can reuse."
            )
        if "error" in lowered or "fails" in lowered or "if not" in lowered:
            return (
                "That is a useful fallback rule. I would stop, capture context, and avoid "
                "continuing if the page does not match the expected state."
            )
        return (
            "I can use that guidance as operator coaching. In the real version, I would "
            "convert it into observable checks, safe actions, and memory for future portal runs."
        )


def create_app_handler(service: AgentService):
    """Create a request handler bound to a service instance."""

    class ApiHandler(BaseHTTPRequestHandler):
        def do_OPTIONS(self) -> None:  # noqa: N802
            self.send_response(HTTPStatus.NO_CONTENT)
            self._write_cors_headers()
            self.end_headers()

        def do_GET(self) -> None:  # noqa: N802
            parsed = urlparse(self.path)
            if parsed.path == "/api/status":
                self._json_response(service.status())
                return
            if parsed.path == "/api/portals":
                self._json_response({"portals": service.portals()})
                return
            if parsed.path == "/api/activity":
                self._json_response(service.activity())
                return
            if parsed.path == "/api/agent":
                self._json_response(service.agent_state())
                return
            self._json_response({"error": "Not found"}, HTTPStatus.NOT_FOUND)

        def do_POST(self) -> None:  # noqa: N802
            parsed = urlparse(self.path)
            payload = self._read_json_body()
            try:
                if parsed.path == "/api/chat":
                    message = str(payload.get("message", "")).strip()
                    if not message:
                        self._json_response({"error": "Message is required"}, HTTPStatus.BAD_REQUEST)
                        return
                    self._json_response(service.chat(message))
                    return
                if parsed.path == "/api/agent/reset":
                    self._json_response(service.reset_agent_state())
                    return
                if parsed.path.startswith("/api/portals/") and parsed.path.endswith("/test"):
                    portal_id = parsed.path.removeprefix("/api/portals/").removesuffix("/test").strip("/")
                    self._json_response(service.run_portal_test(portal_id))
                    return
                if parsed.path.startswith("/api/portals/") and parsed.path.endswith("/download"):
                    portal_id = parsed.path.removeprefix("/api/portals/").removesuffix("/download").strip("/")
                    self._json_response(service.download_latest_invoice(portal_id))
                    return
            except KeyError as exc:
                self._json_response({"error": str(exc)}, HTTPStatus.NOT_FOUND)
                return
            except RuntimeError as exc:
                self._json_response({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
                return
            except Exception as exc:
                self._json_response({"error": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)
                return
            self._json_response({"error": "Not found"}, HTTPStatus.NOT_FOUND)

        def do_PUT(self) -> None:  # noqa: N802
            parsed = urlparse(self.path)
            if parsed.path.startswith("/api/portals/"):
                portal_id = parsed.path.removeprefix("/api/portals/").strip("/")
                try:
                    portal = service.update_portal(portal_id, self._read_json_body())
                except KeyError as exc:
                    self._json_response({"error": str(exc)}, HTTPStatus.NOT_FOUND)
                    return
                self._json_response({"portal": portal})
                return
            self._json_response({"error": "Not found"}, HTTPStatus.NOT_FOUND)

        def log_message(self, format: str, *args) -> None:  # noqa: A003
            return

        def _read_json_body(self) -> dict[str, Any]:
            length = int(self.headers.get("Content-Length", "0"))
            if length == 0:
                return {}
            body = self.rfile.read(length).decode("utf-8")
            return json.loads(body)

        def _json_response(self, payload: dict[str, Any], status: HTTPStatus = HTTPStatus.OK) -> None:
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self._write_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        def _write_cors_headers(self) -> None:
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")

    return ApiHandler


def run_server(host: str = "127.0.0.1", port: int = 8765, state_path: str = "data/state.json") -> None:
    """Start the local worker API server."""

    store = LocalStateStore(state_path)
    audit_logger = AuditLogger()
    service = AgentService(store, audit_logger)
    server = ThreadingHTTPServer((host, port), create_app_handler(service))
    print(f"AI Invoice Agent local API listening on http://{host}:{port}")
    server.serve_forever()
