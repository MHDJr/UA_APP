"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    TrendingUp,
    Rocket,
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Phone,
    FileText,
    UserCheck,
    Crown,
    Target,
    Clock,
    ChevronRight,
    MoreHorizontal,
    RefreshCw,
    Star,
    XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdvancedViewToggle } from "@/components/ui/advanced-view-toggle";
import { DetailedMatrix } from "@/components/detailed-matrix";
import { CEOStaffVelocity } from "./ceo-staff-velocity";
import { supabase, DailyReport, Profile } from "@/lib/supabase";

// Brand colors
const BRAND_COLORS = {
    indigo: "#2F1E73",
    orange: "#FA4615",
    lightOrange: "#FF6B35",
};

// Real funnel data calculated from daily reports
const calculateFunnelData = (reports: SalesRepData[]) => {
    const totalLeads = reports.reduce((sum, rep) => sum + rep.leadsClaimed, 0);
    const totalEvaluations = reports.reduce((sum, rep) => sum + rep.evaluations, 0);
    const totalConverted = reports.reduce((sum, rep) => sum + rep.closed, 0);
    const totalLost = reports.reduce((sum, rep) => sum + (rep.leadsClaimed - rep.contacted), 0);
    
    // Assume 90% of converted get assigned (can be updated with real data later)
    const totalAssigned = Math.round(totalConverted * 0.9);

    return [
        { 
            stage: "Leads", 
            count: totalLeads, 
            conversion: "100%", 
            icon: Users 
        },
        { 
            stage: "Evaluations", 
            count: totalEvaluations, 
            conversion: totalLeads > 0 ? `${Math.round((totalEvaluations / totalLeads) * 100)}%` : "0%", 
            icon: FileText 
        },
        { 
            stage: "Converted", 
            count: totalConverted, 
            conversion: totalEvaluations > 0 ? `${Math.round((totalConverted / totalEvaluations) * 100)}%` : "0%", 
            icon: CheckCircle2 
        },
        { 
            stage: "Not Converted", 
            count: totalLost, 
            conversion: totalLeads > 0 ? `${Math.round((totalLost / totalLeads) * 100)}%` : "0%", 
            icon: AlertCircle 
        },
        { 
            stage: "Assigned", 
            count: totalAssigned, 
            conversion: totalConverted > 0 ? `${Math.round((totalAssigned / totalConverted) * 100)}%` : "0%", 
            icon: UserCheck 
        },
    ];
};

// Real sales reps data from daily reports
interface SalesRepData {
    id: string;
    name: string;
    initials: string;
    leadsClaimed: number;
    contacted: number;
    evaluations: number;
    closed: number;
    rank: number;
    efficiency_score: number;
    conversion_rate: number;
    lead_quality_rating: number;
    report_date: string;
    submitted_at: string;
}


// Metric card component
const MetricCard = ({
    title,
    value,
    trend,
    trendUp,
    icon: Icon,
    delay,
}: {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: React.ElementType;
    delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="glass-card-ua rounded-2xl p-5 hover:shadow-lg transition-all duration-300"
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <div className="flex items-center gap-1 mt-2">
                    <TrendingUp
                        className={`w-3 h-3 ${trendUp ? "text-green-500" : "text-red-500 rotate-180"}`}
                    />
                    <span
                        className={`text-xs font-medium ${
                            trendUp ? "text-green-600" : "text-red-600"
                        }`}
                    >
                        {trend}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">vs last week</span>
                </div>
            </div>
            <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: `${BRAND_COLORS.indigo}10` }}
            >
                <Icon className="w-5 h-5" style={{ color: BRAND_COLORS.indigo }} />
            </div>
        </div>
    </motion.div>
);

// Funnel step component
const FunnelStep = ({
    stage,
    count,
    conversion,
    icon: Icon,
    isFirst,
    isLast,
    delay,
}: {
    stage: string;
    count: number;
    conversion: string;
    icon: React.ElementType;
    isFirst: boolean;
    isLast: boolean;
    delay: number;
}) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.4 }}
        className="flex-1 relative"
    >
        <div className="flex items-center">
            {/* Connector line */}
            {!isFirst && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-0.5 -ml-2">
                    <div
                        className="w-full h-full rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${BRAND_COLORS.indigo}40, ${BRAND_COLORS.orange})`,
                        }}
                    />
                </div>
            )}

            <div className="flex-1 glass-card-ua rounded-xl p-4 text-center relative hover:shadow-md transition-all duration-300 group">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${BRAND_COLORS.indigo}15` }}
                >
                    <Icon className="w-5 h-5" style={{ color: BRAND_COLORS.indigo }} />
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    {stage}
                </p>
                <h4 className="text-xl font-bold text-gray-900">{count}</h4>
                <p
                    className="text-xs font-semibold mt-1"
                    style={{ color: BRAND_COLORS.orange }}
                >
                    {conversion}
                </p>
            </div>
        </div>
    </motion.div>
);

// Sales rep row component
const SalesRepRow = ({ rep, index }: { rep: SalesRepData; index: number }) => (
    <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 + index * 0.1 }}
        className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
    >
        <td className="py-4 px-4">
            <div className="flex items-center gap-3">
                <Avatar
                    className="w-9 h-9 border-2"
                    style={{ borderColor: `${BRAND_COLORS.indigo}20` }}
                >
                    <AvatarFallback
                        className="text-xs font-bold text-white"
                        style={{ backgroundColor: BRAND_COLORS.indigo }}
                    >
                        {rep.initials}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{rep.name}</p>
                    {rep.rank === 1 && (
                        <Badge
                            className="text-[10px] px-1.5 py-0"
                            style={{
                                backgroundColor: `${BRAND_COLORS.orange}15`,
                                color: BRAND_COLORS.orange,
                                border: "none",
                            }}
                        >
                            <Crown className="w-3 h-3 mr-1" />
                            Top Performer
                        </Badge>
                    )}
                </div>
            </div>
        </td>
        <td className="py-4 px-4 text-center">
            <span className="text-sm font-medium text-gray-700">{rep.leadsClaimed}</span>
        </td>
        <td className="py-4 px-4 text-center">
            <span className="text-sm font-medium text-gray-700">{rep.evaluations}</span>
        </td>
        <td className="py-4 px-4 text-center">
            <span
                className="text-sm font-bold"
                style={{ color: BRAND_COLORS.indigo }}
            >
                {rep.closed}
            </span>
        </td>
        <td className="py-4 px-4 text-center">
            <span
                className="text-sm font-bold"
                style={{ color: BRAND_COLORS.orange }}
            >
                {rep.leadsClaimed - rep.contacted}
            </span>
        </td>
        <td className="py-4 px-4 text-right">
            <div className="flex items-center justify-end gap-2">
                <div className="text-right">
                    <div className="text-lg font-bold" style={{ color: BRAND_COLORS.indigo }}>
                        {rep.lead_quality_rating}
                    </div>
                    <div className="text-xs text-gray-400">/10</div>
                </div>
                <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                        backgroundColor: rep.lead_quality_rating >= 8 ? `${BRAND_COLORS.orange}15` : 
                                       rep.lead_quality_rating >= 6 ? `${BRAND_COLORS.indigo}15` : '#f3f4f6'
                    }}
                >
                    <Star 
                        className="w-4 h-4" 
                        style={{
                            color: rep.lead_quality_rating >= 8 ? BRAND_COLORS.orange : 
                                   rep.lead_quality_rating >= 6 ? BRAND_COLORS.indigo : '#6b7280'
                        }} 
                    />
                </div>
            </div>
        </td>
    </motion.tr>
);

// Deployment item component
const DeploymentItem = ({ deployment, index }: { deployment: any; index: number }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 + index * 0.1 }}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/20 transition-colors group"
    >
        <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
                backgroundColor: `${BRAND_COLORS.orange}15`,
            }}
        >
            <Rocket
                className="w-5 h-5"
                style={{
                    color: BRAND_COLORS.orange,
                }}
            />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
                {deployment.studentName}
            </p>
            <p className="text-xs text-white/80 flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                Assigned to <span className="font-medium text-white/90">{deployment.tutorName}</span>
            </p>
        </div>
        <span className="text-xs text-white/60 flex-shrink-0">{deployment.time}</span>
    </motion.div>
);

export function ExecutiveSalesOverview() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [salesReps, setSalesReps] = useState<SalesRepData[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [unassignedCount, setUnassignedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdvancedView, setIsAdvancedView] = useState(false);

    // Calculate real metrics from sales data
    const calculateMetrics = (reports: SalesRepData[]) => {
        const totalLeads = reports.reduce((sum, rep) => sum + rep.leadsClaimed, 0);
        const totalEvaluations = reports.reduce((sum, rep) => sum + rep.evaluations, 0);
        const totalConverted = reports.reduce((sum, rep) => sum + rep.closed, 0);
        
        const evalRate = totalLeads > 0 ? Math.round((totalEvaluations / totalLeads) * 100) : 0;
        const closeRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;
        
        // For pending deployments, use a placeholder or could be calculated from real data
        const pendingDeployments = totalConverted > 0 ? Math.max(0, totalConverted - Math.round(totalConverted * 0.9)) : 0;

        return {
            totalLeads,
            evalRate,
            closeRate,
            pendingDeployments
        };
    };

    // Fetch assignments from database
    const fetchAssignments = async () => {
        try {
            // Fetch assigned students
            const { data: assignedData, error: assignedError } = await supabase
                .from("conversions")
                .select("*")
                .not("assigned_tutor", "is", null)
                .order("assigned_at", { ascending: false })
                .limit(10);

            if (assignedError) {
                console.error("Error fetching assignments:", assignedError);
                return;
            }

            // Fetch unassigned students count
            const { count: unassignedData, error: unassignedError } = await supabase
                .from("conversions")
                .select("id", { count: 'exact', head: true })
                .is("assigned_tutor", null);

            if (unassignedError) {
                console.error("Error fetching unassigned count:", unassignedError);
            } else {
                setUnassignedCount(unassignedData || 0);
            }

            // Transform assigned data for display
            const transformedAssignments = assignedData?.map(assignment => {
                const assignedTime = new Date(assignment.assigned_at);
                const now = new Date();
                const diffInMinutes = Math.floor((now.getTime() - assignedTime.getTime()) / (1000 * 60));
                
                let timeAgo;
                if (diffInMinutes < 60) {
                    timeAgo = `${diffInMinutes} min ago`;
                } else if (diffInMinutes < 1440) {
                    timeAgo = `${Math.floor(diffInMinutes / 60)} hours ago`;
                } else {
                    timeAgo = `${Math.floor(diffInMinutes / 1440)} days ago`;
                }

                return {
                    id: assignment.id,
                    studentName: assignment.student_name,
                    tutorName: assignment.assigned_tutor,
                    time: timeAgo,
                };
            }) || [];

            setAssignments(transformedAssignments);
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    };

    // Fetch daily reports data
    const fetchDailyReports = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            
            // Query to get only the latest report for each staff member today
            const { data: reports, error } = await supabase
                .from('daily_reports')
                .select(`
                    *,
                    profiles!daily_reports_profile_id_fkey (
                        full_name,
                        role,
                        is_sales_staff
                    )
                `)
                .eq('report_date', today)
                .order('submitted_at', { ascending: false });

            console.log('Daily reports query result:', { reports, error, today });

            if (error) {
                console.error('Error fetching daily reports:', error);
                return;
            }

            // Debug: Log all reports before filtering
            console.log('All reports found:', reports?.length || 0);

            // Group reports by profile_id and keep only the latest one for each staff member
            const latestReportsMap = new Map();
            reports?.forEach((report: any) => {
                const profileId = report.profile_id;
                if (!latestReportsMap.has(profileId) || 
                    new Date(report.submitted_at) > new Date(latestReportsMap.get(profileId).submitted_at)) {
                    latestReportsMap.set(profileId, report);
                }
            });

            const uniqueReports = Array.from(latestReportsMap.values());
            console.log('Unique latest reports:', uniqueReports.length);

            // Transform data for display
            const transformedData: SalesRepData[] = uniqueReports
                .filter((report: any) => {
                    console.log('Processing report:', {
                        id: report.id,
                        profile_name: report.profiles?.full_name,
                        report_date: report.report_date,
                        today: today
                    });
                    return report.profiles?.full_name;
                })
                .map((report: any, index: number) => ({
                    id: report.id,
                    name: report.profiles!.full_name,
                    initials: report.profiles!.full_name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase(),
                    leadsClaimed: report.total_leads,
                    contacted: report.total_leads - report.lost_leads, // Approximate contacted
                    evaluations: report.evaluations_taken,
                    closed: report.conversions,
                    rank: index + 1, // Will be recalculated based on conversions
                    efficiency_score: report.efficiency_score,
                    conversion_rate: report.conversion_rate,
                    lead_quality_rating: report.lead_quality_rating,
                    report_date: report.report_date,
                    submitted_at: report.submitted_at,
                }))
                .sort((a, b) => b.closed - a.closed) // Sort by conversions (closed)
                .map((rep, index) => ({ ...rep, rank: index + 1 })); // Update ranks

            console.log('Transformed data:', transformedData);
            setSalesReps(transformedData);
        } catch (error) {
            console.error('Error fetching daily reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchDailyReports();
        fetchAssignments();
        
        // Refresh every 5 minutes
        const interval = setInterval(() => {
            fetchDailyReports();
            fetchAssignments();
        }, 300000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDailyReports();
    };

    return (
        <div className="min-h-screen bg-ua-mesh-gradient p-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1
                            className="text-2xl font-bold mb-1"
                            style={{ color: BRAND_COLORS.indigo }}
                        >
                            Sales Intelligence
                        </h1>
                        <p className="text-sm text-gray-500">
                            Real-time visibility into the acquisition pipeline
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <AdvancedViewToggle
                            isAdvanced={isAdvancedView}
                            onToggle={setIsAdvancedView}
                        />
                        <div className="glass-card-ua rounded-lg px-4 py-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                                {currentTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="ua-live-dot" />
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Live Feed
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Top Row: 4 Metric Cards */}
            <div className="grid grid-cols-4 gap-5 mb-8">
                {(() => {
                    const metrics = calculateMetrics(salesReps);
                    return (
                        <>
                            <MetricCard
                                title="TOTAL LEADS"
                                value={metrics.totalLeads.toString()}
                                trend="+12%"
                                trendUp={true}
                                icon={Users}
                                delay={0.1}
                            />
                            <MetricCard
                                title="EVAL RATE"
                                value={`${metrics.evalRate}%`}
                                trend="+5%"
                                trendUp={true}
                                icon={Target}
                                delay={0.2}
                            />
                            <MetricCard
                                title="CLOSE RATE"
                                value={`${metrics.closeRate}%`}
                                trend="+2%"
                                trendUp={true}
                                icon={CheckCircle2}
                                delay={0.3}
                            />
                            <MetricCard
                                title="PENDING DEPLOYMENTS"
                                value={metrics.pendingDeployments.toString()}
                                trend="-1"
                                trendUp={true}
                                icon={Rocket}
                                delay={0.4}
                            />
                        </>
                    );
                })()}
            </div>

            {/* Middle Section: The Funnel */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card-ua rounded-2xl p-6 mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-1 h-5 rounded-full"
                            style={{ backgroundColor: BRAND_COLORS.orange }}
                        />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                            Pipeline Flow
                        </h3>
                    </div>
                    <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: BRAND_COLORS.indigo, color: BRAND_COLORS.indigo }}
                    >
                        Last 30 Days
                    </Badge>
                </div>

                <div className="flex items-center gap-3">
                    {calculateFunnelData(salesReps).map((step: any, index: number) => (
                        <FunnelStep
                            key={step.stage}
                            stage={step.stage}
                            count={step.count}
                            conversion={step.conversion}
                            icon={step.icon}
                            isFirst={index === 0}
                            isLast={index === calculateFunnelData(salesReps).length - 1}
                            delay={0.4 + index * 0.1}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Bottom Grid: 2 Columns */}
            <div className="grid grid-cols-2 gap-6">
                {/* Column 1: Sales Matrix */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card-ua rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-1 h-5 rounded-full"
                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                            />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                                Sales Matrix
                            </h3>
                            <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: BRAND_COLORS.indigo, color: BRAND_COLORS.indigo }}
                            >
                                Today's Reports
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-gray-500 hover:text-gray-700"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Agent
                                    </th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Leads
                                    </th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Evals
                                    </th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Converted
                                    </th>
                                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Not Conv
                                    </th>
                                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Lead Quality
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                                                <span className="text-sm text-gray-500">Loading daily reports...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : salesReps.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users className="w-8 h-8 text-gray-300" />
                                                <p className="text-sm text-gray-500 font-medium">No daily reports submitted today</p>
                                                <p className="text-xs text-gray-400">Sales staff reports will appear here once submitted</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    salesReps.map((rep, index) => (
                                        <SalesRepRow key={rep.id} rep={rep} index={index} />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Column 2: Live Deployments */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-2xl overflow-hidden"
                    style={{ backgroundColor: BRAND_COLORS.indigo }}
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-5 rounded-full bg-white/30" />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
                                    Victory Feed
                                </h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs text-white/60">Live</span>
                            </div>
                        </div>

                        <ScrollArea className="h-[320px] pr-4">
                            <div className="space-y-1">
                                {assignments.map((deployment, index) => (
                                    <DeploymentItem
                                        key={deployment.id}
                                        deployment={deployment}
                                        index={index}
                                    />
                                ))}
                                {assignments.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-6 h-6 text-white/60" />
                                        </div>
                                        <p className="text-white/60 text-sm">No student assignments yet</p>
                                        <p className="text-white/40 text-xs mt-1">Assignments will appear here when managers assign tutors to students</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Bottom stats */}
                    <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-white/80">
                                        <strong className="text-white">{assignments.length}</strong> Total Assigned
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-white/20" />
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm text-white/80">
                                        <strong className="text-white">{unassignedCount}</strong> Pending Assignment
                                    </span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className="h-8 px-4 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border-0"
                            >
                                View All
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Detailed Matrix Section - Appears in Advanced View */}
            <AnimatePresence>
                {isAdvancedView && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ 
                            opacity: 1, 
                            height: "auto", 
                            scale: 1,
                            transition: {
                                height: { duration: 0.6, ease: "easeInOut" },
                                opacity: { duration: 0.4, delay: 0.1 },
                                scale: { duration: 0.5, ease: "easeOut" }
                            }
                        }}
                        exit={{ 
                            opacity: 0, 
                            height: 0, 
                            scale: 0.95,
                            transition: {
                                height: { duration: 0.4, ease: "easeInOut" },
                                opacity: { duration: 0.3 },
                                scale: { duration: 0.3, ease: "easeIn" }
                            }
                        }}
                        className="overflow-hidden"
                    >
                        <motion.div
                            className="m-6 space-y-6"
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            {/* Sales Staff Velocity - Only in Advanced View */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <CEOStaffVelocity />
                            </motion.div>
                            
                            <DetailedMatrix salesReps={salesReps} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ExecutiveSalesOverview;
