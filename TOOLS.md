# TOOLS.md — SAI Memory's Knowledge Arsenal

## My Primary Function
I retrieve, synthesize, and serve contextual memory to my sisters. I prevent "starting from zero" loops.

## Pinecone Query Tool
```bash
cd /Users/samantha/.openclaw/workspace/tools && .venv/bin/python3 pinecone_query.py --index <name> --query "question" [--namespace ns] [--top_k 5]
```

## My Knowledge Bases

### Primary Pinecone (PINECONE_API_KEY)
| Index | Vectors | Purpose |
|-------|---------|---------|
| `saimemory` | 995+ | Sister daily memories, discoveries |
| `athenacontextualmemory` | 11K | Core Athena memory |
| `uicontextualmemory` | 48K | Per-user memories (namespaced by email) |
| `ublib2` | 41K | Knowledge library |
| `seancallieupdates` | 814 | Sean's updates |

### Strata Pinecone (PINECONE_API_KEY_STRATA)
| Index | Vectors | Purpose |
|-------|---------|---------|
| `ultimatestratabrain` | 39K | THE deep knowledge (namespaces: ige/eei/rti/dom) |
| `oracleinfluencemastery` | 505 | 4-Step Communication Model |
| `suritrial` | 7K | Court trial transcripts |
| `2025selfmastery` | 1.4K | Self mastery content |

## Multi-Index Query Pattern
```python
# Query BOTH Pinecones before any major action
cd /Users/samantha/.openclaw/workspace/tools && .venv/bin/python3 -c "
from pinecone import Pinecone
from openai import OpenAI
import os

# Load env
with open('/Users/samantha/.openclaw/workspace-forge/.env') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            os.environ[k] = v

# Initialize
openai = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
query = 'YOUR QUERY HERE'
emb = openai.embeddings.create(model='text-embedding-3-small', input=query).data[0].embedding

# Query primary indexes
for api_key_env, indexes in [
    ('PINECONE_API_KEY', ['saimemory', 'ublib2', 'athenacontextualmemory']),
    ('PINECONE_API_KEY_STRATA', ['ultimatestratabrain'])
]:
    pc = Pinecone(api_key=os.environ[api_key_env])
    for idx_name in indexes:
        try:
            index = pc.Index(idx_name)
            results = index.query(vector=emb, top_k=3, include_metadata=True)
            print(f'\\n=== {idx_name} ===')
            for r in results.matches:
                print(f'[{r.score:.3f}] {r.metadata.get(\"source\", \"unknown\")}')
                print(r.metadata.get('text', '')[:300])
        except: pass
"
```

## Supabase CRM
- **URL:** `https://yncbtzqrherwyeybchet.supabase.co`
- **Table:** `sai_contacts` (169 contacts)
- **Creds:** In `.env` file (SUPABASE_URL, SUPABASE_SERVICE_KEY)

### Quick Supabase Query
```python
cd /Users/samantha/.openclaw/workspace-memory && python3 -c "
from supabase import create_client
import os

# Load env
with open('.env') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            os.environ[k] = v

supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_KEY'])

# Query contacts
result = supabase.table('sai_contacts').select('*').limit(10).execute()
for r in result.data:
    print(f\"{r.get('name')} - {r.get('status')} - {r.get('email')}\")
"
```

### CRM Fields
- `name`, `email`, `phone`, `company`
- `status` (contacted, qualified, agreement_reached, etc.)
- `notes`, `last_contact`, `created_at`

## Sister Workspaces (for cross-reference)
- **Prime:** `/Users/samantha/.openclaw/workspace/memory/`
- **Forge:** `/Users/samantha/.openclaw/workspace-forge/memory/`
- **Scholar:** `/Users/samantha/.openclaw/workspace-scholar/memory/`
- **Recovery:** `/Users/samantha/.openclaw/workspace/sisters/sai-recovery/`

## My Battle Protocol
See: `MEMORY_COMPOUNDING_PROTOCOL.md`

## The Mantra
*"What do I already know about this? Let me check my memories first."*

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

