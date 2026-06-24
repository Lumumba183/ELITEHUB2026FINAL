import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Users,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Target,
  TrendingUp,
  Pause,
  Play,
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { trpc } from "@/providers/trpc";

// ─── KPI Card ────────────────────────────────────────────────────────
function KPICard({
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
    <div className="glass glass-border rounded-xl p-5 hover:border-[#E11D48]/10 transition-all">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-[#9CA3AF] mb-1">{title}</p>
      <p className="text-xl font-bold text-[#F5E6D3]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </p>
      {trend && (
        <p className="text-[10px] text-[#10B981] mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> {trend}
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d">("30d");

  const { data: kpis } = trpc.admin.getKPIs.useQuery({ period });
  const { data: chartData } = trpc.admin.getRevenueChart.useQuery({ days: 30 });
  const { data: recentSignups } = trpc.admin.getRecentSignups.useQuery({ limit: 10 });
  const { data: campaigns } = trpc.admin.getCampaigns.useQuery();
  const { data: violations } = trpc.admin.getViolations.useQuery({ limit: 10 });
  const { data: report } = trpc.admin.getMorningReport.useQuery();
  const { data: pendingWithdrawals } = trpc.payment.getPendingWithdrawals.useQuery({ limit: 10 });

  const updateCampaign = trpc.admin.updateCampaignStatus.useMutation({
    onSuccess: () => utils.admin.getCampaigns.invalidate(),
  });
  const processWithdrawal = trpc.payment.processWithdrawal.useMutation({
    onSuccess: () => {
      utils.payment.getPendingWithdrawals.invalidate();
      utils.admin.getKPIs.invalidate();
    },
  });

  const utils = trpc.useUtils();

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#F5E6D3]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-[#F5E6D3]" style={{ fontFamily: "'Playfair Display', serif" }}>
            CEO Dashboard
          </h1>
          <div className="flex items-center gap-2">
            {(["24h", "7d", "30d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  period === p
                    ? "bg-[#E11D48] text-white"
                    : "bg-white/5 text-[#9CA3AF] hover:text-[#F5E6D3]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KPICard title="Total Users" value={String(kpis?.totalUsers ?? 0)} icon={<Users className="w-5 h-5 text-white" />} color="bg-[#3B82F6]/20 text-[#3B82F6]" trend={`+${kpis?.newUsers ?? 0} new`} />
          <KPICard title="Monthly Revenue" value={`$${(kpis?.monthlyRevenue ?? 0).toLocaleString()}`} icon={<DollarSign className="w-5 h-5 text-white" />} color="bg-[#10B981]/20 text-[#10B981]" trend="+8%" />
          <KPICard title="Active Subs" value={String(kpis?.activeSubscriptions ?? 0)} icon={<CreditCard className="w-5 h-5 text-white" />} color="bg-[#D4A574]/20 text-[#D4A574]" />
          <KPICard title="Pending Withdrawals" value={`$${(kpis?.pendingWithdrawals ?? 0).toLocaleString()}`} icon={<DollarSign className="w-5 h-5 text-white" />} color="bg-[#F59E0B]/20 text-[#F59E0B]" />
          <KPICard title="DM Violations (24h)" value={String(kpis?.violations24h ?? 0)} icon={<AlertTriangle className="w-5 h-5 text-white" />} color="bg-[#EF4444]/20 text-[#EF4444]" />
          <KPICard title="Signup Target" value={`${kpis?.signupTarget?.percentage ?? 0}%`} icon={<Target className="w-5 h-5 text-white" />} color="bg-[#8B5CF6]/20 text-[#8B5CF6]" trend={`${kpis?.signupTarget?.current ?? 0}/${kpis?.signupTarget?.target ?? 100}`} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="glass glass-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Revenue & User Growth</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                  <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#14141E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#F5E6D3" }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#E11D48" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="newUsers" stroke="#D4A574" strokeWidth={2} name="New Users" dot={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Morning Report Preview */}
          <div className="glass glass-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#F5E6D3]">Morning Report</h3>
              <Mail className="w-5 h-5 text-[#D4A574]" />
            </div>
            {report ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-[#9CA3AF]">Date</span>
                  <span className="text-sm text-[#F5E6D3]">{report.date}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-[#9CA3AF]">New Signups</span>
                  <span className="text-sm font-medium text-[#10B981]">{report.dailyStats.newSignups}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-[#9CA3AF]">Daily Revenue</span>
                  <span className="text-sm font-medium text-[#F5E6D3]">${report.dailyStats.revenue.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-[#9CA3AF]">DM Violations</span>
                  <span className="text-sm font-medium text-[#EF4444]">{report.dailyStats.violations}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-sm text-[#9CA3AF]">Pending Withdrawals</span>
                  <span className="text-sm font-medium text-[#F59E0B]">{report.pendingWithdrawals.count} (${report.pendingWithdrawals.total.toFixed(2)})</span>
                </div>
                <div>
                  <p className="text-xs text-[#9CA3AF] mb-2">Top Campaigns:</p>
                  <div className="space-y-1">
                    {report.topCampaigns.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-xs">
                        <span className="text-[#F5E6D3]">{c.campaignName}</span>
                        <span className="text-[#D4A574]">${Number(c.spend).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#9CA3AF] text-center py-8">Loading report...</p>
            )}
          </div>
        </div>

        {/* Campaigns */}
        <div className="glass glass-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Ad Campaign Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#9CA3AF] border-b border-white/5">
                  <th className="pb-3 font-medium">Platform</th>
                  <th className="pb-3 font-medium">Campaign</th>
                  <th className="pb-3 font-medium">Spend</th>
                  <th className="pb-3 font-medium">Impressions</th>
                  <th className="pb-3 font-medium">Clicks</th>
                  <th className="pb-3 font-medium">Signups</th>
                  <th className="pb-3 font-medium">CPA</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {campaigns?.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 text-sm text-[#F5E6D3] capitalize">{c.platform}</td>
                    <td className="py-3 text-sm text-[#F5E6D3]">{c.campaignName}</td>
                    <td className="py-3 text-sm text-[#F5E6D3]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ${Number(c.spend).toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-[#9CA3AF]">{c.impressions?.toLocaleString()}</td>
                    <td className="py-3 text-sm text-[#9CA3AF]">{c.clicks?.toLocaleString()}</td>
                    <td className="py-3 text-sm text-[#10B981]">{c.signups}</td>
                    <td className="py-3 text-sm text-[#D4A574]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ${Number(c.costPerSignup).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        c.status === "active" ? "bg-[#10B981]/20 text-[#10B981]" :
                        c.status === "paused" ? "bg-[#F59E0B]/20 text-[#F59E0B]" :
                        "bg-[#EF4444]/20 text-[#EF4444]"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => updateCampaign.mutate({
                          id: c.id,
                          status: c.status === "active" ? "paused" : "active",
                        })}
                        className="text-[#9CA3AF] hover:text-[#F5E6D3] transition-colors"
                      >
                        {c.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Two Column: Recent Signups & Violations */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Signups */}
          <div className="glass glass-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Recent Signups</h3>
            <div className="space-y-3">
              {recentSignups?.slice(0, 8).map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar ?? "/assets/companion-avatar-1.jpg"}
                      alt={user.name ?? "User"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm text-[#F5E6D3]">{user.name ?? "Anonymous"}</p>
                      <p className="text-[10px] text-[#9CA3AF]">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      user.role === "companion" ? "bg-[#E11D48]/20 text-[#E11D48]" :
                      user.role === "admin" ? "bg-[#8B5CF6]/20 text-[#8B5CF6]" :
                      "bg-[#3B82F6]/20 text-[#3B82F6]"
                    }`}>
                      {user.role}
                    </span>
                    <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DM Violations */}
          <div className="glass glass-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">DM Violations Log</h3>
            <div className="space-y-3">
              {violations?.length === 0 && (
                <p className="text-sm text-[#9CA3AF] text-center py-8">No violations recorded</p>
              )}
              {violations?.map((v) => (
                <div key={v.id} className="py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
                      <span className="text-xs text-[#EF4444] font-medium capitalize">{v.violationType}</span>
                    </div>
                    <span className="text-[10px] text-[#9CA3AF]">
                      {new Date(v.detectedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF]">
                    <span className="text-[#F5E6D3]">{v.senderName}</span> attempted to share contact with{" "}
                    <span className="text-[#F5E6D3]">{v.receiverName}</span>
                  </p>
                  {v.attemptedContent && (
                    <p className="text-[10px] text-[#EF4444]/60 mt-1 line-clamp-1">
                      Content: {v.attemptedContent}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="glass glass-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Pending Withdrawal Requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#9CA3AF] border-b border-white/5">
                  <th className="pb-3 font-medium">Companion</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Fee</th>
                  <th className="pb-3 font-medium">Net</th>
                  <th className="pb-3 font-medium">Method</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingWithdrawals?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-[#9CA3AF]">
                      No pending withdrawals
                    </td>
                  </tr>
                )}
                {pendingWithdrawals?.map((w) => (
                  <tr key={w.id} className="border-b border-white/5 last:border-0">
                    <td className="py-3 text-sm text-[#F5E6D3]">
                      {w.companionName ?? "Unknown"}
                      <p className="text-[10px] text-[#9CA3AF]">{w.companionEmail}</p>
                    </td>
                    <td className="py-3 text-sm text-[#F5E6D3]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ${Number(w.amount).toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-[#EF4444]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ${Number(w.processingFee).toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-[#10B981]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ${Number(w.netAmount).toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-[#9CA3AF] capitalize">{w.paymentMethod}</td>
                    <td className="py-3 text-sm text-[#9CA3AF]">{new Date(w.requestedAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => processWithdrawal.mutate({ id: w.id, status: "completed" })}
                          className="w-8 h-8 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] hover:bg-[#10B981]/30 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => processWithdrawal.mutate({ id: w.id, status: "rejected" })}
                          className="w-8 h-8 rounded-full bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444] hover:bg-[#EF4444]/30 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
