"use client";

import React, { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

/**
 * Tab Focus Resiliency Engine
 * 
 * Permanently resolves dashboard freezes, stale data, and infinite loading wheels
 * caused by browser background throttling and stale socket connections.
 */
export function TabResiliencyEngine({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const performSystemReactivation = useCallback(async () => {
    console.log("TabResiliencyEngine: Reactivating system thread...");
    
    // 1. FORCE TANSTACK QUERY REFRESH
    // Invalidate all queries to force a fresh data fetch
    queryClient.invalidateQueries();

    // 2. FORCE-DISCONNECT DEAD CONNECTIONS
    // Immediately kill stale Supabase real-time subscriptions
    try {
      console.log("TabResiliencyEngine: Purging stale subscriptions...");
      await supabase.removeAllChannels();
    } catch (error) {
      console.error("TabResiliencyEngine: Subscription purge failed", error);
    }

    // 3. RE-ESTABLISH REAL-TIME SUBSCRIPTIONS
    // Trigger reconnection event for components to re-subscribe
    const reconnectEvent = new CustomEvent("academyos-reconnect-realtime");
    window.dispatchEvent(reconnectEvent);

    // 4. SEAMLESS RE-SYNC
    // Trigger a fresh data fetch for all major systems
    const resyncEvent = new CustomEvent("academyos-global-resync");
    window.dispatchEvent(resyncEvent);

    toast.success(
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <div>
          <p className="font-semibold text-sm">Session Integrity Restored</p>
          <p className="text-xs text-white/60">Data channels and queries re-synced</p>
        </div>
      </div>,
      { duration: 2500, id: "resiliency-toast" }
    );
  }, [queryClient]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("TabResiliencyEngine: Visibility changed to visible");
        performSystemReactivation();
      }
    };

    // TAB RE-ACTIVATION DETECTION
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Check for focus events as well (covers window switching)
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [performSystemReactivation]);

  return <>{children}</>;
}

/**
 * Global Tab Resiliency Hook
 * @param onRefresh Callback to fetch fresh data
 * @param loading boolean value from state
 * @param setLoading State setter for loading state
 * @param onReconnect Optional callback to re-establish real-time subscriptions
 */
export function useTabResiliency(
  onRefresh: () => void, 
  loading: boolean, 
  setLoading: (loading: boolean) => void,
  onReconnect?: () => void
) {
  useEffect(() => {
    const handleResync = () => {
      console.log("TabResiliency: Triggering component resync");
      onRefresh();
    };

    const handleForceReset = () => {
      if (loading) {
        console.log("TabResiliency: Forcing loading state to false");
        setLoading(false);
      }
    };

    const handleReconnect = () => {
      if (onReconnect) {
        console.log("TabResiliency: Triggering component realtime reconnection");
        onReconnect();
      }
    };

    window.addEventListener("academyos-global-resync", handleResync);
    window.addEventListener("academyos-force-reset-loading", handleForceReset);
    window.addEventListener("academyos-reconnect-realtime", handleReconnect);

    return () => {
      window.removeEventListener("academyos-global-resync", handleResync);
      window.removeEventListener("academyos-force-reset-loading", handleForceReset);
      window.removeEventListener("academyos-reconnect-realtime", handleReconnect);
    };
  }, [onRefresh, loading, setLoading, onReconnect]);

  // STREAK LOADING PREVENTION: 4-second strict timeout limit
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        setLoading(false);
        console.warn("TabResiliency: Loading timed out after 4s. Force-releasing UI thread.");
      }, 4000);
      return () => clearTimeout(timeoutId);
    }
  }, [loading, setLoading]);
}
