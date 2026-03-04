import { useState } from "react";
import { X, Loader2, CheckCircle, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string, wallet: string) => void;
}

const WALLETS = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect using browser wallet",
    icon: "🦊",
    popular: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Scan with mobile wallet",
    icon: "🔗",
    popular: true,
  },
  {
    id: "phantom",
    name: "Phantom",
    description: "Solana & multi-chain wallet",
    icon: "👻",
    popular: false,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Connect Coinbase wallet",
    icon: "🔵",
    popular: false,
  },
];

function generateAddress() {
  const chars = "0123456789abcdef";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
  return addr;
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<{ address: string; wallet: string } | null>(null);

  if (!isOpen) return null;

  const handleConnect = async (walletId: string) => {
    setConnecting(walletId);
    await new Promise(r => setTimeout(r, 1800));
    const address = generateAddress();
    setConnecting(null);
    setConnected({ address, wallet: walletId });
    onConnect(address, walletId);
    toast.success("Wallet connected successfully!");
  };

  const handleCopy = () => {
    if (connected) {
      navigator.clipboard.writeText(connected.address);
      toast.success("Address copied!");
    }
  };

  const handleDisconnect = () => {
    setConnected(null);
    onClose();
    toast.info("Wallet disconnected");
  };

  const cardClass = `rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-sm rounded-3xl border shadow-2xl ${isDark ? 'bg-black border-white/10' : 'bg-[#fafaf8] border-black/10'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <h2 className={`text-lg font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>
            {connected ? "Wallet Connected" : "Connect Wallet"}
          </h2>
          <button onClick={onClose} className={`p-1.5 rounded-xl transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/10'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {connected ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                  {WALLETS.find(w => w.id === connected.wallet)?.icon}
                </div>
                <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Connected via {WALLETS.find(w => w.id === connected.wallet)?.name}
                </p>
              </div>

              <div className={`${cardClass} p-4`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Wallet Address</p>
                <div className="flex items-center gap-2">
                  <p className={`font-mono text-xs flex-1 truncate ${isDark ? 'text-white' : 'text-black'}`}>{connected.address}</p>
                  <button onClick={handleCopy} className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/10'}`}>
                    <Copy className="w-4 h-4" />
                  </button>
                  <a href="#" className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-black hover:bg-black/10'}`}>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`${cardClass} p-3 text-center`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Balance</p>
                  <p className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>0.00 ETH</p>
                </div>
                <div className={`${cardClass} p-3 text-center`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Network</p>
                  <p className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>Ethereum</p>
                </div>
              </div>

              <button onClick={handleDisconnect} className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all border ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'}`}>
                Disconnect
              </button>
            </div>
          ) : (
            /* Wallet Selection */
            <div className="space-y-3">
              <p className={`text-xs mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Choose your preferred wallet to connect to VaultGenesis
              </p>
              {WALLETS.map(wallet => (
                <button
                  key={wallet.id}
                  onClick={() => handleConnect(wallet.id)}
                  disabled={!!connecting}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                    isDark
                      ? 'border-white/10 hover:border-white/30 hover:bg-white/5'
                      : 'border-black/10 hover:border-black/30 hover:bg-black/5'
                  } ${connecting === wallet.id ? 'opacity-80' : ''}`}
                >
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>{wallet.name}</p>
                      {wallet.popular && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-gray-400' : 'bg-black/10 text-gray-600'}`}>Popular</span>
                      )}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{wallet.description}</p>
                  </div>
                  {connecting === wallet.id ? (
                    <Loader2 className={`w-5 h-5 animate-spin ${isDark ? 'text-white' : 'text-black'}`} />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/20'}`} />
                  )}
                </button>
              ))}

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
