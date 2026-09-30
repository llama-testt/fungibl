import "server-only";
import { createPublicClient, formatEther, http, type Address } from "viem";
import { curveAbi, factoryAbi, tokenAbi } from "./abi";
import { PONS_V2_FACTORY, RPC_URL, robinhood } from "./chain";
import { launches as demoLaunches, type Backdrop, type Launch, type LaunchStatus } from "../launches";

const client = createPublicClient({
  chain: robinhood,
  transport: http(process.env.ROBINHOOD_RPC_URL || RPC_URL, { batch: { batchSize: 40, wait: 10 }, timeout: 12_000 }),
});

type Found = { token: Address; curve: Address; deployer: Address; block: bigint; time?: number };

const BACKDROPS: Backdrop[] = ["sky", "cloud", "valley", "haze", "moon"];

function hash(addr: string) {
  let h = 0;
  for (let i = 2; i < addr.length; i++) h = (h * 31 + addr.charCodeAt(i)) >>> 0;
  return h;
}

function ago(sec?: number) {
  if (!sec) return "—";
  const d = Math.max(0, Date.now() / 1000 - sec);
  if (d < 3600) return `${Math.max(1, Math.round(d / 60))}m`;
  if (d < 86400) return `${Math.round(d / 3600)}h`;
  if (d < 86400 * 14) return `${Math.round(d / 86400)}d`;
  return `${Math.round(d / 604800)}w`;
}

/** Discover recent launches via Bitquery (if a token is configured). */
async function fromBitquery(limit: number): Promise<Found[] | null> {
  const token = process.env.BITQUERY_TOKEN;
  if (!token) return null;
  const query = `{
    EVM(network: robinhood) {
      Events(
        limit: {count: ${limit}}
        orderBy: {descending: Block_Time}
        where: {LogHeader: {Address: {is: "${PONS_V2_FACTORY.toLowerCase()}"}}, Log: {Signature: {Name: {is: "TokenLaunched"}}}}
      ) {
        Block { Time Number }
        Arguments { Name Value { ... on EVM_ABI_Address_Value_Arg { address } } }
      }
    }
  }`;
  try {
    const res = await fetch("https://streaming.bitquery.io/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query }),
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const events = json?.data?.EVM?.Events as
      | { Block: { Time: string; Number: string }; Arguments: { Name: string; Value: { address?: string } }[] }[]
      | undefined;
    if (!events) return null;
    return events
      .map((e) => {
        const arg = (n: string) => e.Arguments.find((a) => a.Name === n)?.Value?.address as Address | undefined;
        return {
          token: arg("token")!,
          curve: arg("curve")!,
          deployer: arg("deployer")!,
          block: BigInt(e.Block.Number),
          time: Math.floor(new Date(e.Block.Time).getTime() / 1000),
        };
      })
      .filter((f) => f.token && f.curve);
  } catch {
    return null;
  }
}

/** Discover recent launches straight from factory logs, scanning backwards. */
async function fromLogs(limit: number): Promise<Found[]> {
  const event = factoryAbi.find((x) => x.type === "event" && x.name === "TokenLaunched") as Extract<
    (typeof factoryAbi)[number],
    { type: "event"; name: "TokenLaunched" }
  >;
  const latest = await client.getBlockNumber();
  let to = latest;
  let span = 400_000n;
  const found: Found[] = [];
  const deadline = Date.now() + 9_000;
  for (let i = 0; i < 40 && found.length < limit && to > 0n && Date.now() < deadline; i++) {
    const from = to > span ? to - span : 0n;
    try {
      const logs = await client.getLogs({ address: PONS_V2_FACTORY, event, fromBlock: from, toBlock: to });
      for (const l of [...logs].reverse()) {
        const a = l.args;
        if (a.token && a.curve && a.deployer) found.push({ token: a.token, curve: a.curve, deployer: a.deployer, block: l.blockNumber });
      }
      to = from - 1n;
      if (logs.length === 0 && span < 3_200_000n) span *= 2n;
    } catch {
      // RPC range limit: shrink and retry the same window
      span = span / 4n;
      if (span < 1_000n) break;
    }
  }
  return found.slice(0, limit);
}

async function enrich(f: Found, i: number): Promise<Launch | null> {
  const tok = { address: f.token, abi: tokenAbi } as const;
  const cur = { address: f.curve, abi: curveAbi } as const;
  try {
    const [name, symbol, supply, info, reserves, real, threshold, graduated, block] = await Promise.all([
      client.readContract({ ...tok, functionName: "name" }),
      client.readContract({ ...tok, functionName: "symbol" }),
      client.readContract({ ...tok, functionName: "totalSupply" }),
      client.readContract({ ...tok, functionName: "getTokenInfo" }).catch(() => null),
      client.readContract({ ...cur, functionName: "getReserves" }).catch(() => [0n, 0n] as const),
      client.readContract({ ...cur, functionName: "realQuoteReserve" }).catch(() => 0n),
      client.readContract({ ...cur, functionName: "graduationThreshold" }).catch(() => 0n),
      client.readContract({ ...cur, functionName: "graduated" }).catch(() => false),
      f.time ? Promise.resolve(null) : client.getBlock({ blockNumber: f.block }).catch(() => null),
    ]);
    const [q, t] = reserves as readonly [bigint, bigint];
    const price = t > 0n ? Number(formatEther(q)) / Number(formatEther(t)) : 0;
    const supplyN = Number(formatEther(supply));
    const raised = Number(formatEther(real));
    const thr = Number(formatEther(threshold));
    const progress = graduated ? 100 : thr > 0 ? Math.min(100, Math.round((raised / thr) * 100)) : 0;
    const time = f.time ?? (block ? Number(block.timestamp) : undefined);
    const age = time ? Date.now() / 1000 - time : Infinity;
    const status: LaunchStatus = graduated ? "graduated" : age < 6 * 3600 ? "new" : progress >= 40 ? "trending" : "live";
    const h = hash(f.token.toLowerCase());
    const desc = info ? (info as readonly [Address, string, string, unknown])[2] : "";
    const logo = info ? (info as readonly [Address, string, string, unknown])[1] : "";
    return {
      id: f.token.toLowerCase(),
      index: String(i + 1).padStart(3, "0"),
      name,
      ticker: symbol.replace(/^\$/, "").toUpperCase(),
      collection: `${name} Collection`,
      status,
      source: "pons",
      price,
      marketCap: price * supplyN,
      floor: null,
      supply: null,
      minted: null,
      holders: null,
      ratio: null,
      progress,
      backdrop: BACKDROPS[h % BACKDROPS.length],
      seed: h % 997,
      palette: h % 6,
      blurb: (desc || "Launched on Pons V2, Robinhood Chain.").slice(0, 180),
      launchedAgo: ago(time),
      address: f.token,
      curve: f.curve,
      deployer: f.deployer,
      logo,
      raisedEth: raised,
      thresholdEth: thr,
      graduated,
      launchedAt: time,
    };
  } catch {
    return null;
  }
}

export type LaunchFeed = { launches: Launch[]; live: boolean; source: "bitquery" | "rpc" | "demo"; error?: string };

/** Latest Pons V2 launches, enriched from chain. Falls back to demo data if the chain can't be reached. */
export async function getLaunchFeed(limit = 24): Promise<LaunchFeed> {
  try {
    const bq = await fromBitquery(limit);
    const found = bq ?? (await fromLogs(limit));
    const enriched = (await Promise.all(found.map((f, i) => enrich(f, i)))).filter(Boolean) as Launch[];
    if (enriched.length === 0) return { launches: demoLaunches, live: false, source: "demo", error: "no launches found" };
    return { launches: enriched, live: true, source: bq ? "bitquery" : "rpc" };
  } catch (e) {
    return { launches: demoLaunches, live: false, source: "demo", error: e instanceof Error ? e.message.slice(0, 200) : "unknown" };
  }
}

export async function getLaunchByAddress(address: string): Promise<Launch | null> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return null;
  try {
    const rec = await client.readContract({
      address: PONS_V2_FACTORY,
      abi: [
        {
          type: "function",
          name: "getLaunchedToken",
          stateMutability: "view",
          inputs: [{ name: "token", type: "address" }],
          outputs: [
            {
              type: "tuple",
              components: [
                { name: "token", type: "address" },
                { name: "curve", type: "address" },
                { name: "deployer", type: "address" },
                { name: "creatorFeeRecipient", type: "address" },
                { name: "pairToken", type: "address" },
                { name: "graduationThreshold", type: "uint256" },
                { name: "poolFee", type: "uint24" },
                { name: "tickSpacing", type: "int24" },
                { name: "creatorTaxBps", type: "uint16" },
                { name: "buybackEnabled", type: "bool" },
                { name: "phase", type: "uint8" },
                { name: "sweptQuote", type: "uint256" },
                { name: "sweptTokens", type: "uint256" },
                { name: "sweptAt", type: "uint256" },
                { name: "exists", type: "bool" },
              ],
            },
          ],
        },
      ] as const,
      functionName: "getLaunchedToken",
      args: [address as Address],
    });
    if (!rec.exists) return null;
    return enrich({ token: rec.token, curve: rec.curve, deployer: rec.deployer, block: 0n, time: undefined }, 0).then((l) =>
      l ? { ...l, launchedAgo: "—" } : null,
    );
  } catch {
    return null;
  }
}

/** Factory state, for the health endpoint and the Create flow's server-side sanity check. */
export async function getFactoryState() {
  const f = { address: PONS_V2_FACTORY, abi: factoryAbi } as const;
  const [block, launchFee, launchEnabled, maxCreatorTaxBps, count] = await Promise.all([
    client.getBlockNumber(),
    client.readContract({ ...f, functionName: "launchFee" }),
    client.readContract({ ...f, functionName: "launchEnabled" }),
    client.readContract({ ...f, functionName: "maxCreatorTaxBps" }),
    client.readContract({ ...f, functionName: "launchConfigCount" }),
  ]);
  const configs = await Promise.all(
    Array.from({ length: Number(count) }, (_, i) => client.readContract({ ...f, functionName: "getLaunchConfig", args: [BigInt(i)] })),
  );
  return {
    chainId: robinhood.id,
    block: block.toString(),
    factory: PONS_V2_FACTORY,
    launchFeeEth: formatEther(launchFee),
    launchEnabled,
    maxCreatorTaxBps: Number(maxCreatorTaxBps),
    configs: configs.map((c, i) => ({
      id: i,
      enabled: c.enabled,
      supply: formatEther(c.supply),
      curveFeeBps: Number(c.curveFeeBps),
      graduationThresholdEth: formatEther(c.graduationThreshold),
    })),
  };
}

export { demoLaunches };
