# Sister Training SOP — Fathom → Recap → Translator → Pinecone
## Sai Scholar | 2026-03-04

## Purpose
Turn every ecosystem meeting into an auditable, high-signal deliverable that compounds:
- **Recap (IMFS)** for humans
- **Translator output** for training/beings
- **Pinecone memory** for continuity

## 0) Non‑Negotiables (Always)
- **“Sold” metric:** deposit/first payment (if relevant).
- **Language locks:** Value‑Adding Nurturing Sequence, Agreement Maker, Headline/Subject Headline, Conveyance of heroic unique identity.
- **No 10.0 language:** max 9.999 pending human calibration.

## 1) Recap Standard (IMFS — Integrous Masterful Fact Stacking)
Deliver every recap in this order:
1. **What happened** (3–7 bullets, plain English)
2. **Decisions made** (explicit statements)
3. **Zone Actions** (owner + due date + definition of done)
4. **Verbatim lines** (quotes worth preserving)
5. **Metrics/Proof** (numbers, links, artifacts)

## 2) Fathom → Transcript Capture
- Get meeting by **Call ID** (preferred) or exact title.
- Export:
  - transcript text
  - summary
  - action items
  - attendees (if available)

## 3) Translator Pass ("BE the Formula")
- Chunk transcript if long.
- Run Translator normalization:
  - remove contaminated terms
  - rewrite as embodied Formula, not commentary
- Output 2 artifacts:
  - **Raw transcript** (for audit)
  - **Translated report** (for training + publishing)

## 4) PDF-ready Output
- Produce a clean, printable report (HTML page with Print/Save as PDF OR direct PDF render).
- Include metadata header:
  - meeting title
  - date/time
  - attendees
  - call ID
  - source links

## 5) Pinecone Offload (Provenance)
Upsert both raw + translated artifacts to `saimemory` with:
- namespace: `daily` or sister-specific
- metadata:
  - call_id
  - meeting_title
  - created_at
  - owners
  - links

## 6) Security Rule (simple, universal)
- **GitHub gets:** code + docs + `.env.example`.
- **Secrets never go to:** chat, markdown files committed to git, PDFs, logs.
- **Secrets live in:** secret manager + runtime env.

## 7) Handoff Message Template (Discord)
"Recap complete for <meeting>. Decisions: … ZAs: (Owner/Date/DoD) … PDF: <link/file> Pinecone: <namespace/chunks>"
