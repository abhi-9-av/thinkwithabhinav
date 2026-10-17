import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NavbarProps {
  progressRef: React.MutableRefObject<number>;
  onNavigate: (targetId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ progressRef, onNavigate }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pillBgRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'about' | 'journey'>('home');
  const [isResolutionPhase, setIsResolutionPhase] = useState(false);

  useEffect(() => {
    let animId: number;

    const update = () => {
      const p = progressRef.current;
      const pillBg = pillBgRef.current;

      // In Phase 3 (0.70 - 1.00), background disappears to become plain text links
      if (p >= 0.68) {
        if (!isResolutionPhase) setIsResolutionPhase(true);
        if (pillBg) {
          const fadeOut = Math.max(0, 1 - (p - 0.68) / 0.08);
          pillBg.style.opacity = `${fadeOut}`;
        }
      } else {
        if (isResolutionPhase) setIsResolutionPhase(false);
        if (pillBg) {
          pillBg.style.opacity = '1';
        }
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [progressRef, isResolutionPhase]);

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'about', label: 'ABOUT' },
    { id: 'journey', label: 'JOURNEY' },
  ] as const;

  const handleClick = (id: 'home' | 'about' | 'journey') => {
    setActiveTab(id);
    onNavigate(id);
  };

  return (
    <header className="fixed top-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div
        ref={containerRef}
        className="relative flex items-center px-2 py-1.5 pointer-events-auto transition-all duration-500"
      >
        {/* Floating frosted glass pill background (fades out in Phase 3) */}
        <div
          ref={pillBgRef}
          className="absolute inset-0 rounded-full bg-[#121826]/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] transition-opacity duration-300 pointer-events-none"
        />

        {/* Navigation Items */}
        <nav className="relative flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`relative px-4 py-1.5 rounded-full font-sans text-xs tracking-wider uppercase font-semibold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {/* Active highlight pill when glass mode is on */}
                {isActive && !isResolutionPhase && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-full bg-white/10 border border-white/15 -z-10 shadow-[0_0_12px_rgba(255,255,255,0.15)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

