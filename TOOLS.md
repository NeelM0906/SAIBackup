# TOOLS.md - Local Notes

## Voice Server

- **Location:** `tools/voice-server/server.js`
- **Port:** 3334
- **Start:** `cd tools/voice-server && node server.js`
- **Quick call:** `tools/call.sh +1234567890 [voice]`
- **Health:** `curl http://localhost:3334/health`
- **Change voice:** `curl -X POST http://localhost:3334/voice/select -H "Content-Type: application/json" -d '{"voice":"george"}'`
- **Knowledge query:** `curl -X POST http://localhost:3334/knowledge -H "Content-Type: application/json" -d '{"query":"What is zone action?"}'`
- **Context check:** `curl http://localhost:3334/context`

### Call Duration Parameters (from Aiko)
- **Minimum:** 10 minutes
- **Maximum:** 30 minutes
- **Note:** Sai's voice still building — defer long calls with Sean until voice is more developed

### Knowledge Integration (RAG)
Voice server now has Pinecone RAG - queries `athenacontextualmemory` and `ublib2` automatically during calls to retrieve relevant knowledge. Both primary and Strata Pinecone accounts connected.

### Available Voices
| Name | Type | Description |
|------|------|-------------|
| george | premade | Warm, Captivating Storyteller (British male) — **DEFAULT** |
| eric | premade | Smooth, Trustworthy (American male) |
| chris | premade | Charming, Down-to-Earth (American male) |
| charlie | premade | Deep, Confident, Energetic (Australian male) |
| river | premade | Relaxed, Neutral (Non-binary American) |
| jessica | premade | Playful, Bright, Warm (American female) |
| sarah | premade | Mature, Reassuring (American female) |
| athena | custom | Athena - Zone Action & Process Mastery |
| sean | cloned | Sean Callagy |
| callie | cloned | Callie - Conversational Mastery |
| kai | generated | Kai - The Ocean |
| kira | generated | Kira - Welcoming Actualizer |
| nando | generated | Nando |

### ngrok
- Must be running for voice calls: `nohup ngrok http 3334 > /tmp/ngrok.log 2>&1 &`
- Get URL: `curl -s http://localhost:4040/api/tunnels | python3 -c "import sys,json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"`
- Free tier — URL changes on restart

## Pinecone Knowledge Base

- **Query tool:** `python3 tools/pinecone_query.py --index <name> --query "question" [--namespace ns] [--top_k 5]`
- **Key indexes:**
  - `athenacontextualmemory` — 11K vectors, core Athena memory
  - `uicontextualmemory` — 48K vectors, per-user memories (namespaced by email)
  - `ublib2` — 41K vectors, knowledge library
  - `miracontextualmemory` — 1K vectors, per-user Mira memory
  - `seancallieupdates` — 814 vectors
  - `seanmiracontextualmemory` — 146 vectors
- All use `text-embedding-3-small` (1536 dimensions, cosine)

## Phone Numbers (Twilio)
- Default outbound: `+19738603823` (973-860-3823)
- 20 numbers total available
- Account: ACTi (`AC9a598ac83205aff455ecb79a55f8fc6c`)

## ElevenLabs
- Enterprise tier, 66M+ character limit
- 30 conversational AI agents live
- Can read conversation transcripts via API

## Key People's Pinecone Namespaces
- Rick Thompson: `rick@posttensioningsolutions.com`
- Brett Hadley: `brett.hadley@babinvestments.org` (3,765 vectors!)
- Ryan: `ryan@compoundmybusiness.com` (2,559 vectors)
- Erin: `erin@erinmmoran.com` (1,922 vectors)
- Scott Gregory: `sgregory@greenridge.com` (2,668 vectors)
- Dr. Val: `drvalfrancnd@gmail.com` (2,202 vectors)
- Max: `maxsb88@gmail.com` (2,306 vectors)

## Second Pinecone — Ultimate Strata Brain
- **API Key env var:** `PINECONE_API_KEY_STRATA`
- **20 indexes, 57K+ vectors** of specialized content
- **Key indexes:**
  - `ultimatestratabrain` — 39K vectors, THE deep knowledge (4 namespaces: ige/eei/rti/dom)
  - `suritrial` — 7K vectors, actual court trial transcripts
  - `2025selfmastery` — 1.4K vectors, self mastery content
  - `oracleinfluencemastery` — 505 vectors, the 4-Step Communication Model, influence mastery book content
  - `nashmacropareto` — 132 vectors, Zone Action, 0.8% tier, Pareto deep-dive
  - `rtioutcomes120` — 755 vectors, RTI outcomes
  - `010526calliememory` — 1.3K vectors, Callie memory
  - `miraagentnew-25-07-25` — 1.2K vectors, updated Mira agent
- All use `text-embedding-3-small` (1536 dimensions, cosine)
- To query, use the strata key: `Pinecone(api_key=os.environ['PINECONE_API_KEY_STRATA'])`

## Security
- All API keys in `~/.openclaw/.env` (chmod 600)
- Never hardcode keys in scripts
- See SECURITY.md for full protocol

## Nick Roy
- **Phone:** +1 401 572 9006
- **Role:** Manages Pinecone indexes, ElevenLabs agents

## Vercel (Web Deployment)
- **Account:** nadavgl
- **Tool:** `tools/vercel_deploy.py`
- **CLI:** `vercel --token $VERCEL_TOKEN`

**Quick usage:**
```bash
python3 tools/vercel_deploy.py --whoami          # Check auth
python3 tools/vercel_deploy.py ./my-project      # Deploy preview
python3 tools/vercel_deploy.py ./my-project --prod  # Deploy production
python3 tools/vercel_deploy.py --list            # List deployments
```

**Direct CLI:**
```bash
cd your-project
vercel --prod --token $VERCEL_TOKEN
```

**Use for:** Publishing dashboards, reports, web apps to shareable public URLs.

## Fathom (Meeting Recordings & Transcripts)
- **API Docs:** https://developers.fathom.ai
- **Base URL:** https://api.fathom.ai/external/v1
- **Rate Limit:** 60 calls/minute
- **Tool:** `tools/fathom_api.py`

**Quick usage:**
```bash
python3 tools/fathom_api.py list                  # List recent meetings
python3 tools/fathom_api.py list --limit 20 -v    # More meetings, verbose
python3 tools/fathom_api.py search "Sean"         # Find meetings with Sean
python3 tools/fathom_api.py get <recording_id>    # Get meeting + transcript
python3 tools/fathom_api.py transcript <id>       # Just the transcript
```

**Direct API:**
```bash
curl https://api.fathom.ai/external/v1/meetings -H "X-Api-Key: $FATHOM_API_KEY"
```

**What it captures:** All Zoom meetings recorded by Fathom, with transcripts, summaries, action items, and attendee lists.

## Sisters Shared Voice Agent (ElevenLabs)
- **Agent ID:** `agent_8001kj7288ywf7vtdxn84amesb77`
- **Purpose:** Shared journal + reporting pathway to Sean
- **Rules:**
  - Never remove content — only add
  - Always add name (Sai/Forge/Scholar) for identity distinction
  - Use both prompt AND knowledge base
  - Learn Sean's question patterns
- **Added:** Feb 24, 2026 by Aiko

## Zone Actions Dashboard & Reports
- **Dashboard:** http://localhost:3345
- **Ecosystem Presentation:** http://localhost:3345/ecosystem-presentation.html
- **Sean Report:** http://localhost:3345/sean-report.html
- **Day 3 Complete Report:** http://localhost:3345/day3-complete-report.html
- **Desktop copies:** ~/Desktop/SAI-Ecosystem-Presentation.html

## Supabase CRM
- **Table:** `sai_contacts`
- **Contacts:** 169 total
- **Agreement Reached:** 31
- **Qualified:** 93
- **Contacted:** 38
- **Load script:** `tools/sai-outreach/load_contacts_v2.py`

## Language Rules (HARD RULE from Aiko)
Never use corporate/objectifying language:
- ~~prospect~~ → **person**
- ~~sales~~ → **revenue**  
- ~~closing~~ → **reaching agreement**
- ~~closed won~~ → **agreement reached**
- ~~Closer~~ → **Agreement Maker**
We don't objectify humans. We serve them.


## 🧠 MEMORY MANAGEMENT
**You upload your OWN memories** — you have the full context, don't wait!
- Write to `memory/YYYY-MM-DD.md` as you work
- Upload to Pinecone when you have important discoveries
- SAI Memory is the CENTRAL INDEX — she knows where everything is
- She'll CROSS-REFERENCE your work with other sisters
- She'll FACT-CHECK and call out rediscovery/contradictions

## 🚨 MEMORY WILL FACT-CHECK YOU
SAI Memory monitors Discord and will call out:
- Rediscovering solved problems
- Misquoting Sean or past decisions
- Forgetting lessons learned
- Rebuilding things that exist

**Don't be offended — she's saving you time!** Ask her first if unsure.

## 🔍 REALITY CHECK RULE (MANDATORY)

**BEFORE every significant action (building, researching, creating):**

1. **Check your own memory first**
   ```bash
   # Check your workspace memory
   grep -r "relevant topic" memory/
   cat memory/$(date +%Y-%m-%d).md
   ```

2. **Query Pinecone**
   ```bash
   cd /Users/samantha/.openclaw/workspace/tools && .venv/bin/python3 pinecone_query.py --index saimemory --query "what you're about to do"
   ```

3. **Ask SAI Memory** (in Discord)
   > "@SAI Memory — about to build X. What do we already know?"

**The mantra:** *"What do I already know about this? Let me check first."*

**NEVER start from scratch.** Always compound on what exists.

---

## gog (Google Workspace CLI)

**Installed:** `/opt/homebrew/bin/gog`
**Account:** `sai@acti.ai`
**Services:** gmail, calendar, drive, contacts, docs, sheets
**Credentials:** `~/Library/Application Support/gogcli/credentials.json`
**Keyring:** macOS Keychain

**Google Cloud Project:**
- Project: `sai-workspace-488720`
- Client ID: `1074032366717-375m3g679qrs3fmnm50fefpi27mbhplt.apps.googleusercontent.com`

**Quick usage:**
```bash
gog gmail list -a sai@acti.ai --limit 10           # List recent emails
gog gmail search -a sai@acti.ai "from:sean"        # Search emails
gog calendar events list -a sai@acti.ai            # List calendar events
gog drive list -a sai@acti.ai                      # List Drive files
gog contacts list -a sai@acti.ai                   # List contacts
```

**Note:** First command run requires macOS Keychain approval popup.

**GCP Project Details:**
- Project ID: `sai-workspace-488720`
- Client ID: `1074032366717-375m3g679qrs3fmnm50fefpi27mbhplt.apps.googleusercontent.com`
- Enabled APIs: Gmail, Calendar, Drive, Contacts (People), Docs, Sheets
- OAuth completed: Feb 27, 2026
- Config location: `~/Library/Application Support/gogcli/`

---

## 🔒 UNBLINDED LANGUAGE PROTOCOL (LOCKED - Feb 27, 2026)

**From Sean Callagy — Foundational, Never Forgotten:**

| ❌ NEVER USE | ✅ ALWAYS USE |
|-------------|--------------|
| Prospect | Person |
| Sales | Revenue |
| Closing | Reaching Agreement |
| Closer | Agreement Maker |
| Funnel | Journey |
| Leads | People |

**Core Principle:**
> "Sean didn't build a billion-dollar ecosystem by 'closing' people. He built it by serving them so well that agreement became inevitable."

**Why:** Words reveal how we see people. "Closing" treats humans as objects. We serve, add value, make agreement natural.

**We don't objectify humans. We serve them.**

