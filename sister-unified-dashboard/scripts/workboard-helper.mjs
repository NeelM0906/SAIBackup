#!/usr/bin/env node

const API_BASE = process.env.WORKBOARD_API_BASE || 'http://127.0.0.1:5077';
const DEFAULT_OWNER = process.env.WORKBOARD_OWNER || 'main';
const DEFAULT_ACTOR = process.env.WORKBOARD_ACTOR || 'codex';
const DEFAULT_DAYS = 7;
const DEFAULT_LIMIT = 300;
const VALID_STATUSES = new Set(['inbox', 'in_progress', 'blocked', 'completed', 'rework', 'cancelled']);

function parseArgs(argv) {
  const positionals = [];
  const flags = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const eqIdx = token.indexOf('=');
    if (eqIdx > -1) {
      const key = token.slice(2, eqIdx);
      const value = token.slice(eqIdx + 1);
      flags[key] = value;
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      flags[key] = next;
      i += 1;
    } else {
      flags[key] = 'true';
    }
  }

  return { positionals, flags };
}

function asInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function requireFlag(flags, key) {
  const value = String(flags[key] || '').trim();
  if (!value) {
    throw new Error(`Missing required flag --${key}`);
  }
  return value;
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || body?.message || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return body;
}

async function createAndStartTask({ title, owner, priority, description, taskKey, actor }) {
  const created = await api('/api/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      owner_sister_id: owner,
      priority,
      description: description || null,
      task_key: taskKey || null,
      source_channel: 'codex-cli',
      created_by: actor,
      actor
    })
  });

  const assignment = created?.item;
  if (!assignment?.id) {
    throw new Error('Assignment was not created');
  }

  const started = await api(`/api/assignments/${encodeURIComponent(assignment.id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'in_progress',
      note: 'Started via workboard-helper',
      actor
    })
  });

  return started.item || assignment;
}

async function setTaskStatus({ id, status, note, actor }) {
  if (!VALID_STATUSES.has(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  const updated = await api(`/api/assignments/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note: note || null, actor })
  });
  return updated.item;
}

async function completeTask({ id, actor, note }) {
  const currentPayload = await api(`/api/assignments/${encodeURIComponent(id)}`);
  const current = currentPayload?.item;
  if (!current?.id) throw new Error(`Assignment not found: ${id}`);

  if (current.status === 'completed') {
    return current;
  }

  if (current.status === 'cancelled') {
    throw new Error('Cannot complete a cancelled assignment');
  }

  if (current.status === 'inbox' || current.status === 'blocked' || current.status === 'rework') {
    await setTaskStatus({
      id,
      status: 'in_progress',
      note: 'Resumed via workboard-helper',
      actor
    });
  }

  return setTaskStatus({
    id,
    status: 'completed',
    note: note || 'Completed via workboard-helper',
    actor
  });
}

function renderList(items) {
  if (!items.length) {
    console.log('No tasks found.');
    return;
  }

  const rows = items.map((item) => ({
    id: String(item.id || '').slice(0, 8),
    status: item.status,
    owner: item.owner_sister_id,
    priority: item.priority,
    updated: item.updated_at,
    title: item.title
  }));
  console.table(rows);
}

function help() {
  console.log(`Workboard Helper

Usage:
  node scripts/workboard-helper.mjs start --title "Task title" [--owner main] [--priority normal] [--description "..."] [--task-key KEY]
  node scripts/workboard-helper.mjs set --id <assignment_id> --status <inbox|in_progress|blocked|completed|rework|cancelled> [--note "..."]
  node scripts/workboard-helper.mjs complete --id <assignment_id> [--note "..."]
  node scripts/workboard-helper.mjs list [--owner main] [--status in_progress] [--days 7] [--limit 300] [--json]

Env:
  WORKBOARD_API_BASE   Default: http://127.0.0.1:5077
  WORKBOARD_OWNER      Default owner for "start": main
  WORKBOARD_ACTOR      Default actor: codex
`);
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    help();
    return;
  }

  const { positionals, flags } = parseArgs(rest);
  const actor = String(flags.actor || DEFAULT_ACTOR).trim() || DEFAULT_ACTOR;

  if (command === 'start') {
    const title = String(flags.title || positionals.join(' ')).trim();
    if (!title) throw new Error('Task title is required. Use --title "..."');

    const item = await createAndStartTask({
      title,
      owner: String(flags.owner || DEFAULT_OWNER).trim() || DEFAULT_OWNER,
      priority: String(flags.priority || 'normal').trim() || 'normal',
      description: String(flags.description || '').trim() || null,
      taskKey: String(flags['task-key'] || '').trim() || null,
      actor
    });

    console.log(`Started task ${item.id} (${item.status}) owner=${item.owner_sister_id}`);
    return;
  }

  if (command === 'set') {
    const id = requireFlag(flags, 'id');
    const status = requireFlag(flags, 'status');
    const note = String(flags.note || '').trim() || null;
    const item = await setTaskStatus({ id, status, note, actor });
    console.log(`Updated ${item.id} -> ${item.status}`);
    return;
  }

  if (command === 'complete') {
    const id = requireFlag(flags, 'id');
    const note = String(flags.note || '').trim() || null;
    const item = await completeTask({ id, actor, note });
    console.log(`Completed ${item.id} (${item.status})`);
    return;
  }

  if (command === 'list') {
    const q = new URLSearchParams({
      days: String(asInt(flags.days, DEFAULT_DAYS)),
      limit: String(asInt(flags.limit, DEFAULT_LIMIT))
    });
    if (flags.owner) q.set('owner_sister_id', String(flags.owner).trim());
    if (flags.status) q.set('status', String(flags.status).trim());

    const payload = await api(`/api/assignments?${q.toString()}`);
    if (String(flags.json || '').toLowerCase() === 'true') {
      console.log(JSON.stringify(payload, null, 2));
      return;
    }
    console.log(
      `Tasks: ${payload.items?.length || 0}/${payload.total_count || 0} (days=${payload.window_days}, limit=${payload.limit})`
    );
    renderList(payload.items || []);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
