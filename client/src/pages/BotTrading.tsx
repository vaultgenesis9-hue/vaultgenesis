import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

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
}

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
  const [chartPrice, setChartPrice] = useState(45230);
  const [trades, setTrades] = useState<Trade[]>([
    { id: '1', botId: '1', type: 'buy', price: 45100, amount: 0.11, timestamp: '14:32:05', profit: undefined },
    { id: '2', botId: '1', type: 'sell', price: 45280, amount: 0.11, timestamp: '14:35:22', profit: 19.80 },
    { id: '3', botId: '1', type: 'buy', price: 45150, amount: 0.11, timestamp: '14:38:45', profit: undefined },
    { id: '4', botId: '1', type: 'sell', price: 45420, amount: 0.11, timestamp: '14:42:10', profit: 29.70 },
    { id: '5', botId: '1', type: 'buy', price: 45200, amount: 0.11, timestamp: '14:45:33', profit: undefined },
  ]);

  const [bots, setBots] = useState<Bot[]>([
    {
      id: '1',
      name: 'Scalping Bot #1',
      strategy: 'scalping',
      status: 'active',
      allocation: 5000,
      totalProfit: 2450,
      winRate: 68,
      avgProfitPerTrade: 102,
      totalTrades: 24,
      stopLoss: 2,
      takeProfit: 5,
      subscriptionFee: 50,
      currentPrice: 45230,
      priceChange: 2.45,
      volume: 1250000,
    },
    {
      id: '2',
      name: 'Arbitrage Bot #1',
      strategy: 'arbitrage',
      status: 'active',
      allocation: 10000,
      totalProfit: 4890,
      winRate: 82,
      avgProfitPerTrade: 407,
      totalTrades: 12,
      stopLoss: 1.5,
      takeProfit: 8,
      subscriptionFee: 75,
      currentPrice: 1850.50,
      priceChange: 1.23,
      volume: 850000,
    },
  ]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartPrice(prev => {
        const change = (Math.random() - 0.5) * 200;
        return Math.max(44000, Math.min(47000, prev + change));
      });

      // Randomly add new trades
      if (Math.random() > 0.7) {
        const newTrade: Trade = {
          id: String(Date.now()),
          botId: selectedBotId,
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          price: chartPrice + (Math.random() - 0.5) * 100,
          amount: 0.1 + Math.random() * 0.05,
          timestamp: new Date().toLocaleTimeString(),
          profit: Math.random() > 0.5 ? Math.random() * 50 : undefined,
        };
        setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedBotId]);

  const strategies = [
    {
      id: 'scalping',
      name: 'Scalping',
      description: 'Quick trades with small profits. High frequency, low risk per trade.',
      minAllocation: 1000,
      avgReturnPerMonth: '15-25%',
      riskLevel: 'Low',
    },
    {
      id: 'arbitrage',
      name: 'Arbitrage',
      description: 'Exploit price differences across exchanges. Consistent profits.',
      minAllocation: 5000,
      avgReturnPerMonth: '8-15%',
      riskLevel: 'Very Low',
    },
    {
      id: 'momentum',
      name: 'Momentum Trading',
      description: 'Follow market trends and momentum. Higher returns, moderate risk.',
      minAllocation: 2000,
      avgReturnPerMonth: '20-40%',
      riskLevel: 'Medium',
    },
  ];

  const handleCreateBot = async () => {
    if (!fundAllocation || parseFloat(fundAllocation) < 1000) {
      toast.error('Minimum allocation is $1,000');
      return;
    }

    if (parseFloat(stopLoss) <= 0 || parseFloat(takeProfit) <= 0) {
      toast.error('Stop-loss and take-profit must be positive');
      return;
    }

    setIsCreating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newBot: Bot = {
        id: String(bots.length + 1),
        name: `${strategies.find(s => s.id === selectedStrategy)?.name} Bot #${bots.filter(b => b.strategy === selectedStrategy).length + 1}`,
        strategy: selectedStrategy,
        status: 'active',
        allocation: parseFloat(fundAllocation),
        totalProfit: 0,
        winRate: 0,
        avgProfitPerTrade: 0,
        totalTrades: 0,
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
        subscriptionFee: selectedStrategy === 'scalping' ? 50 : selectedStrategy === 'arbitrage' ? 75 : 100,
        currentPrice: Math.random() * 50000,
        priceChange: (Math.random() - 0.5) * 5,
        volume: Math.random() * 2000000,
      };

      setBots([...bots, newBot]);
      toast.success(`${newBot.name} activated successfully!`);
      setShowCreateBot(false);
      setFundAllocation('');
      setStopLoss('2');
      setTakeProfit('5');
    } catch (error) {
      toast.error('Failed to create bot');
    } finally {
      setIsCreating(false);
    }
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

  const totalAllocation = bots.reduce((sum, bot) => sum + bot.allocation, 0);
  const totalProfit = bots.reduce((sum, bot) => sum + bot.totalProfit, 0);
  const totalTrades = bots.reduce((sum, bot) => sum + bot.totalTrades, 0);
  const selectedBot = bots.find(b => b.id === selectedBotId);

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
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className={`text-5xl sm:text-6xl md:text-7xl font-black mb-4 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>BOT TRADING</h1>
              <p className={`text-sm sm:text-base md:text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Automate your trading with AI-powered strategies</p>
            </div>
            <button
              onClick={() => setShowCreateBot(!showCreateBot)}
              className={`mt-4 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold uppercase text-xs sm:text-sm transition-all ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-900'
              }`}
            >
              {showCreateBot ? 'Cancel' : 'Create Bot'}
            </button>
          </div>

          {/* Create Bot Section */}
          {showCreateBot && (
            <Card className={`p-6 sm:p-8 rounded-2xl border mb-8 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
              <h2 className={`text-2xl font-black mb-6 uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>Activate Trading Bot</h2>

              {/* Strategy Selection */}
              <div className="mb-8">
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Select Strategy</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {strategies.map((strategy) => (
                    <button
                      key={strategy.id}
                      onClick={() => setSelectedStrategy(strategy.id as Strategy)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedStrategy === strategy.id
                          ? isDark
                            ? 'border-white bg-gray-800'
                            : 'border-black bg-gray-100'
                          : isDark
                          ? 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                          : 'border-gray-300 bg-white/30 hover:border-gray-400'
                      }`}
                    >
                      <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{strategy.name}</h4>
                      <p className={`text-xs sm:text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{strategy.description}</p>
                      <div className={`text-xs space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <p>Min: ${strategy.minAllocation.toLocaleString()}</p>
                        <p>Return: {strategy.avgReturnPerMonth}/month</p>
                        <p>Risk: <span className={strategy.riskLevel === 'Very Low' ? 'text-green-500' : strategy.riskLevel === 'Low' ? 'text-blue-500' : 'text-yellow-500'}>{strategy.riskLevel}</span></p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fund Allocation */}
              <div className="mb-6">
                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Fund Allocation (USD)
                </label>
                <input
                  type="number"
                  value={fundAllocation}
                  onChange={(e) => setFundAllocation(e.target.value)}
                  placeholder="Minimum $1,000"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-black placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Risk Management */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Stop-Loss (%)
                  </label>
                  <input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="e.g., 2"
                    step="0.1"
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-black placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Take-Profit (%)
                  </label>
                  <input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="e.g., 5"
                    step="0.1"
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-black placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              {/* Subscription Fee Info */}
              <div className={`p-4 rounded-lg border mb-6 ${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-100/30 border-blue-300'}`}>
                <div className="flex gap-2 items-start">
                  <AlertCircle size={18} className={isDark ? 'text-blue-400 mt-0.5' : 'text-blue-600 mt-0.5'} />
                  <div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Subscription Fee</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                      {selectedStrategy === 'scalping' && '$50/month + 20% of profits'}
                      {selectedStrategy === 'arbitrage' && '$75/month + 15% of profits'}
                      {selectedStrategy === 'momentum' && '$100/month + 25% of profits'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateBot}
                disabled={isCreating}
                className={`w-full py-3 px-4 rounded-lg font-semibold uppercase text-sm transition-all ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200 disabled:opacity-50'
                    : 'bg-black text-white hover:bg-gray-900 disabled:opacity-50'
                }`}
              >
                {isCreating ? 'Activating...' : 'Activate Bot'}
              </button>
            </Card>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Allocated</p>
                  <p className={`text-2xl sm:text-3xl font-black mt-2 ${isDark ? 'text-white' : 'text-black'}`}>${totalAllocation.toLocaleString()}</p>
                </div>
                <DollarSign size={32} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
              </div>
            </Card>
            <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Profit</p>
                  <p className={`text-2xl sm:text-3xl font-black mt-2 text-green-500`}>+${totalProfit.toLocaleString()}</p>
                </div>
                <TrendingUp size={32} className="text-green-500" />
              </div>
            </Card>
            <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Trades</p>
                  <p className={`text-2xl sm:text-3xl font-black mt-2 ${isDark ? 'text-white' : 'text-black'}`}>{totalTrades}</p>
                </div>
                <Activity size={32} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
              </div>
            </Card>
          </div>

          {/* Real-Time Trading View */}
          {bots.length > 0 && (
            <div className="mb-8">
              <h2 className={`text-2xl font-black mb-6 uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>Live Trading Monitor</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Area */}
                <div className="lg:col-span-2">
                  <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className={`text-sm uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current Price</p>
                          <p className={`text-3xl sm:text-4xl font-black mt-2 ${isDark ? 'text-white' : 'text-black'}`}>${chartPrice.toFixed(2)}</p>
                        </div>
                        <div className={`text-right px-3 py-2 rounded-lg ${selectedBot?.priceChange && selectedBot.priceChange > 0 ? (isDark ? 'bg-green-900/20' : 'bg-green-100/30') : (isDark ? 'bg-red-900/20' : 'bg-red-100/30')}`}>
                          <p className={`text-sm font-bold ${selectedBot?.priceChange && selectedBot.priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {selectedBot?.priceChange && selectedBot.priceChange > 0 ? '+' : ''}{selectedBot?.priceChange?.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Simplified Chart */}
                    <div className={`h-64 rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} relative overflow-hidden`}>
                      <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <line x1="0" y1="50" x2="400" y2="50" stroke={isDark ? '#444' : '#ddd'} strokeWidth="1" />
                        <line x1="0" y1="100" x2="400" y2="100" stroke={isDark ? '#444' : '#ddd'} strokeWidth="1" />
                        <line x1="0" y1="150" x2="400" y2="150" stroke={isDark ? '#444' : '#ddd'} strokeWidth="1" />
                        
                        {/* Price line (animated) */}
                        <polyline
                          points={`0,${100 + (Math.sin(Date.now() / 1000) * 30)},50,${100 + (Math.sin(Date.now() / 1000 + 1) * 30)},100,${100 + (Math.sin(Date.now() / 1000 + 2) * 30)},150,${100 + (Math.sin(Date.now() / 1000 + 3) * 30)},200,${100 + (Math.sin(Date.now() / 1000 + 4) * 30)},250,${100 + (Math.sin(Date.now() / 1000 + 5) * 30)},300,${100 + (Math.sin(Date.now() / 1000 + 6) * 30)},350,${100 + (Math.sin(Date.now() / 1000 + 7) * 30)},400,${100 + (Math.sin(Date.now() / 1000 + 8) * 30)}`}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                      </svg>
                      <p className={`text-xs text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Real-time price movement (15-min chart)</p>
                    </div>
                  </Card>
                </div>

                {/* Bot Selector */}
                <div>
                  <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                    <h3 className={`font-bold mb-4 uppercase tracking-wider text-base ${isDark ? 'text-white' : 'text-black'}`}>Select Bot</h3>
                    <div className="space-y-2">
                      {bots.map((bot) => (
                        <button
                          key={bot.id}
                          onClick={() => setSelectedBotId(bot.id)}
                          className={`w-full p-3 rounded-lg text-left transition-all ${
                            selectedBotId === bot.id
                              ? isDark
                                ? 'bg-white text-black'
                                : 'bg-black text-white'
                              : isDark
                              ? 'bg-gray-800 text-white hover:bg-gray-700'
                              : 'bg-gray-100 text-black hover:bg-gray-200'
                          }`}
                        >
                          <p className="font-bold text-sm">{bot.name}</p>
                          <p className={`text-xs mt-1 ${selectedBotId === bot.id ? (isDark ? 'text-black' : 'text-white') : (isDark ? 'text-gray-400' : 'text-gray-600')}`}>
                            {bot.status === 'active' ? '● Active' : '● Paused'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Live Trade Feed */}
          {bots.length > 0 && (
            <div className="mb-8">
              <h2 className={`text-2xl font-black mb-6 uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>Live Trade Feed</h2>
              <Card className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {trades.map((trade) => (
                    <div key={trade.id} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${trade.type === 'buy' ? (isDark ? 'bg-green-900/30' : 'bg-green-100/30') : (isDark ? 'bg-red-900/30' : 'bg-red-100/30')}`}>
                            {trade.type === 'buy' ? (
                              <ChevronUp size={20} className="text-green-500" />
                            ) : (
                              <ChevronDown size={20} className="text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className={`font-bold text-sm uppercase ${trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>{trade.type}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{trade.timestamp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-black'}`}>${trade.price.toFixed(2)}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{trade.amount.toFixed(4)} BTC</p>
                          {trade.profit && (
                            <p className="text-xs text-green-500 font-bold mt-1">+${trade.profit.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Active Bots */}
          <div>
            <h2 className={`text-2xl font-black mb-6 uppercase tracking-wider ${isDark ? 'text-white' : 'text-black'}`}>Active Bots</h2>
            {bots.length === 0 ? (
              <Card className={`p-8 rounded-2xl border text-center ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No active bots. Create one to get started!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {bots.map((bot) => (
                  <Card key={bot.id} className={`p-6 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white/50 border-gray-300'} backdrop-blur-sm`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Side - Bot Info */}
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{bot.name}</h3>
                            <p className={`text-xs sm:text-sm uppercase font-bold mt-1 ${
                              bot.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                            }`}>
                              {bot.status === 'active' ? '● Active' : '● Paused'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleToggleBotStatus(bot.id)}
                            className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                              isDark
                                ? 'border border-gray-600 text-white hover:bg-gray-800'
                                : 'border border-gray-400 text-black hover:bg-gray-100'
                            }`}
                          >
                            {bot.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Allocation</p>
                            <p className={`font-bold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>${bot.allocation.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Profit</p>
                            <p className="font-bold mt-1 text-green-500">+${bot.totalProfit.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Stop-Loss</p>
                            <p className={`font-bold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{bot.stopLoss}%</p>
                          </div>
                          <div>
                            <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Take-Profit</p>
                            <p className={`font-bold mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{bot.takeProfit}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Performance */}
                      <div>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Win Rate</p>
                            <p className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{bot.winRate}%</p>
                          </div>
                          <div>
                            <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Profit/Trade</p>
                            <p className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-black'}`}>${bot.avgProfitPerTrade}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Trades</p>
                            <p className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-black'}`}>{bot.totalTrades}</p>
                          </div>
                          <div>
                            <p className={`text-xs uppercase font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fee/Month</p>
                            <p className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-black'}`}>${bot.subscriptionFee}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleWithdrawFunds(bot.id)}
                      className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold uppercase text-xs sm:text-sm transition-all ${
                        isDark
                          ? 'border border-red-600 text-red-400 hover:bg-red-900/20'
                          : 'border border-red-400 text-red-600 hover:bg-red-100/30'
                      }`}
                    >
                      Withdraw Funds & Deactivate
                    </button>
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
