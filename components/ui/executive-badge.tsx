"use client";

import { cn } from "@/lib/utils";

type BadgeVariant =
    | "idle"
    | "manageable"
    | "high-load"
    | "critical"
    | "revenue-critical";

interface ExecutiveBadgeProps {
    variant: BadgeVariant;
    label?: string;
    className?: string;
}

const badgeConfig = {
    idle: {
        bg: "bg-white/5",
        border: "border-white/10",
        text: "text-white/50",
        label: "IDLE DAY",
    },
    manageable: {
        bg: "bg-exec-success/10",
        border: "border-exec-success/30",
        text: "text-exec-success",
        label: "MANAGEABLE",
    },
    "high-load": {
        bg: "bg-exec-warning/10",
        border: "border-exec-warning/30",
        text: "text-exec-warning",
        label: "HIGH LOAD",
    },
    critical: {
        bg: "bg-exec-alert/10",
        border: "border-exec-alert/30",
        text: "text-exec-alert",
        label: "CRITICAL",
    },
    "revenue-critical": {
        bg: "bg-exec-gold/10",
        border: "border-exec-gold/30",
        text: "text-exec-gold",
        label: "REVENUE CRITICAL",
    },
};

export function ExecutiveBadge({
    variant,
    label,
    className,
}: ExecutiveBadgeProps) {
    const config = badgeConfig[variant];

    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border",
                config.bg,
                config.border,
                config.text,
                className,
            )}
        >
            {label || config.label}
        </span>
    );
}

interface CapacityIndicatorProps {
    assigned: number;
    available: number;
    className?: string;
}

export function CapacityIndicator({
    assigned,
    available,
    className,
}: CapacityIndicatorProps) {
    const utilization = available > 0 ? (assigned / available) * 100 : 0;

    const getColor = () => {
        if (utilization >= 90) return "bg-exec-alert";
        if (utilization >= 70) return "bg-exec-warning";
        return "bg-exec-success";
    };

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={cn(
                        "h-full rounded-full transition-all",
                        getColor(),
                    )}
                    style={{ width: `${Math.min(100, utilization)}%` }}
                />
            </div>
            <span className="text-[10px] font-mono text-white/60">
                {assigned}/{available}
            </span>
        </div>
    );
}

interface RiskIndicatorProps {
    level: "low" | "medium" | "high";
    className?: string;
}

export function RiskIndicator({ level, className }: RiskIndicatorProps) {
    const config = {
        low: { color: "bg-exec-success", label: "LOW RISK" },
        medium: { color: "bg-exec-warning", label: "MED RISK" },
        high: { color: "bg-exec-alert", label: "HIGH RISK" },
    };

    const { color, label } = config[level];

    return (
        <span
            className={cn(
                "flex items-center gap-1 text-[9px] font-bold uppercase",
                className,
            )}
        >
            <span className={cn("w-1.5 h-1.5 rounded-full", color)} />
            <span className="text-white/50">{label}</span>
        </span>
    );
}
