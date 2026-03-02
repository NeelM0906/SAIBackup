# Phase 1: Full openclaw.json Import + Display

## Objective
Expand the ATM dashboard to parse and display ALL sections of openclaw.json that aren't currently extracted, and surface them as browsable entity nodes in the org chart and Context Hub.

## Current State
- `openclaw-provider.ts` already reads: `meta`, `acp`, `agents.defaults`, `agents.list`
- `buildOpenClawEntityNodes()` creates: Runtime Config, Sister Registry, Workspace Catalog, Dashboards, Beings Snapshot
- Missing: channels, bindings, messages/TTS, gateway, plugins, skills config, session config, commands, tools (agent-to-agent)

## Architecture Decisions
- All new data surfaces as **context nodes** under the existing "OpenClaw Entities" root node
- No new node kinds needed — `context` with descriptive tags is sufficient
- All sensitive data (tokens, API keys) is **REDACTED** in promptBody display (show `***` or just show presence)
- The catalog generator (`generate-openclaw-catalog.mjs`) is ALSO updated so browser-only mode works

## Task Breakdown

### TASK A: Expand `openclaw-provider.ts` — `buildOpenClawEntityNodes()`
**File:** `src/services/openclaw-provider.ts`

Add new entity node builders after the existing ones (dashboards, beings-snapshot). Each gets a parent node (category) and child nodes for each item.

#### A1: Channels Entity Nodes
Create a "Channels" parent node under entityRootId. For each channel in `config.channels`:
- Parent: "Channels" node
- Children: One node per channel (telegram, discord)
  - For each channel, show: enabled, groupPolicy, streaming, dmPolicy
  - For each account under the channel: create a child node showing name, enabled status, group count
  - **REDACT all botToken/token values** — show `"present"` or `"***"`

Shape of data in openclaw.json:
```
channels.telegram: { enabled, dmPolicy, botToken, groups, groupPolicy, streaming, accounts: { forge: {...}, scholar: {...}, ... } }
channels.discord: { enabled, allowBots, groupPolicy, streaming, guilds, threadBindings, status, accounts: { default: {...}, forge: {...}, ... } }
```

#### A2: Bindings Entity Nodes
Create a "Channel Bindings" parent node. For each binding in `config.bindings[]`:
- Show: agentId → channel/accountId mapping
- One child per binding

Shape:
```
bindings: [{ agentId, match: { channel, accountId } }, ...]
```

#### A3: Messages/TTS Config Node
Create a "Messages & TTS" node (single, not parent-child). Show:
- `messages.ackReactionScope`
- `messages.tts.auto`, `messages.tts.provider`
- `messages.tts.elevenlabs.voiceId`, `messages.tts.elevenlabs.modelId`

#### A4: Gateway Config Node
Create a "Gateway" node. Show:
- `gateway.mode`, `gateway.bind`, `gateway.customBindHost`
- `gateway.auth.mode` (redact the token)

#### A5: Plugins Entity Nodes
Create a "Plugins" parent node. For each plugin in `config.plugins.entries`:
- Child node per plugin (voice-call, telegram, acpx)
- Show: enabled status, key config fields
- **REDACT all API keys, auth tokens, SIDs**

#### A6: Skills Config Node
Create a "Skills Configuration" node. For each skill entry in `config.skills.entries`:
- Show skill name and that it has a configured API key (redacted)

#### A7: Session & Commands Config Node
Create a "Session & Commands" node. Show:
- `session.agentToAgent.maxPingPongTurns`
- `commands.native`, `commands.nativeSkills`, `commands.restart`, `commands.ownerDisplay`

#### A8: Tools (Agent-to-Agent) Config Node
Create an "Agent-to-Agent Tools" node. Show:
- `tools.agentToAgent.enabled`
- `tools.agentToAgent.allow` list

#### A9: Agent Defaults Detail Node
Create a "Agent Defaults (Extended)" node under Runtime Configuration. Show the full defaults that aren't currently displayed:
- `memorySearch` config (enabled, sources, hybrid settings, cache)
- `contextPruning` (mode, ttl)
- `compaction` (mode, memoryFlush settings, reserveTokensFloor)
- `heartbeat.every`
- `maxConcurrent`, `subagents.maxConcurrent`

### TASK B: Update `generate-openclaw-catalog.mjs`
**File:** `scripts/generate-openclaw-catalog.mjs`

The catalog generator must also export the new sections so browser-only mode (no Tauri) can display them.

Add to the output catalog:
```json
{
  "channels": [{ "id": "telegram", "name": "Telegram", "enabled": true, "accountCount": 4, ... }, ...],
  "bindings": [{ "agentId": "forge", "channel": "telegram", "accountId": "forge" }, ...],
  "gateway": { "mode": "local", "bind": "loopback" },
  "plugins": [{ "id": "voice-call", "enabled": true }, ...],
  "messagesConfig": { "ackReactionScope": "group-mentions", "ttsProvider": "elevenlabs", "ttsVoiceId": "CJXmyMqQHq6bTPm3iEMP" },
  "sessionConfig": { "maxPingPongTurns": 5 },
  "commandsConfig": { "native": "auto", "restart": true },
  "agentDefaults": { "heartbeat": "30m", "maxConcurrent": 10, "compactionMode": "safeguard", "memorySearchEnabled": true },
  "skillsConfig": [{ "id": "sag", "hasApiKey": true }, ...],
  "agentToAgent": { "enabled": true, "allowList": ["main","forge","scholar","memory","recovery"] }
}
```

Also update `openclaw-catalog-fallback.ts` to add types for these new fields and handle them in the normalizer.

### TASK C: Update `openclaw-catalog-fallback.ts`
**File:** `src/services/openclaw-catalog-fallback.ts`

Add TypeScript interfaces for the new catalog fields (channels, bindings, gateway, plugins, etc.) and update `normalizeCatalog()` to parse them. Update the fallback loader in `buildOpenClawEntityNodes()` to use these new fields when Tauri FS is unavailable.

### TASK D: Update Context Hub to display new entity types
**File:** `src/components/context-hub/ContextHub.tsx`

The "Entities" filter chip in Context Hub should now show the new entity types. Since entities are already included via `buildOpenClawEntityNodes()`, we just need to ensure the filtering/display handles them. The entity tags (`entity-type:channel`, `entity-type:binding`, etc.) should be filterable.

Add to the entity scan logic so that when the user clicks "Entities" filter, the new node types appear grouped under their categories.

## Implementation Notes
- All new nodes use `syntheticNodeBase()` for consistent ID generation
- Tags follow pattern: `["openclaw", "entities", "entity-type:<type>"]`
- Token/key redaction: helper function `redactSensitive(value)` → returns `"***<last4>"` or `"present"`
- No new dependencies needed
- Changes are backward-compatible — old catalogs without new fields still work (fallback to empty arrays)

## File Change Summary
| File | Changes |
|------|---------|
| `src/services/openclaw-provider.ts` | Add ~200 lines: new entity node builders in `buildOpenClawEntityNodes()`, add `OpenClawConfig` interface expansion |
| `scripts/generate-openclaw-catalog.mjs` | Add ~100 lines: new section extractors, redaction helpers |
| `src/services/openclaw-catalog-fallback.ts` | Add ~60 lines: new interfaces, normalize new fields |
| `src/components/context-hub/ContextHub.tsx` | Minor: ensure entity type labels render nicely for new types |

## Testing
After implementation, run: `cd openclaw-agent-team-manager && npm run dev` and verify:
1. New entity nodes appear on the canvas under "OpenClaw Entities"
2. Context Hub "Entities" tab shows channels, plugins, gateway, etc.
3. No sensitive tokens visible in any node's promptBody
4. Browser-only fallback works (regenerate catalog: `node scripts/generate-openclaw-catalog.mjs`)
