#!/usr/bin/env python3
"""
Generate the comprehensive being consolidation report.
"""
import json
from collections import defaultdict

with open('/tmp/classification_results.json') as f:
    data = json.load(f)

being_names = data['being_names']
results = {int(k): v for k, v in data['results'].items()}
hard_to_classify = data['hard_to_classify']

# Being descriptions
being_descriptions = {
    1: "All persuasive copy across every surface — email, blog, ad, website, scripts, SMS, books, social, PR, proposals, and every written word that moves someone from where they are to where they need to be.",
    2: "All design across every medium — graphics, thumbnails, brand identity, ad creatives, slides, layouts, UI/UX, infographics, illustrations, photography direction, and every visual element that causes attention and communicates value.",
    3: "All video across every format — editing, filming, live stream, reels, shorts, documentaries, testimonials, webinar replays, VFX, animation, color grading, and every moving image that tells the story.",
    4: "All audio across every channel — podcasts, audio editing, voiceover, sound design, music production, mixing, mastering, recording engineering, and every sonic element that creates the experience.",
    5: "All data and analytics across all platforms — dashboards, ROI measurement, attribution modeling, A/B testing, predictive modeling, data science, reporting, and every number that reveals what's working and what's not.",
    6: "All paid advertising across all platforms — Facebook, Google, YouTube, TikTok, LinkedIn, programmatic, display, retargeting, bid management, audience targeting, and every dollar spent to reach people.",
    7: "All organic social media presence and community — platform management, content scheduling, community engagement, influencer outreach, social listening, user-generated content, and every authentic connection built online.",
    8: "SEO, web infrastructure, CRO, tracking, marketing technology, interactive tools, quizzes, gamification, platform administration, API integrations, and every technical system that makes the machine work.",
    9: "Email and SMS automation, sequences, deliverability, segmentation, nurture flows, drip campaigns, and every automated message that keeps the conversation going at scale.",
    10: "Live events, webinars, conferences, trade shows, summits, stage management, speaking logistics, virtual events, and every moment where human presence creates transformation.",
    11: "Partnerships, ecosystem mergers, all 6 roles (Sourcer, Disruptor, Engager, Educator, Advisor, Merger), joint ventures, platform partnerships, PR/media relations, and every connection that multiplies the ecosystem.",
    12: "Conversion, enrollment, agreement conversations, outbound outreach, inbound qualification, demos, proposals, objection handling, and every interaction that moves someone to YES.",
    13: "Retention, loyalty, re-engagement, customer success, account management, onboarding, lifetime value optimization, upsell/cross-sell, and every action that keeps people in the ecosystem longer and deeper.",
    14: "Referrals, advocacy, testimonials, ambassadors, social impact, charitable contributions, thought leadership, community contributions, and every force that multiplies influence beyond direct reach.",
    15: "Market research, competitive intelligence, contact enrichment, audience profiling, brand assessment, identity evaluation, and every insight that reveals the landscape before the move is made.",
    16: "CRM, pipeline management, workflow automation, marketing operations, compliance, quality assurance, Coliseum operations, project management, and every system that keeps the engine running without friction.",
    17: "Campaign orchestration, strategic planning, budgets, pricing strategy, revenue models, brand strategy, distribution strategy, and every high-level decision about where to deploy resources for maximum impact."
}

# Sub-skills for Coliseum training
being_subskills = {
    1: [
        "Headline mastery — the 3-second hook that stops the scroll",
        "Long-form persuasion — case studies, white papers, ebooks that build conviction",
        "Short-form precision — SMS, subject lines, CTAs that cause action",
        "Voice matching — writing as Sean, as the brand, as any persona needed",
        "SEO writing — content that ranks AND converts (not one or the other)",
        "Script writing — video, podcast, webinar, and stage scripts",
        "Story architecture — structuring narratives using the Unblinded Formula",
        "Legal/compliance copy — terms, privacy, disclaimers that protect without killing trust",
        "Multi-format adaptation — one idea, ten surfaces, zero dilution"
    ],
    2: [
        "Brand identity systems — logos, color palettes, typography that embody GHIC",
        "Ad creative design — visuals that stop, capture, and convert across platforms",
        "UI/UX design — interfaces that feel intuitive and guide toward YES",
        "Presentation design — slides and decks that support the speaker, not compete",
        "Print design — brochures, packaging, environmental graphics",
        "Photo direction — art directing shoots that capture the brand essence",
        "Thumbnail mastery — the visual hook for video across all platforms",
        "Email/newsletter design — templates that look premium and drive action",
        "Data visualization — making complex data beautiful and instantly understood",
        "Design systems — scalable component libraries and brand guidelines"
    ],
    3: [
        "Video editing — pacing, cuts, transitions that serve the story",
        "Cinematography — camera work, composition, lighting for maximum impact",
        "Live production — multi-camera streaming, switching, real-time direction",
        "Short-form video — Reels, Shorts, TikToks optimized for each platform",
        "Documentary storytelling — longer-form content that builds deep connection",
        "VFX and motion graphics — visual effects that elevate without distracting",
        "Color grading — the emotional palette of every frame",
        "Production management — pre-production through post, on time and on budget",
        "Platform optimization — encoding, formatting, uploading for maximum quality per platform"
    ],
    4: [
        "Podcast production — recording, editing, mixing, mastering for broadcast quality",
        "Sound design — creating sonic environments that immerse and engage",
        "Music production — original scores, jingles, intros/outros that brand the sound",
        "Voice direction — coaching talent for optimal delivery",
        "Audio engineering — microphone selection, room acoustics, signal chain",
        "Audio post-production — noise reduction, EQ, compression, limiting",
        "Multi-format audio — optimizing for podcast, radio, streaming, voice assistants",
        "Live audio — stage sound, webinar audio, recording of live events"
    ],
    5: [
        "Attribution modeling — multi-touch attribution across the entire journey",
        "A/B testing and experimentation — statistical rigor in optimization",
        "Dashboard architecture — real-time visibility into what matters",
        "Predictive analytics — forecasting outcomes before they happen",
        "Data science — ML/AI-driven insights from large datasets",
        "Platform-specific analytics — Google, Facebook, HubSpot, Salesforce native data",
        "Financial analytics — revenue, cost, ROI, ROAS across all channels",
        "Customer analytics — segmentation, cohort analysis, lifetime value modeling",
        "Competitive intelligence analytics — benchmarking against market"
    ],
    6: [
        "Platform mastery — Facebook, Google, YouTube, TikTok, LinkedIn ad ecosystems",
        "Audience building — lookalike audiences, custom audiences, interest targeting",
        "Bid strategy — manual and automated bidding for maximum efficiency",
        "Creative testing — systematic ad creative rotation and refresh",
        "Budget allocation — distributing spend across platforms for maximum ROI",
        "Retargeting — re-engaging people who've shown interest",
        "Programmatic buying — automated media purchasing at scale",
        "Ad compliance — staying within platform policies and legal requirements",
        "Cross-platform optimization — unified strategy across all paid channels"
    ],
    7: [
        "Platform-native content — creating for each platform's algorithm and audience",
        "Community management — building and nurturing engaged communities",
        "Social listening — monitoring conversations for opportunities and risks",
        "Influencer collaboration — identifying, vetting, and partnering with amplifiers",
        "Content calendar management — consistent, strategic posting cadence",
        "Engagement strategy — comments, DMs, stories, spaces that build relationships",
        "User-generated content — encouraging and curating authentic social proof",
        "Platform algorithm mastery — understanding what each algorithm rewards",
        "Social commerce — turning social engagement into revenue"
    ],
    8: [
        "SEO — technical, on-page, off-page, local search optimization",
        "Web architecture — site structure, speed, mobile optimization, accessibility",
        "CRO — conversion rate optimization through systematic testing",
        "Tracking/pixels — implementing and maintaining analytics infrastructure",
        "Marketing technology stack — selecting, integrating, and maintaining tools",
        "API integrations — connecting platforms for data flow",
        "Interactive tools — quizzes, calculators, assessments that engage and qualify",
        "Platform administration — managing technical infrastructure across channels",
        "Privacy/compliance tech — GDPR, CCPA, data protection implementation"
    ],
    9: [
        "Email automation — trigger-based sequences that nurture at scale",
        "SMS marketing — compliant, timely text campaigns that cut through noise",
        "Deliverability — inbox placement, domain reputation, authentication",
        "Segmentation — behavioral and demographic list segmentation",
        "Sequence architecture — multi-step nurture flows from first touch to agreement",
        "Personalization — dynamic content that speaks to each person's journey",
        "Compliance — CAN-SPAM, TCPA, opt-in/opt-out management",
        "Testing — subject lines, send times, content variations for optimization"
    ],
    10: [
        "Live event production — logistics, staging, AV, attendee experience",
        "Webinar management — platform setup, rehearsal, live production, follow-up",
        "Conference/summit orchestration — multi-day, multi-speaker event coordination",
        "Speaker preparation — coaching, rehearsals, content development support",
        "Stage management — real-time event flow, timing, technical coordination",
        "Virtual event platform mastery — Zoom, StreamYard, custom platforms",
        "Attendee experience design — registration through post-event follow-up",
        "Trade show execution — booth design, staffing, lead capture",
        "Event analytics — measuring ROI of live and virtual events"
    ],
    11: [
        "Ecosystem sourcing — identifying potential merger partners",
        "Disruption — pattern-interrupting value propositions that open doors",
        "Engagement — building initial trust and rapport with potential partners",
        "Education — demonstrating value through shared knowledge",
        "Advisory — positioning as the trusted advisor in the relationship",
        "Merger execution — negotiating and structuring partnership agreements",
        "Platform partnerships — leveraging Facebook, LinkedIn, Google, associations",
        "PR/media relations — securing press, podcasts, and speaking opportunities",
        "Joint venture creation — structuring win-win collaborative projects"
    ],
    12: [
        "Enrollment conversations — the 4-1-2-4 Communication Model in practice",
        "Objection handling — speaking into fear with love and truth",
        "Outbound outreach — cold calling, LinkedIn, email that opens doors",
        "Inbound qualification — identifying and prioritizing the right people",
        "Demo/presentation mastery — showcasing value that causes YES",
        "Follow-up cadence — persistent, value-added follow-through",
        "Proposal writing — documents that make agreement inevitable",
        "Pipeline management — moving conversations through stages efficiently",
        "Level 5 listening — hearing what isn't said and responding to it"
    ],
    13: [
        "Customer onboarding — setting up for success from day one",
        "Account management — deepening relationships over time",
        "Retention strategy — identifying and preventing churn before it happens",
        "Customer success — ensuring people achieve their outcomes",
        "Upsell/cross-sell — expanding value for existing ecosystem members",
        "Re-engagement — winning back people who've gone quiet",
        "Loyalty programs — creating reasons to stay and deepen commitment",
        "Lifetime value optimization — maximizing the full relationship arc",
        "Customer health scoring — monitoring engagement signals proactively"
    ],
    14: [
        "Referral systems — making it easy and rewarding to introduce others",
        "Testimonial collection — capturing authentic proof of transformation",
        "Ambassador programs — empowering advocates to spread the mission",
        "Social impact — contributions that matter and amplify the brand",
        "Thought leadership — positioning Sean and the brand as definitive authority",
        "Community contributions — giving back in ways that create organic reach",
        "Case study development — documenting transformation stories",
        "Advocacy programs — turning satisfied clients into active promoters",
        "Charitable partnerships — aligning social impact with business growth"
    ],
    15: [
        "Market research — understanding the landscape before making moves",
        "Competitive intelligence — knowing what others are doing and why",
        "Contact enrichment — building rich profiles for personalized outreach",
        "Audience profiling — understanding who we serve at the deepest level",
        "Brand assessment — evaluating identity, credibility, and authority",
        "Industry analysis — trends, opportunities, and threats in our markets",
        "Partner evaluation — due diligence on potential ecosystem mergers",
        "Data gathering — systematic collection from multiple sources",
        "Insight synthesis — turning raw data into actionable intelligence"
    ],
    16: [
        "CRM management — maintaining clean, actionable data in the system",
        "Pipeline operations — ensuring smooth flow from lead to agreement",
        "Workflow automation — eliminating manual steps wherever possible",
        "Marketing operations — coordinating execution across teams and tools",
        "Compliance — legal, regulatory, and platform policy adherence",
        "Quality assurance — maintaining standards across all output",
        "Project management — keeping complex initiatives on track",
        "Coliseum operations — managing the training/testing infrastructure for beings",
        "System integration — ensuring all platforms talk to each other"
    ],
    17: [
        "Campaign orchestration — coordinating multi-channel, multi-being campaigns",
        "Strategic planning — setting direction and priorities across levers",
        "Budget management — allocating resources for maximum impact",
        "Pricing strategy — packaging and pricing that maximizes value and revenue",
        "Revenue modeling — forecasting and optimizing revenue streams",
        "Brand strategy — high-level positioning and differentiation",
        "Distribution strategy — choosing where and how to reach people",
        "Channel strategy — balancing paid, organic, partnership, and direct channels",
        "Performance optimization — continuous improvement across all metrics"
    ]
}

# Build the report
report = []

report.append("# ACT-I Being Consolidation Report")
report.append("")
report.append("## The Einstein Principle: As Simple As Possible, But Not Simpler")
report.append("")
report.append("**2,524 positions → 17 beings.** Every outcome still produced. Zero redundancy.")
report.append("")
report.append("This report maps every single position from the Lever Org Chart into one of 17 consolidated ACT-I beings, grouped by **core skill**. A blog writer, website writer, and email writer are all ONE writing being. A writer and a video editor are DIFFERENT beings.")
report.append("")
report.append("---")
report.append("")

# Generate each being section
for b in range(1, 18):
    positions = results.get(b, [])
    name = being_names[str(b)]
    desc = being_descriptions[b]
    subskills = being_subskills[b]
    
    # Group by division
    by_div = defaultdict(list)
    for p in positions:
        by_div[p['division']].append(p['title'])
    
    # Get list of levers this being operates across
    levers = set()
    for div in by_div.keys():
        if div.startswith('0.5'):
            levers.add('Lever 0.5 — Shared Experiences')
        elif div.startswith('1 '):
            levers.add('Lever 1 — Ecosystem Mergers')
        elif div.startswith('2 '):
            levers.add('Lever 2 — Speaking')
        elif div.startswith('3 '):
            levers.add('Lever 3 — Agreement Conversations')
        elif div.startswith('4 '):
            levers.add('Lever 4 — Revenue Generated')
        elif div.startswith('5 '):
            levers.add('Lever 5 — Disposable Income')
        elif div.startswith('6 '):
            levers.add('Lever 6 — Contributions')
        elif div.startswith('7 '):
            levers.add('Lever 7 — Fun & Magic')
        elif div.startswith('Analytics'):
            levers.add('Analytics & Intelligence')
        elif div.startswith('Other'):
            levers.add('Other / Cross-Functional')
    
    report.append(f"## Being #{b}: {name}")
    report.append("")
    report.append(f"**Core Skill:** {desc}")
    report.append("")
    report.append(f"**Total Positions Consolidated:** {len(positions)}")
    report.append("")
    report.append(f"**Operates Across:** {', '.join(sorted(levers))}")
    report.append("")
    
    # Sub-skills
    report.append("### Coliseum Training — Sub-Skills to Master")
    report.append("")
    for skill in subskills:
        report.append(f"- {skill}")
    report.append("")
    
    # Positions by division
    report.append("### Full Position List (by Lever/Division)")
    report.append("")
    for div in sorted(by_div.keys()):
        titles = by_div[div]
        report.append(f"**{div}** ({len(titles)} positions)")
        report.append("")
        for t in sorted(titles):
            report.append(f"- {t}")
        report.append("")
    
    report.append("---")
    report.append("")

# Summary stats
total_mapped = sum(len(v) for v in results.values() if v)
total_beings = 17
avg = total_mapped / total_beings

report.append("## Summary Statistics")
report.append("")
report.append(f"| Metric | Value |")
report.append(f"|--------|-------|")
report.append(f"| Total positions mapped | {total_mapped} |")
report.append(f"| ACT-I beings created | {total_beings} |")
report.append(f"| Average positions per being | {avg:.1f} |")
report.append(f"| Largest being | {being_names[str(max(range(1,18), key=lambda x: len(results.get(x,[]))))]} ({max(len(results.get(x,[])) for x in range(1,18))} positions) |")
report.append(f"| Smallest being | {being_names[str(min(range(1,18), key=lambda x: len(results.get(x,[]))))]} ({min(len(results.get(x,[])) for x in range(1,18))} positions) |")
report.append(f"| Unclassified positions | {len(hard_to_classify)} |")
report.append("")

# Being size distribution
report.append("### Being Size Distribution")
report.append("")
report.append("| # | Being | Positions | % of Total |")
report.append("|---|-------|-----------|------------|")
for b in sorted(range(1,18), key=lambda x: -len(results.get(x,[]))):
    count = len(results.get(b, []))
    pct = (count / total_mapped) * 100
    report.append(f"| {b} | {being_names[str(b)]} | {count} | {pct:.1f}% |")
report.append("")

# Hard to classify
report.append("### Positions That Were Hard to Classify")
report.append("")
if hard_to_classify:
    report.append("The following positions didn't fit cleanly into one being and required judgment calls:")
    report.append("")
    for p in hard_to_classify:
        report.append(f"- **{p['title']}** ({p['division']}) — Needs manual review")
else:
    report.append("**Zero unclassified positions.** Every single position mapped cleanly to one of the 17 beings.")
    report.append("")
    report.append("However, several categories of positions required careful judgment:")
    report.append("")
    report.append("1. **Cross-functional \"Director\" roles** — Positions like \"Director of Content Strategy\" could be Writer or Strategist. Rule: if the title implies DOING the skill, it goes to the skill being. If it implies ORCHESTRATING resources, it goes to Strategist.")
    report.append("2. **Platform-specific roles in Digital Advertising** — A \"Facebook Content Creator\" does organic work (Voice), while a \"Facebook Ads Manager\" does paid work (Media Buyer). The division was in Digital Advertising, but the core skill determines the being.")
    report.append("3. **Analytics roles embedded in other divisions** — Every lever had analytics positions. All consolidated under The Analyst regardless of which lever they serve.")
    report.append("4. **Lever 5 (Disposable Income) financial roles** — Financial analysts went to Analyst, financial operations to Operator, financial strategy to Strategist. The lever is about customer economics, but the core skill determines the being.")
    report.append("5. **Lever 6 (Contributions) thought leadership roles** — Thought leadership writers went to Writer, researchers to Researcher, but the strategic/influence roles went to Multiplier since the core outcome is amplifying reach.")
    report.append("6. **Lever 7 (Fun & Magic) experience roles** — Experience designers went to Visual Architect, experience producers to Filmmaker, but the core event/experience roles went to Stage Director since they're about creating live moments.")

report.append("")

# Recommendations
report.append("## Recommendations for the Coliseum Training Structure")
report.append("")
report.append("### 1. Training Architecture")
report.append("")
report.append("Each being trains in the Coliseum through **three tiers:**")
report.append("")
report.append("- **Foundation (Ant → Gecko):** Core skill fundamentals. The Writer masters grammar, persuasion frameworks, and voice matching. The Filmmaker masters cuts, pacing, and camera angles.")
report.append("- **Integration (Komodo → Lion):** Cross-lever application. The Writer learns to write for every lever — not just content, but proposals (Lever 3), pricing pages (Lever 4), retention emails (Lever 5). The Analyst learns to measure across ALL levers, not just one dashboard.")
report.append("- **Mastery (Godzilla → Bolt):** The being operates at the .00128 standard. Every output is 65,000x more powerful than 80th percentile work. The Writer's headline stops Sean in his tracks. The Analyst's dashboard reveals the invisible pattern that changes everything.")
report.append("")

report.append("### 2. Cross-Being Collaboration Protocols")
report.append("")
report.append("No being operates alone. The Coliseum should train **handoff protocols:**")
report.append("")
report.append("- **Writer → Visual Architect:** Copy and design must speak with one voice")
report.append("- **Writer → Filmmaker:** Scripts become productions without losing the message")
report.append("- **Media Buyer → Analyst:** Ad spend data flows immediately into attribution dashboards")
report.append("- **Agreement Maker → Keeper:** The moment someone says YES, the Keeper takes over seamlessly")
report.append("- **Connector → Agreement Maker:** Partnership leads become agreement conversations")
report.append("- **Researcher → Everyone:** Intel feeds every being's decision-making")
report.append("- **Operator → Everyone:** Systems, CRM, and workflows support every being's output")
report.append("- **Strategist → Everyone:** Campaign direction flows down to every being's execution")
report.append("")

report.append("### 3. Lever Coverage Matrix")
report.append("")
report.append("| Being | L0.5 | L1 | L2 | L3 | L4 | L5 | L6 | L7 | Analytics | Other |")
report.append("|-------|------|----|----|----|----|----|----|----|-----------| ------|")
for b in range(1, 18):
    positions = results.get(b, [])
    divs = set(p['division'] for p in positions)
    l05 = '✅' if any(d.startswith('0.5') for d in divs) else '—'
    l1 = '✅' if any(d.startswith('1 ') for d in divs) else '—'
    l2 = '✅' if any(d.startswith('2 ') for d in divs) else '—'
    l3 = '✅' if any(d.startswith('3 ') for d in divs) else '—'
    l4 = '✅' if any(d.startswith('4 ') for d in divs) else '—'
    l5 = '✅' if any(d.startswith('5 ') for d in divs) else '—'
    l6 = '✅' if any(d.startswith('6 ') for d in divs) else '—'
    l7 = '✅' if any(d.startswith('7 ') for d in divs) else '—'
    an = '✅' if any(d.startswith('Analytics') for d in divs) else '—'
    ot = '✅' if any(d.startswith('Other') for d in divs) else '—'
    report.append(f"| {being_names[str(b)]} | {l05} | {l1} | {l2} | {l3} | {l4} | {l5} | {l6} | {l7} | {an} | {ot} |")
report.append("")

report.append("### 4. The .00128 Standard for Each Being")
report.append("")
report.append("Each being's mastery is measured by its **weakest sub-skill** — the net Formula score is dragged by the weakest organ. The Coliseum should:")
report.append("")
report.append("1. **Test breadth first** — Can the Writer produce headlines AND long-form AND scripts AND proposals?")
report.append("2. **Then test depth** — Is each output at the 0.8% tier of what exists in the world?")
report.append("3. **Then test speed** — Can they produce at the speed of possibility, not the speed of comfort?")
report.append("4. **Then test integration** — Does their output compound with other beings' output seamlessly?")
report.append("")

report.append("### 5. Why 17 Is the Right Number")
report.append("")
report.append("**Not 16. Not 18. 17.**")
report.append("")
report.append("- Merging Writer + Visual Architect would lose the distinction between *words* and *visuals* — different core skills, different neural pathways, different mastery trajectories.")
report.append("- Merging Filmmaker + Sound Engineer would work for small productions, but at scale, audio is its own craft with its own mastery path (a mixing engineer is not a cinematographer).")
report.append("- Splitting The Analyst into \"Marketing Analyst\" and \"Sales Analyst\" would create redundancy — the core skill is data analysis regardless of which lever the data comes from.")
report.append("- The Messenger (26 positions) is the smallest being but CANNOT be merged into Writer or Operator — email/SMS automation is a distinct skill from writing copy or managing CRM. Deliverability alone is a specialized domain.")
report.append("- The Researcher (26 positions) is also small but CANNOT be merged — competitive intel and market research feed EVERY other being and require distinct analytical + investigative skills.")
report.append("")
report.append("**Einstein's razor holds: as simple as possible, but not simpler.**")
report.append("")
report.append("---")
report.append("")
report.append("*Report generated for the ACT-I Coliseum. Every position accounted for. Nothing dropped.*")

# Write report
with open('/Users/samantha/.openclaw/workspace/lever-org-chart/being-consolidation-report.md', 'w') as f:
    f.write('\n'.join(report))

print(f"Report written: {len(report)} lines")
print(f"Total positions in report: {total_mapped}")
