"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function CEOSalesPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !profile || profile.role !== "ceo")) {
            router.push("/");
        }
    }, [user, profile, loading, router]);

    if (loading || !profile || profile.role !== "ceo") {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full" />
            </div>
        );
    }

    return <div>Sales Page Coming Soon</div>;
}
