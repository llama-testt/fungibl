# Fungibl contracts

Every Pons V2 coin can get one official NFT collection that is also its vault.

- `FungiblFactory` — no owner. `createCollection(coin, …)` is callable only by the coin's Pons deployer or creator-fee recipient, once per coin. Checks the coin with `PonsV2LaunchFactory.getLaunchedToken`.
- `FungiblCollection` — ERC-721 (+Enumerable, ERC-4906). `coinToNft` locks exactly `ratio` coins per NFT (re-issuing returned NFTs before minting new ids), `claim` takes specific vault-held ids, `nftToCoin` returns NFTs and pays `ratio` coins each. Ratio, supply cap and coin are immutable; locked coins can only leave by returning an NFT. The creator can change / freeze the metadata base URI and nothing else.

Invariant (fuzzed): `coin.balanceOf(collection) == ratio * circulating()`.

```bash
git clone --depth 1 --branch v5.4.0 https://github.com/OpenZeppelin/openzeppelin-contracts lib/openzeppelin-contracts
git clone --depth 1 https://github.com/foundry-rs/forge-std lib/forge-std
forge test                                   # unit + fuzz + invariants
FORK_URL=https://rpc.mainnet.chain.robinhood.com forge test --mc ForkTest -vv   # live Pons V2 fork
```

Deploy from the site at `/deploy` (wallet-signed), then set `NEXT_PUBLIC_FUNGIBL_FACTORY` in Vercel.

Not audited. Get an independent audit before significant value is locked.
