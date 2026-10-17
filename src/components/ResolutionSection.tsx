import React, { useRef, useEffect, useState } from 'react';

interface ResolutionSectionProps {
  progressRef: React.MutableRefObject<number>;
  onLearnMoreClick: () => void;
}

export const ResolutionSection: React.FC<ResolutionSectionProps> = ({ progressRef, onLearnMoreClick }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const characterRef = useRef<HTMLDivElement | null>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const fullSubtitle = "MY JOURNEY AS A B.TECH STUDENT...";
  const [displayedText, setDisplayedText] = useState("");
  const letters = ['B', '.', 'T', 'e', 'c', 'h'];

  useEffect(() => {
    let animId: number;
    let lastCharCount = -1;

    const update = () => {
      const el = containerRef.current;
      if (!el) {
        animId = requestAnimationFrame(update);
        return;
      }

      const p = progressRef.current;

      // Phase 3 is active from 0.65 to 1.00
      if (p < 0.65) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.display = 'none';
        animId = requestAnimationFrame(update);
        return;
      }

      el.style.display = 'flex';
      el.style.pointerEvents = 'auto';

      // Section overall fade in: 0.66 to 0.73
      const sectionAlpha = Math.min(1, Math.max(0, (p - 0.66) / 0.07));
      el.style.opacity = `${sectionAlpha}`;

      // Letter-by-letter staggered slide up: 0.70 to 0.84
      letters.forEach((_, idx) => {
        const letterEl = lettersRef.current[idx];
        if (letterEl) {
          const letterStart = 0.69 + idx * 0.022;
          const letterProgress = Math.min(1, Math.max(0, (p - letterStart) / 0.05));
          const translateY = (1 - letterProgress) * 110;
          letterEl.style.transform = `translate3d(0, ${translateY}%, 0)`;
          letterEl.style.opacity = `${letterProgress}`;
        }
      });

      // Character slide & fade in from right: 0.74 to 0.86
      const charEl = characterRef.current;
      if (charEl) {
        const charProgress = Math.min(1, Math.max(0, (p - 0.74) / 0.10));
        const translateX = (1 - charProgress) * 45;
        charEl.style.transform = `translate3d(${translateX}px, 0, 0)`;
        charEl.style.opacity = `${charProgress}`;
      }

      // Typewriter subtitle reveal: 0.80 to 0.94
      if (p >= 0.80) {
        const typeProgress = Math.min(1, (p - 0.80) / 0.14);
        const charCount = Math.floor(typeProgress * fullSubtitle.length);
        if (charCount !== lastCharCount) {
          lastCharCount = charCount;
          setDisplayedText(fullSubtitle.slice(0, charCount));
        }
      } else {
        if (lastCharCount !== 0) {
          lastCharCount = 0;
          setDisplayedText("");
        }
      }

      // Button fade & slide up: 0.84 to 0.96
      const btnEl = buttonRef.current;
      if (btnEl) {
        const btnProgress = Math.min(1, Math.max(0, (p - 0.84) / 0.10));
        btnEl.style.opacity = `${btnProgress}`;
        btnEl.style.transform = `translate3d(0, ${(1 - btnProgress) * 20}px, 0)`;
        btnEl.style.pointerEvents = btnProgress > 0.5 ? 'auto' : 'none';
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [progressRef]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col items-center justify-between z-20 px-6 py-10 pointer-events-none select-none"
    >
      {/* Top spacer matching navbar height */}
      <div className="w-full h-16" />

      {/* Main Center Composition: "B.Tech" + Standing Character */}
      <div className="relative flex items-center justify-center w-full max-w-7xl mx-auto flex-1 my-auto">
        <div className="relative flex items-baseline justify-center">
          
          {/* Giant Typography "B.Tech" */}
          <div className="flex items-baseline font-display text-[clamp(4.5rem,19vw,17.5rem)] leading-none tracking-tight text-white select-none">
            {letters.map((char, index) => (
              <span
                key={index}
                className="inline-block overflow-hidden py-2"
              >
                <span
                  ref={(el) => { lettersRef.current[index] = el; }}
                  className="inline-block will-change-transform drop-shadow-[0_10px_35px_rgba(255,255,255,0.08)]"
                >
                  {char}
                </span>
              </span>
            ))}
          </div>

          {/* Character standing leaning against the 'h' */}
          <div
            ref={characterRef}
            className="relative -ml-[2.5vw] md:-ml-[1.5vw] z-30 self-end mb-[0.5vw] will-change-transform"
            style={{
              width: 'clamp(95px, 14vw, 195px)',
            }}
          >
            <div className="relative w-full aspect-[165/375] filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]">
              <img
                src="/assets/character-standing.png"
                alt="Student standing calmly leaning on B.Tech"
                loading="lazy"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Subtitle & Learn More Button */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pb-4">
        {/* Left balance spacer on desktop */}
        <div className="hidden md:block w-32" />

        {/* Typewriter Subtitle */}
        <div className="text-center font-mono text-xs md:text-sm tracking-[0.25em] text-zinc-300 uppercase h-6 flex items-center">
          <span>{displayedText}</span>
          <span className="inline-block w-2 h-4 ml-1 bg-teal-400 animate-pulse" />
        </div>

        {/* Learn More Button */}
        <div className="flex justify-end w-auto md:w-32">
          <button
            ref={buttonRef}
            onClick={onLearnMoreClick}
            className="group relative px-5 py-2 rounded-full border border-white/60 hover:border-white bg-transparent hover:bg-white text-white hover:text-black font-sans text-xs tracking-wider uppercase font-semibold transition-all duration-300 ease-out shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] active:scale-95 pointer-events-auto"
          >
            LEARN MORE
          </button>
        </div>
      </div>
    </div>
  );
};

