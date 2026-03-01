import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        backgroundColor: "#1E293B",
        borderBottom: "1px solid #334155",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px",
          height: "52px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-ibm-plex), 'IBM Plex Sans', sans-serif",
            fontWeight: 700,
            fontSize: "18px",
            color: "#F1F5F9",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          sentra
        </Link>
        <span
          style={{
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontSize: "12px",
            color: "#6B7280",
          }}
        >
          Production Readiness Scanner
        </span>
      </div>
    </header>
  );
}
