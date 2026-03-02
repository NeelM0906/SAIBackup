import { useState, useEffect, useRef } from "react";
import { checkGatewayHealth, type GatewayStatus } from "@/services/gateway-client";

const DEFAULT_INTERVAL = 30000;

export function useGatewayStatus(baseUrl: string, intervalMs = DEFAULT_INTERVAL): GatewayStatus {
  const [status, setStatus] = useState<GatewayStatus>({
    available: false,
    health: null,
    lastChecked: 0,
    error: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!baseUrl) return;

    let cancelled = false;

    const check = async () => {
      const result = await checkGatewayHealth(baseUrl);
      if (!cancelled) setStatus(result);
    };

    // Check immediately
    check();

    // Set up polling
    intervalRef.current = setInterval(check, intervalMs);

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [baseUrl, intervalMs]);

  return status;
}
