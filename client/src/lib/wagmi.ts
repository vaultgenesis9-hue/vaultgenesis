import { createConfig, http } from "wagmi";
import { mainnet, sepolia, bsc, polygon } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;

// Use a single injected() connector without a specific target.
// This auto-detects all installed browser wallets (MetaMask, Phantom, etc.)
// and avoids duplicates that occur when injected({ target: "metaMask" }) and
// injected({ target: "phantom" }) are both listed alongside the generic injected().
const connectors = [
  injected(),
  coinbaseWallet({
    appName: "VaultGenesis",
  }),
  // Only add WalletConnect if projectId is available to prevent crash when env var is missing
  ...(projectId
    ? [
        walletConnect({
          projectId,
          metadata: {
            name: "VaultGenesis",
            description: "The next-generation DeFi platform",
            url: "https://vaultgenesis.com",
            icons: ["https://vaultgenesis.com/favicon.ico"],
          },
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains: [mainnet, bsc, polygon, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http("https://bsc-dataseed.binance.org/"),
    [polygon.id]: http("https://polygon-rpc.com/"),
    [sepolia.id]: http(),
  },
});

export type { Config } from "wagmi";
