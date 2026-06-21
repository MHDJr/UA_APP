"use client";

import React, { useState, useEffect } from "react";
import App from "./mobile/updateappui";
import { useAuth } from "@/lib/auth-context";
import { AuthPage } from "@/components/auth-page";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoaderOverlay } from "@/components/ui/loader-overlay";

export default function RootPageShell() {
    const [isCapacitor, setIsCapacitor] = useState<boolean | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsCapacitor(!!(window as any).Capacitor);
        }
    }, []);

    // While determining environment, show loader
    if (isCapacitor === null) {
        return <LoaderOverlay isVisible={true} type="initialization" />;
    }

    // Capacitor Native Environment -> Render Mobile Layout directly
    if (isCapacitor) {
        return <App />;
    }

    // Web Environment -> Execute Redirect/Desktop Logic
    return <HomeWebRedirect />;
}

function HomeWebRedirect() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    const runtimeSkip =
        typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("skip_auth") === "true";

    const SKIP_AUTH =
        process.env.NEXT_PUBLIC_SKIP_AUTH === "true" || runtimeSkip;

    useEffect(() => {
        if (!loading && profile) {
            console.log("[Home] Profile loaded, determining redirection path for role:", profile.role);
            
            const isCurrentPathStaff = typeof window !== "undefined" && window.location.pathname.startsWith("/staff");
            
            // 1. CEO Redirection
            if (profile.role === "ceo" && !isCurrentPathStaff) {
                console.log("[Home] Redirecting CEO to dashboard");
                router.replace("/ceo");
                return;
            }
            
            // 2. Manager Redirection
            if (profile.is_manager || profile.role === "manager") {
                if (isCurrentPathStaff) return;
                
                const dept = profile.department?.toLowerCase();
                console.log("[Home] Redirecting Manager to department:", dept);
                
                if (dept === "sales") router.replace("/sales-manager");
                else if (dept === "marketing") router.replace("/marketing-manager");
                else if (dept === "finance" || profile.role === "accounts") router.replace("/finance-manager");
                else if (dept === "administration" || dept === "admin") router.replace("/ceo");
                else router.replace("/staff");
                return;
            }
            
            // 3. Staff/Tutor/Sales/Accounts Redirection
            const role = profile.role?.toLowerCase();
            if (role === "sales" || profile.is_sales_staff || profile.is_tutor || role === "tutor" || role === "accounts" || role === "staff") {
                console.log("[Home] Redirecting Staff/Tutor/Sales to portal");
                router.replace("/staff");
                return;
            }

            console.warn("[Home] No specific role match found, defaulting to staff portal for role:", profile.role);
            router.replace("/staff");
        }
    }, [profile, loading, router]);

    if (loading) {
        return <LoaderOverlay isVisible={true} type="initialization" />;
    }

    if (!user || !profile) {
        if (SKIP_AUTH) {
            return (
                <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
                    <div className="flex flex-col gap-4">
                        <Button
                            variant="outline"
                            className="border-slate-200 text-[#2D2A77]"
                            onClick={() => router.push("/ceo")}
                        >
                            CEO Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            className="border-slate-200 text-[#2D2A77]"
                            onClick={() => router.push("/staff")}
                        >
                            Staff Portal
                        </Button>
                        <Button
                            variant="outline"
                            className="border-slate-200 text-[#2D2A77]"
                            onClick={() => router.push("/sales")}
                        >
                            Sales Console
                        </Button>
                    </div>
                </div>
            );
        }

        return <AuthPage />;
    }

    return <LoaderOverlay isVisible={true} type="initialization" />;
}

