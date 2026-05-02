"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Wallet,
    TrendingUp,
    Landmark,
    ReceiptText,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    CheckCircle2,
    Clock,
    Activity,
    BarChart3,
    DollarSign,
    Building,
    Target,
    AlertTriangle,
    Sparkles,
    Zap,
    Home,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

// Types
interface DailyMetrics {
    uloomxIncome: number;
    usthadIncome: number;
    combinedExpense: number;
    netProfit: number;
}

interface MonthlyMetrics {
    uloomxTotal: number;
    usthadTotal: number;
    totalExpense: number;
    balance: number;
}

interface Transmission {
    id: string;
    date: string;
    uloomxIncome: number;
    usthadIncome: number;
    expenses: number;
    revenue: number;
    status: "approved" | "pending";
}

interface ChartData {
    date: string;
    uloomx: number;
    usthad: number;
    total: number;
    netBalance: number;
}

// Format currency helper (Indian Rupees)
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// Generate chart data from real financial entries
const generateChartData = (entries: any[]): ChartData[] => {
    const data: ChartData[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Find entries for this date
        const dayEntries = entries.filter(entry => 
            new Date(entry.entry_date).toISOString().split('T')[0] === dateStr
        );
        
        // Sum up values for this date
        const uloomx = dayEntries.reduce((sum, entry) => sum + (parseFloat(entry.uloomx_income) || 0), 0);
        const usthad = dayEntries.reduce((sum, entry) => sum + (parseFloat(entry.usthad_income) || 0), 0);
        const total = uloomx + usthad;
        const expenses = dayEntries.reduce((sum, entry) => sum + (parseFloat(entry.total_expenses) || 0), 0);
        const netBalance = total - expenses;
        
        data.push({
            date: dateStr,
            uloomx,
            usthad,
            total,
            netBalance,
        });
    }
    
    return data;
};

// Metric Card Component - Premium Design
const MetricCard = ({
    title,
    value,
    icon: Icon,
    imageUrl,
    trend,
    trendValue,
    color = "#ff4d00",
}: {
    title: string;
    value: string;
    icon?: React.ElementType;
    imageUrl?: string;
    trend?: "up" | "down";
    trendValue?: string;
    color?: string;
}) => {
    // Get proper icon color and background based on card type
    const getIconStyles = () => {
        switch (color) {
            case "#ff4d00": // Orange - Income cards
                return {
                    bg: "linear-gradient(135deg, #ff4d00 0%, #ff6b35 100%)",
                    iconColor: "#ffffff",
                    shadow: "0 8px 24px rgba(255, 77, 0, 0.35)"
                };
            case "#ef4444": // Red - Expense card
                return {
                    bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    iconColor: "#ffffff",
                    shadow: "0 8px 24px rgba(239, 68, 68, 0.35)"
                };
            case "#10b981": // Green - Profit card
                return {
                    bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    iconColor: "#ffffff",
                    shadow: "0 8px 24px rgba(16, 185, 129, 0.35)"
                };
            default:
                return {
                    bg: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    iconColor: "#ffffff",
                    shadow: `0 8px 24px ${color}40`
                };
        }
    };

    const styles = getIconStyles();

    return (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 overflow-hidden ${
                    imageUrl?.includes('uloomx') ? 'w-16 h-16' : 'w-14 h-14'
                }`}
                     style={{ 
                         background: imageUrl ? 'transparent' : styles.bg,
                         boxShadow: imageUrl ? 'none' : styles.shadow
                     }}>
                    {imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={title} 
                            className={`object-contain ${imageUrl?.includes('uloomx') ? 'w-[110%] h-[110%]' : 'w-full h-full'}`}
                        />
                    ) : Icon ? (
                        <Icon className="w-6 h-6" style={{ color: styles.iconColor }} />
                    ) : null}
                </div>
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full ${
                        trend === "up" 
                            ? "bg-green-50 text-green-600 border border-green-200" 
                            : "bg-red-50 text-red-500 border border-red-200"
                    }`}>
                        {trend === "up" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <p className="text-sm text-[#64748b] font-medium mb-2">{title}</p>
            <p className="text-3xl font-black text-[#1e293b]">{value}</p>
        </div>
    );
};

// Stacked Area Chart Component with Interactive Tooltips
const StackedAreaChart = ({ data }: { data: ChartData[] }) => {
    // Handle empty data case
    if (!data || data.length === 0) {
        return (
            <div className="relative w-full h-[280px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">No financial data available</p>
                    <p className="text-gray-400 text-sm mt-2">Submit financial entries to see trends</p>
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.uloomx + d.usthad));
    const height = 280;
    const width = 900;
    const padding = { top: 40, right: 40, bottom: 60, left: 80 };
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const createStackedPaths = () => {
        // Usthad layer (bottom - lighter orange)
        const usthadPoints = data.map((point, index) => {
            const x = padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
            const y = height - padding.bottom - (point.usthad / maxValue) * (height - padding.top - padding.bottom);
            return { x, y, value: point.usthad };
        });

        // UloomX layer (top - deep orange)
        const uloomxPoints = data.map((point, index) => {
            const x = padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
            const stackedValue = point.usthad + point.uloomx;
            const y = height - padding.bottom - (stackedValue / maxValue) * (height - padding.top - padding.bottom);
            return { x, y, value: point.uloomx, baseY: usthadPoints[index].y };
        });

        // Usthad area path
        const usthadAreaPath = `M ${usthadPoints.map(p => `${p.x},${p.y}`).join(' L ')} 
                               L ${usthadPoints[usthadPoints.length - 1].x},${height - padding.bottom} 
                               L ${usthadPoints[0].x},${height - padding.bottom} Z`;

        // UloomX area path
        const uloomxAreaPath = `M ${uloomxPoints.map(p => `${p.x},${p.y}`).join(' L ')} 
                               L ${uloomxPoints[uloomxPoints.length - 1].x},${uloomxPoints[uloomxPoints.length - 1].baseY} 
                               L ${uloomxPoints[0].x},${uloomxPoints[0].baseY} Z`;

        return { usthadAreaPath, uloomxAreaPath, usthadPoints, uloomxPoints };
    };

    const { usthadAreaPath, uloomxAreaPath, uloomxPoints } = createStackedPaths();

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (data.length === 0) return;
        
        const svgRect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - svgRect.left;
        const chartWidth = width - padding.left - padding.right;
        const index = Math.round(((x - padding.left) / chartWidth) * (data.length - 1));
        
        if (index >= 0 && index < data.length) {
            setHoveredIndex(index);
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    return (
        <div className="relative">
            <svg 
                width={width} 
                height={height} 
                viewBox={`0 0 ${width} ${height}`} 
                className="w-full cursor-crosshair"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Grid lines */}
                {[0, 1, 2, 3, 4, 5].map(i => {
                    const y = padding.top + (i * (height - padding.top - padding.bottom)) / 5;
                    const value = maxValue - (i * maxValue) / 5;
                    return (
                        <g key={i}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                stroke="#f1f5f9"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={padding.left - 10}
                                y={y + 4}
                                textAnchor="end"
                                className="text-xs fill-[#94a3b8]"
                            >
                                {formatCurrency(value).replace('₹', '')}
                            </text>
                        </g>
                    );
                })}

                {/* Usthad layer (Light Orange) */}
                <path
                    d={usthadAreaPath}
                    fill="url(#gradientUsthad)"
                    opacity="0.8"
                />

                {/* UloomX layer (Deep Orange) */}
                <path
                    d={uloomxAreaPath}
                    fill="url(#gradientUloomx)"
                    opacity="0.9"
                />

                {/* Border lines */}
                <path
                    d={`M ${uloomxPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                    fill="none"
                    stroke="#ff4d00"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Gradient definitions */}
                <defs>
                    <linearGradient id="gradientUloomx" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ff4d00" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#ff4d00" stopOpacity="0.6" />
                    </linearGradient>
                    <linearGradient id="gradientUsthad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffb088" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ffb088" stopOpacity="0.4" />
                    </linearGradient>
                </defs>

                {/* X-axis labels */}
                {data.filter((_, index) => index % 5 === 0).map((point, index) => {
                    const x = padding.left + (data.indexOf(point) / (data.length - 1)) * (width - padding.left - padding.right);
                    const date = new Date(point.date);
                    return (
                        <text
                            key={index}
                            x={x}
                            y={height - 25}
                            textAnchor="middle"
                            className="text-xs fill-[#64748b]"
                        >
                            {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </text>
                    );
                })}

                {/* Hover indicator */}
                {hoveredIndex !== null && (
                    <>
                        <line
                            x1={uloomxPoints[hoveredIndex].x}
                            y1={padding.top}
                            x2={uloomxPoints[hoveredIndex].x}
                            y2={height - padding.bottom}
                            stroke="#ff4d00"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            opacity="0.5"
                        />
                        <circle
                            cx={uloomxPoints[hoveredIndex].x}
                            cy={uloomxPoints[hoveredIndex].y}
                            r="6"
                            fill="#ff4d00"
                            stroke="white"
                            strokeWidth="3"
                        />
                    </>
                )}
            </svg>

            {/* Tooltip */}
            {hoveredIndex !== null && (
                <div 
                    className="absolute bg-white rounded-xl shadow-xl border border-gray-100 p-4 pointer-events-none z-10"
                    style={{
                        left: `${(uloomxPoints[hoveredIndex].x / width) * 100}%`,
                        top: `${(uloomxPoints[hoveredIndex].y / height) * 100 - 25}%`,
                        transform: 'translateX(-50%)',
                        minWidth: '200px'
                    }}
                >
                    <p className="text-xs text-[#64748b] font-medium mb-1">
                        {new Date(data[hoveredIndex].date).toLocaleDateString('en-IN', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                        })}
                    </p>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#ffb088] flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#ffb088]"></span>
                                Usthad Academy
                            </span>
                            <span className="text-sm font-bold text-[#1e293b]">
                                {formatCurrency(data[hoveredIndex].usthad)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[#ff4d00] flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#ff4d00]"></span>
                                UloomX
                            </span>
                            <span className="text-sm font-bold text-[#1e293b]">
                                {formatCurrency(data[hoveredIndex].uloomx)}
                            </span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-[#64748b]">Net Balance</span>
                                <span className="text-lg font-black text-[#ff4d00]">
                                    {formatCurrency(data[hoveredIndex].netBalance)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Donut Chart Component for Strategic Revenue Split
const DonutChart = ({ 
    uloomxValue, 
    usthadValue 
}: { 
    uloomxValue: number; 
    usthadValue: number;
}) => {
    const total = uloomxValue + usthadValue;
    const uloomxPercentage = (uloomxValue / total) * 100;
    const usthadPercentage = (usthadValue / total) * 100;
    
    const size = 180;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const uloomxOffset = circumference - (uloomxPercentage / 100) * circumference;
    const usthadOffset = circumference - (usthadPercentage / 100) * circumference;
    
    return (
        <div className="relative flex flex-col items-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth={strokeWidth}
                />
                
                {/* UloomX segment (Deep Orange) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#ff4d00"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={uloomxOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                />
                
                {/* Usthad segment (Light Orange) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#ffb088"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={usthadOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                    style={{
                        transform: `rotate(${(uloomxPercentage / 100) * 360}deg)`,
                        transformOrigin: 'center'
                    }}
                />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-[#64748b] font-medium">Total Revenue</p>
                <p className="text-lg font-black text-[#1e293b]">{formatCurrency(total)}</p>
            </div>
            
            {/* Legend */}
            <div className="mt-4 space-y-2 w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#ff4d00]"></span>
                        <span className="text-sm text-[#64748b]">UloomX</span>
                    </div>
                    <span className="text-sm font-bold text-[#1e293b]">{uloomxPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#ffb088]"></span>
                        <span className="text-sm text-[#64748b]">Usthad Academy</span>
                    </div>
                    <span className="text-sm font-bold text-[#1e293b]">{usthadPercentage.toFixed(1)}%</span>
                </div>
            </div>
        </div>
    );
};

// Counter animation hook
const useCounterAnimation = (targetValue: number, duration: number = 2000) => {
    const [currentValue, setCurrentValue] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (targetValue === 0) {
            setCurrentValue(0);
            return;
        }

        setIsAnimating(true);
        const startTime = Date.now();
        const startValue = currentValue;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const newValue = startValue + (targetValue - startValue) * easeOutQuart;
            
            setCurrentValue(newValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
            }
        };

        requestAnimationFrame(animate);
    }, [targetValue, duration]);

    return { currentValue, isAnimating };
};

export default function CEOFinancialIntelligence() {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [financialEntries, setFinancialEntries] = useState<any[]>([]);
    const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics>({
        uloomxIncome: 0,
        usthadIncome: 0,
        combinedExpense: 0,
        netProfit: 0,
    });

    const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetrics>({
        uloomxTotal: 0,
        usthadTotal: 0,
        totalExpense: 0,
        balance: 0,
    });

    // Animated values for daily metrics
    const animatedUloomxIncome = useCounterAnimation(dailyMetrics.uloomxIncome, 2000);
    const animatedUsthadIncome = useCounterAnimation(dailyMetrics.usthadIncome, 1800);
    const animatedCombinedExpense = useCounterAnimation(dailyMetrics.combinedExpense, 2200);
    const animatedNetProfit = useCounterAnimation(dailyMetrics.netProfit, 2500);

    // Animated values for monthly metrics
    const animatedMonthlyUloomx = useCounterAnimation(monthlyMetrics.uloomxTotal, 2800);
    const animatedMonthlyUsthad = useCounterAnimation(monthlyMetrics.usthadTotal, 3000);
    const animatedMonthlyExpense = useCounterAnimation(monthlyMetrics.totalExpense, 2600);

    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [currentDateTime, setCurrentDateTime] = useState<string>("");

    // Fetch financial data from database
    useEffect(() => {
        const fetchFinancialData = async () => {
            try {
                setLoading(true);
                
                // Fetch financial entries for the last 30 days
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                
                const { data: entries, error } = await supabase
                    .from('financial_entries')
                    .select('*')
                    .gte('entry_date', thirtyDaysAgo.toISOString().split('T')[0])
                    .order('entry_date', { ascending: false });
                
                if (error) {
                    console.error('Error fetching financial entries:', error);
                    setLoading(false);
                    return;
                }
                
                console.log('Fetched financial entries:', entries);
                setFinancialEntries(entries || []);
                
                // Calculate daily metrics (today's data)
                const today = new Date().toISOString().split('T')[0];
                const todayEntries = (entries || []).filter(entry => 
                    entry.entry_date === today
                );
                
                const todayUloomx = todayEntries.reduce((sum, entry) => sum + (parseFloat(entry.uloomx_income) || 0), 0);
                const todayUsthad = todayEntries.reduce((sum, entry) => sum + (parseFloat(entry.usthad_income) || 0), 0);
                const todayExpenses = todayEntries.reduce((sum, entry) => sum + (parseFloat(entry.total_expenses) || 0), 0);
                
                console.log('Daily metrics calculated:', { todayUloomx, todayUsthad, todayExpenses, todayEntries });
                
                setDailyMetrics({
                    uloomxIncome: todayUloomx,
                    usthadIncome: todayUsthad,
                    combinedExpense: todayExpenses,
                    netProfit: todayUloomx + todayUsthad - todayExpenses,
                });
                
                // Calculate monthly metrics (current month)
                const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
                const monthEntries = (entries || []).filter(entry => 
                    entry.entry_date.startsWith(currentMonth)
                );
                
                const monthUloomx = monthEntries.reduce((sum, entry) => sum + (parseFloat(entry.uloomx_income) || 0), 0);
                const monthUsthad = monthEntries.reduce((sum, entry) => sum + (parseFloat(entry.usthad_income) || 0), 0);
                const monthExpenses = monthEntries.reduce((sum, entry) => sum + (parseFloat(entry.total_expenses) || 0), 0);
                
                console.log('Monthly metrics calculated:', { monthUloomx, monthUsthad, monthExpenses, monthEntries, currentMonth });
                
                setMonthlyMetrics({
                    uloomxTotal: monthUloomx,
                    usthadTotal: monthUsthad,
                    totalExpense: monthExpenses,
                    balance: monthUloomx + monthUsthad - monthExpenses,
                });
                
                // Generate chart data
                setChartData(generateChartData(entries || []));
                
            } catch (error) {
                console.error('Error fetching financial data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        if (profile) {
            fetchFinancialData();
        }
    }, [profile]);

    // Update date/time
    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            setCurrentDateTime(now.toLocaleString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }));
        };
        updateDateTime();
        const interval = setInterval(updateDateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Debug current state values
    console.log('Current state:', { 
        loading, 
        dailyMetrics, 
        monthlyMetrics, 
        chartDataLength: chartData.length,
        financialEntriesLength: financialEntries.length 
    });

    // Anomaly detection calculations
    const expenseRatio = (monthlyMetrics.totalExpense / (monthlyMetrics.uloomxTotal + monthlyMetrics.usthadTotal)) * 100;
    const targetAchievement = (monthlyMetrics.balance / 5500000) * 100; // Assuming 55L target

    const router = useRouter();

    const handleGoHome = () => {
        router.push("/ceo");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Premium Glass-Morphism Header */}
                <div className="mb-8 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[24px] shadow-lg p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        {/* Left Side: Brand Section */}
                        <div className="flex items-center gap-5">
                            {/* Gradient Icon Box */}
                            <div 
                                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl"
                                style={{
                                    background: 'linear-gradient(135deg, #ff4d00 0%, #dc2626 100%)',
                                    boxShadow: '0 12px 40px rgba(255, 77, 0, 0.35)'
                                }}
                            >
                                <BarChart3 className="w-10 h-10 text-white" />
                            </div>
                            
                            {/* Title and Quote */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-[#1e293b] uppercase tracking-tight leading-tight">
                                    FINANCIAL COMMAND CENTER
                                </h1>
                                <p className="text-sm italic text-[#64748b] mt-1">
                                    "Strategic visibility into Usthad Academy & UloomX revenue streams."
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Home Icon, Status and Time */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            {/* Home Icon Button */}
                            <button
                                onClick={handleGoHome}
                                className="w-10 h-10 rounded-full bg-[#ff4d00]/10 hover:bg-[#ff4d00] flex items-center justify-center transition-all duration-200 group"
                                title="Go to Home"
                            >
                                <Home className="w-5 h-5 text-[#ff4d00] group-hover:text-white transition-colors" />
                            </button>

                            {/* Live System Status */}
                            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-50 border border-green-200">
                                <div className="relative">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                                    <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></div>
                                </div>
                                <span className="text-sm font-bold text-green-700 tracking-wide">
                                    LIVE SYSTEM ACTIVE
                                </span>
                            </div>
                            
                            {/* Date/Time Stamp */}
                            <div className="px-4 py-2.5 rounded-full bg-slate-100 border border-slate-200">
                                <span className="text-sm font-medium text-[#64748b]">
                                    {currentDateTime}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-[#ff4d00]/20 border-t-[#ff4d00] rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-[#64748b] font-medium">Loading financial data...</p>
                        </div>
                    </div>
                ) : (
                    <>
                {/* Tier 1: Real-Time Daily Transmission */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-[#1e293b] mb-4">Real-Time Daily Transmission</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            title="Today's UloomX Income"
                            value={formatCurrency(animatedUloomxIncome.currentValue)}
                            imageUrl="/images/uloomx.png"
                            trend={dailyMetrics.uloomxIncome > 0 ? "up" : undefined}
                            trendValue={dailyMetrics.uloomxIncome > 0 ? "+12%" : undefined}
                            color="#ff4d00"
                        />
                        <MetricCard
                            title="Today's Usthad Income"
                            value={formatCurrency(animatedUsthadIncome.currentValue)}
                            imageUrl="/images/usthadacademylogo2.svg"
                            trend={dailyMetrics.usthadIncome > 0 ? "up" : undefined}
                            trendValue={dailyMetrics.usthadIncome > 0 ? "+8%" : undefined}
                            color="#ff4d00"
                        />
                        <MetricCard
                            title="Today's Combined Expense"
                            value={formatCurrency(animatedCombinedExpense.currentValue)}
                            icon={Wallet}
                            trend="down"
                            trendValue="+5%"
                            color="#ef4444"
                        />
                        <MetricCard
                            title="Today's Net Profit"
                            value={formatCurrency(animatedNetProfit.currentValue)}
                            icon={TrendingUp}
                            trend="up"
                            trendValue="+15%"
                            color="#10b981"
                        />
                    </div>
                </div>

                {/* Tier 2: Monthly Cumulative Overview */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-[#1e293b] mb-4">Monthly Cumulative Overview</h2>
                    <div className="bg-white rounded-[24px] border border-gray-100 shadow-lg p-6 md:p-10">
                        <div className="flex flex-col lg:flex-row gap-10">
                            {/* Left Side: Statistical Blocks */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-[#1e293b] mb-8">Monthly Fiscal Performance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-[#ff4d00]/10 flex items-center justify-center mb-3">
                                            <Building className="w-5 h-5 text-[#ff4d00]" />
                                        </div>
                                        <p className="text-sm text-[#64748b] mb-1">Monthly UloomX Total</p>
                                        <p className="text-2xl font-black text-[#1e293b]">{formatCurrency(animatedMonthlyUloomx.currentValue)}</p>
                                    </div>
                                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:shadow-md transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-[#ffb088]/20 flex items-center justify-center mb-3">
                                            <Landmark className="w-5 h-5 text-[#ff6b35]" />
                                        </div>
                                        <p className="text-sm text-[#64748b] mb-1">Monthly Usthad Total</p>
                                        <p className="text-2xl font-black text-[#1e293b]">{formatCurrency(animatedMonthlyUsthad.currentValue)}</p>
                                    </div>
                                    <div className="p-6 rounded-[20px] bg-gradient-to-br from-red-50 to-red-100 border border-red-200 hover:shadow-md transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-3">
                                            <Wallet className="w-5 h-5 text-red-500" />
                                        </div>
                                        <p className="text-sm text-[#64748b] mb-1">Monthly Total Expense</p>
                                        <p className="text-2xl font-black text-[#1e293b]">{formatCurrency(animatedMonthlyExpense.currentValue)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Current Monthly Balance */}
                            <div className="lg:w-[420px]">
                                <div className="h-full p-8 rounded-[20px] border-2 flex flex-col justify-center" 
                                     style={{ 
                                         borderColor: "#ff4d00", 
                                         background: "linear-gradient(135deg, rgba(255,77,0,0.08) 0%, rgba(255,107,53,0.03) 100%)" 
                                     }}>
                                    <p className="text-sm text-[#64748b] font-medium mb-2">Current Monthly Balance</p>
                                    <p className="text-4xl font-black" style={{ color: "#ff4d00" }}>
                                        {formatCurrency(monthlyMetrics.balance)}
                                    </p>
                                    <div className="mt-6 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-full w-fit">
                                        <ArrowUpRight className="w-4 h-4" />
                                        <span className="font-semibold">18% growth from last month</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tier 3: Growth Analytics & Insight Engine */}
                <div>
                    <h2 className="text-xl font-semibold text-[#1e293b] mb-4">Growth Analytics & Insight Engine</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Stacked Area Chart */}
                        <div className="lg:col-span-3 bg-white rounded-[24px] border border-gray-100 shadow-lg p-8">
                            <h3 className="text-lg font-bold text-[#1e293b] mb-6">30-Day Revenue Streams</h3>
                            <StackedAreaChart data={chartData} />
                            <div className="mt-6 flex items-center justify-center gap-8 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-[#ff4d00]"></div>
                                    <span className="text-[#64748b] font-medium">UloomX Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-[#ffb088]"></div>
                                    <span className="text-[#64748b] font-medium">Usthad Academy Revenue</span>
                                </div>
                            </div>
                        </div>

                        {/* Insight Engine - Strategic Revenue Split */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Donut Chart Card */}
                            <div className="bg-white rounded-[24px] border border-gray-100 shadow-lg p-8">
                                <h3 className="text-lg font-bold text-[#1e293b] mb-6">Strategic Revenue Split</h3>
                                <DonutChart 
                                    uloomxValue={monthlyMetrics.uloomxTotal} 
                                    usthadValue={monthlyMetrics.usthadTotal} 
                                />
                            </div>

                            {/* Anomaly Detection Cards */}
                            <div className="space-y-4">
                                {/* Expense Alert */}
                                <div className={`p-5 rounded-[20px] border transition-all ${
                                    expenseRatio > 35 
                                        ? 'bg-amber-50 border-amber-200' 
                                        : 'bg-green-50 border-green-200'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            expenseRatio > 35 
                                                ? 'bg-amber-100' 
                                                : 'bg-green-100'
                                        }`}>
                                            {expenseRatio > 35 ? (
                                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                            ) : (
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${
                                                expenseRatio > 35 ? 'text-amber-700' : 'text-green-700'
                                            }`}>
                                                {expenseRatio > 35 ? 'Expense Alert' : 'Expense Normal'}
                                            </p>
                                            <p className="text-xs text-[#64748b] mt-1">
                                                {expenseRatio > 35 
                                                    ? `${expenseRatio.toFixed(1)}% of revenue - above 35% threshold`
                                                    : `${expenseRatio.toFixed(1)}% of revenue - within normal range`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue Milestone */}
                                <div className={`p-5 rounded-[20px] border transition-all ${
                                    targetAchievement >= 90 
                                        ? 'bg-green-50 border-green-200' 
                                        : targetAchievement >= 75 
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-orange-50 border-orange-200'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                            targetAchievement >= 90 
                                                ? 'bg-green-100' 
                                                : targetAchievement >= 75 
                                                    ? 'bg-blue-100'
                                                    : 'bg-orange-100'
                                        }`}>
                                            {targetAchievement >= 90 ? (
                                                <Sparkles className="w-5 h-5 text-green-600" />
                                            ) : targetAchievement >= 75 ? (
                                                <Target className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Zap className="w-5 h-5 text-orange-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${
                                                targetAchievement >= 90 
                                                    ? 'text-green-700' 
                                                    : targetAchievement >= 75 
                                                        ? 'text-blue-700'
                                                        : 'text-orange-700'
                                            }`}>
                                                {targetAchievement >= 90 
                                                    ? 'Revenue Milestone Achieved!' 
                                                    : targetAchievement >= 75 
                                                        ? 'On Track to Target'
                                                        : 'Target Alert: Needs Focus'
                                                }
                                            </p>
                                            <p className="text-xs text-[#64748b] mt-1">
                                                Monthly target {targetAchievement.toFixed(0)}% achieved
                                                {targetAchievement < 90 && ` - ₹${formatCurrency(5500000 - monthlyMetrics.balance).replace('₹', '')} more needed`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    </>
                )}
            </div>
        </div>
    );
}
