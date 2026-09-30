"use client";

import { memo, useEffect, useRef, useState } from "react";
import { NftCard, StoneCoin } from "./art/Objects";
import { SectionHead, SwapGlyph } from "./ui";

const PLATE = "/img/hero.jpg";

const STEPS = [
  {
    n: "01",
    t: "Launch",
    d: "Create a coin and its native NFT collection together.",
    k: "Pons V2 curve · 1,000,000,000 supply · 0.0005 ETH",
  },
  {
    n: "02",
    t: "Trade",
    d: "Trade the coin or exchange tokens for NFTs.",
    k: "100,000 $FUNGI ⇄ 1 NFT · both ways, forever",
  },
  {
    n: "03",
    t: "Grow",
    d: "Earn rewards and help your collection move up the platform.",
    k: "Graduates at 4.2 ETH → locked Uniswap V4 pool",
  },
];

// ───────────────────────────── easing helpers

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Heavy SVGs (stone filters) render once and are only moved around.
const Coin = memo(function Coin() {
  return <StoneCoin letter="F" className="w-full drop-shadow-[10px_14px_12px_rgba(50,30,10,0.35)]" />;
});
const Card = memo(function Card({ seed, palette, number }: { seed: number; palette: number; number: string }) {
  return <NftCard seed={seed} palette={palette} number={number} className="w-full drop-shadow-[10px_14px_12px_rgba(50,30,10,0.35)]" />;
});

// Bonding curve y = x^1.7, drawn in a 100×60 box.
const CURVE = Array.from({ length: 41 }, (_, i) => {
  const x = i / 40;
  return `${i ? "L" : "M"}${(x * 100).toFixed(2)},${(60 - Math.pow(x, 1.7) * 56).toFixed(2)}`;
}).join(" ");

/**
 * The whole story as a function of p ∈ [0,1]:
 * 0–⅓ a coin rises and its curve starts drawing,
 * ⅓–⅔ its NFT arrives and coins flow into it,
 * ⅔–1 the collection fans out and the coin graduates.
 */
function Stage({ p }: { p: number }) {
  const s1 = clamp(p * 3);
  const s2 = clamp(p * 3 - 1);
  const s3 = clamp(p * 3 - 2);

  const raised = clamp(0.18 * easeOut(s1) + 0.42 * easeInOut(s2) + 0.4 * easeInOut(s3));
  const eth = (4.2 * raised).toFixed(2);
  const graduated = s3 > 0.92;

  const coinIn = easeOut(s1 / 0.7);
  const cardIn = easeOut(s2 / 0.55);
  const fan = easeInOut(s3 / 0.75);
  const swapIn = clamp((s2 - 0.35) * 4);

  const dotX = raised * 100;
  const dotY = 60 - Math.pow(raised, 1.7) * 56;

  return (
    <div className="window relative aspect-[4/3] w-full !rounded-[22px] bg-[#cdbd9e] [container-type:inline-size]">
      {/* sky */}
      <div
        className="photo absolute inset-0"
        style={{ backgroundImage: `url(${PLATE})`, backgroundSize: "250%", backgroundPosition: `${lerp(4, 14, p)}% ${lerp(30, 18, p)}%` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_0%,rgba(255,232,190,0.35),transparent_60%)]" />

      {/* bonding curve */}
      <div className="absolute left-[6%] top-[8%] w-[46%]" style={{ opacity: clamp(s1 * 4) }}>
        <div className="flex items-baseline justify-between font-mono text-[max(6.5px,1.32cqw)] uppercase tracking-label text-ink/70">
          <span>Bonding curve</span>
          <span className="text-ink">{graduated ? "Graduated" : `${eth} / 4.20 ETH`}</span>
        </div>
        <svg viewBox="-2 -4 104 68" className="mt-2 w-full overflow-visible">
          <path d="M0,60 H100" stroke="#20201E" strokeOpacity="0.25" strokeWidth="0.6" fill="none" />
          <path d="M0,0 V60" stroke="#20201E" strokeOpacity="0.25" strokeWidth="0.6" fill="none" />
          <path d={CURVE} stroke="#20201E" strokeOpacity="0.28" strokeWidth="1" fill="none" strokeDasharray="1.5 2.5" pathLength={1} />
          <path d={CURVE} stroke="#20201E" strokeWidth="1.6" fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - raised} />
          <circle cx={dotX} cy={dotY} r={2.2} fill="#20201E" opacity={raised > 0.01 ? 1 : 0} />
          <circle cx={dotX} cy={dotY} r={5} fill="none" stroke="#20201E" strokeOpacity={0.35} opacity={raised > 0.01 ? 1 : 0} />
          <line x1="100" y1="4" x2="100" y2="60" stroke="#20201E" strokeOpacity="0.4" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
        </svg>
      </div>

      {/* graduation badge */}
      <div
        className="absolute right-[5%] top-[8%] rounded-[4px] border border-ink/70 bg-paper-light/85 px-[1.6cqw] py-[1cqw] font-mono text-[max(6.5px,1.32cqw)] uppercase tracking-label text-ink"
        style={{ opacity: clamp((s3 - 0.75) * 5), transform: `translateY(${(1 - clamp((s3 - 0.75) * 5)) * 8}px)` }}
      >
        Uniswap V4 · liquidity locked
      </div>

      {/* collection fan, behind the main card */}
      {[
        { seed: 23, palette: 5, n: "004", r: -13, x: -58, y: 3 },
        { seed: 56, palette: 4, n: "003", r: -4, x: -30, y: 0 },
        { seed: 42, palette: 1, n: "002", r: 15, x: 46, y: 6 },
      ].map((c, i) => (
        <div
          key={c.n}
          className="absolute bottom-[17%] left-[58%] w-[17%] origin-bottom will-change-transform"
          style={{
            opacity: clamp(fan * 1.6 - i * 0.12),
            transform: `translateX(${lerp(0, c.x, fan)}%) translateY(${lerp(6, c.y, fan)}%) rotate(${lerp(5, c.r, fan)}deg) scale(${lerp(0.9, 0.92, fan)})`,
            zIndex: 1,
          }}
        >
          <Card seed={c.seed} palette={c.palette} number={c.n} />
        </div>
      ))}

      {/* the paired NFT */}
      <div
        className="absolute bottom-[17%] left-[58%] z-[2] w-[19%] origin-bottom will-change-transform"
        style={{
          opacity: clamp(cardIn * 1.4),
          transform: `translateX(${lerp(90, 0, cardIn)}%) rotate(${lerp(14, 5, cardIn) + fan * 1}deg)`,
        }}
      >
        <Card seed={11} palette={0} number="001" />
      </div>

      {/* the coin */}
      <div
        className="absolute bottom-[15%] left-[24%] z-[3] w-[25%] will-change-transform"
        style={{
          transform: `translateY(${lerp(95, 0, coinIn)}%) rotate(${lerp(-18, 0, coinIn) + s2 * 4}deg) translateX(${lerp(0, -6, fan)}%)`,
        }}
      >
        <Coin />
      </div>

      {/* coins flowing into the NFT */}
      {Array.from({ length: 7 }, (_, i) => {
        const t = clamp((s2 - 0.22 - i * 0.06) / 0.3);
        const visible = t > 0 && t < 1;
        const x = lerp(38, 64, easeInOut(t));
        const y = lerp(62, 58, t) - Math.sin(Math.PI * t) * 22;
        return (
          <span
            key={i}
            className="absolute z-[4] h-[3.2%] w-[2.4%] rounded-full border border-[#6E6350] bg-[radial-gradient(circle_at_35%_30%,#F1E6CE,#B7A886)] shadow-[1px_2px_2px_rgba(50,30,10,0.3)]"
            style={{ left: `${x}%`, top: `${y}%`, opacity: visible ? 1 : 0, transform: `scale(${lerp(1, 0.6, t)})` }}
          />
        );
      })}

      {/* swap glyph */}
      <div className="absolute left-[49%] top-[46%] z-[4] w-[5.5%] text-ink" style={{ opacity: swapIn * (1 - clamp((s3 - 0.2) * 3)) }}>
        <SwapGlyph className="w-full" />
      </div>

      {/* ground */}
      <div
        className="photo absolute inset-x-0 bottom-0 z-[5] h-[28%]"
        style={{
          backgroundImage: `url(${PLATE})`,
          backgroundSize: "220%",
          backgroundPosition: "72% 83%",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 34%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 34%)",
        }}
      />

      {/* rewards drifting up while the collection grows */}
      {[
        { label: "+ creator tax", x: 18, d: 0 },
        { label: "+ holder rewards", x: 70, d: 0.18 },
        { label: "+ collectors", x: 44, d: 0.36 },
      ].map((r) => {
        const t = clamp((s3 - 0.1 - r.d) / 0.45);
        return (
          <span
            key={r.label}
            className="absolute z-[6] whitespace-nowrap rounded-full border border-ink/40 bg-paper-light/80 px-[1.3cqw] py-[0.6cqw] font-mono text-[max(6px,1.25cqw)] uppercase tracking-label text-ink"
            style={{ left: `${r.x}%`, top: `${lerp(58, 36, easeOut(t))}%`, opacity: t > 0 ? Math.sin(Math.PI * t) : 0 }}
          >
            {r.label}
          </span>
        );
      })}

      {/* ratio caption */}
      <div
        className="absolute bottom-[3.5%] left-[4%] right-[4%] z-[6] flex items-center justify-between rounded-[8px] border border-lineDark bg-[rgba(38,30,20,0.55)] px-[2.2cqw] py-[1.3cqw] font-mono text-[max(6.5px,1.32cqw)] uppercase tracking-label text-paper backdrop-blur-[2px]"
        style={{ opacity: clamp(s2 * 3), transform: `translateY(${(1 - clamp(s2 * 3)) * 10}px)` }}
      >
        <span>100,000 $FUNGI</span>
        <span className="h-px flex-1 bg-paper/50 mx-[2cqw]" />
        <span>{s3 > 0.3 ? `${Math.round(1 + fan * 3)} NFTs · fully backed` : "1 NFT"}</span>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[7] overflow-hidden">
        <div className="film-grain" />
      </div>
    </div>
  );
}

/** Rolling second digit: 1 → 2 → 3. */
function Odometer({ step }: { step: number }) {
  return (
    <span className="inline-flex overflow-hidden leading-[0.82]" style={{ height: "0.82em" }}>
      <span>0</span>
      <span
        className="inline-flex flex-col transition-transform duration-[900ms] ease-[cubic-bezier(0.7,0,0.2,1)]"
        style={{ transform: `translateY(${-step * 0.82}em)` }}
      >
        {STEPS.map((s) => (
          <span key={s.n} className="block h-[0.82em]">
            {s.n[1]}
          </span>
        ))}
      </span>
    </span>
  );
}

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(reduce);
    const el = ref.current;
    if (!el) return;

    // Progress starts while the section is still entering the viewport (LEAD),
    // so the scene is already moving before it pins — not only once pinned.
    const LEAD = 0.9;
    const target = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = r.height - vh;
      return clamp((vh * LEAD - r.top) / (span + vh * LEAD || 1));
    };

    // A short autoplay intro the first time it appears: the coin rises on its own.
    let introStart = 0;
    let intro = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !introStart) introStart = performance.now();
        visible = e.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    let visible = false;
    let raf = 0;
    let cur = target();
    // Smoothly follow the scroll position; keeps running only while in view.
    const tick = (now: number) => {
      if (introStart) intro = 0.2 * easeOut((now - introStart) / 1600);
      const goal = Math.max(target(), intro);
      cur = reduce ? goal : cur + (goal - cur) * 0.12;
      if (Math.abs(goal - cur) < 0.0005) cur = goal;
      setP((prev) => (Math.abs(prev - cur) > 0.0008 ? cur : prev));
      raf = visible || Math.abs(goal - cur) > 0.0005 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    io.observe(el);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      cancelAnimationFrame(raf);
    };
  }, []);

  const step = Math.min(2, Math.floor(p * 3 * 0.999));
  const stageP = reduced ? (step + 1) / 3 : p;

  return (
    <section id="how" className="mx-auto max-w-[1680px] px-6 pt-28 md:px-[4.2vw] md:pt-[11vw]">
      <SectionHead index="03" label="How Fungibl works" right={<span className="hidden md:inline">Fungible / Non-fungible</span>} />

      {/* Desktop: pinned stage, scroll drives the story */}
      <div ref={ref} className="relative hidden md:block" style={{ height: "300vh" }}>
        <div className="sticky top-0 flex h-screen items-center">
          <div className="grid w-full grid-cols-12 items-center gap-[3vw]">
            <div className="col-span-5 flex flex-col">
              <p className="text-[clamp(150px,15vw,280px)] font-[200] tracking-[-0.07em]" aria-hidden>
                <Odometer step={step} />
              </p>

              <div className="relative mt-[3vw] h-[190px]">
                {STEPS.map((s, i) => (
                  <div
                    key={s.n}
                    className="absolute inset-0 transition-all duration-700 ease-slow"
                    style={{ opacity: step === i ? 1 : 0, transform: `translateY(${(i - step) * 18}px)`, pointerEvents: step === i ? "auto" : "none" }}
                    aria-hidden={step !== i}
                  >
                    <div className="flex items-baseline justify-between gap-6 border-t border-ink pt-5">
                      <h3 className="text-[clamp(34px,3.2vw,56px)] leading-none tracking-[-0.04em]">{s.t}</h3>
                      <span className="font-mono text-[10px] uppercase tracking-label text-muted">Step {s.n} / 03</span>
                    </div>
                    <p className="mt-5 max-w-[26em] text-[18px] leading-[1.5] tracking-[-0.01em] text-ink/85">{s.d}</p>
                    <p className="mt-4 font-mono text-[11px] uppercase tracking-label text-muted">{s.k}</p>
                  </div>
                ))}
              </div>

              {/* progress rail */}
              <div className="mt-8 grid grid-cols-3 gap-3">
                {STEPS.map((s, i) => (
                  <div key={s.n}>
                    <div className="relative h-px bg-line">
                      <div className="absolute inset-y-[-0.5px] left-0 h-[2px] bg-ink" style={{ width: `${clamp(p * 3 - i) * 100}%` }} />
                    </div>
                    <p className={`mt-3 font-mono text-[10px] uppercase tracking-label transition-colors duration-500 ${step >= i ? "text-ink" : "text-muted"}`}>
                      {s.n} {s.t}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-7">
              <Stage p={stageP} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: each step plays its own scene when it comes into view */}
      <div className="md:hidden">
        {STEPS.map((s, i) => (
          <MobileStep key={s.n} i={i} />
        ))}
      </div>

      <div className="border-t border-line" />
    </section>
  );
}

function MobileStep({ i }: { i: number }) {
  const s = STEPS[i];
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(i / 3);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const from = i / 3, to = (i + 1) / 3, t0 = performance.now(), dur = 2200;
        const tick = (now: number) => {
          const t = clamp((now - t0) / dur);
          setP(from + (to - from) * t);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [i]);
  return (
    <div ref={ref} className={`py-12 ${i > 0 ? "border-t border-line" : ""}`}>
      <p className="text-[120px] font-[200] leading-[0.8] tracking-[-0.07em]">{s.n}</p>
      <div className="mt-8 flex items-baseline justify-between">
        <h3 className="text-[34px] tracking-[-0.035em]">{s.t}</h3>
        <span className="font-mono text-[10px] uppercase tracking-label text-muted">Step {s.n}</span>
      </div>
      <p className="mt-3 font-mono text-[12px] leading-[1.75] text-muted">{s.d}</p>
      <div className="mt-6">
        <Stage p={p} />
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-label text-muted">{s.k}</p>
    </div>
  );
}
