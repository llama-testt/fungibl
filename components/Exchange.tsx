"use client";

import { useState } from "react";
import { NftCard, StoneCoin } from "./art/Objects";
import { Arrow, SwapGlyph } from "./ui";
import { fmtInt, type Launch } from "@/lib/launches";

/**
 * The core mechanic: a fixed ratio between the fungible coin and its
 * non-fungible collection, tradeable in both directions.
 */
export function Exchange({ launch: l, compact = false }: { launch: Launch; compact?: boolean }) {
  const [dir, setDir] = useState<"toNft" | "toCoin">("toNft");
  const [qty, setQty] = useState(1);
  const coins = (l.ratio ?? 0) * qty;
  const left = remaining(l);

  const coinSide = (
    <div className="flex items-end gap-4 md:gap-6">
      <StoneCoin letter={l.ticker[0]} className={`${compact ? "w-[72px]" : "w-[84px] md:w-[clamp(90px,9vw,150px)]"} shrink-0 drop-shadow-[6px_10px_10px_rgba(60,40,15,0.25)]`} />
      <div>
        <p className="label">Fungible</p>
        <p className={`${compact ? "text-[40px]" : "text-[44px] md:text-[clamp(48px,5.6vw,104px)]"} mt-2 font-[330] leading-[0.9] tracking-tightest`}>
          {fmtInt(coins)}
        </p>
        <p className="mt-2 font-mono text-[14px] text-muted">${l.ticker}</p>
      </div>
    </div>
  );

  const nftSide = (
    <div className="flex items-end gap-4 md:gap-6">
      <div className={`${compact ? "w-[58px]" : "w-[66px] md:w-[clamp(70px,7vw,118px)]"} shrink-0 rotate-[3deg] transition-transform duration-1000 ease-slow hover:rotate-[1deg]`}>
        <NftCard seed={l.seed} palette={l.palette} number={l.index} className="w-full drop-shadow-[6px_10px_10px_rgba(60,40,15,0.28)]" />
      </div>
      <div>
        <p className="label">Non-fungible</p>
        <p className={`${compact ? "text-[40px]" : "text-[44px] md:text-[clamp(48px,5.6vw,104px)]"} mt-2 font-[330] leading-[0.9] tracking-tightest`}>
          {qty}
        </p>
        <p className="mt-2 font-mono text-[14px] text-muted">
          {l.name} NFT{qty > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <div className={`grid items-end gap-8 ${compact ? "" : "md:grid-cols-[1fr_auto_1fr] md:gap-[3vw]"}`}>
        {dir === "toNft" ? coinSide : nftSide}
        <button
          onClick={() => setDir((d) => (d === "toNft" ? "toCoin" : "toNft"))}
          className={`group flex items-center gap-3 self-center text-ink transition-transform duration-700 hover:rotate-180 ${compact ? "" : "md:justify-self-center"}`}
          aria-label="Reverse direction"
          title="Reverse direction"
        >
          <SwapGlyph className={compact ? "h-9 w-9" : "h-10 w-10 md:h-[clamp(44px,4vw,64px)] md:w-[clamp(44px,4vw,64px)]"} />
        </button>
        {dir === "toNft" ? nftSide : coinSide}
      </div>

      <div className={`mt-12 grid gap-6 border-t border-line pt-6 ${compact ? "" : "md:grid-cols-12 md:items-center"}`}>
        <div className={`flex gap-6 font-mono text-[12px] uppercase tracking-label ${compact ? "" : "md:col-span-3"}`}>
          {(["toNft", "toCoin"] as const).map((d) => (
            <button key={d} onClick={() => setDir(d)} className={`u-link ${dir === d ? "text-ink" : "text-muted"}`} aria-current={dir === d ? "page" : undefined}>
              {d === "toNft" ? "Coin → NFT" : "NFT → Coin"}
            </button>
          ))}
        </div>

        <div className={`flex items-center gap-5 ${compact ? "" : "md:col-span-2"}`}>
          <span className="label">Qty</span>
          <div className="flex items-center border border-line font-mono text-[14px]">
            <button className="px-3 py-2 hover:bg-ink/5" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Less">
              −
            </button>
            <span className="w-8 text-center">{qty}</span>
            <button className="px-3 py-2 hover:bg-ink/5" onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="More">
              +
            </button>
          </div>
        </div>

        <p className={`font-mono text-[12px] leading-[1.7] text-muted ${compact ? "" : "md:col-span-4"}`}>
          {dir === "toNft"
            ? `Lock ${fmtInt(coins)} $${l.ticker} and receive ${qty} NFT${qty > 1 ? "s" : ""} from ${l.collection}. ${fmtInt(left)} left in the vault.`
            : `Return ${qty} NFT${qty > 1 ? "s" : ""} to the vault and receive ${fmtInt(coins)} $${l.ticker}, at the ratio set at launch.`}
        </p>

        <button className={`group inline-flex items-center justify-between gap-4 rounded-[4px] bg-charcoal px-6 py-4 font-mono text-[13px] text-paper transition-colors hover:bg-charcoal/90 ${compact ? "" : "md:col-span-3"}`}>
          {dir === "toNft" ? "Trade coin for NFT" : "Trade NFT for coin"} <Arrow />
        </button>
      </div>
    </div>
  );
}

function remaining(l: Launch) {
  return Math.max(0, (l.supply ?? 0) - (l.minted ?? 0));
}
