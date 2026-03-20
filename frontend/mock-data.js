// Visual placeholder data for the static prototype.
// This file is intentionally static so the frontend can be published on GitHub Pages.
window.mockData = {
  dashboard: {
    currentStatus: "Designing the control panel before local automation",
    configuredPortals: "1 pilot portal, 2 future candidates",
    nextRun: "April 3, 2026 at 09:00",
    lastInvoice: "Orange Spain · March 2026 · PDF saved",
  },
  portals: [
    {
      name: "Orange Spain",
      status: "active",
      frequency: "monthly",
      invoiceWindow: "Days 3 to 7",
      targetEmail: "billing@company.com",
      downloadFolder: "C:\\Invoices\\Orange",
      notes:
        "First real portal planned for implementation. Operator wants reliable invoice download before adding email delivery.",
    },
    {
      name: "Utility Provider",
      status: "inactive",
      frequency: "manual",
      invoiceWindow: "Days 10 to 15",
      targetEmail: "finance@company.com",
      downloadFolder: "C:\\Invoices\\Utilities",
      notes:
        "Placeholder example used to show multi-portal setup in the interface.",
    },
  ],
  runs: [
    {
      title: "Orange monthly check",
      state: "success",
      timestamp: "March 19, 2026 · 09:12",
      details: "Invoice found, PDF saved, parsing confidence 0.94.",
    },
    {
      title: "Orange retry after login timeout",
      state: "failed",
      timestamp: "March 18, 2026 · 09:06",
      details: "Session expired before reaching the billing page.",
    },
    {
      title: "Utility portal smoke test",
      state: "success",
      timestamp: "March 15, 2026 · 11:24",
      details: "Prototype test run completed with placeholder logic.",
    },
  ],
  invoices: [
    {
      title: "Orange Spain · INV-2026-03",
      timestamp: "Downloaded March 19, 2026",
      details: "Total €128.40 · Stored in C:\\Invoices\\Orange",
    },
    {
      title: "Orange Spain · INV-2026-02",
      timestamp: "Downloaded February 19, 2026",
      details: "Total €126.70 · Operator approved",
    },
  ],
  errors: [
    {
      title: "Login page changed",
      timestamp: "Observed March 18, 2026",
      details: "The sign-in form wording changed, so the agent needs a safer detection rule.",
    },
    {
      title: "Invoice not visible in expected window",
      timestamp: "Observed March 7, 2026",
      details: "No invoice appeared during the first billing check window.",
    },
  ],
  logic: [
    {
      title: "Observe",
      description: "Read the page title, visible labels, and important screen clues before touching anything.",
    },
    {
      title: "Think",
      description: "Choose the next action the same way a cautious operator would: low risk and easy to verify.",
    },
    {
      title: "Act",
      description: "Open a page, click a clear label, or type into a field without relying on brittle shortcuts.",
    },
    {
      title: "Verify",
      description: "Check that the expected result actually happened before moving to the next step.",
    },
    {
      title: "Remember",
      description: "Save what worked, note what failed, and make the next run more reliable.",
    },
  ],
  roadmap: [
    { title: "Login", description: "Open the Orange portal and handle the sign-in flow with local credentials." },
    { title: "Billing page", description: "Reach the billing or invoices area using stable labels and visible navigation." },
    { title: "Invoice detection", description: "Find the invoice matching the expected billing period." },
    { title: "PDF download", description: "Save the invoice PDF safely to the chosen local folder." },
    { title: "Email sending", description: "Later, send the downloaded invoice or a run summary to the target email." },
  ],
};
