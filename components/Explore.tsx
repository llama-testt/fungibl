"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PairArt } from "./art/PairArt";
import { Arrow, Reveal, SectionHead } from "./ui";
import { coinMcap, coinPrice, holders, launches as demo, nftFloor, nftSupply, type Launch, type LaunchStatus } from "@/lib/launches";

const TABS: { key: LaunchStatus; label: string }[] = [
  { key: "live", label: "Live" },
  { key: "new", label: "New" },
  { key: "trending", label: "Trending" },
  { key: "graduated", label: "Graduated" },
];

export function Explore({
  index = "04",
  limit,
  launches = demo,
  live = false,
}: {
  index?: string;
  limit?: number;
  launches?: Launch[];
  live?: boolean;
}) {
  const [tab, setTab] = useState<LaunchStatus | "all">("all");
  const list = useMemo(() => {
    const l = tab === "all" ? launches : launches.filter((x) => x.status === tab);
    return limit ? l.slice(0, limit) : l;
  }, [tab, limit, launches]);

  return (
    <section id="explore" className="mx-auto max-w-[1680px] px-6 pt-28 md:px-[4.2vw] md:pt-[11vw]">
      <SectionHead index={index} label="Explore" right={
          live ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-[6px] w-[6px] animate-pulse rounded-full bg-moss" /> Live · Pons V2
            </span>
          ) : (
            <span>Sample data</span>
          )
        } />

      <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
        <h2 className="text-[44px] font-[330] leading-[0.98] tracking-tightest md:text-[clamp(48px,5.4vw,96px)]">Explore</h2>
        <div role="tablist" className="flex flex-wrap gap-x-8 gap-y-3 text-[20px] tracking-[-0.02em] md:text-[24px]">
          {[{ key: "all" as const, label: "All" }, ...TABS].map((t) => {
            const count = t.key === "all" ? launches.length : launches.filter((l) => l.status === t.key).length;
            const on = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.key)}
                className={`group flex items-start gap-1 transition-colors duration-500 ${on ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                <span className={`u-link ${on ? "![background-size:100%_1px]" : ""}`}>{t.label}</span>
                <sup className="font-mono text-[10px]">{count}</sup>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hairline grid — no cards */}
      <div className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-3">
        {list.map((l, i) => (
          <Reveal key={`${tab}-${l.id}`} delay={(i % 3) * 90} className="border-b border-r border-line">
            <Link href={`/launch/${l.id}`} className="group block p-5 md:p-6">
              <div className="flex justify-between font-mono text-[10px] uppercase tracking-label text-muted">
                <span>
                  {l.status} / {l.index}
                </span>
                <span>{l.launchedAgo} ago</span>
              </div>
              <PairArt launch={l} showCaption={false} className="mt-4 aspect-[5/4] w-full rounded-[8px] border border-charcoal/70" />
              <div className="mt-6 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-[30px] leading-none tracking-[-0.04em]">{l.name}</h3>
                  <p className="mt-2 font-mono text-[12px] text-muted">
                    ${l.ticker} <span className="px-1">+</span> {l.collection}
                  </p>
                </div>
                <Arrow className="mb-1 shrink-0" />
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 font-mono text-[12px]">
                {(l.source === "pons"
                  ? [
                      ["Price", coinPrice(l)],
                      ["Mkt cap", coinMcap(l)],
                      ["Curve", l.graduated ? "Graduated" : `${l.progress}%`],
                      ["Collection", l.supply != null ? `${l.minted}/${l.supply}` : "—"],
                    ]
                  : [
                      ["Coin mkt cap", coinMcap(l)],
                      ["NFT floor", nftFloor(l)],
                      ["NFT supply", nftSupply(l)],
                      ["Holders", holders(l)],
                    ]
                ).map(([k, v]) => (
                  <Stat key={k} k={k} v={v} />
                ))}
              </dl>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted">{k}</dt>
      <dd className="truncate text-right text-ink">{v}</dd>
    </div>
  );
}
