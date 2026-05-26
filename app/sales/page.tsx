"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SalesReportingPage } from "@/components/sales-reporting-page";

export default function SalesPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || !profile || (profile.role !== "ceo" && profile.role !== "sales" && profile.department !== "Sales" && !profile.is_sales_staff))) {
            router.push("/");
        }
    }, [user, profile, loading, router]);

    if (loading || !profile || (profile.role !== "ceo" && profile.role !== "sales" && profile.department !== "Sales" && !profile.is_sales_staff)) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400 uppercase font-black tracking-widest text-[10px]" style={{ backgroundColor: "#F4F7FE" }}>
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin h-8 w-8 border-2 border-[#2F1E73]/20 border-t-[#2F1E73] rounded-full" />
                    Loading Sales Command...
                </div>
            </div>
        );
    }

    return <SalesReportingPage />;
}
