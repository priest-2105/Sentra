interface DimensionCardProps {
  label: string;
  score: number;
  maxScore: number;
}

function getBarColor(pct: number): string {
  if (pct >= 0.75) return "#16A34A";
  if (pct >= 0.5) return "#D97706";
  return "#DC2626";
}

export default function DimensionCard({
  label,
  score,
  maxScore,
}: DimensionCardProps) {
  const pct = Math.max(0, Math.min(1, score / maxScore));
  const barColor = getBarColor(pct);

  return (
    <div
      style={{
        backgroundColor: "#1E293B",
        border: "1px solid #334155",
        borderRadius: "6px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "13px",
            color: "#94A3B8",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
            fontSize: "15px",
            fontWeight: 700,
            color: barColor,
          }}
        >
          {score}
          <span
            style={{
              fontSize: "11px",
              color: "#6B7280",
              fontWeight: 400,
            }}
          >
            /{maxScore}
          </span>
        </span>
      </div>
      {/* Progress bar */}
      <div
        style={{
          height: "4px",
          backgroundColor: "#334155",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct * 100}%`,
            backgroundColor: barColor,
            borderRadius: "2px",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}
