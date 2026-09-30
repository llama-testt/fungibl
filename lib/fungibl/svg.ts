import { PALETTES, buildSprite, jitter } from "@/components/art/pixel";

export function coinSeed(coin: string) {
  let h = 0;
  for (let i = 2; i < coin.length; i++) h = (h * 31 + coin.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministic face for NFT `id` of the collection attached to `coin`. */
export function faceTraits(coin: string, id: number) {
  const base = coinSeed(coin.toLowerCase());
  const seed = (base + id * 7919) % 100_003;
  const palette = (base + id * 5 + Math.floor(seed / 13)) % PALETTES.length;
  const template = seed % 4;
  return { seed, palette, template };
}

/** Stone-framed mosaic card, 600×810, as a standalone SVG. */
export function faceSvg(coin: string, id: number) {
  const { seed, palette } = faceTraits(coin, id);
  const p = PALETTES[palette];
  const cells = buildSprite(seed);
  const S = 40, ox = 60, oy = 110;
  const tiles = cells
    .map((c) => {
      const base = c.k === "." ? ((c.x + c.y) % 3 === 0 ? p.bg2 : p.bg) : (p as Record<string, string>)[c.k];
      return `<rect x="${ox + c.x * S + 2}" y="${oy + c.y * S + 2}" width="${S - 4}" height="${S - 4}" rx="3" fill="${jitter(base, (c.j - 0.5) * 0.09)}"/>`;
    })
    .join("");
  const num = String(id).padStart(3, "0");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 810" width="600" height="810">
<defs><filter id="s" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="4" seed="3" result="t"/><feDiffuseLighting in="t" lighting-color="#fff7e6" surface-scale="1.6" result="l"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting><feComposite in="l" in2="SourceGraphic" operator="arithmetic" k1="1.05" k2="0" k3="0" k4="0" result="m"/><feComposite in="m" in2="SourceGraphic" operator="in"/></filter></defs>
<rect width="600" height="810" fill="#EFE4CE"/>
<rect x="5" y="5" width="590" height="800" rx="28" fill="#CFC2A6" filter="url(#s)"/>
<rect x="5" y="5" width="590" height="800" rx="28" fill="none" stroke="#6A5F4C" stroke-opacity="0.45" stroke-width="3"/>
<rect x="${ox - 14}" y="${oy - 14}" width="${12 * S + 28}" height="${15 * S + 28}" rx="8" fill="#2A2926" opacity="0.85"/>
${tiles}
<text x="522" y="80" text-anchor="end" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="40" font-weight="600" fill="#2A2926" opacity="0.8">${num}</text>
</svg>`;
}
