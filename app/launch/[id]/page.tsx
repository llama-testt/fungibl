import Link from "next/link";
import { notFound } from "next/navigation";
import { PairArt } from "@/components/art/PairArt";
import { Suspense } from "react";
import { CollectionPanel } from "@/components/CollectionPanel";
import { Exchange } from "@/components/Exchange";
import { Footer } from "@/components/Footer";
import { Progress } from "@/components/LaunchRow";
import { Navbar } from "@/components/Navbar";
import { Arrow } from "@/components/ui";
import { coinMcap, coinPrice, fmtEthPrecise, getDemoLaunch, holders, launches, mintedLine, nftFloor, nftSupply, type Launch } from "@/lib/launches";
import { explorerAddress } from "@/lib/pons/chain";
import { getLaunchByAddress } from "@/lib/pons/server";

export const revalidate = 30;
export const dynamicParams = true;

async function load(id: string): Promise<Launch | null> {
  return /^0x[0-9a-fA-F]{40}$/.test(id) ? getLaunchByAddress(id) : getDemoLaunch(id) ?? null;
}

export function generateStaticParams() {
  return launches.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const l = await load((await params).id);
  return { title: l ? `${l.name} ($${l.ticker}) — Fungibl` : "Fungibl" };
}

export default async function LaunchPage({ params }: { params: Promise<{ id: string }> }) {
  const l = await load((await params).id);
  if (!l) notFound();
  const pons = l.source === "pons";

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
              {(pons
                ? [
                    ["Coin price", coinPrice(l)],
                    ["Market cap", coinMcap(l)],
                    ["Raised", `${fmtEthPrecise(l.raisedEth ?? 0)}`],
                    ["Graduates at", `${fmtEthPrecise(l.thresholdEth ?? 0)}`],
                    ["Collection", l.supply != null ? `${l.minted} / ${l.supply}` : "Not opened"],
                    ["Chain", "Robinhood"],
                  ]
                : [
                    ["Coin price", coinPrice(l)],
                    ["Market cap", coinMcap(l)],
                    ["NFT floor", nftFloor(l)],
                    ["NFT supply", nftSupply(l)],
                    ["Minted", mintedLine(l)],
                    ["Holders", holders(l)],
                  ]
              ).map(([k, v], i) => (
                <div key={k} className={`border-b border-line py-4 ${i % 2 ? "pl-5" : "border-r pr-5"}`}>
                  <dt className="label">{k}</dt>
                  <dd className="mt-2 break-all font-sans text-[22px] tracking-[-0.03em]">{v}</dd>
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

      <section id="collection" className="mx-auto max-w-[1680px] scroll-mt-8 px-6 pt-24 md:px-[4.2vw] md:pt-[8vw]">
        <div className="flex items-center gap-4 border-b border-line pb-4 font-mono text-[11px] uppercase tracking-label text-muted">
          <span className="text-ink">Trade</span> <span>Coin ⇄ NFT</span>
          {pons && l.collectionAddress && (
            <a href={explorerAddress(l.collectionAddress)} target="_blank" rel="noreferrer" className="u-link ml-auto normal-case tracking-normal">
              Collection contract ↗
            </a>
          )}
        </div>
        <div className="mt-10 rounded-[18px] border border-line bg-paper-light/40 p-6 md:p-[3.2vw]">
          {pons ? (
            <Suspense>
              <CollectionPanel
                coin={l.address!}
                name={l.name}
                ticker={l.ticker}
                deployer={l.deployer}
                feeRecipient={l.feeRecipient}
                collection={l.collectionAddress}
              />
            </Suspense>
          ) : (
            <Exchange launch={l} />
          )}
        </div>

        {pons && (
          <div className="mt-8 grid gap-6 border-t border-line pt-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <p className="label">Coin contract</p>
              <p className="mt-3 break-all font-mono text-[13px]">{l.address}</p>
              <p className="mt-4 max-w-[36em] font-mono text-[12px] leading-[1.7] text-muted">
                Trades on its Pons V2 bonding curve until it raises {fmtEthPrecise(l.thresholdEth ?? 0)}, then graduates into a locked Uniswap V4 pool.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:col-span-5">
              <a href="https://ponsfamily.com" target="_blank" rel="noreferrer" className="group inline-flex items-center justify-between rounded-[4px] border border-ink/80 px-6 py-4 font-mono text-[13px]">
                Buy ${l.ticker} on Pons <Arrow />
              </a>
              <a href={explorerAddress(l.address!)} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-between rounded-[4px] border border-line px-6 py-4 font-mono text-[13px]">
                View on Blockscout <Arrow />
              </a>
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
