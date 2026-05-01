"use client";

import { useState } from "react";
import { CEOSidebar } from "@/components/ceo-sidebar";
import { cn } from "@/lib/utils";

type CEOView = "command-center" | "staff-management" | "scheduled-meetings";
type Role = "ceo" | "staff";

interface CEOLayoutProps {
    children: React.ReactNode;
    defaultView?: CEOView;
}

export function CEOLayout({ children, defaultView = "command-center" }: CEOLayoutProps) {
    const [activeView, setActiveView] = useState<CEOView>(defaultView);
    const [userRole, setUserRole] = useState<Role>("ceo");

    const handleViewChange = (view: string) => {
        setActiveView(view as CEOView);
    };

    const handleRoleChange = (role: Role) => {
        setUserRole(role);
    };

    return (
        <div className="min-h-screen bg-[#FAFAFB]">
            <CEOSidebar
                activeView={activeView}
                onViewChange={handleViewChange}
                userRole={userRole}
                onRoleChange={handleRoleChange}
            />
            <main
                className={cn(
                    "min-h-screen transition-all duration-300",
                    "ml-[260px]"
                )}
            >
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default CEOLayout;
