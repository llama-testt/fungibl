export type LaunchStatus = "live" | "new" | "trending" | "graduated";

/** Which slice of the landscape plate sits behind the paired object. */
export type Backdrop = "summit" | "sky" | "cloud" | "valley" | "haze" | "moon";

export type Launch = {
  id: string;
  index: string;
  name: string;
  ticker: string;
  collection: string;
  status: LaunchStatus;
  /** "demo" = illustrative sample data, "pons" = live Pons V2 launch on Robinhood Chain */
  source: "demo" | "pons";
  price: number; // demo: USD per coin · pons: ETH per coin (spot on the curve)
  marketCap: number; // demo: USD · pons: ETH
  floor: number | null; // ETH — null until the collection is live
  supply: number | null; // NFT supply
  minted: number | null;
  holders: number | null;
  ratio: number | null; // coins per 1 NFT
  progress: number; // bonding progress 0–100
  backdrop: Backdrop;
  seed: number; // pixel character seed
  palette: number; // index into NFT palettes
  blurb: string;
  launchedAgo: string;
  // live-only fields
  address?: `0x${string}`;
  curve?: `0x${string}`;
  deployer?: `0x${string}`;
  logo?: string;
  raisedEth?: number;
  thresholdEth?: number;
  graduated?: boolean;
  launchedAt?: number; // unix seconds
};

export const launches: Launch[] = [
  {
    id: "super-inu",
    index: "001",
    name: "Super Inu",
    ticker: "SUPER",
    collection: "Super Inu Originals",
    status: "live",
    source: "demo",
    price: 0.0042,
    marketCap: 320_000,
    floor: 0.42,
    supply: 1_000,
    minted: 500,
    holders: 1_842,
    ratio: 100_000,
    progress: 64,
    backdrop: "summit",
    seed: 11,
    palette: 0,
    blurb: "A thousand stone-cut dogs, found at the top of a hill nobody remembers climbing.",
    launchedAgo: "2h",
  },
  {
    id: "moth-club",
    index: "002",
    name: "Moth Club",
    ticker: "MOTH",
    collection: "Moth Club Members",
    status: "trending",
    source: "demo",
    price: 0.0118,
    marketCap: 1_180_000,
    floor: 0.91,
    supply: 777,
    minted: 702,
    holders: 3_406,
    ratio: 50_000,
    progress: 88,
    backdrop: "haze",
    seed: 42,
    palette: 1,
    blurb: "Nocturnal members' club. Every coin is a key to one lamp.",
    launchedAgo: "1d",
  },
  {
    id: "quiet-horses",
    index: "003",
    name: "Quiet Horses",
    ticker: "HRSE",
    collection: "Quiet Horses",
    status: "new",
    source: "demo",
    price: 0.0009,
    marketCap: 64_000,
    floor: 0.08,
    supply: 2_000,
    minted: 214,
    holders: 388,
    ratio: 200_000,
    progress: 17,
    backdrop: "valley",
    seed: 7,
    palette: 2,
    blurb: "Two thousand horses standing very still in a very large field.",
    launchedAgo: "38m",
  },
  {
    id: "pebble-society",
    index: "004",
    name: "Pebble Society",
    ticker: "PBBL",
    collection: "The Pebbles",
    status: "graduated",
    source: "demo",
    price: 0.031,
    marketCap: 4_200_000,
    floor: 1.64,
    supply: 500,
    minted: 500,
    holders: 6_120,
    ratio: 25_000,
    progress: 100,
    backdrop: "sky",
    seed: 93,
    palette: 3,
    blurb: "Fully minted. Now trading freely between coin and collectible.",
    launchedAgo: "3w",
  },
  {
    id: "late-dial-up",
    index: "005",
    name: "Late Dial-Up",
    ticker: "MODEM",
    collection: "56k Faces",
    status: "live",
    source: "demo",
    price: 0.0021,
    marketCap: 188_000,
    floor: 0.19,
    supply: 1_560,
    minted: 623,
    holders: 1_014,
    ratio: 150_000,
    progress: 41,
    backdrop: "cloud",
    seed: 56,
    palette: 4,
    blurb: "Portraits compressed at 56 kilobits per second. Patience is the utility.",
    launchedAgo: "5h",
  },
  {
    id: "saint-gecko",
    index: "006",
    name: "Saint Gecko",
    ticker: "GECKO",
    collection: "Gecko Reliquary",
    status: "trending",
    source: "demo",
    price: 0.0074,
    marketCap: 740_000,
    floor: 0.55,
    supply: 888,
    minted: 690,
    holders: 2_277,
    ratio: 80_000,
    progress: 79,
    backdrop: "moon",
    seed: 23,
    palette: 5,
    blurb: "Small saints for warm walls. Collected mostly at dusk.",
    launchedAgo: "2d",
  },
  {
    id: "paper-weather",
    index: "007",
    name: "Paper Weather",
    ticker: "WTHR",
    collection: "Forecasts",
    status: "new",
    source: "demo",
    price: 0.0004,
    marketCap: 31_000,
    floor: 0.04,
    supply: 3_650,
    minted: 102,
    holders: 164,
    ratio: 300_000,
    progress: 6,
    backdrop: "cloud",
    seed: 71,
    palette: 2,
    blurb: "One NFT for every day of the next ten years. Coin tracks the mood.",
    launchedAgo: "12m",
  },
  {
    id: "old-signal",
    index: "008",
    name: "Old Signal",
    ticker: "SGNL",
    collection: "Transmissions",
    status: "graduated",
    source: "demo",
    price: 0.022,
    marketCap: 2_600_000,
    floor: 1.12,
    supply: 1_000,
    minted: 1_000,
    holders: 4_880,
    ratio: 100_000,
    progress: 100,
    backdrop: "haze",
    seed: 88,
    palette: 1,
    blurb: "Received on a hilltop in 1998. Decoded on-chain in 2026.",
    launchedAgo: "5w",
  },
];

export const getDemoLaunch = (id: string) => launches.find((l) => l.id === id);

export const fmtUsd = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 2).replace(/\.?0+$/, "")}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
};

export const fmtPrice = (n: number) => `$${n.toFixed(4)}`;
export const fmtInt = (n: number) => n.toLocaleString("en-US");
export const fmtEth = (n: number) => `${n.toFixed(2)} ETH`;

const SUB = "₀₁₂₃₄₅₆₇₈₉";
/** Small ETH amounts in compact notation: 0.0₇189 ETH (seven zeros, then 189). */
export const fmtEthPrecise = (n: number) => {
  if (!n) return "0 ETH";
  if (n >= 1) return `${n.toFixed(2)} ETH`;
  if (n >= 0.001) return `${n.toFixed(4).replace(/0+$/, "")} ETH`;
  const zeros = -Math.floor(Math.log10(n)) - 1;
  const digits = Math.round(n * 10 ** (zeros + 3)).toString().slice(0, 3).replace(/0+$/, "");
  const sub = String(zeros).split("").map((d) => SUB[Number(d)]).join("");
  return `0.0${sub}${digits} ETH`;
};

export const dash = "—";
export const coinPrice = (l: Launch) => (l.source === "pons" ? (l.graduated ? "On V4" : fmtEthPrecise(l.price)) : fmtPrice(l.price));
export const coinMcap = (l: Launch) => (l.source === "pons" ? (l.graduated ? dash : fmtEthPrecise(l.marketCap)) : fmtUsd(l.marketCap));
export const nftFloor = (l: Launch) => (l.floor == null ? dash : fmtEth(l.floor));
export const nftSupply = (l: Launch) => (l.supply == null ? dash : fmtInt(l.supply));
export const holders = (l: Launch) => (l.holders == null ? dash : fmtInt(l.holders));
export const mintedLine = (l: Launch) => (l.minted == null || l.supply == null ? "Collection soon" : `${fmtInt(l.minted)} / ${fmtInt(l.supply)}`);
