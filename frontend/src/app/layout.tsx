import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SYNTHOPSIS // CYBERCORE",
  description: "Autonomous AI Agent Orchestration Engine for Enterprise Workflows.",
  icons: {
    icon: "/assets/vectors/synthopsis-wordmark.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&family=Syne:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f2f2f5] text-[#090a0f] antialiased cyber-grid selection:bg-[#ff2a3b] selection:text-white">
        {children}
      </body>
    </html>
  );
}
