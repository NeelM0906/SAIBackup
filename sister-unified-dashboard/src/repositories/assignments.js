import crypto from 'node:crypto';

import { getDb } from '../db.js';

const VALID_PRIORITIES = new Set(['low', 'normal', 'high', 'critical']);
const VALID_STATUSES = new Set(['inbox', 'in_progress', 'blocked', 'completed', 'rework', 'cancelled']);
const STATUS_TRANSITIONS = {
  inbox: new Set(['in_progress', 'blocked', 'cancelled']),
  in_progress: new Set(['completed', 'blocked', 'rework', 'cancelled']),
  blocked: new Set(['in_progress', 'cancelled']),
  rework: new Set(['in_progress', 'blocked', 'cancelled']),
  completed: new Set(['rework']),
  cancelled: new Set([])
};

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function windowStartIso(days) {
  const boundedDays = Math.max(Number(days) || 1, 1);
  return new Date(Date.now() - boundedDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .replace(/\.\d{3}Z$/, 'Z');
}

function normalizeNullableString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : null;
}

function isConstraintError(error) {
  return (
    String(error?.code || '').includes('SQLITE_CONSTRAINT') ||
    Number(error?.errcode || 0) === 2067 ||
    String(error?.message || '').includes('UNIQUE constraint failed')
  );
}

function validateStatus(status) {
  if (!VALID_STATUSES.has(status)) {
    throw new ApiError(400, 'INVALID_PAYLOAD', `Invalid status: ${status}`);
  }
}

function validatePriority(priority) {
  if (!VALID_PRIORITIES.has(priority)) {
    throw new ApiError(400, 'INVALID_PAYLOAD', `Invalid priority: ${priority}`);
  }
}

function ensureSisterExists(db, sisterId) {
  const row = db.prepare('SELECT id FROM sisters WHERE id = ?').get(sisterId);
  if (!row) {
    throw new ApiError(404, 'SISTER_NOT_FOUND', `Unknown sister_id: ${sisterId}`);
  }
}

function assignmentRowToDto(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    owner_sister_id: row.owner_sister_id,
    created_by: row.created_by,
    priority: row.priority,
    status: row.status,
    task_key: row.task_key,
    source_channel: row.source_channel,
    due_at: row.due_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at,
    archived_at: row.archived_at
  };
}

function insertAssignmentEvent(db, event) {
  db.prepare(
    `
      INSERT INTO assignment_events
      (id, assignment_id, event_type, from_status, to_status, actor, note, metadata_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    crypto.randomUUID(),
    event.assignment_id,
    event.event_type,
    event.from_status || null,
    event.to_status || null,
    event.actor,
    event.note || null,
    event.metadata_json || null,
    event.created_at || nowIso()
  );
}

function insertAuditEntry(db, entry) {
  db.prepare(
    `
      INSERT INTO audit_ledger (id, entity_type, entity_id, action, actor, reason, details_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    crypto.randomUUID(),
    entry.entity_type,
    entry.entity_id,
    entry.action,
    entry.actor,
    entry.reason || null,
    entry.details_json || null,
    entry.created_at || nowIso()
  );
}

export function getAssignment(assignmentId) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId);
  return assignmentRowToDto(row);
}

export function listAssignments({ status, ownerSisterId, days = 7, limit = 300 } = {}) {
  const db = getDb();

  const clauses = ["COALESCE(archived_at, '') = ''", 'updated_at >= ?'];
  const params = [windowStartIso(days)];

  if (status) {
    validateStatus(status);
    clauses.push('status = ?');
    params.push(status);
  }

  if (ownerSisterId) {
    clauses.push('owner_sister_id = ?');
    params.push(ownerSisterId);
  }

  const boundedLimit = Math.min(Math.max(Number(limit) || 300, 1), 2000);
  const sql = `
    SELECT *
    FROM assignments
    WHERE ${clauses.join(' AND ')}
    ORDER BY updated_at DESC
    LIMIT ?
  `;

  const items = db.prepare(sql).all(...params, boundedLimit).map(assignmentRowToDto);

  const totalCount = Number(
    db
      .prepare(
        `
          SELECT COUNT(*) AS c
          FROM assignments
          WHERE ${clauses.join(' AND ')}
        `
      )
      .get(...params)?.c || 0
  );

  const counts = db
    .prepare(
      `
        SELECT status, COUNT(*) AS count
        FROM assignments
        WHERE COALESCE(archived_at, '') = ''
        GROUP BY status
      `
    )
    .all()
    .reduce((acc, row) => {
      acc[row.status] = Number(row.count || 0);
      return acc;
    }, {});

  return {
    items,
    counts,
    limit: boundedLimit,
    window_days: Math.max(Number(days) || 1, 1),
    total_count: totalCount,
    has_more: totalCount > items.length
  };
}

export function getAssignmentEvents(assignmentId, limit = 200) {
  const db = getDb();
  const boundedLimit = Math.min(Math.max(Number(limit) || 200, 1), 500);

  const items = db
    .prepare(
      `
        SELECT id, assignment_id, event_type, from_status, to_status, actor, note, metadata_json, created_at
        FROM assignment_events
        WHERE assignment_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `
    )
    .all(assignmentId, boundedLimit)
    .map((row) => ({
      ...row,
      metadata_json: safeJsonParse(row.metadata_json)
    }));

  return { items, limit: boundedLimit };
}

function safeJsonParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function createAssignment(input, actor = 'operator') {
  const db = getDb();
  const now = nowIso();

  const title = String(input?.title || '').trim();
  if (!title) {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'title is required');
  }

  const ownerSisterId = String(input?.owner_sister_id || '').trim();
  if (!ownerSisterId) {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'owner_sister_id is required');
  }

  const priority = String(input?.priority || 'normal').trim();
  validatePriority(priority);

  const assignment = {
    id: crypto.randomUUID(),
    title,
    description: normalizeNullableString(input?.description) ?? null,
    owner_sister_id: ownerSisterId,
    created_by: String(input?.created_by || actor).trim() || actor,
    priority,
    status: 'inbox',
    task_key: normalizeNullableString(input?.task_key) ?? null,
    source_channel: normalizeNullableString(input?.source_channel) ?? null,
    due_at: normalizeNullableString(input?.due_at) ?? null,
    created_at: now,
    updated_at: now,
    completed_at: null,
    archived_at: null
  };

  db.exec('BEGIN');
  try {
    ensureSisterExists(db, assignment.owner_sister_id);

    db.prepare(
      `
        INSERT INTO assignments
          (id, title, description, owner_sister_id, created_by, priority, status, task_key, source_channel, due_at, created_at, updated_at, completed_at, archived_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      assignment.id,
      assignment.title,
      assignment.description,
      assignment.owner_sister_id,
      assignment.created_by,
      assignment.priority,
      assignment.status,
      assignment.task_key,
      assignment.source_channel,
      assignment.due_at,
      assignment.created_at,
      assignment.updated_at,
      assignment.completed_at,
      assignment.archived_at
    );

    insertAssignmentEvent(db, {
      assignment_id: assignment.id,
      event_type: 'created',
      actor,
      note: assignment.description,
      metadata_json: JSON.stringify({
        priority: assignment.priority,
        owner_sister_id: assignment.owner_sister_id,
        task_key: assignment.task_key
      }),
      created_at: now
    });

    insertAuditEntry(db, {
      entity_type: 'assignment',
      entity_id: assignment.id,
      action: 'created',
      actor,
      details_json: JSON.stringify({
        status: assignment.status,
        owner_sister_id: assignment.owner_sister_id,
        priority: assignment.priority
      }),
      created_at: now
    });

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    if (isConstraintError(error)) {
      throw new ApiError(409, 'TASK_KEY_CONFLICT', 'task_key already exists');
    }
    throw error;
  }

  return getAssignment(assignment.id);
}

export function updateAssignment(assignmentId, patch, actor = 'operator') {
  const db = getDb();
  const current = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId);
  if (!current) {
    throw new ApiError(404, 'ASSIGNMENT_NOT_FOUND', `Assignment not found: ${assignmentId}`);
  }

  const updates = {};
  const events = [];

  if (patch.title !== undefined) {
    const title = String(patch.title || '').trim();
    if (!title) {
      throw new ApiError(400, 'INVALID_PAYLOAD', 'title cannot be empty');
    }
    if (title !== current.title) {
      updates.title = title;
    }
  }

  if (patch.description !== undefined) {
    const description = normalizeNullableString(patch.description);
    if (description !== current.description) {
      updates.description = description;
    }
  }

  if (patch.owner_sister_id !== undefined) {
    const owner = String(patch.owner_sister_id || '').trim();
    if (!owner) {
      throw new ApiError(400, 'INVALID_PAYLOAD', 'owner_sister_id cannot be empty');
    }
    if (owner !== current.owner_sister_id) {
      ensureSisterExists(db, owner);
      updates.owner_sister_id = owner;
      events.push({
        event_type: 'owner_changed',
        actor,
        note: `${current.owner_sister_id} -> ${owner}`,
        metadata_json: JSON.stringify({ from: current.owner_sister_id, to: owner })
      });
    }
  }

  if (patch.priority !== undefined) {
    const priority = String(patch.priority || '').trim();
    validatePriority(priority);
    if (priority !== current.priority) {
      updates.priority = priority;
    }
  }

  if (patch.due_at !== undefined) {
    const dueAt = normalizeNullableString(patch.due_at);
    if (dueAt !== current.due_at) {
      updates.due_at = dueAt;
    }
  }

  if (patch.task_key !== undefined) {
    const taskKey = normalizeNullableString(patch.task_key);
    if (taskKey !== current.task_key) {
      updates.task_key = taskKey;
    }
  }

  if (patch.status !== undefined) {
    const nextStatus = String(patch.status || '').trim();
    validateStatus(nextStatus);

    if (nextStatus !== current.status) {
      const allowed = STATUS_TRANSITIONS[current.status] || new Set();
      if (!allowed.has(nextStatus)) {
        throw new ApiError(
          400,
          'INVALID_TRANSITION',
          `Invalid transition from ${current.status} to ${nextStatus}`
        );
      }

      updates.status = nextStatus;
      updates.completed_at = nextStatus === 'completed' ? nowIso() : null;
      events.push({
        event_type: 'status_changed',
        actor,
        from_status: current.status,
        to_status: nextStatus,
        note: patch.note ? String(patch.note).slice(0, 1000) : null,
        metadata_json: JSON.stringify({ from: current.status, to: nextStatus })
      });
    }
  }

  const changedKeys = Object.keys(updates);
  if (!changedKeys.length) {
    return assignmentRowToDto(current);
  }

  updates.updated_at = nowIso();
  const setClause = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');

  db.exec('BEGIN');
  try {
    db.prepare(`UPDATE assignments SET ${setClause} WHERE id = ?`).run(
      ...Object.values(updates),
      assignmentId
    );

    for (const event of events) {
      insertAssignmentEvent(db, {
        assignment_id: assignmentId,
        ...event,
        created_at: updates.updated_at
      });
    }

    const genericChanges = changedKeys.filter((key) => !['status', 'owner_sister_id'].includes(key));
    if (genericChanges.length) {
      insertAssignmentEvent(db, {
        assignment_id: assignmentId,
        event_type: 'updated',
        actor,
        metadata_json: JSON.stringify({ keys: genericChanges }),
        created_at: updates.updated_at
      });
    }

    insertAuditEntry(db, {
      entity_type: 'assignment',
      entity_id: assignmentId,
      action: 'updated',
      actor,
      details_json: JSON.stringify({ changed_keys: changedKeys }),
      created_at: updates.updated_at
    });

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    if (isConstraintError(error)) {
      throw new ApiError(409, 'TASK_KEY_CONFLICT', 'task_key already exists');
    }
    throw error;
  }

  return getAssignment(assignmentId);
}
