function Coins() {
  return (
    <svg viewBox="0 0 28 32" className="h-[30px] w-[26px]" aria-hidden>
      {[0, 7, 14, 21].map((y) => (
        <g key={y}>
          <ellipse cx="14" cy={y + 5} rx="12" ry="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </g>
      ))}
      <path d="M2 5v21M26 5v21" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function People() {
  return (
    <svg viewBox="0 0 32 26" className="h-[26px] w-[32px]" aria-hidden fill="currentColor">
      <circle cx="11" cy="7" r="5" />
      <path d="M1 25c0-6 4.5-10 10-10s10 4 10 10z" />
      <circle cx="23" cy="8" r="4.2" opacity="0.85" />
      <path d="M19 15.6c1.2-.5 2.6-.8 4-.8 4.7 0 8 3.6 8 9.2h-8.4c-.3-3.5-1.5-6.3-3.6-8.4z" opacity="0.85" />
    </svg>
  );
}
function Bars() {
  return (
    <svg viewBox="0 0 26 28" className="h-[28px] w-[24px]" aria-hidden fill="currentColor">
      <rect x="0" y="16" width="6" height="12" />
      <rect x="10" y="9" width="6" height="19" />
      <rect x="20" y="0" width="6" height="28" />
    </svg>
  );
}

const STATS = [
  { icon: <Coins />, value: "320+", label: "Launches" },
  { icon: <People />, value: "180K+", label: "Collectors" },
  { icon: <Bars />, value: "$12.4M+", label: "Volume traded" },
];

/** One long translucent strip — never separate cards. */
export function StatsStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-2 rounded-[12px] border border-lineDark bg-[rgba(38,30,20,0.52)] text-paper backdrop-blur-[3px] md:flex md:items-center ${className}`}
    >
      {STATS.map((s, i) => (
        <div
          key={s.label}
          className={`flex items-center gap-4 px-5 py-4 md:gap-[1.6vw] md:px-[2.6%] md:py-0 ${
            i > 0 ? "md:border-l md:border-lineDark" : ""
          } ${i === 1 ? "border-l border-lineDark md:border-l" : ""} ${i === 2 ? "border-t border-lineDark md:border-t-0" : ""} md:flex-[0_0_auto] md:min-w-[21%]`}
        >
          <span className="text-paper/75">{s.icon}</span>
          <span className="leading-none">
            <span className="block text-[20px] font-medium tracking-[-0.02em] md:text-[clamp(18px,1.6vw,24px)]">{s.value}</span>
            <span className="mt-[7px] block font-mono text-[10px] uppercase tracking-label text-paper/70 md:text-[11px]">{s.label}</span>
          </span>
        </div>
      ))}
      <div className="flex items-center gap-5 border-l border-t border-lineDark px-5 py-4 md:ml-0 md:flex-1 md:border-t-0 md:px-[4%] md:py-0">
        <span className="hidden h-px w-[52px] bg-paper/50 lg:block" />
        <span className="font-mono text-[10px] uppercase leading-[1.8] tracking-label text-paper/75 md:text-[11px]">
          Coins <span className="px-1">×</span> NFTs <span className="px-1">×</span> Community
          <br />A new kind of launchpad
        </span>
      </div>
    </div>
  );
}
