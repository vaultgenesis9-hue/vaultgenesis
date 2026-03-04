import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { Gift, Unlock, AlertTriangle } from "lucide-react";

interface StakePosition {
  id: number;
  token: string;
  amount: number;
  apy: number;
  earned: number;
  stakedAt: Date;
  status: "active" | "unstaked";
}

const APY_DATA = [
  { month: "Sep", vg: 38, usdc: 10, eth: 8 },
  { month: "Oct", vg: 42, usdc: 11, eth: 9 },
  { month: "Nov", vg: 40, usdc: 10, eth: 8 },
  { month: "Dec", vg: 44, usdc: 12, eth: 10 },
  { month: "Jan", vg: 43, usdc: 11, eth: 9 },
  { month: "Feb", vg: 45, usdc: 12, eth: 10 },
  { month: "Mar", vg: 45, usdc: 12, eth: 10 },
];

const TOKENS = [
  { symbol: "VG", name: "Vault Genesis", apy: 45, minStake: 100 },
  { symbol: "USDC", name: "USD Coin", apy: 12, minStake: 50 },
  { symbol: "ETH", name: "Ethereum", apy: 10, minStake: 0.01 },
];

export default function Staking() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState("VG");
  const [stakeAmount, setStakeAmount] = useState("");
  const [isStaking, setIsStaking] = useState(false);
  const [unstakeConfirm, setUnstakeConfirm] = useState<number | null>(null);
  const [positions, setPositions] = useState<StakePosition[]>([
    { id: 1, token: "VG", amount: 2500000, apy: 45, earned: 125000, stakedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: "active" },
    { id: 2, token: "USDC", amount: 5000, apy: 12, earned: 49.3, stakedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), status: "active" },
    { id: 3, token: "ETH", amount: 2.5, apy: 10, earned: 0.031, stakedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), status: "active" },
  ]);

  // Live reward accrual
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map(p => {
        if (p.status !== "active") return p;
        const perSecond = (p.amount * p.apy / 100) / (365 * 24 * 60 * 60);
        return { ...p, earned: p.earned + perSecond };
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeToken = TOKENS.find(t => t.symbol === selectedToken)!;
  const estimatedAnnual = stakeAmount ? Number(stakeAmount) * activeToken.apy / 100 : 0;
  const estimatedMonthly = estimatedAnnual / 12;

  const handleStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (Number(stakeAmount) < activeToken.minStake) { toast.error(`Minimum stake is ${activeToken.minStake} ${selectedToken}`); return; }
    setIsStaking(true);
    await new Promise(r => setTimeout(r, 1500));
    setPositions(prev => [{
      id: prev.length + 1, token: selectedToken, amount: Number(stakeAmount),
      apy: activeToken.apy, earned: 0, stakedAt: new Date(), status: "active",
    }, ...prev]);
    toast.success(`Successfully staked ${Number(stakeAmount).toLocaleString()} ${selectedToken}!`);
    setStakeAmount("");
    setIsStaking(false);
  };

  const handleClaim = (id: number) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;
    toast.success(`Claimed ${pos.earned.toFixed(4)} ${pos.token} rewards!`);
    setPositions(prev => prev.map(p => p.id === id ? { ...p, earned: 0 } : p));
  };

  const handleClaimAll = () => {
    const active = positions.filter(p => p.status === "active" && p.earned > 0);
    if (!active.length) { toast.info("No rewards to claim"); return; }
    toast.success("All rewards claimed successfully!");
    setPositions(prev => prev.map(p => p.status === "active" ? { ...p, earned: 0 } : p));
  };

  const handleUnstake = (id: number) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, status: "unstaked" } : p));
    toast.success("Position unstaked. Funds available in 24 hours.");
    setUnstakeConfirm(null);
  };

  const totalEarned = positions.filter(p => p.status === "active").reduce((a, p) => a + p.earned, 0);
  const totalStakedUSD = positions.filter(p => p.status === "active").reduce((a, p) =>
    a + (p.token === "VG" ? p.amount * 0.20 : p.token === "USDC" ? p.amount : p.amount * 3200), 0);

  const cardClass = `rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/10'}`;
  const labelClass = `text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`;
  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-white/20' : 'bg-black/5 border-black/10 text-black placeholder-gray-400 focus:ring-black/20'}`;
  const maxApy = Math.max(...APY_DATA.map(d => d.vg));

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-[#fafaf8]'} relative overflow-hidden`}>
      <div className="absolute inset-0 pointer-events-none">
        {[1, 2, 3].map(i => (
          <div key={i} className={`absolute rounded-full animate-float-glow-${i}`} style={{
            width: i === 1 ? '600px' : '400px', height: i === 1 ? '800px' : '500px',
            background: isDark ? 'radial-gradient(rgba(255,255,255,0.25) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(rgba(80,80,80,0.35) 0%, rgba(250,250,248,0) 70%)',
            filter: 'blur(80px)', opacity: isDark ? 0.5 : 0.7,
          }} />
        ))}
      </div>

      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black mb-2 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>STAKING</h1>
          <p className={`text-sm sm:text-base mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Earn passive rewards by staking your tokens</p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Staked (USD)", value: `$${totalStakedUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
              { label: "Total Earned", value: `$${totalEarned.toFixed(2)}` },
              { label: "Active Positions", value: String(positions.filter(p => p.status === "active").length) },
              { label: "Best APY", value: "45%" },
            ].map(stat => (
              <div key={stat.label} className={`${cardClass} p-4`}>
                <p className={`${labelClass} mb-1`}>{stat.label}</p>
                <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Stake Form */}
            <div className={`${cardClass} p-6`}>
              <p className={`${labelClass} mb-4`}>Stake Tokens</p>
              <div className="flex gap-2 mb-5">
                {TOKENS.map(t => (
                  <button key={t.symbol} onClick={() => setSelectedToken(t.symbol)}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold uppercase tracking-wide transition-all ${selectedToken === t.symbol
                      ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                      : isDark ? 'bg-white/10 text-gray-400 hover:bg-white/20' : 'bg-black/10 text-gray-600 hover:bg-black/20'}`}>
                    {t.symbol}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amount to Stake</label>
                  <Input type="number" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} placeholder={`Min ${activeToken.minStake} ${selectedToken}`} className={inputClass} />
                </div>
                <div className={`rounded-xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Current APY</span>
                    <span className="font-black text-green-400">{activeToken.apy}%</span>
                  </div>
                  {stakeAmount && Number(stakeAmount) > 0 && (
                    <>
                      <div className="flex justify-between text-sm mb-1">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Est. Monthly</span>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{estimatedMonthly.toFixed(4)} {selectedToken}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Est. Annual</span>
                        <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{estimatedAnnual.toFixed(4)} {selectedToken}</span>
                      </div>
                    </>
                  )}
                </div>
                <Button onClick={handleStake} disabled={isStaking} className={`w-full rounded-lg py-2 px-4 font-semibold text-xs uppercase tracking-wide ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                  {isStaking ? "Staking..." : `Stake ${selectedToken}`}
                </Button>
              </div>
            </div>

            {/* APY Chart */}
            <div className={`${cardClass} p-6`}>
              <p className={`${labelClass} mb-4`}>APY History (6 Months)</p>
              <div className="flex items-end gap-2 mb-3" style={{ height: '120px' }}>
                {APY_DATA.map(d => (
                  <div key={d.month} className="flex-1 flex flex-col items-center justify-end gap-1" style={{ height: '100%' }}>
                    <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                      <div className={`w-full rounded-t-sm ${isDark ? 'bg-white/70' : 'bg-black/60'}`} style={{ height: `${(d.vg / maxApy) * 100}px` }} title={`VG: ${d.vg}%`} />
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{d.month}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 text-xs mt-2">
                {[
                  { color: isDark ? 'bg-white/70' : 'bg-black/60', label: `VG (45%)` },
                  { color: 'bg-blue-400', label: `USDC (12%)` },
                  { color: 'bg-purple-400', label: `ETH (10%)` },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className={`${cardClass} p-6`}>
            <div className="flex justify-between items-center mb-4">
              <p className={labelClass}>Your Positions</p>
              <Button onClick={handleClaimAll} size="sm" className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}>
                <Gift className="w-3.5 h-3.5" /> Claim All
              </Button>
            </div>
            <div className="space-y-3">
              {positions.map(pos => (
                <div key={pos.id} className={`rounded-xl border p-4 transition-opacity ${pos.status === "unstaked" ? 'opacity-50' : ''} ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                        {pos.token.slice(0, 2)}
                      </div>
                      <div>
                        <p className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>{pos.amount.toLocaleString()} {pos.token}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          APY: <span className="text-green-400 font-bold">{pos.apy}%</span> · Staked {Math.floor((Date.now() - pos.stakedAt.getTime()) / (1000 * 60 * 60 * 24))}d ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-right mr-2">
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Earned</p>
                        <p className="text-green-400 font-black text-sm tabular-nums">{pos.earned.toFixed(4)} {pos.token}</p>
                      </div>
                      {pos.status === "active" ? (
                        <>
                          <Button onClick={() => handleClaim(pos.id)} size="sm" className={`rounded-xl px-3 py-1.5 text-xs font-bold ${isDark ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50 border border-green-700/30' : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'}`}>
                            <Gift className="w-3 h-3 mr-1" /> Claim
                          </Button>
                          <Button onClick={() => setUnstakeConfirm(pos.id)} size="sm" variant="outline" className={`rounded-xl px-3 py-1.5 text-xs font-bold ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'}`}>
                            <Unlock className="w-3 h-3 mr-1" /> Unstake
                          </Button>
                        </>
                      ) : (
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-xl ${isDark ? 'bg-white/5 text-gray-500' : 'bg-black/5 text-gray-400'}`}>Unstaked</span>
                      )}
                    </div>
                  </div>
                  {unstakeConfirm === pos.id && (
                    <div className={`mt-3 rounded-xl border p-3 ${isDark ? 'bg-red-900/20 border-red-700/30' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                          Unstaking stops earning rewards. Funds available after a 24-hour unbonding period. Unclaimed rewards will be forfeited.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleUnstake(pos.id)} size="sm" className="rounded-xl px-3 py-1.5 text-xs font-bold bg-red-600 text-white hover:bg-red-700">
                          Confirm Unstake
                        </Button>
                        <Button onClick={() => setUnstakeConfirm(null)} size="sm" variant="outline" className={`rounded-xl px-3 py-1.5 text-xs font-bold ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'}`}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
