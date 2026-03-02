import crypto from 'node:crypto';
import fs from 'node:fs';

import { LOOKBACK_DAYS_DEFAULT, OPENCLAW_CONFIG_PATH } from '../config.js';
import { getDb } from '../db.js';
import { ApiError } from './assignments.js';

const CHAT_RETENTION_DAYS = LOOKBACK_DAYS_DEFAULT;
const VALID_SCOPE_TYPES = new Set(['all_sisters', 'group']);
const VALID_DISPATCH_MODES = new Set(['parallel', 'ordered']);
const VALID_SESSION_STATUSES = new Set(['active', 'archived']);
const DEFAULT_COMPACTION_MODE = 'safeguard';
const DEFAULT_COMPACTION_THRESHOLD = 9000;
const KEEP_RECENT_MESSAGES = 20;

let compactionConfigCache = {
  mtimeMs: 0,
  settings: {
    mode: DEFAULT_COMPACTION_MODE,
    threshold: DEFAULT_COMPACTION_THRESHOLD
  }
};

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function addDaysIso(baseIso, days) {
  const base = new Date(baseIso || nowIso());
  const next = new Date(base.getTime() + Math.max(1, Number(days) || 1) * 24 * 60 * 60 * 1000);
  return next.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function normalizeString(value) {
  const normalized = String(value || '').trim();
  return normalized || null;
}

function normalizeDispatchMode(value, fallback = 'parallel') {
  const normalized = String(value || fallback).trim().toLowerCase();
  if (!VALID_DISPATCH_MODES.has(normalized)) {
    throw new ApiError(400, 'INVALID_PAYLOAD', `Invalid dispatch_mode: ${value}`);
  }
  return normalized;
}

function normalizeScopeType(value, fallback = 'all_sisters') {
  const normalized = String(value || fallback).trim().toLowerCase();
  if (!VALID_SCOPE_TYPES.has(normalized)) {
    throw new ApiError(400, 'INVALID_PAYLOAD', `Invalid scope_type: ${value}`);
  }
  return normalized;
}

function normalizeSessionStatus(value) {
  const normalized = String(value || 'active').trim().toLowerCase();
  if (!VALID_SESSION_STATUSES.has(normalized)) {
    throw new ApiError(400, 'INVALID_PAYLOAD', `Invalid status: ${value}`);
  }
  return normalized;
}

function safeJsonParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function estimateTokens(text) {
  const raw = String(text || '');
  if (!raw) return 1;
  return Math.max(1, Math.ceil(raw.length / 4));
}

function loadCompactionConfig() {
  if (!fs.existsSync(OPENCLAW_CONFIG_PATH)) return compactionConfigCache.settings;

  try {
    const stat = fs.statSync(OPENCLAW_CONFIG_PATH);
    if (compactionConfigCache.mtimeMs === stat.mtimeMs) return compactionConfigCache.settings;

    const parsed = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG_PATH, 'utf8'));
    const configuredMode = String(parsed?.agents?.defaults?.compaction?.mode || DEFAULT_COMPACTION_MODE)
      .trim()
      .toLowerCase();
    const mode = configuredMode === 'off' ? 'off' : DEFAULT_COMPACTION_MODE;

    const configuredThreshold = Number(
      parsed?.agents?.defaults?.compaction?.memoryFlush?.softThresholdTokens
    );
    const threshold = Number.isFinite(configuredThreshold) && configuredThreshold > 0
      ? Math.floor(configuredThreshold)
      : DEFAULT_COMPACTION_THRESHOLD;

    compactionConfigCache = {
      mtimeMs: stat.mtimeMs,
      settings: {
        mode,
        threshold
      }
    };
  } catch {
    // Keep previous cache/defaults.
  }

  return compactionConfigCache.settings;
}

function parseMentions(content, sisters) {
  const sisterIds = Array.isArray(sisters) ? sisters.map((row) => String(row.id || '')) : [];
  const sisterMap = new Map(sisterIds.map((id) => [id.toLowerCase(), id]));
  const mentioned = [];
  const mentionedSet = new Set();
  let mentionAll = false;

  const regex = /(^|\s)@([a-z0-9_-]{2,64})/gi;
  let match;
  while ((match = regex.exec(String(content || '')))) {
    const tokenRaw = String(match[2] || '').trim();
    if (!tokenRaw) continue;
    const token = tokenRaw.toLowerCase();
    if (token === 'all' || token === 'sisters') {
      mentionAll = true;
      continue;
    }

    const sisterId = sisterMap.get(token);
    if (sisterId && !mentionedSet.has(sisterId)) {
      mentionedSet.add(sisterId);
      mentioned.push(sisterId);
    }
  }

  return {
    mention_all: mentionAll,
    sister_ids: mentioned
  };
}

function listSistersForRouting(db) {
  return db.prepare('SELECT id, display_name FROM sisters ORDER BY id').all();
}

function ensureSisterIdsExist(db, sisterIds) {
  const normalized = Array.from(
    new Set(
      (Array.isArray(sisterIds) ? sisterIds : [])
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  );
  if (!normalized.length) return [];

  const existsStmt = db.prepare('SELECT id FROM sisters WHERE id = ?');
  for (const sisterId of normalized) {
    const row = existsStmt.get(sisterId);
    if (!row) {
      throw new ApiError(404, 'SISTER_NOT_FOUND', `Unknown sister_id: ${sisterId}`);
    }
  }
  return normalized;
}

function ensureGroupExists(db, groupId) {
  const row = db.prepare('SELECT * FROM chat_groups WHERE id = ?').get(groupId);
  if (!row) {
    throw new ApiError(404, 'GROUP_NOT_FOUND', `Group not found: ${groupId}`);
  }
  return row;
}

function getGroupMemberIds(db, groupId) {
  return db
    .prepare(
      `
        SELECT sister_id
        FROM chat_group_members
        WHERE group_id = ?
        ORDER BY position ASC, sister_id ASC
      `
    )
    .all(groupId)
    .map((row) => row.sister_id);
}

function sessionRowToDto(row, db) {
  if (!row) return null;
  const memberIds = row.group_id ? getGroupMemberIds(db, row.group_id) : [];
  return {
    id: row.id,
    scope_type: row.scope_type,
    group_id: row.group_id || null,
    title: row.title || null,
    dispatch_mode_default: row.dispatch_mode_default,
    monitor_mode: row.monitor_mode,
    compaction_mode: row.compaction_mode,
    compaction_threshold_tokens: Number(row.compaction_threshold_tokens || 0),
    compacted_summary: row.compacted_summary || null,
    compacted_at: row.compacted_at || null,
    message_count: Number(row.message_count || 0),
    token_estimate: Number(row.token_estimate || 0),
    created_by: row.created_by,
    status: row.status,
    last_message_at: row.last_message_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    expires_at: row.expires_at,
    recipients: memberIds
  };
}

function groupRowToDto(row, db) {
  if (!row) return null;
  const members = db
    .prepare(
      `
        SELECT m.sister_id, s.display_name, m.position
        FROM chat_group_members m
        LEFT JOIN sisters s ON s.id = m.sister_id
        WHERE m.group_id = ?
        ORDER BY m.position ASC, m.sister_id ASC
      `
    )
    .all(row.id)
    .map((item) => ({
      sister_id: item.sister_id,
      display_name: item.display_name || item.sister_id,
      position: Number(item.position || 0)
    }));

  return {
    id: row.id,
    name: row.name,
    description: row.description || null,
    dispatch_mode_default: row.dispatch_mode_default,
    is_system: Boolean(row.is_system),
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    members
  };
}

function maybeCompactSession(db, sessionId) {
  const session = db
    .prepare(
      `
        SELECT id, compaction_mode, compaction_threshold_tokens, compacted_summary, token_estimate
        FROM chat_sessions
        WHERE id = ?
      `
    )
    .get(sessionId);
  if (!session) return null;
  if (session.compaction_mode !== 'safeguard') return null;

  const threshold = Math.max(2000, Number(session.compaction_threshold_tokens || DEFAULT_COMPACTION_THRESHOLD));
  const tokensNow = Number(session.token_estimate || 0);
  if (tokensNow < threshold) return null;

  const activeMessages = db
    .prepare(
      `
        SELECT id, role, actor, content, token_estimate, created_at
        FROM chat_messages
        WHERE session_id = ? AND is_compacted = 0
        ORDER BY created_at ASC
      `
    )
    .all(sessionId);
  if (activeMessages.length <= KEEP_RECENT_MESSAGES) return null;

  const compactedCandidates = activeMessages.slice(0, -KEEP_RECENT_MESSAGES);
  const retained = activeMessages.slice(-KEEP_RECENT_MESSAGES);
  if (!compactedCandidates.length) return null;

  const summaryLines = compactedCandidates
    .slice(-40)
    .map((item) => {
      const clean = String(item.content || '').replace(/\s+/g, ' ').trim().slice(0, 180);
      const who = item.actor || item.role || 'unknown';
      return `[${item.created_at}] ${who}: ${clean}`;
    });
  const summary = `Safeguard compaction snapshot:\n${summaryLines.join('\n')}`.slice(0, 9000);
  const now = nowIso();

  const mergedSummary = [session.compacted_summary, summary].filter(Boolean).join('\n\n').slice(-16000);
  const retainedTokens = retained.reduce(
    (acc, item) => acc + Number(item.token_estimate || estimateTokens(item.content)),
    0
  );
  const tokensAfter = retainedTokens + estimateTokens(mergedSummary);

  const markCompactedStmt = db.prepare('UPDATE chat_messages SET is_compacted = 1 WHERE id = ?');

  db.exec('BEGIN');
  try {
    for (const item of compactedCandidates) {
      markCompactedStmt.run(item.id);
    }

    db.prepare(
      `
        UPDATE chat_sessions
        SET compacted_summary = ?, compacted_at = ?, token_estimate = ?, updated_at = ?
        WHERE id = ?
      `
    ).run(mergedSummary, now, tokensAfter, now, sessionId);

    db.prepare(
      `
        INSERT INTO chat_compactions
        (id, session_id, summary, source_message_count, tokens_before, tokens_after, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      crypto.randomUUID(),
      sessionId,
      summary,
      compactedCandidates.length,
      tokensNow,
      tokensAfter,
      now
    );

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return {
    compacted: true,
    source_message_count: compactedCandidates.length,
    tokens_before: tokensNow,
    tokens_after: tokensAfter,
    compacted_at: now
  };
}

export function pruneChatRetention() {
  const db = getDb();
  const now = nowIso();

  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM chat_dispatches WHERE expires_at <= ?').run(now);
    db.prepare('DELETE FROM chat_messages WHERE expires_at <= ?').run(now);
    db.prepare('DELETE FROM chat_sessions WHERE expires_at <= ?').run(now);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return { ok: true, pruned_at: now, retention_days: CHAT_RETENTION_DAYS };
}

export function listChatGroups() {
  pruneChatRetention();
  const db = getDb();
  const rows = db.prepare('SELECT * FROM chat_groups ORDER BY is_system DESC, name ASC').all();
  return {
    items: rows.map((row) => groupRowToDto(row, db))
  };
}

export function createChatGroup(input, actor = 'operator') {
  pruneChatRetention();
  const db = getDb();
  const now = nowIso();

  const name = normalizeString(input?.name);
  if (!name) {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'Group name is required');
  }

  const description = normalizeString(input?.description);
  const dispatchMode = normalizeDispatchMode(input?.dispatch_mode_default || 'parallel', 'parallel');
  const memberIds = ensureSisterIdsExist(db, input?.sister_ids || []);
  if (!memberIds.length) {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'Group must include at least one sister being');
  }

  const groupId = crypto.randomUUID();
  const insertMemberStmt = db.prepare(
    `
      INSERT INTO chat_group_members (id, group_id, sister_id, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  );

  db.exec('BEGIN');
  try {
    db.prepare(
      `
        INSERT INTO chat_groups
        (id, name, description, dispatch_mode_default, is_system, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, 0, ?, ?, ?)
      `
    ).run(groupId, name, description, dispatchMode, String(actor || 'operator').trim() || 'operator', now, now);

    for (let index = 0; index < memberIds.length; index += 1) {
      insertMemberStmt.run(crypto.randomUUID(), groupId, memberIds[index], index, now, now);
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return getChatGroup(groupId);
}

export function getChatGroup(groupId) {
  pruneChatRetention();
  const db = getDb();
  const row = db.prepare('SELECT * FROM chat_groups WHERE id = ?').get(groupId);
  if (!row) return null;
  return groupRowToDto(row, db);
}

export function updateChatGroupMembers(groupId, input, actor = 'operator') {
  pruneChatRetention();
  const db = getDb();
  const now = nowIso();
  const group = ensureGroupExists(db, groupId);
  if (group.is_system) {
    throw new ApiError(400, 'INVALID_OPERATION', 'System groups cannot be edited');
  }

  const name = normalizeString(input?.name);
  const description = input?.description === undefined ? undefined : normalizeString(input?.description);
  const dispatchMode = input?.dispatch_mode_default
    ? normalizeDispatchMode(input.dispatch_mode_default, group.dispatch_mode_default || 'parallel')
    : group.dispatch_mode_default || 'parallel';
  const memberIds = ensureSisterIdsExist(db, input?.sister_ids || []);
  if (!memberIds.length) {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'Group must include at least one sister being');
  }

  const insertMemberStmt = db.prepare(
    `
      INSERT INTO chat_group_members (id, group_id, sister_id, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  );

  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM chat_group_members WHERE group_id = ?').run(groupId);
    for (let index = 0; index < memberIds.length; index += 1) {
      insertMemberStmt.run(crypto.randomUUID(), groupId, memberIds[index], index, now, now);
    }

    db.prepare(
      `
        UPDATE chat_groups
        SET name = ?, description = ?, dispatch_mode_default = ?, updated_at = ?, created_by = ?
        WHERE id = ?
      `
    ).run(
      name || group.name,
      description === undefined ? group.description : description,
      dispatchMode,
      now,
      String(actor || 'operator').trim() || 'operator',
      groupId
    );
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  return getChatGroup(groupId);
}

export function listChatSessions({ scopeType = null, groupId = null, status = 'active', limit = 120 } = {}) {
  pruneChatRetention();
  const db = getDb();
  const now = nowIso();
  const boundedLimit = Math.min(Math.max(Number(limit) || 120, 1), 400);
  const normalizedStatus = normalizeSessionStatus(status || 'active');

  const clauses = ['status = ?', 'expires_at > ?'];
  const params = [normalizedStatus, now];

  if (scopeType) {
    clauses.push('scope_type = ?');
    params.push(normalizeScopeType(scopeType));
  }
  if (groupId) {
    ensureGroupExists(db, groupId);
    clauses.push('group_id = ?');
    params.push(groupId);
  }

  const rows = db
    .prepare(
      `
        SELECT *
        FROM chat_sessions
        WHERE ${clauses.join(' AND ')}
        ORDER BY updated_at DESC
        LIMIT ?
      `
    )
    .all(...params, boundedLimit);

  return {
    items: rows.map((row) => sessionRowToDto(row, db)),
    limit: boundedLimit
  };
}

export function createChatSession(input, actor = 'operator') {
  pruneChatRetention();
  const db = getDb();
  const now = nowIso();
  const expiresAt = addDaysIso(now, CHAT_RETENTION_DAYS);

  const scopeType = normalizeScopeType(input?.scope_type, 'all_sisters');
  const dispatchMode = normalizeDispatchMode(input?.dispatch_mode_default || 'parallel', 'parallel');
  const title = normalizeString(input?.title);
  const createdBy = String(actor || 'operator').trim() || 'operator';
  const groupId = scopeType === 'group' ? normalizeString(input?.group_id) : null;

  if (scopeType === 'group') {
    if (!groupId) {
      throw new ApiError(400, 'INVALID_PAYLOAD', 'group_id is required for group scope sessions');
    }
    const group = ensureGroupExists(db, groupId);
    const members = getGroupMemberIds(db, groupId);
    if (!members.length) {
      throw new ApiError(400, 'INVALID_PAYLOAD', 'Group has no members');
    }
    if (!input?.dispatch_mode_default) {
      // Default group sessions to group preference when caller does not override.
      // Since we already normalized dispatch mode above, only override on empty input.
      // eslint-disable-next-line no-param-reassign
      input = { ...input, dispatch_mode_default: group.dispatch_mode_default || 'parallel' };
    }
  }

  const compaction = loadCompactionConfig();
  const sessionId = crypto.randomUUID();
  const effectiveDispatchMode = normalizeDispatchMode(input?.dispatch_mode_default || dispatchMode, dispatchMode);

  db.prepare(
    `
      INSERT INTO chat_sessions
      (
        id, scope_type, group_id, title, dispatch_mode_default, monitor_mode,
        compaction_mode, compaction_threshold_tokens, compacted_summary, compacted_at,
        message_count, token_estimate, created_by, status, last_message_at,
        created_at, updated_at, expires_at
      )
      VALUES (?, ?, ?, ?, ?, 'monitor_only', ?, ?, NULL, NULL, 0, 0, ?, 'active', NULL, ?, ?, ?)
    `
  ).run(
    sessionId,
    scopeType,
    groupId,
    title,
    effectiveDispatchMode,
    compaction.mode,
    compaction.threshold,
    createdBy,
    now,
    now,
    expiresAt
  );

  return getChatSession(sessionId);
}

export function getChatSession(sessionId) {
  pruneChatRetention();
  const db = getDb();
  const row = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
  if (!row) return null;
  return sessionRowToDto(row, db);
}

function sessionRecipients(db, session) {
  if (session.scope_type === 'group') {
    if (!session.group_id) return [];
    return getGroupMemberIds(db, session.group_id);
  }
  return listSistersForRouting(db).map((item) => item.id);
}

export function listChatMessages(sessionId, { limit = 160, includeCompacted = true } = {}) {
  pruneChatRetention();
  const db = getDb();
  const session = getChatSession(sessionId);
  if (!session) {
    throw new ApiError(404, 'CHAT_SESSION_NOT_FOUND', `Chat session not found: ${sessionId}`);
  }

  const boundedLimit = Math.min(Math.max(Number(limit) || 160, 1), 500);
  const compactedClause = includeCompacted ? '' : 'AND is_compacted = 0';
  const rows = db
    .prepare(
      `
        SELECT *
        FROM chat_messages
        WHERE session_id = ?
          ${compactedClause}
        ORDER BY created_at DESC
        LIMIT ?
      `
    )
    .all(sessionId, boundedLimit);

  return {
    session,
    items: rows.map((row) => ({
      id: row.id,
      session_id: row.session_id,
      role: row.role,
      actor: row.actor,
      content: row.content,
      mentions: safeJsonParse(row.mentions_json) || { mention_all: false, sister_ids: [] },
      dispatch_mode: row.dispatch_mode || null,
      meta: safeJsonParse(row.meta_json),
      token_estimate: Number(row.token_estimate || 0),
      is_compacted: Boolean(row.is_compacted),
      created_at: row.created_at,
      expires_at: row.expires_at
    })),
    limit: boundedLimit
  };
}

export function listChatDispatches(sessionId, { limit = 200 } = {}) {
  pruneChatRetention();
  const db = getDb();
  const session = getChatSession(sessionId);
  if (!session) {
    throw new ApiError(404, 'CHAT_SESSION_NOT_FOUND', `Chat session not found: ${sessionId}`);
  }

  const boundedLimit = Math.min(Math.max(Number(limit) || 200, 1), 500);
  const rows = db
    .prepare(
      `
        SELECT d.*, s.display_name AS sister_name
        FROM chat_dispatches d
        LEFT JOIN sisters s ON s.id = d.sister_id
        WHERE d.session_id = ?
        ORDER BY d.created_at DESC, COALESCE(d.sequence_index, 0) ASC
        LIMIT ?
      `
    )
    .all(sessionId, boundedLimit);

  return {
    session,
    items: rows.map((row) => ({
      id: row.id,
      session_id: row.session_id,
      message_id: row.message_id,
      sister_id: row.sister_id,
      sister_name: row.sister_name || row.sister_id,
      dispatch_mode: row.dispatch_mode,
      sequence_index: row.sequence_index === null || row.sequence_index === undefined ? null : Number(row.sequence_index),
      status: row.status,
      note: row.note || null,
      metadata: safeJsonParse(row.metadata_json),
      created_at: row.created_at,
      updated_at: row.updated_at,
      expires_at: row.expires_at
    })),
    limit: boundedLimit
  };
}

export function createChatMessage(sessionId, input, actor = 'operator') {
  pruneChatRetention();
  const db = getDb();
  const now = nowIso();

  const sessionRow = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(sessionId);
  if (!sessionRow) {
    throw new ApiError(404, 'CHAT_SESSION_NOT_FOUND', `Chat session not found: ${sessionId}`);
  }
  if (sessionRow.status !== 'active') {
    throw new ApiError(400, 'INVALID_OPERATION', `Chat session is not active: ${sessionId}`);
  }
  if (String(sessionRow.expires_at || '') <= now) {
    throw new ApiError(410, 'CHAT_SESSION_EXPIRED', `Chat session expired: ${sessionId}`);
  }

  const content = String(input?.content || '').trim();
  if (!content) {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'Message content is required');
  }

  const dispatchMode = normalizeDispatchMode(
    input?.dispatch_mode || sessionRow.dispatch_mode_default || 'parallel',
    sessionRow.dispatch_mode_default || 'parallel'
  );
  const sisters = listSistersForRouting(db);
  if (!sisters.length) {
    throw new ApiError(400, 'INVALID_OPERATION', 'No sister beings available for routing');
  }

  const mentions = parseMentions(content, sisters);
  const scopedRecipients = sessionRecipients(db, sessionRow);
  if (!scopedRecipients.length) {
    throw new ApiError(400, 'INVALID_OPERATION', 'No recipients configured for session scope');
  }

  const scopedRecipientSet = new Set(scopedRecipients);
  const requestedMentions = mentions.sister_ids || [];
  let recipients = [];
  if (mentions.mention_all) {
    recipients = scopedRecipients.slice();
  } else if (requestedMentions.length) {
    recipients = requestedMentions.filter((id) => scopedRecipientSet.has(id));
  } else {
    recipients = scopedRecipients.slice();
  }

  recipients = Array.from(new Set(recipients));
  if (!recipients.length) {
    throw new ApiError(
      400,
      'INVALID_PAYLOAD',
      'No valid recipients in this session scope. Use mentions that belong to the selected scope.'
    );
  }

  const excludedMentions = requestedMentions.filter((id) => !scopedRecipientSet.has(id));
  const expiresAt = addDaysIso(now, CHAT_RETENTION_DAYS);
  const operatorActor = String(actor || 'operator').trim() || 'operator';

  const messageId = crypto.randomUUID();
  const tokenEstimate = estimateTokens(content);
  const mentionsPayload = JSON.stringify({
    mention_all: mentions.mention_all,
    sister_ids: requestedMentions,
    excluded_sister_ids: excludedMentions
  });

  const insertDispatchStmt = db.prepare(
    `
      INSERT INTO chat_dispatches
      (id, session_id, message_id, sister_id, dispatch_mode, sequence_index, status, note, metadata_json, created_at, updated_at, expires_at)
      VALUES (?, ?, ?, ?, ?, ?, 'monitor_only', ?, ?, ?, ?, ?)
    `
  );

  const dispatches = [];
  const systemContent = `Monitor-only dispatch prepared for ${recipients.length} sister(s): ${recipients.join(', ')}.`;
  const systemMessageId = crypto.randomUUID();
  const systemTokenEstimate = estimateTokens(systemContent);

  db.exec('BEGIN');
  try {
    db.prepare(
      `
        INSERT INTO chat_messages
        (id, session_id, role, actor, content, mentions_json, dispatch_mode, meta_json, token_estimate, is_compacted, created_at, expires_at)
        VALUES (?, ?, 'operator', ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `
    ).run(
      messageId,
      sessionId,
      operatorActor,
      content,
      mentionsPayload,
      dispatchMode,
      JSON.stringify({ monitor_only: true }),
      tokenEstimate,
      now,
      expiresAt
    );

    for (let index = 0; index < recipients.length; index += 1) {
      const sisterId = recipients[index];
      const sequenceIndex = dispatchMode === 'ordered' ? index + 1 : null;
      const dispatchId = crypto.randomUUID();
      const metadata = {
        monitor_only: true,
        requested_by: operatorActor,
        excluded_mentions: excludedMentions
      };
      insertDispatchStmt.run(
        dispatchId,
        sessionId,
        messageId,
        sisterId,
        dispatchMode,
        sequenceIndex,
        'Monitor-only phase: dispatch not executed in runtime yet.',
        JSON.stringify(metadata),
        now,
        now,
        expiresAt
      );

      dispatches.push({
        id: dispatchId,
        session_id: sessionId,
        message_id: messageId,
        sister_id: sisterId,
        dispatch_mode: dispatchMode,
        sequence_index: sequenceIndex,
        status: 'monitor_only',
        created_at: now,
        updated_at: now,
        expires_at: expiresAt
      });
    }

    db.prepare(
      `
        INSERT INTO chat_messages
        (id, session_id, role, actor, content, mentions_json, dispatch_mode, meta_json, token_estimate, is_compacted, created_at, expires_at)
        VALUES (?, ?, 'system', 'dispatcher', ?, ?, ?, ?, ?, 0, ?, ?)
      `
    ).run(
      systemMessageId,
      sessionId,
      systemContent,
      JSON.stringify({ mention_all: false, sister_ids: recipients }),
      dispatchMode,
      JSON.stringify({ monitor_only: true, source_message_id: messageId }),
      systemTokenEstimate,
      now,
      expiresAt
    );

    const totalTokenDelta = tokenEstimate + systemTokenEstimate;
    db.prepare(
      `
        UPDATE chat_sessions
        SET
          message_count = COALESCE(message_count, 0) + 2,
          token_estimate = COALESCE(token_estimate, 0) + ?,
          last_message_at = ?,
          updated_at = ?,
          expires_at = ?
        WHERE id = ?
      `
    ).run(totalTokenDelta, now, now, expiresAt, sessionId);

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }

  const compaction = maybeCompactSession(db, sessionId);
  return {
    ok: true,
    session: getChatSession(sessionId),
    message: {
      id: messageId,
      session_id: sessionId,
      role: 'operator',
      actor: operatorActor,
      content,
      mentions: safeJsonParse(mentionsPayload),
      dispatch_mode: dispatchMode,
      token_estimate: tokenEstimate,
      is_compacted: false,
      created_at: now,
      expires_at: expiresAt
    },
    system_message: {
      id: systemMessageId,
      session_id: sessionId,
      role: 'system',
      actor: 'dispatcher',
      content: systemContent,
      dispatch_mode: dispatchMode,
      token_estimate: systemTokenEstimate,
      is_compacted: false,
      created_at: now,
      expires_at: expiresAt
    },
    dispatches,
    compaction
  };
}

export function getChatBootstrap(limit = 120) {
  pruneChatRetention();
  const db = getDb();
  const sisters = listSistersForRouting(db).map((item) => ({
    id: item.id,
    display_name: item.display_name || item.id
  }));
  const groups = listChatGroups().items;
  const sessions = listChatSessions({ limit }).items;

  return {
    sisters,
    groups,
    sessions,
    settings: {
      retention_days: CHAT_RETENTION_DAYS,
      monitor_mode: 'monitor_only',
      compaction: loadCompactionConfig()
    }
  };
}
