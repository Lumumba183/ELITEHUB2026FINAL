import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  LayoutDashboard,
  UserCircle,
  MessageCircle,
  DollarSign,
  CreditCard,
  Settings,
  Star,
  TrendingUp,
  Eye,
  Mail,
  ArrowRight,
  Sparkles,
  LogOut,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// ─── Sidebar ─────────────────────────────────────────────────────────
function Sidebar({ role, onLogout }: { role: string; onLogout: () => void }) {
  const isCompanion = role === "companion";
  const isAdmin = role === "admin";

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard", href: "/dashboard" },
    { icon: <UserCircle className="w-5 h-5" />, label: "My Profile", href: "/profile" },
    { icon: <MessageCircle className="w-5 h-5" />, label: "Messages", href: "/messages" },
    { icon: <DollarSign className="w-5 h-5" />, label: isCompanion ? "Earnings" : "Wallet", href: "/wallet" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Settings", href: "/profile" },
    ...(isAdmin ? [{ icon: <Star className="w-5 h-5" />, label: "CEO Dashboard", href: "/admin" }] : []),
  ];

  return (
    <aside className="w-64 hidden lg:flex flex-col glass glass-border border-r-0 border-t-0 border-b-0 h-screen sticky top-0">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-bold text-gradient-crimson" style={{ fontFamily: "'Playfair Display', serif" }}>
            EliteHub
          </span>
          <div className="w-2 h-2 rounded-full bg-[#E11D48]" />
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href + item.label}
            to={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
              item.href === "/dashboard"
                ? "bg-[#E11D48]/10 text-[#E11D48] border-l-2 border-[#E11D48]"
                : "text-[#9CA3AF] hover:text-[#F5E6D3] hover:bg-white/5"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <div className="glass glass-border rounded-xl p-6 hover:border-[#E11D48]/10 transition-all">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-[#9CA3AF] mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#F5E6D3]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </p>
      {trend && (
        <p className="text-xs text-[#10B981] mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {trend}
        </p>
      )}
    </div>
  );
}

// ─── Companion Dashboard ─────────────────────────────────────────────
function CompanionDashboard() {
  const { data: stats } = trpc.user.getStats.useQuery();
  const { data: transactions } = trpc.payment.getTransactions.useQuery({ limit: 5 });

  // Mock chart data
  const chartData = [
    { day: "Mon", earnings: 120 },
    { day: "Tue", earnings: 185 },
    { day: "Wed", earnings: 95 },
    { day: "Thu", earnings: 240 },
    { day: "Fri", earnings: 310 },
    { day: "Sat", earnings: 450 },
    { day: "Sun", earnings: 380 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5E6D3] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Companion Dashboard
        </h1>
        <p className="text-sm text-[#9CA3AF]">Track your earnings, messages, and growth</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="relative overflow-visible">
          <StatCard
            title="Wallet Balance"
            value={`$${(stats?.walletBalance ?? 0).toFixed(2)}`}
            icon={<DollarSign className="w-5 h-5 text-white" />}
            color="bg-[#10B981]/20 text-[#10B981]"
            trend="+12.5%"
          />
          <div className="earnings-pulse absolute inset-0 rounded-xl pointer-events-none" />
        </div>
        <StatCard
          title="Monthly Earnings"
          value={`$${(stats?.monthlyEarnings ?? 0).toFixed(2)}`}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="bg-[#D4A574]/20 text-[#D4A574]"
          trend="+8.2%"
        />
        <StatCard
          title="Unread Messages"
          value={String(stats?.unreadMessages ?? 0)}
          icon={<Mail className="w-5 h-5 text-white" />}
          color="bg-[#E11D48]/20 text-[#E11D48]"
        />
        <StatCard
          title="Profile Views"
          value={String(stats?.profileViews ?? 0)}
          icon={<Eye className="w-5 h-5 text-white" />}
          color="bg-[#9CA3AF]/20 text-[#9CA3AF]"
        />
      </div>

      {/* Earnings Chart */}
      <div className="glass glass-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">7-Day Earnings</h3>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E11D48" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  background: "#14141E",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#F5E6D3",
                }}
                formatter={(value: number) => [`$${value}`, "Earnings"]}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#E11D48"
                strokeWidth={2}
                fill="url(#earningsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass glass-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F5E6D3]">Recent Transactions</h3>
          <Link to="/wallet" className="text-sm text-[#E11D48] hover:text-[#FB7185] flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-3">
          {transactions?.length === 0 && (
            <p className="text-sm text-[#9CA3AF] text-center py-6">No transactions yet</p>
          )}
          {transactions?.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  t.type === "gift" ? "bg-[#E11D48]/20 text-[#E11D48]" :
                  t.type === "withdrawal" ? "bg-[#EF4444]/20 text-[#EF4444]" :
                  "bg-[#10B981]/20 text-[#10B981]"
                }`}>
                  {t.type === "gift" ? "G" : t.type === "withdrawal" ? "W" : "T"}
                </div>
                <div>
                  <p className="text-sm text-[#F5E6D3] capitalize">{t.type.replace("_", " ")}</p>
                  <p className="text-xs text-[#9CA3AF]">{new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-sm font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className={t.toUser ? "text-[#10B981]" : "text-[#EF4444]"}>
                  {t.toUser ? "+" : "-"}${Number(t.grossAmount).toFixed(2)}
                </span>
              </p>
            </div>
          ))}
          {!transactions && [1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1E1E2D]" />
                <div>
                  <div className="w-24 h-4 bg-[#1E1E2D] rounded" />
                  <div className="w-16 h-3 bg-[#1E1E2D] rounded mt-1" />
                </div>
              </div>
              <div className="w-16 h-4 bg-[#1E1E2D] rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link to="/profile">
          <div className="glass glass-border rounded-xl p-6 hover:border-[#E11D48]/20 transition-all group cursor-pointer">
            <UserCircle className="w-8 h-8 text-[#E11D48] mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-semibold text-[#F5E6D3] mb-1">Edit Profile</h4>
            <p className="text-xs text-[#9CA3AF]">Update photos, bio, and pricing</p>
          </div>
        </Link>
        <Link to="/messages">
          <div className="glass glass-border rounded-xl p-6 hover:border-[#E11D48]/20 transition-all group cursor-pointer">
            <MessageCircle className="w-8 h-8 text-[#E11D48] mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-semibold text-[#F5E6D3] mb-1">Check Messages</h4>
            <p className="text-xs text-[#9CA3AF]">Reply to client inquiries</p>
          </div>
        </Link>
        <Link to="/wallet">
          <div className="glass glass-border rounded-xl p-6 hover:border-[#E11D48]/20 transition-all group cursor-pointer">
            <CreditCard className="w-8 h-8 text-[#E11D48] mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-semibold text-[#F5E6D3] mb-1">Request Withdrawal</h4>
            <p className="text-xs text-[#9CA3AF]">Withdraw your earnings</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

// ─── Client Dashboard ────────────────────────────────────────────────
function ClientDashboard() {
  const { data: stats } = trpc.user.getStats.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5E6D3] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome Back
        </h1>
        <p className="text-sm text-[#9CA3AF]">Discover and connect with elite companions</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Wallet Balance"
          value={`$${(stats?.walletBalance ?? 0).toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5 text-white" />}
          color="bg-[#10B981]/20 text-[#10B981]"
        />
        <StatCard
          title="Monthly Spending"
          value={`$${(stats?.monthlySpending ?? 0).toFixed(2)}`}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color="bg-[#D4A574]/20 text-[#D4A574]"
        />
        <StatCard
          title="Unread Messages"
          value={String(stats?.unreadMessages ?? 0)}
          icon={<Mail className="w-5 h-5 text-white" />}
          color="bg-[#E11D48]/20 text-[#E11D48]"
        />
        <StatCard
          title="Favorites"
          value="12"
          icon={<Star className="w-5 h-5 text-white" />}
          color="bg-[#9CA3AF]/20 text-[#9CA3AF]"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/browse">
          <div className="glass glass-border rounded-xl p-6 hover:border-[#E11D48]/20 transition-all group cursor-pointer">
            <Sparkles className="w-8 h-8 text-[#E11D48] mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-semibold text-[#F5E6D3] mb-1">Browse Companions</h4>
            <p className="text-xs text-[#9CA3AF]">Discover elite companions near you</p>
          </div>
        </Link>
        <Link to="/messages">
          <div className="glass glass-border rounded-xl p-6 hover:border-[#E11D48]/20 transition-all group cursor-pointer">
            <MessageCircle className="w-8 h-8 text-[#E11D48] mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-semibold text-[#F5E6D3] mb-1">Your Messages</h4>
            <p className="text-xs text-[#9CA3AF]">Check your conversations</p>
          </div>
        </Link>
        <Link to="/wallet">
          <div className="glass glass-border rounded-xl p-6 hover:border-[#E11D48]/20 transition-all group cursor-pointer">
            <CreditCard className="w-8 h-8 text-[#E11D48] mb-3 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-semibold text-[#F5E6D3] mb-1">Add Funds</h4>
            <p className="text-xs text-[#9CA3AF]">Top up your wallet balance</p>
          </div>
        </Link>
      </div>

      {/* Featured Preview */}
      <div className="glass glass-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#F5E6D3]">Featured Companions</h3>
          <Link to="/browse" className="text-sm text-[#E11D48] hover:text-[#FB7185] flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Link key={i} to="/browse">
              <div className="rounded-xl overflow-hidden group cursor-pointer">
                <div className="relative h-[200px] overflow-hidden">
                  <img
                    src={`/assets/companion-avatar-${i}.jpg`}
                    alt={`Companion ${i}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-sm font-medium text-[#F5E6D3]">
                      {["Sophia Chen", "Marcus Rivera", "Isabella Romano", "Victoria Ashford"][i - 1]}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      {["New York", "London", "Milan", "Los Angeles"][i - 1]}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isLoading, isAuthenticated, logout } = useAuth({ redirectOnUnauthenticated: true });
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex">
      <Sidebar role={user?.role ?? "client"} onLogout={logout} />

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass glass-border border-t border-white/5 px-4 py-2 flex justify-around">
        <Link to="/dashboard" className="flex flex-col items-center gap-1 p-2 text-[#E11D48]">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link to="/browse" className="flex flex-col items-center gap-1 p-2 text-[#9CA3AF]">
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Browse</span>
        </Link>
        <Link to="/messages" className="flex flex-col items-center gap-1 p-2 text-[#9CA3AF]">
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px]">Messages</span>
        </Link>
        <Link to="/wallet" className="flex flex-col items-center gap-1 p-2 text-[#9CA3AF]">
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px]">Wallet</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center gap-1 p-2 text-[#9CA3AF]">
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </Link>
      </div>

      <main className="flex-1 p-6 lg:p-10 pb-24 lg:pb-10 max-w-6xl">
        {user?.role === "companion" || user?.role === "admin" ? (
          <CompanionDashboard />
        ) : (
          <ClientDashboard />
        )}
      </main>
    </div>
  );
}
