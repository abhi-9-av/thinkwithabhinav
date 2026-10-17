import React, { useRef, useEffect } from 'react';

interface CharacterLayerProps {
  progressRef: React.MutableRefObject<number>;
  mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const CharacterLayer: React.FC<CharacterLayerProps> = ({ progressRef, mousePosRef }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

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

      // Phase 3: completely hidden
      if (p >= 0.62) {
        el.style.opacity = '0';
        el.style.display = 'none';
        animId = requestAnimationFrame(update);
        return;
      }
      el.style.display = 'block';

      // Mouse parallax
      const mouse = mousePosRef.current;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const mouseParallaxX = (mouse.x - cx) * -0.02;
      const mouseParallaxY = (mouse.y - cy) * -0.02;

      // Base idle bobbing & rotation (Phase 1)
      const idleY = Math.sin(time * 1.5) * 8;
      const idleRot = Math.sin(time * 1.2) * 2.5;

      let scale = 1;
      let rot = idleRot;
      let opacity = 1;
      let yOffset = idleY;

      if (p > 0.15 && p <= 0.45) {
        // Phase 2: Swarm / vortex begins dragging
        const swarmProgress = (p - 0.15) / 0.30;
        rot = idleRot + swarmProgress * 15; // gradual tilt
        scale = 1 - swarmProgress * 0.12; // slight compression
      } else if (p > 0.45) {
        // Phase 2.5: Singularity suck-in
        const suckProgress = Math.min(1, (p - 0.45) / 0.15); // 0.45 to 0.60
        scale = Math.max(0.01, (1 - 0.12) * (1 - suckProgress * 0.98));
        rot = idleRot + 15 + suckProgress * 180; // spins into singularity
        opacity = Math.max(0, 1 - suckProgress * 1.2);
        yOffset = idleY * (1 - suckProgress);
      }

      el.style.opacity = `${opacity}`;
      el.style.transform = `translate3d(calc(-50% + ${mouseParallaxX}px), calc(-50% + ${yOffset + mouseParallaxY}px), 0) rotate(${rot}deg) scale(${scale})`;

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [progressRef, mousePosRef]);

  return (
    <div
      ref={containerRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 will-change-transform"
      style={{
        width: 'clamp(240px, 34vw, 440px)',
      }}
    >
      <div className="relative w-full aspect-[345/260] filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]">
        <img
          src={`${import.meta.env.BASE_URL}assets/character-falling.png`}
          alt="Student free-falling through ideas"
          loading="lazy"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
        {/* Soft atmospheric blue/purple rim glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/10 via-teal-500/10 to-transparent blur-2xl pointer-events-none -z-10" />
      </div>
    </div>
  );
};

