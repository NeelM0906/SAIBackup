# Phase 3: Live Gateway Connection for Sessions/Status

## Objective
Add an optional live connection to the OpenClaw gateway API for real-time session data and gateway health status. Display as entity nodes that refresh periodically.

## Architecture
- The gateway runs on `http://127.0.0.1:5050` (health endpoint confirmed working)
- Gateway port is configurable via `app-settings.ts` → `openclawApiBase` (default: `http://127.0.0.1:5077`)
- Connection is **best-effort** — if gateway is down, show "unavailable" gracefully
- Use polling (every 30s) rather than WebSocket for simplicity
- All data is read-only

## Task Breakdown

### TASK A: Create `src/services/gateway-client.ts`
A lightweight HTTP client for the OpenClaw gateway.

```typescript
export interface GatewayHealth {
  ok: boolean;
  timestamp: string;
}

export interface GatewayStatus {
  available: boolean;
  health: GatewayHealth | null;
  lastChecked: number;
  error: string | null;
}

// Functions:
export async function checkGatewayHealth(baseUrl: string): Promise<GatewayStatus>;
```

Implementation:
- `checkGatewayHealth(baseUrl)` → fetch `${baseUrl}/api/health`, return GatewayStatus
- Timeout after 3 seconds
- Catch all errors gracefully → return `{ available: false, error: "..." }`

### TASK B: Create `src/hooks/useGatewayStatus.ts`
React hook that polls the gateway periodically.

```typescript
export function useGatewayStatus(baseUrl: string, intervalMs?: number): GatewayStatus;
```

Implementation:
- On mount: check health immediately
- Set up interval (default 30000ms)
- Clean up on unmount
- Return current status

### TASK C: Add Gateway Status to Toolbar
**File:** `src/components/common/Toolbar.tsx`

Add a small status indicator to the toolbar:
- Green dot + "Gateway Online" when connected
- Red dot + "Gateway Offline" when unavailable
- Pulsing dot while checking

This is a non-intrusive addition to the existing toolbar.

### TASK D: Add Gateway Health node to entity tree
**File:** `src/services/openclaw-provider.ts`

In `buildOpenClawEntityNodes()`, update the existing "Gateway" node to include a `promptBody` note about the live status endpoint being available at the configured base URL. This is informational — the actual live data comes from the hook in Task B/C.

### TASK E: Wire gateway status into SettingsPanel
**File:** `src/components/settings/SettingsPanel.tsx`

In the existing Settings panel, near the `openclawApiBase` input field, show the live gateway status (online/offline) so users can verify their connection.
