import React, { useEffect, useRef } from 'react';
import {
  GRAPH_NODES,
  GRAPH_EDGES,
  CATEGORY_COLORS,
  DOT_SIZES,
  type GraphNode,
} from '../config/labels';

interface ParticleCanvasProps {
  progressRef: React.MutableRefObject<number>;
  mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
}

// ────────── Starfield ──────────
interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

// ────────── Resolved edge ──────────
interface ResolvedEdge {
  fromIdx: number;
  toIdx: number;
}

// ────────── Animated node state ──────────
interface AnimatedNode {
  basePctX: number;
  basePctY: number;
  baseAngle: number;
  baseDistPx: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  glow: string;
  phase: number;
  speed: number;
  floatDist: number;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ progressRef, mousePosRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisible = true;
    let time = 0;
    let isMobile = window.innerWidth < 768;

    // Entities
    let stars: Star[] = [];
    let animNodes: AnimatedNode[] = [];
    let resolvedEdges: ResolvedEdge[] = [];

    const nodeIndexById = new Map<string, number>();

    /** Convert graph definition into pixel positions and polar orbit coordinates */
    const buildGraphEntities = (w: number, h: number) => {
      nodeIndexById.clear();
      animNodes = [];

      const visibleNodes: GraphNode[] = isMobile
        ? GRAPH_NODES.filter((n) => !n.hideOnMobile)
        : [...GRAPH_NODES];

      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < visibleNodes.length; i++) {
        const n = visibleNodes[i];
        nodeIndexById.set(n.id, i);

        // Center-relative offsets in viewport percentages (matching FloatingLabel math)
        const deltaPctX = n.x - 50;
        const deltaPctY = n.y - 50;
        const baseAngle = Math.atan2(deltaPctY, deltaPctX);

        // Actual pixel rest position
        const px = (n.x / 100) * w;
        const py = (n.y / 100) * h;
        const baseDistPx = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);

        const colorCfg = CATEGORY_COLORS[n.category];
        const radius = DOT_SIZES[n.size] / 2;
        const phase = (n.x * 0.13 + n.y * 0.07) % (Math.PI * 2);
        const speed = 3.5 + (n.x % 7) * 0.25;
        const floatDist = n.size === 'lg' ? 6 : n.size === 'md' ? 8 : 10;

        animNodes.push({
          basePctX: n.x,
          basePctY: n.y,
          baseAngle,
          baseDistPx,
          x: px,
          y: py,
          radius,
          color: colorCfg.dot,
          glow: colorCfg.glow,
          phase,
          speed,
          floatDist,
        });
      }

      // Resolve edges
      resolvedEdges = [];
      for (const e of GRAPH_EDGES) {
        const fi = nodeIndexById.get(e.from);
        const ti = nodeIndexById.get(e.to);
        if (fi !== undefined && ti !== undefined) {
          resolvedEdges.push({ fromIdx: fi, toIdx: ti });
        }
      }
    };

    const initEntities = (w: number, h: number) => {
      isMobile = w < 768;
      const starCount = isMobile ? 60 : 120;

      // Starfield
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.4 + 0.4,
          alpha: Math.random() * 0.6 + 0.2,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      // Graph
      buildGraphEntities(w, h);
    };

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initEntities(width, height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ─── Main Render Loop ─────────────────────────
    const render = () => {
      time += 0.016;
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const p = progressRef.current;
      const mouse = mousePosRef.current;
      const cx = width / 2;
      const cy = height / 2;

      // Mouse parallax offsets
      const mouseOffsetX = (mouse.x - cx) * 0.03;
      const mouseOffsetY = (mouse.y - cy) * 0.03;

      // ── Background Transition ───────────────────
      // Smooth fade from deep dark navy (#05060d) to pure black (#000000)
      let bgR = 5, bgG = 6, bgB = 13;
      if (p > 0.45) {
        const f = Math.min(1, (p - 0.45) / 0.22);
        bgR = Math.round(5 * (1 - f));
        bgG = Math.round(6 * (1 - f));
        bgB = Math.round(13 * (1 - f));
      }
      ctx.save();
      ctx.fillStyle = `rgb(${bgR},${bgG},${bgB})`;
      ctx.fillRect(0, 0, width, height);

      // ── 1. Starfield ────────────────────────────
      const starsAlpha = Math.max(0, 1 - Math.max(0, (p - 0.45) / 0.2));
      if (starsAlpha > 0.01) {
        for (const s of stars) {
          const tw = Math.sin(time * 3 + s.twinkleOffset) * 0.35 + 0.65;
          ctx.fillStyle = `rgba(255,255,255,${s.alpha * tw * starsAlpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── 2. Graph Network (Purely Scroll-Driven) ──
      const networkAlpha = Math.max(0, 1 - Math.max(0, (p - 0.48) / 0.14));

      if (networkAlpha > 0.01) {
        // Idle bobbing dampens as scroll progresses
        const idleDamp = Math.max(0, 1 - p * 3);
        const scrollFactor = Math.min(1, Math.max(0, (p - 0.05) / 0.53));
        const totalRevolutions = Math.PI * 6; // 3 full turns across scroll
        const radiusCompression = Math.max(0.02, 1 - Math.pow(scrollFactor, 1.25) * 0.98);

        // Update exact node positions on canvas
        for (const an of animNodes) {
          const floatY = Math.sin(time * (2 * Math.PI / an.speed) + an.phase) * an.floatDist * idleDamp;
          const floatX = Math.cos(time * (2 * Math.PI / (an.speed * 1.4)) + an.phase) * (an.floatDist * 0.35) * idleDamp;

          if (p <= 0.05) {
            an.x = (an.basePctX / 100) * width + floatX;
            an.y = (an.basePctY / 100) * height + floatY;
          } else {
            // Direct scroll-scrubbed angle & distance around the character
            const curAngle = an.baseAngle + scrollFactor * totalRevolutions;
            // Center-relative percentage distance converted to current aspect-correct vector
            const curDistX = ((an.basePctX - 50) / 100) * width * radiusCompression;
            const curDistY = ((an.basePctY - 50) / 100) * height * radiusCompression;
            const dist = Math.sqrt(curDistX * curDistX + curDistY * curDistY);

            an.x = cx + Math.cos(curAngle) * dist + floatX;
            an.y = cy + Math.sin(curAngle) * dist + floatY;
          }
        }

        // Draw graph edges (thin lines connecting connected topics)
        ctx.lineWidth = 1.0;
        for (const edge of resolvedEdges) {
          const n1 = animNodes[edge.fromIdx];
          const n2 = animNodes[edge.toIdx];
          const px1 = n1.x + mouseOffsetX;
          const py1 = n1.y + mouseOffsetY;
          const px2 = n2.x + mouseOffsetX;
          const py2 = n2.y + mouseOffsetY;

          ctx.strokeStyle = `rgba(148,163,184,${0.24 * networkAlpha})`;
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();
        }

        // Draw soft halo glow behind each topic dot
        for (const an of animNodes) {
          const px = an.x + mouseOffsetX;
          const py = an.y + mouseOffsetY;
          const scale = Math.max(0.15, 1 - scrollFactor * 0.85);

          ctx.globalAlpha = networkAlpha * 0.35;
          ctx.fillStyle = an.color;
          ctx.beginPath();
          ctx.arc(px, py, an.radius * 2.8 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      // ── 3. Singularity Pulse & Flash (Phase 2.5) ─
      // When the nodes all collapse into the character, a brief singularity flash occurs
      if (p >= 0.52 && p <= 0.68) {
        let singIntensity = 0;
        if (p < 0.61) {
          singIntensity = Math.min(1, Math.max(0, (p - 0.52) / 0.09));
        } else {
          singIntensity = Math.max(0, 1 - (p - 0.61) / 0.07);
        }

        if (singIntensity > 0.01) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';

          const coreRadius = (45 + Math.sin(time * 6) * 8) * singIntensity;
          const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 2.5);
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.3, 'rgba(254,240,138,0.8)');
          coreGrad.addColorStop(0.7, 'rgba(168,85,247,0.3)');
          coreGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = coreGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, coreRadius * 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Peak flash
        if (p >= 0.60 && p <= 0.66) {
          const flashAlpha = p <= 0.62
            ? (p - 0.60) / 0.02
            : Math.max(0, 1 - (p - 0.62) / 0.04);
          ctx.save();
          ctx.fillStyle = `rgba(255,255,255,${flashAlpha * 0.9})`;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      }

      // ── 4. Floor Reflection (Phase 3 Resolution) ─
      if (p >= 0.68) {
        const rp = Math.min(1, (p - 0.68) / 0.15);
        ctx.save();
        const fG = ctx.createRadialGradient(cx, height, 0, cx, height, width * 0.65);
        fG.addColorStop(0, `rgba(30,41,59,${0.45 * rp})`);
        fG.addColorStop(0.5, `rgba(15,23,42,${0.2 * rp})`);
        fG.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fG;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [progressRef, mousePosRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
