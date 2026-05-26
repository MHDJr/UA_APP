"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, useEffect } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Default staleTime is 0, meaning data is immediately considered stale
            staleTime: 0,
            // Re-validate on window focus by default
            refetchOnWindowFocus: true,
            // Automatically refetch every 2 minutes to keep data fresh "forever"
            refetchInterval: 120000,
            // Retry twice on failure
            retry: 2,
            // Keep previous data while fetching new data to avoid jarring loading spinners
            placeholderData: (previousData: any) => previousData,
          },
        },
      })
  );

  // Global Visibility & Focus Listener Hook for High-Performance Native Rehydration
  useEffect(() => {
    const handleFocus = () => {
      // Re-hydrate only if the document is visible
      if (document.visibilityState === 'visible') {
        console.log("Global Visibility Focus: Rehydrating application states");
        
        // 1. Force a silent background fetch of all global states natively using QueryClient
        queryClient.invalidateQueries();

        // 2. Attempt to resurrect Supabase Realtime channels if they went stale due to OS thread sleep
        if (typeof navigator !== 'undefined' && navigator.onLine) {
            import("@/lib/supabase").then(({ supabase }) => {
                try {
                    supabase.realtime.connect();
                } catch (e) {
                    console.error("Failed to re-initialize realtime", e);
                }
            });
        }
      }
    };

    if (typeof document !== 'undefined') {
        document.addEventListener("visibilitychange", handleFocus);
    }
    if (typeof window !== 'undefined') {
        window.addEventListener("focus", handleFocus);
    }

    return () => {
        if (typeof document !== 'undefined') {
            document.removeEventListener("visibilitychange", handleFocus);
        }
        if (typeof window !== 'undefined') {
            window.removeEventListener("focus", handleFocus);
        }
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
