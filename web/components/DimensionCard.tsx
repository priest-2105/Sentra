interface DimensionCardProps {
  label: string;
  score: number;
  maxScore: number;
}

function getBarColor(pct: number): string {
  if (pct >= 0.75) return "#059669";
  if (pct >= 0.5) return "#D97706";
  return "#DC2626";
}

export default function DimensionCard({ label, score, maxScore }: DimensionCardProps) {
  const pct = Math.max(0, Math.min(1, score / maxScore));
  const barColor = getBarColor(pct);

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: "3px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "#1F2933",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: "13px",
            fontWeight: 700,
            color: barColor,
          }}
        >
          {score}
          <span style={{ fontSize: "10px", fontWeight: 400, color: "#D1D5DB" }}>
            /{maxScore}
          </span>
        </span>
      </div>
      <div
        style={{
          height: "2px",
          backgroundColor: "#F3F4F6",
          borderRadius: "1px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct * 100}%`,
            backgroundColor: barColor,
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
