import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';
import { Copy, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type WalletMode = 'import-seed' | 'transfer-exchange';

export default function Wallet() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<WalletMode>('import-seed');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showSeed, setShowSeed] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedExchange, setSelectedExchange] = useState('');
  const [exchangeApiKey, setExchangeApiKey] = useState('');
  const [exchangeSecret, setExchangeSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const exchanges = [
    { id: 'binance', name: 'Binance' },
    { id: 'coinbase', name: 'Coinbase' },
    { id: 'kraken', name: 'Kraken' },
    { id: 'huobi', name: 'Huobi' },
    { id: 'okx', name: 'OKX' },
  ];

  const handleImportSeed = async () => {
    if (!seedPhrase.trim()) {
      toast.error('Please enter your seed phrase');
      return;
    }

    if (seedPhrase.split(' ').length !== 12 && seedPhrase.split(' ').length !== 24) {
      toast.error('Seed phrase must be 12 or 24 words');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate wallet import - in production this would call a backend API
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
      setWalletAddress(mockAddress);
      toast.success('Wallet imported successfully!');
      setSeedPhrase('');
    } catch (error) {
      toast.error('Failed to import wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferFromExchange = async () => {
    if (!selectedExchange) {
      toast.error('Please select an exchange');
      return;
    }

    if (!exchangeApiKey.trim() || !exchangeSecret.trim()) {
      toast.error('Please enter API key and secret');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate exchange connection - in production this would call a backend API
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Connected to ${selectedExchange.toUpperCase()}! Tokens will be transferred.`);
      setExchangeApiKey('');
      setExchangeSecret('');
      setSelectedExchange('');
    } catch (error) {
      toast.error('Failed to connect to exchange');
    } finally {
      setIsLoading(false);
    }
  };

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
              Import your wallet or transfer tokens from exchanges
            </p>
          </div>

          {/* Mode Selector */}
          <div className={`flex gap-2 mb-8 p-1 rounded-full ${isDark ? 'bg-gray-900' : 'bg-gray-200'}`}>
            <button
              onClick={() => setMode('import-seed')}
              className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all ${
                mode === 'import-seed'
                  ? isDark
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Import Seed Phrase
            </button>
            <button
              onClick={() => setMode('transfer-exchange')}
              className={`flex-1 py-3 px-4 rounded-full font-semibold transition-all ${
                mode === 'transfer-exchange'
                  ? isDark
                    ? 'bg-white text-black'
                    : 'bg-black text-white'
                  : isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Transfer from Exchange
            </button>
          </div>

          {/* Import Seed Phrase Section */}
          {mode === 'import-seed' && (
            <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Seed Phrase (12 or 24 words)
                </label>
                <div className={`relative border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                  <textarea
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    placeholder="Enter your 12 or 24 word seed phrase..."
                    className={`w-full p-4 rounded-lg resize-none focus:outline-none leading-relaxed ${
                      isDark
                        ? 'bg-gray-800 text-white placeholder-gray-500'
                        : 'bg-white text-black placeholder-gray-400'
                    }`}
                    rows={4}
                    style={{ verticalAlign: 'top' }}
                  />
                  <button
                    onClick={() => setShowSeed(!showSeed)}
                    className={`absolute top-3 right-3 p-2 rounded hover:opacity-70 transition ${
                      isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {showSeed ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleImportSeed}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200 disabled:opacity-50'
                    : 'bg-black text-white hover:bg-gray-900 disabled:opacity-50'
                }`}
              >
                {isLoading ? 'Importing...' : 'Import Wallet'}
              </button>

              {walletAddress && (
                <div className={`mt-6 p-4 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-100/30 border-green-300'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={20} className={isDark ? 'text-green-400' : 'text-green-600'} />
                    <span className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                      Wallet Imported Successfully
                    </span>
                  </div>
                  <div className={`flex items-center justify-between p-3 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <code className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {walletAddress}
                    </code>
                    <button
                      onClick={() => copyToClipboard(walletAddress)}
                      className={`p-2 rounded hover:opacity-70 transition ${
                        isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transfer from Exchange Section */}
          {mode === 'transfer-exchange' && (
            <div className={`p-8 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Select Exchange
                </label>
                <select
                  value={selectedExchange}
                  onChange={(e) => setSelectedExchange(e.target.value)}
                  className={`w-full p-3 rounded-lg border focus:outline-none ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-black'
                  }`}
                >
                  <option value="">Choose an exchange...</option>
                  {exchanges.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  API Key
                </label>
                <input
                  type="password"
                  value={exchangeApiKey}
                  onChange={(e) => setExchangeApiKey(e.target.value)}
                  placeholder="Enter your exchange API key"
                  className={`w-full p-3 rounded-lg border focus:outline-none ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-black placeholder-gray-400'
                  }`}
                />
              </div>

              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  API Secret
                </label>
                <div className={`relative border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={exchangeSecret}
                    onChange={(e) => setExchangeSecret(e.target.value)}
                    placeholder="Enter your exchange API secret"
                    className={`w-full p-3 rounded-lg focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 text-white placeholder-gray-500'
                        : 'bg-white text-black placeholder-gray-400'
                    }`}
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className={`absolute top-3 right-3 p-2 rounded hover:opacity-70 transition ${
                      isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    {showSecret ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Security Warning */}
              <div className={`mb-6 p-4 rounded-lg border flex gap-3 ${isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-100/30 border-yellow-300'}`}>
                <AlertCircle size={20} className={isDark ? 'text-yellow-400 flex-shrink-0' : 'text-yellow-600 flex-shrink-0'} />
                <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  Never share your API keys. VaultGenesis uses read-only access to securely transfer your tokens.
                </p>
              </div>

              <button
                onClick={handleTransferFromExchange}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200 disabled:opacity-50'
                    : 'bg-black text-white hover:bg-gray-900 disabled:opacity-50'
                }`}
              >
                {isLoading ? 'Connecting...' : 'Connect & Transfer'}
              </button>
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
                <span>Choose to import your wallet via seed phrase or connect to an exchange</span>
              </li>
              <li className="flex gap-3">
                <span className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>2.</span>
                <span>Your tokens will be securely transferred to your VaultGenesis wallet</span>
              </li>
              <li className="flex gap-3">
                <span className={`font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>3.</span>
                <span>Start staking, trading, and managing your portfolio in one place</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
