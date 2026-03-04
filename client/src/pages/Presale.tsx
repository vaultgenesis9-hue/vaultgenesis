import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { Clock, TrendingUp, Users, DollarSign, CheckCircle } from "lucide-react";

interface Contribution {
  id: number;
  wallet: string;
  amount: number;
  tokens: number;
  time: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const PRESALE_END = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000); // 5d 12h from now

const TIERS = [
  { name: "Tier 1 — Early Bird", price: 0.15, allocation: "2,000,000 VG", minBuy: 50, maxBuy: 2000, sold: 100, total: 100 },
  { name: "Tier 2 — Standard", price: 0.20, allocation: "3,000,000 VG", minBuy: 100, maxBuy: 5000, sold: 72, total: 100 },
  { name: "Tier 3 — Late Stage", price: 0.25, allocation: "5,000,000 VG", minBuy: 200, maxBuy: 10000, sold: 30, total: 100 },
];

const MOCK_CONTRIBUTIONS: Contribution[] = [
  { id: 1, wallet: "0x1a2b...3c4d", amount: 500, tokens: 3333, time: new Date(Date.now() - 2 * 60 * 1000) },
  { id: 2, wallet: "0x5e6f...7a8b", amount: 1200, tokens: 8000, time: new Date(Date.now() - 15 * 60 * 1000) },
  { id: 3, wallet: "0x9c0d...1e2f", amount: 250, tokens: 1666, time: new Date(Date.now() - 32 * 60 * 1000) },
  { id: 4, wallet: "0x3a4b...5c6d", amount: 800, tokens: 5333, time: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: 5, wallet: "0x7e8f...9a0b", amount: 2000, tokens: 13333, time: new Date(Date.now() - 2 * 60 * 60 * 1000) },
];

function useCountdown(endDate: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return timeLeft;
}

export default function Presale() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedTier, setSelectedTier] = useState(1);
  const [walletConnected] = useState(false);
  const [contributions, setContributions] = useState<Contribution[]>(MOCK_CONTRIBUTIONS);
  const [isBuying, setIsBuying] = useState(false);
  const timeLeft = useCountdown(PRESALE_END);

  const totalRaised = 1250000;
  const totalTarget = 2000000;
  const progress = Math.round((totalRaised / totalTarget) * 100);

  const activeTier = TIERS[selectedTier];
  const tokensToReceive = amount ? Math.floor(Number(amount) / activeTier.price) : 0;

  const handleBuy = async () => {
    if (!walletConnected) { toast.error("Please connect your wallet first"); return; }
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (Number(amount) < activeTier.minBuy) { toast.error(`Minimum contribution is $${activeTier.minBuy}`); return; }
    if (Number(amount) > activeTier.maxBuy) { toast.error(`Maximum contribution is $${activeTier.maxBuy}`); return; }

    setIsBuying(true);
    await new Promise(r => setTimeout(r, 1500));
    const newContribution: Contribution = {
      id: contributions.length + 1,
      wallet: "0xYour...Wallet",
      amount: Number(amount),
      tokens: tokensToReceive,
      time: new Date(),
    };
    setContributions([newContribution, ...contributions]);
    toast.success(`Successfully purchased ${tokensToReceive.toLocaleString()} VG tokens!`);
    setAmount("");
    setIsBuying(false);
  };

  const timeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const cardClass = `rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/10'}`;
  const labelClass = `text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`;

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
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black mb-2 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>PRESALE</h1>
          <p className={`text-sm sm:text-base mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Secure your VG tokens before public launch</p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: <DollarSign className="w-4 h-4" />, label: "Total Raised", value: "$1,250,000" },
              { icon: <TrendingUp className="w-4 h-4" />, label: "Token Price", value: "$0.20" },
              { icon: <Users className="w-4 h-4" />, label: "Contributors", value: "3,847" },
              { icon: <Clock className="w-4 h-4" />, label: "Status", value: "🟢 Active" },
            ].map(stat => (
              <div key={stat.label} className={`${cardClass} p-4`}>
                <div className={`flex items-center gap-1.5 mb-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.icon}<p className={labelClass}>{stat.label}</p></div>
                <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Countdown Timer */}
          <div className={`${cardClass} p-6 mb-8`}>
            <p className={`${labelClass} mb-4 text-center`}>Presale Ends In</p>
            <div className="flex justify-center gap-4 sm:gap-8">
              {[
                { value: timeLeft.days, label: "Days" },
                { value: timeLeft.hours, label: "Hours" },
                { value: timeLeft.minutes, label: "Minutes" },
                { value: timeLeft.seconds, label: "Seconds" },
              ].map(unit => (
                <div key={unit.label} className="text-center">
                  <div className={`text-3xl sm:text-5xl font-black tabular-nums ${isDark ? 'text-white' : 'text-black'}`}>
                    {String(unit.value).padStart(2, '0')}
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{unit.label}</p>
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Progress: {progress}%</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>$1,250,000 / $2,000,000</span>
              </div>
              <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                <div className="h-full bg-gradient-to-r from-white/60 to-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Tiers */}
            <div className={`${cardClass} p-6`}>
              <p className={`${labelClass} mb-4`}>Presale Tiers</p>
              <div className="space-y-3">
                {TIERS.map((tier, i) => (
                  <div
                    key={tier.name}
                    onClick={() => setSelectedTier(i)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all ${
                      selectedTier === i
                        ? isDark ? 'border-white bg-white/10' : 'border-black bg-black/10'
                        : isDark ? 'border-white/10 hover:border-white/30' : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{tier.name}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{tier.allocation}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-black'}`}>${tier.price}</p>
                        {tier.sold === 100 && <span className="text-xs text-green-400 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sold Out</span>}
                      </div>
                    </div>
                    <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                      <div className={`h-full rounded-full ${tier.sold === 100 ? 'bg-green-500' : 'bg-white/60'}`} style={{ width: `${tier.sold}%` }} />
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{tier.sold}% filled</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Buy Form */}
            <div className={`${cardClass} p-6`}>
              <p className={`${labelClass} mb-4`}>Buy Tokens</p>
              <div className="space-y-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Amount (USD)</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder={`Min $${activeTier.minBuy} — Max $${activeTier.maxBuy}`}
                    className={`w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-white/20' : 'bg-black/5 border-black/10 text-black placeholder-gray-400 focus:ring-black/20'}`}
                  />
                </div>

                {amount && Number(amount) > 0 && (
                  <div className={`rounded-xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>You receive</span>
                      <span className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>{tokensToReceive.toLocaleString()} VG</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Price per token</span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>${activeTier.price}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBuy}
                  disabled={isBuying}
                  className={`w-full rounded-xl py-4 font-black text-sm uppercase tracking-wider ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                  {isBuying ? "Processing..." : walletConnected ? "Buy VG Tokens" : "Connect Wallet to Buy"}
                </Button>

                <p className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Min: ${activeTier.minBuy} · Max: ${activeTier.maxBuy} per transaction
                </p>
              </div>
            </div>
          </div>

          {/* Contribution History */}
          <div className={`${cardClass} p-6`}>
            <p className={`${labelClass} mb-4`}>Recent Contributions</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                    {["Wallet", "Amount (USD)", "Tokens Received", "Time"].map(h => (
                      <th key={h} className={`text-left pb-3 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contributions.map(c => (
                    <tr key={c.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                      <td className={`py-3 font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{c.wallet}</td>
                      <td className={`py-3 font-bold ${isDark ? 'text-white' : 'text-black'}`}>${c.amount.toLocaleString()}</td>
                      <td className={`py-3 font-bold text-green-500`}>+{c.tokens.toLocaleString()} VG</td>
                      <td className={`py-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{timeAgo(c.time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
