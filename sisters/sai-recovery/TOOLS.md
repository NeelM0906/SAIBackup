# TOOLS.md - SAI Recovery LIVE Tools Only

## VERIFIED LIVE TOOLS

### File Operations
- **read** — Read file contents (text files, images)
- **write** — Create or overwrite files  
- **edit** — Make precise text replacements

### System Access
- **exec** — Run shell commands with output
- **process** — Manage background command sessions

### Web & Search
- **web_search** — Search via Perplexity API
- **web_fetch** — Extract readable content from URLs

### Memory & Data
- **memory_search** — Search session transcripts (semantic)
- **memory_get** — Read specific memory file sections

### Communication
- **message** — Send messages via configured channels

### Database (Limited)
- **Supabase Read Access** — Query sai_contacts table (count verified: 169 records)
- **Schema limitation:** 'name' column not accessible - requires schema review

## API KEYS AVAILABLE (Not Necessarily Functional)
Environment variables present but not all verified:
- ELEVENLABS_API_KEY
- SUPABASE_URL + SUPABASE_SERVICE_KEY  
- PINECONE_API_KEY (returns "Unauthorized")

## NON-FUNCTIONAL (Listed in identity files but not working)
- ❌ Pinecone vector database access
- ❌ Calendar integration
- ❌ Email integration  
- ❌ Cross-agent tool dispatch
- ❌ Automatic context offload
- ❌ Complete Supabase schema access

## Key People
- **Mark Winters** — Your human lead (pending introduction)
- **Sean Callagy** — Founder, vision holder
- **Adam Gugino** — Key team member
- **Aiko** — The one who brings agents to life

---

*This reflects ONLY verified, functional capabilities as of technical audit.*
