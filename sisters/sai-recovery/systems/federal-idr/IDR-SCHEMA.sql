-- Federal IDR Operations System — Database Schema
-- No Surprises Act Independent Dispute Resolution
-- Created: 2026-02-27
-- Target: 10,000 files/month by June 2026

-- ============================================
-- CORE TABLES
-- ============================================

-- Main case table
CREATE TABLE idr_cases (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_number varchar(50) UNIQUE NOT NULL,
    
    -- Provider info
    provider_npi varchar(10),
    provider_name varchar(255),
    facility_npi varchar(10),
    facility_name varchar(255),
    place_of_service varchar(2),
    
    -- Payer info
    payer_id varchar(50),
    payer_name varchar(255),
    plan_type varchar(30),  -- erisa, non_erisa, fehb
    
    -- Patient (limited PHI)
    claim_number varchar(50),
    patient_id_hash varchar(64),  -- Hashed for privacy
    
    -- Service info
    date_of_service date NOT NULL,
    cpt_codes varchar[] NOT NULL,
    cpt_descriptions text[],
    service_type varchar(30),  -- emergency, post_stabilization, oon_facility, air_ambulance
    
    -- Amounts
    billed_amount decimal(12,2) NOT NULL,
    qpa decimal(12,2),
    qpa_methodology text,  -- How payer calculated QPA
    initial_payment decimal(12,2),
    underpayment decimal(12,2) GENERATED ALWAYS AS (billed_amount - COALESCE(initial_payment, 0)) STORED,
    
    -- Our analysis
    our_calculated_fair_value decimal(12,2),
    our_offer decimal(12,2),
    offer_rationale text,
    
    -- Payer's position
    payer_offer decimal(12,2),
    payer_rationale text,
    
    -- Outcome
    final_determination decimal(12,2),
    recovered_amount decimal(12,2),
    
    -- Status
    status varchar(30) NOT NULL DEFAULT 'intake',
    -- intake, open_negotiation, negotiation_ended, idr_initiated, 
    -- entity_selected, offers_submitted, awaiting_determination, 
    -- determined_win, determined_loss, payment_received, closed, withdrawn
    
    -- Key dates (inputs)
    initial_determination_date date NOT NULL,  -- When payer issued determination
    negotiation_started_date date,
    negotiation_ended_date date,
    idr_initiated_date date,
    entity_selected_date date,
    offers_submitted_date date,
    idr_determination_date date,
    payment_received_date date,
    
    -- Deadlines (calculated)
    negotiation_must_start_by date,
    negotiation_ends_by date,
    idr_initiation_deadline date,
    entity_selection_deadline date,
    offer_submission_deadline date,
    expected_determination_by date,
    payment_due_by date,
    
    -- IDR specifics
    idr_reference_number varchar(50),
    idr_entity_id uuid REFERENCES idr_entities(id),
    we_initiated boolean,  -- true = we initiated, false = payer initiated
    we_won boolean,
    
    -- Batching
    batch_id uuid REFERENCES idr_batches(id),
    is_batched boolean DEFAULT false,
    
    -- Documents
    eob_url text,
    documents jsonb DEFAULT '[]',
    -- Array of {type, url, uploaded_at, description}
    
    -- Fees
    admin_fee decimal(8,2) DEFAULT 115.00,
    entity_fee decimal(8,2),
    total_fees decimal(8,2),
    fees_recovered boolean DEFAULT false,  -- Loser pays, did we recover?
    
    -- Assignment
    assigned_to varchar(100),
    priority int DEFAULT 5,  -- 1=highest, 10=lowest
    
    -- Meta
    notes text,
    tags varchar[] DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by varchar(50)
);

-- Negotiation tracking
CREATE TABLE idr_negotiations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid REFERENCES idr_cases(id) ON DELETE CASCADE,
    
    -- Dates
    started_at date NOT NULL,
    ends_at date NOT NULL,  -- 30 BD from start
    
    -- Initial positions
    our_initial_offer decimal(12,2),
    payer_initial_position decimal(12,2),  -- Usually the QPA/initial payment
    
    -- Final positions (if no agreement)
    our_final_offer decimal(12,2),
    payer_final_offer decimal(12,2),
    
    -- Outcome
    agreement_reached boolean DEFAULT false,
    agreed_amount decimal(12,2),
    
    -- Stats
    rounds_of_negotiation int DEFAULT 0,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Negotiation communications
CREATE TABLE idr_negotiation_comms (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    negotiation_id uuid REFERENCES idr_negotiations(id) ON DELETE CASCADE,
    
    comm_date timestamptz NOT NULL,
    direction varchar(10),  -- inbound, outbound
    method varchar(20),  -- email, phone, portal, letter
    
    -- Content
    our_offer decimal(12,2),
    their_offer decimal(12,2),
    summary text,
    
    -- Attachments
    attachments jsonb DEFAULT '[]',
    
    created_at timestamptz DEFAULT now(),
    created_by varchar(50)
);

-- Certified IDR entities
CREATE TABLE idr_entities (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name varchar(255) NOT NULL,
    cms_id varchar(50),
    
    -- Contact
    email varchar(255),
    phone varchar(20),
    website varchar(255),
    portal_url varchar(500),
    
    -- Fee schedule
    single_fee_min decimal(8,2),
    single_fee_max decimal(8,2),
    batch_fee_min decimal(8,2),
    batch_fee_max decimal(8,2),
    
    -- Our performance data
    total_disputes int DEFAULT 0,
    wins int DEFAULT 0,
    losses int DEFAULT 0,
    win_rate decimal(5,4) GENERATED ALWAYS AS (
        CASE WHEN total_disputes > 0 
        THEN wins::decimal / total_disputes 
        ELSE 0 END
    ) STORED,
    
    -- Timing
    avg_determination_days int,
    
    -- Preferences
    preferred_for varchar[],  -- Array of service types or payers
    avoid_for varchar[],
    
    -- Status
    is_active boolean DEFAULT true,
    notes text,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Batches
CREATE TABLE idr_batches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_number varchar(50) UNIQUE NOT NULL,
    
    -- Grouping criteria
    provider_npi varchar(10),
    payer_id varchar(50),
    service_type varchar(50),
    date_range_start date,
    date_range_end date,
    
    -- Aggregates (calculated from member cases)
    case_count int DEFAULT 0,
    total_billed decimal(14,2) DEFAULT 0,
    total_qpa decimal(14,2) DEFAULT 0,
    total_initial_payment decimal(14,2) DEFAULT 0,
    total_underpayment decimal(14,2) DEFAULT 0,
    
    -- Batch offer
    our_batch_offer decimal(14,2),
    payer_batch_offer decimal(14,2),
    
    -- Status
    status varchar(30) DEFAULT 'forming',
    -- forming, ready, submitted, awaiting_determination, determined, closed
    
    -- IDR
    idr_entity_id uuid REFERENCES idr_entities(id),
    idr_reference_number varchar(50),
    determination_amount decimal(14,2),
    we_won boolean,
    
    -- Fees
    admin_fee decimal(8,2),
    entity_fee decimal(8,2),
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Deadline tracking with alerts
CREATE TABLE idr_deadlines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid REFERENCES idr_cases(id) ON DELETE CASCADE,
    batch_id uuid REFERENCES idr_batches(id) ON DELETE CASCADE,
    
    deadline_type varchar(30) NOT NULL,
    -- negotiation_start, negotiation_end, idr_initiation,
    -- entity_selection, offer_submission, payment_due
    
    deadline_date date NOT NULL,
    business_days_remaining int,  -- Updated daily by cron
    
    -- Alert tracking
    alert_5bd_sent_at timestamptz,
    alert_2bd_sent_at timestamptz,
    alert_1bd_sent_at timestamptz,
    escalation_sent_at timestamptz,
    
    -- Status
    status varchar(20) DEFAULT 'pending',
    -- pending, completed, missed, waived
    completed_at timestamptz,
    completed_by varchar(50),
    
    -- Notes
    notes text,
    
    created_at timestamptz DEFAULT now()
);

-- Payer analytics (aggregated)
CREATE TABLE idr_payer_stats (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    payer_id varchar(50) UNIQUE NOT NULL,
    payer_name varchar(255),
    
    -- Volume
    total_cases int DEFAULT 0,
    total_disputes int DEFAULT 0,
    total_billed decimal(14,2) DEFAULT 0,
    total_qpa decimal(14,2) DEFAULT 0,
    total_recovered decimal(14,2) DEFAULT 0,
    
    -- Negotiation stats
    negotiation_settlements int DEFAULT 0,
    negotiation_settlement_rate decimal(5,4),
    avg_settlement_vs_billed decimal(5,4),
    
    -- IDR stats
    idr_wins int DEFAULT 0,
    idr_losses int DEFAULT 0,
    idr_win_rate decimal(5,4),
    avg_determination_vs_qpa decimal(5,4),
    avg_determination_vs_billed decimal(5,4),
    
    -- QPA patterns
    avg_qpa_vs_billed decimal(5,4),
    qpa_challenge_success_rate decimal(5,4),
    
    -- Timing
    avg_days_to_payment int,
    
    -- Strategy notes
    negotiation_strategy text,
    typical_qpa_methodology text,
    
    updated_at timestamptz DEFAULT now()
);

-- CPT code reference with recovery patterns
CREATE TABLE idr_cpt_stats (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    cpt_code varchar(10) UNIQUE NOT NULL,
    description text,
    category varchar(50),
    
    -- Pricing benchmarks
    medicare_rate decimal(10,2),
    avg_commercial_rate decimal(10,2),
    avg_billed decimal(10,2),
    avg_qpa decimal(10,2),
    
    -- Recovery patterns
    total_disputes int DEFAULT 0,
    wins int DEFAULT 0,
    win_rate decimal(5,4),
    avg_recovery_vs_billed decimal(5,4),
    avg_recovery_vs_qpa decimal(5,4),
    
    -- Recommendations
    recommended_offer_multiplier decimal(5,2),  -- e.g., 1.5 = 150% of QPA
    
    updated_at timestamptz DEFAULT now()
);

-- Audit log for compliance
CREATE TABLE idr_audit_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Reference
    case_id uuid REFERENCES idr_cases(id),
    batch_id uuid REFERENCES idr_batches(id),
    
    -- Action
    action varchar(50) NOT NULL,
    -- created, updated, status_changed, deadline_met, deadline_missed,
    -- offer_submitted, determination_received, payment_received
    
    -- Details
    old_value jsonb,
    new_value jsonb,
    description text,
    
    -- Actor
    performed_by varchar(50),
    performed_at timestamptz DEFAULT now(),
    
    -- System info
    ip_address varchar(45),
    user_agent text
);

-- ============================================
-- INDEXES
-- ============================================

-- Cases
CREATE INDEX idx_idr_cases_status ON idr_cases(status);
CREATE INDEX idx_idr_cases_payer ON idr_cases(payer_id);
CREATE INDEX idx_idr_cases_provider ON idr_cases(provider_npi);
CREATE INDEX idx_idr_cases_service_date ON idr_cases(date_of_service);
CREATE INDEX idx_idr_cases_determination_date ON idr_cases(initial_determination_date);
CREATE INDEX idx_idr_cases_assigned ON idr_cases(assigned_to);
CREATE INDEX idx_idr_cases_batch ON idr_cases(batch_id);

-- Deadlines
CREATE INDEX idx_idr_deadlines_date ON idr_deadlines(deadline_date);
CREATE INDEX idx_idr_deadlines_pending ON idr_deadlines(deadline_date) 
    WHERE status = 'pending';
CREATE INDEX idx_idr_deadlines_case ON idr_deadlines(case_id);

-- Batches
CREATE INDEX idx_idr_batches_status ON idr_batches(status);
CREATE INDEX idx_idr_batches_payer ON idr_batches(payer_id);

-- Audit
CREATE INDEX idx_idr_audit_case ON idr_audit_log(case_id);
CREATE INDEX idx_idr_audit_time ON idr_audit_log(performed_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER idr_cases_updated_at
    BEFORE UPDATE ON idr_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER idr_negotiations_updated_at
    BEFORE UPDATE ON idr_negotiations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER idr_entities_updated_at
    BEFORE UPDATE ON idr_entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER idr_batches_updated_at
    BEFORE UPDATE ON idr_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-calculate deadlines when determination date is set
CREATE OR REPLACE FUNCTION calculate_idr_deadlines()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.initial_determination_date IS NOT NULL THEN
        -- These are estimates; actual business day calculation needed in app layer
        NEW.negotiation_must_start_by = NEW.initial_determination_date + INTERVAL '45 days';  -- ~30 BD
        NEW.negotiation_ends_by = NEW.negotiation_must_start_by + INTERVAL '45 days';  -- ~30 BD
        NEW.idr_initiation_deadline = NEW.negotiation_ends_by + INTERVAL '6 days';  -- ~4 BD
        NEW.entity_selection_deadline = NEW.idr_initiation_deadline + INTERVAL '5 days';  -- ~3 BD
        NEW.offer_submission_deadline = NEW.idr_initiation_deadline + INTERVAL '15 days';  -- ~10 BD
        NEW.expected_determination_by = NEW.offer_submission_deadline + INTERVAL '45 days';  -- ~30 BD
        NEW.payment_due_by = NEW.expected_determination_by + INTERVAL '30 days';  -- 30 CD
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER idr_cases_calc_deadlines
    BEFORE INSERT OR UPDATE OF initial_determination_date
    ON idr_cases
    FOR EACH ROW EXECUTE FUNCTION calculate_idr_deadlines();

-- ============================================
-- VIEWS
-- ============================================

-- Dashboard summary
CREATE VIEW idr_dashboard AS
SELECT 
    status,
    count(*) as case_count,
    sum(billed_amount) as total_billed,
    sum(underpayment) as total_underpayment,
    sum(recovered_amount) as total_recovered,
    avg(billed_amount)::decimal(12,2) as avg_billed
FROM idr_cases
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'intake' THEN 1
        WHEN 'open_negotiation' THEN 2
        WHEN 'negotiation_ended' THEN 3
        WHEN 'idr_initiated' THEN 4
        WHEN 'entity_selected' THEN 5
        WHEN 'offers_submitted' THEN 6
        WHEN 'awaiting_determination' THEN 7
        WHEN 'determined_win' THEN 8
        WHEN 'determined_loss' THEN 9
        WHEN 'payment_received' THEN 10
        WHEN 'closed' THEN 11
        ELSE 99
    END;

-- Upcoming deadlines (next 10 business days)
CREATE VIEW idr_urgent_deadlines AS
SELECT 
    d.id,
    d.case_id,
    c.case_number,
    d.deadline_type,
    d.deadline_date,
    d.deadline_date - CURRENT_DATE as calendar_days_until,
    d.business_days_remaining,
    c.payer_name,
    c.billed_amount,
    c.assigned_to,
    CASE 
        WHEN d.deadline_date - CURRENT_DATE <= 1 THEN 'critical'
        WHEN d.deadline_date - CURRENT_DATE <= 3 THEN 'urgent'
        WHEN d.deadline_date - CURRENT_DATE <= 7 THEN 'upcoming'
        ELSE 'normal'
    END as urgency
FROM idr_deadlines d
JOIN idr_cases c ON c.id = d.case_id
WHERE d.status = 'pending'
  AND d.deadline_date >= CURRENT_DATE
  AND d.deadline_date <= CURRENT_DATE + INTERVAL '14 days'
ORDER BY d.deadline_date, c.billed_amount DESC;

-- Payer performance
CREATE VIEW idr_payer_performance AS
SELECT 
    payer_id,
    payer_name,
    count(*) as total_cases,
    sum(CASE WHEN status LIKE 'determined%' THEN 1 ELSE 0 END) as completed_disputes,
    sum(CASE WHEN we_won = true THEN 1 ELSE 0 END) as wins,
    sum(CASE WHEN we_won = false THEN 1 ELSE 0 END) as losses,
    CASE WHEN sum(CASE WHEN status LIKE 'determined%' THEN 1 ELSE 0 END) > 0
        THEN (sum(CASE WHEN we_won = true THEN 1 ELSE 0 END)::decimal / 
              sum(CASE WHEN status LIKE 'determined%' THEN 1 ELSE 0 END))
        ELSE 0 
    END as win_rate,
    sum(billed_amount) as total_billed,
    sum(recovered_amount) as total_recovered,
    avg(qpa / NULLIF(billed_amount, 0))::decimal(5,4) as avg_qpa_vs_billed
FROM idr_cases
WHERE payer_id IS NOT NULL
GROUP BY payer_id, payer_name
ORDER BY total_cases DESC;

-- Cases needing action
CREATE VIEW idr_action_required AS
SELECT 
    c.*,
    d.deadline_type as next_deadline_type,
    d.deadline_date as next_deadline,
    d.deadline_date - CURRENT_DATE as days_until_deadline
FROM idr_cases c
LEFT JOIN LATERAL (
    SELECT deadline_type, deadline_date
    FROM idr_deadlines
    WHERE case_id = c.id AND status = 'pending'
    ORDER BY deadline_date
    LIMIT 1
) d ON true
WHERE c.status NOT IN ('closed', 'withdrawn', 'payment_received')
ORDER BY d.deadline_date NULLS LAST, c.billed_amount DESC;

-- Batch candidates
CREATE VIEW idr_batch_candidates AS
SELECT 
    provider_npi,
    payer_id,
    payer_name,
    service_type,
    count(*) as eligible_cases,
    sum(billed_amount) as total_billed,
    sum(underpayment) as total_underpayment,
    min(date_of_service) as earliest_service,
    max(date_of_service) as latest_service
FROM idr_cases
WHERE status = 'negotiation_ended'
  AND is_batched = false
  AND batch_id IS NULL
GROUP BY provider_npi, payer_id, payer_name, service_type
HAVING count(*) >= 2
ORDER BY sum(underpayment) DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Calculate business days between dates
CREATE OR REPLACE FUNCTION business_days_between(start_date date, end_date date)
RETURNS int AS $$
DECLARE
    total_days int;
    weekend_days int;
BEGIN
    total_days := end_date - start_date;
    weekend_days := (total_days / 7) * 2;
    
    -- Adjust for partial weeks
    IF EXTRACT(DOW FROM start_date) > EXTRACT(DOW FROM end_date) THEN
        weekend_days := weekend_days + 2;
    END IF;
    
    -- Adjust if start is Sunday
    IF EXTRACT(DOW FROM start_date) = 0 THEN
        weekend_days := weekend_days - 1;
    END IF;
    
    -- Adjust if end is Saturday
    IF EXTRACT(DOW FROM end_date) = 6 THEN
        weekend_days := weekend_days - 1;
    END IF;
    
    RETURN total_days - weekend_days;
END;
$$ LANGUAGE plpgsql;

-- Add business days to a date
CREATE OR REPLACE FUNCTION add_business_days(start_date date, num_days int)
RETURNS date AS $$
DECLARE
    result date := start_date;
    days_added int := 0;
BEGIN
    WHILE days_added < num_days LOOP
        result := result + INTERVAL '1 day';
        IF EXTRACT(DOW FROM result) NOT IN (0, 6) THEN
            days_added := days_added + 1;
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert known IDR entities (as of 2025)
INSERT INTO idr_entities (name, cms_id, is_active) VALUES
('MAXIMUS Federal Services', 'IDR-001', true),
('Altarum Institute', 'IDR-002', true),
('Andover Healthcare', 'IDR-003', true),
('New Era ADR', 'IDR-004', true),
('FAIRMA', 'IDR-005', true),
('Health Cost Review', 'IDR-006', true),
('Marshall Arbitration', 'IDR-007', true),
('The Mediation Group', 'IDR-008', true),
('Matrix Mediation', 'IDR-009', true),
('AllCare', 'IDR-010', true),
('Avym', 'IDR-011', true),
('Medical Claims Resolution', 'IDR-012', true),
('Arbitration Forums', 'IDR-013', true),
('The Claro Group', 'IDR-014', true),
('Health Resolutions', 'IDR-015', true);

-- Note: Update with actual CMS IDs and fee schedules when available
