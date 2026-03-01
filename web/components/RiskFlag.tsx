import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface RiskFlagProps {
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
}

const SEVERITY_CONFIG = {
  high: {
    color: "#DC2626",
    bgColor: "rgba(220, 38, 38, 0.08)",
    borderColor: "rgba(220, 38, 38, 0.2)",
    Icon: AlertTriangle,
    label: "HIGH",
  },
  medium: {
    color: "#D97706",
    bgColor: "rgba(217, 119, 6, 0.08)",
    borderColor: "rgba(217, 119, 6, 0.2)",
    Icon: AlertCircle,
    label: "MEDIUM",
  },
  low: {
    color: "#6B7280",
    bgColor: "rgba(107, 114, 128, 0.08)",
    borderColor: "rgba(107, 114, 128, 0.2)",
    Icon: Info,
    label: "LOW",
  },
};

export default function RiskFlag({ severity, title, detail }: RiskFlagProps) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.low;
  const { Icon } = cfg;

  return (
    <div
      style={{
        backgroundColor: cfg.bgColor,
        border: `1px solid ${cfg.borderColor}`,
        borderRadius: "4px",
        padding: "12px 14px",
        display: "flex",
        gap: "12px",
      }}
    >
      <Icon
        size={16}
        color={cfg.color}
        style={{ flexShrink: 0, marginTop: "2px" }}
      />
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              fontSize: "10px",
              fontWeight: 700,
              color: cfg.color,
              letterSpacing: "0.05em",
            }}
          >
            {cfg.label}
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#F1F5F9",
            }}
          >
            {title}
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "12px",
            color: "#94A3B8",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {detail}
        </p>
      </div>
    </div>
  );
}
