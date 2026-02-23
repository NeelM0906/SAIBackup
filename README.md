# SAI Repository Guide

This repository bundles OpenClaw workspace materials and two Python projects (`colosseum`, `prove-ahead`) into one place.

## What Is In This Repo

### 1) `.openclaw/workspace/`
- Core markdown docs (`SOUL.md`, `IDENTITY.md`, `MEMORY.md`, etc.)
- `memory/` daily logs and research notes
- `tools/` operational scripts:
  - `tools/voice-server/server.js` (Node voice webhook/server)
  - `tools/pinecone_query.py` (Pinecone semantic query tool)
  - `tools/voice-call.py`, `tools/call.sh` (voice call helpers)

### 2) `.openclaw/workspace-forge/` and `.openclaw/workspace-scholar/`
- Markdown profile docs for additional OpenClaw agent workspaces.

### 3) `Projects/colosseum/`
- `colosseum/`: v1 Python package (tournament engine + API server)
- `v2/`: v2 data + engines (`beings_v2.py`, `scenarios_v2.py`, `tournament_v2.py`)
- `templates/dashboard.html`
- `run_server.py`, `run_tournament.py`

### 4) `Projects/prove-ahead/`
- Competitor benchmarking and report generation:
  - `competitors.py`
  - `matrix.py`
  - `benchmark.py`
  - `report.py`
  - `build_all.py`

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm
- OpenAI API access
- Optional for telephony: Twilio, ElevenLabs, Deepgram, ngrok

## Local Secrets and Config

These projects expect secrets in `~/.openclaw/.env` (not in this repo).

Example keys used by scripts:

```bash
OPENAI_API_KEY=
PINECONE_API_KEY=
OPENROUTER_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_API_KEY_SID=
TWILIO_API_KEY_SECRET=
ELEVENLABS_API_KEY=
DEEPGRAM_API_KEY=
```

Do not commit real keys.

## Quick Start

### A) OpenClaw workspace tools

Install Python dependencies:

```bash
pip3 install openai pinecone twilio
```

Run Pinecone query:

```bash
cd .openclaw/workspace
python3 tools/pinecone_query.py --index athenacontextualmemory --query "test query" --top_k 3
```

Run voice server:

```bash
cd .openclaw/workspace/tools/voice-server
npm install
node server.js
```

Health check:

```bash
curl http://localhost:3334/health
```

Make a quick call (requires Twilio + ngrok running):

```bash
cd .openclaw/workspace
tools/call.sh +15551234567 george
```

### B) Colosseum (v1)

Install dependencies:

```bash
pip3 install openai rich fastapi uvicorn
```

Run API/dashboard server:

```bash
cd Projects/colosseum
python3 run_server.py
```

Run tournament from CLI:

```bash
cd Projects/colosseum
python3 run_tournament.py --mode blitz
```

### C) Colosseum (v2)

The v2 scripts currently contain hardcoded absolute paths to `/Users/samantha/Projects/colosseum/v2/...`.

If running on another machine/path, update those paths in:
- `Projects/colosseum/v2/tournament_v2.py`
- `Projects/colosseum/v2/beings_v2.py`
- `Projects/colosseum/v2/scenarios_v2.py`
- `Projects/colosseum/v2/judges_v2.py`
- `Projects/colosseum/v2/judges_expanded.py`
- `Projects/colosseum/v2/absorption.py`

Then run:

```bash
cd Projects/colosseum/v2
python3 tournament_v2.py
```

### D) Prove-Ahead benchmarking

Install dependencies:

```bash
cd Projects/prove-ahead
pip3 install -r requirements.txt
```

Generate full output set (`matrix.md`, `benchmark_results.json`, `report.md`):

```bash
cd Projects/prove-ahead
python3 build_all.py
```

Run parts individually:

```bash
python3 competitors.py
python3 matrix.py
python3 benchmark.py
python3 report.py
```

## Notes

- OpenClaw runtime itself is a local/global install (`openclaw` CLI), not launched from this repo.
- `workspace-forge` and `workspace-scholar` in this repo are documentation snapshots.
- Keep `.env`, token files, and local runtime DBs out of git.
