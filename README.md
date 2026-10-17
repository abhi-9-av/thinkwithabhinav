# thinkwithabhinav.in — Cinematic Scroll Hero Experience

A scroll-driven cinematic portfolio experience built with **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**, **GSAP (ScrollTrigger)**, **Lenis**, and **HTML5 Canvas 2D**.

---

## 🎬 Narrative Concept: "Chaos to Clarity"

The experience tells the story of a student navigating a chaotic network of scattered interests before everything collapses into a singular purpose:

1. **Phase 1: The Descent (`progress: 0.00 – 0.15`)**
   - Cosmic space backdrop (`#05060d`) with a twinkling starfield.
   - Constellation network of 150+ drifting nodes with distance-based dynamic connections shifting across purple, teal, and soft green.
   - 12 frosted glass floating pills with glowing themes (`DSA`, `AI`, `FINANCE`, `LOST?`, `DEVELOPER`, `CONTENT`, `MUSIC`, `ART`, `DESIGN`).
   - 3D student character free-falling in zero-G with subtle floating bob/rotation and mouse parallax.
   - Frosted glass navbar pill at top center (`HOME`, `ABOUT`, `JOURNEY`).
   - "SCROLL TO EXPLORE" hint with animated mouse icon.

2. **Phase 2: The Swarm (`progress: 0.15 – 0.45`)**
   - Scroll hint text transitions to "SCROLLING DOWN...".
   - A glowing spiral vortex of motion-blurred arcs (teal, cyan, violet, green) spins around the character.
   - Rotation speed and streak length accelerate with scroll progress.
   - Constellation nodes and floating labels get gravitationally pulled toward the center.

3. **Phase 2.5: The Singularity (`progress: 0.45 – 0.70`)**
   - Labels and network collapse inward.
   - Stretched/motion-blurred text fragments (`DATA STREAM`, `AI CONTENT`, `DEVELOPER`, `FINANCE`, `LOST?`) spiral into the center.
   - Character shrinks and is swallowed by the singularity core.
   - Blazing radiant white-to-warm-orange core with 32 radial light rays, swirling fiery sparks, cyan/purple filament rings, and bokeh orbs.
   - Peak brightness at progress `~0.62` with a quick white flash that dissolves cleanly into pure black.

4. **Phase 3: The Resolution (`progress: 0.70 – 1.00`)**
   - Deep pure black space (`#000000`) with a subtle ground reflection glow.
   - Massive **"B.Tech"** typography (Anton font) revealed via letter-by-letter mask slide-up.
   - Character emerges standing calmly on the right, arms crossed, leaning against the letter **"h"**.
   - Monospace typewriter reveal: `"MY JOURNEY AS A B.TECH STUDENT..."`.
   - Outlined `"LEARN MORE"` pill button (fills white on hover) that smooth-scrolls to the next section.
   - Navbar smoothly morphs from glass pill to minimalist text links.

---

## 🚀 Quick Start

```bash
# In the project directory:
npm run dev

# Or from workspace root:
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## 🛠️ How to Tweak Timings, Colors & Labels

### 1. Adjusting Floating Labels & Colors
Open [`src/config/labels.ts`](./src/config/labels.ts):
- **Change label text**: Update `text: 'YOUR_LABEL'`.
- **Change position**: Modify `x` and `y` (percentage 0 to 100).
- **Change color theme**: Choose from `'blue' | 'indigo' | 'green' | 'teal' | 'purple' | 'pink'`.
- **Float timing**: Adjust `floatSpeed` (seconds per oscillation) and `floatDistance` (px amplitude).

### 2. Adjusting Timeline Progress Boundaries
Open [`src/components/HeroScene.tsx`](./src/components/HeroScene.tsx):
- **Scroll Length**: Change `end: '+=400%'` (increase for slower scrubbing, decrease for faster).
- **Scrub Damping**: Modify `scrub: 0.4` in `ScrollTrigger.create`.

To tune specific phase thresholds:
- **Phase 1 to Phase 2 transition**: Look for `p >= 0.15` in `ParticleCanvas.tsx`, `FloatingLabel.tsx`, and `ScrollHint.tsx`.
- **Phase 2.5 Singularity peak**: Controlled around `p = 0.62` in `ParticleCanvas.tsx` (`singIntensity` and flash calculation).
- **Phase 3 Resolution start**: `p >= 0.68` in `ResolutionSection.tsx`.

### 3. Replacing Character Assets
Drop your transparent background PNGs into `public/assets/`:
- `public/assets/character-falling.png` (Character free-falling)
- `public/assets/character-standing.png` (Character leaning calmly)

The app automatically renders them with responsive scaling and drop shadows.

---

## ⚡ Performance & Accessibility Highlights
- **60 FPS Canvas Loop**: Particle calculations and transformations run decoupled from React re-renders using a shared mutable `progressRef`.
- **DPR Capping**: Capped at `Math.min(window.devicePixelRatio, 2)` to eliminate GPU thermal throttling on high-DPI displays.
- **Tab Visibility Pause**: Listens to `document.visibilitychange` to automatically halt animation frames when the tab is backgrounded.
- **Prefers-Reduced-Motion**: Respects user OS accessibility preferences with a smooth crossfade mode.
- **Lenis Smooth Scroll**: Bound to GSAP's RAF ticker with `lagSmoothing(0)` for buttery smooth scrolling.
