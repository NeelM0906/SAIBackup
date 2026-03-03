# Callagy Recovery — Automated Pipeline Spec v1.0
_Built: 2026-03-01 | Owner: SAI Recovery | For: Danny Lopez + Tuesday meeting_

## The Goal
**From x% effective (manual review required) → 100% automated accuracy**

Every file moves through the pipeline without human checkpoints. AI handles classification, verification, routing, calculation, and submission. Humans only appear at contractually required signature points or when a file is genuinely unresolvable by any automated means.

---

## ⚠️ HARD RULE — TWO COMPANIES, THREE TRACKS — NEVER INTERMIX

### WHO OWNS WHAT

| Company | Track | Insurance Type | Forum |
|---------|-------|---------------|-------|
| **Callagy Recovery** | NSA / Federal IDR | Commercial Health Insurance | Federal IDR portal / State surprise billing |
| **Callagy Law** | PIP | Auto/No-Fault (NJ, NY) | Forthright (NJ) / State No-Fault (NY) |
| **Callagy Law** | Workers' Comp | Workers' Compensation | State WC Boards |

**Callagy Recovery = Federal (NSA/IDR) only.**
**Callagy Law = PIP + Workers' Comp. Different system entirely.**

These are separate companies, separate systems, separate legal frameworks. Never cross. Never intermix. Never confuse them.

---

## The Core Problem We're Solving

Current state:
- Manual extraction of insurance type, carrier, coverage
- Wrong forum filings (state vs. federal) because classification is uncertain
- Double filings in both forums "just in case"
- Human review at every ambiguous step = bottleneck and error source

New state:
- AI extracts and classifies at intake
- Automated verification via external sources before any action
- Single correct forum determined with confidence score
- File moves forward only when confidence threshold is met
- Unresolvable edge cases flagged with specific reason — human touches only that specific issue

---

## Pipeline Architecture

### STAGE 1 — INTAKE & EXTRACTION
**Input:** HCFA, EOB, any supporting documents
**AI does:**
- Parse all fields: patient info, carrier, payer ID, dates, CPT codes, billed amounts, facility type, provider NPI, network status indicators
- Identify document type and completeness
- Flag any missing critical fields immediately

**Output:** Structured data record in database
**Gate:** All critical fields present? → Stage 2. Missing fields? → Request specific missing documents (automated)

---

### STAGE 2 — INSURANCE TYPE CLASSIFICATION
**AI does:**
- Cross-reference payer ID against known carrier database:
  - Known WC carriers → WC track
  - Known PIP/auto carriers → PIP track  
  - Known Medicare/Medicaid IDs → government track
  - Commercial plan IDs → NSA eligibility track
- Confidence score assigned to classification

**Confidence thresholds:**
- High (>95%) → proceed automatically
- Medium (70-95%) → run verification (Stage 3)
- Low (<70%) → run verification (Stage 3) + log for pattern analysis

**Output:** Classification + confidence score
**Gate:** High confidence → Stage 4. Medium/Low → Stage 3

---

### STAGE 3 — AUTOMATED EXTERNAL VERIFICATION
**Triggered when:** Classification confidence < 95% OR carrier unrecognized

**AI queries (in order, stops when resolved):**
1. **CMS NPPES** — look up payer NPI, confirm carrier type
   https://npiregistry.cms.hhs.gov/api/
2. **CMS HIOS** — confirm if commercial plan is ACA/NSA-eligible
   CMS Health Insurance Oversight System API
3. **State insurance department** — confirm state vs. federal jurisdiction
   - NJ: DOBI database
   - NY: DFS database
   - Other states: respective DOI APIs/lookups
4. **Carrier eligibility line** — automated verification call via Milo/voice AI
   - Provide: patient name, DOB, member ID, date of service
   - Ask: coverage type, network status, NSA applicability
5. **Federal IDR pre-screening** — run claim through fednsa.maximus.com pre-check

**Resolution rule:** First source that returns definitive answer → classification confirmed
**Unresolvable rule:** If ALL 5 sources fail to resolve → ONLY then does a human touchpoint trigger, with specific reason documented

**Output:** Verified classification or human flag with specific question
**Gate:** Verified → Stage 4. Human flag → pause + notify with exact question needed

---

### STAGE 4 — FORUM ROUTING
**Based on verified classification:**

| Classification | Forum | System |
|---------------|-------|--------|
| NJ PIP/Auto | Forthright | nj-no-fault.com |
| NY No-Fault | NY DFS arbitration | state portal |
| Workers' Comp | State WC board | varies by state |
| Commercial OON (NSA eligible) | Federal IDR | fednsa.maximus.com |
| Commercial OON (state law governs) | State surprise billing forum | varies |
| Medicare | Medicare appeals process | CMS |

**Rule:** One forum. Never double-file. If genuinely dual-eligible (rare edge case) → document both options + auto-select primary with secondary noted.

**Output:** Confirmed forum assignment
**Gate:** Forum confirmed → Stage 5

---

### STAGE 5 — CALCULATION ENGINE
**For PIP/WC claims:**
- Look up CPT codes against fee schedule (NJ Exhibit 1, NY WCB, etc.)
- Apply modifier reductions (bilateral, multiple procedure, assistant surgeon, co-surgeon)
- Apply contract rates if applicable (from carrier_contracts table)
- Calculate allowed amount vs. carrier payment
- Calculate balance due
- Generate settlement options at configurable percentages

**For NSA/IDR claims:**
- Determine Qualifying Payment Amount (QPA) from EOB
- Apply IDR offer strategy (providers win 83-88% — offer above QPA)
- Calculate recommended offer amount

**Output:** Calculation results stored in pip_calculations / recovery_cases tables
**Gate:** Calculation complete → Stage 6

---

### STAGE 6 — DOCUMENT GENERATION
**AI generates:**
- Demand for Arbitration (pre-filled with all case data)
- Supporting documentation package
- Settlement offer letter at selected percentage
- Any required attachments per forum rules

**Output:** Ready-to-submit document package
**Gate:** Documents complete → Stage 7

---

### STAGE 7 — SUBMISSION
**Automated submission to:**
- Forthright portal (NJ PIP)
- State no-fault systems (NY)
- Federal IDR portal (NSA)
- State WC portals (workers' comp)

**Confirmation:** Filing confirmation number captured + stored
**Deadline tracking:** Calendar auto-set for response deadlines, follow-up triggers

**Output:** Filed case with confirmation + deadline calendar
**Gate:** Confirmation received → case moves to ACTIVE MONITORING

---

### STAGE 8 — ACTIVE MONITORING & RESPONSE
- Track all deadlines (response windows, hearing dates, appeal periods)
- Auto-alert when carrier responds
- Parse carrier responses for offer amounts
- Auto-evaluate: accept vs. counter vs. proceed to hearing
- Generate counter-offers or acceptance documents automatically

---

## Confidence Score System

Every classification gets a confidence score. Actions are gated by score:

| Score | Action |
|-------|--------|
| 95-100% | Fully automated, no review |
| 80-94% | Automated with verification step |
| 60-79% | External verification required before proceeding |
| <60% | Specific human question generated, file paused |

**The rule:** A file is NEVER filed in the wrong forum. It waits until classification is confirmed.

---

## What Eliminates Manual Review

1. **Known carrier database** — pre-built, continuously updated. Most carriers resolve at Stage 2 automatically.
2. **External API verification** — automated queries to CMS, state databases before any action
3. **Confidence thresholds** — nothing moves forward on a guess
4. **Pattern learning** — every resolved edge case trains the classifier. Over time, the <60% bucket shrinks toward zero.

---

## Human Touchpoints (By Design — Not Bugs)

These are the ONLY acceptable human touchpoints:
1. **Legally required signatures** (demand for arbitration, settlement agreements)
2. **Genuinely novel edge case** — carrier/coverage never seen before AND all 5 verification sources failed
3. **Strategic decision** — accept a settlement offer above threshold (Mark/team sets threshold, AI handles everything below)

Everything else: automated.

---

## Tuesday Meeting — Open Questions for Danny

1. What fields does PAD capture at intake? (determines what we extract vs. what we need to request)
2. What's the current classification accuracy rate? (establishes our baseline)
3. What are the most common wrong-forum filing scenarios? (tells us where to prioritize the classifier)
4. Does PAD have an API or do we connect directly to the database?
5. What's the current wrong-filing rate and cost? (establishes ROI of the new system)

---

_This is v1.0 — living document. Updates after Tuesday meeting._
