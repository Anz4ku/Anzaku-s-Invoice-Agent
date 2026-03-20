# AI Invoice Agent

This repository now has a real split between:

- `frontend/`: a GitHub Pages-friendly operator control panel
- `app/`: a local Python worker API that stores configuration, memory, activity, and runs Playwright locally

GitHub Pages hosts the interface. The actual worker still runs on your computer.

## What Works Now

You already have:

- published static dashboard
- editable multi-portal configuration
- operator-to-agent chat
- local persistence for portal settings, memory, and activity
- local API endpoints for saving portal changes
- local API endpoint for triggering a real Orange download attempt
- PDF validation after download

The Orange flow is now operationally wired, but it still needs:

- real credentials in `.env`
- the right URLs/selectors/text labels for your Orange account

## Folder Structure

```text
frontend/   GitHub Pages control panel
app/        local worker API and automation runtime
docs/       architecture and roadmap
data/       local state and audit files
```

## One-Time Setup

From the repository root:

```bash
python -m venv .venv
python -m pip install --target .\.venv\Lib\site-packages playwright pypdf python-dotenv
python -m playwright install chromium
```

## Configure Credentials

Create a local `.env` file based on `.env.example`.

For the default Orange profile, set:

```text
ORANGE_MAIN_USERNAME=your_username
ORANGE_MAIN_PASSWORD=your_password
```

You can also keep the fallback names:

```text
ORANGE_USERNAME=your_username
ORANGE_PASSWORD=your_password
```

## Run The Local Worker API

Use the Python inside the repo virtual environment:

```bash
.\.venv\Scripts\python.exe -m app.main --host 127.0.0.1 --port 8765
```

That starts the local API at:

```text
http://127.0.0.1:8765/api
```

## Use The Frontend

You have two options:

### GitHub Pages

Open:

[https://anz4ku.github.io/Anzaku-s-Invoice-Agent/](https://anz4ku.github.io/Anzaku-s-Invoice-Agent/)

If the local API is running on your machine, the page will connect to it and stop using prototype mode.

### Local Frontend

For local development:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/frontend/
```

## Operator Flow Right Now

1. Start the local worker API.
2. Open the frontend.
3. Edit the Orange portal profile.
4. Set:
   - login URL
   - billing URL or billing text
   - credential label
   - download folder
   - invoice text to match
   - download button text
   - input selectors if Orange needs them
5. Click `Save`.
6. Click `Run download`.

If the credentials and selectors are correct, the worker will:

- open the portal locally
- sign in
- navigate to billing
- trigger the download
- save the PDF to the configured folder
- validate the PDF
- record the result in local state and audit logs

## Local Files Used By The Worker

- `data/state.json`
- `data/audit/events.jsonl`

These are local-only and should not be committed.

## Current Limitation

I have wired the real Orange execution path, but I cannot complete a real successful invoice download from here without:

- your actual Orange credentials
- the exact Orange account flow
- the final labels/selectors that appear in your account

The system is ready for that input and already fails cleanly if those details are missing.

## Supporting Docs

- [architecture.md](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\docs\architecture.md)
- [user-flow.md](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\docs\user-flow.md)
- [roadmap.md](C:\Users\moise\Documents\Invoice agent\Anzaku-s-Invoice-Agent\docs\roadmap.md)
