# User Flow

## Goal

Design the product around a simple operator journey that is easy to understand before real automation is implemented.

## Current Prototype Flow

1. Open the dashboard.
2. Read the current project status.
3. Review which portals are planned or active.
4. Inspect how each portal will be configured.
5. Review recent runs, invoice history, and common failure cases.
6. Understand the human-like agent loop.
7. Review the Orange roadmap as the first real automation target.

## Future Real Operator Flow

1. Open the control panel.
2. Configure Orange portal details and local destination folder.
3. Start a test run.
4. The local Python worker opens the portal and logs in.
5. The worker navigates to billing.
6. The worker finds the target invoice.
7. The worker downloads the PDF locally.
8. The worker parses and validates the invoice.
9. The system records the audit history and what worked.
10. The operator reviews the result in the interface.

## Why This Matters

This flow keeps the product founder-friendly:

- the interface explains the system in plain language
- the worker remains a separate implementation detail
- the product can be understood before real portal automation exists
