'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [time, setTime] = useState('UTC LOAD');
  const [coords, setCoords] = useState('[X:00.00 Y:00.00]');
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    }, 1000);
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth * 100).toFixed(2);
      const y = (e.clientY / window.innerHeight * 100).toFixed(2);
      setCoords(`[X:${x} Y:${y}]`);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearInterval(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div className="flex flex-col relative z-10 w-full h-full">
      {/* 1. TOP CHROME NAV */}
      <header className="flex items-center h-14 tech-border-b px-4 md:px-6 relative z-10 justify-between">
        <Link href="/dashboard" className="font-display font-extrabold text-lg flex items-center gap-3 glitch-hover cursor-pointer">
          synthopsis
          <div className="flex gap-[2px] h-3">
            {[1,2,3,4,5].map(i => <span key={i} className={`w-[1px] bg-ink/60 ${i%2===0 ? 'h-2' : 'h-3'}`} />)}
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center font-mono text-[11px] uppercase tracking-widest gap-4">
          <Link href="/dashboard/agents" className="hover:opacity-50 transition-opacity">STUDIO</Link>
          <span className="opacity-30">/</span>
          <Link href="/dashboard/workflows" className="hover:opacity-50 transition-opacity">WORKFLOWS</Link>
          <span className="opacity-30">/</span>
          <Link href="/dashboard/analytics" className="hover:opacity-50 transition-opacity">COST METRICS ▾</Link>
          <span className="opacity-30">/</span>
          <Link href="/dashboard/inbox" className="hover:opacity-50 transition-opacity">INBOX</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center font-mono text-[10px] gap-4 hidden sm:flex">
            <span>{time}</span>
            <div className="flex gap-[2px] h-3">
              {[1,2,3,4].map(i => <span key={i} className={`w-[1px] bg-ink/60 ${i%2!==0 ? 'h-2' : 'h-3'}`} />)}
            </div>
          </div>
          <Link
            href="/dashboard"
            className="bg-[#111216] text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border border-[#111216] hover:bg-[#ff3333] transition-colors"
          >
            CONSOLE →
          </Link>
        </div>
      </header>

      {/* 2. SUB-NAV BAND */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_240px] tech-border-b min-h-[60px]">
        {/* Left: Live System Status Matrix */}
        <div className="hidden md:flex flex-col items-start justify-center tech-border-r px-4 py-3 bg-ink/5 gap-1.5">
          <div className="flex items-center gap-2 w-full">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 anim-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink/60">SYS ONLINE</span>
            <span className="ml-auto font-mono text-[8px] text-green-600 font-bold">200 OK</span>
          </div>
          <div className="flex items-center gap-2 w-full">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-red anim-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink/60">AI AGENTS</span>
            <span className="ml-auto font-mono text-[8px] text-ink/50 font-bold">4 ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 w-full">
            <svg className="w-3 h-3 text-ink/30" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="1" width="10" height="10" rx="1" />
              <line x1="1" y1="6" x2="11" y2="6" />
              <line x1="6" y1="1" x2="6" y2="11" />
            </svg>
            <span className="font-mono text-[8px] uppercase tracking-widest text-ink/40">MATRIX v4.02</span>
          </div>
        </div>

        {/* Center: Coordinates & Index */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 p-3 font-mono text-[10px] text-ink-light uppercase tracking-widest">
          <span>{coords}</span>
          <span>INDEX 001 // SEC.04</span>
        </div>

        {/* Right: Structural Blueprint Schematic */}
        <div className="hidden md:flex flex-col items-center justify-center md:border-l border-[var(--border-strong)] px-4 py-3 bg-ink/5 gap-1.5">
          <svg className="w-full h-6 opacity-40" viewBox="0 0 200 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Mini circuit / blueprint schematic lines */}
            <line x1="10" y1="12" x2="50" y2="12" stroke="#111216" strokeWidth="1" />
            <circle cx="50" cy="12" r="3" fill="none" stroke="#111216" strokeWidth="1" />
            <line x1="53" y1="12" x2="90" y2="12" stroke="#111216" strokeWidth="1" />
            <rect x="90" y="8" width="20" height="8" rx="1" fill="none" stroke="#111216" strokeWidth="1" />
            <line x1="110" y1="12" x2="140" y2="12" stroke="#111216" strokeWidth="1" />
            <circle cx="140" cy="12" r="2" fill="#FF3333" />
            <line x1="142" y1="12" x2="170" y2="12" stroke="#111216" strokeWidth="1" />
            <line x1="170" y1="6" x2="170" y2="18" stroke="#111216" strokeWidth="1" />
            <line x1="170" y1="6" x2="190" y2="12" stroke="#111216" strokeWidth="1" />
            <line x1="170" y1="18" x2="190" y2="12" stroke="#111216" strokeWidth="1" />
          </svg>
          <span className="font-mono text-[8px] uppercase tracking-widest text-ink/40">ORCHESTRATION PIPELINE // READY</span>
        </div>
      </div>

      {/* 3. HERO SECTION (SCALING FIX) */}
      <section className="flex flex-col">
        <div className="px-6 md:px-12 py-8 flex justify-between items-center">
          <div className="inline-flex items-center gap-2 bg-ink/5 px-3 py-1.5 rounded border border-ink/10 font-mono text-[10px] uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-red anim-pulse" />
            + SYNTHESIS / V4.02
          </div>
          <div className="hidden sm:inline-flex items-center bg-ink/5 px-3 py-1.5 rounded border border-ink/10 font-mono text-[10px] uppercase">
            [+] ALIGN
          </div>
        </div>

        {/* Wordmark Container - Fluid Clamps and Aspect Ratio to prevent overflow */}
        <div className="w-full flex justify-center py-6 md:py-12 px-4 md:px-12">
          <div className="w-full max-w-[1400px]">
             {/* Uses SVGs aspect ratio dynamically */}
             <img src="/assets/vectors/synthopsis-wordmark.svg" alt="Synthopsis" className="w-full h-auto object-contain drop-shadow-md" />
          </div>
        </div>

        {/* Hero Bottom Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 tech-border-t mt-8 md:mt-16">
          <div className="p-8 md:p-12 lg:border-r border-[var(--border-strong)] flex flex-col justify-between gap-10">
            <h2 className="text-2xl md:text-3xl lg:text-[42px] font-display font-extrabold tracking-tighter max-w-[600px] leading-[1.1]">
              The reinvention of business operations through AI agents as infrastructure / an orchestration platform
            </h2>
            <div>
              <p className="font-mono text-[10px] uppercase text-ink/70 mb-2">Synthopsis Core · Autonomous Platform</p>
              <p className="font-sans text-sm md:text-base font-medium max-w-md">Deploy conversational agents across Web, WhatsApp, and Voice in under 5 minutes.</p>
              
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="bg-[#ff3333] text-white font-mono text-xs font-bold uppercase tracking-wider px-5 py-2.5 border border-[#111216] shadow-[2px_2px_0px_#111216] hover:bg-black transition-all"
                >
                  DEPLOY AI WORKFORCE →
                </Link>
                <Link
                  href="/dashboard/workflows"
                  className="bg-transparent text-[#111216] font-mono text-xs font-bold uppercase tracking-wider px-4 py-2.5 border border-[#111216] hover:bg-[#111216] hover:text-white transition-all"
                >
                  VIEW WORKFLOW DAG
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col border-t lg:border-t-0 border-[var(--border-strong)]">
            <div className="flex-1 bg-accent-red flex items-center justify-center p-8 md:p-12 overflow-hidden">
              <img src="/assets/vectors/technical-glyphs.svg" alt="Glyphs" className="w-full max-w-[400px] opacity-90 object-contain" />
            </div>
            <div className="tech-border-t p-4 bg-bg-core text-center font-mono text-[10px] uppercase text-ink-light">
              INDEX / 0123456789 / SYSTEM TYP
            </div>
          </div>
        </div>
      </section>

      {/* 4. PLATFORM CAPABILITIES */}
      <section id="studio" className="tech-border-t bg-ink/5 p-8 md:p-12">
        <div className="mb-12">
          <span className="font-mono text-xs text-ink/50 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-red" /> CAPABILITIES — #002
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold mt-4">THE PLATFORM</h2>
          <p className="font-sans mt-2 text-ink/70 max-w-xl">Four integrated modules. One unified command center.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-[var(--border-strong)]">
          {[
            { title: 'AGENT STUDIO', href: '/dashboard/agents', desc: 'Deploy pre-trained AI agents across WhatsApp, Web, Email, and Voice. Zero code required.' },
            { title: 'WORKFLOW BUILDER', href: '/dashboard/workflows', desc: 'Visual drag-and-drop pipeline editor. Chain agents, triggers, and multi-channel actions.' },
            { title: 'OMNICHANNEL INBOX', href: '/dashboard/inbox', desc: 'Unified conversation hub. Threads rendered in native channel aesthetics.' },
            { title: 'ANALYTICS ENGINE', href: '/dashboard/analytics', desc: 'Real-time ROI dashboard. Response time, conversion rates, and performance.' }
          ].map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              className={`p-8 border-b md:border-b-0 ${i !== 3 ? 'lg:border-r border-[var(--border-strong)]' : ''} ${i === 0 || i === 1 ? 'md:border-b border-[var(--border-strong)] lg:border-b-0' : ''} flex flex-col gap-6 hover:bg-ink/10 transition-colors group`}
            >
              <div className="flex justify-between items-center font-mono text-[10px]">
                <span>0{i + 1}</span>
                <span className="text-[#ff3333] opacity-0 group-hover:opacity-100 transition-opacity font-bold">LAUNCH →</span>
              </div>
              <h3 className="font-display font-bold text-xl group-hover:text-[#ff3333] transition-colors">{item.title}</h3>
              <p className="font-sans text-sm text-ink/80 flex-1">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. PROCESS TIMELINE */}
      <section id="workflows" className="tech-border-t p-8 md:p-12">
        <div className="mb-12">
          <span className="font-mono text-xs text-ink/50 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-red" /> PROCESS — #003
          </span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold mt-4">DEPLOYMENT</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '01', t: 'CHOOSE TEMPLATE', d: 'Select from industry-proven presets loaded with domain expertise.' },
            { n: '02', t: 'CONFIGURE AGENT', d: 'Set channel, tone, language, and AI model. Upload your knowledge base.' },
            { n: '03', t: 'LAUNCH LIVE', d: 'One click. Your AI agent goes live across all platforms simultaneously.' }
          ].map((s) => (
            <div key={s.n} className="flex flex-col gap-4">
              <span className="font-mono text-4xl text-ink/20">{s.n}</span>
              <div className="h-px w-full bg-ink/20 relative">
                 <div className="absolute top-[-3px] right-0 w-1.5 h-1.5 bg-accent-red transform rotate-45" />
              </div>
              <h3 className="font-display font-bold text-lg">{s.t}</h3>
              <p className="font-sans text-sm text-ink/70">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. COST REDUCTION (Manual vs Synthopsis) */}
      <section id="cost" className="tech-border-t grid grid-cols-1 lg:grid-cols-2">
        {/* Manual Labor (Before) */}
        <div className="p-8 md:p-12 lg:border-r border-[var(--border-strong)] bg-ink/10 flex flex-col gap-6">
           <span className="font-mono text-[10px] text-ink/50 uppercase tracking-widest bg-ink/10 w-fit px-2 py-1 rounded">TRADITIONAL APPROACH</span>
           <h3 className="font-display font-bold text-3xl">Manual Build Cycles</h3>
           <div className="flex-1 flex flex-col gap-4 mt-4">
             <div className="flex justify-between items-center border-b border-ink/20 pb-2">
               <span className="font-mono text-sm">Development Time</span>
               <span className="font-mono text-sm text-accent-red">4-8 WEEKS</span>
             </div>
             <div className="flex justify-between items-center border-b border-ink/20 pb-2">
               <span className="font-mono text-sm">Engineering Cost</span>
               <span className="font-mono text-sm text-accent-red">₹5,00,000+</span>
             </div>
             <div className="flex justify-between items-center border-b border-ink/20 pb-2">
               <span className="font-mono text-sm">Maintenance</span>
               <span className="font-mono text-sm text-accent-red">HIGH</span>
             </div>
             <div className="flex justify-between items-center border-b border-ink/20 pb-2">
               <span className="font-mono text-sm">Scalability</span>
               <span className="font-mono text-sm text-accent-red">LIMITED</span>
             </div>
           </div>
        </div>

        {/* Synthopsis Automation (After) */}
        <div className="p-8 md:p-12 bg-ink text-bg-core flex flex-col gap-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-accent-red opacity-10 rounded-bl-full" />
           <span className="font-mono text-[10px] text-bg-core/50 uppercase tracking-widest bg-bg-core/10 w-fit px-2 py-1 rounded border border-bg-core/20">SYNTHOPSIS PLATFORM</span>
           <h3 className="font-display font-bold text-3xl text-white">Automated Orchestration</h3>
           <div className="flex-1 flex flex-col gap-4 mt-4">
             <div className="flex justify-between items-center border-b border-bg-core/20 pb-2">
               <span className="font-mono text-sm text-bg-core/80">Deployment Time</span>
               <span className="font-mono text-sm text-green-400 font-bold">&lt; 5 MINUTES</span>
             </div>
             <div className="flex justify-between items-center border-b border-bg-core/20 pb-2">
               <span className="font-mono text-sm text-bg-core/80">Subscription Cost</span>
               <span className="font-mono text-sm text-green-400 font-bold">₹4,999 / MO</span>
             </div>
             <div className="flex justify-between items-center border-b border-bg-core/20 pb-2">
               <span className="font-mono text-sm text-bg-core/80">Maintenance</span>
               <span className="font-mono text-sm text-green-400 font-bold">ZERO</span>
             </div>
             <div className="flex justify-between items-center border-b border-bg-core/20 pb-2">
               <span className="font-mono text-sm text-bg-core/80">Scalability</span>
               <span className="font-mono text-sm text-green-400 font-bold">INFINITE</span>
             </div>
           </div>
        </div>
      </section>

      {/* 7. CTA / TERMINAL FOOTER */}
      <footer className="tech-border-t p-8 md:p-16 flex flex-col items-center justify-center text-center gap-8 bg-ink/5">
         <h2 className="text-3xl md:text-5xl font-display font-extrabold max-w-2xl">
           READY TO DEPLOY YOUR AI WORKFORCE?
         </h2>
         <form
           onSubmit={(e) => {
             e.preventDefault();
             window.location.href = '/dashboard';
           }}
           className="flex flex-col sm:flex-row w-full max-w-md gap-0 font-mono"
         >
           <input
             type="email"
             required
             placeholder="ENTER WORK EMAIL_"
             className="flex-1 bg-transparent border border-[var(--border-strong)] p-3 text-sm focus:outline-none focus:bg-ink/5 uppercase"
           />
           <button
             type="submit"
             className="bg-accent-red text-white border border-accent-red px-6 py-3 text-sm font-bold hover:bg-red-600 transition-colors cursor-pointer"
           >
             INITIATE PILOT →
           </button>
         </form>
         <div className="mt-8 font-mono text-[10px] text-ink/50 uppercase tracking-widest">
           © {new Date().getFullYear()} SYNTHOPSIS · ALL RIGHTS RESERVED.
         </div>
      </footer>
    </div>
  );
}
