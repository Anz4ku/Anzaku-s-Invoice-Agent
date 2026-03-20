// Frontend logic for the static dashboard plus optional local worker API bridge.
// If the local API is running, the UI reads and writes real local state.
// Otherwise it falls back to browser-only prototype behavior.

const API_BASE = "http://127.0.0.1:8765/api";
const PORTAL_STORAGE_KEY = "ai-invoice-agent-portals";
const CHAT_STORAGE_KEY = "ai-invoice-agent-chat";
const MEMORY_STORAGE_KEY = "ai-invoice-agent-memory";

const fallbackData = window.mockData;

const appState = {
  connected: false,
  dashboard: { ...fallbackData.dashboard },
  portals: loadStoredList(PORTAL_STORAGE_KEY, fallbackData.portals),
  runs: [...fallbackData.runs],
  invoices: [...fallbackData.invoices],
  errors: [...fallbackData.errors],
  logic: [...fallbackData.logic],
  roadmap: [...fallbackData.roadmap],
  agent: {
    suggestions: [...fallbackData.agent.suggestions],
    conversation: loadStoredList(CHAT_STORAGE_KEY, fallbackData.agent.conversation),
    memory: loadStoredList(MEMORY_STORAGE_KEY, fallbackData.agent.memory),
  },
};

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function chipClass(value) {
  if (value === "active" || value === "success") return "chip active";
  if (value === "inactive" || value === "failed") return "chip paused";
  return "chip manual";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function loadStoredList(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function saveStoredList(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_error) {
    // Ignore browser storage failures in prototype mode.
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch (_error) {
      message = await response.text();
    }
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json();
}

function syncLocalPrototype() {
  saveStoredList(PORTAL_STORAGE_KEY, appState.portals);
  saveStoredList(CHAT_STORAGE_KEY, appState.agent.conversation);
  saveStoredList(MEMORY_STORAGE_KEY, appState.agent.memory);
}

function renderDashboard() {
  setText("currentStatus", appState.dashboard.currentStatus);
  setText("configuredPortals", appState.dashboard.configuredPortals);
  setText("nextRun", appState.dashboard.nextRun);
  setText("lastInvoice", appState.dashboard.lastInvoice);

  const badge = document.getElementById("connectionBadge");
  const caption = document.getElementById("connectionCaption");
  const modeNote = document.getElementById("chatModeNote");

  if (appState.connected) {
    badge.textContent = "Local API Connected";
    caption.textContent = "Operator changes are being saved to the local worker";
    modeNote.textContent = "Connected to the local worker API. Portal edits and coaching are persisted locally.";
  } else {
    badge.textContent = "Prototype Ready";
    caption.textContent = "Local worker not connected yet";
    modeNote.textContent = "Running in prototype mode. Start the local API to persist real operator guidance.";
  }
}

function renderPortalCards() {
  const root = document.getElementById("portalCards");
  root.innerHTML = appState.portals
    .map(
      (portal) => `
        <article class="portal-card" data-portal-id="${escapeHtml(portal.id)}">
          <div class="portal-header">
            <div>
              <p class="label">Portal</p>
              <h3>${escapeHtml(portal.name)}</h3>
            </div>
            <span class="${chipClass(portal.status)}">${escapeHtml(portal.status)}</span>
          </div>
          <p class="helper">
            ${
              appState.connected
                ? "This configuration is connected to the local worker API."
                : "Prototype mode: changes are stored in this browser until the local API is running."
            }
          </p>
          <div class="portal-form-grid">
            <label class="field-group">
              <span>Status</span>
              <select name="status">
                ${["active", "inactive", "paused"]
                  .map(
                    (option) =>
                      `<option value="${option}" ${portal.status === option ? "selected" : ""}>${option}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="field-group">
              <span>Frequency</span>
              <select name="frequency">
                ${["manual", "weekly", "monthly"]
                  .map(
                    (option) =>
                      `<option value="${option}" ${portal.frequency === option ? "selected" : ""}>${option}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="field-group">
              <span>Invoice window</span>
              <input name="invoice_window" value="${escapeHtml(portal.invoice_window)}" />
            </label>
            <label class="field-group">
              <span>Target email</span>
              <input name="target_email" value="${escapeHtml(portal.target_email)}" />
            </label>
            <label class="field-group">
              <span>Download folder</span>
              <input name="download_folder" value="${escapeHtml(portal.download_folder)}" />
            </label>
            <label class="field-group">
              <span>Credentials label</span>
              <input name="credentials_label" value="${escapeHtml(portal.credentials_label || "")}" />
            </label>
            <label class="field-group">
              <span>Login URL</span>
              <input name="login_url" value="${escapeHtml(portal.login_url || "")}" />
            </label>
            <label class="field-group">
              <span>Billing URL</span>
              <input name="billing_url" value="${escapeHtml(portal.billing_url || "")}" />
            </label>
            <label class="field-group">
              <span>Billing label</span>
              <input name="billing_link_text" value="${escapeHtml(portal.billing_link_text || "")}" />
            </label>
            <label class="field-group">
              <span>Invoice match text</span>
              <input name="invoice_match_text" value="${escapeHtml(portal.invoice_match_text || "")}" />
            </label>
            <label class="field-group">
              <span>Download label</span>
              <input name="download_button_text" value="${escapeHtml(portal.download_button_text || "")}" />
            </label>
            <label class="field-group">
              <span>Headless</span>
              <select name="headless">
                <option value="true" ${portal.headless ? "selected" : ""}>true</option>
                <option value="false" ${portal.headless ? "" : "selected"}>false</option>
              </select>
            </label>
          </div>
          <div class="portal-form-grid">
            <label class="field-group">
              <span>Username selector</span>
              <input name="username_selector" value="${escapeHtml(portal.username_selector || "")}" />
            </label>
            <label class="field-group">
              <span>Password selector</span>
              <input name="password_selector" value="${escapeHtml(portal.password_selector || "")}" />
            </label>
            <label class="field-group">
              <span>Submit selector</span>
              <input name="submit_selector" value="${escapeHtml(portal.submit_selector || "")}" />
            </label>
          </div>
          <label class="field-group field-group-full">
            <span>Notes</span>
            <textarea name="notes" rows="4">${escapeHtml(portal.notes)}</textarea>
          </label>
          <div class="button-row">
            <button class="button-primary" type="button" data-action="save">Save</button>
            <button class="button-secondary" type="button" data-action="pause">Pause</button>
            <button class="button-ghost" type="button" data-action="test">Run test</button>
            <button class="button-dark" type="button" data-action="download">Run download</button>
          </div>
        </article>
      `
    )
    .join("");

  root.querySelectorAll("[data-action='save']").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const card = event.currentTarget.closest("[data-portal-id]");
      await savePortalCard(card);
    });
  });

  root.querySelectorAll("[data-action='pause']").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const card = event.currentTarget.closest("[data-portal-id]");
      card.querySelector("[name='status']").value = "paused";
      await savePortalCard(card);
    });
  });

  root.querySelectorAll("[data-action='test']").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const card = event.currentTarget.closest("[data-portal-id]");
      await runPortalTest(card.dataset.portalId);
    });
  });

  root.querySelectorAll("[data-action='download']").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const card = event.currentTarget.closest("[data-portal-id]");
      await savePortalCard(card);
      await runPortalDownload(card.dataset.portalId);
    });
  });
}

function collectPortalUpdates(card) {
  const fields = [
    "status",
    "frequency",
    "invoice_window",
    "target_email",
    "download_folder",
    "notes",
    "credentials_label",
    "login_url",
    "billing_url",
    "billing_link_text",
    "invoice_match_text",
    "download_button_text",
    "username_selector",
    "password_selector",
    "submit_selector",
    "headless",
  ];
  const updates = Object.fromEntries(
    fields.map((name) => [name, card.querySelector(`[name='${name}']`).value.trim()])
  );
  updates.headless = updates.headless === "true";
  return updates;
}

async function savePortalCard(card) {
  const portalId = card.dataset.portalId;
  const updates = collectPortalUpdates(card);

  if (appState.connected) {
    const response = await apiRequest(`/portals/${portalId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    appState.portals = appState.portals.map((portal) => (portal.id === portalId ? response.portal : portal));
  } else {
    appState.portals = appState.portals.map((portal) => (portal.id === portalId ? { ...portal, ...updates } : portal));
    syncLocalPrototype();
  }

  renderPortalCards();
}

async function runPortalTest(portalId) {
  if (appState.connected) {
    const response = await apiRequest(`/portals/${portalId}/test`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    appState.runs = response.activity.runs;
  } else {
    const portal = appState.portals.find((item) => item.id === portalId);
    appState.runs.unshift({
      title: `${portal.name} operator test`,
      state: "success",
      timestamp: new Date().toLocaleString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).replace(",", " ·"),
      details: "Prototype test queued in browser mode. Start the local API for persistent run history.",
    });
    appState.runs = appState.runs.slice(0, 20);
  }

  renderActivity();
}

async function runPortalDownload(portalId) {
  try {
    if (appState.connected) {
      const response = await apiRequest(`/portals/${portalId}/download`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      appState.runs = response.activity.runs;
      appState.invoices = response.activity.invoices;
      appState.errors = response.activity.errors;
      appState.dashboard.lastInvoice = response.status.last_invoice;
      appState.dashboard.currentStatus = response.status.current_status;
    } else {
      throw new Error("Start the local API before running a real download.");
    }
  } catch (error) {
    window.alert(`Download failed: ${error.message}`);
  }

  renderDashboard();
  renderActivity();
}

function renderActivity() {
  renderList("runHistory", appState.runs, "state");
  renderList("invoiceHistory", appState.invoices);
  renderList("errorHistory", appState.errors);
}

function renderList(id, items, stateKey) {
  const root = document.getElementById(id);
  root.innerHTML = items
    .map(
      (item) => `
        <article class="list-item">
          <div class="list-header">
            <h4>${escapeHtml(item.title)}</h4>
            ${stateKey && item[stateKey] ? `<span class="${chipClass(item[stateKey])}">${escapeHtml(item[stateKey])}</span>` : ""}
          </div>
          <p>${escapeHtml(item.timestamp)}</p>
          <p>${escapeHtml(item.details)}</p>
        </article>
      `
    )
    .join("");
}

function renderLogic() {
  const root = document.getElementById("logicSteps");
  root.innerHTML = appState.logic
    .map(
      (step, index) => `
        <article class="logic-step">
          <div class="step-number">${index + 1}</div>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.description)}</p>
        </article>
      `
    )
    .join("");
}

function renderRoadmap() {
  const root = document.getElementById("roadmapItems");
  root.innerHTML = appState.roadmap
    .map(
      (item) => `
        <article class="roadmap-item">
          <p class="label">Orange step</p>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `
    )
    .join("");
}

function renderSuggestions() {
  const root = document.getElementById("chatSuggestions");
  root.innerHTML = appState.agent.suggestions
    .map(
      (suggestion) => `
        <button class="suggestion-chip" type="button">${escapeHtml(suggestion)}</button>
      `
    )
    .join("");

  root.querySelectorAll(".suggestion-chip").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById("chatInput");
      input.value = button.textContent;
      input.focus();
    });
  });
}

function renderMemory() {
  const root = document.getElementById("memoryList");
  root.innerHTML = appState.agent.memory
    .map(
      (item) => `
        <div class="memory-item">
          <span class="memory-dot"></span>
          <p>${escapeHtml(item)}</p>
        </div>
      `
    )
    .join("");
}

function renderChat() {
  const root = document.getElementById("chatMessages");
  root.innerHTML = appState.agent.conversation
    .map(
      (message) => `
        <article class="chat-message ${message.role === "agent" ? "agent-message" : "operator-message"}">
          <div class="chat-meta">${message.role === "agent" ? "Agent" : "Operator"}</div>
          <p>${escapeHtml(message.text)}</p>
        </article>
      `
    )
    .join("");
  root.scrollTop = root.scrollHeight;
}

function rememberFromMessage(message) {
  const lowered = message.toLowerCase();
  const hints = [];

  if (lowered.includes("billing") || lowered.includes("facturas")) {
    hints.push("Check for Billing or Facturas labels before navigating deeper.");
  }
  if (lowered.includes("pdf")) {
    hints.push("Verify that the final download is a PDF before closing the run.");
  }
  if (lowered.includes("orange")) {
    hints.push("Orange-specific coaching has been provided by the operator.");
  }
  if (lowered.includes("screenshot")) {
    hints.push("If the expected page is missing, capture a screenshot before retrying.");
  }
  if (lowered.includes("window") || lowered.includes("days")) {
    hints.push("Invoice availability may depend on a specific billing window.");
  }

  hints.forEach((item) => {
    if (!appState.agent.memory.includes(item)) {
      appState.agent.memory.unshift(item);
    }
  });

  appState.agent.memory = appState.agent.memory.slice(0, 10);
}

function buildPrototypeReply(message) {
  const lowered = message.toLowerCase();
  if (lowered.includes("orange") && (lowered.includes("billing") || lowered.includes("facturas"))) {
    return "Understood. For Orange, I would first observe the page, confirm I can see Billing or Facturas, and only then continue toward invoices.";
  }
  if (lowered.includes("pdf")) {
    return "I would treat PDF validation as part of verification: confirm the file downloaded correctly, confirm the extension is PDF, and record the saved location.";
  }
  if (lowered.includes("remember") || lowered.includes("learn") || lowered.includes("aprende")) {
    return "I would save that as operator guidance for future runs. In the real product, this becomes portal memory that the local worker can reuse.";
  }
  if (lowered.includes("error") || lowered.includes("fails") || lowered.includes("if not")) {
    return "That is a useful fallback rule. I would stop, capture context, and avoid continuing if the page does not match the expected state.";
  }
  return "I can use that guidance as operator coaching. In the real version, I would convert it into observable checks, safe actions, and memory for future portal runs.";
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input.value.trim();

  if (!message) {
    return;
  }

  if (appState.connected) {
    const response = await apiRequest("/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    appState.agent.conversation = response.agent.conversation;
    appState.agent.memory = response.agent.memory;
    if (response.portals) {
      appState.portals = response.portals;
    }
    if (response.status) {
      appState.dashboard.currentStatus = response.status.current_status;
      appState.dashboard.configuredPortals = response.status.configured_portals;
      appState.dashboard.nextRun = response.status.next_run;
      appState.dashboard.lastInvoice = response.status.last_invoice;
    }
  } else {
    appState.agent.conversation.push({ role: "operator", text: message });
    rememberFromMessage(message);
    appState.agent.conversation.push({ role: "agent", text: buildPrototypeReply(message) });
    appState.agent.conversation = appState.agent.conversation.slice(-20);
    syncLocalPrototype();
  }

  renderChat();
  renderMemory();
  renderDashboard();
  renderPortalCards();
  input.value = "";
}

async function clearChat() {
  if (appState.connected) {
    const agent = await apiRequest("/agent/reset", {
      method: "POST",
      body: JSON.stringify({}),
    });
    appState.agent.conversation = agent.conversation;
    appState.agent.memory = agent.memory;
  } else {
    appState.agent.conversation = [...fallbackData.agent.conversation];
    appState.agent.memory = [...fallbackData.agent.memory];
    syncLocalPrototype();
  }

  renderChat();
  renderMemory();
}

async function connectLocalApi() {
  try {
    const [statusResponse, portalsResponse, activityResponse, agentResponse] = await Promise.all([
      apiRequest("/status"),
      apiRequest("/portals"),
      apiRequest("/activity"),
      apiRequest("/agent"),
    ]);

    appState.connected = true;
    appState.dashboard.currentStatus = statusResponse.status.current_status;
    appState.dashboard.configuredPortals = statusResponse.status.configured_portals;
    appState.dashboard.nextRun = statusResponse.status.next_run;
    appState.dashboard.lastInvoice = statusResponse.status.last_invoice;
    appState.portals = portalsResponse.portals;
    appState.runs = activityResponse.runs;
    appState.invoices = activityResponse.invoices;
    appState.errors = activityResponse.errors;
    appState.agent.conversation = agentResponse.conversation;
    appState.agent.memory = agentResponse.memory;
  } catch (_error) {
    appState.connected = false;
  }
}

function bindEvents() {
  document.getElementById("chatForm").addEventListener("submit", handleChatSubmit);
  document.getElementById("clearChatButton").addEventListener("click", clearChat);
}

async function bootstrap() {
  await connectLocalApi();
  renderDashboard();
  renderPortalCards();
  renderActivity();
  renderLogic();
  renderRoadmap();
  renderSuggestions();
  renderChat();
  renderMemory();
  bindEvents();
}

bootstrap();
