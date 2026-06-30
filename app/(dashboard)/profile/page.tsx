"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Camera,
  Save,
  Check,
  X,
  Loader2,
  User,
  MapPin,
  Phone,
  FileText,
  Crown,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, dbUser, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (dbUser) {
      setDisplayName(dbUser.display_name || "");
      setBio(dbUser.bio || "");
      setLocation(dbUser.location || "");
      setPhoneNumber(dbUser.phone_number || "");
      setHourlyRate(dbUser.hourly_rate?.toString() || "");
    }
  }, [dbUser]);

  async function saveProfile() {
    if (!dbUser) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("users")
      .update({
        display_name: displayName,
        bio,
        location,
        phone_number: phoneNumber,
        hourly_rate: parseFloat(hourlyRate) || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", dbUser.id);

    if (error) {
      toast.error("Failed to save profile");
    } else {
      toast.success("Profile updated successfully");
    }
    setIsSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E11D48]" />
      </div>
    );
  }

  const isCompanion = dbUser?.role === "companion";
  const isAdmin = dbUser?.role === "admin";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Profile</h1>
        <p className="text-[#A09B8C]">Manage your profile and settings</p>
      </div>

      {/* Avatar */}
      <div className="glass rounded-2xl p-6 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-[#E11D48]/10 flex items-center justify-center relative overflow-hidden">
          {user?.imageUrl ? (
            <Image src={user.imageUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            <User className="w-12 h-12 text-[#E11D48]" />
          )}
        </div>
        <div>
          <h2 className="font-semibold text-xl">{dbUser?.display_name || user?.firstName || "User"}</h2>
          <p className="text-[#A09B8C] capitalize">{dbUser?.role || "Member"}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              dbUser?.subscription_status === "active"
                ? "bg-green-500/10 text-green-400"
                : "bg-[#A09B8C]/10 text-[#A09B8C]"
            }`}>
              {dbUser?.subscription_status || "Inactive"}
            </span>
            {dbUser?.is_featured && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E11D48]/10 text-[#E11D48] flex items-center gap-1">
                <Star className="w-3 h-3" /> Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass rounded-2xl p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] focus:outline-none focus:border-[#E11D48]/50"
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09B8C]" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] focus:outline-none focus:border-[#E11D48]/50"
                placeholder="Nairobi, Kenya"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09B8C]" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] focus:outline-none focus:border-[#E11D48]/50"
                placeholder="+254 7XX XXX XXX"
              />
            </div>
          </div>
          {isCompanion && (
            <div>
              <label className="block text-sm font-medium mb-2">Hourly Rate (KES)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] focus:outline-none focus:border-[#E11D48]/50"
                placeholder="5000"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-[#A09B8C]" />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A2E] border border-white/10 rounded-xl text-[#F5E6D3] focus:outline-none focus:border-[#E11D48]/50 h-32 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-[#E11D48] hover:bg-[#E11D48]/90 disabled:bg-[#E11D48]/50 text-white rounded-xl font-semibold transition-colors"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Subscription</h3>
          <span className="capitalize px-3 py-1 rounded-full text-xs font-semibold bg-[#A09B8C]/10 text-[#A09B8C]">
            {dbUser?.subscription_status || "Inactive"}
          </span>
        </div>
        <p className="text-[#A09B8C] text-sm">
          {dbUser?.subscription_status === "active"
            ? "Your subscription is active. Enjoy full access to the platform."
            : "Your subscription is inactive. Please renew to access all features."}
        </p>
      </div>
    </div>
  );
}
