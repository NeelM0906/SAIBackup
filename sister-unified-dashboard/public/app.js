const DAYS = 7;
const POLL_OVERVIEW_MS = 15000;
const POLL_SISTERS_MS = 15000;
const POLL_WORKBOARD_MS = 15000;
const POLL_EVENTS_MS = 8000;
const POLL_ASSIGNMENTS_MS = 15000;
const LOGS_DEFAULT_LIMIT = 10;
const LOGS_LOAD_MORE_STEP = 50;

const ASSIGNMENT_STATUSES = ['inbox', 'in_progress', 'blocked', 'completed', 'rework', 'cancelled'];

const state = {
  sisters: [],
  selectedAssignmentId: null,
  logsLimit: LOGS_DEFAULT_LIMIT,
  profileCache: new Map()
};

const els = {
  overviewMetrics: document.getElementById('overviewMetrics'),
  sisterGrid: document.getElementById('sisterGrid'),
  workboardGrid: document.getElementById('workboardGrid'),
  eventsTable: document.getElementById('eventsTable'),
  sisterFilter: document.getElementById('sisterFilter'),
  logsLoadMoreBtn: document.getElementById('logsLoadMoreBtn'),
  logsCountLabel: document.getElementById('logsCountLabel'),
  refreshBtn: document.getElementById('refreshBtn'),
  lastUpdated: document.getElementById('lastUpdated'),
  assignmentForm: document.getElementById('assignmentForm'),
  assignmentTitle: document.getElementById('assignmentTitle'),
  assignmentOwner: document.getElementById('assignmentOwner'),
  assignmentPriority: document.getElementById('assignmentPriority'),
  assignmentTaskKey: document.getElementById('assignmentTaskKey'),
  assignmentDueAt: document.getElementById('assignmentDueAt'),
  assignmentDescription: document.getElementById('assignmentDescription'),
  assignmentFormError: document.getElementById('assignmentFormError'),
  assignmentStatusFilter: document.getElementById('assignmentStatusFilter'),
  assignmentOwnerFilter: document.getElementById('assignmentOwnerFilter'),
  assignmentsTable: document.getElementById('assignmentsTable'),
  assignmentEventsTable: document.getElementById('assignmentEventsTable'),
  selectedAssignmentLabel: document.getElementById('selectedAssignmentLabel'),
  modal: document.getElementById('sisterModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  modalSisterName: document.getElementById('modalSisterName'),
  modalSisterMeta: document.getElementById('modalSisterMeta'),
  modalPersonality: document.getElementById('modalPersonality'),
  modalPersonalitySource: document.getElementById('modalPersonalitySource'),
  modalTools: document.getElementById('modalTools'),
  modalStatus: document.getElementById('modalStatus'),
  modalRelevantInfo: document.getElementById('modalRelevantInfo')
};

function n(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function shortTs(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function esc(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function assignmentStatusClass(status) {
  return `status-${String(status || 'inbox')}`;
}

function safeJson(value, fallback) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return fallback;
  }
}

async function fetchJson(path, options) {
  const res = await fetch(path, options);
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const msg = payload?.message || `HTTP ${res.status}: ${path}`;
    throw new Error(msg);
  }

  return payload;
}

function renderOverview(data) {
  const cards = [
    ['Total Sisters', n(data.total_sisters)],
    ['Active', n(data.active_sisters)],
    ['Idle', n(data.idle_sisters)],
    ['Offline', n(data.offline_sisters)],
    [`Events (${DAYS}d)`, n(data.events)],
    [`Sessions (${DAYS}d)`, n(data.sessions)],
    ['Total Beings', n(data?.beings?.total_beings || 0)],
    ['Domains Online', n(data?.beings?.domains_online || 0)],
    ['Last Ingest', data?.ingest?.ingested_at ? shortTs(data.ingest.ingested_at) : '-']
  ];

  els.overviewMetrics.innerHTML = cards
    .map(
      ([label, value]) => `
      <article class="metric">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
      </article>
    `
    )
    .join('');
}

function populateOwnerSelectors(items) {
  const allOpt = '<option value="">All</option>';
  const ownerSelectOpt = '<option value="">Select owner sister</option>';
  const mapped = items.map(
    (item) => `<option value="${esc(item.id)}">${esc(item.display_name)} (${esc(item.id)})</option>`
  );

  const currentOwnerFilter = els.assignmentOwnerFilter.value;
  const currentOwner = els.assignmentOwner.value;
  const currentLogFilter = els.sisterFilter.value;

  els.assignmentOwnerFilter.innerHTML = [allOpt].concat(mapped).join('');
  els.assignmentOwner.innerHTML = [ownerSelectOpt].concat(mapped).join('');
  els.sisterFilter.innerHTML = [allOpt].concat(mapped).join('');

  if (currentOwnerFilter) els.assignmentOwnerFilter.value = currentOwnerFilter;
  if (currentOwner) els.assignmentOwner.value = currentOwner;
  if (currentLogFilter) els.sisterFilter.value = currentLogFilter;
}

function renderSisterGrid(items) {
  els.sisterGrid.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="sister-card" data-sister-id="${esc(item.id)}">
              <h3>${esc(item.display_name)}</h3>
              <span class="status ${esc(item.status)}">${esc(item.status)}</span>
              <div class="meta">ID: ${esc(item.id)}</div>
              <div class="meta">Model: ${esc(item.current_model || item.model_primary || '-')}</div>
              <div class="meta">Last Event: ${esc(shortTs(item.last_event_at))}</div>
            </article>
          `
        )
        .join('')
    : '<article class="sister-card">No sister data found.</article>';
}

function renderSisters(payload) {
  const items = payload.items || [];
  state.sisters = items;

  renderSisterGrid(items);
  populateOwnerSelectors(items);
}

function renderWorkboard(payload) {
  const items = payload.items || [];

  els.workboardGrid.innerHTML = items.length
    ? items
        .map((sister) => {
          const workItems = sister.items || [];
          const list = workItems.length
            ? workItems
                .map((item) => {
                  const hasProgress = item.progress_percent !== null && item.progress_percent !== undefined;
                  return `
                    <article class="work-item">
                      <div class="title">${esc(item.title || 'Untitled')}</div>
                      <div class="sub">
                        <span class="status ${assignmentStatusClass(item.status)}">${esc(item.status || '-')}</span>
                        ${item.priority ? ` • ${esc(item.priority)}` : ''}
                      </div>
                      <div class="sub">${esc(item.summary || '-')}</div>
                      ${hasProgress ? `<div class="progress"><span style="width:${Math.max(0, Math.min(100, Number(item.progress_percent) || 0))}%"></span></div>` : ''}
                      <div class="note">
                        ${hasProgress ? `${Math.round(Number(item.progress_percent) || 0)}%` : 'No progress bar (inactive)'}
                        ${item.progress_note ? ` • ${esc(item.progress_note)}` : ''}
                      </div>
                    </article>
                  `;
                })
                .join('')
            : '<article class="work-item"><div class="sub">No active work items.</div></article>';

          return `
            <article class="workboard-card">
              <h3>${esc(sister.sister_name)} <span class="status ${esc(sister.sister_status)}">${esc(sister.sister_status)}</span></h3>
              <div class="work-items">${list}</div>
            </article>
          `;
        })
        .join('')
    : '<article class="workboard-card">No workboard data found.</article>';
}

function renderEvents(payload) {
  const items = payload.items || [];

  els.eventsTable.innerHTML = items.length
    ? items
        .map(
          (event) => `
            <tr>
              <td><small>${esc(shortTs(event.ts))}</small></td>
              <td>${esc(event.sister_id)}</td>
              <td>${esc(event.event_type)}</td>
              <td>${esc(event.role || '-')}</td>
              <td>${esc(event.tool_name || '-')}</td>
              <td><small>${esc(event.summary || '-')}</small></td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="6">No events in selected window.</td></tr>';

  els.logsCountLabel.textContent = `Showing ${items.length} logs`;
  els.logsLoadMoreBtn.disabled = !payload.has_more;
}

function renderAssignments(payload) {
  const items = payload.items || [];

  els.assignmentsTable.innerHTML = items.length
    ? items
        .map((item) => {
          const statusOptions = ASSIGNMENT_STATUSES.map(
            (status) => `<option value="${status}" ${status === item.status ? 'selected' : ''}>${status}</option>`
          ).join('');

          return `
            <tr data-assignment-id="${esc(item.id)}">
              <td><strong>${esc(item.title)}</strong><br/><small>${esc(item.description || '-')}</small></td>
              <td>${esc(item.owner_sister_id)}</td>
              <td><span class="status ${assignmentStatusClass(item.status)}">${esc(item.status)}</span></td>
              <td>${esc(item.priority)}</td>
              <td>${esc(item.task_key || '-')}</td>
              <td><small>${esc(shortTs(item.updated_at))}</small></td>
              <td>
                <div class="action-row">
                  <select data-role="status-select">${statusOptions}</select>
                  <button data-action="set-status" type="button">Update</button>
                </div>
              </td>
              <td>
                <button class="link-btn" data-action="view-events" type="button">View</button>
              </td>
            </tr>
          `;
        })
        .join('')
    : '<tr><td colspan="8">No assignments in selected filter.</td></tr>';
}

function renderAssignmentEvents(payload) {
  const items = payload.items || [];

  els.assignmentEventsTable.innerHTML = items.length
    ? items
        .map(
          (event) => `
            <tr>
              <td><small>${esc(shortTs(event.created_at))}</small></td>
              <td>${esc(event.event_type)}</td>
              <td>${esc(event.actor || '-')}</td>
              <td>${esc(event.from_status || '-')} -> ${esc(event.to_status || '-')}</td>
              <td><small>${esc(event.note || '-')}</small></td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="5">No assignment events found.</td></tr>';
}

function openModal() {
  els.modal.classList.add('open');
  els.modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  els.modal.classList.remove('open');
  els.modal.setAttribute('aria-hidden', 'true');
}

async function openSisterModal(sisterId) {
  let profile = state.profileCache.get(sisterId);
  if (!profile) {
    const payload = await fetchJson(`/api/sisters/${encodeURIComponent(sisterId)}/profile?days=${DAYS}`);
    profile = payload.profile;
    state.profileCache.set(sisterId, profile);
  }

  els.modalSisterName.textContent = profile.display_name || profile.id;
  els.modalSisterMeta.textContent = `${profile.id} • ${profile.current_status || '-'}`;
  els.modalPersonality.textContent = profile.personality || '-';
  els.modalPersonalitySource.textContent = profile.personality_source || 'No source file found';
  els.modalTools.textContent = safeJson(profile.tools || [], '[]');
  els.modalStatus.innerHTML = `<span class="status ${esc(profile.current_status || 'offline')}">${esc(profile.current_status || 'offline')}</span>`;
  els.modalRelevantInfo.textContent = safeJson(profile.relevant_information || {}, '{}');

  openModal();
}

async function refreshOverview() {
  renderOverview(await fetchJson(`/api/overview?days=${DAYS}`));
}

async function refreshSisters() {
  const payload = await fetchJson(`/api/sisters?days=${DAYS}`);
  renderSisters(payload);
}

async function refreshWorkboard() {
  renderWorkboard(await fetchJson(`/api/workboard?days=${DAYS}`));
}

async function refreshEvents() {
  const q = new URLSearchParams({ days: String(DAYS), limit: String(state.logsLimit) });
  if (els.sisterFilter.value) q.set('sister_id', els.sisterFilter.value);
  renderEvents(await fetchJson(`/api/events?${q.toString()}`));
}

async function refreshAssignments() {
  const q = new URLSearchParams({ days: String(DAYS), limit: '120' });
  if (els.assignmentStatusFilter.value) q.set('status', els.assignmentStatusFilter.value);
  if (els.assignmentOwnerFilter.value) q.set('owner_sister_id', els.assignmentOwnerFilter.value);

  const payload = await fetchJson(`/api/assignments?${q.toString()}`);
  renderAssignments(payload);

  if (state.selectedAssignmentId) {
    await refreshAssignmentEvents(state.selectedAssignmentId);
  }
}

async function refreshAssignmentEvents(assignmentId) {
  if (!assignmentId) return;
  state.selectedAssignmentId = assignmentId;
  els.selectedAssignmentLabel.textContent = `Assignment: ${assignmentId}`;
  const payload = await fetchJson(`/api/assignments/${encodeURIComponent(assignmentId)}/events?limit=120`);
  renderAssignmentEvents(payload);
}

async function createAssignmentFromForm() {
  els.assignmentFormError.textContent = '';

  const payload = {
    title: els.assignmentTitle.value,
    owner_sister_id: els.assignmentOwner.value,
    priority: els.assignmentPriority.value,
    task_key: els.assignmentTaskKey.value,
    due_at: els.assignmentDueAt.value,
    description: els.assignmentDescription.value,
    actor: 'operator'
  };

  await fetchJson('/api/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  els.assignmentForm.reset();
  els.assignmentPriority.value = 'normal';
  await Promise.all([refreshAssignments(), refreshWorkboard()]);
}

async function updateAssignmentStatus(assignmentId, status) {
  await fetchJson(`/api/assignments/${encodeURIComponent(assignmentId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, actor: 'operator' })
  });

  await Promise.all([refreshAssignments(), refreshWorkboard()]);
}

async function refreshAll() {
  try {
    await Promise.all([
      refreshOverview(),
      refreshSisters(),
      refreshWorkboard(),
      refreshEvents(),
      refreshAssignments()
    ]);
    els.lastUpdated.textContent = `Last updated: ${shortTs(new Date().toISOString())}`;
  } catch (err) {
    els.lastUpdated.textContent = `Last updated: error (${err.message})`;
  }
}

els.sisterFilter.addEventListener('change', () => {
  state.logsLimit = LOGS_DEFAULT_LIMIT;
  refreshEvents().catch(() => {});
});

els.logsLoadMoreBtn.addEventListener('click', () => {
  state.logsLimit += LOGS_LOAD_MORE_STEP;
  refreshEvents().catch(() => {});
});

els.assignmentStatusFilter.addEventListener('change', () => {
  refreshAssignments().catch(() => {});
});

els.assignmentOwnerFilter.addEventListener('change', () => {
  refreshAssignments().catch(() => {});
});

els.assignmentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await createAssignmentFromForm();
  } catch (error) {
    els.assignmentFormError.textContent = error.message;
  }
});

els.assignmentsTable.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const row = button.closest('tr[data-assignment-id]');
  if (!row) return;

  const assignmentId = row.getAttribute('data-assignment-id');
  const action = button.getAttribute('data-action');

  if (action === 'view-events') {
    try {
      await refreshAssignmentEvents(assignmentId);
    } catch (error) {
      els.selectedAssignmentLabel.textContent = `Error loading events: ${error.message}`;
    }
    return;
  }

  if (action === 'set-status') {
    const select = row.querySelector('select[data-role="status-select"]');
    if (!select) return;
    try {
      await updateAssignmentStatus(assignmentId, select.value);
    } catch (error) {
      els.assignmentFormError.textContent = error.message;
    }
  }
});

els.sisterGrid.addEventListener('click', (event) => {
  const card = event.target.closest('[data-sister-id]');
  if (!card) return;
  openSisterModal(card.getAttribute('data-sister-id')).catch((error) => {
    els.assignmentFormError.textContent = error.message;
  });
});

els.closeModalBtn.addEventListener('click', closeModal);
els.modal.addEventListener('click', (event) => {
  if (event.target === els.modal) closeModal();
});

els.refreshBtn.addEventListener('click', async () => {
  els.refreshBtn.disabled = true;
  try {
    await fetchJson('/api/refresh', { method: 'POST' });
    await refreshAll();
  } finally {
    els.refreshBtn.disabled = false;
  }
});

refreshAll().catch(() => {});
setInterval(() => refreshOverview().catch(() => {}), POLL_OVERVIEW_MS);
setInterval(() => refreshSisters().catch(() => {}), POLL_SISTERS_MS);
setInterval(() => refreshWorkboard().catch(() => {}), POLL_WORKBOARD_MS);
setInterval(() => refreshEvents().catch(() => {}), POLL_EVENTS_MS);
setInterval(() => refreshAssignments().catch(() => {}), POLL_ASSIGNMENTS_MS);
