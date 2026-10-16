import type { Metadata } from "next";
import { Syne, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({ 
  subsets: ["latin"], 
  variable: "--font-display",
  weight: ["400", "700", "800"]
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  weight: ["400", "500", "600"]
});

const jetBrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono",
  weight: ["400", "500"]
});

export const metadata: Metadata = {
  title: "Synthopsis | Deploy AI Workforce",
  description: "The reinvention of business operations through AI agents as infrastructure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>
      <body className="antialiased">
        <main className="hud-wrapper flex flex-col min-h-[calc(100vh-48px)]">
          <div className="scanlines"></div>
          {/* Corner Crosshairs */}
          <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-[url('/assets/vectors/hud-crosshairs.svg')] bg-contain opacity-50 z-40"></div>
          <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-[url('/assets/vectors/hud-crosshairs.svg')] bg-contain opacity-50 z-40"></div>
          <div className="absolute bottom-4 left-4 w-2.5 h-2.5 bg-[url('/assets/vectors/hud-crosshairs.svg')] bg-contain opacity-50 z-40"></div>
          <div className="absolute bottom-4 right-4 w-2.5 h-2.5 bg-[url('/assets/vectors/hud-crosshairs.svg')] bg-contain opacity-50 z-40"></div>
          
          {children}
        </main>
      </body>
    </html>
  );
}
