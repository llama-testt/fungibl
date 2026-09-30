import type { ReactNode } from "react";

/** Brand marks from their official sources (simple-icons; Pons from github.com/ponsdotdev/pons-labs). */
function RobinhoodMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[14px] w-[14px]" aria-hidden fill="currentColor">
      <path d="M2.84 24h.53c.096 0 .192-.048.224-.128C7.591 13.696 11.94 8.656 14.67 5.638c.112-.128.064-.225-.096-.225h-4.88a.55.55 0 0 0-.45.225L5.746 9.972c-.514.642-.642 1.236-.642 2.086v4.43c-1.14 3.194-1.862 5.361-2.392 7.32-.032.125.016.192.129.192M20.447.646c-.754-.802-4.157-.834-5.73-.224a3 3 0 0 0-.786.465 41 41 0 0 0-3.323 3.178c-.112.113-.064.225.097.225h5.409c.497 0 .786.289.786.786v6.1c0 .16.128.208.225.064l3.258-4.254c.53-.69.69-.898.835-1.861.192-1.413.08-3.58-.77-4.479m-6.982 16.18 2.231-3.676a.7.7 0 0 0 .064-.29V6.73c0-.16-.112-.225-.224-.097-3.355 3.74-5.971 7.672-8.395 12.407-.06.12.016.225.16.177l5.009-1.54c.565-.174.882-.402 1.155-.852" />
    </svg>
  );
}

function OpenZeppelinMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[13px] w-[13px]" aria-hidden fill="currentColor">
      <path d="M22.783 24H9.317l2.196-3.69a5.23 5.23 0 0 1 4.494-2.558h6.775ZM1.217 0h21.566l-3.718 6.247H1.217ZM9.76 9.763a5.73 5.73 0 0 1 4.92-2.795h4.01L8.498 24h-7.26Z" />
    </svg>
  );
}

function PonsMark() {
  // A flat silhouette of the Pons "P", tinted with the current text colour.
  return (
    <span
      aria-hidden
      className="block h-[14px] w-[14px] bg-current"
      style={{
        WebkitMaskImage: "url(/brand/pons-mark.png)",
        maskImage: "url(/brand/pons-mark.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

const ITEMS: { name: string; href: string; mark: ReactNode; role: string }[] = [
  { name: "Pons", href: "https://ponsfamily.com", mark: <PonsMark />, role: "Coin launches" },
  { name: "Robinhood Chain", href: "https://robinhood.com/us/en/chain/", mark: <RobinhoodMark />, role: "Network" },
  { name: "OpenZeppelin", href: "https://www.openzeppelin.com", mark: <OpenZeppelinMark />, role: "NFT contracts" },
];

export function BuiltWith({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-3 ${className}`}>
      <span className="mr-2 font-mono text-[11px] uppercase tracking-label text-muted">Built with</span>
      {ITEMS.map((it) => (
        <a
          key={it.name}
          href={it.href}
          target="_blank"
          rel="noreferrer"
          title={`${it.name} — ${it.role}`}
          className="group inline-flex items-center gap-2.5 rounded-full border border-line px-4 py-2 text-ink/80 transition-colors duration-500 hover:border-ink/60 hover:text-ink"
        >
          {it.mark}
          <span className="text-[14px] tracking-[-0.01em]">{it.name}</span>
        </a>
      ))}
    </div>
  );
}
