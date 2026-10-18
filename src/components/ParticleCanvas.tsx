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

// ────────── Internal types ──────────
interface Star {
  x: number; y: number; size: number;
  alpha: number; twinkleSpeed: number; twinkleOffset: number;
}

interface VortexStreak {
  radius: number; angle: number; length: number;
  speed: number; color: string; width: number;
}

interface Spark {
  angle: number; radius: number; speed: number;
  size: number; alpha: number; color: string;
}

interface Bokeh {
  x: number; y: number; size: number;
  color: string; alpha: number; driftX: number; driftY: number;
}

interface CollapsingWord {
  text: string; startAngle: number; startDist: number; color: string;
}

// ────────── Resolved edge with pixel coords ──────────
interface ResolvedEdge {
  fromIdx: number;
  toIdx: number;
}

// ────────── Animated node state ──────────
interface AnimatedNode {
  // Rest position (pixels)
  baseX: number; baseY: number;
  // Current animated position
  x: number; y: number;
  // Vortex pull params
  angle: number; distFromCenter: number; orbitSpeed: number;
  // Visual
  radius: number; color: string;
  // Float dynamics matching FloatingLabel DOM component
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

    // ─── Entities ────────────────────────────────
    let stars: Star[] = [];
    let animNodes: AnimatedNode[] = [];
    let resolvedEdges: ResolvedEdge[] = [];
    let streaks: VortexStreak[] = [];
    let sparks: Spark[] = [];
    let bokehs: Bokeh[] = [];

    const collapsingWords: CollapsingWord[] = [
      { text: 'DATA STREAM', startAngle: 0.8, startDist: 340, color: '#38bdf8' },
      { text: 'AI CONTENT',  startAngle: 2.4, startDist: 380, color: '#818cf8' },
      { text: 'DEVELOPER',   startAngle: 3.9, startDist: 360, color: '#34d399' },
      { text: 'FINANCE',     startAngle: 5.2, startDist: 350, color: '#a78bfa' },
      { text: 'LOST?',       startAngle: 1.6, startDist: 320, color: '#f472b6' },
      { text: 'DSA',         startAngle: 4.6, startDist: 310, color: '#60a5fa' },
    ];

    // ─── Build node index for edge resolution ────
    const nodeIndexById = new Map<string, number>();

    /** Convert percentage positions → pixels and build animated nodes */
    const buildGraphEntities = (w: number, h: number) => {
      nodeIndexById.clear();
      animNodes = [];

      // Filter nodes hidden on mobile
      const visibleNodes: GraphNode[] = isMobile
        ? GRAPH_NODES.filter((n) => !n.hideOnMobile)
        : [...GRAPH_NODES];

      const cx = w / 2;
      const cy = h / 2;

      for (let i = 0; i < visibleNodes.length; i++) {
        const n = visibleNodes[i];
        nodeIndexById.set(n.id, i);

        const px = (n.x / 100) * w;
        const py = (n.y / 100) * h;
        const color = CATEGORY_COLORS[n.category].dot;
        const radius = DOT_SIZES[n.size] / 2;
        const phase = (n.x * 0.13 + n.y * 0.07) % (Math.PI * 2);
        const speed = 3.5 + (n.x % 7) * 0.25;
        const floatDist = n.size === 'lg' ? 6 : n.size === 'md' ? 8 : 10;

        animNodes.push({
          baseX: px, baseY: py, x: px, y: py,
          angle: Math.atan2(py - cy, px - cx),
          distFromCenter: Math.sqrt((px - cx) ** 2 + (py - cy) ** 2),
          orbitSpeed: (Math.random() * 0.015 + 0.008),
          radius, color,
          phase, speed, floatDist,
        });
      }

      // Resolve edges to index pairs (skip edges where either node is hidden)
      resolvedEdges = [];
      for (const e of GRAPH_EDGES) {
        const fi = nodeIndexById.get(e.from);
        const ti = nodeIndexById.get(e.to);
        if (fi !== undefined && ti !== undefined) {
          resolvedEdges.push({ fromIdx: fi, toIdx: ti });
        }
      }
    };

    // ─── Init all entities ───────────────────────
    const initEntities = (w: number, h: number) => {
      isMobile = w < 768;
      const starCount = isMobile ? 60 : 130;
      const streakCount = isMobile ? 40 : 85;
      const sparkCount = isMobile ? 35 : 70;
      const bokehCount = isMobile ? 12 : 24;
      const cx = w / 2;
      const cy = h / 2;

      // Stars
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          size: Math.random() * 1.5 + 0.4,
          alpha: Math.random() * 0.7 + 0.2,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      // Graph nodes
      buildGraphEntities(w, h);

      // Vortex Streaks
      streaks = [];
      const streakColors = ['#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#34d399', '#f472b6'];
      for (let i = 0; i < streakCount; i++) {
        streaks.push({
          radius: Math.random() * Math.min(w, h) * 0.42 + 40,
          angle: Math.random() * Math.PI * 2,
          length: Math.random() * 0.8 + 0.3,
          speed: Math.random() * 0.02 + 0.01,
          color: streakColors[Math.floor(Math.random() * streakColors.length)],
          width: Math.random() * 2.2 + 1.0,
        });
      }

      // Sparks
      sparks = [];
      const sparkColors = ['#ffffff', '#fde047', '#fb923c', '#f97316', '#ea580c'];
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({
          angle: Math.random() * Math.PI * 2,
          radius: Math.random() * 140 + 10,
          speed: Math.random() * 0.04 + 0.02,
          size: Math.random() * 2.5 + 1.0,
          alpha: Math.random() * 0.9 + 0.1,
          color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        });
      }

      // Bokeh
      bokehs = [];
      const bokehColors = [
        'rgba(56,189,248,0.4)', 'rgba(192,132,252,0.4)',
        'rgba(45,212,191,0.35)', 'rgba(251,146,60,0.35)',
      ];
      for (let i = 0; i < bokehCount; i++) {
        bokehs.push({
          x: cx + (Math.random() - 0.5) * w * 0.6,
          y: cy + (Math.random() - 0.5) * h * 0.6,
          size: Math.random() * 35 + 15,
          color: bokehColors[Math.floor(Math.random() * bokehColors.length)],
          alpha: Math.random() * 0.6 + 0.2,
          driftX: (Math.random() - 0.5) * 0.3,
          driftY: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    // ─── Resize handler ─────────────────────────
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

    const handleVisibilityChange = () => { isVisible = !document.hidden; };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ─── Main render loop ────────────────────────
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

      // Mouse parallax
      const mouseOffsetX = (mouse.x - cx) * 0.035;
      const mouseOffsetY = (mouse.y - cy) * 0.035;

      // ── Background ─────────────────────────────
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

      // ── 1. STARFIELD ───────────────────────────
      const starsAlpha = Math.max(0, 1 - Math.max(0, (p - 0.42) / 0.2));
      if (starsAlpha > 0.01) {
        for (const s of stars) {
          const tw = Math.sin(time * 3 + s.twinkleOffset) * 0.35 + 0.65;
          ctx.fillStyle = `rgba(255,255,255,${s.alpha * tw * starsAlpha})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── 2. OBSIDIAN GRAPH NETWORK ──────────────
      const networkAlpha = Math.max(0, 1 - Math.max(0, (p - 0.42) / 0.16));

      if (networkAlpha > 0.01) {
        const pullProgress = Math.min(1, Math.max(0, (p - 0.12) / 0.36));

        // Update animated node positions
        for (const an of animNodes) {
          const floatY = Math.sin(time * (2 * Math.PI / an.speed) + an.phase) * an.floatDist;
          const floatX = Math.cos(time * (2 * Math.PI / (an.speed * 1.4)) + an.phase) * (an.floatDist * 0.35);

          if (pullProgress === 0) {
            // Natural resting position with synced gentle bob
            an.x = an.baseX + floatX;
            an.y = an.baseY + floatY;
          } else {
            // Spiral vortex pull toward center
            const targetDist = Math.max(10, an.distFromCenter * (1 - pullProgress * 0.95));
            an.angle += (an.orbitSpeed + pullProgress * 0.06);
            const currentDist = an.distFromCenter * (1 - pullProgress) + targetDist * pullProgress;
            an.x = cx + Math.cos(an.angle) * currentDist + floatX * (1 - pullProgress);
            an.y = cy + Math.sin(an.angle) * currentDist + floatY * (1 - pullProgress);
          }
        }

        // Draw edges (thin gray lines like Obsidian)
        ctx.lineWidth = 1.0;
        for (const edge of resolvedEdges) {
          const n1 = animNodes[edge.fromIdx];
          const n2 = animNodes[edge.toIdx];
          const px1 = n1.x + mouseOffsetX * 0.5;
          const py1 = n1.y + mouseOffsetY * 0.5;
          const px2 = n2.x + mouseOffsetX * 0.5;
          const py2 = n2.y + mouseOffsetY * 0.5;

          ctx.strokeStyle = `rgba(148,163,184,${0.22 * networkAlpha})`; // slate-400 at 22%
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();
        }

        // Draw node dots on canvas (glow layer only — the DOM dot handles the crisp dot)
        for (const an of animNodes) {
          const px = an.x + mouseOffsetX * 0.5;
          const py = an.y + mouseOffsetY * 0.5;

          // Soft glow halo around each dot
          if (an.radius > 2.5) {
            ctx.globalAlpha = networkAlpha * 0.18;
            ctx.fillStyle = an.color;
            ctx.beginPath();
            ctx.arc(px, py, an.radius * 3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1.0;
        }
      }

      // ── 3. VORTEX STREAKS (Phase 2) ────────────
      let vortexAlpha = 0;
      if (p >= 0.12 && p <= 0.62) {
        if (p < 0.22) vortexAlpha = (p - 0.12) / 0.10;
        else if (p < 0.48) vortexAlpha = 1.0;
        else vortexAlpha = Math.max(0, 1 - (p - 0.48) / 0.14);
      }

      if (vortexAlpha > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        const vortexSpeedMul = 1 + (p - 0.15) * 4.5;
        const streakLenBoost = Math.min(1.8, 1 + (p - 0.15) * 2.5);

        for (const st of streaks) {
          st.angle += st.speed * vortexSpeedMul;
          let currentR = st.radius;
          if (p > 0.40) currentR = Math.max(10, currentR * (1 - (p - 0.40) / 0.22));

          ctx.strokeStyle = st.color;
          ctx.lineWidth = st.width * (1 + (p - 0.15) * 1.5);
          ctx.globalAlpha = vortexAlpha * 0.65;
          ctx.beginPath();
          ctx.arc(cx + mouseOffsetX * 0.2, cy + mouseOffsetY * 0.2,
                  currentR, st.angle, st.angle + st.length * streakLenBoost, false);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── 4. SINGULARITY (Phase 2.5) ─────────────
      if (p >= 0.44 && p <= 0.74) {
        let singI = 0;
        if (p < 0.62) singI = Math.min(1, (p - 0.44) / 0.18);
        else singI = Math.max(0, 1 - (p - 0.62) / 0.10);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // A. Filament rings
        const ringCount = isMobile ? 6 : 14;
        for (let i = 0; i < ringCount; i++) {
          const rWave = (45 + i * 16) + Math.sin(time * 4 + i) * 8;
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : '#c084fc';
          ctx.globalAlpha = singI * 0.55;
          ctx.beginPath();
          ctx.ellipse(cx, cy,
            rWave * (1.1 + Math.sin(time * 2 + i) * 0.15),
            rWave * 0.85, time * 0.6 + i * 0.4, 0, Math.PI * 2);
          ctx.stroke();
        }

        // B. Light rays
        const rayCount = isMobile ? 18 : 32;
        const maxRayLen = Math.min(width, height) * 0.48 * singI;
        for (let i = 0; i < rayCount; i++) {
          const rA = (i / rayCount) * Math.PI * 2 + time * 0.35;
          const rL = maxRayLen * (0.6 + Math.sin(i * 3 + time * 5) * 0.4);
          const rW = (i % 3 === 0 ? 3.5 : 1.5) * singI;
          const rx = cx + Math.cos(rA) * rL;
          const ry = cy + Math.sin(rA) * rL;
          const rG = ctx.createLinearGradient(cx, cy, rx, ry);
          rG.addColorStop(0, 'rgba(255,255,255,0.95)');
          rG.addColorStop(0.3, 'rgba(254,215,170,0.7)');
          rG.addColorStop(0.7, 'rgba(249,115,22,0.35)');
          rG.addColorStop(1, 'rgba(234,88,12,0)');
          ctx.strokeStyle = rG;
          ctx.lineWidth = rW;
          ctx.globalAlpha = singI * 0.85;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rx, ry); ctx.stroke();
        }

        // C. Sparks
        for (const sp of sparks) {
          sp.angle += sp.speed * (1 + singI * 2.5);
          sp.radius += Math.sin(time * 6) * 0.8;
          const sx = cx + Math.cos(sp.angle) * sp.radius * singI * 1.5;
          const sy = cy + Math.sin(sp.angle) * (sp.radius * 0.85) * singI * 1.5;
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = sp.alpha * singI * 0.9;
          ctx.beginPath(); ctx.arc(sx, sy, sp.size * (1 + singI), 0, Math.PI * 2); ctx.fill();
          const tx = sx - Math.cos(sp.angle) * 8;
          const ty = sy - Math.sin(sp.angle) * 8;
          ctx.lineWidth = 1.0; ctx.strokeStyle = sp.color;
          ctx.globalAlpha = sp.alpha * singI * 0.4;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(tx, ty); ctx.stroke();
        }

        // D. Bokeh
        for (const bk of bokehs) {
          bk.x += bk.driftX; bk.y += bk.driftY;
          ctx.fillStyle = bk.color;
          ctx.globalAlpha = bk.alpha * singI * 0.55;
          ctx.beginPath(); ctx.arc(bk.x, bk.y, bk.size, 0, Math.PI * 2); ctx.fill();
        }

        // E. Core
        const coreSize = (65 + Math.sin(time * 8) * 12) * singI;
        const outerG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 3.2);
        outerG.addColorStop(0, 'rgba(255,255,255,0.95)');
        outerG.addColorStop(0.2, 'rgba(254,240,138,0.85)');
        outerG.addColorStop(0.5, 'rgba(249,115,22,0.5)');
        outerG.addColorStop(0.8, 'rgba(168,85,247,0.2)');
        outerG.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = outerG; ctx.globalAlpha = singI;
        ctx.beginPath(); ctx.arc(cx, cy, coreSize * 3.2, 0, Math.PI * 2); ctx.fill();

        const innerG = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
        innerG.addColorStop(0, '#ffffff');
        innerG.addColorStop(0.4, '#ffffff');
        innerG.addColorStop(0.8, '#fef08a');
        innerG.addColorStop(1, 'rgba(253,186,116,0.2)');
        ctx.fillStyle = innerG; ctx.globalAlpha = 1.0;
        ctx.beginPath(); ctx.arc(cx, cy, coreSize, 0, Math.PI * 2); ctx.fill();

        // F. Collapsing words
        if (p >= 0.46 && p <= 0.62) {
          const sf = (p - 0.46) / 0.16;
          ctx.font = '600 13px "JetBrains Mono", monospace';
          for (const word of collapsingWords) {
            const wd = Math.max(20, word.startDist * (1 - sf));
            const wa = word.startAngle + sf * 3.5;
            const wx = cx + Math.cos(wa) * wd;
            const wy = cy + Math.sin(wa) * (wd * 0.85);
            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(wa + Math.PI / 2);
            ctx.scale(1 + sf * 0.8, 1 - sf * 0.4);
            ctx.fillStyle = word.color;
            ctx.globalAlpha = (1 - sf) * 0.9;
            ctx.fillText(word.text, -30, 0);
            ctx.restore();
          }
        }

        ctx.restore();

        // G. Flash
        if (p >= 0.60 && p <= 0.67) {
          let flashA = p <= 0.625
            ? (p - 0.60) / 0.025
            : Math.max(0, 1 - (p - 0.625) / 0.045);
          ctx.save();
          ctx.fillStyle = `rgba(255,255,255,${flashA * 0.95})`;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      }

      // ── 5. FLOOR REFLECTION (Phase 3) ──────────
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
