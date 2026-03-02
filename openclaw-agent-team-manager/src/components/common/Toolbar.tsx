import { useTreeStore } from "@/store/tree-store";
import { useUiStore } from "@/store/ui-store";
import { useGatewayStatus } from "@/hooks/useGatewayStatus";
import { LayoutsDropdown } from "./LayoutsDropdown";

const buttonStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 6,
  background: "transparent",
  border: "1px solid transparent",
  color: "var(--text-secondary)",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
  transition: "all 0.15s ease",
};

function ToolbarButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(74,158,255,0.08)";
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = "transparent";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
    >
      {label}
    </button>
  );
}

export function Toolbar() {
  const nodeCount = useTreeStore((s) => s.nodes.size);
  const toggleContextHub = useUiStore((s) => s.toggleContextHub);
  const toggleSettings = useUiStore((s) => s.toggleSettings);
  const toggleSchedule = useUiStore((s) => s.toggleSchedule);
  const gatewayStatus = useGatewayStatus("http://127.0.0.1:5050");

  return (
    <header
      style={{
        height: 48,
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        flexShrink: 0,
        justifyContent: "space-between",
      }}
    >
      {/* Left: logo + subtitle */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--accent-blue)",
            letterSpacing: "0.05em",
          }}
        >
          OMC
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--text-secondary)",
            fontWeight: 400,
            letterSpacing: "0.02em",
          }}
        >
          OpenClaw Mission Control
        </span>
      </div>

      {/* Center: create + layouts */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <ToolbarButton
          label="+"
          onClick={() => useUiStore.getState().openCreateDialog()}
        />
        <LayoutsDropdown />
      </div>

      {/* Right: action buttons + node count */}
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
        <ToolbarButton label="Catalog" onClick={toggleContextHub} />
        <ToolbarButton label="Schedules" onClick={toggleSchedule} />
        <ToolbarButton label="Settings" onClick={toggleSettings} />
        <span
          style={{
            fontSize: 11,
            color: "var(--text-tertiary, var(--text-secondary))",
            marginLeft: 8,
            whiteSpace: "nowrap",
          }}
        >
          {nodeCount} nodes
        </span>
        {/* Gateway Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginLeft: "auto",
            padding: "0 12px",
            fontSize: 11,
            color: "var(--text-secondary)",
            userSelect: "none",
          }}
          title={gatewayStatus.error ? `Error: ${gatewayStatus.error}` : `Last checked: ${new Date(gatewayStatus.lastChecked).toLocaleTimeString()}`}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: gatewayStatus.available ? "#3fb950" : "#f85149",
              boxShadow: gatewayStatus.available ? "0 0 6px rgba(63,185,80,0.5)" : "0 0 6px rgba(248,81,73,0.3)",
              transition: "background 0.3s, box-shadow 0.3s",
            }}
          />
          <span>{gatewayStatus.available ? "Gateway" : "Gateway Offline"}</span>
        </div>
      </div>
    </header>
  );
}
