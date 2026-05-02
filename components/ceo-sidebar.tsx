"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Mail, ChevronRight, ChevronLeft, TrendingUp, LogOut, Wallet } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useBadgeCounts } from "@/hooks/use-badge-counts";
import { supabase } from "@/lib/supabase";

// Brand colors
const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
};

type NavItem = {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
};

const navItems: NavItem[] = [
    {
        id: "command-center",
        label: "Command Center",
        icon: LayoutDashboard,
    },
    {
        id: "financial-intelligence",
        label: "Financial Intelligence",
        icon: Wallet,
    },
    {
        id: "sales-intelligence",
        label: "Sales Intelligence",
        icon: TrendingUp,
    },
    {
        id: "staff-management",
        label: "Staff Management",
        icon: Users,
    },
    {
        id: "scheduled-meetings",
        label: "Scheduled Meetings",
        icon: Calendar,
    },
    {
        id: "inbox",
        label: "Inbox",
        icon: Mail,
    },
];

interface CEOSidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
    onMinimizedChange?: (isMinimized: boolean) => void;
}

export function CEOSidebar({ activeView, onViewChange, onMinimizedChange }: CEOSidebarProps) {
    const [isMinimized, setIsMinimized] = useState(true);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const { badgeCounts } = useBadgeCounts();
    const router = useRouter();

    const handleToggleMinimized = () => {
        const newState = !isMinimized;
        setIsMinimized(newState);
        onMinimizedChange?.(newState);
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen flex flex-col z-50",
                "backdrop-blur-[12px] bg-white/80",
                "border-r border-black/[0.05]",
                "transition-all duration-300 ease-out"
            )}
            style={{ width: isMinimized ? 80 : 260 }}
        >
            {/* Header & Branding */}
            <div className={cn(
                "px-5 pt-6 pb-4",
                isMinimized && "px-3"
            )}>
                {/* Logo Section */}
                <div className={cn(
                    "flex items-center gap-3",
                    isMinimized && "justify-center"
                )}>
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: BRAND_COLORS.indigo }}
                    >
                        <span className="text-white font-black text-sm tracking-wider">UA</span>
                    </div>
                    {!isMinimized && (
                        <div className="flex flex-col">
                            <span
                                className="font-bold text-lg leading-tight tracking-tight"
                                style={{ color: BRAND_COLORS.indigo }}
                            >
                                AcademyOS
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                                Management Platform
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = activeView === item.id;
                        const isHovered = hoveredItem === item.id;
                        const Icon = item.icon;

                        // Get dynamic badge count based on item ID
                        const getBadgeCount = () => {
                            switch (item.id) {
                                case "staff-management":
                                    return badgeCounts.pendingRequests;
                                case "inbox":
                                    return badgeCounts.victories;
                                default:
                                    return 0;
                            }
                        };

                        const badgeCount = getBadgeCount();

                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onViewChange(item.id)}
                                    onMouseEnter={() => setHoveredItem(item.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={cn(
                                        "w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative",
                                        isMinimized ? "justify-center px-3 py-3.5" : "px-4 py-4",
                                        isActive
                                            ? "text-white"
                                            : isHovered
                                                ? "bg-[#31267D]/5"
                                                : "text-gray-500 hover:text-gray-700"
                                    )}
                                    style={{
                                        backgroundColor: isActive ? BRAND_COLORS.indigo : undefined,
                                    }}
                                    title={isMinimized ? item.label : undefined}
                                >
                                    <Icon
                                        className="w-5 h-5 flex-shrink-0"
                                        strokeWidth={2}
                                        style={{
                                            color: isActive ? "white" : isHovered ? BRAND_COLORS.indigo : undefined,
                                        }}
                                    />
                                    {!isMinimized && (
                                        <span
                                            className="text-sm font-medium flex-1 text-left"
                                            style={{ color: isActive ? "white" : undefined }}
                                        >
                                            {item.label}
                                        </span>
                                    )}
                                    {/* Badge */}
                                    {badgeCount > 0 && (
                                        <span
                                            className={cn(
                                                "flex items-center justify-center rounded-full text-[10px] font-bold text-white flex-shrink-0",
                                                isMinimized ? "absolute -top-1 -right-1 w-4 h-4" : "w-5 h-5"
                                            )}
                                            style={{ backgroundColor: BRAND_COLORS.orange }}
                                        >
                                            {!isMinimized && badgeCount > 99 ? "99+" : badgeCount}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Minimize Toggle Button */}
            <div className="px-3 pb-2">
                <button
                    onClick={handleToggleMinimized}
                    className="w-full flex items-center justify-center py-2 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-black/[0.03] transition-all duration-200"
                >
                    {isMinimized ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <ChevronLeft className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Footer Profile Section */}
            <div className="p-4 border-t border-black/[0.05] space-y-2">
                <button
                    className={cn(
                        "w-full flex items-center rounded-xl hover:bg-red-50 transition-all duration-200 group",
                        isMinimized ? "justify-center p-2" : "gap-3 p-3"
                    )}
                    onClick={handleLogout}
                    title={isMinimized ? "Logout" : undefined}
                >
                    <LogOut 
                        className="w-5 h-5 flex-shrink-0 text-red-600"
                        strokeWidth={2}
                    />
                    {!isMinimized && (
                        <>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-red-600">
                                    Logout
                                </p>
                            </div>
                        </>
                    )}
                </button>
                
                <button
                    className={cn(
                        "w-full flex items-center rounded-xl hover:bg-[#31267D]/5 transition-all duration-200 group",
                        isMinimized ? "justify-center p-2" : "gap-3 p-3"
                    )}
                    title={isMinimized ? "SALIM PA - CEO" : undefined}
                >
                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm flex-shrink-0">
                        <AvatarImage
                            src="/images/ceo.jpeg"
                            alt="SALIM PA"
                        />
                        <AvatarFallback
                            className="text-white text-sm font-bold"
                            style={{ backgroundColor: BRAND_COLORS.indigo }}
                        >
                            SP
                        </AvatarFallback>
                    </Avatar>
                    {!isMinimized && (
                        <>
                            <div className="flex-1 text-left">
                                <p
                                    className="text-sm font-bold"
                                    style={{ color: BRAND_COLORS.indigo }}
                                >
                                    SALIM PA
                                </p>
                                <p className="text-xs text-gray-400">CEO</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}

export default CEOSidebar;
