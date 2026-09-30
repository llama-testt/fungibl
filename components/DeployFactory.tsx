"use client";

import { useState } from "react";
import type { Abi, Hex } from "viem";
import { useAccount, useChainId, useDeployContract, usePublicClient, useSwitchChain } from "wagmi";
import artifacts from "@/lib/fungibl/artifacts.json";
import { FUNGIBL_FACTORY } from "@/lib/fungibl/abi";
import { PONS_V2_FACTORY, explorerAddress, explorerTx, robinhood } from "@/lib/pons/chain";
import { Arrow, SectionHead } from "./ui";
import { WalletButton } from "./WalletButton";

/**
 * One-time setup: deploys FungiblFactory from the connected wallet. The
 * factory has no owner, so whoever deploys it holds no special powers.
 */
export function DeployFactory() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const client = usePublicClient({ chainId: robinhood.id });
  const { deployContractAsync } = useDeployContract();
  const [hash, setHash] = useState("");
  const [deployed, setDeployed] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function deploy() {
    if (!client || !address) return;
    setBusy(true);
    setMsg("");
    try {
      const h = await deployContractAsync({
        abi: artifacts.FungiblFactory.abi as Abi,
        bytecode: artifacts.FungiblFactory.bytecode as Hex,
        args: [PONS_V2_FACTORY],
        chainId: robinhood.id,
      });
      setHash(h);
      const r = await client.waitForTransactionReceipt({ hash: h });
      if (r.status !== "success" || !r.contractAddress) throw new Error("Deployment reverted.");
      setDeployed(r.contractAddress);
    } catch (e) {
      setMsg(e instanceof Error ? e.message.split("\n")[0] : "Deployment failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-[1100px] px-6 pb-10 pt-16 md:px-[4.2vw]">
      <SectionHead index="—" label="Setup" right={<span>Robinhood Chain · one time</span>} />
      <h1 className="mt-10 text-[48px] font-[330] leading-[0.98] tracking-tightest md:text-[80px]">Deploy collections</h1>
      <p className="mt-6 max-w-[40em] font-mono text-[13px] leading-[1.7] text-muted">
        Deploys <span className="text-ink">FungiblFactory</span> pointed at Pons V2 ({PONS_V2_FACTORY.slice(0, 10)}…). It has no owner and holds no funds;
        it only lets a Pons coin&apos;s creator open that coin&apos;s one collection. Gas is paid by the connected wallet.
      </p>

      <div className="mt-10 border-t border-line pt-8">
        {FUNGIBL_FACTORY ? (
          <p className="font-mono text-[13px]">
            Already live at{" "}
            <a className="u-link" href={explorerAddress(FUNGIBL_FACTORY)} target="_blank" rel="noreferrer">
              {FUNGIBL_FACTORY}
            </a>
            .
          </p>
        ) : deployed ? (
          <div className="font-mono text-[13px] leading-[1.8]">
            <p className="label">Deployed</p>
            <p className="mt-2 break-all text-[18px]">{deployed}</p>
            <p className="mt-4 text-muted">
              Add it in Vercel → Settings → Environment Variables as <span className="text-ink">NEXT_PUBLIC_FUNGIBL_FACTORY</span>, then redeploy.
            </p>
          </div>
        ) : !isConnected ? (
          <WalletButton variant="paper" />
        ) : chainId !== robinhood.id ? (
          <button onClick={() => switchChain({ chainId: robinhood.id })} className="group inline-flex items-center gap-6 rounded-[4px] bg-charcoal px-6 py-4 font-mono text-[13px] text-paper">
            Switch to Robinhood Chain <Arrow />
          </button>
        ) : (
          <button onClick={deploy} disabled={busy} className="group inline-flex items-center gap-6 rounded-[4px] bg-charcoal px-6 py-4 font-mono text-[13px] text-paper disabled:opacity-50">
            {busy ? "Deploying… confirm in wallet" : "Deploy FungiblFactory"} <Arrow />
          </button>
        )}
        {hash && (
          <a href={explorerTx(hash)} target="_blank" rel="noreferrer" className="u-link mt-4 inline-block font-mono text-[12px] text-muted">
            View transaction ↗
          </a>
        )}
        {msg && <p className="mt-4 font-mono text-[12px] text-clay">{msg}</p>}
      </div>
    </section>
  );
}
