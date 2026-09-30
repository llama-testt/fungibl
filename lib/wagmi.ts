import { createConfig, http, injected } from "wagmi";
import { RPC_URL, robinhood } from "./pons/chain";

/**
 * Browser wallets (MetaMask, Rabby, Robinhood Wallet, Coinbase extension, and
 * wallet in-app browsers on mobile) via EIP-1193 / EIP-6963 discovery.
 */
export const wagmiConfig = createConfig({
  chains: [robinhood],
  connectors: [injected({ shimDisconnect: true })],
  multiInjectedProviderDiscovery: true,
  transports: { [robinhood.id]: http(RPC_URL) },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
