import React, { useRef, useEffect } from 'react';
import { LabelConfig, THEME_STYLES } from '../config/labels';

interface FloatingLabelProps {
  config: LabelConfig;
  progressRef: React.MutableRefObject<number>;
}

export const FloatingLabel: React.FC<FloatingLabelProps> = ({ config, progressRef }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const theme = THEME_STYLES[config.theme] || THEME_STYLES.blue;

  useEffect(() => {
    let animId: number;
    let time = 0;

    const update = () => {
      time += 0.016;
      const el = containerRef.current;
      if (!el) {
        animId = requestAnimationFrame(update);
        return;
      }

      const p = progressRef.current;

      // When progress > 0.60, completely hide
      if (p >= 0.60) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        animId = requestAnimationFrame(update);
        return;
      }

      // Idle float oscillation
      const floatY = Math.sin(time * (2 * Math.PI / config.floatSpeed) + config.floatPhase) * config.floatDistance;
      const floatX = Math.cos(time * (2 * Math.PI / (config.floatSpeed * 1.3)) + config.floatPhase) * (config.floatDistance * 0.4);

      // Phase 2 & 2.5: inward swirl towards center (50vw, 50vh)
      let inwardX = 0;
      let inwardY = 0;
      let scale = 1;
      let opacity = 1;

      if (p > 0.15) {
        // Pull progress: 0.15 to 0.55
        const pullFactor = Math.min(1, Math.max(0, (p - 0.15) / 0.40));
        
        // Target center is (50, 50) in percentage
        const deltaX = 50 - config.x;
        const deltaY = 50 - config.y;

        // Spiral swirl offset
        const swirlAngle = pullFactor * Math.PI * 1.5;
        const currentPull = Math.pow(pullFactor, 1.8);

        inwardX = (deltaX * currentPull * 0.95) + Math.sin(swirlAngle) * 20 * pullFactor;
        inwardY = (deltaY * currentPull * 0.95) + Math.cos(swirlAngle) * 20 * pullFactor;

        scale = Math.max(0.1, 1 - pullFactor * 0.85);

        if (p > 0.45) {
          // Rapid fade out into singularity
          opacity = Math.max(0, 1 - (p - 0.45) / 0.12);
        }
      }

      el.style.opacity = `${opacity}`;
      el.style.transform = `translate3d(calc(${inwardX}vw + ${floatX}px), calc(${inwardY}vh + ${floatY}px), 0) scale(${scale})`;
      el.style.pointerEvents = opacity < 0.2 ? 'none' : 'auto';

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [config, progressRef]);

  return (
    <div
      ref={containerRef}
      className={`absolute select-none z-10 transition-shadow duration-300 will-change-transform ${
        config.hideOnMobile ? 'hidden md:block' : 'block'
      }`}
      style={{
        left: `${config.x}%`,
        top: `${config.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full border backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${theme.bg} ${theme.border} ${theme.glow}`}
      >
        {/* Soft glowing beacon dot */}
        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shadow-[0_0_8px_currentColor] animate-pulse`} />
        
        {/* Label text */}
        <span className={`font-mono text-[11px] md:text-xs font-semibold tracking-wider uppercase ${theme.text}`}>
          {config.text}
        </span>
      </div>
    </div>
  );
};

