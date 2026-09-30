"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Arrow } from "./ui";

const LINKS = [
  { href: "/#launches", label: "Launches" },
  { href: "/explore", label: "Explore" },
  { href: "/create", label: "Create" },
  { href: "/#how", label: "How it works" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-[19px] w-[19px]" aria-hidden>
      <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 13l5 5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/**
 * `overlay` sits inside the hero window, over the photograph.
 * `paper` is used on inner pages, on the cream ground.
 */
export function Navbar({ variant = "overlay" }: { variant?: "overlay" | "paper" }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <header className={`relative z-20 ${variant === "paper" ? "border-b border-line" : ""}`}>
      <nav className="flex items-center px-6 py-6 md:px-[4.4%] md:py-[2.6%]">
        <Link href="/" className="text-[26px] font-semibold tracking-[-0.045em] text-ink md:text-[30px]">
          Fungibl
        </Link>

        <ul className="ml-[6.5%] hidden gap-[3.4vw] font-mono text-[13px] text-ink/85 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="u-link" aria-current={path === l.href ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto hidden items-center gap-10 md:flex">
          <button aria-label="Search launches" className="text-ink/85 transition-opacity hover:opacity-60">
            <SearchIcon />
          </button>
          <button className="group inline-flex items-center gap-3 rounded-[5px] border border-paper-light bg-paper-light/95 px-7 py-[15px] font-mono text-[14px] text-ink shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_18px_-10px_rgba(60,40,15,0.5)] transition-colors hover:bg-paper-light">
            Connect Wallet <Arrow />
          </button>
        </div>

        <button
          className="ml-auto flex h-10 w-10 flex-col items-end justify-center gap-[6px] md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`block h-px bg-ink transition-all duration-500 ${open ? "w-6 translate-y-[3.5px] rotate-45" : "w-6"}`} />
          <span className={`block h-px bg-ink transition-all duration-500 ${open ? "w-6 -translate-y-[3.5px] -rotate-45" : "w-4"}`} />
        </button>
      </nav>

      {open && (
        <div className="mx-6 mb-4 border-t border-line pt-4 md:hidden">
          <ul className="flex flex-col">
            {LINKS.map((l, i) => (
              <li key={l.href} className="border-b border-line">
                <Link href={l.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 py-4 text-[28px] tracking-[-0.03em]">
                  <span className="font-mono text-[11px] text-muted">0{i + 1}</span>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <button className="mt-5 w-full rounded-[4px] bg-charcoal py-4 font-mono text-[14px] text-paper">Connect Wallet →</button>
        </div>
      )}
    </header>
  );
}
