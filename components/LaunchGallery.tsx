import Link from "next/link";
import { PairArt } from "./art/PairArt";
import { LaunchRow, Progress } from "./LaunchRow";
import { Arrow, Reveal, SectionHead } from "./ui";
import { fmtInt, fmtPrice, fmtUsd, launches } from "@/lib/launches";

export function LaunchGallery() {
  const featured = launches[0];
  const rows = launches.filter((l) => l.status !== "graduated").slice(1, 5);
  const f = featured;

  return (
    <section id="launches" className="mx-auto max-w-[1680px] px-6 pt-28 md:px-[4.2vw] md:pt-[11vw]">
      <SectionHead index="01" label="Live launches" right={<span className="hidden md:inline">Coin + collection, launched together</span>} />

      <Reveal className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12">
        <h2 className="text-[44px] font-[330] leading-[0.98] tracking-tightest md:col-span-7 md:text-[clamp(48px,5.4vw,96px)]">
          Every coin
          <br />
          has a face.
        </h2>
        <p className="max-w-[34em] self-end font-mono text-[13px] leading-[1.7] text-muted md:col-span-4 md:col-start-9">
          On Fungibl a token never launches alone. Each coin is minted with a native NFT collection — the same project, in two
          forms. Hold the liquid half, collect the singular half, or move between them.
        </p>
      </Reveal>

      {/* Featured spread */}
      <Reveal className="mt-14 grid gap-8 md:mt-20 md:grid-cols-12 md:gap-[3vw]">
        <Link href={`/launch/${f.id}`} className="group block md:col-span-7">
          <PairArt launch={f} className="window aspect-[4/3] w-full !rounded-[18px]" />
        </Link>

        <div className="flex flex-col md:col-span-5">
          <div className="flex items-center justify-between border-b border-line pb-4 font-mono text-[11px] uppercase tracking-label">
            <span className="flex items-center gap-2">
              <span className="h-[6px] w-[6px] rounded-full bg-ink" /> Live / {f.index}
            </span>
            <span className="text-muted">Launched {f.launchedAgo} ago</span>
          </div>

          <h3 className="mt-8 text-[56px] font-[340] leading-[0.92] tracking-tightest md:text-[clamp(56px,6vw,108px)]">{f.name}</h3>
          <p className="mt-4 font-mono text-[14px] text-muted">${f.ticker}</p>
          <p className="mt-6 max-w-[30em] font-mono text-[13px] leading-[1.7] text-ink/80">{f.blurb}</p>

          <div className="mt-10 grid grid-cols-2 border-t border-line">
            <div className="border-r border-line py-6 pr-6">
              <p className="label">Coin</p>
              <p className="mt-3 text-[34px] tracking-[-0.03em]">{fmtPrice(f.price)}</p>
              <p className="mt-1 font-mono text-[12px] text-muted">Market cap {fmtUsd(f.marketCap)}</p>
            </div>
            <div className="py-6 pl-6">
              <p className="label">Collection</p>
              <p className="mt-3 text-[34px] tracking-[-0.03em]">
                {fmtInt(f.minted)}
                <span className="text-muted"> / {fmtInt(f.supply)}</span>
              </p>
              <p className="mt-1 font-mono text-[12px] text-muted">Minted · floor {f.floor} ETH</p>
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-label text-muted">
              <span>Launch progress</span>
              <span className="text-ink">{f.progress}%</span>
            </div>
            <Progress value={f.progress} className="mt-3" />
            <div className="mt-5 flex justify-between font-mono text-[12px] text-muted">
              <span>{fmtInt(f.holders)} holders</span>
              <span>
                {fmtInt(f.ratio)} ${f.ticker} ⇄ 1 NFT
              </span>
            </div>
          </div>

          <Link href={`/launch/${f.id}`} className="group mt-auto inline-flex items-center gap-3 pt-10 font-mono text-[13px] uppercase tracking-label">
            <span className="u-link">View launch</span> <Arrow />
          </Link>
        </div>
      </Reveal>

      {/* The rest, as an editorial index */}
      <div className="mt-20 md:mt-28">
        {rows.map((l) => (
          <Reveal key={l.id}>
            <LaunchRow launch={l} />
          </Reveal>
        ))}
        <div className="flex items-center justify-between border-t border-line pt-6 font-mono text-[12px] uppercase tracking-label">
          <span className="text-muted">Showing 5 of 320+</span>
          <Link href="/explore" className="group inline-flex items-center gap-3">
            <span className="u-link">All launches</span> <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
