"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Clock,
    Target,
    TrendingUp,
    Users,
    Phone,
    FileText,
    XCircle,
    Send,
    Plus,
    ChevronLeft,
    Award,
    Sun,
    Moon,
    Coffee,
    Sparkles,
    Smile,
    RefreshCw,
    BarChart3,
    Star,
    Home,
    MessageSquare,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import MobileNavigation from "@/components/mobile-navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// Brand colors matching Staff Hub exactly
const BRAND = {
    navy: "#2F1E73",
    orange: "#FA4615",
    lightNavy: "#3F348C",
    softOrange: "#FEF2EE",
    bg: "#F4F7FE",
};

// Confetti effect function
const triggerConfetti = () => {
    const colors = [BRAND.navy, BRAND.orange, "#16a34a", "#f59e0b"];
    const confettiCount = 60;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            pointer-events: none;
            z-index: 9999;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        `;
        document.body.appendChild(confetti);

        const angle = (Math.PI * 2 * i) / confettiCount;
        const velocity = 6 + Math.random() * 6;

        let opacity = 1;
        let scale = 1;
        let x = 0;
        let y = 0;

        const animate = () => {
            x += Math.cos(angle) * velocity;
            y += Math.sin(angle) * velocity + 2;
            opacity -= 0.015;
            scale -= 0.008;

            confetti.style.transform = `
                translate(calc(-50% + ${x}px), calc(-50% + ${y}px))
                scale(${scale})
            `;
            confetti.style.opacity = opacity.toString();

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                document.body.removeChild(confetti);
            }
        };

        requestAnimationFrame(animate);
    }
};

// Get greeting based on time of day
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
        return {
            text: "GOOD MORNING",
            icon: <Sun className="w-8 h-8 text-orange-400" />,
        };
    if (hour < 18)
        return {
            text: "GOOD AFTERNOON",
            icon: <Coffee className="w-8 h-8 text-orange-400" />,
        };
    return {
        text: "GOOD EVENING",
        icon: <Moon className="w-8 h-8 text-orange-400" />,
    };
};

export function SalesReportingPage() {
    const { profile, user } = useAuth();
    const [time, setTime] = useState("");
    const [vibe, setVibe] = useState("Focused");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
    const [studentName, setStudentName] = useState("");
    const [isAddingConversion, setIsAddingConversion] = useState(false);
    const [mobileNavTab, setMobileNavTab] = useState("home");
    const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
    const [todayReportId, setTodayReportId] = useState<string | null>(null);

    // Form states with localStorage persistence
    const [totalLeads, setTotalLeads] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sales_totalLeads') || "";
        }
        return "";
    });
    const [conversions, setConversions] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sales_conversions');
            console.log('Loading conversions from localStorage:', saved);
            return saved || "0";
        }
        return "0";
    });
    const [evaluations, setEvaluations] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sales_evaluations') || "";
        }
        return "";
    });
    const [lostLeads, setLostLeads] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sales_lostLeads') || "";
        }
        return "";
    });
    const [leadQuality, setLeadQuality] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('sales_leadQuality');
            return saved ? JSON.parse(saved) : [7];
        }
        return [7];
    });

    // 12-Hour Format Timer Logic
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const ampm = hours >= 12 ? "PM" : "AM";
            const displayHours = hours % 12 || 12;
            const displayMinutes = minutes.toString().padStart(2, "0");
            const displaySeconds = seconds.toString().padStart(2, "0");
            setTime(`${displayHours}:${displayMinutes}:${displaySeconds} ${ampm}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Update tracking data in database whenever form values change
    useEffect(() => {
        if (typeof window !== 'undefined' && user && profile) {
            console.log('Updating tracking data in database:', { totalLeads, conversions, evaluations, lostLeads, leadQuality });
            
            const updateTrackingData = async () => {
                try {
                    const today = new Date().toISOString().split("T")[0];
                    
                    const { data, error } = await supabase
                        .from("daily_sales_tracking")
                        .upsert({
                            profile_id: profile.id,
                            tracking_date: today,
                            total_leads: parseInt(totalLeads) || 0,
                            conversions: parseInt(conversions) || 0,
                            evaluations_taken: parseInt(evaluations) || 0,
                            lost_leads: parseInt(lostLeads) || 0,
                            lead_quality_rating: leadQuality[0] || 7,
                            updated_at: new Date().toISOString(),
                        })
                        .select();
                    
                    if (error) {
                        console.error('Database update error:', error);
                        // If table doesn't exist, fall back to localStorage only
                        if (error.message.includes('relation') && error.message.includes('does not exist')) {
                            console.log('daily_sales_tracking table does not exist, using localStorage fallback');
                        }
                    } else {
                        console.log('Database update successful:', data);
                    }
                } catch (err) {
                    console.error('Unexpected error updating tracking data:', err);
                }
            };
            
            // Debounce the update to avoid too frequent database calls
            const timeoutId = setTimeout(updateTrackingData, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [totalLeads, conversions, evaluations, lostLeads, leadQuality, user, profile]);

    // Also save to localStorage as backup
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('Saving to localStorage:', { totalLeads, conversions, evaluations, lostLeads, leadQuality });
            localStorage.setItem('sales_totalLeads', totalLeads);
            localStorage.setItem('sales_conversions', conversions);
            localStorage.setItem('sales_evaluations', evaluations);
            localStorage.setItem('sales_lostLeads', lostLeads);
            localStorage.setItem('sales_leadQuality', JSON.stringify(leadQuality));
            
            // Also save a timestamp to track when data was last saved
            localStorage.setItem('sales_lastSaved', new Date().toISOString());
        }
    }, [totalLeads, conversions, evaluations, lostLeads, leadQuality]);

    // Check if user has already submitted report today
    useEffect(() => {
        const checkTodaySubmission = async () => {
            if (!user || !profile) return;

            const today = new Date().toISOString().split("T")[0];
            
            // For now, use localStorage as primary storage since database table may not exist
            // This ensures data persistence even if database operations fail
            loadFromLocalStorage();
            
            // Try to use database if available, but don't depend on it
            try {
                const { data: trackingData, error: trackingError } = await supabase
                    .from("daily_sales_tracking")
                    .select("*")
                    .eq("profile_id", profile.id)
                    .eq("tracking_date", today)
                    .single();

                if (!trackingError && trackingData) {
                    console.log('Loading tracking data from database:', trackingData);
                    // Only use database data if localStorage is empty/defaults
                    const localConversions = localStorage.getItem('sales_conversions') || "0";
                    if (localConversions === "0" && trackingData.conversions > 0) {
                        setConversions(trackingData.conversions.toString());
                        setTotalLeads(trackingData.total_leads?.toString() || "");
                        setEvaluations(trackingData.evaluations_taken?.toString() || "");
                        setLostLeads(trackingData.lost_leads?.toString() || "");
                        setLeadQuality([trackingData.lead_quality_rating || 7]);
                    }
                }
            } catch (err) {
                console.log('Database tracking not available, using localStorage only');
            }
            
            // Check if report has been submitted today (separate from tracking)
            const { data: reportData, error: reportError } = await supabase
                .from("daily_reports")
                .select("id, submitted_at")
                .eq("profile_id", profile.id)
                .eq("report_date", today)
                .single();

            if (reportData && !reportError) {
                setHasSubmittedToday(true);
                setTodayReportId(reportData.id);
            }
        };

        const loadFromLocalStorage = () => {
            const localConversions = localStorage.getItem('sales_conversions') || "0";
            const localTotalLeads = localStorage.getItem('sales_totalLeads') || "";
            const localEvaluations = localStorage.getItem('sales_evaluations') || "";
            const localLostLeads = localStorage.getItem('sales_lostLeads') || "";
            const localLeadQuality = JSON.parse(localStorage.getItem('sales_leadQuality') || "[7]");
            
            console.log('Loading from localStorage:', { localConversions, localTotalLeads, localEvaluations, localLostLeads, localLeadQuality });
            
            setTotalLeads(localTotalLeads);
            setConversions(localConversions);
            setEvaluations(localEvaluations);
            setLostLeads(localLostLeads);
            setLeadQuality(localLeadQuality);
        };

        checkTodaySubmission();
    }, [user, profile]);

    // Daily reset at midnight
    useEffect(() => {
        const checkMidnightReset = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const msUntilMidnight = tomorrow.getTime() - now.getTime();
            
            const resetTimer = setTimeout(() => {
                // Clear localStorage for new day
                localStorage.removeItem('sales_totalLeads');
                localStorage.removeItem('sales_conversions');
                localStorage.removeItem('sales_evaluations');
                localStorage.removeItem('sales_lostLeads');
                localStorage.removeItem('sales_leadQuality');
                localStorage.removeItem('sales_lastSaved');
                
                // Reset form values
                setTotalLeads("");
                setConversions("0");
                setEvaluations("");
                setLostLeads("");
                setLeadQuality([7]);
                setHasSubmittedToday(false);
                setTodayReportId(null);
                
                toast.success("New day started! Sales metrics reset.");
                
                // Set up next day's reset
                checkMidnightReset();
            }, msUntilMidnight);
            
            return () => clearTimeout(resetTimer);
        };
        
        checkMidnightReset();
    }, []);

    // Calculate conversion rate
    const conversionRate = useMemo(() => {
        const total = parseInt(totalLeads) || 0;
        const conv = parseInt(conversions) || 0;
        return total > 0 ? Math.round((conv / total) * 100) : 0;
    }, [totalLeads, conversions]);

    // Calculate efficiency score
    const efficiencyScore = useMemo(() => {
        const total = parseInt(totalLeads) || 0;
        const conv = parseInt(conversions) || 0;
        const evals = parseInt(evaluations) || 0;
        const lost = parseInt(lostLeads) || 0;
        
        if (total === 0) return 0;
        
        // Weighted score: conversions 50%, evaluations 30%, lead quality 20%
        const convWeight = (conv / total) * 50;
        const evalWeight = (evals / total) * 30;
        const qualityWeight = (leadQuality[0] / 10) * 20;
        
        return Math.round(convWeight + evalWeight + qualityWeight);
    }, [totalLeads, conversions, evaluations, leadQuality]);

    const handleTransmitReport = async () => {
        if (hasSubmittedToday) {
            toast.error("You have already submitted your daily report today. Come back tomorrow!");
            return;
        }

        if (!totalLeads || !conversions || !evaluations || !lostLeads) {
            toast.error("Please fill in all metrics before transmitting");
            return;
        }

        if (!user || !profile) {
            toast.error("Please login to submit report");
            return;
        }

        setIsSubmitting(true);

        try {
            // Use localStorage values as primary source since database table may not exist
            const today = new Date().toISOString().split("T")[0];
            const reportData = {
                user_id: user.id,
                profile_id: profile.id,
                reporter_name: profile.full_name || profile.email || "Sales Agent",
                report_date: today,
                total_leads: parseInt(totalLeads) || 0,
                conversions: parseInt(conversions) || 0,
                evaluations_taken: parseInt(evaluations) || 0,
                lost_leads: parseInt(lostLeads) || 0,
                lead_quality_rating: leadQuality[0] || 7,
                conversion_rate: conversionRate,
                efficiency_score: efficiencyScore,
                submitted_at: new Date().toISOString(),
            };

            const { data, error } = await supabase
                .from("daily_reports")
                .upsert(reportData, {
                    onConflict: "profile_id,report_date"
                })
                .select();

            if (error) {
                console.error("Submit error:", error);
                toast.error("Failed to transmit report: " + error.message);
                setIsSubmitting(false);
                return;
            }

            // Mark as submitted today
            setHasSubmittedToday(true);
            
            triggerConfetti();
            toast.success("Daily Sales Report Updated!", {
                description: `Report #${data?.[0]?.id} updated for ${profile?.full_name?.split(" ")[0] || "Agent"}`,
            });
            
            // Don't reset form - keep data for reference
            // setTotalLeads("");
            // setConversions("");
            // setEvaluations("");
            // setLostLeads("");
            // setLeadQuality([7]);
        } catch (error) {
            console.error("Submit exception:", error);
            toast.error("Something went wrong transmitting the report");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddConversion = async () => {
        if (hasSubmittedToday) {
            toast.error("Cannot add conversions after daily report has been submitted");
            return;
        }

        if (!studentName.trim()) {
            toast.error("Please enter student name");
            return;
        }

        if (!user || !profile) {
            toast.error("Please login to add conversions");
            return;
        }

        setIsAddingConversion(true);

        try {
            // Store conversion with student name
            const conversionData = {
                staff_id: profile.id,
                staff_name: profile.full_name || profile.email || "Sales Agent",
                student_name: studentName.trim(),
                conversion_date: new Date().toISOString().split("T")[0],
                created_at: new Date().toISOString(),
            };

            const { error } = await supabase
                .from("conversions")
                .insert(conversionData);

            if (error) {
                console.error("Conversion error:", error);
                toast.error("Failed to add conversion: " + error.message);
                return;
            }

            // Update conversions count in the form
            const currentConversions = parseInt(conversions) || 0;
            setConversions((currentConversions + 1).toString());

            // Only update daily report if it has been submitted today
            if (hasSubmittedToday && todayReportId) {
                const { error: updateError } = await supabase
                    .from("daily_reports")
                    .update({
                        conversions: currentConversions + 1,
                        conversion_rate: Math.round(((currentConversions + 1) / parseInt(totalLeads || "1")) * 100),
                        efficiency_score: Math.round(
                            ((currentConversions + 1) / parseInt(totalLeads || "1")) * 50 +
                            (parseInt(evaluations) / parseInt(totalLeads || "1")) * 30 +
                            (leadQuality[0] / 10) * 20
                        ),
                    })
                    .eq("id", todayReportId);

                if (updateError) {
                    console.error("Update report error:", updateError);
                }
            }

            triggerConfetti();
            toast.success(`Conversion added for ${studentName.trim()}!`, {
                description: "Conversion count updated successfully",
            });

            // Reset modal
            setStudentName("");
            setIsConversionModalOpen(false);
        } catch (error) {
            console.error("Add conversion exception:", error);
            toast.error("Something went wrong adding the conversion");
        } finally {
            setIsAddingConversion(false);
        }
    };

    const greeting = getGreeting();
    const agentName = profile?.full_name?.split(" ")[0] || "AGENT";

    return (
        <div className="min-h-screen max-w-[100vw] overflow-x-hidden" style={{ backgroundColor: BRAND.bg }}>
            {/* Mobile Header - Compact Status Bar */}
            <header className="md:hidden h-16 bg-white/90 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10">
                        <img
                            src="/images/usthadacademylogo2.svg"
                            alt="UA Logo"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="flex items-center px-2 py-1 rounded-lg" style={{ backgroundColor: `${BRAND.navy}10` }}>
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: BRAND.navy }}>
                            SALES
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">{time}</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase">{agentName}</p>
                    </div>
                    <div
                        style={{ backgroundColor: BRAND.navy }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md"
                    >
                        {profile?.full_name?.[0] || profile?.email?.[0] || "U"}
                    </div>
                </div>
            </header>

            {/* Desktop Header */}
            <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        <div className="relative">
                            <div className="relative h-12 w-12">
                                <img
                                    src="/images/usthadacademylogo2.svg"
                                    alt="UA Logo"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        </div>
                        <div className="hidden md:block h-12 relative w-48">
                            <img
                                src="/images/verticallogo.svg"
                                alt="Usthad Academy"
                                className="h-full w-full object-contain object-left"
                                style={{
                                    filter: "brightness(0) saturate(100%) invert(13%) sepia(33%) saturate(4725%) hue-rotate(248deg) brightness(94%) contrast(96%)",
                                }}
                            />
                        </div>
                        <div className="hidden md:flex items-center px-3 py-1.5 rounded-lg" style={{ backgroundColor: `${BRAND.navy}10` }}>
                            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: BRAND.navy }}>
                                SALES COMMAND | DAILY REPORT
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Mobile: Back to Hub Link */}
                    <Link href="/staff" className="md:hidden">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-[9px] font-black uppercase tracking-wider text-slate-600">
                            <ChevronLeft className="w-3 h-3" />
                            Hub
                        </button>
                    </Link>

                    {/* Desktop: Back to Hub Link */}
                    <Link href="/staff" className="hidden md:block">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600">
                            <ChevronLeft className="w-4 h-4" />
                            Back to Hub
                        </button>
                    </Link>

                    <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-slate-900">
                            {profile?.full_name || "Loading..."}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                            Sales Command Staff
                        </p>
                    </div>
                    <div
                        style={{ backgroundColor: BRAND.navy }}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                    >
                        {profile?.full_name?.[0] || profile?.email?.[0] || "U"}
                    </div>
                </div>
            </header>

            {/* Main Content - Mobile: single column, Desktop: grid */}
            <main className="p-4 md:p-8 max-w-[1700px] mx-auto grid grid-cols-12 gap-4 md:gap-8">
                {/* Mobile Greeting Banner - Compact Slim Card */}
                <div className="col-span-12 md:hidden">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0" style={{ backgroundColor: BRAND.softOrange }}>
                                <BarChart3 className="w-5 h-5" style={{ color: BRAND.orange }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    {greeting.text}
                                </p>
                                <h2 className="text-lg font-black tracking-tighter uppercase truncate" style={{ color: BRAND.navy }}>
                                    DAILY SALES
                                </h2>
                            </div>
                        </div>

                        {/* Mobile KPI Micro-cards - Horizontal scroll */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
                            <div className="flex-shrink-0 bg-slate-50 rounded-xl px-3 py-2 min-w-[90px] flex flex-col items-center">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                    Conversion
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <TrendingUp className="w-3 h-3" style={{ color: conversionRate >= 50 ? "#10b981" : BRAND.orange }} />
                                    <span className="text-sm font-black text-slate-800">
                                        {conversionRate}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 bg-slate-50 rounded-xl px-3 py-2 min-w-[90px] flex flex-col items-center">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                    Efficiency
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Award className="w-3 h-3" style={{ color: BRAND.orange }} />
                                    <span className="text-sm font-black text-slate-800">
                                        {efficiencyScore}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 bg-slate-50 rounded-xl px-3 py-2 min-w-[90px] flex flex-col items-center">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                    Clock
                                </p>
                                <span className="text-sm font-black text-slate-800 tabular-nums">
                                    {time.split(' ')[0]}
                                </span>
                            </div>
                            <button
                                onClick={() => setVibe(vibe === "Focused" ? "Unstoppable" : "Focused")}
                                className="flex-shrink-0 bg-slate-50 rounded-xl px-3 py-2 min-w-[90px] flex flex-col items-center active:bg-slate-100 transition-colors"
                            >
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                    Vibe
                                </p>
                                <p className="text-sm font-black flex items-center gap-1 uppercase" style={{ color: BRAND.orange }}>
                                    <Smile className="w-3 h-3" /> {vibe}
                                </p>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Desktop Greeting Banner - Full Size */}
                <div className="hidden md:block col-span-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-row items-center justify-between gap-6 relative overflow-hidden"
                    >
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner" style={{ backgroundColor: BRAND.softOrange }}>
                                <BarChart3 className="w-8 h-8" style={{ color: BRAND.orange }} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                    {greeting.text}
                                </p>
                                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none" style={{ color: BRAND.navy }}>
                                    DAILY SALES TRANSMISSION
                                </h2>
                                <p className="text-slate-400 font-bold text-sm mt-2 flex items-center gap-2 italic">
                                    &ldquo;Record your victories. Shape the metrics.&rdquo;{" "}
                                    <Sparkles className="w-4 h-4 text-orange-400" />
                                </p>
                            </div>
                        </div>

                        <div className="hidden xl:flex items-center gap-8 relative z-10 px-8 border-x border-slate-100">
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
                                    Conversion Rate
                                </p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" style={{ color: conversionRate >= 50 ? "#10b981" : BRAND.orange }} />
                                    <span className="text-xl font-black text-slate-800">
                                        {conversionRate}%
                                    </span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
                                    Efficiency
                                </p>
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4" style={{ color: BRAND.orange }} />
                                    <span className="text-xl font-black text-slate-800">
                                        {efficiencyScore}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-3xl border border-slate-100 relative z-10">
                            <div className="px-4 py-2 bg-white rounded-2xl shadow-sm min-w-[140px]">
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
                                    Shift Clock (12h)
                                </p>
                                <p className="text-lg font-black text-slate-800 tabular-nums">
                                    {time}
                                </p>
                            </div>
                            <div className="h-10 w-[1px] bg-slate-200"></div>
                            <button
                                onClick={() =>
                                    setVibe(
                                        vibe === "Focused"
                                            ? "Unstoppable"
                                            : "Focused",
                                    )
                                }
                                className="flex flex-col items-center px-4 py-2 hover:bg-white rounded-2xl transition-all"
                            >
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
                                    Current Vibe
                                </p>
                                <p className="text-xs font-black flex items-center gap-1 uppercase" style={{ color: BRAND.orange }}>
                                    <Smile className="w-3 h-3" /> {vibe}
                                </p>
                            </button>
                        </div>

                        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-orange-50/50 to-transparent pointer-events-none"></div>
                    </motion.div>
                </div>

                {/* Mobile: Full Width Single Column Layout */}
                <div className="col-span-12 lg:col-span-8 space-y-4 md:space-y-6">
                    {/* Mobile Section Title */}
                    <div className="md:hidden flex items-end justify-between">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 tracking-tighter uppercase flex items-center gap-2">
                                Daily Metrics{" "}
                                <Target className="w-4 h-4" style={{ color: BRAND.orange }} />
                            </h2>
                            <p className="text-[10px] text-slate-400 font-medium">
                                Record today&apos;s performance
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5"
                            style={{ borderColor: BRAND.navy, color: BRAND.navy }}
                        >
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </Badge>
                    </div>

                    {/* Desktop Section Title */}
                    <div className="hidden md:flex items-end justify-between px-2">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
                                Daily Metrics{" "}
                                <Target className="w-5 h-5" style={{ color: BRAND.orange }} />
                            </h2>
                            <p className="text-xs text-slate-400 font-medium">
                                Record today&apos;s performance data
                            </p>
                        </div>
                        <Badge
                            variant="outline"
                            className="text-[10px] font-black uppercase tracking-wider px-3 py-1"
                            style={{ borderColor: BRAND.navy, color: BRAND.navy }}
                        >
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                        </Badge>
                    </div>

                    {/* Mobile Metrics Input Card - Compact */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="md:hidden bg-white rounded-[20px] p-4 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: BRAND.navy }} />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Performance Data
                            </h3>
                        </div>

                        {/* Mobile: Vertically stacked inputs */}
                        <div className="space-y-4">
                            {/* Total Leads */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                                    <Users className="w-3 h-3" style={{ color: BRAND.navy }} />
                                    Total Leads Today
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Enter number..."
                                    value={totalLeads}
                                    onChange={(e) => setTotalLeads(e.target.value)}
                                    className="h-12 bg-slate-50 border-slate-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-xl text-base font-bold text-slate-900 placeholder:text-slate-400"
                                    style={{ color: "#1e293b" }}
                                />
                            </div>

                            {/* Evaluations Taken */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                                    <FileText className="w-3 h-3" style={{ color: BRAND.navy }} />
                                    Evaluations Taken
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Enter number..."
                                    value={evaluations}
                                    onChange={(e) => setEvaluations(e.target.value)}
                                    className="h-12 bg-slate-50 border-slate-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-xl text-base font-bold text-slate-900 placeholder:text-slate-400"
                                    style={{ color: "#1e293b" }}
                                />
                            </div>

                            {/* Lost Leads */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-slate-700 flex items-center gap-2">
                                    <XCircle className="w-3 h-3" style={{ color: BRAND.navy }} />
                                    Lost Leads
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Enter number..."
                                    value={lostLeads}
                                    onChange={(e) => setLostLeads(e.target.value)}
                                    className="h-12 bg-slate-50 border-slate-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-xl text-base font-bold text-slate-900 placeholder:text-slate-400"
                                    style={{ color: "#1e293b" }}
                                />
                            </div>

                            {/* Mobile: Full-width Add Conversion Button */}
                            <div className="pt-2">
                                <Label className="text-xs font-medium text-slate-700 flex items-center gap-2 mb-2">
                                    <Target className="w-3 h-3" style={{ color: BRAND.navy }} />
                                    Conversions: <span className="font-bold" style={{ color: BRAND.navy }}>{conversions || "0"}</span>
                                </Label>
                                {hasSubmittedToday ? (
                                    <Button
                                        disabled
                                        className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-widest min-h-[48px] opacity-50 cursor-not-allowed"
                                        style={{
                                            backgroundColor: "#94a3b8",
                                            color: "white",
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Report Submitted
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setIsConversionModalOpen(true)}
                                        className="w-full h-12 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-200 active:scale-[0.98] min-h-[48px]"
                                        style={{
                                            backgroundColor: BRAND.orange,
                                            color: "white",
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Conversion
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Mobile: Single row of 4 equal-width stat blocks */}
                        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100">
                            <div className="text-center p-2 rounded-xl bg-slate-50">
                                <Users className="w-4 h-4 mx-auto mb-1" style={{ color: BRAND.navy }} />
                                <p className="text-lg font-black text-slate-900">{totalLeads || "0"}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase">Total</p>
                            </div>
                            <div className="text-center p-2 rounded-xl bg-slate-50">
                                <Target className="w-4 h-4 mx-auto mb-1" style={{ color: BRAND.navy }} />
                                <p className="text-lg font-black text-slate-900">{conversions || "0"}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase">Conv</p>
                            </div>
                            <div className="text-center p-2 rounded-xl bg-slate-50">
                                <FileText className="w-4 h-4 mx-auto mb-1" style={{ color: BRAND.navy }} />
                                <p className="text-lg font-black text-slate-900">{evaluations || "0"}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase">Evals</p>
                            </div>
                            <div className="text-center p-2 rounded-xl bg-slate-50">
                                <XCircle className="w-4 h-4 mx-auto mb-1" style={{ color: BRAND.orange }} />
                                <p className="text-lg font-black text-slate-900">{lostLeads || "0"}</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase">Lost</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Desktop Metrics Input Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="hidden md:block bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm"
                    >
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: BRAND.navy }} />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                                Performance Data
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Total Leads */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Users className="w-4 h-4" style={{ color: BRAND.navy }} />
                                    Total Leads Today
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Enter number..."
                                    value={totalLeads}
                                    onChange={(e) => setTotalLeads(e.target.value)}
                                    className="h-14 bg-slate-50 border-slate-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-2xl text-lg font-bold text-slate-900 placeholder:text-slate-400"
                                    style={{ color: "#1e293b" }}
                                />
                            </div>

                            {/* Conversions */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Target className="w-4 h-4" style={{ color: BRAND.navy }} />
                                    Conversions: <span className="font-bold" style={{ color: BRAND.navy }}>{conversions || "0"}</span>
                                </Label>
                                {hasSubmittedToday ? (
                                    <Button
                                        disabled
                                        className="w-full h-14 rounded-2xl font-bold text-xs uppercase tracking-widest opacity-50 cursor-not-allowed"
                                        style={{
                                            backgroundColor: "#94a3b8",
                                            color: "white",
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Report Submitted
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setIsConversionModalOpen(true)}
                                        className="w-full h-14 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                                        style={{
                                            backgroundColor: BRAND.orange,
                                            color: "white",
                                        }}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Conversion
                                    </Button>
                                )}
                            </div>

                            {/* Evaluations Taken */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4" style={{ color: BRAND.navy }} />
                                    Evaluations Taken
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Enter number..."
                                    value={evaluations}
                                    onChange={(e) => setEvaluations(e.target.value)}
                                    className="h-14 bg-slate-50 border-slate-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-2xl text-lg font-bold text-slate-900 placeholder:text-slate-400"
                                    style={{ color: "#1e293b" }}
                                />
                            </div>

                            {/* Lost Leads */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" style={{ color: BRAND.navy }} />
                                    Lost Leads
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Enter number..."
                                    value={lostLeads}
                                    onChange={(e) => setLostLeads(e.target.value)}
                                    className="h-14 bg-slate-50 border-slate-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-2xl text-lg font-bold text-slate-900 placeholder:text-slate-400"
                                    style={{ color: "#1e293b" }}
                                />
                            </div>
                        </div>

                        {/* Desktop Quick Stats Preview */}
                        <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
                            <div className="text-center p-4 rounded-2xl bg-slate-50">
                                <Users className="w-5 h-5 mx-auto mb-2" style={{ color: BRAND.navy }} />
                                <p className="text-2xl font-black text-slate-900">{totalLeads || "0"}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase">Total</p>
                            </div>
                            <div className="text-center p-4 rounded-2xl bg-slate-50">
                                <Target className="w-5 h-5 mx-auto mb-2" style={{ color: BRAND.navy }} />
                                <p className="text-2xl font-black text-slate-900">{conversions || "0"}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase">Converted</p>
                            </div>
                            <div className="text-center p-4 rounded-2xl bg-slate-50">
                                <FileText className="w-5 h-5 mx-auto mb-2" style={{ color: BRAND.navy }} />
                                <p className="text-2xl font-black text-slate-900">{evaluations || "0"}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase">Evals</p>
                            </div>
                            <div className="text-center p-4 rounded-2xl bg-slate-50">
                                <XCircle className="w-5 h-5 mx-auto mb-2" style={{ color: BRAND.orange }} />
                                <p className="text-2xl font-black text-slate-900">{lostLeads || "0"}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase">Lost</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mobile: Lead Quality Score - Moved beneath data entry */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="md:hidden rounded-[20px] p-5 text-white shadow-lg relative overflow-hidden"
                        style={{ backgroundColor: BRAND.navy }}
                    >
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: BRAND.orange, filter: "blur(30px)" }}></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-1.5 bg-white/10 rounded-lg">
                                    <Star className="w-4 h-4" style={{ color: BRAND.orange }} />
                                </div>
                                <span className="text-[10px] font-black tracking-widest uppercase text-white/50">
                                    Quality Assessment
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-3"
                                        style={{
                                            borderColor: leadQuality[0] >= 7 ? "#10b981" : leadQuality[0] >= 4 ? BRAND.orange : "#ef4444",
                                            backgroundColor: "rgba(255,255,255,0.1)"
                                        }}
                                    >
                                        {leadQuality[0]}
                                    </div>
                                    <div
                                        className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                                        style={{ backgroundColor: BRAND.orange }}
                                    >
                                        /10
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span className="text-white/60">Poor</span>
                                        <span className="text-white/60">Excellent</span>
                                    </div>
                                    <Slider
                                        value={leadQuality}
                                        onValueChange={setLeadQuality}
                                        max={10}
                                        min={1}
                                        step={1}
                                        className="w-full [&_[role=slider]]:border-[#FA4615] [&_[role=slider]]:bg-white [&_.bg-primary]:bg-[#FA4615] [&_.bg-secondary]:bg-white/20"
                                    />
                                    <p className="text-xs font-black text-center">
                                        {leadQuality[0] >= 8 ? "Exceptional" :
                                         leadQuality[0] >= 6 ? "Good" :
                                         leadQuality[0] >= 4 ? "Average" : "Needs Work"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mobile: Transmit Report Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:hidden"
                    >
                        {hasSubmittedToday ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-green-500 rounded-lg">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-green-800">Report Submitted Today</p>
                                        <p className="text-xs text-green-600">Come back tomorrow to submit a new report</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Button
                                    onClick={handleTransmitReport}
                                    disabled={isSubmitting}
                                    className="w-full h-14 text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[56px] shadow-lg"
                                    style={{
                                        backgroundColor: BRAND.navy,
                                        color: "white",
                                    }}
                                >
                                    {isSubmitting ? (
                                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 mr-2" />
                                    )}
                                    {isSubmitting ? "TRANSMITTING..." : "TRANSMIT REPORT"}
                                </Button>
                                <p className="text-[9px] text-slate-400 font-medium text-center mt-2">
                                    Data sent to CEO dashboard for review
                                </p>
                            </>
                        )}
                    </motion.div>

                    {/* Desktop: Transmit Report Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="hidden md:block"
                    >
                        {hasSubmittedToday ? (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-green-800 mb-1">Report Submitted Today</h3>
                                        <p className="text-sm text-green-600">Your daily report has been successfully transmitted to the CEO dashboard</p>
                                    </div>
                                    <div className="p-3 bg-green-500 rounded-xl">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">Ready to Transmit</h3>
                                        <p className="text-sm text-slate-600">Send your daily report to the CEO dashboard for review</p>
                                    </div>
                                    <Button
                                        onClick={handleTransmitReport}
                                        disabled={isSubmitting}
                                        className="h-16 px-8 text-sm font-bold rounded-xl transition-all duration-200 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{
                                            backgroundColor: BRAND.navy,
                                            color: "white",
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5 mr-2" />
                                        )}
                                        {isSubmitting ? "TRANSMITTING..." : "TRANSMIT DAILY REPORT"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                            </main>

            {/* Conversion Modal */}
            <Dialog open={isConversionModalOpen} onOpenChange={setIsConversionModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2" style={{ color: BRAND.navy }}>
                            <Target className="w-5 h-5" />
                            Add New Conversion
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="student-name" className="text-sm font-medium text-slate-700">
                                Student Name
                            </Label>
                            <Input
                                id="student-name"
                                type="text"
                                placeholder="Enter student's full name..."
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="mt-1 h-12 bg-slate-50 border-slate-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-xl"
                                style={{ color: "#1e293b" }}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsConversionModalOpen(false);
                                    setStudentName("");
                                }}
                                className="flex-1 h-12 rounded-xl font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddConversion}
                                disabled={isAddingConversion || !studentName.trim()}
                                className="flex-1 h-12 rounded-xl font-medium transition-all duration-200 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: BRAND.orange,
                                    color: "white",
                                }}
                            >
                                {isAddingConversion ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4 mr-2" />
                                )}
                                {isAddingConversion ? "Adding..." : "Add Conversion"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Shared Mobile Navigation */}
            <MobileNavigation currentPage="sales" />

            {/* Spacer for mobile bottom nav */}
            <div className="md:hidden h-20"></div>
        </div>
    );
}

export default SalesReportingPage;
