# Architecture Overview

## Purpose

This project is being designed in two layers:

- a static product interface for visibility and configuration
- a local execution worker for the real automation

This separation keeps the architecture clean from the beginning and avoids confusing the dashboard with the worker.

## High-Level Model

```text
GitHub repository
├── frontend/   static dashboard prototype
├── app/        local Python worker scaffold
└── docs/       architecture, user flow, roadmap
```

## Responsibilities

### `frontend/`

The frontend is a GitHub Pages-friendly interface layer. In this phase it is purely visual and works with mock data.

Responsibilities:

- explain the product clearly
- show portal setup concepts
- show run history concepts
- communicate the human-like agent loop
- provide a future-facing control panel design

Non-responsibilities:

- running Python
- opening portals
- downloading invoices
- storing secrets

### `app/`

The Python app is the future local worker.

Responsibilities later:

- run Playwright locally
- authenticate into portals
- navigate billing sections
- download invoice PDFs
- parse invoice data
- write audit history
- remember what worked

Non-responsibilities in this phase:

- production automation
- backend API
- cloud deployment

### `docs/`

The docs explain how the product fits together before engineering complexity grows.

## Deployment Model

### GitHub

GitHub stores the source code, documentation, and frontend assets.

### GitHub Pages

GitHub Pages publishes the static dashboard. It is a presentation layer only.

### Local Computer

The local machine runs the actual Python worker. Credentials, downloads, browser state, and local execution remain outside GitHub Pages.

## Future Evolution

Later, the architecture can evolve in either of these directions:

1. Keep the worker local and let the frontend remain a static project site.
2. Add a small API or local desktop bridge that lets the dashboard talk to the worker.
3. Move the worker to a server when operational requirements justify it.

The current structure supports all three without rethinking the frontend from scratch.
