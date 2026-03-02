import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { DB_PATH } from './config.js';

let db;

export function getDb() {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode=WAL;');
  }
  return db;
}

export function initDb() {
  const database = getDb();
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sisters (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      workspace TEXT,
      model_primary TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      sister_id TEXT NOT NULL,
      started_at TEXT,
      last_event_at TEXT,
      cwd TEXT,
      source_file TEXT,
      event_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      event_uid TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sister_id TEXT NOT NULL,
      event_id TEXT,
      event_type TEXT NOT NULL,
      role TEXT,
      content_type TEXT,
      tool_name TEXT,
      summary TEXT,
      ts TEXT,
      raw_json TEXT,
      source_file TEXT,
      source_offset INTEGER,
      ingested_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS file_offsets (
      file_path TEXT PRIMARY KEY,
      sister_id TEXT NOT NULL,
      offset INTEGER NOT NULL,
      mtime REAL NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
    CREATE INDEX IF NOT EXISTS idx_events_sister_ts ON events(sister_id, ts);
    CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_sister_last ON sessions(sister_id, last_event_at);
  `);

  runMigrations(database);
}

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function currentSchemaVersion(database) {
  const row = database.prepare('SELECT COALESCE(MAX(version), 0) AS v FROM schema_migrations').get();
  return Number(row?.v || 0);
}

function runMigration(database, migration) {
  database.exec('BEGIN');
  try {
    database.exec(migration.sql);
    database
      .prepare('INSERT INTO schema_migrations(version, name, applied_at) VALUES (?, ?, ?)')
      .run(migration.version, migration.name, nowIso());
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function runMigrations(database) {
  const migrations = [
    {
      version: 2,
      name: 'phase_2_1_assignments_schema',
      sql: `
        CREATE TABLE IF NOT EXISTS assignments (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          owner_sister_id TEXT NOT NULL,
          created_by TEXT NOT NULL,
          priority TEXT NOT NULL DEFAULT 'normal',
          status TEXT NOT NULL DEFAULT 'inbox',
          task_key TEXT,
          source_channel TEXT,
          due_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          completed_at TEXT,
          archived_at TEXT,
          CHECK(priority IN ('low', 'normal', 'high', 'critical')),
          CHECK(status IN ('inbox', 'in_progress', 'blocked', 'completed', 'rework', 'cancelled'))
        );

        CREATE TABLE IF NOT EXISTS assignment_events (
          id TEXT PRIMARY KEY,
          assignment_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          from_status TEXT,
          to_status TEXT,
          actor TEXT NOT NULL,
          note TEXT,
          metadata_json TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS work_items (
          id TEXT PRIMARY KEY,
          sister_id TEXT NOT NULL,
          assignment_id TEXT,
          session_id TEXT,
          work_type TEXT NOT NULL,
          state TEXT NOT NULL,
          title TEXT,
          summary TEXT,
          confidence REAL NOT NULL DEFAULT 0.0,
          occurred_at TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          CHECK(state IN ('in_progress', 'completed', 'blocked'))
        );

        CREATE TABLE IF NOT EXISTS work_evidence (
          id TEXT PRIMARY KEY,
          work_item_id TEXT NOT NULL,
          evidence_type TEXT NOT NULL,
          event_uid TEXT,
          file_path TEXT,
          snippet TEXT,
          tool_name TEXT,
          metadata_json TEXT,
          occurred_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_ledger (
          id TEXT PRIMARY KEY,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          action TEXT NOT NULL,
          actor TEXT NOT NULL,
          reason TEXT,
          details_json TEXT,
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_assignments_owner_status_updated
          ON assignments(owner_sister_id, status, updated_at);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_assignments_task_key_unique
          ON assignments(task_key)
          WHERE task_key IS NOT NULL AND task_key <> '';
        CREATE INDEX IF NOT EXISTS idx_assignment_events_assignment_created
          ON assignment_events(assignment_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_work_items_sister_state_time
          ON work_items(sister_id, state, occurred_at);
        CREATE INDEX IF NOT EXISTS idx_work_items_assignment_time
          ON work_items(assignment_id, occurred_at);
        CREATE INDEX IF NOT EXISTS idx_work_evidence_work_item_time
          ON work_evidence(work_item_id, occurred_at);
        CREATE INDEX IF NOT EXISTS idx_audit_ledger_entity_time
          ON audit_ledger(entity_type, entity_id, created_at);
      `
    },
    {
      version: 3,
      name: 'phase_2_2_chat_groups_sessions',
      sql: `
        CREATE TABLE IF NOT EXISTS chat_groups (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          dispatch_mode_default TEXT NOT NULL DEFAULT 'parallel',
          is_system INTEGER NOT NULL DEFAULT 0,
          created_by TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          CHECK(dispatch_mode_default IN ('parallel', 'ordered'))
        );

        CREATE TABLE IF NOT EXISTS chat_group_members (
          id TEXT PRIMARY KEY,
          group_id TEXT NOT NULL,
          sister_id TEXT NOT NULL,
          position INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(group_id, sister_id)
        );

        CREATE TABLE IF NOT EXISTS chat_sessions (
          id TEXT PRIMARY KEY,
          scope_type TEXT NOT NULL,
          group_id TEXT,
          title TEXT,
          dispatch_mode_default TEXT NOT NULL DEFAULT 'parallel',
          monitor_mode TEXT NOT NULL DEFAULT 'monitor_only',
          compaction_mode TEXT NOT NULL DEFAULT 'safeguard',
          compaction_threshold_tokens INTEGER NOT NULL DEFAULT 9000,
          compacted_summary TEXT,
          compacted_at TEXT,
          message_count INTEGER NOT NULL DEFAULT 0,
          token_estimate INTEGER NOT NULL DEFAULT 0,
          created_by TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          last_message_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          CHECK(scope_type IN ('all_sisters', 'group')),
          CHECK(dispatch_mode_default IN ('parallel', 'ordered')),
          CHECK(monitor_mode IN ('monitor_only')),
          CHECK(compaction_mode IN ('safeguard', 'off')),
          CHECK(status IN ('active', 'archived'))
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          role TEXT NOT NULL,
          actor TEXT NOT NULL,
          content TEXT NOT NULL,
          mentions_json TEXT,
          dispatch_mode TEXT,
          meta_json TEXT,
          token_estimate INTEGER NOT NULL DEFAULT 0,
          is_compacted INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          CHECK(role IN ('operator', 'system', 'assistant'))
        );

        CREATE TABLE IF NOT EXISTS chat_dispatches (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          message_id TEXT NOT NULL,
          sister_id TEXT NOT NULL,
          dispatch_mode TEXT NOT NULL,
          sequence_index INTEGER,
          status TEXT NOT NULL DEFAULT 'monitor_only',
          note TEXT,
          metadata_json TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          CHECK(dispatch_mode IN ('parallel', 'ordered')),
          CHECK(status IN ('queued', 'monitor_only', 'sent', 'acked', 'failed'))
        );

        CREATE TABLE IF NOT EXISTS chat_compactions (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL,
          summary TEXT NOT NULL,
          source_message_count INTEGER NOT NULL DEFAULT 0,
          tokens_before INTEGER NOT NULL DEFAULT 0,
          tokens_after INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_chat_groups_name
          ON chat_groups(name);
        CREATE INDEX IF NOT EXISTS idx_chat_group_members_group
          ON chat_group_members(group_id, position);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_scope_updated
          ON chat_sessions(scope_type, group_id, updated_at);
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_expires
          ON chat_sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
          ON chat_messages(session_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_session_compacted
          ON chat_messages(session_id, is_compacted, created_at);
        CREATE INDEX IF NOT EXISTS idx_chat_dispatches_session_created
          ON chat_dispatches(session_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_chat_dispatches_message
          ON chat_dispatches(message_id);
        CREATE INDEX IF NOT EXISTS idx_chat_dispatches_expires
          ON chat_dispatches(expires_at);
        CREATE INDEX IF NOT EXISTS idx_chat_compactions_session_created
          ON chat_compactions(session_id, created_at);
      `
    }
  ];

  const version = currentSchemaVersion(database);
  for (const migration of migrations) {
    if (migration.version > version) {
      runMigration(database, migration);
    }
  }
}
