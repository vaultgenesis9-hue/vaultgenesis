import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

export default function Staking() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("VG");

  const stakingTokens = [
    { symbol: "VG", apy: "45%", staked: "2,500,000", earned: "125,000" },
    { symbol: "USDC", apy: "12%", staked: "500,000", earned: "60,000" },
    { symbol: "ETH", apy: "8%", staked: "100", earned: "8" },
  ];

  const handleStake = () => {
    if (!stakeAmount) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(`Successfully staked ${stakeAmount} ${selectedToken}!`);
    setStakeAmount("");
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
          <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black mb-4 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>STAKING</h1>
          <p className={`text-sm sm:text-base md:text-lg mb-12 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Earn rewards by staking your tokens</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className={`p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <h2 className={`text-xl sm:text-2xl font-black mb-6 uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>Stake Tokens</h2>
                <div className="space-y-4">
                  <div>
                    <Label className={`block text-xs sm:text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Select Token</Label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg text-sm ${isDark ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-300 text-black'}`}
                    >
                      {stakingTokens.map((t) => (
                        <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="stakeAmount" className={`block text-xs sm:text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Amount</Label>
                    <Input
                      id="stakeAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className={`text-sm ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'}`}
                    />
                  </div>
                  <button
                    onClick={handleStake}
                    className={`w-full py-3 px-4 rounded-lg font-semibold uppercase text-sm transition-all ${
                      isDark
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-black text-white hover:bg-gray-900'
                    }`}
                  >
                    STAKE NOW
                  </button>
                </div>
              </Card>

              <div className="space-y-4">
                <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>Your Positions</h2>
                {stakingTokens.map((token) => (
                  <Card key={token.symbol} className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.symbol}</h3>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>APY: {token.apy}</p>
                      </div>
                      <button className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        isDark
                          ? 'border border-gray-600 text-white hover:bg-gray-800'
                          : 'border border-gray-400 text-black hover:bg-gray-100'
                      }`}>
                        UNSTAKE
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Staked</p>
                        <p className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-black'}`}>{token.staked}</p>
                      </div>
                      <div>
                        <p className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Earned</p>
                        <p className={`font-bold mt-2 ${isDark ? 'text-white' : 'text-black'}`}>{token.earned}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <h3 className={`font-bold mb-4 uppercase tracking-wider text-base ${isDark ? 'text-white' : 'text-black'}`}>Total Rewards</h3>
                <p className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-black'}`}>$193,000</p>
                <button className={`w-full mt-4 py-2 px-3 rounded-lg font-semibold uppercase text-xs sm:text-sm transition-all ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-900'
                }`}>
                  CLAIM ALL
                </button>
              </Card>

              <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <h3 className={`font-bold mb-4 uppercase tracking-wider text-base ${isDark ? 'text-white' : 'text-black'}`}>Total Staked</h3>
                <p className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-black'}`}>$3.1M</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
