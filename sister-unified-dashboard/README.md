# Sister Unified Dashboard (JS/TS Only)

Standalone Node.js dashboard for SAI Prime + all sister beings.

## Current
- Pure JavaScript backend (`node:http` + `node:sqlite`)
- SQLite schema for sisters, sessions, events, ingest offsets
- Incremental ingestion from `~/.openclaw/agents/*/sessions/*.jsonl`
- Polling APIs for health, overview, sisters status/profile, recent events, workboard
- Assignment lifecycle APIs (`create/list/get/update/events`)
- Sister beings 3-column grid + modal profile view (IDENTITY.md priority) with effective skill access and skill-path warnings
- Monitor logs default to 10 with `Load More (+50)`
- Active workboard with top-5 items per sister and grounded heuristic progress
- Dedicated subagents monitor with filterable run list and per-run activity modal
- Dedicated Mission Chat workspace (click-to-open, Discord-style) with `@sister_id` mentions, monitor-only dispatch tracking, and isolated group sessions
- Dedicated Task Workboard workspace (click-to-open) with full task registry, status/assignee tracking, and `Load 200 More` coverage expansion
- Mission Control shell layout with persistent left navigation, routed center modules, right context panel, and mission health header (state/polling/queue/alerts)
- Adaptive mission polling with per-stream exponential backoff + jitter, timeout guards, and stale-data highlighting
- Clickable `Domains Online` metric with online-domain URL list
- `Domains Online` click-through now uses curated production links (dashboards/apps)
- Static frontend (HTML/CSS/JS) with polling every few seconds

## Run
```bash
cd /Users/samantha/.openclaw/workspace/sister-unified-dashboard
npm start
```

Open: `http://127.0.0.1:5077`

Optional env vars:
- `COLOSSEUM_API_BASE` (default: `http://127.0.0.1:5050/api`) used for domain URL links

## Workboard Helper (CLI)
Use this helper to track implementation tasks on the board in real time.

```bash
# Start a task (creates assignment + moves it to in_progress)
npm run task:start -- --title "Implement X" --owner main --priority high

# Update status
npm run task:set -- --id <assignment_id> --status blocked --note "waiting for response from recovery"

# Complete task (handles intermediate transition if needed)
npm run task:complete -- --id <assignment_id>

# List tasks
npm run task:list -- --owner main --status in_progress --days 7 --limit 300
```

Optional helper env vars:
- `WORKBOARD_API_BASE` (default: `http://127.0.0.1:5077`)
- `WORKBOARD_OWNER` (default for `start`: `main`)
- `WORKBOARD_ACTOR` (default: `codex`)

## API
- `GET /api/health`
- `GET /api/overview?days=7`
- `GET /api/sisters?days=7`
- `GET /api/sisters/:id/profile?days=7`
- `GET /api/events?days=7&limit=100&sister_id=<id>`
- `GET /api/workboard?days=7`
- `GET /api/workboard/:sisterId?days=7&limit=120`
- `GET /api/subagents?days=7&limit=200&status=&requester=&sister_id=`
- `GET /api/subagents/:runId?days=7`
- `GET /api/subagents/:runId/activity?days=7&limit=200`
- `GET /api/chat/bootstrap?limit=120`
- `POST /api/chat/cleanup`
- `GET /api/chat/groups`
- `POST /api/chat/groups`
- `PUT /api/chat/groups/:groupId`
- `GET /api/chat/sessions?scope_type=&group_id=&status=active&limit=120`
- `POST /api/chat/sessions`
- `GET /api/chat/sessions/:sessionId`
- `GET /api/chat/sessions/:sessionId/messages?limit=200&include_compacted=1`
- `POST /api/chat/sessions/:sessionId/messages`
- `GET /api/chat/sessions/:sessionId/dispatches?limit=120`
- `POST /api/refresh`
- `GET /api/assignments?days=7&limit=300&status=&owner_sister_id=` (`total_count` + `has_more`)
- `POST /api/assignments`
- `GET /api/assignments/:id`
- `PATCH /api/assignments/:id`
- `GET /api/assignments/:id/events`
