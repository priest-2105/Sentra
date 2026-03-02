"use client";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#059669";
  if (score >= 50) return "#D97706";
  return "#DC2626";
}

export default function ScoreRing({ score, size = 128, strokeWidth = 7 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = circumference * (1 - progress);
  const color = getScoreColor(score);
  const center = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth}
        />
        <circle
          cx={center} cy={center} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: "28px",
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "10px",
            fontWeight: 300,
            color: "#9CA3AF",
            marginTop: "3px",
            letterSpacing: "0.04em",
          }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}
