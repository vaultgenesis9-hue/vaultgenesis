import Navbar from "@/components/Navbar";
import CandlestickChart from "@/components/CandlestickChart";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, AlertCircle, ChevronDown, ChevronUp, Plus, X } from "lucide-react";

type BotStatus = 'inactive' | 'active' | 'paused';
type Strategy = 'scalping' | 'arbitrage' | 'momentum';

interface Bot {
  id: string;
  name: string;
  strategy: Strategy;
  status: BotStatus;
  allocation: number;
  totalProfit: number;
  winRate: number;
  avgProfitPerTrade: number;
  totalTrades: number;
  wins: number;
  losses: number;
  stopLoss: number;
  takeProfit: number;
  subscriptionFee: number;
  currentPrice?: number;
  priceChange?: number;
  volume?: number;
}

interface Trade {
  id: string;
  botId: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  timestamp: string;
  profit?: number;
  isWin?: boolean;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// Global button classes — consistent across all pages
const BTN_PRIMARY = (isDark: boolean) =>
  `inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-200 ${
    isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
  }`;

const BTN_GHOST = (isDark: boolean) =>
  `inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-200 border ${
    isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black'
  }`;

const BTN_DANGER = (isDark: boolean) =>
  `inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-200 border ${
    isDark ? 'border-red-700 text-red-400 hover:bg-red-900/20' : 'border-red-400 text-red-600 hover:bg-red-50'
  }`;

export default function BotTrading() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateBot, setShowCreateBot] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>('scalping');
  const [fundAllocation, setFundAllocation] = useState('');
  const [stopLoss, setStopLoss] = useState('2');
  const [takeProfit, setTakeProfit] = useState('5');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState('1');
  const [chartData, setChartData] = useState<Candle[]>([]);

  const [trades, setTrades] = useState<Trade[]>([
    { id: '1', botId: '1', type: 'buy', price: 45100, amount: 0.11, timestamp: '14:32:05' },
    { id: '2', botId: '1', type: 'sell', price: 45280, amount: 0.11, timestamp: '14:35:22', profit: 19.80, isWin: true },
    { id: '3', botId: '1', type: 'buy', price: 45150, amount: 0.11, timestamp: '14:38:45' },
    { id: '4', botId: '1', type: 'sell', price: 45420, amount: 0.11, timestamp: '14:42:10', profit: 29.70, isWin: true },
    { id: '5', botId: '1', type: 'buy', price: 45200, amount: 0.11, timestamp: '14:45:33' },
    { id: '6', botId: '1', type: 'sell', price: 45050, amount: 0.11, timestamp: '14:48:15', profit: -15.50, isWin: false },
  ]);

  const [bots, setBots] = useState<Bot[]>([
    {
      id: '1', name: 'Scalping Bot #1', strategy: 'scalping', status: 'active',
      allocation: 5000, totalProfit: 2450, winRate: 68, avgProfitPerTrade: 102,
      totalTrades: 24, wins: 16, losses: 8, stopLoss: 2, takeProfit: 5,
      subscriptionFee: 50, currentPrice: 45230, priceChange: 2.45, volume: 1250000,
    },
    {
      id: '2', name: 'Arbitrage Bot #1', strategy: 'arbitrage', status: 'active',
      allocation: 10000, totalProfit: 4890, winRate: 82, avgProfitPerTrade: 407,
      totalTrades: 12, wins: 10, losses: 2, stopLoss: 1.5, takeProfit: 8,
      subscriptionFee: 75, currentPrice: 1850.50, priceChange: 1.23, volume: 850000,
    },
  ]);

  useEffect(() => {
    const generateCandleData = () => {
      const candles: Candle[] = [];
      let basePrice = 45000;
      const now = Math.floor(Date.now() / 1000);
      for (let i = 50; i >= 0; i--) {
        const time = now - i * 300;
        const open = basePrice + (Math.random() - 0.5) * 200;
        const close = open + (Math.random() - 0.5) * 300;
        const high = Math.max(open, close) + Math.random() * 150;
        const low = Math.min(open, close) - Math.random() * 150;
        candles.push({ time, open: Math.round(open), high: Math.round(high), low: Math.round(low), close: Math.round(close) });
        basePrice = close;
      }
      setChartData(candles);
    };
    generateCandleData();
    const interval = setInterval(generateCandleData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live trades
  useEffect(() => {
    const interval = setInterval(() => {
      const types: ('buy' | 'sell')[] = ['buy', 'sell'];
      const type = types[Math.floor(Math.random() * 2)];
      const price = 44800 + Math.random() * 1000;
      const profit = type === 'sell' ? (Math.random() - 0.35) * 80 : undefined;
      const newTrade: Trade = {
        id: String(Date.now()),
        botId: '1',
        type,
        price: Math.round(price * 100) / 100,
        amount: Math.round(Math.random() * 0.2 * 1000) / 1000,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        profit: profit !== undefined ? Math.round(profit * 100) / 100 : undefined,
        isWin: profit !== undefined ? profit > 0 : undefined,
      };
      setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const strategies = [
    { id: 'scalping', name: 'Scalping', description: 'Quick trades with small profits. High frequency, low risk per trade.', minAllocation: 1000, avgReturnPerMonth: '15–25%', riskLevel: 'Low' },
    { id: 'arbitrage', name: 'Arbitrage', description: 'Exploit price differences across exchanges. Consistent profits.', minAllocation: 5000, avgReturnPerMonth: '8–15%', riskLevel: 'Very Low' },
    { id: 'momentum', name: 'Momentum', description: 'Follow market trends and momentum. Higher returns, moderate risk.', minAllocation: 2000, avgReturnPerMonth: '20–40%', riskLevel: 'Medium' },
  ];

  const handleCreateBot = async () => {
    if (!fundAllocation || parseFloat(fundAllocation) < 1000) { toast.error('Minimum allocation is $1,000'); return; }
    if (parseFloat(stopLoss) <= 0 || parseFloat(takeProfit) <= 0) { toast.error('Stop-loss and take-profit must be positive'); return; }
    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newBot: Bot = {
        id: String(bots.length + 1),
        name: `${strategies.find(s => s.id === selectedStrategy)?.name} Bot #${bots.filter(b => b.strategy === selectedStrategy).length + 1}`,
        strategy: selectedStrategy, status: 'active',
        allocation: parseFloat(fundAllocation), totalProfit: 0, winRate: 0,
        avgProfitPerTrade: 0, totalTrades: 0, wins: 0, losses: 0,
        stopLoss: parseFloat(stopLoss), takeProfit: parseFloat(takeProfit),
        subscriptionFee: selectedStrategy === 'scalping' ? 50 : selectedStrategy === 'arbitrage' ? 75 : 100,
        currentPrice: Math.random() * 50000, priceChange: (Math.random() - 0.5) * 5, volume: Math.random() * 2000000,
      };
      setBots([...bots, newBot]);
      toast.success(`${newBot.name} activated successfully!`);
      setShowCreateBot(false);
      setFundAllocation(''); setStopLoss('2'); setTakeProfit('5');
    } catch { toast.error('Failed to create bot'); } finally { setIsCreating(false); }
  };

  const handleToggleBotStatus = (botId: string) => {
    setBots(bots.map(bot => {
      if (bot.id === botId) {
        const newStatus: BotStatus = bot.status === 'active' ? 'paused' : 'active';
        toast.success(`Bot ${newStatus === 'active' ? 'resumed' : 'paused'}`);
        return { ...bot, status: newStatus };
      }
      return bot;
    }));
  };

  const handleWithdrawFunds = (botId: string) => {
    setBots(bots.filter(bot => bot.id !== botId));
    toast.success('Funds withdrawn successfully');
  };

  const totalAllocation = bots.reduce((sum, b) => sum + b.allocation, 0);
  const totalProfit = bots.reduce((sum, b) => sum + b.totalProfit, 0);
  const totalTrades = bots.reduce((sum, b) => sum + b.totalTrades, 0);
  const totalWins = bots.reduce((sum, b) => sum + b.wins, 0);
  const totalLosses = bots.reduce((sum, b) => sum + b.losses, 0);

  const inputCls = `w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-1 ${
    isDark
      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-gray-500'
      : 'bg-white border-gray-300 text-black placeholder-gray-400 focus:ring-gray-400'
  }`;

  const cardCls = `rounded-xl border backdrop-blur-sm ${
    isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/60 border-gray-200'
  }`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-[#fafaf8]'} relative overflow-hidden`}>
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute rounded-full animate-float-glow-1" style={{ width: '600px', height: '800px', background: isDark ? 'radial-gradient(rgba(255,255,255,0.3) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(rgba(80,80,80,0.4) 0%, rgba(250,250,248,0) 70%)', filter: 'blur(80px)', opacity: isDark ? 0.6 : 0.8 }} />
        <div className="absolute rounded-full animate-float-glow-2" style={{ width: '400px', height: '600px', background: isDark ? 'radial-gradient(rgba(255,255,255,0.3) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(rgba(80,80,80,0.4) 0%, rgba(250,250,248,0) 70%)', filter: 'blur(80px)', opacity: isDark ? 0.6 : 0.8 }} />
      </div>

      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>
                BOT TRADING
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Automate your trading with AI-powered strategies
              </p>
            </div>
            <button
              onClick={() => setShowCreateBot(!showCreateBot)}
              className={showCreateBot ? BTN_GHOST(isDark) : BTN_PRIMARY(isDark)}
            >
              {showCreateBot ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Create Bot</>}
            </button>
          </div>

          {/* Create Bot Panel */}
          {showCreateBot && (
            <Card className={`${cardCls} p-5 mb-8`}>
              <h2 className={`text-base font-bold uppercase tracking-wider mb-5 ${isDark ? 'text-white' : 'text-black'}`}>
                Configure New Bot
              </h2>

              {/* Strategy Selection */}
              <div className="mb-5">
                <p className={`text-xs font-semibold uppercase mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Strategy</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {strategies.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStrategy(s.id as Strategy)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedStrategy === s.id
                          ? isDark ? 'border-white bg-gray-800' : 'border-black bg-gray-100'
                          : isDark ? 'border-gray-700 bg-gray-900/50 hover:border-gray-600' : 'border-gray-200 bg-white/30 hover:border-gray-400'
                      }`}
                    >
                      <p className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-black'}`}>{s.name}</p>
                      <p className={`text-xs mb-2 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{s.description}</p>
                      <div className={`text-xs space-y-0.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <p>Min: ${s.minAllocation.toLocaleString()}</p>
                        <p>Return: {s.avgReturnPerMonth}/mo</p>
                        <p>Risk: <span className={s.riskLevel === 'Very Low' ? 'text-green-500' : s.riskLevel === 'Low' ? 'text-blue-500' : 'text-yellow-500'}>{s.riskLevel}</span></p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fund + Risk inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Fund Allocation (USD)</label>
                  <input type="number" value={fundAllocation} onChange={e => setFundAllocation(e.target.value)} placeholder="Min $1,000" className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Stop-Loss (%)</label>
                  <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)} placeholder="e.g. 2" step="0.1" className={inputCls} />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Take-Profit (%)</label>
                  <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)} placeholder="e.g. 5" step="0.1" className={inputCls} />
                </div>
              </div>

              {/* Fee notice */}
              <div className={`flex items-start gap-2 p-3 rounded-lg border mb-5 text-xs ${isDark ? 'bg-blue-900/20 border-blue-800 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>
                  <strong>Subscription: </strong>
                  {selectedStrategy === 'scalping' && '$50/month + 20% of profits'}
                  {selectedStrategy === 'arbitrage' && '$75/month + 15% of profits'}
                  {selectedStrategy === 'momentum' && '$100/month + 25% of profits'}
                </span>
              </div>

              <div className="flex justify-end">
                <button onClick={handleCreateBot} disabled={isCreating} className={`${BTN_PRIMARY(isDark)} disabled:opacity-50 min-w-[120px]`}>
                  {isCreating ? 'Activating…' : 'Activate Bot'}
                </button>
              </div>
            </Card>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
            {[
              { label: 'Allocated', value: `$${totalAllocation.toLocaleString()}`, icon: <DollarSign size={18} />, color: isDark ? 'text-gray-400' : 'text-gray-500' },
              { label: 'Total Profit', value: `+$${totalProfit.toLocaleString()}`, icon: <TrendingUp size={18} />, color: 'text-green-500' },
              { label: 'Trades', value: totalTrades, icon: <Activity size={18} />, color: isDark ? 'text-gray-400' : 'text-gray-500' },
              { label: 'Wins', value: totalWins, icon: <ChevronUp size={18} />, color: 'text-green-500' },
              { label: 'Losses', value: totalLosses, icon: <ChevronDown size={18} />, color: 'text-red-500' },
            ].map((stat, i) => (
              <Card key={i} className={`${cardCls} p-4`}>
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</p>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
                <p className={`text-lg font-black ${stat.color === 'text-green-500' ? 'text-green-500' : stat.color === 'text-red-500' ? 'text-red-500' : isDark ? 'text-white' : 'text-black'}`}>
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>

          {/* Live Trading Monitor */}
          {bots.length > 0 && (
            <div className="mb-8">
              <h2 className={`text-lg font-black uppercase tracking-wider mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                Live Trading Monitor
              </h2>

              {/* Chart — full width on mobile, 3/4 on desktop */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                <Card className={`${cardCls} p-4 lg:col-span-3 overflow-hidden`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      BTC/USD · 5-min
                    </p>
                    <span className="text-xs text-green-500 font-semibold">● LIVE</span>
                  </div>
                  {/* Chart fills the full card width on all screen sizes */}
                  <div className="w-full relative" style={{ height: '260px', minWidth: 0 }}>
                    {chartData.length > 0 && <CandlestickChart isDark={isDark} data={chartData} />}
                  </div>
                </Card>

                {/* Bot Selector — stacks below chart on mobile */}
                <Card className={`${cardCls} p-4`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Active Bots
                  </p>
                  <div className="space-y-2">
                    {bots.map((bot) => (
                      <button
                        key={bot.id}
                        onClick={() => setSelectedBotId(bot.id)}
                        className={`w-full p-2.5 rounded-lg text-left transition-all text-xs ${
                          selectedBotId === bot.id
                            ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                            : isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        <p className="font-bold">{bot.name}</p>
                        <p className={`mt-0.5 ${selectedBotId === bot.id ? (isDark ? 'text-gray-700' : 'text-gray-300') : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                          {bot.status === 'active' ? '● Active' : '● Paused'}
                        </p>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Live Trade Feed */}
              <Card className={`${cardCls} p-4`}>
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Live Trade Feed
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {trades.map((trade) => (
                    <div key={trade.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold uppercase w-8 ${trade.type === 'buy' ? 'text-blue-500' : 'text-purple-500'}`}>{trade.type}</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{trade.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-black'}`}>${trade.price.toLocaleString()}</span>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{trade.amount.toFixed(4)} BTC</span>
                        {trade.profit !== undefined && (
                          <span className={`font-bold w-16 text-right ${trade.isWin ? 'text-green-500' : 'text-red-500'}`}>
                            {trade.isWin ? '+' : ''}{trade.profit.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Active Bots List */}
          <div>
            <h2 className={`text-lg font-black uppercase tracking-wider mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              Your Bots
            </h2>
            {bots.length === 0 ? (
              <Card className={`${cardCls} p-8 text-center`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No active bots. Click "Create Bot" to get started.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {bots.map((bot) => (
                  <Card key={bot.id} className={`${cardCls} p-5`}>
                    {/* Bot Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-black'}`}>{bot.name}</h3>
                        <p className={`text-xs mt-0.5 font-semibold ${bot.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                          {bot.status === 'active' ? '● Active' : '● Paused'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleBotStatus(bot.id)} className={BTN_GHOST(isDark)}>
                          {bot.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                        <button onClick={() => handleWithdrawFunds(bot.id)} className={BTN_DANGER(isDark)}>
                          Withdraw
                        </button>
                      </div>
                    </div>

                    {/* Bot Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      <div>
                        <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Allocated</p>
                        <p className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-black'}`}>${bot.allocation.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Profit</p>
                        <p className="text-sm font-bold mt-0.5 text-green-500">+${bot.totalProfit.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Win Rate</p>
                        <p className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-black'}`}>{bot.winRate}%</p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Avg/Trade</p>
                        <p className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-black'}`}>${bot.avgProfitPerTrade}</p>
                      </div>
                      <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'}`}>
                        <p className={`text-xs uppercase font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>Wins</p>
                        <p className="text-sm font-black text-green-500 mt-0.5">{bot.wins}</p>
                      </div>
                      <div className={`p-2 rounded-lg text-center ${isDark ? 'bg-red-900/20 border border-red-800/50' : 'bg-red-50 border border-red-200'}`}>
                        <p className={`text-xs uppercase font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>Losses</p>
                        <p className="text-sm font-black text-red-500 mt-0.5">{bot.losses}</p>
                      </div>
                    </div>

                    {/* Risk params */}
                    <div className={`flex gap-4 mt-3 pt-3 border-t text-xs ${isDark ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                      <span>Stop-Loss: <strong className={isDark ? 'text-white' : 'text-black'}>{bot.stopLoss}%</strong></span>
                      <span>Take-Profit: <strong className={isDark ? 'text-white' : 'text-black'}>{bot.takeProfit}%</strong></span>
                      <span>Fee: <strong className={isDark ? 'text-white' : 'text-black'}>${bot.subscriptionFee}/mo</strong></span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
