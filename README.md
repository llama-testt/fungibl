# Fungibl — landing page & app UI

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 3.4

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Routes
- `/` — full homepage: hero window, live launches, coin ⇄ NFT mechanic, how it works, explore, create, footer
- `/explore` — filterable launch index (Live / New / Trending / Graduated)
- `/create` — three-step coin + collection flow with live paired-object preview
- `/launch/[id]` — launch detail with the two-way exchange (static params from `lib/launches.ts`)

## Structure
- `components/Navbar, Hero, StatsStrip, LaunchRow, LaunchGallery, Mechanic, Exchange, HowItWorks, Explore, CreateFlow, Footer, ui`
- `components/art/` — `PairArt` (coin + collection in one scene), `Objects` (SVG stone coin + mosaic NFT card), `pixel.ts` (seeded pixel characters)
- `lib/launches.ts` — mock launch data + formatters
- Tokens live in `tailwind.config.ts` (paper #EFE4CE, ink #20201E, muted #6B6258, charcoal #22211F, line rgba(32,32,30,.22))

## Hero image
`public/img/hero.jpg` is a cleaned plate made from the reference mockup (the baked-in UI text was painted out, then upscaled).
It is a placeholder: swap in a full-resolution render (~2600px wide, same composition — objects on the right, open sky on the left)
at the same path. Launch thumbnails and the footer window crop from this same plate, so they update with it.

## Fonts
Geist Sans (headlines, via `geist`) + IBM Plex Mono (interface text, via `@fontsource`) — both bundled locally, no Google Fonts fetch.
