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

## Voice Server

- **Location:** `tools/voice-server/server.js`
- **Port:** 3334
- **Start:** `cd tools/voice-server && node server.js`
- **Quick call:** `tools/call.sh +1234567890 [voice]`
- **Health:** `curl http://localhost:3334/health`

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
