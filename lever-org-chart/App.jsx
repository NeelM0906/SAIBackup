const { useState, useRef, useCallback, useEffect } = React;

const POSITIONS = {
  "Executive Leadership": [
    "Chief Growth Officer (CGO)",
    "Chief Marketing Officer (CMO)",
    "Chief Revenue Officer (CRO)",
    "Chief Technology Officer (CTO-M)",
    "Chief Data Officer (CDO-M)",
    "Chief Experience Officer (CXO)",
  ],
  "0.5 — Shared Experiences / First Touch": [
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
    "Cold Outreach A/B Testing Specialist",
    "Cold Outreach Compliance Specialist",
    "Physical Invitation Designer",
    "Welcome Sequence Architect",
    "Demo Script Manager",
    "Interactive Technology Manager",
    "Virtual Attendee Experience Manager",
    "Demo Scheduling Manager",
    "Demo Conversion Manager",
    "Demo Engineer",
    "Demo Conversion Specialist",
    "Demo Follow-up Specialist",
    "Demo Scheduling Coordinator",
    "Demo Quality Assurance Specialist",
    "Demo Presentation Designer",
    "Demo Video Editor",
    "Demo Database Manager",
    "Demo ROI Analyst",
    "Demo Testimonial Collector",
    "Demo Personalization Specialist",
    "Demo Integration Specialist",
    "Demo Training Specialist",
    "Demo Success Metrics Analyst",
    "Demo Competitive Analyst",
    "Demo Innovation Specialist",
    "Director of Live Events Strategy",
    "Director of Conference Management",
    "Director of Trade Show Operations",
    "Director of Event Marketing",
    "Director of Event Technology",
    "Director of Event Partnerships",
    "Event Planning Manager",
    "Conference Content Manager",
    "Trade Show Manager",
    "Event Logistics Manager",
    "Event Marketing Manager",
    "Event Technology Manager",
    "Event Sponsorship Manager",
    "Event Operations Manager",
    "Event Design Manager",
    "Event Analytics Manager",
    "Event Vendor Manager",
    "Event Budget Manager",
    "Event Coordinator",
    "Conference Producer",
    "Trade Show Coordinator",
    "Event Marketing Specialist",
    "Event Registration Specialist",
    "Event Logistics Coordinator",
    "Event Setup Specialist",
    "Event Audio/Visual Technician",
    "Event Photographer",
    "Event Videographer",
    "Event Social Media Manager",
    "Event Content Creator",
    "Event Booth Designer",
    "Event Swag Coordinator",
    "Event Catering Coordinator",
    "Event Security Coordinator",
    "Event Transportation Coordinator",
    "Event Accommodation Coordinator",
    "Event Signage Specialist",
    "Event Lighting Specialist",
    "Event Sound Engineer",
    "Event Stage Manager",
    "Event MC/Host",
    "Event Registration Desk Manager",
    "Event Networking Facilitator",
    "Event Survey Coordinator",
    "Event Follow-up Specialist",
    "Event ROI Analyst",
    "Event Compliance Officer",
    "Event Risk Manager",
    "Event Accessibility Coordinator",
    "Event Sustainability Coordinator",
    "Event VIP Coordinator",
    "Event Press Coordinator",
    "Event Volunteer Coordinator",
    "Event Equipment Manager",
    "Event Waste Management Coordinator",
    "Event Emergency Coordinator",
    "Event Weather Coordinator",
    "Event Permit Specialist",
    "Event Insurance Specialist",
    "Event Contract Negotiator",
    "Event Venue Scout",
    "Event Menu Planner",
    "Event Entertainment Coordinator",
    "Event Speaker Coordinator",
    "Event Sponsor Relations Manager",
    "Event Media Relations Specialist",
    "Event Live Stream Manager",
    "Event Mobile App Manager",
    "Event Check-in Specialist",
    "Event Badge Designer",
    "Event Program Designer",
    "Event Evaluation Specialist",
    "Event Database Manager",
    "Event CRM Specialist",
    "Event Lead Capture Specialist",
    "Event Conversion Tracker",
    "Event Post-Event Analyst",
    "Event Innovation Specialist",
    "Video Message Personalization Specialist",
    "Loom/Video Introduction Creator",
    "Gift Strategy & Selection Specialist",
    "Event Ticket & Comp Manager",
    "VIP Introduction Concierge",
    "Warm Referral Coordinator",
    "First Impression Quality Auditor",
    "Response Time & Follow-Up Monitor",
    "Webinar Presenter Coach",
    "Webinar Technical Director",
    "Webinar Thumbnail Designer",
    "Webinar Paid Traffic Manager",
    "Webinar Organic Traffic Manager",
    "Webinar Partner Outreach Specialist",
    "Webinar Affiliate Manager",
    "Webinar CTA Optimizer",
    "Webinar Application Form Designer",
    "Webinar-to-Sales-Meeting Scheduler",
    "Webinar Attendee Segmentation Analyst",
    "Podcast Guest Sourcing Strategist",
    "Podcast Guest Outreach Specialist — LinkedIn",
    "Podcast Guest Outreach Specialist — Email",
    "Podcast Guest Outreach Specialist — Phone",
    "Podcast Guest Relationship Nurturer",
    "Podcast Guest Prep Coordinator",
    "Podcast Competitive Scarcity Designer",
    "Podcast Interview Host",
    "Podcast Co-Host/Facilitator",
    "Podcast Introduction Writer",
    "Podcast Introduction Voiceover Talent",
    "Podcast Audio Engineer",
    "Podcast Video Editor",
    "Podcast Clip Creator",
    "Podcast Thumbnail Designer",
    "Podcast SEO Optimizer",
    "Podcast Guest Promotion Coordinator",
    "Podcast Clip Viral Strategist",
    "Podcast-to-Ecosystem-Merger Converter",
    "Podcast-to-Sales-Meeting Scheduler",
    "Podcast Sponsorship Sales Manager",
    "Podcast Listener Segmentation Analyst",
    "Director of Live Event Strategy",
    "Event Registration Page Designer",
    "Event Paid Traffic Manager",
    "Event Organic Traffic Manager",
    "Event Partner Promotion Manager",
    "Event Email Sequence Writer",
    "Event Reminder Sequence Manager",
    "Event Venue Sourcer",
    "Event Stage Designer",
    "Event AV Technical Director",
    "Event Slide Designer",
    "Event Workbook Designer",
    "Event Swag/Gift Coordinator",
    "Event Food/Beverage Coordinator",
    "Event Sales Conversation Facilitator",
    "Event Application Collector",
    "Event Follow-Up Scheduler",
    "Director of Community Platform Strategy",
    "Community Gamification Designer",
    "Community Success Story Curator",
    "Community Content Strategist",
    "Community Video Creator",
    "Social Media Community Manager",
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
    "Director of Strategic Partnerships",
    "Director of Channel Partnerships",
    "Director of Technology Partnerships",
    "Director of Industry Partnerships",
    "Director of Affiliate Partnerships",
    "Strategic Partnership Manager",
    "Channel Partnership Manager",
    "Technology Partnership Manager",
    "Industry Partnership Manager",
    "Affiliate Partnership Manager",
    "Partnership Operations Manager",
    "Partnership Marketing Manager",
    "Partnership Analytics Manager",
    "Partnership Legal Manager",
    "Partnership Onboarding Manager",
    "Partnership Success Manager",
    "Partnership Revenue Manager",
    "Partnership Development Specialist",
    "Partnership Coordinator",
    "Partnership Analyst",
    "Partnership Contract Specialist",
    "Partnership Marketing Specialist",
    "Partnership Onboarding Specialist",
    "Partnership Success Specialist",
    "Partnership Revenue Analyst",
    "Partnership Compliance Specialist",
    "Partnership Communication Specialist",
    "Partnership Event Specialist",
    "Partnership Content Specialist",
    "Partnership Training Specialist",
    "Partnership Support Specialist",
    "Partnership Integration Specialist",
    "Partnership Performance Analyst",
    "Partnership Renewal Specialist",
    "Partnership Negotiation Specialist",
    "Partnership Research Specialist",
    "Partnership Database Manager",
    "Partnership CRM Specialist",
    "Partnership Portal Manager",
    "Partnership Documentation Specialist",
    "Partnership Quality Assurance Specialist",
    "Partnership Risk Analyst",
    "Partnership Innovation Specialist",
    "Partnership Competitive Analyst",
    "Partnership Market Researcher",
    "Partnership Relationship Manager",
    "Partnership Account Manager",
    "Partnership Technical Specialist",
    "Partnership Legal Assistant",
    "Partnership Finance Analyst",
    "Partnership Operations Analyst",
    "Partnership Strategy Analyst",
    "Partnership Metrics Specialist",
    "Partnership Reporting Specialist",
    "Partnership Automation Specialist",
    "Partnership Workflow Specialist",
    "Partnership Process Analyst",
    "Partnership Optimization Specialist",
    "Partnership Growth Specialist",
    "Director of Industry Associations",
    "Director of Professional Relationships",
    "Director of Community Relations",
    "Director of Stakeholder Relations",
    "Director of External Relations",
    "Director of Relationship Strategy",
    "Association Relations Manager",
    "Professional Network Manager",
    "Community Engagement Manager",
    "Stakeholder Management Manager",
    "External Relations Manager",
    "Relationship Development Manager",
    "Membership Manager",
    "Networking Events Manager",
    "Industry Relations Manager",
    "Alumni Relations Manager",
    "Influencer Relations Manager",
    "Thought Leadership Manager",
    "Association Liaison",
    "Professional Network Coordinator",
    "Community Manager",
    "Stakeholder Coordinator",
    "External Relations Specialist",
    "Relationship Development Specialist",
    "Membership Coordinator",
    "Networking Events Coordinator",
    "Industry Relations Specialist",
    "Alumni Relations Specialist",
    "Influencer Relations Specialist",
    "Thought Leadership Specialist",
    "Association Event Coordinator",
    "Professional Development Coordinator",
    "Community Content Creator",
    "Stakeholder Communication Specialist",
    "External Communication Specialist",
    "Relationship Analytics Specialist",
    "Membership Analytics Specialist",
    "Networking Analytics Specialist",
    "Industry Research Specialist",
    "Alumni Database Manager",
    "Influencer Database Manager",
    "Thought Leadership Content Creator",
    "Association Marketing Specialist",
    "Professional Network Analyst",
    "Community Growth Specialist",
    "Stakeholder Survey Specialist",
    "External Relations Analyst",
    "Relationship ROI Analyst",
    "Membership Retention Specialist",
    "Networking ROI Analyst",
    "Industry Trend Analyst",
    "Alumni Engagement Specialist",
    "Influencer Outreach Specialist",
    "Thought Leadership Analyst",
    "Association Compliance Specialist",
    "Professional Ethics Specialist",
    "Community Moderation Specialist",
    "Stakeholder Feedback Analyst",
    "External Relations Compliance Specialist",
    "Relationship Innovation Specialist",
    "Director of Ecosystem Sourcing",
    "Ecosystem Outreach Specialist — LinkedIn",
    "Ecosystem Outreach Specialist — Email",
    "Ecosystem Outreach Specialist — Phone/ACTi Beings",
    "Ecosystem Warm Introduction Sourcer",
    "Director of Ecosystem Nurturing",
    "Ecosystem Relationship Manager",
    "Ecosystem Value-Add Coordinator",
    "Ecosystem Coffee Meeting Scheduler",
    "Ecosystem Gift/Reciprocity Coordinator",
    "Director of Ecosystem Proposing",
    "Ecosystem Proposal Writer",
    "Ecosystem Proposal Designer",
    "Ecosystem Value Proposition Strategist",
    "Ecosystem Presentation Creator",
    "Director of Ecosystem Actualizing",
    "Ecosystem Agreement Finalizer",
    "Ecosystem Launch Coordinator",
    "Ecosystem Co-Marketing Manager",
    "Ecosystem Performance Tracker",
  ],
  "1 — Ecosystem Mergers / 4 Components Assessment": [
    "Identity Assessment Specialist",
    "Social Proof Strategist",
    "Brand Alignment Evaluator",
    "Credibility & Authority Analyst",
    "Identity Enhancement Specialist",
    "Relationship Capital Analyst",
    "Network Mapping Specialist",
    "Relationship Value Assessor",
    "Connection Quality Evaluator",
    "Referral Network Architect",
    "Monetary Capital Alignment Specialist",
    "Financial Value Exchange Analyst",
    "Revenue Synergy Evaluator",
    "Investment Alignment Manager",
    "Co-Investment Coordinator",
    "Unique Skills Discovery Specialist",
    "Talent Synergy Evaluator",
    "Complementary Skills Mapper",
    "Skills Gap Analyst",
    "Team Capability Assessor",
  ],
  "1 — Ecosystem Mergers / 6 Roles": [
    "Ecosystem Sourcer — Lead Finder",
    "Ecosystem Sourcer — Research Analyst",
    "Ecosystem Sourcer — Opportunity Scanner",
    "Ecosystem Sourcer — Market Intelligence",
    "Ecosystem Sourcer — Inbound Partnership Manager",
    "Ecosystem Disruptor — Pattern Interrupt Strategist",
    "Ecosystem Disruptor — Value Proposition Designer",
    "Ecosystem Disruptor — Attention Architect",
    "Ecosystem Disruptor — Challenger Messaging Specialist",
    "Ecosystem Disruptor — Industry Shake-Up Analyst",
    "Ecosystem Co-Creator — Joint Program Designer",
    "Ecosystem Co-Creator — Collaborative Content Producer",
    "Ecosystem Co-Creator — Shared Experience Architect",
    "Ecosystem Co-Creator — Integration Specialist",
    "Ecosystem Co-Creator — Mutual Value Builder",
    "Ecosystem Nurturer — Relationship Maintenance Manager",
    "Ecosystem Nurturer — Partner Success Manager",
    "Ecosystem Nurturer — Ongoing Value Deliverer",
    "Ecosystem Nurturer — Trust Deepening Specialist",
    "Ecosystem Nurturer — Long-Term Engagement Manager",
    "Ecosystem Proposer — Agreement Architect",
    "Ecosystem Proposer — Partnership Offer Designer",
    "Ecosystem Proposer — Value Proposition Presenter",
    "Ecosystem Proposer — Merger Terms Specialist",
    "Ecosystem Proposer — Win-Win Framework Builder",
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
  "1 — Ecosystem Mergers / Platform Partnerships": [
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
  ],
  "2 — Speaking / Digital Advertising": [
    "Director of Facebook Marketing",
    "Director of Instagram Marketing",
    "Director of LinkedIn Marketing",
    "Director of Twitter Marketing",
    "Director of YouTube Marketing",
    "Director of TikTok Marketing",
    "Director of Pinterest Marketing",
    "Director of Snapchat Marketing",
    "Director of Reddit Marketing",
    "Director of Discord Marketing",
    "Director of Clubhouse Marketing",
    "Director of Twitch Marketing",
    "Director of WhatsApp Marketing",
    "Director of Telegram Marketing",
    "Director of WeChat Marketing",
    "Facebook Marketing Manager",
    "Facebook Ads Manager",
    "Facebook Content Manager",
    "Facebook Community Manager",
    "Instagram Marketing Manager",
    "Instagram Ads Manager",
    "Instagram Content Manager",
    "Instagram Stories Manager",
    "Instagram Reels Manager",
    "Instagram IGTV Manager",
    "LinkedIn Marketing Manager",
    "LinkedIn Ads Manager",
    "LinkedIn Content Manager",
    "LinkedIn Company Page Manager",
    "LinkedIn Personal Branding Manager",
    "Twitter Marketing Manager",
    "Twitter Ads Manager",
    "Twitter Content Manager",
    "Twitter Community Manager",
    "YouTube Marketing Manager",
    "YouTube Ads Manager",
    "YouTube Content Manager",
    "YouTube Channel Manager",
    "TikTok Marketing Manager",
    "TikTok Ads Manager",
    "TikTok Content Manager",
    "TikTok Influencer Manager",
    "Pinterest Marketing Manager",
    "Pinterest Ads Manager",
    "Pinterest Content Manager",
    "Snapchat Marketing Manager",
    "Snapchat Ads Manager",
    "Snapchat Content Manager",
    "Reddit Marketing Manager",
    "Reddit Content Manager",
    "Reddit Community Manager",
    "Discord Marketing Manager",
    "Discord Community Manager",
    "Clubhouse Marketing Manager",
    "Clubhouse Content Manager",
    "Twitch Marketing Manager",
    "Twitch Content Manager",
    "WhatsApp Marketing Manager",
    "Telegram Marketing Manager",
    "WeChat Marketing Manager",
    "Facebook Marketing Specialist",
    "Facebook Ads Specialist",
    "Facebook Content Creator",
    "Facebook Community Specialist",
    "Facebook Page Administrator",
    "Facebook Group Manager",
    "Facebook Event Manager",
    "Facebook Live Specialist",
    "Facebook Messenger Specialist",
    "Instagram Marketing Specialist",
    "Instagram Ads Specialist",
    "Instagram Content Creator",
    "Instagram Stories Creator",
    "Instagram Reels Creator",
    "Instagram IGTV Creator",
    "Instagram Shopping Specialist",
    "Instagram Influencer Specialist",
    "Instagram Hashtag Specialist",
    "LinkedIn Marketing Specialist",
    "LinkedIn Ads Specialist",
    "LinkedIn Content Creator",
    "LinkedIn Company Page Specialist",
    "LinkedIn Personal Brand Specialist",
    "LinkedIn Lead Generation Specialist",
    "LinkedIn Sales Navigator Specialist",
    "LinkedIn Event Specialist",
    "LinkedIn Group Manager",
    "Twitter Marketing Specialist",
    "Twitter Ads Specialist",
    "Twitter Content Creator",
    "Twitter Community Specialist",
    "Twitter Spaces Specialist",
    "Twitter Thread Creator",
    "Twitter Hashtag Specialist",
    "Twitter Trending Specialist",
    "Twitter Customer Service Specialist",
    "YouTube Marketing Specialist",
    "YouTube Ads Specialist",
    "YouTube Content Creator",
    "YouTube Video Editor",
    "YouTube Thumbnail Designer",
    "YouTube Shorts Creator",
    "YouTube Live Specialist",
    "YouTube Community Specialist",
    "TikTok Marketing Specialist",
    "TikTok Ads Specialist",
    "TikTok Content Creator",
    "TikTok Video Editor",
    "TikTok Trending Specialist",
    "TikTok Hashtag Specialist",
    "TikTok Influencer Specialist",
    "TikTok Live Specialist",
    "TikTok Community Specialist",
    "Pinterest Marketing Specialist",
    "Pinterest Ads Specialist",
    "Pinterest Content Creator",
    "Pinterest Pin Designer",
    "Pinterest Board Manager",
    "Pinterest Analytics Specialist",
    "Pinterest Shopping Specialist",
    "Pinterest Idea Pin Creator",
    "Pinterest Story Pin Creator",
    "Snapchat Marketing Specialist",
    "Snapchat Ads Specialist",
    "Snapchat Content Creator",
    "Snapchat AR Filter Creator",
    "Snapchat Lens Creator",
    "Snapchat Story Creator",
    "Snapchat Analytics Specialist",
    "Snapchat Discover Specialist",
    "Reddit Marketing Specialist",
    "Reddit Content Creator",
    "Reddit Community Moderator",
    "Reddit AMA Coordinator",
    "Reddit Advertising Specialist",
    "Reddit Analytics Specialist",
    "Discord Marketing Specialist",
    "Discord Server Manager",
    "Discord Bot Developer",
    "Discord Community Moderator",
    "Discord Event Coordinator",
    "Clubhouse Marketing Specialist",
    "Clubhouse Room Host",
    "Clubhouse Event Coordinator",
    "Clubhouse Analytics Specialist",
    "Twitch Marketing Specialist",
    "Twitch Streamer",
    "Twitch Moderator",
    "Twitch Analytics Specialist",
    "WhatsApp Marketing Specialist",
    "WhatsApp Business Specialist",
    "Telegram Marketing Specialist",
    "WeChat Marketing Specialist",
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
    "Video SEO Optimizer",
    "Google Ads Strategist",
    "Google Ads Bid Manager",
    "Google Ads Landing Page Optimizer",
    "Facebook/Instagram Ads Strategist",
    "Facebook/Instagram Ads Campaign Manager",
    "Facebook/Instagram Ads Creative Designer",
    "Facebook/Instagram Ads Audience Targeting Specialist",
    "Facebook/Instagram Ads Split Test Manager",
    "SEO Strategist",
    "SEO Technical Specialist",
    "SEO Link Building Specialist",
    "SEO Local Specialist",
    "Facebook Organic Manager",
    "Director of Email Marketing",
    "Email Marketing Strategist",
    "Email List Segmentation Specialist",
    "Email Designer",
    "Email Automation Specialist",
    "Email Deliverability Specialist",
    "Email A/B Test Manager",
    "Director of SMS Marketing",
    "SMS Marketing Strategist",
    "SMS Automation Specialist",
    "SMS Compliance Manager",
    "SMS Analytics Specialist",
    "Director of Website and Conversion Optimization",
    "Website Strategist",
    "Website UX Designer",
    "Website UI Designer",
    "Website SEO Specialist",
    "Website Analytics Specialist",
    "Website A/B Test Manager",
    "Website Accessibility Specialist",
    "Website Security Specialist",
    "Landing Page Strategist",
    "Landing Page A/B Test Manager",
    "CRO Strategist",
    "CRO Analyst",
    "CRO A/B Test Manager",
    "CRO Designer",
    "Outbound Email Outreach Specialist",
  ],
  "2 — Speaking / Content & Blogs": [
    "Director of Content Strategy",
    "Director of Content Marketing",
    "Director of Content Creation",
    "Director of Content Distribution",
    "Director of Content Analytics",
    "Director of Content Operations",
    "Director of Editorial Strategy",
    "Director of Brand Storytelling",
    "Director of Content Innovation",
    "Director of Content Performance",
    "Content Strategy Manager",
    "Content Marketing Manager",
    "Content Creation Manager",
    "Content Distribution Manager",
    "Content Analytics Manager",
    "Content Operations Manager",
    "Editorial Manager",
    "Brand Storytelling Manager",
    "Content Innovation Manager",
    "Content Performance Manager",
    "Blog Content Manager",
    "Video Content Manager",
    "Audio Content Manager",
    "Visual Content Manager",
    "Interactive Content Manager",
    "Long-form Content Manager",
    "Short-form Content Manager",
    "Evergreen Content Manager",
    "Trending Content Manager",
    "Seasonal Content Manager",
    "Industry Content Manager",
    "Product Content Manager",
    "Educational Content Manager",
    "Entertainment Content Manager",
    "Inspirational Content Manager",
    "Technical Content Manager",
    "Legal Content Manager",
    "Financial Content Manager",
    "Healthcare Content Manager",
    "Technology Content Manager",
    "B2B Content Manager",
    "B2C Content Manager",
    "Internal Content Manager",
    "External Content Manager",
    "Paid Content Manager",
    "Organic Content Manager",
    "Syndicated Content Manager",
    "Original Content Manager",
    "Curated Content Manager",
    "User-Generated Content Manager",
    "Content Strategist",
    "Content Marketer",
    "Content Creator",
    "Content Writer",
    "Content Editor",
    "Content Producer",
    "Content Curator",
    "Content Analyst",
    "Content Coordinator",
    "Content Administrator",
    "Blog Writer",
    "Blog Editor",
    "Blog Manager",
    "Article Writer",
    "Article Editor",
    "Copywriter",
    "Copy Editor",
    "Technical Writer",
    "Creative Writer",
    "Ghostwriter",
    "Script Writer",
    "Screenplay Writer",
    "Speech Writer",
    "Press Release Writer",
    "Newsletter Writer",
    "Email Writer",
    "Social Media Writer",
    "Web Content Writer",
    "SEO Content Writer",
    "Long-form Writer",
    "Short-form Writer",
    "Microcopy Writer",
    "Headlines Writer",
    "Subject Line Writer",
    "Call-to-Action Writer",
    "Product Description Writer",
    "Case Study Writer",
    "White Paper Writer",
    "eBook Writer",
    "Guide Writer",
    "Tutorial Writer",
    "How-to Writer",
    "FAQ Writer",
    "Review Writer",
    "Testimonial Writer",
    "Bio Writer",
    "Profile Writer",
    "Interview Writer",
    "Q&A Writer",
    "Survey Writer",
    "Quiz Writer",
    "Poll Writer",
    "Contest Writer",
    "Giveaway Writer",
    "Promotion Writer",
    "Campaign Writer",
    "Ad Copy Writer",
    "Sales Copy Writer",
    "Landing Page Writer",
    "Website Copy Writer",
    "App Copy Writer",
    "UI Copy Writer",
    "UX Writer",
    "Chatbot Writer",
    "Voice Assistant Writer",
    "Video Script Writer",
    "Presentation Writer",
    "Slide Deck Writer",
    "Infographic Writer",
    "Chart Writer",
    "Graph Writer",
    "Table Writer",
    "List Writer",
    "Bullet Point Writer",
    "Caption Writer",
    "Alt Text Writer",
    "Meta Description Writer",
    "Title Tag Writer",
    "Header Writer",
    "Footer Writer",
    "Sidebar Writer",
    "Menu Writer",
    "Navigation Writer",
    "Breadcrumb Writer",
    "Error Message Writer",
    "Success Message Writer",
    "Notification Writer",
    "Alert Writer",
    "Warning Writer",
    "Disclaimer Writer",
    "Terms Writer",
    "Privacy Policy Writer",
    "Legal Writer",
    "Compliance Writer",
    "Regulatory Writer",
    "Medical Writer",
    "Scientific Writer",
    "Research Writer",
    "Content SEO Strategist",
    "Content Audience Research Analyst",
    "Content Competitive Analyst",
    "Content Performance Analyst",
    "Director of Content Production",
    "Blog Writer/Copywriter",
    "Long-Form Article Writer",
    "Ebook Writer",
    "Video Content Strategist",
    "Audio Editor",
    "Content Publishing Manager",
    "Content Paid Promotion Manager",
    "Content Syndication Manager",
    "Content Outreach Specialist",
    "SEO Content Optimizer",
    "Copywriting Director",
  ],
  "2 — Speaking / Webinars & Virtual Stages": [
    "Director of Webinar Technology",
    "Director of Virtual Engagement",
    "Webinar Content Manager",
    "Virtual Event Production Manager",
    "Webinar Analytics Manager",
    "Webinar Marketing Manager",
    "Virtual Event Logistics Manager",
    "Webinar Technical Manager",
    "Virtual Event Design Manager",
    "Webinar Host Specialist",
    "Virtual Event Producer",
    "Webinar Script Writer",
    "Virtual Event Coordinator",
    "Webinar Registration Specialist",
    "Virtual Event Marketing Specialist",
    "Webinar Analytics Specialist",
    "Virtual Event Technical Support",
    "Webinar Promotion Specialist",
    "Virtual Event Attendee Manager",
    "Webinar Engagement Specialist",
    "Virtual Event Moderator",
    "Webinar Email Marketing Specialist",
    "Virtual Event Social Media Specialist",
    "Webinar Landing Page Specialist",
    "Virtual Event Registration Specialist",
    "Webinar Reminder Specialist",
    "Virtual Event Survey Specialist",
    "Webinar Replay Specialist",
    "Virtual Event Archive Manager",
    "Webinar Automation Specialist",
    "Virtual Event Feedback Analyst",
    "Webinar Segmentation Specialist",
    "Virtual Event Accessibility Specialist",
    "Webinar Performance Analyst",
    "Virtual Event Partnership Specialist",
    "Webinar Content Curator",
    "Virtual Event Vendor Manager",
    "Webinar Platform Administrator",
    "Virtual Event Budget Analyst",
    "Webinar Compliance Specialist",
    "Virtual Event Risk Manager",
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
  ],
  "2 — Speaking / Live Stages & Summits": [
    "Director of Speaking Strategy",
    "Director of Speaker Development",
    "Director of Speaking Operations",
    "Director of Speaking Marketing",
    "Director of Speaking Analytics",
    "Director of Speaking Partnerships",
    "Speaking Opportunities Manager",
    "Speaker Development Manager",
    "Speaking Operations Manager",
    "Speaking Marketing Manager",
    "Speaking Analytics Manager",
    "Speaking Partnerships Manager",
    "Keynote Manager",
    "Panel Discussion Manager",
    "Workshop Manager",
    "Speaking Content Manager",
    "Speaking Logistics Manager",
    "Speaking Follow-up Manager",
    "Speaking Opportunities Specialist",
    "Speaker Development Specialist",
    "Speaking Operations Specialist",
    "Speaking Marketing Specialist",
    "Speaking Analytics Specialist",
    "Speaking Partnerships Specialist",
    "Keynote Coordinator",
    "Panel Discussion Coordinator",
    "Workshop Coordinator",
    "Speaking Content Creator",
    "Speaking Logistics Coordinator",
    "Speaking Follow-up Specialist",
    "Speaker Bio Writer",
    "Speaking Proposal Writer",
    "Speaking Slide Designer",
    "Speaking Video Producer",
    "Speaking Audio Engineer",
    "Speaking Photographer",
    "Speaking Social Media Manager",
    "Speaking Content Marketer",
    "Speaking Email Marketer",
    "Speaking Landing Page Designer",
    "Speaking Registration Manager",
    "Speaking Travel Coordinator",
    "Speaking Accommodation Coordinator",
    "Speaking Equipment Manager",
    "Speaking Technical Support",
    "Speaking Rehearsal Coordinator",
    "Speaking Feedback Collector",
    "Speaking ROI Analyst",
    "Speaking Performance Analyst",
    "Speaking Competitive Analyst",
    "Speaking Trend Analyst",
    "Speaking Database Manager",
    "Speaking CRM Specialist",
    "Speaking Lead Capture Specialist",
    "Speaking Conversion Analyst",
    "Speaking Attribution Analyst",
    "Speaking Optimization Specialist",
    "Speaking Innovation Specialist",
    "Speaking Quality Assurance Specialist",
    "Speaking Compliance Specialist",
    "Director of Stage Strategy",
    "Director of Microphone Operations",
    "Director of Audio/Visual Production",
    "Director of Stage Design",
    "Director of Stage Partnerships",
    "Stage Operations Manager",
    "Microphone Systems Manager",
    "Audio/Visual Production Manager",
    "Stage Design Manager",
    "Stage Partnerships Manager",
    "Stage Setup Manager",
    "Sound Engineering Manager",
    "Lighting Manager",
    "Stage Marketing Manager",
    "Stage Technology Manager",
    "Stage Coordinator",
    "Microphone Technician",
    "Audio Engineer",
    "Visual Engineer",
    "Performance Analyst",
    "Stage Partnership Specialist",
    "Stage Setup Specialist",
    "Sound Technician",
    "Lighting Technician",
    "Stage Marketing Specialist",
    "Stage Technology Specialist",
    "Stage Manager",
    "Audio Mixer",
    "Visual Mixer",
    "Stage Hand",
    "Equipment Technician",
    "Cable Technician",
    "Wireless Technician",
    "Recording Technician",
    "Streaming Technician",
    "Monitor Technician",
    "Speaker Technician",
    "Amplifier Technician",
    "Mixer Technician",
    "Effects Technician",
    "Feedback Specialist",
    "Acoustics Specialist",
    "Stage Acoustics Specialist",
    "Audio Quality Specialist",
    "Visual Quality Specialist",
    "Performance Quality Specialist",
    "Stage Safety Specialist",
    "Equipment Safety Specialist",
    "Audio Safety Specialist",
    "Visual Safety Specialist",
    "Stage Compliance Specialist",
    "Equipment Compliance Specialist",
    "Performance Compliance Specialist",
    "Stage Innovation Specialist",
    "Performance Innovation Specialist",
    "Director of Speaking Opportunity Sourcing",
    "Speaking Opportunity Outreach Specialist",
    "Speaking Media Kit Designer",
    "Speaking Demo Reel Editor",
    "Speaking Testimonial Collector",
    "Speaking Fee Negotiator",
    "Director of Speaking Preparation",
    "Speaking Content Strategist",
    "Speaking Rehearsal Coach",
    "Speaking Audience Research Analyst",
    "Director of Speaking Delivery Support",
    "Speaking Introduction Writer",
    "Speaking Backstage Manager",
    "Speaking Audience Engagement Facilitator",
    "Director of Speaking Follow-Up",
    "Speaking Audience Opt-In Collector",
    "Speaking Follow-Up Email Sequence Writer",
    "Speaking Sales Meeting Scheduler",
  ],
  "2 — Speaking / Social Media": [
    "Director of Social Media Strategy",
    "Director of Social Commerce",
    "Director of Social Advertising",
    "Director of Social Analytics",
    "Director of Social Influence",
    "Social Commerce Manager",
    "Social Shopping Manager",
    "Social Advertising Manager",
    "Social Analytics Manager",
    "Social Listening Manager",
    "Social Monitoring Manager",
    "Social Reporting Manager",
    "Social Influence Manager",
    "Social Influencer Manager",
    "Social Ambassador Manager",
    "Social Advocacy Manager",
    "Social Crisis Manager",
    "Social Reputation Manager",
    "Social Commerce Specialist",
    "Social Shopping Specialist",
    "Social Advertising Specialist",
    "Social Analytics Specialist",
    "Social Listening Specialist",
    "Social Monitoring Specialist",
    "Social Reporting Specialist",
    "Social Influence Specialist",
    "Social Influencer Coordinator",
    "Social Ambassador Coordinator",
    "Social Advocacy Specialist",
    "Social Crisis Specialist",
    "Social Reputation Specialist",
    "Social Media Scheduler",
    "Social Media Curator",
    "Social Media Moderator",
    "Social Media Designer",
    "Social Media Copywriter",
    "Social Media Analyst",
    "Twitter/X Content Manager",
    "Facebook Page Manager",
    "Social Media Calendar Manager",
    "Social Engagement & Reply Specialist",
    "Social Listening & Trend Analyst",
    "Influencer Partnership Manager",
    "Social Media Contest Manager",
    "User-Generated Content Curator",
    "Community Management Specialist",
    "Social Analytics & Reporting Manager",
  ],
  "2 — Speaking / Video Production": [
    "Director of Video Marketing",
    "Director of Video Production",
    "Director of Video Strategy",
    "Director of Video Content",
    "Director of Video Distribution",
    "Director of Video Analytics",
    "Director of Video Technology",
    "Director of Video Innovation",
    "Director of Video Operations",
    "Director of Video Performance",
    "Video Marketing Manager",
    "Video Production Manager",
    "Video Strategy Manager",
    "Video Distribution Manager",
    "Video Analytics Manager",
    "Video Technology Manager",
    "Video Innovation Manager",
    "Video Operations Manager",
    "Video Performance Manager",
    "Video Pre-Production Manager",
    "Video Post-Production Manager",
    "Video Creative Manager",
    "Video Technical Manager",
    "Video Quality Manager",
    "Video Workflow Manager",
    "Video Asset Manager",
    "Video Archive Manager",
    "Video Compliance Manager",
    "YouTube Video Manager",
    "Vimeo Video Manager",
    "Wistia Video Manager",
    "Social Video Manager",
    "Live Video Manager",
    "Streaming Video Manager",
    "Interactive Video Manager",
    "360 Video Manager",
    "VR Video Manager",
    "AR Video Manager",
    "Video Producer",
    "Executive Producer",
    "Associate Producer",
    "Line Producer",
    "Field Producer",
    "Post Producer",
    "Video Director",
    "Creative Director",
    "Technical Director",
    "Art Director",
    "Cinematographer",
    "Director of Photography",
    "Camera Operator",
    "Camera Assistant",
    "Focus Puller",
    "Steadicam Operator",
    "Drone Operator",
    "Crane Operator",
    "Jib Operator",
    "Dolly Operator",
    "Lighting Director",
    "Gaffer",
    "Key Grip",
    "Best Boy Electric",
    "Best Boy Grip",
    "Electrician",
    "Grip",
    "Set Decorator",
    "Props Master",
    "Costume Designer",
    "Makeup Artist",
    "Hair Stylist",
    "Script Supervisor",
    "Assistant Director",
    "Second Assistant Director",
    "Third Assistant Director",
    "Production Assistant",
    "Location Manager",
    "Location Scout",
    "Casting Director",
    "Talent Coordinator",
    "Wardrobe Supervisor",
    "Production Designer",
    "Storyboard Artist",
    "Concept Artist",
    "VFX Supervisor",
    "VFX Artist",
    "Compositor",
    "3D Artist",
    "Animator",
    "Character Animator",
    "Motion Designer",
    "Video Editor",
    "Senior Video Editor",
    "Assistant Video Editor",
    "Colorist",
    "Boom Operator",
    "Sound Mixer",
    "Music Composer",
    "Music Supervisor",
    "Voice Over Artist",
    "Narrator",
    "Teleprompter Operator",
    "Video Technician",
    "Equipment Manager",
    "Rental Coordinator",
    "Transportation Coordinator",
    "Catering Coordinator",
    "Safety Coordinator",
    "Insurance Coordinator",
    "Permit Coordinator",
    "Legal Coordinator",
    "Compliance Coordinator",
    "Quality Control Specialist",
    "Video Archivist",
    "Video Librarian",
    "Video Cataloger",
    "Video Transcriber",
    "Video Captioner",
    "Video Translator",
    "Video Localizer",
    "Video Optimizer",
    "Video Compressor",
    "Video Encoder",
    "Video Uploader",
    "Video Scheduler",
    "Video Distributor",
    "Video Promoter",
    "Video Marketer",
    "Video Analyst",
    "Video Researcher",
    "Video Planner",
    "Video Strategist",
    "Video Consultant",
    "Video Trainer",
    "Video Coach",
    "Video Mentor",
    "Video Instructor",
    "Video Teacher",
    "Video Educator",
    "Video Specialist",
    "Video Expert",
    "Video Professional",
    "Video Innovator",
    "Video Pioneer",
    "Video Camera Operator",
    "Video Audio Engineer",
    "Video Motion Graphics Designer",
    "Video Thumbnail Designer",
    "Video Subtitle/Caption Creator",
    "Video Production Director",
  ],
  "2 — Speaking / Audio & Podcasts": [
    "Director of Audio Marketing",
    "Director of Podcast Strategy",
    "Director of Audio Content",
    "Director of Audio Production",
    "Director of Audio Distribution",
    "Director of Audio Analytics",
    "Director of Audio Technology",
    "Director of Audio Innovation",
    "Director of Voice Marketing",
    "Director of Audio Experience",
    "Audio Marketing Manager",
    "Podcast Strategy Manager",
    "Audio Production Manager",
    "Audio Distribution Manager",
    "Audio Analytics Manager",
    "Audio Technology Manager",
    "Audio Innovation Manager",
    "Voice Marketing Manager",
    "Audio Experience Manager",
    "Podcast Production Manager",
    "Podcast Content Manager",
    "Podcast Distribution Manager",
    "Podcast Analytics Manager",
    "Podcast Marketing Manager",
    "Podcast Operations Manager",
    "Podcast Quality Manager",
    "Podcast Workflow Manager",
    "Podcast Asset Manager",
    "Podcast Compliance Manager",
    "Podcast Producer",
    "Executive Podcast Producer",
    "Associate Podcast Producer",
    "Podcast Host",
    "Podcast Co-Host",
    "Podcast Guest Coordinator",
    "Podcast Interviewer",
    "Podcast Researcher",
    "Podcast Writer",
    "Podcast Script Writer",
    "Podcast Show Notes Writer",
    "Podcast Transcript Writer",
    "Podcast Editor",
    "Sound Engineer",
    "Audio Technician",
    "Recording Engineer",
    "Mixing Engineer",
    "Mastering Engineer",
    "Audio Designer",
    "Music Producer",
    "Jingle Creator",
    "Intro Creator",
    "Outro Creator",
    "Bumper Creator",
    "Transition Creator",
    "Background Music Specialist",
    "Audio Book Producer",
    "Audio Drama Producer",
    "Radio Commercial Producer",
    "Podcast Commercial Producer",
    "Audio Ad Producer",
    "Spotify Ad Producer",
    "Pandora Ad Producer",
    "Radio Ad Producer",
    "Streaming Ad Producer",
    "Voice Assistant Content Creator",
    "Alexa Skill Developer",
    "Google Assistant Action Developer",
    "Siri Shortcut Developer",
    "Audio Content Strategist",
    "Audio Content Creator",
    "Audio Content Curator",
    "Audio Content Analyst",
    "Audio Content Coordinator",
    "Audio Content Administrator",
    "Podcast Network Manager",
    "Podcast Platform Manager",
    "Podcast Distribution Specialist",
    "Podcast SEO Specialist",
    "Podcast Marketing Specialist",
    "Podcast Social Media Manager",
    "Podcast Community Manager",
    "Podcast Analytics Specialist",
    "Podcast Performance Analyst",
    "Podcast ROI Analyst",
    "Podcast Growth Specialist",
    "Podcast Monetization Specialist",
    "Podcast Sponsorship Manager",
    "Podcast Advertising Manager",
    "Podcast Partnership Manager",
    "Podcast Equipment Specialist",
    "Podcast Studio Manager",
    "Podcast Technical Support",
    "Podcast Quality Assurance",
    "Podcast Compliance Specialist",
    "Podcast Innovation Specialist",
  ],
  "2 — Speaking / Book & Publishing": [
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
    "Research Report Author",
  ],
  "2 — Speaking / Email Marketing": [
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
  ],
  "2 — Speaking / Brand & PR": [
    "Director of Brand Strategy",
    "PR Campaign Manager",
    "Media Relations Specialist",
    "Podcast Guest Booking Manager",
    "Stage & Speaking Opportunity Scout",
    "Speaker Bureau Liaison",
    "Award Submission Specialist",
    "Thought Leadership Strategist",
    "Brand Voice Guardian",
    "Sean Public Image Manager",
    "Crisis Communication Specialist",
    "Brand Strategist",
    "Brand Archetype Designer",
    "Brand Competitive Analyst",
    "Director of Brand Creative",
    "Brand Visual Identity Designer",
    "Brand Style Guide Creator",
    "Brand Photography Art Director",
    "Brand Videography Art Director",
    "Brand Graphic Designer",
    "Director of Brand Messaging",
    "Brand Messaging Strategist",
    "Brand Voice and Tone Guide Writer",
    "Brand Story Writer",
    "Brand Tagline Creator",
    "Social Media Graphic Designer",
    "Director of Paid Media",
    "Paid Media Analyst",
    "Paid Media Attribution Specialist",
    "Paid Media Reporting Manager",
    "Director of Organic Media",
    "Social Media Strategist",
    "Social Media Content Calendar Manager",
    "Social Media Influencer Outreach Specialist",
    "Social Media UGC",
    "Director of PR Strategy",
    "PR Strategist",
    "PR Press Release Writer",
    "PR Media Kit Designer",
    "Director of Media Relations",
    "Media List Builder",
    "Media Outreach Specialist",
    "Media Relationship Manager",
    "Media Interview Prep Coach",
    "Media Monitoring Specialist",
    "Director of Crisis Management",
    "Crisis Communication Strategist",
    "Crisis Response Writer",
  ],
  "2 — Speaking / SEO & Organic": [
    "YouTube SEO Manager",
    "Pinterest SEO Manager",
    "YouTube SEO Specialist",
    "Pinterest SEO Specialist",
  ],
  "2 — Speaking / Design & Creative": [
    "Director of Design Strategy",
    "Director of Visual Design",
    "Director of Brand Design",
    "Director of Digital Design",
    "Director of Print Design",
    "Director of Motion Design",
    "Director of UX Design",
    "Director of UI Design",
    "Director of Creative Innovation",
    "Director of Design Operations",
    "Design Strategy Manager",
    "Visual Design Manager",
    "Brand Design Manager",
    "Digital Design Manager",
    "Print Design Manager",
    "Motion Design Manager",
    "UX Design Manager",
    "UI Design Manager",
    "Creative Innovation Manager",
    "Design Operations Manager",
    "Graphic Design Manager",
    "Web Design Manager",
    "Mobile Design Manager",
    "Email Design Manager",
    "Social Media Design Manager",
    "Advertising Design Manager",
    "Packaging Design Manager",
    "Environmental Design Manager",
    "Exhibition Design Manager",
    "Signage Design Manager",
    "Logo Design Manager",
    "Typography Manager",
    "Color Strategy Manager",
    "Photography Manager",
    "Illustration Manager",
    "Icon Design Manager",
    "Infographic Design Manager",
    "Presentation Design Manager",
    "Template Design Manager",
    "Asset Management Manager",
    "Senior Graphic Designer",
    "Graphic Designer",
    "Junior Graphic Designer",
    "Senior Web Designer",
    "Web Designer",
    "Junior Web Designer",
    "Senior UI Designer",
    "UI Designer",
    "Junior UI Designer",
    "Senior UX Designer",
    "UX Designer",
    "Junior UX Designer",
    "UX Researcher",
    "UX Strategist",
    "Interaction Designer",
    "Product Designer",
    "Service Designer",
    "Experience Designer",
    "Visual Designer",
    "Digital Designer",
    "Print Designer",
    "Brand Designer",
    "Identity Designer",
    "Logo Designer",
    "Typography Designer",
    "Layout Designer",
    "Publication Designer",
    "Book Designer",
    "Magazine Designer",
    "Newspaper Designer",
    "Brochure Designer",
    "Flyer Designer",
    "Poster Designer",
    "Billboard Designer",
    "Banner Designer",
    "Sign Designer",
    "Wayfinding Designer",
    "Environmental Designer",
    "Exhibition Designer",
    "Trade Show Designer",
    "Event Designer",
    "Stage Designer",
    "Set Designer",
    "Packaging Designer",
    "Label Designer",
    "Industrial Designer",
    "Fashion Designer",
    "Textile Designer",
    "Pattern Designer",
    "Surface Designer",
    "Interior Designer",
    "Architectural Designer",
    "Landscape Designer",
    "Urban Designer",
    "Motion Graphics Designer",
    "Animation Designer",
    "Video Designer",
    "Film Designer",
    "TV Designer",
    "Digital Effects Designer",
    "3D Designer",
    "3D Modeler",
    "3D Animator",
    "Character Designer",
    "Comic Artist",
    "Illustrator",
    "Technical Illustrator",
    "Medical Illustrator",
    "Scientific Illustrator",
    "Children's Book Illustrator",
    "Editorial Illustrator",
    "Fashion Illustrator",
    "Architectural Illustrator",
    "Landscape Illustrator",
    "Portrait Artist",
    "Caricature Artist",
    "Icon Designer",
    "Symbol Designer",
    "Pictogram Designer",
    "Emoji Designer",
    "Avatar Designer",
    "Mascot Designer",
    "Game Designer",
    "App Designer",
    "Website Designer",
    "Landing Page Designer",
    "Email Template Designer",
    "Newsletter Designer",
    "Facebook Designer",
    "Instagram Designer",
    "LinkedIn Designer",
    "Twitter Designer",
    "YouTube Designer",
    "TikTok Designer",
    "Pinterest Designer",
    "Snapchat Designer",
    "Ad Designer",
    "Banner Ad Designer",
    "Display Ad Designer",
    "Video Ad Designer",
    "Social Ad Designer",
    "Search Ad Designer",
    "Native Ad Designer",
    "Sponsored Content Designer",
    "Infographic Designer",
    "Data Visualization Designer",
    "Chart Designer",
    "Graph Designer",
    "Diagram Designer",
    "Map Designer",
    "Timeline Designer",
    "Process Designer",
    "Flowchart Designer",
    "Wireframe Designer",
    "Mockup Designer",
    "Prototype Designer",
    "Template Designer",
    "Theme Designer",
    "Skin Designer",
    "Style Guide Designer",
    "Brand Guidelines Designer",
    "Design System Designer",
    "Component Designer",
    "Pattern Library Designer",
    "Asset Designer",
    "Resource Designer",
    "Tool Designer",
    "Plugin Designer",
    "Extension Designer",
    "Widget Designer",
    "Module Designer",
    "Block Designer",
    "Element Designer",
    "Feature Designer",
    "Function Designer",
    "System Designer",
    "Platform Designer",
    "Framework Designer",
    "Architecture Designer",
    "Structure Designer",
    "Grid Designer",
    "Font Designer",
    "Lettering Designer",
    "Calligraphy Designer",
    "Handwriting Designer",
    "Script Designer",
    "Signature Designer",
    "Monogram Designer",
    "Emblem Designer",
    "Crest Designer",
    "Presentation Designer -Ebook Designer",
    "White Paper Designer",
    "Ad Creative Designer",
    "Illustration Designer",
    "Chart/Data Visualization Designer",
    "Sound Designer",
    "Display Ads Creative Designer",
    "Marketing Dashboard Designer",
    "Marketing Workflow Designer",
    "Coliseum Test Designer",
    "Director of Creative Services",
  ],
  "3 — Agreement Conversations": [
    "Director of Sales Operations",
    "Director of Sales Enablement",
    "Director of Sales Analytics",
    "Director of Sales Technology",
    "Director of Sales Training",
    "Director of Sales Performance",
    "Sales Operations Manager",
    "Sales Enablement Manager",
    "Sales Analytics Manager",
    "Sales Technology Manager",
    "Sales Training Manager",
    "Sales Performance Manager",
    "Sales Process Manager",
    "Sales Compensation Manager",
    "Sales Territory Manager",
    "Sales Forecasting Manager",
    "Sales Pipeline Manager",
    "Sales Reporting Manager",
    "Sales Operations Specialist",
    "Sales Enablement Specialist",
    "Sales Analytics Specialist",
    "Sales Technology Specialist",
    "Sales Training Specialist",
    "Sales Performance Specialist",
    "Sales Process Specialist",
    "Sales Compensation Specialist",
    "Sales Territory Specialist",
    "Sales Forecasting Specialist",
    "Sales Pipeline Specialist",
    "Sales Reporting Specialist",
    "Sales Data Analyst",
    "Sales Metrics Analyst",
    "Sales ROI Analyst",
    "Sales Conversion Analyst",
    "Sales Attribution Analyst",
    "Sales Performance Analyst",
    "Sales Productivity Analyst",
    "Sales Efficiency Analyst",
    "Sales Quality Analyst",
    "Sales Compliance Analyst",
    "Sales Risk Analyst",
    "Sales Trend Analyst",
    "Sales Competitive Analyst",
    "Sales Market Analyst",
    "Sales Customer Analyst",
    "Sales Behavior Analyst",
    "Sales Funnel Analyst",
    "Sales Velocity Analyst",
    "Sales Cycle Analyst",
    "Sales Win/Loss Analyst",
    "Sales Quota Analyst",
    "Sales Commission Analyst",
    "Sales Incentive Analyst",
    "Sales Motivation Analyst",
    "Sales Coaching Specialist",
    "Sales Mentoring Specialist",
    "Sales Development Specialist",
    "Sales Optimization Specialist",
    "Sales Innovation Specialist",
    "Sales Excellence Specialist",
    "Director of Sales Development",
    "Director of Lead Generation",
    "Director of Lead Qualification",
    "Director of Prospecting",
    "Director of Cold Outreach",
    "Director of Warm Nurturing",
    "Sales Development Manager",
    "Lead Generation Manager",
    "Lead Qualification Manager",
    "Prospecting Manager",
    "Cold Outreach Manager",
    "Warm Nurturing Manager",
    "SDR Manager",
    "BDR Manager",
    "Inside Sales Manager",
    "Outbound Sales Manager",
    "Inbound Sales Manager",
    "Sales Development Operations Manager",
    "Senior Sales Development Representative",
    "Sales Development Representative",
    "Junior Sales Development Representative",
    "Business Development Representative",
    "Senior Business Development Representative",
    "Junior Business Development Representative",
    "Inside Sales Representative",
    "Senior Inside Sales Representative",
    "Junior Inside Sales Representative",
    "Outbound Sales Representative",
    "Senior Outbound Sales Representative",
    "Junior Outbound Sales Representative",
    "Inbound Sales Representative",
    "Senior Inbound Sales Representative",
    "Junior Inbound Sales Representative",
    "Lead Generation Specialist",
    "Lead Qualification Specialist",
    "Prospecting Specialist",
    "Cold Outreach Specialist",
    "Warm Nurturing Specialist",
    "Email Outreach Specialist",
    "Phone Outreach Specialist",
    "Social Media Outreach Specialist",
    "LinkedIn Outreach Specialist",
    "Cold Calling Specialist",
    "Warm Calling Specialist",
    "Lead Scoring Specialist",
    "Lead Routing Specialist",
    "Lead Nurturing Specialist",
    "Lead Conversion Specialist",
    "Appointment Setting Specialist",
    "Demo Scheduling Specialist",
    "Follow-up Specialist",
    "Pipeline Development Specialist",
    "Opportunity Creation Specialist",
    "Relationship Building Specialist",
    "Trust Building Specialist",
    "Value Proposition Specialist",
    "Pain Point Identification Specialist",
    "Solution Mapping Specialist",
    "Objection Handling Specialist",
    "Closing Specialist",
    "Referral Generation Specialist",
    "Upselling Specialist",
    "Cross-selling Specialist",
    "Account Expansion Specialist",
    "Customer Success Specialist",
    "Retention Specialist",
    "Renewal Specialist",
    "Advocacy Specialist",
    "Testimonial Collection Specialist",
    "Case Study Development Specialist",
    "Director of Account Management",
    "Director of Customer Success",
    "Director of Account Growth",
    "Director of Customer Retention",
    "Director of Customer Experience",
    "Director of Account Strategy",
    "Account Management Manager",
    "Customer Success Manager",
    "Account Growth Manager",
    "Customer Retention Manager",
    "Customer Experience Manager",
    "Account Strategy Manager",
    "Key Account Manager",
    "Enterprise Account Manager",
    "Strategic Account Manager",
    "Customer Onboarding Manager",
    "Customer Support Manager",
    "Senior Account Executive",
    "Account Executive",
    "Junior Account Executive",
    "Enterprise Account Executive",
    "Strategic Account Executive",
    "Key Account Executive",
    "Account Growth Specialist",
    "Customer Retention Specialist",
    "Customer Experience Specialist",
    "Account Strategy Specialist",
    "Customer Onboarding Specialist",
    "Customer Support Specialist",
    "Customer Analytics Specialist",
    "Account Coordinator",
    "Customer Coordinator",
    "Account Analyst",
    "Customer Analyst",
    "Account Researcher",
    "Customer Researcher",
    "Account Planner",
    "Customer Planner",
    "Account Developer",
    "Customer Developer",
    "Relationship Manager",
    "Customer Relationship Manager",
    "Account Relationship Manager",
    "Customer Advocate",
    "Account Advocate",
    "Customer Champion",
    "Account Champion",
    "Customer Liaison",
    "Account Liaison",
    "Customer Consultant",
    "Account Consultant",
    "Customer Advisor",
    "Account Advisor",
    "Customer Strategist",
    "Account Strategist",
    "Customer Innovation Specialist",
    "Account Innovation Specialist",
    "Customer Excellence Specialist",
    "Director of Sales Meeting Sourcing",
    "Inbound Lead Qualifier",
    "Outbound Lead Sourcer",
    "Sales Meeting Scheduler",
    "Director of Sales Meeting Preparation",
    "Sales Meeting Research Analyst",
    "Sales Meeting Agenda Designer",
    "Director of Sales Meeting Execution",
    "Sales Meeting Facilitator",
    "Sales Meeting Demo Specialist",
    "Sales Meeting Objection Handler",
    "Director of Sales Meeting Follow-Up",
    "Sales Meeting Follow-Up Email Writer",
    "Sales Meeting Proposal Writer",
    "Sales Meeting Follow-Up Caller",
    "Sales Meeting Pipeline Manager",
    "Director of Sales Strategy",
    "Sales Strategist",
    "Sales Pricing Strategist",
    "Sales Objection Library Builder",
    "Sales Playbook Writer",
    "Director of Sales Execution",
    "Sales Closer",
    "Sales Proposal Writer",
    "Sales Contract Negotiator",
    "Sales Agreement Finalizer",
    "Sales Onboarding Coordinator",
    "Sales Trainer",
    "Sales Coach",
    "Sales Content Creator",
    "Sales CRM Manager",
    "Expansion Sales Rep",
  ],
  "4 — Revenue Generated": [
    "Director of Revenue Operations",
    "Director of Revenue Analytics",
    "Director of Revenue Strategy",
    "Director of Revenue Technology",
    "Director of Revenue Performance",
    "Director of Revenue Optimization",
    "Revenue Operations Manager",
    "Revenue Analytics Manager",
    "Revenue Strategy Manager",
    "Revenue Technology Manager",
    "Revenue Performance Manager",
    "Revenue Optimization Manager",
    "Revenue Forecasting Manager",
    "Revenue Planning Manager",
    "Revenue Reporting Manager",
    "Revenue Attribution Manager",
    "Revenue Intelligence Manager",
    "Revenue Growth Manager",
    "Revenue Operations Specialist",
    "Revenue Strategy Specialist",
    "Revenue Technology Specialist",
    "Revenue Performance Specialist",
    "Revenue Optimization Specialist",
    "Revenue Forecasting Specialist",
    "Revenue Planning Specialist",
    "Revenue Reporting Specialist",
    "Revenue Attribution Specialist",
    "Revenue Intelligence Specialist",
    "Revenue Growth Specialist",
    "Revenue Data Analyst",
    "Revenue Metrics Analyst",
    "Revenue ROI Analyst",
    "Revenue Conversion Analyst",
    "Revenue Pipeline Analyst",
    "Revenue Funnel Analyst",
    "Revenue Velocity Analyst",
    "Revenue Cycle Analyst",
    "Revenue Trend Analyst",
    "Revenue Competitive Analyst",
    "Revenue Market Analyst",
    "Revenue Customer Analyst",
    "Revenue Segment Analyst",
    "Revenue Channel Analyst",
    "Revenue Product Analyst",
    "Revenue Service Analyst",
    "Revenue Geography Analyst",
    "Revenue Time Series Analyst",
    "Revenue Cohort Analyst",
    "Revenue Churn Analyst",
    "Revenue Retention Analyst",
    "Revenue Expansion Analyst",
    "Revenue Contraction Analyst",
    "Revenue Quality Analyst",
    "Revenue Risk Analyst",
    "Revenue Compliance Analyst",
    "Revenue Process Analyst",
    "Revenue Workflow Analyst",
    "Revenue Automation Specialist",
    "Revenue Innovation Specialist",
    "Director of Pricing Strategy",
    "Director of Product Packaging",
    "Director of Revenue Models",
    "Director of Pricing Analytics",
    "Director of Competitive Pricing",
    "Director of Value-Based Pricing",
    "Pricing Strategy Manager",
    "Product Packaging Manager",
    "Revenue Models Manager",
    "Pricing Analytics Manager",
    "Competitive Pricing Manager",
    "Value-Based Pricing Manager",
    "Pricing Operations Manager",
    "Pricing Research Manager",
    "Pricing Testing Manager",
    "Pricing Optimization Manager",
    "Pricing Communication Manager",
    "Pricing Implementation Manager",
    "Pricing Strategy Specialist",
    "Product Packaging Specialist",
    "Revenue Models Specialist",
    "Pricing Analytics Specialist",
    "Competitive Pricing Specialist",
    "Value-Based Pricing Specialist",
    "Pricing Operations Specialist",
    "Pricing Research Specialist",
    "Pricing Testing Specialist",
    "Pricing Optimization Specialist",
    "Pricing Communication Specialist",
    "Pricing Implementation Specialist",
    "Pricing Analyst",
    "Pricing Researcher",
    "Pricing Modeler",
    "Pricing Tester",
    "Pricing Optimizer",
    "Pricing Communicator",
    "Pricing Implementer",
    "Pricing Coordinator",
    "Pricing Administrator",
    "Pricing Compliance Specialist",
    "Pricing Risk Specialist",
    "Pricing Quality Specialist",
    "Pricing Performance Specialist",
    "Pricing Efficiency Specialist",
    "Pricing Effectiveness Specialist",
    "Pricing Innovation Specialist",
    "Pricing Excellence Specialist",
    "Pricing Best Practices Specialist",
    "Pricing Methodology Specialist",
    "Pricing Framework Specialist",
    "Pricing Process Specialist",
    "Pricing Workflow Specialist",
    "Pricing Automation Specialist",
    "Pricing Integration Specialist",
    "Pricing Platform Specialist",
    "Pricing Tool Specialist",
    "Pricing System Specialist",
    "Pricing Database Specialist",
    "Pricing Reporting Specialist",
    "Pricing Dashboard Specialist",
    "Director of Pricing Optimization",
    "Director of Upsell/Cross-Sell",
    "Upsell Strategist",
    "Director of Retention",
    "Churn Analyst",
  ],
  "5 — Disposable Income": [
    "Director of Customer Lifetime Value",
    "Director of Customer Economics",
    "Director of Customer Profitability",
    "Director of Customer Investment",
    "Director of Customer ROI",
    "Director of Customer Value Optimization",
    "Customer Lifetime Value Manager",
    "Customer Economics Manager",
    "Customer Profitability Manager",
    "Customer Investment Manager",
    "Customer ROI Manager",
    "Customer Value Optimization Manager",
    "Customer Segmentation Manager",
    "Customer Scoring Manager",
    "Customer Modeling Manager",
    "Customer Prediction Manager",
    "Customer Intelligence Manager",
    "Customer Lifetime Value Specialist",
    "Customer Economics Specialist",
    "Customer Profitability Specialist",
    "Customer Investment Specialist",
    "Customer ROI Specialist",
    "Customer Value Optimization Specialist",
    "Customer Segmentation Specialist",
    "Customer Scoring Specialist",
    "Customer Modeling Specialist",
    "Customer Prediction Specialist",
    "Customer Intelligence Specialist",
    "Customer Data Analyst",
    "Customer Behavior Analyst",
    "Customer Journey Analyst",
    "Customer Touchpoint Analyst",
    "Customer Interaction Analyst",
    "Customer Engagement Analyst",
    "Customer Satisfaction Analyst",
    "Customer Loyalty Analyst",
    "Customer Retention Analyst",
    "Customer Churn Analyst",
    "Customer Expansion Analyst",
    "Customer Upsell Analyst",
    "Customer Cross-sell Analyst",
    "Customer Referral Analyst",
    "Customer Advocacy Analyst",
    "Customer Testimonial Analyst",
    "Customer Case Study Analyst",
    "Customer Success Analyst",
    "Customer Health Analyst",
    "Customer Risk Analyst",
    "Customer Opportunity Analyst",
    "Customer Potential Analyst",
    "Customer Value Analyst",
    "Customer Worth Analyst",
    "Customer Investment Analyst",
    "Customer Return Analyst",
    "Customer Yield Analyst",
    "Customer Margin Analyst",
    "Customer Profit Analyst",
    "Customer Revenue Analyst",
    "Director of Financial Optimization",
    "Director of Cost Management",
    "Director of Budget Optimization",
    "Director of Resource Allocation",
    "Director of Investment Strategy",
    "Director of Financial Performance",
    "Financial Optimization Manager",
    "Cost Management Manager",
    "Budget Optimization Manager",
    "Resource Allocation Manager",
    "Investment Strategy Manager",
    "Financial Performance Manager",
    "Financial Planning Manager",
    "Financial Analysis Manager",
    "Financial Reporting Manager",
    "Financial Forecasting Manager",
    "Financial Modeling Manager",
    "Financial Intelligence Manager",
    "Financial Optimization Specialist",
    "Cost Management Specialist",
    "Budget Optimization Specialist",
    "Resource Allocation Specialist",
    "Investment Strategy Specialist",
    "Financial Performance Specialist",
    "Financial Planning Specialist",
    "Financial Analysis Specialist",
    "Financial Reporting Specialist",
    "Financial Forecasting Specialist",
    "Financial Modeling Specialist",
    "Financial Intelligence Specialist",
    "Financial Analyst",
    "Cost Analyst",
    "Budget Analyst",
    "Resource Analyst",
    "Investment Analyst",
    "Planning Analyst",
    "Forecasting Analyst",
    "Modeling Analyst",
    "Intelligence Analyst",
    "Financial Coordinator",
    "Cost Coordinator",
    "Budget Coordinator",
    "Resource Coordinator",
    "Investment Coordinator",
    "Performance Coordinator",
    "Planning Coordinator",
    "Forecasting Coordinator",
    "Modeling Coordinator",
    "Intelligence Coordinator",
    "Financial Administrator",
    "Cost Administrator",
    "Budget Administrator",
    "Resource Administrator",
    "Investment Administrator",
    "Performance Administrator",
    "Planning Administrator",
    "Forecasting Administrator",
    "Modeling Administrator",
    "Intelligence Administrator",
  ],
  "6 — Contributions": [
    "Director of Social Impact",
    "Director of Community Contributions",
    "Director of Charitable Giving",
    "Director of Volunteer Programs",
    "Director of Social Responsibility",
    "Director of Impact Measurement",
    "Social Impact Manager",
    "Community Contributions Manager",
    "Charitable Giving Manager",
    "Volunteer Programs Manager",
    "Social Responsibility Manager",
    "Impact Measurement Manager",
    "Community Outreach Manager",
    "Nonprofit Relations Manager",
    "Cause Marketing Manager",
    "Environmental Impact Manager",
    "Sustainability Manager",
    "Social Impact Specialist",
    "Community Contributions Specialist",
    "Charitable Giving Specialist",
    "Volunteer Programs Specialist",
    "Social Responsibility Specialist",
    "Impact Measurement Specialist",
    "Community Outreach Specialist",
    "Nonprofit Relations Specialist",
    "Cause Marketing Specialist",
    "Environmental Impact Specialist",
    "Sustainability Specialist",
    "Social Impact Coordinator",
    "Community Coordinator",
    "Charitable Coordinator",
    "Volunteer Coordinator",
    "Responsibility Coordinator",
    "Impact Coordinator",
    "Outreach Coordinator",
    "Nonprofit Coordinator",
    "Cause Coordinator",
    "Advocacy Coordinator",
    "Environmental Coordinator",
    "Sustainability Coordinator",
    "Social Impact Analyst",
    "Community Analyst",
    "Charitable Analyst",
    "Volunteer Analyst",
    "Responsibility Analyst",
    "Impact Analyst",
    "Outreach Analyst",
    "Nonprofit Analyst",
    "Cause Analyst",
    "Advocacy Analyst",
    "Environmental Analyst",
    "Sustainability Analyst",
    "Social Impact Researcher",
    "Community Researcher",
    "Charitable Researcher",
    "Volunteer Researcher",
    "Responsibility Researcher",
    "Impact Researcher",
    "Director of Thought Leadership",
    "Director of Industry Influence",
    "Director of Expert Positioning",
    "Director of Knowledge Sharing",
    "Director of Intellectual Capital",
    "Director of Opinion Leadership",
    "Industry Influence Manager",
    "Expert Positioning Manager",
    "Knowledge Sharing Manager",
    "Intellectual Capital Manager",
    "Opinion Leadership Manager",
    "Content Thought Leadership Manager",
    "Speaking Thought Leadership Manager",
    "Media Thought Leadership Manager",
    "Research Thought Leadership Manager",
    "Publication Thought Leadership Manager",
    "Digital Thought Leadership Manager",
    "Industry Influence Specialist",
    "Expert Positioning Specialist",
    "Knowledge Sharing Specialist",
    "Intellectual Capital Specialist",
    "Opinion Leadership Specialist",
    "Content Thought Leadership Specialist",
    "Speaking Thought Leadership Specialist",
    "Media Thought Leadership Specialist",
    "Research Thought Leadership Specialist",
    "Publication Thought Leadership Specialist",
    "Digital Thought Leadership Specialist",
    "Thought Leadership Writer",
    "Industry Influence Writer",
    "Expert Positioning Writer",
    "Knowledge Sharing Writer",
    "Intellectual Capital Writer",
    "Opinion Leadership Writer",
    "Thought Leadership Researcher",
    "Industry Influence Researcher",
    "Expert Positioning Researcher",
    "Knowledge Sharing Researcher",
    "Intellectual Capital Researcher",
    "Opinion Leadership Researcher",
    "Industry Influence Analyst",
    "Expert Positioning Analyst",
    "Knowledge Sharing Analyst",
    "Intellectual Capital Analyst",
    "Opinion Leadership Analyst",
    "Thought Leadership Coordinator",
    "Industry Influence Coordinator",
    "Expert Positioning Coordinator",
    "Knowledge Sharing Coordinator",
    "Intellectual Capital Coordinator",
    "Opinion Leadership Coordinator",
    "Thought Leadership Producer",
    "Industry Influence Producer",
    "Expert Positioning Producer",
    "Knowledge Sharing Producer",
    "Intellectual Capital Producer",
    "Opinion Leadership Producer",
  ],
  "7 — Fun & Magic": [
    "Director of Creative Experience",
    "Director of Brand Magic",
    "Director of Customer Delight",
    "Director of Experiential Marketing",
    "Director of Magical Moments",
    "Creative Experience Manager",
    "Brand Magic Manager",
    "Customer Delight Manager",
    "Experiential Marketing Manager",
    "Magical Moments Manager",
    "Creative Content Manager",
    "Interactive Experience Manager",
    "Immersive Experience Manager",
    "Surprise & Delight Manager",
    "Gamification Manager",
    "Entertainment Marketing Manager",
    "Creative Experience Specialist",
    "Brand Magic Specialist",
    "Customer Delight Specialist",
    "Experiential Marketing Specialist",
    "Creative Innovation Specialist",
    "Magical Moments Specialist",
    "Creative Content Specialist",
    "Interactive Experience Specialist",
    "Immersive Experience Specialist",
    "Surprise & Delight Specialist",
    "Gamification Specialist",
    "Entertainment Marketing Specialist",
    "Creative Experience Designer",
    "Brand Magic Designer",
    "Customer Delight Designer",
    "Experiential Designer",
    "Creative Innovation Designer",
    "Magical Moments Designer",
    "Creative Experience Producer",
    "Brand Magic Producer",
    "Customer Delight Producer",
    "Experiential Producer",
    "Creative Innovation Producer",
    "Magical Moments Producer",
    "Creative Experience Coordinator",
    "Brand Magic Coordinator",
    "Customer Delight Coordinator",
    "Experiential Coordinator",
    "Creative Innovation Coordinator",
    "Magical Moments Coordinator",
    "Creative Experience Analyst",
    "Brand Magic Analyst",
    "Customer Delight Analyst",
    "Experiential Analyst",
    "Creative Innovation Analyst",
    "Magical Moments Analyst",
    "Fun Experience Creator",
    "Magic Experience Creator",
    "Delight Experience Creator",
    "Wonder Experience Creator",
    "Joy Experience Creator",
    "Amazement Experience Creator",
  ],
  "Analytics & Intelligence": [
    "Director of Marketing Analytics",
    "Director of Data Strategy",
    "Director of Business Intelligence",
    "Director of Performance Analytics",
    "Director of Customer Analytics",
    "Director of Digital Analytics",
    "Director of Attribution Analytics",
    "Director of Predictive Analytics",
    "Director of Marketing Science",
    "Director of Data Innovation",
    "Marketing Analytics Manager",
    "Data Strategy Manager",
    "Business Intelligence Manager",
    "Performance Analytics Manager",
    "Customer Analytics Manager",
    "Digital Analytics Manager",
    "Attribution Analytics Manager",
    "Predictive Analytics Manager",
    "Marketing Science Manager",
    "Data Innovation Manager",
    "Web Analytics Manager",
    "Social Media Analytics Manager",
    "Email Analytics Manager",
    "Paid Media Analytics Manager",
    "SEO Analytics Manager",
    "Mobile Analytics Manager",
    "App Analytics Manager",
    "E-commerce Analytics Manager",
    "Conversion Analytics Manager",
    "Funnel Analytics Manager",
    "Cohort Analytics Manager",
    "Segmentation Analytics Manager",
    "A/B Testing Manager",
    "Experimentation Manager",
    "Statistical Analysis Manager",
    "Data Visualization Manager",
    "Reporting Manager",
    "Dashboard Manager",
    "Senior Marketing Analyst",
    "Marketing Analyst",
    "Junior Marketing Analyst",
    "Senior Data Analyst",
    "Data Analyst",
    "Junior Data Analyst",
    "Senior Business Analyst",
    "Business Analyst",
    "Junior Business Analyst",
    "Senior Performance Analyst",
    "Junior Performance Analyst",
    "Senior Customer Analyst",
    "Junior Customer Analyst",
    "Senior Digital Analyst",
    "Digital Analyst",
    "Junior Digital Analyst",
    "Senior Attribution Analyst",
    "Attribution Analyst",
    "Junior Attribution Analyst",
    "Senior Predictive Analyst",
    "Predictive Analyst",
    "Junior Predictive Analyst",
    "Senior Marketing Scientist",
    "Marketing Scientist",
    "Junior Marketing Scientist",
    "Senior Data Scientist",
    "Data Scientist",
    "Junior Data Scientist",
    "Senior Statistician",
    "Statistician",
    "Junior Statistician",
    "Senior Research Analyst",
    "Research Analyst",
    "Junior Research Analyst",
    "Senior Insights Analyst",
    "Insights Analyst",
    "Junior Insights Analyst",
    "Senior Reporting Analyst",
    "Reporting Analyst",
    "Junior Reporting Analyst",
    "Senior Dashboard Analyst",
    "Dashboard Analyst",
    "Junior Dashboard Analyst",
    "Web Analytics Specialist",
    "Google Analytics Specialist",
    "Adobe Analytics Specialist",
    "Social Media Analytics Specialist",
    "Facebook Analytics Specialist",
    "Instagram Analytics Specialist",
    "LinkedIn Analytics Specialist",
    "Twitter Analytics Specialist",
    "YouTube Analytics Specialist",
    "TikTok Analytics Specialist",
    "Email Analytics Specialist",
    "Mailchimp Analytics Specialist",
    "HubSpot Analytics Specialist",
    "Salesforce Analytics Specialist",
    "Paid Media Analytics Specialist",
    "Google Ads Analytics Specialist",
    "Facebook Ads Analytics Specialist",
    "LinkedIn Ads Analytics Specialist",
    "SEO Analytics Specialist",
    "Content Analytics Specialist",
    "Video Analytics Specialist",
    "Mobile Analytics Specialist",
    "App Analytics Specialist",
    "E-commerce Analytics Specialist",
    "Shopify Analytics Specialist",
    "Amazon Analytics Specialist",
    "Conversion Analytics Specialist",
    "Funnel Analytics Specialist",
    "Cohort Analytics Specialist",
    "Segmentation Analytics Specialist",
    "A/B Testing Specialist",
    "Multivariate Testing Specialist",
    "Experimentation Specialist",
    "Statistical Analysis Specialist",
    "Data Visualization Specialist",
    "Tableau Specialist",
    "Power BI Specialist",
    "Looker Specialist",
    "Data Studio Specialist",
    "Excel Analytics Specialist",
    "SQL Analyst",
    "Python Analytics Specialist",
    "R Analytics Specialist",
    "Machine Learning Specialist",
    "AI Analytics Specialist",
    "Deep Learning Specialist",
    "Neural Network Specialist",
    "Algorithm Specialist",
    "Model Building Specialist",
    "Data Mining Specialist",
    "Pattern Recognition Specialist",
    "Anomaly Detection Specialist",
    "Fraud Detection Specialist",
    "Risk Analytics Specialist",
    "Churn Analytics Specialist",
    "Lifetime Value Specialist",
    "Revenue Analytics Specialist",
    "ROI Analytics Specialist",
    "ROAS Analytics Specialist",
    "Cost Analytics Specialist",
    "Budget Analytics Specialist",
    "Spend Analytics Specialist",
    "Efficiency Analytics Specialist",
    "Productivity Analytics Specialist",
    "Quality Analytics Specialist",
    "Performance Analytics Specialist",
    "Benchmark Analytics Specialist",
    "Competitive Analytics Specialist",
    "Market Analytics Specialist",
    "Industry Analytics Specialist",
    "CRM Manager",
    "Marketing Automation Manager",
    "Marketing Data Integration Specialist",
    "Marketing Data Analyst",
    "Director of Marketing Project Management",
    "Marketing Project Manager",
    "Coliseum Data Analyst",
  ],
  "Other — Miscellaneous": [
    "Voiceover Talent",
    "Bing Ads Manager",
    "Twitter/X Ads Manager",
    "Display Ads Strategist",
    "Retargeting Campaign Manager",
    "Programmatic Buying Specialist",
    "LinkedIn Organic Manager",
    "Instagram Organic Manager",
    "Twitter/X Organic Manager",
    "TikTok Organic Manager",
    "YouTube Organic Manager",
    "Director of Marketing Technology",
    "Marketing Technology Strategist",
    "Marketing Technology Trainer",
    "Marketing Attribution Analyst",
    "Marketing Reporting Manager",
    "Marketing Forecasting Analyst",
    "Outbound Cold Caller",
    "Outbound LinkedIn Outreach Specialist",
    "Discount Strategy Manager",
    "Director of Cost Reduction",
    "Vendor Negotiator",
    "Cross-Sell Strategist",
    "Win-Back Specialist",
    "Director of Translation and Localization",
    "Localization Specialist",
    "Privacy Specialist",
    "Photography Director",
    "→ Specialists → Coordinators → Individual Contributors.",
  ],
  "Other — ACT-I & Coliseum": [
    "Director of Coliseum Operations",
    "Coliseum Optimization Specialist",
    "Director of ACTi Being Development",
    "Being Trainer",
    "Being Quality Assurance Specialist",
    "Being Optimization Specialist",
    "Director of Marketing Compliance",
    "Compliance Specialist",
  ],
};

const DIV_COLORS = {};
Object.keys(POSITIONS).forEach(function(div) {
  if (div.startsWith("Executive")) DIV_COLORS[div] = "#ff2d55";
  else if (div.startsWith("0.5")) DIV_COLORS[div] = "#00d4ff";
  else if (div.startsWith("1 ")) DIV_COLORS[div] = "#00ff88";
  else if (div.startsWith("2 ")) DIV_COLORS[div] = "#a855f7";
  else if (div.startsWith("3 ")) DIV_COLORS[div] = "#ff9500";
  else if (div.startsWith("4 ")) DIV_COLORS[div] = "#34c759";
  else if (div.startsWith("5 ")) DIV_COLORS[div] = "#5ac8fa";
  else if (div.startsWith("6 ")) DIV_COLORS[div] = "#ff6b6b";
  else if (div.startsWith("7 ")) DIV_COLORS[div] = "#ffcc00";
  else if (div.startsWith("Analytics")) DIV_COLORS[div] = "#5e5ce6";
  else DIV_COLORS[div] = "#8899aa";
});

let _nid = Date.now();

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [cam, setCam] = useState({ x: 0, y: 0, z: 1 });
  const [drag, setDrag] = useState(null);
  const [pan, setPan] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sideOpen, setSideOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedDiv, setExpandedDiv] = useState(null);
  const [selected, setSelected] = useState(null);
  const [multiSelected, setMultiSelected] = useState(new Set());
  const [selectionBox, setSelectionBox] = useState(null);
  const [mode, setMode] = useState("select");
  const [editingNode, setEditingNode] = useState(null);
  const canvasRef = useRef(null);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  // ─── Smooth fly-to animation ───
  const flyToRef = useRef(null);
  const flyTo = useCallback((wx, wy, targetZoom = 1.2, durationMs = 400) => {
    if (flyToRef.current) cancelAnimationFrame(flyToRef.current);
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) { setCam({ x: -wx * targetZoom + r?.width / 2, y: -wy * targetZoom + r?.height / 2, z: targetZoom }); return; }
    const startCam = { ...cam };
    const endX = -wx * targetZoom + r.width / 2;
    const endY = -wy * targetZoom + r.height / 2;
    const start = performance.now();
    const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const animate = (now) => {
      const t = Math.min((now - start) / durationMs, 1);
      const e = ease(t);
      setCam({
        x: startCam.x + (endX - startCam.x) * e,
        y: startCam.y + (endY - startCam.y) * e,
        z: startCam.z + (targetZoom - startCam.z) * e,
      });
      if (t < 1) flyToRef.current = requestAnimationFrame(animate);
    };
    flyToRef.current = requestAnimationFrame(animate);
  }, [cam]);

  // Tracking refs for history (declared early so auto-save can reference them)
  const prevNodesLenRef = useRef(0);
  const prevEdgesLenRef = useRef(0);

  // ─── Auto-save to localStorage ───
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // Load from URL hash first, then localStorage
    try {
      const hash = window.location.hash.slice(1);
      if (hash && hash.startsWith("s=")) {
        const decoded = JSON.parse(atob(decodeURIComponent(hash.slice(2))));
        if (decoded.nodes) { setNodes(decoded.nodes); prevNodesLenRef.current = decoded.nodes.length; }
        if (decoded.edges) { setEdges(decoded.edges); prevEdgesLenRef.current = decoded.edges.length; }
        setLoaded(true);
        // Clear hash after loading so it doesn't override future saves
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
    } catch (e) { /* ignore bad hash */ }
    try {
      const saved = localStorage.getItem("lever-org-chart-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.nodes.length > 0) {
          // Auto-upgrade: if stored data has fewer nodes than v6, merge v6
          if (parsed.nodes.length < 3200) {
            fetch("./baseline-org-chart-v6.json?v=" + Date.now()).then(r => r.json()).then(v6 => {
              if (v6.nodes && v6.nodes.length > parsed.nodes.length) {
                const existingIds = new Set(parsed.nodes.map(n => n.id));
                const newNodes = v6.nodes.filter(n => !existingIds.has(n.id));
                if (newNodes.length > 0) {
                  setNodes(prev => [...prev, ...newNodes]);
                  const existingEdgeKeys = new Set(parsed.edges.map(e => e.source + "->" + e.target));
                  const newEdges = (v6.edges||[]).filter(e => !existingEdgeKeys.has(e.source + "->" + e.target));
                  if (newEdges.length > 0) setEdges(prev => [...prev, ...newEdges]);
                  console.log("Auto-merged " + newNodes.length + " positions from Kai architecture");
                }
              }
            }).catch(() => {});
          }
          setNodes(parsed.nodes); prevNodesLenRef.current = parsed.nodes.length;
          if (parsed.edges) { setEdges(parsed.edges); prevEdgesLenRef.current = parsed.edges.length; }
        } else {
          // No saved data — load v6 as default
          fetch("./baseline-org-chart-v6.json?v=" + Date.now()).then(r => r.json()).then(v6 => {
            if (v6.nodes) { setNodes(v6.nodes); prevNodesLenRef.current = v6.nodes.length; }
            if (v6.edges) { setEdges(v6.edges); prevEdgesLenRef.current = v6.edges.length; }
          }).catch(() => {});
        }
      } else {
        // No localStorage at all — load v6 as default
        fetch("./baseline-org-chart-v6.json?v=" + Date.now()).then(r => r.json()).then(v6 => {
          if (v6.nodes) { setNodes(v6.nodes); prevNodesLenRef.current = v6.nodes.length; }
          if (v6.edges) { setEdges(v6.edges); prevEdgesLenRef.current = v6.edges.length; }
        }).catch(() => {});
      }
    } catch (e) { /* ignore */ }
    setLoaded(true);
    // Auto-merge descriptions from bundled file (always overwrites with latest Formula versions)
    fetch("./descriptions.json?v=" + Date.now()).then(r => r.json()).then(descMap => {
      setNodes(prev => {
        let changed = false;
        const updated = prev.map(n => {
          const d = descMap[n.id];
          if (d && d !== n.description) { changed = true; return { ...n, description: d }; }
          return n;
        });
        return changed ? updated : prev;
      });
    }).catch(() => {});
  }, []);

  // Save to localStorage on changes (debounced)
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (!loaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("lever-org-chart-state", JSON.stringify({ nodes, edges }));
      } catch (e) { /* storage full */ }
    }, 500);
  }, [nodes, edges, loaded]);

  // Export as JSON file
  const exportJSON = useCallback(() => {
    const data = JSON.stringify({ nodes, edges, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lever-org-chart-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Import from JSON file
  const importJSON = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.nodes) { setNodes(data.nodes); prevNodesLenRef.current = data.nodes.length; }
          if (data.edges) { setEdges(data.edges); prevEdgesLenRef.current = data.edges.length; }
          saveHistory(data.nodes || [], data.edges || []);
        } catch (err) { alert("Invalid file format"); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [saveHistory]);

  // Fresh import — clears localStorage first, then imports
  const freshImport = useCallback(() => {
    if (!confirm("This will clear your current canvas and load the new file. Continue?")) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          localStorage.removeItem("lever-org-chart-state");
          const data = JSON.parse(ev.target.result);
          if (data.nodes) { setNodes(data.nodes); prevNodesLenRef.current = data.nodes.length; }
          if (data.edges) { setEdges(data.edges); prevEdgesLenRef.current = data.edges.length; }
          saveHistory(data.nodes || [], data.edges || []);
          const withDesc = (data.nodes || []).filter(n => n.description && n.description.trim()).length;
          setTimeout(() => alert("✅ Fresh import complete!\n" + (data.nodes||[]).length + " nodes loaded\n" + withDesc + " with descriptions"), 100);
        } catch (err) { alert("Invalid file format"); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [saveHistory]);

  // Merge descriptions only from JSON file (preserves positions + layout)
  const mergeDescriptions = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.nodes) { alert("No nodes found in file"); return; }
          const descMap = {};
          data.nodes.forEach(n => { if (n.description && n.description.trim()) descMap[n.id] = n.description; });
          // Also match by title+division for nodes with different IDs
          const titleMap = {};
          data.nodes.forEach(n => { if (n.description && n.description.trim()) titleMap[n.title + "||" + n.division] = n.description; });
          let updated = 0;
          setNodes(prev => prev.map(n => {
            if (n.description && n.description.trim()) return n; // already has one, skip
            const desc = descMap[n.id] || titleMap[n.title + "||" + n.division];
            if (desc) { updated++; return { ...n, description: desc }; }
            return n;
          }));
          setTimeout(() => alert(`✅ Merged ${updated} descriptions!\nYour positions and layout are untouched.`), 100);
        } catch (err) { alert("Invalid file format"); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // Share link - compress state into URL
  const [shareMsg, setShareMsg] = useState("");
  const shareLink = useCallback(() => {
    try {
      const minimal = { nodes: nodes.map(n => ({ id: n.id, title: n.title, division: n.division, color: n.color, x: Math.round(n.x), y: Math.round(n.y), w: n.w, h: n.h, description: n.description || "" })), edges };
      const encoded = btoa(JSON.stringify(minimal));
      const url = window.location.origin + window.location.pathname + "#s=" + encodeURIComponent(encoded);
      if (url.length > 50000) {
        // Too large for URL - fall back to export
        exportJSON();
        setShareMsg("Too many nodes for URL - exported as file instead");
      } else {
        navigator.clipboard.writeText(url).then(() => {
          setShareMsg("✅ Link copied!");
        }).catch(() => {
          // Fallback
          prompt("Copy this share link:", url);
          setShareMsg("✅ Link ready");
        });
      }
      setTimeout(() => setShareMsg(""), 3000);
    } catch (e) { alert("Could not generate share link"); }
  }, [nodes, edges, exportJSON]);

  // Undo/Redo history
  const historyRef = useRef([{ nodes: [], edges: [] }]);
  const historyIndexRef = useRef(0);
  const skipHistoryRef = useRef(false);

  const saveHistory = useCallback((newNodes, newEdges) => {
    if (skipHistoryRef.current) { skipHistoryRef.current = false; return; }
    const h = historyRef.current;
    const i = historyIndexRef.current;
    // Trim any future states if we branched
    historyRef.current = h.slice(0, i + 1);
    historyRef.current.push({ nodes: JSON.parse(JSON.stringify(newNodes)), edges: JSON.parse(JSON.stringify(newEdges)) });
    // Cap history at 50 states
    if (historyRef.current.length > 50) historyRef.current.shift();
    historyIndexRef.current = historyRef.current.length - 1;
  }, []);

  // Track meaningful state changes for history
  useEffect(() => {
    // Save history when nodes or edges count changes (add/delete), not on drag moves
    const nodesChanged = nodes.length !== prevNodesLenRef.current;
    const edgesChanged = edges.length !== prevEdgesLenRef.current;
    if (nodesChanged || edgesChanged) {
      saveHistory(nodes, edges);
      prevNodesLenRef.current = nodes.length;
      prevEdgesLenRef.current = edges.length;
    }
  }, [nodes.length, edges.length, saveHistory]);

  const undo = useCallback(() => {
    const i = historyIndexRef.current;
    if (i <= 0) return;
    historyIndexRef.current = i - 1;
    const state = historyRef.current[i - 1];
    skipHistoryRef.current = true;
    setNodes(JSON.parse(JSON.stringify(state.nodes)));
    skipHistoryRef.current = true;
    setEdges(JSON.parse(JSON.stringify(state.edges)));
    prevNodesLenRef.current = state.nodes.length;
    prevEdgesLenRef.current = state.edges.length;
  }, []);

  const redo = useCallback(() => {
    const i = historyIndexRef.current;
    if (i >= historyRef.current.length - 1) return;
    historyIndexRef.current = i + 1;
    const state = historyRef.current[i + 1];
    skipHistoryRef.current = true;
    setNodes(JSON.parse(JSON.stringify(state.nodes)));
    skipHistoryRef.current = true;
    setEdges(JSON.parse(JSON.stringify(state.edges)));
    prevNodesLenRef.current = state.nodes.length;
    prevEdgesLenRef.current = state.edges.length;
  }, []);

  const NW = 220;
  const NH = 52;

  const toWorld = useCallback((cx, cy) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return { x: 0, y: 0 };
    return {
      x: (cx - r.left - cam.x) / cam.z,
      y: (cy - r.top - cam.y) / cam.z,
    };
  }, [cam]);

  const addNode = useCallback((title, division, x, y, description) => {
    const id = "n" + (_nid++);
    const color = DIV_COLORS[division] || "#8899aa";
    setNodes(p => [...p, { id, title, division, color, x, y, w: NW, h: NH, description: description || "" }]);
    return id;
  }, []);

  const updateNodeDescription = useCallback((id, description) => {
    setNodes(p => p.map(n => n.id === id ? { ...n, description } : n));
  }, []);

  const updateNodeTitle = useCallback((id, title) => {
    setNodes(p => p.map(n => n.id === id ? { ...n, title } : n));
  }, []);

  const [showNewNodeModal, setShowNewNodeModal] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeDiv, setNewNodeDiv] = useState("Executive Leadership");
  const [newNodeDesc, setNewNodeDesc] = useState("");

  const createCustomNode = useCallback(() => {
    if (!newNodeTitle.trim()) return;
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    const w = toWorld(r.left + r.width / 2, r.top + r.height / 2);
    addNode(newNodeTitle.trim(), newNodeDiv, w.x, w.y, newNodeDesc.trim());
    setTimeout(() => flyTo(w.x, w.y, 1.5, 500), 50);
    setNewNodeTitle("");
    setNewNodeDesc("");
    setShowNewNodeModal(false);
  }, [newNodeTitle, newNodeDiv, newNodeDesc, addNode, toWorld, flyTo]);

  const spawnSingle = useCallback((title, division) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    const w = toWorld(r.left + r.width / 2, r.top + r.height / 2);
    const c = nodesRef.current.length;
    const nx = w.x + (c % 5) * (NW + 30) - 500;
    const ny = w.y + Math.floor(c / 5) * (NH + 30) - 200;
    addNode(title, division, nx, ny);
    setTimeout(() => flyTo(nx, ny, 1.5, 500), 50);
  }, [addNode, toWorld, flyTo]);

  const spawnAll = useCallback((positions, division) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    const w = toWorld(r.left + r.width / 2, r.top + r.height / 2);
    positions.forEach((p, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      addNode(p, division, w.x + col * (NW + 30) - 500, w.y + row * (NH + 30) - 200);
    });
    // Fly to the center of the spawned group
    setTimeout(() => flyTo(w.x, w.y, 0.8, 500), 50);
  }, [addNode, toWorld, flyTo]);

  const deleteNode = useCallback((id) => {
    setNodes(p => p.filter(n => n.id !== id));
    setEdges(p => p.filter(e => e.from !== id && e.to !== id));
    if (selected === id) setSelected(null);
    if (connectFrom === id) setConnectFrom(null);
  }, [selected, connectFrom]);

  const deleteEdge = useCallback((from, to) => {
    setEdges(p => p.filter(e => !(e.from === from && e.to === to)));
  }, []);

  // Suppress default context menu on canvas so right-click works for selection
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const handler = (e) => { e.preventDefault(); };
    el.addEventListener("contextmenu", handler);
    return () => el.removeEventListener("contextmenu", handler);
  }, []);

  const onDown = useCallback((e) => {
    if (e.target.closest("[data-sb]")) return;
    if (e.target.closest("input")) return;
    if (e.target.closest("textarea")) return;
    const isRightClick = e.button === 2;
    const wp = toWorld(e.clientX, e.clientY);
    const hit = [...nodesRef.current].reverse().find(n =>
      wp.x >= n.x && wp.x <= n.x + n.w && wp.y >= n.y && wp.y <= n.y + n.h
    );
    if (hit) {
      if (mode === "connect" && !isRightClick) {
        if (!connectFrom) {
          setConnectFrom(hit.id);
        } else if (connectFrom !== hit.id) {
          setEdges(p => {
            if (p.some(e => e.from === connectFrom && e.to === hit.id)) return p;
            return [...p, { from: connectFrom, to: hit.id }];
          });
          setConnectFrom(null);
        }
        return;
      }
      if (mode === "delete" && !isRightClick) {
        deleteNode(hit.id);
        return;
      }
      // Right-click on node = toggle multi-select
      if (isRightClick) {
        setMultiSelected(prev => {
          const next = new Set(prev);
          if (next.has(hit.id)) { next.delete(hit.id); } else { next.add(hit.id); }
          return next;
        });
        setSelected(hit.id);
        e.preventDefault();
        return;
      }
      // Left-click on a multi-selected node = drag them ALL
      if (multiSelected.has(hit.id)) {
        setDrag({ id: hit.id, ox: wp.x - hit.x, oy: wp.y - hit.y, multi: true });
        e.preventDefault();
        return;
      }
      // Normal left-click - clear multi-select, select single
      setMultiSelected(new Set());
      setSelected(hit.id);
      setDrag({ id: hit.id, ox: wp.x - hit.x, oy: wp.y - hit.y, multi: false });
      e.preventDefault();
    } else {
      // Right-click drag on empty canvas = selection box
      if (isRightClick && mode === "select") {
        const r = canvasRef.current?.getBoundingClientRect();
        if (r) {
          setSelectionBox({ sx: e.clientX - r.left, sy: e.clientY - r.top, ex: e.clientX - r.left, ey: e.clientY - r.top });
        }
        e.preventDefault();
        return;
      }
      if (isRightClick) { e.preventDefault(); return; }
      setSelected(null);
      setMultiSelected(new Set());
      setConnectFrom(null);
      setPan({ sx: e.clientX, sy: e.clientY, cx: cam.x, cy: cam.y });
    }
  }, [cam, toWorld, mode, connectFrom, deleteNode, multiSelected]);

  const onMove = useCallback((e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (drag) {
      const wp = toWorld(e.clientX, e.clientY);
      const dx = wp.x - drag.ox;
      const dy = wp.y - drag.oy;
      if (drag.multi && multiSelected.size > 0) {
        // Move ALL multi-selected nodes by the same delta
        const mainNode = nodesRef.current.find(n => n.id === drag.id);
        if (mainNode) {
          const offsetX = dx - mainNode.x;
          const offsetY = dy - mainNode.y;
          setNodes(p => p.map(n => multiSelected.has(n.id) ? { ...n, x: n.x + offsetX, y: n.y + offsetY } : n));
          // Update drag offset so next frame is relative
          setDrag(prev => ({ ...prev, ox: wp.x - dx, oy: wp.y - dy }));
        }
      } else {
        setNodes(p => p.map(n => n.id === drag.id ? { ...n, x: dx, y: dy } : n));
      }
    } else if (selectionBox) {
      const r = canvasRef.current?.getBoundingClientRect();
      if (r) {
        setSelectionBox(prev => prev ? { ...prev, ex: e.clientX - r.left, ey: e.clientY - r.top } : null);
      }
    } else if (pan) {
      setCam(c => ({ ...c, x: pan.cx + (e.clientX - pan.sx), y: pan.cy + (e.clientY - pan.sy) }));
    }
  }, [drag, pan, toWorld, multiSelected, selectionBox]);

  const onUp = useCallback(() => {
    // Finish selection box - select all nodes inside it
    if (selectionBox) {
      const r = canvasRef.current?.getBoundingClientRect();
      if (r) {
        const sx = Math.min(selectionBox.sx, selectionBox.ex);
        const sy = Math.min(selectionBox.sy, selectionBox.ey);
        const ex = Math.max(selectionBox.sx, selectionBox.ex);
        const ey = Math.max(selectionBox.sy, selectionBox.ey);
        // Convert screen box to world coords
        const wsx = (sx - cam.x) / cam.z;
        const wsy = (sy - cam.y) / cam.z;
        const wex = (ex - cam.x) / cam.z;
        const wey = (ey - cam.y) / cam.z;
        const hits = new Set();
        nodesRef.current.forEach(n => {
          const cx = n.x + n.w / 2;
          const cy = n.y + n.h / 2;
          if (cx >= wsx && cx <= wex && cy >= wsy && cy <= wey) {
            hits.add(n.id);
          }
        });
        setMultiSelected(prev => {
          const next = new Set(prev);
          hits.forEach(id => next.add(id));
          return next;
        });
      }
      setSelectionBox(null);
    }
    setDrag(null);
    setPan(null);
  }, [selectionBox, cam]);

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const r = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const d = e.deltaY > 0 ? 0.92 : 1.08;
    setCam(c => {
      const nz = Math.max(0.05, Math.min(4, c.z * d));
      return { x: mx - (mx - c.x) * (nz / c.z), y: my - (my - c.y) * (nz / c.z), z: nz };
    });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if ((e.key === "Delete" || e.key === "Backspace") && selected && !isInput) {
        deleteNode(selected);
      }
      if (e.key === "Escape") { setConnectFrom(null); setMode("select"); }
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey && !isInput) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y
      if (((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) || ((e.ctrlKey || e.metaKey) && e.key === "y")) {
        if (!isInput) {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, deleteNode, undo, redo]);

  // Filter sidebar
  const lc = search.toLowerCase();
  const filteredDivs = {};
  Object.entries(POSITIONS).forEach(([div, pos]) => {
    const fp = pos.filter(p => p.toLowerCase().includes(lc));
    if (fp.length > 0 || div.toLowerCase().includes(lc)) {
      filteredDivs[div] = fp.length > 0 ? fp : pos;
    }
  });

  const totalPositions = Object.values(POSITIONS).reduce((a, b) => a + b.length, 0);

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", background: "#060a14", overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Sidebar */}
      {sideOpen && (
        <div data-sb="1" style={{ width: 310, background: "rgba(8,12,24,0.98)", borderRight: "1px solid #1a2540", display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 50 }}>
          <div style={{ padding: 14, borderBottom: "1px solid #1a2540" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: "#00ff88", letterSpacing: 2, fontWeight: 700, fontFamily: "monospace" }}>POSITION LIBRARY</div>
                <div style={{ fontSize: 10, color: "#5a6a7a", fontFamily: "monospace", marginTop: 2 }}>{totalPositions} total positions</div>
              </div>
              <button onClick={() => setSideOpen(false)} style={{ background: "none", border: "none", color: "#5a6a7a", cursor: "pointer", fontSize: 16, padding: 4 }}>✕</button>
            </div>
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Search all positions..."
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid #1a2540", borderRadius: 6, padding: "8px 12px", color: "#e8ecf1", fontSize: 13, outline: "none" }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {Object.entries(filteredDivs).map(([div, positions]) => (
              <div key={div} style={{ marginBottom: 2 }}>
                <div
                  onClick={() => setExpandedDiv(expandedDiv === div ? null : div)}
                  style={{ padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 6, background: expandedDiv === div ? "rgba(255,255,255,0.04)" : "transparent" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: DIV_COLORS[div] || "#8899aa", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#c0ccd8", fontWeight: 600 }}>{div}</span>
                  </div>
                  <span style={{ fontSize: 10, color: "#5a6a7a", fontFamily: "monospace" }}>{positions.length}</span>
                </div>
                {expandedDiv === div && (
                  <div style={{ padding: "4px 0 4px 20px" }}>
                    <button
                      onClick={() => spawnAll(positions, div)}
                      style={{ width: "100%", background: (DIV_COLORS[div] || "#8899aa") + "15", border: "1px solid " + (DIV_COLORS[div] || "#8899aa") + "30", borderRadius: 4, padding: "5px 8px", color: DIV_COLORS[div] || "#8899aa", cursor: "pointer", fontSize: 10, fontFamily: "monospace", fontWeight: 700, marginBottom: 6 }}
                    >+ ADD ALL {positions.length} TO CANVAS</button>
                    <div style={{ maxHeight: 300, overflowY: "auto" }}>
                      {positions.map((p, i) => {
                        const normalize = s => s.replace(/[\u2014\u2013]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
                        const existsOnCanvas = nodes.some(n => normalize(n.title) === normalize(p));
                        return (
                        <div key={i} onClick={() => {
                            const existing = nodes.find(n => normalize(n.title) === normalize(p));
                            if (existing) { flyTo(existing.x, existing.y, 1.5, 500); setSelected(existing.id); }
                            else spawnSingle(p, div);
                          }}
                          style={{ padding: "4px 8px", cursor: "pointer", borderRadius: 3, fontSize: 11, color: existsOnCanvas ? "#4a9eff" : "#7a8a9a", borderLeft: "2px solid " + (existsOnCanvas ? "#4a9eff" : (DIV_COLORS[div] || "#8899aa") + "25"), marginBottom: 1 }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = existsOnCanvas ? "#6ab4ff" : "#c8d4e0"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = existsOnCanvas ? "#4a9eff" : "#7a8a9a"; }}
                          title={existsOnCanvas ? "Click to fly to this node" : "Click to add to canvas"}
                        >{existsOnCanvas ? "📍 " : ""}{p}</div>
                      );})}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Toolbar */}
        <div style={{ position: "absolute", top: 10, left: 10, zIndex: 40, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {!sideOpen && <Btn label="☰ Library" onClick={() => setSideOpen(true)} />}
          <Btn label="↖ Select" active={mode === "select"} color="#00d4ff" onClick={() => { setMode("select"); setConnectFrom(null); }} />
          <Btn label="⤳ Connect" active={mode === "connect"} color="#00ff88" onClick={() => setMode("connect")} />
          <Btn label="✕ Delete" active={mode === "delete"} color="#ff2d55" onClick={() => setMode("delete")} />
          <Btn label="＋ New Node" color="#ffa500" onClick={() => setShowNewNodeModal(true)} />
          {multiSelected.size > 0 && <Btn label={"☐ Deselect " + multiSelected.size} color="#00d4ff" onClick={() => setMultiSelected(new Set())} />}
          <Btn label="↩ Undo" color="#bb88ff" onClick={undo} />
          <Btn label="↪ Redo" color="#bb88ff" onClick={redo} />
          <Btn label="📤 Share" color="#00d4ff" onClick={shareLink} />
          <Btn label="💾 Export" onClick={exportJSON} />
          <Btn label="📂 Import" onClick={importJSON} />
          <Btn label="🔄 Fresh Import" color="#ff6b35" onClick={freshImport} />
          <Btn label="📝 Merge Descriptions" color="#22cc88" onClick={mergeDescriptions} />
          <Btn label="⌂ Reset" onClick={() => setCam({ x: 0, y: 0, z: 1 })} />
          <Btn label="🗑 Clear All" onClick={() => { if (confirm("Remove all nodes and connections?")) { setNodes([]); setEdges([]); setSelected(null); } }} />
        </div>

        {/* Status */}
        <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 40, background: "rgba(8,12,24,0.92)", border: "1px solid #1a2540", borderRadius: 6, padding: "5px 12px", display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#5a6a7a", fontFamily: "monospace" }}>{nodes.length} nodes · {edges.length} edges · {Math.round(cam.z * 100)}%</span>
          {shareMsg && <span style={{ fontSize: 11, color: "#00d4ff", fontFamily: "monospace", fontWeight: 700 }}>{shareMsg}</span>}
          {mode === "connect" && <span style={{ fontSize: 11, color: "#00ff88", fontFamily: "monospace", fontWeight: 700 }}>{connectFrom ? "● Click target node" : "Click source node first"}</span>}
          {mode === "delete" && <span style={{ fontSize: 11, color: "#ff2d55", fontFamily: "monospace", fontWeight: 700 }}>Click node to delete</span>}
          {multiSelected.size > 0 && <span style={{ fontSize: 11, color: "#00d4ff", fontFamily: "monospace", fontWeight: 700 }}>{multiSelected.size} selected - drag to move all</span>}
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
          style={{
            width: "100%", height: "100%",
            cursor: drag ? "grabbing" : pan ? "grabbing" : mode === "connect" ? "crosshair" : mode === "delete" ? "not-allowed" : "default",
            background: "#060a14",
            backgroundImage: "radial-gradient(circle, #0f1a2e 1px, transparent 1px)",
            backgroundSize: `${20 * cam.z}px ${20 * cam.z}px`,
            backgroundPosition: `${cam.x % (20 * cam.z)}px ${cam.y % (20 * cam.z)}px`,
            overflow: "hidden", touchAction: "none", userSelect: "none",
          }}
        >
          {/* Edges SVG */}
          <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
            <defs>
              <marker id="ah" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="#00ff88" opacity="0.8" /></marker>
              <marker id="ahd" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="#2a4a5a" /></marker>
            </defs>
            {edges.map((e, i) => {
              const f = nodes.find(n => n.id === e.from);
              const t = nodes.find(n => n.id === e.to);
              if (!f || !t) return null;
              const r = canvasRef.current?.getBoundingClientRect();
              if (!r) return null;
              const fx = f.x * cam.z + cam.x + (f.w * cam.z) / 2;
              const fy = f.y * cam.z + cam.y + f.h * cam.z;
              const tx = t.x * cam.z + cam.x + (t.w * cam.z) / 2;
              const ty = t.y * cam.z + cam.y;
              const mid = fy + (ty - fy) * 0.5;
              const active = selected === e.from || selected === e.to;
              const pathD = `M${fx},${fy} C${fx},${mid} ${tx},${mid} ${tx},${ty}`;
              return <g key={i}>
                {/* Fat invisible hit area for clicking */}
                <path d={pathD} fill="none" stroke="transparent" strokeWidth={16} style={{ pointerEvents: "stroke", cursor: mode === "delete" ? "not-allowed" : "pointer" }}
                  onClick={(ev) => { ev.stopPropagation(); deleteEdge(e.from, e.to); }} />
                {/* Visible edge */}
                <path d={pathD} fill="none" stroke={active ? "#00ff88" : "#1a3a4a"} strokeWidth={active ? 2.5 : 1.5} markerEnd={active ? "url(#ah)" : "url(#ahd)"} opacity={active ? 1 : 0.45} style={{ pointerEvents: "none" }} />
              </g>;
            })}
            {connectFrom && (() => {
              const f = nodes.find(n => n.id === connectFrom);
              if (!f) return null;
              const r = canvasRef.current?.getBoundingClientRect();
              if (!r) return null;
              const fx = f.x * cam.z + cam.x + (f.w * cam.z) / 2;
              const fy = f.y * cam.z + cam.y + f.h * cam.z;
              return <line x1={fx} y1={fy} x2={mousePos.x - r.left} y2={mousePos.y - r.top} stroke="#00ff88" strokeWidth={2} strokeDasharray="6,4" opacity={0.7} />;
            })()}
          </svg>

          {/* Nodes */}
          <div style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, zIndex: 2 }}>
            {nodes.map(n => {
              const sx = n.x * cam.z + cam.x;
              const sy = n.y * cam.z + cam.y;
              const isSel = selected === n.id;
              const isMulti = multiSelected.has(n.id);
              const isConn = connectFrom === n.id;
              const w = n.w * cam.z;
              const h = n.h * cam.z;
              return (
                <div key={n.id} style={{
                  position: "absolute", left: sx, top: sy, width: w, height: h,
                  background: isSel ? "rgba(15,25,45,0.97)" : "rgba(10,16,30,0.93)",
                  border: `${isSel || isConn || isMulti ? 2 : 1}px solid ${isConn ? "#00ff88" : isMulti ? "#00d4ff" : isSel ? n.color : n.color + "35"}`,
                  borderRadius: Math.max(3, 6 * cam.z),
                  display: "flex", alignItems: "center", padding: `0 ${Math.max(4, 10 * cam.z)}px`, gap: Math.max(3, 7 * cam.z),
                  boxShadow: isMulti ? `0 0 20px #00d4ff30` : isSel ? `0 0 24px ${n.color}30` : "0 2px 6px rgba(0,0,0,0.3)",
                  pointerEvents: "none",
                  transition: drag?.id === n.id ? "none" : "box-shadow 0.15s",
                }}>
                  <div style={{ width: Math.max(3, 6 * cam.z), height: Math.max(3, 6 * cam.z), borderRadius: "50%", background: n.color, flexShrink: 0, boxShadow: `0 0 5px ${n.color}50` }} />
                  <div style={{ overflow: "hidden", minWidth: 0 }}>
                    <div style={{ fontSize: Math.max(6, 11 * cam.z), color: "#e0e8f0", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.2 }}>{n.title}</div>
                    {cam.z > 0.35 && <div style={{ fontSize: Math.max(5, 8 * cam.z), color: n.color + "90", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "monospace" }}>{n.division}</div>}
                    {cam.z > 0.8 && n.description && <div style={{ fontSize: Math.max(5, 7 * cam.z), color: "#8899aa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontStyle: "italic", lineHeight: 1.1, marginTop: 1 }}>{n.description}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selection Box Visual */}
      {selectionBox && (() => {
        const sx = Math.min(selectionBox.sx, selectionBox.ex);
        const sy = Math.min(selectionBox.sy, selectionBox.ey);
        const w = Math.abs(selectionBox.ex - selectionBox.sx);
        const h = Math.abs(selectionBox.ey - selectionBox.sy);
        const r = canvasRef.current?.getBoundingClientRect();
        if (!r) return null;
        return <div style={{
          position: "absolute", left: sx + (sideOpen ? 310 : 0), top: sy,
          width: w, height: h,
          border: "2px dashed #00d4ff", background: "rgba(0,212,255,0.08)",
          pointerEvents: "none", zIndex: 55, borderRadius: 4,
        }} />;
      })()}

      {/* Description Panel — shows when a node is selected */}
      {selected && (() => {
        const sn = nodes.find(n => n.id === selected);
        if (!sn) return null;
        return (
          <div data-sb="1" style={{
            position: "absolute", bottom: 14, right: 14, zIndex: 60,
            width: 340, background: "rgba(8,12,24,0.97)", border: "1px solid " + sn.color + "40",
            borderRadius: 10, padding: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: sn.color }} />
              <div style={{ flex: 1 }}>
                <input
                  value={sn.title}
                  onChange={e => updateNodeTitle(sn.id, e.target.value)}
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #1a2540", color: "#e0e8f0", fontSize: 14, fontWeight: 700, outline: "none", padding: "2px 0" }}
                />
              </div>
            </div>
            <div style={{ fontSize: 10, color: sn.color + "90", fontFamily: "monospace", marginBottom: 10 }}>{sn.division}</div>
            <div style={{ fontSize: 10, color: "#5a6a7a", fontFamily: "monospace", marginBottom: 4, letterSpacing: 1 }}>DESCRIPTION</div>
            <textarea
              value={sn.description || ""}
              onChange={e => updateNodeDescription(sn.id, e.target.value)}
              placeholder="Add a job description, responsibilities, notes..."
              rows={5}
              style={{
                width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid #1a2540",
                borderRadius: 6, padding: "8px 10px", color: "#c0ccd8", fontSize: 12, outline: "none",
                resize: "vertical", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.5,
              }}
            />
          </div>
        );
      })()}

      {/* New Node Modal */}
      {showNewNodeModal && (
        <div data-sb="1" style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={e => { if (e.target === e.currentTarget) setShowNewNodeModal(false); }}>
          <div style={{
            background: "rgba(8,12,24,0.98)", border: "1px solid #ffa50040", borderRadius: 12,
            padding: 24, width: 380, boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
          }}>
            <div style={{ fontSize: 14, color: "#ffa500", fontWeight: 700, fontFamily: "monospace", letterSpacing: 1, marginBottom: 16 }}>+ CREATE NEW NODE</div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#5a6a7a", fontFamily: "monospace", marginBottom: 4, letterSpacing: 1 }}>TITLE</div>
              <input
                value={newNodeTitle} onChange={e => setNewNodeTitle(e.target.value)}
                placeholder="e.g. Senior Growth Strategist"
                autoFocus
                onKeyDown={e => { if (e.key === "Enter") createCustomNode(); }}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid #1a2540", borderRadius: 6, padding: "8px 12px", color: "#e8ecf1", fontSize: 13, outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#5a6a7a", fontFamily: "monospace", marginBottom: 4, letterSpacing: 1 }}>DIVISION</div>
              <select
                value={newNodeDiv} onChange={e => setNewNodeDiv(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid #1a2540", borderRadius: 6, padding: "8px 12px", color: "#e8ecf1", fontSize: 13, outline: "none", appearance: "auto" }}
              >
                {Object.keys(POSITIONS).map(d => (
                  <option key={d} value={d} style={{ background: "#0a1020" }}>{d}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: "#5a6a7a", fontFamily: "monospace", marginBottom: 4, letterSpacing: 1 }}>DESCRIPTION (optional)</div>
              <textarea
                value={newNodeDesc} onChange={e => setNewNodeDesc(e.target.value)}
                placeholder="Job description, responsibilities, notes..."
                rows={4}
                style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid #1a2540", borderRadius: 6, padding: "8px 10px", color: "#c0ccd8", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "system-ui, -apple-system, sans-serif", lineHeight: 1.5 }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowNewNodeModal(false)} style={{ background: "none", border: "1px solid #1a2540", borderRadius: 6, padding: "8px 16px", color: "#5a6a7a", cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>Cancel</button>
              <button onClick={createCustomNode} style={{ background: "#ffa50020", border: "1px solid #ffa50060", borderRadius: 6, padding: "8px 16px", color: "#ffa500", cursor: "pointer", fontSize: 12, fontFamily: "monospace", fontWeight: 700 }}>Create Node</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      `}</style>
    </div>
  );
}

function Btn({ label, onClick, active, color }) {
  const c = color || "#8899aa";
  return (
    <button onClick={onClick} style={{
      background: active ? c + "20" : "rgba(8,12,24,0.92)",
      border: `1px solid ${active ? c + "60" : "#1a2540"}`,
      borderRadius: 6, padding: "7px 13px", color: active ? c : "#8899aa",
      cursor: "pointer", fontSize: 12, fontFamily: "monospace", fontWeight: active ? 700 : 500,
      whiteSpace: "nowrap",
    }}>{label}</button>
  );
}
