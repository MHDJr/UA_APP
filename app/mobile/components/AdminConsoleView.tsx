"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { 
    Shield, 
    Activity, 
    Megaphone, 
    UserCheck, 
    Server, 
    Database, 
    Cpu, 
    Wifi, 
    Search, 
    RefreshCw, 
    Plus, 
    Trash2, 
    UserMinus, 
    Lock, 
    Clock, 
    Loader2, 
    X,
    CheckCircle2,
    AlertTriangle,
    Eye,
    EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminConsoleViewProps {
    activeView: "command-center" | "inbox" | "staff-management" | "sales-intelligence" | "financial-intelligence" | "core" | "audits" | "announcements" | "clearance";
    onViewChange?: (view: any) => void;
}

export function AdminConsoleView({ activeView, onViewChange }: AdminConsoleViewProps) {
    const { profile } = useAuth();

    // ----------------------------------------------------
    // COMPONENT LOCAL STATES
    // ----------------------------------------------------
    const [activeTab, setActiveTab] = useState<"core" | "audits" | "announcements" | "clearance">("core");
    
    // Sync with parent activeView if provided
    useEffect(() => {
        if (activeView === "core" || activeView === "audits" || activeView === "announcements" || activeView === "clearance") {
            setActiveTab(activeView);
        }
    }, [activeView]);

    // Live Metrics States
    const [metrics, setMetrics] = useState({
        totalProfiles: 0,
        activeTasks: 0,
        pendingRequests: 0,
        totalBroadcasts: 0,
    });
    const [loadingMetrics, setLoadingMetrics] = useState(false);

    // Simulated Server Telemetry
    const [telemetry, setTelemetry] = useState({
        cpuUsage: 14,
        latency: 94,
        status: "operational",
    });

    // Audit Log States
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [loadingAudits, setLoadingAudits] = useState(false);
    const [auditSearch, setAuditSearch] = useState("");

    // Announcement States
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [broadcastTarget, setBroadcastTarget] = useState("all");
    const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
    const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);

    // Clearance (Profiles) States
    const [profilesList, setProfilesList] = useState<any[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const [profileSearch, setProfileSearch] = useState("");
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [staffForm, setStaffForm] = useState({
        fullName: "",
        email: "",
        username: "",
        designation: "",
        password: "",
        department: "Administration",
        systemRole: "staff",
    });
    const [submittingStaff, setSubmittingStaff] = useState(false);

    // ----------------------------------------------------
    // HAPTIC FEEDBACK SIMULATION
    // ----------------------------------------------------
    const triggerHaptic = useCallback((type: "light" | "medium" | "success" | "warning") => {
        if (typeof window !== "undefined" && navigator.vibrate) {
            switch (type) {
                case "light":
                    navigator.vibrate(10);
                    break;
                case "medium":
                    navigator.vibrate(20);
                    break;
                case "success":
                    navigator.vibrate([15, 30, 15]);
                    break;
                case "warning":
                    navigator.vibrate([30, 50, 30]);
                    break;
            }
        }
    }, []);

    // ----------------------------------------------------
    // LIVE DB METRICS QUERY
    // ----------------------------------------------------
    const fetchCoreMetrics = useCallback(async () => {
        setLoadingMetrics(true);
        try {
            // Profiles Count
            const { count: profCount, error: profErr } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true });
            if (profErr) throw profErr;

            // Active Tasks Count (pending or in_progress)
            const { count: taskCount, error: taskErr } = await supabase
                .from("tasks")
                .select("*", { count: "exact", head: true })
                .in("status", ["pending", "in_progress", "PENDING", "IN_PROGRESS"]);
            if (taskErr) throw taskErr;

            // Pending Requests Count
            const { count: reqCount, error: reqErr } = await supabase
                .from("requests")
                .select("*", { count: "exact", head: true })
                .eq("status", "pending");
            if (reqErr) throw reqErr;

            // Broadcasts Count
            const { count: broadCount, error: broadErr } = await supabase
                .from("broadcasts")
                .select("*", { count: "exact", head: true });
            if (broadErr) throw broadErr;

            setMetrics({
                totalProfiles: profCount || 0,
                activeTasks: taskCount || 0,
                pendingRequests: reqCount || 0,
                totalBroadcasts: broadCount || 0,
            });
        } catch (err: any) {
            console.error("Error loading admin metrics:", err);
            toast.error("Failed to sync core terminal metrics");
        } finally {
            setLoadingMetrics(false);
        }
    }, []);

    // ----------------------------------------------------
    // TELEMETRY SIMULATION EFFECT
    // ----------------------------------------------------
    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(prev => {
                const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                let newCpu = prev.cpuUsage + change;
                if (newCpu < 5) newCpu = 5;
                if (newCpu > 35) newCpu = 35;

                const latChange = Math.floor(Math.random() * 11) - 5; // -5 to +5
                let newLat = prev.latency + latChange;
                if (newLat < 60) newLat = 60;
                if (newLat > 120) newLat = 120;

                return {
                    cpuUsage: newCpu,
                    latency: newLat,
                    status: "operational",
                };
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    // ----------------------------------------------------
    // REAL-TIME AUDIT LOG FEED QUERY
    // ----------------------------------------------------
    const fetchAuditLogs = useCallback(async () => {
        setLoadingAudits(true);
        try {
            const { data, error } = await supabase
                .from("activity_feed")
                .select(`
                    id,
                    action_type,
                    description,
                    user_id,
                    created_at,
                    profiles:user_id (
                        full_name,
                        username,
                        role
                    )
                `)
                .order("created_at", { ascending: false })
                .limit(40);

            if (error) throw error;
            setAuditLogs(data || []);
        } catch (err: any) {
            console.error("Error loading audit logs:", err);
            toast.error("Failed to load audit trail history");
        } finally {
            setLoadingAudits(false);
        }
    }, []);

    // ----------------------------------------------------
    // BROADCASTS ANNOUNCEMENTS QUERY
    // ----------------------------------------------------
    const fetchBroadcasts = useCallback(async () => {
        setLoadingBroadcasts(true);
        try {
            const { data, error } = await supabase
                .from("broadcasts")
                .select(`
                    *,
                    profiles:created_by (
                        full_name,
                        username
                    )
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setBroadcasts(data || []);
        } catch (err: any) {
            console.error("Error loading broadcasts:", err);
            toast.error("Failed to synchronize announcements");
        } finally {
            setLoadingBroadcasts(false);
        }
    }, []);

    // ----------------------------------------------------
    // CLEARANCE PROFILES MATRIX QUERY
    // ----------------------------------------------------
    const fetchProfiles = useCallback(async () => {
        setLoadingProfiles(true);
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("full_name", { ascending: true });

            if (error) throw error;
            setProfilesList(data || []);
        } catch (err: any) {
            console.error("Error loading profiles:", err);
            toast.error("Failed to retrieve directory credentials");
        } finally {
            setLoadingProfiles(false);
        }
    }, []);

    // ----------------------------------------------------
    // INITIAL LOAD TRIGGER
    // ----------------------------------------------------
    useEffect(() => {
        fetchCoreMetrics();
        if (activeTab === "core") {
            // Already handled
        } else if (activeTab === "audits") {
            fetchAuditLogs();
        } else if (activeTab === "announcements") {
            fetchBroadcasts();
        } else if (activeTab === "clearance") {
            fetchProfiles();
        }
    }, [activeTab, fetchCoreMetrics, fetchAuditLogs, fetchBroadcasts, fetchProfiles]);

    // ----------------------------------------------------
    // SUBMIT NEW BROADCAST ANNOUNCEMENT
    // ----------------------------------------------------
    const handleDispatchAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!broadcastMsg.trim()) {
            toast.error("Announcement message cannot be empty");
            return;
        }

        setSubmittingBroadcast(true);
        triggerHaptic("medium");

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Active for 7 days

        try {
            const { error } = await supabase.from("broadcasts").insert({
                message: broadcastMsg.trim(),
                target: broadcastTarget,
                created_by: profile?.id,
                created_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
            });

            if (error) throw error;

            toast.success("Broadcast dispatched to all terminals!");
            triggerHaptic("success");
            setBroadcastMsg("");
            setIsAddAnnouncementOpen(false);
            fetchBroadcasts();
            fetchCoreMetrics();
        } catch (err: any) {
            console.error("Broadcast dispatch failed:", err);
            toast.error(err.message || "Failed to dispatch system broadcast");
        } finally {
            setSubmittingBroadcast(false);
        }
    };

    // ----------------------------------------------------
    // PROVISION & CREATE NEW PERSONNEL CREDENTIALS
    // ----------------------------------------------------
    const handleProvisionCredentials = async (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, email, username, designation, password, department, systemRole } = staffForm;

        if (!fullName || !email || !username || !designation || !password) {
            toast.error("All credential parameters are required");
            triggerHaptic("warning");
            return;
        }

        setSubmittingStaff(true);
        triggerHaptic("medium");

        try {
            // Verify availability in profiles table first
            const { data: existing } = await supabase
                .from("profiles")
                .select("email, username")
                .or(`email.eq.${email},username.eq.${username}`)
                .maybeSingle();

            if (existing) {
                if (existing.email === email) throw new Error("Email address is already in use.");
                if (existing.username === username) throw new Error("Username is already allocated.");
            }

            // Create Supabase User Auth account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, username } }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("Authentication node generation failed.");

            // Insert matching Personnel Profile entry
            const { error: profileError } = await supabase.from("profiles").insert({
                id: authData.user.id,
                email,
                full_name: fullName,
                username,
                designation,
                role: systemRole === "manager" ? "manager" : systemRole,
                is_manager: systemRole === "manager",
                department,
                status: "offline",
            });

            if (profileError) throw profileError;

            // Audit Log Insertion
            await supabase.from("activity_feed").insert({
                action_type: "staff_created",
                description: `Personnel Onboarding: ${fullName} (${designation}) initialized by Administrator.`,
                user_id: profile?.id,
            });

            toast.success("Security clearance provisioned successfully!");
            triggerHaptic("success");
            setIsAddStaffOpen(false);
            setStaffForm({
                fullName: "",
                email: "",
                username: "",
                designation: "",
                password: "",
                department: "Administration",
                systemRole: "staff",
            });
            fetchProfiles();
            fetchCoreMetrics();
        } catch (err: any) {
            console.error("Credentials onboarding failed:", err);
            toast.error(err.message || "Failed to onboard new credentials");
            triggerHaptic("warning");
        } finally {
            setSubmittingStaff(false);
        }
    };

    // ----------------------------------------------------
    // REVOKE & REMOVE USER ACCOUNT
    // ----------------------------------------------------
    const handleRevokeCredentials = async (targetId: string, name: string) => {
        if (!confirm(`Are you absolutely sure you want to revoke all system clearance and archive profile for ${name}? This action is irreversible.`)) {
            return;
        }

        triggerHaptic("warning");
        try {
            // Delete profile
            const { error } = await supabase
                .from("profiles")
                .delete()
                .eq("id", targetId);

            if (error) throw error;

            // Record action in audit trails
            await supabase.from("activity_feed").insert({
                action_type: "staff_deleted",
                description: `Credentials Revoked: Security profile for ${name} removed from system database by Administrator.`,
                user_id: profile?.id,
            });

            toast.success(`Access credentials for ${name} revoked.`);
            triggerHaptic("success");
            fetchProfiles();
            fetchCoreMetrics();
        } catch (err: any) {
            console.error("Failed to revoke credentials:", err);
            toast.error("System restrictions prevent deleting active profiles. Please disable user in auth panel instead.");
        }
    };

    // Filter audits based on search
    const filteredAudits = auditLogs.filter(log => {
        const term = auditSearch.toLowerCase();
        return (
            log.action_type.toLowerCase().includes(term) ||
            log.description.toLowerCase().includes(term) ||
            (log.profiles?.full_name || "").toLowerCase().includes(term)
        );
    });

    // Filter profiles based on search
    const filteredProfiles = profilesList.filter(p => {
        const term = profileSearch.toLowerCase();
        return (
            p.full_name.toLowerCase().includes(term) ||
            p.username.toLowerCase().includes(term) ||
            p.department.toLowerCase().includes(term) ||
            p.designation.toLowerCase().includes(term)
        );
    });

    return (
        <div className="flex flex-col gap-5 w-full max-w-full select-none pb-12">
            
            {/* Header Title section */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#FA4616]" />
                    <h2 className="text-lg font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Admin Console</h2>
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Security Clearance Level A-1</p>
            </div>

            {/* Simulated Server Telemetry Strip */}
            <div className="p-3 rounded-2xl bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl border border-slate-200/50 dark:border-zinc-800/80 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Node:</span>
                        <span className="text-[9px] font-bold text-zinc-800 dark:text-zinc-200 uppercase">Core-West-1</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">CPU:</span>
                        <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400">{telemetry.cpuUsage}%</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Wifi className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Speed:</span>
                        <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">{telemetry.latency}ms</span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">LIVE SECURE</span>
                </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* WORKSPACE 1: CORE STATUS CONSOLE */}
            {/* ---------------------------------------------------- */}
            {activeTab === "core" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Terminal Registry Aggregates</span>
                        <button 
                            onClick={() => { triggerHaptic("light"); fetchCoreMetrics(); }}
                            disabled={loadingMetrics}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-950 active:scale-90 transition-all text-zinc-500 cursor-pointer"
                        >
                            <RefreshCw className={cn("w-3 h-3", loadingMetrics && "animate-spin")} />
                        </button>
                    </div>

                    {/* Numeric Counters Grid */}
                    <div className="grid grid-cols-2 gap-3.5">
                        {/* Profiles Count Card */}
                        <div className="p-4 rounded-[1.5rem] bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex flex-col gap-1.5">
                            <div className="p-2 bg-indigo-50 text-[#31267D] rounded-xl w-fit">
                                <Database className="w-4 h-4" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">Staff Credentials</span>
                            <span className="text-2xl font-extrabold text-zinc-900 leading-none">
                                {loadingMetrics ? "..." : metrics.totalProfiles}
                            </span>
                            <span className="text-[7px] font-semibold text-zinc-400 uppercase leading-none">Registered database logs</span>
                        </div>

                        {/* Active Tasks Count Card */}
                        <div className="p-4 rounded-[1.5rem] bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex flex-col gap-1.5">
                            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl w-fit">
                                <Activity className="w-4 h-4" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">Active Directives</span>
                            <span className="text-2xl font-extrabold text-zinc-900 leading-none">
                                {loadingMetrics ? "..." : metrics.activeTasks}
                            </span>
                            <span className="text-[7px] font-semibold text-zinc-400 uppercase leading-none">Pending & In-Progress tasks</span>
                        </div>

                        {/* Pending Requests Count Card */}
                        <div className="p-4 rounded-[1.5rem] bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex flex-col gap-1.5">
                            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl w-fit">
                                <Clock className="w-4 h-4" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">Pending Decisions</span>
                            <span className="text-2xl font-extrabold text-zinc-900 leading-none">
                                {loadingMetrics ? "..." : metrics.pendingRequests}
                            </span>
                            <span className="text-[7px] font-semibold text-zinc-400 uppercase leading-none">Awaiting CEO/Admin Sign-off</span>
                        </div>

                        {/* Total Broadcasts Count Card */}
                        <div className="p-4 rounded-[1.5rem] bg-white border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex flex-col gap-1.5">
                            <div className="p-2 bg-purple-50 text-purple-500 rounded-xl w-fit">
                                <Megaphone className="w-4 h-4" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">Total Notices</span>
                            <span className="text-2xl font-extrabold text-zinc-900 leading-none">
                                {loadingMetrics ? "..." : metrics.totalBroadcasts}
                            </span>
                            <span className="text-[7px] font-semibold text-zinc-400 uppercase leading-none">Dispatched announcements</span>
                        </div>
                    </div>

                    {/* Operational Console Panel */}
                    <div className="p-4 rounded-[2rem] bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl border border-slate-200/50 dark:border-zinc-800/80 shadow-sm flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#FA4616]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Security Parameters</span>
                        </div>
                        
                        <div className="flex flex-col gap-2.5">
                            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-850">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Dynamic Encryption Key</span>
                                <span className="text-[9px] font-black text-zinc-800 dark:text-zinc-200 font-mono tracking-wider">AES-256-GCM</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-850">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">Database Schema Status</span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wide flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Verified Correct
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">RLS Security Filters</span>
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wide">Active (Strict)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* WORKSPACE 2: AUDIT TRAILS TICKER */}
            {/* ---------------------------------------------------- */}
            {activeTab === "audits" && (
                <div className="flex flex-col gap-4">
                    {/* Search and Refresh bar */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/70 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800/80 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                            <Search className="w-3.5 h-3.5 text-zinc-400" />
                            <input 
                                type="text"
                                placeholder="Search trails..."
                                value={auditSearch}
                                onChange={(e) => setAuditSearch(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none placeholder-zinc-450 w-full"
                            />
                        </div>
                        <button 
                            onClick={() => { triggerHaptic("light"); fetchAuditLogs(); }}
                            disabled={loadingAudits}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-950 active:scale-90 transition-all text-zinc-500 cursor-pointer"
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", loadingAudits && "animate-spin")} />
                        </button>
                    </div>

                    {/* Timeline logs */}
                    {loadingAudits ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-400">
                            <Loader2 className="w-6 h-6 animate-spin text-[#FA4616]" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Querying Audit Trail...</span>
                        </div>
                    ) : filteredAudits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-1 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                            <Activity className="w-6 h-6 mb-1 text-zinc-300" />
                            <span className="text-[10px] font-black uppercase tracking-wider">No Log Entries Found</span>
                            <span className="text-[8px] text-zinc-400 font-semibold uppercase">Database is clean</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
                            {filteredAudits.map((log) => {
                                const actionColor = 
                                    log.action_type.includes("create") || log.action_type.includes("onboard")
                                        ? "text-indigo-500 bg-indigo-500/10 dark:bg-indigo-500/20"
                                        : log.action_type.includes("delete") || log.action_type.includes("revoke")
                                        ? "text-rose-500 bg-rose-500/10 dark:bg-rose-500/20"
                                        : "text-amber-500 bg-amber-500/10 dark:bg-amber-500/20";
                                
                                return (
                                    <div 
                                        key={log.id} 
                                        className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl border border-slate-200/50 dark:border-zinc-800/80 shadow-sm flex flex-col gap-2 transition-all hover:bg-white dark:hover:bg-zinc-900"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider", actionColor)}>
                                                    {log.action_type.replace("_", " ")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-400">
                                                <Clock className="w-3 h-3 text-zinc-450" />
                                                <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                                            {log.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-850/50 text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider leading-none">
                                            <span>BY: {log.profiles?.full_name || "SYSTEM CORE"}</span>
                                            <span className="font-mono text-[7px] text-zinc-550">{new Date(log.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* WORKSPACE 3: SYSTEM ANNOUNCEMENTS */}
            {/* ---------------------------------------------------- */}
            {activeTab === "announcements" && (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Broadcasting Logs</span>
                        
                        <button 
                            onClick={() => { triggerHaptic("light"); setIsAddAnnouncementOpen(true); }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FA4616] text-white text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-sm shadow-orange-500/20 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>New Notice</span>
                        </button>
                    </div>

                    {/* Announcement Cards Feed */}
                    {loadingBroadcasts ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-400">
                            <Loader2 className="w-6 h-6 animate-spin text-[#FA4616]" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Loading Broadcast nodes...</span>
                        </div>
                    ) : broadcasts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-1 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                            <Megaphone className="w-6 h-6 mb-1 text-zinc-300" />
                            <span className="text-[10px] font-black uppercase tracking-wider">No Active Bulletins</span>
                            <span className="text-[8px] text-zinc-400 font-semibold uppercase">Broadcaster is silent</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
                            {broadcasts.map((bc) => {
                                const isExpired = new Date(bc.expires_at) < new Date();
                                return (
                                    <div 
                                        key={bc.id} 
                                        className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl border border-slate-200/50 dark:border-zinc-800/80 shadow-sm flex flex-col gap-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[6.5px] font-black uppercase tracking-wider",
                                                isExpired 
                                                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-550" 
                                                    : "bg-orange-500/10 text-orange-500"
                                            )}>
                                                {isExpired ? "EXPIRED" : `ACTIVE / TO: ${bc.target}`}
                                            </span>

                                            <span className="text-[7px] text-zinc-400 font-bold uppercase">
                                                Expires: {new Date(bc.expires_at).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-150 leading-relaxed">
                                            {bc.message}
                                        </p>

                                        <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-850/50 text-[7.5px] text-zinc-400 font-bold uppercase tracking-wider leading-none">
                                            <span>SENDER: {bc.profiles?.full_name || "Administrator"}</span>
                                            <span>{new Date(bc.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* WORKSPACE 4: CLEARANCE MATRIX (PROFILES) */}
            {/* ---------------------------------------------------- */}
            {activeTab === "clearance" && (
                <div className="flex flex-col gap-4">
                    {/* Add Staff and Search row */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/70 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800/80 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                            <Search className="w-3.5 h-3.5 text-zinc-400" />
                            <input 
                                type="text"
                                placeholder="Search personnel credentials..."
                                value={profileSearch}
                                onChange={(e) => setProfileSearch(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none placeholder-zinc-450 w-full"
                            />
                        </div>
                        <button 
                            onClick={() => { triggerHaptic("light"); setIsAddStaffOpen(true); }}
                            className="p-2.5 rounded-xl bg-zinc-950 dark:bg-zinc-800 text-white active:scale-90 transition-all cursor-pointer flex items-center justify-center shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Personnel List */}
                    {loadingProfiles ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-400">
                            <Loader2 className="w-6 h-6 animate-spin text-[#FA4616]" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Mapping Directory Clearance...</span>
                        </div>
                    ) : filteredProfiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-1 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                            <UserCheck className="w-6 h-6 mb-1 text-zinc-300" />
                            <span className="text-[10px] font-black uppercase tracking-wider">No profiles match</span>
                            <span className="text-[8px] text-zinc-400 font-semibold uppercase">Check parameters</span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
                            {filteredProfiles.map((p) => {
                                const isCEO = p.role === "ceo";
                                const isManager = p.role === "manager" || p.is_manager;
                                const isSelf = p.id === profile?.id;
                                
                                return (
                                    <div 
                                        key={p.id}
                                        className="p-3.5 rounded-2xl bg-white/70 dark:bg-zinc-900/40 backdrop-blur-2xl border border-slate-200/50 dark:border-zinc-800/80 shadow-sm flex flex-col gap-1 hover:bg-white dark:hover:bg-zinc-900 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{p.full_name}</span>
                                                    {isSelf && (
                                                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-850 text-[6.5px] font-black text-zinc-500 uppercase tracking-widest">YOU</span>
                                                    )}
                                                </div>
                                                <span className="text-[8.5px] font-bold text-zinc-400 leading-none mt-0.5">@{p.username} • {p.email}</span>
                                            </div>

                                            {/* Role tag */}
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-md text-[6.5px] font-black uppercase tracking-wider",
                                                isCEO 
                                                    ? "bg-rose-500/10 text-rose-500" 
                                                    : isManager 
                                                    ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400" 
                                                    : "bg-slate-500/10 text-slate-500 dark:text-slate-400"
                                            )}>
                                                {isCEO ? "CEO" : isManager ? "MANAGER" : "STAFF"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-850/50 text-[8.5px] font-bold uppercase text-zinc-500">
                                            <div className="flex items-center gap-2">
                                                <span>DEP: <strong className="text-zinc-700 dark:text-zinc-300 font-black">{p.department}</strong></span>
                                                <span>•</span>
                                                <span>{p.designation}</span>
                                            </div>

                                            {/* Action revoke */}
                                            {!isCEO && !isSelf && (
                                                <button 
                                                    onClick={() => handleRevokeCredentials(p.id, p.full_name)}
                                                    className="p-1 text-zinc-450 hover:text-rose-500 active:scale-90 transition-all shrink-0 cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* FLOATING ACTION BOTTOM DIALOG: DISPATCH NOTICE */}
            {/* ---------------------------------------------------- */}
            {isAddAnnouncementOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-end justify-center animate-fade-in">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[2.5rem] border-t border-slate-200/50 dark:border-zinc-800 p-6 flex flex-col gap-4 animate-slide-up shadow-2xl pb-10">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Megaphone className="w-4.5 h-4.5 text-[#FA4616]" />
                                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Dispatch Notice Bulletin</span>
                            </div>
                            <button 
                                onClick={() => setIsAddAnnouncementOpen(false)}
                                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 cursor-pointer active:scale-90"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleDispatchAnnouncement} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Notice Message</label>
                                <textarea 
                                    rows={4}
                                    placeholder="Enter system announcement context here..."
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-3 text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:ring-1 focus:ring-[#FA4616] focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Target Terminal Audience</label>
                                <select
                                    value={broadcastTarget}
                                    onChange={(e) => setBroadcastTarget(e.target.value)}
                                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2 text-[10px] font-bold text-zinc-800 dark:text-zinc-150 focus:outline-none"
                                >
                                    <option value="all">ALL TERMINALS (Global)</option>
                                    <option value="staff">Staff Only</option>
                                    <option value="ceo">Managers / CEO Only</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={submittingBroadcast}
                                className="w-full py-3 bg-[#FA4616] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer mt-2"
                            >
                                {submittingBroadcast ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Dispatching Broadcast...</span>
                                    </>
                                ) : (
                                    <>
                                        <Megaphone className="w-3.5 h-3.5" />
                                        <span>Transmit Notice</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------------------------------------------------- */}
            {/* FLOATING ACTION BOTTOM DIALOG: ONBOARD STAFF */}
            {/* ---------------------------------------------------- */}
            {isAddStaffOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-end justify-center animate-fade-in">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-[2.5rem] border-t border-slate-200/50 dark:border-zinc-800 p-6 flex flex-col gap-4 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto pb-10">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <UserCheck className="w-4.5 h-4.5 text-indigo-500" />
                                <span className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-50">Onboard Personnel Credentials</span>
                            </div>
                            <button 
                                onClick={() => setIsAddStaffOpen(false)}
                                className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 cursor-pointer active:scale-90"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleProvisionCredentials} className="flex flex-col gap-3.5">
                            {/* Full Name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Full Legal Name</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={staffForm.fullName}
                                    onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Secure Email Address</label>
                                <input 
                                    type="email"
                                    placeholder="e.g. john@uloomx.com"
                                    value={staffForm.email}
                                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                                    className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            {/* Username & Designation row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">System Username</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. johndoe"
                                        value={staffForm.username}
                                        onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                                        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Professional Title</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Lead Tutor"
                                        value={staffForm.designation}
                                        onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                                        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password input */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Security Access Password</label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Minimum 6 characters"
                                        value={staffForm.password}
                                        onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                                        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 pl-3 pr-10 py-2.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Department & Role Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Department</label>
                                    <select
                                        value={staffForm.department}
                                        onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                                        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none"
                                    >
                                        <option value="Administration">Administration</option>
                                        <option value="Tutor">Tutor</option>
                                        <option value="Accounts">Accounts</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Privilege Clearance</label>
                                    <select
                                        value={staffForm.systemRole}
                                        onChange={(e) => setStaffForm({ ...staffForm, systemRole: e.target.value })}
                                        className="w-full rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 px-3 py-2.5 text-[10px] font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none"
                                    >
                                        <option value="staff">Staff Member</option>
                                        <option value="manager">Manager Node</option>
                                        <option value="ceo">CEO Executive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Action submit */}
                            <button
                                type="submit"
                                disabled={submittingStaff}
                                className="w-full py-3 bg-[#31267D] hover:bg-indigo-750 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer mt-2"
                            >
                                {submittingStaff ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Allocating Auth Server Nodes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>Authorize Access Matrix</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
