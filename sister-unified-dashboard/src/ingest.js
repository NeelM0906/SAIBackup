import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { OPENCLAW_CONFIG_PATH, SISTER_LOGS_ROOT } from './config.js';
import { getDb } from './db.js';

const UNPAIRED_HIGH_SURROGATE = /\\u[dD][89ABab][0-9a-fA-F]{2}(?!\\u[dD][c-fC-F][0-9a-fA-F]{2})/g;
const UNPAIRED_LOW_SURROGATE = /(?<!\\u[dD][89ABab][0-9a-fA-F]{2})\\u[dD][c-fC-F][0-9a-fA-F]{2}/g;

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function normalizeIso(value) {
  if (!value || typeof value !== 'string') return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function sanitizeBadSurrogates(line) {
  return line.replace(UNPAIRED_HIGH_SURROGATE, '\\uFFFD').replace(UNPAIRED_LOW_SURROGATE, '\\uFFFD');
}

function parseJsonLine(line) {
  const raw = line.trim();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(sanitizeBadSurrogates(raw));
    } catch {
      return null;
    }
  }
}

function loadSisterConfig() {
  if (!fs.existsSync(OPENCLAW_CONFIG_PATH)) return [];
  let payload;

  try {
    payload = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG_PATH, 'utf8'));
  } catch {
    return [];
  }

  const list = payload?.agents?.list || [];
  return list
    .filter((agent) => agent?.id)
    .map((agent) => ({
      id: agent.id,
      display_name: agent.name || agent.id,
      workspace: agent.workspace || '',
      model_primary: agent?.model?.primary || ''
    }));
}

function eventUid(filePath, lineNumber) {
  return crypto.createHash('sha1').update(`${filePath}:${lineNumber}`).digest('hex');
}

function sessionIdFromFile(filePath) {
  const stem = path.basename(filePath, '.jsonl');
  return stem.split('-topic-')[0];
}

function extractMessageDetails(entry) {
  const message = entry.message || {};
  const role = message.role || null;
  const blocks = Array.isArray(message.content) ? message.content : [];

  let firstType = null;
  let firstText = null;
  let firstToolName = null;

  for (const block of blocks) {
    if (!firstType) firstType = block?.type || null;
    if (!firstText && block?.type === 'text' && typeof block.text === 'string') {
      firstText = block.text;
    }
    if (!firstToolName && block?.type === 'toolCall') {
      firstToolName = block.name || null;
    }
  }

  let summary = null;
  if (firstToolName) {
    summary = `toolCall:${firstToolName}`;
  } else if (firstText) {
    summary = firstText.replace(/\s+/g, ' ').slice(0, 240);
  }

  return {
    role,
    content_type: firstType,
    tool_name: firstToolName,
    summary
  };
}

function extractEventFields(entry) {
  const eventType = String(entry?.type || 'unknown');
  let timestamp = normalizeIso(entry?.timestamp || null);
  let role = null;
  let contentType = null;
  let toolName = null;
  let summary = null;

  if (eventType === 'message') {
    const details = extractMessageDetails(entry);
    role = details.role;
    contentType = details.content_type;
    toolName = details.tool_name;
    summary = details.summary;

    if (!timestamp) {
      timestamp = normalizeIso(entry?.message?.timestamp || null);
    }
  } else if (eventType === 'model_change') {
    summary = entry?.modelId || null;
  } else if (eventType === 'custom') {
    summary = entry?.customType || entry?.data?.type || null;
  } else if (eventType === 'session') {
    summary = 'session_start';
  } else {
    summary = eventType;
  }

  return {
    event_type: eventType,
    ts: timestamp,
    role,
    content_type: contentType,
    tool_name: toolName,
    summary
  };
}

export function ingestSessions() {
  const db = getDb();
  const sisters = loadSisterConfig();
  const ingestedAt = nowIso();

  const stats = {
    sisters: sisters.length,
    files_scanned: 0,
    events_ingested: 0,
    lines_skipped: 0
  };

  const upsertSister = db.prepare(`
    INSERT INTO sisters (id, display_name, workspace, model_primary, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      display_name = excluded.display_name,
      workspace = excluded.workspace,
      model_primary = excluded.model_primary,
      updated_at = excluded.updated_at
  `);

  const getOffsetRow = db.prepare('SELECT mtime FROM file_offsets WHERE file_path = ?');
  const setOffsetRow = db.prepare(`
    INSERT INTO file_offsets (file_path, sister_id, offset, mtime, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(file_path) DO UPDATE SET
      sister_id = excluded.sister_id,
      offset = excluded.offset,
      mtime = excluded.mtime,
      updated_at = excluded.updated_at
  `);

  const upsertSession = db.prepare(`
    INSERT INTO sessions (session_id, sister_id, started_at, last_event_at, cwd, source_file, event_count, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    ON CONFLICT(session_id) DO UPDATE SET
      sister_id = excluded.sister_id,
      cwd = COALESCE(excluded.cwd, sessions.cwd),
      source_file = excluded.source_file,
      started_at = COALESCE(sessions.started_at, excluded.started_at),
      updated_at = excluded.updated_at
  `);

  const insertEvent = db.prepare(`
    INSERT OR IGNORE INTO events (
      event_uid,
      session_id,
      sister_id,
      event_id,
      event_type,
      role,
      content_type,
      tool_name,
      summary,
      ts,
      raw_json,
      source_file,
      source_offset,
      ingested_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const updateSessionFromEvent = db.prepare(`
    UPDATE sessions
    SET
      last_event_at = CASE
        WHEN last_event_at IS NULL OR last_event_at < ? THEN ?
        ELSE last_event_at
      END,
      event_count = event_count + 1,
      updated_at = ?
    WHERE session_id = ?
  `);

  db.exec('BEGIN');
  try {
    for (const sister of sisters) {
      upsertSister.run(
        sister.id,
        sister.display_name,
        sister.workspace,
        sister.model_primary,
        ingestedAt
      );

      const sessionsDir = path.join(SISTER_LOGS_ROOT, sister.id, 'sessions');
      if (!fs.existsSync(sessionsDir)) continue;

      const files = fs
        .readdirSync(sessionsDir)
        .filter((name) => name.endsWith('.jsonl'))
        .map((name) => path.join(sessionsDir, name))
        .sort();

      for (const filePath of files) {
        stats.files_scanned += 1;

        const mtime = fs.statSync(filePath).mtimeMs;
        const size = fs.statSync(filePath).size;
        const offsetRow = getOffsetRow.get(filePath);
        if (offsetRow && Number(offsetRow.mtime) >= mtime) {
          continue;
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/);

        let sessionId = sessionIdFromFile(filePath);

        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          if (!line.trim()) continue;

          const parsed = parseJsonLine(line);
          if (!parsed) {
            stats.lines_skipped += 1;
            continue;
          }

          if (parsed.type === 'session' && parsed.id) {
            sessionId = parsed.id;
          }

          const fields = extractEventFields(parsed);
          const startedAt = normalizeIso(parsed.timestamp || null);

          upsertSession.run(
            sessionId,
            sister.id,
            startedAt,
            fields.ts,
            parsed.cwd || null,
            filePath,
            ingestedAt
          );

          const uid = eventUid(filePath, i + 1);
          const result = insertEvent.run(
            uid,
            sessionId,
            sister.id,
            parsed.id || null,
            fields.event_type,
            fields.role,
            fields.content_type,
            fields.tool_name,
            fields.summary,
            fields.ts,
            line.slice(0, 8000),
            filePath,
            i + 1,
            ingestedAt
          );

          if (result.changes > 0) {
            stats.events_ingested += 1;
            if (fields.ts) {
              updateSessionFromEvent.run(fields.ts, fields.ts, ingestedAt, sessionId);
            }
          }
        }

        setOffsetRow.run(filePath, sister.id, size, mtime, ingestedAt);
      }
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    ingested_at: ingestedAt,
    stats
  };
}
