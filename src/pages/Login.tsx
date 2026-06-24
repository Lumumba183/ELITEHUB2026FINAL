import { Link } from "react-router";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getOAuthUrl() {
  const authUrl = new URL(
    `${import.meta.env.VITE_KIMI_AUTH_URL}/api/oauth/authorize`
  );
  authUrl.searchParams.set("client_id", import.meta.env.VITE_APP_ID);
  authUrl.searchParams.set("redirect_uri", `${window.location.origin}/api/oauth/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "profile");
  authUrl.searchParams.set("state", btoa(window.location.pathname));
  return authUrl.toString();
}

export default function Login() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
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
            Welcome Back
          </h1>
          <p className="text-sm text-[#9CA3AF]">
            Sign in to access your account
          </p>
        </div>

        <div className="glass glass-border rounded-xl p-8">
          {/* OAuth Login */}
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

          {/* Email/Password (UI only - not functional) */}
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
                placeholder="Enter your password"
                className="bg-[#1E1E2D] border-white/10 text-[#F5E6D3] placeholder:text-[#9CA3AF]/50 focus:border-[#E11D48]/50 focus:ring-[#E11D48]/20 h-12"
              />
            </div>
            <Button className="w-full bg-[#1E1E2D] hover:bg-[#2a2a3d] text-[#F5E6D3] border border-white/10 rounded-full py-6">
              Sign In
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-[#9CA3AF] mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-[#E11D48] hover:text-[#FB7185] transition-colors font-medium">
            Join Free
          </Link>
        </p>
      </div>
    </div>
  );
}
