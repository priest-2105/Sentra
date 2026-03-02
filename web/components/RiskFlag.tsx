interface RiskFlagProps {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
}

const SEVERITY_CONFIG = {
  high: {
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    label: "HIGH",
    dot: "#DC2626",
  },
  medium: {
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    label: "MED",
    dot: "#D97706",
  },
  low: {
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    label: "LOW",
    dot: "#9CA3AF",
  },
};

export default function RiskFlag({ severity, title, detail }: RiskFlagProps) {
  const cfg = SEVERITY_CONFIG[severity] ?? SEVERITY_CONFIG.low;

  return (
    <div
      style={{
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: "3px",
        padding: "12px 14px",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      {/* Severity dot */}
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: cfg.dot,
          flexShrink: 0,
          marginTop: "5px",
        }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: "9px",
              fontWeight: 700,
              color: cfg.color,
              letterSpacing: "0.1em",
            }}
          >
            {cfg.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#0B1F2A",
            }}
          >
            {title}
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 300,
            color: "#6B7280",
            lineHeight: 1.55,
          }}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}
