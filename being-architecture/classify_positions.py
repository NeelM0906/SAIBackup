#!/usr/bin/env python3
"""
Classify all 2,524 positions into 17 ACT-I beings based on core skills.
"""
import json
import re
from collections import defaultdict

with open('merged-with-descriptions.json') as f:
    data = json.load(f)

nodes = data['nodes']

# Skip executive/lever header/director nodes
skip_ids = set()
for n in nodes:
    title = n.get('title','')
    div = n.get('division','')
    if div == 'Executive Leadership':
        skip_ids.add(n['id'])
    elif div in ('LEVER 0.5','LEVER 1','LEVER 2','LEVER 3','LEVER 4','LEVER 5','LEVER 6','LEVER 7','ANALYTICS','OTHER'):
        skip_ids.add(n['id'])
    elif title.startswith('Dir:'):
        skip_ids.add(n['id'])

positions = [n for n in nodes if n['id'] not in skip_ids]
print(f"Total positions to classify: {len(positions)}")

# Define the 17 beings with keyword-based classification rules
# Order matters — more specific rules should come first

def classify(title, division, desc):
    t = title.lower()
    d = division.lower()
    desc_l = (desc or '').lower()
    
    # =====================================================
    # BEING 17: THE STRATEGIST — campaign orchestration, planning, budgets
    # Must be checked carefully — many "strategist" titles belong to specific domains
    # We'll classify generic campaign/marketing strategists here, but domain-specific ones go to their domain
    # =====================================================
    
    # =====================================================
    # BEING 16: THE OPERATOR — CRM, pipeline, workflow automation
    # =====================================================
    if any(kw in t for kw in ['crm ', 'crm manager', 'pipeline manager', 'pipeline specialist',
                               'marketing automation manager', 'marketing automation specialist',
                               'workflow automation', 'marketing data integration',
                               'marketing project manager', 'marketing project management',
                               'sales operations manager', 'sales operations specialist',
                               'sales technology manager', 'sales technology specialist',
                               'revenue operations manager', 'revenue operations specialist',
                               'revenue technology manager', 'revenue technology specialist',
                               'sales crm', 'sales pipeline manager', 'sales pipeline specialist']):
        return 16
    
    # =====================================================
    # ACT-I & Coliseum — special category (stays as The Operator or needs its own)
    # =====================================================
    if 'coliseum' in t or 'colosseum' in t or 'act-i' in t or 'acti' in t or 'being trainer' in t or 'being quality' in t or 'being optimization' in t:
        return 16  # Operator manages the Coliseum infrastructure
    
    # =====================================================
    # BEING 4: THE SOUND ENGINEER — all audio
    # Must come before Filmmaker to catch audio-specific roles
    # =====================================================
    if d in ('2 — speaking / audio & podcasts',):
        # Most audio/podcast roles go to Sound Engineer
        # But some are writing (script writers), analytics, or management
        if any(kw in t for kw in ['writer', 'copywriter']):
            return 1  # Writer
        if any(kw in t for kw in ['designer', 'graphic']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['analytics', 'analyst', 'roi', 'performance analyst']):
            return 5  # Analyst
        if any(kw in t for kw in ['social media', 'community manager']):
            return 7  # Voice
        if any(kw in t for kw in ['marketing specialist', 'marketing manager', 'growth specialist',
                                   'monetization', 'sponsorship', 'advertising manager', 'partnership manager']):
            # These are about growing/monetizing the podcast — connector or strategist
            if 'partnership' in t:
                return 11  # Connector
            if 'advertising' in t or 'sponsorship' in t or 'monetization' in t:
                return 6  # Media Buyer
            return 17  # Strategist for marketing/growth roles
        if any(kw in t for kw in ['compliance', 'quality assurance']):
            return 16  # Operator
        if any(kw in t for kw in ['seo', 'distribution specialist', 'distribution manager', 'platform manager', 'network manager']):
            return 8  # Technologist
        return 4  # Default: Sound Engineer
    
    if any(kw in t for kw in ['voiceover talent', 'voice over artist', 'narrator',
                               'sound engineer', 'audio engineer', 'audio editor',
                               'sound designer', 'audio designer', 'audio technician',
                               'recording engineer', 'mixing engineer', 'mastering engineer',
                               'music producer', 'jingle creator', 'intro creator', 'outro creator',
                               'bumper creator', 'transition creator', 'background music',
                               'audio book producer', 'audio drama producer',
                               'radio commercial producer', 'podcast commercial producer',
                               'audio ad producer', 'boom operator', 'sound mixer',
                               'music composer', 'music supervisor', 'sound technician',
                               'audio mixer', 'acoustics specialist', 'audio quality',
                               'audio safety', 'sound engineering', 'audio experience manager',
                               'voice marketing manager']):
        return 4  # Sound Engineer
    
    # =====================================================
    # BEING 3: THE FILMMAKER — all video
    # =====================================================
    if d in ('2 — speaking / video production',):
        if any(kw in t for kw in ['writer', 'copywriter', 'script writer']):
            return 1  # Writer
        if any(kw in t for kw in ['graphic designer', 'thumbnail designer', 'motion graphics designer']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['sound designer', 'audio engineer', 'boom operator', 'sound mixer',
                                   'music composer', 'music supervisor', 'voice over', 'narrator']):
            return 4  # Sound Engineer
        if any(kw in t for kw in ['analytics', 'analyst', 'researcher', 'data']):
            return 5  # Analyst
        if any(kw in t for kw in ['marketing', 'promoter', 'marketer']) and 'video market' not in t:
            return 17  # Strategist
        if any(kw in t for kw in ['compliance', 'legal', 'insurance', 'permit', 'safety coordinator']):
            return 16  # Operator
        if any(kw in t for kw in ['subtitle', 'caption', 'translator', 'localizer', 'transcriber']):
            return 1  # Writer — language/text work
        return 3  # Default: Filmmaker
    
    if any(kw in t for kw in ['video editor', 'video producer', 'video director',
                               'cinematographer', 'director of photography', 'camera operator',
                               'camera assistant', 'focus puller', 'steadicam operator',
                               'drone operator', 'crane operator', 'jib operator', 'dolly operator',
                               'lighting director', 'gaffer', 'key grip', 'best boy',
                               'grip', 'set decorator', 'props master', 'costume designer',
                               'makeup artist', 'hair stylist', 'assistant director',
                               'production assistant', 'location manager', 'location scout',
                               'casting director', 'talent coordinator', 'wardrobe supervisor',
                               'set designer', 'production designer', 'storyboard artist',
                               'concept artist', 'vfx', 'compositor', '3d artist',
                               'animator', 'character animator', 'motion designer',
                               'colorist', 'teleprompter', 'video technician',
                               'equipment manager', 'video camera', 'video production',
                               'film designer', 'video content manager',
                               'video content creator', 'video content strategist',
                               'demo reel editor', 'speaking demo reel',
                               'webinar replay editor', 'live video', 'streaming video',
                               'video seo', 'youtube video', 'video ad designer',
                               'replay editor', 'replay specialist']):
        return 3  # Filmmaker
    
    # =====================================================
    # BEING 2: THE VISUAL ARCHITECT — all design
    # =====================================================
    if d in ('2 — speaking / design & creative',):
        if any(kw in t for kw in ['ux writer', 'copywriting', 'copy writer']):
            return 1  # Writer
        if any(kw in t for kw in ['sound designer']):
            return 4  # Sound Engineer
        if any(kw in t for kw in ['motion graphics', 'animation designer', 'video designer',
                                   'film designer', 'tv designer', '3d animator',
                                   'character animator']):
            return 3  # Filmmaker — motion/animation work
        if any(kw in t for kw in ['data visualization', 'dashboard designer', 'marketing dashboard']):
            return 5  # Analyst — data viz
        return 2  # Default: Visual Architect
    
    if any(kw in t for kw in ['graphic designer', 'web designer', 'ui designer', 'ux designer',
                               'brand designer', 'logo designer', 'identity designer',
                               'print designer', 'poster designer', 'billboard designer',
                               'banner designer', 'flyer designer', 'brochure designer',
                               'infographic designer', 'presentation designer', 'template designer',
                               'icon designer', 'illustration', 'illustrator',
                               'thumbnail designer', 'ad designer', 'ad creative designer',
                               'display ads designer', 'display ads creative',
                               'creative director', 'art director', 'visual designer',
                               'book cover designer', 'photography director', 'photographer',
                               'slide designer', 'book designer', 'magazine designer',
                               'email template designer', 'newsletter designer',
                               'social media designer', 'social media graphic',
                               'facebook designer', 'instagram designer',
                               'linkedin designer', 'twitter designer', 'youtube designer',
                               'tiktok designer', 'pinterest designer', 'snapchat designer',
                               'ad photography', 'ad set design', 'ad color grading',
                               'ad thumbnail', 'landing page designer',
                               'webinar slide designer', 'speaking slide designer',
                               'media kit designer', 'speaking media kit',
                               'email design specialist', 'email designer',
                               'brand visual identity', 'brand style guide',
                               'brand photography', 'brand videography art',
                               'brand graphic designer', 'pr media kit',
                               'quiz design manager',
                               'registration page designer',
                               'landing page designer',
                               'speaking landing page designer',
                               'webinar registration page designer',
                               'summit attendee experience designer',
                               'pin designer']):
        return 2  # Visual Architect
    
    # =====================================================
    # BEING 1: THE WRITER — all persuasive copy
    # =====================================================
    if d in ('2 — speaking / content & blogs',):
        if any(kw in t for kw in ['video content manager', 'video content strategist',
                                   'video editor', 'video content']):
            return 3  # Filmmaker
        if any(kw in t for kw in ['audio content manager', 'audio editor']):
            return 4  # Sound Engineer
        if any(kw in t for kw in ['visual content manager']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['analytics', 'analyst', 'performance analyst',
                                   'competitive analyst']):
            return 5  # Analyst
        if any(kw in t for kw in ['content distribution', 'content syndication',
                                   'content outreach', 'content paid promotion']):
            return 17  # Strategist — distribution strategy
        if any(kw in t for kw in ['content seo', 'seo content optimizer']):
            return 8  # Technologist
        if any(kw in t for kw in ['content operations', 'content publishing manager',
                                   'content administrator', 'content coordinator']):
            return 16  # Operator
        return 1  # Default: Writer
    
    if d in ('2 — speaking / book & publishing',):
        if any(kw in t for kw in ['book cover designer']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['amazon publishing', 'book funnel', 'book launch campaign']):
            return 17  # Strategist
        return 1  # Writer
    
    if d in ('2 — speaking / email marketing',):
        if any(kw in t for kw in ['email design', 'email template']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['email automation', 'email deliverability', 'email segmentation']):
            return 9  # Messenger
        if any(kw in t for kw in ['email a/b test', 'email analytics']):
            return 5  # Analyst
        if any(kw in t for kw in ['writer', 'copywriter', 'email copywriter']):
            return 1  # Writer
        return 9  # Default: Messenger for email marketing
    
    if any(kw in t for kw in ['writer', 'copywriter', 'ghostwriter', 'editor',
                               'copy editor', 'script writer', 'screenplay writer',
                               'speech writer', 'press release writer', 'newsletter writer',
                               'content creator', 'content writer', 'content editor',
                               'blog writer', 'article writer', 'seo content writer',
                               'web content writer', 'headlines writer', 'subject line writer',
                               'call-to-action writer', 'product description writer',
                               'case study writer', 'white paper writer', 'ebook writer',
                               'guide writer', 'tutorial writer', 'how-to writer',
                               'faq writer', 'review writer', 'testimonial writer',
                               'bio writer', 'profile writer', 'interview writer',
                               'contest writer', 'giveaway writer', 'promotion writer',
                               'campaign writer', 'ad copy writer', 'sales copy writer',
                               'landing page writer', 'landing page copywriter',
                               'website copy writer', 'app copy writer', 'ui copy writer',
                               'ux writer', 'chatbot writer', 'voice assistant writer',
                               'caption writer', 'alt text writer', 'meta description writer',
                               'title tag writer', 'header writer', 'footer writer',
                               'sidebar writer', 'menu writer', 'navigation writer',
                               'breadcrumb writer', 'error message writer', 'success message writer',
                               'notification writer', 'alert writer', 'warning writer',
                               'disclaimer writer', 'terms writer', 'privacy policy writer',
                               'legal writer', 'compliance writer', 'regulatory writer',
                               'medical writer', 'scientific writer', 'research writer',
                               'quiz content writer', 'copywriting director',
                               'speaking proposal writer', 'speaking introduction writer',
                               'sales playbook writer', 'sales proposal writer',
                               'follow-up email writer', 'follow-up sequence writer',
                               'reminder sequence writer', 'webinar script writer',
                               'brand voice and tone guide', 'brand story writer',
                               'brand tagline creator', 'brand messaging strategist',
                               'speaking content creator', 'sales content creator',
                               'nurture sequence architect',
                               'hoi content curator', 'content curator',
                               'content thought leadership',
                               'thought leadership writer', 'industry influence writer',
                               'expert positioning writer', 'knowledge sharing writer',
                               'intellectual capital writer', 'opinion leadership writer',
                               'speaking content marketer', 'speaking email marketer']):
        return 1  # Writer
    
    # =====================================================
    # BEING 6: THE MEDIA BUYER — all paid advertising
    # =====================================================
    if d in ('2 — speaking / digital advertising',):
        # Many roles in Digital Advertising are actually platform-specific
        if any(kw in t for kw in ['writer', 'copywriter']):
            return 1  # Writer
        if any(kw in t for kw in ['designer', 'visual designer', 'creative designer',
                                   'thumbnail designer', 'landing page designer']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['video editor', 'video producer', 'video seo']):
            return 3  # Filmmaker
        if any(kw in t for kw in ['analytics', 'analyst', 'attribution', 'dashboard builder',
                                   'roi analyst', 'performance analyst', 'a/b test']):
            return 5  # Analyst
        if any(kw in t for kw in ['seo strategist', 'seo technical', 'seo link building',
                                   'seo local', 'seo analytics', 'seo specialist',
                                   'website strategist', 'website ux', 'website ui',
                                   'website seo', 'website analytics', 'website a/b test',
                                   'website accessibility', 'website security',
                                   'cro strategist', 'cro analyst', 'cro designer', 'cro a/b',
                                   'conversion rate optimization',
                                   'pixel', 'tracking implementation',
                                   'ad platform api', 'landing page a/b test',
                                   'landing page strategist']):
            return 8  # Technologist
        if any(kw in t for kw in ['email ', 'email marketing', 'email list', 'email automation',
                                   'email deliverability', 'email a/b', 'email analytics',
                                   'sms ', 'sms marketing', 'sms automation', 'sms compliance',
                                   'sms analytics', 'outbound email outreach']):
            return 9  # Messenger
        if any(kw in t for kw in ['organic manager', 'organic specialist',
                                   'community manager', 'community specialist',
                                   'community moderator', 'group manager',
                                   'content creator', 'content manager',
                                   'stories creator', 'stories manager',
                                   'reels creator', 'reels manager',
                                   'igtv creator', 'igtv manager',
                                   'shorts creator', 'live specialist',
                                   'spaces specialist', 'thread creator',
                                   'hashtag specialist', 'trending specialist',
                                   'customer service specialist',
                                   'influencer specialist', 'influencer manager',
                                   'personal branding', 'personal brand',
                                   'page administrator', 'page specialist',
                                   'company page', 'channel manager',
                                   'shopping specialist', 'social commerce',
                                   'ugc', 'discord server manager', 'discord bot developer',
                                   'discord community', 'discord event',
                                   'reddit community', 'reddit content',
                                   'reddit ama', 'clubhouse room host',
                                   'clubhouse event', 'twitch streamer', 'twitch moderator',
                                   'whatsapp business', 'whatsapp marketing',
                                   'telegram marketing', 'wechat marketing',
                                   'snapchat content', 'snapchat story',
                                   'snapchat ar filter', 'snapchat lens',
                                   'snapchat discover',
                                   'idea pin creator', 'story pin creator',
                                   'pin designer', 'board manager']):
            return 7  # Voice
        if any(kw in t for kw in ['avatar', 'digital twin', 'clone voice', 'likeness',
                                   'wardrobe', 'appearance director']):
            return 2  # Visual Architect — Sean's image/appearance
        if any(kw in t for kw in ['lead generation specialist', 'sales navigator',
                                   'linkedin lead generation']):
            return 12  # Agreement Maker
        if any(kw in t for kw in ['competitor', 'competitive', 'intelligence analyst']):
            return 15  # Researcher
        # Remaining ad/media buying roles
        return 6  # Media Buyer
    
    # Catch remaining media buyer roles from other divisions
    if any(kw in t for kw in ['ads manager', 'ads specialist', 'ad campaign',
                               'paid media', 'media buying', 'media buyer',
                               'programmatic buying', 'programmatic advertising',
                               'retargeting campaign', 'display ads strategist',
                               'ad spend', 'bid manager', 'budget optimizer',
                               'audience targeting', 'ad creative refresh',
                               'ad compliance', 'facebook ads', 'google ads',
                               'youtube ads', 'tiktok ads', 'linkedin ads',
                               'twitter ads', 'bing ads', 'pinterest ads',
                               'snapchat ads', 'reddit advertising',
                               'social advertising', 'digital advertising',
                               'spotify ad producer', 'pandora ad producer',
                               'radio ad producer', 'streaming ad producer']):
        return 6  # Media Buyer
    
    # =====================================================
    # BEING 7: THE VOICE — organic social media & community
    # =====================================================
    if d in ('2 — speaking / social media',):
        if any(kw in t for kw in ['analytics', 'analyst', 'reporting']):
            return 5  # Analyst
        if any(kw in t for kw in ['advertising', 'ads', 'paid']):
            return 6  # Media Buyer
        if any(kw in t for kw in ['designer', 'graphic']):
            return 2  # Visual Architect
        return 7  # Voice
    
    if d in ('0.5 — shared experiences / community building',):
        if any(kw in t for kw in ['analytics', 'analyst']):
            return 5  # Analyst
        return 7  # Voice — community engagement
    
    if any(kw in t for kw in ['social media manager', 'social media specialist',
                               'social media strategist', 'social media coordinator',
                               'community manager', 'community specialist',
                               'community moderator', 'community engagement',
                               'community growth', 'community welcome',
                               'community coordinator', 'community outreach',
                               'social commerce manager', 'social shopping',
                               'social listening', 'social monitoring',
                               'social media content calendar',
                               'social media influencer outreach',
                               'social media ugc',
                               'organic manager', 'organic specialist',
                               'linkedin organic', 'instagram organic',
                               'twitter/x organic', 'tiktok organic', 'youtube organic',
                               'facebook organic']):
        return 7  # Voice
    
    # =====================================================
    # BEING 10: THE STAGE DIRECTOR — live events, webinars, conferences
    # =====================================================
    if d in ('2 — speaking / live stages & summits',):
        if any(kw in t for kw in ['writer', 'copywriter', 'bio writer', 'proposal writer',
                                   'introduction writer', 'follow-up email']):
            return 1  # Writer
        if any(kw in t for kw in ['designer', 'slide designer', 'landing page designer',
                                   'media kit designer']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['video producer', 'demo reel editor']):
            return 3  # Filmmaker
        if any(kw in t for kw in ['audio engineer', 'sound engineer']):
            return 4  # Sound Engineer
        if any(kw in t for kw in ['analytics', 'analyst', 'roi analyst', 'performance analyst',
                                   'competitive analyst', 'trend analyst', 'conversion analyst',
                                   'attribution analyst']):
            return 5  # Analyst
        if any(kw in t for kw in ['social media', 'content marketer', 'email marketer']):
            return 7  # Voice (or Writer)
        if any(kw in t for kw in ['crm specialist', 'database manager', 'lead capture']):
            return 16  # Operator
        if any(kw in t for kw in ['speaking partnerships', 'stage partnerships',
                                   'partnership specialist']):
            return 11  # Connector
        if any(kw in t for kw in ['fee negotiator', 'testimonial collector',
                                   'speaking opportunity outreach',
                                   'audience opt-in collector',
                                   'sales meeting scheduler', 'speaking sales meeting']):
            return 12  # Agreement Maker
        if any(kw in t for kw in ['audience research']):
            return 15  # Researcher
        if any(kw in t for kw in ['innovation', 'optimization', 'quality assurance', 'compliance']):
            return 16  # Operator
        return 10  # Stage Director
    
    if d in ('2 — speaking / webinars & virtual stages',):
        if any(kw in t for kw in ['writer', 'copywriter', 'script writer',
                                   'follow-up sequence writer', 'reminder sequence writer']):
            return 1  # Writer
        if any(kw in t for kw in ['designer', 'slide designer', 'registration page designer']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['replay editor']):
            return 3  # Filmmaker
        if any(kw in t for kw in ['recording engineer']):
            return 4  # Sound Engineer
        if any(kw in t for kw in ['analytics', 'analyst', 'performance analyst',
                                   'engagement analytics', 'budget analyst']):
            return 5  # Analyst
        if any(kw in t for kw in ['email marketing', 'social media specialist']):
            if 'email' in t:
                return 9  # Messenger
            return 7  # Voice
        if any(kw in t for kw in ['automation specialist', 'platform administrator',
                                   'technical support', 'technical manager', 'technical producer',
                                   'compliance', 'risk manager', 'accessibility',
                                   'segmentation specialist']):
            return 16  # Operator
        if any(kw in t for kw in ['partnership', 'sponsorship']):
            return 11  # Connector
        if any(kw in t for kw in ['funnel architect', 'marketing manager', 'promotion specialist',
                                   'landing page specialist', 'registration specialist',
                                   'reminder specialist', 'content repurposer']):
            return 17  # Strategist
        return 10  # Stage Director
    
    # =====================================================
    # BEING 11: THE CONNECTOR — partnerships, ecosystem mergers
    # =====================================================
    if d.startswith('1 —') or 'ecosystem mergers' in d:
        if any(kw in t for kw in ['writer', 'copywriter']):
            return 1
        if any(kw in t for kw in ['designer']):
            return 2
        if any(kw in t for kw in ['analytics', 'analyst']):
            return 5
        if any(kw in t for kw in ['research', 'intelligence', 'evaluator', 'assessor']):
            return 15  # Researcher
        return 11  # Connector
    
    # =====================================================
    # BEING 12: THE AGREEMENT MAKER — conversion, enrollment, sales conversations
    # =====================================================
    if d in ('3 — agreement conversations',):
        if any(kw in t for kw in ['analytics', 'analyst', 'data analyst', 'metrics analyst',
                                   'roi analyst', 'conversion analyst', 'attribution analyst',
                                   'performance analyst', 'productivity analyst',
                                   'efficiency analyst', 'quality analyst', 'compliance analyst',
                                   'risk analyst', 'trend analyst', 'competitive analyst',
                                   'market analyst', 'customer analyst', 'behavior analyst',
                                   'funnel analyst', 'velocity analyst', 'cycle analyst',
                                   'win/loss analyst', 'quota analyst', 'commission analyst',
                                   'incentive analyst', 'motivation analyst',
                                   'sales analytics manager', 'sales analytics specialist',
                                   'sales forecasting', 'sales reporting']):
            return 5  # Analyst
        if any(kw in t for kw in ['sales technology', 'sales operations',
                                   'sales process manager', 'sales process specialist',
                                   'sales compensation', 'sales territory',
                                   'sales enablement', 'sales crm',
                                   'lead scoring', 'lead routing']):
            return 16  # Operator
        if any(kw in t for kw in ['sales training', 'sales coaching', 'sales mentoring',
                                   'sales development specialist', 'sales optimization',
                                   'sales innovation', 'sales excellence',
                                   'sales trainer', 'sales coach',
                                   'sales playbook', 'objection library',
                                   'sales content creator']):
            # Training roles — these are about the skill of agreement making
            if 'content creator' in t:
                return 1  # Writer
            if 'playbook writer' in t:
                return 1  # Writer
            return 12  # Agreement Maker — these train agreement skills
        if any(kw in t for kw in ['customer success', 'customer retention',
                                   'customer experience', 'customer onboarding',
                                   'customer support', 'customer advocate',
                                   'customer champion', 'customer liaison',
                                   'account management', 'account growth',
                                   'account strategy', 'account executive',
                                   'key account', 'enterprise account', 'strategic account',
                                   'relationship manager', 'customer relationship',
                                   'retention specialist', 'renewal specialist',
                                   'win-back']):
            return 13  # Keeper — retention/CS roles
        if any(kw in t for kw in ['referral', 'advocacy', 'testimonial collection',
                                   'case study development']):
            return 14  # Multiplier
        if any(kw in t for kw in ['upselling', 'cross-selling', 'account expansion',
                                   'expansion sales']):
            return 13  # Keeper — expansion from existing
        if any(kw in t for kw in ['sales strategist', 'sales strategy', 'pricing strategist',
                                   'sales meeting research', 'sales meeting agenda']):
            return 17  # Strategist for sales strategy
        if any(kw in t for kw in ['research analyst']):
            return 15  # Researcher
        return 12  # Agreement Maker
    
    # =====================================================
    # BEING 13: THE KEEPER — retention, loyalty, re-engagement
    # =====================================================
    if d in ('5 — disposable income',):
        if any(kw in t for kw in ['analyst', 'analytics', 'forecasting', 'modeling',
                                   'intelligence', 'data', 'reporting']):
            return 5  # Analyst
        if any(kw in t for kw in ['financial', 'cost', 'budget', 'investment', 'resource',
                                   'planning', 'performance']):
            # Financial optimization roles
            if any(kw in t for kw in ['analyst', 'coordinator', 'administrator', 'manager']):
                return 5 if 'analyst' in t else 16  # Analyst for analysts, Operator for ops
            return 17  # Strategist for directors/strategy
        return 13  # Keeper — customer lifetime value
    
    # =====================================================
    # BEING 14: THE MULTIPLIER — referrals, advocacy, testimonials
    # =====================================================
    if d in ('6 — contributions',):
        if any(kw in t for kw in ['analyst', 'analytics']):
            return 5  # Analyst
        if any(kw in t for kw in ['researcher']):
            return 15  # Researcher
        if any(kw in t for kw in ['writer']):
            return 1  # Writer
        if any(kw in t for kw in ['producer']):
            return 3  # Filmmaker (content production)
        if any(kw in t for kw in ['coordinator']):
            return 16  # Operator
        if any(kw in t for kw in ['thought leadership', 'industry influence',
                                   'expert positioning', 'knowledge sharing',
                                   'intellectual capital', 'opinion leadership']):
            # Thought leadership is about establishing authority — Multiplier territory
            if 'writer' in t:
                return 1
            if 'researcher' in t:
                return 15
            if 'analyst' in t:
                return 5
            if 'coordinator' in t:
                return 16
            if 'producer' in t:
                return 3
            return 14  # Multiplier — building influence/reputation
        return 14  # Multiplier — contributions and social impact
    
    # =====================================================
    # BEING 9: THE MESSENGER — email & SMS automation
    # =====================================================
    if any(kw in t for kw in ['email automation', 'email deliverability', 'email segmentation',
                               'email marketing strategist', 'email strategy',
                               'sms marketing', 'sms automation', 'sms strategist',
                               'sms compliance', 'sms analytics',
                               'nurture sequence', 'email sequence',
                               'marketing automation']):
        return 9  # Messenger
    
    # =====================================================
    # BEING 8: THE TECHNOLOGIST — SEO, web infrastructure, CRO, tracking
    # =====================================================
    if d in ('2 — speaking / seo & organic',):
        return 8  # Technologist
    
    if any(kw in t for kw in ['seo ', 'seo manager', 'seo specialist', 'seo strategist',
                               'seo technical', 'seo link building', 'seo local',
                               'seo analytics', 'seo content optimizer',
                               'website strategist', 'website ux', 'website ui',
                               'website analytics', 'website accessibility', 'website security',
                               'cro strategist', 'cro analyst', 'cro designer',
                               'conversion rate optimization',
                               'pixel implementation', 'tracking implementation',
                               'api integration', 'platform administrator',
                               'marketing technology', 'martech',
                               'alexa skill developer', 'google assistant action',
                               'siri shortcut developer', 'discord bot developer',
                               'snapchat ar filter', 'snapchat lens',
                               'gamification experience designer',
                               'quiz platform administrator',
                               'interactive assessment builder',
                               'gamification', 'interactive content',
                               'localization specialist', 'translation and localization',
                               'privacy specialist']):
        return 8  # Technologist
    
    # =====================================================
    # BEING 5: THE ANALYST — all data/analytics
    # =====================================================
    if d in ('analytics & intelligence',):
        if any(kw in t for kw in ['crm manager', 'marketing automation manager',
                                   'marketing data integration', 'marketing project manager',
                                   'marketing project management']):
            return 16  # Operator
        if any(kw in t for kw in ['coliseum data analyst', 'coliseum']):
            return 16  # Operator (Coliseum)
        return 5  # Analyst
    
    if any(kw in t for kw in ['data analyst', 'data scientist', 'statistician',
                               'business analyst', 'business intelligence',
                               'analytics manager', 'analytics specialist',
                               'performance analyst', 'marketing analyst',
                               'digital analyst', 'attribution analyst',
                               'predictive analyst', 'marketing scientist',
                               'research analyst', 'insights analyst',
                               'reporting analyst', 'dashboard analyst',
                               'a/b testing', 'multivariate testing',
                               'experimentation', 'statistical analysis',
                               'data visualization', 'tableau', 'power bi',
                               'looker', 'data studio', 'excel analytics',
                               'sql analyst', 'python analytics', 'r analytics',
                               'machine learning', 'ai analytics', 'deep learning',
                               'neural network', 'algorithm', 'model building',
                               'data mining', 'pattern recognition',
                               'anomaly detection', 'fraud detection',
                               'risk analytics', 'churn analytics',
                               'lifetime value specialist',
                               'revenue analytics', 'roi analytics', 'roas analytics',
                               'cost analytics', 'budget analytics', 'spend analytics',
                               'efficiency analytics', 'productivity analytics',
                               'quality analytics', 'benchmark analytics',
                               'competitive analytics', 'market analytics',
                               'industry analytics', 'marketing attribution',
                               'marketing reporting', 'marketing forecasting']):
        return 5  # Analyst
    
    # =====================================================
    # BEING 15: THE RESEARCHER — market research, competitive intel
    # =====================================================
    if any(kw in t for kw in ['market research', 'competitive intel', 'contact enrichment',
                               'audience research', 'research analyst',
                               'brand alignment evaluator', 'credibility',
                               'identity assessment', 'social proof strategist',
                               'brand competitive analyst',
                               'competitive analyst', 'competitor']):
        return 15  # Researcher
    
    # =====================================================
    # Revenue Generated (Lever 4) — mix of Analyst, Operator, Strategist
    # =====================================================
    if d in ('4 — revenue generated',):
        if any(kw in t for kw in ['analyst', 'analytics', 'data', 'metrics', 'reporting',
                                   'forecasting', 'intelligence', 'churn analyst']):
            return 5  # Analyst
        if any(kw in t for kw in ['operations', 'technology', 'automation', 'integration',
                                   'platform', 'tool', 'system', 'database', 'workflow',
                                   'process', 'compliance', 'risk', 'quality',
                                   'implementation', 'administrator', 'coordinator']):
            return 16  # Operator
        if any(kw in t for kw in ['pricing', 'revenue model', 'product packaging',
                                   'strategy', 'optimization', 'performance',
                                   'growth', 'planning', 'innovation', 'excellence',
                                   'methodology', 'framework', 'best practices',
                                   'efficiency', 'effectiveness',
                                   'upsell', 'cross-sell', 'retention']):
            return 17  # Strategist
        return 17  # Default: Strategist for revenue strategy roles
    
    # =====================================================
    # Fun & Magic (Lever 7) — experience creation
    # =====================================================
    if d in ('7 — fun & magic',):
        if any(kw in t for kw in ['analyst', 'analytics']):
            return 5  # Analyst
        if any(kw in t for kw in ['designer']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['producer']):
            return 3  # Filmmaker
        if any(kw in t for kw in ['coordinator']):
            return 16  # Operator
        if any(kw in t for kw in ['gamification']):
            return 8  # Technologist
        return 10  # Stage Director — experiential/event creation
    
    # =====================================================
    # Shared Experiences (Lever 0.5)
    # =====================================================
    if d in ('0.5 — shared experiences / first touch',):
        if any(kw in t for kw in ['writer', 'copywriter']):
            return 1
        if any(kw in t for kw in ['designer', 'graphic']):
            return 2
        if any(kw in t for kw in ['video', 'filmmaker']):
            return 3
        if any(kw in t for kw in ['analytics', 'analyst', 'data']):
            return 5
        if any(kw in t for kw in ['social media', 'community']):
            return 7
        if any(kw in t for kw in ['email', 'sms', 'nurture', 'drip', 'sequence']):
            return 9
        if any(kw in t for kw in ['automation', 'crm', 'technology', 'platform',
                                   'compliance', 'legal', 'quality assurance']):
            return 16
        if any(kw in t for kw in ['cold outreach', 'cold calling', 'outreach campaign',
                                   'outbound', 'phone', 'calling', 'appointment',
                                   'enrollment', 'conversion']):
            return 12  # Agreement Maker — outreach/conversion
        if any(kw in t for kw in ['research', 'intelligence', 'profiling']):
            return 15
        if any(kw in t for kw in ['partnership', 'alliance', 'merger', 'network',
                                   'referral partner', 'affiliate']):
            return 11
        if any(kw in t for kw in ['event', 'webinar', 'seminar', 'workshop',
                                   'conference', 'stage', 'trade show', 'speaker']):
            return 10
        if any(kw in t for kw in ['strategy', 'campaign', 'planning', 'budget',
                                   'director of', 'manager']):
            return 17
        # Remaining first touch roles — mostly outreach/experience design
        return 12  # Agreement Maker — first touch outreach
    
    if d in ('0.5 — shared experiences / quizzes & interactive',):
        if any(kw in t for kw in ['writer']):
            return 1
        if any(kw in t for kw in ['designer', 'builder']):
            return 8  # Technologist — building interactive tools
        if any(kw in t for kw in ['analytics', 'analyst']):
            return 5
        if any(kw in t for kw in ['administrator', 'platform']):
            return 16  # Operator
        return 8  # Technologist — interactive/gamification
    
    if d in ('0.5 — shared experiences / heart of influence',):
        if any(kw in t for kw in ['writer', 'content curator']):
            return 1
        if any(kw in t for kw in ['analytics', 'analyst', 'tracker', 'attendance tracker']):
            return 5
        if any(kw in t for kw in ['follow-up', 'reminder', 'nurture']):
            return 9  # Messenger
        if any(kw in t for kw in ['producer']):
            return 10  # Stage Director
        return 10  # Stage Director — event management
    
    # =====================================================
    # Brand & PR (Lever 2) 
    # =====================================================
    if d in ('2 — speaking / brand & pr',):
        if any(kw in t for kw in ['writer', 'copywriter', 'press release writer',
                                   'brand messaging', 'brand voice', 'brand story',
                                   'brand tagline', 'crisis communication strategist',
                                   'crisis response writer']):
            return 1  # Writer
        if any(kw in t for kw in ['designer', 'visual identity', 'style guide',
                                   'photography', 'videography', 'graphic designer',
                                   'media kit designer']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['analytics', 'analyst', 'reporting',
                                   'paid media analyst', 'paid media attribution',
                                   'social media analytics']):
            return 5  # Analyst
        if any(kw in t for kw in ['paid media', 'paid media reporting']):
            return 6  # Media Buyer
        if any(kw in t for kw in ['social media strategist', 'social media content',
                                   'social media influencer', 'social media ugc',
                                   'organic media']):
            return 7  # Voice
        if any(kw in t for kw in ['media relations', 'press release', 'media list',
                                   'media outreach', 'media relationship', 'media interview',
                                   'media monitoring', 'podcast guest booking',
                                   'stage & speaking opportunity', 'speaker bureau',
                                   'award submission']):
            return 11  # Connector — PR/media relations is about connections
        if any(kw in t for kw in ['crisis', 'compliance']):
            return 16  # Operator
        if any(kw in t for kw in ['brand strategy', 'brand strategist', 'brand archetype',
                                   'thought leadership', 'public image',
                                   'brand competitive', 'pr strategy', 'pr strategist',
                                   'crisis management']):
            return 17  # Strategist
        return 17  # Strategist — brand strategy
    
    # =====================================================
    # Other — Miscellaneous
    # =====================================================
    if d in ('other — miscellaneous',):
        if any(kw in t for kw in ['voiceover']):
            return 4
        if any(kw in t for kw in ['ads manager', 'ads strategist', 'retargeting', 'programmatic']):
            return 6
        if any(kw in t for kw in ['organic manager']):
            return 7
        if any(kw in t for kw in ['marketing technology', 'marketing attribution',
                                   'marketing reporting', 'marketing forecasting']):
            if 'analyst' in t:
                return 5
            if 'reporting' in t:
                return 5
            return 8  # Technologist
        if any(kw in t for kw in ['cold caller', 'outbound linkedin outreach']):
            return 12
        if any(kw in t for kw in ['customer success', 'win-back']):
            return 13
        if any(kw in t for kw in ['discount strategy', 'cost reduction', 'cost analyst',
                                   'vendor negotiator', 'cross-sell strategist']):
            return 17  # Strategist
        if any(kw in t for kw in ['localization', 'privacy']):
            return 8  # Technologist
        if any(kw in t for kw in ['photography']):
            return 2  # Visual Architect
        if any(kw in t for kw in ['specialist', 'coordinator', 'individual contributor']):
            return 16  # Operator — catch-all for misc
        return 16  # Default for miscellaneous
    
    if d in ('other — act-i & coliseum',):
        return 16  # Operator
    
    # =====================================================
    # CATCH-ALL CLASSIFICATION
    # =====================================================
    
    # General keyword matching for anything not caught above
    if any(kw in t for kw in ['partnership', 'alliance', 'merger', 'joint venture',
                               'ecosystem sourcer', 'ecosystem disruptor',
                               'pr campaign', 'media relations',
                               'podcast guest booking', 'stage & speaking',
                               'speaker bureau']):
        return 11  # Connector
    
    if any(kw in t for kw in ['sales', 'agreement', 'closer', 'closing',
                               'enrollment', 'conversion specialist',
                               'cold outreach', 'cold calling', 'outbound',
                               'appointment setting', 'demo scheduling',
                               'lead generation', 'lead qualification',
                               'prospecting', 'sdr', 'bdr', 'inside sales']):
        return 12  # Agreement Maker
    
    if any(kw in t for kw in ['retention', 'loyalty', 'customer success',
                               'customer experience', 'customer onboarding',
                               'customer support', 'account management',
                               're-engagement', 'win-back', 'renewal',
                               'upsell', 'cross-sell']):
        return 13  # Keeper
    
    if any(kw in t for kw in ['referral', 'advocacy', 'ambassador', 'testimonial',
                               'social impact', 'charitable', 'volunteer',
                               'nonprofit', 'sustainability', 'cause marketing',
                               'thought leadership']):
        return 14  # Multiplier
    
    if any(kw in t for kw in ['research', 'intelligence', 'competitive intel']):
        return 15  # Researcher
    
    if any(kw in t for kw in ['operations', 'automation', 'workflow', 'crm',
                               'pipeline management', 'compliance',
                               'quality assurance', 'administration']):
        return 16  # Operator
    
    if any(kw in t for kw in ['strategy', 'strategist', 'campaign', 'planning',
                               'budget', 'orchestration', 'director of',
                               'pricing', 'revenue model']):
        return 17  # Strategist
    
    # Final fallback
    return 0  # Unclassified

# Classify all positions
being_names = {
    1: "The Writer",
    2: "The Visual Architect",
    3: "The Filmmaker",
    4: "The Sound Engineer",
    5: "The Analyst",
    6: "The Media Buyer",
    7: "The Voice",
    8: "The Technologist",
    9: "The Messenger",
    10: "The Stage Director",
    11: "The Connector",
    12: "The Agreement Maker",
    13: "The Keeper",
    14: "The Multiplier",
    15: "The Researcher",
    16: "The Operator",
    17: "The Strategist",
    0: "UNCLASSIFIED"
}

# Results
results = defaultdict(list)
hard_to_classify = []

for pos in positions:
    being = classify(pos['title'], pos['division'], pos.get('description',''))
    results[being].append(pos)
    if being == 0:
        hard_to_classify.append(pos)

# Print summary
print(f"\nTotal positions classified: {sum(len(v) for v in results.values())}")
print(f"Unclassified: {len(hard_to_classify)}")
print()
for b in sorted(results.keys()):
    if b == 0:
        continue
    print(f"  {b}. {being_names[b]}: {len(results[b])}")

if hard_to_classify:
    print(f"\nUnclassified positions:")
    for p in hard_to_classify:
        print(f"  {p['id']}: {p['title']} ({p['division']})")

# Save results for report generation
output = {
    'being_names': being_names,
    'results': {str(k): v for k, v in results.items()},
    'hard_to_classify': hard_to_classify
}
with open('/tmp/classification_results.json', 'w') as f:
    json.dump(output, f, indent=2)
print("\nResults saved to /tmp/classification_results.json")
