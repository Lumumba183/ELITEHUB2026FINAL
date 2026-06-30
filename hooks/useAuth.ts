"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types/database";

export function useAuth() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_id", user.id)
        .single();

      setDbUser(data || null);
      setLoading(false);
    }

    if (clerkLoaded) {
      fetchUser();
    }
  }, [user, clerkLoaded]);

  return {
    user,
    dbUser,
    loading: loading || !clerkLoaded,
    isAuthenticated: !!user,
    isAdmin: dbUser?.role === "admin",
    isCompanion: dbUser?.role === "companion",
    isClient: dbUser?.role === "client",
  };
}
