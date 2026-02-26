import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function Presale() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  const presaleStats = {
    totalRaised: "$1,250,000",
    totalTokens: "5,000,000 VG",
    tokenPrice: "$0.25",
    progress: 75,
    timeRemaining: "5 days 12 hours",
  };

  const handleBuyTokens = () => {
    if (!walletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(`Successfully purchased ${amount} VG tokens!`);
    setAmount("");
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-[#fafaf8]'} relative overflow-hidden`}>
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
        }}></div>
        <div className="absolute rounded-full animate-float-glow-2" style={{
          width: '400px',
          height: '600px',
          background: isDark 
            ? 'radial-gradient(rgba(255, 255, 255, 0.3) 0%, rgba(0, 0, 0, 0) 70%)'
            : 'radial-gradient(rgba(80, 80, 80, 0.4) 0%, rgba(250, 250, 248, 0) 70%)',
          filter: 'blur(80px)',
          opacity: isDark ? 0.6 : 0.8,
        }}></div>
      </div>

      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="relative z-10 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black mb-4 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>PRESALE</h1>
          <p className={`text-sm sm:text-base md:text-lg mb-12 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Get early access to VG tokens at a special presale price
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <Card className={`p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <h2 className={`text-xl sm:text-2xl font-black mb-6 uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>Presale Progress</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between mb-2">
                    <span className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Raised</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{presaleStats.totalRaised}</span>
                  </div>
                  <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-800' : 'bg-gray-300'}`}>
                    <div
                      className={`h-3 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
                      style={{ width: `${presaleStats.progress}%` }}
                    />
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-4 mb-8 p-4 sm:p-6 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-300'}`}>
                  <div>
                    <p className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Token Price</p>
                    <p className={`text-lg sm:text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-black'}`}>{presaleStats.tokenPrice}</p>
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Tokens</p>
                    <p className={`text-lg sm:text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-black'}`}>{presaleStats.totalTokens}</p>
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time Left</p>
                    <p className={`text-lg sm:text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-black'}`}>{presaleStats.timeRemaining}</p>
                  </div>
                  <div>
                    <p className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Progress</p>
                    <p className={`text-lg sm:text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-black'}`}>{presaleStats.progress}%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="amount" className={`block text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Amount (USDC)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount in USDC"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                  />
                  <div className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    You will receive: {amount ? (parseFloat(amount) / 0.25).toFixed(0) : "0"} VG tokens
                  </div>
                  <button
                    onClick={handleBuyTokens}
                    className={`w-full py-3 px-4 rounded-lg font-semibold uppercase text-sm transition-all ${
                      isDark
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-black text-white hover:bg-gray-900'
                    }`}
                  >
                    {walletConnected ? "BUY TOKENS" : "CONNECT WALLET TO BUY"}
                  </button>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <h3 className={`font-bold mb-4 uppercase tracking-wider text-base ${isDark ? 'text-white' : 'text-black'}`}>Wallet</h3>
                {walletConnected ? (
                  <>
                    <p className={`text-xs sm:text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Connected</p>
                    <p className={`font-mono text-xs sm:text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>0x742d...8f2e</p>
                    <button
                      className={`w-full py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                        isDark
                          ? 'border border-gray-600 text-white hover:bg-gray-800'
                          : 'border border-gray-400 text-black hover:bg-gray-100'
                      }`}
                      onClick={() => setWalletConnected(false)}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                      isDark
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-black text-white hover:bg-gray-900'
                    }`}
                    onClick={() => setWalletConnected(true)}
                  >
                    Connect Wallet
                  </button>
                )}
              </Card>

              <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <h3 className={`font-bold mb-4 uppercase tracking-wider text-base ${isDark ? 'text-white' : 'text-black'}`}>Presale Tiers</h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tier 1</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>$0.20 (SOLD OUT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tier 2</span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>$0.25 (CURRENT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tier 3</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>$0.30 (UPCOMING)</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
