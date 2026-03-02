import { readDir, readTextFile, exists } from "@tauri-apps/plugin-fs";
import matter from "gray-matter";
import { join, titleCase, generateNodeId } from "@/utils/paths";
import type { ProviderMode } from "./app-settings";

export interface SkillInfo {
  id: string;
  name: string;
  description: string;
  sourcePath: string;
}

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

function pushSkill(items: SkillInfo[], seenPaths: Set<string>, sourcePath: string, fallbackName: string, raw?: string) {
  if (seenPaths.has(sourcePath)) return;
  seenPaths.add(sourcePath);

  if (!raw) {
    items.push({
      id: generateNodeId(sourcePath),
      name: titleCase(fallbackName),
      description: "",
      sourcePath,
    });
    return;
  }

  try {
    const parsed = matter(raw);
    const name = parsed.data?.name ? String(parsed.data.name) : titleCase(fallbackName);
    const description = parsed.data?.description ? String(parsed.data.description) : "";
    items.push({
      id: generateNodeId(sourcePath),
      name,
      description,
      sourcePath,
    });
  } catch {
    items.push({
      id: generateNodeId(sourcePath),
      name: titleCase(fallbackName),
      description: "",
      sourcePath,
    });
  }
}

async function scanSkillDirectory(skillsDir: string, items: SkillInfo[], seenPaths: Set<string>) {
  if (!(await exists(skillsDir))) return;
  const entries = await readDir(skillsDir);
  for (const entry of entries) {
    if (!entry.isDirectory) continue;
    const skillFile = join(skillsDir, entry.name, "SKILL.md");
    if (!(await exists(skillFile))) continue;
    try {
      const raw = await readTextFile(skillFile);
      pushSkill(items, seenPaths, skillFile, entry.name, raw);
    } catch {
      pushSkill(items, seenPaths, skillFile, entry.name);
    }
  }
}

async function scanClaudeSkills(projectPath: string): Promise<SkillInfo[]> {
  const items: SkillInfo[] = [];
  const seenPaths = new Set<string>();
  await scanSkillDirectory(join(projectPath, ".claude", "skills"), items, seenPaths);
  return items.sort((a, b) => a.name.localeCompare(b.name));
}

async function scanOpenClawSkills(projectPath: string): Promise<SkillInfo[]> {
  const items: SkillInfo[] = [];
  const seenPaths = new Set<string>();

  await scanSkillDirectory(join(projectPath, "skills"), items, seenPaths);
  await scanSkillDirectory(join(projectPath, "workspace", "skills"), items, seenPaths);

  const configPath = join(projectPath, "openclaw.json");
  if (await exists(configPath)) {
    try {
      const raw = await readTextFile(configPath);
      const parsed = JSON.parse(raw) as OpenClawConfig;
      const defaultsWorkspace = String(parsed?.agents?.defaults?.workspace || "").trim();
      const list = parsed?.agents?.list || [];
      for (const item of list) {
        if (!item?.id) continue;
        const workspace = String(item.workspace || defaultsWorkspace).trim();
        if (!workspace) continue;
        await scanSkillDirectory(join(workspace, "skills"), items, seenPaths);
      }
    } catch {
      // Ignore invalid/missing config parse.
    }
  }

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function scanAllSkills(
  projectPath: string,
  providerMode: ProviderMode = "claude",
): Promise<SkillInfo[]> {
  if (providerMode === "openclaw") {
    return scanOpenClawSkills(projectPath);
  }
  return scanClaudeSkills(projectPath);
}
