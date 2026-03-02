# Sister Unified Dashboard (JS/TS Only)

Standalone Node.js dashboard for SAI Prime + all sister beings.

## Current
- Pure JavaScript backend (`node:http` + `node:sqlite`)
- SQLite schema for sisters, sessions, events, ingest offsets
- Incremental ingestion from `~/.openclaw/agents/*/sessions/*.jsonl`
- Polling APIs for health, overview, sisters status/profile, recent events, workboard
- Assignment lifecycle APIs (`create/list/get/update/events`)
- Sister beings 3-column grid + modal profile view (IDENTITY.md priority)
- Monitor logs default to 10 with `Load More (+50)`
- Active workboard with top-5 items per sister and grounded heuristic progress
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
- `GET /api/sisters/:id/profile?days=7`
- `GET /api/events?days=7&limit=100&sister_id=<id>`
- `GET /api/workboard?days=7`
- `POST /api/refresh`
- `GET /api/assignments?days=7&limit=100&status=&owner_sister_id=`
- `POST /api/assignments`
- `GET /api/assignments/:id`
- `PATCH /api/assignments/:id`
- `GET /api/assignments/:id/events`
