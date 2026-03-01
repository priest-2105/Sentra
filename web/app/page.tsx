"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function Home() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [deployUrl, setDeployUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_url: repoUrl.trim(),
          deploy_url: deployUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(data.error || `Error ${res.status}`);
      }

      const { scan_id } = await res.json();
      router.push(`/scan/${scan_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to start scan");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A" }}>
      <Header />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 52px)",
          padding: "48px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: "520px" }}>
          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#F1F5F9",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
              textAlign: "center",
            }}
          >
            Scan a repository
          </h1>
          <p
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "14px",
              color: "#6B7280",
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            Security analysis, DevOps maturity, and AI remediation roadmap in seconds.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="repo-url"
                style={{
                  display: "block",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  marginBottom: "6px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                GitHub Repository URL *
              </label>
              <input
                id="repo-url"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                required
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "4px",
                  color: "#F1F5F9",
                  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                onBlur={(e) => (e.target.style.borderColor = "#334155")}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <label
                htmlFor="deploy-url"
                style={{
                  display: "block",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  marginBottom: "6px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Deployment URL{" "}
                <span style={{ color: "#4B5563", fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="deploy-url"
                type="url"
                value={deployUrl}
                onChange={(e) => setDeployUrl(e.target.value)}
                placeholder="https://myapp.com"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "4px",
                  color: "#F1F5F9",
                  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  fontSize: "13px",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                onBlur={(e) => (e.target.style.borderColor = "#334155")}
              />
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "10px 12px",
                  backgroundColor: "rgba(220, 38, 38, 0.08)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  borderRadius: "4px",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                  fontSize: "13px",
                  color: "#DC2626",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !repoUrl.trim()}
              style={{
                width: "100%",
                padding: "11px",
                backgroundColor: loading || !repoUrl.trim() ? "#1E3A5F" : "#2563EB",
                color: loading || !repoUrl.trim() ? "#4B72A0" : "#fff",
                border: "none",
                borderRadius: "4px",
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading || !repoUrl.trim() ? "not-allowed" : "pointer",
                transition: "background-color 0.15s",
              }}
            >
              {loading ? "Starting scan…" : "Scan repository"}
            </button>
          </form>

          {/* Dimensions */}
          <div
            style={{
              marginTop: "48px",
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
            }}
          >
            {[
              { label: "Security", detail: "Vulnerabilities, secrets, headers" },
              { label: "DevOps", detail: "CI/CD, Docker, tests, lint" },
              { label: "Observability", detail: "Health, logging, monitoring" },
              { label: "Architecture", detail: "TypeScript, .gitignore, deps" },
            ].map((dim) => (
              <div
                key={dim.label}
                style={{
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "4px",
                  padding: "12px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#94A3B8",
                    margin: "0 0 2px 0",
                  }}
                >
                  {dim.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "11px",
                    color: "#4B5563",
                    margin: 0,
                  }}
                >
                  {dim.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
