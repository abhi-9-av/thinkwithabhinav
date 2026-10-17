export interface LabelConfig {
  id: string;
  text: string;
  // Position as percentage of viewport (0 to 100)
  x: number;
  y: number;
  // Color theme
  theme: 'blue' | 'indigo' | 'green' | 'teal' | 'purple' | 'pink';
  // Animation parameters
  floatSpeed: number;     // seconds per float cycle
  floatDistance: number;  // px vertical travel
  floatPhase: number;     // initial radian offset
  hideOnMobile?: boolean; // hide on smaller screens to prevent clutter
}

export const LABELS_CONFIG: LabelConfig[] = [
  {
    id: 'dsa',
    text: 'DSA',
    x: 30,
    y: 23,
    theme: 'blue',
    floatSpeed: 4.2,
    floatDistance: 12,
    floatPhase: 0.5,
  },
  {
    id: 'ai',
    text: 'AI',
    x: 42,
    y: 22,
    theme: 'indigo',
    floatSpeed: 3.8,
    floatDistance: 10,
    floatPhase: 1.2,
  },
  {
    id: 'finance-top',
    text: 'FINANCE',
    x: 61,
    y: 19,
    theme: 'green',
    floatSpeed: 4.5,
    floatDistance: 14,
    floatPhase: 2.1,
  },
  {
    id: 'lost-top',
    text: 'LOST?',
    x: 74,
    y: 29,
    theme: 'pink',
    floatSpeed: 3.5,
    floatDistance: 12,
    floatPhase: 3.4,
  },
  {
    id: 'developer',
    text: 'DEVELOPER',
    x: 81,
    y: 49,
    theme: 'green',
    floatSpeed: 4.0,
    floatDistance: 15,
    floatPhase: 0.8,
  },
  {
    id: 'content-1',
    text: 'CONTENT',
    x: 67,
    y: 75,
    theme: 'teal',
    floatSpeed: 3.6,
    floatDistance: 11,
    floatPhase: 1.9,
  },
  {
    id: 'content-2',
    text: 'CONTENT',
    x: 79,
    y: 75,
    theme: 'green',
    floatSpeed: 4.4,
    floatDistance: 13,
    floatPhase: 4.1,
    hideOnMobile: true,
  },
  {
    id: 'lost-bottom',
    text: 'LOST?',
    x: 57,
    y: 77,
    theme: 'purple',
    floatSpeed: 3.9,
    floatDistance: 12,
    floatPhase: 2.7,
  },
  {
    id: 'finance-bottom',
    text: 'FINANCE',
    x: 33,
    y: 77,
    theme: 'blue',
    floatSpeed: 4.1,
    floatDistance: 13,
    floatPhase: 5.2,
  },
  {
    id: 'design',
    text: 'DESIGN',
    x: 17,
    y: 69,
    theme: 'purple',
    floatSpeed: 3.7,
    floatDistance: 14,
    floatPhase: 0.3,
  },
  {
    id: 'art',
    text: 'ART',
    x: 22,
    y: 58,
    theme: 'pink',
    floatSpeed: 4.6,
    floatDistance: 10,
    floatPhase: 3.0,
  },
  {
    id: 'music',
    text: 'MUSIC',
    x: 18,
    y: 42,
    theme: 'purple',
    floatSpeed: 4.3,
    floatDistance: 12,
    floatPhase: 1.6,
  },
];

export const THEME_STYLES = {
  blue: {
    border: 'border-blue-400/40',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    text: 'text-blue-200',
    dot: 'bg-blue-400',
    bg: 'bg-blue-950/40',
  },
  indigo: {
    border: 'border-indigo-400/40',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.4)]',
    text: 'text-indigo-200',
    dot: 'bg-indigo-400',
    bg: 'bg-indigo-950/40',
  },
  green: {
    border: 'border-emerald-400/40',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.4)]',
    text: 'text-emerald-200',
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-950/40',
  },
  teal: {
    border: 'border-teal-400/40',
    glow: 'shadow-[0_0_20px_rgba(45,212,191,0.4)]',
    text: 'text-teal-200',
    dot: 'bg-teal-400',
    bg: 'bg-teal-950/40',
  },
  purple: {
    border: 'border-purple-400/40',
    glow: 'shadow-[0_0_20px_rgba(192,132,252,0.4)]',
    text: 'text-purple-200',
    dot: 'bg-purple-400',
    bg: 'bg-purple-950/40',
  },
  pink: {
    border: 'border-pink-400/40',
    glow: 'shadow-[0_0_20px_rgba(244,114,182,0.4)]',
    text: 'text-pink-200',
    dot: 'bg-pink-400',
    bg: 'bg-pink-950/40',
  },
};

