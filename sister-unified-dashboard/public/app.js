const DAYS = 7;
const POLL_OVERVIEW_MS = 15000;
const POLL_SISTERS_MS = 15000;
const POLL_WORKBOARD_MS = 8000;
const POLL_SUBAGENTS_MS = 12000;
const POLL_EVENTS_MS = 8000;
const POLL_ASSIGNMENTS_MS = 8000;
const POLL_CHAT_MS = 8000;
const LOGS_DEFAULT_LIMIT = 10;
const LOGS_LOAD_MORE_STEP = 50;
const SUBAGENTS_LIMIT = 200;
const ASSIGNMENTS_DEFAULT_LIMIT = 300;
const ASSIGNMENTS_LOAD_MORE_STEP = 200;

const ASSIGNMENT_STATUSES = ['inbox', 'in_progress', 'blocked', 'completed', 'rework', 'cancelled'];

const state = {
  sisters: [],
  selectedAssignmentId: null,
  logsLimit: LOGS_DEFAULT_LIMIT,
  assignmentsLimit: ASSIGNMENTS_DEFAULT_LIMIT,
  profileCache: new Map(),
  workboardDetailCache: new Map(),
  subagentRunCache: new Map(),
  overview: null,
  chat: {
    sisters: [],
    groups: [],
    sessions: [],
    settings: null,
    selectedSessionId: null,
    selectedContextType: 'all_sisters',
    selectedContextGroupId: null
  }
};

const els = {
  overviewMetrics: document.getElementById('overviewMetrics'),
  sisterGrid: document.getElementById('sisterGrid'),
  openWorkboardBtn: document.getElementById('openWorkboardBtn'),
  workboardWorkspace: document.getElementById('workboardWorkspace'),
  closeWorkboardBtn: document.getElementById('closeWorkboardBtn'),
  workboardRefreshBtn: document.getElementById('workboardRefreshBtn'),
  workboardGrid: document.getElementById('workboardGrid'),
  subagentsTable: document.getElementById('subagentsTable'),
  subagentStatusFilter: document.getElementById('subagentStatusFilter'),
  subagentSisterFilter: document.getElementById('subagentSisterFilter'),
  subagentRequesterFilter: document.getElementById('subagentRequesterFilter'),
  subagentCountLabel: document.getElementById('subagentCountLabel'),
  openMissionChatBtn: document.getElementById('openMissionChatBtn'),
  chatWorkspace: document.getElementById('chatWorkspace'),
  closeMissionChatBtn: document.getElementById('closeMissionChatBtn'),
  chatManageGroupsBtn: document.getElementById('chatManageGroupsBtn'),
  chatNewGroupBtn: document.getElementById('chatNewGroupBtn'),
  chatGroupDrawer: document.getElementById('chatGroupDrawer'),
  closeChatGroupDrawerBtn: document.getElementById('closeChatGroupDrawerBtn'),
  chatContextRail: document.getElementById('chatContextRail'),
  chatScopeTitle: document.getElementById('chatScopeTitle'),
  chatScopeMeta: document.getElementById('chatScopeMeta'),
  chatSessionList: document.getElementById('chatSessionList'),
  chatNewSessionBtn: document.getElementById('chatNewSessionBtn'),
  chatScopeMembers: document.getElementById('chatScopeMembers'),
  chatSettingsLabel: document.getElementById('chatSettingsLabel'),
  chatDispatchMode: document.getElementById('chatDispatchMode'),
  chatSessionMeta: document.getElementById('chatSessionMeta'),
  chatMentionChips: document.getElementById('chatMentionChips'),
  chatMessages: document.getElementById('chatMessages'),
  chatComposer: document.getElementById('chatComposer'),
  chatInput: document.getElementById('chatInput'),
  chatSendBtn: document.getElementById('chatSendBtn'),
  chatFormError: document.getElementById('chatFormError'),
  chatGroupList: document.getElementById('chatGroupList'),
  chatGroupForm: document.getElementById('chatGroupForm'),
  chatGroupId: document.getElementById('chatGroupId'),
  chatGroupName: document.getElementById('chatGroupName'),
  chatGroupDescription: document.getElementById('chatGroupDescription'),
  chatGroupDispatchMode: document.getElementById('chatGroupDispatchMode'),
  chatGroupMembers: document.getElementById('chatGroupMembers'),
  chatGroupFormError: document.getElementById('chatGroupFormError'),
  chatGroupResetBtn: document.getElementById('chatGroupResetBtn'),
  chatDispatchTable: document.getElementById('chatDispatchTable'),
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
  assignmentsCoverage: document.getElementById('assignmentsCoverage'),
  assignmentsLoadMoreBtn: document.getElementById('assignmentsLoadMoreBtn'),
  assignmentsTable: document.getElementById('assignmentsTable'),
  assignmentEventsTable: document.getElementById('assignmentEventsTable'),
  selectedAssignmentLabel: document.getElementById('selectedAssignmentLabel'),
  modal: document.getElementById('sisterModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  modalSisterName: document.getElementById('modalSisterName'),
  modalSisterMeta: document.getElementById('modalSisterMeta'),
  modalPersonality: document.getElementById('modalPersonality'),
  modalPersonalitySource: document.getElementById('modalPersonalitySource'),
  modalSkills: document.getElementById('modalSkills'),
  modalSkillsMeta: document.getElementById('modalSkillsMeta'),
  modalSkillsWarnings: document.getElementById('modalSkillsWarnings'),
  modalTools: document.getElementById('modalTools'),
  modalStatus: document.getElementById('modalStatus'),
  modalRelevantInfo: document.getElementById('modalRelevantInfo'),
  workboardModal: document.getElementById('workboardModal'),
  closeWorkModalBtn: document.getElementById('closeWorkModalBtn'),
  modalWorkSisterName: document.getElementById('modalWorkSisterName'),
  modalWorkSisterMeta: document.getElementById('modalWorkSisterMeta'),
  modalActiveWorkItems: document.getElementById('modalActiveWorkItems'),
  modalPreviousWorkItems: document.getElementById('modalPreviousWorkItems'),
  domainsModal: document.getElementById('domainsModal'),
  closeDomainsModalBtn: document.getElementById('closeDomainsModalBtn'),
  domainsModalCount: document.getElementById('domainsModalCount'),
  domainsList: document.getElementById('domainsList'),
  subagentModal: document.getElementById('subagentModal'),
  closeSubagentModalBtn: document.getElementById('closeSubagentModalBtn'),
  modalSubagentName: document.getElementById('modalSubagentName'),
  modalSubagentMeta: document.getElementById('modalSubagentMeta'),
  modalSubagentDetails: document.getElementById('modalSubagentDetails'),
  modalSubagentActivity: document.getElementById('modalSubagentActivity')
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

function subagentStatusClass(status) {
  return `status-subagent-${String(status || 'unknown')}`;
}

function dispatchStatusClass(status) {
  return `status-chat-${String(status || 'monitor_only')}`;
}

function safeJson(value, fallback) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return fallback;
  }
}

function formatRuntime(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return '-';
  const s = Math.floor(total % 60);
  const m = Math.floor((total / 60) % 60);
  const h = Math.floor(total / 3600);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
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
  state.overview = data;

  const cards = [
    { label: 'Total Sisters', value: n(data.total_sisters) },
    { label: 'Active', value: n(data.active_sisters) },
    { label: 'Idle', value: n(data.idle_sisters) },
    { label: 'Offline', value: n(data.offline_sisters) },
    { label: `Events (${DAYS}d)`, value: n(data.events) },
    { label: `Sessions (${DAYS}d)`, value: n(data.sessions) },
    { label: 'Total Beings', value: n(data?.beings?.total_beings || 0) },
    {
      label: 'Domains Online',
      value: n((data?.beings?.online_dashboards_count ?? data?.beings?.domains_online) || 0),
      key: 'domains_online',
      clickable: true
    },
    { label: 'Last Ingest', value: data?.ingest?.ingested_at ? shortTs(data.ingest.ingested_at) : '-' }
  ];

  els.overviewMetrics.innerHTML = cards
    .map(
      (card) => `
      <article class="metric ${card.clickable ? 'clickable' : ''}" ${card.key ? `data-metric-key="${esc(card.key)}"` : ''}>
        <div class="label">${esc(card.label)}${card.clickable ? ' (click to view)' : ''}</div>
        <div class="value">${esc(card.value)}</div>
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
            <article class="workboard-card" data-workboard-sister-id="${esc(sister.sister_id)}">
              <h3>${esc(sister.sister_name)} <span class="status ${esc(sister.sister_status)}">${esc(sister.sister_status)}</span></h3>
              <div class="work-items">${list}</div>
            </article>
          `;
        })
        .join('')
    : '<article class="workboard-card">No workboard data found.</article>';
}

function fillFilterSelect(selectEl, values) {
  const current = selectEl.value;
  const options = ['<option value="">All</option>']
    .concat(
      (values || []).map((value) => `<option value="${esc(value)}">${esc(value)}</option>`)
    )
    .join('');
  selectEl.innerHTML = options;
  if (current) {
    selectEl.value = current;
  }
}

function renderSubagents(payload) {
  const items = payload.items || [];
  const filters = payload.filters || {};
  fillFilterSelect(els.subagentStatusFilter, filters.statuses || []);
  fillFilterSelect(els.subagentSisterFilter, filters.sisters || []);
  fillFilterSelect(els.subagentRequesterFilter, filters.requesters || []);

  els.subagentsTable.innerHTML = items.length
    ? items
        .map((item) => {
          const requester = item.requester_display_key || item.requester_session_key || item.requester_agent_id || '-';
          const task = item.task || item.label || '-';
          const lastActivity = item.activity?.last_event_at
            ? `${shortTs(item.activity.last_event_at)} • ${item.activity.last_event_type || '-'}`
            : '-';

          return `
            <tr>
              <td><small>${esc(shortTs(item.created_at))}</small></td>
              <td><small>${esc(item.run_id || '-')}</small></td>
              <td>${esc(item.sister_id || '-')}</td>
              <td><small>${esc(requester)}</small></td>
              <td><span class="status ${subagentStatusClass(item.status)}">${esc(item.status || 'unknown')}</span></td>
              <td><small>${esc(formatRuntime(item.runtime_seconds))}</small></td>
              <td><small>${esc(lastActivity)}</small></td>
              <td><small>${esc(task)}</small></td>
              <td><button class="link-btn" data-action="view-subagent" data-run-id="${esc(item.run_id)}" type="button">Inspect</button></td>
            </tr>
          `;
        })
        .join('')
    : '<tr><td colspan="9">No subagent runs in selected filter.</td></tr>';

  const suffix = payload.has_more ? ' (more available)' : '';
  els.subagentCountLabel.textContent = `Showing ${n(items.length)}${suffix}`;
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
  const totalCount = Number(payload.total_count ?? items.length);
  const hasMore = Boolean(payload.has_more ?? (totalCount > items.length));

  if (els.assignmentsCoverage) {
    const suffix = hasMore ? ` (showing first ${n(payload.limit || items.length)})` : '';
    els.assignmentsCoverage.textContent = `Showing ${n(items.length)} of ${n(totalCount)} tasks${suffix}`;
  }

  if (els.assignmentsLoadMoreBtn) {
    els.assignmentsLoadMoreBtn.disabled = !hasMore;
  }

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

function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('open');
  modalEl.setAttribute('aria-hidden', 'false');
}

function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.remove('open');
  modalEl.setAttribute('aria-hidden', 'true');
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
  els.modalSkills.textContent = safeJson(profile.skills?.effective || [], '[]');
  els.modalSkillsMeta.textContent = `Effective: ${n(profile.skills?.counts?.effective || 0)} • Global: ${n(
    profile.skills?.counts?.global || 0
  )} • Workspace Local: ${n(profile.skills?.counts?.workspace_local || 0)} • Configured: ${n(
    profile.skills?.counts?.configured_entries || 0
  )}`;
  const warnings = profile.skills?.discovery_warnings || [];
  els.modalSkillsWarnings.textContent = warnings.length ? warnings.join('\n') : 'No non-standard skill paths detected.';
  els.modalTools.textContent = safeJson(profile.tools || [], '[]');
  els.modalStatus.innerHTML = `<span class="status ${esc(profile.current_status || 'offline')}">${esc(profile.current_status || 'offline')}</span>`;
  els.modalRelevantInfo.textContent = safeJson(profile.relevant_information || {}, '{}');

  openModal(els.modal);
}

function renderWorkDetailItems(items) {
  if (!Array.isArray(items) || !items.length) {
    return '<article class="work-item"><div class="sub">No tasks found.</div></article>';
  }

  return items
    .map((item) => {
      const progressNum = Number(item.progress_percent);
      const hasProgress = item.progress_percent !== null && item.progress_percent !== undefined && !Number.isNaN(progressNum);
      const progressPct = Math.max(0, Math.min(100, hasProgress ? progressNum : 0));
      const timingMeta = item.completed_at
        ? `Completed: ${esc(shortTs(item.completed_at))}`
        : `Updated: ${esc(shortTs(item.updated_at))}`;

      return `
        <article class="work-item">
          <div class="title">${esc(item.title || 'Untitled')}</div>
          <div class="sub">
            <span class="status ${assignmentStatusClass(item.status)}">${esc(item.status || '-')}</span>
            ${item.priority ? ` • ${esc(item.priority)}` : ''}
          </div>
          <div class="sub">${esc(item.summary || '-')}</div>
          <div class="meta">${timingMeta}${item.assignment_id ? ` • ${esc(item.assignment_id)}` : ''}</div>
          ${hasProgress ? `<div class="progress"><span style="width:${progressPct}%"></span></div>` : ''}
          <div class="note">
            ${hasProgress ? `${Math.round(progressPct)}%` : 'No progress bar (inactive)'}
            ${item.progress_note ? ` • ${esc(item.progress_note)}` : ''}
          </div>
        </article>
      `;
    })
    .join('');
}

async function openWorkboardModal(sisterId) {
  let detail = state.workboardDetailCache.get(sisterId);
  if (!detail) {
    const payload = await fetchJson(`/api/workboard/${encodeURIComponent(sisterId)}?days=${DAYS}&limit=200`);
    detail = payload.detail;
    state.workboardDetailCache.set(sisterId, detail);
  }

  els.modalWorkSisterName.textContent = `${detail.sister.display_name || detail.sister.id} Workboard`;
  els.modalWorkSisterMeta.textContent = `${detail.sister.id} • ${detail.sister.status || '-'} • Active: ${n(detail.counts?.active || 0)} • Previous: ${n(detail.counts?.previous || 0)}`;
  els.modalActiveWorkItems.innerHTML = renderWorkDetailItems(detail.active_items || []);
  els.modalPreviousWorkItems.innerHTML = renderWorkDetailItems(detail.previous_items || []);

  openModal(els.workboardModal);
}

function renderSubagentActivityRows(items) {
  return items.length
    ? items
        .map(
          (item) => `
            <tr>
              <td><small>${esc(shortTs(item.ts))}</small></td>
              <td>${esc(item.source || '-')}</td>
              <td>${esc(item.event_type || '-')}</td>
              <td>${esc(item.tool_name || '-')}</td>
              <td><small>${esc(item.summary || '-')}</small></td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="5">No activity found.</td></tr>';
}

async function openSubagentModal(runId) {
  let run = state.subagentRunCache.get(runId);
  if (!run) {
    const runPayload = await fetchJson(`/api/subagents/${encodeURIComponent(runId)}?days=${DAYS}`);
    run = runPayload.run;
    state.subagentRunCache.set(runId, run);
  }

  const activityPayload = await fetchJson(`/api/subagents/${encodeURIComponent(runId)}/activity?days=${DAYS}&limit=200`);
  const activityItems = activityPayload.items || [];

  els.modalSubagentName.textContent = `Subagent Run ${run.run_id || runId}`;
  els.modalSubagentMeta.textContent = `${run.sister_id || '-'} • ${run.status || 'unknown'} • ${formatRuntime(
    run.runtime_seconds
  )}`;
  els.modalSubagentDetails.textContent = safeJson(
    {
      run_id: run.run_id,
      status: run.status,
      sister_id: run.sister_id,
      requester_session_key: run.requester_session_key,
      requester_display_key: run.requester_display_key,
      requester_agent_id: run.requester_agent_id,
      child_session_key: run.child_session_key,
      child_session_id: run.child_session_id,
      model: run.model,
      task: run.task,
      label: run.label,
      outcome: run.outcome,
      created_at: run.created_at,
      started_at: run.started_at,
      ended_at: run.ended_at,
      cleanup_completed_at: run.cleanup_completed_at,
      archive_at: run.archive_at,
      run_timeout_seconds: run.run_timeout_seconds,
      runtime_seconds: run.runtime_seconds
    },
    '{}'
  );
  els.modalSubagentActivity.innerHTML = renderSubagentActivityRows(activityItems);
  openModal(els.subagentModal);
}

function renderChatSettings() {
  const settings = state.chat.settings || {};
  const retention = settings.retention_days || 7;
  const monitorMode = settings.monitor_mode || 'monitor_only';
  const compactionMode = settings.compaction?.mode || 'safeguard';
  const threshold = settings.compaction?.threshold || '-';
  els.chatSettingsLabel.textContent = `${monitorMode.replaceAll('_', '-')} • Retention: ${retention}d • Compaction: ${compactionMode} (${threshold} tokens)`;
}

function renderChatGroupMemberOptions() {
  const options = (state.chat.sisters || [])
    .map((item) => `<option value="${esc(item.id)}">${esc(item.display_name || item.id)} (${esc(item.id)})</option>`)
    .join('');
  els.chatGroupMembers.innerHTML = options || '';
}

function renderChatMentionChips() {
  const chips = (state.chat.sisters || [])
    .map(
      (item) =>
        `<button class="chip-btn" type="button" data-chat-mention="${esc(item.id)}">@${esc(item.id)}</button>`
    )
    .join('');
  els.chatMentionChips.innerHTML = chips || '<small>No sisters available.</small>';
}

function chatContextMatchesSession(session, contextType, contextGroupId) {
  if (!session) return false;
  if (contextType === 'group') {
    return session.scope_type === 'group' && session.group_id === contextGroupId;
  }
  return session.scope_type === 'all_sisters';
}

function chatSessionsForCurrentContext() {
  const contextType = state.chat.selectedContextType || 'all_sisters';
  const contextGroupId = state.chat.selectedContextGroupId || null;
  return (state.chat.sessions || [])
    .filter((session) => chatContextMatchesSession(session, contextType, contextGroupId))
    .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')));
}

function currentContextLabel() {
  if (state.chat.selectedContextType === 'group') {
    const group = (state.chat.groups || []).find((item) => item.id === state.chat.selectedContextGroupId);
    return group?.name || 'Group';
  }
  return 'All Sisters';
}

function ensureChatContextAndSessionSelection() {
  if (state.chat.selectedContextType === 'group') {
    const groupExists = (state.chat.groups || []).some((item) => item.id === state.chat.selectedContextGroupId);
    if (!groupExists) {
      state.chat.selectedContextType = 'all_sisters';
      state.chat.selectedContextGroupId = null;
    }
  }

  const visibleSessions = chatSessionsForCurrentContext();
  if (!visibleSessions.some((session) => session.id === state.chat.selectedSessionId)) {
    state.chat.selectedSessionId = visibleSessions[0]?.id || null;
  }
}

function renderChatContextRail() {
  const groups = state.chat.groups || [];
  const sessions = state.chat.sessions || [];

  const allCount = sessions.filter((session) => session.scope_type === 'all_sisters').length;
  const allActive = state.chat.selectedContextType === 'all_sisters';
  const allCard = `
    <button
      type="button"
      class="context-item ${allActive ? 'active' : ''}"
      data-chat-context-type="all_sisters"
    >
      <span>All Sisters</span>
      <small>${n(allCount)}</small>
    </button>
  `;

  const groupCards = groups
    .map((group) => {
      const sessionCount = sessions.filter(
        (session) => session.scope_type === 'group' && session.group_id === group.id
      ).length;
      const active = state.chat.selectedContextType === 'group' && state.chat.selectedContextGroupId === group.id;
      return `
        <button
          type="button"
          class="context-item ${active ? 'active' : ''}"
          data-chat-context-type="group"
          data-chat-group-id="${esc(group.id)}"
        >
          <span>${esc(group.name)}</span>
          <small>${n(sessionCount)}</small>
        </button>
      `;
    })
    .join('');

  els.chatContextRail.innerHTML = allCard + (groupCards || '');
}

function renderChatGroupList() {
  const groups = state.chat.groups || [];
  const sessions = state.chat.sessions || [];

  els.chatGroupList.innerHTML = groups.length
    ? groups
        .map((group) => {
          const groupSessions = sessions.filter((session) => session.scope_type === 'group' && session.group_id === group.id);
          const members = group.members || [];
          const memberText = members.length
            ? members.map((member) => `${member.display_name} (${member.sister_id})`).join(', ')
            : 'No members';

          return `
            <article class="work-item" data-chat-group-id="${esc(group.id)}">
              <div class="title">${esc(group.name)}</div>
              <div class="sub">${esc(group.description || '-')}</div>
              <div class="sub">Members: ${esc(memberText)}</div>
              <div class="note">Sessions: ${n(groupSessions.length)} • Default: ${esc(group.dispatch_mode_default || 'parallel')}</div>
              <div class="action-row">
                <button class="link-btn" type="button" data-chat-action="open-group-session" data-chat-group-id="${esc(group.id)}">Open Session</button>
                <button class="link-btn" type="button" data-chat-action="edit-group" data-chat-group-id="${esc(group.id)}">Edit</button>
              </div>
            </article>
          `;
        })
        .join('')
    : '<article class="work-item"><div class="sub">No groups configured yet.</div></article>';
}

function renderChatSessionList() {
  const contextType = state.chat.selectedContextType || 'all_sisters';
  const contextLabel = currentContextLabel();
  const sessions = chatSessionsForCurrentContext();

  els.chatScopeTitle.textContent = contextLabel;
  els.chatScopeMeta.textContent = `${contextType === 'group' ? 'Group scope' : 'All sister scope'} • ${n(
    sessions.length
  )} sessions`;

  els.chatSessionList.innerHTML = sessions.length
    ? sessions
        .map((session) => {
          const active = session.id === state.chat.selectedSessionId;
          return `
            <button
              type="button"
              class="session-item ${active ? 'active' : ''}"
              data-chat-session-id="${esc(session.id)}"
            >
              <strong>${esc(session.title || 'Session')}</strong>
              <small>${esc(shortTs(session.updated_at))} • ${n(session.message_count || 0)} msgs</small>
            </button>
          `;
        })
        .join('')
    : '<article class="work-item"><div class="sub">No sessions in this context. Create one.</div></article>';
}

function renderChatScopeMembers() {
  const selectedSession = (state.chat.sessions || []).find((item) => item.id === state.chat.selectedSessionId) || null;
  const recipients = selectedSession?.recipients || [];
  const sisterMap = new Map((state.chat.sisters || []).map((item) => [item.id, item.display_name || item.id]));

  const members = recipients.length
    ? recipients.map((id) => ({ id, name: sisterMap.get(id) || id }))
    : state.chat.selectedContextType === 'all_sisters'
      ? (state.chat.sisters || []).map((item) => ({ id: item.id, name: item.display_name || item.id }))
      : (((state.chat.groups || []).find((item) => item.id === state.chat.selectedContextGroupId)?.members || []).map(
          (member) => ({ id: member.sister_id, name: member.display_name || member.sister_id })
        ));

  els.chatScopeMembers.innerHTML = members.length
    ? members
        .map(
          (member) => `
            <article class="work-item">
              <div class="title">${esc(member.name)}</div>
              <div class="sub">${esc(member.id)}</div>
            </article>
          `
        )
        .join('')
    : '<article class="work-item"><div class="sub">No members in current scope.</div></article>';
}

function renderChatSessionMeta() {
  const session = (state.chat.sessions || []).find((item) => item.id === state.chat.selectedSessionId);
  if (!session) {
    els.chatSessionMeta.textContent = 'No active session.';
    renderChatScopeMembers();
    return;
  }

  els.chatSessionMeta.textContent = `${session.scope_type === 'group' ? `Group ${session.group_id}` : 'All sisters'} • messages: ${n(
    session.message_count || 0
  )} • tokens: ${n(session.token_estimate || 0)} • expires: ${shortTs(session.expires_at)}`;
  els.chatDispatchMode.value = session.dispatch_mode_default || 'parallel';
  renderChatScopeMembers();
}

function renderChatMessages(payload) {
  const items = (payload?.items || []).slice().reverse();
  els.chatMessages.innerHTML = items.length
    ? items
        .map((item) => {
          const mentionIds = item.mentions?.sister_ids || [];
          const excluded = item.mentions?.excluded_sister_ids || [];
          const mentionsText = mentionIds.length ? `Mentions: ${mentionIds.join(', ')}` : '';
          const excludedText = excluded.length ? ` • Excluded: ${excluded.join(', ')}` : '';
          return `
            <article class="chat-message role-${esc(item.role)}">
              <div class="chat-message-head">
                <strong>${esc(item.actor || item.role)}</strong>
                <small>${esc(shortTs(item.created_at))}</small>
              </div>
              <div class="chat-message-body">${esc(item.content || '')}</div>
              <div class="chat-message-meta">
                ${item.dispatch_mode ? `Mode: ${esc(item.dispatch_mode)} • ` : ''}tokens: ${n(item.token_estimate || 0)}
                ${item.is_compacted ? ' • compacted' : ''}
                ${mentionsText ? ` • ${esc(mentionsText)}${esc(excludedText)}` : ''}
              </div>
            </article>
          `;
        })
        .join('')
    : '<article class="chat-message"><small>No messages in this session.</small></article>';
}

function renderChatDispatches(payload) {
  const items = payload?.items || [];
  els.chatDispatchTable.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <tr>
              <td><small>${esc(shortTs(item.created_at))}</small></td>
              <td>${esc(item.sister_name || item.sister_id)}</td>
              <td><span class="status ${dispatchStatusClass(item.status)}">${esc(item.status)}</span></td>
              <td>${esc(item.dispatch_mode || '-')}</td>
              <td>${item.sequence_index === null || item.sequence_index === undefined ? '-' : esc(item.sequence_index)}</td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="5">No dispatch activity for this session.</td></tr>';
}

function resetChatGroupForm() {
  els.chatGroupForm.reset();
  els.chatGroupId.value = '';
  els.chatGroupDispatchMode.value = 'parallel';
  els.chatGroupFormError.textContent = '';
}

function selectedGroupMembers() {
  return Array.from(els.chatGroupMembers.selectedOptions || []).map((option) => option.value);
}

function loadGroupIntoForm(groupId) {
  const group = (state.chat.groups || []).find((item) => item.id === groupId);
  if (!group) return;
  els.chatGroupId.value = group.id;
  els.chatGroupName.value = group.name || '';
  els.chatGroupDescription.value = group.description || '';
  els.chatGroupDispatchMode.value = group.dispatch_mode_default || 'parallel';

  const selected = new Set((group.members || []).map((member) => member.sister_id));
  Array.from(els.chatGroupMembers.options || []).forEach((option) => {
    option.selected = selected.has(option.value);
  });
}

function setChatContext(scopeType, groupId = null) {
  state.chat.selectedContextType = scopeType === 'group' ? 'group' : 'all_sisters';
  state.chat.selectedContextGroupId = scopeType === 'group' ? groupId : null;
  ensureChatContextAndSessionSelection();
  renderChatContextRail();
  renderChatSessionList();
  renderChatSessionMeta();
  refreshChatSessionData().catch((error) => {
    els.chatFormError.textContent = error.message;
  });
}

async function refreshChatBootstrap() {
  const payload = await fetchJson('/api/chat/bootstrap?limit=120');
  state.chat.sisters = payload.sisters || [];
  state.chat.groups = payload.groups || [];
  state.chat.sessions = payload.sessions || [];
  state.chat.settings = payload.settings || null;

  ensureChatContextAndSessionSelection();
  renderChatSettings();
  renderChatGroupMemberOptions();
  renderChatMentionChips();
  renderChatContextRail();
  renderChatSessionList();
  renderChatGroupList();
  renderChatSessionMeta();
}

async function refreshChatSessionData() {
  const sessionId = state.chat.selectedSessionId;
  if (!sessionId) {
    renderChatMessages({ items: [] });
    renderChatDispatches({ items: [] });
    return;
  }

  const [messages, dispatches, sessionPayload] = await Promise.all([
    fetchJson(`/api/chat/sessions/${encodeURIComponent(sessionId)}/messages?limit=200`),
    fetchJson(`/api/chat/sessions/${encodeURIComponent(sessionId)}/dispatches?limit=120`),
    fetchJson(`/api/chat/sessions/${encodeURIComponent(sessionId)}`)
  ]);

  const session = sessionPayload?.item;
  if (session) {
    state.chat.sessions = (state.chat.sessions || []).map((item) => (item.id === session.id ? session : item));
  }

  ensureChatContextAndSessionSelection();
  renderChatSessionList();
  renderChatSessionMeta();
  renderChatMessages(messages);
  renderChatDispatches(dispatches);
}

async function createChatSession(scopeType, groupId = null) {
  const payload = {
    scope_type: scopeType,
    dispatch_mode_default: els.chatDispatchMode.value || 'parallel',
    actor: 'operator'
  };
  if (scopeType === 'group') {
    payload.group_id = groupId;
    const group = (state.chat.groups || []).find((item) => item.id === groupId);
    payload.title = group?.name ? `${group.name} Session` : 'Group Session';
  } else {
    payload.title = 'All Sisters Session';
  }

  const created = await fetchJson('/api/chat/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  state.chat.selectedContextType = scopeType === 'group' ? 'group' : 'all_sisters';
  state.chat.selectedContextGroupId = scopeType === 'group' ? groupId : null;
  state.chat.selectedSessionId = created.item?.id || null;
  await refreshChatBootstrap();
  await refreshChatSessionData();
}

async function saveChatGroupFromForm() {
  const editingGroupId = els.chatGroupId.value || null;
  const payload = {
    name: els.chatGroupName.value,
    description: els.chatGroupDescription.value,
    dispatch_mode_default: els.chatGroupDispatchMode.value,
    sister_ids: selectedGroupMembers(),
    actor: 'operator'
  };

  const groupId = editingGroupId;
  let savedGroupId = groupId;
  if (groupId) {
    await fetchJson(`/api/chat/groups/${encodeURIComponent(groupId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } else {
    const created = await fetchJson('/api/chat/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    savedGroupId = created?.item?.id || null;
  }

  resetChatGroupForm();
  await refreshChatBootstrap();
  if (savedGroupId) {
    setChatContext('group', savedGroupId);
  }
}

async function sendChatMessage() {
  const sessionId = state.chat.selectedSessionId;
  if (!sessionId) {
    throw new Error('Select or create a chat session first.');
  }

  const content = els.chatInput.value.trim();
  if (!content) return;

  await fetchJson(`/api/chat/sessions/${encodeURIComponent(sessionId)}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      actor: 'operator',
      content,
      dispatch_mode: els.chatDispatchMode.value || 'parallel'
    })
  });

  els.chatInput.value = '';
  await Promise.all([refreshChatBootstrap(), refreshChatSessionData()]);
}

function renderDomainLinks() {
  const links = state.overview?.beings?.online_dashboards || state.overview?.beings?.online_domains || [];
  els.domainsModalCount.textContent = `Online links: ${n(links.length)}`;

  els.domainsList.innerHTML = links.length
    ? links
        .map(
          (item) => `
            <article class="work-item">
              <div class="title">${esc(item.name || 'Untitled')}</div>
              ${
                item.beings_count !== undefined && item.beings_count !== null
                  ? `<div class="sub">Beings: ${n(item.beings_count || 0)}</div>`
                  : ''
              }
              <div class="meta"><a href="${esc(item.url)}" target="_blank" rel="noreferrer noopener">${esc(
                item.url
              )}</a></div>
            </article>
          `
        )
        .join('')
    : '<article class="work-item"><div class="sub">No online links found.</div></article>';
}

function openDomainsModal() {
  renderDomainLinks();
  openModal(els.domainsModal);
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
  state.workboardDetailCache.clear();
}

async function refreshSubagents() {
  const q = new URLSearchParams({ days: String(DAYS), limit: String(SUBAGENTS_LIMIT) });
  if (els.subagentStatusFilter.value) q.set('status', els.subagentStatusFilter.value);
  if (els.subagentSisterFilter.value) q.set('sister_id', els.subagentSisterFilter.value);
  if (els.subagentRequesterFilter.value) q.set('requester', els.subagentRequesterFilter.value);
  renderSubagents(await fetchJson(`/api/subagents?${q.toString()}`));
}

async function refreshEvents() {
  const q = new URLSearchParams({ days: String(DAYS), limit: String(state.logsLimit) });
  if (els.sisterFilter.value) q.set('sister_id', els.sisterFilter.value);
  renderEvents(await fetchJson(`/api/events?${q.toString()}`));
}

async function refreshAssignments() {
  const q = new URLSearchParams({ days: String(DAYS), limit: String(state.assignmentsLimit) });
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
      refreshSubagents(),
      refreshEvents(),
      refreshAssignments(),
      refreshChatBootstrap()
    ]);
    await refreshChatSessionData();
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
  state.assignmentsLimit = ASSIGNMENTS_DEFAULT_LIMIT;
  refreshAssignments().catch(() => {});
});

els.assignmentOwnerFilter.addEventListener('change', () => {
  state.assignmentsLimit = ASSIGNMENTS_DEFAULT_LIMIT;
  refreshAssignments().catch(() => {});
});

els.assignmentsLoadMoreBtn.addEventListener('click', () => {
  state.assignmentsLimit += ASSIGNMENTS_LOAD_MORE_STEP;
  refreshAssignments().catch(() => {});
});

els.subagentStatusFilter.addEventListener('change', () => {
  refreshSubagents().catch(() => {});
});

els.subagentSisterFilter.addEventListener('change', () => {
  refreshSubagents().catch(() => {});
});

els.subagentRequesterFilter.addEventListener('change', () => {
  refreshSubagents().catch(() => {});
});

els.openWorkboardBtn.addEventListener('click', () => {
  els.workboardWorkspace.classList.add('open');
  els.workboardWorkspace.setAttribute('aria-hidden', 'false');
  Promise.all([refreshWorkboard(), refreshAssignments()])
    .then(() => {
      if (state.selectedAssignmentId) {
        return refreshAssignmentEvents(state.selectedAssignmentId);
      }
      return null;
    })
    .catch((error) => {
      els.assignmentFormError.textContent = error.message;
    });
});

els.closeWorkboardBtn.addEventListener('click', () => {
  els.workboardWorkspace.classList.remove('open');
  els.workboardWorkspace.setAttribute('aria-hidden', 'true');
});

els.workboardWorkspace.addEventListener('click', (event) => {
  if (event.target === els.workboardWorkspace) {
    els.workboardWorkspace.classList.remove('open');
    els.workboardWorkspace.setAttribute('aria-hidden', 'true');
  }
});

els.workboardRefreshBtn.addEventListener('click', () => {
  Promise.all([refreshWorkboard(), refreshAssignments()])
    .then(() => {
      if (state.selectedAssignmentId) {
        return refreshAssignmentEvents(state.selectedAssignmentId);
      }
      return null;
    })
    .catch((error) => {
      els.assignmentFormError.textContent = error.message;
    });
});

els.openMissionChatBtn.addEventListener('click', () => {
  els.chatWorkspace.classList.add('open');
  els.chatWorkspace.setAttribute('aria-hidden', 'false');
  refreshChatBootstrap()
    .then(() => refreshChatSessionData())
    .catch((error) => {
      els.chatFormError.textContent = error.message;
    });
});

els.closeMissionChatBtn.addEventListener('click', () => {
  els.chatWorkspace.classList.remove('open');
  els.chatWorkspace.setAttribute('aria-hidden', 'true');
});

els.chatManageGroupsBtn.addEventListener('click', () => {
  els.chatGroupDrawer.classList.add('open');
  els.chatGroupDrawer.setAttribute('aria-hidden', 'false');
});

els.chatNewGroupBtn.addEventListener('click', () => {
  resetChatGroupForm();
  els.chatGroupDrawer.classList.add('open');
  els.chatGroupDrawer.setAttribute('aria-hidden', 'false');
});

els.closeChatGroupDrawerBtn.addEventListener('click', () => {
  els.chatGroupDrawer.classList.remove('open');
  els.chatGroupDrawer.setAttribute('aria-hidden', 'true');
});

els.chatGroupDrawer.addEventListener('click', (event) => {
  if (event.target === els.chatGroupDrawer) {
    els.chatGroupDrawer.classList.remove('open');
    els.chatGroupDrawer.setAttribute('aria-hidden', 'true');
  }
});

els.chatContextRail.addEventListener('click', (event) => {
  const button = event.target.closest('[data-chat-context-type]');
  if (!button) return;
  const scopeType = button.getAttribute('data-chat-context-type');
  const groupId = button.getAttribute('data-chat-group-id');
  setChatContext(scopeType, groupId);
});

els.chatSessionList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-chat-session-id]');
  if (!button) return;
  state.chat.selectedSessionId = button.getAttribute('data-chat-session-id');
  renderChatSessionList();
  refreshChatSessionData().catch((error) => {
    els.chatFormError.textContent = error.message;
  });
});

els.chatNewSessionBtn.addEventListener('click', () => {
  const scopeType = state.chat.selectedContextType || 'all_sisters';
  const groupId = scopeType === 'group' ? state.chat.selectedContextGroupId : null;
  if (scopeType === 'group' && !groupId) {
    els.chatFormError.textContent = 'Select a group context first.';
    return;
  }

  createChatSession(scopeType, groupId).catch((error) => {
    els.chatFormError.textContent = error.message;
  });
});

els.chatComposer.addEventListener('submit', async (event) => {
  event.preventDefault();
  els.chatFormError.textContent = '';
  try {
    await sendChatMessage();
  } catch (error) {
    els.chatFormError.textContent = error.message;
  }
});

els.chatMentionChips.addEventListener('click', (event) => {
  const button = event.target.closest('[data-chat-mention]');
  if (!button) return;
  const mention = button.getAttribute('data-chat-mention');
  if (!mention) return;
  const current = els.chatInput.value.trimEnd();
  els.chatInput.value = `${current}${current ? ' ' : ''}@${mention} `;
  els.chatInput.focus();
});

els.chatGroupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  els.chatGroupFormError.textContent = '';
  try {
    await saveChatGroupFromForm();
  } catch (error) {
    els.chatGroupFormError.textContent = error.message;
  }
});

els.chatGroupResetBtn.addEventListener('click', () => {
  resetChatGroupForm();
});

els.chatGroupList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-chat-action]');
  if (!button) return;
  const action = button.getAttribute('data-chat-action');
  const groupId = button.getAttribute('data-chat-group-id');
  if (!groupId) return;

  if (action === 'edit-group') {
    loadGroupIntoForm(groupId);
    els.chatGroupDrawer.classList.add('open');
    els.chatGroupDrawer.setAttribute('aria-hidden', 'false');
    return;
  }

  if (action === 'open-group-session') {
    setChatContext('group', groupId);
    els.chatGroupDrawer.classList.remove('open');
    els.chatGroupDrawer.setAttribute('aria-hidden', 'true');

    const hasSessions = chatSessionsForCurrentContext().length > 0;
    if (!hasSessions) {
      createChatSession('group', groupId).catch((error) => {
        els.chatFormError.textContent = error.message;
      });
    }
  }
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

els.workboardGrid.addEventListener('click', (event) => {
  const card = event.target.closest('[data-workboard-sister-id]');
  if (!card) return;
  openWorkboardModal(card.getAttribute('data-workboard-sister-id')).catch((error) => {
    els.assignmentFormError.textContent = error.message;
  });
});

els.subagentsTable.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action="view-subagent"]');
  if (!button) return;
  const runId = button.getAttribute('data-run-id');
  if (!runId) return;

  openSubagentModal(runId).catch((error) => {
    els.assignmentFormError.textContent = error.message;
  });
});

els.overviewMetrics.addEventListener('click', (event) => {
  const card = event.target.closest('[data-metric-key="domains_online"]');
  if (!card) return;
  openDomainsModal();
});

els.closeModalBtn.addEventListener('click', () => closeModal(els.modal));
els.modal.addEventListener('click', (event) => {
  if (event.target === els.modal) closeModal(els.modal);
});

els.closeWorkModalBtn.addEventListener('click', () => closeModal(els.workboardModal));
els.workboardModal.addEventListener('click', (event) => {
  if (event.target === els.workboardModal) closeModal(els.workboardModal);
});

els.closeDomainsModalBtn.addEventListener('click', () => closeModal(els.domainsModal));
els.domainsModal.addEventListener('click', (event) => {
  if (event.target === els.domainsModal) closeModal(els.domainsModal);
});

els.closeSubagentModalBtn.addEventListener('click', () => closeModal(els.subagentModal));
els.subagentModal.addEventListener('click', (event) => {
  if (event.target === els.subagentModal) closeModal(els.subagentModal);
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
setInterval(() => refreshSubagents().catch(() => {}), POLL_SUBAGENTS_MS);
setInterval(() => refreshEvents().catch(() => {}), POLL_EVENTS_MS);
setInterval(() => refreshAssignments().catch(() => {}), POLL_ASSIGNMENTS_MS);
setInterval(() => refreshChatBootstrap().catch(() => {}), POLL_CHAT_MS);
setInterval(() => refreshChatSessionData().catch(() => {}), POLL_CHAT_MS);
