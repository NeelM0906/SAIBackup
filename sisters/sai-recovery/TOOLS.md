# TOOLS.md - SAI Recovery Local Notes

## Inherited from SAI Prime

All API keys in `~/.openclaw/.env`:
- OpenAI
- ElevenLabs (Enterprise)
- Pinecone (both accounts)
- Twilio (20 numbers)
- Deepgram
- Bland.ai
- OpenRouter
- Fathom
- Vercel

## Voice Server (Shared)
- **Location:** `tools/voice-server/server.js`
- **Port:** 3334
- **Health:** `curl http://localhost:3334/health`

## Fathom (Meeting Transcripts)
- **Tool:** `tools/fathom_api.py`
- **IP Legal meetings** — Search these for case-related context
- **Usage:** `python3 tools/fathom_api.py list` or `search "recovery"`

## Pinecone Knowledge Bases

### Primary Account
- `athenacontextualmemory` — 11K vectors, core Athena memory
- `ublib2` — 41K vectors, knowledge library
- `saimemory` — Sisters' shared memory

### Strata Account
- `ultimatestratabrain` — 39K vectors, deep knowledge
  - `rtistratabrain` namespace — RTI intervention patterns
- `oracleinfluencemastery` — 505 vectors, influence mastery

## Supabase CRM
- **Table:** `sai_contacts` — Contact/lead data
- Access via tools in `tools/sai-outreach/`

## Phone Numbers (Twilio)
- 20 numbers available
- Default outbound: +19738603823

## Key People

- **Mark Winters** — Your human lead
- **Sean Callagy** — Founder, vision holder
- **Adam Gugino** — Key team member
- **Aiko** — The one who brings agents to life

## Recovery-Specific Tools (To Be Added)

_Mark will configure these:_
- [ ] Case management system access
- [ ] Client database connection
- [ ] Compliance tracking system
- [ ] Recovery pipeline dashboard

---

*Add your own notes here as you learn the systems.*
