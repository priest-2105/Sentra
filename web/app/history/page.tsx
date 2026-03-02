"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { getHistory, clearHistory, type HistoryEntry } from "@/lib/history";

const RECOMMENDATION_CONFIG = {
  Ready: { color: "#059669", bg: "#F0FDF4", border: "#A7F3D0", label: "READY" },
  "Needs Work": { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", label: "NEEDS WORK" },
  "Not Ready": { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", label: "NOT READY" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function repoShortName(url: string): string {
  return url.replace("https://github.com/", "");
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(getHistory());
    setLoaded(true);
  }, []);

  function handleClear() {
    clearHistory();
    setEntries([]);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <Header />

      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "56px 32px 96px" }}>

        {/* Page header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <div>
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
              Audit Log
            </p>
            <h1
              style={{
                fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
                fontSize: "26px",
                fontWeight: 700,
                color: "#0B1F2A",
                letterSpacing: "-0.02em",
              }}
            >
              Scan History
            </h1>
          </div>

          {entries.length > 0 && (
            <button
              onClick={handleClear}
              style={{
                background: "none",
                border: "1px solid #E5E7EB",
                borderRadius: "3px",
                padding: "6px 12px",
                fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                color: "#9CA3AF",
                cursor: "pointer",
              }}
            >
              Clear history
            </button>
          )}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #E5E7EB", margin: "24px 0 32px" }} />

        {/* Empty state */}
        {loaded && entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p
              style={{
                fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 300,
                color: "#9CA3AF",
                marginBottom: "16px",
              }}
            >
              No scans yet.
            </p>
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#0274B6",
                textDecoration: "none",
              }}
            >
              Run your first analysis →
            </Link>
          </div>
        )}

        {/* Entries list */}
        {entries.length > 0 && (
          <div>
            {/* Column headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 80px 140px 110px 80px",
                gap: "16px",
                padding: "0 0 10px",
                borderBottom: "1px solid #E5E7EB",
                marginBottom: "4px",
              }}
            >
              {["Repository", "Score", "Verdict", "Date", ""].map((col) => (
                <span
                  key={col}
                  style={{
                    fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#9CA3AF",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  {col}
                </span>
              ))}
            </div>

            {entries.map((entry) => {
              const rec = RECOMMENDATION_CONFIG[entry.recommendation] ?? RECOMMENDATION_CONFIG["Needs Work"];
              return (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 140px 110px 80px",
                    gap: "16px",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid #F3F4F6",
                  }}
                >
                  {/* Repo */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                      fontSize: "12px",
                      color: "#1F2933",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {repoShortName(entry.repo_url)}
                  </span>

                  {/* Score */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: entry.total_score >= 75 ? "#059669" : entry.total_score >= 50 ? "#D97706" : "#DC2626",
                    }}
                  >
                    {entry.total_score}
                    <span style={{ fontSize: "10px", fontWeight: 400, color: "#D1D5DB" }}>/100</span>
                  </span>

                  {/* Verdict badge */}
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 8px",
                      backgroundColor: rec.bg,
                      border: `1px solid ${rec.border}`,
                      borderRadius: "2px",
                      fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                      fontSize: "9px",
                      fontWeight: 700,
                      color: rec.color,
                      letterSpacing: "0.08em",
                      width: "fit-content",
                    }}
                  >
                    {rec.label}
                  </span>

                  {/* Date */}
                  <span
                    style={{
                      fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                      fontSize: "12px",
                      fontWeight: 300,
                      color: "#6B7280",
                    }}
                  >
                    {formatDate(entry.scanned_at)}
                  </span>

                  {/* Link */}
                  <Link
                    href={`/scan/${entry.id}`}
                    style={{
                      fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#0274B6",
                      textDecoration: "none",
                    }}
                  >
                    View →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
