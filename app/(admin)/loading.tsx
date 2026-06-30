import { Loader2, Crown, Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#E11D48]/10 animate-pulse" />
        <div>
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-2" />
          <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, label: "Total Users" },
          { icon: Crown, label: "Companions" },
          { icon: Users, label: "Clients" },
          { icon: DollarSign, label: "Revenue" },
        ].map((item, i) => (
          <div key={i} className="glass rounded-2xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-white/5 rounded-xl" />
              <div className="h-4 w-16 bg-white/5 rounded" />
            </div>
            <div className="h-8 w-24 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Withdrawals */}
        <div className="glass rounded-2xl p-6 animate-pulse">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-[#E11D48]/30" />
            <div className="h-6 w-40 bg-white/5 rounded" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="glass rounded-2xl p-6 animate-pulse">
          <div className="h-6 w-32 bg-white/5 rounded mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      <div className="fixed inset-0 bg-[#0A0A0F]/50 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#E11D48]" />
      </div>
    </div>
  );
}
