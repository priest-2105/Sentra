"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import ScoreRing from "@/components/ScoreRing";
import DimensionCard from "@/components/DimensionCard";
import RiskFlag from "@/components/RiskFlag";
import RoadmapItem from "@/components/RoadmapItem";
import type { ScanResult } from "@/lib/api";

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8000";

const RECOMMENDATION_CONFIG = {
  Ready: { color: "#16A34A", bg: "rgba(22, 163, 74, 0.1)", border: "rgba(22, 163, 74, 0.2)" },
  "Needs Work": { color: "#D97706", bg: "rgba(217, 119, 6, 0.1)", border: "rgba(217, 119, 6, 0.2)" },
  "Not Ready": { color: "#DC2626", bg: "rgba(220, 38, 38, 0.1)", border: "rgba(220, 38, 38, 0.2)" },
};

export default function ScanPage() {
  const params = useParams();
  const scanId = params.id as string;

  const [result, setResult] = useState<ScanResult | null>(null);
  const [fetchError, setFetchError] = useState("");

  const fetchScan = useCallback(async () => {
    try {
      const res = await fetch(`${ENGINE_URL}/scan/${scanId}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ScanResult = await res.json();
      setResult(data);
      return data.status;
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch scan");
      return "error";
    }
  }, [scanId]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      const status = await fetchScan();
      if (status === "pending" || status === "running") {
        timeoutId = setTimeout(poll, 2000);
      }
    }

    poll();
    return () => clearTimeout(timeoutId);
  }, [fetchScan]);

  if (fetchError) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0F172A" }}>
        <Header />
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
          <div
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              borderRadius: "6px",
              padding: "20px",
              color: "#DC2626",
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "14px",
            }}
          >
            Failed to load scan: {fetchError}
          </div>
        </div>
      </div>
    );
  }

  if (!result || result.status === "pending" || result.status === "running") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0F172A" }}>
        <Header />
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #334155",
              borderTopColor: "#2563EB",
              borderRadius: "50%",
              margin: "0 auto 24px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <h2
            style={{
              fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif",
              fontSize: "20px",
              color: "#F1F5F9",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            {result?.status === "running" ? "Scanning repository…" : "Preparing scan…"}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "13px",
              color: "#6B7280",
            }}
          >
            {result?.repo_url || `Scan ID: ${scanId}`}
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter), Inter, sans-serif",
              fontSize: "12px",
              color: "#4B5563",
              marginTop: "8px",
            }}
          >
            This typically takes 15–30 seconds. Cloning repo, running analysis, generating AI insights…
          </p>
        </div>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0F172A" }}>
        <Header />
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "48px 24px" }}>
          <div
            style={{
              backgroundColor: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              borderRadius: "6px",
              padding: "20px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif",
                fontSize: "18px",
                color: "#DC2626",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Scan failed
            </h2>
            <p
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "13px",
                color: "#94A3B8",
              }}
            >
              {result.error_msg || "An unexpected error occurred during the scan."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Complete
  const { total_score, scores, flags, explanation } = result;
  const rec = explanation?.recommendation as keyof typeof RECOMMENDATION_CONFIG | undefined;
  const recCfg = rec ? RECOMMENDATION_CONFIG[rec] : RECOMMENDATION_CONFIG["Needs Work"];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0F172A" }}>
      <Header />
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Top bar */}
        <div style={{ marginBottom: "32px" }}>
          <p
            style={{
              fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "#6B7280",
              marginBottom: "4px",
            }}
          >
            {result.repo_url}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              color: "#F1F5F9",
              letterSpacing: "-0.02em",
            }}
          >
            Production Readiness Report
          </h1>
        </div>

        {/* Score + dimensions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "32px",
            alignItems: "center",
            backgroundColor: "#1E293B",
            border: "1px solid #334155",
            borderRadius: "6px",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          {/* Total score ring */}
          <div style={{ textAlign: "center" }}>
            <ScoreRing score={total_score ?? 0} />
            {rec && (
              <div
                style={{
                  marginTop: "12px",
                  display: "inline-block",
                  padding: "4px 10px",
                  backgroundColor: recCfg.bg,
                  border: `1px solid ${recCfg.border}`,
                  borderRadius: "4px",
                  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: recCfg.color,
                  letterSpacing: "0.04em",
                }}
              >
                {rec.toUpperCase()}
              </div>
            )}
          </div>

          {/* Dimension cards */}
          {scores && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "12px",
              }}
            >
              <DimensionCard label="Security" score={scores.security} maxScore={50} />
              <DimensionCard label="DevOps Maturity" score={scores.devops} maxScore={30} />
              <DimensionCard label="Observability" score={scores.observability} maxScore={15} />
              <DimensionCard label="Architecture" score={scores.architecture} maxScore={15} />
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          {/* Risk flags */}
          {flags && flags.length > 0 && (
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#F1F5F9",
                  marginBottom: "12px",
                }}
              >
                Risk Flags
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {flags.map((flag, i) => (
                  <RiskFlag
                    key={i}
                    severity={flag.severity as "high" | "medium" | "low"}
                    title={flag.title}
                    detail={flag.detail}
                  />
                ))}
              </div>
            </div>
          )}

          {/* AI Explanation */}
          {explanation && (
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#F1F5F9",
                  marginBottom: "12px",
                }}
              >
                AI Analysis
              </h2>

              {/* Summary */}
              <div
                style={{
                  backgroundColor: "#1E293B",
                  border: "1px solid #334155",
                  borderRadius: "6px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                    fontSize: "13px",
                    color: "#CBD5E1",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {explanation.summary}
                </p>
              </div>

              {/* Top risks */}
              {explanation.risks.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    padding: "16px",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-inter), Inter, sans-serif",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#6B7280",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "12px",
                    }}
                  >
                    Top Risks
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {explanation.risks.map((risk, i) => (
                      <div key={i}>
                        <p
                          style={{
                            fontFamily: "var(--font-inter), Inter, sans-serif",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#E2E8F0",
                            marginBottom: "2px",
                          }}
                        >
                          {risk.title}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-inter), Inter, sans-serif",
                            fontSize: "11px",
                            color: "#94A3B8",
                            marginBottom: "2px",
                          }}
                        >
                          <strong style={{ color: "#DC2626" }}>Impact:</strong> {risk.impact}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-inter), Inter, sans-serif",
                            fontSize: "11px",
                            color: "#94A3B8",
                          }}
                        >
                          <strong style={{ color: "#16A34A" }}>Fix:</strong> {risk.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Remediation Roadmap */}
        {explanation && explanation.roadmap.length > 0 && (
          <div
            style={{
              backgroundColor: "#1E293B",
              border: "1px solid #334155",
              borderRadius: "6px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                color: "#F1F5F9",
                marginBottom: "4px",
              }}
            >
              Remediation Roadmap
            </h2>
            <p
              style={{
                fontFamily: "var(--font-inter), Inter, sans-serif",
                fontSize: "12px",
                color: "#6B7280",
                marginBottom: "16px",
              }}
            >
              Prioritized action plan generated by AI
            </p>
            <div>
              {explanation.roadmap.map((item, i) => (
                <RoadmapItem
                  key={i}
                  priority={item.priority}
                  action={item.action}
                  effort={item.effort}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
