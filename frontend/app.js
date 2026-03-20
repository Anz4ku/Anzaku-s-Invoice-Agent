// Static rendering logic for the visual prototype.
// Buttons do not persist data to a backend in v1; the chat uses local browser storage only.

const data = window.mockData;
const CHAT_STORAGE_KEY = "ai-invoice-agent-chat";
const MEMORY_STORAGE_KEY = "ai-invoice-agent-memory";

const setText = (id, value) => {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
};

const chipClass = (value) => {
  if (value === "active" || value === "success") return "chip active";
  if (value === "inactive" || value === "failed") return "chip paused";
  return "chip manual";
};

const escapeHtml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const loadStoredList = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
};

const saveStoredList = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_error) {
    // Ignore localStorage failures in the static prototype.
  }
};

let chatHistory = loadStoredList(CHAT_STORAGE_KEY, data.agent.conversation);
let memoryItems = loadStoredList(MEMORY_STORAGE_KEY, data.agent.memory);

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

const renderSuggestions = () => {
  const root = document.getElementById("chatSuggestions");
  root.innerHTML = data.agent.suggestions
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
};

const renderMemory = () => {
  const root = document.getElementById("memoryList");
  root.innerHTML = memoryItems
    .map(
      (item) => `
        <div class="memory-item">
          <span class="memory-dot"></span>
          <p>${escapeHtml(item)}</p>
        </div>
      `
    )
    .join("");
};

const renderChat = () => {
  const root = document.getElementById("chatMessages");
  root.innerHTML = chatHistory
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
};

const rememberFromMessage = (message) => {
  const lowered = message.toLowerCase();
  const candidates = [];

  if (lowered.includes("billing") || lowered.includes("facturas")) {
    candidates.push("Check for Billing or Facturas labels before navigating deeper.");
  }
  if (lowered.includes("pdf")) {
    candidates.push("Verify that the final download is a PDF before closing the run.");
  }
  if (lowered.includes("orange")) {
    candidates.push("Orange-specific coaching has been provided by the operator.");
  }
  if (lowered.includes("screenshot")) {
    candidates.push("If the expected page is missing, capture a screenshot before retrying.");
  }
  if (lowered.includes("days") || lowered.includes("window")) {
    candidates.push("Invoice availability may depend on a specific billing window.");
  }

  candidates.forEach((item) => {
    if (!memoryItems.includes(item)) {
      memoryItems.unshift(item);
    }
  });

  memoryItems = memoryItems.slice(0, 6);
  saveStoredList(MEMORY_STORAGE_KEY, memoryItems);
};

const buildAgentReply = (message) => {
  const lowered = message.toLowerCase();

  if (lowered.includes("orange") && (lowered.includes("billing") || lowered.includes("facturas"))) {
    return "Understood. For Orange, I would first observe the page, confirm I can see Billing or Facturas, and only then continue toward invoices.";
  }
  if (lowered.includes("pdf")) {
    return "I would treat PDF validation as part of verification: confirm the file downloaded correctly, confirm the extension is PDF, and record the saved location.";
  }
  if (lowered.includes("remember") || lowered.includes("aprende") || lowered.includes("learn")) {
    return "I would save that as operator guidance for future runs. In the real product, this would become portal memory that the local worker can reuse.";
  }
  if (lowered.includes("error") || lowered.includes("fails") || lowered.includes("if not")) {
    return "That is a useful fallback rule. I would stop, capture context, and avoid continuing if the page does not match the expected state.";
  }
  return "I can use that guidance as operator coaching. In the real version, I would convert it into observable checks, safe actions, and memory for future portal runs.";
};

const handleChatSubmit = (event) => {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const message = input.value.trim();

  if (!message) {
    return;
  }

  chatHistory.push({ role: "operator", text: message });
  rememberFromMessage(message);
  chatHistory.push({ role: "agent", text: buildAgentReply(message) });

  chatHistory = chatHistory.slice(-14);
  saveStoredList(CHAT_STORAGE_KEY, chatHistory);
  renderChat();
  renderMemory();
  input.value = "";
};

const clearChat = () => {
  chatHistory = [...data.agent.conversation];
  memoryItems = [...data.agent.memory];
  saveStoredList(CHAT_STORAGE_KEY, chatHistory);
  saveStoredList(MEMORY_STORAGE_KEY, memoryItems);
  renderChat();
  renderMemory();
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
renderSuggestions();
renderChat();
renderMemory();

document.getElementById("chatForm").addEventListener("submit", handleChatSubmit);
document.getElementById("clearChatButton").addEventListener("click", clearChat);
