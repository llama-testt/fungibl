import { defineChain } from "viem";

export const RPC_URL = process.env.NEXT_PUBLIC_ROBINHOOD_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";

export const robinhood = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC_URL] } },
  blockExplorers: { default: { name: "Blockscout", url: "https://robinhoodchain.blockscout.com" } },
});

/** Pons V2 (bonding curve → Uniswap V4). Source: github.com/ponsdotdev/pons-labs */
export const PONS_V2_FACTORY = "0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e" as const;

export const explorerTx = (hash: string) => `${robinhood.blockExplorers.default.url}/tx/${hash}`;
export const explorerAddress = (a: string) => `${robinhood.blockExplorers.default.url}/address/${a}`;
