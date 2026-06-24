import { useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Wallet as WalletIcon,
  CreditCard,
  Smartphone,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Star,
  DollarSign,
  Receipt,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";

export default function Wallet() {
  const [activeTab, setActiveTab] = useState("wallet");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [mpesaAmount, setMpesaAmount] = useState("");
  const [pesapalAmount, setPesapalAmount] = useState("");
  const [pesapalCurrency, setPesapalCurrency] = useState("USD");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"mpesa" | "bank_transfer">("mpesa");

  const { data: balanceData } = trpc.payment.getBalance.useQuery();
  const { data: transactions } = trpc.payment.getTransactions.useQuery({ limit: 20 });
  const { data: withdrawals } = trpc.payment.getWithdrawals.useQuery({ limit: 10 });

  const initiateMpesa = trpc.payment.initiateMpesa.useMutation();
  const confirmPesapal = trpc.payment.confirmPesapal.useMutation();
  const withdraw = trpc.payment.withdraw.useMutation({
    onSuccess: () => {
      setWithdrawAmount("");
      alert("Withdrawal request submitted!");
    },
  });

  const balance = balanceData?.balance ?? 0;

  const handleMpesaPay = () => {
    if (!mpesaPhone || !mpesaAmount) return;
    initiateMpesa.mutate({
      phoneNumber: mpesaPhone,
      amount: Number(mpesaAmount),
      type: "wallet",
    });
  };

  const handlePesapalPay = () => {
    if (!pesapalAmount) return;
    confirmPesapal.mutate({
      reference: `PSP_${Date.now()}`,
      amount: Number(pesapalAmount),
    });
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || Number(withdrawAmount) < 10) return;
    withdraw.mutate({
      amount: Number(withdrawAmount),
      paymentMethod: withdrawMethod,
      paymentDetails: withdrawMethod === "mpesa" ? { phoneNumber: mpesaPhone } : { accountNumber: "", bankName: "" },
    });
  };

  const transactionTypeIcon = (type: string) => {
    switch (type) {
      case "gift": return <Gift className="w-4 h-4" />;
      case "withdrawal": return <ArrowUpRight className="w-4 h-4" />;
      case "subscription": return <Star className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const transactionTypeColor = (type: string) => {
    switch (type) {
      case "gift": return "bg-[#E11D48]/20 text-[#E11D48]";
      case "withdrawal": return "bg-[#EF4444]/20 text-[#EF4444]";
      case "subscription": return "bg-[#D4A574]/20 text-[#D4A574]";
      default: return "bg-[#10B981]/20 text-[#10B981]";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#F5E6D3]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-[#F5E6D3]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Wallet & Payments
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Balance Card */}
        <div className="glass glass-border-glow rounded-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 gradient-crimson" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E11D48]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-5 h-5 text-[#E11D48]" />
              <span className="text-sm text-[#9CA3AF]">Available Balance</span>
            </div>
            <p className="text-4xl font-bold text-[#F5E6D3] mb-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              ${balance.toFixed(2)}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setActiveTab("deposit")}
                className="gradient-crimson text-white border-0 hover:opacity-90 rounded-full"
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" /> Add Funds
              </Button>
              <Button
                onClick={() => setActiveTab("withdraw")}
                variant="outline"
                className="glass glass-border text-[#F5E6D3] hover:bg-white/5 rounded-full"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-[#14141E] border border-white/5 mb-6">
            <TabsTrigger value="wallet" className="data-[state=active]:bg-[#E11D48] data-[state=active]:text-white">
              <Receipt className="w-4 h-4 mr-2" /> History
            </TabsTrigger>
            <TabsTrigger value="deposit" className="data-[state=active]:bg-[#E11D48] data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" /> Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-[#E11D48] data-[state=active]:text-white">
              <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
            </TabsTrigger>
          </TabsList>

          {/* Transaction History */}
          <TabsContent value="wallet">
            <div className="glass glass-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Transaction History</h3>
              <div className="space-y-3">
                {transactions?.length === 0 && (
                  <p className="text-sm text-[#9CA3AF] text-center py-8">No transactions yet</p>
                )}
                {transactions?.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transactionTypeColor(t.type)}`}>
                        {transactionTypeIcon(t.type)}
                      </div>
                      <div>
                        <p className="text-sm text-[#F5E6D3] capitalize">{t.type.replace("_", " ")}</p>
                        <p className="text-xs text-[#9CA3AF]">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        <span className={t.toUser ? "text-[#10B981]" : "text-[#EF4444]"}>
                          {t.toUser ? "+" : "-"}${Number(t.grossAmount).toFixed(2)}
                        </span>
                      </p>
                      <p className="text-[10px] text-[#9CA3AF] capitalize">{t.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Withdrawal History */}
            <div className="glass glass-border rounded-xl p-6 mt-6">
              <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Withdrawal Requests</h3>
              <div className="space-y-3">
                {withdrawals?.length === 0 && (
                  <p className="text-sm text-[#9CA3AF] text-center py-8">No withdrawal requests</p>
                )}
                {withdrawals?.map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444]">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm text-[#F5E6D3]">Withdrawal</p>
                        <p className="text-xs text-[#9CA3AF]">{new Date(w.requestedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        ${Number(w.amount).toFixed(2)}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        w.status === "completed" ? "bg-[#10B981]/20 text-[#10B981]" :
                        w.status === "pending" ? "bg-[#F59E0B]/20 text-[#F59E0B]" :
                        "bg-[#EF4444]/20 text-[#EF4444]"
                      }`}>
                        {w.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Deposit */}
          <TabsContent value="deposit">
            <Tabs defaultValue="mpesa">
              <TabsList className="bg-[#14141E] border border-white/5 mb-6">
                <TabsTrigger value="mpesa" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
                  <Smartphone className="w-4 h-4 mr-2" /> M-Pesa
                </TabsTrigger>
                <TabsTrigger value="pesapal" className="data-[state=active]:bg-[#D4A574] data-[state=active]:text-white">
                  <CreditCard className="w-4 h-4 mr-2" /> Card (PesaPal)
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mpesa">
                <div className="glass glass-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Pay with M-Pesa</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm text-[#9CA3AF] mb-2">Phone Number</label>
                      <Input
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="+2547XXXXXXXX"
                        className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#9CA3AF] mb-2">Amount (KES)</label>
                      <Input
                        type="number"
                        value={mpesaAmount}
                        onChange={(e) => setMpesaAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-12"
                      />
                    </div>
                    <Button
                      onClick={handleMpesaPay}
                      disabled={initiateMpesa.isPending}
                      className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white rounded-full h-12"
                    >
                      {initiateMpesa.isPending ? "Processing..." : "Pay with M-Pesa"}
                    </Button>
                    {initiateMpesa.isSuccess && (
                      <p className="text-sm text-[#10B981] text-center">
                        STK Push sent! Check your phone.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pesapal">
                <div className="glass glass-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Pay with Card (PesaPal)</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm text-[#9CA3AF] mb-2">Currency</label>
                      <div className="relative">
                        <select
                          value={pesapalCurrency}
                          onChange={(e) => setPesapalCurrency(e.target.value)}
                          className="w-full h-12 bg-[#14141E] border border-white/10 text-[#F5E6D3] rounded-lg px-3 appearance-none"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="AUD">AUD - Australian Dollar</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-[#9CA3AF] mb-2">Amount</label>
                      <Input
                        type="number"
                        value={pesapalAmount}
                        onChange={(e) => setPesapalAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-12"
                      />
                    </div>
                    <Button
                      onClick={handlePesapalPay}
                      disabled={confirmPesapal.isPending}
                      className="w-full gradient-gold text-[#0A0A0F] hover:opacity-90 rounded-full h-12 font-semibold"
                    >
                      {confirmPesapal.isPending ? "Processing..." : "Pay Securely"}
                    </Button>
                    {confirmPesapal.isSuccess && (
                      <p className="text-sm text-[#10B981] text-center">
                        Payment confirmed! Wallet credited.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Withdraw */}
          <TabsContent value="withdraw">
            <div className="glass glass-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Request Withdrawal</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">Amount (min $10)</label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">Payment Method</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setWithdrawMethod("mpesa")}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm transition-all ${
                        withdrawMethod === "mpesa"
                          ? "border-[#10B981] bg-[#10B981]/10 text-[#10B981]"
                          : "border-white/10 text-[#9CA3AF] hover:border-white/20"
                      }`}
                    >
                      <Smartphone className="w-4 h-4 mx-auto mb-1" /> M-Pesa
                    </button>
                    <button
                      onClick={() => setWithdrawMethod("bank_transfer")}
                      className={`flex-1 py-3 px-4 rounded-lg border text-sm transition-all ${
                        withdrawMethod === "bank_transfer"
                          ? "border-[#D4A574] bg-[#D4A574]/10 text-[#D4A574]"
                          : "border-white/10 text-[#9CA3AF] hover:border-white/20"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mx-auto mb-1" /> Bank
                    </button>
                  </div>
                </div>
                {withdrawMethod === "mpesa" && (
                  <div>
                    <label className="block text-sm text-[#9CA3AF] mb-2">M-Pesa Phone Number</label>
                    <Input
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="+2547XXXXXXXX"
                      className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-12"
                    />
                  </div>
                )}
                <div className="text-xs text-[#9CA3AF] bg-white/5 rounded-lg p-3">
                  <p>Processing fee: 5%</p>
                  <p>Net amount: ${withdrawAmount ? (Number(withdrawAmount) * 0.95).toFixed(2) : "0.00"}</p>
                </div>
                <Button
                  onClick={handleWithdraw}
                  disabled={withdraw.isPending || !withdrawAmount || Number(withdrawAmount) < 10}
                  className="w-full gradient-crimson text-white border-0 hover:opacity-90 rounded-full h-12"
                >
                  {withdraw.isPending ? "Submitting..." : "Request Withdrawal"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
