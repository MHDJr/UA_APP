"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Wallet,
    TrendingUp,
    History,
    Target,
    Send,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    ShieldCheck,
    FileText,
    Activity,
    ReceiptText,
    Home,
    Clock,
    User,
    Sun,
    Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { MonthlyProgressGauge } from "@/components/monthly-progress-gauge";

// Types
interface FinancialEntry {
    id: string;
    date: string;
    uloomxIncome: number;
    usthadIncome: number;
    expenses: number;
    revenue: number;
}

interface MonthlyTarget {
    id: string;
    target_value: number;
    current_progress: number;
    achievement_percentage: number;
}

// Circular Progress Component
const CircularProgress = ({
    percentage,
    size = 120,
    strokeWidth = 8,
    color = "#ff4d00",
}: {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: "stroke-dashoffset 0.5s ease-out",
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
                <span className="text-xs text-gray-500">of goal</span>
            </div>
        </div>
    );
};

// Format currency helper
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Format time helper
const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).replace('am', 'AM').replace('pm', 'PM');
};

// Fetch monthly target data
const fetchMonthlyTarget = async (userId: string): Promise<MonthlyTarget | null> => {
    try {
        const currentMonth = new Date();
        currentMonth.setDate(1); // First day of current month
        
        const { data, error } = await supabase
            .from('monthly_targets')
            .select('*')
            .eq('profile_id', userId)
            .eq('department', 'accounts')
            .eq('target_month', currentMonth.toISOString().split('T')[0])
            .single();
        
        if (error) {
            console.error('Error fetching monthly target:', error);
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching monthly target:', error);
        return null;
    }
};

// Fetch real history data
const fetchFinancialHistory = async (userId: string): Promise<FinancialEntry[]> => {
    try {
        const { data, error } = await supabase
            .from('financial_entries')
            .select('*')
            .eq('submitted_by', userId)
            .order('entry_date', { ascending: false })
            .limit(10);
        
        if (error) {
            console.error('Error fetching financial history:', error);
            return [];
        }
        
        return (data || []).map(entry => ({
            id: entry.id,
            date: new Date(entry.entry_date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            }),
            uloomxIncome: parseFloat(entry.uloomx_income) || 0,
            usthadIncome: parseFloat(entry.usthad_income) || 0,
            expenses: parseFloat(entry.total_expenses) || 0,
            revenue: parseFloat(entry.revenue) || 0,
        }));
    } catch (error) {
        console.error('Error fetching financial history:', error);
        return [];
    }
};

export default function AccountsPage() {
    const router = useRouter();
    const { profile } = useAuth();
    
    // Form state
    const [uloomxIncome, setUloomxIncome] = useState<string>("");
    const [usthadIncome, setUsthadIncome] = useState<string>("");
    const [expenses, setExpenses] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [greeting, setGreeting] = useState("Good Morning");
    const [isClient, setIsClient] = useState(false);
    const [financialHistory, setFinancialHistory] = useState<FinancialEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [monthlyTarget, setMonthlyTarget] = useState<MonthlyTarget | null>(null);

    // Update time and greeting
    useEffect(() => {
        setIsClient(true);
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now);
            
            const hour = now.getHours();
            if (hour < 12) setGreeting("Good Morning");
            else if (hour < 17) setGreeting("Good Afternoon");
            else setGreeting("Good Evening");
        };
        
        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Calculate revenue
    const revenue = useMemo(() => {
        const uloomx = parseFloat(uloomxIncome) || 0;
        const usthad = parseFloat(usthadIncome) || 0;
        const exp = parseFloat(expenses) || 0;
        return uloomx + usthad - exp;
    }, [uloomxIncome, usthadIncome, expenses]);

    // Calculate validation checks
    const validationChecks = useMemo(() => {
        const totalIncome = (parseFloat(uloomxIncome) || 0) + (parseFloat(usthadIncome) || 0);
        const expenseRatio = totalIncome > 0 ? (parseFloat(expenses) || 0) / totalIncome : 0;
        
        return {
            hasHighExpenseRatio: expenseRatio > 0.5,
            expenseRatio: expenseRatio * 100,
            isReadyForReview: totalIncome > 0 && expenseRatio <= 0.5
        };
    }, [uloomxIncome, usthadIncome, expenses]);

    // Calculate income split for progress bar
    const incomeSplit = useMemo(() => {
        const uloomx = parseFloat(uloomxIncome) || 0;
        const usthad = parseFloat(usthadIncome) || 0;
        const total = uloomx + usthad;
        
        if (total === 0) return { uloomxPercentage: 0, usthadPercentage: 0 };
        
        return {
            uloomxPercentage: (uloomx / total) * 100,
            usthadPercentage: (usthad / total) * 100
        };
    }, [uloomxIncome, usthadIncome]);

    // Handle form submission
    const handleSubmit = async () => {
        if (!uloomxIncome && !usthadIncome) {
            toast.error("Please enter at least one income value");
            return;
        }

        if (!profile) {
            toast.error("User not authenticated");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const today = new Date().toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('financial_entries')
                .insert({
                    user_id: profile.id,
                    entry_date: today,
                    uloomx_income: parseFloat(uloomxIncome) || 0,
                    usthad_income: parseFloat(usthadIncome) || 0,
                    total_expenses: parseFloat(expenses) || 0,
                    submitted_by: profile.id,
                    status: 'pending'
                })
                .select()
                .single();
            
            if (error) {
                console.error('Error saving financial entry:', error);
                toast.error("Failed to save financial entry");
                return;
            }
            
            toast.success("Financial entry saved successfully!");
            setShowSuccess(true);
            
            // Refresh history
            const updatedHistory = await fetchFinancialHistory(profile.id);
            setFinancialHistory(updatedHistory);
            
            setTimeout(() => {
                setShowSuccess(false);
                setUloomxIncome("");
                setUsthadIncome("");
                setExpenses("");
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting financial entry:', error);
            toast.error("An error occurred while saving");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Fetch financial history and monthly target on component mount
    useEffect(() => {
        const loadData = async () => {
            if (profile) {
                setLoading(true);
                const [history, target] = await Promise.all([
                    fetchFinancialHistory(profile.id),
                    fetchMonthlyTarget(profile.id)
                ]);
                setFinancialHistory(history);
                setMonthlyTarget(target);
                setLoading(false);
            }
        };
        
        loadData();
    }, [profile]);

    return (
        <div className="min-h-screen bg-[#f9fafb] pt-[calc(env(safe-area-inset-top)+4rem)] md:pt-0 pb-28">
            {/* Desktop Header - Hidden on Mobile */}
            <div className="hidden md:block bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff4d00] to-[#ff8c00] flex items-center justify-center text-white font-bold shadow-lg">
                                AC
                            </div>
                            <div>
                                <div className="px-4 py-1.5 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/20 inline-block mb-2">
                                    <span className="text-xs font-bold text-[#ff4d00] tracking-wide">ACCOUNTS</span>
                                </div>
                                <h1 className="text-2xl font-bold text-[#1e293b]">{greeting}</h1>
                                <p className="text-sm text-[#64748b]">Ready to record today's flow</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="px-3 py-1.5 rounded-full bg-white/80 border border-orange-200">
                                <span className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Focused
                                </span>
                            </div>
                            <div className="text-xl font-bold text-[#1e293b] font-mono">
                                {currentTime ? formatTime(currentTime) : "--:--"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden">
                <div className="max-w-[450px] mx-auto bg-white px-4 pt-4 pb-6 rounded-b-[24px] shadow-sm">
                    {/* Top Row: Avatar, Badge, Clock */}
                    <div className="flex items-center justify-between mb-4">
                        {/* User Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff4d00] to-[#ff8c00] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            AC
                        </div>
                        
                        {/* ACCOUNTS Badge */}
                        <div className="px-4 py-1.5 rounded-full bg-[#ff4d00]/10 border border-[#ff4d00]/20">
                            <span className="text-xs font-bold text-[#ff4d00] tracking-wide">ACCOUNTS</span>
                        </div>
                        
                        {/* Live Digital Clock */}
                        <div className="text-right">
                            <span className="text-lg font-bold text-[#1e293b] font-mono">
                                {currentTime ? formatTime(currentTime) : "--:--"}
                            </span>
                        </div>
                    </div>
                    
                    {/* Secondary Row: Greeting Card */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-orange-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                    <Sun className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-[#1e293b]">{greeting}</h1>
                                    <p className="text-xs text-[#64748b]">Ready to record today's flow</p>
                                </div>
                            </div>
                            <div className="px-3 py-1.5 rounded-full bg-white/80 border border-orange-200">
                                <span className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    Focused
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block w-full md:grid md:grid-cols-12 md:gap-6 max-w-7xl mx-auto px-6 py-6">
                {/* Daily Entry Card - Takes up col-span-8 */}
                <div className="md:col-span-8">
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
                        {/* Card Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff4d00] to-[#ff8c00] flex items-center justify-center shadow-lg shadow-orange-200">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#1e293b]">Daily Entry</h2>
                                <p className="text-sm text-[#64748b]">Record financial data</p>
                            </div>
                        </div>

                        {/* Input Fields - 2-column grid on desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* UloomX Total Income */}
                            <div className="relative">
                                <input
                                    type="number"
                                    id="uloomx-desktop"
                                    value={uloomxIncome}
                                    onChange={(e) => setUloomxIncome(e.target.value)}
                                    placeholder=" "
                                    className="peer w-full h-16 px-4 pt-6 pb-2 rounded-2xl border-2 border-gray-200 text-lg font-semibold text-[#1e293b] placeholder:text-transparent focus:outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all"
                                />
                                <label 
                                    htmlFor="uloomx-desktop"
                                    className="absolute left-4 top-2 text-xs font-medium text-[#64748b] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#ff4d00]"
                                >
                                    UloomX Income
                                </label>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                            </div>

                            {/* Usthad Academy Income */}
                            <div className="relative">
                                <input
                                    type="number"
                                    id="usthad-desktop"
                                    value={usthadIncome}
                                    onChange={(e) => setUsthadIncome(e.target.value)}
                                    placeholder=" "
                                    className="peer w-full h-16 px-4 pt-6 pb-2 rounded-2xl border-2 border-gray-200 text-lg font-semibold text-[#1e293b] placeholder:text-transparent focus:outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all"
                                />
                                <label 
                                    htmlFor="usthad-desktop"
                                    className="absolute left-4 top-2 text-xs font-medium text-[#64748b] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#ff4d00]"
                                >
                                    Usthad Academy Income
                                </label>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                            </div>

                            {/* Total Combined Expenses - Spans full width */}
                            <div className="relative md:col-span-2">
                                <input
                                    type="number"
                                    id="expenses-desktop"
                                    value={expenses}
                                    onChange={(e) => setExpenses(e.target.value)}
                                    placeholder=" "
                                    className="peer w-full h-16 px-4 pt-6 pb-2 rounded-2xl border-2 border-gray-200 text-lg font-semibold text-[#1e293b] placeholder:text-transparent focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all"
                                />
                                <label 
                                    htmlFor="expenses-desktop"
                                    className="absolute left-4 top-2 text-xs font-medium text-[#64748b] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-red-500"
                                >
                                    Total Expenses
                                </label>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                            </div>
                        </div>

                        {/* Revenue Display - Sticky Bar */}
                        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-white/80" />
                                    <span className="text-sm font-medium text-white/90">Revenue</span>
                                </div>
                                <span className={`text-2xl font-black text-white`}>
                                    {formatCurrency(revenue)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Monthly Progress, Verification and Quick History - Takes up col-span-4 */}
                <div className="md:col-span-4 space-y-6">
                    {/* Monthly Progress Card */}
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-[#ff4d00]/10 flex items-center justify-center">
                                <Target className="w-5 h-5 text-[#ff4d00]" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#1e293b]">Monthly Target</h2>
                                <p className="text-xs text-[#64748b]">Revenue progress</p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <MonthlyProgressGauge
                                percentage={monthlyTarget?.achievement_percentage || 0}
                                current={monthlyTarget?.current_progress || 0}
                                target={monthlyTarget?.target_value || 0}
                                department="accounts"
                                size="md"
                                onTargetUpdated={() => {
                                    // Refresh monthly target data
                                    if (profile) {
                                        fetchMonthlyTarget(profile.id).then(setMonthlyTarget);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Transmission Verification Card */}
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-[#ff4d00]/10 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-[#ff4d00]" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#1e293b]">Verification</h2>
                                <p className="text-xs text-[#64748b]">Live validation</p>
                            </div>
                        </div>

                        {/* Live Split */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-[#64748b] mb-2">
                                <span>UloomX</span>
                                <span>Usthad</span>
                            </div>
                            <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
                                {incomeSplit.uloomxPercentage > 0 && (
                                    <div 
                                        className="bg-[#ff4d00] flex items-center justify-center transition-all duration-300"
                                        style={{ width: `${incomeSplit.uloomxPercentage}%` }}
                                    >
                                        {incomeSplit.uloomxPercentage > 15 && (
                                            <span className="text-[10px] text-white font-bold">
                                                {Math.round(incomeSplit.uloomxPercentage)}%
                                            </span>
                                        )}
                                    </div>
                                )}
                                {incomeSplit.usthadPercentage > 0 && (
                                    <div 
                                        className="bg-[#64748b] flex items-center justify-center transition-all duration-300"
                                        style={{ width: `${incomeSplit.usthadPercentage}%` }}
                                    >
                                        {incomeSplit.usthadPercentage > 15 && (
                                            <span className="text-[10px] text-white font-bold">
                                                {Math.round(incomeSplit.usthadPercentage)}%
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Smart Alert */}
                        <div className={`p-3 rounded-xl border ${
                            validationChecks.hasHighExpenseRatio 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-green-50 border-green-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                {validationChecks.hasHighExpenseRatio ? (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}
                                <span className={`text-xs font-semibold ${
                                    validationChecks.hasHighExpenseRatio ? 'text-red-700' : 'text-green-700'
                                }`}>
                                    {validationChecks.hasHighExpenseRatio 
                                        ? `High Expense: ${validationChecks.expenseRatio.toFixed(0)}%` 
                                        : 'Ready for Review'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick History Card */}
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                <History className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[#1e293b]">Quick History</h2>
                                <p className="text-xs text-[#64748b]">Last 3 entries</p>
                            </div>
                        </div>

                        {/* Mobile-friendly History List */}
                        <div className="space-y-3">
                            {loading ? (
                                <div className="text-center py-4 text-sm text-[#64748b]">Loading history...</div>
                            ) : financialHistory.length === 0 ? (
                                <div className="text-center py-4 text-sm text-[#64748b]">No entries yet</div>
                            ) : (
                                financialHistory.map((entry) => (
                                    <div key={entry.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-[#1e293b]">{entry.date}</span>
                                            <span className="text-sm font-bold text-green-600">
                                                {formatCurrency(entry.revenue)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-[#64748b]">
                                            <span>Income: {formatCurrency(entry.uloomxIncome + entry.usthadIncome)}</span>
                                            <span className="text-red-500">Exp: {formatCurrency(entry.expenses)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* View Full Ledger */}
                        <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-[#64748b] hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors flex items-center justify-center gap-2">
                            <FileText className="w-4 h-4" />
                            View Full Ledger
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
                <div className="max-w-[450px] mx-auto">
                    {/* Main Content */}
                    <div className="px-4 py-6 space-y-4">
                        {/* Data Entry Card */}
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
                            {/* Card Header */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff4d00] to-[#ff8c00] flex items-center justify-center shadow-lg shadow-orange-200">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#1e293b]">Daily Entry</h2>
                                    <p className="text-xs text-[#64748b]">Record financial data</p>
                                </div>
                            </div>

                            {/* Input Fields - Stacked Vertically for Mobile */}
                            <div className="space-y-4">
                                {/* UloomX Total Income */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="uloomx"
                                        value={uloomxIncome}
                                        onChange={(e) => setUloomxIncome(e.target.value)}
                                        placeholder=" "
                                        className="peer w-full h-16 px-4 pt-6 pb-2 rounded-2xl border-2 border-gray-200 text-lg font-semibold text-[#1e293b] placeholder:text-transparent focus:outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all"
                                    />
                                    <label 
                                        htmlFor="uloomx"
                                        className="absolute left-4 top-2 text-xs font-medium text-[#64748b] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#ff4d00]"
                                    >
                                        UloomX Income
                                    </label>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                                </div>

                                {/* Usthad Academy Income */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="usthad"
                                        value={usthadIncome}
                                        onChange={(e) => setUsthadIncome(e.target.value)}
                                        placeholder=" "
                                        className="peer w-full h-16 px-4 pt-6 pb-2 rounded-2xl border-2 border-gray-200 text-lg font-semibold text-[#1e293b] placeholder:text-transparent focus:outline-none focus:border-[#ff4d00] focus:ring-4 focus:ring-[#ff4d00]/10 transition-all"
                                    />
                                    <label 
                                        htmlFor="usthad"
                                        className="absolute left-4 top-2 text-xs font-medium text-[#64748b] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#ff4d00]"
                                    >
                                        Usthad Academy Income
                                    </label>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                                </div>

                                {/* Total Combined Expenses */}
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="expenses"
                                        value={expenses}
                                        onChange={(e) => setExpenses(e.target.value)}
                                        placeholder=" "
                                        className="peer w-full h-16 px-4 pt-6 pb-2 rounded-2xl border-2 border-gray-200 text-lg font-semibold text-[#1e293b] placeholder:text-transparent focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all"
                                    />
                                    <label 
                                        htmlFor="expenses"
                                        className="absolute left-4 top-2 text-xs font-medium text-[#64748b] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-red-500"
                                    >
                                        Total Expenses
                                    </label>
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                                </div>
                            </div>

                            {/* Revenue Display - Sticky Bar */}
                            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-white/80" />
                                        <span className="text-sm font-medium text-white/90">Revenue</span>
                                    </div>
                                    <span className={`text-2xl font-black text-white`}>
                                        {formatCurrency(revenue)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Transmission Verification Card */}
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-[#ff4d00]/10 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-[#ff4d00]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#1e293b]">Verification</h2>
                                    <p className="text-xs text-[#64748b]">Live validation</p>
                                </div>
                            </div>

                            {/* Live Split */}
                            <div className="mb-4">
                                <div className="flex justify-between text-xs text-[#64748b] mb-2">
                                    <span>UloomX</span>
                                    <span>Usthad</span>
                                </div>
                                <div className="h-6 bg-gray-100 rounded-full overflow-hidden flex">
                                    {incomeSplit.uloomxPercentage > 0 && (
                                        <div 
                                            className="bg-[#ff4d00] flex items-center justify-center transition-all duration-300"
                                            style={{ width: `${incomeSplit.uloomxPercentage}%` }}
                                        >
                                            {incomeSplit.uloomxPercentage > 15 && (
                                                <span className="text-[10px] text-white font-bold">
                                                    {Math.round(incomeSplit.uloomxPercentage)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    {incomeSplit.usthadPercentage > 0 && (
                                        <div 
                                            className="bg-[#64748b] flex items-center justify-center transition-all duration-300"
                                            style={{ width: `${incomeSplit.usthadPercentage}%` }}
                                        >
                                            {incomeSplit.usthadPercentage > 15 && (
                                                <span className="text-[10px] text-white font-bold">
                                                    {Math.round(incomeSplit.usthadPercentage)}%
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Smart Alert */}
                            <div className={`p-3 rounded-xl border ${
                                validationChecks.hasHighExpenseRatio 
                                    ? 'bg-red-50 border-red-200' 
                                    : 'bg-green-50 border-green-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {validationChecks.hasHighExpenseRatio ? (
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    )}
                                    <span className={`text-xs font-semibold ${
                                        validationChecks.hasHighExpenseRatio ? 'text-red-700' : 'text-green-700'
                                    }`}>
                                        {validationChecks.hasHighExpenseRatio 
                                            ? `High Expense: ${validationChecks.expenseRatio.toFixed(0)}%` 
                                            : 'Ready for Review'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick History Card */}
                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                    <History className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-[#1e293b]">Quick History</h2>
                                    <p className="text-xs text-[#64748b]">Last 3 entries</p>
                                </div>
                            </div>

                            {/* Mobile-friendly History List */}
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-4 text-sm text-[#64748b]">Loading history...</div>
                                ) : financialHistory.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-[#64748b]">No entries yet</div>
                                ) : (
                                    financialHistory.map((entry) => (
                                        <div key={entry.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-[#1e293b]">{entry.date}</span>
                                                <span className="text-sm font-bold text-green-600">
                                                    {formatCurrency(entry.revenue)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-[#64748b]">
                                                <span>Income: {formatCurrency(entry.uloomxIncome + entry.usthadIncome)}</span>
                                                <span className="text-red-500">Exp: {formatCurrency(entry.expenses)}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* View Full Ledger */}
                            <button className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-[#64748b] hover:border-[#ff4d00] hover:text-[#ff4d00] transition-colors flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" />
                                View Full Ledger
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Transmit Button */}
            <div className="hidden md:block max-w-7xl mx-auto px-6 pb-6">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!uloomxIncome && !usthadIncome)}
                    className="w-full h-14 rounded-2xl bg-[#ff4d00] text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-[#e64400] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#ff4d00]/30"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Transmitting...
                        </>
                    ) : showSuccess ? (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            Transmitted!
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Transmit Report
                        </>
                    )}
                </button>
            </div>

            {/* Mobile Transmit Button - Above Bottom Nav */}
            <div className="md:hidden fixed bottom-24 left-0 right-0 px-4 z-40">
                <div className="max-w-[450px] mx-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || (!uloomxIncome && !usthadIncome)}
                        className="w-full h-14 rounded-2xl bg-[#ff4d00] text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-[#e64400] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#ff4d00]/30"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Transmitting...
                            </>
                        ) : showSuccess ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Transmitted!
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Transmit Report
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
