"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Plus,
  History,
  TrendingUp,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

interface PaymentPackage {
  id: string;
  coins: number;
  price: number;
  label: string;
  popular?: boolean;
}

export default function WalletPage() {
  const { user, dbUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [withdrawDetails, setWithdrawDetails] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const supabase = createClient();

  const packages: PaymentPackage[] = [
    { id: "1", coins: 100, price: 500, label: "Starter" },
    { id: "2", coins: 500, price: 2000, label: "Popular", popular: true },
    { id: "3", coins: 1000, price: 3500, label: "Premium" },
    { id: "4", coins: 2500, price: 7500, label: "Elite" },
  ];

  useEffect(() => {
    if (dbUser) {
      setBalance(dbUser.wallet_balance || 0);
      setCoins(dbUser.coins || 0);
      fetchTransactions();
    }
  }, [dbUser]);

  async function fetchTransactions() {
    const { data } = await supabase
      .from("coin_transactions")
      .select("*")
      .eq("user_id", dbUser?.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setTransactions(data || []);
    setLoading(false);
  }

  async function handleWithdraw() {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (!withdrawDetails.trim()) {
      toast.error("Please enter payment details");
      return;
    }

    const { error } = await supabase.from("withdrawal_requests").insert({
      user_id: dbUser?.id,
      amount,
      payment_method: withdrawMethod,
      payment_details: withdrawDetails,
    });

    if (error) {
      toast.error("Failed to submit withdrawal request");
    } else {
      toast.success("Withdrawal request submitted for review");
      setWithdrawAmount("");
      setWithdrawDetails("");
    }
  }

  async function purchaseCoins(packageId: string) {
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return;

    toast.info(`Purchase ${pkg.coins} coins for KES ${pkg.price} - Redirecting to PesaPal...`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-[#A09B8C]">Manage your balance, coins, and transactions</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Balance</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(balance)}</p>
          <p className="text-sm text-[#A09B8C] mt-1">Available for withdrawal</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Coins</span>
          </div>
          <p className="text-3xl font-bold">{coins}</p>
          <p className="text-sm text-[#A09B8C] mt-1">Available for messaging</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#E11D48]" />
            </div>
            <span className="text-xs text-[#A09B8C]">Status</span>
          </div>
          <p className="text-lg font-bold capitalize">{dbUser?.subscription_status || "Inactive"}</p>
          <p className="text-sm text-[#A09B8C] mt-1">Subscription status</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-1">
        {[
          { id: "overview", label: "Overview", icon: TrendingUp },
          { id: "buy", label: "Buy Coins", icon: Plus },
          { id: "withdraw", label: "Withdraw", icon: ArrowUpRight },
          { id: "history", label: "History", icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-[#E11D48] border-b-2 border-[#E11D48]"
                : "text-[#A09B8C] hover:text-white"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab("buy")}
                className="p-6 glass rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center mb-4">
                  <Plus className="w-5 h-5 text-[#E11D48]" />
                </div>
                <h4 className="font-semibold mb-1">Buy Coins</h4>
                <p className="text-sm text-[#A09B8C]">Top up your account with coins</p>
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className="p-6 glass rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E11D48]/10 flex items-center justify-center mb-4">
                  <ArrowUpRight className="w-5 h-5 text-[#E11D48]" />
                </div>
                <h4 className="font-semibold mb-1">Withdraw</h4>
                <p className="text-sm text-[#A09B8C]">Request a withdrawal to your bank</p>
              </button>
            </div>
          </div>
        )}

        {activeTab === "buy" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Purchase Coins</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`p-6 rounded-xl border transition-all cursor-pointer ${
                    pkg.popular
                      ? "border-[#E11D48] bg-[#E11D48]/5"
                      : "border-white/10 glass hover:bg-white/10"
                  }`}
                  onClick={() => purchaseCoins(pkg.id)}
                >
                  {pkg.popular && (
                    <span className="inline-block px-2 py-1 rounded-full bg-[#E11D48] text-white text-xs font-semibold mb-3">
                      Popular
                    </span>
                  )}
                  <p className="text-3xl font-bold mb-1">{pkg.coins}</p>
                  <p className="text-sm text-[#A09B8C] mb-4">Coins</p>
                  <p className="text-xl font-semibold text-[#E11D48]">{formatCurrency(pkg.price)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "withdraw" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Request Withdrawal</h3>
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount (KES)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Max: ${balance}`}
                  className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] placeholder:text-[#A09B8C]/60 focus:outline-none focus:border-[#E11D48]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] focus:outline-none focus:border-[#E11D48]/50"
                >
                  <option value="bank">Bank Transfer</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="airtel">Airtel Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Details</label>
                <textarea
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  placeholder="Account number / Phone number / Bank details"
                  className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] placeholder:text-[#A09B8C]/60 focus:outline-none focus:border-[#E11D48]/50 h-24 resize-none"
                />
              </div>
              <button
                onClick={handleWithdraw}
                className="w-full px-6 py-3 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white rounded-xl font-semibold transition-colors"
              >
                Submit Withdrawal Request
              </button>
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Transaction History</h3>
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === "purchase" || tx.type === "gift_received"
                          ? "bg-green-500/10"
                          : "bg-[#E11D48]/10"
                      }`}>
                        <ArrowDownLeft className="w-5 h-5 text-[#E11D48]" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-sm text-[#A09B8C]">{tx.description || "-"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.type === "purchase" || tx.type === "gift_received"
                          ? "text-green-400"
                          : "text-[#E11D48]"
                      }`}>
                        {tx.type === "purchase" || tx.type === "gift_received" ? "+" : "-"}{tx.amount}
                      </p>
                      <p className="text-xs text-[#A09B8C]">{formatDate(tx.created_at)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#A09B8C] py-8">No transactions yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
