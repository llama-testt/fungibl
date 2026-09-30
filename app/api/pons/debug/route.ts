import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { factoryAbi } from "@/lib/pons/abi";
import { PONS_V2_FACTORY, RPC_URL, robinhood } from "@/lib/pons/chain";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const span = BigInt(new URL(req.url).searchParams.get("span") || "100000");
  const client = createPublicClient({ chain: robinhood, transport: http(process.env.ROBINHOOD_RPC_URL || RPC_URL) });
  const event = factoryAbi.find((x) => x.type === "event" && x.name === "TokenLaunched") as Extract<
    (typeof factoryAbi)[number],
    { type: "event"; name: "TokenLaunched" }
  >;
  const latest = await client.getBlockNumber();
  const out: Record<string, unknown> = { latest: latest.toString(), span: span.toString() };
  const t = Date.now();
  try {
    const logs = await client.getLogs({ address: PONS_V2_FACTORY, event, fromBlock: latest - span, toBlock: latest });
    out.count = logs.length;
    out.first = logs[0] ? { block: logs[0].blockNumber?.toString(), token: logs[0].args.token } : null;
  } catch (e) {
    out.error = e instanceof Error ? e.message.slice(0, 500) : String(e);
  }
  out.ms = Date.now() - t;
  const tok = (out.first as { token?: `0x${string}` } | null)?.token;
  if (tok) {
    const { tokenAbi } = await import("@/lib/pons/abi");
    const batched = createPublicClient({ chain: robinhood, transport: http(process.env.ROBINHOOD_RPC_URL || RPC_URL, { batch: true }) });
    for (const [label, c] of [["plain", client], ["batched", batched]] as const) {
      try {
        out[label] = await c.readContract({ address: tok, abi: tokenAbi, functionName: "symbol" });
      } catch (e) {
        out[label + "Error"] = e instanceof Error ? e.message.slice(0, 300) : String(e);
      }
    }
    try {
      const code = await client.getCode({ address: "0xcA11bde05977b3631167028862bE2a173976CA11" });
      out.multicall3 = Boolean(code && code !== "0x");
    } catch (e) {
      out.multicall3Error = String(e).slice(0, 200);
    }
  }
  return NextResponse.json(out);
}
