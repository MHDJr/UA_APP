"use client";

import { useAuth } from "@/lib/auth-context";
import { ManagerOperationsCommand } from "@/components/manager/ManagerOperationsCommand";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ManagerPage() {
    const { profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && profile) {
            // Only allow managers or CEO to access
            if (!profile.is_manager && profile.role !== "ceo") {
                router.replace("/");
            }
        }
    }, [profile, loading, router]);

    if (loading || !profile) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span className="text-xs font-light tracking-[0.2em] text-slate-500 uppercase">
                        Verifying Access...
                    </span>
                </div>
            </div>
        );
    }

    // Check if user has access
    if (!profile.is_manager && profile.role !== "ceo") {
        return null;
    }

    return <ManagerOperationsCommand />;
}
