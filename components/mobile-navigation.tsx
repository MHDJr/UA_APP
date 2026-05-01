"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import {
    Home,
    FileText,
    MessageSquare,
    User,
    BarChart3,
    Calendar,
} from "lucide-react";

interface MobileNavigationProps {
    currentPage?: string;
}

export default function MobileNavigation({ currentPage }: MobileNavigationProps) {
    const router = useRouter();
    const { profile } = useAuth();
    const [mobileNavTab, setMobileNavTab] = useState(currentPage || "home");

    // Update active tab when currentPage prop changes
    useEffect(() => {
        if (currentPage) {
            setMobileNavTab(currentPage);
        }
    }, [currentPage]);

    const handleScrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleScrollToMeetings = () => {
        const meetingsSection = document.getElementById('meetings-section');
        if (meetingsSection) {
            meetingsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            toast.info("Loading meetings...");
            // Trigger meetings refresh if on staff page
            if (window.location.pathname === '/staff') {
                window.dispatchEvent(new CustomEvent('refreshMeetings'));
                setTimeout(() => {
                    const section = document.getElementById('meetings-section');
                    if (section) section.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
        }
    };

    const navItems = [
        { 
            id: "home", 
            label: "Home", 
            icon: Home, 
            action: () => {
                if (window.location.pathname === '/staff') {
                    handleScrollToTop();
                } else {
                    router.push('/staff');
                }
            }
        },
        { 
            id: "meetings", 
            label: "Meetings", 
            icon: Calendar, 
            href: "/meetings"
        },
        ...(profile?.role === "sales" || profile?.role === "ceo"
            ? [{ id: "sales", label: "Sales", icon: BarChart3, href: "/sales" }]
            : [{ id: "messages", label: "Messages", icon: MessageSquare, action: () => toast.info("Messages coming soon!") }]),
        { id: "profile", label: "Profile", icon: User, action: () => toast.info("Profile coming soon!") },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] px-4 pb-safe">
                <div className="flex items-center justify-around py-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setMobileNavTab(item.id);
                                if (item.href) {
                                    router.push(item.href);
                                } else if (item.action) {
                                    item.action();
                                }
                            }}
                            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all min-h-[56px] justify-center ${
                                mobileNavTab === item.id
                                    ? "text-[#2C2171]"
                                    : "text-slate-400"
                            }`}
                        >
                            <item.icon className={`w-5 h-5 transition-all ${
                                mobileNavTab === item.id ? "scale-110" : ""
                            }`} style={{
                                color: mobileNavTab === item.id ? "#2C2171" : undefined
                            }} />
                            <span className="text-[9px] font-black uppercase tracking-wider">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}
