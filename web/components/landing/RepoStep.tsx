import StepIndicator from "./StepIndicator";

interface RepoStepProps {
  value: string;
  onChange: (val: string) => void;
  onContinue: () => void;
}

export default function RepoStep({ value, onChange, onContinue }: RepoStepProps) {
  const isValid = value.trim().startsWith("https://github.com/");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isValid) onContinue();
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "480px" }}>
      <StepIndicator current={1} />

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
        Which repository<br />should we audit?
      </h1>

      <p
        style={{
          fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
          fontSize: "13px",
          fontWeight: 300,
          color: "#6B7280",
          lineHeight: 1.6,
          marginBottom: "36px",
        }}
      >
        We'll clone the repository and run a full static analysis — security,
        DevOps maturity, architecture, and observability.
      </p>

      <div style={{ marginBottom: "24px" }}>
        <label
          htmlFor="repo-url"
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
          GitHub Repository URL
        </label>
        <input
          id="repo-url"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://github.com/owner/repository"
          required
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

      <button
        type="submit"
        disabled={!isValid}
        style={{
          width: "100%",
          padding: "11px 16px",
          backgroundColor: isValid ? "#0274B6" : "#E5E7EB",
          color: isValid ? "#FFFFFF" : "#9CA3AF",
          border: "none",
          borderRadius: "3px",
          fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          cursor: isValid ? "pointer" : "not-allowed",
          transition: "background-color 0.12s",
        }}
      >
        Continue →
      </button>
    </form>
  );
}
