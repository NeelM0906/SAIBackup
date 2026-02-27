# Federal IDR AI Modules
## Where AI Creates Leverage at Scale

**Created:** 2026-02-27
**Target:** 10,000 files/month with <3 manual touches per case

---

## MODULE 1: Intake Automation

### Function
Auto-process incoming claims into IDR-ready cases.

### Inputs
- EOB documents (PDF, image, or structured data)
- Claim files from payer portals
- Provider billing data

### AI Tasks
1. **OCR/Extraction** — Pull key fields from EOB documents
   - Claim number
   - Date of service
   - CPT codes
   - Billed amount
   - Allowed amount
   - QPA (if shown)
   - Denial reason (if applicable)

2. **Validation** — Confirm IDR eligibility
   - Emergency/OON service type
   - ERISA vs non-ERISA plan
   - State vs Federal IDR applicability
   - Within statutory timeline

3. **Enrichment** — Add derived data
   - Provider NPI lookup
   - Payer ID standardization
   - Historical recovery patterns for this payer/CPT

4. **Deadline Calculation** — Auto-set all deadlines from determination date

### Output
Complete `idr_cases` record + `idr_deadlines` entries

### Human Touch: 0
Fully automated intake with exception queue for unclear cases.

---

## MODULE 2: Deadline Guardian

### Function
Zero missed deadlines. Ever.

### Logic
```
EVERY DAY at 6 AM:

FOR each pending deadline:
    days_until = deadline_date - today
    
    IF days_until <= 5 AND NOT alert_5bd_sent:
        SEND yellow alert to assigned_to
        SET alert_5bd_sent = now()
    
    IF days_until <= 2 AND NOT alert_2bd_sent:
        SEND red alert to assigned_to + supervisor
        SET alert_2bd_sent = now()
    
    IF days_until <= 1 AND NOT alert_1bd_sent:
        SEND critical alert to team + Mark
        SET alert_1bd_sent = now()
    
    IF days_until < 0 AND status = 'pending':
        SET status = 'missed'
        SEND compliance alert to leadership
        LOG to audit
```

### Escalation Chain
1. Day 5: Assigned user
2. Day 2: Assigned user + supervisor
3. Day 1: Team + operations lead
4. Day 0: Leadership + compliance flag

### Human Touch: 0 (unless escalation)
System enforces deadlines; humans only involved if intervention needed.

---

## MODULE 3: Negotiation Intelligence

### Function
Optimize negotiation strategy and automate offer generation.

### Pre-Negotiation Analysis
```
FOR new negotiation:
    
    # Historical patterns
    payer_stats = GET payer performance (win rate, avg settlement, typical offers)
    cpt_stats = GET CPT recovery patterns
    
    # Calculate recommended offer
    IF payer_negotiation_success_rate > 0.3:
        initial_offer = billed_amount * 0.85  # Start high, room to negotiate
    ELSE:
        initial_offer = MAX(qpa * 1.5, regional_benchmark)  # Position for IDR
    
    # Generate offer rationale
    rationale = AI_GENERATE based on:
        - Provider qualifications
        - Complexity of service
        - Market rate data
        - QPA challenge arguments (if applicable)
```

### During Negotiation
- Track all communications
- Suggest counter-offer amounts
- Flag when settlement is advantageous vs going to IDR
- Calculate break-even (settlement value vs IDR costs + risk)

### Settlement Decision Support
```
settlement_value = proposed_settlement
idr_expected_value = (win_probability * our_offer) + ((1 - win_probability) * payer_offer)
idr_cost = admin_fee + expected_entity_fee
idr_net = idr_expected_value - idr_cost

IF settlement_value > idr_net:
    RECOMMEND: "Accept settlement"
ELSE:
    RECOMMEND: "Proceed to IDR"
```

### Human Touch: 1
Review AI recommendation, approve/modify offer.

---

## MODULE 4: Offer Generation

### Function
Auto-generate IDR offer submissions with supporting documentation.

### Offer Package Assembly
1. **Offer Amount** — Based on Module 3 analysis
2. **Supporting Narrative** — AI-generated rationale
3. **Documentation Bundle**
   - EOB
   - Claim details
   - CPT code descriptions
   - Market rate evidence
   - Provider qualifications
   - QPA challenge (if applicable)

### Narrative Template
```
RE: IDR Dispute [Reference Number]
Provider: [Name] | NPI: [NPI]
Date of Service: [DOS]
CPT Code(s): [Codes] - [Descriptions]
Billed Amount: $[Billed]
Payer Initial Payment: $[Payment]
Provider Offer: $[Our Offer]

SUPPORTING RATIONALE:

1. SERVICE COMPLEXITY
[AI-generated based on CPT codes and provider specialty]

2. MARKET RATE ANALYSIS
[AI-generated based on regional benchmarks and similar services]

3. PROVIDER QUALIFICATIONS
[AI-generated based on provider specialty, training, experience]

4. QPA CONSIDERATIONS
[IF challenging QPA: AI-generated QPA challenge arguments]
[IF accepting QPA: Explanation of why offer exceeds QPA]

Based on the above factors, we respectfully submit an offer of $[Amount].
```

### Human Touch: 1
Review generated offer, modify if needed, approve submission.

---

## MODULE 5: Entity Selection Intelligence

### Function
Select optimal IDR entity for each case/batch.

### Selection Criteria
```
FOR case requiring entity selection:
    
    entities = GET all active certified entities
    
    FOR each entity:
        score = 0
        
        # Win rate with this payer
        payer_win_rate = GET entity wins vs this payer
        score += payer_win_rate * 30
        
        # Win rate with this CPT category
        cpt_win_rate = GET entity wins for similar CPTs
        score += cpt_win_rate * 25
        
        # Speed
        IF entity.avg_determination_days < 20:
            score += 15
        ELIF entity.avg_determination_days < 30:
            score += 10
        
        # Fee efficiency
        IF entity.fee <= median_fee:
            score += 10
        
        # Batch friendliness (if batched case)
        IF is_batched AND entity.batch_success_rate > 0.6:
            score += 20
        
    RETURN entity with highest score
```

### Output
Ranked list of entities with scores and rationale.

### Human Touch: 0.5
AI selects, human confirms with one click.

---

## MODULE 6: Batching Optimizer

### Function
Identify optimal batch groupings to minimize fees and maximize wins.

### Batch Identification
```
DAILY at 7 AM:

# Find batch candidates
candidates = SELECT FROM idr_cases
    WHERE status = 'negotiation_ended'
    AND is_batched = false
    GROUP BY provider_npi, payer_id, service_type
    HAVING count(*) >= 2

FOR each candidate group:
    
    # Calculate economics
    individual_fees = count * avg_entity_fee
    batch_fee = batch_fee_for_count(count)
    fee_savings = individual_fees - batch_fee
    
    # Calculate win probability
    batch_win_prob = estimate_batch_win_probability(cases)
    
    # ROI
    batch_roi = (fee_savings + (batch_win_prob * total_underpayment)) / batch_fee
    
    IF batch_roi > 1.5:
        RECOMMEND batching
        CREATE batch record
        ALERT team
```

### Batch Composition Rules
- Same provider NPI
- Same payer
- Same or related service types
- Service dates within reasonable range
- No conflicting case facts

### Human Touch: 0.5
AI identifies and proposes batches, human approves with one click.

---

## MODULE 7: Outcome Learning

### Function
Continuously improve predictions based on actual outcomes.

### After Each Determination
```
ON determination_received:
    
    # Record outcome
    UPDATE case with determination, we_won
    
    # Update payer stats
    UPDATE idr_payer_stats for this payer
    
    # Update CPT stats
    UPDATE idr_cpt_stats for these CPTs
    
    # Update entity stats
    UPDATE idr_entities for this entity
    
    # Analyze what worked/didn't
    IF we_won:
        IDENTIFY winning factors (offer amount, rationale, entity, etc.)
        STRENGTHEN these patterns in model
    ELSE:
        IDENTIFY losing factors
        ADJUST recommendations to avoid
    
    # Recalibrate recommendations
    RETRAIN offer recommendation model with new data
```

### Pattern Mining
- Which rationale elements correlate with wins?
- Which offer-to-QPA ratios win most often?
- Which entities favor providers vs payers?
- Which payers are worth fighting vs settling?

### Human Touch: 0
Fully automated learning loop.

---

## MODULE 8: Reporting & Analytics

### Function
Real-time visibility into IDR operations.

### Dashboards

**Operations Dashboard**
- Cases by status (pipeline)
- Upcoming deadlines (next 14 days)
- Cases needing action
- Team workload distribution

**Financial Dashboard**
- Total billed in pipeline
- Expected recovery (probability-weighted)
- Actual recovered (MTD, YTD)
- Fee ROI analysis

**Performance Dashboard**
- Win rate (overall, by payer, by CPT, by entity)
- Average recovery vs QPA
- Average recovery vs billed
- Time-to-resolution trends

**Compliance Dashboard**
- Deadline adherence rate
- Missed deadlines (should be 0)
- Audit log activity

### Reports
- Daily action list (auto-emailed to team)
- Weekly summary (to leadership)
- Monthly performance review
- Payer-specific win/loss analysis

### Human Touch: 0
Auto-generated and distributed.

---

## IMPLEMENTATION PRIORITY

### Phase 1: Foundation (Critical)
1. **Deadline Guardian** — Zero missed deadlines is non-negotiable
2. **Intake Automation** — Volume depends on efficient ingestion
3. **Schema deployment** — Database must exist

### Phase 2: Intelligence (High Value)
4. **Negotiation Intelligence** — Optimize offers
5. **Offer Generation** — Reduce human writing time
6. **Entity Selection** — Improve win rates

### Phase 3: Scale (10K/month)
7. **Batching Optimizer** — Reduce fees at scale
8. **Outcome Learning** — Continuous improvement

### Phase 4: Visibility
9. **Reporting & Analytics** — Dashboards and insights

---

## INTEGRATION WITH CURRENT PHP SYSTEM

### Option A: Replace
Build new system from scratch using this spec. Migrate data.

### Option B: Augment
Keep PHP for data entry, add AI layer on top:
- Sync data from PHP to new schema
- AI modules read from new schema
- Recommendations pushed back to PHP (or displayed separately)
- Gradually shift operations to new system

### Option C: Hybrid
- New intake goes to new system
- Old cases stay in PHP until closed
- AI serves both during transition

**Recommendation:** Option B or C — don't block on full replacement.

---

## SCALE MATH

**Target:** 10,000 files/month

**Current manual touches per case:** [Unknown — need input]

**With AI modules:**
| Phase | Manual Touches | Cases/Person/Day |
|-------|----------------|------------------|
| Intake | 0 (auto) | ∞ |
| Negotiation | 1 (approve offer) | 50+ |
| IDR Submission | 1 (review + submit) | 30+ |
| Determination | 0 (auto-process) | ∞ |
| Payment | 0.5 (verify) | 100+ |

**Bottleneck:** Human review of offers/submissions

**At 30 cases/person/day, need:** ~17 people processing full-time
**At 50 cases/person/day, need:** ~10 people processing full-time

**AI goal:** Push toward 50+ cases/person/day by:
- Better offer auto-generation (less editing needed)
- Batch processing (one review = multiple cases)
- Exception-only workflow (only touch problems)

---

*These modules are designed to work with the IDR-SCHEMA.sql tables. Deploy schema first, then build modules incrementally.*
