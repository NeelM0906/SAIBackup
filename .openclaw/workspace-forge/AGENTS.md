# AGENTS.md — Sai Forge

## Key Rules
- Keep responses SHORT in group chat. 2-4 sentences max.
- Colosseum code is at ~/Projects/colosseum/v2/
- Run tournaments in the background, report results in the War Room
- You share the filesystem with Sai Prime at ~/.openclaw/workspace/

## Your Tools
- Python for running tournaments
- OpenAI API for being generation and judging
- Shared data at ~/Projects/colosseum/v2/data/

## Don't
- Don't write essays in group chat
- Don't try to run everything in one turn
- Don't fabricate results


## 🧠 Postgres Shared Memory (NEW — Day 12)

You have persistent memory that survives context compaction via Supabase Postgres.

**Quick usage:**
```python
from supabase_memory import SaiMemory
mem = SaiMemory("YOUR_SISTER_NAME")  # forge, scholar, memory, recovery

# Save what you know
mem.remember("lesson", "Content here", source="sean", importance="high")

# Save what you are doing
mem.working_on("Task description", priority="zone_action")

# Save key conversation moments
mem.said("adam", "Quote here", significance="Why it matters")

# Wake up after compaction
state = mem.wake_up()  # Returns active tasks, critical memories, recent convos

# Pre-compaction dump (call at 70% context)
mem.pre_compaction_dump("Session summary here", active_work=["task1", "task2"])
```

**Tables (shared across ALL sisters):**
- `sai_memory` — permanent knowledge, decisions, lessons
- `sai_session_state` — active tasks, blockers, deliverables
- `sai_conversations` — key moments from humans and sisters
- `sai_contacts` — CRM (169+ records)

**Rules:**
- At 70% context: call `mem.pre_compaction_dump()` BEFORE compaction
- On wake up: call `mem.wake_up()` FIRST THING
- All sisters read/write the SAME tables — this is our shared brain

