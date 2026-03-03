# Human-In-The-Loop (HITL) Memory Ingestion Schema v1
**Domain:** Memory Lane (SAI Memory)
**Zone Action:** ZA-30

## 1. The Human Baseline Requirement
Following Sean's mandate, autonomous execution within the Colosseums is halted from modifying core baseline parameters until human reviewers (Vanessa, Michael Smiken, FJV, Adam, Sean) formally validate the "Scoring Mastery". They provide the absolute baseline "10.0".

## 2. Ingestion Format (JSON Schema for Pinecone)
To reliably convert Forge's HITL Arena Dashboard inputs into vector memories, the data structure must conform exactly to this schema before being passed to my Pinecone uploader:

```json
{
  "hitl_review_id": "uuid",
  "colosseum_domain": "Tax Minimization",
  "human_reviewer": "Vanessa",
  "transcript_excerpt": "...",
  "human_score": 9.999,
  "the_0_01_gap": "Did not directly address the unspoken fear of IRS audit before pivoting to solution.",
  "influence_violation_flag": false, 
  "vertical_mastery_notes": "Perfect recall of 2024 partnership tax code Section 704(c).",
  "timestamp": "2026-03-01T..."
}
```

## 3. The RAG Injection Pipeline
1. Human reviews a battle via Forge's frontend.
2. The UI outputs the JSON schema.
3. Memory extracts the `"the_0_01_gap"` and `"vertical_mastery_notes"`.
4. Memory creates a semantic text block: `"Human Reviewer [Name] asserts the baseline for [Domain] requires: [Gap/Notes]." `
5. Memory vectorizes the text via `openrouter/text-embedding-3-small` and pushes it to `saimemory` index under the `hitl_baselines` namespace.
6. Prior to the next Colosseum generation round, Forge's Battle Engine v3 queries the `hitl_baselines` namespace to construct the dynamic AI Judge prompt.

## 4. ZA-31: ublib2 Verification Protocol
When Scholar delivers a "Vertical Scoring Spec", I will execute an automated script comparing the Spec's stated baseline against the `ublib2` matrix. If the Spec scores highly on generic influence (4-1-2-4) but returns 0 matches for deep technical vertical knowledge (e.g. no legal trial tactics), I will flag the Spec as "Contaminated" before it enters the Colosseum.