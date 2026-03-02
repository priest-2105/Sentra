interface RoadmapItemProps {
  priority: number;
  action: string;
  effort: "low" | "medium" | "high";
}

const EFFORT_CONFIG = {
  low: { color: "#059669", label: "Low" },
  medium: { color: "#D97706", label: "Medium" },
  high: { color: "#DC2626", label: "High" },
};

export default function RoadmapItem({ priority, action, effort }: RoadmapItemProps) {
  const effortCfg = EFFORT_CONFIG[effort] ?? EFFORT_CONFIG.medium;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "32px 1fr auto",
        gap: "16px",
        alignItems: "start",
        padding: "14px 0",
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      {/* Priority number */}
      <span
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: "11px",
          fontWeight: 700,
          color: "#0274B6",
          paddingTop: "1px",
        }}
      >
        {String(priority).padStart(2, "0")}
      </span>

      {/* Action */}
      <p
        style={{
          fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
          fontSize: "13px",
          fontWeight: 400,
          color: "#1F2933",
          lineHeight: 1.55,
        }}
      >
        {action}
      </p>

      {/* Effort */}
      <span
        style={{
          fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
          fontSize: "10px",
          fontWeight: 500,
          color: effortCfg.color,
          whiteSpace: "nowrap",
          paddingTop: "2px",
          letterSpacing: "0.04em",
        }}
      >
        {effortCfg.label}
      </span>
    </div>
  );
}
