"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@/app/Sentra-logo.png";

export default function Header() {
  return (
    <header style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #E5E7EB" }}>
      <div
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "0 32px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo + wordmark */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}
        >
          <Image src={logo} alt="Sentra" height={28} width={28} style={{ display: "block" }} />
          <span
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
              fontWeight: 700,
              fontSize: "17px",
              color: "#0B1F2A",
              letterSpacing: "-0.01em",
            }}
          >
            {/* Sentra */}
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <Link
            href="/history"
            style={{
              fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              color: "#6B7280",
              textDecoration: "none",
            }}
          >
            History
          </Link>
          <Link
            href="/credits"
            style={{
              fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              color: "#6B7280",
              textDecoration: "none",
            }}
          >
            Credits
          </Link>
        </nav>
      </div>
    </header>
  );
}
