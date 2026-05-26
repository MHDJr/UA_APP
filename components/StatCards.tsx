"use client";

import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Brand colors
const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
};

interface StatCardsProps {
    activeStaff: number;
    pending: number;
    approved: number;
    rejected: number;
    className?: string;
}

interface StatCardProps {
    label: string;
    value: number;
    icon: React.ElementType;
    variant: "neutral" | "pending" | "approved" | "rejected";
    delay?: number;
}

const StatCard = ({ label, value, icon: Icon, variant, delay = 0 }: StatCardProps) => {
    const variantStyles = {
        neutral: {
            bg: "bg-white/75 dark:bg-zinc-900/60",
            iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
            iconColor: "text-indigo-600 dark:text-indigo-400",
            valueColor: "text-slate-900 dark:text-zinc-100",
            borderColor: "border-white/40 dark:border-zinc-800/50",
            shadow: "shadow-sm dark:shadow-2xl",
        },
        pending: {
            bg: "bg-amber-500/5 dark:bg-amber-500/10",
            iconBg: "bg-amber-500/15 dark:bg-amber-500/20",
            iconColor: "text-amber-600 dark:text-amber-400",
            valueColor: "text-amber-700 dark:text-amber-300",
            borderColor: "border-amber-500/20 dark:border-amber-800/50",
            shadow: "shadow-sm",
        },
        approved: {
            bg: "bg-emerald-50/75 dark:bg-emerald-900/20",
            iconBg: "bg-emerald-100 dark:bg-emerald-500/20",
            iconColor: "text-emerald-600 dark:text-emerald-400",
            valueColor: "text-emerald-700 dark:text-emerald-300",
            borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
            shadow: "shadow-sm",
        },
        rejected: {
            bg: "bg-rose-50/75 dark:bg-rose-900/20",
            iconBg: "bg-rose-100 dark:bg-rose-500/20",
            iconColor: "text-rose-600 dark:text-rose-400",
            valueColor: "text-rose-700 dark:text-rose-300",
            borderColor: "border-rose-200/50 dark:border-rose-800/50",
            shadow: "shadow-sm",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[1.75rem] p-6 backdrop-blur-xl",
                "border transition-all duration-500 ease-out",
                "hover:scale-[1.02] hover:shadow-xl",
                styles.bg,
                styles.borderColor,
                styles.shadow,
                "ua-entry-animate"
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="relative flex items-center gap-5">
                <div
                    className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        "transition-transform duration-300",
                        styles.iconBg
                    )}
                >
                    <Icon className={cn("w-6 h-6", styles.iconColor)} />
                </div>

                <div className="flex flex-col">
                    <span className={cn("text-2xl font-black tracking-tight", styles.valueColor)}>
                        {value}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                        {label}
                    </span>
                </div>
            </div>
        </div>
    );
};

export function StatCards({
    activeStaff,
    pending,
    approved,
    rejected,
    className,
}: StatCardsProps) {
    return (
        <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6", className)}>
            <StatCard
                label="Active Staff"
                value={activeStaff}
                icon={Users}
                variant="neutral"
                delay={0}
            />
            <StatCard
                label="Pending"
                value={pending}
                icon={Clock}
                variant="pending"
                delay={100}
            />
            <StatCard
                label="Approved"
                value={approved}
                icon={CheckCircle2}
                variant="approved"
                delay={200}
            />
            <StatCard
                label="Rejected"
                value={rejected}
                icon={XCircle}
                variant="rejected"
                delay={300}
            />
        </div>
    );
}

export default StatCards;
