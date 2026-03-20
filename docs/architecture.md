# Architecture Overview

## Purpose

This project is now split into two concrete layers:

- a static interface for the operator
- a local worker API for real state and future automation

This keeps the GitHub Pages frontend simple while letting the local machine own secrets, state, and execution.

## High-Level Model

```text
GitHub repository
├── frontend/   static dashboard and operator chat
├── app/        local worker API and future browser automation
├── docs/       architecture, user flow, roadmap
└── data/       local state and audit history
```

## Responsibilities

### `frontend/`

Responsibilities:

- show portal configuration
- let the operator coach the agent
- display run activity and remembered guidance
- stay deployable on GitHub Pages

Non-responsibilities:

- running Python
- storing secrets
- controlling Playwright directly

### `app/`

Responsibilities now:

- expose a local HTTP API
- store portal profiles and agent memory
- record audit events
- provide a safe bridge between the static frontend and the local machine

Responsibilities later:

- run Playwright locally
- authenticate into portals
- navigate billing sections
- download invoice PDFs
- validate and parse invoices

### `data/`

Responsibilities:

- hold local JSON state
- keep audit history on disk
- stay outside GitHub Pages

## Deployment Model

### GitHub

Stores the source code, docs, and frontend assets.

### GitHub Pages

Publishes the static control panel only.

### Local Computer

Runs the local worker API and later the real browser automation.

## Why This Shape Matters

This structure supports the target product requirements:

- multi-portal configuration
- editable operator control
- local credentials and local file paths
- agent memory and future scheduling
- a public UI layer without exposing the worker itself
