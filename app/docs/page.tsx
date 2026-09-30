import type { ReactNode } from "react";
import Link from "next/link";
import { DocsToc } from "@/components/DocsToc";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { NftCard, StoneCoin } from "@/components/art/Objects";
import { SwapGlyph } from "@/components/ui";
import { FUNGIBL_FACTORY } from "@/lib/fungibl/abi";
import { PONS_V2_FACTORY, explorerAddress, robinhood } from "@/lib/pons/chain";

export const metadata = {
  title: "Docs — Fungibl",
  description: "How Fungibl works: launching a coin on Pons V2, opening its NFT collection, and trading between the two.",
};

const TOC = [
  { id: "overview", label: "Overview", n: "01" },
  { id: "launch", label: "Launching a coin", n: "02" },
  { id: "collection", label: "Opening a collection", n: "03" },
  { id: "exchange", label: "Coin ⇄ NFT", n: "04" },
  { id: "fees", label: "Fees", n: "05" },
  { id: "contracts", label: "Contracts", n: "06" },
  { id: "security", label: "Security & risks", n: "07" },
  { id: "faq", label: "FAQ", n: "08" },
];

function Section({ id, n, title, children }: { id: string; n: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-10 border-t border-line pb-16 pt-10 md:pb-24">
      <p className="font-mono text-[11px] uppercase tracking-label text-muted">{n}</p>
      <h2 className="mt-3 text-[40px] font-[330] leading-[1] tracking-tightest md:text-[56px]">{title}</h2>
      <div className="mt-8 space-y-6">{children}</div>
    </section>
  );
}

const P = ({ children }: { children: ReactNode }) => <p className="max-w-[40em] text-[18px] leading-[1.6] tracking-[-0.01em] text-ink/85">{children}</p>;
const Mono = ({ children }: { children: ReactNode }) => <span className="font-mono text-[0.86em] text-ink">{children}</span>;

function Steps({ items }: { items: [string, ReactNode][] }) {
  return (
    <ol className="max-w-[44em] border-t border-line">
      {items.map(([t, d], i) => (
        <li key={t} className="grid grid-cols-[48px_1fr] gap-4 border-b border-line py-5 md:grid-cols-[64px_220px_1fr]">
          <span className="font-mono text-[12px] text-muted">{String(i + 1).padStart(2, "0")}</span>
          <span className="text-[19px] tracking-[-0.02em]">{t}</span>
          <span className="col-start-2 font-mono text-[12.5px] leading-[1.75] text-muted md:col-start-3">{d}</span>
        </li>
      ))}
    </ol>
  );
}

function Table({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="max-w-[44em] border-t border-line font-mono text-[12.5px]">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-1 gap-1 border-b border-line py-4 md:grid-cols-[240px_1fr] md:gap-6">
          <dt className="text-muted">{k}</dt>
          <dd className="break-all leading-[1.7] text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Note({ children }: { children: ReactNode }) {
  return <div className="max-w-[44em] border-l-2 border-ink/70 bg-paper-light/50 px-5 py-4 font-mono text-[12.5px] leading-[1.75] text-ink/80">{children}</div>;
}

const Ext = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className="u-link text-ink">
    {children}
  </a>
);

export default function DocsPage() {
  return (
    <main>
      <Navbar variant="paper" />

      <header className="mx-auto max-w-[1680px] px-6 pb-14 pt-16 md:px-[4.2vw] md:pb-20 md:pt-24">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="font-mono text-[11px] uppercase tracking-label text-muted">Docs · v1 · Robinhood Chain</p>
            <h1 className="mt-6 text-[52px] font-[330] leading-[0.96] tracking-tightest md:text-[clamp(64px,7vw,124px)]">
              One coin.
              <br />
              One collection.
            </h1>
            <p className="mt-8 max-w-[34em] font-mono text-[13px] leading-[1.75] text-muted">
              Everything about how Fungibl works — launching a coin through Pons V2, giving it a collection, and moving between fungible and
              non-fungible at a fixed ratio.
            </p>
          </div>
          <div aria-hidden className="hidden items-end justify-end gap-4 md:col-span-4 md:flex">
            <StoneCoin letter="F" className="w-[150px] drop-shadow-[8px_12px_12px_rgba(60,40,15,0.25)]" />
            <SwapGlyph className="mb-12 h-10 w-10 text-ink" />
            <div className="w-[112px] rotate-[4deg]">
              <NftCard seed={11} palette={0} number="001" className="w-full drop-shadow-[8px_12px_12px_rgba(60,40,15,0.28)]" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1680px] gap-12 px-6 md:px-[4.2vw] lg:grid-cols-[220px_1fr] lg:gap-[5vw]">
        <aside className="hidden lg:block">
          <DocsToc items={TOC} />
        </aside>

        <article>
          <Section id="overview" n="01" title="Overview">
            <P>
              Fungibl is a launchpad where every coin comes with its own NFT collection. The coin is the liquid half: it trades on a bonding
              curve and later on Uniswap. The collection is the singular half: each NFT has its own face and is backed by a fixed amount of the
              coin, locked in the collection&apos;s vault.
            </P>
            <P>
              Coins launch through <Ext href="https://ponsfamily.com">Pons V2</Ext> on Robinhood Chain. Fungibl adds the collection layer on
              top: one official collection per coin, opened by the coin&apos;s creator, with a two-way swap anyone can use.
            </P>
            <Table
              rows={[
                ["Chain", `Robinhood Chain (ID ${robinhood.id}) · gas in ETH`],
                ["Coin launches", "Pons V2 bonding curve → locked Uniswap V4 pool"],
                ["Collections", "ERC-721, one per coin, fully backed by the coin"],
                ["Fungibl fee", "None"],
              ]}
            />
          </Section>

          <Section id="launch" n="02" title="Launching a coin">
            <P>
              <Link href="/create" className="u-link">
                Create
              </Link>{" "}
              sends your coin straight to the Pons V2 factory from your own wallet. Fungibl never holds your keys or your funds.
            </P>
            <Steps
              items={[
                ["Connect", "Any browser wallet on Robinhood Chain — MetaMask, Rabby, Robinhood Wallet. The site switches network for you."],
                ["Describe the coin", "Name, ticker, description, socials and a logo. Logos upload to permanent public storage."],
                ["Set creator terms", "An optional creator tax (up to the Pons maximum, currently 10%) paid to you on every trade, and buyback-and-lock on or off."],
                ["Sign", "One transaction. The Pons launch fee is 0.0005 ETH plus gas. Launch terms are pinned at signing so they can't change underneath you."],
              ]}
            />
            <P>
              Every Pons V2 coin has a fixed supply of 1,000,000,000, minted entirely to its bonding curve — no creator allocation. Price rises
              as people buy. When the curve raises its graduation threshold (currently 4.2 ETH), the coin graduates: the raised ETH and the
              remaining coins seed a full-range Uniswap V4 pool whose liquidity is locked permanently.
            </P>
            <Note>
              Pons protects the first seconds of trading with a decaying snipe tax. Your own wallet and your fee recipient are exempt, so you
              can buy immediately after launching.
            </Note>
          </Section>

          <Section id="collection" n="03" title="Opening a collection">
            <P>
              A coin gets exactly one collection, and only its creator can open it — the wallet that launched it on Pons, or its current
              creator-fee recipient. The contract checks this against the Pons factory itself, so nobody else can attach a collection to your
              coin.
            </P>
            <Table
              rows={[
                ["NFT supply", "1 – 100,000, fixed forever"],
                ["Coins per NFT", "Any amount, fixed forever. Supply × coins per NFT may not exceed 50% of the coin's supply."],
                ["Artwork", "Every NFT gets a generated stone-mosaic face. The creator can point the collection at their own IPFS art, then freeze it."],
                ["Standard", "ERC-721 with Enumerable and ERC-4906 — shows up in wallets and marketplaces"],
              ]}
            />
            <P>
              After launching from Create, you land on your coin&apos;s page with the collection form already filled in. It&apos;s one more
              signature. You can also open it later from the coin&apos;s page.
            </P>
          </Section>

          <Section id="exchange" n="04" title="Coin ⇄ NFT">
            <P>The collection is its own vault. Swapping is always available, in both directions, at the ratio set when it was opened.</P>
            <Steps
              items={[
                ["Coin → NFT", "Approve the coins once, then lock exactly the ratio per NFT. You receive NFTs — first ones returned to the vault by others, then newly minted ids."],
                ["Pick a specific NFT", "Any NFT sitting in the vault can be claimed by id for the same price."],
                ["NFT → Coin", "Return NFTs you own and receive exactly the ratio in coins for each. The NFT goes back into the vault for someone else."],
              ]}
            />
            <Note>
              Invariant: the vault always holds exactly <Mono>ratio × NFTs in circulation</Mono> coins. Every NFT outside the vault is backed
              1:1, and locked coins can only leave by returning an NFT. Up to 50 NFTs per transaction.
            </Note>
          </Section>

          <Section id="fees" n="05" title="Fees">
            <Table
              rows={[
                ["Fungibl", "0 — no fee on launches, collections or swaps"],
                ["Pons launch fee", "0.0005 ETH per coin"],
                ["Pons trading fee", "1% on bonding-curve trades, charged in ETH; after graduation, the Pons V4 hook fee"],
                ["Creator tax", "0 – 10% set by the creator at launch, paid to the creator"],
                ["Coin ⇄ NFT", "Free — only gas"],
                ["Gas", "Robinhood Chain gas, paid in ETH"],
              ]}
            />
            <P>Pons fee settings are read live from the Pons factory when you launch; the numbers above are today&apos;s values.</P>
          </Section>

          <Section id="contracts" n="06" title="Contracts">
            <Table
              rows={[
                [
                  "FungiblFactory",
                  FUNGIBL_FACTORY ? <Ext href={explorerAddress(FUNGIBL_FACTORY)}>{FUNGIBL_FACTORY}</Ext> : "Not deployed yet",
                ],
                ["FungiblCollection", "One per coin, deployed by the factory (CREATE2, salted by the coin address)"],
                ["Pons V2 LaunchFactory", <Ext key="p" href={explorerAddress(PONS_V2_FACTORY)}>{PONS_V2_FACTORY}</Ext>],
                ["Chain ID", String(robinhood.id)],
                ["RPC", robinhood.rpcUrls.default.http[0]],
                ["Explorer", <Ext key="e" href={robinhood.blockExplorers.default.url}>{robinhood.blockExplorers.default.url}</Ext>],
              ]}
            />
            <P>
              Useful reads: <Mono>collectionOf(coin)</Mono> on the factory; <Mono>ratio()</Mono>, <Mono>maxSupply()</Mono>,{" "}
              <Mono>minted()</Mono>, <Mono>inVault()</Mono> and <Mono>idsOf(owner, offset, limit)</Mono> on a collection.
            </P>
          </Section>

          <Section id="security" n="07" title="Security & risks">
            <Table
              rows={[
                ["Admin keys", "None. The factory and collections have no owner and cannot be paused or upgraded."],
                ["Locked coins", "Only released by returning an NFT. Ratio, supply and coin are immutable."],
                ["Creator powers", "Change or freeze the metadata link. Nothing else."],
                ["Testing", "Unit, fuzz and invariant tests, plus an end-to-end test against live Pons V2 on a Robinhood Chain fork. Static analysis with Slither."],
                ["Audit", "Not yet independently audited."],
              ]}
            />
            <Note>
              Memecoins are volatile and most go to zero. Bonding-curve prices move fast, graduation is not guaranteed, and smart contracts can
              have bugs. Only use what you can afford to lose. Generated NFT artwork is served by Fungibl until a creator moves it to IPFS.
            </Note>
          </Section>

          <Section id="faq" n="08" title="FAQ">
            {[
              ["Can I add a collection to a coin I didn't launch?", "No. Only the coin's Pons deployer or its creator-fee recipient can open its collection."],
              ["Can the ratio change later?", "No. It's fixed when the collection opens, which is what gives the NFTs a floor in coins."],
              ["What happens when my coin graduates?", "Nothing changes for the collection. The coin is the same token before and after graduation, so swaps keep working."],
              ["Is there a floor price for NFTs?", "Every NFT can always be returned for its ratio in coins, so its value never falls below that many coins."],
              ["Where do I see my NFTs?", "On the coin's page under Coin ⇄ NFT, and in any wallet that supports ERC-721 on Robinhood Chain."],
            ].map(([q, a]) => (
              <details key={q} className="group max-w-[44em] border-b border-line py-5">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 text-[19px] tracking-[-0.02em]">
                  {q}
                  <span className="font-mono text-[14px] text-muted transition-transform duration-500 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 font-mono text-[12.5px] leading-[1.75] text-muted">{a}</p>
              </details>
            ))}
          </Section>
        </article>
      </div>

      <Footer />
    </main>
  );
}
