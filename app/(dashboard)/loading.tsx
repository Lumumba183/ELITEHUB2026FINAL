import { Loader2, LayoutDashboard, Users, MessageSquare, Wallet, UserCircle } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Sidebar skeleton */}
      <div className="fixed left-0 top-0 h-full w-64 bg-[#14141E]/80 border-r border-white/5 p-6 hidden lg:block">
        <div className="h-8 w-32 bg-white/5 rounded animate-pulse mb-8" />
        <div className="space-y-3">
          {[LayoutDashboard, Users, MessageSquare, Wallet, UserCircle].map((Icon, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse">
              <Icon className="w-5 h-5 text-[#A09B8C]/30" />
              <div className="h-4 w-24 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="lg:ml-64 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
          <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
        </div>

        {/* Stats grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-6 animate-pulse">
              <div className="h-10 w-10 bg-white/5 rounded-xl mb-4" />
              <div className="h-8 w-24 bg-white/5 rounded mb-2" />
              <div className="h-4 w-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>

        {/* Content area */}
        <div className="glass rounded-2xl p-6 animate-pulse">
          <div className="h-6 w-32 bg-white/5 rounded mb-6" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile loading indicator */}
      <div className="lg:hidden fixed inset-0 bg-[#0A0A0F]/90 flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#E11D48]" />
      </div>
    </div>
  );
}
