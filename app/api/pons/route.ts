import { NextResponse } from "next/server";
import { getFactoryState, getLaunchFeed } from "@/lib/pons/server";

export const revalidate = 30;

/** Health check: factory state + how many live launches we can read. */
export async function GET() {
  const out: Record<string, unknown> = {};
  try {
    out.factory = await getFactoryState();
  } catch (e) {
    out.factoryError = e instanceof Error ? e.message.slice(0, 300) : String(e);
  }
  const feed = await getLaunchFeed(12);
  out.feed = {
    live: feed.live,
    source: feed.source,
    error: feed.error,
    count: feed.launches.length,
    scanned: feed.scanned,
    enriched: feed.enriched,
    sample: feed.launches.slice(0, 3).map((l) => ({ name: l.name, ticker: l.ticker, address: l.address, progress: l.progress, price: l.price })),
  };
  return NextResponse.json(out);
}
