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
            bg: "bg-white/80",
            iconBg: "bg-[#31267D]/10",
            iconColor: "text-[#31267D]",
            valueColor: "text-gray-900",
            borderColor: "border-[#31267D]/5",
            shadow: "shadow-[0_2px_16px_rgba(49,38,125,0.06)]",
        },
        pending: {
            bg: "bg-[#F14D24]/5",
            iconBg: "bg-[#F14D24]/15",
            iconColor: "text-[#F14D24]",
            valueColor: "text-[#F14D24]",
            borderColor: "border-[#F14D24]/15",
            shadow: "shadow-[0_2px_16px_rgba(241,77,36,0.08)]",
        },
        approved: {
            bg: "bg-emerald-50/80",
            iconBg: "bg-emerald-100",
            iconColor: "text-emerald-600",
            valueColor: "text-emerald-700",
            borderColor: "border-emerald-200/50",
            shadow: "shadow-[0_2px_16px_rgba(16,185,129,0.06)]",
        },
        rejected: {
            bg: "bg-rose-50/80",
            iconBg: "bg-rose-100",
            iconColor: "text-rose-600",
            valueColor: "text-rose-700",
            borderColor: "border-rose-200/50",
            shadow: "shadow-[0_2px_16px_rgba(244,63,94,0.06)]",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl p-5 backdrop-blur-xl",
                "border transition-all duration-500 ease-out",
                "hover:scale-[1.02] hover:shadow-lg",
                styles.bg,
                styles.borderColor,
                styles.shadow,
                "ua-entry-animate"
            )}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Subtle gradient overlay */}
            <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    background:
                        variant === "pending"
                            ? `linear-gradient(135deg, rgba(241,77,36,0.05) 0%, transparent 60%)`
                            : `linear-gradient(135deg, rgba(49,38,125,0.03) 0%, transparent 60%)`,
                }}
            />

            <div className="relative flex items-center gap-4">
                {/* Icon container */}
                <div
                    className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        "transition-transform duration-300",
                        styles.iconBg
                    )}
                >
                    <Icon className={cn("w-5 h-5", styles.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex flex-col">
                    <span className={cn("text-2xl font-bold tracking-tight", styles.valueColor)}>
                        {value}
                    </span>
                    <span className="text-xs font-medium text-gray-500 tracking-wide">
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
        <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
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
