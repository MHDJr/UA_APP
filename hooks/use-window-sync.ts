"use client";

import { useEffect, useRef } from "react";
import { focusManager, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { App } from "@capacitor/app";

// Throttling duration: 30 seconds cooldown between automatic focus syncs
const SYNC_THROTTLE_MS = 30000;

/**
 * Hook to synchronize application state with the backend when the window/app
 * gains focus or visibility. Optimized with cooldown throttle and safe connection resurrection.
 */
export const useWindowSync = () => {
    const queryClient = useQueryClient();
    const lockRef = useRef(false);
    const lastSyncTimeRef = useRef<number>(0);

    useEffect(() => {
        const handleSync = async () => {
            const now = Date.now();
            
            // Check throttle cooldown
            if (now - lastSyncTimeRef.current < SYNC_THROTTLE_MS) {
                console.log(`[Sync Throttled] Skipping refetch, last sync was ${((now - lastSyncTimeRef.current) / 1000).toFixed(1)}s ago.`);
                return;
            }

            if (lockRef.current) return;
            lockRef.current = true;

            try {
                console.log("[Sync Engine] Tab focused or active. Reactivating system thread...");
                
                // Alert TanStack Query that the app is focused
                focusManager.setFocused(true);
                
                // Smart active query refetch. This gracefully cancels previous fetches and gets new data
                await queryClient.refetchQueries(
                    { type: "active" },
                    { cancelRefetch: true }
                );

                // Update the last sync timestamp
                lastSyncTimeRef.current = Date.now();

                // WebSocket Health check: Ensure socket is connected
                if (supabase.realtime) {
                    if (!supabase.realtime.isConnected()) {
                        console.log("Supabase Realtime socket is disconnected. Reconnecting...");
                        supabase.realtime.connect();
                    } else {
                        console.log("Supabase Realtime socket is connected.");
                    }
                }

                // Check for explicitly errored or closed channels to recover them
                const channels = supabase.getChannels();
                const erroredChannels = channels.filter(ch => ch.state === "errored" || ch.state === "closed");
                
                if (erroredChannels.length > 0 || channels.length === 0) {
                    console.log(`[Sync Engine] Removing ${erroredChannels.length} stalled or missing channels...`);
                    for (const ch of erroredChannels) {
                        try {
                            await supabase.removeChannel(ch);
                        } catch (e) {
                            console.warn("Failed to remove stalled channel:", e);
                        }
                    }
                    if (channels.length === 0) {
                        await supabase.removeAllChannels().catch(() => {});
                    }
                    if (typeof window !== "undefined") {
                        console.log("Emitting global supabase-channels-reset event...");
                        window.dispatchEvent(new Event("supabase-channels-reset"));
                    }
                } else {
                    console.log("All Supabase channels are healthy. Skipping re-initialization.");
                }

                // Seamless global resync event for other tab-resilient components
                if (typeof window !== "undefined") {
                    console.log("Emitting global academyos-global-resync event...");
                    window.dispatchEvent(new CustomEvent("academyos-global-resync"));
                }

            } catch (err) {
                console.error("Failed to synchronize application state:", err);
            } finally {
                lockRef.current = false;
            }
        };

        // --- Browser Events ---
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                handleSync();
            }
        };

        const handleFocus = () => {
            if (document.visibilityState === "visible") {
                handleSync();
            }
        };

        window.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("focus", handleFocus);

        // --- Capacitor (Native) Events ---
        let appStateListener: any;
        const initCapacitor = async () => {
            if (typeof window !== "undefined" && (window as any).Capacitor) {
                appStateListener = await App.addListener("appStateChange", ({ isActive }) => {
                    if (isActive) {
                        handleSync();
                    }
                });
            }
        };
        initCapacitor();

        return () => {
            window.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("focus", handleFocus);
            if (appStateListener) {
                appStateListener.remove();
            }
        };
    }, [queryClient]);
};
