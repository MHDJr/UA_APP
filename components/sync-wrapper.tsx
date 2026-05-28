"use client";

import { useWindowSync } from "@/hooks/use-window-sync";

export function SyncWrapper({ children }: { children: React.ReactNode }) {
    useWindowSync();
    return <>{children}</>;
}
