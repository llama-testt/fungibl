function Swap() {
  return (
    <svg viewBox="0 0 28 24" className="h-[24px] w-[28px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 8h22M18 3l5 5-5 5" />
      <path d="M26 16H4M10 11l-5 5 5 5" />
    </svg>
  );
}
function Curve() {
  return (
    <svg viewBox="0 0 28 26" className="h-[26px] w-[28px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 2v22h24" strokeOpacity="0.55" />
      <path d="M4 22c8 0 14-4 20-17" />
      <circle cx="24" cy="5" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Chain() {
  return (
    <svg viewBox="0 0 28 28" className="h-[26px] w-[26px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M14 2l10.4 6v12L14 26 3.6 20V8z" />
      <path d="M14 8l5.2 3v6L14 20l-5.2-3v-6z" strokeOpacity="0.6" />
    </svg>
  );
}
function Lock() {
  return (
    <svg viewBox="0 0 24 28" className="h-[26px] w-[22px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="12" width="18" height="14" rx="2" />
      <path d="M7 12V8a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ITEMS = [
  { icon: <Swap />, value: "Coin ⇄ NFT", label: "Two-way · fixed ratio" },
  { icon: <Curve />, value: "Pons V2", label: "Bonding-curve launch" },
  { icon: <Chain />, value: "Robinhood Chain", label: "L2 · ETH gas" },
  { icon: <Lock />, value: "Uniswap V4", label: "Locked liquidity" },
];

/** One long translucent strip — what Fungibl is built on, never vanity numbers. */
export function StatsStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-2 rounded-[12px] border border-lineDark bg-[rgba(38,30,20,0.52)] text-paper backdrop-blur-[3px] md:flex md:items-stretch ${className}`}
    >
      {ITEMS.map((s, i) => (
        <div
          key={s.value}
          className={`flex min-w-0 items-center gap-3 px-4 py-3.5 md:flex-1 md:gap-[1.4vw] md:px-[2.4%] md:py-0 ${i % 2 === 1 ? "border-l border-lineDark" : ""} ${
            i >= 2 ? "border-t border-lineDark md:border-t-0" : ""
          } ${i === 2 ? "md:border-l" : ""}`}
        >
          <span className="hidden shrink-0 text-paper/75 sm:block">{s.icon}</span>
          <span className="min-w-0 leading-none">
            <span className="block truncate text-[15px] font-medium tracking-[-0.02em] md:text-[clamp(14px,1.35vw,22px)]">{s.value}</span>
            <span className="mt-[7px] block truncate font-mono text-[9px] uppercase tracking-[0.06em] text-paper/70 md:text-[clamp(9px,0.75vw,10.5px)] md:tracking-label">{s.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
