"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSupabaseRealtime(
  channelName: string,
  eventFilter: string,
  callback: (payload: any) => void
) {
  const supabase = createClient();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "*", schema: "public", ...parseFilter(eventFilter) }, (payload) => {
        callbackRef.current(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, eventFilter]);
}

function parseFilter(filter: string) {
  const parts = filter.split("=");
  if (parts.length === 2) {
    return { [parts[0]]: parts[1] };
  }
  return {};
}
