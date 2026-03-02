import Header from "@/components/Header";

const CREDITS = [
  {
    category: "Frontend",
    items: [
      { name: "Next.js 14", description: "React framework with App Router", url: "https://nextjs.org" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework", url: "https://tailwindcss.com" },
      { name: "Lucide React", description: "Clean open-source icon set", url: "https://lucide.dev" },
    ],
  },
  {
    category: "Backend",
    items: [
      { name: "FastAPI", description: "High-performance Python web framework", url: "https://fastapi.tiangolo.com" },
      { name: "GitPython", description: "Git repository interaction library", url: "https://gitpython.readthedocs.io" },
      { name: "aiosqlite", description: "Async SQLite for Python", url: "https://aiosqlite.omnilib.dev" },
      { name: "httpx", description: "Async HTTP client for Python", url: "https://www.python-httpx.org" },
    ],
  },
  {
    category: "AI",
    items: [
      { name: "Anthropic Claude", description: "AI model powering scan explanation and remediation roadmap", url: "https://anthropic.com" },
    ],
  },
  {
    category: "Typography",
    items: [
      { name: "IBM Plex Serif & Sans", description: "Open-source typeface by IBM", url: "https://www.ibm.com/plex" },
      { name: "JetBrains Mono", description: "Monospace typeface for developers", url: "https://www.jetbrains.com/lp/mono" },
    ],
  },
  {
    category: "Infrastructure",
    items: [
      { name: "Render", description: "Cloud platform hosting the scanning engine", url: "https://render.com" },
      { name: "Vercel", description: "Frontend deployment and hosting", url: "https://vercel.com" },
    ],
  },
];

export default function CreditsPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <Header />

      <main style={{ maxWidth: "720px", margin: "0 auto", padding: "56px 32px 96px" }}>

        {/* Page header */}
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
          Acknowledgements
        </p>
        <h1
          style={{
            fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
            fontSize: "26px",
            fontWeight: 700,
            color: "#0B1F2A",
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          Credits
        </h1>
        <p
          style={{
            fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
            fontSize: "13px",
            fontWeight: 300,
            color: "#6B7280",
            lineHeight: 1.6,
          }}
        >
          Sentra is built on top of excellent open-source software and services.
        </p>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #E5E7EB", margin: "32px 0" }} />

        {/* Credit sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {CREDITS.map((section) => (
            <div key={section.category}>
              <p
                style={{
                  fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                }}
              >
                {section.category}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {section.items.map((item, i) => (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "24px",
                      padding: "12px 0",
                      borderTop: i === 0 ? "1px solid #E5E7EB" : "none",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#0274B6",
                          textDecoration: "none",
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        {item.name}
                      </a>
                      <span
                        style={{
                          fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif",
                          fontSize: "12px",
                          fontWeight: 300,
                          color: "#6B7280",
                        }}
                      >
                        {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
