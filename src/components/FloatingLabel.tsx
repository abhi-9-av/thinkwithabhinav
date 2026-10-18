import React, { useRef, useEffect } from 'react';
import { GraphNode, CATEGORY_COLORS, DOT_SIZES } from '../config/labels';

interface GraphNodeLabelProps {
  node: GraphNode;
  progressRef: React.MutableRefObject<number>;
}

/**
 * Obsidian-style graph node: a colored dot with a text label beside it.
 * Animates with a subtle float and collapses toward center during Phase 2/2.5.
 */
export const FloatingLabel: React.FC<GraphNodeLabelProps> = ({ node, progressRef }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const colors = CATEGORY_COLORS[node.category];
  const dotPx = DOT_SIZES[node.size];

  useEffect(() => {
    let animId: number;
    let time = 0;

    // Each node gets a unique phase for its idle float
    const phase = (node.x * 0.13 + node.y * 0.07) % (Math.PI * 2);
    const speed = 3.5 + (node.x % 7) * 0.25; // 3.5 – 5.2 seconds per cycle
    const floatDist = node.size === 'lg' ? 6 : node.size === 'md' ? 8 : 10;

    const update = () => {
      time += 0.016;
      const el = containerRef.current;
      if (!el) {
        animId = requestAnimationFrame(update);
        return;
      }

      const p = progressRef.current;

      // After collapse, fully hidden
      if (p >= 0.60) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        animId = requestAnimationFrame(update);
        return;
      }

      // Idle float oscillation (gentle bob)
      const floatY = Math.sin(time * (2 * Math.PI / speed) + phase) * floatDist;
      const floatX = Math.cos(time * (2 * Math.PI / (speed * 1.4)) + phase) * (floatDist * 0.35);

      // Phase 2 & 2.5: gravitational pull toward center (50%, 50%)
      let inwardX = 0;
      let inwardY = 0;
      let scale = 1;
      let opacity = 1;

      if (p > 0.15) {
        const pullFactor = Math.min(1, Math.max(0, (p - 0.15) / 0.40));
        const deltaX = 50 - node.x;
        const deltaY = 50 - node.y;

        // Spiral swirl offset
        const swirlAngle = pullFactor * Math.PI * 1.5;
        const currentPull = Math.pow(pullFactor, 1.8);

        inwardX = (deltaX * currentPull * 0.95) + Math.sin(swirlAngle) * 18 * pullFactor;
        inwardY = (deltaY * currentPull * 0.95) + Math.cos(swirlAngle) * 18 * pullFactor;

        scale = Math.max(0.1, 1 - pullFactor * 0.85);

        if (p > 0.45) {
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
  }, [node, progressRef]);

  const isHub = node.size === 'lg';
  const isMedium = node.size === 'md';

  // Font sizing: lg = 15px semibold, md = 13px medium, sm = 11px normal
  const fontClass = isHub
    ? 'text-[15px] font-semibold'
    : isMedium
    ? 'text-[13px] font-medium'
    : 'text-[11px] font-normal';

  return (
    <div
      ref={containerRef}
      className={`absolute select-none z-10 will-change-transform ${
        node.hideOnMobile ? 'hidden md:block' : 'block'
      }`}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="flex items-center gap-2 cursor-default group">
        {/* Dot */}
        <span
          className="rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-125"
          style={{
            width: `${dotPx}px`,
            height: `${dotPx}px`,
            backgroundColor: colors.dot,
            boxShadow: `0 0 ${dotPx * 0.8}px ${colors.glow}`,
          }}
        />
        {/* Label */}
        <span
          className={`whitespace-nowrap tracking-wide ${fontClass} transition-colors duration-200`}
          style={{ color: colors.label }}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
};
