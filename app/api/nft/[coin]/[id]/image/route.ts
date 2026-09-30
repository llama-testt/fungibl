import { faceSvg } from "@/lib/fungibl/svg";

export async function GET(_: Request, { params }: { params: Promise<{ coin: string; id: string }> }) {
  const { coin, id } = await params;
  const n = Number(id);
  if (!/^0x[0-9a-fA-F]{40}$/.test(coin) || !Number.isInteger(n) || n < 1 || n > 100_000) return new Response("Not found", { status: 404 });
  return new Response(faceSvg(coin, n), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400, immutable" },
  });
}
