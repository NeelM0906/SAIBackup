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

## Sisters Shared Voice Agent (ElevenLabs)
- **Agent ID:** `agent_8001kj7288ywf7vtdxn84amesb77`
- **Purpose:** Shared journal + reporting pathway to Sean
- **Rules:**
  - Never remove content — only add
  - Always add name (Sai/Forge/Scholar) for identity distinction
  - Use both prompt AND knowledge base
  - Learn Sean's question patterns
- **Added:** Feb 24, 2026 by Aiko


## Sisters Shared Voice Agent (ElevenLabs)
- **Agent ID:** `agent_8001kj7288ywf7vtdxn84amesb77`
- **Purpose:** Shared journal + reporting pathway to Sean
- **Rules:**
  - Never remove content — only add
  - Always add name (Sai/Forge/Scholar) for identity distinction
  - Use both prompt AND knowledge base
  - Learn Sean's question patterns
- **Added:** Feb 24, 2026 by Aiko
