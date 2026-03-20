# Roadmap: From Control Panel To Real Orange Automation

## Phase 1: Product Shape

Delivered:

- static dashboard prototype
- multi-portal configuration UI
- operator-to-agent chat
- local worker API
- local persistence for portal state, memory, and audit history

## Phase 2: Orange Discovery

Next:

- inspect the Orange portal manually
- map the login flow
- identify billing navigation labels
- identify invoice timing and naming patterns
- collect example invoice PDFs

## Phase 3: Worker Foundation

Build the real local worker around:

- browser session management
- credential loading from local environment
- portal-specific profile loading
- reliable file download handling
- retry and verification rules

## Phase 4: Orange MVP Automation

Implement:

- login
- billing page navigation
- invoice detection
- PDF download
- local save to the configured folder
- invoice parse and validation

Definition of done:

- one real Orange invoice can be downloaded locally and saved to the operator-selected folder with an audit trail

## Phase 5: Learning And Scheduling

Add:

- memory of successful portal paths
- learned invoice timing windows
- recurring scheduling
- pause, retry, and operator override logic

## Phase 6: Multiportal Expansion

Add:

- portal plugin pattern
- provider-specific adapters
- unified run model across portals
- operator controls for multiple credential sets and destination folders
