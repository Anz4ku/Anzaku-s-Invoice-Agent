"""CLI entrypoint for the local worker API."""

from __future__ import annotations

import argparse

from app.api_server import run_server


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="AI Invoice Agent local API")
    parser.add_argument("--host", default="127.0.0.1", help="Host interface for the local API.")
    parser.add_argument("--port", type=int, default=8765, help="Port for the local API.")
    parser.add_argument(
        "--state-path",
        default="data/state.json",
        help="Path to the JSON state file used by the local worker.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    run_server(host=args.host, port=args.port, state_path=args.state_path)


if __name__ == "__main__":
    main()
