"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-12 max-w-lg w-full text-center space-y-8">
        <div className="relative">
          <h1 className="font-display text-9xl font-bold text-[#E11D48]/20">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 text-[#E11D48]" />
          </div>
        </div>
        
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">Page Not Found</h2>
          <p className="text-[#A09B8C]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white rounded-xl font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/browse"
            className="flex items-center justify-center gap-2 px-6 py-3 glass hover:bg-white/10 text-white rounded-xl font-semibold transition-colors"
          >
            <Search className="w-4 h-4" />
            Browse Companions
          </Link>
        </div>

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-[#A09B8C] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    </div>
  );
}
