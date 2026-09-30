"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { BaseError, ContractFunctionRevertedError, formatEther, parseEventLogs, toHex, zeroAddress } from "viem";
import { useAccount, useChainId, usePublicClient, useReadContract, useReadContracts, useSwitchChain, useWriteContract } from "wagmi";
import { factoryAbi } from "@/lib/pons/abi";
import { PONS_V2_FACTORY, explorerTx, robinhood } from "@/lib/pons/chain";
import { NftCard, StoneCoin } from "./art/Objects";
import { Arrow, Reveal, SectionHead } from "./ui";
import { WalletButton } from "./WalletButton";
import { fmtInt } from "@/lib/launches";
import { FUNGIBL_FACTORY } from "@/lib/fungibl/abi";

const F = { address: PONS_V2_FACTORY, abi: factoryAbi, chainId: robinhood.id } as const;

function Field({ label, children, span = 1, hint }: { label: string; children: ReactNode; span?: 1 | 2; hint?: string }) {
  return (
    <label className={`block ${span === 2 ? "md:col-span-2" : ""}`}>
      <span className="label flex justify-between gap-4">
        {label}
        {hint && <span className="normal-case tracking-normal text-muted/70">{hint}</span>}
      </span>
      <div className="mt-3">{children}</div>
    </label>
  );
}

function Drop({ text, file, onFile, disabled }: { text: string; file?: File | null; onFile?: (f: File | null) => void; disabled?: boolean }) {
  return (
    <label
      className={`flex h-[132px] flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-ink/30 font-mono text-[12px] text-muted transition-colors ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-ink hover:text-ink"
      }`}
    >
      <span className="text-[20px] leading-none">{file ? "✓" : "+"}</span>
      {file ? file.name : text}
      <input
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        disabled={disabled}
        onChange={(e) => onFile?.(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

/** Squares and shrinks stills to at most 1024px WEBP before upload; GIFs pass through. */
async function prepareImage(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const out = Math.min(1024, side);
  if (bmp.width === bmp.height && out === side && file.size < 1024 * 1024) return file;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = out;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, out, out);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.9));
  return blob ? new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" }) : file;
}

/** Drag-and-drop or click to upload; uploads immediately and reports the stored URI. */
function ImageUpload({ onUri, onBusy, ticker }: { onUri: (uri: string) => void; onBusy: (b: boolean) => void; ticker: string }) {
  const [preview, setPreview] = useState("");
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);

  async function take(f: File | null | undefined) {
    if (!f) return;
    setErr("");
    if (!IMAGE_TYPES.includes(f.type)) return fail("PNG, JPG, GIF or WEBP only.");
    if (f.size > 4 * 1024 * 1024) return fail("Max 4 MB.");
    setPreview(URL.createObjectURL(f));
    setState("uploading");
    onBusy(true);
    onUri("");
    try {
      const ready = await prepareImage(f);
      const body = new FormData();
      body.append("file", ready);
      const r = await fetch("/api/upload", { method: "POST", body });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Upload failed");
      onUri(j.uri);
      setState("done");
    } catch (e) {
      fail(e instanceof Error ? e.message : "Upload failed");
    } finally {
      onBusy(false);
    }
  }
  function fail(m: string) {
    setErr(m);
    setState("error");
    onUri("");
  }
  function clear() {
    setPreview("");
    setState("idle");
    setErr("");
    onUri("");
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        take(e.dataTransfer.files?.[0]);
      }}
      className={`flex min-h-[148px] items-center gap-6 rounded-[4px] border border-dashed p-5 transition-colors ${
        drag ? "border-ink bg-paper-deep/60" : "border-ink/30"
      }`}
    >
      <label className="group relative flex h-[108px] w-[108px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-ink/25 bg-paper-deep/50 transition-colors hover:border-ink">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className={`h-full w-full object-cover ${state === "uploading" ? "opacity-50" : ""}`} />
        ) : (
          <span className="text-[34px] font-[330] tracking-[-0.04em] text-muted">{ticker[0]}</span>
        )}
        <input type="file" accept={IMAGE_TYPES.join(",")} className="hidden" onChange={(e) => take(e.target.files?.[0])} />
      </label>
      <div className="font-mono text-[12px] leading-[1.7]">
        {state === "idle" && (
          <>
            <p className="text-ink">Drop an image here, or click the circle.</p>
            <p className="text-muted">PNG, JPG, GIF or WEBP · square works best · max 4 MB</p>
          </>
        )}
        {state === "uploading" && <p className="text-ink">Uploading…</p>}
        {state === "done" && (
          <>
            <p className="text-ink">✓ Uploaded — this becomes your coin&apos;s logo.</p>
            <button type="button" onClick={clear} className="u-link text-muted">
              Remove
            </button>
          </>
        )}
        {state === "error" && (
          <>
            <p className="text-clay">{err}</p>
            <button type="button" onClick={clear} className="u-link text-muted">
              Try another file
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Step({ n, title, note, children, muted }: { n: string; title: string; note: string; children: ReactNode; muted?: boolean }) {
  return (
    <Reveal className="grid gap-8 border-t border-line py-12 md:grid-cols-[minmax(180px,0.8fr)_2fr] md:gap-[3vw] md:py-16">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-label text-muted">Step {n}</p>
        <h3 className="mt-3 text-[44px] font-[330] leading-none tracking-tightest md:text-[clamp(44px,4vw,68px)]">{title}</h3>
        <p className="mt-4 max-w-[20em] font-mono text-[12px] leading-[1.7] text-muted">{note}</p>
      </div>
      <div className={`grid gap-7 md:grid-cols-2 ${muted ? "opacity-55" : ""}`}>{children}</div>
    </Reveal>
  );
}

type Phase = "idle" | "uploading" | "checking" | "confirm" | "pending" | "done" | "error";

function explain(e: unknown) {
  if (e instanceof BaseError) {
    const revert = e.walk((x) => x instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError | null;
    const name = revert?.data?.errorName;
    const map: Record<string, string> = {
      NotWhitelisted: "Pons launches are whitelist-only right now.",
      LaunchFeeNotPaid: "Launch fee changed — refresh and try again.",
      CreatorTaxTooHigh: "Creator tax is above the Pons maximum.",
      LaunchEconomicsMismatch: "Pons updated its launch terms a moment ago. Try again.",
      LaunchConfigDisabled: "This Pons launch config is disabled.",
      InvalidTokenParams: "Name and ticker are required.",
    };
    if (name && map[name]) return map[name];
    return e.shortMessage;
  }
  return e instanceof Error ? e.message.split("\n")[0] : "Something went wrong.";
}

export function CreateFlow({ index = "05" }: { index?: string }) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const client = usePublicClient({ chainId: robinhood.id });
  const { writeContractAsync } = useWriteContract();

  // coin
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [description, setDescription] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  // collection (preview only for now)
  const [collection, setCollection] = useState("");
  const [supply, setSupply] = useState(1000);
  const [perNft, setPerNft] = useState(100_000);
  // launch
  const [taxBps, setTaxBps] = useState(100);
  const [buyback, setBuyback] = useState(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [msg, setMsg] = useState("");
  const [tx, setTx] = useState<string>("");

  // Live Pons V2 terms
  const { data: base } = useReadContracts({
    contracts: [
      { ...F, functionName: "launchFee" },
      { ...F, functionName: "launchEnabled" },
      { ...F, functionName: "maxCreatorTaxBps" },
      { ...F, functionName: "launchConfigCount" },
    ],
  });
  const fee = base?.[0].result as bigint | undefined;
  const publicGate = base?.[1].result as boolean | undefined;
  const maxTax = Number((base?.[2].result as bigint | undefined) ?? 1000n);
  const count = Number((base?.[3].result as bigint | undefined) ?? 0n);

  const { data: cfgs } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({ ...F, functionName: "getLaunchConfig" as const, args: [BigInt(i)] as const })),
    query: { enabled: count > 0 },
  });
  const config = useMemo(() => {
    if (!cfgs) return null;
    // newest enabled native-ETH config
    for (let i = cfgs.length - 1; i >= 0; i--) {
      const c = cfgs[i].result as { supply: bigint; graduationThreshold: bigint; curveFeeBps: bigint; enabled: boolean } | undefined;
      if (c?.enabled) return { id: BigInt(i), ...c };
    }
    return null;
  }, [cfgs]);

  const { data: allowed } = useReadContract({ ...F, functionName: "canLaunch", args: [address ?? zeroAddress], query: { enabled: Boolean(address) } });

  const T = (ticker || "TICKER").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) || "TICKER";
  const N = name || "Your coin";
  const coinSupply = config ? Number(formatEther(config.supply)) : 1_000_000_000;
  const ratio = perNft;
  const lockShare = (supply * perNft) / coinSupply;
  const wrongChain = isConnected && chainId !== robinhood.id;
  const busy = phase === "uploading" || phase === "checking" || phase === "confirm" || phase === "pending";

  async function launch() {
    if (!address || !client || !config || fee == null) return;
    if (!name.trim() || !ticker.trim()) {
      setPhase("error");
      setMsg("Name and ticker are required.");
      return;
    }
    try {
      setMsg("");
      setTx("");
      const logo = logoUrl;
      setPhase("checking");
      const economics = await client.readContract({ ...F, functionName: "previewLaunchEconomics", args: [config.id, zeroAddress] });
      const salt = toHex(crypto.getRandomValues(new Uint8Array(32)));
      const params = {
        name: name.trim(),
        symbol: T,
        logo,
        description: description.trim(),
        socials: { twitter: twitter.trim(), telegram: telegram.trim(), discord: "", website: website.trim(), farcaster: "" },
        creatorFeeRecipient: address,
        creatorTaxBps: Math.min(taxBps, maxTax),
        buybackEnabled: buyback,
        expectedEconomics: economics,
        salt,
      } as const;
      const args = [params, config.id, zeroAddress] as const;
      // Dry-run first so reverts surface as readable errors, not a failed tx.
      await client.simulateContract({ ...F, functionName: "launchToken", args, value: fee, account: address });
      setPhase("confirm");
      const hash = await writeContractAsync({ ...F, functionName: "launchToken", args, value: fee });
      setTx(hash);
      setPhase("pending");
      const receipt = await client.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Launch transaction reverted.");
      const [ev] = parseEventLogs({ abi: factoryAbi, logs: receipt.logs, eventName: "TokenLaunched" });
      setPhase("done");
      if (ev) {
        const token = (ev.args as { token: string }).token.toLowerCase();
        const q = new URLSearchParams({ c: collection || `${name.trim()} Originals`, s: String(supply), r: String(perNft) });
        router.push(FUNGIBL_FACTORY ? `/launch/${token}?${q}#collection` : `/launch/${token}`);
      }
    } catch (e) {
      setPhase("error");
      setMsg(explain(e));
    }
  }

  const status: Record<Phase, string> = {
    idle: "",
    uploading: "Pinning your logo to IPFS…",
    checking: "Checking launch terms with Pons…",
    confirm: "Confirm the launch in your wallet.",
    pending: "Launching on Robinhood Chain…",
    done: "Launched. Opening your coin…",
    error: msg,
  };

  let cta: ReactNode;
  if (!isConnected) cta = <WalletButton variant="paper" />;
  else if (wrongChain)
    cta = (
      <button onClick={() => switchChain({ chainId: robinhood.id })} className="group inline-flex items-center justify-between gap-6 rounded-[4px] bg-charcoal px-7 py-4 font-mono text-[14px] text-paper">
        Switch to Robinhood Chain <Arrow />
      </button>
    );
  else if (allowed === false)
    cta = <span className="font-mono text-[12px] text-muted">Pons launches are whitelist-only right now{publicGate === false ? " (public gate closed)" : ""}.</span>;
  else
    cta = (
      <button
        onClick={launch}
        disabled={busy || logoBusy || !config || fee == null}
        className="group inline-flex items-center justify-between gap-6 rounded-[4px] bg-charcoal px-7 py-4 font-mono text-[14px] text-paper disabled:opacity-50"
      >
        {busy ? "Launching…" : "Launch on Pons"} <Arrow />
      </button>
    );

  return (
    <section id="create" className="mx-auto max-w-[1680px] px-6 pt-28 md:px-[4.2vw] md:pt-[11vw]">
      <SectionHead index={index} label="Create" right={<span className="hidden md:inline">Launched through Pons V2 · Robinhood Chain</span>} />

      <div className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12">
        <h2 className="text-[44px] font-[330] leading-[0.98] tracking-tightest md:col-span-8 md:text-[clamp(48px,5.4vw,96px)]">
          Launch something
          <br />
          worth collecting.
        </h2>
      </div>

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-[4vw]">
        <form onSubmit={(e) => e.preventDefault()}>
          <Step n="01" title="Coin" note="The fungible half. Deployed as a Pons V2 token with its own bonding curve.">
            <Field label="Name">
              <input className="field" placeholder="Super Inu" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Ticker">
              <input className="field font-mono uppercase" placeholder="SUPER" maxLength={10} value={ticker} onChange={(e) => setTicker(e.target.value)} />
            </Field>
            <Field label="Description" span={2}>
              <textarea
                className="field min-h-[120px] resize-none"
                maxLength={500}
                placeholder="What is this, and why should anyone hold it?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <Field label="Image" span={2} hint="Your coin's logo">
              <ImageUpload onUri={setLogoUrl} onBusy={setLogoBusy} ticker={T} />
            </Field>
            <div className="grid gap-7 md:col-span-2 md:grid-cols-3">
              <Field label="Website" hint="Optional">
                <input className="field text-[15px]" placeholder="https://" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </Field>
              <Field label="X" hint="Optional">
                <input className="field text-[15px]" placeholder="@handle" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
              </Field>
              <Field label="Telegram" hint="Optional">
                <input className="field text-[15px]" placeholder="t.me/…" value={telegram} onChange={(e) => setTelegram(e.target.value)} />
              </Field>
            </div>
          </Step>

          <Step
            n="02"
            title="Collection"
            note={
              FUNGIBL_FACTORY
                ? "The non-fungible half. Opened right after your coin launches — one more signature on the next page."
                : "The non-fungible half. Fungibl collections aren't live on Robinhood Chain yet — this step is a preview."
            }
            muted={!FUNGIBL_FACTORY}
          >
            <Field label="Collection name">
              <input className="field" placeholder={`${N} Originals`} value={collection} onChange={(e) => setCollection(e.target.value)} />
            </Field>
            <Field label="NFT supply" hint="1 – 100,000">
              <input className="field font-mono" type="number" min={1} max={100000} value={supply} onChange={(e) => setSupply(Math.max(1, Math.floor(Number(e.target.value))))} />
            </Field>
            <Field label="Coins per NFT" hint={`$${T} locked for each NFT`}>
              <input className="field font-mono" type="number" min={1} value={perNft} onChange={(e) => setPerNft(Math.max(1, Math.floor(Number(e.target.value))))} />
            </Field>
            <Field label="Artwork" hint="Generated">
              <div className="field font-mono text-[13px] leading-[1.6] text-muted">
                Every NFT gets its own stone-mosaic face. You can point the collection at your own IPFS art later.
              </div>
            </Field>
            <p className={`font-mono text-[12px] md:col-span-2 ${lockShare > 0.5 ? "text-clay" : "text-muted"}`}>
              Up to {(lockShare * 100).toFixed(1)}% of ${T} can be locked as NFTs{lockShare > 0.5 ? " — the maximum is 50%." : "."} Ratio and supply are permanent.
            </p>
          </Step>

          <Step n="03" title="Launch" note="Terms are read live from the Pons V2 factory and pinned when you sign, so they can't change underneath you.">
            <Field label="Coin supply" hint="Set by Pons">
              <div className="field font-mono text-muted">{fmtInt(coinSupply)}</div>
            </Field>
            <Field label="Graduates at" hint="Then a locked Uniswap V4 pool">
              <div className="field font-mono text-muted">{config ? `${Number(formatEther(config.graduationThreshold))} ETH` : "…"}</div>
            </Field>
            <Field label="Creator tax" hint={`Paid to you on every trade · max ${maxTax / 100}%`} span={2}>
              <div className="flex items-center gap-6">
                <input
                  type="range"
                  min={0}
                  max={maxTax}
                  step={25}
                  value={Math.min(taxBps, maxTax)}
                  onChange={(e) => setTaxBps(Number(e.target.value))}
                  className="w-full accent-[#20201E]"
                />
                <span className="w-16 text-right font-mono text-[15px]">{(Math.min(taxBps, maxTax) / 100).toFixed(2)}%</span>
              </div>
            </Field>
            <Field label="Buyback & lock" hint="Part of fees buy back and lock your coin" span={2}>
              <div className="flex gap-6 font-mono text-[13px] uppercase tracking-label">
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" onClick={() => setBuyback(v)} className={`u-link ${buyback === v ? "![background-size:100%_1px] text-ink" : "text-muted"}`}>
                    {v ? "On" : "Off"}
                  </button>
                ))}
              </div>
            </Field>
          </Step>

          <div className="flex flex-col gap-4 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
            <div className="font-mono text-[12px] leading-[1.7] text-muted">
              <p>Launch fee {fee != null ? `${formatEther(fee)} ETH` : "…"} + gas · signed from your wallet · Pons V2 on Robinhood Chain.</p>
              {status[phase] && <p className={phase === "error" ? "text-clay" : "text-ink"}>{status[phase]}</p>}
              {tx && (
                <a href={explorerTx(tx)} target="_blank" rel="noreferrer" className="u-link text-ink">
                  View transaction ↗
                </a>
              )}
            </div>
            {cta}
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
                ["Coin supply", fmtInt(coinSupply)],
                ["NFT supply", fmtInt(supply)],
                ["Ratio", `${fmtInt(ratio)} : 1`],
                ["Creator tax", `${(Math.min(taxBps, maxTax) / 100).toFixed(2)}%`],
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
