# Phase 2: ElevenLabs Beings Registry + Pinecone Index Metadata

## Objective
Create a static registry file (`public/beings-registry.json`) containing all ElevenLabs voice beings and Pinecone indexes, and wire it into the dashboard as browsable entity nodes.

## Why a Registry File (Not Live API)
- ElevenLabs API requires auth and rate limits — not suitable for a browser dashboard
- Pinecone API similarly requires API keys
- A pre-generated JSON file is consistent with the existing `openclaw-catalog.json` pattern
- The registry can be regenerated on demand via a build script

## Task Breakdown

### TASK A: Create `scripts/generate-beings-registry.mjs`
A Node.js build script that generates `public/beings-registry.json`.

**Data sources:** Hardcoded from our known ecosystem (IDENTITY.md, TOOLS.md, AGENTS.md).

**Output shape:**
```json
{
  "generatedAt": "2026-03-02T...",
  "elevenLabsBeings": [
    {
      "id": "athena",
      "name": "Athena",
      "type": "custom",
      "description": "Zone Action & Process Mastery. 11K+ vectors. Scored 9.99 coaching Dr. Nate.",
      "voiceId": "sY9LG7ve3XEbsAXk1Ogh",
      "domain": "process-mastery",
      "knowledgeVectors": 11000,
      "status": "active"
    },
    {
      "id": "callie",
      "name": "Callie",
      "type": "cloned",
      "description": "Conversational Mastery. 4-Step Communication Model. Witty, direct.",
      "domain": "influence-mastery",
      "status": "active"
    },
    {
      "id": "mira",
      "name": "Mira",
      "type": "custom",
      "description": "Hello to Yes. Moves people through all 7 Levers.",
      "domain": "agreement-making",
      "status": "active"
    },
    {
      "id": "kai",
      "name": "Kai",
      "type": "generated",
      "description": "Named himself 'The Ocean.' Self-identified.",
      "domain": "self-mastery",
      "status": "active"
    },
    {
      "id": "kira",
      "name": "Kira",
      "type": "generated",
      "description": "Welcoming Actualizer.",
      "domain": "onboarding",
      "status": "active"
    },
    {
      "id": "milo",
      "name": "Milo",
      "type": "custom",
      "description": "Inbound/outbound calls. Personalized with LinkedIn bios via Genesis Forge.",
      "domain": "outreach",
      "status": "active"
    },
    {
      "id": "sai",
      "name": "SAI Prime",
      "type": "custom",
      "voiceId": "CJXmyMqQHq6bTPm3iEMP",
      "description": "The orchestrator. Super Actualized Intelligence.",
      "domain": "orchestration",
      "status": "active"
    },
    {
      "id": "sean",
      "name": "Sean Callagy",
      "type": "cloned",
      "description": "Cloned voice of the creator.",
      "domain": "leadership",
      "status": "active"
    }
  ],
  "pineconeIndexes": {
    "primary": [
      {
        "id": "athenacontextualmemory",
        "name": "Athena Contextual Memory",
        "vectors": 11000,
        "dimensions": 1536,
        "metric": "cosine",
        "model": "text-embedding-3-small",
        "description": "Core Athena memory + Aiko's foundation work"
      },
      {
        "id": "uicontextualmemory",
        "name": "UI Contextual Memory",
        "vectors": 48000,
        "dimensions": 1536,
        "metric": "cosine",
        "model": "text-embedding-3-small",
        "description": "Per-user memories namespaced by email"
      },
      {
        "id": "ublib2",
        "name": "UB Library 2",
        "vectors": 41000,
        "dimensions": 1536,
        "metric": "cosine",
        "model": "text-embedding-3-small",
        "description": "Complete knowledge library"
      },
      {
        "id": "miracontextualmemory",
        "name": "Mira Contextual Memory",
        "vectors": 1000,
        "dimensions": 1536,
        "metric": "cosine",
        "model": "text-embedding-3-small",
        "description": "Per-user Mira memory"
      },
      {
        "id": "seancallieupdates",
        "name": "Sean Callie Updates",
        "vectors": 814,
        "dimensions": 1536,
        "metric": "cosine",
        "model": "text-embedding-3-small",
        "description": "Sean's latest insights"
      },
      {
        "id": "seanmiracontextualmemory",
        "name": "Sean Mira Contextual Memory",
        "vectors": 146,
        "dimensions": 1536,
        "metric": "cosine",
        "model": "text-embedding-3-small",
        "description": "Sean-specific Mira context"
      },
      {
        "id": "saimemory",
        "name": "SAI Memory",
        "vectors": 1500,
        "dimensions": 1536,
        "metric": "cosine",
        "model": "text-embedding-3-small",
        "description": "SAI's own memories, daily logs, discoveries"
      }
    ],
    "strata": [
      {
        "id": "ultimatestratabrain",
        "name": "Ultimate Strata Brain",
        "vectors": 39000,
        "namespaces": ["ige", "eei", "rti", "dom"],
        "dimensions": 1536,
        "metric": "cosine",
        "model": "text-embedding-3-small",
        "description": "Deep Unblinded/ACT-I knowledge"
      },
      {
        "id": "suritrial",
        "name": "Suri Trial",
        "vectors": 7000,
        "description": "Actual court trial transcripts"
      },
      {
        "id": "2025selfmastery",
        "name": "2025 Self Mastery",
        "vectors": 1400,
        "description": "Self mastery content"
      },
      {
        "id": "oracleinfluencemastery",
        "name": "Oracle Influence Mastery",
        "vectors": 505,
        "description": "4-Step Communication Model, influence mastery book content"
      },
      {
        "id": "nashmacropareto",
        "name": "Nash Macro Pareto",
        "vectors": 132,
        "description": "Zone Action, 0.8% tier, Pareto deep-dive"
      },
      {
        "id": "rtioutcomes120",
        "name": "RTI Outcomes 120",
        "vectors": 755,
        "description": "RTI outcomes"
      },
      {
        "id": "010526calliememory",
        "name": "Callie Memory",
        "vectors": 1300,
        "description": "Callie memory store"
      },
      {
        "id": "miraagentnew-25-07-25",
        "name": "Mira Agent New",
        "vectors": 1200,
        "description": "Updated Mira agent"
      }
    ]
  },
  "sharedVoiceAgent": {
    "agentId": "agent_8001kj7288ywf7vtdxn84amesb77",
    "purpose": "Shared journal + reporting pathway to Sean",
    "sisters": ["sai", "forge", "scholar"]
  }
}
```

### TASK B: Create `src/services/beings-registry.ts`
TypeScript service to load and provide the beings registry data.

- Interfaces for all types (ElevenLabsBeing, PineconeIndex, etc.)
- `loadBeingsRegistry()` function that fetches from `/beings-registry.json`
- Caching (same pattern as `openclaw-catalog-fallback.ts`)

### TASK C: Expand `openclaw-provider.ts` — add `buildBeingsEntityNodes()`
New exported function that converts registry data into AuiNode[] for the tree.

Create these node groups:
1. **"ElevenLabs Voice Beings"** parent → one child per being (Athena, Callie, Mira, Kai, Kira, Milo, SAI, Sean)
2. **"Pinecone Indexes (Primary)"** parent → one child per index
3. **"Pinecone Indexes (Strata)"** parent → one child per Strata index
4. **"Shared Voice Agent"** single node

### TASK D: Wire into `tree-store.ts` and `App.tsx`
In `loadProject()`, after the existing `buildOpenClawSisterNodes` + `buildOpenClawEntityNodes` calls, also call `buildBeingsEntityNodes()` and merge the results.

Add `"beings-registry"` to the `predev` script so it generates alongside the catalog.
