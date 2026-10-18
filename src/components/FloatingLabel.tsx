import React, { useRef, useEffect } from 'react';
import { GraphNode, CATEGORY_COLORS, DOT_SIZES } from '../config/labels';

interface GraphNodeLabelProps {
  node: GraphNode;
  progressRef: React.MutableRefObject<number>;
}

/**
 * Obsidian-style graph node: a colored dot with a text label beside it.
 * As the user scrolls, ONLY these created nodes swirl and revolve around
 * the character in center, directly scrubbed by the scroll position.
 */
export const FloatingLabel: React.FC<GraphNodeLabelProps> = ({ node, progressRef }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const colors = CATEGORY_COLORS[node.category];
  const dotPx = DOT_SIZES[node.size];

  useEffect(() => {
    let animId: number;
    let time = 0;

    // Unique subtle phase and bobbing speed for resting idle float
    const phase = (node.x * 0.13 + node.y * 0.07) % (Math.PI * 2);
    const speed = 3.5 + (node.x % 7) * 0.25;
    const floatDist = node.size === 'lg' ? 6 : node.size === 'md' ? 8 : 10;

    // Initial angle and distance from viewport center (50vw, 50vh) in %
    const deltaX = node.x - 50;
    const deltaY = node.y - 50;
    const baseAngle = Math.atan2(deltaY, deltaX);
    const baseDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const update = () => {
      time += 0.016;
      const el = containerRef.current;
      if (!el) {
        animId = requestAnimationFrame(update);
        return;
      }

      const p = progressRef.current;

      // When collapsed into singularity / Phase 3, hide
      if (p >= 0.62) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        animId = requestAnimationFrame(update);
        return;
      }

      // Idle subtle floating bob (dampened as scroll increases)
      const idleDamp = Math.max(0, 1 - p * 3);
      const floatY = Math.sin(time * (2 * Math.PI / speed) + phase) * floatDist * idleDamp;
      const floatX = Math.cos(time * (2 * Math.PI / (speed * 1.4)) + phase) * (floatDist * 0.35) * idleDamp;

      let offsetX = 0;
      let offsetY = 0;
      let scale = 1;
      let opacity = 1;

      if (p <= 0.05) {
        // Phase 1: Pure resting graph with natural idle float
        offsetX = floatX;
        offsetY = floatY;
        scale = 1;
        opacity = 1;
      } else {
        // Direct scroll-driven revolution around the character (50vw, 50vh)
        // Normalized scroll factor from 0.05 to 0.58
        const scrollProgress = Math.min(1, Math.max(0, (p - 0.05) / 0.53));

        // Total rotation angle in radians directly proportional to scroll progress
        // Rotates ~3 full turns (6 * PI) as you scroll down
        const totalRevolutions = Math.PI * 6;
        const currentAngle = baseAngle + scrollProgress * totalRevolutions;

        // Radius inward spiral: starts at baseDist, tightens inward into center
        const radiusCompression = Math.max(0.02, 1 - Math.pow(scrollProgress, 1.25) * 0.98);
        const currentDist = baseDist * radiusCompression;

        // New position in viewport percentage
        const newPctX = 50 + Math.cos(currentAngle) * currentDist;
        const newPctY = 50 + Math.sin(currentAngle) * currentDist;

        // Offset from node's original percentage position (left: node.x%, top: node.y%)
        const deltaPctX = newPctX - node.x;
        const deltaPctY = newPctY - node.y;

        offsetX = (deltaPctX / 100) * window.innerWidth + floatX;
        offsetY = (deltaPctY / 100) * window.innerHeight + floatY;

        // Scale down gently as nodes spiral into the core
        scale = Math.max(0.12, 1 - scrollProgress * 0.85);

        // Fade out into singularity around p = 0.52 -> 0.60
        if (p > 0.48) {
          opacity = Math.max(0, 1 - (p - 0.48) / 0.12);
        }
      }

      el.style.opacity = `${opacity}`;
      el.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`;
      el.style.pointerEvents = opacity < 0.2 ? 'none' : 'auto';

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [node, progressRef]);

  const isHub = node.size === 'lg';
  const isMedium = node.size === 'md';

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
