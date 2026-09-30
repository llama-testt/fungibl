"use client";

import { useState, type ReactNode } from "react";
import { NftCard, StoneCoin } from "./art/Objects";
import { Arrow, Reveal, SectionHead } from "./ui";
import { fmtInt } from "@/lib/launches";

function Field({ label, children, span = 1, hint }: { label: string; children: ReactNode; span?: 1 | 2; hint?: string }) {
  return (
    <label className={`block ${span === 2 ? "md:col-span-2" : ""}`}>
      <span className="label flex justify-between">
        {label}
        {hint && <span className="normal-case tracking-normal text-muted/70">{hint}</span>}
      </span>
      <div className="mt-3">{children}</div>
    </label>
  );
}

function Drop({ text }: { text: string }) {
  return (
    <div className="flex h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-ink/30 font-mono text-[12px] text-muted transition-colors hover:border-ink hover:text-ink">
      <span className="text-[20px] leading-none">+</span>
      {text}
    </div>
  );
}

function Step({ n, title, note, children }: { n: string; title: string; note: string; children: ReactNode }) {
  return (
    <Reveal className="grid gap-8 border-t border-line py-12 md:grid-cols-[minmax(180px,0.8fr)_2fr] md:gap-[3vw] md:py-16">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-label text-muted">Step {n}</p>
        <h3 className="mt-3 text-[44px] font-[330] leading-none tracking-tightest md:text-[clamp(44px,4vw,68px)]">{title}</h3>
        <p className="mt-4 max-w-[20em] font-mono text-[12px] leading-[1.7] text-muted">{note}</p>
      </div>
      <div className="grid gap-7 md:grid-cols-2">{children}</div>
    </Reveal>
  );
}

export function CreateFlow({ index = "05" }: { index?: string }) {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [collection, setCollection] = useState("");
  const [supply, setSupply] = useState(1000);
  const [initial, setInitial] = useState(1_000_000_000);
  const [rewards, setRewards] = useState(2);

  const ratio = supply > 0 ? Math.round((initial * 0.1) / supply) : 0; // 10% of supply backs the vault
  const T = (ticker || "TICKER").toUpperCase().slice(0, 6);
  const N = name || "Your coin";

  return (
    <section id="create" className="mx-auto max-w-[1680px] px-6 pt-28 md:px-[4.2vw] md:pt-[11vw]">
      <SectionHead index={index} label="Create" right={<span className="hidden md:inline">Three steps. One object.</span>} />

      <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12">
        <h2 className="text-[44px] font-[330] leading-[0.98] tracking-tightest md:col-span-8 md:text-[clamp(48px,5.4vw,96px)]">
          Launch something
          <br />
          worth collecting.
        </h2>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-[4vw]">
        <form onSubmit={(e) => e.preventDefault()}>
          <Step n="01" title="Coin" note="The fungible half. Name it like you mean it.">
            <Field label="Name">
              <input className="field" placeholder="Super Inu" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Ticker">
              <input className="field font-mono uppercase" placeholder="SUPER" maxLength={6} value={ticker} onChange={(e) => setTicker(e.target.value)} />
            </Field>
            <Field label="Description" span={2}>
              <textarea className="field min-h-[120px] resize-none" placeholder="What is this, and why should anyone hold it?" />
            </Field>
            <Field label="Image" span={2} hint="PNG, JPG, GIF · 1:1">
              <Drop text="Drop coin image" />
            </Field>
          </Step>

          <Step n="02" title="Collection" note="The non-fungible half. Every coin gets a face.">
            <Field label="Collection name">
              <input className="field" placeholder={`${N} Originals`} value={collection} onChange={(e) => setCollection(e.target.value)} />
            </Field>
            <Field label="Supply">
              <input className="field font-mono" type="number" min={1} value={supply} onChange={(e) => setSupply(Number(e.target.value))} />
            </Field>
            <Field label="NFT artwork" hint="Folder or .zip">
              <Drop text="Drop artwork" />
            </Field>
            <Field label="Traits" hint="Optional">
              <Drop text="Drop traits.json" />
            </Field>
          </Step>

          <Step n="03" title="Launch" note="Set the ratio once. It holds for the life of the project.">
            <Field label="Initial supply">
              <input className="field font-mono" type="number" value={initial} onChange={(e) => setInitial(Number(e.target.value))} />
            </Field>
            <Field label="NFT conversion ratio" hint="Coins per NFT">
              <div className="field flex items-center justify-between font-mono">
                <span>{fmtInt(ratio)}</span>
                <span className="text-[12px] text-muted">${T} = 1 NFT</span>
              </div>
            </Field>
            <Field label="Rewards" hint="% of trading fees to holders" span={2}>
              <div className="flex items-center gap-6">
                <input type="range" min={0} max={5} step={0.5} value={rewards} onChange={(e) => setRewards(Number(e.target.value))} className="w-full accent-[#20201E]" />
                <span className="w-14 text-right font-mono text-[15px]">{rewards}%</span>
              </div>
            </Field>
          </Step>

          <div className="flex flex-col gap-4 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
            <p className="font-mono text-[12px] text-muted">Launch fee 0.02 ETH · Coin and collection deploy in one transaction.</p>
            <button className="group inline-flex items-center justify-between gap-6 rounded-[4px] bg-charcoal px-7 py-4 font-mono text-[14px] text-paper">
              Review launch <Arrow />
            </button>
          </div>
        </form>

        {/* live preview of the paired object */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 border-t border-line pt-12">
            <p className="label">Preview</p>
            <div className="mt-8 flex items-end">
              <StoneCoin letter={T[0]} className="relative z-[1] -mr-5 w-[150px] drop-shadow-[8px_12px_12px_rgba(60,40,15,0.28)]" />
              <div className="w-[120px] rotate-[4deg]">
                <NftCard seed={(N.length * 7 + T.length * 13) % 97} palette={(N.length + T.length) % 6} number="001" className="w-full drop-shadow-[8px_12px_12px_rgba(60,40,15,0.3)]" />
              </div>
            </div>
            <p className="mt-10 text-[32px] leading-none tracking-[-0.04em]">{N}</p>
            <p className="mt-2 font-mono text-[12px] text-muted">
              ${T} <span className="px-1">+</span> {collection || `${N} Originals`}
            </p>
            <dl className="mt-8 space-y-3 border-t border-line pt-5 font-mono text-[12px]">
              {[
                ["Coin supply", fmtInt(initial)],
                ["NFT supply", fmtInt(supply)],
                ["Ratio", `${fmtInt(ratio)} : 1`],
                ["Holder rewards", `${rewards}%`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}
