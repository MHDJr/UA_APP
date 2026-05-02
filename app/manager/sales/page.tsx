"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Users,
    Target,
    TrendingUp,
    UserCheck,
    BarChart3,
    Calendar,
    ChevronDown,
    Star,
    Award,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

// Brand colors - Clean White & Navy (Matching Staff Hub)
const BRAND = {
    navy: "#2F1E73",
    orange: "#F15A24",
    lightNavy: "#3F348C",
    softOrange: "#FEF2EE",
    bg: "#F4F7FE",
    success: "#10B981",
    warning: "#F59E0B",
    cardBg: "#FFFFFF",
    textPrimary: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
};


// Conversion trend data for different time periods
const conversionTrendDataByPeriod = {
    today: [
        { day: "Mon", conversions: 8 },
        { day: "Tue", conversions: 12 },
        { day: "Wed", conversions: 15 },
        { day: "Thu", conversions: 10 },
        { day: "Fri", conversions: 18 },
        { day: "Sat", conversions: 22 },
        { day: "Sun", conversions: 14 },
    ],
    weekly: [
        { week: "Week 1", conversions: 45 },
        { week: "Week 2", conversions: 52 },
        { week: "Week 3", conversions: 38 },
        { week: "Week 4", conversions: 61 },
    ],
    monthly: [
        { month: "Jan", conversions: 180 },
        { month: "Feb", conversions: 195 },
        { month: "Mar", conversions: 210 },
        { month: "Apr", conversions: 188 },
    ],
};

// Lead quality data for different time periods
const leadQualityDataByPeriod = {
    today: [
        { quality: "Hot", count: 8, color: "#EF4444" },
        { quality: "Warm", count: 15, color: "#F59E0B" },
        { quality: "Cold", count: 12, color: "#6B7280" },
    ],
    weekly: [
        { quality: "Hot", count: 45, color: "#EF4444" },
        { quality: "Warm", count: 78, color: "#F59E0B" },
        { quality: "Cold", count: 62, color: "#6B7280" },
    ],
    monthly: [
        { quality: "Hot", count: 180, color: "#EF4444" },
        { quality: "Warm", count: 312, color: "#F59E0B" },
        { quality: "Cold", count: 248, color: "#6B7280" },
    ],
};

// Mock data for different time periods
const mockSalesDataByPeriod = {
    today: [
        {
            id: "1",
            name: "John Smith",
            role: "Sales Executive",
            leads: 12,
            evals: 8,
            conversions: 5,
            trend: "up",
        },
        {
            id: "2",
            name: "Sarah Johnson",
            role: "Senior Sales Rep",
            leads: 15,
            evals: 10,
            conversions: 6,
            trend: "up",
        },
        {
            id: "3",
            name: "Mike Davis",
            role: "Sales Associate",
            leads: 8,
            evals: 6,
            conversions: 3,
            trend: "stable",
        },
        {
            id: "4",
            name: "Emily Chen",
            role: "Sales Executive",
            leads: 10,
            evals: 7,
            conversions: 4,
            trend: "down",
        },
        {
            id: "5",
            name: "David Wilson",
            role: "Junior Sales Rep",
            leads: 6,
            evals: 4,
            conversions: 2,
            trend: "up",
        },
        {
            id: "6",
            name: "Lisa Anderson",
            role: "Sales Associate",
            leads: 9,
            evals: 6,
            conversions: 3,
            trend: "stable",
        },
    ],
    weekly: [
        {
            id: "1",
            name: "John Smith",
            role: "Sales Executive",
            leads: 45,
            evals: 32,
            conversions: 18,
            trend: "up",
        },
        {
            id: "2",
            name: "Sarah Johnson",
            role: "Senior Sales Rep",
            leads: 52,
            evals: 38,
            conversions: 22,
            trend: "up",
        },
        {
            id: "3",
            name: "Mike Davis",
            role: "Sales Associate",
            leads: 28,
            evals: 20,
            conversions: 10,
            trend: "stable",
        },
        {
            id: "4",
            name: "Emily Chen",
            role: "Sales Executive",
            leads: 41,
            evals: 29,
            conversions: 15,
            trend: "down",
        },
        {
            id: "5",
            name: "David Wilson",
            role: "Junior Sales Rep",
            leads: 22,
            evals: 15,
            conversions: 7,
            trend: "up",
        },
        {
            id: "6",
            name: "Lisa Anderson",
            role: "Sales Associate",
            leads: 35,
            evals: 25,
            conversions: 12,
            trend: "stable",
        },
    ],
    monthly: [
        {
            id: "1",
            name: "John Smith",
            role: "Sales Executive",
            leads: 180,
            evals: 128,
            conversions: 72,
            trend: "up",
        },
        {
            id: "2",
            name: "Sarah Johnson",
            role: "Senior Sales Rep",
            leads: 208,
            evals: 152,
            conversions: 88,
            trend: "up",
        },
        {
            id: "3",
            name: "Mike Davis",
            role: "Sales Associate",
            leads: 112,
            evals: 80,
            conversions: 40,
            trend: "stable",
        },
        {
            id: "4",
            name: "Emily Chen",
            role: "Sales Executive",
            leads: 164,
            evals: 116,
            conversions: 60,
            trend: "down",
        },
        {
            id: "5",
            name: "David Wilson",
            role: "Junior Sales Rep",
            leads: 88,
            evals: 60,
            conversions: 28,
            trend: "up",
        },
        {
            id: "6",
            name: "Lisa Anderson",
            role: "Sales Associate",
            leads: 140,
            evals: 100,
            conversions: 48,
            trend: "stable",
        },
    ],
};


interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
}

const KPICard = ({ title, value, icon, color, suffix }: KPICardProps) => (
    <div
        className="p-5 transition-all duration-300 hover:shadow-lg"
        style={{
            backgroundColor: BRAND.cardBg,
            borderRadius: "20px",
            border: `1px solid ${BRAND.border}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
    >
        <div className="flex items-center justify-between">
            <div>
                <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: BRAND.textSecondary }}
                >
                    {title}
                </p>
                <p
                    className="text-2xl font-bold"
                    style={{ color: BRAND.textPrimary }}
                >
                    {value}
                    {suffix && (
                        <span className="text-sm font-medium ml-0.5">{suffix}</span>
                    )}
                </p>
            </div>
            <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${color}15` }}
            >
                <div style={{ color }}>{icon}</div>
            </div>
        </div>
    </div>
);

export default function ManagerSalesPage() {
    const { profile, loading } = useAuth();
    const router = useRouter();
    const [timeFilter, setTimeFilter] = useState<"today" | "weekly" | "monthly">("weekly");
    const [salesData] = useState(mockSalesDataByPeriod.weekly);

    // Get manager's department name
    const departmentName = useMemo(() => {
        if (!profile) return "Sales";
        const role = profile.role;
        if (role === "sales") return "Sales";
        if (role === "ceo") return "Executive";
        if (role === "staff") return "Administration";
        return "Sales";
    }, [profile]);

    // Get sales data based on selected time filter
    const filteredSalesData = useMemo(() => {
        return mockSalesDataByPeriod[timeFilter];
    }, [timeFilter]);

    // Calculate KPIs based on filtered data
    const kpis = useMemo(() => {
        const totalLeads = filteredSalesData.reduce((sum, s) => sum + s.leads, 0);
        const totalConversions = filteredSalesData.reduce((sum, s) => sum + s.conversions, 0);
        const convRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : "0";
        const activeAgents = filteredSalesData.length;

        return {
            totalLeads,
            totalConversions,
            convRate,
            activeAgents,
        };
    }, [filteredSalesData]);

    // Get staff lead distribution based on filtered data
    const staffDistributionData = useMemo(() => {
        return filteredSalesData.map(staff => ({
            name: staff.name.split(' ')[0], // First name only
            leads: staff.leads,
        }));
    }, [filteredSalesData]);

    // Get conversion trend data based on selected time filter
    const conversionTrendData = useMemo(() => {
        return conversionTrendDataByPeriod[timeFilter];
    }, [timeFilter]);

    // Get lead quality data based on selected time filter
    const leadQualityData = useMemo(() => {
        return leadQualityDataByPeriod[timeFilter];
    }, [timeFilter]);

    // Get chart data key and label based on time filter
    const getChartDataConfig = () => {
        switch (timeFilter) {
            case "today":
                return { dataKey: "day", label: "Weekly Conversion Trend" };
            case "weekly":
                return { dataKey: "week", label: "Monthly Conversion Trend" };
            case "monthly":
                return { dataKey: "month", label: "Quarterly Conversion Trend" };
            default:
                return { dataKey: "day", label: "Weekly Conversion Trend" };
        }
    };

    const chartConfig = getChartDataConfig();

    if (loading || !profile) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ backgroundColor: BRAND.bg }}
            >
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="h-8 w-8 border-2 rounded-full animate-spin"
                        style={{
                            borderColor: `${BRAND.navy}20`,
                            borderTopColor: BRAND.navy,
                        }}
                    />
                    <span
                        className="text-xs font-medium tracking-wider uppercase"
                        style={{ color: BRAND.textSecondary }}
                    >
                        Loading Sales Data...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-8"
            style={{ backgroundColor: BRAND.bg }}
        >
            {/* Header */}
            <header
                className="sticky top-0 z-50 px-6 py-4 mb-6"
                style={{
                    backgroundColor: BRAND.cardBg,
                    borderBottom: `1px solid ${BRAND.border}`,
                }}
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push("/manager")}
                            className="p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                            style={{
                                backgroundColor: `${BRAND.navy}10`,
                                color: BRAND.navy,
                            }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1
                                className="text-xl font-bold"
                                style={{ color: BRAND.textPrimary }}
                            >
                                Sales Management
                            </h1>
                            <p
                                className="text-xs font-medium"
                                style={{ color: BRAND.textSecondary }}
                            >
                                {departmentName} Department
                            </p>
                        </div>
                    </div>
                    <div
                        className="px-4 py-2 rounded-full text-xs font-semibold"
                        style={{
                            backgroundColor: BRAND.softOrange,
                            color: BRAND.orange,
                        }}
                    >
                        Live Data
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 space-y-6">
                {/* KPI Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                        title="Total Leads"
                        value={kpis.totalLeads}
                        icon={<Target className="w-5 h-5" />}
                        color={BRAND.navy}
                    />
                    <KPICard
                        title="Total Conversions"
                        value={kpis.totalConversions}
                        icon={<UserCheck className="w-5 h-5" />}
                        color={BRAND.success}
                    />
                    <KPICard
                        title="Conv. Rate"
                        value={kpis.convRate}
                        suffix="%"
                        icon={<TrendingUp className="w-5 h-5" />}
                        color={BRAND.orange}
                    />
                    <KPICard
                        title="Active Agents"
                        value={kpis.activeAgents}
                        icon={<Users className="w-5 h-5" />}
                        color={BRAND.lightNavy}
                    />
                </div>

                {/* Sales Matrix Table */}
                <div
                    style={{
                        backgroundColor: BRAND.cardBg,
                        borderRadius: "20px",
                        border: `1px solid ${BRAND.border}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        overflow: "hidden",
                    }}
                >
                    <div className="px-6 py-4 border-b" style={{ borderColor: BRAND.border }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5" style={{ color: BRAND.navy }} />
                                <h2
                                    className="text-lg font-bold"
                                    style={{ color: BRAND.textPrimary }}
                                >
                                    Department Sales Matrix
                                </h2>
                            </div>
                            
                            {/* Filter Buttons */}
                            <div className="flex items-center gap-2">
                                {[
                                    { value: "today", label: "Today", icon: Calendar },
                                    { value: "weekly", label: "Weekly", icon: Target },
                                    { value: "monthly", label: "Monthly", icon: TrendingUp },
                                ].map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => setTimeFilter(filter.value as any)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                            timeFilter === filter.value
                                                ? "bg-[#2F1E73] text-white shadow-md"
                                                : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                                        }`}
                                    >
                                        <filter.icon className="w-3.5 h-3.5" />
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr style={{ backgroundColor: `${BRAND.navy}08` }}>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: BRAND.textSecondary }}
                                    >
                                        Staff Member
                                    </th>
                                    <th
                                        className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: BRAND.textSecondary }}
                                    >
                                        Role
                                    </th>
                                    <th
                                        className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: BRAND.textSecondary }}
                                    >
                                        Leads
                                    </th>
                                    <th
                                        className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: BRAND.textSecondary }}
                                    >
                                        Evals
                                    </th>
                                    <th
                                        className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: BRAND.textSecondary }}
                                    >
                                        Conversions
                                    </th>
                                    <th
                                        className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                                        style={{ color: BRAND.textSecondary }}
                                    >
                                        Conv. Rate
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalesData.map((staff, index) => {
                                    const convRate = staff.leads > 0
                                        ? ((staff.conversions / staff.leads) * 100).toFixed(1)
                                        : "0";
                                    return (
                                        <tr
                                            key={staff.id}
                                            className="transition-colors duration-200"
                                            style={{
                                                backgroundColor: index % 2 === 0 ? BRAND.cardBg : `${BRAND.navy}03`,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = `${BRAND.navy}08`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = index % 2 === 0
                                                    ? BRAND.cardBg
                                                    : `${BRAND.navy}03`;
                                            }}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                                        style={{
                                                            backgroundColor: `${BRAND.navy}15`,
                                                            color: BRAND.navy,
                                                        }}
                                                    >
                                                        {staff.name.split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <span
                                                        className="font-medium"
                                                        style={{ color: BRAND.textPrimary }}
                                                    >
                                                        {staff.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td
                                                className="px-6 py-4 text-center text-sm"
                                                style={{ color: BRAND.textSecondary }}
                                            >
                                                {staff.role}
                                            </td>
                                            <td
                                                className="px-6 py-4 text-center font-semibold"
                                                style={{ color: BRAND.navy }}
                                            >
                                                {staff.leads}
                                            </td>
                                            <td
                                                className="px-6 py-4 text-center font-semibold"
                                                style={{ color: BRAND.lightNavy }}
                                            >
                                                {staff.evals}
                                            </td>
                                            <td
                                                className="px-6 py-4 text-center font-bold"
                                                style={{ color: BRAND.success }}
                                            >
                                                {staff.conversions}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className="px-3 py-1 rounded-full text-xs font-semibold"
                                                    style={{
                                                        backgroundColor: parseFloat(convRate) >= 40
                                                            ? `${BRAND.success}15`
                                                            : parseFloat(convRate) >= 30
                                                                ? `${BRAND.warning}15`
                                                                : `${BRAND.orange}15`,
                                                        color: parseFloat(convRate) >= 40
                                                            ? BRAND.success
                                                            : parseFloat(convRate) >= 30
                                                                ? BRAND.warning
                                                                : BRAND.orange,
                                                    }}
                                                >
                                                    {convRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Conversion Trend */}
                    <div
                        style={{
                            backgroundColor: BRAND.cardBg,
                            borderRadius: "20px",
                            border: `1px solid ${BRAND.border}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            padding: "24px",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-5 h-5" style={{ color: BRAND.navy }} />
                            <h3
                                className="text-base font-bold"
                                style={{ color: BRAND.textPrimary }}
                            >
                                {chartConfig.label}
                            </h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={conversionTrendData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={BRAND.border}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey={chartConfig.dataKey}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: BRAND.textSecondary,
                                            fontSize: 11,
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: BRAND.textSecondary,
                                            fontSize: 11,
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: BRAND.cardBg,
                                            border: `1px solid ${BRAND.border}`,
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        }}
                                        labelStyle={{ color: BRAND.textPrimary }}
                                        itemStyle={{ color: BRAND.navy }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="conversions"
                                        stroke={BRAND.navy}
                                        strokeWidth={3}
                                        dot={{ fill: BRAND.navy, strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: BRAND.orange }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Staff Lead Distribution */}
                    <div
                        style={{
                            backgroundColor: BRAND.cardBg,
                            borderRadius: "20px",
                            border: `1px solid ${BRAND.border}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            padding: "24px",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-5 h-5" style={{ color: BRAND.navy }} />
                            <h3
                                className="text-base font-bold"
                                style={{ color: BRAND.textPrimary }}
                            >
                                Staff Lead Distribution
                            </h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={staffDistributionData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={BRAND.border}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: BRAND.textSecondary,
                                            fontSize: 11,
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: BRAND.textSecondary,
                                            fontSize: 11,
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: BRAND.cardBg,
                                            border: `1px solid ${BRAND.border}`,
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        }}
                                        labelStyle={{ color: BRAND.textPrimary }}
                                        itemStyle={{ color: BRAND.navy }}
                                    />
                                    <Bar
                                        dataKey="leads"
                                        fill={BRAND.navy}
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Lead Quality Distribution */}
                    <div
                        style={{
                            backgroundColor: BRAND.cardBg,
                            borderRadius: "20px",
                            border: `1px solid ${BRAND.border}`,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                            padding: "24px",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Award className="w-5 h-5" style={{ color: BRAND.navy }} />
                            <h3
                                className="text-base font-bold"
                                style={{ color: BRAND.textPrimary }}
                            >
                                Lead Quality Distribution
                            </h3>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leadQualityData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={BRAND.border}
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="quality"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: BRAND.textSecondary,
                                            fontSize: 11,
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: BRAND.textSecondary,
                                            fontSize: 11,
                                        }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: BRAND.cardBg,
                                            border: `1px solid ${BRAND.border}`,
                                            borderRadius: "12px",
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                        }}
                                        labelStyle={{ color: BRAND.textPrimary }}
                                        itemStyle={{ color: BRAND.navy }}
                                    />
                                    <Bar dataKey="count" fill="#EF4444" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="count" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="count" fill="#6B7280" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Lead Quality Legend */}
                        <div className="flex items-center justify-center gap-4 mt-4">
                            {leadQualityData.map((quality) => (
                                <div key={quality.quality} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: quality.color }}
                                    />
                                    <span className="text-xs font-medium" style={{ color: BRAND.textSecondary }}>
                                        {quality.quality}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
