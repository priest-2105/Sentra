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
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <Image
            src={logo}
            alt="Sentra"
            height={28}
            width={28}
            style={{ display: "block" }}
          />
       
        </Link>

        <span
          style={{
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 400,
            color: "#6B7280",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Production Intelligence
        </span>
      </div>
    </header>
  );
}
