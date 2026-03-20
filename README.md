# AI Invoice Agent

This repository is organized around two separate concerns from day one:

- `frontend/`: a static control panel prototype that can be published with GitHub Pages
- `app/`: a lightweight Python scaffold for the future local invoice worker

The important constraint is deliberate: GitHub Pages hosts the interface, not the Python bot. The actual automation worker runs on your local computer for now.

## What GitHub Is Used For

GitHub is the source-of-truth for:

- project code
- visual prototype
- architecture documentation
- roadmap and product decisions

It is where the project is versioned and shared.

## What GitHub Pages Is Used For

GitHub Pages is only used to publish the static frontend inside `frontend/`.

That means GitHub Pages can host:

- dashboard screens
- mock data views
- product explanations
- future control-panel UI

It does not run:

- Python
- Playwright
- invoice downloads
- portal login automation

## What Runs Locally On Your Computer

The future worker in `app/` will run locally and eventually handle:

- logging into portals such as Orange
- navigating billing pages
- downloading invoice PDFs
- extracting invoice data
- remembering successful patterns
- writing audit logs

In this phase, the Python side is only a placeholder scaffold.

## What The Interface Does

The frontend is a visual product prototype. It helps you:

- understand the product shape
- explain the workflow to others
- visualize portal setup and run history
- define what the future control panel should feel like

## What The Bot Does

Right now, the bot does not perform real automation. The Python files exist to define future boundaries and responsibilities.

## What Is Real Now Vs Planned Later

Real now:

- static dashboard prototype in `frontend/`
- mock data for realistic screens
- architecture, user-flow, and roadmap docs
- Python placeholder modules for future local execution

Planned later:

- real Orange login flow
- billing-page navigation
- invoice detection and PDF download
- email sending
- persistence and scheduling
- connection between the UI and the local worker

## Folder Structure

```text
frontend/   static GitHub Pages-friendly UI prototype
app/        local Python worker scaffold
docs/       architecture, user flow, and roadmap docs
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

You can also open `frontend/index.html` directly, but a local server is better because it matches how static hosting behaves.

## Publish The Frontend To GitHub Pages

Recommended manual flow:

1. Push this repository to GitHub.
2. Open repository `Settings`.
3. Open `Pages`.
4. Choose the branch you want to publish from.
5. Set the folder to `/frontend` if available in your GitHub Pages configuration.
6. Save and wait for the Pages deployment URL.

If your Pages setup does not allow `/frontend` directly, the next phase can add a small GitHub Actions workflow that publishes the `frontend/` folder automatically.

## Local Python Scaffold

The current Python scaffold is intentionally minimal and non-operational:

- [main.py](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\app\main.py)
- [base.py](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\app\portals\base.py)
- [orange.py](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\app\portals\orange.py)
- [parser.py](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\app\invoices\parser.py)
- [logger.py](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\app\audit\logger.py)
- [store.py](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\app\memory\store.py)

They exist to show responsibility boundaries before real automation starts.

## Supporting Docs

- [architecture.md](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\docs\architecture.md)
- [user-flow.md](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\docs\user-flow.md)
- [roadmap.md](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\docs\roadmap.md)
