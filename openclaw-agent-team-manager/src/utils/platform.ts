export const isWindows = navigator.userAgent.includes("Windows");
export const isMac = navigator.userAgent.includes("Mac");

export function hasTauriRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const internal = (window as { __TAURI_INTERNALS__?: { invoke?: unknown } }).__TAURI_INTERNALS__;
  return typeof internal?.invoke === "function";
}
