const DAYS = 7;
const POLL_OVERVIEW_MS = 15000;
const POLL_SISTERS_MS = 15000;
const POLL_EVENTS_MS = 8000;
const POLL_ASSIGNMENTS_MS = 15000;

const ASSIGNMENT_STATUSES = ['inbox', 'in_progress', 'blocked', 'completed', 'rework', 'cancelled'];

const state = {
  sisters: [],
  selectedAssignmentId: null
};

const els = {
  overviewMetrics: document.getElementById('overviewMetrics'),
  sistersTable: document.getElementById('sistersTable'),
  eventsTable: document.getElementById('eventsTable'),
  sisterFilter: document.getElementById('sisterFilter'),
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
  selectedAssignmentLabel: document.getElementById('selectedAssignmentLabel')
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
  const options = ['<option value="">All</option>']
    .concat(items.map((item) => `<option value="${esc(item.id)}">${esc(item.display_name)} (${esc(item.id)})</option>`))
    .join('');

  const ownerOptions = ['<option value="">Select owner sister</option>']
    .concat(items.map((item) => `<option value="${esc(item.id)}">${esc(item.display_name)} (${esc(item.id)})</option>`))
    .join('');

  const currentFilter = els.assignmentOwnerFilter.value;
  const currentOwner = els.assignmentOwner.value;
  const currentSisterFilter = els.sisterFilter.value;

  els.assignmentOwnerFilter.innerHTML = options;
  els.assignmentOwner.innerHTML = ownerOptions;
  els.sisterFilter.innerHTML = ['<option value="">All</option>']
    .concat(items.map((item) => `<option value="${esc(item.id)}">${esc(item.display_name)} (${esc(item.id)})</option>`))
    .join('');

  if (currentFilter) els.assignmentOwnerFilter.value = currentFilter;
  if (currentOwner) els.assignmentOwner.value = currentOwner;
  if (currentSisterFilter) els.sisterFilter.value = currentSisterFilter;
}

function renderSisters(payload) {
  const items = payload.items || [];
  state.sisters = items;

  els.sistersTable.innerHTML = items.length
    ? items
        .map((item) => {
          const model = item.current_model || item.model_primary || '-';
          const summary = item?.last_event?.summary || '-';
          return `
            <tr>
              <td><strong>${esc(item.display_name)}</strong><br/><small>${esc(item.id)}</small></td>
              <td><span class="status ${esc(item.status)}">${esc(item.status)}</span></td>
              <td>${esc(model)}</td>
              <td><small>${esc(item.active_session || '-')}</small></td>
              <td><small>${esc(shortTs(item.last_event_at))}<br/>${esc(summary)}</small></td>
              <td>${n(item.events_window)}</td>
            </tr>
          `;
        })
        .join('')
    : '<tr><td colspan="6">No sister data found.</td></tr>';

  populateOwnerSelectors(items);
}

function renderEvents(payload) {
  const items = payload.items || [];

  els.eventsTable.innerHTML = items.length
    ? items
        .map(
          (e) => `
            <tr>
              <td><small>${esc(shortTs(e.ts))}</small></td>
              <td>${esc(e.sister_id)}</td>
              <td>${esc(e.event_type)}</td>
              <td>${esc(e.role || '-')}</td>
              <td>${esc(e.tool_name || '-')}</td>
              <td><small>${esc(e.summary || '-')}</small></td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="6">No events in selected window.</td></tr>';
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

async function refreshOverview() {
  renderOverview(await fetchJson(`/api/overview?days=${DAYS}`));
}

async function refreshSisters() {
  renderSisters(await fetchJson(`/api/sisters?days=${DAYS}`));
}

async function refreshEvents() {
  const q = new URLSearchParams({ days: String(DAYS), limit: '100' });
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
  await refreshAssignments();
}

async function updateAssignmentStatus(assignmentId, status) {
  await fetchJson(`/api/assignments/${encodeURIComponent(assignmentId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, actor: 'operator' })
  });

  await refreshAssignments();
}

async function refreshAll() {
  try {
    await Promise.all([refreshOverview(), refreshSisters(), refreshEvents(), refreshAssignments()]);
    els.lastUpdated.textContent = `Last updated: ${shortTs(new Date().toISOString())}`;
  } catch (err) {
    els.lastUpdated.textContent = `Last updated: error (${err.message})`;
  }
}

els.sisterFilter.addEventListener('change', () => {
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
setInterval(() => refreshEvents().catch(() => {}), POLL_EVENTS_MS);
setInterval(() => refreshAssignments().catch(() => {}), POLL_ASSIGNMENTS_MS);
