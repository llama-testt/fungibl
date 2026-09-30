import { NextResponse } from "next/server";

/**
 * Pins a coin logo to IPFS via Pinata so the launch can store an ipfs:// URI.
 * Needs PINATA_JWT in the environment; without it the Create form asks for a URL instead.
 */
export async function POST(req: Request) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) return NextResponse.json({ error: "IPFS upload is not configured" }, { status: 501 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Max 4 MB" }, { status: 413 });
  if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) return NextResponse.json({ error: "PNG, JPG, GIF or WEBP only" }, { status: 415 });
  const body = new FormData();
  body.append("file", file, file.name || "logo");
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", { method: "POST", headers: { Authorization: `Bearer ${jwt}` }, body });
  if (!res.ok) return NextResponse.json({ error: "Upload failed" }, { status: 502 });
  const { IpfsHash } = (await res.json()) as { IpfsHash: string };
  return NextResponse.json({ uri: `ipfs://${IpfsHash}`, gateway: `https://gateway.pinata.cloud/ipfs/${IpfsHash}` });
}

export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.PINATA_JWT) });
}
