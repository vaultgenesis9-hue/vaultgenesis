import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import {
  Users, Coins, TrendingUp, DollarSign, Search, Shield, Ban, CheckCircle,
  LayoutDashboard, ArrowLeftRight, Rocket, Layers, Bot, Settings,
  ChevronRight, X, Eye, EyeOff, Download, RefreshCw, Pause, Play,
  AlertTriangle, BarChart3, Percent, Bell, ToggleLeft, ToggleRight,
  Menu, ChevronLeft, Edit2, Trash2, Plus, Activity, Clock, Filter,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "overview" | "users" | "transactions" | "tokens" | "presale" | "staking" | "bots" | "settings";

interface UserRow {
  id: number; name: string; wallet: string; email: string;
  role: "user" | "admin"; joined: string; status: "active" | "banned";
  totalTrades: number; volume: string; lastActive: string;
}
interface TxRow {
  id: number; type: "stake" | "unstake" | "buy" | "sell" | "transfer";
  wallet: string; amount: string; token: string;
  status: "completed" | "pending" | "failed"; time: string; hash: string;
}
interface TokenRow {
  id: number; name: string; symbol: string; creator: string;
  supply: string; status: "deployed" | "pending" | "failed" | "suspended";
  created: string; holders: number; volume: string;
}
interface BotRow {
  id: number; name: string; owner: string; strategy: string;
  status: "active" | "paused" | "stopped"; profit: string;
  trades: number; allocated: string; winRate: string;
}
interface StakingPool {
  id: number; token: string; symbol: string; apy: number;
  totalStaked: string; stakers: number; enabled: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_USERS: UserRow[] = [
  { id: 1, name: "Alice Chen", wallet: "0x1a2b...3c4d", email: "alice@example.com", role: "admin", joined: "Jan 12, 2025", status: "active", totalTrades: 142, volume: "$48,200", lastActive: "2m ago" },
  { id: 2, name: "Bob Smith", wallet: "0x5e6f...7a8b", email: "bob@example.com", role: "user", joined: "Feb 3, 2025", status: "active", totalTrades: 87, volume: "$12,400", lastActive: "1h ago" },
  { id: 3, name: "Carol Davis", wallet: "0x9c0d...1e2f", email: "carol@example.com", role: "user", joined: "Feb 18, 2025", status: "active", totalTrades: 23, volume: "$3,100", lastActive: "3h ago" },
  { id: 4, name: "Dave Wilson", wallet: "0x3a4b...5c6d", email: "dave@example.com", role: "user", joined: "Mar 1, 2025", status: "banned", totalTrades: 5, volume: "$800", lastActive: "2d ago" },
  { id: 5, name: "Eve Martinez", wallet: "0x7e8f...9a0b", email: "eve@example.com", role: "user", joined: "Mar 2, 2025", status: "active", totalTrades: 61, volume: "$9,750", lastActive: "30m ago" },
  { id: 6, name: "Frank Lee", wallet: "0xab12...cd34", email: "frank@example.com", role: "user", joined: "Mar 5, 2025", status: "active", totalTrades: 34, volume: "$5,600", lastActive: "5h ago" },
  { id: 7, name: "Grace Kim", wallet: "0xef56...gh78", email: "grace@example.com", role: "user", joined: "Mar 8, 2025", status: "active", totalTrades: 19, volume: "$2,200", lastActive: "1d ago" },
];

const MOCK_TXS: TxRow[] = [
  { id: 1, type: "buy", wallet: "0x1a2b...3c4d", amount: "$1,200", token: "VG", status: "completed", time: "2m ago", hash: "0xabc...001" },
  { id: 2, type: "stake", wallet: "0x5e6f...7a8b", amount: "50,000 VG", token: "VG", status: "completed", time: "8m ago", hash: "0xabc...002" },
  { id: 3, type: "sell", wallet: "0x9c0d...1e2f", amount: "$450", token: "USDC", status: "pending", time: "15m ago", hash: "0xabc...003" },
  { id: 4, type: "transfer", wallet: "0x3a4b...5c6d", amount: "2.5 ETH", token: "ETH", status: "completed", time: "32m ago", hash: "0xabc...004" },
  { id: 5, type: "unstake", wallet: "0x7e8f...9a0b", amount: "10,000 VG", token: "VG", status: "failed", time: "1h ago", hash: "0xabc...005" },
  { id: 6, type: "buy", wallet: "0x1a2b...3c4d", amount: "$800", token: "VG", status: "completed", time: "2h ago", hash: "0xabc...006" },
  { id: 7, type: "stake", wallet: "0xab12...cd34", amount: "25,000 VG", token: "VG", status: "completed", time: "3h ago", hash: "0xabc...007" },
  { id: 8, type: "sell", wallet: "0xef56...gh78", amount: "$320", token: "USDC", status: "completed", time: "4h ago", hash: "0xabc...008" },
];

const MOCK_TOKENS: TokenRow[] = [
  { id: 1, name: "Vault Genesis", symbol: "VG", creator: "0x1a2b...3c4d", supply: "1,000,000,000", status: "deployed", created: "Jan 12, 2025", holders: 1247, volume: "$2.4M" },
  { id: 2, name: "Moon Coin", symbol: "MOON", creator: "0x5e6f...7a8b", supply: "500,000,000", status: "deployed", created: "Feb 5, 2025", holders: 342, volume: "$180K" },
  { id: 3, name: "Doge Plus", symbol: "DOGEP", creator: "0x9c0d...1e2f", supply: "2,000,000,000", status: "deployed", created: "Feb 20, 2025", holders: 89, volume: "$42K" },
  { id: 4, name: "Rocket Token", symbol: "RKT", creator: "0x3a4b...5c6d", supply: "100,000,000", status: "pending", created: "Mar 2, 2025", holders: 0, volume: "$0" },
  { id: 5, name: "Star Coin", symbol: "STAR", creator: "0x7e8f...9a0b", supply: "750,000,000", status: "failed", created: "Mar 3, 2025", holders: 0, volume: "$0" },
  { id: 6, name: "Alpha Token", symbol: "ALPHA", creator: "0xab12...cd34", supply: "300,000,000", status: "suspended", created: "Mar 6, 2025", holders: 56, volume: "$8K" },
];

const MOCK_BOTS: BotRow[] = [
  { id: 1, name: "Scalping Bot #1", owner: "alice@example.com", strategy: "Scalping", status: "active", profit: "+$2,450", trades: 142, allocated: "$5,000", winRate: "68%" },
  { id: 2, name: "Arbitrage Bot #1", owner: "alice@example.com", strategy: "Arbitrage", status: "active", profit: "+$4,890", trades: 87, allocated: "$10,000", winRate: "82%" },
  { id: 3, name: "Momentum Bot #2", owner: "bob@example.com", strategy: "Momentum", status: "paused", profit: "+$320", trades: 23, allocated: "$2,000", winRate: "55%" },
  { id: 4, name: "Scalping Bot #3", owner: "eve@example.com", strategy: "Scalping", status: "active", profit: "+$1,100", trades: 61, allocated: "$3,000", winRate: "71%" },
  { id: 5, name: "Arbitrage Bot #2", owner: "frank@example.com", strategy: "Arbitrage", status: "stopped", profit: "-$150", trades: 12, allocated: "$1,500", winRate: "42%" },
];

const MOCK_STAKING_POOLS: StakingPool[] = [
  { id: 1, token: "Vault Genesis", symbol: "VG", apy: 45, totalStaked: "$513,000", stakers: 892, enabled: true },
  { id: 2, token: "USD Coin", symbol: "USDC", apy: 12, totalStaked: "$124,000", stakers: 234, enabled: true },
  { id: 3, token: "Ethereum", symbol: "ETH", apy: 10, totalStaked: "$87,000", stakers: 121, enabled: true },
];

const VOLUME_CHART = [
  { day: "Mon", volume: 42000 }, { day: "Tue", volume: 68000 }, { day: "Wed", volume: 55000 },
  { day: "Thu", volume: 91000 }, { day: "Fri", volume: 73000 }, { day: "Sat", volume: 48000 }, { day: "Sun", volume: 62000 },
];
const USER_CHART = [
  { day: "Mon", users: 18 }, { day: "Tue", users: 24 }, { day: "Wed", users: 15 },
  { day: "Thu", users: 32 }, { day: "Fri", users: 28 }, { day: "Sat", users: 11 }, { day: "Sun", users: 19 },
];

// ─── Sidebar Items ────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "users", label: "Users", icon: <Users className="w-4 h-4" />, badge: 7 },
  { id: "transactions", label: "Transactions", icon: <ArrowLeftRight className="w-4 h-4" />, badge: 8 },
  { id: "tokens", label: "Tokens", icon: <Coins className="w-4 h-4" /> },
  { id: "presale", label: "Presale", icon: <Rocket className="w-4 h-4" /> },
  { id: "staking", label: "Staking Pools", icon: <Layers className="w-4 h-4" /> },
  { id: "bots", label: "Bots", icon: <Bot className="w-4 h-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Admin() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Users state
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<UserRow[]>(MOCK_USERS);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  // Transactions state
  const [txFilter, setTxFilter] = useState("all");
  const [txSearch, setTxSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<TxRow | null>(null);

  // Tokens state
  const [tokenSearch, setTokenSearch] = useState("");
  const [tokens, setTokens] = useState<TokenRow[]>(MOCK_TOKENS);

  // Bots state
  const [bots, setBots] = useState<BotRow[]>(MOCK_BOTS);

  // Staking state
  const [pools, setPools] = useState<StakingPool[]>(MOCK_STAKING_POOLS);
  const [editingPool, setEditingPool] = useState<StakingPool | null>(null);
  const [editApy, setEditApy] = useState("");

  // Presale state
  const [presaleActive, setPresaleActive] = useState(true);
  const [presaleHardCap, setPresaleHardCap] = useState("2,000,000");
  const [tier1Price, setTier1Price] = useState("0.15");
  const [tier2Price, setTier2Price] = useState("0.20");
  const [tier3Price, setTier3Price] = useState("0.25");
  const [presaleEditing, setPresaleEditing] = useState(false);

  // Settings state
  const [platformFee, setPlatformFee] = useState("2.5");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState("🚀 VaultGenesis presale is now live! Get your VG tokens before they sell out.");
  const [settingsEditing, setSettingsEditing] = useState(false);

  // ─── Derived ───────────────────────────────────────────────────────────────

  const filteredUsers = useMemo(() => users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.wallet.toLowerCase().includes(userSearch.toLowerCase())
  ), [users, userSearch]);

  const filteredTxs = useMemo(() => {
    let list = txFilter === "all" ? MOCK_TXS : MOCK_TXS.filter(t => t.status === txFilter);
    if (txSearch) list = list.filter(t => t.wallet.includes(txSearch) || t.token.toLowerCase().includes(txSearch.toLowerCase()));
    return list;
  }, [txFilter, txSearch]);

  const filteredTokens = useMemo(() => tokens.filter(t =>
    t.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    t.symbol.toLowerCase().includes(tokenSearch.toLowerCase())
  ), [tokens, tokenSearch]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleBanUser = (id: number) => {
    const user = users.find(u => u.id === id);
    const next = user?.status === "banned" ? "active" : "banned";
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: next } : u));
    toast.success(`${user?.name} ${next === "banned" ? "banned" : "unbanned"}`);
  };

  const handleRoleChange = (id: number) => {
    const user = users.find(u => u.id === id);
    const next = user?.role === "admin" ? "user" : "admin";
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: next } : u));
    toast.success(`${user?.name} is now ${next}`);
  };

  const handleTokenAction = (id: number, action: "approve" | "reject" | "suspend" | "restore") => {
    const token = tokens.find(t => t.id === id);
    const statusMap = { approve: "deployed", reject: "failed", suspend: "suspended", restore: "deployed" } as const;
    setTokens(prev => prev.map(t => t.id === id ? { ...t, status: statusMap[action] } : t));
    toast.success(`${token?.name} ${action}d`);
  };

  const handleBotAction = (id: number, action: "pause" | "resume" | "stop") => {
    const bot = bots.find(b => b.id === id);
    const statusMap = { pause: "paused", resume: "active", stop: "stopped" } as const;
    setBots(prev => prev.map(b => b.id === id ? { ...b, status: statusMap[action] } : b));
    toast.success(`${bot?.name} ${action}d`);
  };

  const handleTogglePool = (id: number) => {
    const pool = pools.find(p => p.id === id);
    setPools(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
    toast.success(`${pool?.symbol} pool ${pool?.enabled ? "disabled" : "enabled"}`);
  };

  const handleSaveApy = () => {
    if (!editingPool) return;
    const val = parseFloat(editApy);
    if (isNaN(val) || val < 0 || val > 999) { toast.error("Invalid APY value"); return; }
    setPools(prev => prev.map(p => p.id === editingPool.id ? { ...p, apy: val } : p));
    toast.success(`${editingPool.symbol} APY updated to ${val}%`);
    setEditingPool(null);
    setEditApy("");
  };

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map(row => keys.map(k => row[k]).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    toast.success(`${filename} downloaded`);
  };

  // ─── Style Helpers ─────────────────────────────────────────────────────────

  const bg = isDark ? 'bg-black' : 'bg-[#fafaf8]';
  const cardClass = `rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/10'}`;
  const labelClass = `text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`;
  const inputClass = `w-full rounded-xl border px-3 py-2 text-sm focus:outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-black/5 border-black/10 text-black placeholder-gray-400'}`;
  const sidebarBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/10';

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: "text-green-400 bg-green-900/20 border-green-700/30",
      active: "text-green-400 bg-green-900/20 border-green-700/30",
      deployed: "text-green-400 bg-green-900/20 border-green-700/30",
      enabled: "text-green-400 bg-green-900/20 border-green-700/30",
      pending: "text-yellow-400 bg-yellow-900/20 border-yellow-700/30",
      paused: "text-yellow-400 bg-yellow-900/20 border-yellow-700/30",
      failed: "text-red-400 bg-red-900/20 border-red-700/30",
      banned: "text-red-400 bg-red-900/20 border-red-700/30",
      suspended: "text-red-400 bg-red-900/20 border-red-700/30",
      stopped: "text-gray-400 bg-gray-900/20 border-gray-700/30",
    };
    return `text-xs font-bold px-2 py-0.5 rounded-lg border ${map[status] || 'text-gray-400 bg-gray-900/20 border-gray-700/30'}`;
  };

  const actionBtn = (color: "ghost" | "red" | "green" | "yellow") => {
    const map = {
      ghost: isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20',
      red: 'bg-red-900/30 text-red-400 hover:bg-red-900/50',
      green: 'bg-green-900/30 text-green-400 hover:bg-green-900/50',
      yellow: 'bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50',
    };
    return `rounded-lg px-2 py-1 text-xs font-bold transition-all ${map[color]}`;
  };

  const tooltipStyle = {
    contentStyle: { background: isDark ? '#1a1a1a' : '#fff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 12 },
    labelStyle: { color: isDark ? '#aaa' : '#666' },
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen ${bg} relative overflow-hidden`}>
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        {[1, 2, 3].map(i => (
          <div key={i} className={`absolute rounded-full animate-float-glow-${i}`} style={{
            width: i === 1 ? '600px' : '400px', height: i === 1 ? '800px' : '500px',
            background: isDark ? 'radial-gradient(rgba(255,255,255,0.25) 0%, rgba(0,0,0,0) 70%)' : 'radial-gradient(rgba(80,80,80,0.35) 0%, rgba(250,250,248,0) 70%)',
            filter: 'blur(80px)', opacity: isDark ? 0.4 : 0.6,
          }} />
        ))}
      </div>

      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <div className="relative z-10 pt-20 flex min-h-screen">
        {/* ── Sidebar ── */}
        <aside className={`fixed left-0 top-20 h-[calc(100vh-5rem)] border-r transition-all duration-300 z-20 flex flex-col ${sidebarBg} border ${sidebarOpen ? 'w-56' : 'w-14'} overflow-hidden`}>
          {/* Toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className={`flex items-center justify-center w-full h-10 border-b transition-all ${isDark ? 'border-white/10 text-gray-400 hover:text-white' : 'border-black/10 text-gray-500 hover:text-black'}`}
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          {/* Header */}
          {sidebarOpen && (
            <div className="px-4 py-3 border-b border-inherit">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-white' : 'text-black'}`} />
                <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-black'}`}>Admin Panel</span>
              </div>
            </div>
          )}

          {/* Nav items */}
          <nav className="flex-1 py-2 overflow-y-auto">
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-all relative ${
                  activeTab === item.id
                    ? isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'
                    : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-black/5'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {activeTab === item.id && (
                  <span className={`absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-l ${isDark ? 'bg-white' : 'bg-black'}`} />
                )}
              </button>
            ))}
          </nav>

          {/* Footer */}
          {sidebarOpen && (
            <div className={`px-4 py-3 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>VaultGenesis v1.0</p>
              <p className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Admin Access</p>
            </div>
          )}
        </aside>

        {/* ── Main Content ── */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-56' : 'ml-14'} p-6 pb-20`}>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Overview</h1>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Platform health at a glance</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: "1,247", change: "+12 today", icon: <Users className="w-5 h-5" />, color: "text-blue-400" },
                  { label: "Total Volume", value: "$2.4M", change: "+$48K today", icon: <DollarSign className="w-5 h-5" />, color: "text-green-400" },
                  { label: "Tokens Created", value: "314", change: "+8 today", icon: <Coins className="w-5 h-5" />, color: "text-purple-400" },
                  { label: "Active Bots", value: "89", change: "+3 today", icon: <Bot className="w-5 h-5" />, color: "text-orange-400" },
                ].map(stat => (
                  <div key={stat.label} className={`${cardClass} p-4`}>
                    <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
                    <p className={`${labelClass} mb-1`}>{stat.label}</p>
                    <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</p>
                    <p className="text-xs text-green-400 font-bold mt-1">{stat.change}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`${cardClass} p-5`}>
                  <p className={`${labelClass} mb-4`}>7-Day Volume (USD)</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={VOLUME_CHART} barSize={20}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, "Volume"]} />
                      <Bar dataKey="volume" fill={isDark ? '#ffffff' : '#000000'} radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className={`${cardClass} p-5`}>
                  <p className={`${labelClass} mb-4`}>7-Day New Users</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={USER_CHART}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "New Users"]} />
                      <Line dataKey="users" stroke={isDark ? '#ffffff' : '#000000'} strokeWidth={2} dot={{ r: 3, fill: isDark ? '#fff' : '#000' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Presale Progress + Top Tokens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`${cardClass} p-5`}>
                  <p className={`${labelClass} mb-4`}>Presale Progress</p>
                  <div className="space-y-3">
                    {[
                      { tier: "Tier 1 — Early Bird", sold: 100, total: 100, price: "$0.15" },
                      { tier: "Tier 2 — Standard", sold: 72, total: 100, price: "$0.20" },
                      { tier: "Tier 3 — Late Stage", sold: 30, total: 100, price: "$0.25" },
                    ].map(t => (
                      <div key={t.tier}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{t.tier}</span>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{t.sold}% · {t.price}</span>
                        </div>
                        <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                          <div className={`h-full rounded-full transition-all ${t.sold === 100 ? 'bg-green-500' : isDark ? 'bg-white' : 'bg-black'}`} style={{ width: `${t.sold}%` }} />
                        </div>
                      </div>
                    ))}
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Total raised: <span className="font-bold text-green-400">$1,250,000</span> / $2,000,000</p>
                  </div>
                </div>

                <div className={`${cardClass} p-5`}>
                  <p className={`${labelClass} mb-4`}>Top Tokens by Volume</p>
                  <div className="space-y-2">
                    {[
                      { symbol: "VG", name: "Vault Genesis", volume: "$2.4M", change: "+12.4%" },
                      { symbol: "MOON", name: "Moon Coin", volume: "$180K", change: "+5.2%" },
                      { symbol: "DOGEP", name: "Doge Plus", volume: "$42K", change: "-1.8%" },
                    ].map((t, i) => (
                      <div key={t.symbol} className={`flex items-center gap-3 py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                        <span className={`text-xs font-black w-5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>#{i + 1}</span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>{t.symbol[0]}</div>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{t.symbol}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{t.name}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{t.volume}</p>
                          <p className={`text-xs font-bold ${t.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{t.change}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className={`${cardClass} p-5`}>
                <p className={`${labelClass} mb-4`}>Recent Activity</p>
                <div className="space-y-2">
                  {[
                    { action: "New user registered", detail: "alice@example.com", time: "2m ago", icon: <Users className="w-3 h-3" />, color: "text-blue-400" },
                    { action: "Token deployed", detail: "MOON — 500M supply", time: "8m ago", icon: <Coins className="w-3 h-3" />, color: "text-purple-400" },
                    { action: "Presale contribution", detail: "$1,200 — 6,000 VG", time: "15m ago", icon: <Rocket className="w-3 h-3" />, color: "text-green-400" },
                    { action: "Bot activated", detail: "Scalping Bot #3", time: "32m ago", icon: <Bot className="w-3 h-3" />, color: "text-orange-400" },
                    { action: "User banned", detail: "dave@example.com", time: "1h ago", icon: <Ban className="w-3 h-3" />, color: "text-red-400" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                      <span className={item.color}>{item.icon}</span>
                      <div className="flex-1">
                        <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.action}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{item.detail}</p>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Users</h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{filteredUsers.length} users found</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => exportCSV(users as unknown as Record<string, unknown>[], "users.csv")} size="sm" className={actionBtn("ghost")}>
                    <Download className="w-3 h-3 mr-1" /> Export CSV
                  </Button>
                </div>
              </div>

              <div className={`${cardClass} p-5`}>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name, email, or wallet..." className={`${inputClass} pl-9`} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        {["User", "Wallet", "Role", "Volume", "Trades", "Last Active", "Status", "Actions"].map(h => (
                          <th key={h} className={`text-left pb-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-3`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                          <td className="py-3 pr-3">
                            <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-black'}`}>{user.name}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user.email}</p>
                          </td>
                          <td className={`py-3 pr-3 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.wallet}</td>
                          <td className="py-3 pr-3">
                            <span className={statusBadge(user.role === "admin" ? "completed" : "pending")}>{user.role}</span>
                          </td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{user.volume}</td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{user.totalTrades}</td>
                          <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user.lastActive}</td>
                          <td className="py-3 pr-3">
                            <span className={statusBadge(user.status)}>{user.status}</span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              <Button onClick={() => setSelectedUser(user)} size="sm" className={actionBtn("ghost")} title="View details">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button onClick={() => handleRoleChange(user.id)} size="sm" className={actionBtn("ghost")} title="Toggle role">
                                <Shield className="w-3 h-3" />
                              </Button>
                              <Button onClick={() => handleBanUser(user.id)} size="sm" className={user.status === "banned" ? actionBtn("green") : actionBtn("red")} title={user.status === "banned" ? "Unban" : "Ban"}>
                                {user.status === "banned" ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Detail Modal */}
              {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className={`relative z-10 w-full max-w-md rounded-2xl border p-6 ${isDark ? 'bg-[#111] border-white/10' : 'bg-white border-black/10'}`} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>{selectedUser.name}</h3>
                      <button onClick={() => setSelectedUser(null)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Email", value: selectedUser.email },
                        { label: "Wallet", value: selectedUser.wallet },
                        { label: "Role", value: selectedUser.role },
                        { label: "Status", value: selectedUser.status },
                        { label: "Joined", value: selectedUser.joined },
                        { label: "Total Trades", value: selectedUser.totalTrades.toString() },
                        { label: "Total Volume", value: selectedUser.volume },
                        { label: "Last Active", value: selectedUser.lastActive },
                      ].map(row => (
                        <div key={row.label} className={`flex justify-between py-2 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{row.label}</span>
                          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => { handleRoleChange(selectedUser.id); setSelectedUser(null); }} size="sm" className={`flex-1 ${actionBtn("ghost")}`}>
                        Toggle Role
                      </Button>
                      <Button onClick={() => { handleBanUser(selectedUser.id); setSelectedUser(null); }} size="sm" className={`flex-1 ${selectedUser.status === "banned" ? actionBtn("green") : actionBtn("red")}`}>
                        {selectedUser.status === "banned" ? "Unban" : "Ban"} User
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TRANSACTIONS ── */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Transactions</h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{filteredTxs.length} transactions</p>
                </div>
                <Button onClick={() => exportCSV(MOCK_TXS as unknown as Record<string, unknown>[], "transactions.csv")} size="sm" className={actionBtn("ghost")}>
                  <Download className="w-3 h-3 mr-1" /> Export CSV
                </Button>
              </div>

              <div className={`${cardClass} p-5`}>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input value={txSearch} onChange={e => setTxSearch(e.target.value)} placeholder="Search by wallet or token..." className={`${inputClass} pl-9`} />
                  </div>
                  <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    {["all", "completed", "pending", "failed"].map(f => (
                      <button key={f} onClick={() => setTxFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${txFilter === f
                          ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                          : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        {["Type", "Wallet", "Amount", "Token", "Hash", "Status", "Time", ""].map(h => (
                          <th key={h} className={`text-left pb-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-3`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTxs.map(tx => (
                        <tr key={tx.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                          <td className="py-3 pr-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border capitalize ${
                              tx.type === "buy" ? 'text-green-400 bg-green-900/20 border-green-700/30' :
                              tx.type === "sell" ? 'text-red-400 bg-red-900/20 border-red-700/30' :
                              isDark ? 'text-gray-400 bg-white/5 border-white/10' : 'text-gray-600 bg-black/5 border-black/10'
                            }`}>{tx.type}</span>
                          </td>
                          <td className={`py-3 pr-3 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{tx.wallet}</td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{tx.amount}</td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{tx.token}</td>
                          <td className={`py-3 pr-3 font-mono text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{tx.hash}</td>
                          <td className="py-3 pr-3"><span className={statusBadge(tx.status)}>{tx.status}</span></td>
                          <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{tx.time}</td>
                          <td className="py-3">
                            <Button onClick={() => setSelectedTx(tx)} size="sm" className={actionBtn("ghost")}>
                              <Eye className="w-3 h-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tx Detail Modal */}
              {selectedTx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTx(null)}>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 ${isDark ? 'bg-[#111] border-white/10' : 'bg-white border-black/10'}`} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-lg font-black uppercase ${isDark ? 'text-white' : 'text-black'}`}>Transaction #{selectedTx.id}</h3>
                      <button onClick={() => setSelectedTx(null)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}><X className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: "Type", value: selectedTx.type },
                        { label: "Wallet", value: selectedTx.wallet },
                        { label: "Amount", value: selectedTx.amount },
                        { label: "Token", value: selectedTx.token },
                        { label: "Hash", value: selectedTx.hash },
                        { label: "Status", value: selectedTx.status },
                        { label: "Time", value: selectedTx.time },
                      ].map(row => (
                        <div key={row.label} className={`flex justify-between py-2 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{row.label}</span>
                          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'} font-mono`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TOKENS ── */}
          {activeTab === "tokens" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Tokens</h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{filteredTokens.length} tokens</p>
                </div>
              </div>

              <div className={`${cardClass} p-5`}>
                <div className="mb-4">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input value={tokenSearch} onChange={e => setTokenSearch(e.target.value)} placeholder="Search tokens..." className={`${inputClass} pl-9 max-w-xs`} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        {["Token", "Creator", "Supply", "Holders", "Volume", "Status", "Created", "Actions"].map(h => (
                          <th key={h} className={`text-left pb-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-3`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTokens.map(token => (
                        <tr key={token.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                          <td className="py-3 pr-3">
                            <p className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>{token.name}</p>
                            <p className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{token.symbol}</p>
                          </td>
                          <td className={`py-3 pr-3 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{token.creator}</td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.supply}</td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.holders.toLocaleString()}</td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.volume}</td>
                          <td className="py-3 pr-3"><span className={statusBadge(token.status)}>{token.status}</span></td>
                          <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{token.created}</td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              {token.status === "pending" && (
                                <>
                                  <Button onClick={() => handleTokenAction(token.id, "approve")} size="sm" className={actionBtn("green")} title="Approve">
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button onClick={() => handleTokenAction(token.id, "reject")} size="sm" className={actionBtn("red")} title="Reject">
                                    <X className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              {token.status === "deployed" && (
                                <Button onClick={() => handleTokenAction(token.id, "suspend")} size="sm" className={actionBtn("yellow")} title="Suspend">
                                  <Pause className="w-3 h-3" />
                                </Button>
                              )}
                              {token.status === "suspended" && (
                                <Button onClick={() => handleTokenAction(token.id, "restore")} size="sm" className={actionBtn("green")} title="Restore">
                                  <Play className="w-3 h-3" />
                                </Button>
                              )}
                              {token.status === "failed" && (
                                <Button onClick={() => toast.info(`Retry deployment for ${token.name}`)} size="sm" className={actionBtn("ghost")} title="Retry">
                                  <RefreshCw className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── PRESALE ── */}
          {activeTab === "presale" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Presale</h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Manage presale settings and tiers</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => { setPresaleActive(v => !v); toast.success(`Presale ${presaleActive ? "paused" : "resumed"}`); }}
                    size="sm"
                    className={presaleActive ? actionBtn("yellow") : actionBtn("green")}
                  >
                    {presaleActive ? <><Pause className="w-3 h-3 mr-1" /> Pause Presale</> : <><Play className="w-3 h-3 mr-1" /> Resume Presale</>}
                  </Button>
                  <Button onClick={() => setPresaleEditing(v => !v)} size="sm" className={actionBtn("ghost")}>
                    <Edit2 className="w-3 h-3 mr-1" /> {presaleEditing ? "Cancel" : "Edit Settings"}
                  </Button>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${presaleActive ? 'border-green-700/30 bg-green-900/10' : 'border-yellow-700/30 bg-yellow-900/10'}`}>
                <Activity className={`w-4 h-4 ${presaleActive ? 'text-green-400' : 'text-yellow-400'}`} />
                <span className={`text-xs font-bold ${presaleActive ? 'text-green-400' : 'text-yellow-400'}`}>
                  Presale is currently {presaleActive ? "ACTIVE" : "PAUSED"}
                </span>
              </div>

              {/* Settings */}
              <div className={`${cardClass} p-5`}>
                <p className={`${labelClass} mb-4`}>Presale Configuration</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`${labelClass} block mb-1`}>Hard Cap (USD)</label>
                    <input
                      value={presaleHardCap}
                      onChange={e => setPresaleHardCap(e.target.value)}
                      disabled={!presaleEditing}
                      className={`${inputClass} ${!presaleEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  {[
                    { label: "Tier 1 Price (USD)", value: tier1Price, set: setTier1Price },
                    { label: "Tier 2 Price (USD)", value: tier2Price, set: setTier2Price },
                    { label: "Tier 3 Price (USD)", value: tier3Price, set: setTier3Price },
                  ].map(field => (
                    <div key={field.label}>
                      <label className={`${labelClass} block mb-1`}>{field.label}</label>
                      <input
                        value={field.value}
                        onChange={e => field.set(e.target.value)}
                        disabled={!presaleEditing}
                        className={`${inputClass} ${!presaleEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  ))}
                </div>
                {presaleEditing && (
                  <Button
                    onClick={() => { setPresaleEditing(false); toast.success("Presale settings saved"); }}
                    size="sm"
                    className={`mt-4 ${actionBtn("green")}`}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" /> Save Changes
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Raised", value: "$1,250,000" },
                  { label: "Contributors", value: "3,847" },
                  { label: "Tokens Sold", value: "8,333,333 VG" },
                  { label: "Remaining", value: "$750,000" },
                ].map(s => (
                  <div key={s.label} className={`${cardClass} p-4`}>
                    <p className={`${labelClass} mb-1`}>{s.label}</p>
                    <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── STAKING ── */}
          {activeTab === "staking" && (
            <div className="space-y-4">
              <div>
                <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Staking Pools</h1>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Manage APY rates and pool availability</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {pools.map(pool => (
                  <div key={pool.id} className={`${cardClass} p-5`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                          {pool.symbol[0]}
                        </div>
                        <div>
                          <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-black'}`}>{pool.token}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{pool.symbol}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 flex-1 sm:max-w-xs">
                        <div>
                          <p className={labelClass}>APY</p>
                          <p className={`text-lg font-black text-green-400`}>{pool.apy}%</p>
                        </div>
                        <div>
                          <p className={labelClass}>Staked</p>
                          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{pool.totalStaked}</p>
                        </div>
                        <div>
                          <p className={labelClass}>Stakers</p>
                          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{pool.stakers}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={statusBadge(pool.enabled ? "active" : "stopped")}>{pool.enabled ? "Enabled" : "Disabled"}</span>
                        <Button onClick={() => { setEditingPool(pool); setEditApy(pool.apy.toString()); }} size="sm" className={actionBtn("ghost")}>
                          <Edit2 className="w-3 h-3 mr-1" /> Edit APY
                        </Button>
                        <Button onClick={() => handleTogglePool(pool.id)} size="sm" className={pool.enabled ? actionBtn("red") : actionBtn("green")}>
                          {pool.enabled ? <><Pause className="w-3 h-3 mr-1" /> Disable</> : <><Play className="w-3 h-3 mr-1" /> Enable</>}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit APY Modal */}
              {editingPool && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditingPool(null)}>
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                  <div className={`relative z-10 w-full max-w-sm rounded-2xl border p-6 ${isDark ? 'bg-[#111] border-white/10' : 'bg-white border-black/10'}`} onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>Edit {editingPool.symbol} APY</h3>
                      <button onClick={() => setEditingPool(null)} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}><X className="w-4 h-4" /></button>
                    </div>
                    <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Current APY: <span className="font-bold text-green-400">{editingPool.apy}%</span></p>
                    <input
                      type="number"
                      value={editApy}
                      onChange={e => setEditApy(e.target.value)}
                      placeholder="New APY (%)"
                      className={inputClass}
                    />
                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => setEditingPool(null)} size="sm" className={`flex-1 ${actionBtn("ghost")}`}>Cancel</Button>
                      <Button onClick={handleSaveApy} size="sm" className={`flex-1 ${actionBtn("green")}`}>Save APY</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BOTS ── */}
          {activeTab === "bots" && (
            <div className="space-y-4">
              <div>
                <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Bots</h1>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Monitor and control all trading bots</p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Active", value: bots.filter(b => b.status === "active").length, color: "text-green-400" },
                  { label: "Paused", value: bots.filter(b => b.status === "paused").length, color: "text-yellow-400" },
                  { label: "Stopped", value: bots.filter(b => b.status === "stopped").length, color: "text-gray-400" },
                ].map(s => (
                  <div key={s.label} className={`${cardClass} p-4 text-center`}>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className={labelClass}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className={`${cardClass} p-5`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        {["Bot", "Owner", "Strategy", "Allocated", "Profit", "Trades", "Win Rate", "Status", "Actions"].map(h => (
                          <th key={h} className={`text-left pb-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-3`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bots.map(bot => (
                        <tr key={bot.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{bot.name}</td>
                          <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{bot.owner}</td>
                          <td className="py-3 pr-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${isDark ? 'border-white/10 bg-white/5 text-gray-300' : 'border-black/10 bg-black/5 text-gray-700'}`}>{bot.strategy}</span>
                          </td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{bot.allocated}</td>
                          <td className={`py-3 pr-3 text-xs font-bold ${bot.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{bot.profit}</td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{bot.trades}</td>
                          <td className={`py-3 pr-3 text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{bot.winRate}</td>
                          <td className="py-3 pr-3"><span className={statusBadge(bot.status)}>{bot.status}</span></td>
                          <td className="py-3">
                            <div className="flex gap-1">
                              {bot.status === "active" && (
                                <Button onClick={() => handleBotAction(bot.id, "pause")} size="sm" className={actionBtn("yellow")} title="Pause">
                                  <Pause className="w-3 h-3" />
                                </Button>
                              )}
                              {bot.status === "paused" && (
                                <Button onClick={() => handleBotAction(bot.id, "resume")} size="sm" className={actionBtn("green")} title="Resume">
                                  <Play className="w-3 h-3" />
                                </Button>
                              )}
                              {bot.status !== "stopped" && (
                                <Button onClick={() => handleBotAction(bot.id, "stop")} size="sm" className={actionBtn("red")} title="Force Stop">
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Settings</h1>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Platform-wide configuration</p>
                </div>
                <Button onClick={() => setSettingsEditing(v => !v)} size="sm" className={actionBtn("ghost")}>
                  <Edit2 className="w-3 h-3 mr-1" /> {settingsEditing ? "Cancel" : "Edit Settings"}
                </Button>
              </div>

              {/* Maintenance Mode */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>Maintenance Mode</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Temporarily disable the platform for all users</p>
                  </div>
                  <button
                    onClick={() => { setMaintenanceMode(v => !v); toast.success(`Maintenance mode ${maintenanceMode ? "disabled" : "enabled"}`); }}
                    className={`transition-all ${maintenanceMode ? 'text-red-400' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {maintenanceMode ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
                {maintenanceMode && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-red-700/30 bg-red-900/10">
                    <AlertTriangle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400 font-bold">Platform is in maintenance mode — users cannot access the site</span>
                  </div>
                )}
              </div>

              {/* Platform Fee */}
              <div className={`${cardClass} p-5`}>
                <p className={`${labelClass} mb-3`}>Platform Fee</p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Percent className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="number"
                      value={platformFee}
                      onChange={e => setPlatformFee(e.target.value)}
                      disabled={!settingsEditing}
                      className={`${inputClass} pl-9 ${!settingsEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder="e.g. 2.5"
                    />
                  </div>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>% per transaction</span>
                </div>
              </div>

              {/* Announcement Banner */}
              <div className={`${cardClass} p-5`}>
                <p className={`${labelClass} mb-3`}>Announcement Banner</p>
                <textarea
                  value={announcement}
                  onChange={e => setAnnouncement(e.target.value)}
                  disabled={!settingsEditing}
                  rows={3}
                  className={`${inputClass} resize-none ${!settingsEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="Enter announcement text..."
                />
                {announcement && (
                  <div className={`mt-3 px-4 py-2.5 rounded-xl text-xs font-bold ${isDark ? 'bg-white/5 text-white border border-white/10' : 'bg-black/5 text-black border border-black/10'}`}>
                    <Bell className="w-3 h-3 inline mr-2 opacity-60" />
                    Preview: {announcement}
                  </div>
                )}
              </div>

              {settingsEditing && (
                <Button
                  onClick={() => { setSettingsEditing(false); toast.success("Platform settings saved"); }}
                  size="sm"
                  className={actionBtn("green")}
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> Save All Settings
                </Button>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
