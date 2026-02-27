# Federal IDR Operations System — Process Specification
## No Surprises Act Independent Dispute Resolution

**Created:** 2026-02-27
**Purpose:** Replace/augment current PHP system for Federal IDR at scale
**Target:** 10,000 files/month by June 2026

---

## THE FEDERAL IDR PROCESS

### Timeline (Strict Deadlines)

```
CLAIM FILED
    │
    ▼ (30 calendar days)
INITIAL DETERMINATION (payment/denial from payer)
    │
    ▼ (within 30 business days of determination)
OPEN NEGOTIATION INITIATED ─────────────────┐
    │                                        │
    │ (30 business days)                     │
    ▼                                        │
NEGOTIATION ENDS                             │
    │                                        │
    ▼ (within 4 business days) ◄─── CRITICAL │
IDR INITIATION (if no agreement)             │
    │                                        │
    ▼ (within 10 business days)              │
IDR ENTITY SELECTED + OFFERS SUBMITTED       │
    │                                        │
    ▼ (within 30 business days)              │
IDR DETERMINATION (entity picks one offer)   │
    │                                        │
    ▼ (within 30 calendar days)              │
PAYMENT MADE                                 │
                                             │
TOTAL TIME: ~6 months ◄──────────────────────┘
```

### Critical Deadlines

| Phase | Deadline | Consequence of Miss |
|-------|----------|---------------------|
| Open negotiation initiation | 30 BD from determination | Lose IDR rights |
| IDR initiation | 4 BD after negotiation ends | Lose IDR rights |
| IDR entity selection | 3 BD after initiation | Departments select for you |
| Offer submission | 10 BD after initiation | Other party's offer auto-accepted |
| Payment post-determination | 30 CD | Compliance violation |

**BD = Business Days, CD = Calendar Days**

---

## SYSTEM REQUIREMENTS

### 1. Case Intake

**Required data per case:**
- Claim number(s)
- Date of service
- Provider NPI
- Facility NPI (if applicable)
- Payer ID
- Initial payment amount
- QPA (Qualifying Payment Amount) from payer
- Billed amount
- CPT/HCPCS codes
- Place of service
- Initial determination date ← CRITICAL for deadline calculation
- EOB (Explanation of Benefits)

**Batching eligibility check:**
Same provider + same payer + same/similar services + same time period = batch candidates

### 2. Deadline Engine

**Auto-calculate from initial determination date:**
```
determination_date = [input]

negotiation_must_start_by = add_business_days(determination_date, 30)
negotiation_ends = add_business_days(negotiation_start, 30)
idr_initiation_deadline = add_business_days(negotiation_ends, 4)
entity_selection_deadline = add_business_days(idr_initiation, 3)
offer_submission_deadline = add_business_days(idr_initiation, 10)
expected_determination = add_business_days(idr_initiation, 30)
payment_due = add_calendar_days(determination, 30)
```

**Alert thresholds:**
- 5 BD before deadline: Yellow alert
- 2 BD before deadline: Red alert
- 1 BD before deadline: Escalation to supervisor
- Deadline passed: Compliance flag

### 3. Open Negotiation Tracking

**Per negotiation:**
- Negotiation start date
- Negotiation end date (auto-calculated)
- Offers made (ours)
- Counter-offers received
- Communication log
- Agreement reached? Y/N
- If no agreement → auto-trigger IDR initiation prep

**Decision support:**
- Historical win rates vs. this payer
- QPA vs. billed amount ratio
- Similar case outcomes
- Recommended offer amount

### 4. IDR Portal Integration

**Actions to support:**
- Initiate dispute (Notice of IDR Initiation)
- Select certified IDR entity
- Submit offer and supporting documentation
- Track dispute status
- Receive determination
- Process payment/appeal

**Required attestations:**
- No conflicts of interest
- Items/services within Federal IDR scope
- Open negotiation completed

**Document assembly:**
- EOB
- Claim details
- CPT codes and descriptions
- Supporting rationale for offer amount
- QPA challenge documentation (if disputing QPA)

### 5. IDR Entity Selection

**Certified entities (as of 2025):**
- 15+ CMS-certified IDR entities
- Track historical outcomes per entity
- Recommend entity based on:
  - Win rate for similar disputes
  - Average determination time
  - Fee structure

**Fees (current):**
- Administrative fee: $115 per dispute
- IDR entity fee: $200-$840 (single) / $268-$1,173 (batched)
- Loser pays both fees

### 6. Offer Strategy Engine

**Inputs:**
- Billed amount
- QPA from payer
- Historical settlements for this CPT
- Payer-specific win rates
- IDR entity tendencies

**Outputs:**
- Recommended offer amount
- Confidence score
- Alternative offer scenarios
- Risk assessment

**Logic:**
```
IF qpa_challenge_viable:
    offer = higher_of(billed_amount * 0.8, regional_benchmark)
ELSE:
    offer = qpa * multiplier_based_on_complexity
    
ADJUST for:
    - Provider qualifications
    - Complexity of service
    - Market rates
    - Prior IDR outcomes
```

### 7. Batching Optimization

**CMS batching criteria:**
- Same provider or facility
- Same payer
- Same or similar items/services
- Related treatment or service period

**System logic:**
- Auto-identify batch candidates
- Calculate batch vs. individual economics
- Recommend batching strategy
- Track batch-level outcomes

**Economics:**
- Single dispute fee: $200-$840
- Batched dispute fee: $268-$1,173
- Break-even: ~2-3 claims per batch
- Optimal batch size: 5-10 claims

### 8. Outcome Tracking & Analytics

**Per determination:**
- Our offer
- Payer offer
- IDR entity selected
- Winning offer
- Determination date
- Payment received date
- Total recovered

**Analytics:**
- Win rate by payer
- Win rate by CPT code
- Win rate by IDR entity
- Average recovery vs. QPA
- Average recovery vs. billed
- Time-to-resolution
- Fee ROI

---

## DATABASE SCHEMA

```sql
-- Core tables for Federal IDR Operations

CREATE TABLE idr_cases (
    id uuid PRIMARY KEY,
    case_number varchar(50) UNIQUE,
    
    -- Service info
    date_of_service date NOT NULL,
    provider_npi varchar(10),
    facility_npi varchar(10),
    place_of_service varchar(2),
    
    -- Payer info
    payer_id varchar(50),
    payer_name varchar(255),
    
    -- Amounts
    billed_amount decimal(12,2),
    qpa decimal(12,2),
    initial_payment decimal(12,2),
    our_offer decimal(12,2),
    payer_offer decimal(12,2),
    final_determination decimal(12,2),
    
    -- CPT/Service codes (array for batching)
    cpt_codes varchar[],
    
    -- Status
    status varchar(30) NOT NULL DEFAULT 'intake',
    -- intake, negotiation, idr_initiated, entity_selected, 
    -- offers_submitted, awaiting_determination, determined, 
    -- payment_pending, closed, withdrawn
    
    -- Key dates
    determination_date date,  -- Initial payer determination
    negotiation_start_date date,
    negotiation_end_date date,
    idr_initiation_date date,
    entity_selection_date date,
    offer_submission_date date,
    idr_determination_date date,
    payment_received_date date,
    
    -- Deadlines (auto-calculated)
    negotiation_deadline date,
    idr_initiation_deadline date,
    entity_selection_deadline date,
    offer_submission_deadline date,
    
    -- IDR specifics
    idr_entity_id uuid REFERENCES idr_entities(id),
    idr_reference_number varchar(50),
    we_won boolean,
    
    -- Batching
    batch_id uuid REFERENCES idr_batches(id),
    is_batched boolean DEFAULT false,
    
    -- Documents
    eob_document_url text,
    supporting_docs jsonb,
    
    -- Fees
    admin_fee_paid decimal(8,2),
    entity_fee_paid decimal(8,2),
    total_fees decimal(8,2),
    
    -- Meta
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by varchar(50),
    notes text
);

CREATE TABLE idr_negotiations (
    id uuid PRIMARY KEY,
    case_id uuid REFERENCES idr_cases(id),
    
    -- Dates
    started_at timestamptz,
    ends_at timestamptz,  -- 30 BD from start
    
    -- Offers
    our_initial_offer decimal(12,2),
    payer_initial_offer decimal(12,2),
    
    -- Communication log
    communications jsonb,  -- Array of {date, type, content, from}
    
    -- Outcome
    agreement_reached boolean,
    agreed_amount decimal(12,2),
    
    created_at timestamptz DEFAULT now()
);

CREATE TABLE idr_entities (
    id uuid PRIMARY KEY,
    name varchar(255) NOT NULL,
    cms_certification_number varchar(50),
    
    -- Contact
    email varchar(255),
    phone varchar(20),
    website varchar(255),
    
    -- Fees
    single_fee_low decimal(8,2),
    single_fee_high decimal(8,2),
    batch_fee_low decimal(8,2),
    batch_fee_high decimal(8,2),
    
    -- Performance (our data)
    total_disputes int DEFAULT 0,
    wins int DEFAULT 0,
    losses int DEFAULT 0,
    win_rate decimal(5,2),
    avg_determination_days int,
    
    -- Status
    is_active boolean DEFAULT true,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE idr_batches (
    id uuid PRIMARY KEY,
    batch_number varchar(50) UNIQUE,
    
    -- Grouping criteria
    provider_npi varchar(10),
    payer_id varchar(50),
    service_type varchar(50),
    date_range_start date,
    date_range_end date,
    
    -- Counts
    case_count int,
    total_billed decimal(14,2),
    total_qpa decimal(14,2),
    
    -- Status
    status varchar(30),
    
    -- IDR info
    idr_entity_id uuid REFERENCES idr_entities(id),
    our_batch_offer decimal(14,2),
    payer_batch_offer decimal(14,2),
    determination_amount decimal(14,2),
    
    created_at timestamptz DEFAULT now()
);

CREATE TABLE idr_deadlines (
    id uuid PRIMARY KEY,
    case_id uuid REFERENCES idr_cases(id),
    
    deadline_type varchar(30),  
    -- negotiation_start, negotiation_end, idr_initiation, 
    -- entity_selection, offer_submission, payment_due
    
    deadline_date date NOT NULL,
    
    -- Alerts
    alert_5bd_sent boolean DEFAULT false,
    alert_2bd_sent boolean DEFAULT false,
    alert_1bd_sent boolean DEFAULT false,
    escalation_sent boolean DEFAULT false,
    
    -- Status
    completed boolean DEFAULT false,
    completed_at timestamptz,
    missed boolean DEFAULT false,
    
    created_at timestamptz DEFAULT now()
);

CREATE TABLE idr_payer_analytics (
    id uuid PRIMARY KEY,
    payer_id varchar(50) UNIQUE,
    payer_name varchar(255),
    
    -- Volume
    total_disputes int DEFAULT 0,
    total_billed decimal(14,2),
    total_recovered decimal(14,2),
    
    -- Win rates
    wins int DEFAULT 0,
    losses int DEFAULT 0,
    win_rate decimal(5,2),
    
    -- QPA patterns
    avg_qpa_to_billed_ratio decimal(5,2),
    avg_offer_to_qpa_ratio decimal(5,2),
    
    -- Negotiation patterns
    avg_negotiation_settlement_rate decimal(5,2),
    avg_settlement_to_billed_ratio decimal(5,2),
    
    -- Timing
    avg_days_to_determination int,
    avg_days_to_payment int,
    
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_idr_cases_status ON idr_cases(status);
CREATE INDEX idx_idr_cases_payer ON idr_cases(payer_id);
CREATE INDEX idx_idr_cases_deadlines ON idr_cases(idr_initiation_deadline);
CREATE INDEX idx_idr_deadlines_date ON idr_deadlines(deadline_date);
CREATE INDEX idx_idr_deadlines_pending ON idr_deadlines(deadline_date) 
    WHERE completed = false AND missed = false;

-- Views
CREATE VIEW idr_upcoming_deadlines AS
SELECT 
    d.id,
    d.case_id,
    c.case_number,
    d.deadline_type,
    d.deadline_date,
    d.deadline_date - CURRENT_DATE as days_until,
    c.payer_name,
    c.billed_amount
FROM idr_deadlines d
JOIN idr_cases c ON c.id = d.case_id
WHERE d.completed = false 
  AND d.missed = false
  AND d.deadline_date >= CURRENT_DATE
ORDER BY d.deadline_date;

CREATE VIEW idr_dashboard_summary AS
SELECT 
    status,
    count(*) as case_count,
    sum(billed_amount) as total_billed,
    sum(qpa) as total_qpa,
    avg(billed_amount) as avg_billed
FROM idr_cases
GROUP BY status;
```

---

## AI LEVERAGE POINTS

### 1. Offer Optimization
- Analyze historical outcomes
- Predict win probability at different offer levels
- Recommend optimal offer based on payer, CPT, entity

### 2. QPA Challenge Identification
- Flag cases where QPA appears miscalculated
- Generate challenge documentation
- Track QPA challenge success rates

### 3. Batching Intelligence
- Auto-identify optimal batch groupings
- Calculate ROI of batching vs. individual
- Predict batch outcomes

### 4. Deadline Management
- Zero missed deadlines (automated alerts + escalation)
- Predictive workload balancing
- Resource allocation recommendations

### 5. Payer Pattern Recognition
- Identify payer-specific negotiation strategies
- Predict payer counter-offers
- Recommend negotiation tactics

### 6. Entity Selection
- Track entity-specific tendencies
- Match cases to favorable entities
- Optimize entity selection for batch vs. single

### 7. Document Assembly
- Auto-generate offer submissions
- Compile supporting documentation
- Ensure completeness before submission

---

## INTEGRATION REQUIREMENTS

### With Current PHP System
- Data migration path
- Parallel operation during transition
- Legacy system sunset plan

### With Federal IDR Portal
- API integration (if available) or
- Browser automation for submissions
- Status polling and updates

### With Payer Systems
- EOB ingestion
- QPA capture
- Payment verification

---

## SCALE TARGETS

| Metric | Current (est.) | Target (June 2026) |
|--------|----------------|-------------------|
| Cases/month | ? | 10,000 |
| Manual touches/case | ? | <3 |
| Deadline miss rate | ? | 0% |
| Win rate | ? | >60% |
| Avg recovery vs QPA | ? | >1.5x |

---

## NEXT STEPS

1. **Understand current state** — What does the PHP system track? What's manual?
2. **Map data model** — Identify gaps between current schema and this spec
3. **Build deadline engine** — Most critical for compliance
4. **Build analytics layer** — Win rates, payer patterns
5. **Build decision support** — Offer recommendations, entity selection

---

*This spec is built from CMS public documentation. Adjust based on your actual operational experience.*
