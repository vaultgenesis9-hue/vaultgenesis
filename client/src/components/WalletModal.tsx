import { X, Loader2, CheckCircle, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useWallet } from "@/hooks/useWallet";
import type { Connector } from "wagmi";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLET_META: Record<string, { icon: string; description: string }> = {
  metaMask: { icon: "🦊", description: "Connect using browser wallet" },
  walletConnect: { icon: "🔗", description: "Scan with mobile wallet" },
  coinbaseWallet: { icon: "🔵", description: "Connect Coinbase wallet" },
  phantom: { icon: "👻", description: "Solana & multi-chain wallet" },
};

function getWalletMeta(connector: Connector) {
  return WALLET_META[connector.id] ?? { icon: "💼", description: "Connect wallet" };
}

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const {
    address, shortAddress, isConnected, isConnecting,
    connector: activeConnector, formattedBalance, chainId,
    connect, connectors, disconnect,
  } = useWallet();

  if (!isOpen) return null;

  const handleConnect = (connector: Connector) => {
    connect(
      { connector },
      {
        onSuccess: () => {
          toast.success("Wallet connected successfully!");
          onClose();
        },
        onError: (err) => {
          toast.error(err.message || "Failed to connect wallet");
        },
      }
    );
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied!");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose();
    toast.info("Wallet disconnected");
  };

  const cardClass = `rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`;

  const chainName = chainId === 1 ? "Ethereum" : chainId === 56 ? "BNB Chain" : chainId === 137 ? "Polygon" : chainId === 11155111 ? "Sepolia" : `Chain ${chainId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-sm rounded-3xl border shadow-2xl ${isDark ? 'bg-black border-white/10' : 'bg-[#fafaf8] border-black/10'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <h2 className={`text-lg font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>
            {isConnected ? "Wallet Connected" : "Connect Wallet"}
          </h2>
          <button onClick={onClose} className={`p-1.5 rounded-xl transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/10'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isConnected && address ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                  {activeConnector ? getWalletMeta(activeConnector).icon : "💼"}
                </div>
                <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Connected via {activeConnector?.name ?? "Wallet"}
                </p>
              </div>

              <div className={`${cardClass} p-4`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className={`font-mono text-xs flex-1 truncate ${isDark ? 'text-white' : 'text-black'}`}>{address}</p>
                  <button onClick={handleCopy} className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/10'}`}>
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={`https://etherscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/10'}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`${cardClass} p-3 text-center`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Balance</p>
                  <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>{formattedBalance ?? "—"}</p>
                </div>
                <div className={`${cardClass} p-3 text-center`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Network</p>
                  <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>{chainName}</p>
                </div>
              </div>

              <button onClick={handleDisconnect} className={`w-full py-2 px-4 rounded-xl font-semibold text-xs uppercase tracking-wide transition-all border ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'}`}>
                Disconnect
              </button>
            </div>
          ) : (
            /* Wallet Selection */
            <div className="space-y-3">
              <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose your preferred wallet to connect to VaultGenesis
              </p>
              {connectors.map(connector => {
                const meta = getWalletMeta(connector);
                const isPending = isConnecting;
                return (
                  <button
                    key={connector.id}
                    onClick={() => handleConnect(connector)}
                    disabled={isPending}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      isDark
                        ? 'border-white/10 hover:border-white/30 hover:bg-white/5'
                        : 'border-black/10 hover:border-black/30 hover:bg-black/5'
                    } ${isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-2xl">{meta.icon}</span>
                    <div className="flex-1">
                      <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>{connector.name}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{meta.description}</p>
                    </div>
                    {isPending ? (
                      <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-white' : 'text-black'}`} />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/20'}`} />
                    )}
                  </button>
                );
              })}

              <p className={`text-xs text-center mt-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
