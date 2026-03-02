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

export interface OpenClawFallbackChannel {
  id: string;
  name: string;
  enabled: boolean;
  accountCount: number;
  groupPolicy?: string;
  streaming?: string;
}

export interface OpenClawFallbackBinding {
  agentId: string;
  channel: string;
  accountId: string;
}

export interface OpenClawFallbackPlugin {
  id: string;
  name: string;
  enabled: boolean;
}

export interface OpenClawFallbackSkillConfig {
  id: string;
  hasApiKey: boolean;
}

export interface OpenClawFallbackGateway {
  mode: string;
  bind: string;
  customBindHost?: string;
  authMode?: string;
}

export interface OpenClawFallbackMessagesConfig {
  ackReactionScope?: string | null;
  ttsAuto?: string | null;
  ttsProvider?: string | null;
  ttsVoiceId?: string | null;
  ttsModelId?: string | null;
}

export interface OpenClawFallbackSessionConfig {
  maxPingPongTurns?: number | null;
}

export interface OpenClawFallbackCommandsConfig {
  native?: string | null;
  nativeSkills?: string | null;
  restart?: boolean | null;
  ownerDisplay?: string | null;
}

export interface OpenClawFallbackAgentDefaults {
  heartbeat?: string | null;
  maxConcurrent?: number | null;
  subagentsMaxConcurrent?: number | null;
  compactionMode?: string | null;
  memorySearchEnabled?: boolean | null;
  contextPruningMode?: string | null;
  contextPruningTtl?: string | null;
}

export interface OpenClawFallbackAgentToAgent {
  enabled: boolean;
  allowList: string[];
}

export interface OpenClawFallbackCatalog {
  generatedAt: string;
  rootPath: string;
  sisters: OpenClawFallbackSister[];
  skills: OpenClawFallbackSkill[];
  tools: string[];
  channels?: OpenClawFallbackChannel[];
  bindings?: OpenClawFallbackBinding[];
  gateway?: OpenClawFallbackGateway | null;
  plugins?: OpenClawFallbackPlugin[];
  messagesConfig?: OpenClawFallbackMessagesConfig | null;
  sessionConfig?: OpenClawFallbackSessionConfig | null;
  commandsConfig?: OpenClawFallbackCommandsConfig | null;
  agentDefaults?: OpenClawFallbackAgentDefaults | null;
  skillsConfig?: OpenClawFallbackSkillConfig[];
  agentToAgent?: OpenClawFallbackAgentToAgent | null;
}

let cachedCatalog: OpenClawFallbackCatalog | null = null;

function normalizeCatalog(raw: unknown): OpenClawFallbackCatalog | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const sisters = Array.isArray(obj.sisters) ? obj.sisters : [];
  const skills = Array.isArray(obj.skills) ? obj.skills : [];
  const tools = Array.isArray(obj.tools) ? obj.tools : [];
  const channels = Array.isArray(obj.channels) ? obj.channels : [];
  const bindings = Array.isArray(obj.bindings) ? obj.bindings : [];
  const plugins = Array.isArray(obj.plugins) ? obj.plugins : [];
  const skillsConfig = Array.isArray(obj.skillsConfig) ? obj.skillsConfig : [];

  const gatewayRaw = obj.gateway && typeof obj.gateway === "object" && !Array.isArray(obj.gateway)
    ? obj.gateway as Record<string, unknown>
    : null;
  const messagesConfigRaw = obj.messagesConfig && typeof obj.messagesConfig === "object" && !Array.isArray(obj.messagesConfig)
    ? obj.messagesConfig as Record<string, unknown>
    : null;
  const sessionConfigRaw = obj.sessionConfig && typeof obj.sessionConfig === "object" && !Array.isArray(obj.sessionConfig)
    ? obj.sessionConfig as Record<string, unknown>
    : null;
  const commandsConfigRaw = obj.commandsConfig && typeof obj.commandsConfig === "object" && !Array.isArray(obj.commandsConfig)
    ? obj.commandsConfig as Record<string, unknown>
    : null;
  const agentDefaultsRaw = obj.agentDefaults && typeof obj.agentDefaults === "object" && !Array.isArray(obj.agentDefaults)
    ? obj.agentDefaults as Record<string, unknown>
    : null;
  const agentToAgentRaw = obj.agentToAgent && typeof obj.agentToAgent === "object" && !Array.isArray(obj.agentToAgent)
    ? obj.agentToAgent as Record<string, unknown>
    : null;

  const normalizedChannels = channels.map((item) => {
    const row = (item || {}) as Record<string, unknown>;
    return {
      id: String(row.id || ""),
      name: String(row.name || ""),
      enabled: Boolean(row.enabled),
      accountCount: Number(row.accountCount || 0),
      groupPolicy: row.groupPolicy ? String(row.groupPolicy) : undefined,
      streaming: row.streaming ? String(row.streaming) : undefined,
    };
  }).filter((item) => item.id);

  const normalizedBindings = bindings.map((item) => {
    const row = (item || {}) as Record<string, unknown>;
    return {
      agentId: String(row.agentId || ""),
      channel: String(row.channel || ""),
      accountId: String(row.accountId || ""),
    };
  }).filter((item) => item.agentId && item.channel && item.accountId);

  const normalizedPlugins = plugins.map((item) => {
    const row = (item || {}) as Record<string, unknown>;
    return {
      id: String(row.id || ""),
      name: String(row.name || ""),
      enabled: Boolean(row.enabled),
    };
  }).filter((item) => item.id);

  const normalizedSkillsConfig = skillsConfig.map((item) => {
    const row = (item || {}) as Record<string, unknown>;
    return {
      id: String(row.id || ""),
      hasApiKey: Boolean(row.hasApiKey),
    };
  }).filter((item) => item.id);

  const gateway = gatewayRaw ? {
    mode: String(gatewayRaw.mode || ""),
    bind: String(gatewayRaw.bind || ""),
    customBindHost: gatewayRaw.customBindHost ? String(gatewayRaw.customBindHost) : undefined,
    authMode: gatewayRaw.authMode ? String(gatewayRaw.authMode) : undefined,
  } : null;

  const messagesConfig = messagesConfigRaw ? {
    ackReactionScope: messagesConfigRaw.ackReactionScope === undefined ? null : messagesConfigRaw.ackReactionScope === null ? null : String(messagesConfigRaw.ackReactionScope),
    ttsAuto: messagesConfigRaw.ttsAuto === undefined ? null : messagesConfigRaw.ttsAuto === null ? null : String(messagesConfigRaw.ttsAuto),
    ttsProvider: messagesConfigRaw.ttsProvider === undefined ? null : messagesConfigRaw.ttsProvider === null ? null : String(messagesConfigRaw.ttsProvider),
    ttsVoiceId: messagesConfigRaw.ttsVoiceId === undefined ? null : messagesConfigRaw.ttsVoiceId === null ? null : String(messagesConfigRaw.ttsVoiceId),
    ttsModelId: messagesConfigRaw.ttsModelId === undefined ? null : messagesConfigRaw.ttsModelId === null ? null : String(messagesConfigRaw.ttsModelId),
  } : null;

  const sessionConfig = sessionConfigRaw ? {
    maxPingPongTurns: sessionConfigRaw.maxPingPongTurns === undefined ? null : sessionConfigRaw.maxPingPongTurns === null ? null : Number(sessionConfigRaw.maxPingPongTurns || 0),
  } : null;

  const commandsConfig = commandsConfigRaw ? {
    native: commandsConfigRaw.native === undefined ? null : commandsConfigRaw.native === null ? null : String(commandsConfigRaw.native),
    nativeSkills: commandsConfigRaw.nativeSkills === undefined ? null : commandsConfigRaw.nativeSkills === null ? null : String(commandsConfigRaw.nativeSkills),
    restart: commandsConfigRaw.restart === undefined ? null : commandsConfigRaw.restart === null ? null : Boolean(commandsConfigRaw.restart),
    ownerDisplay: commandsConfigRaw.ownerDisplay === undefined ? null : commandsConfigRaw.ownerDisplay === null ? null : String(commandsConfigRaw.ownerDisplay),
  } : null;

  const agentDefaults = agentDefaultsRaw ? {
    heartbeat: agentDefaultsRaw.heartbeat === undefined ? null : agentDefaultsRaw.heartbeat === null ? null : String(agentDefaultsRaw.heartbeat),
    maxConcurrent: agentDefaultsRaw.maxConcurrent === undefined ? null : agentDefaultsRaw.maxConcurrent === null ? null : Number(agentDefaultsRaw.maxConcurrent || 0),
    subagentsMaxConcurrent: agentDefaultsRaw.subagentsMaxConcurrent === undefined ? null : agentDefaultsRaw.subagentsMaxConcurrent === null ? null : Number(agentDefaultsRaw.subagentsMaxConcurrent || 0),
    compactionMode: agentDefaultsRaw.compactionMode === undefined ? null : agentDefaultsRaw.compactionMode === null ? null : String(agentDefaultsRaw.compactionMode),
    memorySearchEnabled: agentDefaultsRaw.memorySearchEnabled === undefined ? null : agentDefaultsRaw.memorySearchEnabled === null ? null : Boolean(agentDefaultsRaw.memorySearchEnabled),
    contextPruningMode: agentDefaultsRaw.contextPruningMode === undefined ? null : agentDefaultsRaw.contextPruningMode === null ? null : String(agentDefaultsRaw.contextPruningMode),
    contextPruningTtl: agentDefaultsRaw.contextPruningTtl === undefined ? null : agentDefaultsRaw.contextPruningTtl === null ? null : String(agentDefaultsRaw.contextPruningTtl),
  } : null;

  const agentToAgent = agentToAgentRaw ? {
    enabled: Boolean(agentToAgentRaw.enabled),
    allowList: Array.isArray(agentToAgentRaw.allowList) ? agentToAgentRaw.allowList.map((item) => String(item || "")).filter(Boolean) : [],
  } : null;

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
    channels: normalizedChannels,
    bindings: normalizedBindings,
    gateway,
    plugins: normalizedPlugins,
    messagesConfig,
    sessionConfig,
    commandsConfig,
    agentDefaults,
    skillsConfig: normalizedSkillsConfig,
    agentToAgent,
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
