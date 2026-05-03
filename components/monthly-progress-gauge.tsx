"use client";

import React, { useMemo } from "react";
import { Target, TrendingUp, Settings } from "lucide-react";
import { SetMonthlyTargetModal } from "./set-monthly-target-modal";

// Brand colors
const BRAND = {
    navy: "#2F1E73",
    orange: "#FA4615",
    lightNavy: "#3F348C",
    softOrange: "#FEF2EE",
    bg: "#F4F7FE",
};

interface MonthlyProgressGaugeProps {
    percentage: number;
    current: number;
    target: number;
    department: 'sales' | 'accounts';
    size?: 'sm' | 'md' | 'lg';
    showSetTargetButton?: boolean;
    onTargetUpdated?: () => void;
}

export function MonthlyProgressGauge({ 
    percentage, 
    current, 
    target, 
    department,
    size = 'md',
    showSetTargetButton = true,
    onTargetUpdated
}: MonthlyProgressGaugeProps) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    // Size configurations
    const sizeConfig = {
        sm: { svgSize: 60, strokeWidth: 5, fontSize: 'text-sm' },
        md: { svgSize: 80, strokeWidth: 6, fontSize: 'text-lg' },
        lg: { svgSize: 120, strokeWidth: 8, fontSize: 'text-2xl' }
    };

    // Calculate percentage with safety checks
    const calculatedPercentage = useMemo(() => {
        if (!target || target === 0) return 0;
        const percentage = (current / target) * 100;
        return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100
    }, [current, target]);

    const config = sizeConfig[size];
    const radius = (config.svgSize - config.strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (calculatedPercentage / 100) * circumference;

    // Get progress color based on percentage
    const getProgressColor = (percentageValue: number) => {
        if (percentageValue >= 80) return "#10b981"; // green
        if (percentageValue >= 50) return BRAND.orange; // orange
        if (percentageValue >= 25) return "#f59e0b"; // amber
        return BRAND.navy; // navy for low progress
    };

    // Format display text
    const getDisplayText = () => {
        if (department === 'sales') {
            return `${current} / ${target} Conversions`;
        } else {
            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(amount);
            };
            return `${formatCurrency(current)} / ${formatCurrency(target)}`;
        }
    };

    const getProgressLabel = () => {
        return department === 'sales' ? 'Conversions' : 'Revenue';
    };

    return (
        <div className="relative">
            {/* Progress Ring */}
            <div className="relative" style={{ width: config.svgSize, height: config.svgSize }}>
                <svg width={config.svgSize} height={config.svgSize} className="transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={config.svgSize / 2}
                        cy={config.svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={config.strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={config.svgSize / 2}
                        cy={config.svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke={getProgressColor(calculatedPercentage)}
                        strokeWidth={config.strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                            transition: "stroke-dashoffset 0.5s ease-out",
                        }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-bold text-gray-900 ${config.fontSize}`}>
                        {Math.round(calculatedPercentage)}%
                    </span>
                    <span className="text-xs text-gray-500">of goal</span>
                </div>
            </div>

            {/* Progress Details */}
            <div className="mt-3 text-center">
                <div className="text-sm font-medium text-gray-700">
                    {getProgressLabel()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {getDisplayText()}
                </div>
            </div>

            {/* Set Target Button */}
            {showSetTargetButton && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-0 right-0 w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="Set Monthly Target"
                >
                    <Settings className="w-4 h-4 text-gray-600" />
                </button>
            )}

            {/* Modal */}
            <SetMonthlyTargetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                department={department}
                onSuccess={() => {
                    setIsModalOpen(false);
                    onTargetUpdated?.();
                }}
            />
        </div>
    );
}
