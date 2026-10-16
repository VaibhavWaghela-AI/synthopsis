import LandingPage from "@/components/landing/page";

export const metadata = {
  title: "Synthopsis | Deploy AI Workforce",
  description: "The reinvention of business operations through AI agents as infrastructure.",
};

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#111216] text-[#111216] p-2 sm:p-4 md:p-6 font-sans">
      <main className="hud-wrapper flex flex-col min-h-[calc(100vh-48px)] relative">
        <div className="scanlines" />
        {/* Corner Crosshairs */}
        <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-[url('/assets/vectors/hud-crosshairs.svg')] bg-contain opacity-50 z-40 pointer-events-none" />
        <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-[url('/assets/vectors/hud-crosshairs.svg')] bg-contain opacity-50 z-40 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-2.5 h-2.5 bg-[url('/assets/vectors/hud-crosshairs.svg')] bg-contain opacity-50 z-40 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-2.5 h-2.5 bg-[url('/assets/vectors/hud-crosshairs.svg')] bg-contain opacity-50 z-40 pointer-events-none" />
        
        <LandingPage />
      </main>
    </div>
  );
}
