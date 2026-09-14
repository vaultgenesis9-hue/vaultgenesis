import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import WalletModal from '@/components/WalletModal';
import { useWallet } from '@/hooks/useWallet';
import { Copy, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function Wallet() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { address, isConnected, connector, formattedBalance, chainId } = useWallet();

  const chainName =
    chainId === 1 ? 'Ethereum' : chainId === 56 ? 'BNB Chain' : chainId === 137 ? 'Polygon' : chainId ? `Chain ${chainId}` : '—';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-[#fafaf8]'}`}>
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full animate-float-glow-1" style={{
          width: '600px',
          height: '800px',
          background: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)'
            : 'radial-gradient(rgba(80, 80, 80, 0.4) 0%, rgba(250, 250, 248, 0) 70%)',
          filter: 'blur(80px)',
          opacity: isDark ? 0.6 : 0.8,
          top: '10%',
          left: '-10%'
        }}></div>
        <div className="absolute rounded-full animate-float-glow-3" style={{
          width: '500px',
          height: '700px',
          background: isDark
            ? 'radial-gradient(rgba(255, 255, 255, 0.25) 0%, rgba(0, 0, 0, 0) 70%)'
            : 'radial-gradient(rgba(80, 80, 80, 0.35) 0%, rgba(250, 250, 248, 0) 70%)',
          filter: 'blur(80px)',
          opacity: isDark ? 0.5 : 0.75,
          bottom: '10%',
          right: '-10%'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className={`text-5xl md:text-6xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              WALLET
            </h1>
            <p className={`text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Connect your wallet to VaultGenesis
            </p>
          </div>

          {!isConnected ? (
            <div className={`p-8 rounded-2xl border text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
              <ShieldCheck className={`w-10 h-10 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Connecting proves you own a wallet by signing a message — your private key or recovery phrase
                never leaves your device and is never sent to VaultGenesis.
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className={`py-3 px-8 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-900'
                }`}
              >
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
              <div className="flex items-center gap-2 mb-6">
                <CheckCircle2 size={20} className={isDark ? 'text-green-400' : 'text-green-600'} />
                <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                  Connected via {connector?.name ?? 'wallet'}
                </span>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Wallet Address
                </label>
                <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <code className={`text-sm truncate ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{address}</code>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => address && copyToClipboard(address)}
                      className={`p-2 rounded hover:opacity-70 transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                    >
                      <Copy size={18} />
                    </button>
                    {address && (
                      <a
                        href={`https://etherscan.io/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`p-2 rounded hover:opacity-70 transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-xs mb-1 uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Balance</p>
                  <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>{formattedBalance ?? '—'}</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <p className={`text-xs mb-1 uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Network</p>
                  <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>{chainName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className={`mt-12 p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              How it works
            </h3>
            <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex gap-3">
                <span className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>1.</span>
                <span>Click Connect Wallet and choose your wallet app (MetaMask, Coinbase Wallet, WalletConnect, etc.)</span>
              </li>
              <li className="flex gap-3">
                <span className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>2.</span>
                <span>Approve the connection in your wallet — you only sign a message, you never type a seed phrase or private key</span>
              </li>
              <li className="flex gap-3">
                <span className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>3.</span>
                <span>Start staking, trading, and managing your portfolio in one place</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
