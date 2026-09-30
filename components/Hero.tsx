"use client";

import { useEffect, useRef } from "react";
import { Navbar } from "./Navbar";
import { StatsStrip } from "./StatsStrip";
import { Button } from "./ui";

const PLATE = "/img/hero.jpg";

function Headline({ className = "" }: { className?: string }) {
  return (
    <h1 className={`font-[350] leading-[0.99] tracking-tightest text-ink ${className}`}>
      <span className="hero-line block">A launchpad</span>
      <span className="hero-line block">where every coin</span>
      <span className="hero-line block">comes with its own</span>
      <span className="hero-line block font-[450] tracking-[-0.048em]">NFT collection.</span>
    </h1>
  );
}

const COPY = "Launch NFT-backed coins. Trade coins for NFTs, earn rewards, and promote the collections you believe in.";

export function Hero() {
  const plate = useRef<HTMLDivElement>(null);

  // Very slow parallax: pointer drift + scroll sink.
  useEffect(() => {
    const el = plate.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let mx = 0, my = 0, sy = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * -10;
      my = (e.clientY / window.innerHeight - 0.5) * -6;
    };
    const onScroll = () => (sy = Math.min(window.scrollY, 900) * 0.07);
    const tick = () => {
      cx += (mx - cx) * 0.04;
      cy += (my + sy - cy) * 0.06;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) scale(1.04)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section aria-label="Fungibl" className="hero-in">
      {/* ——— Desktop: one photographed window ——— */}
      <div className="hidden px-[3.5vw] pt-[4.2vh] md:block">
        <div
          data-theme="light"
          className="window relative mx-auto w-full bg-[#d9c7a6]"
          style={{ height: "min(calc(93vw / 1.48), calc(100vh - 7vh))", minHeight: 620 }}
        >
          <div
            ref={plate}
            className="photo absolute inset-0 bg-cover will-change-transform"
            style={{ backgroundImage: `url(${PLATE})`, backgroundPosition: "62% 50%", transform: "scale(1.04)" }}
          />
          {/* keep copy legible on the bright left sky; darken the ground under the strip */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(246,232,206,0.34)_0%,rgba(246,232,206,0.12)_38%,transparent_58%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%] bg-[linear-gradient(180deg,transparent,rgba(40,30,18,0.32))]" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="film-grain" />
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-[26px] shadow-[inset_0_0_120px_rgba(60,40,15,0.18)]" />

          <div className="absolute inset-x-0 top-0">
            <Navbar variant="overlay" />
          </div>

          <div className="absolute left-[4.4%] top-[18%] w-[46%]">
            <Headline className="text-[clamp(44px,4.72vw,92px)]" />
            <p className="hero-copy mt-[2.1vw] max-w-[31em] font-mono text-[clamp(13px,1.12vw,17px)] leading-[1.62] tracking-[0.005em] text-ink/80">
              {COPY}
            </p>
            <div className="hero-copy mt-[2.4vw] flex gap-[1.3vw]">
              <Button href="/explore" arrow>
                Explore Launches
              </Button>
              <Button href="/create" variant="ghost">
                Create a Coin
              </Button>
            </div>
          </div>

          <StatsStrip className="absolute bottom-[2.4%] left-[3.5%] right-[3.5%] h-[10.8%]" />
        </div>
      </div>

      {/* ——— Mobile: copy on paper, cinematic image beneath ——— */}
      <div className="md:hidden">
        <Navbar variant="paper" />
        <div className="px-6 pb-8 pt-8">
          <Headline className="text-[clamp(34px,9.6vw,56px)]" />
          <p className="mt-6 font-mono text-[14px] leading-[1.65] text-ink/80">{COPY}</p>
          <div className="mt-7 flex flex-col gap-3">
            <Button href="/explore" arrow className="w-full justify-between">
              Explore Launches
            </Button>
            <Button href="/create" variant="ghost" className="w-full justify-between">
              Create a Coin
            </Button>
          </div>
        </div>
        <div className="px-4">
          <div data-theme="light" className="window relative aspect-[4/5] w-full">
            <div className="photo absolute inset-0 bg-cover" style={{ backgroundImage: `url(${PLATE})`, backgroundPosition: "80% 40%", backgroundSize: "auto 118%" }} />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="film-grain" />
            </div>
            <StatsStrip className="absolute bottom-3 left-3 right-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
