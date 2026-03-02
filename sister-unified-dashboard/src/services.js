import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  COLOSSEUM_DOMAIN_LIST,
  COLOSSEUM_DOMAINS_ROOT,
  COLOSSEUM_MAIN_DB,
  COLOSSEUM_API_BASE,
  IDLE_WINDOW_SECONDS,
  INGEST_MIN_INTERVAL_MS,
  LOOKBACK_DAYS_DEFAULT,
  ONLINE_WINDOW_SECONDS,
  OPENCLAW_CONFIG_PATH,
  SAI_ONLINE_LINKS,
  SNAPSHOT_FALLBACK_PATH
} from './config.js';
import { getDb } from './db.js';
import { ingestSessions } from './ingest.js';

let lastIngestMs = 0;
let lastIngestResult = { ingested_at: null, stats: {} };
let configCache = { mtimeMs: 0, payload: null };

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function windowStartIso(days) {
  const windowMs = Math.max(days, 1) * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - windowMs).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function parseIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isInactiveStatus(status) {
  return status !== 'online';
}

function safeJsonParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function loadOpenClawConfig() {
  if (!fs.existsSync(OPENCLAW_CONFIG_PATH)) return null;

  try {
    const stat = fs.statSync(OPENCLAW_CONFIG_PATH);
    if (configCache.payload && configCache.mtimeMs === stat.mtimeMs) {
      return configCache.payload;
    }

    const parsed = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG_PATH, 'utf8'));
    configCache = { mtimeMs: stat.mtimeMs, payload: parsed };
    return parsed;
  } catch {
    return null;
  }
}

function getAgentConfig(agentId) {
  const config = loadOpenClawConfig();
  const list = config?.agents?.list || [];
  const defaultsWorkspace = config?.agents?.defaults?.workspace || '';
  const defaultsTools = config?.agents?.defaults?.tools?.alsoAllow || [];
  const defaultsModel = config?.agents?.defaults?.model?.primary || '';

  const agent = list.find((item) => item?.id === agentId) || null;
  return {
    agent,
    defaultsWorkspace,
    defaultsTools,
    defaultsModel
  };
}

function resolveWorkspace(agentId, fallbackWorkspace = '') {
  const { agent, defaultsWorkspace } = getAgentConfig(agentId);
  if (agent?.workspace) return agent.workspace;
  if (fallbackWorkspace) return fallbackWorkspace;
  return defaultsWorkspace || '';
}

function getRawTools(agentId) {
  const { agent, defaultsTools } = getAgentConfig(agentId);
  const tools = agent?.tools?.alsoAllow;
  if (Array.isArray(tools) && tools.length) return tools;
  return Array.isArray(defaultsTools) ? defaultsTools : [];
}

function getPrimaryModel(agentId, fallbackModel = '') {
  const { agent, defaultsModel } = getAgentConfig(agentId);
  return agent?.model?.primary || fallbackModel || defaultsModel || null;
}

function safeSqliteCount(dbPath, query) {
  if (!fs.existsSync(dbPath)) return 0;
  let externalDb;

  try {
    externalDb = new DatabaseSync(dbPath);
    const row = externalDb.prepare(query).get();
    externalDb.close();
    return Number(row?.['COUNT(*)'] || 0);
  } catch {
    try {
      externalDb?.close();
    } catch {
      // no-op
    }
    return 0;
  }
}

function getBeingsSummary() {
  let totalBeings = 0;
  const domainCounts = {};
  let colosseumDomainsOnline = 0;
  const onlineDomains = [];
  const onlineDashboards = (SAI_ONLINE_LINKS || []).map((item) => ({
    name: String(item?.name || '').trim(),
    url: String(item?.url || '').trim()
  }));

  totalBeings += safeSqliteCount(COLOSSEUM_MAIN_DB, 'SELECT COUNT(*) FROM beings');

  for (const domain of COLOSSEUM_DOMAIN_LIST) {
    const dbPath = path.join(COLOSSEUM_DOMAINS_ROOT, domain, 'colosseum.db');
    const count = safeSqliteCount(dbPath, 'SELECT COUNT(*) FROM beings');
    domainCounts[domain] = count;
    if (count > 0) {
      colosseumDomainsOnline += 1;
      onlineDomains.push({
        name: domain,
        beings_count: count,
        url: `${COLOSSEUM_API_BASE.replace(/\/$/, '')}/domain/${encodeURIComponent(domain)}/beings`
      });
    }
    totalBeings += count;
  }

  if (totalBeings === 0 && fs.existsSync(SNAPSHOT_FALLBACK_PATH)) {
    try {
      const snap = JSON.parse(fs.readFileSync(SNAPSHOT_FALLBACK_PATH, 'utf8'));
      totalBeings = Number(snap?.stats?.total_beings || 0);
    } catch {
      totalBeings = 0;
    }
  }

  return {
    total_beings: totalBeings,
    domains_online: onlineDashboards.length || colosseumDomainsOnline,
    colosseum_domains_online: colosseumDomainsOnline,
    domain_counts: domainCounts,
    online_domains: onlineDomains,
    online_dashboards_count: onlineDashboards.length,
    online_dashboards: onlineDashboards
  };
}

function identityCandidates(workspace) {
  if (!workspace) return [];
  return ['IDENTITY.md', 'SOUL.md', 'AGENTS.md'].map((file) => path.join(workspace, file));
}

function extractPersonalitySummary(markdown) {
  const text = String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\r/g, '');

  const paragraphs = text
    .split(/\n\s*\n/g)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('---'))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((block) => block.length > 40);

  if (!paragraphs.length) {
    return 'No personality summary found in profile files.';
  }

  return paragraphs.slice(0, 2).join('\n\n').slice(0, 1500);
}

function readPersonality(workspace) {
  for (const filePath of identityCandidates(workspace)) {
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        return {
          source_file: filePath,
          personality: extractPersonalitySummary(raw)
        };
      } catch {
        // Continue fallback chain.
      }
    }
  }

  return {
    source_file: null,
    personality: 'No profile file found (IDENTITY.md, SOUL.md, AGENTS.md).'
  };
}

function extractWaitingTarget(text) {
  if (!text) return null;
  const clean = String(text).trim();

  const direct = clean.match(/waiting\s+for\s+response\s+from\s+([a-z0-9_\- ]{2,60})/i);
  if (direct) return direct[1].trim();

  const needLine = clean.match(/need:\s*([a-z0-9_\- ,.]{2,80})/i);
  if (needLine) return needLine[1].trim();

  const blockedBy = clean.match(/blocked\s+by\s+([a-z0-9_\- ]{2,60})/i);
  if (blockedBy) return blockedBy[1].trim();

  return null;
}

function statusRecencyBoost(updatedAt) {
  const ts = parseIso(updatedAt);
  if (!ts) return 0;

  const mins = Math.floor((Date.now() - ts.getTime()) / 60000);
  if (mins <= 10) return 25;
  if (mins <= 30) return 18;
  if (mins <= 60) return 12;
  if (mins <= 180) return 6;
  if (mins <= 720) return 3;
  return 0;
}

function runtimeProgressFromRecency(updatedAt) {
  const ts = parseIso(updatedAt);
  if (!ts) return 20;

  const mins = Math.floor((Date.now() - ts.getTime()) / 60000);
  if (mins <= 5) return 72;
  if (mins <= 15) return 65;
  if (mins <= 30) return 58;
  if (mins <= 60) return 50;
  if (mins <= 180) return 42;
  return 30;
}

function buildProgress({ status, updatedAt, eventCount, sisterStatus, lastActiveStatus, waitingFor }) {
  const recency = statusRecencyBoost(updatedAt);
  const eventBoost = Math.min(15, (Number(eventCount) || 0) * 3);

  if (status === 'blocked') {
    let base = 50;
    if (lastActiveStatus === 'rework') base = 68;
    if (lastActiveStatus === 'in_progress') base = 58;
    if (lastActiveStatus === 'inbox') base = 35;

    const percent = Math.min(85, base + Math.min(12, (Number(eventCount) || 0) * 2));
    return {
      percent,
      note: waitingFor ? `waiting for response from ${waitingFor}` : 'blocked',
      source: 'heuristic'
    };
  }

  if (isInactiveStatus(sisterStatus)) {
    return {
      percent: null,
      note: 'inactive',
      source: null
    };
  }

  if (status === 'in_progress') {
    return {
      percent: Math.min(92, 45 + recency + eventBoost),
      note: 'heuristic (to be improved)',
      source: 'heuristic'
    };
  }

  if (status === 'rework') {
    return {
      percent: Math.min(95, 60 + recency + eventBoost),
      note: 'heuristic (to be improved)',
      source: 'heuristic'
    };
  }

  if (status === 'inbox') {
    return {
      percent: 20,
      note: 'queued',
      source: 'heuristic'
    };
  }

  return {
    percent: null,
    note: null,
    source: null
  };
}

function buildRuntimeFallbackWorkItem(sisterId, sisterStatus, db) {
  const latest = db
    .prepare(
      `
        SELECT ts, summary, event_type, tool_name
        FROM events
        WHERE sister_id = ?
        ORDER BY ts DESC
        LIMIT 1
      `
    )
    .get(sisterId);

  if (!latest) return null;

  if (isInactiveStatus(sisterStatus)) {
    return {
      assignment_id: null,
      title: 'Runtime activity',
      summary: latest.summary || latest.event_type || 'No recent summary',
      status: 'inactive',
      priority: null,
      updated_at: latest.ts,
      progress_percent: null,
      progress_note: 'inactive',
      progress_source: null,
      waiting_for: null,
      runtime: true
    };
  }

  return {
    assignment_id: null,
    title: 'Runtime activity',
    summary: latest.summary || latest.event_type || 'No recent summary',
    status: 'runtime',
    priority: null,
    updated_at: latest.ts,
    progress_percent: runtimeProgressFromRecency(latest.ts),
    progress_note: 'heuristic (to be improved)',
    progress_source: 'heuristic',
    waiting_for: null,
    runtime: true
  };
}

function assignmentQueryStatements(db, perSisterLimit) {
  const boundedLimit = Math.max(1, Math.min(400, Number(perSisterLimit) || 5));

  return {
    boundedLimit,
    assignmentsStmt: db.prepare(
      `
        SELECT id, title, description, owner_sister_id, priority, status, created_at, updated_at, completed_at
        FROM assignments
        WHERE owner_sister_id = ?
          AND COALESCE(archived_at, '') = ''
        ORDER BY updated_at DESC
        LIMIT ?
      `
    ),
    assignmentEventCountStmt: db.prepare('SELECT COUNT(*) AS c FROM assignment_events WHERE assignment_id = ?'),
    lastStatusChangeStmt: db.prepare(
      `
        SELECT from_status, to_status, note, metadata_json, created_at
        FROM assignment_events
        WHERE assignment_id = ? AND event_type = 'status_changed'
        ORDER BY created_at DESC
        LIMIT 1
      `
    ),
    lastBlockedStatusStmt: db.prepare(
      `
        SELECT from_status, to_status, note, metadata_json, created_at
        FROM assignment_events
        WHERE assignment_id = ? AND event_type = 'status_changed' AND to_status = 'blocked'
        ORDER BY created_at DESC
        LIMIT 1
      `
    )
  };
}

function mapAssignmentToWorkItem({
  assignment,
  sister,
  assignmentEventCountStmt,
  lastStatusChangeStmt,
  lastBlockedStatusStmt
}) {
  const eventCount = Number(assignmentEventCountStmt.get(assignment.id)?.c || 0);
  const lastStatus = lastStatusChangeStmt.get(assignment.id);
  const lastBlocked = lastBlockedStatusStmt.get(assignment.id);

  const waitingFromNote = extractWaitingTarget(lastBlocked?.note || null);
  const waitingFromDescription = extractWaitingTarget(assignment.description || null);
  const waitingFromMeta = extractWaitingTarget(safeJsonParse(lastBlocked?.metadata_json)?.waiting_for || null);
  const waitingFor = waitingFromMeta || waitingFromNote || waitingFromDescription || null;

  let progress = buildProgress({
    status: assignment.status,
    updatedAt: assignment.updated_at,
    eventCount,
    sisterStatus: sister.status,
    lastActiveStatus: lastBlocked?.from_status || lastStatus?.from_status || null,
    waitingFor
  });

  if (assignment.status === 'completed') {
    progress = {
      percent: 100,
      note: 'completed',
      source: 'derived'
    };
  } else if (assignment.status === 'cancelled') {
    progress = {
      percent: null,
      note: 'cancelled',
      source: 'derived'
    };
  }

  return {
    assignment_id: assignment.id,
    title: assignment.title,
    summary: assignment.description || null,
    status: assignment.status,
    priority: assignment.priority,
    created_at: assignment.created_at,
    updated_at: assignment.updated_at,
    completed_at: assignment.completed_at || null,
    progress_percent: progress.percent,
    progress_note: progress.note,
    progress_source: progress.source,
    waiting_for: waitingFor,
    runtime: false
  };
}

export function ensureIngested(force = false) {
  const now = Date.now();
  if (!force && now - lastIngestMs < INGEST_MIN_INTERVAL_MS) {
    return lastIngestResult;
  }

  lastIngestResult = ingestSessions();
  lastIngestMs = now;
  return lastIngestResult;
}

export function getOverview(days = LOOKBACK_DAYS_DEFAULT) {
  const ingest = ensureIngested(false);
  const db = getDb();
  const window = windowStartIso(days);
  const now = new Date();

  const totalSisters = Number(db.prepare('SELECT COUNT(*) AS c FROM sisters').get()?.c || 0);
  const events = Number(
    db.prepare('SELECT COUNT(*) AS c FROM events WHERE ts >= ?').get(window)?.c || 0
  );
  const sessions = Number(
    db
      .prepare("SELECT COUNT(*) AS c FROM sessions WHERE COALESCE(last_event_at, started_at, '') >= ?")
      .get(window)?.c || 0
  );

  const latestRows = db
    .prepare('SELECT sister_id, MAX(ts) AS last_ts FROM events GROUP BY sister_id')
    .all();

  let active = 0;
  let idle = 0;
  let offline = 0;

  for (const row of latestRows) {
    const ts = parseIso(row.last_ts);
    if (!ts) {
      offline += 1;
      continue;
    }

    const ageSeconds = Math.floor((now.getTime() - ts.getTime()) / 1000);
    if (ageSeconds <= ONLINE_WINDOW_SECONDS) {
      active += 1;
    } else if (ageSeconds <= IDLE_WINDOW_SECONDS) {
      idle += 1;
    } else {
      offline += 1;
    }
  }

  return {
    window_days: Math.max(days, 1),
    total_sisters: totalSisters,
    active_sisters: active,
    idle_sisters: idle,
    offline_sisters: offline,
    events,
    sessions,
    beings: getBeingsSummary(),
    ingest
  };
}

export function getSisters(days = LOOKBACK_DAYS_DEFAULT) {
  ensureIngested(false);
  const db = getDb();
  const window = windowStartIso(days);
  const now = new Date();

  const sisters = db
    .prepare('SELECT id, display_name, workspace, model_primary FROM sisters ORDER BY id')
    .all();

  const lastEventStmt = db.prepare(`
    SELECT ts, session_id, event_type, role, summary
    FROM events
    WHERE sister_id = ?
    ORDER BY ts DESC
    LIMIT 1
  `);

  const lastModelStmt = db.prepare(`
    SELECT summary
    FROM events
    WHERE sister_id = ? AND event_type = 'model_change'
    ORDER BY ts DESC
    LIMIT 1
  `);

  const eventsWindowStmt = db.prepare('SELECT COUNT(*) AS c FROM events WHERE sister_id = ? AND ts >= ?');
  const sessionsWindowStmt = db.prepare(
    "SELECT COUNT(*) AS c FROM sessions WHERE sister_id = ? AND COALESCE(last_event_at, started_at, '') >= ?"
  );

  const items = sisters.map((sister) => {
    const last = lastEventStmt.get(sister.id);
    const model = lastModelStmt.get(sister.id);

    let status = 'offline';
    const lastTs = parseIso(last?.ts);
    if (lastTs) {
      const ageSeconds = Math.floor((now.getTime() - lastTs.getTime()) / 1000);
      if (ageSeconds <= ONLINE_WINDOW_SECONDS) {
        status = 'online';
      } else if (ageSeconds <= IDLE_WINDOW_SECONDS) {
        status = 'idle';
      }
    }

    const workspace = resolveWorkspace(sister.id, sister.workspace || '');

    return {
      id: sister.id,
      display_name: sister.display_name,
      workspace,
      model_primary: getPrimaryModel(sister.id, sister.model_primary),
      current_model: model?.summary || null,
      status,
      last_event_at: last?.ts || null,
      active_session: last?.session_id || null,
      last_event: {
        type: last?.event_type || null,
        role: last?.role || null,
        summary: last?.summary || null
      },
      events_window: Number(eventsWindowStmt.get(sister.id, window)?.c || 0),
      sessions_window: Number(sessionsWindowStmt.get(sister.id, window)?.c || 0)
    };
  });

  return {
    window_days: Math.max(days, 1),
    items
  };
}

export function getSisterProfile(sisterId, days = LOOKBACK_DAYS_DEFAULT) {
  const sisters = getSisters(days).items;
  const sister = sisters.find((item) => item.id === sisterId);
  if (!sister) return null;

  const personality = readPersonality(sister.workspace);
  const tools = getRawTools(sister.id);

  return {
    id: sister.id,
    display_name: sister.display_name,
    personality: personality.personality,
    personality_source: personality.source_file,
    tools,
    current_status: sister.status,
    relevant_information: {
      workspace: sister.workspace,
      model_primary: sister.model_primary,
      current_model: sister.current_model,
      active_session: sister.active_session,
      last_event_at: sister.last_event_at,
      last_event_summary: sister.last_event?.summary || null,
      events_window: sister.events_window,
      sessions_window: sister.sessions_window
    }
  };
}

export function getEvents({ days = LOOKBACK_DAYS_DEFAULT, limit = 100, sisterId = null } = {}) {
  ensureIngested(false);
  const db = getDb();
  const window = windowStartIso(days);
  const boundedLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);

  const clauses = ['ts >= ?'];
  const params = [window];

  if (sisterId) {
    clauses.push('sister_id = ?');
    params.push(sisterId);
  }

  const rows = db
    .prepare(
      `
        SELECT ts, sister_id, session_id, event_type, role, content_type, tool_name, summary
        FROM events
        WHERE ${clauses.join(' AND ')}
        ORDER BY ts DESC
        LIMIT ?
      `
    )
    .all(...params, boundedLimit + 1);

  const hasMore = rows.length > boundedLimit;
  const items = rows.slice(0, boundedLimit);

  return {
    window_days: Math.max(days, 1),
    limit: boundedLimit,
    has_more: hasMore,
    items
  };
}

export function getWorkboard(days = LOOKBACK_DAYS_DEFAULT) {
  ensureIngested(false);
  const db = getDb();
  const sisters = getSisters(days).items;
  const activeAssignmentsStmt = db.prepare(
    `
      SELECT id, title, description, owner_sister_id, priority, status, created_at, updated_at, completed_at
      FROM assignments
      WHERE owner_sister_id = ?
        AND COALESCE(archived_at, '') = ''
        AND status IN ('in_progress', 'rework', 'blocked', 'inbox')
      ORDER BY updated_at DESC
      LIMIT 5
    `
  );
  const { assignmentEventCountStmt, lastStatusChangeStmt, lastBlockedStatusStmt } = assignmentQueryStatements(db, 40);
  const activeStatuses = new Set(['in_progress', 'rework', 'blocked', 'inbox']);

  const items = sisters.map((sister) => {
    const rows = activeAssignmentsStmt.all(sister.id);

    const workItems = rows
      .filter((assignment) => activeStatuses.has(assignment.status))
      .map((assignment) =>
        mapAssignmentToWorkItem({
          assignment,
          sister,
          assignmentEventCountStmt,
          lastStatusChangeStmt,
          lastBlockedStatusStmt
        })
      );

    if (!workItems.length) {
      const runtimeFallback = buildRuntimeFallbackWorkItem(sister.id, sister.status, db);
      if (runtimeFallback) {
        workItems.push(runtimeFallback);
      }
    }

    return {
      sister_id: sister.id,
      sister_name: sister.display_name,
      sister_status: sister.status,
      current_model: sister.current_model || sister.model_primary,
      items: workItems.slice(0, 5)
    };
  });

  return {
    window_days: Math.max(days, 1),
    items
  };
}

export function getSisterWorkboardDetail(sisterId, days = LOOKBACK_DAYS_DEFAULT, limit = 120) {
  ensureIngested(false);
  const db = getDb();
  const sisters = getSisters(days).items;
  const sister = sisters.find((item) => item.id === sisterId);
  if (!sister) return null;

  const { boundedLimit, assignmentsStmt, assignmentEventCountStmt, lastStatusChangeStmt, lastBlockedStatusStmt } =
    assignmentQueryStatements(db, limit);
  const activeStatuses = new Set(['in_progress', 'rework', 'blocked', 'inbox']);

  const rows = assignmentsStmt.all(sister.id, boundedLimit);
  const mapped = rows.map((assignment) =>
    mapAssignmentToWorkItem({
      assignment,
      sister,
      assignmentEventCountStmt,
      lastStatusChangeStmt,
      lastBlockedStatusStmt
    })
  );

  const activeItems = mapped.filter((item) => activeStatuses.has(item.status));
  const previousItems = mapped.filter((item) => !activeStatuses.has(item.status));

  if (!activeItems.length) {
    const runtimeFallback = buildRuntimeFallbackWorkItem(sister.id, sister.status, db);
    if (runtimeFallback) {
      activeItems.push(runtimeFallback);
    }
  }

  return {
    window_days: Math.max(days, 1),
    limit: boundedLimit,
    sister: {
      id: sister.id,
      display_name: sister.display_name,
      status: sister.status,
      current_model: sister.current_model || sister.model_primary || null
    },
    active_items: activeItems,
    previous_items: previousItems,
    counts: {
      active: activeItems.length,
      previous: previousItems.length
    }
  };
}

export function getHealth() {
  return {
    ok: true,
    now: nowIso(),
    ingest: ensureIngested(false)
  };
}
