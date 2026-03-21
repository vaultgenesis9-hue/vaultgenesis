import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import {
  Coins,
  TrendingUp,
  Bot,
  Wallet,
  ChevronRight,
  Loader2,
  Plus,
  BarChart3,
  Layers,
  User,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Use useAuth for reliable auth state with proper loading handling
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Redirect to home if not authenticated after auth check completes
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const { data: overview, isLoading, error } = trpc.dashboard.overview.useQuery(
    undefined,
    // Only fetch when user is authenticated to avoid 401 errors
    { enabled: isAuthenticated }
  );

  const displayName = user?.name || user?.username || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const cardBase = isDark
    ? "bg-white/5 border border-white/10 hover:border-white/20"
    : "bg-white border border-gray-200 hover:border-gray-300";

  const textMuted = isDark ? "text-gray-400" : "text-gray-500";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const bgPage = isDark ? "bg-black" : "bg-[#fafaf8]";

  const quickLinks = [
    {
      label: "Token Creator",
      desc: "Launch your own token",
      icon: <Coins size={22} />,
      href: "/token-creator",
      color: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-400",
    },
    {
      label: "Presale",
      desc: "Participate in presales",
      icon: <Layers size={22} />,
      href: "/presale",
      color: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-400",
    },
    {
      label: "Staking",
      desc: "Earn rewards by staking",
      icon: <TrendingUp size={22} />,
      href: "/staking",
      color: "from-green-500/20 to-green-600/5",
      iconColor: "text-green-400",
    },
    {
      label: "Wallet",
      desc: "Manage your assets",
      icon: <Wallet size={22} />,
      href: "/wallet",
      color: "from-orange-500/20 to-orange-600/5",
      iconColor: "text-orange-400",
    },
    {
      label: "Bot Trading",
      desc: "Automate your trades",
      icon: <Bot size={22} />,
      href: "/bot-trading",
      color: "from-pink-500/20 to-pink-600/5",
      iconColor: "text-pink-400",
    },
    {
      label: "My Profile",
      desc: "Update your details",
      icon: <User size={22} />,
      href: "/profile",
      color: "from-gray-500/20 to-gray-600/5",
      iconColor: "text-gray-400",
    },
  ];

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Show loading spinner while auth state is being determined
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgPage}`}>
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  // If not authenticated, the useEffect above will redirect to home
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgPage}`}>
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 pb-16 px-4 ${bgPage}`}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${
            isDark ? "bg-white/10 text-white" : "bg-black/10 text-black"
          }`}>
            {initials}
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${textPrimary}`}>
              Welcome back, {displayName}
            </h1>
            <p className={`text-sm ${textMuted}`}>
              {user?.email && <span>{user.email}</span>}
              {user?.walletAddress && (
                <span className="ml-3 font-mono">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </span>
              )}
              {user?.loginMethod === 'email' && (
                user?.emailVerified ? (
                  <span className="ml-3 inline-flex items-center gap-1 text-green-400 text-xs">
                    <ShieldCheck size={12} /> Verified
                  </span>
                ) : (
                  <span className="ml-3 inline-flex items-center gap-1 text-yellow-400 text-xs">
                    <AlertCircle size={12} /> Email not verified
                  </span>
                )
              )}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className={`animate-spin ${textMuted}`} size={32} />
          </div>
        ) : error ? (
          <div className={`rounded-2xl p-6 mb-8 ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
            <p className="text-red-400 text-sm">Failed to load dashboard data. Please refresh.</p>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                {
                  label: "Tokens Created",
                  value: overview?.stats.tokenCount ?? 0,
                  icon: <Coins size={20} />,
                  color: "text-purple-400",
                  bg: isDark ? "bg-purple-500/10" : "bg-purple-50",
                  action: () => navigate("/token-creator"),
                },
                {
                  label: "Staking Positions",
                  value: overview?.stats.stakeCount ?? 0,
                  icon: <TrendingUp size={20} />,
                  color: "text-green-400",
                  bg: isDark ? "bg-green-500/10" : "bg-green-50",
                  action: () => navigate("/staking"),
                },
                {
                  label: "Bot Trades",
                  value: overview?.stats.tradeCount ?? 0,
                  icon: <BarChart3 size={20} />,
                  color: "text-pink-400",
                  bg: isDark ? "bg-pink-500/10" : "bg-pink-50",
                  action: () => navigate("/bot-trading"),
                },
              ].map((stat) => (
                <button
                  key={stat.label}
                  onClick={stat.action}
                  className={`rounded-2xl p-5 text-left transition-all ${cardBase} ${stat.bg} group`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`${stat.color}`}>{stat.icon}</span>
                    <ArrowUpRight size={16} className={`${textMuted} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${textPrimary}`}>{stat.value}</div>
                  <div className={`text-xs uppercase tracking-wider ${textMuted}`}>{stat.label}</div>
                </button>
              ))}
            </div>

            {/* Two-column: Recent Activity + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

              {/* Recent Tokens */}
              <div className={`rounded-2xl p-6 ${cardBase}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`font-bold text-sm uppercase tracking-wider ${textMuted}`}>My Tokens</h2>
                  <button
                    onClick={() => navigate("/token-creator")}
                    className={`flex items-center gap-1 text-xs ${textMuted} hover:text-white transition`}
                  >
                    <Plus size={13} /> Create
                  </button>
                </div>
                {!overview?.tokens.length ? (
                  <div className={`text-center py-8 ${textMuted}`}>
                    <Coins size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No tokens yet</p>
                    <button
                      onClick={() => navigate("/token-creator")}
                      className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition"
                    >
                      Create your first token →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overview.tokens.map((t) => (
                      <div key={t.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? "border-white/5" : "border-gray-100"}`}>
                        <div className="flex items-center gap-3">
                          {t.logoUrl ? (
                            <img src={t.logoUrl} alt={t.symbol} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isDark ? "bg-white/10" : "bg-gray-100"} ${textPrimary}`}>
                              {t.symbol.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <div className={`text-sm font-semibold ${textPrimary}`}>{t.name}</div>
                            <div className={`text-xs ${textMuted}`}>{t.symbol}</div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          t.status === "deployed"
                            ? "bg-green-500/20 text-green-400"
                            : t.status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Stakes */}
              <div className={`rounded-2xl p-6 ${cardBase}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`font-bold text-sm uppercase tracking-wider ${textMuted}`}>Staking Positions</h2>
                  <button
                    onClick={() => navigate("/staking")}
                    className={`flex items-center gap-1 text-xs ${textMuted} hover:text-white transition`}
                  >
                    <Plus size={13} /> Stake
                  </button>
                </div>
                {!overview?.stakes.length ? (
                  <div className={`text-center py-8 ${textMuted}`}>
                    <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No staking positions</p>
                    <button
                      onClick={() => navigate("/staking")}
                      className="mt-3 text-xs text-green-400 hover:text-green-300 transition"
                    >
                      Start staking →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overview.stakes.map((s) => (
                      <div key={s.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? "border-white/5" : "border-gray-100"}`}>
                        <div>
                          <div className={`text-sm font-semibold ${textPrimary}`}>{s.tokenSymbol}</div>
                          <div className={`text-xs ${textMuted}`}>{s.apy}% APY · {s.amount} staked</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-400">+{s.earnedRewards} earned</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            s.status === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
                          }`}>
                            {s.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Bot Trades */}
              <div className={`rounded-2xl p-6 ${cardBase}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`font-bold text-sm uppercase tracking-wider ${textMuted}`}>Recent Bot Trades</h2>
                  <button
                    onClick={() => navigate("/bot-trading")}
                    className={`flex items-center gap-1 text-xs ${textMuted} hover:text-white transition`}
                  >
                    <ChevronRight size={13} /> View all
                  </button>
                </div>
                {!overview?.trades.length ? (
                  <div className={`text-center py-8 ${textMuted}`}>
                    <Bot size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No bot trades yet</p>
                    <button
                      onClick={() => navigate("/bot-trading")}
                      className="mt-3 text-xs text-pink-400 hover:text-pink-300 transition"
                    >
                      Set up a bot →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overview.trades.map((t) => (
                      <div key={t.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? "border-white/5" : "border-gray-100"}`}>
                        <div>
                          <div className={`text-sm font-semibold ${textPrimary}`}>{t.pair}</div>
                          <div className={`text-xs ${textMuted}`}>{t.strategy} · {t.botName}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xs font-semibold ${t.side === "buy" ? "text-green-400" : "text-red-400"}`}>
                            {t.side.toUpperCase()} {t.amount}
                          </div>
                          <div className={`text-xs ${textMuted}`}>{formatDate(t.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Presale Contributions */}
              <div className={`rounded-2xl p-6 ${cardBase}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`font-bold text-sm uppercase tracking-wider ${textMuted}`}>Presale Contributions</h2>
                  <button
                    onClick={() => navigate("/presale")}
                    className={`flex items-center gap-1 text-xs ${textMuted} hover:text-white transition`}
                  >
                    <ChevronRight size={13} /> View all
                  </button>
                </div>
                {!overview?.contributions.length ? (
                  <div className={`text-center py-8 ${textMuted}`}>
                    <Layers size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No presale contributions</p>
                    <button
                      onClick={() => navigate("/presale")}
                      className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      Browse presales →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {overview.contributions.map((c) => (
                      <div key={c.id} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? "border-white/5" : "border-gray-100"}`}>
                        <div>
                          <div className={`text-sm font-semibold ${textPrimary}`}>${c.amount} contributed</div>
                          <div className={`text-xs ${textMuted} flex items-center gap-1`}>
                            <Clock size={10} /> {formatDate(c.createdAt)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-blue-400">{c.tokensReceived} tokens</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Quick Links Grid */}
        <div>
          <h2 className={`font-bold text-sm uppercase tracking-wider mb-4 ${textMuted}`}>Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className={`rounded-2xl p-4 text-left transition-all group ${cardBase} bg-gradient-to-br ${link.color}`}
              >
                <div className={`mb-3 ${link.iconColor}`}>{link.icon}</div>
                <div className={`text-xs font-bold ${textPrimary} mb-0.5`}>{link.label}</div>
                <div className={`text-xs ${textMuted} leading-tight`}>{link.desc}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
