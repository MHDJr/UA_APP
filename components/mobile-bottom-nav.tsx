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

    if (pathname === "/" || pathname?.startsWith("/mobile") || !profile) return null;

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const getNavItems = (): NavItem[] => {
        const homeHref = userRole === 'CEO' || userRole === 'MANAGER' ? '/ceo' : '/staff';
        
        const items: NavItem[] = [
            { id: 'dashboard', label: "HOME", icon: LayoutDashboard, href: homeHref },
            { id: 'financial', label: "FINANCE", icon: Wallet, href: '/ceo/financial-intelligence' },
            { id: 'sales', label: "SALES", icon: TrendingUp, href: '/ceo/sales' },
            { id: 'staff', label: "STAFF", icon: Users, href: userRole === 'CEO' ? '/ceo' : '/staff' },
            { id: 'inbox', label: "INBOX", icon: Mail, href: userRole === 'CEO' ? '/ceo' : '/staff' }
        ];

        return items;
    };

    const navItems = getNavItems();

    const handleNavClick = (item: NavItem) => {
        if (item.href && pathname !== item.href) {
            router.push(item.href);
        } else if (onViewChange) {
            onViewChange(item.id);
        } else {
            // Dispatch global event for pages that handle internal views
            window.dispatchEvent(new CustomEvent("nav-action", { detail: { view: item.id } }));
        }
    };

    // Get badge count based on item ID
    const getBadgeCount = (id: string) => {
        if (userRole === "CEO") {
            switch (id) {
                case "staff":
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
            <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-zinc-800/50 pt-[env(safe-area-inset-top,24px)]">
                <div className="px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20"
                            style={{ backgroundColor: BRAND_COLORS.indigo }}
                        >
                            <span className="text-white font-black text-xs tracking-wider">UA</span>
                        </div>
                        <div className="flex flex-col">
                            <span
                                className="font-bold text-sm leading-tight text-indigo-900 dark:text-indigo-100"
                            >
                                AcademyOS
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                {userRole} Portal
                            </span>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3">
                        {/* Profile Avatar */}
                        <Avatar className="w-8 h-8 border border-white/50 shadow-sm">
                            <AvatarImage 
                                src={userRole === 'CEO' ? "/images/ceo.jpeg" : undefined} 
                                alt={profile?.full_name || 'User'} 
                            />
                            <AvatarFallback
                                className="text-white text-[10px] font-bold"
                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                            >
                                {(profile?.full_name || 'U').split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>

                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center transition-all duration-200 active:scale-90 border border-gray-200/50 dark:border-zinc-700/50"
                            style={{ touchAction: "manipulation" }}
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                            )}
                        </button>
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
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed top-[calc(64px+env(safe-area-inset-top)+8px)] right-4 left-4 bottom-[calc(80px+env(safe-area-inset-bottom))] z-[70] md:hidden"
                        >
                            <div className="bg-white dark:bg-zinc-900 h-full rounded-[2rem] shadow-2xl border border-gray-100 dark:border-zinc-800 flex flex-col overflow-hidden">
                                {/* User Info Section */}
                                <div className="p-6 border-b border-gray-50 dark:border-zinc-800/50 bg-indigo-50/30 dark:bg-indigo-900/10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <Avatar className="w-16 h-16 border-4 border-white dark:border-zinc-800 shadow-xl">
                                            <AvatarImage 
                                                src={userRole === 'CEO' ? "/images/ceo.jpeg" : undefined} 
                                                alt={profile?.full_name || 'User'} 
                                            />
                                            <AvatarFallback
                                                className="text-white text-xl font-bold"
                                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                                            >
                                                {(profile?.full_name || 'U').split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-black text-indigo-900 dark:text-indigo-100 text-xl leading-tight">
                                                {profile?.full_name?.split(' ')[0].toUpperCase()}
                                            </p>
                                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em] mt-1">
                                                {profile?.designation || userRole}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-white/20">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                            <p className="text-xs font-black text-green-500 uppercase">Active</p>
                                        </div>
                                        <div className="bg-white/50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-white/20">
                                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Dept</p>
                                            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase">{profile?.department || 'HQ'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items - Scrollable */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            toast.info("Settings coming soon!");
                                        }}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-700 group-hover:shadow-md transition-all">
                                                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">System Preferences</span>
                                                <span className="block text-[10px] text-gray-400">Configure your workspace</span>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            toast.info("Profile details coming soon!");
                                        }}
                                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-zinc-700 group-hover:shadow-md transition-all">
                                                <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-bold text-gray-800 dark:text-gray-200">Account Identity</span>
                                                <span className="block text-[10px] text-gray-400">Manage your profile</span>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                {/* Logout Button */}
                                <div className="p-4 border-t border-gray-50 dark:border-zinc-800 bg-red-50/30 dark:bg-red-950/10">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg shadow-red-500/20 active:scale-95 group"
                                    >
                                        <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        <span className="text-sm font-black uppercase tracking-widest">Terminate Session</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar - Capsule Style */}
            <nav className="fixed bottom-5 left-4 right-4 z-50 md:hidden bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl h-16 flex items-center justify-around px-2">
                {navItems.map((item) => {
                    const isActive = activeView === item.id || (item.href && pathname === item.href);
                    const Icon = item.icon;
                    const badgeCount = getBadgeCount(item.id);

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 h-14 rounded-xl transition-all duration-300 active:scale-90",
                                isActive
                                    ? "text-orange-500 bg-white/5"
                                    : "text-zinc-400 hover:text-zinc-200"
                            )}
                            style={{ touchAction: "manipulation" }}
                        >
                            <div className="relative w-6 h-6 flex items-center justify-center">
                                <Icon
                                    className={cn(
                                        "w-5 h-5 transition-transform duration-300",
                                        isActive ? "scale-110" : ""
                                    )}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {/* Badge */}
                                {badgeCount > 0 && (
                                    <span
                                        className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[8px] font-black text-white ring-2 ring-[#1c1c1e]"
                                        style={{ backgroundColor: BRAND_COLORS.orange }}
                                    >
                                        {badgeCount > 99 ? "99+" : badgeCount}
                                    </span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] font-medium tracking-tight mt-0.5 transition-opacity duration-300",
                                    isActive ? "opacity-100" : "opacity-60"
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* Spacer for bottom nav */}
            <div className="h-[calc(110px+env(safe-area-inset-bottom))] md:hidden" />
        </>
    );
}

export default MobileBottomNav;
