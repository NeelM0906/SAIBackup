#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const home = os.homedir();
const rootPath = process.env.OPENCLAW_ROOT || path.join(home, ".openclaw");
const outPath = path.join(process.cwd(), "public", "openclaw-catalog.json");

const IDENTITY_FILES = ["IDENTITY.md", "SOUL.md", "AGENTS.md"];

function normalize(p) {
  return String(p || "").replace(/\\/g, "/");
}

function hashId(input) {
  const text = normalize(input);
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

function titleCase(value) {
  return String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function safeExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function safeReadDir(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function safeReadText(file) {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return "";
  }
}

function extractHeading(content, fallback) {
  const lines = String(content || "").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("#")) continue;
    const raw = trimmed.replace(/^#+\s*/, "").trim();
    const name = raw
      .replace(/^identity\.md\s*[-:–—]\s*/i, "")
      .replace(/^identity\s*[-:–—]\s*/i, "")
      .trim();
    if (/^who am i\??$/i.test(name)) return fallback;
    if (name) return name;
  }
  return fallback;
}

function isRealToolName(name) {
  const value = String(name || "").trim();
  if (!value) return false;
  if (value.startsWith(".")) return false;
  const lowered = value.toLowerCase();
  if (lowered === "__pycache__" || lowered === "node_modules" || lowered === "dist" || lowered === "build") return false;
  return true;
}

function extractFrontmatterNameAndDescription(raw, fallbackName) {
  const text = String(raw || "");
  if (!text.startsWith("---\n")) {
    return { name: fallbackName, description: "" };
  }
  const end = text.indexOf("\n---", 4);
  if (end < 0) {
    return { name: fallbackName, description: "" };
  }
  const frontmatter = text.slice(4, end).split("\n");
  const fields = new Map();
  for (const line of frontmatter) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    fields.set(key, value);
  }
  return {
    name: String(fields.get("name") || fallbackName),
    description: String(fields.get("description") || ""),
  };
}

async function readIdentity(workspace) {
  for (const file of IDENTITY_FILES) {
    const p = path.join(workspace, file);
    if (!(await safeExists(p))) continue;
    const content = await safeReadText(p);
    return { sourcePath: normalize(p), content };
  }
  return null;
}

async function discoverConfiguredAgents(config) {
  const defaults = config?.agents?.defaults || {};
  const list = Array.isArray(config?.agents?.list) ? config.agents.list : [];
  const sisters = [];
  for (const item of list) {
    if (!item || !item.id) continue;
    const workspace = String(item.workspace || defaults.workspace || "").trim();
    if (!workspace) continue;
    const identity = await readIdentity(workspace);
    const fallbackName = String(item.name || item.id);
    const name = identity ? extractHeading(identity.content, fallbackName) : fallbackName;
    const tools = Array.isArray(item.tools?.alsoAllow) && item.tools.alsoAllow.length
      ? item.tools.alsoAllow.map(String)
      : (Array.isArray(defaults.tools?.alsoAllow) ? defaults.tools.alsoAllow.map(String) : undefined);
    const key = normalize(workspace);
    sisters.push({
      key,
      id: String(item.id),
      name,
      workspace: normalize(workspace),
      sourcePath: identity?.sourcePath || normalize(path.join(rootPath, "openclaw.json")),
      promptBody: identity?.content || `workspace: ${workspace}\nidentity: missing`,
      model: String(item.model?.primary || defaults.model?.primary || "").trim() || undefined,
      tools,
    });
  }
  return sisters;
}

async function discoverSisterDirectories(existing) {
  const byKey = new Map(existing.map((s) => [s.key, s]));
  const roots = [
    path.join(rootPath, "workspace", "sisters"),
    path.join(rootPath, "sisters"),
    path.join(rootPath, "workspace", ".openclaw", "workspace", "sisters"),
  ];
  for (const root of roots) {
    for (const entry of await safeReadDir(root)) {
      if (!entry.isDirectory()) continue;
      const workspace = normalize(path.join(root, entry.name));
      if (byKey.has(workspace)) continue;
      const identity = await readIdentity(workspace);
      const inferredName = identity
        ? extractHeading(identity.content, titleCase(entry.name.replace(/^sai[-_]/i, "")))
        : titleCase(entry.name.replace(/^sai[-_]/i, ""));
      byKey.set(workspace, {
        key: workspace,
        id: entry.name,
        name: inferredName,
        workspace,
        sourcePath: identity?.sourcePath || workspace,
        promptBody: identity?.content || `workspace: ${workspace}\nidentity: missing`,
      });
    }
  }
  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));
}

async function collectTools(config, sisters) {
  const set = new Set();
  const defaults = config?.agents?.defaults;
  for (const tool of defaults?.tools?.alsoAllow || []) {
    const value = String(tool || "").trim();
    if (value) set.add(value);
  }
  for (const agent of config?.agents?.list || []) {
    for (const tool of agent?.tools?.alsoAllow || []) {
      const value = String(tool || "").trim();
      if (value) set.add(value);
    }
  }
  for (const sister of sisters) {
    for (const tool of sister.tools || []) {
      const value = String(tool || "").trim();
      if (value) set.add(value);
    }
  }
  const toolRoots = [
    path.join(rootPath, "workspace", "tools"),
    path.join(rootPath, "tools"),
  ];
  for (const root of toolRoots) {
    for (const entry of await safeReadDir(root)) {
      if (entry.isDirectory()) {
        if (isRealToolName(entry.name)) set.add(entry.name);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!/\.(py|js|ts|sh)$/i.test(entry.name)) continue;
      const normalized = entry.name.replace(/\.(py|js|ts|sh)$/i, "");
      if (isRealToolName(normalized)) set.add(normalized);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

async function collectSkills(config, sisters) {
  const skills = [];
  const seen = new Set();
  const pushSkill = async (skillsDir) => {
    for (const entry of await safeReadDir(skillsDir)) {
      if (!entry.isDirectory()) continue;
      const file = path.join(skillsDir, entry.name, "SKILL.md");
      if (!(await safeExists(file))) continue;
      const sourcePath = normalize(file);
      if (seen.has(sourcePath)) continue;
      seen.add(sourcePath);
      const raw = await safeReadText(file);
      const parsed = extractFrontmatterNameAndDescription(raw, titleCase(entry.name));
      skills.push({
        id: hashId(sourcePath),
        name: parsed.name,
        description: parsed.description,
        sourcePath,
      });
    }
  };

  await pushSkill(path.join(rootPath, "skills"));
  await pushSkill(path.join(rootPath, "workspace", "skills"));

  const defaultsWorkspace = String(config?.agents?.defaults?.workspace || "").trim();
  for (const agent of config?.agents?.list || []) {
    const workspace = String(agent?.workspace || defaultsWorkspace).trim();
    if (!workspace) continue;
    await pushSkill(path.join(workspace, "skills"));
  }
  for (const sister of sisters) {
    if (!sister.workspace) continue;
    await pushSkill(path.join(sister.workspace, "skills"));
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

async function main() {
  const baseCatalog = {
    generatedAt: new Date().toISOString(),
    rootPath: normalize(rootPath),
    sisters: [],
    skills: [],
    tools: [],
  };

  if (!(await safeExists(rootPath))) {
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, JSON.stringify(baseCatalog, null, 2));
    return;
  }

  const configPath = path.join(rootPath, "openclaw.json");
  const configRaw = await safeReadText(configPath);
  let config = null;
  try {
    config = configRaw ? JSON.parse(configRaw) : null;
  } catch {
    config = null;
  }

  const configured = await discoverConfiguredAgents(config);
  const sisters = await discoverSisterDirectories(configured);
  const tools = await collectTools(config, sisters);
  const skills = await collectSkills(config, sisters);

  const catalog = {
    generatedAt: new Date().toISOString(),
    rootPath: normalize(rootPath),
    sisters,
    skills,
    tools,
  };

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(catalog, null, 2));
}

main().catch(async () => {
  const fallback = {
    generatedAt: new Date().toISOString(),
    rootPath: normalize(rootPath),
    sisters: [],
    skills: [],
    tools: [],
  };
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(fallback, null, 2));
});
