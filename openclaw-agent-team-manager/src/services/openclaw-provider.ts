import { exists, readDir, readTextFile } from "@tauri-apps/plugin-fs";
import type { AuiNode } from "@/types/aui-node";
import type { AgentConfig } from "@/types/agent";
import { generateNodeId, join, titleCase } from "@/utils/paths";
import { loadOpenClawCatalogFallback } from "./openclaw-catalog-fallback";
import type { ProviderMode } from "./app-settings";

const SISTER_IDENTITY_FILES = ["IDENTITY.md", "SOUL.md", "AGENTS.md"] as const;

const ONLINE_DASHBOARDS = [
  { name: "Colosseum Dashboard", url: "https://colosseum-dashboard.vercel.app" },
  { name: "HITL Human Guide", url: "https://hitl-human-guide.vercel.app" },
  { name: "HITL Dashboard", url: "https://hitl-dashboard-kappa.vercel.app" },
  { name: "Zone Action Sprint", url: "https://zone-action-sprint.vercel.app" },
  { name: "Recovery Colosseum", url: "https://recovery-colosseum.vercel.app" },
  { name: "Recovery Pipeline", url: "https://recovery-pipeline.vercel.app" },
  { name: "Come Get Me", url: "https://come-get-me.vercel.app" },
  { name: "Marketing Report", url: "https://reports-puce-tau.vercel.app" },
  { name: "Genesis Forge", url: "https://www.genesisforgeofheroes.ai" },
  { name: "SAI Dashboards", url: "https://sai-dashboards.vercel.app" },
  { name: "ROI Calculator", url: "https://roi-calculator-app-ashy.vercel.app" },
  { name: "Genesis Admin", url: "https://genesis-admin.vercel.app" },
  { name: "Presentations", url: "https://presentations-sable.vercel.app" },
  { name: "New Athena Test", url: "https://new-athena-test.vercel.app" },
];

interface OpenClawAgentItem {
  id: string;
  name?: string;
  workspace?: string;
  model?: { primary?: string };
  tools?: { alsoAllow?: string[] };
}

interface OpenClawConfig {
  meta?: {
    lastTouchedVersion?: string;
    lastTouchedAt?: string;
  };
  acp?: {
    enabled?: boolean;
    defaultAgent?: string;
    allowedAgents?: string[];
  };
  agents?: {
    defaults?: {
      workspace?: string;
      model?: { primary?: string };
      tools?: { alsoAllow?: string[] };
    };
    list?: OpenClawAgentItem[];
  };
}

type OpenClawAgentDefaults = NonNullable<NonNullable<OpenClawConfig["agents"]>["defaults"]>;

interface DiscoveredSister {
  key: string;
  id: string;
  name: string;
  workspace: string;
  sourcePath: string;
  promptBody: string;
  model?: string;
  tools?: string[];
}

interface OpenClawContext {
  rootPath: string;
  config: OpenClawConfig | null;
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeFsPath(path: string): string {
  return String(path || "").replace(/\\/g, "/").replace(/\/+$/g, "");
}

function parentPath(path: string): string | null {
  const normalized = normalizeFsPath(path);
  if (!normalized) return null;
  const isAbs = normalized.startsWith("/");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length <= 1) return isAbs ? "/" : null;
  parts.pop();
  return `${isAbs ? "/" : ""}${parts.join("/")}`;
}

function extractIdentityName(content: string, fallback: string): string {
  const lines = String(content || "").split("\n").map((line) => line.trim()).filter(Boolean);
  const heading = lines.find((line) => line.startsWith("#"));
  if (heading) {
    const raw = heading.replace(/^#+\s*/, "").trim();
    const cleaned = raw
      .replace(/^identity\.md\s*[-:–—]\s*/i, "")
      .replace(/^identity\s*[-:–—]\s*/i, "")
      .trim();
    if (/^who am i\??$/i.test(cleaned)) return fallback;
    return cleaned || fallback;
  }
  return fallback;
}

function isRealToolName(name: string): boolean {
  const value = String(name || "").trim();
  if (!value) return false;
  if (value.startsWith(".")) return false;
  const lowered = value.toLowerCase();
  if (lowered === "__pycache__" || lowered === "node_modules" || lowered === "dist" || lowered === "build") return false;
  return true;
}

async function listChildDirectories(root: string): Promise<string[]> {
  if (!root || !(await safeExists(root))) return [];
  try {
    const entries = await readDir(root);
    return entries.filter((entry) => entry.isDirectory && !!entry.name).map((entry) => entry.name);
  } catch {
    return [];
  }
}

export async function resolveOpenClawRoot(projectPath: string): Promise<string | null> {
  const start = normalizeFsPath(projectPath);
  if (!start) return null;

  const checked = new Set<string>();
  const candidates = [start, join(start, ".openclaw")];

  const hasConfig = async (root: string) => {
    const normalized = normalizeFsPath(root);
    if (!normalized || checked.has(normalized)) return false;
    checked.add(normalized);
    return safeExists(join(normalized, "openclaw.json"));
  };

  for (const candidate of candidates) {
    if (await hasConfig(candidate)) {
      return normalizeFsPath(candidate);
    }
  }

  let cursor = start;
  for (let i = 0; i < 8; i++) {
    const parent = parentPath(cursor);
    if (!parent || parent === cursor) break;
    if (await hasConfig(parent)) return normalizeFsPath(parent);
    const nested = join(parent, ".openclaw");
    if (await hasConfig(nested)) return normalizeFsPath(nested);
    cursor = parent;
  }
  return null;
}

async function resolveOpenClawContext(projectPath: string): Promise<OpenClawContext | null> {
  const rootPath = await resolveOpenClawRoot(projectPath);
  if (!rootPath) {
    const fallback = await loadOpenClawCatalogFallback();
    if (fallback?.rootPath) {
      return { rootPath: fallback.rootPath, config: null };
    }
    return null;
  }
  const configPath = join(rootPath, "openclaw.json");
  if (!(await safeExists(configPath))) return { rootPath, config: null };
  let raw = "";
  try {
    raw = await readTextFile(configPath);
  } catch {
    return { rootPath, config: null };
  }
  return {
    rootPath,
    config: safeJsonParse<OpenClawConfig>(raw),
  };
}

function toSisterDisplayName(agent: OpenClawAgentItem): string {
  return String(agent.name || agent.id || "").trim() || "sister";
}

function toAgentConfig(agent: OpenClawAgentItem, defaults?: OpenClawAgentDefaults): AgentConfig {
  const fallbackTools = Array.isArray(defaults?.tools?.alsoAllow) ? defaults?.tools?.alsoAllow : undefined;
  return {
    name: toSisterDisplayName(agent),
    description: `OpenClaw sister agent: ${agent.id}`,
    model: String(agent.model?.primary || defaults?.model?.primary || "").trim() || undefined,
    tools: Array.isArray(agent.tools?.alsoAllow) && agent.tools?.alsoAllow.length
      ? agent.tools?.alsoAllow
      : fallbackTools,
  };
}

async function readIdentityForWorkspace(workspacePath: string): Promise<{ sourcePath: string; content: string } | null> {
  for (const file of SISTER_IDENTITY_FILES) {
    const fullPath = join(workspacePath, file);
    if (!(await safeExists(fullPath))) continue;
    let content = "";
    try {
      content = await readTextFile(fullPath);
    } catch {
      continue;
    }
    return { sourcePath: fullPath, content };
  }
  return null;
}

function summarySlice(text: string, max = 8000): string {
  const normalized = String(text || "").trim();
  if (!normalized) return "";
  return normalized.slice(0, max);
}

function syntheticNodeBase(idSeed: string): Pick<AuiNode, "id" | "lastModified" | "validationErrors" | "assignedSkills" | "variables" | "launchPrompt" | "pipelineSteps"> {
  return {
    id: generateNodeId(idSeed),
    lastModified: Date.now(),
    validationErrors: [],
    assignedSkills: [],
    variables: [],
    launchPrompt: "",
    pipelineSteps: [],
  };
}

async function collectWorkspaceToolIds(workspacePath: string): Promise<string[]> {
  const toolsDir = join(workspacePath, "tools");
  if (!(await safeExists(toolsDir))) return [];
  const items = new Set<string>();
  try {
    const entries = await readDir(toolsDir);
    for (const entry of entries) {
      const name = String(entry.name || "").trim();
      if (!isRealToolName(name)) continue;
      if (entry.isDirectory) {
        items.add(name);
        continue;
      }
      if (entry.isFile && /\.(py|js|ts|sh)$/i.test(name)) {
        items.add(name.replace(/\.(py|js|ts|sh)$/i, ""));
      }
    }
  } catch {
    return [];
  }
  return Array.from(items).sort((a, b) => a.localeCompare(b));
}

async function discoverSisters(projectPath: string): Promise<DiscoveredSister[]> {
  const context = await resolveOpenClawContext(projectPath);
  const rootPath = context?.rootPath;
  const config = context?.config;
  if (!rootPath) {
    const fallback = await loadOpenClawCatalogFallback();
    return (fallback?.sisters || []).map((row) => ({
      key: row.key || normalizeFsPath(row.workspace),
      id: row.id || row.name,
      name: row.name || titleCase(String(row.id || "sister")),
      workspace: row.workspace,
      sourcePath: row.sourcePath || row.workspace,
      promptBody: row.promptBody || "",
      model: row.model,
      tools: row.tools,
    }));
  }
  const defaults = config?.agents?.defaults;
  const list = (config?.agents?.list || []).filter((item) => item?.id);
  const byKey = new Map<string, DiscoveredSister>();

  for (const agent of list) {
    const workspace = String(agent.workspace || defaults?.workspace || "").trim();
    if (!workspace) continue;
    const identity = await readIdentityForWorkspace(workspace);
    const fallbackName = toSisterDisplayName(agent);
    const name = identity ? extractIdentityName(identity.content, fallbackName) : fallbackName;
    const tools = Array.isArray(agent.tools?.alsoAllow) && agent.tools?.alsoAllow.length
      ? agent.tools?.alsoAllow
      : (Array.isArray(defaults?.tools?.alsoAllow) ? defaults.tools.alsoAllow : undefined);
    const key = normalizeFsPath(workspace) || `agent:${agent.id}`;
    byKey.set(key, {
      key,
      id: agent.id,
      name,
      workspace,
      sourcePath: identity?.sourcePath || join(rootPath, "openclaw.json"),
      promptBody: identity ? summarySlice(identity.content) : `workspace: ${workspace}\nidentity: missing`,
      model: String(agent.model?.primary || defaults?.model?.primary || "").trim() || undefined,
      tools,
    });
  }

  // Additional sister directories that may not be listed in openclaw.json.
  const sisterRoots = [
    join(rootPath, "workspace", "sisters"),
    join(rootPath, "sisters"),
    join(rootPath, "workspace", ".openclaw", "workspace", "sisters"),
  ];

  for (const root of sisterRoots) {
    const dirNames = await listChildDirectories(root);
    for (const dirName of dirNames) {
      const workspace = join(root, dirName);
      const key = normalizeFsPath(workspace);
      const existing = byKey.get(key);
      const identity = await readIdentityForWorkspace(workspace);
      if (existing) {
        if (identity) {
          existing.sourcePath = identity.sourcePath;
          existing.promptBody = summarySlice(identity.content);
          existing.name = extractIdentityName(identity.content, existing.name);
        }
        if (!existing.tools || existing.tools.length === 0) {
          const fromWorkspace = await collectWorkspaceToolIds(workspace);
          if (fromWorkspace.length > 0) existing.tools = fromWorkspace;
        }
        continue;
      }

      const baseName = titleCase(dirName.replace(/^sai[-_]/i, ""));
      const inferredName = identity ? extractIdentityName(identity.content, baseName) : baseName;
      const inferredTools = await collectWorkspaceToolIds(workspace);
      byKey.set(key, {
        key,
        id: dirName,
        name: inferredName,
        workspace,
        sourcePath: identity?.sourcePath || workspace,
        promptBody: identity ? summarySlice(identity.content) : `workspace: ${workspace}\nidentity: missing`,
        tools: inferredTools.length > 0 ? inferredTools : undefined,
      });
    }
  }

  if (byKey.size === 0) {
    const fallback = await loadOpenClawCatalogFallback();
    for (const row of fallback?.sisters || []) {
      const key = row.key || normalizeFsPath(row.workspace) || row.id;
      if (!key || byKey.has(key)) continue;
      byKey.set(key, {
        key,
        id: row.id || row.name,
        name: row.name || titleCase(String(row.id || "sister")),
        workspace: row.workspace,
        sourcePath: row.sourcePath || row.workspace,
        promptBody: row.promptBody || "",
        model: row.model,
        tools: row.tools,
      });
    }
  }

  return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function inferWorkspaceEntityType(dirName: string): string {
  const value = String(dirName || "").toLowerCase();
  if (value.includes("dashboard")) return "dashboard";
  if (value.includes("report")) return "reporting";
  if (value.includes("recovery")) return "recovery";
  if (value.includes("sister")) return "sister-workspace";
  if (value.includes("skill")) return "skill-pack";
  if (value.includes("tool")) return "tooling";
  if (value.includes("presentation")) return "presentation";
  if (value.includes("colosseum")) return "battle-domain";
  return "workspace";
}

export async function detectProviderMode(projectPath: string): Promise<ProviderMode> {
  if (await resolveOpenClawRoot(projectPath)) return "openclaw";
  const fallback = await loadOpenClawCatalogFallback();
  return fallback ? "openclaw" : "claude";
}

export async function buildOpenClawSisterNodes(projectPath: string): Promise<AuiNode[]> {
  const sisters = await discoverSisters(projectPath);
  const nodes: AuiNode[] = [];

  for (const sister of sisters) {
    nodes.push({
      ...syntheticNodeBase(`openclaw:sister:${sister.key}`),
      id: generateNodeId(`openclaw:sister:${sister.key}`),
      name: sister.name,
      kind: "agent",
      parentId: "root",
      team: "openclaw-sisters",
      sourcePath: sister.sourcePath,
      config: {
        name: sister.name,
        description: `OpenClaw sister agent: ${sister.id}`,
        model: sister.model,
        tools: sister.tools,
      },
      promptBody: sister.promptBody,
      tags: ["openclaw", "sister", sister.id],
    });
  }

  return nodes.sort((a, b) => a.name.localeCompare(b.name));
}

export async function buildOpenClawEntityNodes(projectPath: string): Promise<AuiNode[]> {
  const nodes: AuiNode[] = [];
  const context = await resolveOpenClawContext(projectPath);
  const rootPath = context?.rootPath || projectPath;
  const config = context?.config;
  const workspaceRoot = join(rootPath, "workspace");
  const entityRootId = generateNodeId("openclaw:entities:root");
  const runtimeConfigId = generateNodeId("openclaw:entities:runtime-config");
  const sisterRegistryId = generateNodeId("openclaw:entities:sister-registry");
  const workspaceCatalogId = generateNodeId("openclaw:entities:workspaces");
  const dashboardsId = generateNodeId("openclaw:entities:dashboards");
  const beingsSnapshotId = generateNodeId("openclaw:entities:beings-snapshot");
  nodes.push({
    ...syntheticNodeBase("openclaw:entities:root"),
    id: entityRootId,
    name: "OpenClaw Entities",
    kind: "context",
    parentId: "root",
    team: null,
    sourcePath: join(rootPath, "openclaw.json"),
    config: null,
    promptBody: "Synthetic OpenClaw entity catalog generated from local workspace state.",
    tags: ["openclaw", "entities", "entity-type:catalog-root"],
  });

  const defaults = config?.agents?.defaults;
  const sisters = (config?.agents?.list || []).filter((item) => item?.id);
  nodes.push({
    ...syntheticNodeBase("openclaw:entities:runtime-config"),
    id: runtimeConfigId,
    name: "Runtime Configuration",
    kind: "context",
    parentId: entityRootId,
    team: null,
    sourcePath: join(rootPath, "openclaw.json"),
    config: null,
    promptBody: [
      `openclaw_version: ${String(config?.meta?.lastTouchedVersion || "-")}`,
      `last_touched_at: ${String(config?.meta?.lastTouchedAt || "-")}`,
      `acp_enabled: ${String(config?.acp?.enabled ?? "-")}`,
      `acp_default_agent: ${String(config?.acp?.defaultAgent || "-")}`,
      `acp_allowed_agents: ${(config?.acp?.allowedAgents || []).join(", ") || "-"}`,
      `sisters_total: ${String(sisters.length)}`,
      `default_workspace: ${String(defaults?.workspace || "-")}`,
      `default_model: ${String(defaults?.model?.primary || "-")}`,
      `default_tools_count: ${String(defaults?.tools?.alsoAllow?.length || 0)}`,
    ].join("\n"),
    tags: ["openclaw", "entities", "entity-type:runtime-config"],
  });

  nodes.push({
    ...syntheticNodeBase("openclaw:entities:sister-registry"),
    id: sisterRegistryId,
    name: "Sister Registry",
    kind: "context",
    parentId: entityRootId,
    team: null,
    sourcePath: join(rootPath, "openclaw.json"),
    config: null,
    promptBody: sisters.length > 0
      ? sisters.map((sister) => {
          const workspace = String(sister.workspace || defaults?.workspace || "-");
          const model = String(sister.model?.primary || defaults?.model?.primary || "-");
          const toolCount = Array.isArray(sister.tools?.alsoAllow) && sister.tools?.alsoAllow.length
            ? sister.tools?.alsoAllow.length
            : (defaults?.tools?.alsoAllow?.length || 0);
          return `- ${toSisterDisplayName(sister)} [${sister.id}] | model: ${model} | tools: ${toolCount} | workspace: ${workspace}`;
        }).join("\n")
      : "No sister agents found in openclaw.json",
    tags: ["openclaw", "entities", "entity-type:sister-registry"],
  });

  nodes.push({
    ...syntheticNodeBase("openclaw:entities:workspaces"),
    id: workspaceCatalogId,
    name: "Workspace Catalog",
    kind: "context",
    parentId: entityRootId,
    team: null,
    sourcePath: workspaceRoot,
    config: null,
    promptBody: `Workspace root: ${workspaceRoot}`,
    tags: ["openclaw", "workspace-catalog", "entity-type:workspace-catalog"],
  });

  if (await safeExists(workspaceRoot)) {
    try {
      const entries = await readDir(workspaceRoot);
      const dirs = entries
        .filter((entry) => entry.isDirectory)
        .map((entry) => entry.name)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 160);

      for (const dirName of dirs) {
        const p = join(workspaceRoot, dirName);
        const entityType = inferWorkspaceEntityType(dirName);
        nodes.push({
          ...syntheticNodeBase(`openclaw:workspace:${dirName}`),
          name: titleCase(dirName),
          kind: "context",
          parentId: workspaceCatalogId,
          team: null,
          sourcePath: p,
          config: null,
          promptBody: `entity_type: ${entityType}\nworkspace: ${dirName}\npath: ${p}`,
          tags: ["openclaw", "workspace-entity", dirName, `entity-type:${entityType}`],
        });
      }
    } catch {
      // Ignore workspace catalog read failures.
    }
  }

  nodes.push({
    ...syntheticNodeBase("openclaw:entities:dashboards"),
    id: dashboardsId,
    name: "SAI Online Dashboards",
    kind: "context",
    parentId: entityRootId,
    team: null,
    sourcePath: join(rootPath, "openclaw.json"),
    config: null,
    promptBody: ONLINE_DASHBOARDS.map((item) => `- ${item.name}: ${item.url}`).join("\n"),
    tags: ["openclaw", "dashboards", "entity-type:dashboards"],
  });

  for (const item of ONLINE_DASHBOARDS) {
    nodes.push({
      ...syntheticNodeBase(`openclaw:dashboard:${item.name}`),
      name: item.name,
      kind: "context",
      parentId: dashboardsId,
      team: null,
      sourcePath: join(rootPath, "openclaw.json"),
      config: null,
      promptBody: `entity_type: dashboard\nurl: ${item.url}`,
      tags: ["openclaw", "dashboard", "entity-type:dashboard", `entity-url:${item.url}`],
    });
  }

  const snapshotPath = join(workspaceRoot, "colosseum-dashboard", "data", "main_colosseum.json");
  let beingsPrompt = `Snapshot path: ${snapshotPath}\nstatus: unavailable`;
  if (await safeExists(snapshotPath)) {
    try {
      const raw = await readTextFile(snapshotPath);
      const parsed = safeJsonParse<{ stats?: Record<string, unknown>; generated_at?: string }>(raw);
      const stats = parsed?.stats || {};
      beingsPrompt = [
        `Snapshot path: ${snapshotPath}`,
        `generated_at: ${String(parsed?.generated_at || "-")}`,
        `total_beings: ${String(stats.total_beings || "-")}`,
        `total_battles: ${String(stats.total_battles || "-")}`,
        `max_generation: ${String(stats.max_generation || "-")}`,
        `total_tournaments: ${String(stats.total_tournaments || "-")}`,
      ].join("\n");
    } catch {
      // Keep unavailable prompt.
    }
  }

  nodes.push({
    ...syntheticNodeBase("openclaw:entities:beings-snapshot"),
    id: beingsSnapshotId,
    name: "Beings Snapshot",
    kind: "context",
    parentId: entityRootId,
    team: null,
    sourcePath: snapshotPath,
    config: null,
    promptBody: beingsPrompt,
    tags: ["openclaw", "beings", "snapshot", "entity-type:beings-snapshot"],
  });

  return nodes;
}

export interface OpenClawCatalogAgent {
  id: string;
  name: string;
  description: string;
  sourcePath: string;
  model?: string;
  tools?: string[];
}

export async function listOpenClawCatalogAgents(projectPath: string): Promise<OpenClawCatalogAgent[]> {
  const items = (await discoverSisters(projectPath)).map((sister) => ({
    id: generateNodeId(`openclaw:sister:${sister.key}`),
    name: sister.name,
    description: `OpenClaw sister (${sister.id})${sister.workspace ? ` • ${sister.workspace}` : ""}`,
    sourcePath: sister.sourcePath,
    model: sister.model,
    tools: sister.tools,
  }));

  return items.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listOpenClawToolIds(projectPath: string): Promise<string[]> {
  const set = new Set<string>();
  const context = await resolveOpenClawContext(projectPath);
  const rootPath = context?.rootPath || projectPath;
  const config = context?.config;
  const defaults = config?.agents?.defaults;

  const collectTools = (tools?: string[]) => {
    if (!Array.isArray(tools)) return;
    for (const tool of tools) {
      const value = String(tool || "").trim();
      if (value) set.add(value);
    }
  };

  collectTools(defaults?.tools?.alsoAllow);
  for (const agent of config?.agents?.list || []) {
    collectTools(agent.tools?.alsoAllow);
  }

  const explicitToolRoots = [
    join(rootPath, "workspace", "tools"),
    join(rootPath, "tools"),
  ];
  for (const root of explicitToolRoots) {
    if (!(await safeExists(root))) continue;
    try {
      const entries = await readDir(root);
      for (const entry of entries) {
        const name = String(entry.name || "").trim();
        if (!isRealToolName(name)) continue;
        if (entry.isDirectory) {
          set.add(name);
        } else if (entry.isFile && /\.(py|js|ts|sh)$/i.test(name)) {
          set.add(name.replace(/\.(py|js|ts|sh)$/i, ""));
        }
      }
    } catch {
      // Ignore tool folder read issues.
    }
  }

  const discoveredSisters = await discoverSisters(projectPath);
  for (const sister of discoveredSisters) {
    collectTools(sister.tools);
  }

  if (set.size === 0) {
    const fallback = await loadOpenClawCatalogFallback();
    for (const tool of fallback?.tools || []) {
      const value = String(tool || "").trim();
      if (value) set.add(value);
    }
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

async function safeExists(path: string): Promise<boolean> {
  try {
    return await exists(path);
  } catch {
    return false;
  }
}
