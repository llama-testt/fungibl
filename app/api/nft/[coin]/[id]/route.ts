import { NextResponse } from "next/server";
import { faceTraits } from "@/lib/fungibl/svg";
import { getCollectionMeta } from "@/lib/pons/server";

/** ERC-721 metadata. The collection's baseURI points here: `${site}/api/nft/${coin}/` + id. */
export async function GET(req: Request, { params }: { params: Promise<{ coin: string; id: string }> }) {
  const { coin, id } = await params;
  const n = Number(id);
  if (!/^0x[0-9a-fA-F]{40}$/.test(coin) || !Number.isInteger(n) || n < 1 || n > 100_000)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const origin = new URL(req.url).origin;
  const meta = await getCollectionMeta(coin);
  const t = faceTraits(coin, n);
  const templates = ["Brimmed", "Eared", "Antennae", "Tall hair"];
  return NextResponse.json(
    {
      name: `${meta?.name ?? "Fungibl"} #${n}`,
      description: `One face of ${meta?.coinName ?? "a Fungibl coin"}. Backed by locked $${meta?.ticker ?? "COIN"} and redeemable for it at any time on Fungibl.`,
      image: `${origin}/api/nft/${coin.toLowerCase()}/${n}/image`,
      external_url: `${origin}/launch/${coin.toLowerCase()}`,
      attributes: [
        { trait_type: "Silhouette", value: templates[t.template] },
        { trait_type: "Palette", value: `Mineral ${t.palette + 1}` },
      ],
    },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" } },
  );
}
