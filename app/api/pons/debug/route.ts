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
  return NextResponse.json(out);
}
