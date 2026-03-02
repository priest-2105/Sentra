import StepIndicator from "./StepIndicator";

interface DeployStepProps {
  repoUrl: string;
  value: string;
  onChange: (val: string) => void;
  onBack: () => void;
  onSubmit: (deployUrl?: string) => void;
  loading: boolean;
  error: string;
}

export default function DeployStep({
  repoUrl,
  value,
  onChange,
  onBack,
  onSubmit,
  loading,
  error,
}: DeployStepProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(value.trim() || undefined);
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "480px" }}>
      <StepIndicator current={2} />

      <h1
        style={{
          fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
          fontSize: "26px",
          fontWeight: 700,
          color: "#0B1F2A",
          letterSpacing: "-0.02em",
          lineHeight: 1.25,
          marginBottom: "10px",
        }}
      >
        Is there a live<br />deployment to inspect?
      </h1>

      <p
        style={{
          fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
          fontSize: "13px",
          fontWeight: 300,
          color: "#6B7280",
          lineHeight: 1.6,
          marginBottom: "8px",
        }}
      >
        If provided, we'll inspect HTTP security headers, HTTPS configuration,
        and live response policies against your running deployment.
      </p>

      {/* Repo confirmation pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "5px 10px",
          backgroundColor: "#F0F7FF",
          border: "1px solid #BFDBFE",
          borderRadius: "2px",
          marginBottom: "32px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            color: "#0274B6",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Repo
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: "11px",
            color: "#374151",
          }}
        >
          {repoUrl.replace("https://github.com/", "")}
        </span>
      </div>

      <div style={{ marginBottom: "28px" }}>
        <label
          htmlFor="deploy-url"
          style={{
            display: "block",
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "10px",
            fontWeight: 600,
            color: "#6B7280",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Deployment URL{" "}
          <span
            style={{
              fontWeight: 300,
              textTransform: "none",
              letterSpacing: 0,
              color: "#9CA3AF",
            }}
          >
            — optional
          </span>
        </label>
        <input
          id="deploy-url"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://yourapp.com"
          disabled={loading}
          autoFocus
          style={{
            width: "100%",
            padding: "11px 14px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "3px",
            color: "#0B1F2A",
            fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
            fontSize: "13px",
            outline: "none",
            transition: "border-color 0.12s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#0274B6")}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        />
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 14px",
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "3px",
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "13px",
            color: "#DC2626",
          }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "11px 16px",
            backgroundColor: loading ? "#E5E7EB" : "#0274B6",
            color: loading ? "#9CA3AF" : "#FFFFFF",
            border: "none",
            borderRadius: "3px",
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.12s",
          }}
        >
          {loading ? "Initiating analysis…" : "Run Analysis"}
        </button>

        {!loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#9CA3AF",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={() => onSubmit(undefined)}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#6B7280",
                cursor: "pointer",
                padding: "4px 0",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
            >
              Skip, analyze without deployment URL
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
