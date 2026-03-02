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

export async function checkGatewayHealth(baseUrl: string): Promise<GatewayStatus> {
  const now = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${baseUrl}/api/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      return { available: false, health: null, lastChecked: now, error: `HTTP ${response.status}` };
    }
    const data = await response.json() as GatewayHealth;
    return {
      available: Boolean(data?.ok),
      health: data,
      lastChecked: now,
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { available: false, health: null, lastChecked: now, error: message };
  }
}
