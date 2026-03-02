interface StepIndicatorProps {
  current: 1 | 2;
  total?: number;
}

export default function StepIndicator({ current, total = 2 }: StepIndicatorProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0",
        marginBottom: "40px",
      }}
    >
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;

        return (
          <div key={step} style={{ display: "flex", alignItems: "center" }}>
            {/* Step node */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "2px",
                  backgroundColor: isActive ? "#0274B6" : isDone ? "#E0EEF8" : "#F3F4F6",
                  border: isActive
                    ? "none"
                    : isDone
                    ? "1px solid #BFDBFE"
                    : "1px solid #E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isActive ? "#FFFFFF" : isDone ? "#0274B6" : "#9CA3AF",
                  }}
                >
                  {String(step).padStart(2, "0")}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                  fontSize: "9px",
                  fontWeight: 500,
                  color: isActive ? "#0274B6" : "#9CA3AF",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {step === 1 ? "Repository" : "Deployment"}
              </span>
            </div>

            {/* Connector line between steps */}
            {step < total && (
              <div
                style={{
                  width: "64px",
                  height: "1px",
                  backgroundColor: isDone ? "#0274B6" : "#E5E7EB",
                  margin: "0 8px",
                  marginBottom: "22px",
                  transition: "background-color 0.3s ease",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
