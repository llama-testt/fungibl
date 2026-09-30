"use client";

import { useId, useMemo } from "react";
import { PALETTES, buildSprite, jitter } from "./pixel";

/** Stone relief filter: fractal noise lit from top-left, multiplied into the shape. */
function StoneFilter({ id, freq = 0.8, scale = 1.8 }: { id: string; freq?: number; scale?: number }) {
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={4} seed={3} result="t" />
      <feDiffuseLighting in="t" lightingColor="#fff7e6" surfaceScale={scale} result="l">
        <feDistantLight azimuth={225} elevation={58} />
      </feDiffuseLighting>
      <feComposite in="l" in2="SourceGraphic" operator="arithmetic" k1={1.05} k2={0} k3={0} k4={0} result="m" />
      <feComposite in="m" in2="SourceGraphic" operator="in" />
    </filter>
  );
}

/** A weathered, carved stone coin seen at a slight angle. */
export function StoneCoin({ letter = "F", className = "" }: { letter?: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const stone = `st-${uid}`;
  const face = `fc-${uid}`;
  return (
    <svg viewBox="0 0 132 124" className={className} aria-hidden>
      <defs>
        <StoneFilter id={stone} freq={0.9} scale={2.2} />
        <radialGradient id={face} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#F1E6CE" />
          <stop offset="0.6" stopColor="#D6C8AA" />
          <stop offset="1" stopColor="#A89A7D" />
        </radialGradient>
      </defs>
      {/* thickness */}
      <ellipse cx="72" cy="63" rx="56" ry="58" fill="#8E826A" filter={`url(#${stone})`} />
      <ellipse cx="72" cy="63" rx="56" ry="58" fill="#3A2F22" opacity="0.28" />
      {/* face */}
      <ellipse cx="62" cy="62" rx="56" ry="58" fill={`url(#${face})`} filter={`url(#${stone})`} />
      <ellipse cx="62" cy="62" rx="44" ry="46" fill="none" stroke="#6E6350" strokeOpacity="0.55" strokeWidth="1.6" />
      <ellipse cx="62.8" cy="62.8" rx="44" ry="46" fill="none" stroke="#FFF6E2" strokeOpacity="0.45" strokeWidth="0.8" />
      {/* carved letter */}
      <text x="63.5" y="84.5" textAnchor="middle" fontFamily="var(--font-geist-sans), Arial" fontWeight={800} fontSize="62" fill="#FFF3DC" opacity="0.5">
        {letter}
      </text>
      <text x="62" y="83" textAnchor="middle" fontFamily="var(--font-geist-sans), Arial" fontWeight={800} fontSize="62" fill="#4A4032" opacity="0.72">
        {letter}
      </text>
      {/* hairline cracks */}
      <path d="M22 44 L34 50 L38 47 L50 55" stroke="#5B503F" strokeOpacity="0.35" strokeWidth="0.6" fill="none" />
      <path d="M86 102 L92 94 L99 96 L104 86" stroke="#5B503F" strokeOpacity="0.3" strokeWidth="0.6" fill="none" />
      {/* warm rim light */}
      <ellipse cx="62" cy="62" rx="55" ry="57" fill="none" stroke="#FFE7B8" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="90 400" strokeDashoffset="-250" />
    </svg>
  );
}

/** A stone-framed mosaic NFT card with a seeded pixel character. */
export function NftCard({
  seed,
  palette = 0,
  number = "001",
  className = "",
}: {
  seed: number;
  palette?: number;
  number?: string;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const stone = `ns-${uid}`;
  const p = PALETTES[palette % PALETTES.length];
  const cells = useMemo(() => buildSprite(seed), [seed]);
  const S = 8; // cell size
  const ox = 12, oy = 20;
  return (
    <svg viewBox="0 0 120 162" className={className} aria-hidden>
      <defs>
        <StoneFilter id={stone} freq={1.1} scale={1.6} />
      </defs>
      {/* frame */}
      <rect x="1" y="1" width="118" height="160" rx="6" fill="#CFC2A6" filter={`url(#${stone})`} />
      <rect x="1" y="1" width="118" height="160" rx="6" fill="none" stroke="#6A5F4C" strokeOpacity="0.45" />
      <rect x={ox - 3} y={oy - 3} width={12 * S + 6} height={15 * S + 6} rx="2" fill="#2A2926" opacity="0.85" />
      {/* mosaic */}
      {cells.map((c) => {
        const base = c.k === "." ? ((c.x + c.y) % 3 === 0 ? p.bg2 : p.bg) : (p as Record<string, string>)[c.k];
        return (
          <rect
            key={`${c.x}-${c.y}`}
            x={ox + c.x * S + 0.45}
            y={oy + c.y * S + 0.45}
            width={S - 0.9}
            height={S - 0.9}
            rx="0.6"
            fill={jitter(base, (c.j - 0.5) * 0.09)}
          />
        );
      })}
      {/* surface wear over the mosaic */}
      <rect x={ox} y={oy} width={12 * S} height={15 * S} fill="#E9DDC4" opacity="0.12" filter={`url(#${stone})`} />
      <text x="104" y="15" textAnchor="end" fontFamily="'IBM Plex Mono', monospace" fontSize="8.5" fontWeight={600} fill="#2A2926" opacity="0.8">
        {number}
      </text>
    </svg>
  );
}
