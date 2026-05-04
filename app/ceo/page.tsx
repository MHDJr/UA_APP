"use client";

import { ExecutiveCommand } from "@/components/executive-command";
import { CEOSidebar } from "@/components/ceo-sidebar";
import { StaffManagement } from "@/components/staff-management";
import { CEOInbox } from "@/components/ceo-inbox";
import { ExecutiveSalesOverview } from "@/components/executive-sales-overview";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { MobileFAB } from "@/components/mobile-fab";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";

type CEOView = "command-center" | "inbox" | "staff-management" | "sales-intelligence" | "financial-intelligence";

export default function CEOPage() {
    const { profile, loading } = useAuth();
    const router = useRouter();
    const [activeView, setActiveView] = useState<CEOView>("command-center");
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);

    useEffect(() => {
        if (!loading && profile && profile.role !== "ceo") {
            router.replace("/");
        }
    }, [profile, loading, router]);

    // Navigate to external pages when specific views are selected
    useEffect(() => {
        if (activeView === "financial-intelligence") {
            router.push("/ceo/financial-intelligence");
        } else if (activeView === "sales-intelligence") {
            router.push("/ceo/sales");
        }
    }, [activeView, router]);

    if (loading || !profile || profile.role !== "ceo") {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full" />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeView) {
            case "inbox":
                return <CEOInbox />;
            case "staff-management":
                return <StaffManagement />;
            case "sales-intelligence":
                return <ExecutiveSalesOverview />;
            case "command-center":
            default:
                return <ExecutiveCommand currentView={activeView} />;
        }
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-[#F9FAFB] overflow-x-hidden">
                {/* Desktop Sidebar - Hidden on mobile */}
                <div className="hidden md:block">
                    <CEOSidebar
                        activeView={activeView}
                        onViewChange={(view) => setActiveView(view as CEOView)}
                        onMinimizedChange={setIsSidebarMinimized}
                    />
                </div>

                {/* Mobile Bottom Navigation */}
                <MobileBottomNav
                    activeView={activeView}
                    onViewChange={(view) => setActiveView(view as CEOView)}
                />

                {/* Mobile FAB */}
                <MobileFAB variant="default" />

                {/* Main Content Area */}
                <main 
                    className="min-h-screen transition-all duration-300 ease-out ml-0 md:ml-[80px] pt-[60px] md:pt-0"
                >
                    {renderContent()}
                </main>
            </div>
        </TooltipProvider>
    );
}
