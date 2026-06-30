"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#0A0A0F] text-[#F5E6D3]">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#E11D48]/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-[#E11D48]" />
            </div>
            
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">Something went wrong</h2>
              <p className="text-[#A09B8C]">
                We encountered an unexpected error. Please try again.
              </p>
            </div>

            {error.digest && (
              <p className="text-xs text-[#A09B8C]/60 font-mono">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white rounded-xl font-semibold transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
