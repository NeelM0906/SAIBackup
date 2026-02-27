# Federal IDR Operations System
## No Surprises Act Independent Dispute Resolution at Scale

**Created:** 2026-02-27
**Target:** 10,000 files/month by June 2026
**Business:** Callagy Recovery

---

## What This Is

A complete specification for replacing/augmenting the current PHP-based Federal IDR system with AI-powered operations designed for massive scale.

---

## Files in This Directory

| File | Purpose |
|------|---------|
| **README.md** | This overview |
| **IDR-PROCESS-SPEC.md** | Full Federal IDR process documentation with timelines, deadlines, and system requirements |
| **IDR-SCHEMA.sql** | Complete database schema — copy/paste into Supabase or Postgres |
| **IDR-AI-MODULES.md** | AI leverage points — where automation creates scale |

---

## The Problem

Federal IDR has strict deadlines and complex workflows:
- **30 business days** open negotiation
- **4 business days** to initiate IDR after negotiation
- **10 business days** to submit offers
- Miss a deadline = lose the case

At 10,000 files/month, manual tracking breaks. The current PHP system wasn't built for this scale.

---

## The Solution

### 1. Deadline Guardian (Module 2)
Zero missed deadlines. Automated alerts at 5/2/1 business days. Escalation chain to leadership.

### 2. Intake Automation (Module 1)
EOB ingestion → validated case → auto-calculated deadlines. No manual data entry.

### 3. Negotiation Intelligence (Module 3)
AI-powered offer recommendations based on payer history, CPT patterns, win rates.

### 4. Batching Optimizer (Module 6)
Auto-identify batch candidates. Minimize fees. Maximize wins.

### 5. Outcome Learning (Module 7)
Every determination trains the model. Continuous improvement.

---

## Implementation Path

### Phase 1: Deploy Schema (Day 1)
```sql
-- Run IDR-SCHEMA.sql in Supabase/Postgres
-- Tables: idr_cases, idr_negotiations, idr_entities, idr_batches, idr_deadlines, etc.
```

### Phase 2: Deadline Guardian (Week 1)
- Cron job checking deadlines daily
- Alert system (email/Slack/Telegram)
- Escalation logic

### Phase 3: Intake Automation (Week 2-3)
- EOB parsing (OCR or structured)
- Case creation API
- Deadline auto-calculation

### Phase 4: Intelligence Modules (Week 4+)
- Offer recommendation engine
- Entity selection intelligence
- Batching optimizer

---

## Integration Options

### A. Full Replace
Migrate everything to new system. Sunset PHP.

### B. Augment
Keep PHP for data entry. New system adds intelligence layer. Gradual transition.

### C. Hybrid
New cases → new system. Old cases stay in PHP until closed.

**Recommendation:** Start with B. Don't block on full replacement.

---

## What's Needed From Mark/Team

1. **PHP system access** — Schema, current workflow, pain points
2. **Sample data** — Anonymized cases to understand structure
3. **Payer list** — Which payers are highest volume?
4. **Historical outcomes** — Win rates, recovery amounts (for training AI)
5. **Team input** — Where do they waste the most time?

---

## Scale Math

| Metric | Manual Process | With AI |
|--------|---------------|---------|
| Intake | 15 min/case | 0 (auto) |
| Negotiation mgmt | 30 min/case | 5 min (review AI rec) |
| Offer writing | 45 min/case | 10 min (edit AI draft) |
| Deadline tracking | Constant vigilance | 0 (auto) |
| Entity selection | 10 min research | 1 min (confirm AI pick) |

**10,000 cases/month at old rate:** Impossible
**10,000 cases/month with AI:** 10-15 FTEs

---

## Next Steps

1. Deploy schema (can do without PHP access)
2. Build deadline cron job (can do without PHP access)
3. Get PHP access → map data migration
4. Build intake automation
5. Build intelligence modules

---

*This system is designed around CMS Federal IDR rules. If Callagy's process differs, adjust accordingly.*
