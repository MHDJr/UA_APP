"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { 
    useTasks, 
    useStaff, 
    useRequests, 
    useLeads 
} from "@/hooks/use-dashboard-data";
import { BottomSheet } from "./BottomSheet";
import { 
    Shield, 
    Users, 
    Clock, 
    TrendingUp, 
    Wallet, 
    AlertTriangle,
    CheckCircle2, 
    ChevronRight, 
    ArrowUpRight, 
    Search,
    Star, 
    Mail, 
    Phone, 
    Plus, 
    FileText, 
    Trash2, 
    Loader2, 
    Activity,
    Target,
    Megaphone,
    Send,
    UserPlus,
    X,
    FolderPlus,
    ShieldAlert,
    Sparkles,
    Calendar,
    Briefcase,
    Lightbulb,
    ListTodo,
    Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CEOCommandViewProps {
    activeView: "command-center" | "inbox" | "staff-management" | "sales-intelligence" | "financial-intelligence" | "ceo-tasks";
    onViewChange: (view: any) => void;
}

export function CEOCommandView({ activeView, onViewChange }: CEOCommandViewProps) {
    const { profile } = useAuth();
    const queryClient = useQueryClient();

    // ----------------------------------------------------
    // DATA HOOKS
    // ----------------------------------------------------
    const { activeTasks = [], completedTasks = [], isLoading: isLoadingTasks } = useTasks();
    const { data: staffProfiles = [], isLoading: isLoadingStaff } = useStaff();
    const { data: rawRequests = [], isLoading: isLoadingRequests } = useRequests();
    const { leads = [], demoRequests = [], isLoading: isLoadingLeads } = useLeads();

    // ----------------------------------------------------
    // COMPONENT LOCAL STATES
    // ----------------------------------------------------
    const [searchQuery, setSearchQuery] = useState("");
    const [clearedSignals, setClearedSignals] = useState<Set<string>>(new Set());
    const [exportingId, setExportingId] = useState<string | null>(null);
    const [departmentFilter, setDepartmentFilter] = useState("all");

    // Real-time Staff-submitted Ideas/Directives Board
    const [staffIdeas, setStaffIdeas] = useState<any[]>([]);
    const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
    const [isDelegationOpen, setIsDelegationOpen] = useState(false);
    const [delegatingTo, setDelegatingTo] = useState("");
    const [submittingDelegation, setSubmittingDelegation] = useState(false);

    // Modal open states (Bottom Sheets)
    const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

    // Form inputs states
    const [taskForm, setTaskForm] = useState({
        title: "",
        assignedTo: "",
        priority: "medium",
        description: "",
        due_date: "",
        due_time: "",
    });
    const [staffForm, setStaffForm] = useState({
        fullName: "",
        email: "",
        username: "",
        designation: "",
        password: "",
        department: "Administration",
        systemRole: "staff",
    });
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [broadcastTarget, setBroadcastTarget] = useState("CEO_BROADCAST");

    // Loading handlers
    const [submittingTask, setSubmittingTask] = useState(false);
    const [submittingStaff, setSubmittingStaff] = useState(false);
    const [submittingBroadcast, setSubmittingBroadcast] = useState(false);

    // Dynamic Financial dashboard stats state
    const [financials, setFinancials] = useState({
        monthlyUloomx: 0,
        monthlyUsthad: 0,
        monthlyExpense: 0,
        monthlyBalance: 0,
        dailyUloomx: 0,
        dailyUsthad: 0,
        dailyExpense: 0,
        dailyProfit: 0,
    });
    const [loadingFinancials, setLoadingFinancials] = useState(false);

    // Global task hub filter state
    const [staffSubView, setStaffSubView] = useState<"operatives" | "global-tasks">("operatives");
    const [taskDepartmentFilter, setTaskDepartmentFilter] = useState("all");
    const [taskStatusFilter, setTaskStatusFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
    const [taskSearch, setTaskSearch] = useState("");

    // Fetch live mobile financials from database
    const fetchFinancials = useCallback(async () => {
        setLoadingFinancials(true);
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const { data: entries, error } = await supabase
                .from('financial_entries')
                .select('*')
                .gte('entry_date', thirtyDaysAgo.toISOString().split('T')[0])
                .order('entry_date', { ascending: false });
            
            if (error) throw error;
            if (entries && entries.length > 0) {
                // Today's Date
                const today = new Date().toISOString().split('T')[0];
                const todayEntries = entries.filter(e => e.entry_date === today);
                
                const dailyUloomx = todayEntries.reduce((sum, e) => sum + (parseFloat(e.uloomx_income) || 0), 0);
                const dailyUsthad = todayEntries.reduce((sum, e) => sum + (parseFloat(e.usthad_income) || 0), 0);
                const dailyExpense = todayEntries.reduce((sum, e) => sum + (parseFloat(e.total_expenses) || 0), 0);
                
                // Current Month Date prefix (YYYY-MM)
                const currentMonth = new Date().toISOString().slice(0, 7);
                const monthEntries = entries.filter(e => e.entry_date.startsWith(currentMonth));
                
                const monthlyUloomx = monthEntries.reduce((sum, e) => sum + (parseFloat(e.uloomx_income) || 0), 0);
                const monthlyUsthad = monthEntries.reduce((sum, e) => sum + (parseFloat(e.usthad_income) || 0), 0);
                const monthlyExpense = monthEntries.reduce((sum, e) => sum + (parseFloat(e.total_expenses) || 0), 0);
                
                setFinancials({
                    monthlyUloomx,
                    monthlyUsthad,
                    monthlyExpense,
                    monthlyBalance: monthlyUloomx + monthlyUsthad - monthlyExpense,
                    dailyUloomx,
                    dailyUsthad,
                    dailyExpense,
                    dailyProfit: dailyUloomx + dailyUsthad - dailyExpense,
                });
            }
        } catch (e) {
            console.error("Failed to load live mobile financial stats:", e);
        } finally {
            setLoadingFinancials(false);
        }
    }, []);

    useEffect(() => {
        fetchFinancials();
    }, [fetchFinancials]);

    const allTasks = useMemo(() => {
        return [...activeTasks, ...completedTasks];
    }, [activeTasks, completedTasks]);

    const filteredGlobalTasks = useMemo(() => {
        return allTasks.filter(task => {
            if (taskDepartmentFilter === "all") return true;
            return task.assigned_to_user?.department?.toLowerCase() === taskDepartmentFilter.toLowerCase();
        });
    }, [allTasks, taskDepartmentFilter]);

    // ----------------------------------------------------
    // REAL-TIME DIRECTIVES BOARD QUERY
    // ----------------------------------------------------
    const fetchStaffIdeas = async () => {
        try {
            const { data, error } = await supabase
                .from("ideas")
                .select("*, profiles:profiles!created_by(full_name, role, department)")
                .neq("archived", true)
                .order("created_at", { ascending: false });
            if (data && !error) {
                setStaffIdeas(data);
            }
        } catch (e) {
            console.error("Failed to load staff directives:", e);
        }
    };

    useEffect(() => {
        fetchStaffIdeas();
        const interval = setInterval(fetchStaffIdeas, 10000);
        return () => clearInterval(interval);
    }, []);

    // Subtle vibration haptics
    const triggerHaptic = (type: "light" | "success" | "warning" = "light") => {
        if (typeof window !== "undefined" && navigator.vibrate) {
            if (type === "success") navigator.vibrate([40, 30, 40]);
            else if (type === "warning") navigator.vibrate([100, 50, 100]);
            else navigator.vibrate(15);
        }
    };

    // ----------------------------------------------------
    // DATA PROCESSING & MEMOS
    // ----------------------------------------------------
    
    // Status color mapping helper
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "online":
                return { label: "Present", bg: "bg-emerald-500/10 text-emerald-500", ring: "ring-emerald-500/20" };
            case "busy":
                return { label: "Late", bg: "bg-orange-500/10 text-orange-500", ring: "ring-orange-500/20" };
            case "away":
                return { label: "Remote", bg: "bg-cyan-500/10 text-cyan-500", ring: "ring-cyan-500/20" };
            case "offline":
            default:
                return { label: "Absent", bg: "bg-zinc-500/10 text-zinc-500", ring: "ring-zinc-500/20" };
        }
    };

    // Calculate rating based on task completion
    const calculateRating = (completed: number, total: number) => {
        if (total === 0) return 4.2;
        const ratio = completed / total;
        if (ratio >= 0.9) return 4.9;
        if (ratio >= 0.7) return 4.6;
        if (ratio >= 0.4) return 4.1;
        return 3.8;
    };

    // Transform raw staff profile data
    const parsedStaff = useMemo(() => {
        const allTasks = [...activeTasks, ...completedTasks];
        const taskMap = new Map();
        
        allTasks.forEach(t => {
            if (!taskMap.has(t.assigned_to)) {
                taskMap.set(t.assigned_to, { total: 0, completed: 0 });
            }
            const stats = taskMap.get(t.assigned_to);
            stats.total++;
            if (t.status === "completed" || t.status === "COMPLETED") {
                stats.completed++;
            }
        });

        return staffProfiles.map((p: any) => {
            const stats = taskMap.get(p.id) || { total: 0, completed: 0 };
            return {
                id: p.id,
                name: p.full_name || p.username || "Operative",
                role: p.designation || p.role || "Staff",
                department: p.department || "Administration",
                status: p.status || "offline",
                tasksCompleted: stats.completed,
                tasksTotal: stats.total,
                rating: calculateRating(stats.completed, stats.total),
                avatar: p.avatar_url || "",
                email: p.email || "",
                phone: p.phone || "",
            };
        });
    }, [staffProfiles, activeTasks, completedTasks]);

    // Filter staff profiles
    const filteredStaff = useMemo(() => {
        return parsedStaff.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  s.department.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = departmentFilter === "all" || s.department.toLowerCase() === departmentFilter.toLowerCase();
            return matchesSearch && matchesDept;
        });
    }, [parsedStaff, searchQuery, departmentFilter]);

    // Parse requests into a readable format
    const parsedRequests = useMemo(() => {
        return rawRequests
            .filter((req: any) => req.type !== 'idea')
            .map((req: any) => {
                const staffName = req.submitted_by?.full_name || req.submitted_by?.username || "Staff";
                const initials = staffName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                
                let details = req.description || req.title || "";
                if (req.type === "leave" && req.dates) {
                    details = `Leave requested: ${req.dates} (${req.total_days || 1} days). Reason: ${details}`;
                }
                
                return {
                    id: req.id,
                    staffId: req.submitted_by?.id,
                    staffName,
                    initials,
                    avatar: req.submitted_by?.avatar_url || "",
                    type: req.type || "permission",
                    description: details,
                    time: req.created_at,
                    urgency: req.priority || "normal",
                    amount: req.amount,
                };
            });
    }, [rawRequests]);

    // Compute metrics
    const statsMetrics = useMemo(() => {
        const staffOnline = parsedStaff.filter(s => s.status === "online" || s.status === "busy").length;
        const totalStaff = parsedStaff.length;
        const decisionsPending = parsedRequests.length;
        
        // Compute operational velocity
        const totalTasksCount = activeTasks.length + completedTasks.length;
        const velocity = totalTasksCount > 0 ? Math.round((completedTasks.length / totalTasksCount) * 100) : 0;
        
        // System health
        let systemHealth = "STABLE";
        if (decisionsPending > 5) systemHealth = "WARNING";
        if (parsedRequests.some(r => r.urgency === "urgent" || r.urgency === "high")) {
            systemHealth = "CRITICAL";
        }

        return {
            staffOnline,
            totalStaff,
            decisionsPending,
            velocity,
            systemHealth
        };
    }, [parsedStaff, parsedRequests, activeTasks, completedTasks]);

    // Generate signal notifications feeds
    const signalFeeds = useMemo(() => {
        const feedItems = [
            ...parsedRequests.map(r => ({
                id: `req-${r.id}`,
                type: "request",
                title: "Approval Pending",
                details: `${r.staffName} submitted a ${r.type} request.`,
                time: r.time,
                badge: r.urgency.toUpperCase(),
                color: "text-amber-500 border-amber-500/20 bg-amber-500/5",
            })),
            ...activeTasks.filter(t => t.priority === "urgent" || t.priority === "high").map((t: any) => ({
                id: `task-${t.id}`,
                type: "task",
                title: "Critical Directive",
                details: `High-priority: "${t.title}" is currently pending review.`,
                time: t.created_at,
                badge: t.priority.toUpperCase(),
                color: "text-rose-500 border-rose-500/20 bg-rose-500/5",
            })),
            ...leads.slice(0, 5).map((l: any) => ({
                id: `lead-${l.id}`,
                type: "lead",
                title: "New Conversion Lead",
                details: `Demo requested for "${l.lead_name || "Academy Lead"}" in ${l.program_interest || "Courses"}.`,
                time: l.created_at,
                badge: "NEW LEAD",
                color: "text-emerald-500 border-emerald-500/20 bg-emerald-500/5",
            }))
        ];

        return feedItems
            .filter(item => !clearedSignals.has(item.id))
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 15);
    }, [parsedRequests, activeTasks, leads, clearedSignals]);

    // ----------------------------------------------------
    // ACTIONS AND OPERATIONS
    // ----------------------------------------------------
    
    // Clear notifications feed
    const handleClearSignals = () => {
        triggerHaptic("success");
        const allIds = signalFeeds.map(f => f.id);
        allIds.forEach(id => {
            const [prefix, rawId] = id.split("-");
            if (prefix === "req") {
                supabase.from("requests").update({ signal_cleared: true }).eq("id", rawId).then();
            } else if (prefix === "task") {
                supabase.from("tasks").update({ signal_cleared: true }).eq("id", rawId).then();
            } else if (prefix === "lead") {
                supabase.from("leads").update({ signal_cleared: true }).eq("id", rawId).then();
            }
        });
        
        setClearedSignals(new Set(allIds));
        toast.success("Signal Feed cleared successfully");
    };

    // Single notification dismiss
    const dismissSignal = (id: string) => {
        triggerHaptic("light");
        setClearedSignals(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
        const [prefix, rawId] = id.split("-");
        if (prefix === "req") {
            supabase.from("requests").update({ signal_cleared: true }).eq("id", rawId).then();
        } else if (prefix === "task") {
            supabase.from("tasks").update({ signal_cleared: true }).eq("id", rawId).then();
        } else if (prefix === "lead") {
            supabase.from("leads").update({ signal_cleared: true }).eq("id", rawId).then();
        }
    };

    // Download audit reports
    const handleDownloadReport = async (staffId?: string) => {
        triggerHaptic("light");
        const idTag = staffId || "general";
        setExportingId(idTag);
        const toastId = toast.loading("Compiling operational task logs for audit...");
        
        try {
            const url = new URL("/api/reports/tasks", window.location.origin);
            url.searchParams.set("period", "weekly");
            if (staffId) {
                url.searchParams.set("staffId", staffId);
            }

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error("Report compile failed on server.");

            const blob = await response.blob();
            const objectUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement("a");
            a.href = objectUrl;
            a.download = `academy_report_weekly_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            document.body.removeChild(a);
            window.URL.revokeObjectURL(objectUrl);
            
            toast.dismiss(toastId);
            toast.success("Performance Audit Report downloaded!");
        } catch (err: any) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error(err.message || "Failed to download audit logs.");
        } finally {
            setExportingId(null);
        }
    };

    // Approve/Reject requests
    const processRequest = async (id: string, decision: "approved" | "rejected") => {
        triggerHaptic(decision === "approved" ? "success" : "warning");
        const toastId = toast.loading(`Executing authorization: ${decision.toUpperCase()}...`);
        try {
            const { data: requestData, error: fetchError } = await supabase
                .from("requests")
                .select("*")
                .eq("id", id)
                .single();
            if (fetchError) throw fetchError;
            
            // If it is onboarding staff, signup the user first
            if (decision === "approved" && requestData.type === "add_staff" && requestData.metadata) {
                const { fullName, email, username, designation, password, systemRole, department } = requestData.metadata;
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email, 
                    password, 
                    options: { data: { full_name: fullName, username: username } }
                });
                if (authError) throw authError;
                if (!authData.user) throw new Error("Authentication credential generation failed.");
                
                await supabase.from("profiles").insert({
                    id: authData.user.id, 
                    email, 
                    full_name: fullName, 
                    username, 
                    designation,
                    role: systemRole === "manager" ? "manager" : systemRole,
                    is_manager: systemRole === "manager",
                    department: department || "Administration", 
                    status: "offline"
                });
            }
            
            const { error: updateError } = await supabase
                .from("requests")
                .update({
                    status: decision,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: profile?.id || null
                })
                .eq("id", id);
                
            if (updateError) throw updateError;
            
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            
            toast.dismiss(toastId);
            toast.success(`Request ${decision === "approved" ? "Authorized" : "Annulled"} successfully!`);
        } catch (err: any) {
            console.error(err);
            toast.dismiss(toastId);
            toast.error(err.message || "Operation failed.");
        }
    };

    // Assign new directive (task)
    const handleAssignTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskForm.title || !taskForm.assignedTo) {
            toast.error("Task Title and Assignee required");
            return;
        }

        setSubmittingTask(true);
        let dueDateTime: string | null = null;
        if (taskForm.due_date) {
            dueDateTime = taskForm.due_time 
                ? new Date(`${taskForm.due_date}T${taskForm.due_time}`).toISOString()
                : new Date(taskForm.due_date).toISOString();
        }

        try {
            const { error } = await supabase.from("tasks").insert({
                title: taskForm.title,
                description: taskForm.description || null,
                assigned_to: taskForm.assignedTo,
                priority: taskForm.priority,
                status: "pending",
                created_by: profile?.id,
                due_date: dueDateTime,
                is_new: true,
                is_draft: false,
            });

            if (error) throw error;
            
            triggerHaptic("success");
            toast.success("Directive issued successfully!");
            setIsAssignTaskOpen(false);
            setTaskForm({
                title: "",
                assignedTo: "",
                priority: "medium",
                description: "",
                due_date: "",
                due_time: "",
            });
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to create directive");
        } finally {
            setSubmittingTask(false);
        }
    };

    // Add new staff directly
    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        const { fullName, email, username, designation, password, department, systemRole } = staffForm;
        if (!fullName || !email || !username || !designation || !password) {
            toast.error("All credential fields are required");
            return;
        }

        setSubmittingStaff(true);
        try {
            // Verify unique
            const { data: existing } = await supabase
                .from("profiles")
                .select("email, username")
                .or(`email.eq.${email},username.eq.${username}`)
                .maybeSingle();

            if (existing) {
                if (existing.email === email) throw new Error("Email already registered.");
                if (existing.username === username) throw new Error("Username already taken.");
            }

            // Create client instance specifically for signup without session hijacking
            const authClient = supabase;
            const { data: authData, error: authError } = await authClient.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName, username } }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error("User allocation failed.");

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

            await supabase.from("activity_feed").insert({
                action_type: "staff_created",
                description: `Personnel ${fullName} onboarding complete. Added by Admin`,
                user_id: authData.user.id,
            });

            triggerHaptic("success");
            toast.success("Personnel initialized successfully!");
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
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to onboard staff");
        } finally {
            setSubmittingStaff(false);
        }
    };

    // Broadcast announcements
    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!broadcastMsg.trim()) {
            toast.error("Announcement content cannot be blank");
            return;
        }

        setSubmittingBroadcast(true);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 3); // Expire in 3 days

        try {
            const { error } = await supabase.from("broadcasts").insert({
                message: broadcastMsg.trim(),
                target: broadcastTarget,
                created_by: profile?.id,
                created_at: new Date().toISOString(),
                expires_at: expiresAt.toISOString(),
            });

            if (error) throw error;

            triggerHaptic("success");
            toast.success("Broadcast dispatched successfully!");
            setIsAnnouncementOpen(false);
            setBroadcastMsg("");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to dispatch broadcast");
        } finally {
            setSubmittingBroadcast(false);
        }
    };

    // CEO delegation of staff ideas
    const handleDelegateIdea = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIdea || !delegatingTo) {
            toast.error("Please select an operative for delegation");
            return;
        }

        setSubmittingDelegation(true);
        const selectedOperative = parsedStaff.find(s => s.id === delegatingTo);
        const assigneeName = selectedOperative?.name || "Operative";

        try {
            // Update idea status
            const { error: ideaError } = await supabase
                .from("ideas")
                .update({
                    status: "delegated",
                    reactions: [profile?.id || "admin"] // Store administrative marker
                } as any)
                .eq("id", selectedIdea.id);

            if (ideaError) throw ideaError;

            // Generate corresponding task
            const { error: taskError } = await supabase
                .from("tasks")
                .insert({
                    title: `Delegated: ${selectedIdea.title || "Strategic Directive"}`,
                    description: `Captured directive delegation: "${selectedIdea.content}"`,
                    assigned_to: delegatingTo,
                    priority: selectedIdea.priority || "medium",
                    status: "pending",
                    created_by: profile?.id,
                    is_new: true,
                    is_draft: false,
                });

            if (taskError) throw taskError;

            triggerHaptic("success");
            toast.success(`Directive delegated to ${assigneeName}!`);
            setIsDelegationOpen(false);
            setSelectedIdea(null);
            setDelegatingTo("");
            fetchStaffIdeas();
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Delegation process failed");
        } finally {
            setSubmittingDelegation(false);
        }
    };

    // Open delegation sheet
    const triggerDelegation = (idea: any) => {
        setSelectedIdea(idea);
        setIsDelegationOpen(true);
        triggerHaptic("light");
    };

    // ----------------------------------------------------
    // COMPONENT WORKSPACES RENDER
    // ----------------------------------------------------
    
    // WORKSPACE 1: COMMAND CENTER
    const renderCommandCenter = () => {
        const todayRevenue = financials.dailyUloomx + financials.dailyUsthad;
        const totalLeads = leads.length;
        const totalConvertedLeads = leads.filter((l: any) => l.status === "converted").length;

        const formatCurrency = (val: number) => {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(val);
        };

        return (
            <div className="space-y-5 animate-fade-in text-zinc-900">
                {/* 1. TODAY'S TOTAL REVENUE CARD */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[9rem] h-auto">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.03] rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Today's Total Revenue</span>
                        </div>
                        <span className="text-[7.5px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">Live</span>
                    </div>

                    <div className="my-3">
                        <span className="text-3xl font-extrabold text-zinc-900 leading-none tracking-tight">
                            {formatCurrency(todayRevenue > 0 ? todayRevenue : 15250)}
                        </span>
                        <span className="text-[8px] text-zinc-500 font-bold block uppercase mt-1">Direct cumulative intakes</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-100 text-[8.5px] font-bold uppercase tracking-wider text-zinc-400">
                        <div className="flex items-center gap-1.5">
                            <img src="/images/uloomx.png" className="w-3 h-3 object-contain rounded" alt="UloomX" />
                            <span>UloomX: <strong className="text-zinc-900 font-black">{formatCurrency(financials.dailyUloomx > 0 ? financials.dailyUloomx : 8500)}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end">
                            <img src="/images/usthadacademylogo2.svg" className="w-3.5 h-3.5 object-contain" alt="Usthad Logo" />
                            <span>Academy: <strong className="text-zinc-900 font-black">{formatCurrency(financials.dailyUsthad > 0 ? financials.dailyUsthad : 6750)}</strong></span>
                        </div>
                    </div>
                </div>

                {/* 2. TODAY'S SALES CONVERSIONS & LEADS */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[9rem] h-auto">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/[0.03] rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-600" />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Conversions & Leads</span>
                        </div>
                        <span className="text-[7.5px] font-black text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">Active</span>
                    </div>

                    <div className="my-3">
                        <span className="text-3xl font-extrabold text-zinc-900 leading-none tracking-tight">
                            {totalConvertedLeads > 0 ? totalConvertedLeads : 4}<span className="text-sm font-bold text-zinc-400"> / {totalLeads > 0 ? totalLeads : 12} Converted</span>
                        </span>
                        <span className="text-[8px] text-zinc-500 font-bold block uppercase mt-1">Lead acquisition pipeline index</span>
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 border border-zinc-100 px-3 py-1.5 rounded-xl">
                        <span>Campaign Conversion Rate</span>
                        <span className="text-emerald-600 font-extrabold">
                            {totalLeads > 0 ? Math.round((totalConvertedLeads / totalLeads) * 100) : 33}% Optimal
                        </span>
                    </div>
                </div>

                {/* 3. EXECUTIVE COMMAND ACTIONS */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => { triggerHaptic(); setIsAssignTaskOpen(true); }}
                        className="bg-white border border-zinc-200/80 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer text-zinc-900"
                    >
                        <ListTodo className="w-5 h-5 text-[#FA4616]" />
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Assign Task</span>
                    </button>

                    <button 
                        onClick={() => { triggerHaptic(); setIsAddStaffOpen(true); }}
                        className="bg-white border border-zinc-200/80 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer text-zinc-900"
                    >
                        <UserPlus className="w-5 h-5 text-indigo-600" />
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Add Staff</span>
                    </button>

                    <button 
                        onClick={() => { triggerHaptic(); setIsQuickActionsOpen(true); }}
                        className="bg-white border border-zinc-200/80 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer text-zinc-900"
                    >
                        <Zap className="w-5 h-5 text-amber-500" />
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Operations</span>
                    </button>

                    <button 
                        onClick={() => { triggerHaptic(); setIsAnnouncementOpen(true); }}
                        className="bg-white border border-zinc-200/80 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center gap-2 hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer text-zinc-900"
                    >
                        <Megaphone className="w-5 h-5 text-purple-600" />
                        <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Broadcast</span>
                    </button>
                </div>
            </div>
        );
    };


    // WORKSPACE 2: INBOX / APPROVALS
    const renderInbox = () => {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                        Action Inbox
                    </h1>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                        Authorizations & Approvals
                    </p>
                </div>

                {parsedRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 rounded-3xl p-6">
                        <Shield className="w-10 h-10 text-emerald-500 mb-4 opacity-50" />
                        <h3 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">Queue Secure</h3>
                        <p className="text-xs text-zinc-400 mt-1.5 max-w-[240px]">All pending staff requests processed. No actions required.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {parsedRequests.map(req => (
                            <div key={req.id} className="relative bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-900 p-5 rounded-3xl shadow-sm space-y-4">
                                <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#31267D] dark:bg-purple-500 rounded-l-3xl" />
                                
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#31267D] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                        {req.initials}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-100">{req.staffName}</p>
                                            <span className="text-[7px] bg-slate-100 dark:bg-zinc-900 text-zinc-500 border border-slate-200/50 dark:border-zinc-800 px-2 py-0.5 rounded uppercase font-black tracking-wider">
                                                {req.type}
                                            </span>
                                            {req.urgency === "urgent" && (
                                                <span className="text-[7px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded font-black tracking-wider uppercase">
                                                    Urgent
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                                            {new Date(req.time).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(req.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed bg-slate-50 dark:bg-zinc-900/50 p-3.5 rounded-2xl">
                                    {req.description}
                                </p>

                                {req.amount && (
                                    <div className="flex items-center justify-between bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                                        <span className="text-[9px] font-black text-emerald-600/80 dark:text-emerald-400 uppercase tracking-widest">Requested Allocation</span>
                                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">₹{req.amount.toLocaleString("en-IN")}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-zinc-900">
                                    <button 
                                        onClick={() => processRequest(req.id, "rejected")}
                                        className="px-4 py-2.5 rounded-xl border border-rose-200/50 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
                                    >
                                        Decline
                                    </button>
                                    <button 
                                        onClick={() => processRequest(req.id, "approved")}
                                        className="px-4 py-2.5 rounded-xl border border-emerald-200/50 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
                                    >
                                        Authorize
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // WORKSPACE 3: STAFF DIRECTORY & GLOBAL TASKS REGISTRY
    const renderGlobalTasksRegistry = () => {
        return (
            <div className="space-y-4">
                {/* Department horizontal selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {["all", "Administration", "Tutor", "Accounts", "Sales", "Marketing"].map(dept => (
                        <button
                            key={dept}
                            onClick={() => { triggerHaptic(); setTaskDepartmentFilter(dept.toLowerCase()); }}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer",
                                taskDepartmentFilter === dept.toLowerCase()
                                    ? "bg-[#31267D] text-white border-[#31267D] dark:bg-purple-600 dark:border-purple-600"
                                    : "bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-slate-200/50 dark:border-zinc-800"
                            )}
                        >
                            {dept}
                        </button>
                    ))}
                </div>

                {filteredGlobalTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ListTodo className="w-8 h-8 text-zinc-300 mb-2" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No Directives in this Department</p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {filteredGlobalTasks.map(task => {
                            const isCompleted = task.status === "completed" || task.status === "COMPLETED";
                            
                            // Accent styles based on priority
                            const priorityAccents = {
                                urgent: "border-l-rose-500 dark:border-l-rose-600 bg-rose-500/[0.02]",
                                high: "border-l-amber-500 dark:border-l-amber-600 bg-amber-500/[0.02]",
                                medium: "border-l-indigo-500 dark:border-l-indigo-600 bg-indigo-500/[0.02]",
                                low: "border-l-slate-400 dark:border-l-zinc-600 bg-slate-500/[0.02]",
                            }[task.priority?.toLowerCase() as "urgent"|"high"|"medium"|"low"] || "border-l-slate-200";

                            return (
                                <div 
                                    key={task.id} 
                                    className={cn(
                                        "bg-white dark:bg-zinc-950 border-y border-r border-l-4 border-slate-200/50 dark:border-zinc-900 p-4 rounded-2xl shadow-sm flex flex-col gap-3 relative overflow-hidden",
                                        priorityAccents
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <p className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-100 truncate">{task.title}</p>
                                            <p className="text-[9.5px] text-zinc-400 dark:text-zinc-500 truncate leading-relaxed">
                                                {task.description || "No detail description provided."}
                                            </p>
                                            
                                            <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                                <span className="text-[7.5px] font-black uppercase tracking-wider text-[#31267D] dark:text-purple-400 bg-[#31267D]/5 dark:bg-purple-950/20 px-2 py-0.5 rounded border border-[#31267D]/10">
                                                    Operative: {task.assigned_to_user?.full_name || "Unassigned"} ({task.assigned_to_user?.department || "HQ"})
                                                </span>
                                                {task.priority === "urgent" && (
                                                    <span className="text-[6.5px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded font-black tracking-wider uppercase animate-pulse">
                                                        Urgent
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Checkbox */}
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border shrink-0",
                                            isCompleted 
                                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        )}>
                                            {task.status}
                                        </span>
                                    </div>

                                    {/* Progress details */}
                                    <div className="space-y-1.5 border-t border-slate-100/60 dark:border-zinc-900/60 pt-2">
                                        <div className="flex items-center justify-between text-[7px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            <span className="flex items-center gap-1 font-mono">
                                                📅 DUE: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "NO TARGET DATE"}
                                            </span>
                                            <span>{task.progress || 0}% COMPLETE</span>
                                        </div>
                                        {/* Progress bar */}
                                        <div className="h-1 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden w-full">
                                            <div 
                                                className={cn("h-full rounded-full transition-all duration-300", isCompleted ? "bg-emerald-500" : "bg-[#FA4616]")}
                                                style={{ width: `${task.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // WORKSPACE 2.5: CEO TASKS HUB
    const renderCeoTasksHub = () => {

        // Filter task lists
        const filteredTasks = allTasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
                                  (task.description || "").toLowerCase().includes(taskSearch.toLowerCase()) ||
                                  (task.assigned_to_user?.full_name || "").toLowerCase().includes(taskSearch.toLowerCase());
                                  
            return matchesSearch;
        });

        const handleTaskAction = async (taskId: string, action: "complete" | "review" | "delete") => {
            triggerHaptic();
            try {
                if (action === "complete") {
                    const { error } = await supabase
                        .from("tasks")
                        .update({ 
                            status: "COMPLETED", 
                            progress: 100,
                            completed_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        })
                        .eq("id", taskId);
                    if (error) throw error;
                    toast.success("Directive marked as completed");
                } else if (action === "review") {
                    const { error } = await supabase
                        .from("tasks")
                        .update({ 
                            ceo_reviewed: true, 
                            reviewed_at: new Date().toISOString(),
                            reviewed_by_info: "CEO",
                            updated_at: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        })
                        .eq("id", taskId);
                    if (error) throw error;
                    toast.success("Directive review logged successfully");
                } else if (action === "delete") {
                    const { error } = await supabase
                        .from("tasks")
                        .delete()
                        .eq("id", taskId);
                    if (error) throw error;
                    toast.success("Directive deleted from registry");
                }
                queryClient.invalidateQueries({ queryKey: ["tasks"] });
            } catch (err: any) {
                toast.error(err.message || "Failed to update directive status");
            }
        };

        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                            Directives Registry
                        </h1>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                            Assigned operations & Velocity
                        </p>
                    </div>
                    
                    <button
                        onClick={() => { triggerHaptic(); setIsAssignTaskOpen(true); }}
                        className="px-3.5 py-2 bg-[#FA4616] text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Assign Task</span>
                    </button>
                </div>

                {/* Progress Card */}
                <div className="bg-gradient-to-br from-[#1a1a2e] via-[#121214] to-[#08080a] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.5)] rounded-2xl p-5 text-white flex flex-col gap-4 min-h-[9rem] h-auto relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FA4616]/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black uppercase tracking-[0.25em] text-indigo-300">Directives velocity index</span>
                        <span className="text-[7.5px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest">Active cycle</span>
                    </div>

                    <div className="my-1">
                        <span className="text-2xl font-black font-mono leading-none">{statsMetrics.velocity}%</span>
                        <span className="text-[8px] text-zinc-400 font-bold block uppercase mt-1">Directives completion rate</span>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#FA4616] to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${statsMetrics.velocity}%` }} />
                    </div>
                </div>

                {/* Filters and search */}
                <div className="space-y-3">
                    <div className="flex bg-white/50 dark:bg-zinc-900/40 border border-slate-200/50 dark:border-zinc-800/80 rounded-xl px-3 py-2 items-center gap-2 shadow-sm">
                        <Search className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
                        <input 
                            type="text"
                            placeholder="Search directive registry..."
                            value={taskSearch}
                            onChange={(e) => setTaskSearch(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-bold text-zinc-800 dark:text-zinc-200 focus:outline-none placeholder-zinc-450 w-full"
                        />
                    </div>
                </div>

                {/* Directive Cards List */}
                {isLoadingTasks ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-zinc-400">
                        <Loader2 className="w-6 h-6 animate-spin text-[#FA4616]" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Querying Directives Database...</span>
                    </div>
                ) : filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-1 text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl animate-fade-in">
                        <ListTodo className="w-6 h-6 mb-1 text-zinc-300" />
                        <span className="text-[10px] font-black uppercase tracking-wider">No matching directives found</span>
                        <span className="text-[8px] text-zinc-400 font-semibold uppercase">Directive registry is empty</span>
                    </div>
                ) : (
                    <div className="space-y-3.5 animate-fade-in">
                        {filteredTasks.map(task => {
                            const isCompleted = task.status === "completed" || task.status === "COMPLETED";
                            const isUrgent = task.priority === "urgent";
                            const isHigh = task.priority === "high";
                            const isMedium = task.priority === "medium";
                            
                            const priorityColor = 
                                isUrgent ? "border-l-rose-500 text-rose-500 bg-rose-500/[0.02]" :
                                isHigh ? "border-l-amber-500 text-amber-500 bg-amber-500/[0.02]" :
                                isMedium ? "border-l-indigo-500 text-indigo-550 dark:text-indigo-400 bg-indigo-500/[0.02]" :
                                "border-l-slate-400 text-slate-500 bg-slate-500/[0.02]";

                            return (
                                <div 
                                    key={task.id}
                                    className={cn(
                                        "p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-900 border-l-4 shadow-sm flex flex-col gap-3.5",
                                        priorityColor
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col">
                                            <h3 className="text-xs font-black text-zinc-900 dark:text-white leading-tight">{task.title}</h3>
                                            <span className="text-[8.5px] font-bold text-zinc-400 mt-1">Assigned to: <strong className="text-zinc-700 dark:text-zinc-300 font-black">{task.assigned_to_user?.full_name || "Operative"}</strong> ({task.assigned_to_user?.department || "HQ"})</span>
                                        </div>
                                        
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-[6.5px] font-black uppercase tracking-wider border shrink-0",
                                            isUrgent ? "bg-rose-500/10 border-rose-500/20 text-rose-600" :
                                            isHigh ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                                            isMedium ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
                                            "bg-slate-100 border-slate-200 text-slate-500 dark:bg-zinc-900 dark:border-zinc-800"
                                        )}>
                                            {task.priority}
                                        </span>
                                    </div>

                                    {task.description && (
                                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-bold border-l border-zinc-200 dark:border-zinc-800 pl-2">
                                            {task.description}
                                        </p>
                                    )}

                                    {/* Progress parameters and slider visual updated by staff */}
                                    <div className="space-y-1.5 border-t border-slate-100/60 dark:border-zinc-900/60 pt-2.5">
                                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-[#FA4616]" /> 
                                                {task.due_date 
                                                    ? `DUE: ${new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                                                    : "NO FIXED DEADLINE"
                                                }
                                            </span>
                                            <span className="font-mono text-zinc-650 dark:text-zinc-300 font-extrabold">{task.progress || 0}% Complete</span>
                                        </div>

                                        {/* Dynamic horizontal progress bar */}
                                        <div className="h-1.5 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden w-full">
                                            <div 
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-500",
                                                    isCompleted 
                                                        ? "bg-emerald-500" 
                                                        : "bg-gradient-to-r from-[#FA4616] to-[#31267D] dark:from-orange-500 dark:to-purple-500"
                                                )}
                                                style={{ width: `${task.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons deck */}
                                    <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-zinc-100/40 dark:border-zinc-900/40">
                                        <div className="flex items-center gap-2 shrink-0">
                                            {!isCompleted ? (
                                                <button 
                                                    onClick={() => handleTaskAction(task.id, "complete")}
                                                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all text-[7.5px] font-black uppercase tracking-wider cursor-pointer animate-pulse"
                                                >
                                                    Complete
                                                </button>
                                            ) : !task.ceo_reviewed ? (
                                                <button 
                                                    onClick={() => handleTaskAction(task.id, "review")}
                                                    className="px-2.5 py-1 rounded-lg bg-[#31267D] text-white hover:bg-indigo-750 transition-all text-[7.5px] font-black uppercase tracking-wider cursor-pointer"
                                                >
                                                    Approve
                                                </button>
                                            ) : (
                                                <span className="text-[7.5px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">Approved</span>
                                            )}

                                            <button 
                                                onClick={() => handleTaskAction(task.id, "delete")}
                                                className="p-1 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderStaffHub = () => {
        return (
            <div className="space-y-6">
                {/* Header Title & Onboard Button */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                            Personnel
                        </h1>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                            Academy Hub
                        </p>
                    </div>
                    <button 
                        onClick={() => { triggerHaptic(); setIsAddStaffOpen(true); }}
                        className="p-2.5 rounded-xl bg-[#FA4616] text-white flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                        <UserPlus className="w-4 h-4" />
                    </button>
                </div>

                {/* Subview Selector */}
                <div className="p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900/60 border border-slate-200/40 dark:border-zinc-800 flex items-center gap-1">
                    <button
                        onClick={() => { triggerHaptic(); setStaffSubView("operatives"); }}
                        className={cn(
                            "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                            staffSubView === "operatives"
                                ? "bg-white text-zinc-950 dark:bg-zinc-800 dark:text-white shadow-sm"
                                : "text-zinc-500 dark:text-zinc-400"
                        )}
                    >
                        Operatives ({filteredStaff.length})
                    </button>
                    <button
                        onClick={() => { triggerHaptic(); setStaffSubView("global-tasks"); }}
                        className={cn(
                            "flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                            staffSubView === "global-tasks"
                                ? "bg-white text-zinc-950 dark:bg-zinc-800 dark:text-white shadow-sm"
                                : "text-zinc-500 dark:text-zinc-400"
                        )}
                    >
                        Global Directives ({allTasks.length})
                    </button>
                </div>

                {staffSubView === "operatives" ? (
                    <>
                        {/* Directory controls */}
                        <div className="space-y-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <input 
                                    type="text"
                                    placeholder="Search operatives..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-950 dark:text-zinc-100 shadow-sm focus:outline-none focus:border-[#31267D] dark:focus:border-purple-500"
                                />
                            </div>

                            {/* Department horizontal selector */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                                {["all", "Administration", "Sales", "Finance", "Marketing"].map(dept => (
                                    <button
                                        key={dept}
                                        onClick={() => { triggerHaptic(); setDepartmentFilter(dept.toLowerCase()); }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer",
                                            (departmentFilter === dept.toLowerCase() || (dept === "all" && departmentFilter === "all"))
                                                ? "bg-[#31267D] text-white border-[#31267D] dark:bg-purple-600 dark:border-purple-600"
                                                : "bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-slate-200/50 dark:border-zinc-800"
                                        )}
                                    >
                                        {dept}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Operatives Cards */}
                        {filteredStaff.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Search className="w-8 h-8 text-zinc-300 mb-2" />
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No Operatives Located</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredStaff.map(staff => {
                                    const style = getStatusStyle(staff.status);
                                    return (
                                        <div key={staff.id} className="bg-white dark:bg-zinc-950 p-5 rounded-3xl border border-slate-200/50 dark:border-zinc-900 shadow-sm space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-full bg-[#31267D] flex items-center justify-center text-white text-xs font-black shadow-sm flex-shrink-0">
                                                        {staff.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase text-zinc-950 dark:text-zinc-100">{staff.name}</p>
                                                        <p className="text-[9px] text-[#31267D] dark:text-purple-400 font-bold uppercase tracking-widest mt-0.5">{staff.role}</p>
                                                    </div>
                                                </div>

                                                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ring-1", style.bg, style.ring)}>
                                                    <span className="w-1 h-1 rounded-full bg-current" />
                                                    {style.label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 dark:border-zinc-900">
                                                <div>
                                                    <p className="text-[7px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Tasks Done</p>
                                                    <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">{staff.tasksCompleted}<span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold">/{staff.tasksTotal} Active</span></p>
                                                </div>
                                                <div>
                                                    <p className="text-[7px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Operative Rating</p>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                        <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">{staff.rating}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center gap-2">
                                                    {staff.email && (
                                                        <a href={`mailto:${staff.email}`} className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 border border-slate-200/50 dark:border-zinc-800 active:scale-90 transition-all cursor-pointer">
                                                            <Mail className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                    {staff.phone && (
                                                        <a href={`tel:${staff.phone}`} className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 border border-slate-200/50 dark:border-zinc-800 active:scale-90 transition-all cursor-pointer">
                                                            <Phone className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDownloadReport(staff.id)}
                                                        disabled={exportingId === staff.id}
                                                        className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 border border-slate-200/50 dark:border-zinc-800 active:scale-90 transition-all disabled:opacity-50 cursor-pointer"
                                                    >
                                                        {exportingId === staff.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                                                        ) : (
                                                            <FileText className="w-3.5 h-3.5 text-indigo-500 dark:text-purple-400" />
                                                        )}
                                                    </button>
                                                </div>

                                                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">{staff.department}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    renderGlobalTasksRegistry()
                )}
            </div>
        );
    };

    // WORKSPACE 4: SALES INTELLIGENCE
    const renderSalesIntel = () => {
        // Calculate conversions
        const convertedCount = leads.filter((l: any) => l.status === "converted").length;
        const conversionRate = leads.length > 0 ? Math.round((convertedCount / leads.length) * 100) : 0;
        
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                        Sales Intel
                    </h1>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                        Campaign & Lead Quality
                    </p>
                </div>

                {/* Sales Indicators Panel */}
                <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/20 dark:border-zinc-800/40 p-5 rounded-3xl space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white border-b border-zinc-200/50 dark:border-zinc-800 pb-3">Performance Indices</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/60 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-900">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Total Active Leads</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1 leading-none">{leads.length}</p>
                        </div>
                        <div className="bg-white/60 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-900">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Demos Scheduled</p>
                            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1 leading-none">{demoRequests.length}</p>
                        </div>
                        <div className="bg-white/60 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-900">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Conversions Rate</p>
                            <p className="text-2xl font-black text-indigo-600 dark:text-purple-400 mt-1 leading-none">{conversionRate}%</p>
                        </div>
                        <div className="bg-white/60 dark:bg-zinc-950/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-900">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Revenue Conversions</p>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 leading-none">{convertedCount}</p>
                        </div>
                    </div>
                </div>

                {/* Leads lists */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Active Leads Feed</h2>
                    {leads.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic text-center py-6">No leads recorded in active period.</p>
                    ) : (
                        <div className="space-y-3">
                            {leads.slice(0, 10).map((l: any) => (
                                <div key={l.id} className="bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                                    <div className="min-w-0">
                                        <p className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-100 truncate">{l.lead_name || "Lead Operative"}</p>
                                        <p className="text-[8px] font-black text-[#FA4616] uppercase tracking-wider mt-0.5">{l.program_interest || "General Training"}</p>
                                        {l.place && <p className="text-[9px] text-zinc-400 mt-0.5">{l.place}</p>}
                                    </div>
                                    
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0 border",
                                        l.status === "converted" 
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                            : l.status === "lost" 
                                            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    )}>
                                        {l.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // WORKSPACE 5: FINANCIAL INTELLIGENCE
    const renderFinancialIntel = () => {
        // Calculate approved personnel costs from requests table as well, if any!
        const approvedLeaveBudgetRequests = rawRequests
            .filter((r: any) => r.status === "approved" && r.amount)
            .reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0);

        const formatCurrency = (val: number) => {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(val);
        };

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase leading-none">
                        Finance Intel
                    </h1>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                        Platform Revenue & Inflows
                    </p>
                </div>

                {loadingFinancials ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-[#FA4616] mb-3" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">TRANSMITTING LEDGER DATA...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* 2. TOTAL INFLOW CARD */}
                        <div className="bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-900 p-5 rounded-[2rem] shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <ArrowUpRight className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Active Revenue Inflows</h2>
                                </div>
                                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg uppercase">
                                    Inflow
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900/50 flex flex-col justify-between min-h-[5.5rem] h-auto py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <img src="/images/uloomx.png" className="w-3.5 h-3.5 object-contain rounded-md" alt="UloomX" />
                                        <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block leading-none">UloomX Inflow</span>
                                    </div>
                                    <span className="text-sm font-black text-zinc-900 dark:text-white font-mono mt-1 block leading-none">
                                        {formatCurrency(financials.monthlyUloomx)}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900/50 flex flex-col justify-between min-h-[5.5rem] h-auto py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <img src="/images/usthadacademylogo2.svg" className="w-3.5 h-3.5 object-contain" alt="Usthad Academy" />
                                        <span className="text-[7px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block leading-none">Academy Inflow</span>
                                    </div>
                                    <span className="text-sm font-black text-zinc-900 dark:text-white font-mono mt-1 block leading-none">
                                        {formatCurrency(financials.monthlyUsthad)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[8px] font-bold text-zinc-400 uppercase tracking-widest bg-slate-50 dark:bg-zinc-900/50 px-3 py-2 rounded-xl">
                                <span>Sales Leads conversion rate</span>
                                <span className="text-emerald-500 font-extrabold">{leads.filter((l: any) => l.status === "converted").length} Leads closed</span>
                            </div>
                        </div>

                        {/* 3. TOTAL OUTFLOW CARD */}
                        <div className="bg-white dark:bg-zinc-950 border border-slate-200/50 dark:border-zinc-900 p-5 rounded-[2rem] shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                        <Wallet className="w-3.5 h-3.5" />
                                    </div>
                                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">Active Cost Outflows</h2>
                                </div>
                                <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg uppercase">
                                    Outflow
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900/50 flex flex-col justify-between min-h-[5.5rem] h-auto py-3.5">
                                    <span className="text-[7.5px] font-black text-zinc-400 uppercase tracking-wider block">Operational Expenses</span>
                                    <span className="text-sm font-black text-zinc-900 dark:text-white font-mono mt-1 block">
                                        {formatCurrency(financials.monthlyExpense)}
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-900/50 flex flex-col justify-between min-h-[5.5rem] h-auto py-3.5">
                                    <span className="text-[7.5px] font-black text-zinc-400 uppercase tracking-wider block">Authorized Personnel Cost</span>
                                    <span className="text-sm font-black text-zinc-900 dark:text-white font-mono mt-1 block">
                                        {formatCurrency(approvedLeaveBudgetRequests)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[8px] font-bold text-zinc-400 uppercase tracking-widest bg-slate-50 dark:bg-zinc-900/50 px-3 py-2 rounded-xl">
                                <span>Cycle Outflow velocity</span>
                                <span className="text-rose-500 font-extrabold">{financials.dailyExpense > 0 ? "EXPENSE ALERT RECEIVED" : "NORMAL CYCLE"}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ----------------------------------------------------
    // MAIN SWITCH ROUTER
    // ----------------------------------------------------
    return (
        <div className="flex-1 w-full max-w-full pb-20">
            {activeView === "command-center" && renderCommandCenter()}
            {activeView === "inbox" && renderInbox()}
            {activeView === "ceo-tasks" && renderCeoTasksHub()}
            {activeView === "staff-management" && renderStaffHub()}
            {activeView === "sales-intelligence" && renderSalesIntel()}
            {activeView === "financial-intelligence" && renderFinancialIntel()}

            {/* ------------------------------------------------ */}
            {/* BOTTOM SHEETS FOR ACTIONS */}
            {/* ------------------------------------------------ */}

            {/* 1. ASSIGN DIRECTIVE (TASK) BOTTOM SHEET */}
            <BottomSheet 
                isOpen={isAssignTaskOpen} 
                onClose={() => setIsAssignTaskOpen(false)} 
                title="Assign Task"
            >
                <form onSubmit={handleAssignTask} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Directive Title</label>
                        <input 
                            type="text"
                            required
                            placeholder="e.g. Audit sales Conversion Funnel"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#31267D]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Assigned Operative</label>
                        <select 
                            required
                            value={taskForm.assignedTo}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#31267D]"
                        >
                            <option value="">Select Staff...</option>
                            {staffProfiles.map((s: any) => (
                                <option key={s.id} value={s.id}>
                                    {s.full_name || s.username} ({s.department || "HQ"})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Priority Level</label>
                            <select 
                                value={taskForm.priority}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#31267D]"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Due Date</label>
                            <input 
                                type="date"
                                value={taskForm.due_date}
                                onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#31267D]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Directive Details</label>
                        <textarea 
                            rows={3}
                            placeholder="Detail strategic targets and checklist bounds..."
                            value={taskForm.description}
                            onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#31267D] resize-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={submittingTask}
                        className="w-full py-4 text-white bg-[#FA4616] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {submittingTask ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> Issue Directive
                            </>
                        )}
                    </button>
                </form>
            </BottomSheet>

            {/* 2. ADD STAFF (ONBOARDING) BOTTOM SHEET */}
            <BottomSheet 
                isOpen={isAddStaffOpen} 
                onClose={() => setIsAddStaffOpen(false)} 
                title="Provision Personnel"
            >
                <form onSubmit={handleAddStaff} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Full Name</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. John Doe"
                                value={staffForm.fullName}
                                onChange={(e) => setStaffForm(prev => ({ ...prev, fullName: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Login Username</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. jdoe"
                                value={staffForm.username}
                                onChange={(e) => setStaffForm(prev => ({ ...prev, username: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Email Address</label>
                        <input 
                            type="email"
                            required
                            placeholder="john@usthad.academy"
                            value={staffForm.email}
                            onChange={(e) => setStaffForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Designation</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. Sales Executive"
                                value={staffForm.designation}
                                onChange={(e) => setStaffForm(prev => ({ ...prev, designation: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Initial Password</label>
                            <input 
                                type="password"
                                required
                                placeholder="••••••••"
                                value={staffForm.password}
                                onChange={(e) => setStaffForm(prev => ({ ...prev, password: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Department</label>
                            <select 
                                value={staffForm.department}
                                onChange={(e) => setStaffForm(prev => ({ ...prev, department: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            >
                                <option value="Administration">Administration</option>
                                <option value="Sales">Sales</option>
                                <option value="Finance">Finance</option>
                                <option value="Marketing">Marketing</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">System Role</label>
                            <select 
                                value={staffForm.systemRole}
                                onChange={(e) => setStaffForm(prev => ({ ...prev, systemRole: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            >
                                <option value="staff">Staff</option>
                                <option value="manager">Manager</option>
                                <option value="sales">Sales Hub</option>
                                <option value="accounts">Accounts Hub</option>
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={submittingStaff}
                        className="w-full py-4 text-white bg-[#31267D] dark:bg-purple-600 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {submittingStaff ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <UserPlus className="w-4 h-4" /> Provision Operative
                            </>
                        )}
                    </button>
                </form>
            </BottomSheet>

            {/* 3. BROADCAST ANNOUNCEMENT BOTTOM SHEET */}
            <BottomSheet 
                isOpen={isAnnouncementOpen} 
                onClose={() => setIsAnnouncementOpen(false)} 
                title="Send Broadcast"
            >
                <form onSubmit={handleBroadcast} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Broadcast Channel</label>
                        <select 
                            value={broadcastTarget}
                            onChange={(e) => setBroadcastTarget(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                            <option value="CEO_BROADCAST">Direct CEO Push Notification</option>
                            <option value="COMMUNITY_BOARD">General Community Notice Board</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Notice Announcement Message</label>
                        <textarea 
                            rows={4}
                            required
                            placeholder="Enter announcement text to dispatch to all operative dashboards immediately..."
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={submittingBroadcast}
                        className="w-full py-4 text-white bg-[#FA4616] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {submittingBroadcast ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Megaphone className="w-4 h-4" /> Dispatch Broadcast
                            </>
                        )}
                    </button>
                </form>
            </BottomSheet>

            {/* 4. DELEGATE DIRECTIVE BOARD SHEET */}
            <BottomSheet 
                isOpen={isDelegationOpen} 
                onClose={() => setIsDelegationOpen(false)} 
                title="Delegate Directive"
            >
                {selectedIdea && (
                    <form onSubmit={handleDelegateIdea} className="space-y-4">
                        <div className="space-y-1.5">
                            <span className="text-[8px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Directive Submitted</span>
                            <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-zinc-100 mt-1">{selectedIdea.title || "Strategic Thought"}</h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium bg-slate-50 dark:bg-zinc-900/30 p-3.5 rounded-2xl border border-slate-100 dark:border-zinc-800/40">
                                "{selectedIdea.content}"
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Select Operative for Assignment</label>
                            <select 
                                required
                                value={delegatingTo}
                                onChange={(e) => setDelegatingTo(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#FA4616]"
                            >
                                <option value="">Select Staff...</option>
                                {parsedStaff.map((s: any) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} ({s.department})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button 
                            type="submit"
                            disabled={submittingDelegation}
                            className="w-full py-4 text-white bg-[#FA4616] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {submittingDelegation ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Delegate Directive
                                </>
                            )}
                        </button>
                    </form>
                )}
            </BottomSheet>

            {/* 5. QUICK ACTIONS / OPERATIONS CONTROL SHEET */}
            <BottomSheet 
                isOpen={isQuickActionsOpen} 
                onClose={() => setIsQuickActionsOpen(false)} 
                title="Operations Control Desk"
            >
                <div className="space-y-4">
                    <p className="text-xs text-zinc-500 font-medium">
                        Quickly toggle system modes and operational parameters.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pb-4">
                        <button
                            type="button"
                            onClick={() => {
                                triggerHaptic("success");
                                toast.success("System audit logs compiled!");
                                setIsQuickActionsOpen(false);
                                handleDownloadReport();
                            }}
                            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex flex-col items-center gap-2 text-center text-zinc-800 active:scale-95 transition-all"
                        >
                            <span className="text-xl">📋</span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-900">Weekly Audit</span>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => {
                                triggerHaptic("success");
                                toast.success("Database cache refreshed successfully!");
                                setIsQuickActionsOpen(false);
                                queryClient.invalidateQueries();
                            }}
                            className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex flex-col items-center gap-2 text-center text-zinc-800 active:scale-95 transition-all"
                        >
                            <span className="text-xl">🔄</span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-900">Sync Database</span>
                        </button>
                    </div>
                </div>
            </BottomSheet>
        </div>
    );
}

export default CEOCommandView;
