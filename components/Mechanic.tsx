import { Exchange } from "./Exchange";
import { Reveal, SectionHead } from "./ui";
import { launches } from "@/lib/launches";

const FACTS = [
  { k: "Two-way", v: "Any NFT can be returned for coins; any coins can be locked for an NFT." },
  { k: "Fixed ratio", v: "Set by the creator at launch. It never moves, so the floor has a floor." },
  { k: "Shared rewards", v: "Fees from both sides flow back to holders and the collection's promoters." },
];

export function Mechanic() {
  return (
    <section id="trade" className="mx-auto max-w-[1680px] px-6 pt-28 md:px-[4.2vw] md:pt-[11vw]">
      <SectionHead index="02" label="Coin ⇄ NFT" right={<span className="hidden md:inline">Collectible liquidity</span>} />

      <Reveal className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12">
        <h2 className="text-[44px] font-[330] leading-[0.98] tracking-tightest md:col-span-8 md:text-[clamp(48px,5.4vw,96px)]">
          One coin.
          <br />
          One collection.
        </h2>
        <p className="max-w-[30em] self-end font-mono text-[13px] leading-[1.7] text-muted md:col-span-4">
          Fungible and non-fungible are two states of the same project. Trade freely in the coin, or step out of the market and
          hold the piece.
        </p>
      </Reveal>

      <Reveal className="mt-14 rounded-[18px] border border-line bg-paper-light/40 p-6 md:mt-20 md:p-[3.2vw]">
        <Exchange launch={launches[0]} />
      </Reveal>

      <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-[3vw]">
        {FACTS.map((f, i) => (
          <Reveal key={f.k} delay={i * 120} className="border-t border-ink pt-5">
            <p className="text-[22px] tracking-[-0.03em]">{f.k}</p>
            <p className="mt-3 max-w-[28em] font-mono text-[12px] leading-[1.7] text-muted">{f.v}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
