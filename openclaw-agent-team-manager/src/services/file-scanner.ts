import { readDir, exists, readTextFile } from "@tauri-apps/plugin-fs";
import { joinPath, normalizePath } from "@/utils/paths";
import type { ProviderMode } from "./app-settings";

interface OpenClawAgentConfig {
  id?: string;
  workspace?: string;
}

interface OpenClawConfig {
  agents?: {
    defaults?: { workspace?: string };
    list?: OpenClawAgentConfig[];
  };
}

async function appendSkillFiles(skillsDir: string, out: string[]) {
  if (!(await safeExists(skillsDir))) return;
  const entries = await readDir(skillsDir);
  for (const entry of entries) {
    if (!entry.isDirectory) continue;
    const skillFile = joinPath(skillsDir, entry.name, "SKILL.md");
    if (await safeExists(skillFile)) {
      out.push(skillFile);
    }
  }
}

async function scanOpenClawProject(root: string): Promise<string[]> {
  const found: string[] = [];
  const configPath = joinPath(root, "openclaw.json");
  if (!(await safeExists(configPath))) {
    return found;
  }

  found.push(configPath);
  await appendSkillFiles(joinPath(root, "skills"), found);
  await appendSkillFiles(joinPath(root, "workspace", "skills"), found);

  let parsed: OpenClawConfig | null = null;
  try {
    const raw = await readTextFile(configPath);
    parsed = JSON.parse(raw) as OpenClawConfig;
  } catch {
    parsed = null;
  }

  const defaultsWorkspace = String(parsed?.agents?.defaults?.workspace || "").trim();
  const list = parsed?.agents?.list || [];
  for (const item of list) {
    if (!item?.id) continue;
    const workspace = String(item.workspace || defaultsWorkspace).trim();
    if (!workspace) continue;
    await appendSkillFiles(joinPath(workspace, "skills"), found);
  }

  return found;
}

/**
 * Scan a project root for Claude configuration files.
 * Returns an array of absolute file paths found.
 */
export async function scanProject(
  rootPath: string,
  providerMode: ProviderMode = "claude",
): Promise<string[]> {
  const root = normalizePath(rootPath);
  if (providerMode === "openclaw") {
    return scanOpenClawProject(root);
  }
  const found: string[] = [];

  // Top-level markdown files
  for (const name of ["CLAUDE.md", "CLAUDE.local.md"]) {
    const p = joinPath(root, name);
    if (await safeExists(p)) {
      found.push(p);
    }
  }

  // .claude/settings files
  for (const name of ["settings.json", "settings.local.json"]) {
    const p = joinPath(root, ".claude", name);
    if (await safeExists(p)) {
      found.push(p);
    }
  }

  // .claude/agents/*.md
  const agentsDir = joinPath(root, ".claude", "agents");
  if (await safeExists(agentsDir)) {
    const entries = await readDir(agentsDir);
    for (const entry of entries) {
      if (entry.isFile && entry.name.endsWith(".md")) {
        found.push(joinPath(agentsDir, entry.name));
      }
    }
  }

  // .claude/skills/*/SKILL.md
  const skillsDir = joinPath(root, ".claude", "skills");
  if (await safeExists(skillsDir)) {
    const skillEntries = await readDir(skillsDir);
    for (const entry of skillEntries) {
      if (entry.isDirectory) {
        const skillFile = joinPath(skillsDir, entry.name, "SKILL.md");
        if (await safeExists(skillFile)) {
          found.push(skillFile);
        }
      }
    }
  }

  // .claude/rules/*.md
  const rulesDir = joinPath(root, ".claude", "rules");
  if (await safeExists(rulesDir)) {
    const ruleEntries = await readDir(rulesDir);
    for (const entry of ruleEntries) {
      if (entry.isFile && entry.name.endsWith(".md")) {
        found.push(joinPath(rulesDir, entry.name));
      }
    }
  }

  return found;
}

/** Check existence without throwing if parent directories are missing. */
async function safeExists(path: string): Promise<boolean> {
  try {
    return await exists(path);
  } catch {
    return false;
  }
}
