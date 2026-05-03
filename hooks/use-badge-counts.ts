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
      setLoading(true);

      // Fetch pending requests count
      const { count: pendingCount, error: pendingError } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending")
        .eq("signal_cleared", false);

      if (pendingError) throw pendingError;

      // Fetch victories count (completed tasks today as victories)
      const today = new Date().toISOString().split('T')[0];
      const { count: victoriesCount, error: victoriesError } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("updated_at", today);

      if (victoriesError) throw victoriesError;

      if (isMounted) {
        setBadgeCounts({
          pendingRequests: pendingCount || 0,
          victories: victoriesCount || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching badge counts:", error);
      // Set default values on error
      if (isMounted) {
        setBadgeCounts({
          pendingRequests: 0,
          victories: 0,
        });
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchBadgeCounts(isMounted);

    // Set up real-time subscriptions
    const requestsSubscription = supabase
      .channel("badge-requests-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "requests",
          filter: "status=eq.pending",
        },
        () => {
          if (isMounted) fetchBadgeCounts(isMounted);
        }
      )
      .subscribe();

    const tasksSubscription = supabase
      .channel("badge-tasks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: "status=eq.completed",
        },
        () => {
          if (isMounted) fetchBadgeCounts(isMounted);
        }
      )
      .subscribe();

    // Refresh counts every 30 seconds as fallback
    const interval = setInterval(() => {
      if (isMounted) fetchBadgeCounts(isMounted);
    }, 30000);

    return () => {
      isMounted = false;
      requestsSubscription.unsubscribe();
      tasksSubscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { badgeCounts, loading, refetch: fetchBadgeCounts };
}
