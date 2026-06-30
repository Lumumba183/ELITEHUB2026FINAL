"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Star, MapPin, Filter, Heart, SlidersHorizontal, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Companion {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  location: string | null;
  hourly_rate: number | null;
  is_featured: boolean;
  bio: string | null;
  subscription_status: string;
}

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchCompanions() {
      const { data } = await supabase
        .from("users")
        .select("id, display_name, avatar_url, location, hourly_rate, is_featured, bio, subscription_status")
        .eq("role", "companion")
        .eq("subscription_status", "active")
        .order("is_featured", { ascending: false });

      setCompanions(data || []);
      setLoading(false);
    }

    fetchCompanions();
  }, []);

  const filtered = companions.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      (c.display_name || "").toLowerCase().includes(q) ||
      (c.location || "").toLowerCase().includes(q) ||
      (c.bio || "").toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "featured") return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    if (sortBy === "price_low") return (a.hourly_rate || 0) - (b.hourly_rate || 0);
    if (sortBy === "price_high") return (b.hourly_rate || 0) - (a.hourly_rate || 0);
    return 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Browse Companions</h1>
        <p className="text-[#A09B8C]">Discover and connect with verified elite companions</p>
      </div>

      <div className="glass rounded-2xl p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09B8C]" />
            <input
              type="text"
              placeholder="Search by name, location, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] placeholder:text-[#A09B8C]/60 focus:outline-none focus:border-[#E11D48]/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 glass rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {[
              { value: "featured", label: "Featured" },
              { value: "price_low", label: "Price: Low to High" },
              { value: "price_high", label: "Price: High to Low" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  sortBy === opt.value
                    ? "bg-[#E11D48] text-white"
                    : "glass hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[3/4] bg-[#1A1A2E]" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-[#1A1A2E] rounded w-2/3" />
                <div className="h-3 bg-[#1A1A2E] rounded w-1/2" />
                <div className="h-3 bg-[#1A1A2E] rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sorted.map((companion) => (
            <div
              key={companion.id}
              className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-all group"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={companion.avatar_url || "/assets/companion-avatar-1.jpg"}
                  alt={companion.display_name || "Companion"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />

                {companion.is_featured && (
                  <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-[#E11D48] text-white text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Featured
                  </div>
                )}

                <button className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center hover:bg-[#E11D48]/20 transition-colors">
                  <Heart className="w-4 h-4 text-white" />
                </button>

                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-semibold text-lg">{companion.display_name || "Unnamed"}</p>
                  <div className="flex items-center gap-1 text-[#A09B8C] text-sm">
                    <MapPin className="w-3 h-3" />
                    {companion.location || "Nairobi, Kenya"}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-[#A09B8C] line-clamp-2 mb-3">
                  {companion.bio || "Elite companion ready to create unforgettable experiences."}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[#E11D48] font-semibold">
                    {formatCurrency(companion.hourly_rate || 5000)}/hr
                  </span>
                  <Link
                    href={`/messages?new=${companion.id}`}
                    className="px-4 py-2 rounded-full bg-[#E11D48] hover:bg-[#E11D48]/90 text-white text-sm font-semibold transition-colors"
                  >
                    Message
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Search className="w-12 h-12 text-[#A09B8C] mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No companions found</h3>
          <p className="text-[#A09B8C]">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
