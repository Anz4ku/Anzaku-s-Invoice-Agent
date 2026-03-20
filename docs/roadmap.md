# Roadmap: From Visual Prototype To Orange Automation

## Phase 1: Product Shape

Delivered in this repository now:

- static dashboard prototype
- mock portal configuration
- mock activity and history
- human-like agent loop explanation
- Orange integration roadmap cards
- Python scaffold only

## Phase 2: Orange Discovery

Next engineering step:

- inspect the Orange portal manually
- map the login flow
- identify billing navigation labels
- identify invoice timing and naming patterns
- collect example invoice PDFs

## Phase 3: Local Worker Foundation

Build the real local worker around:

- browser session management
- credentials loading from local environment
- audit logging
- local file download management
- retry and verification rules

## Phase 4: Orange MVP Automation

Implement:

- login
- billing page navigation
- invoice detection
- PDF download
- invoice parse and validation

Definition of done for this phase:

- one real Orange invoice can be downloaded locally with a reliable audit trail

## Phase 5: Operator Feedback Loop

Add:

- persistent run history
- memory of successful paths
- better failure explanations
- optional email sending

## Phase 6: Connect UI And Worker

After the Orange local worker is stable:

- connect the frontend to real local run data
- decide whether to use a local API, file-based sync, or future server
- keep GitHub Pages as the interface if a static-first model still fits
