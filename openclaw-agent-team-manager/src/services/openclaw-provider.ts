import { exists, readDir, readTextFile } from "@tauri-apps/plugin-fs";
import type { AuiNode } from "@/types/aui-node";
import type { AgentConfig } from "@/types/agent";
import { generateNodeId, join, titleCase } from "@/utils/paths";
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

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function loadOpenClawConfig(projectPath: string): Promise<OpenClawConfig | null> {
  const configPath = join(projectPath, "openclaw.json");
  if (!(await exists(configPath))) return null;
  const raw = await readTextFile(configPath);
  return safeJsonParse<OpenClawConfig>(raw);
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
    if (!(await exists(fullPath))) continue;
    const content = await readTextFile(fullPath);
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
  return (await exists(join(projectPath, "openclaw.json"))) ? "openclaw" : "claude";
}

export async function buildOpenClawSisterNodes(projectPath: string): Promise<AuiNode[]> {
  const config = await loadOpenClawConfig(projectPath);
  const list = (config?.agents?.list || []).filter((item) => item?.id);
  const defaults = config?.agents?.defaults;
  const nodes: AuiNode[] = [];

  for (const agent of list) {
    const workspace = String(agent.workspace || defaults?.workspace || "").trim();
    const identity = workspace ? await readIdentityForWorkspace(workspace) : null;
    const sourcePath = identity?.sourcePath || join(projectPath, "openclaw.json");
    const promptBody = identity
      ? summarySlice(identity.content)
      : `No identity profile file found in workspace.\n\nworkspace: ${workspace || "(unset)"}`;

    nodes.push({
      ...syntheticNodeBase(`openclaw:sister:${agent.id}`),
      name: toSisterDisplayName(agent),
      kind: "agent",
      parentId: "root",
      team: "openclaw-sisters",
      sourcePath,
      config: toAgentConfig(agent, defaults),
      promptBody,
      tags: ["openclaw", "sister", agent.id],
    });
  }

  return nodes.sort((a, b) => a.name.localeCompare(b.name));
}

export async function buildOpenClawEntityNodes(projectPath: string): Promise<AuiNode[]> {
  const nodes: AuiNode[] = [];
  const workspaceRoot = join(projectPath, "workspace");
  const entityRootId = generateNodeId("openclaw:entities:root");
  const runtimeConfigId = generateNodeId("openclaw:entities:runtime-config");
  const sisterRegistryId = generateNodeId("openclaw:entities:sister-registry");
  const workspaceCatalogId = generateNodeId("openclaw:entities:workspaces");
  const dashboardsId = generateNodeId("openclaw:entities:dashboards");
  const beingsSnapshotId = generateNodeId("openclaw:entities:beings-snapshot");
  const config = await loadOpenClawConfig(projectPath);

  nodes.push({
    ...syntheticNodeBase("openclaw:entities:root"),
    id: entityRootId,
    name: "OpenClaw Entities",
    kind: "context",
    parentId: "root",
    team: null,
    sourcePath: join(projectPath, "openclaw.json"),
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
    sourcePath: join(projectPath, "openclaw.json"),
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
    sourcePath: join(projectPath, "openclaw.json"),
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

  if (await exists(workspaceRoot)) {
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
    sourcePath: join(projectPath, "openclaw.json"),
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
      sourcePath: join(projectPath, "openclaw.json"),
      config: null,
      promptBody: `entity_type: dashboard\nurl: ${item.url}`,
      tags: ["openclaw", "dashboard", "entity-type:dashboard", `entity-url:${item.url}`],
    });
  }

  const snapshotPath = join(workspaceRoot, "colosseum-dashboard", "data", "main_colosseum.json");
  let beingsPrompt = `Snapshot path: ${snapshotPath}\nstatus: unavailable`;
  if (await exists(snapshotPath)) {
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
  const config = await loadOpenClawConfig(projectPath);
  const list = (config?.agents?.list || []).filter((item) => item?.id);
  const defaults = config?.agents?.defaults;

  const items = list.map((agent) => {
    const workspace = String(agent.workspace || defaults?.workspace || "").trim();
    const tools = Array.isArray(agent.tools?.alsoAllow) && agent.tools?.alsoAllow.length
      ? agent.tools?.alsoAllow
      : (Array.isArray(defaults?.tools?.alsoAllow) ? defaults.tools?.alsoAllow : undefined);

    return {
      id: generateNodeId(`openclaw:sister:${agent.id}`),
      name: toSisterDisplayName(agent),
      description: `OpenClaw sister (${agent.id})${workspace ? ` • ${workspace}` : ""}`,
      sourcePath: workspace || join(projectPath, "openclaw.json"),
      model: String(agent.model?.primary || defaults?.model?.primary || "").trim() || undefined,
      tools,
    };
  });

  return items.sort((a, b) => a.name.localeCompare(b.name));
}
