interface RoadmapItemProps {
  priority: number;
  action: string;
  effort: "low" | "medium" | "high";
}

const EFFORT_CONFIG = {
  low: { color: "#16A34A", label: "Low effort" },
  medium: { color: "#D97706", label: "Medium effort" },
  high: { color: "#DC2626", label: "High effort" },
};

export default function RoadmapItem({ priority, action, effort }: RoadmapItemProps) {
  const effortCfg = EFFORT_CONFIG[effort] || EFFORT_CONFIG.medium;

  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        padding: "12px 0",
        borderBottom: "1px solid #1E293B",
      }}
    >
      {/* Priority badge */}
      <div
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "4px",
          backgroundColor: "#2563EB",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            fontSize: "11px",
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {priority}
        </span>
      </div>

      {/* Action */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "13px",
            color: "#E2E8F0",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {action}
        </p>
      </div>

      {/* Effort badge */}
      <span
        style={{
          fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
          fontSize: "10px",
          color: effortCfg.color,
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {effortCfg.label}
      </span>
    </div>
  );
}
