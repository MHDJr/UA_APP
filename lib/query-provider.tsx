"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
