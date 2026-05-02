"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Clock,
    Target,
    Trophy,
    Zap,
    UserCheck,
    Package,
    CheckCircle2,
    ArrowRight,
    Flame,
    Send,
    Plus,
    TrendingUp,
    Users,
    Phone,
    FileText,
    ChevronRight,
    Crown,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

// Brand colors
const BRAND_COLORS = {
    indigo: "#2F1E73",
    orange: "#FA4615",
    lightOrange: "#FF6B35",
};

// Mock data for demonstration
const MOCK_SALES_DATA = {
    dailyGoal: 20,
    contactedToday: 12,
    rank: 2,
    totalReps: 4,
};

// Confetti effect function
const triggerConfetti = () => {
    const colors = [BRAND_COLORS.indigo, BRAND_COLORS.orange, "#16a34a", "#f59e0b"];
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
    if (hour < 12) return "GOOD MORNING";
    if (hour < 17) return "GOOD AFTERNOON";
    return "GOOD EVENING";
};

export function SalesStaffHub() {
    const { profile } = useAuth();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClockedIn, setIsClockedIn] = useState(true);
    const [shiftTime, setShiftTime] = useState("03:45:22");

    // Form states
    const [newLeads, setNewLeads] = useState("");
    const [contactedToday, setContactedToday] = useState("");
    const [evaluationsBooked, setEvaluationsBooked] = useState("");

    // Deployment form states
    const [studentName, setStudentName] = useState("");
    const [packageSelected, setPackageSelected] = useState("");
    const [assignedTutor, setAssignedTutor] = useState("");

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            // Update shift time simulation
            const [hours, minutes, seconds] = shiftTime.split(":").map(Number);
            const newSeconds = seconds + 1;
            const newMinutes = minutes + Math.floor(newSeconds / 60);
            const newHours = hours + Math.floor(newMinutes / 60);
            setShiftTime(
                `${String(newHours).padStart(2, "0")}:${String(newMinutes % 60).padStart(2, "0")}:${String(newSeconds % 60).padStart(2, "0")}`
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [shiftTime]);

    const handleUpdateMatrix = () => {
        toast.success("Matrix updated successfully!", {
            description: `Recorded ${newLeads || 0} new leads, ${contactedToday || 0} contacted, ${evaluationsBooked || 0} evaluations.`,
        });
        setNewLeads("");
        setContactedToday("");
        setEvaluationsBooked("");
    };

    const handleRecordVictory = () => {
        if (!studentName || !packageSelected || !assignedTutor) {
            toast.error("Please fill in all fields");
            return;
        }

        triggerConfetti();
        toast.success("Victory Recorded!", {
            description: `${studentName} has been assigned to ${assignedTutor} for ${packageSelected} package.`,
        });

        // Reset form
        setStudentName("");
        setPackageSelected("");
        setAssignedTutor("");
    };

    const progressPercentage = (MOCK_SALES_DATA.contactedToday / MOCK_SALES_DATA.dailyGoal) * 100;
    const agentName = profile?.full_name?.split(" ")[0] || "AGENT";
    const isTopPerformer = MOCK_SALES_DATA.rank === 1;

    return (
        <div className="min-h-screen bg-ua-mesh-gradient p-6">
            {/* Top Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-ua rounded-2xl p-6 mb-6"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar
                            className="w-14 h-14 border-3"
                            style={{ borderColor: `${BRAND_COLORS.indigo}30` }}
                        >
                            <AvatarFallback
                                className="text-lg font-bold text-white"
                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                            >
                                {profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "AG"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                                {getGreeting()}
                            </p>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {agentName}
                                {isTopPerformer && (
                                    <Crown className="inline-block w-5 h-5 ml-2 text-yellow-500" />
                                )}
                            </h1>
                            <p className="text-sm text-gray-500">
                                Rank #{MOCK_SALES_DATA.rank} of {MOCK_SALES_DATA.totalReps} sales operatives
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Shift Clock */}
                        <div className="glass-card-ua rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${isClockedIn ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider">Shift Clock</p>
                                <p className="text-lg font-mono font-semibold text-gray-900">{shiftTime}</p>
                            </div>
                        </div>

                        {/* Weekly Conversion Score */}
                        <div className="glass-card-ua rounded-xl px-4 py-3 min-w-[140px]">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Weekly Score</p>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" style={{ color: BRAND_COLORS.orange }} />
                                <span className="text-xl font-bold" style={{ color: BRAND_COLORS.indigo }}>
                                    {MOCK_SALES_DATA.contactedToday || 0}%
                                </span>
                            </div>
                        </div>

                        {/* Daily Report Button */}
                        <a
                            href="/sales"
                            className="glass-card-ua rounded-xl px-4 py-3 flex items-center gap-2 hover:shadow-lg transition-all cursor-pointer"
                            style={{ backgroundColor: BRAND_COLORS.indigo }}
                        >
                            <BarChart3 className="w-4 h-4 text-white" />
                            <span className="text-sm font-bold text-white uppercase tracking-wider">
                                Daily Report
                            </span>
                        </a>
                    </div>
                </div>

                {/* Daily Target Tracker */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4" style={{ color: BRAND_COLORS.indigo }} />
                            <span className="text-sm font-semibold text-gray-700">
                                Daily Target: Contact {MOCK_SALES_DATA.dailyGoal} Leads
                            </span>
                        </div>
                        <span className="text-sm font-medium text-gray-500">
                            {MOCK_SALES_DATA.contactedToday} / {MOCK_SALES_DATA.dailyGoal}
                        </span>
                    </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="absolute h-full rounded-full"
                            style={{
                                background: `linear-gradient(90deg, ${BRAND_COLORS.indigo}, ${BRAND_COLORS.orange})`,
                            }}
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-gray-500">
                            {MOCK_SALES_DATA.dailyGoal - MOCK_SALES_DATA.contactedToday} more to reach daily goal
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Main Grid: 2 Columns */}
            <div className="grid grid-cols-2 gap-6">
                {/* Left Column: Update Pipeline */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card-ua rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div
                            className="w-1 h-5 rounded-full"
                            style={{ backgroundColor: BRAND_COLORS.indigo }}
                        />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                            Update Pipeline
                        </h3>
                    </div>

                    <div className="space-y-5">
                        {/* New Leads Claimed */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Plus className="w-4 h-4" style={{ color: BRAND_COLORS.indigo }} />
                                New Leads Claimed Today
                            </Label>
                            <Input
                                type="number"
                                placeholder="Enter number..."
                                value={newLeads}
                                onChange={(e) => setNewLeads(e.target.value)}
                                className="h-12 bg-white/50 border-gray-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-xl"
                            />
                        </div>

                        {/* Leads Contacted */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Phone className="w-4 h-4" style={{ color: BRAND_COLORS.indigo }} />
                                Leads Contacted Today
                            </Label>
                            <Input
                                type="number"
                                placeholder="Enter number..."
                                value={contactedToday}
                                onChange={(e) => setContactedToday(e.target.value)}
                                className="h-12 bg-white/50 border-gray-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-xl"
                            />
                        </div>

                        {/* Evaluations Booked */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <FileText className="w-4 h-4" style={{ color: BRAND_COLORS.indigo }} />
                                Evaluations Booked
                            </Label>
                            <Input
                                type="number"
                                placeholder="Enter number..."
                                value={evaluationsBooked}
                                onChange={(e) => setEvaluationsBooked(e.target.value)}
                                className="h-12 bg-white/50 border-gray-200 focus:border-[#2F1E73] focus:ring-[#2F1E73]/20 rounded-xl"
                            />
                        </div>

                        {/* Quick Stats Preview */}
                        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                            <div className="text-center p-3 rounded-xl bg-gray-50">
                                <Users className="w-4 h-4 mx-auto mb-1" style={{ color: BRAND_COLORS.indigo }} />
                                <p className="text-lg font-bold text-gray-900">{MOCK_SALES_DATA.contactedToday}</p>
                                <p className="text-xs text-gray-400">Total Contacted</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-gray-50">
                                <FileText className="w-4 h-4 mx-auto mb-1" style={{ color: BRAND_COLORS.indigo }} />
                                <p className="text-lg font-bold text-gray-900">8</p>
                                <p className="text-xs text-gray-400">Evals Booked</p>
                            </div>
                            <div className="text-center p-3 rounded-xl bg-gray-50">
                                <CheckCircle2 className="w-4 h-4 mx-auto mb-1" style={{ color: BRAND_COLORS.orange }} />
                                <p className="text-lg font-bold text-gray-900">3</p>
                                <p className="text-xs text-gray-400">Closed Today</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleUpdateMatrix}
                            className="w-full h-12 text-sm font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
                            style={{
                                backgroundColor: BRAND_COLORS.indigo,
                                color: "white",
                            }}
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Update Matrix
                        </Button>
                    </div>
                </motion.div>

                {/* Right Column: Deploy Student */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card-ua rounded-2xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <div
                            className="w-1 h-5 rounded-full"
                            style={{ backgroundColor: BRAND_COLORS.orange }}
                        />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                            Deploy Student
                        </h3>
                    </div>

                    <div className="space-y-5">
                        {/* Student Name */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <UserCheck className="w-4 h-4" style={{ color: BRAND_COLORS.orange }} />
                                Student Name
                            </Label>
                            <Input
                                type="text"
                                placeholder="Enter student full name..."
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                className="h-12 bg-white/50 border-gray-200 focus:border-[#FA4615] focus:ring-[#FA4615]/20 rounded-xl"
                            />
                        </div>

                        {/* Package Selected */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Package className="w-4 h-4" style={{ color: BRAND_COLORS.orange }} />
                                Package Selected
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                                {["Basic", "Standard", "Premium"].map((pkg) => (
                                    <button
                                        key={pkg}
                                        onClick={() => setPackageSelected(pkg)}
                                        className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                            packageSelected === pkg
                                                ? "text-white border-transparent"
                                                : "bg-white/50 text-gray-600 border-gray-200 hover:border-gray-300"
                                        }`}
                                        style={{
                                            backgroundColor:
                                                packageSelected === pkg ? BRAND_COLORS.orange : undefined,
                                        }}
                                    >
                                        {pkg}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Assigned Tutor - Plain Text Input */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Send className="w-4 h-4" style={{ color: BRAND_COLORS.orange }} />
                                Assigned Tutor
                            </Label>
                            <Input
                                type="text"
                                placeholder="Enter tutor name..."
                                value={assignedTutor}
                                onChange={(e) => setAssignedTutor(e.target.value)}
                                className="h-12 bg-white/50 border-gray-200 focus:border-[#FA4615] focus:ring-[#FA4615]/20 rounded-xl"
                            />
                            <p className="text-xs text-gray-400">
                                Type the tutor&apos;s full name as registered in the system
                            </p>
                        </div>

                        {/* Recent Deployments Summary */}
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                Today&apos;s Victories ({3})
                            </p>
                            <div className="space-y-2">
                                {[
                                    { name: "Ahmed K", tutor: "Usthad Basheer", pkg: "Premium" },
                                    { name: "Fatima Z", tutor: "Usthad Hamza", pkg: "Standard" },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 p-2 rounded-lg bg-green-50/50"
                                    >
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                                        <ArrowRight className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">{item.tutor}</span>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] px-1.5 py-0"
                                            style={{
                                                borderColor: BRAND_COLORS.orange,
                                                color: BRAND_COLORS.orange,
                                            }}
                                        >
                                            {item.pkg}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleRecordVictory}
                            className="w-full h-14 text-sm font-bold rounded-xl transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                            style={{
                                backgroundColor: BRAND_COLORS.orange,
                                color: "white",
                            }}
                        >
                            <Trophy className="w-5 h-5 mr-2" />
                            Record Victory
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default SalesStaffHub;
