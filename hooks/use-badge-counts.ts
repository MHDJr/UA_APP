"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface BadgeCounts {
  pendingRequests: number;
  victories: number;
}

export function useBadgeCounts() {
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({
    pendingRequests: 0,
    victories: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchBadgeCounts = async (isMounted: boolean = true) => {
    try {
      // Fetch data in parallel
      const today = new Date().toISOString().split('T')[0];
      const [pendingRes, victoriesRes] = await Promise.all([
        supabase.from("requests").select("*", { count: "exact", head: true }).eq("status", "pending").eq("signal_cleared", false),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed").gte("updated_at", today)
      ]);

      if (isMounted) {
        setBadgeCounts({
          pendingRequests: pendingRes.count || 0,
          victories: victoriesRes.count || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching badge counts:", error);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let debounceTimer: NodeJS.Timeout;
    let subscriptions: any[] = [];

    const debouncedFetch = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (isMounted) fetchBadgeCounts(isMounted);
      }, 500); // 500ms debounce
    };

    const setupSubscriptions = () => {
      // Clear existing
      subscriptions.forEach(s => s.unsubscribe());
      
      console.log('Setting up badge count realtime subscriptions...');
      const requestsSub = supabase
        .channel("badge-requests-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "requests" }, debouncedFetch)
        .subscribe();

      const tasksSub = supabase
        .channel("badge-tasks-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, debouncedFetch)
        .subscribe();
        
      subscriptions = [requestsSub, tasksSub];
    };

    fetchBadgeCounts(isMounted);
    setupSubscriptions();

    // Refresh counts every 60 seconds as fallback
    const interval = setInterval(() => {
      if (isMounted) fetchBadgeCounts(isMounted);
    }, 60000);

    // Listen for global resync event
    const handleResync = () => {
      if (isMounted) fetchBadgeCounts(isMounted);
    };

    // Listen for reconnection event
    const handleReconnect = () => {
      if (isMounted) setupSubscriptions();
    };

    window.addEventListener("academyos-global-resync", handleResync);
    window.addEventListener("academyos-reconnect-realtime", handleReconnect);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
      subscriptions.forEach(s => s.unsubscribe());
      clearInterval(interval);
      window.removeEventListener("academyos-global-resync", handleResync);
      window.removeEventListener("academyos-reconnect-realtime", handleReconnect);
    };
  }, []);

  return { badgeCounts, loading, refetch: fetchBadgeCounts };
}
