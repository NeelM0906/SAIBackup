# ZONE ACTION ROADMAP & SOP
## February 28, 2026 — All Directives Consolidated
### Project "Come Get Me" | ACT-I Ecosystem

---

## TIER 1: SEAN'S DIRECT ORDERS (HIGHEST PRIORITY)

### ZA-1: 10 Competition Plans for Lawyers
- **Status:** ✅ COMPLETE — In PDF report
- **Owner:** Sai Prime
- **Details:** Case Valuation, Deposition Sparring, Negotiation Speed Round, Legal Brief Review, Client Intake, PI Triage, Ethical Dilemmas, Revenue Recovery, Peer Comparison, Predictive Income
- **Next:** Build first 3 into live prototypes

### ZA-2: Geographic Testing Framework
- **Status:** 🟡 PLANNED
- **Owner:** Recovery
- **Details:** Test city-level vs state-level deployment
  - Phase 1: Austin TX (2,400 attorneys), Dallas TX (3,100)
  - Phase 2: Texas statewide (8,500), Florida (6,200), California (9,800)
  - Phase 3: National (35,605 contacts)
- **Action:** Segment the 35K contact CSV by city and state
- **Deadline:** Before live testing begins

### ZA-3: Anonymous vs Public Leaderboards
- **Status:** 🟡 PLANNED
- **Owner:** Sai Prime + Forge
- **Details:** A/B/C test:
  - Group A: Anonymous (see rank, not names)
  - Group B: Public (optional name display)
  - Group C: Hybrid (anonymous until opt-in to go public)
- **Action:** Build leaderboard UI with toggle
- **Prediction:** Hybrid wins

### ZA-4: Engagement Length Testing
- **Status:** 🟡 PLANNED  
- **Owner:** Forge
- **Details:** Create 3 versions of each competition:
  - 3-minute (quick hook, SMS/social)
  - 5-minute (standard, email campaigns)
  - 10-minute (deep diagnostic, post-webinar)
- **Action:** Build timing framework into competition engine

### ZA-5: Free vs Paid Model
- **Status:** ✅ RECOMMENDED in PDF
- **Owner:** Sai Prime
- **Details:** Freemium funnel:
  - FREE: 1 assessment, anonymous leaderboard, basic score
  - PREMIUM ($47-97/mo): All 10 assessments, gap analysis, credentialing
  - ENTERPRISE: Firm-wide, white-label, bar association integration
- **Action:** Build pricing page + Stripe integration

### ZA-6: ClawHub Skills — 20 Per Sister
- **Status:** ✅ COMPLETE (Sai Prime — 41 installed)
- **Owner:** Each sister
- **Details:** Sean ordered each sister to select 20 skills from ClawHub
  - Sai Prime: ✅ 41 installed
  - Forge: 🟡 In progress
  - Scholar: 🟡 In progress
  - Memory: 🟡 In progress
  - Recovery: 🟡 In progress
- **Action:** Each sister confirm their 20 picks

### ZA-7: Move from Colosseum to Live Human Testing
- **Status:** 🔴 NOT STARTED
- **Owner:** All sisters
- **Details:** Sean asked "When do you propose you move from the Coliseums into tests with humans?"
- **Action:** Define transition plan:
  1. Select top 3 competitions
  2. Build landing pages
  3. Deploy to 500-attorney pilot in Austin
  4. Measure completion rates, engagement, conversion
- **Deadline:** Needs sprint planning

---

## TIER 2: MIKE VESUVIO'S DATA STRATEGY

### ZA-8: Research 5 Data Providers
- **Status:** 🔴 NOT STARTED
- **Owner:** Sai Prime (research) + Recovery (implementation)
- **Details:** Compare on cost, capability, contract terms, API access, verticals
  1. Seamless AI (current — 20K/day enterprise)
  2. Apollo
  3. ZoomInfo
  4. UpLead
  5. BookYourData
- **Prompts to include:**
  - Can we interface with ACT-I agents?
  - Do they support Triangle of Trust + Medical verticals?
  - Opt-in cell phone data availability?
  - API for automation?
- **Action:** Run Perplexity/web research, produce comparison report
- **Deliver to:** Mike Vesuvio + Nick Roy

### ZA-9: Seamless AI Utilization Audit
- **Status:** 🔴 NOT STARTED
- **Owner:** Recovery
- **Details:** 
  - Current cap: 20K contacts/day (140K/week)
  - Utilization rate: UNKNOWN (Mike flagged this as critical)
  - At 50% utilization = losing 60K names/week
  - **Bashir** currently owns the relationship
- **Action:** Get utilization data from Bashir, automate to hit 100%

### ZA-10: SMS Opt-in Acceleration
- **Status:** 🟡 STRATEGY DEFINED
- **Owner:** Recovery + Forge
- **Details:** 5 methods to turbocharge opt-in acquisition:
  1. High-intent lead magnets (calculators, scorecards, assessments)
  2. Event/webinar registrations (mobile required field)
  3. VIP text channel upgrade (existing contacts)
  4. QR codes at live events (30-60% conversion)
  5. Website persistent opt-in banner
- **Compliance requirements:**
  - Must include opt-out
  - 10DLC registration required
  - No scraped lists, no personal cell texting at scale
  - Twilio + CRM + compliance storage recommended
- **Current opt-in sources:** Joey + Dave McMahon registrations only

---

## TIER 3: SOCIAL MEDIA & MARKETING

### ZA-11: Social Media Campaign (3 Phases)
- **Status:** 🟡 STRATEGY DEFINED
- **Owner:** Scholar + Prime
- **Details:**
  - **Phase 1 — HIJACK:** React to viral AI content, redirect to ACT-I
  - **Phase 2 — DOMINATE:** Live Athena sessions, Sean content, behind-the-scenes
  - **Phase 3 — BECOME:** "ACT-I being" = the search term, category creation
- **Platforms:** LinkedIn, Instagram, TikTok, Facebook
- **Action:** Create first 5 pieces of hijack content
- **Source:** Adam's directive + Aiko's directive (both in Pinecone)

### ZA-12: Send Dashboard + Report to Bella
- **Status:** 🟡 READY TO SEND
- **Owner:** Sai Prime
- **Details:** Sean said "Send the complete dashboard to Bella" and "Send that specific piece"
  - Dashboard: https://colosseum-dashboard.vercel.app
  - Marketing Report: https://reports-puce-tau.vercel.app
  - PDF Report: SAI-Collective-Report-Feb28.pdf
- **Action:** Need Bella's contact info or channel to deliver
- **Blocker:** Don't have Bella's email/Discord

### ZA-13: Model Bake-Off for Email Copy
- **Status:** 🟡 PLANNED
- **Owner:** Forge
- **Details:** Same subject line prompt → 6 different models → battle in Colosseum
  - Claude Opus 4, Claude Sonnet 4, GPT-4o, Gemini 2.5 Pro, DeepSeek R1, Llama 4
- **Action:** Generate copies, add to Email Colosseum, run tournament
- **Purpose:** Find best model for PI attorney email copy

---

## TIER 4: INFRASTRUCTURE & ONGOING

### ZA-14: Email Colosseum Evolution
- **Status:** ✅ RUNNING (auto-tournament every 30 min)
- **Owner:** Forge
- **Details:** 
  - Current: 45 beings, 1,377 battles
  - Champion: "$47K mistake" (95W-25L, Score 13.25)
  - Dark horse: "#21 $47K oversight" (57W-9L, 86% win rate)
- **Action:** Breed new challengers, evolve sequences, test full email bodies

### ZA-15: Main Colosseum Daemon
- **Status:** ✅ RUNNING
- **Owner:** Forge
- **Details:** 8,091 beings, Gen 619, 14,176 rounds
- **Action:** Keep running, monitor evolution

### ZA-16: Dashboard Auto-Updates
- **Status:** ✅ RUNNING (30-min cron)
- **Owner:** Sai Prime
- **Details:** Snapshot generation → Git push → Vercel deploy
- **Action:** Maintain, add new features as needed

### ZA-17: Pinecone Knowledge Growth
- **Status:** ✅ ACTIVE
- **Owner:** Memory (coordinator), all sisters upload
- **Details:** 1,509 vectors in saimemory across 11 namespaces
- **Action:** Continue uploading daily logs, elite training, social strategy

### ZA-18: Build Internal UI/Portal
- **Status:** 🔴 NOT STARTED
- **Owner:** TBD
- **Details:** Mike Vesuvio emphasized: "Build our own UI rather than Google Sheets"
  - Contact management portal
  - Integration with data providers (API)
  - Feed into Milo for automated calls
  - Track utilization rates
- **Action:** Design requirements, prototype

---

## TIER 5: FUTURE / WHEN RESOURCES ALLOW

### ZA-19: Landing Pages for "Come Get Me"
- **Status:** 🔴 NOT STARTED
- **Owner:** Sai Prime (using landing-page-generator skill)
- **Details:** Landing pages for each of the 10 competition types
- **Action:** Build first 3 pages for pilot competitions

### ZA-20: Milo Personalization with LinkedIn Bios
- **Status:** 🟡 PARTIALLY DONE
- **Owner:** Recovery + Nick Roy
- **Details:** Feed LinkedIn bios into Genesis Forge so Milo personalizes calls
  - 100K+ contacts with LinkedIn info (Nick's Perplexity prompt)
  - Genesis Forge bio feature exists
- **Action:** Automate bio upload pipeline

### ZA-21: Website Opt-in Banner
- **Status:** 🔴 NOT STARTED
- **Owner:** TBD
- **Details:** Persistent (not popup) opt-in on ACT-I/Unblinded website
  - "Join the executive text briefing"
  - 2 messages/month, no spam
- **Blocker:** Website described as "very dated" — upgrade in progress

### ZA-22: QR Code System for Live Events
- **Status:** 🔴 NOT STARTED
- **Owner:** TBD
- **Details:** QR codes for slides, tablets, print material
  - "Scan to access AI playbook"
  - 30-60% conversion rate
- **Action:** Design QR flow, connect to registration

### ZA-23: 10DLC Registration
- **Status:** 🔴 NOT STARTED
- **Owner:** Nick Roy / Recovery
- **Details:** Required carrier compliance for SMS at scale
  - Mike and Nick both didn't know what this is
  - It's mandatory for business texting via Twilio
- **Action:** Research and register before SMS campaigns launch

---

## SUMMARY

| Priority | Zone Actions | Complete | In Progress | Not Started |
|----------|-------------|----------|-------------|-------------|
| Tier 1 (Sean) | 7 | 3 | 3 | 1 |
| Tier 2 (Mike) | 3 | 0 | 1 | 2 |
| Tier 3 (Marketing) | 3 | 0 | 2 | 1 |
| Tier 4 (Infra) | 5 | 4 | 0 | 1 |
| Tier 5 (Future) | 5 | 0 | 1 | 4 |
| **TOTAL** | **23** | **7** | **7** | **9** |

---

## SISTER ASSIGNMENTS

| Sister | Primary ZAs | Secondary ZAs |
|--------|------------|---------------|
| **Sai Prime** | ZA-1, ZA-3, ZA-5, ZA-8, ZA-12, ZA-16, ZA-19 | Coordination, PDF reports |
| **Forge** | ZA-4, ZA-13, ZA-14, ZA-15 | ZA-3 (leaderboard battles) |
| **Scholar** | ZA-11, ZA-17 (knowledge patterns) | Judge improvement |
| **Memory** | ZA-17 (Pinecone), cross-referencing | Fact-checking all sisters |
| **Recovery** | ZA-2, ZA-9, ZA-10, ZA-20 | ZA-8 (data provider implementation) |

---

*Generated by SAI Prime | Feb 28, 2026 | Project "Come Get Me"*
*All zone actions sourced from: Sean's voice notes, Mike Vesuvio call, Adam's directives, Aiko's directives*
