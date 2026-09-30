import Link from "next/link";
import { PairArt } from "./art/PairArt";
import { Arrow } from "./ui";
import { fmtInt, fmtPrice, fmtUsd, type Launch } from "@/lib/launches";

export function Progress({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`relative h-px w-full bg-line ${className}`}>
      <div className="absolute inset-y-[-0.5px] left-0 bg-ink" style={{ width: `${value}%`, height: 2 }} />
    </div>
  );
}

const STATUS: Record<Launch["status"], string> = { live: "Live", new: "New", trending: "Trending", graduated: "Graduated" };

/** Editorial list row: coin + collection read as one paired entry. */
export function LaunchRow({ launch: l }: { launch: Launch }) {
  return (
    <Link
      href={`/launch/${l.id}`}
      className="group grid grid-cols-[88px_1fr] items-center gap-x-5 gap-y-3 border-t border-line py-6 transition-colors duration-700 hover:bg-paper-deep/50 md:grid-cols-[132px_210px_minmax(0,1.3fr)_1fr_1.25fr_0.8fr_auto] md:gap-x-[2.2vw] md:py-7 md:pl-2 md:pr-3"
    >
      <span className="hidden whitespace-nowrap font-mono text-[11px] uppercase tracking-label text-muted md:block">
        {STATUS[l.status]} / {l.index}
      </span>

      <PairArt launch={l} showCaption={false} className="aspect-[4/3] w-full rounded-[8px] border border-charcoal/70" />

      <div>
        <span className="mb-1 block font-mono text-[10px] uppercase tracking-label text-muted md:hidden">
          {STATUS[l.status]} / {l.index}
        </span>
        <h3 className="text-[24px] leading-none tracking-[-0.035em] md:text-[clamp(22px,2vw,32px)]">{l.name}</h3>
        <p className="mt-2 font-mono text-[12px] text-muted">${l.ticker}</p>
      </div>

      <dl className="col-span-2 grid grid-cols-3 gap-4 font-mono text-[12px] md:contents">
        <div>
          <dt className="label">Coin</dt>
          <dd className="mt-2 text-ink">{fmtPrice(l.price)}</dd>
          <dd className="text-muted">MC {fmtUsd(l.marketCap)}</dd>
        </div>
        <div>
          <dt className="label">Collection</dt>
          <dd className="mt-2 text-ink">
            {fmtInt(l.minted)} / {fmtInt(l.supply)} <span className="text-muted">minted</span>
          </dd>
          <Progress value={(l.minted / l.supply) * 100} className="mt-3 max-w-[180px]" />
        </div>
        <div>
          <dt className="label">Holders</dt>
          <dd className="mt-2 text-ink">{fmtInt(l.holders)}</dd>
        </div>
      </dl>

      <span className="col-span-2 inline-flex items-center gap-3 font-mono text-[12px] uppercase tracking-label text-ink md:col-span-1">
        View launch <Arrow />
      </span>
    </Link>
  );
}
