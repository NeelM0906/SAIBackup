import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import {
  COLOSSEUM_DOMAIN_LIST,
  COLOSSEUM_DOMAINS_ROOT,
  COLOSSEUM_MAIN_DB,
  IDLE_WINDOW_SECONDS,
  INGEST_MIN_INTERVAL_MS,
  LOOKBACK_DAYS_DEFAULT,
  ONLINE_WINDOW_SECONDS,
  SNAPSHOT_FALLBACK_PATH
} from './config.js';
import { getDb } from './db.js';
import { ingestSessions } from './ingest.js';

let lastIngestMs = 0;
let lastIngestResult = { ingested_at: null, stats: {} };

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

export function ensureIngested(force = false) {
  const now = Date.now();
  if (!force && now - lastIngestMs < INGEST_MIN_INTERVAL_MS) {
    return lastIngestResult;
  }

  lastIngestResult = ingestSessions();
  lastIngestMs = now;
  return lastIngestResult;
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
  let domainsOnline = 0;

  totalBeings += safeSqliteCount(COLOSSEUM_MAIN_DB, 'SELECT COUNT(*) FROM beings');

  for (const domain of COLOSSEUM_DOMAIN_LIST) {
    const dbPath = path.join(COLOSSEUM_DOMAINS_ROOT, domain, 'colosseum.db');
    const count = safeSqliteCount(dbPath, 'SELECT COUNT(*) FROM beings');
    domainCounts[domain] = count;
    if (count > 0) domainsOnline += 1;
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
    domains_online: domainsOnline,
    domain_counts: domainCounts
  };
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

    return {
      id: sister.id,
      display_name: sister.display_name,
      workspace: sister.workspace,
      model_primary: sister.model_primary,
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

export function getEvents({ days = LOOKBACK_DAYS_DEFAULT, limit = 100, sisterId = null } = {}) {
  ensureIngested(false);
  const db = getDb();
  const window = windowStartIso(days);
  const boundedLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);

  let items;
  if (sisterId) {
    items = db
      .prepare(
        `
          SELECT ts, sister_id, session_id, event_type, role, content_type, tool_name, summary
          FROM events
          WHERE ts >= ? AND sister_id = ?
          ORDER BY ts DESC
          LIMIT ?
        `
      )
      .all(window, sisterId, boundedLimit);
  } else {
    items = db
      .prepare(
        `
          SELECT ts, sister_id, session_id, event_type, role, content_type, tool_name, summary
          FROM events
          WHERE ts >= ?
          ORDER BY ts DESC
          LIMIT ?
        `
      )
      .all(window, boundedLimit);
  }

  return {
    window_days: Math.max(days, 1),
    limit: boundedLimit,
    items
  };
}

export function getHealth() {
  return {
    ok: true,
    now: nowIso(),
    ingest: ensureIngested(false)
  };
}
