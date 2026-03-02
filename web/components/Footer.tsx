"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #E5E7EB",
        backgroundColor: "#FFFFFF",
        padding: "0 32px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left — personal links */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span
          style={{
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "#1F2933",
          }}
        >
          Fawaz Bailey
        </span>

        <div style={{ display: "flex", gap: "16px" }}>
          <a
            href="https://github.com/priest-2105"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              color: "#6B7280",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0274B6")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/fawazbailey/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 400,
              color: "#6B7280",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0274B6")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
          >
            LinkedIn
          </a>
        </div>
      </div>

      {/* Right — credits */}
      <Link
        href="/credits"
        style={{
          fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
          fontSize: "12px",
          fontWeight: 400,
          color: "#6B7280",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#0274B6")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
      >
        Credits
      </Link>
    </footer>
  );
}
