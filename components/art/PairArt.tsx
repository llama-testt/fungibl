import type { Backdrop, Launch } from "@/lib/launches";
import { NftCard, StoneCoin } from "./Objects";

const PLATE = "/img/hero.jpg";

// Slices of the landscape plate used as backdrops (size, position).
const BACKDROPS: Record<Backdrop, { size: string; pos: string; tint?: string }> = {
  summit: { size: "205%", pos: "84% 62%" },
  sky: { size: "260%", pos: "8% 18%" },
  cloud: { size: "370%", pos: "49% 0%", tint: "brightness(1.02)" },
  valley: { size: "250%", pos: "4% 86%" },
  haze: { size: "230%", pos: "0% 60%" },
  moon: { size: "400%", pos: "100% 0%" },
};

/**
 * The coin and its collection shown as one physical pairing, sitting in a
 * slice of the same landscape. `summit` uses the original hero artifact.
 */
export function PairArt({
  launch,
  className = "",
  showCaption = true,
}: {
  launch: Launch;
  className?: string;
  showCaption?: boolean;
}) {
  const b = BACKDROPS[launch.backdrop];
  const real = launch.backdrop === "summit";
  return (
    <div className={`group/art relative overflow-hidden bg-[#c8b89a] ${className}`}>
      <div
        className="photo absolute inset-0 transition-transform duration-[1600ms] ease-slow group-hover/art:scale-[1.03]"
        style={{ backgroundImage: `url(${PLATE})`, backgroundSize: b.size, backgroundPosition: b.pos, filter: b.tint }}
      />
      {!real && (
        <>
          {/* the paired object */}
          <div className="absolute inset-x-0 bottom-[12%] flex items-end justify-center gap-0 transition-transform duration-[1600ms] ease-slow group-hover/art:scale-[1.03]">
            <StoneCoin
              letter={launch.ticker[0]}
              className="relative z-[1] -mr-[6%] mb-[1%] w-[35%] drop-shadow-[8px_10px_10px_rgba(50,30,10,0.35)]"
            />
            <div className="w-[30%] origin-bottom rotate-[5deg] transition-transform duration-[1200ms] ease-slow group-hover/art:rotate-[3.5deg]">
              <NftCard
                seed={launch.seed}
                palette={launch.palette}
                number={launch.index}
                className="w-full drop-shadow-[10px_12px_10px_rgba(50,30,10,0.38)]"
              />
            </div>
          </div>
          {/* ground ledge from the same plate, buries the base */}
          <div
            className="photo absolute inset-x-0 bottom-0 h-[26%]"
            style={{
              backgroundImage: `url(${PLATE})`,
              backgroundSize: "220%",
              backgroundPosition: "72% 83%",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 38%)",
              maskImage: "linear-gradient(to bottom, transparent 0%, #000 38%)",
            }}
          />
          {/* warm light wash, ties objects to scene */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_20%_10%,rgba(255,226,170,0.28),transparent_60%)] mix-blend-soft-light" />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,240,210,0.08),rgba(40,28,15,0.12))]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="film-grain" />
      </div>
      {showCaption && (
        <div className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-label text-ink/70">
          Coin <span className="px-1 text-ink/40">+</span> Collection
        </div>
      )}
    </div>
  );
}
