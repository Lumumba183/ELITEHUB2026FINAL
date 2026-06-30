import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Wallet,
  Star,
  Heart,
  TrendingUp,
  ArrowRight,
  Users,
  Gift,
  CreditCard,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("*, subscription_status, wallet_balance, coins")
    .eq("clerk_id", user.id)
    .single();

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, last_message:messages(content, created_at)")
    .or(`client_id.eq.${dbUser?.id},companion_id.eq.${dbUser?.id}`)
    .order("updated_at", { ascending: false })
    .limit(5);

  const { data: transactions } = await supabase
    .from("coin_transactions")
    .select("*")
    .eq("user_id", dbUser?.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const isCompanion = dbUser?.role === "companion";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">
          Welcome back, <span className="text-gradient-crimson">{dbUser?.display_name || user.firstName || "Member"}</span>
        </h1>
        <p className="text-[#A09B8C]">
          {isCompanion
            ? "Manage your companion profile, earnings, and client connections."
            : "Discover companions, manage your wallet, and stay connected."}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Balance</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(dbUser?.wallet_balance || 0)}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Coins</span>
          </div>
          <p className="text-2xl font-bold">{dbUser?.coins || 0}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Messages</span>
          </div>
          <p className="text-2xl font-bold">{conversations?.length || 0}</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Subscription</span>
          </div>
          <p className="text-lg font-bold capitalize">{dbUser?.subscription_status || "Inactive"}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Recent Conversations</h2>
            <Link href="/messages" className="text-sm text-[#E11D48] hover:text-[#E11D48]/80 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {conversations && conversations.length > 0 ? (
              conversations.map((conv: any) => (
                <Link
                  key={conv.id}
                  href={`/messages?conversation=${conv.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#E11D48]/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[#E11D48]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {conv.client_id === dbUser?.id ? "Companion" : "Client"}
                    </p>
                    <p className="text-xs text-[#A09B8C] truncate">
                      {conv.last_message?.content || "No messages yet"}
                    </p>
                  </div>
                  <span className="text-xs text-[#A09B8C]">
                    {conv.last_message?.created_at ? formatDate(conv.last_message.created_at) : ""}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-[#A09B8C] text-sm text-center py-8">No conversations yet</p>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Recent Transactions</h2>
            <Link href="/wallet" className="text-sm text-[#E11D48] hover:text-[#E11D48]/80 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === "purchase" || tx.type === "gift_received" ? "bg-green-500/10" : "bg-[#E11D48]/10"
                    }`}>
                      <TrendingUp className="w-5 h-5 text-[#E11D48]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{tx.type}</p>
                      <p className="text-xs text-[#A09B8C]">{tx.description || "-"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === "purchase" || tx.type === "gift_received" ? "text-green-400" : "text-[#E11D48]"}`}>
                      {tx.type === "purchase" || tx.type === "gift_received" ? "+" : "-"}{tx.amount}
                    </p>
                    <p className="text-xs text-[#A09B8C]">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[#A09B8C] text-sm text-center py-8">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
