"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Calendar, Mail, TrendingUp, Wallet, Menu, X, LogOut, Settings, User, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBadgeCounts } from "@/hooks/use-badge-counts";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const mainNavItems: NavItem[] = [
    { id: "command-center", label: "Dashboard", icon: LayoutDashboard },
    { id: "directive-intelligence", label: "Directives", icon: Brain },
    { id: "financial-intelligence", label: "Finance", icon: Wallet },
    { id: "sales-intelligence", label: "Sales", icon: TrendingUp },
    { id: "staff-management", label: "Staff", icon: Users },
    { id: "inbox", label: "Messages", icon: Mail },
];

interface MobileBottomNavProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export function MobileBottomNav({ activeView, onViewChange }: MobileBottomNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { badgeCounts } = useBadgeCounts();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const handleNavClick = (id: string) => {
        if (id === "financial-intelligence") {
            router.push("/ceo/financial-intelligence");
        } else if (id === "directive-intelligence") {
            router.push("/ceo/directive-intelligence");
        } else {
            onViewChange(id);
        }
    };

    // Get badge count based on item ID
    const getBadgeCount = (id: string) => {
        switch (id) {
            case "staff-management":
                return badgeCounts.pendingRequests;
            case "inbox":
                return badgeCounts.victories;
            default:
                return 0;
        }
    };

    return (
        <>
            {/* Mobile Header - Sticky */}
            <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
                <div className="backdrop-blur-xl bg-white/90 border-b border-gray-200/50 px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                            >
                                <span className="text-white font-black text-xs tracking-wider">UA</span>
                            </div>
                            <span
                                className="font-bold text-base"
                                style={{ color: BRAND_COLORS.indigo }}
                            >
                                AcademyOS
                            </span>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {/* Hamburger Menu Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 active:scale-95"
                                style={{ touchAction: "manipulation" }}
                            >
                                {isMenuOpen ? (
                                    <X className="w-5 h-5 text-gray-700" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-700" />
                                )}
                            </button>

                            {/* Profile Avatar */}
                            <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                                <AvatarImage src="/images/ceo.jpeg" alt="CEO" />
                                <AvatarFallback
                                    className="text-white text-xs font-bold"
                                    style={{ backgroundColor: BRAND_COLORS.indigo }}
                                >
                                    SP
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hamburger Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed top-[60px] right-4 left-4 z-50 md:hidden"
                        >
                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                {/* Menu Items */}
                                <div className="p-2">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-100 mb-2">
                                        <p className="font-bold text-gray-900">SALIM PA</p>
                                        <p className="text-xs text-gray-500">Chief Executive Officer</p>
                                    </div>

                                    {/* Secondary Nav Items */}
                                    <button
                                        onClick={() => {
                                            onViewChange("scheduled-meetings");
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <Calendar className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Scheduled Meetings</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <Settings className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Settings</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <User className="w-5 h-5 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-700">Profile</span>
                                    </button>
                                </div>

                                {/* Logout Button */}
                                <div className="p-2 border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-5 h-5 text-red-600" />
                                        <span className="text-sm font-medium text-red-600">Logout</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
                <div className="backdrop-blur-xl bg-white/90 border-t border-gray-200/50 px-1 sm:px-2 py-2 pb-safe">
                    <div className="flex items-center justify-between sm:justify-around">
                        {mainNavItems.map((item) => {
                            const isActive = activeView === item.id;
                            const Icon = item.icon;
                            const badgeCount = getBadgeCount(item.id);

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1 flex-1 sm:flex-initial sm:min-w-[64px] py-2 px-1 sm:px-2 rounded-2xl transition-all duration-200 active:scale-95",
                                        isActive
                                            ? "bg-[#31267D]/10"
                                            : "hover:bg-gray-50"
                                    )}
                                    style={{ touchAction: "manipulation" }}
                                >
                                    <div className="relative">
                                        <Icon
                                            className="w-5 h-5 sm:w-6 sm:h-6 transition-colors"
                                            style={{
                                                color: isActive ? BRAND_COLORS.indigo : "#9CA3AF",
                                            }}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />
                                        {/* Badge */}
                                        {badgeCount > 0 && (
                                            <span
                                                className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 px-0.5 sm:px-1 rounded-full text-[9px] sm:text-[10px] font-bold text-white"
                                                style={{ backgroundColor: BRAND_COLORS.orange }}
                                            >
                                                {badgeCount > 99 ? "99+" : badgeCount}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[10px] sm:text-[11px] font-medium transition-colors truncate max-w-[60px] sm:max-w-none",
                                            isActive ? "text-[#31267D]" : "text-gray-400"
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Spacer for bottom nav */}
            <div className="h-[80px] md:hidden" />
        </>
    );
}

export default MobileBottomNav;
