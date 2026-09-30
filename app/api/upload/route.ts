import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

/**
 * Stores a coin logo and returns the URI to save on-chain.
 * - PINATA_JWT set           → pinned to IPFS, returns ipfs://CID
 * - BLOB_READ_WRITE_TOKEN set → Vercel Blob, returns a permanent https URL
 */
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp" };
const MAX = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const pinata = process.env.PINATA_JWT;
  const blob = process.env.BLOB_READ_WRITE_TOKEN;
  if (!pinata && !blob) return NextResponse.json({ error: "Image upload isn't configured yet." }, { status: 501 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Max 4 MB" }, { status: 413 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "PNG, JPG, GIF or WEBP only" }, { status: 415 });

  // Check magic bytes, not just the declared type.
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hex = Array.from(head, (b) => b.toString(16).padStart(2, "0")).join("");
  const ok =
    (ext === "png" && hex.startsWith("89504e47")) ||
    (ext === "jpg" && hex.startsWith("ffd8ff")) ||
    (ext === "gif" && hex.startsWith("47494638")) ||
    (ext === "webp" && hex.startsWith("52494646") && hex.slice(16, 24) === "57454250");
  if (!ok) return NextResponse.json({ error: "That file isn't a valid image." }, { status: 415 });

  if (pinata) {
    const body = new FormData();
    body.append("file", file, `logo.${ext}`);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", { method: "POST", headers: { Authorization: `Bearer ${pinata}` }, body });
    if (!res.ok) return NextResponse.json({ error: "Upload failed" }, { status: 502 });
    const { IpfsHash } = (await res.json()) as { IpfsHash: string };
    return NextResponse.json({ uri: `ipfs://${IpfsHash}`, preview: `https://gateway.pinata.cloud/ipfs/${IpfsHash}` });
  }

  const stored = await put(`logos/${crypto.randomUUID()}.${ext}`, file, { access: "public", contentType: file.type, token: blob });
  return NextResponse.json({ uri: stored.url, preview: stored.url });
}

export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.PINATA_JWT || process.env.BLOB_READ_WRITE_TOKEN) });
}
