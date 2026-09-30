"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BaseError, ContractFunctionRevertedError, formatEther, parseEther, type Address } from "viem";
import { useAccount, useChainId, usePublicClient, useReadContract, useReadContracts, useSwitchChain, useWriteContract } from "wagmi";
import { FUNGIBL_FACTORY, collectionAbi, erc20Abi, fungiblFactoryAbi } from "@/lib/fungibl/abi";
import { explorerTx, robinhood } from "@/lib/pons/chain";
import { fmtInt } from "@/lib/launches";
import { StoneCoin } from "./art/Objects";
import { Arrow, SwapGlyph } from "./ui";
import { WalletButton } from "./WalletButton";

type Props = {
  coin: Address;
  name: string;
  ticker: string;
  deployer?: Address;
  feeRecipient?: Address;
  collection?: Address;
};

const CHAIN = robinhood.id;

function explain(e: unknown) {
  if (e instanceof BaseError) {
    const r = e.walk((x) => x instanceof ContractFunctionRevertedError) as ContractFunctionRevertedError | null;
    const n = r?.data?.errorName;
    const map: Record<string, string> = {
      NotCoinCreator: "Only the coin's creator can open its collection.",
      AlreadyExists: "This coin already has a collection.",
      BadSupply: "Supply must be between 1 and 100,000.",
      BadRatio: "Too many coins per NFT — at most half the coin supply can be locked.",
      SoldOut: "Not enough NFTs left in the collection.",
      TooMany: "At most 50 at a time.",
      ERC20InsufficientBalance: "Not enough coins in your wallet.",
      ERC20InsufficientAllowance: "Approve the coins first.",
    };
    if (n && map[n]) return map[n];
    if (/User rejected|denied/i.test(e.shortMessage)) return "Cancelled in wallet.";
    return e.shortMessage;
  }
  return e instanceof Error ? e.message.split("\n")[0] : "Something went wrong.";
}

function useTx() {
  const client = usePublicClient({ chainId: CHAIN });
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [hash, setHash] = useState("");
  async function run(label: string, req: Parameters<typeof writeContractAsync>[0], account: Address) {
    if (!client) return false;
    setBusy(label);
    setMsg("");
    setHash("");
    try {
      await client.simulateContract({ ...(req as object), account } as never);
      const h = await writeContractAsync(req);
      setHash(h);
      const r = await client.waitForTransactionReceipt({ hash: h });
      if (r.status !== "success") throw new Error("Transaction reverted.");
      setBusy("");
      return true;
    } catch (e) {
      setMsg(explain(e));
      setBusy("");
      return false;
    }
  }
  return { run, busy, msg, hash };
}

function Status({ busy, msg, hash }: { busy: string; msg: string; hash: string }) {
  if (!busy && !msg && !hash) return null;
  return (
    <p className="font-mono text-[12px] leading-[1.7]">
      {busy && <span className="text-ink">{busy}… confirm in your wallet. </span>}
      {msg && <span className="text-clay">{msg} </span>}
      {hash && (
        <a href={explorerTx(hash)} target="_blank" rel="noreferrer" className="u-link text-muted">
          View transaction ↗
        </a>
      )}
    </p>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  if (!isConnected) return <WalletButton variant="paper" />;
  if (chainId !== CHAIN)
    return (
      <button onClick={() => switchChain({ chainId: CHAIN })} className="group inline-flex items-center justify-between gap-6 rounded-[4px] bg-charcoal px-6 py-4 font-mono text-[13px] text-paper">
        Switch to Robinhood Chain <Arrow />
      </button>
    );
  return <>{children}</>;
}

// ─────────────────────────────────────────── create

function CreateCollection({ coin, name, ticker, deployer, feeRecipient }: Props) {
  const router = useRouter();
  const q = useSearchParams();
  const { address } = useAccount();
  const [cName, setCName] = useState(q.get("c") || `${name} Originals`);
  const [cSymbol, setCSymbol] = useState(`${ticker.slice(0, 6)}NFT`);
  const [supply, setSupply] = useState(Number(q.get("s")) || 1000);
  const [perNft, setPerNft] = useState(Number(q.get("r")) || 100_000);
  const { run, busy, msg, hash } = useTx();
  const { data: total } = useReadContract({ address: coin, abi: erc20Abi, functionName: "totalSupply", chainId: CHAIN });

  const isCreator = address && [deployer, feeRecipient].some((a) => a && a.toLowerCase() === address.toLowerCase());
  const totalN = total ? Number(formatEther(total)) : 1_000_000_000;
  const share = (supply * perNft) / totalN;

  async function create() {
    if (!address || !FUNGIBL_FACTORY) return;
    const baseURI = `${window.location.origin}/api/nft/${coin.toLowerCase()}/`;
    const ok = await run(
      "Opening collection",
      {
        address: FUNGIBL_FACTORY as Address,
        abi: fungiblFactoryAbi,
        functionName: "createCollection",
        args: [coin, cName.trim(), cSymbol.trim().toUpperCase(), baseURI, parseEther(String(perNft)), BigInt(supply)],
        chainId: CHAIN,
      },
      address,
    );
    if (ok) router.refresh();
  }

  return (
    <div className="grid gap-10 md:grid-cols-12">
      <div className="md:col-span-5">
        <p className="label">Collection</p>
        <p className="mt-3 text-[34px] leading-none tracking-[-0.035em]">Not opened yet</p>
        <p className="mt-5 max-w-[30em] font-mono text-[12px] leading-[1.7] text-muted">
          {isCreator
            ? "You launched this coin, so you can give it its one official collection. Every NFT gets a generated face and is backed by locked coins — holders can swap either way, forever, at the ratio you set here."
            : "Only this coin's creator can open its collection. Once they do, anyone can lock coins for NFTs here and return NFTs for coins."}
        </p>
      </div>
      {isCreator ? (
        <div className="grid gap-6 md:col-span-7 md:grid-cols-2">
          <label className="block">
            <span className="label">Collection name</span>
            <input className="field mt-3" value={cName} maxLength={50} onChange={(e) => setCName(e.target.value)} />
          </label>
          <label className="block">
            <span className="label">Symbol</span>
            <input className="field mt-3 font-mono uppercase" value={cSymbol} maxLength={10} onChange={(e) => setCSymbol(e.target.value)} />
          </label>
          <label className="block">
            <span className="label">NFT supply</span>
            <input className="field mt-3 font-mono" type="number" min={1} max={100000} value={supply} onChange={(e) => setSupply(Math.max(1, Math.floor(Number(e.target.value))))} />
          </label>
          <label className="block">
            <span className="label flex justify-between">
              Coins per NFT <span className="normal-case tracking-normal">${ticker}</span>
            </span>
            <input className="field mt-3 font-mono" type="number" min={1} value={perNft} onChange={(e) => setPerNft(Math.max(1, Math.floor(Number(e.target.value))))} />
          </label>
          <p className={`font-mono text-[12px] md:col-span-2 ${share > 0.5 ? "text-clay" : "text-muted"}`}>
            Up to {(share * 100).toFixed(1)}% of ${ticker} supply can be locked as NFTs{share > 0.5 ? " — the maximum is 50%." : "."} Ratio and supply are permanent.
          </p>
          <div className="flex flex-col gap-3 md:col-span-2">
            <Gate>
              <button
                onClick={create}
                disabled={Boolean(busy) || share > 0.5 || !cName.trim() || !cSymbol.trim()}
                className="group inline-flex items-center justify-between gap-6 rounded-[4px] bg-charcoal px-6 py-4 font-mono text-[13px] text-paper disabled:opacity-50"
              >
                Open collection <Arrow />
              </button>
            </Gate>
            <Status busy={busy} msg={msg} hash={hash} />
          </div>
        </div>
      ) : (
        <div className="md:col-span-7">
          <Gate>
            <p className="font-mono text-[12px] text-muted">Connected wallet isn&apos;t this coin&apos;s creator.</p>
          </Gate>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────── exchange

function LiveExchange({ coin, ticker, collection }: Props & { collection: Address }) {
  const { address } = useAccount();
  const [dir, setDir] = useState<"toNft" | "toCoin">("toNft");
  const [qty, setQty] = useState(1);
  const [picked, setPicked] = useState<bigint[]>([]);
  const { run, busy, msg, hash } = useTx();
  const col = { address: collection, abi: collectionAbi, chainId: CHAIN } as const;

  const { data: base, refetch: refetchBase } = useReadContracts({
    contracts: [
      { ...col, functionName: "ratio" },
      { ...col, functionName: "maxSupply" },
      { ...col, functionName: "minted" },
      { ...col, functionName: "inVault" },
      { ...col, functionName: "available" },
      { ...col, functionName: "name" },
    ],
  });
  const ratio = (base?.[0].result as bigint | undefined) ?? 0n;
  const maxSupply = Number((base?.[1].result as bigint | undefined) ?? 0n);
  const minted = Number((base?.[2].result as bigint | undefined) ?? 0n);
  const inVault = Number((base?.[3].result as bigint | undefined) ?? 0n);
  const available = Number((base?.[4].result as bigint | undefined) ?? 0n);
  const colName = (base?.[5].result as string | undefined) ?? "";

  const { data: mine, refetch: refetchMine } = useReadContracts({
    contracts: [
      { address: coin, abi: erc20Abi, functionName: "balanceOf", args: [address ?? coin], chainId: CHAIN },
      { address: coin, abi: erc20Abi, functionName: "allowance", args: [address ?? coin, collection], chainId: CHAIN },
      { ...col, functionName: "idsOf", args: [address ?? coin, 0n, 50n] },
    ],
    query: { enabled: Boolean(address) },
  });
  const bal = (mine?.[0].result as bigint | undefined) ?? 0n;
  const allowance = (mine?.[1].result as bigint | undefined) ?? 0n;
  const owned = useMemo(() => ((mine?.[2].result as readonly bigint[] | undefined) ?? []).slice(), [mine]);

  useEffect(() => setPicked((p) => p.filter((id) => owned.includes(id))), [owned]);

  const need = ratio * BigInt(qty);
  const ratioN = Number(formatEther(ratio));
  const maxQty = Math.max(1, Math.min(50, available));
  const refresh = () => {
    refetchBase();
    refetchMine();
  };

  async function approve() {
    if (!address) return;
    if (await run("Approving", { address: coin, abi: erc20Abi, functionName: "approve", args: [collection, need], chainId: CHAIN }, address)) refresh();
  }
  async function lock() {
    if (!address) return;
    if (await run("Locking coins", { ...col, functionName: "coinToNft", args: [BigInt(qty), address] }, address)) refresh();
  }
  async function redeem() {
    if (!address || picked.length === 0) return;
    if (await run("Returning NFTs", { ...col, functionName: "nftToCoin", args: [picked, address] }, address)) {
      setPicked([]);
      refresh();
    }
  }

  const coinSide = (
    <div className="flex items-end gap-5">
      <StoneCoin letter={ticker[0]} className="w-[84px] shrink-0 drop-shadow-[6px_10px_10px_rgba(60,40,15,0.25)] md:w-[110px]" />
      <div>
        <p className="label">Fungible</p>
        <p className="mt-2 text-[44px] font-[330] leading-[0.9] tracking-tightest md:text-[clamp(44px,4.6vw,84px)]">
          {fmtInt(ratioN * (dir === "toNft" ? qty : Math.max(1, picked.length)))}
        </p>
        <p className="mt-2 font-mono text-[14px] text-muted">${ticker}</p>
      </div>
    </div>
  );
  const nftSide = (
    <div className="flex items-end gap-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/nft/${coin.toLowerCase()}/${dir === "toCoin" && picked[0] ? picked[0] : Math.max(1, minted + 1 > maxSupply ? 1 : minted + 1)}/image`}
        alt=""
        className="w-[64px] shrink-0 rotate-[3deg] drop-shadow-[6px_10px_10px_rgba(60,40,15,0.28)] md:w-[84px]"
      />
      <div>
        <p className="label">Non-fungible</p>
        <p className="mt-2 text-[44px] font-[330] leading-[0.9] tracking-tightest md:text-[clamp(44px,4.6vw,84px)]">
          {dir === "toNft" ? qty : Math.max(1, picked.length)}
        </p>
        <p className="mt-2 font-mono text-[14px] text-muted">{colName || "NFT"}</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="grid items-end gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-[3vw]">
        {dir === "toNft" ? coinSide : nftSide}
        <button onClick={() => setDir((d) => (d === "toNft" ? "toCoin" : "toNft"))} className="self-center transition-transform duration-700 hover:rotate-180 md:justify-self-center" aria-label="Reverse direction">
          <SwapGlyph className="h-10 w-10 md:h-14 md:w-14" />
        </button>
        {dir === "toNft" ? nftSide : coinSide}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 border-t border-line pt-5 font-mono text-[12px] md:grid-cols-4">
        {[
          ["Ratio", `${fmtInt(ratioN)} : 1`],
          ["Minted", `${fmtInt(minted)} / ${fmtInt(maxSupply)}`],
          ["In vault", fmtInt(inVault)],
          ["You hold", address ? `${fmtInt(owned.length)} NFT · ${fmtInt(Math.floor(Number(formatEther(bal))))} $${ticker}` : "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="label">{k}</p>
            <p className="mt-2 text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 border-t border-line pt-6 md:grid-cols-12 md:items-center">
        <div className="flex gap-6 font-mono text-[12px] uppercase tracking-label md:col-span-3">
          {(["toNft", "toCoin"] as const).map((d) => (
            <button key={d} onClick={() => setDir(d)} className={`u-link ${dir === d ? "![background-size:100%_1px] text-ink" : "text-muted"}`}>
              {d === "toNft" ? "Coin → NFT" : "NFT → Coin"}
            </button>
          ))}
        </div>

        {dir === "toNft" ? (
          <>
            <div className="flex items-center gap-5 md:col-span-3">
              <span className="label">Qty</span>
              <div className="flex items-center border border-line font-mono text-[14px]">
                <button className="px-3 py-2 hover:bg-ink/5" onClick={() => setQty((x) => Math.max(1, x - 1))} aria-label="Less">
                  −
                </button>
                <span className="w-8 text-center">{qty}</span>
                <button className="px-3 py-2 hover:bg-ink/5" onClick={() => setQty((x) => Math.min(maxQty, x + 1))} aria-label="More">
                  +
                </button>
              </div>
              <span className="font-mono text-[11px] text-muted">{fmtInt(available)} left</span>
            </div>
            <div className="flex flex-col gap-3 md:col-span-6">
              <Gate>
                {available === 0 ? (
                  <span className="font-mono text-[12px] text-muted">All NFTs are out — wait for someone to return one.</span>
                ) : bal < need ? (
                  <span className="font-mono text-[12px] text-muted">
                    You need {fmtInt(ratioN * qty)} ${ticker}. Buy on the curve first.
                  </span>
                ) : allowance < need ? (
                  <button onClick={approve} disabled={Boolean(busy)} className="group inline-flex items-center justify-between gap-6 rounded-[4px] border border-ink/80 px-6 py-4 font-mono text-[13px] disabled:opacity-50">
                    1 · Approve {fmtInt(ratioN * qty)} ${ticker} <Arrow />
                  </button>
                ) : (
                  <button onClick={lock} disabled={Boolean(busy)} className="group inline-flex items-center justify-between gap-6 rounded-[4px] bg-charcoal px-6 py-4 font-mono text-[13px] text-paper disabled:opacity-50">
                    {allowance >= need && qty > 0 ? "2 · " : ""}Lock coins for {qty} NFT{qty > 1 ? "s" : ""} <Arrow />
                  </button>
                )}
              </Gate>
              <Status busy={busy} msg={msg} hash={hash} />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 md:col-span-9">
            {address && owned.length === 0 && <span className="font-mono text-[12px] text-muted">You don&apos;t hold any of these NFTs yet.</span>}
            {owned.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {owned.map((id) => {
                  const on = picked.includes(id);
                  return (
                    <button
                      key={String(id)}
                      onClick={() => setPicked((p) => (on ? p.filter((x) => x !== id) : [...p, id]))}
                      className={`w-[68px] rounded-[6px] border p-1 transition-colors ${on ? "border-ink bg-paper-deep" : "border-line hover:border-ink/50"}`}
                      title={`#${id}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/nft/${coin.toLowerCase()}/${id}/image`} alt={`#${id}`} className="w-full" />
                      <span className="mt-1 block font-mono text-[10px] text-muted">#{String(id)}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <Gate>
              <button onClick={redeem} disabled={Boolean(busy) || picked.length === 0} className="group inline-flex items-center justify-between gap-6 rounded-[4px] bg-charcoal px-6 py-4 font-mono text-[13px] text-paper disabled:opacity-50 md:max-w-[420px]">
                Return {picked.length || ""} NFT{picked.length === 1 ? "" : "s"} for {fmtInt(ratioN * picked.length)} ${ticker} <Arrow />
              </button>
            </Gate>
            <Status busy={busy} msg={msg} hash={hash} />
          </div>
        )}
      </div>
    </div>
  );
}

export function CollectionPanel(props: Props) {
  if (!FUNGIBL_FACTORY)
    return (
      <p className="font-mono text-[12px] leading-[1.7] text-muted">
        Fungibl collections aren&apos;t deployed on Robinhood Chain yet. Once they are, this coin&apos;s creator can open its collection here.
      </p>
    );
  if (!props.collection) return <CreateCollection {...props} />;
  return <LiveExchange {...props} collection={props.collection} />;
}
