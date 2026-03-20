# AI Invoice Agent

This repository is organized around two separate concerns:

- `frontend/`: a static control panel that can be published with GitHub Pages
- `app/`: a local Python worker API that stores configuration, memory, and run history

GitHub Pages hosts the interface, not the Python bot. The actual worker runs on your computer for now.

## What Is Real Now

You already have:

- a published static dashboard
- editable multi-portal configuration cards
- an operator-to-agent chat area
- local browser fallback mode for the chat and portal settings
- a local Python API that can persist portal configuration, memory, and activity
- JSON state and JSONL audit logging on the local machine

What is still not implemented:

- real Playwright automation
- real Orange login and billing navigation
- actual invoice download and PDF validation
- automatic scheduling

## What GitHub Is Used For

GitHub stores:

- source code
- frontend assets
- documentation
- workflow and product design

## What GitHub Pages Is Used For

GitHub Pages only publishes the static `frontend/`.

It can host:

- dashboard UI
- portal setup screens
- activity views
- agent chat interface

It does not run:

- Python
- Playwright
- invoice downloads
- secrets

## What Runs Locally

The local worker API in `app/` handles:

- portal profiles
- agent memory
- operator chat persistence
- test run creation
- audit events

Later, this same local layer will also handle:

- browser automation
- portal login
- invoice detection
- PDF download
- parsing and validation

## Folder Structure

```text
frontend/   GitHub Pages-friendly control panel
app/        local worker API and future automation runtime
docs/       architecture, user flow, and roadmap
data/       local JSON state and JSONL audit files
```

## Preview The Frontend Locally

From the repository root:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/frontend/
```

## Run The Local Worker API

From the repository root:

```bash
python -m app.main --host 127.0.0.1 --port 8765
```

When the API is running, the GitHub Pages frontend or the local frontend will connect to:

```text
http://127.0.0.1:8765/api
```

That enables:

- saving portal changes locally
- storing agent chat and memory locally
- creating test runs from the UI

## Operator Workflow Right Now

1. Open the frontend.
2. Start the local API on your machine.
3. Edit portal settings such as download folder, email, status, and credentials label.
4. Use the chat to teach the agent what to observe, verify, and remember.
5. Trigger a portal test from the UI.
6. Review stored runs and memory.

## Publish The Frontend To GitHub Pages

This repo already contains a GitHub Actions workflow that deploys `frontend/` to GitHub Pages.

Once you push changes to `main`, GitHub Pages republishes the static frontend.

## Current Local Files

The local worker now uses:

- `data/state.json` for editable state
- `data/audit/events.jsonl` for audit history

These files are created automatically when you run the local API.

## Supporting Docs

- [architecture.md](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\docs\architecture.md)
- [user-flow.md](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\docs\user-flow.md)
- [roadmap.md](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\docs\roadmap.md)
