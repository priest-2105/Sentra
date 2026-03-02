import type { Metadata } from "next";
import { IBM_Plex_Serif, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import Footer from "@/components/Footer";
import "./globals.css";

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sentra — Production Readiness Scanner",
  description: "Security intelligence and production readiness for your GitHub repositories.",
  icons: {
    icon: "/Sentra-logo.png",
    shortcut: "/Sentra-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSerif.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable}`}
        style={{ fontFamily: "var(--font-sans), 'IBM Plex Sans', sans-serif" }}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
