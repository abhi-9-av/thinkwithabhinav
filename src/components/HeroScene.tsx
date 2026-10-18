import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ParticleCanvas } from './ParticleCanvas';
import { FloatingLabel } from './FloatingLabel';
import { CharacterLayer } from './CharacterLayer';
import { ResolutionSection } from './ResolutionSection';
import { ScrollHint } from './ScrollHint';
import { GRAPH_NODES } from '../config/labels';

gsap.registerPlugin(ScrollTrigger);

interface HeroSceneProps {
  onLearnMoreClick: () => void;
  progressRef: React.MutableRefObject<number>;
}

export const HeroScene: React.FC<HeroSceneProps> = ({ onLearnMoreClick, progressRef }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const mousePosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // GSAP ScrollTrigger Master Timeline
    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Reduced motion: simplified crossfade from Phase 1 to Phase 4
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: '+=200%',
          pin: pinRef.current,
          scrub: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        });
      } else {
        // Full cinematic experience: 400vh scroll length
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: '+=400%',
          pin: pinRef.current,
          anticipatePin: 1,
          scrub: 0.4,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        });
      }
    }, containerRef);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ctx.revert();
    };
  }, [progressRef]);

  return (
    <div
      ref={containerRef}
      id="home"
      className="relative w-full h-[400vh] bg-[#05060d]"
    >
      <div
        ref={pinRef}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-[#05060d]"
      >
        {/* Background 2D Canvas (Stars, Constellation Network, Vortex, Singularity, Floor Reflection) */}
        <ParticleCanvas
          progressRef={progressRef}
          mousePosRef={mousePosRef}
        />

        {/* Floating Concept Labels (Phase 1 & 2) */}
        <div className="absolute inset-0 pointer-events-none">
          {GRAPH_NODES.map((node) => (
            <FloatingLabel
              key={node.id}
              node={node}
              progressRef={progressRef}
            />
          ))}
        </div>

        {/* Character Falling & Singularity Collapse Layer */}
        <CharacterLayer
          progressRef={progressRef}
          mousePosRef={mousePosRef}
        />

        {/* Scroll Callout / Mouse Indicator */}
        <ScrollHint progressRef={progressRef} />

        {/* Phase 3 Resolution Screen (B.Tech Typography + Standing Character) */}
        <ResolutionSection
          progressRef={progressRef}
          onLearnMoreClick={onLearnMoreClick}
        />
      </div>
    </div>
  );
};

