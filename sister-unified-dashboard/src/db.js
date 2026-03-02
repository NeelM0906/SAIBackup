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
    }
  ];

  const version = currentSchemaVersion(database);
  for (const migration of migrations) {
    if (migration.version > version) {
      runMigration(database, migration);
    }
  }
}
