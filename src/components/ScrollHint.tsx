import React, { useRef, useEffect, useState } from 'react';

interface ScrollHintProps {
  progressRef: React.MutableRefObject<number>;
}

export const ScrollHint: React.FC<ScrollHintProps> = ({ progressRef }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hintText, setHintText] = useState("SCROLL TO EXPLORE");

  useEffect(() => {
    let animId: number;

    const update = () => {
      const el = containerRef.current;
      if (!el) {
        animId = requestAnimationFrame(update);
        return;
      }

      const p = progressRef.current;

      // Text change at 0.15
      if (p >= 0.15 && hintText !== "SCROLLING DOWN...") {
        setHintText("SCROLLING DOWN...");
      } else if (p < 0.15 && hintText !== "SCROLL TO EXPLORE") {
        setHintText("SCROLL TO EXPLORE");
      }

      // Fades out between 0.40 and 0.52
      let opacity = 1;
      if (p > 0.38) {
        opacity = Math.max(0, 1 - (p - 0.38) / 0.14);
      }

      el.style.opacity = `${opacity}`;
      el.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [progressRef, hintText]);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-20 pointer-events-none select-none transition-opacity duration-300"
    >
      <span className="font-mono text-[10px] md:text-xs tracking-[0.25em] text-zinc-400 uppercase font-medium">
        {hintText}
      </span>

      {/* Animated Mouse Icon */}
      <div className="w-5 h-8 rounded-full border border-zinc-400/60 flex items-start justify-center p-1.5 shadow-[0_0_10px_rgba(255,255,255,0.1)]">
        <span className="w-1 h-2 bg-zinc-300 rounded-full animate-bounce" />
      </div>
    </div>
  );
};

