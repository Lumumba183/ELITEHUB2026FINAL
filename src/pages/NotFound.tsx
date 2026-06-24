import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#E11D48]/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 text-center">
        <h1
          className="text-8xl font-bold text-gradient-crimson mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          404
        </h1>
        <h2 className="text-2xl font-bold text-[#F5E6D3] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Page Not Found
        </h2>
        <p className="text-sm text-[#9CA3AF] max-w-sm mx-auto mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="glass glass-border text-[#F5E6D3] hover:bg-white/5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
          <Link to="/">
            <Button className="gradient-crimson text-white border-0 hover:opacity-90 rounded-full">
              <Home className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
