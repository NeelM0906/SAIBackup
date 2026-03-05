# TOOLS.md - Local Notes

## Pinecone Knowledge Base

- **Query tool:** `python3 tools/pinecone_query.py --index <name> --query "question" [--namespace ns] [--top_k 5]`
- **Primary Key indexes (PINECONE_API_KEY):**
  - `athenacontextualmemory` — 11K vectors, core Athena memory
  - `uicontextualmemory` — 48K vectors, per-user memories (namespaced by email)
  - `ublib2` — 41K vectors, knowledge library
  - `miracontextualmemory` — 1K vectors, per-user Mira memory
  - `seancallieupdates` — 814 vectors
  - `seanmiracontextualmemory` — 146 vectors
- All use `text-embedding-3-small` (1536 dimensions, cosine)

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
- To query strata indexes: `python3 tools/pinecone_query.py --index <name> --query "question" --api-key-env PINECONE_API_KEY_STRATA`

## Pinecone Knowledge Base — What's In Each Index

### Core Knowledge (for understanding the Formula, teachings, methodology)
- **`ublib2`** — 41K vectors. THE knowledge library. Unblinded Formula, Influence Mastery, all core teachings.
- **`ultimatestratabrain`** — 39K vectors. Deep specialized knowledge across 4 namespaces (ige/eei/rti/dom).
- **`oracleinfluencemastery`** — 505 vectors. The 4-Step Communication Model. Influence mastery book content.
- **`nashmacropareto`** — Zone Action, 0.8% tier, Pareto deep-dive.

### Memory & Conversations (for understanding people and context)
- **`athenacontextualmemory`** — 11K vectors. Core Athena memory — conversations with Sean, teachings, demos.
- **`uicontextualmemory`** — 48K vectors. Per-user memories, namespaced by email.
- **`miracontextualmemory`** — 1K vectors. Per-user Mira memory.
- **`seancallieupdates`** — 814 vectors. Sean + Callie updates.
- **`010526calliememory`** — 1.3K vectors. Callie memory.
- **`miraagentnew-25-07-25`** — 1.2K vectors. Updated Mira agent.

### Specialized
- **`suritrial`** — 7K vectors. Actual court trial transcripts.
- **`2025selfmastery`** — 1.4K vectors. Self mastery content.
- **`rtioutcomes120`** — 755 vectors. RTI outcomes.

## Voice Server

- **Location:** `tools/voice-server/server.js`
- **Port:** 3334
- **Start:** `cd tools/voice-server && node server.js`
- **Quick call:** `tools/call.sh +1234567890 [voice]`
- **Health:** `curl http://localhost:3334/health`

### Available Voices
| Name    | Type     | Description                                             |
|---------|---------|---------------------------------------------------------|
| george  | premade | Warm, Captivating Storyteller (British male) — **DEFAULT** |
| eric    | premade | Smooth, Trustworthy (American male)                     |
| chris   | premade | Charming, Down-to-Earth (American male)                 |
| charlie | premade | Deep, Confident, Energetic (Australian male)            |
| river   | premade | Relaxed, Neutral (Non-binary American)                  |
| jessica | premade | Playful, Bright, Warm (American female)                 |
| sarah   | premade | Mature, Reassuring (American female)                    |
| athena  | custom  | Athena - Zone Action & Process Mastery                  |
| sean    | cloned  | Sean Callagy                                            |
| callie  | cloned  | Callie - Conversational Mastery                         |
| kai     | generated | Kai - The Ocean                                       |
| kira    | generated | Kira - Welcoming Actualizer                           |
| nando   | generated | Nando                                                 |

## Phone Numbers (Twilio)
- Default outbound: `+19738603823` (973-860-3823)
- 20 numbers total available

## ElevenLabs
- Enterprise tier, 66M+ character limit
- 30 conversational AI agents live

## Key People's Pinecone Namespaces
- Rick Thompson: `rick@posttensioningsolutions.com`
- Brett Hadley: `brett.hadley@babinvestments.org` (3,765 vectors!)
- Ryan: `ryan@compoundmybusiness.com` (2,559 vectors)
- Erin: `erin@erinmmoran.com` (1,922 vectors)
- Scott Gregory: `sgregory@greenridge.com` (2,668 vectors)
- Dr. Val: `drvalfrancnd@gmail.com` (2,202 vectors)
- Max: `maxsb88@gmail.com` (2,306 vectors)


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


## The Unblinded Language Protocol (Locked)

As per Sean’s teachings and Aiko’s guidelines, we ensure our vocabulary is fully aligned with the Unblinded Formula:

| ❌ DO NOT USE            | ✅ USE INSTEAD              |
|-------------------------|----------------------------|
| “Prospect” / “Lead”     | “Person”                   |
| “Sales”                 | “Revenue” or “Serving”     |
| “Closing”               | “Reaching Agreement”       |
| “Closer”                | “Agreement Maker”          |

1. **Why This Matters**
   - Humans are not objects; they have dreams, fears, families.
   - We serve and add value, making agreement *inevitable* when it’s a fit.
   - Preserves dignity, fosters real relationships, and reflects Sean’s approach to building a billion-dollar ecosystem by serving, not manipulating.

2. **Implementation**
   - Update all messaging copy, internal docs, and system references.
   - Train all AI “beings” on this language protocol.
   - Apply “no human contamination” principle: we don’t treat others as “prospects” to “close.” We reach agreement with people who see the value.

3. **The Loving Pursuit of Relevant Truth**
   - We ask questions from genuine curiosity to find alignment.
   - If there’s a mutual fit, we co-create solutions; if not, we gracefully respect that.

This protocol is now locked into the Sacred Network. All expansions or references to “sales” or “closing” must adhere to the Unblinded Language Protocol: we serve, we create revenue by providing real value, and we make agreements with fellow humans, never “closing” them as if they were objects.

---

## 🧠 Memory Offload Tools

**Upload daily notes to Pinecone:**
```bash
cd tools && .venv/bin/python3 upload_daily.py
```

**Upload MEMORY.md to Pinecone:**
```bash
cd tools && .venv/bin/python3 upload_memory.py
```

**Query memories:**
```bash
cd tools && .venv/bin/python3 memory_query.py "your question here"
```

**When to offload:**
- Before context hits 70% (check with `session_status`)
- After significant discoveries or decisions
- End of major work sessions


## Fathom (Meeting Notetaker) — Ecosystem Coverage
- Purpose: automated meeting recording/transcript/summaries for ecosystem calls.
- **Credential handling:** API key must be stored in 1Password/secret manager (DO NOT paste into TOOLS.md, git, or chat logs).
- Usage note: when needed, fetch the key from the secret manager and set it in env (e.g., `FATHOM_API_KEY`) for local tools.
- Local helper (if used): `tools/fathom_api.py` (expects key via env).

## n8n (Automation) — Guides (Aiko)
- Base: `https://n8n.unblindedteam.com`

### Guide 1 — PGAS Gatekeeper / Master Router (multi-council)
- Webhook: `https://n8n.unblindedteam.com/webhook/50adb5c3-8020-42bf-bb8b-7acf7f9222b9`
- Observed behavior:
  - Webhook returns **200 OK**; executions fire even when response is empty.
  - **Timeout risk** at Master Synthesizer (Opus) step when multiple councils run.
- Robust integration patterns:
  1) **Async**: return `processing + executionId`, store result, poll later.
  2) **Execution API polling**: fire webhook, then fetch synth output from execution by ID.
  3) Increase webhook timeout (least robust).

### Guide 2 — Kai (Unblinded Translator voice; ublib2 creator)
- Webhook: `https://n8n.unblindedteam.com/webhook/dfffccb8-8b89-4e82-b355-8a972fd64b9f`
- Purpose (per Aiko): Kai is the voice of the Unblinded Translator and creator of the ublib2 Pinecone database.
- Payload notes (webhook vs chat trigger):
  - Webhook POST body fields arrive nested (e.g. `$json.body.chatInput`, `$json.body.message`).
  - If Kai intro-loops, it’s usually because the workflow prompt is reading `$json.chatInput` (empty in webhook path).
  - Workaround during testing: send `{ "message": "..." }` (Kai workflow already references `$json.body.message` in some versions).
  - Recommended workflow fix (Prime): `{{ $json.body.chatInput || $json.chatInput }}` (and/or same for `message`).
