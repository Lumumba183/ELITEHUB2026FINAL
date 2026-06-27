import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { LogIn, UserCircle, Heart, ArrowRight, ArrowLeft, User, Briefcase, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setMockUser } from "@/hooks/useAuth";
import type { UserRole } from "@/hooks/useAuth";

function getOAuthUrl() {
  const authBase = import.meta.env.VITE_KIMI_AUTH_URL;
  const clientId = import.meta.env.VITE_APP_ID;
  if (!authBase || !clientId) return "#";
  const authUrl = new URL(`${authBase}/api/oauth/authorize`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", `${window.location.origin}/api/oauth/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "profile");
  authUrl.searchParams.set("state", btoa("/register"));
  return authUrl.toString();
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<"companion" | "client" | null>(null);
  const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);

  const handleDemoLogin = (role: UserRole) => {
    setDemoLoading(role);
    setMockUser(role);
    setTimeout(() => {
      navigate("/dashboard");
    }, 300);
  };

  const handleContinue = () => {
    if (selectedRole) {
      // On static site, skip tRPC and go straight to dashboard with mock user
      setMockUser(selectedRole);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#E11D48]/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-2xl font-bold text-gradient-crimson" style={{ fontFamily: "'Playfair Display', serif" }}>
              EliteHub
            </span>
            <div className="w-2 h-2 rounded-full bg-[#E11D48]" />
          </Link>
          <h1 className="text-3xl font-bold text-[#F5E6D3] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {step === 1 ? "Create Your Account" : "Choose Your Path"}
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            {step === 1 ? "Join the premium companion platform" : "How do you want to use EliteHub?"}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? "w-8 gradient-crimson" : "w-8 bg-white/10"}`} />
          <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? "w-8 gradient-crimson" : "w-8 bg-white/10"}`} />
        </div>

        <div className="glass glass-border rounded-xl p-8">
          {step === 1 ? (
            <>
              <a href={getOAuthUrl()}>
                <Button className="w-full gradient-crimson text-white border-0 hover:opacity-90 rounded-full py-6 text-base font-semibold mb-6">
                  <LogIn className="w-5 h-5 mr-2" />
                  Continue with OAuth
                </Button>
              </a>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-[#9CA3AF] uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Demo Login Buttons */}
              <div className="space-y-3 mb-6">
                <p className="text-xs text-[#9CA3AF] text-center uppercase tracking-wider">Quick Start — No Account Needed</p>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-[#F5E6D3] hover:bg-white/5 rounded-full py-5"
                  onClick={() => handleDemoLogin("client")}
                  disabled={!!demoLoading}
                >
                  <User className="w-4 h-4 mr-2" />
                  {demoLoading === "client" ? "Signing in..." : "Try as Client Demo"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-[#E11D48]/30 text-[#F5E6D3] hover:bg-[#E11D48]/10 rounded-full py-5"
                  onClick={() => handleDemoLogin("companion")}
                  disabled={!!demoLoading}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  {demoLoading === "companion" ? "Signing in..." : "Try as Companion Demo"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-amber-500/30 text-[#F5E6D3] hover:bg-amber-500/10 rounded-full py-5"
                  onClick={() => handleDemoLogin("admin")}
                  disabled={!!demoLoading}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {demoLoading === "admin" ? "Signing in..." : "Try as Admin Demo"}
                </Button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-[#9CA3AF] uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="bg-[#1E1E2D] border-white/10 text-[#F5E6D3] placeholder:text-[#9CA3AF]/50 focus:border-[#E11D48]/50 focus:ring-[#E11D48]/20 h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">Password</label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    className="bg-[#1E1E2D] border-white/10 text-[#F5E6D3] placeholder:text-[#9CA3AF]/50 focus:border-[#E11D48]/50 focus:ring-[#E11D48]/20 h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    className="bg-[#1E1E2D] border-white/10 text-[#F5E6D3] placeholder:text-[#9CA3AF]/50 focus:border-[#E11D48]/50 focus:ring-[#E11D48]/20 h-12"
                  />
                </div>
                <Button
                  onClick={() => setStep(2)}
                  className="w-full gradient-crimson text-white border-0 hover:opacity-90 rounded-full py-6 text-base font-semibold"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 mb-6">
                {/* Companion Option */}
                <button
                  onClick={() => setSelectedRole("companion")}
                  className={`p-6 rounded-xl border transition-all text-left ${
                    selectedRole === "companion"
                      ? "border-[#E11D48]/50 bg-[#E11D48]/5 glow-crimson"
                      : "border-white/10 hover:border-white/20 bg-transparent"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedRole === "companion" ? "gradient-crimson" : "bg-[#1E1E2D]"
                    }`}>
                      <UserCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#F5E6D3] mb-1">
                        I want to earn money
                      </h3>
                      <p className="text-sm text-[#9CA3AF]">
                        Create a companion profile, connect with clients, and earn income
                      </p>
                    </div>
                  </div>
                </button>

                {/* Client Option */}
                <button
                  onClick={() => setSelectedRole("client")}
                  className={`p-6 rounded-xl border transition-all text-left ${
                    selectedRole === "client"
                      ? "border-[#E11D48]/50 bg-[#E11D48]/5 glow-crimson"
                      : "border-white/10 hover:border-white/20 bg-transparent"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      selectedRole === "client" ? "gradient-crimson" : "bg-[#1E1E2D]"
                    }`}>
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#F5E6D3] mb-1">
                        I want to connect
                      </h3>
                      <p className="text-sm text-[#9CA3AF]">
                        Browse companions, send messages, and enjoy premium experiences
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 border-white/10 text-[#F5E6D3] hover:bg-white/5 rounded-full py-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button
                  onClick={handleContinue}
                  disabled={!selectedRole}
                  className="flex-[2] gradient-crimson text-white border-0 hover:opacity-90 rounded-full py-6 text-base font-semibold disabled:opacity-50"
                >
                  Get Started
                </Button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#9CA3AF] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#E11D48] hover:text-[#FB7185] transition-colors font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
