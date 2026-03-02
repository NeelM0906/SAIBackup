export interface OpenClawFallbackSister {
  key: string;
  id: string;
  name: string;
  workspace: string;
  sourcePath: string;
  promptBody: string;
  model?: string;
  tools?: string[];
}

export interface OpenClawFallbackSkill {
  id: string;
  name: string;
  description: string;
  sourcePath: string;
}

export interface OpenClawFallbackCatalog {
  generatedAt: string;
  rootPath: string;
  sisters: OpenClawFallbackSister[];
  skills: OpenClawFallbackSkill[];
  tools: string[];
}

let cachedCatalog: OpenClawFallbackCatalog | null = null;

function normalizeCatalog(raw: unknown): OpenClawFallbackCatalog | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const sisters = Array.isArray(obj.sisters) ? obj.sisters : [];
  const skills = Array.isArray(obj.skills) ? obj.skills : [];
  const tools = Array.isArray(obj.tools) ? obj.tools : [];
  return {
    generatedAt: String(obj.generatedAt || ""),
    rootPath: String(obj.rootPath || ""),
    sisters: sisters.map((item) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        key: String(row.key || ""),
        id: String(row.id || ""),
        name: String(row.name || ""),
        workspace: String(row.workspace || ""),
        sourcePath: String(row.sourcePath || ""),
        promptBody: String(row.promptBody || ""),
        model: row.model ? String(row.model) : undefined,
        tools: Array.isArray(row.tools) ? row.tools.map((v) => String(v)) : undefined,
      };
    }).filter((item) => item.key || item.workspace || item.id),
    skills: skills.map((item) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        id: String(row.id || ""),
        name: String(row.name || ""),
        description: String(row.description || ""),
        sourcePath: String(row.sourcePath || ""),
      };
    }).filter((item) => item.id && item.name),
    tools: tools.map((item) => String(item || "")).filter(Boolean),
  };
}

export async function loadOpenClawCatalogFallback(force = false): Promise<OpenClawFallbackCatalog | null> {
  if (!force && cachedCatalog) return cachedCatalog;
  try {
    const response = await fetch(`/openclaw-catalog.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return cachedCatalog;
    const parsed = normalizeCatalog(await response.json());
    if (!parsed) return cachedCatalog;
    cachedCatalog = parsed;
    return parsed;
  } catch {
    return cachedCatalog;
  }
}
