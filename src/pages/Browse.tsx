import { useState } from "react";
import { Link } from "react-router";
import { Search, MapPin, SlidersHorizontal, Star, MessageCircle, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

export default function Browse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = trpc.user.search.useQuery({
    query: searchQuery || undefined,
    location: location || undefined,
    role: "companion",
    limit: 24,
  });

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-gradient-crimson" style={{ fontFamily: "'Playfair Display', serif" }}>
              EliteHub
            </span>
            <div className="w-2 h-2 rounded-full bg-[#E11D48]" />
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#F5E6D3]">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1
          className="text-3xl font-bold text-[#F5E6D3] mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Discover Companions
        </h1>
        <p className="text-sm text-[#9CA3AF] mb-8">
          Browse and connect with elite companions worldwide
        </p>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="pl-10 bg-[#14141E] border-white/10 text-[#F5E6D3] placeholder:text-[#9CA3AF]/50 focus:border-[#E11D48]/30 h-11"
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by location..."
              className="pl-10 bg-[#14141E] border-white/10 text-[#F5E6D3] placeholder:text-[#9CA3AF]/50 focus:border-[#E11D48]/30 h-11"
            />
          </div>
          <Button
            variant="outline"
            className="border-white/10 text-[#9CA3AF] hover:text-[#F5E6D3] hover:bg-white/5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass glass-border rounded-xl overflow-hidden animate-pulse">
                <div className="h-[280px] bg-[#1E1E2D]" />
                <div className="p-4 space-y-2">
                  <div className="w-2/3 h-4 bg-[#1E1E2D] rounded" />
                  <div className="w-1/2 h-3 bg-[#1E1E2D] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-[#9CA3AF] mb-4">
              {data?.total ?? 0} companions found
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.items.map((companion) => (
                <div
                  key={companion.id}
                  className="glass glass-border rounded-xl overflow-hidden hover:border-[#E11D48]/20 transition-all group"
                >
                  <div className="relative h-[280px] overflow-hidden">
                    <img
                      src={companion.avatar ?? "/assets/companion-avatar-1.jpg"}
                      alt={companion.name ?? "Companion"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {companion.isFeatured && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-medium gradient-gold text-[#0A0A0F] flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-[#F5E6D3]">{companion.name}</h3>
                        <p className="text-xs text-[#9CA3AF] flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {companion.location}
                        </p>
                      </div>
                      {companion.age && (
                        <span className="text-xs text-[#9CA3AF] bg-white/5 px-2 py-1 rounded-full">
                          {companion.age}
                        </span>
                      )}
                    </div>
                    {companion.bio && (
                      <p className="text-xs text-[#9CA3AF] line-clamp-2 mb-4">{companion.bio}</p>
                    )}
                    <div className="flex gap-2">
                      <Link to="/messages" className="flex-1">
                        <Button
                          size="sm"
                          className="w-full gradient-crimson text-white border-0 hover:opacity-90 text-xs"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" /> Message
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#D4A574]/30 text-[#D4A574] hover:bg-[#D4A574]/10 text-xs"
                      >
                        <Gift className="w-3 h-3 mr-1" /> Gift
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {data?.items.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#9CA3AF] text-lg mb-2">No companions found</p>
                <p className="text-sm text-[#9CA3AF]/60">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
