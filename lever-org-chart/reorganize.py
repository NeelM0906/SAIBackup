import json

with open('/tmp/positions_data.json') as f:
    old = json.load(f)

# Flatten everything
all_positions = {}
for div, positions in old.items():
    for p in positions:
        all_positions[p] = div  # track origin

# ═══════════════════════════════════════════════════
# NEW STRUCTURE — Adam's Framework
# ═══════════════════════════════════════════════════

new_structure = {
    # ─── EXECUTIVE LEADERSHIP ───
    "Executive Leadership": old.get("Executive Leadership", []),

    # ─── LEVER 0.5 — SHARED EXPERIENCES ───
    # FIRST TOUCH. How you MEET someone.
    # Cold outreach, quizzes, HOI invites, black envelopes, introduction events
    "0.5 — Shared Experiences / First Touch": [
        # Sub: Cold Outreach & Initial Contact
        "Director of First Impressions",
        "Director of Cold Outreach Strategy",
        "Director of Introduction Experiences",
        "Cold Outreach Campaign Manager",
        "First Touch Experience Designer",
        "Black Envelope & Physical Mail Manager",
        "Handwritten Letter Specialist",
        "Gift & Welcome Package Coordinator",
        "Cold Email Sequence Writer",
        "Cold Call Script Designer",
        "LinkedIn First Touch Specialist",
        "SMS Introduction Specialist",
        "Direct Mail Campaign Manager",
        "QR Code Experience Designer",
        "Cold Outreach Analytics Manager",
        "Introduction Event Planner",
        "First Meeting Coordinator",
        "Networking Event Organizer",
        "Cold Outreach Personalization Specialist",
        "Lead Research & Intel Specialist",
        "Prospect Discovery Specialist",
        "Social Listening Specialist",
        "Cold Outreach A/B Testing Specialist",
        "Cold Outreach Compliance Specialist",
        "Physical Invitation Designer",
        "Welcome Sequence Architect",
    ],
    "0.5 — Shared Experiences / Quizzes & Interactive": [
        "Director of Interactive Experiences",
        "Quiz Design Manager",
        "Quiz Content Writer",
        "Interactive Assessment Builder",
        "Quiz Analytics Manager",
        "Gamification Experience Designer",
        "Quiz Platform Administrator",
        "Interactive Content Strategist",
        "Quiz Funnel Optimizer",
        "Assessment Scoring Designer",
        "Interactive Experience Tester",
        "Quiz Personalization Specialist",
        "Viral Quiz Distribution Specialist",
        "Interactive Challenge Designer",
        "Quiz Follow-Up Sequence Writer",
    ],
    "0.5 — Shared Experiences / Heart of Influence": [
        "Director of Heart of Influence Events",
        "HOI Invitation Manager",
        "HOI Event Producer",
        "HOI Guest Experience Manager",
        "HOI Follow-Up Coordinator",
        "HOI Attendance Tracker",
        "HOI Content Curator",
        "HOI Reminder & Nurture Specialist",
        "HOI Venue & Virtual Setup Manager",
        "HOI Guest List Manager",
        "HOI Energy & Atmosphere Director",
        "HOI Post-Event Engagement Specialist",
        "HOI Testimonial Collector",
        "HOI Registration Specialist",
        "HOI Calendar Coordinator",
    ],
    "0.5 — Shared Experiences / Community Building": [
        "Director of Community First Touch",
        "Community Welcome Specialist",
        "New Member Onboarding Manager",
        "Community Event Coordinator",
        "Community Engagement Specialist",
        "Community Moderator",
        "Community Growth Manager",
        "Community Analytics Specialist",
        "Community Content Manager",
        "Community Ambassador Program Manager",
        "Community Platform Administrator",
        "Community Feedback Manager",
    ],

    # ─── LEVER 1 — ECOSYSTEM MERGERS ───
    # Strategic partnerships. 4 Components + 6 Roles
    "1 — Ecosystem Mergers / Strategic Partnerships": [
        "Director of Ecosystem Strategy",
        "Director of Strategic Alliances",
        "Director of Partnership Development",
        "Ecosystem Merger Architect",
        "Partnership Evaluation Manager",
        "Joint Venture Coordinator",
        "Alliance Integration Manager",
        "Ecosystem Expansion Strategist",
        "Cross-Ecosystem Liaison",
        "Partnership Contract Manager",
        "Ecosystem Health Monitor",
        "Partnership Pipeline Manager",
        "Ecosystem Merger Analyst",
        "Co-Creation Facilitator",
        "Ecosystem Value Exchange Manager",
    ],
    "1 — Ecosystem Mergers / 4 Components Assessment": [
        # Identity
        "Identity Assessment Specialist",
        "Social Proof Strategist",
        "Brand Alignment Evaluator",
        "Credibility & Authority Analyst",
        "Identity Enhancement Specialist",
        # Relationship Capital
        "Relationship Capital Analyst",
        "Network Mapping Specialist",
        "Relationship Value Assessor",
        "Connection Quality Evaluator",
        "Referral Network Architect",
        # Monetary Capital
        "Monetary Capital Alignment Specialist",
        "Financial Value Exchange Analyst",
        "Revenue Synergy Evaluator",
        "Investment Alignment Manager",
        "Co-Investment Coordinator",
        # Teammates with Unique Skills
        "Unique Skills Discovery Specialist",
        "Talent Synergy Evaluator",
        "Complementary Skills Mapper",
        "Skills Gap Analyst",
        "Team Capability Assessor",
    ],
    "1 — Ecosystem Mergers / 6 Roles": [
        # Source
        "Ecosystem Sourcer — Lead Finder",
        "Ecosystem Sourcer — Research Analyst",
        "Ecosystem Sourcer — Opportunity Scanner",
        "Ecosystem Sourcer — Market Intelligence",
        "Ecosystem Sourcer — Inbound Partnership Manager",
        # Disrupt
        "Ecosystem Disruptor — Pattern Interrupt Strategist",
        "Ecosystem Disruptor — Value Proposition Designer",
        "Ecosystem Disruptor — Attention Architect",
        "Ecosystem Disruptor — Challenger Messaging Specialist",
        "Ecosystem Disruptor — Industry Shake-Up Analyst",
        # Co-Create
        "Ecosystem Co-Creator — Joint Program Designer",
        "Ecosystem Co-Creator — Collaborative Content Producer",
        "Ecosystem Co-Creator — Shared Experience Architect",
        "Ecosystem Co-Creator — Integration Specialist",
        "Ecosystem Co-Creator — Mutual Value Builder",
        # Nurture
        "Ecosystem Nurturer — Relationship Maintenance Manager",
        "Ecosystem Nurturer — Partner Success Manager",
        "Ecosystem Nurturer — Ongoing Value Deliverer",
        "Ecosystem Nurturer — Trust Deepening Specialist",
        "Ecosystem Nurturer — Long-Term Engagement Manager",
        # Propose
        "Ecosystem Proposer — Agreement Architect",
        "Ecosystem Proposer — Partnership Offer Designer",
        "Ecosystem Proposer — Value Proposition Presenter",
        "Ecosystem Proposer — Merger Terms Specialist",
        "Ecosystem Proposer — Win-Win Framework Builder",
        # Finish
        "Ecosystem Finisher — Agreement Closer",
        "Ecosystem Finisher — Contract Execution Specialist",
        "Ecosystem Finisher — Onboarding Launcher",
        "Ecosystem Finisher — Launch Coordinator",
        "Ecosystem Finisher — Post-Agreement Activator",
    ],
    "1 — Ecosystem Mergers / 3 Levels": [
        "Level 3 Dating — Initial Merger Manager",
        "Level 3 Dating — Trust Building Specialist",
        "Level 3 Dating — Simple Agreement Coordinator",
        "Level 2 Partnership — Deepening Integration Manager",
        "Level 2 Partnership — Revenue Sharing Coordinator",
        "Level 2 Partnership — Co-Marketing Manager",
        "Level 1 Marriage — Full Integration Architect",
        "Level 1 Marriage — Ecosystem Fusion Manager",
        "Level 1 Marriage — Joint Entity Operations Lead",
    ],
    "1 — Ecosystem Mergers / Platform Partnerships": [],  # Will populate

    # ─── LEVER 2 — SPEAKING ENGAGEMENTS ───
    # ANY dissemination of message to CAUSE a sales meeting
    # Digital marketing, ads, blogs, stages, webinars, summits, books
    "2 — Speaking / Digital Advertising": [],
    "2 — Speaking / Content & Blogs": [],
    "2 — Speaking / Webinars & Virtual Stages": [],
    "2 — Speaking / Live Stages & Summits": [],
    "2 — Speaking / Social Media": [],
    "2 — Speaking / Video Production": [],
    "2 — Speaking / Audio & Podcasts": [],
    "2 — Speaking / Book & Publishing": [],
    "2 — Speaking / Email Marketing": [],
    "2 — Speaking / Brand & PR": [],
    "2 — Speaking / SEO & Organic": [],
    "2 — Speaking / Design & Creative": [],

    # ─── LEVERS 3-7 ───
    "3 — Agreement Conversations": [],
    "4 — Revenue Generated": [],
    "5 — Disposable Income": [],
    "6 — Contributions": [],
    "7 — Fun & Magic": [],
}

# ═══════════════════════════════════════════════════
# REDISTRIBUTE existing positions
# ═══════════════════════════════════════════════════

# Move webinar/virtual event positions from old 0.5 to new Lever 2 (Speaking)
webinar_keywords = ['webinar', 'virtual event', 'virtual engagement', 'summit']
demo_keywords = ['demo']
cold_keywords = ['cold', 'outreach', 'outbound', 'prospecting']
quiz_keywords = ['quiz', 'interactive', 'gamif', 'assessment']
hoi_keywords = ['heart of influence', 'hoi', 'invitation', 'invite']

# Old Lever 0.5 positions — sort into new buckets
for p in old.get("Lever 0.5 \u2014 Shared Experiences", []):
    pl = p.lower()
    if any(k in pl for k in webinar_keywords):
        new_structure["2 — Speaking / Webinars & Virtual Stages"].append(p)
    elif any(k in pl for k in demo_keywords):
        new_structure["0.5 — Shared Experiences / First Touch"].append(p)
    else:
        # Default to first touch
        new_structure["0.5 — Shared Experiences / First Touch"].append(p)

# Old Lever 1 → Keep in Ecosystem Mergers
for p in old.get("Lever 1 \u2014 Ecosystem Mergers", []):
    new_structure["1 — Ecosystem Mergers / Strategic Partnerships"].append(p)

# Old Lever 2 → Keep in Speaking
for p in old.get("Lever 2 \u2014 Speaking Engagements", []):
    new_structure["2 — Speaking / Live Stages & Summits"].append(p)

# Digital Marketing → Lever 2
for p in old.get("Digital Marketing", []):
    pl = p.lower()
    if 'seo' in pl or 'organic' in pl:
        new_structure["2 — Speaking / SEO & Organic"].append(p)
    elif 'email' in pl:
        new_structure["2 — Speaking / Email Marketing"].append(p)
    elif 'social' in pl:
        new_structure["2 — Speaking / Social Media"].append(p)
    elif 'ad' in pl or 'paid' in pl or 'ppc' in pl or 'media buy' in pl:
        new_structure["2 — Speaking / Digital Advertising"].append(p)
    else:
        new_structure["2 — Speaking / Digital Advertising"].append(p)

# Content Marketing → Lever 2
for p in old.get("Content Marketing", []):
    new_structure["2 — Speaking / Content & Blogs"].append(p)

# Video Marketing → Lever 2
for p in old.get("Video Marketing", []):
    new_structure["2 — Speaking / Video Production"].append(p)

# Audio Marketing → Lever 2
for p in old.get("Audio Marketing", []):
    new_structure["2 — Speaking / Audio & Podcasts"].append(p)

# Design & Creative → Lever 2
for p in old.get("Design & Creative", []):
    new_structure["2 — Speaking / Design & Creative"].append(p)

# Analytics → stays as cross-lever function
new_structure["Analytics & Intelligence"] = old.get("Analytics & Data", [])

# Levers 3-7 keep originals
for p in old.get("Lever 3 \u2014 Agreement Conversations", []):
    new_structure["3 — Agreement Conversations"].append(p)
for p in old.get("Lever 4 \u2014 Revenue Generated", []):
    new_structure["4 — Revenue Generated"].append(p)
for p in old.get("Lever 5 \u2014 Disposable Income", []):
    new_structure["5 — Disposable Income"].append(p)
for p in old.get("Lever 6 \u2014 Contributions", []):
    new_structure["6 — Contributions"].append(p)
for p in old.get("Lever 7 \u2014 Fun & Magic", []):
    new_structure["7 — Fun & Magic"].append(p)

# Athena divisions → keep all as-is
for div, positions in old.items():
    if div.startswith("Athena"):
        new_structure[div] = positions

# ═══════════════════════════════════════════════════
# ADD NEW GAP POSITIONS
# ═══════════════════════════════════════════════════

# Lever 2 gaps — Adam said this is the BIGGEST gap
new_structure["2 — Speaking / Digital Advertising"].extend([
    "Director of Paid Media Strategy",
    "Facebook Ads Creative Director",
    "Facebook Ads Campaign Manager",
    "Facebook Ads Copywriter",
    "Facebook Ads Visual Designer",
    "Facebook Ads A/B Testing Specialist",
    "Facebook Ads Audience Targeting Specialist",
    "Facebook Ads Budget Optimizer",
    "Facebook Ads Retargeting Specialist",
    "Google Ads Campaign Manager",
    "Google Ads Keyword Specialist",
    "YouTube Ads Producer",
    "YouTube Ads Campaign Manager",
    "TikTok Ads Creative Director",
    "TikTok Ads Campaign Manager",
    "LinkedIn Ads Manager",
    "Instagram Ads Specialist",
    "Programmatic Advertising Manager",
    "Display Ads Designer",
    "Ad Creative Refresh Specialist",
    "Ad Compliance & Legal Reviewer",
    "Media Buying Strategist",
    "Sean Wardrobe & Appearance Director — Ad Shoots",
    "Sean Avatar & Digital Twin Creator",
    "Sean Clone Voice & Likeness Manager",
    "Ad Photography Director",
    "Ad Set Design & Staging Specialist",
    "Ad Color Grading Specialist",
    "Ad Thumbnail Designer",
    "Landing Page Designer — Ad Campaigns",
    "Landing Page Copywriter — Ad Campaigns",
    "Landing Page A/B Testing Specialist",
    "Conversion Rate Optimization Manager",
    "Pixel & Tracking Implementation Specialist",
    "Attribution Modeling Analyst",
    "Ad Performance Dashboard Builder",
    "Competitor Ad Intelligence Analyst",
    "Ad Spend ROI Analyst",
    "Ad Platform API Integration Specialist",
])

new_structure["2 — Speaking / Webinars & Virtual Stages"].extend([
    "Director of Webinar Strategy",
    "Webinar Funnel Architect",
    "Webinar Registration Page Designer",
    "Webinar Reminder Sequence Writer",
    "Webinar Host & MC",
    "Webinar Technical Producer",
    "Webinar Replay Editor",
    "Webinar Chat Moderator",
    "Webinar Q&A Manager",
    "Webinar Engagement Analytics Specialist",
    "Webinar Follow-Up Sequence Writer",
    "Webinar Slide Designer",
    "Webinar Recording Engineer",
    "Virtual Summit Director",
    "ACT-I Summit Producer",
    "Summit Speaker Coordinator",
    "Summit Sponsorship Manager",
    "Summit Attendee Experience Designer",
    "Summit Registration & Ticketing Manager",
    "Summit Post-Event Content Repurposer",
])

new_structure["2 — Speaking / Book & Publishing"].extend([
    "Director of Publishing Strategy",
    "Book Project Manager",
    "Ghostwriter — Sean's Voice",
    "Book Editor",
    "Book Cover Designer",
    "Book Launch Campaign Manager",
    "Amazon Publishing Specialist",
    "Book Funnel Designer",
    "Book PR & Media Specialist",
    "eBook & Lead Magnet Creator",
    "White Paper Writer",
    "Case Study Writer",
    "Research Report Author",
])

new_structure["2 — Speaking / Brand & PR"].extend([
    "Director of Brand Strategy",
    "PR Campaign Manager",
    "Media Relations Specialist",
    "Press Release Writer",
    "Podcast Guest Booking Manager",
    "Stage & Speaking Opportunity Scout",
    "Speaking Proposal Writer",
    "Speaker Bureau Liaison",
    "Award Submission Specialist",
    "Thought Leadership Strategist",
    "Brand Voice Guardian",
    "Sean Public Image Manager",
    "Crisis Communication Specialist",
])

# Athena PR positions
for p in old.get("Athena \u2014 Brand & PR", []):
    if p not in new_structure.get("2 — Speaking / Brand & PR", []):
        new_structure["2 — Speaking / Brand & PR"].append(p)

new_structure["2 — Speaking / Social Media"].extend([
    "Director of Social Media Strategy",
    "Twitter/X Content Manager",
    "LinkedIn Content Manager",
    "Instagram Content Manager",
    "TikTok Content Creator",
    "Facebook Page Manager",
    "YouTube Channel Manager",
    "Social Media Calendar Manager",
    "Social Engagement & Reply Specialist",
    "Social Listening & Trend Analyst",
    "Influencer Partnership Manager",
    "Social Media Contest Manager",
    "User-Generated Content Curator",
    "Community Management Specialist",
    "Social Analytics & Reporting Manager",
])

new_structure["2 — Speaking / Email Marketing"].extend([
    "Director of Email Strategy",
    "Nurture Sequence Architect",
    "Email Copywriter",
    "Email Design Specialist",
    "Email Deliverability Manager",
    "Email Segmentation Specialist",
    "Email Automation Builder",
    "Email A/B Testing Specialist",
    "Newsletter Editor",
    "Re-engagement Campaign Specialist",
    "Email Compliance & CAN-SPAM Manager",
])

# Lever 1 — Platform-Specific Ecosystem Mergers
new_structure["1 — Ecosystem Mergers / Platform Partnerships"] = [
    "Facebook Ecosystem Merger Manager",
    "LinkedIn Ecosystem Merger Manager",
    "Google Ecosystem Merger Manager",
    "YouTube Ecosystem Merger Manager",
    "Bar Association Ecosystem Merger Manager",
    "Medical Association Ecosystem Merger Manager",
    "Conference & Trade Show Merger Manager",
    "University & Academic Merger Manager",
    "Media & Publication Merger Manager",
    "Technology Platform Merger Manager",
    "Influencer Ecosystem Merger Manager",
    "Affiliate Network Merger Manager",
    "Industry Group Merger Manager",
    "Government & Regulatory Merger Manager",
    "Non-Profit Ecosystem Merger Manager",
]

# Lever 0.5 — More gap positions
new_structure["0.5 — Shared Experiences / First Touch"].extend([
    "Video Message Personalization Specialist",
    "Loom/Video Introduction Creator",
    "Gift Strategy & Selection Specialist",
    "Event Ticket & Comp Manager",
    "VIP Introduction Concierge",
    "Warm Referral Coordinator",
    "First Impression Quality Auditor",
    "Response Time & Follow-Up Monitor",
])

# Dedup within each division
for div in new_structure:
    seen = set()
    deduped = []
    for p in new_structure[div]:
        if p not in seen:
            seen.add(p)
            deduped.append(p)
    new_structure[div] = deduped

# Remove empty divisions
new_structure = {k: v for k, v in new_structure.items() if v}

# Count totals
total = sum(len(v) for v in new_structure.values())
print(f"\n{'='*60}")
print(f"RESTRUCTURED ORG CHART")
print(f"{'='*60}")
for div, positions in new_structure.items():
    print(f"  {div}: {len(positions)}")
print(f"\nTOTAL: {total} positions across {len(new_structure)} divisions")
print(f"Original: 2290 positions across 28 divisions")
print(f"Net new: {total - 2290} positions added")

# Save
with open('/tmp/new_positions.json', 'w') as f:
    json.dump(new_structure, f, indent=2)
print("\nSaved to /tmp/new_positions.json")
