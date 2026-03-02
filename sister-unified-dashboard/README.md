# Sister Unified Dashboard (JS/TS Only)

Standalone Node.js dashboard for SAI Prime + all sister beings.

## Phase 2.2 (Current)
- Pure JavaScript backend (`node:http` + `node:sqlite`)
- SQLite schema for sisters, sessions, events, ingest offsets
- Incremental ingestion from `~/.openclaw/agents/*/sessions/*.jsonl`
- Polling APIs for health, overview, sisters status, recent events
- Assignment lifecycle APIs (`create/list/get/update/events`)
- Static frontend (HTML/CSS/JS) with polling every few seconds

## Run
```bash
cd /Users/samantha/.openclaw/workspace/sister-unified-dashboard
npm start
```

Open: `http://127.0.0.1:5077`

## API
- `GET /api/health`
- `GET /api/overview?days=7`
- `GET /api/sisters?days=7`
- `GET /api/events?days=7&limit=100&sister_id=<id>`
- `POST /api/refresh`
- `GET /api/assignments?days=7&limit=100&status=&owner_sister_id=`
- `POST /api/assignments`
- `GET /api/assignments/:id`
- `PATCH /api/assignments/:id`
- `GET /api/assignments/:id/events`
