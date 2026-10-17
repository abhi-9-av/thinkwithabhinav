import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/Navbar';
import { HeroScene } from './components/HeroScene';
import { ArrowUpRight, Code2, Sparkles, GraduationCap, Compass, Layers } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  const handleNavigate = (targetId: string) => {
    if (!lenisRef.current) return;
    if (targetId === 'home') {
      lenisRef.current.scrollTo(0, { duration: 1.4 });
    } else {
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        lenisRef.current.scrollTo(targetEl, { duration: 1.5, offset: -20 });
      }
    }
  };

  const handleLearnMore = () => {
    handleNavigate('about');
  };

  return (
    <div className="relative min-h-screen bg-[#05060d] text-white selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Navbar */}
      <Navbar progressRef={progressRef} onNavigate={handleNavigate} />

      {/* Hero Cinematic Scroll Experience (400vh pinned) */}
      <main>
        <HeroScene
          progressRef={progressRef}
          onLearnMoreClick={handleLearnMore}
        />

        {/* Section: About */}
        <section
          id="about"
          className="relative min-h-screen w-full bg-black py-32 px-6 sm:px-12 flex flex-col justify-center border-t border-white/5"
        >
          <div className="max-w-6xl mx-auto w-full">
            {/* Header */}
            <div className="mb-16">
              <span className="font-mono text-xs text-teal-400 tracking-[0.2em] uppercase font-semibold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Who I Am
              </span>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mt-3 text-zinc-100">
                From Chaos <span className="text-zinc-500">to</span> Clarity.
              </h2>
              <p className="mt-4 max-w-2xl text-zinc-400 text-base md:text-lg leading-relaxed">
                Navigating the vast intersections of Computer Science, Design, and Artificial Intelligence.
                Synthesizing diverse interests into cohesive, impactful digital systems.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group relative p-8 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-teal-500/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6 group-hover:scale-110 transition-transform">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Systems & Algorithms</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Deep foundations in Data Structures, Algorithms, distributed architectures, and modern web application frameworks.
                </p>
              </div>

              <div className="group relative p-8 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-purple-500/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Design & Aesthetics</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Crafting sensory, fluid, and immersive human-computer interfaces with micro-interactions and cinematic motion.
                </p>
              </div>

              <div className="group relative p-8 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-blue-500/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">Applied AI & Research</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Harnessing modern neural models, creative computing, and agentic workflows to solve real-world problems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Journey */}
        <section
          id="journey"
          className="relative min-h-screen w-full bg-[#030408] py-32 px-6 sm:px-12 flex flex-col justify-center border-t border-white/5"
        >
          <div className="max-w-6xl mx-auto w-full">
            <div className="mb-16">
              <span className="font-mono text-xs text-indigo-400 tracking-[0.2em] uppercase font-semibold flex items-center gap-2">
                <GraduationCap className="w-3.5 h-3.5" />
                Milestones & Timeline
              </span>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mt-3 text-zinc-100">
                The Academic & Creative Journey
              </h2>
              <p className="mt-4 max-w-2xl text-zinc-400 text-base md:text-lg leading-relaxed">
                A continuous trajectory of learning, building, breaking, and refining.
              </p>
            </div>

            {/* Timeline items */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 rounded-2xl bg-zinc-950/60 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">Bachelor of Technology (B.Tech)</h3>
                    <p className="text-sm text-zinc-400 mt-1">Computer Science & Engineering specialization</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 font-mono text-xs text-zinc-500 uppercase tracking-wider">
                  2022 — 2026 (Ongoing)
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 rounded-2xl bg-zinc-950/60 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">Open Source & Creative Tech Exploration</h3>
                    <p className="text-sm text-zinc-400 mt-1">Interactive experiences, canvas shaders, web experiments</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 font-mono text-xs text-zinc-500 uppercase tracking-wider">
                  2023 — Present
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 rounded-2xl bg-zinc-950/60 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">Applied Artificial Intelligence & Engineering</h3>
                    <p className="text-sm text-zinc-400 mt-1">Building intelligent workflows, tools, and developer agents</p>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 font-mono text-xs text-zinc-500 uppercase tracking-wider">
                  Continuous Focus
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 border-t border-white/5 bg-black flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto text-xs text-zinc-500 font-mono">
        <div>© {new Date().getFullYear()} thinkwithabhinav.in — All rights reserved.</div>
        <div className="mt-4 sm:mt-0 flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            GitHub <ArrowUpRight className="w-3 h-3" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-300 transition-colors flex items-center gap-1"
          >
            LinkedIn <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;

