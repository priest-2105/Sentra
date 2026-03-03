"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import ScoreRing from "@/components/ScoreRing";
import DimensionCard from "@/components/DimensionCard";
import RiskFlag from "@/components/RiskFlag";
import RoadmapItem from "@/components/RoadmapItem";
import type { ScanResult } from "@/lib/api";
import { saveToHistory } from "@/lib/history";

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8000";

const RECOMMENDATION_CONFIG = {
  Ready: { color: "#059669", bg: "#F0FDF4", border: "#A7F3D0", label: "PRODUCTION READY" },
  "Needs Work": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", label: "NEEDS REMEDIATION" },
  "Not Ready": { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "NOT PRODUCTION READY" },
};

const GRID_CELL = 48;
const TRACERS: { axis: "h" | "v"; idx: number; delay: number; dur: number }[] = [
  { axis: "h", idx: 3,  delay: 0,   dur: 4.5 },
  { axis: "h", idx: 8,  delay: 1.8, dur: 3.8 },
  { axis: "h", idx: 13, delay: 3.6, dur: 5.0 },
  { axis: "h", idx: 17, delay: 0.9, dur: 4.2 },
  { axis: "h", idx: 5,  delay: 5.3, dur: 4.1 },
  { axis: "v", idx: 5,  delay: 0.5, dur: 4.0 },
  { axis: "v", idx: 11, delay: 2.3, dur: 3.6 },
  { axis: "v", idx: 18, delay: 1.3, dur: 4.8 },
  { axis: "v", idx: 24, delay: 3.9, dur: 3.9 },
  { axis: "v", idx: 14, delay: 4.5, dur: 3.7 },
];

function GridTracer() {
  return (
    <>
      <style>{`
        @keyframes sentra-trace-h {
          0%   { transform: scaleX(0); opacity: 0; }
          10%  { opacity: 1; }
          65%  { transform: scaleX(1); opacity: 0.4; }
          100% { transform: scaleX(1); opacity: 0; }
        }
        @keyframes sentra-trace-v {
          0%   { transform: scaleY(0); opacity: 0; }
          10%  { opacity: 1; }
          65%  { transform: scaleY(1); opacity: 0.4; }
          100% { transform: scaleY(1); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          backgroundImage: `
            linear-gradient(to right, rgba(2,116,182,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(2,116,182,0.07) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_CELL}px ${GRID_CELL}px`,
        }}
      >
        {TRACERS.map((t, i) =>
          t.axis === "h" ? (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${t.idx * GRID_CELL}px`,
                left: 0,
                right: 0,
                height: "1px",
                backgroundColor: "rgba(2,116,182,0.32)",
                transformOrigin: "left center",
                animation: `sentra-trace-h ${t.dur}s ${t.delay}s ease-in-out infinite`,
              }}
            />
          ) : (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${t.idx * GRID_CELL}px`,
                top: 0,
                bottom: 0,
                width: "1px",
                backgroundColor: "rgba(2,116,182,0.32)",
                transformOrigin: "top center",
                animation: `sentra-trace-v ${t.dur}s ${t.delay}s ease-in-out infinite`,
              }}
            />
          )
        )}
      </div>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
        fontSize: "10px",
        fontWeight: 600,
        color: "#9CA3AF",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        marginBottom: "16px",
      }}
    >
      {children}
    </p>
  );
}

function Divider() {
  return (
    <div style={{ borderTop: "1px solid #E5E7EB", margin: "40px 0" }} />
  );
}

export default function ScanPage() {
  const params = useParams();
  const scanId = params.id as string;

  const [result, setResult] = useState<ScanResult | null>(null);
  const [fetchError, setFetchError] = useState("");

  const fetchScan = useCallback(async () => {
    try {
      const res = await fetch(`${ENGINE_URL}/scan/${scanId}`, { cache: "no-store" });
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

  // Save to localStorage when scan completes
  useEffect(() => {
    if (
      result?.status === "complete" &&
      result.total_score !== undefined &&
      result.scores &&
      result.explanation &&
      result.repo_url
    ) {
      saveToHistory({
        id: result.id,
        repo_url: result.repo_url,
        scanned_at: result.timestamp ?? new Date().toISOString(),
        total_score: result.total_score,
        recommendation: result.explanation.recommendation,
        scores: result.scores,
      });
    }
  }, [result?.status]);

  // Error state
  if (fetchError) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
        <Header />
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 32px" }}>
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "3px",
              padding: "20px 24px",
              color: "#DC2626",
              fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
              fontSize: "13px",
            }}
          >
            Failed to load scan: {fetchError}
          </div>
        </div>
      </div>
    );
  }

  // Loading / pending state
  if (!result || result.status === "pending" || result.status === "running") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", position: "relative" }}>
        <GridTracer />
        <div style={{ position: "relative", zIndex: 1 }}>
        <Header />
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "120px 32px",
            textAlign: "center",
          }}
        >
          {/* Dot pulse animation */}
          <div
            style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "32px" }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  backgroundColor: "#0274B6",
                  animation: `pulse-dot 1.4s ease-in-out ${i * 0.16}s infinite`,
                }}
              />
            ))}
          </div>

          <h2
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
              fontSize: "20px",
              fontWeight: 600,
              color: "#0B1F2A",
              marginBottom: "10px",
            }}
          >
            {result?.status === "running" ? "Analysis in progress" : "Preparing analysis"}
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: "12px",
              color: "#6B7280",
              marginBottom: "8px",
            }}
          >
            {result?.repo_url || scanId}
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 300,
              color: "#9CA3AF",
            }}
          >
            Cloning repository, running static analysis, generating AI insights — typically 15–30 seconds.
          </p>
        </div>
        </div>
      </div>
    );
  }

  // Scan error
  if (result.status === "error") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
        <Header />
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "64px 32px" }}>
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "3px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                fontSize: "16px",
                fontWeight: 600,
                color: "#DC2626",
                marginBottom: "8px",
              }}
            >
              Analysis failed
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 300,
                color: "#6B7280",
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
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <Header />

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 32px 96px" }}>

        {/* Report header */}
        <div style={{ marginBottom: "40px" }}>
          <p
            style={{
              fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              color: "#0274B6",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Audit Report
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
              fontSize: "26px",
              fontWeight: 700,
              color: "#0B1F2A",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Production Readiness Report
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "#6B7280",
            }}
          >
            {result.repo_url}
          </p>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            padding: "12px 16px",
            backgroundColor: "#FFFBEB",
            border: "1px solid #FDE68A",
            borderRadius: "3px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
              fontSize: "9px",
              fontWeight: 700,
              color: "#D97706",
              letterSpacing: "0.1em",
              flexShrink: 0,
              paddingTop: "1px",
            }}
          >
            NOTICE
          </span>
          <p
            style={{
              fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 300,
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            This report is generated by automated static analysis and AI inference. Results may be
            incomplete or inaccurate. Use this as a starting point for review, not as a definitive
            security or production audit.
          </p>
        </div>

        <Divider />

        {/* Section: Overview */}
        <SectionLabel>Overview</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "48px",
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "4px",
            padding: "32px",
          }}
        >
          {/* Score ring + verdict */}
          <div style={{ textAlign: "center" }}>
            <ScoreRing score={total_score ?? 0} />
            {rec && (
              <div
                style={{
                  marginTop: "14px",
                  display: "inline-block",
                  padding: "4px 10px",
                  backgroundColor: recCfg.bg,
                  border: `1px solid ${recCfg.border}`,
                  borderRadius: "2px",
                  fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                  fontSize: "9px",
                  fontWeight: 700,
                  color: recCfg.color,
                  letterSpacing: "0.1em",
                }}
              >
                {recCfg.label}
              </div>
            )}
          </div>

          {/* Dimension scores */}
          {scores && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <DimensionCard label="Security" score={scores.security} maxScore={50} />
              <DimensionCard label="DevOps Maturity" score={scores.devops} maxScore={30} />
              <DimensionCard label="Observability" score={scores.observability} maxScore={15} />
              <DimensionCard label="Architecture" score={scores.architecture} maxScore={15} />
            </div>
          )}
        </div>

        <Divider />

        {/* Section: Findings — two column */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>

          {/* Risk flags */}
          {flags && flags.length > 0 && (
            <div>
              <SectionLabel>Risk Flags</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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

          {/* AI Analysis */}
          {explanation && (
            <div>
              <SectionLabel>AI Analysis</SectionLabel>

              {/* Summary */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "3px",
                  padding: "18px",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 300,
                    color: "#1F2933",
                    lineHeight: 1.7,
                  }}
                >
                  {explanation.summary}
                </p>
              </div>

              {/* Top risks */}
              {explanation.risks.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E5E7EB",
                    borderRadius: "3px",
                    padding: "18px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#9CA3AF",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "14px",
                    }}
                  >
                    Top Risks
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {explanation.risks.map((risk, i) => (
                      <div key={i} style={{ borderLeft: "2px solid #E5E7EB", paddingLeft: "12px" }}>
                        <p
                          style={{
                            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                            fontSize: "12px",
                            fontWeight: 600,
                            color: "#0B1F2A",
                            marginBottom: "4px",
                          }}
                        >
                          {risk.title}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                            fontSize: "11px",
                            fontWeight: 300,
                            color: "#6B7280",
                            marginBottom: "2px",
                          }}
                        >
                          <strong style={{ color: "#DC2626", fontWeight: 500 }}>Impact — </strong>
                          {risk.impact}
                        </p>
                        <p
                          style={{
                            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                            fontSize: "11px",
                            fontWeight: 300,
                            color: "#6B7280",
                          }}
                        >
                          <strong style={{ color: "#059669", fontWeight: 500 }}>Fix — </strong>
                          {risk.fix}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section: Remediation Roadmap */}
        {explanation && explanation.roadmap.length > 0 && (
          <>
            <Divider />
            <SectionLabel>Remediation Roadmap</SectionLabel>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: "4px",
                padding: "8px 24px",
              }}
            >
              {explanation.roadmap.map((item, i) => (
                <RoadmapItem
                  key={i}
                  priority={item.priority}
                  action={item.action}
                  effort={item.effort}
                />
              ))}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
