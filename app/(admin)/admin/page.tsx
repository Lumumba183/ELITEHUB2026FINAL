import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Users,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Crown,
  Shield,
  AlertTriangle,
} from "lucide-react";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("role")
    .eq("clerk_id", user.id)
    .single();

  if (dbUser?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch stats
  const { count: totalUsers } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  const { count: activeCompanions } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "companion")
    .eq("subscription_status", "active");

  const { count: activeClients } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "client")
    .eq("subscription_status", "active");

  const { data: transactions } = await supabase
    .from("payment_transactions")
    .select("amount, status")
    .eq("status", "completed");

  const totalRevenue = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

  const { data: pendingWithdrawals } = await supabase
    .from("withdrawal_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: recentUsers } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
          <Crown className="w-6 h-6 text-[#E11D48]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-[#A09B8C]">Platform management and analytics</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Total Users</span>
          </div>
          <p className="text-3xl font-bold">{totalUsers || 0}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Companions</span>
          </div>
          <p className="text-3xl font-bold">{activeCompanions || 0}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Clients</span>
          </div>
          <p className="text-3xl font-bold">{activeClients || 0}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Revenue</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Withdrawals */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#E11D48]" />
              Pending Withdrawals
            </h2>
          </div>
          <div className="space-y-3">
            {pendingWithdrawals && pendingWithdrawals.length > 0 ? (
              pendingWithdrawals.map((w: any) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-4 rounded-xl glass hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="font-semibold">{formatCurrency(w.amount)}</p>
                    <p className="text-sm text-[#A09B8C]">{w.payment_method}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#A09B8C]">{w.payment_details}</p>
                    <p className="text-xs text-[#A09B8C]">{formatDate(w.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-[#A09B8C] py-8">No pending withdrawals</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Recent Users</h2>
          </div>
          <div className="space-y-3">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 rounded-xl glass hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E11D48]/10 flex items-center justify-center">
                      <span className="font-semibold text-[#E11D48]">
                        {(u.display_name || "?")[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{u.display_name || "Unnamed"}</p>
                      <p className="text-sm text-[#A09B8C]">{u.email}</p>
                    </div>
                  </div>
                  <span className="capitalize px-3 py-1 rounded-full text-xs font-semibold bg-[#A09B8C]/10 text-[#A09B8C]">
                    {u.role}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-[#A09B8C] py-8">No users yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
