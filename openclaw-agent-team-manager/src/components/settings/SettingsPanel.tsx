import { useState, useEffect, type CSSProperties } from "react";
import { readTextFile, writeTextFile, readFile, writeFile, exists, mkdir } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { getVersion } from "@tauri-apps/api/app";
import { homeDir } from "@tauri-apps/api/path";
import { useUiStore } from "@/store/ui-store";
import { useTreeStore } from "@/store/tree-store";
import { join } from "@/utils/paths";
import { toast } from "@/components/common/Toast";
import { useGatewayStatus } from "@/hooks/useGatewayStatus";
import {
  DEFAULT_APP_SETTINGS,
  readAppSettings,
  writeAppSettings,
  type AppSettings,
} from "@/services/app-settings";

const labelStyle: CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  color: "var(--text-secondary)",
  marginBottom: 4,
  display: "block",
  letterSpacing: "0.5px",
};

const inputStyle: CSSProperties = {
  background: "var(--bg-primary, #0d1117)",
  border: "1px solid var(--border-color, #21262d)",
  color: "var(--text-primary, #e6edf3)",
  padding: 8,
  borderRadius: 6,
  width: "100%",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const sectionStyle: CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "var(--text-secondary)",
  borderBottom: "1px solid var(--border-color)",
  paddingBottom: 6,
  marginTop: 20,
  marginBottom: 12,
  fontWeight: 600,
};

export function SettingsPanel() {
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const toggleSettings = useUiStore((s) => s.toggleSettings);
  const projectPath = useTreeStore((s) => s.projectPath);
  const loadProject = useTreeStore((s) => s.loadProject);

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [version, setVersion] = useState("0.6.3");
  const [includeSkills, setIncludeSkills] = useState(false);
  const [settingsRoot, setSettingsRoot] = useState<string | null>(null);
  const gatewayStatus = useGatewayStatus(settings.openclawApiBase || "http://127.0.0.1:5050", 15000);

  useEffect(() => {
    getVersion().then(v => setVersion(v)).catch(() => {});
  }, []);

  useEffect(() => {
    homeDir()
      .then((home) => setSettingsRoot(join(home, ".openclaw")))
      .catch(() => setSettingsRoot(null));
  }, []);

  // Load settings on open
  useEffect(() => {
    if (!settingsOpen || !settingsRoot) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const parsed = await readAppSettings(settingsRoot);
        if (!cancelled) setSettings(parsed);
      } catch {
        // Use defaults
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [settingsOpen, settingsRoot]);

  const handleSave = async () => {
    if (!settingsRoot) return;
    try {
      await writeAppSettings(settingsRoot, settings);

      // Apply color overrides to CSS variables
      const root = document.documentElement;
      if (settings.accentColor) root.style.setProperty("--accent-blue", settings.accentColor);

      const home = await homeDir();
      const targetPath = settings.providerMode === "claude" ? home : join(home, ".openclaw");
      if (projectPath !== targetPath) {
        await loadProject(targetPath);
      }

      toast("Settings saved", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to save settings", "error");
    }
  };

  if (!settingsOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "var(--toolbar-height)",
        right: 0,
        bottom: 0,
        width: 400,
        background: "var(--bg-secondary)",
        borderLeft: "1px solid var(--border-color)",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        zIndex: 150,
        animation: "slideInRight 0.2s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 16px 12px",
          borderBottom: "1px solid var(--border-color)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
          Settings
        </span>
        <button
          onClick={toggleSettings}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: 18,
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {loading ? (
          <div style={{ color: "var(--text-secondary)", fontSize: 13, padding: 20, textAlign: "center" }}>
            Loading...
          </div>
        ) : (
          <>
            {/* Version Info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "rgba(74,158,255,0.06)",
                border: "1px solid var(--border-color)",
                borderRadius: 6,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Version</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {`OMC v${version}`}
              </span>
            </div>

            {/* API Key */}
            <div style={sectionStyle}>Claude API</div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>API Key</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type={apiKeyVisible ? "text" : "password"}
                  style={{ ...inputStyle, flex: 1 }}
                  value={settings.apiKey}
                  onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                  placeholder="sk-ant-..."
                />
                <button
                  onClick={() => setApiKeyVisible(!apiKeyVisible)}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                    borderRadius: 4,
                    cursor: "pointer",
                    padding: "4px 8px",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                  }}
                >
                  {apiKeyVisible ? "Hide" : "Show"}
                </button>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                Used for the Chat panel. Stored locally in ~/.openclaw/.aui/settings.json
              </div>
            </div>

            {/* Runtime */}
            <div style={sectionStyle}>Runtime</div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Provider Mode</label>
              <select
                value={settings.providerMode}
                onChange={(e) => setSettings({ ...settings, providerMode: e.target.value as AppSettings["providerMode"] })}
                style={inputStyle}
              >
                <option value="openclaw">OpenClaw (default)</option>
                <option value="claude">Legacy Claude (.claude)</option>
              </select>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
                OpenClaw mode reads sisters/entities from `~/.openclaw`. Claude mode uses legacy `.claude` files.
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              <input
                type="checkbox"
                checked={settings.enableLegacyClaudeDeploy}
                onChange={(e) => setSettings({ ...settings, enableLegacyClaudeDeploy: e.target.checked })}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
                Enable Legacy Claude Deploy (manual flag)
              </span>
            </label>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: -8, marginBottom: 12 }}>
              When disabled, deploy actions are blocked to keep this app monitor-only.
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>OpenClaw API Base</label>
              <input
                style={inputStyle}
                value={settings.openclawApiBase}
                onChange={(e) => setSettings({ ...settings, openclawApiBase: e.target.value })}
                placeholder="http://127.0.0.1:5077"
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 11 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: gatewayStatus.available ? "#3fb950" : "#f85149",
                  }}
                />
                <span style={{ color: gatewayStatus.available ? "#3fb950" : "#f85149" }}>
                  {gatewayStatus.available ? "Connected" : gatewayStatus.error || "Offline"}
                </span>
              </div>
            </div>

            {/* Colors */}
            <div style={sectionStyle}>Colors</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Team Color</label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="color"
                    value={settings.teamColor}
                    onChange={(e) => setSettings({ ...settings, teamColor: e.target.value })}
                    style={{ width: 32, height: 32, border: "none", borderRadius: 4, cursor: "pointer", background: "none" }}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={settings.teamColor}
                    onChange={(e) => setSettings({ ...settings, teamColor: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Agent Color</label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <input
                    type="color"
                    value={settings.agentColor}
                    onChange={(e) => setSettings({ ...settings, agentColor: e.target.value })}
                    style={{ width: 32, height: 32, border: "none", borderRadius: 4, cursor: "pointer", background: "none" }}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={settings.agentColor}
                    onChange={(e) => setSettings({ ...settings, agentColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Accent Color</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                  style={{ width: 32, height: 32, border: "none", borderRadius: 4, cursor: "pointer", background: "none" }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={settings.accentColor}
                  onChange={(e) => setSettings({ ...settings, accentColor: e.target.value })}
                />
              </div>
            </div>

            {/* Preferences */}
            <div style={sectionStyle}>Preferences</div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                marginBottom: 12,
              }}
            >
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>
                Auto-save tree metadata on changes
              </span>
            </label>

            {/* Save */}
            <button
              onClick={handleSave}
              style={{
                width: "100%",
                padding: "10px 16px",
                marginTop: 16,
                background: "var(--accent-blue)",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Save Settings
            </button>

            {/* Data */}
            <div style={sectionStyle}>Data</div>

            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button
                onClick={async () => {
                  try {
                    if (includeSkills) {
                      const zipData = await useTreeStore.getState().exportTreeAsZip();
                      const filePath = await save({
                        filters: [{ name: "ATM Export (ZIP)", extensions: ["atm.zip"] }],
                        defaultPath: "tree-export.atm.zip",
                      });
                      if (!filePath) return;
                      await writeFile(filePath, zipData);
                      toast("Tree exported as ZIP with skills", "success");
                    } else {
                      const json = useTreeStore.getState().exportTreeAsJson();
                      const filePath = await save({
                        filters: [{ name: "AUI Export", extensions: ["aui.json"] }],
                        defaultPath: "tree-export.aui.json",
                      });
                      if (!filePath) return;
                      await writeTextFile(filePath, json);
                      toast("Tree exported successfully", "success");
                    }
                  } catch (err) {
                    toast(`Export failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
                  }
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "transparent",
                  color: "var(--accent-green, #3fb950)",
                  border: "1px solid var(--accent-green, #3fb950)",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(63, 185, 80, 0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                {includeSkills ? "Export as ZIP" : "Export Tree"}
              </button>
              <button
                onClick={async () => {
                  try {
                    const selected = await open({
                      filters: [{ name: "ATM Export", extensions: ["aui.json", "atm.zip"] }],
                    });
                    if (!selected) return;
                    const filePath = typeof selected === "string" ? selected : null;
                    if (!filePath) return;

                    if (filePath.endsWith(".atm.zip")) {
                      const data = await readFile(filePath);
                      await useTreeStore.getState().importTreeFromZip(data);
                      toast("Tree imported from ZIP (with skills)", "success");
                    } else {
                      const json = await readTextFile(filePath);
                      useTreeStore.getState().importTreeFromJson(json);
                      toast("Tree imported successfully", "success");
                    }
                  } catch (err) {
                    toast(`Import failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
                  }
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: "transparent",
                  color: "var(--accent-blue, #4a9eff)",
                  border: "1px solid var(--accent-blue, #4a9eff)",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(74, 158, 255, 0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                Import Tree
              </button>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                marginBottom: 8,
                marginTop: 4,
              }}
            >
              <input
                type="checkbox"
                checked={includeSkills}
                onChange={(e) => setIncludeSkills(e.target.checked)}
                style={{ width: 14, height: 14, cursor: "pointer" }}
              />
              <span style={{ fontSize: 12, color: "var(--text-primary)" }}>
                Include skill files (export as .atm.zip)
              </span>
            </label>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>
              Export saves your tree layout and metadata. ZIP includes skill files. Import supports both .aui.json and .atm.zip.
            </div>
          </>
        )}

        {/* Advanced */}
        <div style={sectionStyle}>Advanced</div>

        <button
          onClick={async () => {
            if (!projectPath) return;
            try {
              const { open: shellOpen } = await import("@tauri-apps/plugin-shell");
              const target = settings.providerMode === "claude"
                ? join(projectPath, ".claude", "settings.json")
                : join(projectPath, "openclaw.json");
              await shellOpen(target);
            } catch {
              toast("Could not open settings file", "error");
            }
          }}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "transparent",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 500,
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          Open Runtime Config File
        </button>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>
          Opens {settings.providerMode === "claude" ? ".claude/settings.json" : "openclaw.json"} in your default editor
        </div>
      </div>
    </div>
  );
}
