export interface ElevenLabsBeing {
  id: string;
  name: string;
  type: "custom" | "cloned" | "generated" | "premade";
  description: string;
  voiceId?: string;
  domain: string;
  knowledgeVectors?: number;
  status: string;
}

export interface PineconeIndex {
  id: string;
  name: string;
  vectors: number;
  dimensions?: number;
  metric?: string;
  model?: string;
  description: string;
  namespaces?: string[];
}

export interface SharedVoiceAgent {
  agentId: string;
  purpose: string;
  sisters: string[];
}

export interface BeingsRegistry {
  generatedAt: string;
  elevenLabsBeings: ElevenLabsBeing[];
  pineconeIndexes: {
    primary: PineconeIndex[];
    strata: PineconeIndex[];
  };
  sharedVoiceAgent: SharedVoiceAgent | null;
}

let cachedRegistry: BeingsRegistry | null = null;

function normalizeRegistry(raw: unknown): BeingsRegistry | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;

  const beings = Array.isArray(obj.elevenLabsBeings) ? obj.elevenLabsBeings : [];
  const indexes = (obj.pineconeIndexes || {}) as Record<string, unknown>;
  const primary = Array.isArray(indexes.primary) ? indexes.primary : [];
  const strata = Array.isArray(indexes.strata) ? indexes.strata : [];
  const agent = (obj.sharedVoiceAgent || null) as Record<string, unknown> | null;

  return {
    generatedAt: String(obj.generatedAt || ""),
    elevenLabsBeings: beings.map((item) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        id: String(row.id || ""),
        name: String(row.name || ""),
        type: String(row.type || "custom") as ElevenLabsBeing["type"],
        description: String(row.description || ""),
        voiceId: row.voiceId ? String(row.voiceId) : undefined,
        domain: String(row.domain || ""),
        knowledgeVectors: typeof row.knowledgeVectors === "number" ? row.knowledgeVectors : undefined,
        status: String(row.status || "unknown"),
      };
    }).filter((item) => item.id),
    pineconeIndexes: {
      primary: primary.map((item) => {
        const row = (item || {}) as Record<string, unknown>;
        return {
          id: String(row.id || ""),
          name: String(row.name || ""),
          vectors: typeof row.vectors === "number" ? row.vectors : 0,
          dimensions: typeof row.dimensions === "number" ? row.dimensions : undefined,
          metric: row.metric ? String(row.metric) : undefined,
          model: row.model ? String(row.model) : undefined,
          description: String(row.description || ""),
          namespaces: Array.isArray(row.namespaces) ? row.namespaces.map(String) : undefined,
        };
      }).filter((item) => item.id),
      strata: strata.map((item) => {
        const row = (item || {}) as Record<string, unknown>;
        return {
          id: String(row.id || ""),
          name: String(row.name || ""),
          vectors: typeof row.vectors === "number" ? row.vectors : 0,
          dimensions: typeof row.dimensions === "number" ? row.dimensions : undefined,
          metric: row.metric ? String(row.metric) : undefined,
          model: row.model ? String(row.model) : undefined,
          description: String(row.description || ""),
          namespaces: Array.isArray(row.namespaces) ? row.namespaces.map(String) : undefined,
        };
      }).filter((item) => item.id),
    },
    sharedVoiceAgent: agent ? {
      agentId: String(agent.agentId || ""),
      purpose: String(agent.purpose || ""),
      sisters: Array.isArray(agent.sisters) ? agent.sisters.map(String) : [],
    } : null,
  };
}

export async function loadBeingsRegistry(force = false): Promise<BeingsRegistry | null> {
  if (!force && cachedRegistry) return cachedRegistry;
  try {
    const response = await fetch(`/beings-registry.json?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return cachedRegistry;
    const parsed = normalizeRegistry(await response.json());
    if (!parsed) return cachedRegistry;
    cachedRegistry = parsed;
    return parsed;
  } catch {
    return cachedRegistry;
  }
}
