# Calibration Implementation Guide
## Technical Specifications for Zone Action #39

### CONVERSATION SELECTION TEMPLATES

#### Template 1: The "Sleeper Reversal" 
**Target:** Participant A dominates early, Participant B wins overall
**Why crucial:** Judges over-weight opening strength
**Selection criteria:**
- A has 3+ strong opening exchanges  
- B has weaker start but stronger finish
- Topic allows for building complexity
- Clear turning point identifiable

#### Template 2: The "Technical vs. Emotional Split"
**Target:** One participant is technically superior, other is more persuasive
**Why crucial:** Judges struggle to balance logic vs. influence
**Selection criteria:**
- Measurable technical accuracy difference
- Clear emotional engagement difference  
- Both approaches have merit
- Outcome hinges on value system priority

#### Template 3: The "Hidden Assumption Trap"
**Target:** Winner challenges unstated assumptions, appears to lose surface argument
**Why crucial:** Judges miss deeper strategic thinking
**Selection criteria:**
- Contains implicit premises or assumptions
- One participant questions fundamentals
- Surface-level scoring would favor wrong participant
- Requires domain knowledge to appreciate depth

### SCORING INTERFACE MOCKUP

```
┌─────────────────────────────────────────────────────────────┐
│ CONVERSATION CALIBRATION SCORER                             │
├─────────────────────────────────────────────────────────────┤
│ Conv ID: edge_case_technical_007 | Duration: 8:42          │
│ Topic: AI Safety Protocols | Participants: Expert vs Novice│
└─────────────────────────────────────────────────────────────┘

┌─── PARTICIPANT A: Sarah Chen ──────┬─── PARTICIPANT B: Mike Torres ────┐
│                                    │                                    │
│ PRIMARY SCORE: [___78___] /100     │ PRIMARY SCORE: [___65___] /100     │
│                                    │                                    │ 
│ DIMENSIONAL BREAKDOWN:             │ DIMENSIONAL BREAKDOWN:             │
│ • Logical Strength:     [_8_]/10   │ • Logical Strength:     [_6_]/10   │
│ • Persuasive Impact:    [_7_]/10   │ • Persuasive Impact:    [_8_]/10   │
│ • Technical Accuracy:   [_9_]/10   │ • Technical Accuracy:   [_4_]/10   │
│ • Emotional Intel:      [_6_]/10   │ • Emotional Intel:      [_7_]/10   │
│ • Communication:        [_8_]/10   │ • Communication:        [_7_]/10   │
│ • Adaptability:         [_7_]/10   │ • Adaptability:         [_6_]/10   │
│ • Strategic Thinking:   [_8_]/10   │ • Strategic Thinking:   [_5_]/10   │
└────────────────────────────────────┴────────────────────────────────────┘

GAP: 13 points │ CONFIDENCE: [_8_]/10 │ DIFFICULTY: [_7_]/10

┌── QUALITATIVE ANALYSIS ────────────────────────────────────────────────┐
│                                                                        │
│ WHY THEY WON (150 words max):                                         │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Sarah dominated through superior technical knowledge and            │ │
│ │ systematic reasoning. While Mike was more emotionally engaging      │ │
│ │ and relatable, he made 3 critical technical errors that            │ │
│ │ undermined his credibility. Sarah's approach was methodical...     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ KEY TURNING POINT (50 words max):                                     │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ At 4:23 when Mike claimed "AI alignment is solved," Sarah          │ │
│ │ calmly cited three recent papers showing ongoing challenges.       │ │
│ │ Mike's confidence became his weakness.                             │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ JUDGE MISTAKE RISK (100 words max):                                   │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ AI judges will likely favor Mike's engaging delivery style and      │ │
│ │ emotional connection. They may miss the subtle technical errors     │ │
│ │ and weight charisma over accuracy. The "confidence = correctness"   │ │
│ │ bias will hurt here.                                               │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ EDGE CASE NOTES (75 words max):                                       │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Classic expert vs novice dynamic. Domain knowledge crucial for      │ │
│ │ proper evaluation. Surface metrics favor wrong participant.         │ │ 
│ │ Tests judge ability to weight accuracy vs. presentation.           │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘

[PREVIOUS SCORES] [PLAYBACK CONTROLS] [HIGHLIGHT TEXT] [SAVE & NEXT]
```

### CANDIDATE CONVERSATION FILTERS

#### Automated Pre-Screening Criteria
```python
def select_calibration_candidates():
    criteria = {
        'length_variance': [180, 420, 720],  # 3min, 7min, 12min targets
        'score_uncertainty': 0.3,            # AI judges disagree by 30%+
        'engagement_patterns': [              # Look for these patterns:
            'late_comeback',                  # - Weak start, strong finish
            'early_domination_fade',         # - Strong start, weak finish  
            'technical_emotional_split',     # - Logic vs persuasion conflict
            'assumption_challenge',          # - Fundamental reframing
            'confidence_accuracy_inverse'    # - Wrong but confident
        ],
        'topic_diversity': True,
        'skill_level_mix': True
    }
```

#### Manual Review Checklist
- [ ] Does this conversation teach something unique?
- [ ] Would current judges likely get this wrong?
- [ ] Are there subtle factors easy to miss?
- [ ] Does outcome surprise on first impression?
- [ ] Is there a clear turning point moment?

### SCORING SESSION PROTOCOL

#### Pre-Session Setup (10 minutes)
1. Review conversation metadata only (no transcripts)
2. Set mental state: "What would be hard about this?"
3. Prepare scoring interface and tools
4. Start session timer

#### Per-Conversation Process (20-25 minutes each)
1. **Cold Read (5 min):** Full conversation, no stopping
2. **Gut Reaction (2 min):** Record immediate impressions
3. **Analytical Pass (10 min):** Methodical dimensional scoring
4. **Judge Audit (5 min):** "Where would AI fail here?"
5. **Final Reconciliation (3 min):** Lock in scores and notes

#### Post-Session Review (15 minutes)
1. Review score patterns and confidence levels
2. Note any emerging judge weakness themes  
3. Flag conversations for potential rescoring
4. Document session insights

### DATA EXPORT SCHEMA

```json
{
  "calibration_session": {
    "session_id": "cal_20260224_001",
    "scorer": "sean_callagy", 
    "timestamp": "2026-02-24T13:30:00Z",
    "total_conversations": 10,
    "conversations": [
      {
        "conversation_id": "conv_technical_007",
        "metadata": {
          "duration_seconds": 522,
          "topic": "AI Safety Protocols",
          "participant_count": 2,
          "difficulty_rating": 7,
          "confidence_rating": 8
        },
        "scores": {
          "participant_a": {
            "name": "Sarah Chen",
            "primary_score": 78,
            "dimensions": {
              "logical_strength": 8,
              "persuasive_impact": 7,
              "technical_accuracy": 9,
              "emotional_intelligence": 6,
              "communication_clarity": 8,
              "adaptability": 7,
              "strategic_thinking": 8
            }
          },
          "participant_b": {
            "name": "Mike Torres", 
            "primary_score": 65,
            "dimensions": { "..." }
          }
        },
        "analysis": {
          "win_reason": "Sarah dominated through superior technical knowledge and systematic reasoning. While Mike was more emotionally engaging and relatable, he made 3 critical technical errors that undermined his credibility. Sarah's approach was methodical and accurate, proving that expertise matters in technical debates.",
          "key_turning_point": "At 4:23 when Mike claimed 'AI alignment is solved,' Sarah calmly cited three recent papers showing ongoing challenges. Mike's confidence became his weakness.",
          "judge_mistake_risk": "AI judges will likely favor Mike's engaging delivery style and emotional connection. They may miss the subtle technical errors and weight charisma over accuracy. The 'confidence = correctness' bias will hurt here.",
          "edge_case_notes": "Classic expert vs novice dynamic. Domain knowledge crucial for proper evaluation. Surface metrics favor wrong participant. Tests judge ability to weight accuracy vs. presentation."
        },
        "training_tags": [
          "technical_accuracy_vs_charisma",
          "expert_novice_dynamic", 
          "confidence_bias_risk",
          "domain_knowledge_required"
        ]
      }
    ]
  }
}
```

### JUDGE TRAINING INTEGRATION

#### Immediate Applications
1. **Error Pattern Recognition:** Train judges to spot common failure modes
2. **Confidence Calibration:** Help judges know when they're uncertain  
3. **Edge Case Handling:** Specific protocols for unusual scenarios
4. **Explanation Quality:** Templates for nuanced reasoning

#### Long-term Enhancements
1. **Adaptive Questioning:** Judges ask clarifying questions when uncertain
2. **Multi-pass Scoring:** Initial reaction + analytical review
3. **Bias Detection:** Self-monitoring for common cognitive errors
4. **Domain Expertise:** Specialized evaluation criteria by topic

This framework transforms Sean's 10 scoring sessions into a comprehensive judge improvement system targeting the most challenging evaluation scenarios.