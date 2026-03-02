import { watch, exists } from "@tauri-apps/plugin-fs";
import { joinPath, normalizePath } from "@/utils/paths";

/**
 * Watch the .claude/ directory for changes with debouncing.
 * Returns a cleanup function that stops watching.
 */
export async function startWatching(
  rootPath: string,
  onChange: (paths: string[]) => void
): Promise<() => void> {
  const root = normalizePath(rootPath);
  const openclawConfig = joinPath(root, "openclaw.json");
  const openclawMode = await exists(openclawConfig).catch(() => false);

  const watchTargets = openclawMode
    ? [
        joinPath(root, "agents"),
        joinPath(root, "workspace"),
        openclawConfig,
      ]
    : [joinPath(root, ".claude")];

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let pendingPaths: string[] = [];
  const unwatchers: Array<() => void> = [];

  for (const target of watchTargets) {
    const targetExists = await exists(target).catch(() => false);
    if (!targetExists) continue;

    const unwatch = await watch(
      target,
      (event) => {
        const eventPaths = event.paths.map(normalizePath);
        pendingPaths.push(...eventPaths);

        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }

        debounceTimer = setTimeout(() => {
          const paths = [...new Set(pendingPaths)];
          pendingPaths = [];
          debounceTimer = null;
          onChange(paths);
        }, 300);
      },
      { recursive: true }
    );
    unwatchers.push(unwatch);
  }

  return () => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    for (const fn of unwatchers) {
      fn();
    }
  };
}
