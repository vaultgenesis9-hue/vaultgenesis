import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
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
  Menu, ChevronLeft, Edit2, Trash2, Plus, Activity, Clock, Filter, Key, Copy, RotateCcw,
  UserCog, Lock, UserPlus, Wallet,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "overview" | "users" | "transactions" | "tokens" | "presale" | "staking" | "bots" | "api-tokens" | "admin-accounts" | "wallets" | "settings";

interface UserRow {
  id: number; name: string; wallet: string; email: string;
  role: "user" | "admin"; joined: string; status: "active" | "banned";
  totalTrades: number; volume: string; lastActive: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string | number | Date): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Sidebar Items ────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
  { id: "transactions", label: "Transactions", icon: <ArrowLeftRight className="w-4 h-4" /> },
  { id: "tokens", label: "Tokens", icon: <Coins className="w-4 h-4" /> },
  { id: "presale", label: "Presale", icon: <Rocket className="w-4 h-4" /> },
  { id: "staking", label: "Staking Pools", icon: <Layers className="w-4 h-4" /> },
  { id: "bots", label: "Bots", icon: <Bot className="w-4 h-4" /> },
  { id: "api-tokens", label: "API Tokens", icon: <Key className="w-4 h-4" /> },
  { id: "admin-accounts", label: "Admin Accounts", icon: <UserCog className="w-4 h-4" /> },
  { id: "wallets", label: "Deposit Wallets", icon: <Wallet className="w-4 h-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Admin() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [, navigate] = useLocation();

  // ─── Route Guard ───────────────────────────────────────────────────────────
  const { data: adminSession, isLoading: sessionLoading } = trpc.adminAuth.me.useQuery();

  useEffect(() => {
    if (!sessionLoading && !adminSession) {
      navigate("/admin/login");
    }
  }, [adminSession, sessionLoading, navigate]);

  // Users state — real DB data
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const { data: dbUsers, isLoading: usersLoading, refetch: refetchUsers } = trpc.users.list.useQuery();

  const banMut = trpc.users.setBanned.useMutation({
    onSuccess: (_, vars) => {
      const name = dbUsers?.find(u => u.id === vars.userId)?.name ?? 'User';
      toast.success(`${name} ${vars.banned ? 'banned' : 'unbanned'}`);
      refetchUsers();
    },
    onError: (e) => toast.error(e.message),
  });

  const roleMut = trpc.users.setRole.useMutation({
    onSuccess: (_, vars) => {
      const name = dbUsers?.find(u => u.id === vars.userId)?.name ?? 'User';
      toast.success(`${name} is now ${vars.role}`);
      refetchUsers();
    },
    onError: (e) => toast.error(e.message),
  });

  // Map DB users to UserRow shape for the UI
  const users: UserRow[] = useMemo(() => (dbUsers ?? []).map(u => ({
    id: u.id,
    name: u.name ?? 'Unknown',
    wallet: u.walletAddress ?? '—',
    email: u.email ?? '—',
    role: u.role as 'user' | 'admin',
    joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: u.loginMethod === 'banned' ? 'banned' : 'active',
    totalTrades: 0,
    volume: '—',
    lastActive: new Date(u.lastSignedIn).toLocaleDateString(),
  })), [dbUsers]);

  // Overview stats — real DB data, no mock/demo numbers
  const { data: overviewStats, isLoading: overviewLoading } = trpc.adminStats.overview.useQuery();

  // Tokens state — real DB data (populated when Token Creator persists a deploy)
  const [tokenSearch, setTokenSearch] = useState("");
  const { data: dbTokens, isLoading: tokensLoading } = trpc.tokens.listAll.useQuery();
  const tokens = useMemo(() => (dbTokens ?? []).map(t => ({
    id: t.id,
    name: t.name,
    symbol: t.symbol,
    creator: `User #${t.creatorId}`,
    supply: Number(t.initialSupply).toLocaleString(),
    status: t.status,
    created: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    contractAddress: t.contractAddress ?? '',
  })), [dbTokens]);

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

  // Password change state
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdChangeDismissed, setPwdChangeDismissed] = useState(() => {
    try { return localStorage.getItem('vg_admin_pwd_dismissed') === '1'; } catch { return false; }
  });

  const changePasswordMut = trpc.adminAuth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setShowPwdForm(false);
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setPwdChangeDismissed(true);
      try { localStorage.setItem('vg_admin_pwd_dismissed', '1'); } catch {}
    },
    onError: (e) => toast.error(e.message || "Failed to change password"),
  });

  // ─── Derived ───────────────────────────────────────────────────────────────

  const filteredUsers = useMemo(() => users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.wallet.toLowerCase().includes(userSearch.toLowerCase())
  ), [users, userSearch]);

  const filteredTokens = useMemo(() => tokens.filter(t =>
    t.name.toLowerCase().includes(tokenSearch.toLowerCase()) ||
    t.symbol.toLowerCase().includes(tokenSearch.toLowerCase())
  ), [tokens, tokenSearch]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleBanUser = (id: number) => {
    const user = users.find(u => u.id === id);
    const shouldBan = user?.status !== 'banned';
    banMut.mutate({ userId: id, banned: shouldBan });
  };

  const handleRoleChange = (id: number) => {
    const user = users.find(u => u.id === id);
    const next: 'user' | 'admin' = user?.role === 'admin' ? 'user' : 'admin';
    roleMut.mutate({ userId: id, role: next });
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
            {SIDEBAR_ITEMS.map(item => {
              // Only the Users badge reflects a real, live count — no other tab has real
              // per-item counts worth showing yet.
              const badge = item.id === "users" ? users.length : undefined;
              return (
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
                    {!!badge && (
                      <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full ${isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'}`}>
                        {badge}
                      </span>
                    )}
                  </>
                )}
                {activeTab === item.id && (
                  <span className={`absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-l ${isDark ? 'bg-white' : 'bg-black'}`} />
                )}
              </button>
              );
            })}
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
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Platform health at a glance — live data from the database</p>
              </div>

              {/* Stats — real counts only */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: overviewStats?.totalUsers ?? 0, icon: <Users className="w-5 h-5" />, color: "text-blue-400", note: null as string | null },
                  { label: "Total Volume", value: "$0", icon: <DollarSign className="w-5 h-5" />, color: "text-green-400", note: "Not tracked yet" },
                  { label: "Tokens Created", value: overviewStats?.tokensCreated ?? 0, icon: <Coins className="w-5 h-5" />, color: "text-purple-400", note: null },
                  { label: "Active Bots", value: overviewStats?.activeBots ?? 0, icon: <Bot className="w-5 h-5" />, color: "text-orange-400", note: "Bot trading not built yet" },
                ].map(stat => (
                  <div key={stat.label} className={`${cardClass} p-4`}>
                    <div className={`mb-2 ${stat.color}`}>{stat.icon}</div>
                    <p className={`${labelClass} mb-1`}>{stat.label}</p>
                    <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>
                      {overviewLoading ? '—' : stat.value.toLocaleString()}
                    </p>
                    {stat.note && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.note}</p>}
                  </div>
                ))}
              </div>

              {/* Charts — real signups/token creations, bucketed by day */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`${cardClass} p-5`}>
                  <p className={`${labelClass} mb-4`}>7-Day New Users</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={overviewStats?.dailyChart ?? []}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} axisLine={false} tickLine={false} />
                      <YAxis hide allowDecimals={false} />
                      <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "New Users"]} />
                      <Line dataKey="users" stroke={isDark ? '#ffffff' : '#000000'} strokeWidth={2} dot={{ r: 3, fill: isDark ? '#fff' : '#000' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className={`${cardClass} p-5`}>
                  <p className={`${labelClass} mb-4`}>7-Day Tokens Created</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={overviewStats?.dailyChart ?? []} barSize={20}>
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#666' : '#999' }} axisLine={false} tickLine={false} />
                      <YAxis hide allowDecimals={false} />
                      <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "Tokens"]} />
                      <Bar dataKey="tokens" fill={isDark ? '#ffffff' : '#000000'} radius={[4, 4, 0, 0]} opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Presale Progress + Recently Created Tokens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`${cardClass} p-5`}>
                  <p className={`${labelClass} mb-4`}>Presale Progress</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    No presale is configured yet — this section was previously showing made-up numbers and has been cleared until presale/investing is actually built.
                  </p>
                </div>

                <div className={`${cardClass} p-5`}>
                  <p className={`${labelClass} mb-4`}>Recently Created Tokens</p>
                  {overviewStats?.recentTokens && overviewStats.recentTokens.length > 0 ? (
                    <div className="space-y-2">
                      {overviewStats.recentTokens.map((t) => (
                        <div key={t.id} className={`flex items-center gap-3 py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>{t.symbol[0]}</div>
                          <div className="flex-1">
                            <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>{t.symbol}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{t.name}</p>
                          </div>
                          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{timeAgo(t.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      No tokens created yet — the Token Creator deploys real contracts on-chain but doesn't currently save a record here.
                    </p>
                  )}
                </div>
              </div>

              {/* Recent Activity — real user signups */}
              <div className={`${cardClass} p-5`}>
                <p className={`${labelClass} mb-4`}>Recent Activity</p>
                {overviewStats?.recentUsers && overviewStats.recentUsers.length > 0 ? (
                  <div className="space-y-2">
                    {overviewStats.recentUsers.map((u) => (
                      <div key={u.id} className={`flex items-center gap-3 py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                        <span className="text-blue-400"><Users className="w-3 h-3" /></span>
                        <div className="flex-1">
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>New user registered</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{u.email ?? u.name ?? 'Unknown'}</p>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{timeAgo(u.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No recent activity.</p>
                )}
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

                {usersLoading && (
                  <div className={`text-center py-8 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                    Loading users from database...
                  </div>
                )}

                {!usersLoading && filteredUsers.length === 0 && (
                  <div className={`text-center py-8 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Users className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    No users found. Users appear here once they sign in.
                  </div>
                )}

                {!usersLoading && filteredUsers.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                        {["User", "Wallet", "Role", "Joined", "Last Active", "Status", "Actions"].map(h => (
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
                          <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{user.joined}</td>
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
                )}
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
              <div>
                <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Transactions</h1>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No real transaction flow exists yet.</p>
              </div>
              <div className={`${cardClass} p-10 text-center`}>
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>No Transactions Tracked Yet</p>
                <p className={`text-xs mt-1 max-w-sm mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  This was previously showing invented sample data. Buying, selling, staking and presale contributions
                  aren't wired to real backend logic yet (see the Staking Pools and Presale tabs), so there's nothing
                  real to list here until those are built.
                </p>
              </div>
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

                {tokensLoading ? (
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Loading…</p>
                ) : filteredTokens.length === 0 ? (
                  <div className="py-10 text-center">
                    <Coins className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>No Tokens Created Yet</p>
                    <p className={`text-xs mt-1 max-w-sm mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Token Creator deploys a real ERC20 contract on-chain — once someone deploys one while signed in, it'll show up here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                          {["Token", "Creator", "Supply", "Status", "Created", "Contract"].map(h => (
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
                            <td className="py-3 pr-3"><span className={statusBadge(token.status)}>{token.status}</span></td>
                            <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{token.created}</td>
                            <td className="py-3 pr-3 font-mono text-xs">
                              {token.contractAddress ? (
                                <a
                                  href={`https://etherscan.io/address/${token.contractAddress}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className={`underline ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                                >
                                  {token.contractAddress.slice(0, 6)}…{token.contractAddress.slice(-4)}
                                </a>
                              ) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Staking isn't wired to real fund movement yet.</p>
              </div>
              <div className={`${cardClass} p-10 text-center`}>
                <Layers className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>No Real Staking Pools Yet</p>
                <p className={`text-xs mt-1 max-w-sm mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  This was previously showing invented pool numbers with working-looking Edit/Enable buttons that didn't
                  actually save anywhere. The public Staking page is the same — a demo, not connected to real funds. This
                  needs a real decision on custody and fund handling before it's worth building pool management here —
                  flagged separately for you to weigh in on.
                </p>
              </div>
            </div>
          )}

          {/* ── BOTS (DISABLED) ── */}
          {activeTab === "bots" && (
            <div className="space-y-4">
              <div>
                <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Bots</h1>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Bot trading is currently disabled.</p>
              </div>
              <div className={`${cardClass} p-10 text-center`}>
                <Bot className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>Bot Trading Disabled</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>This feature has been temporarily deactivated and will return in a future update.</p>
              </div>
            </div>
          )}

          {/* ── ADMIN ACCOUNTS ── */}
          {activeTab === "admin-accounts" && (
            <AdminAccountsTab isDark={isDark} cardClass={cardClass} labelClass={labelClass} actionBtn={actionBtn} inputClass={inputClass} />
          )}

          {/* ── DEPOSIT WALLETS ── */}
          {activeTab === "wallets" && (
            <DepositWalletsTab isDark={isDark} cardClass={cardClass} labelClass={labelClass} actionBtn={actionBtn} inputClass={inputClass} />
          )}

          {/* ── API TOKENS ── */}
          {activeTab === "api-tokens" && (
            <ApiTokensTab isDark={isDark} cardClass={cardClass} labelClass={labelClass} actionBtn={actionBtn} inputClass={inputClass} />
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

              {/* Default Password Warning Banner */}
              {!pwdChangeDismissed && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-yellow-700/40 bg-yellow-900/10">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-yellow-400">Security: Change your default admin password</p>
                    <p className="text-xs text-yellow-400/70 mt-0.5">You are using the default password. Change it immediately to secure your admin account.</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setShowPwdForm(true); setActiveTab('settings'); }}
                      className="text-xs font-bold text-yellow-400 underline hover:text-yellow-300"
                    >
                      Change Now
                    </button>
                    <button
                      onClick={() => { setPwdChangeDismissed(true); try { localStorage.setItem('vg_admin_pwd_dismissed', '1'); } catch {} }}
                      className="text-yellow-400/50 hover:text-yellow-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Change Password Card */}
              <div className={`${cardClass} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'}`}>Admin Password</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Change your admin account password</p>
                  </div>
                  <button
                    onClick={() => setShowPwdForm(v => !v)}
                    className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}
                  >
                    <Lock className="w-3 h-3" />
                    {showPwdForm ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
                {showPwdForm && (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (newPwd !== confirmPwd) { toast.error('New passwords do not match'); return; }
                      if (newPwd.length < 8) { toast.error('Password must be at least 8 characters'); return; }
                      changePasswordMut.mutate({ currentPassword: currentPwd, newPassword: newPwd });
                    }}
                    className="space-y-3 mt-2 pt-3 border-t border-inherit"
                  >
                    <div>
                      <label className={`${labelClass} mb-1.5 block`}>Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPwd ? 'text' : 'password'}
                          value={currentPwd}
                          onChange={e => setCurrentPwd(e.target.value)}
                          className={`${inputClass} pr-10`}
                          placeholder="Enter current password"
                          required
                        />
                        <button type="button" onClick={() => setShowCurrentPwd(v => !v)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {showCurrentPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`${labelClass} mb-1.5 block`}>New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPwd ? 'text' : 'password'}
                          value={newPwd}
                          onChange={e => setNewPwd(e.target.value)}
                          className={`${inputClass} pr-10`}
                          placeholder="Min 8 characters"
                          required
                          minLength={8}
                        />
                        <button type="button" onClick={() => setShowNewPwd(v => !v)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {showNewPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={`${labelClass} mb-1.5 block`}>Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        className={inputClass}
                        placeholder="Repeat new password"
                        required
                      />
                    </div>
                    <Button type="submit" size="sm" className={actionBtn('green')} disabled={changePasswordMut.isPending}>
                      {changePasswordMut.isPending ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                      {changePasswordMut.isPending ? 'Saving...' : 'Save New Password'}
                    </Button>
                  </form>
                )}
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

// ─── API Tokens Tab ───────────────────────────────────────────────────────────

interface ApiTokensTabProps {
  isDark: boolean;
  cardClass: string;
  labelClass: string;
  actionBtn: (variant: "ghost" | "red" | "green" | "yellow") => string;
  inputClass: string;
}

function ApiTokensTab({ isDark, cardClass, labelClass, actionBtn, inputClass }: ApiTokensTabProps) {
  const [search, setSearch] = useState("");
  const [showRevoked, setShowRevoked] = useState(false);
  const [visibleTokens, setVisibleTokens] = useState<Record<number, boolean>>({});

  // Real tRPC queries
  const { data: tokenRows, isLoading, refetch } = trpc.apiTokens.listAll.useQuery();
  const generateMut = trpc.apiTokens.generateForUser.useMutation({
    onSuccess: () => { toast.success("New token generated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const revokeMut = trpc.apiTokens.revoke.useMutation({
    onSuccess: () => { toast.success("Token revoked"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const rows = tokenRows ?? [];
  const filtered = rows.filter(r => {
    if (!showRevoked && r.isRevoked) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.userName?.toLowerCase().includes(q) ||
      r.userEmail?.toLowerCase().includes(q) ||
      r.walletAddress?.toLowerCase().includes(q) ||
      r.token.toLowerCase().includes(q)
    );
  });

  const maskToken = (token: string) =>
    token.slice(0, 10) + "••••••••••••••••••••••••••••••••" + token.slice(-6);

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>API Tokens</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>View and manage user access tokens</p>
        </div>
        <div className="flex gap-2 items-center">
          <label className={`flex items-center gap-2 text-xs cursor-pointer ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <input
              type="checkbox"
              checked={showRevoked}
              onChange={e => setShowRevoked(e.target.checked)}
              className="rounded"
            />
            Show revoked
          </label>
          <Button onClick={() => refetch()} size="sm" className={actionBtn("ghost")}>
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Tokens", value: rows.length, color: isDark ? 'text-white' : 'text-black' },
          { label: "Active", value: rows.filter(r => !r.isRevoked).length, color: "text-green-400" },
          { label: "Revoked", value: rows.filter(r => r.isRevoked).length, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className={`${cardClass} p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className={`text-xs mt-1 uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={`${cardClass} p-5`}>
        <div className="relative mb-4">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, email, wallet, or token..."
            className={`${inputClass} pl-9`}
          />
        </div>

        {isLoading ? (
          <div className={`text-center py-12 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            Loading tokens...
          </div>
        ) : filtered.length === 0 ? (
          <div className={`text-center py-12 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Key className="w-8 h-8 mx-auto mb-2 opacity-30" />
            {rows.length === 0
              ? "No API tokens found. Tokens are generated when users log in or request one."
              : "No tokens match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  {["User", "Token", "Label", "Status", "Created", "Last Used", "Actions"].map(h => (
                    <th key={h} className={`text-left pb-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-3`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'} ${row.isRevoked ? 'opacity-50' : ''}`}>
                    <td className="py-3 pr-3 min-w-[140px]">
                      <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-black'}`}>{row.userName ?? "Unknown"}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{row.userEmail ?? "—"}</p>
                      {row.walletAddress && (
                        <p className={`font-mono text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                          {row.walletAddress.slice(0, 8)}...{row.walletAddress.slice(-4)}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-3 min-w-[200px]">
                      <div className="flex items-center gap-1">
                        <span className={`font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {visibleTokens[row.id] ? row.token : maskToken(row.token)}
                        </span>
                        <button
                          onClick={() => setVisibleTokens(v => ({ ...v, [row.id]: !v[row.id] }))}
                          className={`ml-1 ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                          title={visibleTokens[row.id] ? "Hide" : "Show"}
                        >
                          {visibleTokens[row.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => copyToken(row.token)}
                          className={`${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                          title="Copy token"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.label}</td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        row.isRevoked
                          ? 'bg-red-900/30 text-red-400 border border-red-700/30'
                          : 'bg-green-900/30 text-green-400 border border-green-700/30'
                      }`}>
                        {row.isRevoked ? "Revoked" : "Active"}
                      </span>
                    </td>
                    <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {row.lastUsedAt ? new Date(row.lastUsedAt).toLocaleDateString() : "Never"}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Button
                          onClick={() => generateMut.mutate({ userId: row.userId, label: row.label })}
                          size="sm"
                          className={actionBtn("ghost")}
                          title="Regenerate token"
                          disabled={generateMut.isPending}
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        {!row.isRevoked && (
                          <Button
                            onClick={() => revokeMut.mutate({ tokenId: row.id })}
                            size="sm"
                            className={actionBtn("red")}
                            title="Revoke token"
                            disabled={revokeMut.isPending}
                          >
                            <Ban className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${isDark ? 'border-blue-700/30 bg-blue-900/10' : 'border-blue-300 bg-blue-50'}`}>
        <Key className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <div>
          <p className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>About API Tokens</p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Each user has one active API token at a time. Tokens are generated automatically when a user first authenticates.
            Use <strong>Regenerate</strong> to issue a new token (this invalidates the old one), or <strong>Revoke</strong> to permanently disable access.
            Tokens are prefixed with <code className="font-mono">vg_</code> and are 68 characters long.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Accounts Tab ───────────────────────────────────────────────────────

interface AdminAccountsTabProps {
  isDark: boolean;
  cardClass: string;
  labelClass: string;
  actionBtn: (variant: "ghost" | "red" | "green" | "yellow") => string;
  inputClass: string;
}

function AdminAccountsTab({ isDark, cardClass, labelClass, actionBtn, inputClass }: AdminAccountsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: admins, isLoading, refetch } = trpc.adminAccounts.list.useQuery();

  const createMut = trpc.adminAccounts.create.useMutation({
    onSuccess: () => {
      toast.success('Admin account created successfully');
      setShowCreateModal(false);
      setForm({ name: '', email: '', username: '', password: '', confirmPassword: '' });
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMut = trpc.adminAccounts.toggleActive.useMutation({
    onSuccess: (_, vars) => {
      toast.success(vars.isActive === 1 ? 'Account enabled' : 'Account disabled');
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.includes('@')) errs.email = 'Enter a valid email address';
    if (!/^[a-zA-Z0-9_]{3,32}$/.test(form.username)) errs.username = 'Username: 3-32 chars, letters/numbers/underscores only';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    createMut.mutate({ name: form.name, email: form.email, username: form.username, password: form.password });
  };

  const rows = admins ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Admin Accounts</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Manage admin access to the platform</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} size="sm" className={actionBtn("ghost")}>
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)} size="sm" className={actionBtn("green")}>
            <UserPlus className="w-3 h-3 mr-1" /> Create Admin
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Admins", value: rows.length, color: isDark ? 'text-white' : 'text-black' },
          { label: "Active", value: rows.filter(r => r.isActive === 1).length, color: "text-green-400" },
          { label: "Disabled", value: rows.filter(r => r.isActive === 0).length, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className={`${cardClass} p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className={`text-xs mt-1 uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={`${cardClass} p-5`}>
        {isLoading ? (
          <div className={`text-center py-12 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            Loading admin accounts...
          </div>
        ) : rows.length === 0 ? (
          <div className={`text-center py-12 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <UserCog className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No admin accounts created yet. Click "Create Admin" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  {["Admin", "Username", "Status", "Created", "Last Login", "Actions"].map(h => (
                    <th key={h} className={`text-left pb-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-3`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'} ${row.isActive === 0 ? 'opacity-50' : ''}`}>
                    <td className="py-3 pr-3 min-w-[140px]">
                      <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-black'}`}>{row.name ?? 'Unknown'}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{row.email ?? '—'}</p>
                    </td>
                    <td className={`py-3 pr-3 font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      @{row.username}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        row.isActive === 1
                          ? 'bg-green-900/30 text-green-400 border border-green-700/30'
                          : 'bg-red-900/30 text-red-400 border border-red-700/30'
                      }`}>
                        {row.isActive === 1 ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3">
                      <Button
                        onClick={() => toggleMut.mutate({ credId: row.id, isActive: row.isActive === 1 ? 0 : 1 })}
                        size="sm"
                        className={actionBtn(row.isActive === 1 ? "red" : "green")}
                        disabled={toggleMut.isPending}
                        title={row.isActive === 1 ? 'Disable account' : 'Enable account'}
                      >
                        {row.isActive === 1 ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${cardClass} p-6 w-full max-w-md relative`}>
            <button
              onClick={() => { setShowCreateModal(false); setFormErrors({}); }}
              className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <UserCog className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
              <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Create Admin Account</h2>
            </div>

            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. John Smith"
                  className={inputClass}
                />
                {formErrors.name && <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
                <input
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@example.com"
                  type="email"
                  className={inputClass}
                />
                {formErrors.email && <p className="text-xs text-red-400 mt-1">{formErrors.email}</p>}
              </div>

              {/* Username */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Username</label>
                <input
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="admin_username"
                  className={inputClass}
                />
                {formErrors.username && <p className="text-xs text-red-400 mt-1">{formErrors.username}</p>}
              </div>

              {/* Password */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Password</label>
                <div className="relative">
                  <input
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Min. 8 characters"
                    type={showPassword ? 'text' : 'password'}
                    className={`${inputClass} pr-9`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-xs text-red-400 mt-1">{formErrors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Confirm Password</label>
                <input
                  value={form.confirmPassword}
                  onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Re-enter password"
                  type={showPassword ? 'text' : 'password'}
                  className={inputClass}
                />
                {formErrors.confirmPassword && <p className="text-xs text-red-400 mt-1">{formErrors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Button
                onClick={() => { setShowCreateModal(false); setFormErrors({}); }}
                size="sm"
                className={`flex-1 ${actionBtn("ghost")}`}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                size="sm"
                className={`flex-1 ${actionBtn("green")}`}
                disabled={createMut.isPending}
              >
                {createMut.isPending ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Lock className="w-3 h-3 mr-1" />
                )}
                Create Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Deposit Wallets Tab ────────────────────────────────────────────────────

interface DepositWalletsTabProps {
  isDark: boolean;
  cardClass: string;
  labelClass: string;
  actionBtn: (variant: "ghost" | "red" | "green" | "yellow") => string;
  inputClass: string;
}

const NETWORK_OPTIONS = ["ethereum", "bsc", "polygon", "bitcoin", "tron", "solana", "other"];

function DepositWalletsTab({ isDark, cardClass, labelClass, actionBtn, inputClass }: DepositWalletsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({ label: "", network: "ethereum", address: "", notes: "" });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: wallets, isLoading, refetch } = trpc.depositWallets.list.useQuery();

  const createMut = trpc.depositWallets.create.useMutation({
    onSuccess: () => {
      toast.success("Wallet added");
      closeModal();
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMut = trpc.depositWallets.update.useMutation({
    onSuccess: () => {
      toast.success("Wallet updated");
      closeModal();
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const setActiveMut = trpc.depositWallets.setActive.useMutation({
    onSuccess: (_, vars) => {
      toast.success(vars.isActive ? "Wallet activated" : "Wallet retired");
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.depositWallets.delete.useMutation({
    onSuccess: () => {
      toast.success("Wallet removed");
      setDeleteConfirm(null);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({ label: "", network: "ethereum", address: "", notes: "" });
    setFormErrors({});
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ label: "", network: "ethereum", address: "", notes: "" });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (row: NonNullable<typeof wallets>[number]) => {
    setEditingId(row.id);
    setForm({ label: row.label, network: row.network, address: row.address, notes: row.notes ?? "" });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.label.trim()) errs.label = "Give this wallet a label";
    if (!form.network.trim()) errs.network = "Pick a network";
    if (!form.address.trim() || form.address.trim().length < 8) errs.address = "Enter a valid public wallet address";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = { label: form.label.trim(), network: form.network, address: form.address.trim(), notes: form.notes.trim() || undefined };
    if (editingId != null) {
      updateMut.mutate({ id: editingId, ...payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied");
  };

  const rows = wallets ?? [];
  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className={`text-3xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>Deposit Wallets</h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            The public addresses people send funds to when staking, contributing to presale, or depositing. Add, replace or retire wallets here — no code change needed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} size="sm" className={actionBtn("ghost")}>
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
          <Button onClick={openCreate} size="sm" className={actionBtn("green")}>
            <Plus className="w-3 h-3 mr-1" /> Add Wallet
          </Button>
        </div>
      </div>

      <div className={`${cardClass} p-4 flex items-start gap-2`}>
        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Only ever enter a <strong>public wallet address</strong> here — never a private key or seed phrase. Only one wallet per network should normally be marked Active at a time; retire the old one before activating a new one.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Wallets", value: rows.length, color: isDark ? 'text-white' : 'text-black' },
          { label: "Active", value: rows.filter(r => r.isActive === 1).length, color: "text-green-400" },
          { label: "Retired", value: rows.filter(r => r.isActive === 0).length, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className={`${cardClass} p-4 text-center`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className={`text-xs mt-1 uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className={`${cardClass} p-5`}>
        {isLoading ? (
          <div className={`text-center py-12 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
            Loading wallets...
          </div>
        ) : rows.length === 0 ? (
          <div className={`text-center py-12 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No deposit wallets yet. Click "Add Wallet" to add the first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  {["Label", "Network", "Address", "Status", "Added", "Actions"].map(h => (
                    <th key={h} className={`text-left pb-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'} pr-3`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className={`border-b last:border-0 ${isDark ? 'border-white/5' : 'border-black/5'} ${row.isActive === 0 ? 'opacity-50' : ''}`}>
                    <td className="py-3 pr-3 min-w-[120px]">
                      <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-black'}`}>{row.label}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${isDark ? 'bg-white/10 text-gray-300' : 'bg-black/5 text-gray-700'}`}>
                        {row.network}
                      </span>
                    </td>
                    <td className={`py-3 pr-3 font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div className="flex items-center gap-1.5">
                        <span>{row.address.length > 18 ? `${row.address.slice(0, 8)}...${row.address.slice(-6)}` : row.address}</span>
                        <button onClick={() => copyAddress(row.address)} className={isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'} title="Copy address">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                        row.isActive === 1
                          ? 'bg-green-900/30 text-green-400 border border-green-700/30'
                          : 'bg-red-900/30 text-red-400 border border-red-700/30'
                      }`}>
                        {row.isActive === 1 ? 'Active' : 'Retired'}
                      </span>
                    </td>
                    <td className={`py-3 pr-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          onClick={() => openEdit(row)}
                          size="sm"
                          className={actionBtn("ghost")}
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => setActiveMut.mutate({ id: row.id, isActive: row.isActive !== 1 })}
                          size="sm"
                          className={actionBtn(row.isActive === 1 ? "red" : "green")}
                          disabled={setActiveMut.isPending}
                          title={row.isActive === 1 ? 'Retire wallet' : 'Activate wallet'}
                        >
                          {row.isActive === 1 ? <Ban className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirm(row.id)}
                          size="sm"
                          className={actionBtn("red")}
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${cardClass} p-6 w-full max-w-md relative`}>
            <button
              onClick={closeModal}
              className={`absolute top-4 right-4 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-5">
              <Wallet className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
              <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
                {editingId != null ? 'Edit Wallet' : 'Add Deposit Wallet'}
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Label</label>
                <input
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Main ETH Treasury"
                  className={inputClass}
                />
                {formErrors.label && <p className="text-xs text-red-400 mt-1">{formErrors.label}</p>}
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Network</label>
                <select
                  value={form.network}
                  onChange={e => setForm(f => ({ ...f, network: e.target.value }))}
                  className={inputClass}
                >
                  {NETWORK_OPTIONS.map(n => (
                    <option key={n} value={n}>{n.charAt(0).toUpperCase() + n.slice(1)}</option>
                  ))}
                </select>
                {formErrors.network && <p className="text-xs text-red-400 mt-1">{formErrors.network}</p>}
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Public Address</label>
                <input
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="0x... (public address only, never a private key)"
                  className={`${inputClass} font-mono`}
                />
                {formErrors.address && <p className="text-xs text-red-400 mt-1">{formErrors.address}</p>}
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Internal notes — not shown to users"
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Button onClick={closeModal} size="sm" className={`flex-1 ${actionBtn("ghost")}`}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                className={`flex-1 ${actionBtn("green")}`}
                disabled={saving}
              >
                {saving ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Wallet className="w-3 h-3 mr-1" />}
                {editingId != null ? 'Save Changes' : 'Add Wallet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`${cardClass} p-6 w-full max-w-sm relative`}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h2 className={`text-lg font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Delete Wallet?</h2>
            </div>
            <p className={`text-xs mb-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              This permanently removes the wallet record. This can't be undone.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setDeleteConfirm(null)} size="sm" className={`flex-1 ${actionBtn("ghost")}`}>
                Cancel
              </Button>
              <Button
                onClick={() => deleteMut.mutate({ id: deleteConfirm })}
                size="sm"
                className={`flex-1 ${actionBtn("red")}`}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
