import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { Users, Coins, TrendingUp, DollarSign, Search, Shield, Ban, CheckCircle } from "lucide-react";

type Tab = "overview" | "users" | "transactions" | "tokens";

interface UserRow {
  id: number;
  name: string;
  wallet: string;
  email: string;
  role: "user" | "admin";
  joined: string;
  status: "active" | "banned";
  totalTrades: number;
}

interface TxRow {
  id: number;
  type: "stake" | "unstake" | "buy" | "sell" | "transfer";
  wallet: string;
  amount: string;
  token: string;
  status: "completed" | "pending" | "failed";
  time: string;
}

interface TokenRow {
  id: number;
  name: string;
  symbol: string;
  creator: string;
  supply: string;
  status: "deployed" | "pending" | "failed";
  created: string;
}

const MOCK_USERS: UserRow[] = [
  { id: 1, name: "Alice Chen", wallet: "0x1a2b...3c4d", email: "alice@example.com", role: "admin", joined: "Jan 12, 2025", status: "active", totalTrades: 142 },
  { id: 2, name: "Bob Smith", wallet: "0x5e6f...7a8b", email: "bob@example.com", role: "user", joined: "Feb 3, 2025", status: "active", totalTrades: 87 },
  { id: 3, name: "Carol Davis", wallet: "0x9c0d...1e2f", email: "carol@example.com", role: "user", joined: "Feb 18, 2025", status: "active", totalTrades: 23 },
  { id: 4, name: "Dave Wilson", wallet: "0x3a4b...5c6d", email: "dave@example.com", role: "user", joined: "Mar 1, 2025", status: "banned", totalTrades: 5 },
  { id: 5, name: "Eve Martinez", wallet: "0x7e8f...9a0b", email: "eve@example.com", role: "user", joined: "Mar 2, 2025", status: "active", totalTrades: 61 },
];

const MOCK_TXS: TxRow[] = [
  { id: 1, type: "buy", wallet: "0x1a2b...3c4d", amount: "$1,200", token: "VG", status: "completed", time: "2m ago" },
  { id: 2, type: "stake", wallet: "0x5e6f...7a8b", amount: "50,000 VG", token: "VG", status: "completed", time: "8m ago" },
  { id: 3, type: "sell", wallet: "0x9c0d...1e2f", amount: "$450", token: "USDC", status: "pending", time: "15m ago" },
  { id: 4, type: "transfer", wallet: "0x3a4b...5c6d", amount: "2.5 ETH", token: "ETH", status: "completed", time: "32m ago" },
  { id: 5, type: "unstake", wallet: "0x7e8f...9a0b", amount: "10,000 VG", token: "VG", status: "failed", time: "1h ago" },
  { id: 6, type: "buy", wallet: "0x1a2b...3c4d", amount: "$800", token: "VG", status: "completed", time: "2h ago" },
];

const MOCK_TOKENS: TokenRow[] = [
  { id: 1, name: "Vault Genesis", symbol: "VG", creator: "0x1a2b...3c4d", supply: "1,000,000,000", status: "deployed", created: "Jan 12, 2025" },
  { id: 2, name: "Moon Coin", symbol: "MOON", creator: "0x5e6f...7a8b", supply: "500,000,000", status: "deployed", created: "Feb 5, 2025" },
  { id: 3, name: "Doge Plus", symbol: "DOGEP", creator: "0x9c0d...1e2f", supply: "2,000,000,000", status: "deployed", created: "Feb 20, 2025" },
  { id: 4, name: "Rocket Token", symbol: "RKT", creator: "0x3a4b...5c6d", supply: "100,000,000", status: "pending", created: "Mar 2, 2025" },
  { id: 5, name: "Star Coin", symbol: "STAR", creator: "0x7e8f...9a0b", supply: "750,000,000", status: "failed", created: "Mar 3, 2025" },
];

export default function Admin() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [txFilter, setTxFilter] = useState("all");
  const [users, setUsers] = useState<UserRow[]>(MOCK_USERS);

  const handleBanUser = (id: number) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "banned" ? "active" : "banned" } : u));
    toast.success(`User ${user?.name} ${user?.status === "banned" ? "unbanned" : "banned"} successfully`);
  };

  const handleRoleChange = (id: number) => {
    const user = users.find(u => u.id === id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u));
    toast.success(`${user?.name}'s role updated`);
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.wallet.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredTxs = txFilter === "all" ? MOCK_TXS : MOCK_TXS.filter(t => t.status === txFilter);

  const cardClass = `rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/10'}`;
  const labelClass = `text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`;
  const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-black/5 border-black/10 text-black placeholder-gray-400'}`;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { id: "transactions", label: "Transactions", icon: <DollarSign className="w-4 h-4" /> },
    { id: "tokens", label: "Tokens", icon: <Coins className="w-4 h-4" /> },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      completed: "text-green-400 bg-green-900/20 border-green-700/30",
      active: "text-green-400 bg-green-900/20 border-green-700/30",
      deployed: "text-green-400 bg-green-900/20 border-green-700/30",
      pending: "text-yellow-400 bg-yellow-900/20 border-yellow-700/30",
      failed: "text-red-400 bg-red-900/20 border-red-700/30",
      banned: "text-red-400 bg-red-900/20 border-red-700/30",
    };
    return `text-xs font-bold px-2 py-0.5 rounded-lg border ${map[status] || 'text-gray-400 bg-gray-900/20 border-gray-700/30'}`;
  };

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
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Shield className={`w-8 h-8 ${isDark ? 'text-white' : 'text-black'}`} />
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>ADMIN</h1>
          </div>
          <p className={`text-sm sm:text-base mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Platform management and monitoring</p>

          {/* Tab Navigation */}
          <div className={`flex gap-1 p-1 rounded-xl mb-8 w-fit ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${activeTab === tab.id
                  ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
                {tab.icon} <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: "1,247", change: "+12 today", icon: <Users className="w-5 h-5" /> },
                  { label: "Total Volume", value: "$2.4M", change: "+$48K today", icon: <DollarSign className="w-5 h-5" /> },
                  { label: "Tokens Created", value: "314", change: "+8 today", icon: <Coins className="w-5 h-5" /> },
                  { label: "Active Bots", value: "89", change: "+3 today", icon: <TrendingUp className="w-5 h-5" /> },
                ].map(stat => (
                  <div key={stat.label} className={`${cardClass} p-4`}>
                    <div className={`mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.icon}</div>
                    <p className={`${labelClass} mb-1`}>{stat.label}</p>
                    <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{stat.value}</p>
                    <p className="text-xs text-green-400 font-bold mt-1">{stat.change}</p>
                  </div>
                ))}
              </div>

              <div className={`${cardClass} p-6`}>
                <p className={`${labelClass} mb-4`}>Recent Activity</p>
                <div className="space-y-3">
                  {[
                    { action: "New user registered", detail: "alice@example.com", time: "2m ago" },
                    { action: "Token deployed", detail: "MOON — 500M supply", time: "8m ago" },
                    { action: "Presale contribution", detail: "$1,200 — 6,000 VG", time: "15m ago" },
                    { action: "Bot activated", detail: "Scalping Bot #3", time: "32m ago" },
                    { action: "User banned", detail: "dave@example.com", time: "1h ago" },
                  ].map((item, i) => (
                    <div key={i} className={`flex justify-between items-center py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                      <div>
                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>{item.action}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{item.detail}</p>
                      </div>
                      <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{item.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className={`${cardClass} p-6`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <p className={labelClass}>User Management ({filteredUsers.length} users)</p>
                <div className="relative w-full sm:w-64">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <Input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." className={`${inputClass} pl-9`} />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                      {["Name", "Wallet", "Role", "Trades", "Status", "Actions"].map(h => (
                        <th key={h} className={`text-left pb-3 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-4`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                        <td className="py-3 pr-4">
                          <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{user.name}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user.email}</p>
                        </td>
                        <td className={`py-3 pr-4 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.wallet}</td>
                        <td className="py-3 pr-4">
                          <span className={statusBadge(user.role === "admin" ? "completed" : "pending")}>{user.role}</span>
                        </td>
                        <td className={`py-3 pr-4 font-bold ${isDark ? 'text-white' : 'text-black'}`}>{user.totalTrades}</td>
                        <td className="py-3 pr-4">
                          <span className={statusBadge(user.status)}>{user.status}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Button onClick={() => handleRoleChange(user.id)} size="sm" className={`rounded-lg px-2 py-1 text-xs font-bold ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}>
                              <Shield className="w-3 h-3" />
                            </Button>
                            <Button onClick={() => handleBanUser(user.id)} size="sm" className={`rounded-lg px-2 py-1 text-xs font-bold ${user.status === "banned" ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'}`}>
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
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className={`${cardClass} p-6`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <p className={labelClass}>Transaction Monitor</p>
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
                      {["Type", "Wallet", "Amount", "Token", "Status", "Time"].map(h => (
                        <th key={h} className={`text-left pb-3 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-4`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxs.map(tx => (
                      <tr key={tx.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border capitalize ${
                            tx.type === "buy" ? 'text-green-400 bg-green-900/20 border-green-700/30' :
                            tx.type === "sell" ? 'text-red-400 bg-red-900/20 border-red-700/30' :
                            isDark ? 'text-gray-400 bg-white/5 border-white/10' : 'text-gray-600 bg-black/5 border-black/10'
                          }`}>{tx.type}</span>
                        </td>
                        <td className={`py-3 pr-4 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{tx.wallet}</td>
                        <td className={`py-3 pr-4 font-bold ${isDark ? 'text-white' : 'text-black'}`}>{tx.amount}</td>
                        <td className={`py-3 pr-4 font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{tx.token}</td>
                        <td className="py-3 pr-4"><span className={statusBadge(tx.status)}>{tx.status}</span></td>
                        <td className={`py-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{tx.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tokens Tab */}
          {activeTab === "tokens" && (
            <div className={`${cardClass} p-6`}>
              <p className={`${labelClass} mb-4`}>Token Management ({MOCK_TOKENS.length} tokens)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                      {["Token", "Creator", "Supply", "Status", "Created", "Actions"].map(h => (
                        <th key={h} className={`text-left pb-3 font-bold text-xs uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-4`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_TOKENS.map(token => (
                      <tr key={token.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                        <td className="py-3 pr-4">
                          <p className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>{token.name}</p>
                          <p className={`text-xs font-bold ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{token.symbol}</p>
                        </td>
                        <td className={`py-3 pr-4 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{token.creator}</td>
                        <td className={`py-3 pr-4 font-bold ${isDark ? 'text-white' : 'text-black'}`}>{token.supply}</td>
                        <td className="py-3 pr-4"><span className={statusBadge(token.status)}>{token.status}</span></td>
                        <td className={`py-3 pr-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{token.created}</td>
                        <td className="py-3">
                          <Button size="sm" onClick={() => toast.info(`Viewing ${token.name} details`)} className={`rounded-lg px-3 py-1 text-xs font-bold ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
