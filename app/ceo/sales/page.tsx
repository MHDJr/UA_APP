"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ExecutiveSalesOverview } from "@/components/executive-sales-overview";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { MobileFAB } from "@/components/mobile-fab";
import { CEOSidebar } from "@/components/ceo-sidebar";

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

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <CEOSidebar
                    activeView="sales-intelligence"
                    onViewChange={(view) => {
                        if (view === "sales-intelligence") {
                            return;
                        } else if (view === "financial-intelligence") {
                            router.push("/ceo/financial-intelligence");
                        } else {
                            router.push("/ceo");
                        }
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="md:ml-[80px] pt-[60px] md:pt-3 p-3 md:p-6 lg:p-8 pb-24 md:pb-8">
                <ExecutiveSalesOverview />
            </div>
            
            {/* Mobile Bottom Navigation */}
            <MobileBottomNav
                activeView="sales-intelligence"
                onViewChange={(view) => {
                    if (view === "command-center") {
                        router.push("/ceo");
                    } else if (view === "sales-intelligence") {
                        // Already on this page
                        return;
                    } else if (view === "financial-intelligence") {
                        router.push("/ceo/financial-intelligence");
                    } else if (view === "staff-management") {
                        router.push("/ceo");
                    } else if (view === "inbox") {
                        router.push("/ceo");
                    } else {
                        router.push("/ceo");
                    }
                }}
            />
            
            {/* Mobile FAB */}
            <MobileFAB variant="default" />
        </div>
    );
}
