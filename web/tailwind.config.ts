import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0F172A",
        },
        accent: "#2563EB",
        good: "#16A34A",
        warn: "#D97706",
        risk: "#DC2626",
        border: "#E5E7EB",
        muted: "#6B7280",
        surface: "#1E293B",
      },
      fontFamily: {
        heading: ["IBM Plex Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "4px",
        md: "6px",
      },
    },
  },
  plugins: [],
};

export default config;
