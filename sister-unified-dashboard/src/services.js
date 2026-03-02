import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  COLOSSEUM_DOMAIN_LIST,
  COLOSSEUM_DOMAINS_ROOT,
  COLOSSEUM_MAIN_DB,
  COLOSSEUM_API_BASE,
  GLOBAL_SKILL_ROOT_CANDIDATES,
  IDLE_WINDOW_SECONDS,
  INGEST_MIN_INTERVAL_MS,
  LOOKBACK_DAYS_DEFAULT,
  ONLINE_WINDOW_SECONDS,
  OPENCLAW_CONFIG_PATH,
  SAI_ONLINE_LINKS,
  SUBAGENT_RUNS_PATH,
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

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function toIsoFromAny(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value).toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
  const parsed = parseIso(value);
  if (!parsed) return null;
  return parsed.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function toMsFromAny(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = parseIso(value);
  return parsed ? parsed.getTime() : null;
}

function normalizeRunId(value) {
  const text = String(value || '').trim();
  return text || null;
}

function parseSubagentSessionKey(sessionKey) {
  const clean = String(sessionKey || '').trim();
  const matched = clean.match(/^agent:([^:]+):subagent:([a-z0-9\-]+)$/i);
  if (!matched) {
    return {
      raw: clean || null,
      sister_id: null,
      child_session_id: null
    };
  }

  return {
    raw: clean,
    sister_id: matched[1],
    child_session_id: matched[2]
  };
}

function parseRequesterAgent(sessionKey) {
  const clean = String(sessionKey || '').trim();
  const matched = clean.match(/^agent:([^:]+)/i);
  return matched ? matched[1] : null;
}

function normalizeSubagentStatus(run) {
  if (!run) return 'unknown';
  const endedAtMs = toMsFromAny(run.endedAt);
  if (!endedAtMs) return 'running';

  const reason = String(run.endedReason || '').toLowerCase();
  const outcomeStatus = String(run.outcome?.status || '').toLowerCase();
  const outcomeError = String(run.outcome?.error || '').toLowerCase();

  if (reason.includes('killed') || outcomeError.includes('killed')) return 'killed';
  if (outcomeStatus === 'timeout' || reason.includes('timeout')) return 'timeout';
  if (outcomeStatus === 'ok') return 'completed';
  if (outcomeStatus === 'error' || reason.includes('error')) return 'error';
  return 'completed';
}

function loadSubagentRuns() {
  const raw = readJsonFile(SUBAGENT_RUNS_PATH);
  const record = raw && typeof raw === 'object' ? raw : {};
  const runs = record.runs && typeof record.runs === 'object' ? record.runs : {};
  const entries = [];

  for (const [runIdRaw, runRaw] of Object.entries(runs)) {
    if (!runRaw || typeof runRaw !== 'object') continue;
    const runId = normalizeRunId(runRaw.runId || runIdRaw);
    if (!runId) continue;
    entries.push({ runId, ...runRaw });
  }

  return entries;
}

function buildSubagentRunItem(run, db, windowIso) {
  const child = parseSubagentSessionKey(run.childSessionKey);
  const requesterSessionKey = String(run.requesterSessionKey || '').trim() || null;
  const requesterDisplayKey = String(run.requesterDisplayKey || '').trim() || null;

  let lastEvent = null;
  let windowEvents = 0;
  if (child.sister_id && child.child_session_id) {
    lastEvent = db
      .prepare(
        `
          SELECT ts, event_type, role, tool_name, summary
          FROM events
          WHERE sister_id = ? AND session_id = ?
          ORDER BY ts DESC
          LIMIT 1
        `
      )
      .get(child.sister_id, child.child_session_id);

    windowEvents = Number(
      db
        .prepare(
          `
            SELECT COUNT(*) AS c
            FROM events
            WHERE sister_id = ? AND session_id = ? AND ts >= ?
          `
        )
        .get(child.sister_id, child.child_session_id, windowIso)?.c || 0
    );
  }

  const createdAtMs = toMsFromAny(run.createdAt) || toMsFromAny(run.startedAt) || Date.now();
  const startedAtMs = toMsFromAny(run.startedAt) || createdAtMs;
  const endedAtMs = toMsFromAny(run.endedAt);
  const runtimeSeconds = Math.max(0, Math.round(((endedAtMs || Date.now()) - startedAtMs) / 1000));

  return {
    run_id: normalizeRunId(run.runId) || normalizeRunId(run.id),
    requester_session_key: requesterSessionKey,
    requester_display_key: requesterDisplayKey,
    requester_agent_id: parseRequesterAgent(requesterSessionKey),
    sister_id: child.sister_id,
    child_session_key: child.raw,
    child_session_id: child.child_session_id,
    label: String(run.label || '').trim() || null,
    task: String(run.task || '').trim() || null,
    status: normalizeSubagentStatus(run),
    spawn_mode: run.spawnMode === 'session' ? 'session' : 'run',
    cleanup: String(run.cleanup || '').trim() || null,
    expects_completion_message: Boolean(run.expectsCompletionMessage),
    created_at: toIsoFromAny(run.createdAt),
    started_at: toIsoFromAny(run.startedAt),
    ended_at: toIsoFromAny(run.endedAt),
    cleanup_completed_at: toIsoFromAny(run.cleanupCompletedAt),
    archive_at: toIsoFromAny(run.archiveAtMs),
    run_timeout_seconds: Number(run.runTimeoutSeconds || 0),
    model: String(run.model || '').trim() || null,
    outcome: run.outcome || null,
    runtime_seconds: runtimeSeconds,
    activity: {
      last_event_at: lastEvent?.ts || null,
      last_event_type: lastEvent?.event_type || null,
      last_event_summary: lastEvent?.summary || null,
      events_window: windowEvents
    }
  };
}

function lifecycleEventsForRun(runItem) {
  const events = [];

  if (runItem.created_at) {
    events.push({
      ts: runItem.created_at,
      source: 'registry',
      event_type: 'spawned',
      summary: runItem.task || runItem.label || 'Subagent spawned'
    });
  }
  if (runItem.started_at && runItem.started_at !== runItem.created_at) {
    events.push({
      ts: runItem.started_at,
      source: 'registry',
      event_type: 'started',
      summary: `${runItem.sister_id || 'unknown'} started subagent run`
    });
  }
  if (runItem.ended_at) {
    events.push({
      ts: runItem.ended_at,
      source: 'registry',
      event_type: `ended:${runItem.status}`,
      summary: runItem.outcome?.error || runItem.status
    });
  }
  if (runItem.cleanup_completed_at) {
    events.push({
      ts: runItem.cleanup_completed_at,
      source: 'registry',
      event_type: 'cleanup_completed',
      summary: 'Cleanup flow completed'
    });
  }

  return events;
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

function uniqSorted(values) {
  return Array.from(new Set((values || []).filter((value) => Boolean(value)))).sort((a, b) =>
    String(a).localeCompare(String(b))
  );
}

function listSkillNamesFromRoot(rootPath) {
  if (!rootPath || !fs.existsSync(rootPath)) return [];

  try {
    return fs
      .readdirSync(rootPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function listWorkspaceLocalSkills(workspace) {
  if (!workspace || !fs.existsSync(workspace)) return [];
  const skillsRoot = path.join(workspace, 'skills');
  if (!fs.existsSync(skillsRoot)) return [];

  try {
    return fs
      .readdirSync(skillsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => fs.existsSync(path.join(skillsRoot, entry.name, 'SKILL.md')))
      .map((entry) => entry.name)
      .filter(Boolean);
  } catch {
    return [];
  }
}

function detectNonStandardSkillPaths(workspace) {
  if (!workspace || !fs.existsSync(workspace)) return [];

  const hits = [];
  const skipDirs = new Set([
    '.git',
    '.openclaw',
    'node_modules',
    'memory',
    'reports',
    'data',
    'sessions',
    'skills'
  ]);

  function walk(dirPath, depth) {
    if (depth > 4) return;

    let entries = [];
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (skipDirs.has(entry.name)) continue;
        walk(fullPath, depth + 1);
        continue;
      }

      if (!entry.isFile() || entry.name !== 'SKILL.md') continue;
      const skillDir = path.dirname(fullPath);
      hits.push({
        name: path.basename(skillDir),
        path: skillDir,
        note: 'detected but non standard path'
      });
    }
  }

  walk(workspace, 0);
  const seen = new Set();
  return hits.filter((item) => {
    if (seen.has(item.path)) return false;
    seen.add(item.path);
    return true;
  });
}

function getConfiguredSkillEntries() {
  const config = loadOpenClawConfig();
  const entries = config?.skills?.entries;
  if (!entries || typeof entries !== 'object') return [];
  return Object.keys(entries).filter(Boolean);
}

function getSkillAccess(agentId, workspace) {
  const globalSkills = uniqSorted(
    (GLOBAL_SKILL_ROOT_CANDIDATES || []).flatMap((rootPath) => listSkillNamesFromRoot(rootPath))
  );
  const workspaceLocalSkills = uniqSorted(listWorkspaceLocalSkills(workspace));
  const configuredEntries = uniqSorted(getConfiguredSkillEntries());
  const nonStandard = detectNonStandardSkillPaths(workspace);
  const effective = uniqSorted(globalSkills.concat(workspaceLocalSkills, configuredEntries));

  return {
    effective,
    global: globalSkills,
    workspace_local: workspaceLocalSkills,
    configured_entries: configuredEntries,
    detected_non_standard_paths: nonStandard,
    discovery_warnings: nonStandard.map((item) => `${item.note}: ${item.path}`),
    counts: {
      effective: effective.length,
      global: globalSkills.length,
      workspace_local: workspaceLocalSkills.length,
      configured_entries: configuredEntries.length
    },
    source_workspace: workspace || resolveWorkspace(agentId, '')
  };
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
  const skills = getSkillAccess(sister.id, sister.workspace);

  return {
    id: sister.id,
    display_name: sister.display_name,
    personality: personality.personality,
    personality_source: personality.source_file,
    tools,
    skills,
    current_status: sister.status,
    relevant_information: {
      workspace: sister.workspace,
      model_primary: sister.model_primary,
      current_model: sister.current_model,
      active_session: sister.active_session,
      last_event_at: sister.last_event_at,
      last_event_summary: sister.last_event?.summary || null,
      events_window: sister.events_window,
      sessions_window: sister.sessions_window,
      skills_effective_count: skills.counts.effective
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

export function getSubagents({ days = LOOKBACK_DAYS_DEFAULT, limit = 120, status = null, requester = null, sisterId = null } = {}) {
  ensureIngested(false);
  const db = getDb();
  const windowDays = Math.max(days, 1);
  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const windowStartMs = Date.now() - windowMs;
  const windowIso = new Date(windowStartMs).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const boundedLimit = Math.min(Math.max(Number(limit) || 120, 1), 500);

  const rawRuns = loadSubagentRuns();
  const mapped = rawRuns.map((run) => buildSubagentRunItem(run, db, windowIso));
  const requestedStatus = String(status || '').trim().toLowerCase() || null;
  const requesterNeedle = String(requester || '').trim().toLowerCase() || null;
  const sisterNeedle = String(sisterId || '').trim().toLowerCase() || null;

  const filtered = mapped.filter((item) => {
    const createdMs = toMsFromAny(item.created_at) || 0;
    if (createdMs && createdMs < windowStartMs) return false;

    if (requestedStatus && item.status !== requestedStatus) return false;

    if (requesterNeedle) {
      const requesterValue = `${item.requester_session_key || ''} ${item.requester_display_key || ''}`.toLowerCase();
      if (!requesterValue.includes(requesterNeedle)) return false;
    }

    if (sisterNeedle && String(item.sister_id || '').toLowerCase() !== sisterNeedle) return false;

    return true;
  });

  filtered.sort((a, b) => {
    const aMs = toMsFromAny(a.created_at) || 0;
    const bMs = toMsFromAny(b.created_at) || 0;
    return bMs - aMs;
  });

  const hasMore = filtered.length > boundedLimit;
  const items = filtered.slice(0, boundedLimit);
  const allStatuses = ['running', 'completed', 'error', 'killed', 'timeout', 'unknown'];
  const requesters = Array.from(
    new Set(items.map((item) => item.requester_session_key).filter((value) => Boolean(value)))
  );
  const sisters = Array.from(
    new Set(items.map((item) => item.sister_id).filter((value) => Boolean(value)))
  );

  return {
    window_days: windowDays,
    limit: boundedLimit,
    has_more: hasMore,
    items,
    filters: {
      statuses: allStatuses,
      requesters,
      sisters
    }
  };
}

export function getSubagent(runId, days = LOOKBACK_DAYS_DEFAULT) {
  const normalizedRunId = normalizeRunId(runId);
  if (!normalizedRunId) return null;

  const list = getSubagents({ days, limit: 500 }).items;
  return list.find((item) => item.run_id === normalizedRunId) || null;
}

export function getSubagentActivity(runId, { days = LOOKBACK_DAYS_DEFAULT, limit = 120 } = {}) {
  ensureIngested(false);
  const db = getDb();
  const item = getSubagent(runId, days);
  if (!item) return null;

  const windowDays = Math.max(days, 1);
  const boundedLimit = Math.min(Math.max(Number(limit) || 120, 1), 500);
  const windowIso = windowStartIso(windowDays);

  const lifecycleEvents = lifecycleEventsForRun(item);
  const sessionEvents = item.sister_id && item.child_session_id
    ? db
        .prepare(
          `
            SELECT ts, event_type, role, tool_name, summary
            FROM events
            WHERE sister_id = ? AND session_id = ? AND ts >= ?
            ORDER BY ts DESC
            LIMIT ?
          `
        )
        .all(item.sister_id, item.child_session_id, windowIso, boundedLimit)
        .map((row) => ({
          ts: row.ts,
          source: 'session',
          event_type: row.event_type,
          role: row.role || null,
          tool_name: row.tool_name || null,
          summary: row.summary || null
        }))
    : [];

  const merged = lifecycleEvents.concat(sessionEvents).filter((entry) => parseIso(entry.ts));
  merged.sort((a, b) => {
    const aMs = parseIso(a.ts)?.getTime() || 0;
    const bMs = parseIso(b.ts)?.getTime() || 0;
    return bMs - aMs;
  });

  return {
    window_days: windowDays,
    limit: boundedLimit,
    run: item,
    items: merged.slice(0, boundedLimit)
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
