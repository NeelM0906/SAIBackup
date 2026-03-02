import { useEffect, useRef } from "react";
import { homeDir } from "@tauri-apps/api/path";
import { ReactFlowProvider } from "@xyflow/react";
import { TreeCanvas } from "./components/tree/TreeCanvas";
import { InspectorPanel } from "./components/inspector/InspectorPanel";
import { ContextHub } from "./components/context-hub/ContextHub";
import { Toolbar } from "./components/common/Toolbar";
import { ValidationBanner } from "./components/common/ValidationBanner";
import { CreateNodeDialog } from "./components/dialogs/CreateNodeDialog";
import { DeleteConfirmDialog } from "./components/dialogs/DeleteConfirmDialog";
// ChatPanel removed — CLI-based chat doesn't work in Tauri's webview
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { SchedulePanel } from "./components/schedule/SchedulePanel";
import { ToastContainer, toast } from "./components/common/Toast";
import { SetupWizard } from "./components/setup/SetupWizard";
import { useTreeStore } from "./store/tree-store";
import { useUiStore } from "./store/ui-store";
import { startWatching } from "./services/file-watcher";
import { readAppSettings } from "./services/app-settings";
import { join } from "./utils/paths";
import type { VariableKind } from "./types/aui-node";

function App() {
  const inspectorOpen = useUiStore((s) => s.inspectorOpen);
  const createDialogOpen = useUiStore((s) => s.createDialogOpen);
  const closeCreateDialog = useUiStore((s) => s.closeCreateDialog);
  const deleteDialogNodeId = useUiStore((s) => s.deleteDialogNodeId);
  const closeDeleteDialog = useUiStore((s) => s.closeDeleteDialog);
  const projectPath = useTreeStore((s) => s.projectPath);
  const loadProject = useTreeStore((s) => s.loadProject);
  const syncFromDisk = useTreeStore((s) => s.syncFromDisk);
  const nodes = useTreeStore((s) => s.nodes);
  const createAgentNode = useTreeStore((s) => s.createAgentNode);
  const createSkillNode = useTreeStore((s) => s.createSkillNode);
  const createGroupNode = useTreeStore((s) => s.createGroupNode);
  const createPipelineNode = useTreeStore((s) => s.createPipelineNode);
  const assignSkillToNode = useTreeStore((s) => s.assignSkillToNode);
  const updateNode = useTreeStore((s) => s.updateNode);
  const deleteNodeFromDisk = useTreeStore((s) => s.deleteNodeFromDisk);
  const unwatchRef = useRef<(() => void) | null>(null);

  const deleteNodeName = deleteDialogNodeId
    ? nodes.get(deleteDialogNodeId)?.name ?? ""
    : "";

  const handleCreate = async (
    kind: "agent" | "skill" | "group" | "pipeline",
    name: string,
    description: string,
    parentId: string | null,
    skillIds: string[],
    managerId: string | null,
  ) => {
    try {
      const resolvedParentId = parentId ?? useUiStore.getState().createDialogParentId ?? undefined;
      if (kind === "agent") await createAgentNode(name, description, resolvedParentId);
      else if (kind === "pipeline") createPipelineNode(name, description, resolvedParentId);
      else if (kind === "group") createGroupNode(name, description, resolvedParentId);
      else await createSkillNode(name, description, resolvedParentId);

      const store = useTreeStore.getState();
      const displayName = name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const expectedParent = resolvedParentId ?? "root";
      const expectedKind = kind === "pipeline" ? "pipeline" : kind;

      let createdNodeId: string | null = null;
      let createdAt = -1;
      for (const [id, node] of store.nodes) {
        if (node.kind !== expectedKind) continue;
        if ((node.parentId ?? "root") !== expectedParent) continue;
        if (!(node.name === name || node.name === displayName)) continue;
        if (node.lastModified > createdAt) {
          createdAt = node.lastModified;
          createdNodeId = id;
        }
      }

      if (createdNodeId && skillIds.length > 0) {
        for (const skillId of skillIds) {
          assignSkillToNode(createdNodeId, skillId);
        }
      }

      if (createdNodeId && managerId) {
        const managerNode = store.nodes.get(managerId);
        const managerName = managerNode?.name ?? managerId;
        const targetNode = useTreeStore.getState().nodes.get(createdNodeId);
        const nextVars = [
          ...(targetNode?.variables ?? []).filter(
            (v) => v.name !== "manager_being_id" && v.name !== "manager_being_name",
          ),
          { name: "manager_being_id", value: managerId, type: "text" as VariableKind },
          { name: "manager_being_name", value: managerName, type: "text" as VariableKind },
        ];
        updateNode(createdNodeId, { variables: nextVars, lastModified: Date.now() });
      }

      toast(`Created ${name}`, "success");
      closeCreateDialog();
      useTreeStore.getState().autoGroupByPrefix();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialogNodeId) return;
    const name = nodes.get(deleteDialogNodeId)?.name ?? "";
    try {
      await deleteNodeFromDisk(deleteDialogNodeId);
      toast(`Deleted ${name}`, "success");
      closeDeleteDialog();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.ctrlKey && e.key === "n" && !isInput) {
        e.preventDefault();
        useUiStore.getState().openCreateDialog();
      }
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search nodes"]'
        );
        searchInput?.focus();
      }
      // Ctrl+I — toggle inspector
      if (e.ctrlKey && e.key === "i" && !isInput) {
        e.preventDefault();
        useUiStore.getState().toggleInspector();
      }
      // Ctrl+Shift+D — deploy selected team
      if (e.ctrlKey && e.shiftKey && e.key === "D" && !isInput) {
        e.preventDefault();
        const nodeId = useUiStore.getState().selectedNodeId;
        if (nodeId) {
          const node = useTreeStore.getState().nodes.get(nodeId);
          if (node?.kind === "group") {
            // Click the deploy button if it exists
            const deployBtn = document.querySelector<HTMLButtonElement>(
              'button:not([disabled])'
            );
            // Find the deploy button by its text content
            const buttons = document.querySelectorAll("button");
            for (const btn of buttons) {
              if (btn.textContent === "Deploy Team") {
                btn.click();
                break;
              }
            }
          }
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load from user's home directory on mount
  useEffect(() => {
    homeDir().then((home) => {
      (async () => {
        console.log("[ATM] Home directory resolved to:", home);
        console.log("[ATM] Platform:", navigator.userAgent);

        const openclawRoot = join(home, ".openclaw");
        const appSettings = await readAppSettings(openclawRoot);
        const initialProjectPath = appSettings.providerMode === "claude" ? home : openclawRoot;

        loadProject(initialProjectPath).then(() => {
          useTreeStore.getState().autoGroupByPrefix();
        });
      })();
    });
  }, [loadProject]);

  // Set up file watcher when project path changes
  useEffect(() => {
    if (!projectPath) return;

    let cancelled = false;

    startWatching(projectPath, (changedPaths) => {
      if (!cancelled) {
        syncFromDisk(changedPaths);
      }
    })
      .then((unwatch) => {
        if (cancelled) {
          unwatch();
        } else {
          unwatchRef.current = unwatch;
        }
      })
      .catch(() => {
        // File watching is non-critical — silently ignore errors
      });

    return () => {
      cancelled = true;
      if (unwatchRef.current) {
        unwatchRef.current();
        unwatchRef.current = null;
      }
    };
  }, [projectPath, syncFromDisk]);

  return (
    <div className="app">
      <Toolbar />
      <div className="main-content">
        <div className="tree-panel">
          <ValidationBanner />
          <ReactFlowProvider>
            <TreeCanvas />
          </ReactFlowProvider>
        </div>
        {inspectorOpen && (
          <div className="inspector-panel">
            <InspectorPanel />
          </div>
        )}
      </div>
      <ContextHub />
      <CreateNodeDialog
        open={createDialogOpen}
        onClose={closeCreateDialog}
        onCreate={handleCreate}
      />
      <DeleteConfirmDialog
        open={!!deleteDialogNodeId}
        nodeName={deleteNodeName}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
      />
      <SettingsPanel />
      <SchedulePanelWrapper />
      <SetupWizard />
      <ToastContainer />
    </div>
  );
}

function SchedulePanelWrapper() {
  const open = useUiStore((s) => s.scheduleOpen);
  const toggle = useUiStore((s) => s.toggleSchedule);
  if (!open) return null;
  return <SchedulePanel onClose={toggle} />;
}

export default App;
