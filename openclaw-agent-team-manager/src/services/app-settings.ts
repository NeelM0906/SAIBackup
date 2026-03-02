import { exists, readTextFile, writeTextFile, mkdir } from "@tauri-apps/plugin-fs";
import { join } from "@/utils/paths";

export type ProviderMode = "openclaw" | "claude";

export interface AppSettings {
  apiKey: string;
  teamColor: string;
  agentColor: string;
  accentColor: string;
  autoSave: boolean;
  providerMode: ProviderMode;
  enableLegacyClaudeDeploy: boolean;
  openclawApiBase: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  apiKey: "",
  teamColor: "#4a9eff",
  agentColor: "#f0883e",
  accentColor: "#4a9eff",
  autoSave: true,
  providerMode: "openclaw",
  enableLegacyClaudeDeploy: false,
  openclawApiBase: "http://127.0.0.1:5077",
};

export async function readAppSettings(projectPath: string): Promise<AppSettings> {
  try {
    const settingsPath = join(projectPath, ".aui", "settings.json");
    if (!(await exists(settingsPath))) {
      return { ...DEFAULT_APP_SETTINGS };
    }
    const raw = await readTextFile(settingsPath);
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_APP_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_APP_SETTINGS };
  }
}

export async function writeAppSettings(projectPath: string, settings: AppSettings): Promise<void> {
  const auiDir = join(projectPath, ".aui");
  if (!(await exists(auiDir))) {
    await mkdir(auiDir, { recursive: true });
  }
  const settingsPath = join(auiDir, "settings.json");
  await writeTextFile(settingsPath, JSON.stringify(settings, null, 2));
}

