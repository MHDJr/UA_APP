"use client";

import React, { useState, useEffect } from "react";
import {
    Users,
    TrendingUp,
    Target,
    RefreshCw,
    Trophy,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

// Brand colors
const BRAND = {
    navy: "#2F1E73",
    orange: "#FA4615",
    lightNavy: "#3F348C",
    softOrange: "#FEF2EE",
    bg: "#F4F7FE",
};

interface StaffMember {
    id: string;
    full_name: string;
    email: string;
    role: string;
    department: 'sales' | 'accounts';
}

interface StaffVelocityData {
    staff: StaffMember;
    target_value: number;
    current_progress: number;
    achievement_percentage: number;
}

export function CEOStaffVelocity() {
    const { profile } = useAuth();
    const [staffData, setStaffData] = useState<StaffVelocityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStaffVelocity();
    }, []);

    const loadStaffVelocity = async () => {
        setLoading(true);
        try {
            // Get all staff members (sales and accounts)
            const { data: staffMembers, error: staffError } = await supabase
                .from('profiles')
                .select('id, full_name, email, role')
                .in('role', ['sales', 'accounts']);

            if (staffError) {
                console.error('Error fetching staff:', staffError);
                setLoading(false);
                return;
            }

            // Get current month targets for all staff
            const currentMonth = new Date();
            currentMonth.setDate(1); // First day of current month
            
            const { data: targets, error: targetsError } = await supabase
                .from('monthly_targets')
                .select('*')
                .eq('target_month', currentMonth.toISOString().split('T')[0])
                .in('department', ['sales', 'accounts']);

            if (targetsError) {
                console.error('Error fetching targets:', targetsError);
                setLoading(false);
                return;
            }

            // Combine staff data with their targets
            const velocityData: StaffVelocityData[] = staffMembers?.map(staff => {
                const target = targets?.find(t => t.profile_id === staff.id);
                return {
                    staff: {
                        ...staff,
                        department: staff.role as 'sales' | 'accounts'
                    },
                    target_value: target?.target_value || 0,
                    current_progress: target?.current_progress || 0,
                    achievement_percentage: target?.achievement_percentage || 0
                };
            }) || [];

            setStaffData(velocityData);
        } catch (error) {
            console.error('Error loading staff velocity:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadStaffVelocity();
        setRefreshing(false);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return "from-emerald-500 to-emerald-600";
        if (percentage >= 50) return "from-orange-400 to-orange-500";
        if (percentage >= 25) return "from-amber-400 to-amber-500";
        return "from-indigo-500 to-indigo-600";
    };

    // Filter and sort staff data - only sales staff
    const salesStaffData = staffData.filter(staff => staff.staff.role === 'sales');

    // Find best sales performer
    const bestSalesPerformer = salesStaffData.reduce((best, current) => 
        current.achievement_percentage > best.achievement_percentage ? current : best, 
        salesStaffData[0]
    );

    const getProgressWidth = (percentage: number) => {
        return Math.min(percentage, 100);
    };

    const formatProgressText = (staff: StaffVelocityData) => {
        if (staff.staff.role === 'sales') {
            return `${staff.current_progress} / ${staff.target_value} conversions`;
        } else {
            const formatCurrency = (amount: number) => {
                return new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }).format(amount);
            };
            return `${formatCurrency(staff.current_progress)} / ${formatCurrency(staff.target_value)}`;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Staff Velocity</h2>
                            <p className="text-sm text-gray-500">Monthly performance overview</p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-24 bg-gray-100 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Staff Velocity</h2>
                        <p className="text-sm text-gray-500">Monthly performance overview</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Best Performer Section */}
            {bestSalesPerformer && (
                <div className="mb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-emerald-800">Top Sales Performer</h3>
                                <p className="text-sm text-emerald-600">Best conversion rate this month</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-bold text-gray-900">
                                    {bestSalesPerformer.staff.full_name || bestSalesPerformer.staff.email}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {bestSalesPerformer.current_progress} / {bestSalesPerformer.target_value} conversions
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-emerald-600">
                                    {bestSalesPerformer.achievement_percentage.toFixed(1)}%
                                </p>
                                <p className="text-xs text-emerald-600">achieved</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {salesStaffData.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No sales staff data available</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {salesStaffData.map((staffMember) => (
                        <div
                            key={staffMember.staff.id}
                            className="relative bg-gradient-to-br from-white/90 to-white/60 rounded-2xl border border-white/20 p-3 sm:p-4 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1"
                            style={{
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
                            }}
                        >
                            {/* Staff Info */}
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-bold"
                                        style={{ backgroundColor: BRAND.navy }}
                                    >
                                        {staffMember.staff.full_name?.[0] || staffMember.staff.email?.[0] || 'U'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[100px] sm:max-w-[120px]">
                                            {staffMember.staff.full_name || staffMember.staff.email}
                                        </div>
                                        <div className="text-[10px] sm:text-xs text-gray-500 capitalize">
                                            {staffMember.staff.role}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-sm sm:text-lg font-bold text-gray-900">
                                        {staffMember.achievement_percentage.toFixed(1)}%
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-gray-500">achieved</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="h-2 bg-gray-100/50 rounded-full overflow-hidden backdrop-blur-sm" style={{
                                    background: 'rgba(229, 231, 235, 0.5)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                }}>
                                    <div
                                        className={`h-full bg-gradient-to-r ${getProgressColor(staffMember.achievement_percentage)} rounded-full transition-all duration-700 ease-out relative overflow-hidden`}
                                        style={{ 
                                            width: `${getProgressWidth(staffMember.achievement_percentage)}%`,
                                            boxShadow: '0 0 20px rgba(250, 70, 21, 0.3)',
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-600 text-center font-medium">
                                    {formatProgressText(staffMember)}
                                </div>
                            </div>

                            {/* Status Badge */}
                            {staffMember.target_value === 0 ? (
                                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
                                    <span className="text-xs text-gray-500">No Target</span>
                                </div>
                            ) : staffMember.achievement_percentage >= 100 ? (
                                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-green-100 border border-green-200">
                                    <span className="text-xs text-green-700 font-medium">Achieved</span>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
