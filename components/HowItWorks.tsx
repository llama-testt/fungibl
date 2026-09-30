import { Reveal, SectionHead } from "./ui";

const STEPS = [
  { n: "01", t: "Launch", d: "Create a coin and its native NFT collection together." },
  { n: "02", t: "Trade", d: "Trade the coin or exchange tokens for NFTs." },
  { n: "03", t: "Grow", d: "Earn rewards and help your collection move up the platform." },
];

/** Magazine spread: huge numerals, tiny mono captions, a lot of air. */
export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1680px] px-6 pt-28 md:px-[4.2vw] md:pt-[11vw]">
      <SectionHead index="03" label="How Fungibl works" right={<span className="hidden md:inline">Fungible / Non-fungible</span>} />

      <div className="grid md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal
            key={s.n}
            delay={i * 140}
            className={`border-line py-10 md:py-[4vw] ${i > 0 ? "border-t md:border-l md:border-t-0 md:pl-[2.6vw]" : "md:pr-[2.6vw]"} ${i === 1 ? "md:pr-[2.6vw]" : ""}`}
          >
            <p className="text-[140px] font-[200] leading-[0.8] tracking-[-0.07em] md:text-[clamp(150px,15vw,280px)]">{s.n}</p>
            <div className="mt-10 flex items-baseline justify-between gap-6 md:mt-[5vw]">
              <h3 className="text-[34px] tracking-[-0.035em] md:text-[clamp(30px,2.6vw,44px)]">{s.t}</h3>
              <span className="font-mono text-[10px] uppercase tracking-label text-muted">Step {s.n}</span>
            </div>
            <p className="mt-4 max-w-[22em] font-mono text-[12px] leading-[1.75] text-muted">{s.d}</p>
          </Reveal>
        ))}
      </div>
      <div className="border-t border-line" />
    </section>
  );
}
