import Link from "next/link";
import { notFound } from "next/navigation";
import { PairArt } from "@/components/art/PairArt";
import { Exchange } from "@/components/Exchange";
import { Footer } from "@/components/Footer";
import { Progress } from "@/components/LaunchRow";
import { Navbar } from "@/components/Navbar";
import { Arrow } from "@/components/ui";
import { fmtEth, fmtInt, fmtPrice, fmtUsd, getLaunch, launches } from "@/lib/launches";

export function generateStaticParams() {
  return launches.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const l = getLaunch((await params).id);
  return { title: l ? `${l.name} ($${l.ticker}) — Fungibl` : "Fungibl" };
}

export default async function LaunchPage({ params }: { params: Promise<{ id: string }> }) {
  const l = getLaunch((await params).id);
  if (!l) notFound();

  return (
    <main>
      <Navbar variant="paper" />
      <section className="mx-auto max-w-[1680px] px-6 pt-10 md:px-[4.2vw] md:pt-14">
        <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-label text-muted">
          <Link href="/explore" className="group inline-flex items-center gap-2 text-ink">
            <Arrow className="rotate-180" /> <span className="u-link">Explore</span>
          </Link>
          <span>/</span>
          <span>
            {l.status} / {l.index}
          </span>
        </div>

        <div className="mt-8 grid gap-10 md:grid-cols-12 md:gap-[3vw]">
          <PairArt launch={l} className="window aspect-[4/3] w-full !rounded-[20px] md:col-span-7" />
          <div className="md:col-span-5">
            <h1 className="text-[60px] font-[330] leading-[0.92] tracking-tightest md:text-[clamp(64px,6.6vw,120px)]">{l.name}</h1>
            <p className="mt-4 font-mono text-[14px] text-muted">
              ${l.ticker} <span className="px-1">+</span> {l.collection}
            </p>
            <p className="mt-6 max-w-[30em] font-mono text-[13px] leading-[1.7] text-ink/80">{l.blurb}</p>

            <dl className="mt-10 grid grid-cols-2 border-t border-line font-mono text-[12px]">
              {[
                ["Coin price", fmtPrice(l.price)],
                ["Market cap", fmtUsd(l.marketCap)],
                ["NFT floor", fmtEth(l.floor)],
                ["NFT supply", fmtInt(l.supply)],
                ["Minted", `${fmtInt(l.minted)} / ${fmtInt(l.supply)}`],
                ["Holders", fmtInt(l.holders)],
              ].map(([k, v], i) => (
                <div key={k} className={`border-b border-line py-4 ${i % 2 ? "pl-5" : "border-r pr-5"}`}>
                  <dt className="label">{k}</dt>
                  <dd className="mt-2 text-[22px] font-sans tracking-[-0.03em]">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex justify-between font-mono text-[11px] uppercase tracking-label text-muted">
              <span>Launch progress</span>
              <span className="text-ink">{l.progress}%</span>
            </div>
            <Progress value={l.progress} className="mt-3" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1680px] px-6 pt-24 md:px-[4.2vw] md:pt-[8vw]">
        <div className="flex items-center gap-4 border-b border-line pb-4 font-mono text-[11px] uppercase tracking-label text-muted">
          <span className="text-ink">Trade</span> <span>Coin ⇄ NFT</span>
        </div>
        <div className="mt-10 rounded-[18px] border border-line bg-paper-light/40 p-6 md:p-[3.2vw]">
          <Exchange launch={l} />
        </div>
      </section>
      <Footer />
    </main>
  );
}
