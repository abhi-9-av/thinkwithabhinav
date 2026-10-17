import React, { useEffect, useRef } from 'react';

interface ParticleCanvasProps {
  progressRef: React.MutableRefObject<number>;
  mousePosRef: React.MutableRefObject<{ x: number; y: number }>;
}

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface Node {
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  originalColor: string;
  angle: number;
  distFromCenter: number;
  orbitSpeed: number;
}

interface VortexStreak {
  radius: number;
  angle: number;
  length: number;
  speed: number;
  color: string;
  width: number;
  spiralOffset: number;
}

interface Spark {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
}

interface Bokeh {
  x: number;
  y: number;
  size: number;
  color: string;
  alpha: number;
  driftX: number;
  driftY: number;
}

interface CollapsingWord {
  text: string;
  startAngle: number;
  startDist: number;
  color: string;
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

    // Detect mobile
    let isMobile = window.innerWidth < 768;

    // Entities
    let stars: Star[] = [];
    let nodes: Node[] = [];
    let streaks: VortexStreak[] = [];
    let sparks: Spark[] = [];
    let bokehs: Bokeh[] = [];

    const collapsingWords: CollapsingWord[] = [
      { text: 'DATA STREAM', startAngle: 0.8, startDist: 340, color: '#38bdf8' },
      { text: 'AI CONTENT', startAngle: 2.4, startDist: 380, color: '#818cf8' },
      { text: 'DEVELOPER', startAngle: 3.9, startDist: 360, color: '#34d399' },
      { text: 'FINANCE', startAngle: 5.2, startDist: 350, color: '#a78bfa' },
      { text: 'LOST?', startAngle: 1.6, startDist: 320, color: '#f472b6' },
      { text: 'DSA', startAngle: 4.6, startDist: 310, color: '#60a5fa' },
    ];

    const pickNodeColor = (normalizedX: number) => {
      // Blends purple/pink on left, teal in middle, emerald on right (Frame 1)
      if (normalizedX < 0.35) {
        return Math.random() > 0.4 ? '#c084fc' : '#f472b6'; // purple / pink
      } else if (normalizedX < 0.65) {
        return Math.random() > 0.4 ? '#2dd4bf' : '#38bdf8'; // teal / sky
      } else {
        return Math.random() > 0.4 ? '#34d399' : '#4ade80'; // emerald / soft green
      }
    };

    const initEntities = (w: number, h: number) => {
      isMobile = w < 768;
      const starCount = isMobile ? 60 : 130;
      const nodeCount = isMobile ? 65 : 150;
      const streakCount = isMobile ? 40 : 85;
      const sparkCount = isMobile ? 35 : 70;
      const bokehCount = isMobile ? 12 : 24;

      // Stars
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.5 + 0.4,
          alpha: Math.random() * 0.7 + 0.2,
          twinkleSpeed: Math.random() * 0.03 + 0.01,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      // Constellation Nodes
      nodes = [];
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < nodeCount; i++) {
        // Distribute in a wide halo around center so center is free for character
        let nx = Math.random() * w;
        let ny = Math.random() * h;
        const dx = nx - cx;
        const dy = ny - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Push away from character in center during Phase 1
        if (dist < 130) {
          const pushAngle = Math.atan2(dy, dx);
          nx = cx + Math.cos(pushAngle) * (140 + Math.random() * 80);
          ny = cy + Math.sin(pushAngle) * (140 + Math.random() * 80);
        }

        const color = pickNodeColor(nx / w);
        const angle = Math.atan2(ny - cy, nx - cx);

        nodes.push({
          baseX: nx,
          baseY: ny,
          x: nx,
          y: ny,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.8 + 1.2,
          color,
          originalColor: color,
          angle,
          distFromCenter: Math.sqrt((nx - cx) ** 2 + (ny - cy) ** 2),
          orbitSpeed: (Math.random() * 0.015 + 0.008) * (Math.random() > 0.5 ? 1 : 1),
        });
      }

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
          spiralOffset: Math.random() * 30,
        });
      }

      // Singularity Sparks (Embers)
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
          decay: Math.random() * 0.02 + 0.005,
        });
      }

      // Bokeh Orbs
      bokehs = [];
      const bokehColors = ['rgba(56, 189, 248, 0.4)', 'rgba(192, 132, 252, 0.4)', 'rgba(45, 212, 191, 0.35)', 'rgba(251, 146, 60, 0.35)'];
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

    // Main render loop
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

      // Mouse parallax offsets (smooth and subtle)
      const mouseOffsetX = (mouse.x - cx) * 0.035;
      const mouseOffsetY = (mouse.y - cy) * 0.035;

      // BACKGROUND CLEAR & COLOR DYNAMICS
      // Phase 1 -> Phase 2.5: Deep navy (#05060d) fades to pure black (#000000)
      let bgR = 5;
      let bgG = 6;
      let bgB = 13;
      if (p > 0.45) {
        // Fade to pure black #000000 by 0.68
        const blackFactor = Math.min(1, Math.max(0, (p - 0.45) / 0.22));
        bgR = Math.round(5 * (1 - blackFactor));
        bgG = Math.round(6 * (1 - blackFactor));
        bgB = Math.round(13 * (1 - blackFactor));
      }

      ctx.save();
      ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
      ctx.fillRect(0, 0, width, height);

      // 1. STARFIELD (Twinkling space dots)
      // Stars fade out as we transition into singularity / resolution
      const starsAlphaFactor = Math.max(0, 1 - Math.max(0, (p - 0.42) / 0.2));
      if (starsAlphaFactor > 0.01) {
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          const twinkle = Math.sin(time * 3 + s.twinkleOffset) * 0.35 + 0.65;
          const a = s.alpha * twinkle * starsAlphaFactor;
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. CONSTELLATION NETWORK (Phase 1 & Phase 2)
      // Nodes drift gently in Phase 1 (0 -> 0.15)
      // Swarm / spiral vortex pulls them inward in Phase 2 (0.15 -> 0.45)
      // Fully collapses and fades into singularity (0.45 -> 0.60)
      const networkAlpha = Math.max(0, 1 - Math.max(0, (p - 0.42) / 0.16));

      if (networkAlpha > 0.01) {
        const pullProgress = Math.min(1, Math.max(0, (p - 0.12) / 0.36)); // 0.12 to 0.48
        const lineDistThreshold = isMobile ? 85 : (120 - pullProgress * 40);

        // Update node positions
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];

          if (pullProgress === 0) {
            // Natural cosmic drift
            node.x += node.vx;
            node.y += node.vy;

            // Soft bounce boundaries
            if (node.x < 10 || node.x > width - 10) node.vx *= -1;
            if (node.y < 10 || node.y > height - 10) node.vy *= -1;
          } else {
            // Gravitational vortex pull
            const targetDist = Math.max(10, node.distFromCenter * (1 - pullProgress * 0.95));
            node.angle += (node.orbitSpeed + pullProgress * 0.06);
            
            // Blend from natural position towards orbital spiral
            const currentDist = node.distFromCenter * (1 - pullProgress) + targetDist * pullProgress;
            node.x = cx + Math.cos(node.angle) * currentDist;
            node.y = cy + Math.sin(node.angle) * currentDist;
          }
        }

        // Render network connections
        ctx.lineWidth = 0.85;
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          const px1 = n1.x + mouseOffsetX * 0.5;
          const py1 = n1.y + mouseOffsetY * 0.5;

          // Connect to nearby neighbours (capped count for 60fps)
          let connected = 0;
          for (let j = i + 1; j < nodes.length; j++) {
            if (connected > 4) break;
            const n2 = nodes[j];
            const px2 = n2.x + mouseOffsetX * 0.5;
            const py2 = n2.y + mouseOffsetY * 0.5;

            const ddx = px1 - px2;
            const ddy = py1 - py2;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);

            if (dist < lineDistThreshold) {
              connected++;
              const lineAlpha = (1 - dist / lineDistThreshold) * 0.38 * networkAlpha;
              ctx.strokeStyle = n1.color;
              ctx.globalAlpha = lineAlpha;
              ctx.beginPath();
              ctx.moveTo(px1, py1);
              ctx.lineTo(px2, py2);
              ctx.stroke();
            }
          }
        }

        // Render node points
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          const px = node.x + mouseOffsetX * 0.5;
          const py = node.y + mouseOffsetY * 0.5;

          ctx.globalAlpha = networkAlpha * 0.85;
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(px, py, node.radius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle glow around larger nodes
          if (node.radius > 2.0) {
            ctx.globalAlpha = networkAlpha * 0.25;
            ctx.beginPath();
            ctx.arc(px, py, node.radius * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1.0;
      }

      // 3. VORTEX STREAKS (Phase 2: 0.15 -> 0.45, collapsing in Phase 2.5: 0.45 -> 0.60)
      // Swirling motion-blurred curved trails around center (Frame 2)
      let vortexAlpha = 0;
      if (p >= 0.12 && p <= 0.62) {
        if (p < 0.22) {
          vortexAlpha = (p - 0.12) / 0.10;
        } else if (p < 0.48) {
          vortexAlpha = 1.0;
        } else {
          vortexAlpha = Math.max(0, 1 - (p - 0.48) / 0.14);
        }
      }

      if (vortexAlpha > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        const vortexSpeedMultiplier = 1 + (p - 0.15) * 4.5;
        const streakLengthBoost = Math.min(1.8, 1 + (p - 0.15) * 2.5);

        for (let i = 0; i < streaks.length; i++) {
          const st = streaks[i];
          st.angle += st.speed * vortexSpeedMultiplier;

          // As singularity approaches, streaks spiral tightly toward center
          let currentR = st.radius;
          if (p > 0.40) {
            const collapseR = Math.max(10, currentR * (1 - (p - 0.40) / 0.22));
            currentR = collapseR;
          }

          const arcStart = st.angle;
          const arcEnd = st.angle + st.length * streakLengthBoost;

          ctx.strokeStyle = st.color;
          ctx.lineWidth = st.width * (1 + (p - 0.15) * 1.5);
          ctx.globalAlpha = vortexAlpha * 0.65;

          ctx.beginPath();
          ctx.arc(cx + mouseOffsetX * 0.2, cy + mouseOffsetY * 0.2, currentR, arcStart, arcEnd, false);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. THE SINGULARITY (Phase 2.5: 0.45 -> 0.70) | Frame 3
      // Radiant rays, blinding warm core, filament rings, fiery sparks, bokeh
      if (p >= 0.44 && p <= 0.74) {
        // Singularity envelope: rises 0.45 -> 0.62 (peak), declines 0.62 -> 0.72
        let singIntensity = 0;
        if (p < 0.62) {
          singIntensity = Math.min(1, Math.max(0, (p - 0.44) / 0.18));
        } else {
          singIntensity = Math.max(0, 1 - (p - 0.62) / 0.10);
        }

        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        // A. Tight concentric & spiral filament rings (teal / cyan / purple)
        const ringCount = isMobile ? 6 : 14;
        for (let i = 0; i < ringCount; i++) {
          const rBase = 45 + i * 16;
          const rWave = rBase + Math.sin(time * 4 + i) * 8;
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = i % 2 === 0 ? '#38bdf8' : '#c084fc';
          ctx.globalAlpha = singIntensity * 0.55;
          ctx.beginPath();
          ctx.ellipse(
            cx,
            cy,
            rWave * (1.1 + Math.sin(time * 2 + i) * 0.15),
            rWave * 0.85,
            time * 0.6 + i * 0.4,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }

        // B. Radiant Light Rays (28 sharp golden/white/orange ray beams)
        const rayCount = isMobile ? 18 : 32;
        const maxRayLen = Math.min(width, height) * 0.48 * singIntensity;
        for (let i = 0; i < rayCount; i++) {
          const rayAngle = (i / rayCount) * Math.PI * 2 + time * 0.35;
          const rayLength = maxRayLen * (0.6 + Math.sin(i * 3 + time * 5) * 0.4);
          const rayWidth = (i % 3 === 0 ? 3.5 : 1.5) * singIntensity;

          const rx = cx + Math.cos(rayAngle) * rayLength;
          const ry = cy + Math.sin(rayAngle) * rayLength;

          const rayGrad = ctx.createLinearGradient(cx, cy, rx, ry);
          rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          rayGrad.addColorStop(0.3, 'rgba(254, 215, 170, 0.7)');
          rayGrad.addColorStop(0.7, 'rgba(249, 115, 22, 0.35)');
          rayGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');

          ctx.strokeStyle = rayGrad;
          ctx.lineWidth = rayWidth;
          ctx.globalAlpha = singIntensity * 0.85;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(rx, ry);
          ctx.stroke();
        }

        // C. Accretion Disk Fiery Embers / Spiraling Sparks
        for (let i = 0; i < sparks.length; i++) {
          const sp = sparks[i];
          sp.angle += sp.speed * (1 + singIntensity * 2.5);
          sp.radius += Math.sin(time * 6 + i) * 0.8;

          // Logarithmic spiral outward burst
          const sx = cx + Math.cos(sp.angle) * sp.radius * singIntensity * 1.5;
          const sy = cy + Math.sin(sp.angle) * (sp.radius * 0.85) * singIntensity * 1.5;

          ctx.fillStyle = sp.color;
          ctx.globalAlpha = sp.alpha * singIntensity * 0.9;
          ctx.beginPath();
          ctx.arc(sx, sy, sp.size * (1 + singIntensity), 0, Math.PI * 2);
          ctx.fill();

          // Spark trail
          const tx = sx - Math.cos(sp.angle) * 8;
          const ty = sy - Math.sin(sp.angle) * 8;
          ctx.lineWidth = 1.0;
          ctx.strokeStyle = sp.color;
          ctx.globalAlpha = sp.alpha * singIntensity * 0.4;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }

        // D. Cyan & Purple Bokeh Orbs
        for (let i = 0; i < bokehs.length; i++) {
          const bk = bokehs[i];
          bk.x += bk.driftX;
          bk.y += bk.driftY;
          ctx.fillStyle = bk.color;
          ctx.globalAlpha = bk.alpha * singIntensity * 0.55;
          ctx.beginPath();
          ctx.arc(bk.x, bk.y, bk.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // E. Blazing Core (Concentric Hot Center)
        const coreSize = (65 + Math.sin(time * 8) * 12) * singIntensity;
        
        // Outer warm bloom
        const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 3.2);
        outerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        outerGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.85)');
        outerGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.5)');
        outerGrad.addColorStop(0.8, 'rgba(168, 85, 247, 0.2)');
        outerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = outerGrad;
        ctx.globalAlpha = singIntensity;
        ctx.beginPath();
        ctx.arc(cx, cy, coreSize * 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Inner searing white core
        const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize);
        innerGrad.addColorStop(0, '#ffffff');
        innerGrad.addColorStop(0.4, '#ffffff');
        innerGrad.addColorStop(0.8, '#fef08a');
        innerGrad.addColorStop(1, 'rgba(253, 186, 116, 0.2)');

        ctx.fillStyle = innerGrad;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
        ctx.fill();

        // F. Collapsing Stretched Text Fragments ("DATA STREAM", "AI CONTENT", etc.)
        if (p >= 0.46 && p <= 0.62) {
          const streamFactor = (p - 0.46) / 0.16; // 0 to 1
          ctx.font = '600 13px "JetBrains Mono", monospace';
          ctx.letterSpacing = '2px';

          for (let i = 0; i < collapsingWords.length; i++) {
            const word = collapsingWords[i];
            const wordDist = Math.max(20, word.startDist * (1 - streamFactor));
            const wordAngle = word.startAngle + streamFactor * 3.5;
            const wx = cx + Math.cos(wordAngle) * wordDist;
            const wy = cy + Math.sin(wordAngle) * (wordDist * 0.85);

            ctx.save();
            ctx.translate(wx, wy);
            ctx.rotate(wordAngle + Math.PI / 2);
            ctx.scale(1 + streamFactor * 0.8, 1 - streamFactor * 0.4); // motion blur stretch
            ctx.fillStyle = word.color;
            ctx.globalAlpha = (1 - streamFactor) * 0.9;
            ctx.fillText(word.text, -30, 0);
            ctx.restore();
          }
        }

        ctx.restore();

        // G. Peak Brightness Flash (around progress 0.61 - 0.66)
        if (p >= 0.60 && p <= 0.67) {
          let flashAlpha = 0;
          if (p <= 0.625) {
            flashAlpha = (p - 0.60) / 0.025; // 0 to 1
          } else {
            flashAlpha = Math.max(0, 1 - (p - 0.625) / 0.045); // 1 to 0
          }
          ctx.save();
          ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.95})`;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      }

      // 5. PHASE 3 FLOOR REFLECTION / AMBIENT LIGHT (Progress 0.70 -> 1.00)
      if (p >= 0.68) {
        const resProgress = Math.min(1, (p - 0.68) / 0.15);
        ctx.save();
        // Subtle dark reflective floor glow at bottom
        const floorGrad = ctx.createRadialGradient(cx, height, 0, cx, height, width * 0.65);
        floorGrad.addColorStop(0, `rgba(30, 41, 59, ${0.45 * resProgress})`);
        floorGrad.addColorStop(0.5, `rgba(15, 23, 42, ${0.2 * resProgress})`);
        floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = floorGrad;
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

