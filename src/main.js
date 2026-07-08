const app = document.getElementById("root");
const storageKey = "swarm-command-state-v1";
const roles = ["Watch Commander", "OSINT Analyst", "Investigator", "Prosecutor", "Admin"];
const screens = [
  ["dashboard", "Command"],
  ["watchlist", "Watchlist"],
  ["intake", "Live Intake"],
  ["signals", "Signals"],
  ["events", "Events"],
  ["actors", "Actors"],
  ["evidence", "Evidence"],
  ["cases", "Cases"],
  ["audit", "Audit"],
  ["checklist", "POC Review"],
  ["settings", "Settings"]
];
const contentTypes = ["Post", "Reel", "Story Screenshot", "Comment", "Profile", "Hashtag Page", "Location Page"];
const excludedSources = [
  "Private DMs",
  "Private accounts",
  "Follower-only content",
  "Device location",
  "IP logs",
  "Subscriber records",
  "Carrier data",
  "Fake account access",
  "Facial recognition",
  "Automated identity confirmation"
];
const checklistSections = [
  ["Scope Confirmation", ["Instagram-only data source confirmed", "July 2026 date window confirmed", "Public-account-only collection confirmed", "Excluded data sources acknowledged"]],
  ["Watchlist Setup", ["Jurisdiction selected", "Priority locations added", "Hashtags added", "Keywords/slang added", "Public handles added if provided"]],
  ["Live Intake Test", ["Public Instagram URL entered", "Caption/comment captured", "Screenshot/media placeholder attached or noted", "Posted/captured timestamps entered", "July scope validation confirmed"]],
  ["Signal Review", ["Signal appears in inbox", "Threat/crowd/property indicators visible", "Analyst action tested", "Audit entry created"]],
  ["Event Cluster Review", ["Signal associated to event", "Event probability visible", "Location/time confidence visible", "Supporting indicators visible"]],
  ["Actor Review", ["Public handle appears in actor view", "Role assessment visible", "Required identity disclaimer visible"]],
  ["Evidence Review", ["Evidence item created", "Hash generated", "Chain-of-custody status visible", "Integrity check tested"]],
  ["Case Packet Review", ["Packet includes Instagram timeline", "Evidence artifacts included", "Actor role summary included", "Export tested"]],
  ["Demo Closeout", ["Audit log reviewed", "JSON state export completed", "Reset demo data tested if needed"]]
];

let role = null;
let screen = "dashboard";
let toast = "";
let activeFilters = [];

function isInJuly2026(date) {
  if (!date) return false;
  const parsed = new Date(date);
  return !Number.isNaN(parsed.getTime()) && parsed >= new Date("2026-07-01T00:00:00") && parsed <= new Date("2026-07-31T23:59:59");
}

function mockHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `sha256-demo-${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

function parseHashtags(text) {
  return [...new Set((text.match(/#[a-zA-Z0-9_]+/g) || []).map((tag) => tag.toLowerCase()))];
}

function detect(text, words) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word));
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function nowIso() {
  return new Date().toISOString();
}

const placeholderText = "PLACEHOLDER RECORD - replace with live public Instagram artifact during POC. Pull up tonight at the mall meetup #takeover #meet";
const seed = {
  watchlist: {
    hashtags: ["#takeover", "#pullup", "#meet"],
    publicHandles: ["@public_handle_001", "@public_handle_002", "@public_handle_003"],
    locationNames: ["Anaheim", "Orange County"],
    venueNames: ["Main mall", "Transit center"],
    keywords: ["tonight", "pull up", "bring everybody", "after dark"],
    slangTerms: ["takeover", "meet", "flash"],
    jurisdictions: ["Anaheim PD / Orange County"],
    priorityDates: ["2026-07-04", "2026-07-11", "2026-07-18", "2026-07-25"]
  },
  events: [
    {
      id: "event-001",
      name: "Placeholder Mall Gathering Signal",
      location: "Anaheim retail district",
      timeWindow: "July 2026 weekend evening",
      riskLevel: "High",
      eventFormationProbability: 84,
      locationConfidence: 78,
      timeConfidence: 72,
      violenceProbability: 54,
      propertyDamageProbability: 62,
      falsePositiveRisk: 18,
      crowdEstimate: "100-250"
    }
  ],
  signals: [],
  actors: [
    {
      id: "actor-001",
      publicHandle: "@public_handle_001",
      displayName: "Placeholder Public Account",
      role: "Originator",
      eventId: "event-001",
      roleConfidence: 74,
      riskLevel: "High",
      evidenceCount: 1,
      notes: "Public Instagram account assessment. Not confirmed legal identity unless legally confirmed."
    },
    {
      id: "actor-002",
      publicHandle: "@public_handle_002",
      displayName: "Placeholder Amplifier",
      role: "Amplifier",
      eventId: "event-001",
      roleConfidence: 69,
      riskLevel: "Medium",
      evidenceCount: 1,
      notes: "Public Instagram account assessment. Not confirmed legal identity unless legally confirmed."
    }
  ],
  evidence: [],
  auditLog: [
    {
      id: "audit-001",
      timestamp: "2026-07-04T21:05:00.000Z",
      actor: "OSINT Analyst",
      action: "Seed data loaded",
      details: "Placeholder Instagram-shaped records loaded for POC demonstration."
    }
  ],
  casePackets: [
    {
      id: "case-001",
      eventId: "event-001",
      title: "Placeholder Mall Gathering Case Packet",
      analystNotes: "Seed case packet for Markdown export review.",
      legalProcessHistory: "No legal process in MVP seed record. Public Instagram-only demonstration data.",
      suggestedOffenseReview: "Suggested offense review only. Charging decisions remain with investigators, supervisors, and prosecutors.",
      exportHistory: []
    }
  ],
  checklist: { checked: {} },
  lastIntakeSignalId: ""
};

const seedSignal = {
  id: "sig-001",
  instagramUrl: "https://instagram.com/p/placeholder001",
  contentType: "Post",
  publicHandle: "@public_handle_001",
  displayName: "Placeholder Public Account",
  caption: placeholderText,
  commentExcerpt: "PLACEHOLDER RECORD - replace with live public Instagram artifact during POC.",
  hashtags: parseHashtags(placeholderText),
  locationTag: "Anaheim",
  mentionedLocation: "Main mall",
  postedTimestamp: "2026-07-04T20:30",
  capturedTimestamp: "2026-07-04T21:05",
  uploadedArtifactName: "placeholder-screenshot-001.png",
  ocrText: "",
  analystNotes: "Seed record for police POC walkthrough.",
  collectionMethod: "Manual Public Review",
  eventId: "event-001",
  actorId: "actor-001",
  evidenceStatus: "Preserved",
  analystStatus: "Needs Review",
  hashValue: mockHash(placeholderText),
  chainOfCustodyStatus: "Captured",
  isInScopeJuly2026: true,
  threatLanguageDetected: false,
  crowdMobilizationDetected: true,
  propertyDamageDetected: false,
  policeEvasionDetected: false
};
seed.signals.push(seedSignal, {
  ...seedSignal,
  id: "sig-002",
  instagramUrl: "https://instagram.com/reel/placeholder002",
  contentType: "Reel",
  publicHandle: "@public_handle_002",
  caption: "PLACEHOLDER RECORD - replace with live public Instagram artifact during POC. Bring everybody after dark #pullup",
  hashtags: ["#pullup"],
  postedTimestamp: "2026-07-11T19:00",
  capturedTimestamp: "2026-07-11T19:30",
  actorId: "actor-002",
  analystStatus: "Accepted",
  hashValue: mockHash("placeholder002")
});
seed.evidence.push({
  id: "ev-001",
  signalId: "sig-001",
  instagramUrl: "https://instagram.com/p/placeholder001",
  artifactName: "placeholder-screenshot-001.png",
  caption: placeholderText,
  commentExcerpt: "PLACEHOLDER RECORD - replace with live public Instagram artifact during POC.",
  ocrText: "",
  hashValue: seedSignal.hashValue,
  capturedTimestamp: "2026-07-04T21:05",
  postedTimestamp: "2026-07-04T20:30",
  collector: "OSINT Analyst",
  collectionMethod: "Manual Public Review",
  chainOfCustodyStatus: "Captured",
  exportStatus: "Not Exported",
  associatedEvent: "event-001",
  associatedActor: "actor-001"
});

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return structuredClone(seed);
    const parsed = JSON.parse(raw);
    return parsed.watchlist && Array.isArray(parsed.signals) ? parsed : structuredClone(seed);
  } catch {
    return structuredClone(seed);
  }
}

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function setState(next) {
  state = typeof next === "function" ? next(state) : next;
  save();
  render();
}

function audit(action, details) {
  state.auditLog = [{ id: makeId("audit"), timestamp: nowIso(), actor: role || "System", action, details }, ...state.auditLog];
}

function download(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function kpis() {
  const inScope = state.signals.filter((signal) => signal.isInScopeJuly2026);
  const eventIds = new Set(inScope.map((signal) => signal.eventId));
  return [
    ["Instagram Artifacts Collected", inScope.length],
    ["July 2026 Signals In Scope", inScope.length],
    ["Out-of-Scope Records Flagged", state.signals.filter((signal) => !signal.isInScopeJuly2026).length],
    ["Instagram Event Clusters", state.events.filter((event) => eventIds.has(event.id)).length],
    ["Public Handles Reviewed", new Set(inScope.map((signal) => signal.publicHandle)).size],
    ["Evidence Items Preserved", state.evidence.filter((item) => inScope.some((signal) => signal.id === item.signalId)).length],
    ["High-Risk Events", state.events.filter((event) => eventIds.has(event.id) && ["High", "Critical"].includes(event.riskLevel)).length],
    ["Average Lead Time", inScope.length ? "4.8 hrs" : "N/A"]
  ];
}

function render() {
  if (!role) return renderLogin();
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-shield">SW</span><div><strong>SWARM Command</strong><span>Instagram / July 2026</span></div></div>
        <nav>${screens.map(([id, label]) => `<button data-screen="${id}" class="${screen === id ? "active" : ""}"><span>${id.slice(0, 3).toUpperCase()}</span>${label}</button>`).join("")}</nav>
      </aside>
      <main class="main">
        <header class="topbar">
          <div><div class="scope-banner">Public Instagram-only POC | July 1-31, 2026 | No private DMs, private accounts, device location, IP/subscriber data, fake access, or facial recognition</div><h1>${esc(screens.find(([id]) => id === screen)?.[1] || "Command")}</h1></div>
          <button id="switch-role" class="role-pill">${esc(role)}</button>
        </header>
        ${toast ? `<div class="toast">${esc(toast)}</div>` : ""}
        ${renderScreen()}
      </main>
    </div>`;
  document.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", () => { screen = button.dataset.screen; toast = ""; render(); }));
  document.getElementById("switch-role").addEventListener("click", () => { role = null; render(); });
  bindScreen();
}

function renderLogin() {
  app.innerHTML = `
    <main class="login-screen"><section class="login-panel">
      <div class="brand-mark">SWARM</div><h1>SWARM Command</h1>
      <p>Social Warning & Actor Risk Mapping</p><p class="tagline">Detect the mob before it moves.</p>
      <div class="role-grid">${roles.map((item) => `<button data-role="${item}">${item}</button>`).join("")}</div>
    </section></main>`;
  document.querySelectorAll("[data-role]").forEach((button) => button.addEventListener("click", () => { role = button.dataset.role; render(); }));
}

function renderScreen() {
  if (screen === "dashboard") return dashboard();
  if (screen === "watchlist") return watchlist();
  if (screen === "intake") return intake();
  if (screen === "signals") return signals();
  if (screen === "events") return events();
  if (screen === "actors") return actors();
  if (screen === "evidence") return evidence();
  if (screen === "cases") return cases();
  if (screen === "audit") return auditLog();
  if (screen === "checklist") return checklist();
  return settings();
}

function dashboard() {
  return `<section class="grid-page">${kpis().map(([label, value]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong></article>`).join("")}<article class="wide-panel"><h2>POC Flow</h2><p>Watchlist -> Instagram Live Intake -> Signals Inbox -> Event Cluster -> Actor Mapping -> Evidence Locker -> Case Packet</p></article></section>`;
}

function watchlist() {
  const map = [
    ["hashtags", "Hashtags"],
    ["publicHandles", "Public Handles"],
    ["locationNames", "Location Names"],
    ["venueNames", "Venue Names"],
    ["keywords", "Keywords"],
    ["slangTerms", "Slang Terms"],
    ["jurisdictions", "Jurisdictions"],
    ["priorityDates", "Priority Dates"]
  ];
  return `<section class="tile-grid">${map.map(([key, label]) => `<article class="panel"><h2>${label}</h2><div class="input-row"><input id="draft-${key}" placeholder="Add ${label.toLowerCase()}"><button data-add="${key}">Add</button></div><div class="chip-row">${state.watchlist[key].length ? state.watchlist[key].map((item) => `<button class="chip" data-remove="${key}" data-value="${esc(item)}">${esc(item)} x</button>`).join("") : `<p class="empty">No watchlist items yet.</p>`}</div></article>`).join("")}</section>`;
}

function intake() {
  return `<section class="panel"><h2>Instagram Live Intake</h2><div class="form-grid">
    ${field("instagramUrl", "Instagram URL")}
    <label>Content Type<select id="contentType">${contentTypes.map((type) => `<option>${type}</option>`).join("")}</select></label>
    ${field("publicHandle", "Public Handle")}
    ${field("displayName", "Display Name If Visible")}
    ${field("postedTimestamp", "Posted Timestamp", "datetime-local")}
    ${field("capturedTimestamp", "Captured Timestamp", "datetime-local")}
    ${field("hashtags", "Hashtags")}
    ${field("locationTag", "Location Tag")}
    ${field("mentionedLocation", "Mentioned Location")}
    ${field("uploadedArtifactName", "Screenshot / Media Placeholder")}
  </div>
  ${area("caption", "Caption Text")}${area("commentExcerpt", "Comment Excerpt")}${area("ocrText", "OCR Text Placeholder")}${area("analystNotes", "Analyst Notes")}
  <label>Collection Method<select id="collectionMethod"><option>Manual Public Review</option><option>Agency Provided</option><option>Business Tip</option><option>Legal Process Return</option></select></label>
  <div id="intake-errors"></div>
  <div class="button-row"><button id="submit-intake">Submit Public Instagram Artifact</button><button data-nav="signals">View Signals Inbox</button><button data-nav="evidence">View Evidence Locker</button></div></section>`;
}

function field(id, label, type = "text") {
  return `<label>${label}<input id="${id}" type="${type}"></label>`;
}

function area(id, label) {
  return `<label>${label}<textarea id="${id}"></textarea></label>`;
}

function filteredSignals() {
  return state.signals.filter((signal) => activeFilters.every((filter) => {
    if (filter === "July 2026 only") return signal.isInScopeJuly2026;
    if (contentTypes.includes(filter)) return signal.contentType === filter;
    if (filter === "Screenshot Uploaded") return Boolean(signal.uploadedArtifactName);
    if (filter === "Threat Language Detected") return signal.threatLanguageDetected;
    if (filter === "Event Time Identified") return Boolean(signal.postedTimestamp);
    if (filter === "Location Identified") return Boolean(signal.locationTag || signal.mentionedLocation);
    if (filter === "Needs Review") return signal.analystStatus === "Needs Review";
    if (filter === "Out of Scope") return !signal.isInScopeJuly2026;
    return signal.analystStatus === filter;
  }));
}

function signals() {
  const filters = ["July 2026 only", ...contentTypes, "Screenshot Uploaded", "Threat Language Detected", "Event Time Identified", "Location Identified", "Needs Review", "Accepted", "Excluded", "Escalated", "Out of Scope"];
  const rows = filteredSignals();
  return `<section class="panel"><h2>Instagram Signals Inbox</h2><div class="chip-row">${filters.map((filter) => `<button class="chip ${activeFilters.includes(filter) ? "active-chip" : ""}" data-filter="${filter}">${filter}</button>`).join("")}<button id="clear-filters">Clear filters</button></div><p class="muted">${rows.length} result(s)</p>${rows.length ? `<div class="table-wrap"><table><thead><tr><th>Handle</th><th>Type</th><th>Posted</th><th>Indicators</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.map((signal) => `<tr><td>${esc(signal.publicHandle)}</td><td>${signal.contentType}</td><td>${signal.postedTimestamp}</td><td>${["Threat", signal.crowdMobilizationDetected && "Crowd", signal.propertyDamageDetected && "Property", signal.policeEvasionDetected && "Evasion"].filter((item) => item && item !== "Threat" || signal.threatLanguageDetected).join(", ") || "None"}</td><td>${signal.analystStatus}</td><td class="mini-actions">${["Accepted", "Duplicate", "Excluded", "Escalated", "Attached to Case"].map((status) => `<button data-status="${status}" data-id="${signal.id}">${status}</button>`).join("")}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">No signals match current filters.</div>`}</section>`;
}

function events() {
  return `<section class="tile-grid">${state.events.map((event) => {
    const related = state.signals.filter((signal) => signal.eventId === event.id);
    const indicators = {
      relatedInstagramArtifacts: related.length,
      uniquePublicHandles: new Set(related.map((signal) => signal.publicHandle)).size,
      repeatedHashtags: new Set(related.flatMap((signal) => signal.hashtags)).size,
      threatIndicatorCount: related.filter((signal) => signal.threatLanguageDetected).length,
      propertyDamageIndicatorCount: related.filter((signal) => signal.propertyDamageDetected).length,
      crowdMobilizationScore: Math.min(100, related.filter((signal) => signal.crowdMobilizationDetected).length * 25)
    };
    return `<article class="panel"><h2>${esc(event.name)}</h2><p>${esc(event.location)} | ${esc(event.timeWindow)}</p><div class="indicator-grid">${Object.entries({ ...indicators, eventFormationProbability: event.eventFormationProbability, locationConfidence: event.locationConfidence, timeConfidence: event.timeConfidence, violenceProbability: event.violenceProbability, falsePositiveRisk: event.falsePositiveRisk }).map(([key, value]) => `<div><span>${key}</span><strong>${value}</strong></div>`).join("")}</div></article>`;
  }).join("")}</section>`;
}

function actors() {
  return `<section class="tile-grid">${state.actors.map((actor) => `<article class="panel"><h2>${esc(actor.publicHandle)}</h2><p>${esc(actor.displayName)}</p><strong>${actor.role}</strong><p>${actor.roleConfidence}% role confidence | ${actor.riskLevel} risk</p><p class="warning">Public Instagram account assessment. Not confirmed legal identity unless legally confirmed.</p></article>`).join("")}</section>`;
}

function evidence() {
  return `<section class="panel"><h2>Evidence Locker</h2>${state.evidence.length ? `<div class="table-wrap"><table><thead><tr><th>ID</th><th>URL</th><th>Hash</th><th>Captured</th><th>Chain</th><th>Action</th></tr></thead><tbody>${state.evidence.map((item) => `<tr><td>${item.id}</td><td>${esc(item.instagramUrl)}</td><td>${item.hashValue}</td><td>${item.capturedTimestamp}</td><td>${item.chainOfCustodyStatus}</td><td><button data-check="${item.id}">Integrity Check</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">No evidence items yet.</div>`}</section>`;
}

function packetMarkdown(packetId) {
  const packet = state.casePackets.find((item) => item.id === packetId) || state.casePackets[0];
  const event = state.events.find((item) => item.id === packet.eventId) || state.events[0];
  const signals = state.signals.filter((signal) => signal.eventId === event.id);
  const evidenceItems = state.evidence.filter((item) => signals.some((signal) => signal.id === item.signalId));
  const actorsForEvent = state.actors.filter((actor) => actor.eventId === event.id);
  return `# SWARM Command Case Packet

Exported: ${new Date().toLocaleString()}
Exported by: ${role}
Scope: Instagram / July 2026

## Instagram Event Summary
${event.name}

- Location: ${event.location}
- Time Window: ${event.timeWindow}
- Event Formation Probability: ${event.eventFormationProbability}%
- Location Confidence: ${event.locationConfidence}%
- Time Confidence: ${event.timeConfidence}%
- Violence Probability: ${event.violenceProbability}%
- Property Damage Probability: ${event.propertyDamageProbability}%

## Instagram Signal Timeline
${signals.map((signal) => `- ${signal.postedTimestamp}: ${signal.publicHandle} ${signal.contentType} - ${signal.instagramUrl} (${signal.analystStatus})`).join("\n")}

## Public Handle Role Assessment
${actorsForEvent.map((actor) => `- ${actor.publicHandle}: ${actor.role} (${actor.roleConfidence}% confidence). ${actor.notes}`).join("\n")}

## Evidence Artifacts
| Evidence ID | URL | Hash | Chain of Custody | Export Status |
|---|---|---|---|---|
${evidenceItems.map((item) => `| ${item.id} | ${item.instagramUrl} | ${item.hashValue} | ${item.chainOfCustodyStatus} | ${item.exportStatus} |`).join("\n")}

## Analyst Notes
${packet.analystNotes}

## Suggested Offense Review
${packet.suggestedOffenseReview}

## Disclaimer
SWARM Command generates intelligence leads, public-account role assessments, and evidence organization. Charging decisions remain with investigators, supervisors, and prosecutors.
`;
}

function cases() {
  return `<section class="tile-grid">${state.casePackets.length ? state.casePackets.map((packet) => `<article class="panel"><h2>${esc(packet.title)}</h2><p>${esc(packet.suggestedOffenseReview)}</p><button data-export-case="${packet.id}">Export Markdown</button></article>`).join("") : `<div class="empty">No case packets available.</div>`}</section>`;
}

function auditLog() {
  return `<section class="panel"><h2>Audit Log</h2>${state.auditLog.length ? state.auditLog.map((entry) => `<div class="audit-row"><strong>${esc(entry.action)}</strong><span>${esc(entry.timestamp)} | ${esc(entry.actor)}</span><p>${esc(entry.details)}</p></div>`).join("") : `<div class="empty">No audit entries yet.</div>`}</section>`;
}

function checklist() {
  const all = checklistSections.flatMap(([section, items]) => items.map((item) => `${section}:${item}`));
  const complete = all.filter((key) => state.checklist.checked[key]).length;
  return `<section class="panel"><h2>POC Review Checklist</h2><div class="progress"><span style="width:${(complete / all.length) * 100}%"></span></div><p>${complete} of ${all.length} demo checks complete</p><div class="button-row"><button id="export-checklist">Export Checklist as Markdown</button><button id="reset-checklist">Reset Checklist</button></div>${checklistSections.map(([section, items]) => `<article class="check-section"><h3>${section}</h3>${items.map((item) => { const key = `${section}:${item}`; return `<label class="check-row"><input type="checkbox" data-checklist="${esc(key)}" ${state.checklist.checked[key] ? "checked" : ""}>${item}</label>`; }).join("")}</article>`).join("")}</section>`;
}

function settings() {
  return `<section class="panel"><h2>POC Demo Controls</h2><div class="button-row"><button id="reset-seed">Reset to seed data</button><button id="clear-intake">Clear locally entered intake records</button><button id="export-json">Export current demo state JSON</button><button id="reset-checklist-settings">Reset POC checklist</button></div><label>Import Demo State JSON<textarea id="import-json"></textarea></label><button id="import-json-button">Import JSON</button><h3>Current Scope</h3><p>Instagram / July 2026</p><h3>Excluded Data Sources</h3><div class="chip-row">${excludedSources.map((source) => `<span class="chip">${source}</span>`).join("")}</div></section>`;
}

function bindScreen() {
  document.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => { screen = button.dataset.nav; render(); }));
  if (screen === "watchlist") bindWatchlist();
  if (screen === "intake") bindIntake();
  if (screen === "signals") bindSignals();
  if (screen === "evidence") bindEvidence();
  if (screen === "cases") bindCases();
  if (screen === "checklist") bindChecklist();
  if (screen === "settings") bindSettings();
}

function bindWatchlist() {
  document.querySelectorAll("[data-add]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.add;
    const input = document.getElementById(`draft-${key}`);
    const value = input.value.trim();
    if (!value) return;
    state.watchlist[key] = [...new Set([...state.watchlist[key], value])];
    audit("Watchlist item added", `${key}: ${value}`);
    save();
    render();
  }));
  document.querySelectorAll("[data-remove]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.remove;
    const value = button.dataset.value;
    state.watchlist[key] = state.watchlist[key].filter((item) => item !== value);
    audit("Watchlist item removed", `${key}: ${value}`);
    save();
    render();
  }));
}

function bindIntake() {
  document.getElementById("submit-intake").addEventListener("click", () => {
    const values = Object.fromEntries(["instagramUrl", "contentType", "publicHandle", "displayName", "postedTimestamp", "capturedTimestamp", "hashtags", "locationTag", "mentionedLocation", "uploadedArtifactName", "caption", "commentExcerpt", "ocrText", "analystNotes", "collectionMethod"].map((id) => [id, document.getElementById(id).value.trim()]));
    const errors = [];
    if (!values.instagramUrl || !(values.instagramUrl.startsWith("https://instagram.com/") || values.instagramUrl.startsWith("https://www.instagram.com/"))) errors.push("Instagram URL must start with https://instagram.com/ or https://www.instagram.com/.");
    if (!values.publicHandle || !values.publicHandle.startsWith("@")) errors.push("Public handle is required and must start with @.");
    if (!values.postedTimestamp) errors.push("Posted timestamp is required.");
    if (!values.capturedTimestamp) errors.push("Captured timestamp is required.");
    if (!values.caption && !values.commentExcerpt && !values.ocrText && !values.analystNotes && !values.uploadedArtifactName) errors.push("Add caption, comment, OCR text, analyst notes, or screenshot/media placeholder.");
    const errorBox = document.getElementById("intake-errors");
    if (errors.length) {
      errorBox.innerHTML = errors.map((error) => `<p class="error">${error}</p>`).join("");
      return;
    }
    if (!isInJuly2026(values.postedTimestamp)) {
      errorBox.innerHTML = `<p class="warning">Outside July 2026. Record will be submitted but marked Out of Scope.</p>`;
    }
    const text = [values.caption, values.commentExcerpt, values.ocrText, values.analystNotes, values.hashtags].join(" ");
    const signalId = makeId("sig");
    const evidenceId = makeId("ev");
    const hashValue = mockHash(`${values.instagramUrl}-${text}-${values.capturedTimestamp}`);
    const signal = {
      id: signalId,
      ...values,
      hashtags: [...new Set([...parseHashtags(text), ...values.hashtags.split(/[,\s]+/).filter((tag) => tag.startsWith("#"))])],
      eventId: "event-001",
      actorId: "",
      evidenceStatus: "New",
      analystStatus: "Needs Review",
      hashValue,
      chainOfCustodyStatus: "Captured",
      isInScopeJuly2026: isInJuly2026(values.postedTimestamp),
      threatLanguageDetected: detect(text, ["fight", "threat", "weapon", "shoot", "smash", "jump", "riot"]),
      crowdMobilizationDetected: detect(text, ["pull up", "bring everybody", "meet", "tonight", "flash", "takeover", "everyone"]),
      propertyDamageDetected: detect(text, ["break", "damage", "loot", "smash", "tag", "burn"]),
      policeEvasionDetected: detect(text, ["avoid cops", "no police", "scatter", "mask up", "back way", "side entrance"])
    };
    const item = {
      id: evidenceId,
      signalId,
      instagramUrl: values.instagramUrl,
      artifactName: values.uploadedArtifactName || "No media placeholder supplied",
      caption: values.caption,
      commentExcerpt: values.commentExcerpt,
      ocrText: values.ocrText,
      hashValue,
      capturedTimestamp: values.capturedTimestamp,
      postedTimestamp: values.postedTimestamp,
      collector: role,
      collectionMethod: values.collectionMethod,
      chainOfCustodyStatus: "Captured",
      exportStatus: "Not Exported",
      associatedEvent: "event-001"
    };
    state.signals.unshift(signal);
    state.evidence.unshift(item);
    state.lastIntakeSignalId = signalId;
    audit("Instagram intake created", `${signal.publicHandle} ${signal.contentType} captured as ${signal.id} and ${item.id}.`);
    toast = "Instagram artifact captured and evidence item created.";
    save();
    render();
  });
}

function bindSignals() {
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    activeFilters = activeFilters.includes(filter) ? activeFilters.filter((item) => item !== filter) : [...activeFilters, filter];
    render();
  }));
  document.getElementById("clear-filters").addEventListener("click", () => { activeFilters = []; render(); });
  document.querySelectorAll("[data-status]").forEach((button) => button.addEventListener("click", () => {
    const signal = state.signals.find((item) => item.id === button.dataset.id);
    if (!signal) return;
    signal.analystStatus = button.dataset.status;
    audit("Signal analyst status updated", `${signal.id} marked ${signal.analystStatus}.`);
    save();
    render();
  }));
}

function bindEvidence() {
  document.querySelectorAll("[data-check]").forEach((button) => button.addEventListener("click", () => {
    const item = state.evidence.find((entry) => entry.id === button.dataset.check);
    if (!item) return;
    item.chainOfCustodyStatus = "Verified";
    item.integrityCheckedAt = nowIso();
    audit("Evidence integrity check", `${item.id} hash verified in MVP demo.`);
    save();
    render();
  }));
}

function bindCases() {
  document.querySelectorAll("[data-export-case]").forEach((button) => button.addEventListener("click", () => {
    const packet = state.casePackets.find((item) => item.id === button.dataset.exportCase);
    if (!packet) return;
    download(`swarm-case-packet-${packet.id}.md`, packetMarkdown(packet.id), "text/markdown");
    packet.exportHistory.unshift(`${nowIso()} exported by ${role}`);
    state.evidence.forEach((item) => { item.exportStatus = "Exported"; });
    audit("Case packet exported", `${packet.id} exported as Markdown.`);
    save();
    render();
  }));
}

function bindChecklist() {
  document.querySelectorAll("[data-checklist]").forEach((input) => input.addEventListener("change", () => {
    state.checklist.checked[input.dataset.checklist] = input.checked;
    save();
  }));
  document.getElementById("reset-checklist").addEventListener("click", () => { state.checklist = { checked: {} }; save(); render(); });
  document.getElementById("export-checklist").addEventListener("click", () => {
    const content = checklistSections.map(([section, items]) => `## ${section}\n${items.map((item) => `- [${state.checklist.checked[`${section}:${item}`] ? "x" : " "}] ${item}`).join("\n")}`).join("\n\n");
    download("swarm-poc-review-checklist.md", `# SWARM POC Review Checklist\n\n${content}`, "text/markdown");
  });
}

function bindSettings() {
  document.getElementById("reset-seed").addEventListener("click", () => { state = structuredClone(seed); toast = "Seed data restored."; save(); render(); });
  document.getElementById("clear-intake").addEventListener("click", () => { state.signals = structuredClone(seed.signals); state.evidence = structuredClone(seed.evidence); audit("Local intake records cleared", "Signals and evidence restored to seed records."); save(); render(); });
  document.getElementById("export-json").addEventListener("click", () => download("swarm-demo-state.json", JSON.stringify(state, null, 2), "application/json"));
  document.getElementById("reset-checklist-settings").addEventListener("click", () => { state.checklist = { checked: {} }; save(); render(); });
  document.getElementById("import-json-button").addEventListener("click", () => {
    try {
      const imported = JSON.parse(document.getElementById("import-json").value);
      if (!imported.watchlist || !Array.isArray(imported.signals) || !Array.isArray(imported.evidence)) throw new Error("Missing SWARM state fields.");
      state = imported;
      audit("Demo state imported", "JSON state import succeeded.");
      toast = "Demo state imported.";
    } catch (error) {
      audit("Demo state import failed", error.message || "Invalid JSON.");
      toast = "Import failed. JSON was not a valid SWARM state file.";
    }
    save();
    render();
  });
}

render();
