"use client";

import { useEffect, useRef, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useChainId, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { explorerAddress, robinhood } from "@/lib/pons/chain";
import { Arrow } from "./ui";

export const short = (a?: string) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");

type Variant = "overlay" | "paper" | "block";

const BTN: Record<Variant, string> = {
  overlay:
    "rounded-[5px] border border-paper-light bg-paper-light/95 px-7 py-[15px] text-ink shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_6px_18px_-10px_rgba(60,40,15,0.5)] hover:bg-paper-light",
  paper: "rounded-[4px] border border-ink/80 px-6 py-[13px] text-ink hover:bg-ink/[0.04]",
  block: "w-full justify-between rounded-[4px] bg-charcoal px-6 py-4 text-paper",
};

export function WalletButton({ variant = "overlay", className = "" }: { variant?: Variant; className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: bal } = useBalance({ address, chainId: robinhood.id, query: { enabled: Boolean(address) } });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  useEffect(() => {
    if (isConnected) setOpen(false);
  }, [isConnected]);

  const base = `group inline-flex items-center gap-3 whitespace-nowrap font-mono text-[14px] transition-colors ${BTN[variant]} ${className}`;
  const wrongChain = isConnected && chainId !== robinhood.id;
  const hasInjected = mounted && typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: unknown }).ethereum);

  let label: React.ReactNode = (
    <>
      Connect Wallet <Arrow />
    </>
  );
  if (mounted && isConnected && wrongChain) label = <>Switch to Robinhood</>;
  else if (mounted && isConnected)
    label = (
      <>
        <span className="h-[7px] w-[7px] rounded-full bg-moss" />
        {short(address)}
        {bal && <span className="text-muted">{Number(formatEther(bal.value)).toFixed(3)} ETH</span>}
      </>
    );

  return (
    <div ref={ref} className={`relative ${variant === "block" ? "w-full" : ""}`}>
      <button
        className={base}
        onClick={() => (wrongChain ? switchChain({ chainId: robinhood.id }) : setOpen((o) => !o))}
        disabled={switching}
      >
        {label}
      </button>

      {open && (
        <div className={`absolute right-0 top-[calc(100%+10px)] z-50 w-[300px] rounded-[6px] border border-ink/70 bg-paper-light p-5 text-ink shadow-[0_24px_50px_-20px_rgba(60,40,15,0.45)] ${variant === "block" ? "left-0 w-full" : ""}`}>
          {!isConnected ? (
            <>
              <p className="label">Connect · Robinhood Chain</p>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {connectors.map((c) => {
                  const name = c.name === "Injected" ? "Browser wallet" : c.name;
                  const disabled = c.id === "injected" && !hasInjected;
                  return (
                    <li key={c.uid}>
                      <button
                        disabled={disabled || isPending}
                        onClick={() => connect({ connector: c, chainId: robinhood.id })}
                        className="group flex w-full items-center justify-between py-4 text-left text-[18px] tracking-[-0.02em] disabled:opacity-40"
                      >
                        {name}
                        <Arrow />
                      </button>
                    </li>
                  );
                })}
              </ul>
              {!hasInjected && (
                <p className="mt-4 font-mono text-[11px] leading-[1.6] text-muted">
                  No browser wallet found. Install MetaMask, Rabby or Robinhood Wallet — on mobile, open this page in your wallet&apos;s browser.
                </p>
              )}
              {error && <p className="mt-4 font-mono text-[11px] leading-[1.6] text-clay">{error.message.split("\n")[0]}</p>}
            </>
          ) : (
            <>
              <p className="label">Connected</p>
              <p className="mt-3 font-mono text-[13px]">{short(address)}</p>
              <p className="mt-1 font-mono text-[12px] text-muted">{bal ? `${Number(formatEther(bal.value)).toFixed(4)} ETH` : "…"} · Robinhood Chain</p>
              <div className="mt-5 flex justify-between border-t border-line pt-4 font-mono text-[12px] uppercase tracking-label">
                <a href={explorerAddress(address!)} target="_blank" rel="noreferrer" className="u-link">
                  Explorer
                </a>
                <button className="u-link" onClick={() => disconnect()}>
                  Disconnect
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
