"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WalletButton } from "./WalletButton";
import { ThemeToggle, XIcon } from "./ThemeToggle";
import { SOCIAL } from "@/lib/site";

const LINKS = [
  { href: "/explore", label: "Explore" },
  { href: "/create", label: "Create" },
  { href: "/#how", label: "How it works" },
  { href: "/docs", label: "Docs" },
];

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

        <div className="ml-auto hidden items-center gap-[1.6vw] md:flex">
          <a
            href={SOCIAL.x}
            target="_blank"
            rel="noreferrer"
            aria-label="Fungibl on X"
            title="X / Twitter"
            className="flex h-9 w-9 items-center justify-center text-ink/85 transition-opacity hover:opacity-60"
          >
            <XIcon className="h-[16px] w-[16px]" />
          </a>
          <ThemeToggle />
          <WalletButton variant={variant === "overlay" ? "overlay" : "paper"} className="ml-[1vw]" />
        </div>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <a href={SOCIAL.x} target="_blank" rel="noreferrer" aria-label="Fungibl on X" className="flex h-10 w-10 items-center justify-center text-ink/85">
            <XIcon className="h-[15px] w-[15px]" />
          </a>
          <ThemeToggle className="h-10 w-10" />
        </div>
        <button
          className="flex h-10 w-10 flex-col items-end justify-center gap-[6px] md:hidden"
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
          <div className="mt-5">
            <WalletButton variant="block" />
          </div>
        </div>
      )}
    </header>
  );
}
