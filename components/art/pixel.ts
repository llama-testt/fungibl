/**
 * Deterministic pixel-character generator for NFT cards.
 * Characters are mirrored, 12 × 15 cells, built from a few hand-drawn
 * half-templates plus seeded mutations — so every coin gets "a face".
 */

// Left half (6 columns, outer → centre). Mirrored to make 12 columns.
// . bg   h hat/hair   f face   d dark   e eye-white   b body   a accent
const TEMPLATES: string[][] = [
  // 0 — brimmed hat, round face (after the hero artifact)
  [
    "......", "...hhh", "..hhhh", "..hhhh", ".hhhhh", "..ffff", "..fedd", "..ffff",
    "...ffd", "...fff", "....bb", "..bbbb", ".bbbab", ".bbbbb", ".bbbbb",
  ],
  // 1 — pointed ears (dog / fox)
  [
    "......", ".d....", ".dd...", ".dfd..", "..ffff", "..ffff", "..edff", "..ffff",
    "...fff", "....dd", "....ff", "..bbbb", ".bbbbb", ".bbabb", ".bbbbb",
  ],
  // 2 — antennae, wide head (moth / insect)
  [
    "..d...", "...d..", "...d..", "..ffff", ".fffff", ".fdeff", ".fffff", "..ffff",
    "...fdd", "....ff", "...bbb", ".bbbbb", "bbbbab", ".bbbbb", "..bbbb",
  ],
  // 3 — tall hair, narrow face
  [
    "...hhh", "..hhhh", "..hhhh", "..hfff", "..ffff", "..fdef", "..ffff", "...fff",
    "...ffd", "...fff", "....bb", "...bbb", "..bbab", ".bbbbb", ".bbbbb",
  ],
];

export type Palette = { bg: string; bg2: string; h: string; f: string; d: string; e: string; b: string; a: string };

// Muted, mineral palettes — no neon.
export const PALETTES: Palette[] = [
  { bg: "#8E8AA0", bg2: "#7B7890", h: "#B9C98F", f: "#C8D4A2", d: "#2A2B2A", e: "#E7E6D6", b: "#3B3D3A", a: "#B9C98F" },
  { bg: "#B89F83", bg2: "#A58D72", h: "#4A3B31", f: "#E2CDAA", d: "#231E1A", e: "#F1E6CF", b: "#6D5646", a: "#C9B17A" },
  { bg: "#9FAAA0", bg2: "#8A968C", h: "#6B5A45", f: "#D9C7A4", d: "#262624", e: "#EFE8D6", b: "#51584D", a: "#C08A5C" },
  { bg: "#C9B99A", bg2: "#B8A787", h: "#7D8A92", f: "#A7B2B3", d: "#22211F", e: "#EEE6D2", b: "#56606A", a: "#D6C38F" },
  { bg: "#7F8B8E", bg2: "#6E797C", h: "#C9A36B", f: "#DCC9A5", d: "#1F2122", e: "#F0E7D4", b: "#A0694A", a: "#E1CE9B" },
  { bg: "#A79485", bg2: "#957F70", h: "#5F6B4F", f: "#98A77E", d: "#23241F", e: "#EDE4CE", b: "#3F4538", a: "#D1B06B" },
];

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

export type Cell = { x: number; y: number; k: string; j: number };

export function buildSprite(seed: number): Cell[] {
  const r = rng(seed * 9301 + 49297);
  const tpl: string[][] = TEMPLATES[seed % TEMPLATES.length].map((row) => row.split(""));

  // Mutations
  if (r() > 0.55) tpl[6] = tpl[6].map((c, i) => (c === "." || i < 2 ? c : "d")); // shades band
  if (r() > 0.6) tpl[12][1 + Math.floor(r() * 4)] = "a"; // badge
  if (r() > 0.7 && !tpl[0].some((c) => c !== ".")) tpl[0][5] = "a"; // crest

  const cells: Cell[] = [];
  for (let y = 0; y < 15; y++) {
    const half = tpl[y];
    const full = [...half, ...[...half].reverse()];
    for (let x = 0; x < 12; x++) {
      cells.push({ x, y, k: full[x], j: r() });
    }
  }
  return cells;
}

/** Nudge a hex colour lighter/darker for the mosaic tile variance. */
export function jitter(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  const r = c((n >> 16) & 255), g = c((n >> 8) & 255), b = c(n & 255);
  return `rgb(${r},${g},${b})`;
}
