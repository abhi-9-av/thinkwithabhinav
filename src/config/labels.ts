// ──────────────────────────────────────────────────────
// Graph Config — Obsidian-style knowledge graph
// Each node has a category (determines color), a size tier,
// and explicit connections (edges) to other nodes by id.
// Positions are in % of viewport.  Edit freely.
// ──────────────────────────────────────────────────────

export type NodeCategory =
  | 'hub'        // central "Start here" — largest, purple
  | 'learn'      // learning topics — purple/magenta
  | 'college'    // college/institutional — green
  | 'content'    // content creation — amber/gold
  | 'build'      // building / projects — blue
  | 'stack'      // tech stack — blue/indigo
  | 'explore'    // misc exploration — teal
  | 'lost';      // existential / scattered — pink/gray

export interface GraphNode {
  id: string;
  label: string;
  x: number;            // % of viewport width
  y: number;            // % of viewport height
  category: NodeCategory;
  /** 'lg' = 14px dot, 'md' = 9px dot, 'sm' = 6px dot */
  size: 'lg' | 'md' | 'sm';
  hideOnMobile?: boolean;
}

export interface GraphEdge {
  from: string;   // node id
  to: string;     // node id
}

// ─── Color palette per category ───────────────────────
export const CATEGORY_COLORS: Record<NodeCategory, { dot: string; label: string; glow: string }> = {
  hub:     { dot: '#a78bfa', label: '#c4b5fd', glow: 'rgba(167,139,250,0.5)' },  // violet
  learn:   { dot: '#c084fc', label: '#d8b4fe', glow: 'rgba(192,132,252,0.35)' },  // purple
  college: { dot: '#34d399', label: '#6ee7b7', glow: 'rgba(52,211,153,0.35)' },   // emerald
  content: { dot: '#a18249', label: '#c9a96e', glow: 'rgba(161,130,73,0.35)' },   // warm gold
  build:   { dot: '#60a5fa', label: '#93c5fd', glow: 'rgba(96,165,250,0.35)' },   // blue
  stack:   { dot: '#818cf8', label: '#a5b4fc', glow: 'rgba(129,140,248,0.35)' },  // indigo
  explore: { dot: '#2dd4bf', label: '#5eead4', glow: 'rgba(45,212,191,0.35)' },   // teal
  lost:    { dot: '#9ca3af', label: '#d1d5db', glow: 'rgba(156,163,175,0.25)' },  // gray
};

// ─── Dot pixel sizes ─────────────────────────────────
export const DOT_SIZES: Record<'lg' | 'md' | 'sm', number> = {
  lg: 14,
  md: 9,
  sm: 6,
};

// ─── Nodes ───────────────────────────────────────────
export const GRAPH_NODES: GraphNode[] = [
  // Hub — center
  { id: 'start',           label: 'Start here',         x: 48, y: 54, category: 'hub',     size: 'lg' },

  // Learn cluster (upper-center)
  { id: 'learn',           label: 'Learn',              x: 42, y: 32, category: 'learn',    size: 'md' },
  { id: 'backend-dev',     label: 'Backend Dev',        x: 50, y: 22, category: 'learn',    size: 'sm' },
  { id: 'kali-linux',      label: 'Kali Linux',         x: 52, y: 38, category: 'learn',    size: 'sm' },
  { id: 'cybersecurity',   label: 'Cybersecurity',      x: 63, y: 30, category: 'learn',    size: 'sm', hideOnMobile: true },

  // Content cluster (left)
  { id: 'content',         label: 'Content',            x: 32, y: 36, category: 'content',  size: 'md' },
  { id: 'minecraft',       label: 'Minecraft Shorts',   x: 40, y: 25, category: 'content',  size: 'sm', hideOnMobile: true },
  { id: 'linkedin',        label: 'LinkedIn',           x: 26, y: 26, category: 'content',  size: 'sm' },
  { id: 'youtube',         label: 'YouTube',            x: 40, y: 42, category: 'content',  size: 'sm' },
  { id: 'floating-chars',  label: 'Floating Characters',x: 36, y: 42, category: 'content',  size: 'sm', hideOnMobile: true },
  { id: 'chaotic',         label: 'Chaotic Abhinav',    x: 33, y: 48, category: 'content',  size: 'sm' },

  // College cluster (right)
  { id: 'college',         label: 'College',            x: 62, y: 46, category: 'college',  size: 'md' },
  { id: 'dept-of-tech',    label: 'Dept of Tech',       x: 70, y: 32, category: 'college',  size: 'sm', hideOnMobile: true },
  { id: 'bennett',         label: 'Bennett B.Tech',     x: 74, y: 42, category: 'college',  size: 'sm' },
  { id: 'gssoc',           label: 'GSSoC',              x: 36, y: 50, category: 'college',  size: 'sm', hideOnMobile: true },

  // Build cluster (center-right-bottom)
  { id: 'build',           label: 'Build',              x: 56, y: 64, category: 'build',    size: 'md' },
  { id: 'cleardrive',      label: 'ClearDrive',         x: 59, y: 54, category: 'build',    size: 'sm' },
  { id: 'python',          label: 'Python',             x: 52, y: 60, category: 'build',    size: 'sm' },
  { id: 'esp8266',         label: 'ESP8266 LED',        x: 68, y: 60, category: 'build',    size: 'sm', hideOnMobile: true },
  { id: 'kuru-ai',         label: 'Kuru AI',            x: 44, y: 66, category: 'build',    size: 'sm' },

  // Stack cluster (bottom-center)
  { id: 'stack',           label: 'Stack',              x: 46, y: 74, category: 'stack',    size: 'md' },
  { id: 'react',           label: 'React',              x: 35, y: 78, category: 'stack',    size: 'sm' },
  { id: 'portfolio',       label: 'Portfolio',          x: 48, y: 80, category: 'stack',    size: 'sm' },
  { id: 'obsidian',        label: 'Obsidian',           x: 58, y: 80, category: 'stack',    size: 'sm' },
  { id: 'ollama',          label: 'Ollama',             x: 38, y: 84, category: 'stack',    size: 'sm', hideOnMobile: true },
  { id: 'tailscale',       label: 'Tailscale',          x: 34, y: 66, category: 'stack',    size: 'sm', hideOnMobile: true },
  { id: 'cloudflare',      label: 'Cloudflare',         x: 48, y: 88, category: 'stack',    size: 'sm', hideOnMobile: true },
];

// ─── Edges (connections) ─────────────────────────────
export const GRAPH_EDGES: GraphEdge[] = [
  // Hub connections to all category nodes
  { from: 'start', to: 'learn' },
  { from: 'start', to: 'content' },
  { from: 'start', to: 'college' },
  { from: 'start', to: 'build' },
  { from: 'start', to: 'stack' },
  { from: 'start', to: 'cleardrive' },

  // Learn sub-tree
  { from: 'learn', to: 'backend-dev' },
  { from: 'learn', to: 'kali-linux' },
  { from: 'learn', to: 'cybersecurity' },
  { from: 'learn', to: 'minecraft' },

  // Content sub-tree
  { from: 'content', to: 'linkedin' },
  { from: 'content', to: 'minecraft' },
  { from: 'content', to: 'youtube' },
  { from: 'content', to: 'floating-chars' },
  { from: 'content', to: 'chaotic' },
  { from: 'content', to: 'learn' },

  // College sub-tree
  { from: 'college', to: 'dept-of-tech' },
  { from: 'college', to: 'bennett' },
  { from: 'college', to: 'gssoc' },
  { from: 'college', to: 'cybersecurity' },
  { from: 'college', to: 'build' },

  // Build sub-tree
  { from: 'build', to: 'cleardrive' },
  { from: 'build', to: 'python' },
  { from: 'build', to: 'esp8266' },
  { from: 'build', to: 'kuru-ai' },
  { from: 'build', to: 'stack' },

  // Stack sub-tree
  { from: 'stack', to: 'react' },
  { from: 'stack', to: 'portfolio' },
  { from: 'stack', to: 'obsidian' },
  { from: 'stack', to: 'ollama' },
  { from: 'stack', to: 'tailscale' },
  { from: 'stack', to: 'cloudflare' },
  { from: 'stack', to: 'kuru-ai' },

  // Cross-links (the web effect)
  { from: 'python', to: 'kuru-ai' },
  { from: 'react', to: 'portfolio' },
  { from: 'backend-dev', to: 'python' },
  { from: 'youtube', to: 'floating-chars' },
  { from: 'gssoc', to: 'chaotic' },
  { from: 'linkedin', to: 'learn' },
  { from: 'portfolio', to: 'obsidian' },
];
