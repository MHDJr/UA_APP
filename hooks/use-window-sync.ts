"use client";

import { useEffect, useRef } from "react";
import { focusManager, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { App } from "@capacitor/app";

/**
 * Hook to synchronize application state with the backend when the window/app
 * gains focus or visibility.
 */
export const useWindowSync = () => {
    const queryClient = useQueryClient();
    const lockRef = useRef(false);

    useEffect(() => {
        const handleSync = async () => {
            if (lockRef.current) return;
            lockRef.current = true;

            try {
                // Alert TanStack Query that the app is focused
                focusManager.setFocused(true);
                
                // Force an instant database re-fetch for all active queries
                await queryClient.invalidateQueries({ refetchType: "active" });

                // Loop through channels and ONLY execute removeAllChannels if at least one channel is NOT joined or missing
                const channels = supabase.getChannels();
                const hasChokedChannel = channels.some(ch => ch.state !== "joined");
                
                if (hasChokedChannel || channels.length === 0) {
                    console.log("Removing all Supabase channels due to stalled or missing connection...");
                    await supabase.removeAllChannels();
                    if (typeof window !== "undefined") {
                        console.log("Emitting global supabase-channels-reset event...");
                        window.dispatchEvent(new Event("supabase-channels-reset"));
                    }
                } else {
                    console.log("All Supabase channels are healthy and 'joined'. Skipping teardown.");
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
