"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mail, TrendingUp, Wallet, Menu, X, LogOut, Settings, User, Brain, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBadgeCounts } from "@/hooks/use-badge-counts";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

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
    href?: string;
};

interface MobileBottomNavProps {
    activeView?: string;
    onViewChange?: (view: string) => void;
}

export function MobileBottomNav({ activeView, onViewChange }: MobileBottomNavProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { badgeCounts } = useBadgeCounts();
    const { profile, userRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    if (pathname === "/" || !profile) return null;

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const getNavItems = (): NavItem[] => {
        if (userRole === "CEO") {
            return [
                { id: "command-center", label: "CEO Hub", icon: LayoutDashboard, href: "/ceo" },
                { id: "financial-intelligence", label: "Finance", icon: Wallet, href: "/ceo/financial-intelligence" },
                { id: "sales-intelligence", label: "Sales", icon: TrendingUp, href: "/ceo/sales" },
                { id: "staff-management", label: "Staff", icon: Users, href: "/ceo" },
                { id: "inbox", label: "Messages", icon: Mail, href: "/ceo" },
            ];
        } else if (userRole === "MANAGER") {
            return [
                { id: "dashboard", label: "Manager", icon: LayoutDashboard, href: "/manager" },
                { id: "team", label: "Team", icon: Users, href: "/manager" }, 
                { id: "sales", label: "Sales", icon: TrendingUp, href: "/manager/sales" },
                { id: "messages", label: "Inbox", icon: Mail, href: "/manager" },
                { id: "profile", label: "Me", icon: User },
            ];
        } else {
            // Default STAFF
            return [
                { id: "home", label: "Home", icon: Home, href: "/staff" },
                { id: "tasks", label: "Tasks", icon: Brain, href: "/staff" },
                { id: "finance", label: "Finance", icon: Wallet, href: "/accounts" },
                { id: "messages", label: "Chat", icon: Mail, href: "/staff" },
                { id: "profile", label: "Me", icon: User },
            ];
        }
    };

    const navItems = getNavItems();

    const handleNavClick = (item: NavItem) => {
        if (item.href && pathname !== item.href) {
            router.push(item.href);
        } else if (onViewChange) {
            onViewChange(item.id);
        } else if (!item.href || pathname === item.href) {
            // Dispatch global event for pages that handle internal views
            window.dispatchEvent(new CustomEvent("nav-action", { detail: { view: item.id } }));
        }
    };

    // Get badge count based on item ID
    const getBadgeCount = (id: string) => {
        if (userRole === "CEO") {
            switch (id) {
                case "staff-management":
                    return badgeCounts.pendingRequests;
                case "inbox":
                    return badgeCounts.victories;
                default:
                    return 0;
            }
        }
        return 0;
    };

    return (
        <>
            {/* Mobile Header - Sticky */}
            <header className="fixed top-0 left-0 right-0 z-50 md:hidden">
                <div className="backdrop-blur-xl bg-white/95 border-b border-gray-200/50 px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                            >
                                <span className="text-white font-black text-xs tracking-wider">UA</span>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="font-bold text-sm leading-tight"
                                    style={{ color: BRAND_COLORS.indigo }}
                                >
                                    AcademyOS
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    {userRole} Portal
                                </span>
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {/* Hamburger Menu Button */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 active:scale-95 border border-gray-200/50"
                                style={{ touchAction: "manipulation" }}
                            >
                                {isMenuOpen ? (
                                    <X className="w-5 h-5 text-gray-700" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-700" />
                                )}
                            </button>

                            {/* Profile Avatar */}
                            <Avatar className="w-9 h-9 border-2 border-white shadow-md">
                                <AvatarImage 
                                    src={userRole === 'CEO' ? "/images/ceo.jpeg" : undefined} 
                                    alt={profile?.full_name || 'User'} 
                                />
                                <AvatarFallback
                                    className="text-white text-xs font-bold"
                                    style={{ backgroundColor: BRAND_COLORS.indigo }}
                                >
                                    {(profile?.full_name || 'U').split(' ').map(n => n[0]).join('')}
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
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="fixed top-[70px] right-4 left-4 z-[70] md:hidden"
                        >
                            <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
                                {/* Menu Items */}
                                <div className="p-3">
                                    {/* User Info */}
                                    <div className="px-5 py-4 border-b border-gray-100 mb-2 bg-gray-50/50 rounded-t-2xl">
                                        <p className="font-black text-[#31267D] text-lg leading-tight">{profile?.full_name?.toUpperCase()}</p>
                                        <p className="text-[10px] text-[#F14D24] font-black uppercase tracking-[0.2em] mt-1">{profile?.designation || userRole}</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            toast.info("Settings coming soon!");
                                        }}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                            <Settings className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 tracking-tight">System Settings</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            toast.info("Profile details coming soon!");
                                        }}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                            <User className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700 tracking-tight">Identity Profile</span>
                                    </button>
                                </div>

                                {/* Logout Button */}
                                <div className="p-3 border-t border-gray-100 bg-red-50/30">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-red-50 transition-colors group"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                                            <LogOut className="w-5 h-5 text-red-600" />
                                        </div>
                                        <span className="text-sm font-black text-red-600 uppercase tracking-widest">Terminate Session</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                <div className="mx-4 backdrop-blur-2xl bg-white/90 border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-[2rem] px-2 py-2">
                    <div className="flex items-center justify-between">
                        {navItems.map((item) => {
                            const isActive = activeView === item.id || (item.href && pathname === item.href);
                            const Icon = item.icon;
                            const badgeCount = getBadgeCount(item.id);
                            const isProfile = item.id === "profile";

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-2xl transition-all duration-300 active:scale-90",
                                        isActive
                                            ? "bg-[#31267D] text-white shadow-lg shadow-indigo-500/30"
                                            : "text-gray-400 hover:text-gray-600"
                                    )}
                                    style={{ touchAction: "manipulation" }}
                                >
                                    <div className="relative w-7 h-7 flex items-center justify-center">
                                        {isProfile ? (
                                            <div className={cn(
                                                "w-7 h-7 rounded-full border-2 overflow-hidden transition-all duration-300 flex items-center justify-center shadow-inner",
                                                isActive ? "border-white" : "border-gray-200"
                                            )}>
                                                <Avatar className="w-full h-full border-0">
                                                    <AvatarImage 
                                                        src={userRole === 'CEO' ? "/images/ceo.jpeg" : undefined} 
                                                        className="object-cover"
                                                    />
                                                    <AvatarFallback className="text-[10px] font-black bg-gray-100 text-gray-400 flex items-center justify-center">
                                                        {(profile?.full_name || 'U').split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        ) : (
                                            <Icon
                                                className={cn(
                                                    "w-5 h-5 transition-transform duration-300",
                                                    isActive ? "scale-110" : ""
                                                )}
                                                strokeWidth={isActive ? 2.5 : 2}
                                            />
                                        )}
                                        {/* Badge */}
                                        {badgeCount > 0 && (
                                            <span
                                                className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-black text-white ring-2 ring-white"
                                                style={{ backgroundColor: BRAND_COLORS.orange }}
                                            >
                                                {badgeCount > 99 ? "99+" : badgeCount}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-[8px] font-black uppercase tracking-[0.1em] transition-opacity duration-300",
                                            isActive ? "opacity-100" : "opacity-60"
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
            <div className="h-[calc(100px+env(safe-area-inset-bottom))] md:hidden" />
        </>
    );
}

export default MobileBottomNav;
