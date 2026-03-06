import { createConfig, http } from "wagmi";
import { mainnet, sepolia, bsc, polygon } from "wagmi/chains";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;
// Alchemy URL is server-side only (ALCHEMY_API_URL), so we use a public fallback for the frontend.
// The backend uses ALCHEMY_API_URL directly for on-chain reads.
export const wagmiConfig = createConfig({
  chains: [mainnet, bsc, polygon, sepolia],
  connectors: [
    injected({ target: "metaMask" }),
    walletConnect({
      projectId,
      metadata: {
        name: "VaultGenesis",
        description: "The next-generation DeFi platform",
        url: "https://vaultgenesis.com",
        icons: ["https://vaultgenesis.com/favicon.ico"],
      },
    }),
    coinbaseWallet({
      appName: "VaultGenesis",
    }),
    injected({ target: "phantom" }),
  ],
  transports: {
    // Use Alchemy via the backend proxy; fallback to public RPC for frontend reads
    [mainnet.id]: http(),
    [bsc.id]: http("https://bsc-dataseed.binance.org/"),
    [polygon.id]: http("https://polygon-rpc.com/"),
    [sepolia.id]: http(),
  },
});

export type { Config } from "wagmi";
