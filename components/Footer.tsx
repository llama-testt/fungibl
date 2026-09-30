import Link from "next/link";
import { Button, Mark } from "./ui";
import { SOCIAL } from "@/lib/site";
import { DotWordmark } from "./DotWordmark";

const PLATE = "/img/hero.jpg";

export function Footer() {
  return (
    <footer className="mt-28 overflow-x-clip md:mt-[11vw]">
      {/* Closing window — the same sky, later in the evening */}
      <div className="px-4 md:px-[3.5vw]">
        <div data-theme="light" className="window relative mx-auto aspect-[4/5] w-full md:aspect-[2.6/1]">
          <div
            className="photo absolute inset-0"
            style={{ backgroundImage: `url(${PLATE})`, backgroundSize: "cover", backgroundPosition: "50% 8%", filter: "saturate(0.85) contrast(0.95) sepia(0.12) brightness(0.97)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(246,232,206,0.45),rgba(246,232,206,0.05)_60%)]" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="film-grain" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-[4.4%]">
            <p className="font-mono text-[11px] uppercase tracking-label text-ink/70">Fungible / Non-fungible</p>
            <div>
              <h2 className="text-[44px] font-[330] leading-[0.98] tracking-tightest md:text-[clamp(52px,5.4vw,96px)]">
                Launch something
                <br />
                worth collecting.
              </h2>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/create" arrow>
                  Create a Coin
                </Button>
                <Button href="/explore" variant="ghost">
                  Explore Launches
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1680px] px-6 pb-10 pt-20 md:px-[4.2vw]">
        <div className="relative z-10 grid gap-10 border-t border-line pt-8 font-mono text-[12px] md:grid-cols-12">
          <div className="flex items-start gap-3 md:col-span-4">
            <Mark className="h-5 w-5" />
            <span className="uppercase tracking-label text-muted">Every coin has a face.</span>
          </div>
          {[
            ["Platform", [["Launches", "/#launches"], ["Explore", "/explore"], ["Create", "/create"], ["How it works", "/#how"]]],
            ["Docs", [["Overview", "/docs"], ["Coin ⇄ NFT", "/docs#exchange"], ["Fees", "/docs#fees"], ["Contracts", "/docs#contracts"]]],
            ["Social", [["X / Twitter", SOCIAL.x], ["Fungibl on Pons", SOCIAL.pons]]],
          ].map(([h, links]) => (
            <div key={h as string} className="md:col-span-2">
              <p className="label">{h as string}</p>
              <ul className="mt-4 space-y-2">
                {(links as string[][]).map(([l, href]) => (
                  <li key={l}>
                    {href.startsWith("http") ? (
                      <a href={href} target="_blank" rel="noreferrer" className="u-link">
                        {l} ↗
                      </a>
                    ) : (
                      <Link href={href} className="u-link">
                        {l}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-muted md:col-span-2 md:text-right">
            © 2026 Fungibl
            <br />
            Coins × NFTs × Culture
          </p>
        </div>

        <DotWordmark className="relative z-0 mt-16 md:mt-24" />
      </div>
    </footer>
  );
}
