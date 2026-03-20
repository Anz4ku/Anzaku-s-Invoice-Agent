// Static rendering logic for the visual prototype.
// Buttons do not persist data in v1; they exist to show intended product actions.

const data = window.mockData;

const setText = (id, value) => {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
};

const chipClass = (value) => {
  if (value === "active" || value === "success") return "chip active";
  if (value === "inactive" || value === "failed") return "chip paused";
  return "chip manual";
};

const renderPortalCards = () => {
  const root = document.getElementById("portalCards");
  root.innerHTML = data.portals
    .map(
      (portal) => `
        <article class="portal-card">
          <div class="portal-header">
            <div>
              <p class="label">Portal</p>
              <h3>${portal.name}</h3>
            </div>
            <span class="${chipClass(portal.status)}">${portal.status}</span>
          </div>
          <p class="helper">Visual placeholder configuration for the future local worker.</p>
          <div class="portal-meta">
            <div class="meta-box"><span>Frequency</span>${portal.frequency}</div>
            <div class="meta-box"><span>Invoice window</span>${portal.invoiceWindow}</div>
            <div class="meta-box"><span>Target email</span>${portal.targetEmail}</div>
            <div class="meta-box"><span>Download folder</span>${portal.downloadFolder}</div>
          </div>
          <p><strong>Notes:</strong> ${portal.notes}</p>
          <div class="button-row">
            <button class="button-primary" type="button">Save</button>
            <button class="button-secondary" type="button">Pause</button>
            <button class="button-ghost" type="button">Run test</button>
          </div>
        </article>
      `
    )
    .join("");
};

const renderList = (id, items, stateKey) => {
  const root = document.getElementById(id);
  root.innerHTML = items
    .map(
      (item) => `
        <article class="list-item">
          <div class="list-header">
            <h4>${item.title}</h4>
            ${stateKey && item[stateKey] ? `<span class="${chipClass(item[stateKey])}">${item[stateKey]}</span>` : ""}
          </div>
          <p>${item.timestamp}</p>
          <p>${item.details}</p>
        </article>
      `
    )
    .join("");
};

const renderLogic = () => {
  const root = document.getElementById("logicSteps");
  root.innerHTML = data.logic
    .map(
      (step, index) => `
        <article class="logic-step">
          <div class="step-number">${index + 1}</div>
          <h3>${step.title}</h3>
          <p>${step.description}</p>
        </article>
      `
    )
    .join("");
};

const renderRoadmap = () => {
  const root = document.getElementById("roadmapItems");
  root.innerHTML = data.roadmap
    .map(
      (item) => `
        <article class="roadmap-item">
          <p class="label">Orange step</p>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `
    )
    .join("");
};

setText("currentStatus", data.dashboard.currentStatus);
setText("configuredPortals", data.dashboard.configuredPortals);
setText("nextRun", data.dashboard.nextRun);
setText("lastInvoice", data.dashboard.lastInvoice);

renderPortalCards();
renderList("runHistory", data.runs, "state");
renderList("invoiceHistory", data.invoices);
renderList("errorHistory", data.errors);
renderLogic();
renderRoadmap();
