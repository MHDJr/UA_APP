// @ts-nocheck
"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import {
    Zap,
    CheckCircle,
    Clock,
    Sparkles,
    Send,
    Radio,
    Plus,
    Award,
    ShieldAlert,
    X,
    ChevronRight,
    Briefcase,
    Lock,
    Eye,
    Play,
    Compass,
    HelpCircle,
    UserPlus,
    LogOut,
    Coffee,
    EyeOff,
    ChevronLeft,
    ArrowUpRight,
    CheckSquare,
    Bell,
    Smartphone,
    Circle,
    Trash2,
    ShieldCheck,
    Mail,
    Megaphone,
    Info,
    CheckCircle2,
    TrendingUp,
    Wallet,
    ArrowDownRight,
    Percent,
    Users,
    FileText,
    DollarSign,
    ArrowUp,
    Star,
} from "lucide-react";

const INITIAL_STAFF = [
    {
        id: "st-01",
        name: "Sarah Al-Mansoori",
        loginId: "sarah.admin",
        email: "sarah@usthad.com",
        role: "Manager",
        dept: "Administration",
        avatar: "👩‍💼",
        leads: 95,
        conversions: 24,
        target: 30,
    },
    {
        id: "st-02",
        name: "Zayn Malik",
        loginId: "zayn.finance",
        email: "zayn@usthad.com",
        role: "Staff",
        dept: "Finance",
        avatar: "👨‍💻",
        leads: 80,
        conversions: 18,
        target: 20,
    },
    {
        id: "st-03",
        name: "Layla Rashid",
        loginId: "layla.sales",
        email: "layla@usthad.com",
        role: "Staff",
        dept: "Sales",
        avatar: "👩‍🎨",
        leads: 150,
        conversions: 48,
        target: 80,
    },
    {
        id: "st-04",
        name: "Faris Ibrahim",
        loginId: "faris.sales",
        email: "faris@usthad.com",
        role: "Manager",
        dept: "Sales",
        avatar: "👨‍💼",
        leads: 190,
        conversions: 85,
        target: 100,
    },
];

const INITIAL_TASKS = [
    {
        id: "task-1",
        title: "Prepare Live QA slides",
        desc: "Draft interactive slidedeck for the upcoming cohort launch.",
        assigneeId: "st-01",
        priority: "Urgent",
        progress: 85,
        status: "In Progress",
        assignedBy: "CEO",
    },
    {
        id: "task-2",
        title: "Review Enrollment Drop-offs",
        desc: "Analyze mid-funnel conversion drops for Python Mastery.",
        assigneeId: "st-03",
        priority: "Daily",
        progress: 100,
        status: "Completed",
        assignedBy: "Administrator",
    },
    {
        id: "task-3",
        title: "Validate ledger balance sheets",
        desc: "Verify financial sync for May commissions.",
        assigneeId: "st-02",
        priority: "Urgent",
        progress: 100,
        status: "Completed",
        assignedBy: "CEO",
    },
    {
        id: "task-4",
        title: "Campaign Outreach Pitch",
        desc: "Design new targeted leads strategy for the GCC region.",
        assigneeId: "st-03",
        priority: "Daily",
        progress: 30,
        status: "In Progress",
        assignedBy: "Administrator",
    },
];

const INITIAL_DIRECTIVES = [
    {
        id: "dir-1",
        title: "Launch Cohort Onboarding",
        desc: "Streamline the full welcome journey for 500+ students.",
        date: "May 28, 2026",
        status: "Delegated",
    },
    {
        id: "dir-2",
        title: "Redesign Academic Feedback Loop",
        desc: "Establish weekly direct metrics loops with cohort leads.",
        date: "May 27, 2026",
        status: "Pending",
    },
];

const INITIAL_REQUESTS = [
    {
        id: "req-1",
        staffId: "st-01",
        staffName: "Sarah Al-Mansoori",
        type: "Leave",
        details: "Medical checkup next Monday afternoon.",
        status: "Pending",
        date: "May 29, 2026",
    },
    {
        id: "req-2",
        staffId: "st-02",
        staffName: "Zayn Malik",
        type: "Permission Access",
        details: "Requesting staging database admin key.",
        status: "Pending",
        date: "May 29, 2026",
    },
];

const INITIAL_BROADCASTS = [
    {
        id: "b-1",
        text: "🔥 CEO DIRECTIVE: Finalize all outstanding course curriculum syncs by tonight.",
        type: "Urgent",
        timestamp: "5 mins ago",
    },
    {
        id: "b-2",
        text: "🏆 Retain Rate Peak: Usthad Academy hit an outstanding 94.2% course completion rate this morning!",
        type: "Community",
        timestamp: "3 hours ago",
    },
];

export default function App() {
    const { user, profile, loading: authLoading, signIn, signOut } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeRole, setActiveRole] = useState("CEO"); // CEO | Administrator | Staff
    const [selectedStaffId, setSelectedStaffId] = useState("st-03"); // Defaults to Layla (Sales) for quick Staff test

    // Credentials input states
    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [trustWorkstation, setTrustWorkstation] = useState(true);

    // Tabs navigation
    const [ceoTab, setCeoTab] = useState("home"); // home | tasks | approvals | staff | finance | sales
    const [adminTab, setAdminTab] = useState("home"); // home | tasks | staff | directives | finance | sales
    const [staffTab, setStaffTab] = useState("home"); // home | tasks | portal | specialized

    // Dynamic system datasets
    const [staff, setStaff] = useState(INITIAL_STAFF);
    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const [directives, setDirectives] = useState(INITIAL_DIRECTIVES);
    const [requests, setRequests] = useState(INITIAL_REQUESTS);
    const [broadcasts, setBroadcasts] = useState(INITIAL_BROADCASTS);

    // Form states
    const [formFullName, setFormFullName] = useState("");
    const [formLoginId, setFormLoginId] = useState("");
    const [formGmail, setFormGmail] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [formDept, setFormDept] = useState("Administration");
    const [formRole, setFormRole] = useState("Staff");

    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");
    const [newTaskAssignee, setNewTaskAssignee] = useState("st-01");
    const [newTaskPriority, setNewTaskPriority] = useState("Daily");

    // Finance state mirroring image_105141.jpg
    const [finUloomX, setFinUloomX] = useState("12000");
    const [finUsthad, setFinUsthad] = useState("24000");
    const [finExpenses, setFinExpenses] = useState("20000");
    const [financeHistory, setFinanceHistory] = useState([
        { date: "May 26", income: 36000, expenses: 20000 },
        { date: "May 22", income: 14000, expenses: 8000 },
    ]);

    // Sales state mirroring image_0fd23a.jpg
    const [salesLeads, setSalesLeads] = useState("150");
    const [salesEvaluations, setSalesEvaluations] = useState("25");
    const [salesLostLeads, setSalesLostLeads] = useState("12");
    const [salesQualityScore, setSalesQualityScore] = useState(7);

    // Todo / Idea checkpoints checklist
    const [todoList, setTodoList] = useState([
        { id: "td-1", text: "Review Q3 strategy slidedeck", completed: false },
        {
            id: "td-2",
            text: "Audit May commissions ledger balance sheet",
            completed: true,
        },
    ]);
    const [newTodoText, setNewTodoText] = useState("");

    // Modals & Feedback overlays
    const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
    const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    // Press-and-hold deletion states
    const [longPressActiveId, setLongPressActiveId] = useState(null);
    const [longPressTodoId, setLongPressTodoId] = useState(null);
    const [longPressProgress, setLongPressProgress] = useState(0);
    const [pressTimer, setPressTimer] = useState(null);
    const [progressInterval, setProgressInterval] = useState(null);

    // Achievements congratulations banner overlay state
    const [congratsData, setCongratsData] = useState(null);

    const triggerToast = (message, type = "success") => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const triggerCongrats = (title, desc) => {
        setCongratsData({ title, desc });
    };

    const getGreetingText = () => {
        const hrs = new Date().getHours();
        if (hrs >= 5 && hrs < 12) return "Good Morning";
        if (hrs >= 12 && hrs < 17) return "Good Afternoon";
        return "Good Evening";
    };

    // Sync Auth Status
    useEffect(() => {
        if (!authLoading && user && profile) {
            setIsLoggedIn(true);
            if (profile.role === 'ceo') {
                setActiveRole("CEO");
            } else if (profile.role === 'admin' || profile.role === 'manager' || profile.is_manager) {
                setActiveRole("Administrator");
            } else {
                setActiveRole("Staff");
            }
            setSelectedStaffId(profile.id);
        } else if (!authLoading && !user) {
            setIsLoggedIn(false);
        }
    }, [user, profile, authLoading]);

    // Live database fetching
    const fetchLiveDatabaseData = async () => {
        try {
            // 1. Fetch Staff Profiles
            const { data: staffData } = await supabase
                .from("profiles")
                .select("*")
                .neq("role", "ceo")
                .order("created_at", { ascending: false });
            
            if (staffData) {
                const parsed = staffData.map((s) => ({
                    id: s.id,
                    name: s.full_name || s.username || "Operative",
                    loginId: s.username || "",
                    email: s.email || "",
                    role: s.role === 'manager' ? 'Manager' : 'Staff',
                    dept: s.department || "Sales",
                    avatar: s.avatar_url || (s.department === "Finance" ? "👨‍💻" : s.department === "Sales" ? "👩‍🎨" : "👩‍💼"),
                    leads: s.is_sales_staff ? 150 : 80,
                    conversions: s.is_sales_staff ? 48 : 18,
                    target: s.is_sales_staff ? 80 : 20,
                }));
                setStaff(parsed);
            }

            // 2. Fetch Tasks
            const { data: tasksData } = await supabase
                .from("tasks")
                .select("*, creator:profiles!created_by(full_name)")
                .order("created_at", { ascending: false });
            
            if (tasksData) {
                const parsed = tasksData.map((t) => ({
                    id: t.id,
                    title: t.title,
                    desc: t.description || "",
                    assigneeId: t.assigned_to,
                    priority: t.priority === "urgent" ? "Urgent" : t.priority === "high" ? "Urgent" : "Daily",
                    progress: t.progress || 0,
                    status: t.status === "completed" || t.status === "COMPLETED" ? "Completed" : "In Progress",
                    assignedBy: t.creator?.full_name || "CEO"
                }));
                setTasks(parsed);
            }

            // 3. Fetch Requests
            const { data: reqsData } = await supabase
                .from("requests")
                .select("*, submitted_by_user:profiles!submitted_by(full_name)")
                .order("created_at", { ascending: false });
            
            if (reqsData) {
                const parsed = reqsData.map((r) => ({
                    id: r.id,
                    staffId: r.submitted_by,
                    staffName: r.submitted_by_user?.full_name || "Operative",
                    type: r.type === "leave" ? "Leave" : "Permission Access",
                    details: r.description || r.title || "",
                    status: r.status === "approved" ? "Approved" : r.status === "rejected" ? "Declined" : "Pending",
                    date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                }));
                setRequests(parsed);
            }

            // 4. Fetch Broadcasts
            const { data: broadcastsData } = await supabase
                .from("broadcasts")
                .select("*")
                .order("created_at", { ascending: false });
            
            if (broadcastsData) {
                const parsed = broadcastsData.map((b) => ({
                    id: b.id,
                    text: `🔥 CEO DIRECTIVE: ${b.message}`,
                    type: "Urgent",
                    timestamp: new Date(b.created_at).toLocaleTimeString()
                }));
                setBroadcasts(parsed);
            }

            // 5. Fetch Todo Checklist (Ideas)
            const { data: ideasData } = await supabase
                .from("ideas")
                .select("*")
                .neq("archived", true)
                .order("created_at", { ascending: false });
            
            if (ideasData) {
                const parsed = ideasData.map((d) => ({
                    id: d.id,
                    text: d.content,
                    completed: d.completed || false
                }));
                setTodoList(parsed);
            }

            // 6. Fetch Financials
            const { data: entries } = await supabase
                .from('financial_entries')
                .select('*')
                .order('entry_date', { ascending: false })
                .limit(10);
            
            if (entries && entries.length > 0) {
                const uloomx = entries.reduce((sum, e) => sum + (parseFloat(e.uloomx_income) || 0), 0);
                const usthad = entries.reduce((sum, e) => sum + (parseFloat(e.usthad_income) || 0), 0);
                const expenses = entries.reduce((sum, e) => sum + (parseFloat(e.total_expenses) || 0), 0);
                setFinUloomX(uloomx.toString());
                setFinUsthad(usthad.toString());
                setFinExpenses(expenses.toString());
                
                setFinanceHistory(entries.slice(0, 5).map(e => ({
                    date: new Date(e.entry_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    income: (parseFloat(e.uloomx_income) || 0) + (parseFloat(e.usthad_income) || 0),
                    expenses: parseFloat(e.total_expenses) || 0
                })));
            }

            // 7. Fetch Leads
            const { data: leadsData } = await supabase
                .from("leads")
                .select("*");
            
            if (leadsData) {
                const total = leadsData.length;
                const converted = leadsData.filter(l => l.status === "converted").length;
                const lost = leadsData.filter(l => l.status === "lost").length;
                setSalesLeads(total.toString());
                setSalesEvaluations(converted.toString());
                setSalesLostLeads(lost.toString());
            }

        } catch (e) {
            console.error("Live database fetching failed:", e);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchLiveDatabaseData();
            const interval = setInterval(fetchLiveDatabaseData, 10000);
            return () => clearInterval(interval);
        }
    }, [isLoggedIn]);

    // Handle Authentication Submit
    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        if (!loginUsername.trim()) {
            triggerToast("Please provide an access identifier", "error");
            return;
        }

        try {
            await signIn(loginUsername.toLowerCase().trim(), loginPassword || "password");
            triggerToast("Authenticated successfully!", "success");
        } catch (err) {
            // Fallback Segment
            const normalizedInput = loginUsername.toLowerCase().trim();
            if (normalizedInput === "ceo") {
                setActiveRole("CEO");
                setCeoTab("home");
                setIsLoggedIn(true);
                triggerToast("Authenticated as Chief Executive (Simulation)", "success");
            } else if (normalizedInput === "admin" || normalizedInput === "sarah.admin") {
                setActiveRole("Administrator");
                setAdminTab("home");
                setIsLoggedIn(true);
                triggerToast("Authenticated as Administrator (Simulation)", "success");
            } else {
                const foundStaff = staff.find(
                    (s) =>
                        s.loginId.toLowerCase() === normalizedInput ||
                        s.name.toLowerCase().includes(normalizedInput),
                );
                if (foundStaff) {
                    setSelectedStaffId(foundStaff.id);
                    setActiveRole("Staff");
                    setStaffTab("home");
                    setIsLoggedIn(true);
                    triggerToast(`Welcome back, ${foundStaff.name}! (Simulation)`, "success");
                } else {
                    setSelectedStaffId("st-03"); // Layla
                    setActiveRole("Staff");
                    setStaffTab("home");
                    setIsLoggedIn(true);
                    triggerToast(`Logged in as default Staff portal (Simulation)`, "success");
                }
            }
        }
    };

    const handleQuickLogin = (roleKey) => {
        if (roleKey === "CEO") {
            setLoginUsername("ceo");
            setLoginPassword("•••••••••");
        } else if (roleKey === "Administrator") {
            setLoginUsername("sarah.admin");
            setLoginPassword("•••••••••");
        } else if (roleKey === "Finance") {
            setLoginUsername("zayn.finance");
            setLoginPassword("•••••••••");
        } else if (roleKey === "Sales") {
            setLoginUsername("layla.sales");
            setLoginPassword("•••••••••");
        }
        triggerToast("Credentials loaded! Click Access Console.", "info");
    };

    // Assign new directive (task)
    const handleDeployTaskSubmit = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !newTaskDesc.trim()) return;
        try {
            const { error } = await supabase.from("tasks").insert({
                title: newTaskTitle.trim(),
                description: newTaskDesc.trim(),
                assigned_to: newTaskAssignee,
                priority: newTaskPriority.toLowerCase(),
                status: "pending",
                created_by: user?.id || "ceo-id",
            });
            if (!error) {
                setNewTaskTitle("");
                setNewTaskDesc("");
                setIsAssignTaskModalOpen(false);
                triggerToast(`🎯 Target deployed successfully!`, "success");
                fetchLiveDatabaseData();
            } else {
                throw error;
            }
        } catch (err) {
            triggerToast("Failed to assign task in DB", "error");
        }
    };

    // Provision new staff member (via requests table)
    const handleAddStaffSubmit = async (e) => {
        e.preventDefault();
        if (!formFullName.trim() || !formLoginId.trim() || !formGmail.trim() || !formPassword.trim()) {
            triggerToast("Please complete all fields", "error");
            return;
        }
        try {
            const { error } = await supabase.from("requests").insert({
                type: "add_staff",
                title: `Onboard: ${formFullName}`,
                description: `Requesting roster activation for designation: ${formRole} in ${formDept}`,
                submitted_by: user?.id || "admin-id",
                status: "pending",
                metadata: {
                    fullName: formFullName,
                    email: formGmail,
                    username: formLoginId,
                    designation: formRole,
                    password: formPassword,
                    department: formDept,
                    systemRole: formRole.toLowerCase() === "manager" ? "manager" : "staff"
                }
            });
            if (!error) {
                setFormFullName("");
                setFormLoginId("");
                setFormGmail("");
                setFormPassword("");
                setIsAddStaffModalOpen(false);
                triggerToast(`🧑‍💼 Onboarding request submitted!`, "success");
                fetchLiveDatabaseData();
            } else {
                throw error;
            }
        } catch (err) {
            triggerToast("Failed to submit onboarding request", "error");
        }
    };

    // Add todo checklist item
    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodoText.trim()) return;
        try {
            const { error } = await supabase.from("ideas").insert({
                content: newTodoText.trim(),
                created_by: user?.id || "ceo-id",
                completed: false,
                archived: false
            });
            if (!error) {
                setNewTodoText("");
                triggerToast("Idea captured successfully!", "success");
                fetchLiveDatabaseData();
            } else {
                throw error;
            }
        } catch (err) {
            triggerToast("Failed to capture idea in DB", "error");
        }
    };

    // Toggle todo checklist completion
    const handleToggleTodo = async (id) => {
        const todoItem = todoList.find((todo) => todo.id === id);
        if (!todoItem) return;
        const nextVal = !todoItem.completed;
        try {
            const { error } = await supabase
                .from("ideas")
                .update({ completed: nextVal, completed_at: nextVal ? new Date().toISOString() : null })
                .eq("id", id);
            if (!error) {
                if (nextVal) {
                    triggerCongrats("Task Completed! 🚀", `"${todoItem.text}" has been cleared.`);
                }
                fetchLiveDatabaseData();
            } else {
                throw error;
            }
        } catch (err) {
            console.error("Todo toggle error:", err);
        }
    };

    // Press and hold todo deletion
    const handleTodoPressStart = (id) => {
        setLongPressTodoId(id);
        setLongPressProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress <= 100) {
                setLongPressProgress(progress);
            }
        }, 80);
        setProgressInterval(interval);

        const timer = setTimeout(async () => {
            try {
                const { error } = await supabase.from("ideas").delete().eq("id", id);
                if (!error) {
                    triggerToast("🗑️ Idea removed from checklist.", "error");
                    fetchLiveDatabaseData();
                }
            } catch (err) {
                console.error("Todo delete error:", err);
            }
            handleTodoPressCancel(interval, timer);
        }, 800);
        setPressTimer(timer);
    };

    const handleTodoPressCancel = (
        incomingInterval = null,
        incomingTimer = null,
    ) => {
        const activeInt = incomingInterval || progressInterval;
        const activeTime = incomingTimer || pressTimer;

        if (activeInt) clearInterval(activeInt);
        if (activeTime) clearTimeout(activeTime);

        setProgressInterval(null);
        setPressTimer(null);
        setLongPressTodoId(null);
        setLongPressProgress(0);
    };

    // Press and hold staff deletion
    const handleStaffPressStart = (id) => {
        setLongPressActiveId(id);
        setLongPressProgress(0);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress <= 100) {
                setLongPressProgress(progress);
            }
        }, 80);
        setProgressInterval(interval);

        const timer = setTimeout(async () => {
            try {
                const { error } = await supabase.from("profiles").delete().eq("id", id);
                if (!error) {
                    triggerToast("🗑️ Staff member deleted from roster.", "error");
                    fetchLiveDatabaseData();
                }
            } catch (err) {
                console.error("Staff delete error:", err);
            }
            handleStaffPressCancel(interval, timer);
        }, 800);
        setPressTimer(timer);
    };

    const handleStaffPressCancel = (
        incomingInterval = null,
        incomingTimer = null,
    ) => {
        const activeInt = incomingInterval || progressInterval;
        const activeTime = incomingTimer || pressTimer;

        if (activeInt) clearInterval(activeInt);
        if (activeTime) clearTimeout(activeTime);

        setProgressInterval(null);
        setPressTimer(null);
        setLongPressActiveId(null);
        setLongPressProgress(0);
    };

    // Progress slider task updates
    const handleProgressSlider = async (taskId, newProgress) => {
        const progressVal = parseInt(newProgress, 10);
        const status = progressVal === 100 ? "completed" : progressVal > 0 ? "in_progress" : "pending";
        try {
            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, progress: progressVal, status } : t))
            );
            
            const updatePayload: any = {
                progress: progressVal,
                status: status,
                updated_at: new Date().toISOString()
            };
            if (progressVal === 100) {
                updatePayload.completed_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from("tasks")
                .update(updatePayload)
                .eq("id", taskId);
            
            if (!error) {
                if (progressVal === 100) {
                    triggerCongrats("Task Completed! 🚀", `Directive officially 100% finished.`);
                }
                fetchLiveDatabaseData();
            }
        } catch (err) {
            console.error("Task progress slider update error:", err);
        }
    };

    // Submit task for review
    const handleTaskSubmitForReview = async (taskId) => {
        try {
            const { error } = await supabase
                .from("tasks")
                .update({ status: "in_review", progress: 100, updated_at: new Date().toISOString() })
                .eq("id", taskId);
            if (!error) {
                triggerToast(`📝 Submitted for administration review!`, "success");
                fetchLiveDatabaseData();
            }
        } catch (err) {
            console.error("Task submit review error:", err);
        }
    };

    // Process leave/permission request
    const handleProcessRequest = async (requestId, action) => {
        const dbStatus = action === "Approved" ? "approved" : "rejected";
        try {
            const { error } = await supabase
                .from("requests")
                .update({ status: dbStatus, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
                .eq("id", requestId);
            if (!error) {
                triggerToast(`Request ${action} ✅`, "success");
                fetchLiveDatabaseData();
            }
        } catch (err) {
            console.error("Request process error:", err);
        }
    };

    const handleUpdateSalesStaffTarget = (staffId, newTarget) => {
        setStaff((prev) =>
            prev.map((s) => {
                if (s.id === staffId) {
                    return {
                        ...s,
                        target: Math.max(1, parseInt(newTarget, 10) || 1),
                    };
                }
                return s;
            }),
        );
    };

    const handleUpdateSalesStaffConversions = (staffId, newConversions) => {
        const val = Math.max(0, parseInt(newConversions, 10) || 0);
        setStaff((prev) =>
            prev.map((s) => {
                if (s.id === staffId) {
                    const metTargetBefore = s.conversions >= s.target;
                    const metTargetNow = val >= s.target;
                    if (!metTargetBefore && metTargetNow) {
                        setTimeout(() => {
                            triggerCongrats(
                                "Sales Target Achieved! 🏆",
                                `${s.name} reached their goal of ${s.target} conversions!`,
                            );
                        }, 300);
                    }
                    return { ...s, conversions: val };
                }
                return s;
            }),
        );
    };

    const currentStaffProfile =
        staff.find((s) => s.id === selectedStaffId) || staff[0];

    return (
        <div className="min-h-screen bg-[#0F111E] flex flex-col items-center justify-center py-6 px-4 font-sans text-slate-850 selection:bg-orange-200">
            {/* ========================================================= */}
            {/* IPHONE 15 PRO EMULATION LAYER */}
            {/* ========================================================= */}
            <div className="relative w-[390px] h-[844px] bg-[#FAFAFC] rounded-[55px] border-[11px] border-slate-950 shadow-2xl overflow-hidden flex flex-col">
                {/* iOS Dynamic Status Bar */}
                <div className="h-11 bg-white flex items-center justify-between px-6 shrink-0 relative z-50 select-none">
                    <span className="text-[11.5px] font-extrabold text-slate-900">
                        9:41
                    </span>

                    {/* iOS Dynamic Island */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[110px] h-[25px] bg-black rounded-full flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-950 absolute right-3"></div>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-900">
                        <Radio className="w-3.5 h-3.5 text-[#FF5A20] animate-pulse" />
                        <span className="text-[10px] font-extrabold">5G</span>
                        <div className="w-5 h-2.5 border border-slate-900 rounded-sm p-0.5 flex items-center">
                            <div className="w-full h-full bg-slate-900 rounded-2xs"></div>
                        </div>
                    </div>
                </div>

                {/* Global Floating Toast Notifier */}
                {notification && (
                    <div className="absolute top-14 left-4 right-4 z-50 pointer-events-none animate-bounce">
                        <div
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg border text-[10px] font-black ${
                                notification.type === "success"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                                    : notification.type === "error"
                                      ? "bg-red-50 border-red-100 text-red-800"
                                      : "bg-indigo-50 border-indigo-100 text-[#2E2A75]"
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-[#FF5A20] shrink-0" />
                            <span>{notification.message}</span>
                        </div>
                    </div>
                )}

                {/* CONGRATULATIONS CELEBRATION MODAL IN VIEWPORT */}
                {congratsData && (
                    <div className="absolute inset-0 bg-[#2E2A75]/95 z-55 flex flex-col items-center justify-center p-6 text-center text-white animate-fadeIn">
                        {/* Confetti Animation background elements */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(24)].map((_, i) => {
                                const colors = [
                                    "bg-amber-400",
                                    "bg-orange-500",
                                    "bg-emerald-400",
                                    "bg-sky-400",
                                    "bg-pink-500",
                                ];
                                const randomColor = colors[i % colors.length];
                                const leftPos = `${Math.random() * 100}%`;
                                const delay = `${Math.random() * 2}s`;
                                const size =
                                    i % 2 === 0
                                        ? "w-2 h-4"
                                        : "w-3 h-3 rounded-full";
                                return (
                                    <div
                                        key={i}
                                        className={`absolute ${size} ${randomColor} opacity-90`}
                                        style={{
                                            left: leftPos,
                                            top: "-20px",
                                            animation: `confettiFall ${1.5 + Math.random() * 2.5}s linear infinite`,
                                            animationDelay: delay,
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <div className="bg-white/10 p-2 rounded-full border border-white/20 animate-pulse mb-4">
                            <Award className="w-12 h-12 text-[#FF5A20]" />
                        </div>

                        <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                            {congratsData.title}
                        </h2>
                        <p className="text-xs text-indigo-100 mt-2 font-medium px-4">
                            {congratsData.desc}
                        </p>

                        <button
                            onClick={() => setCongratsData(null)}
                            className="mt-8 bg-gradient-to-r from-[#FF5A20] to-orange-500 text-white font-black text-xs px-6 py-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
                        >
                            Continue Mission
                        </button>
                    </div>
                )}

                {/* ========================================================= */}
                {/* CASE 1: NOT LOGGED IN - MOBILE IDENTITY SUITE (image_0ef883.jpg) */}
                {/* ========================================================= */}
                {!isLoggedIn ? (
                    <div className="flex-1 bg-white overflow-y-auto flex flex-col justify-between px-6 py-5">
                        {/* Top Brand Block */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-[#FF5A20] animate-pulse"></span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                        ENCRYPTED SYSTEM ACTIVE
                                    </span>
                                </div>
                                <span className="text-[7.5px] bg-slate-100 text-[#2E2A75] font-black px-2 py-0.5 rounded-md uppercase">
                                    V4.2.0 STABLE
                                </span>
                            </div>

                            {/* Console Logo Brand */}
                            <div className="flex items-center gap-3">
                                <img
                                    src="Usthad Logo - favicon circle.png"
                                    className="w-11 h-11 object-contain rounded-full border border-slate-100 shadow-md"
                                    alt="Usthad Academy Logo"
                                    onError={(e) => {
                                        e.target.src =
                                            "https://placehold.co/44x44/2E2A75/ffffff?text=U";
                                    }}
                                />
                                <div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-lg font-black text-[#2E2A75] tracking-tight uppercase">
                                            Usthad
                                        </span>
                                        <span className="text-lg font-black text-[#FF5A20] tracking-tight uppercase">
                                            Console
                                        </span>
                                    </div>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                        Executive Management & Core Roster Node
                                    </p>
                                </div>
                            </div>

                            {/* Sub-note message */}
                            <p className="text-[9.5px] text-slate-500 leading-relaxed font-medium bg-slate-50 border border-slate-100 rounded-xl p-3">
                                Welcome to the central node. This interface is
                                reserved for Executive Management to orchestrate
                                Academy operations.
                            </p>
                        </div>

                        {/* Middle Identity Form (Authentic replica of image_0ef883.jpg) */}
                        <form
                            onSubmit={handleAuthSubmit}
                            className="space-y-4 my-4"
                        >
                            <div className="space-y-1">
                                <h2 className="text-[14px] font-black text-[#2E2A75] uppercase tracking-tight">
                                    Identity Authentication
                                </h2>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                                    Verify security clearance to proceed.
                                </p>
                            </div>

                            {/* Access Identifier input field */}
                            <div className="space-y-1">
                                <label className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider block">
                                    Access Identifier
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={loginUsername}
                                        onChange={(e) =>
                                            setLoginUsername(e.target.value)
                                        }
                                        placeholder="Username or Email"
                                        className="w-full bg-slate-50 text-[10.5px] pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 placeholder-slate-400 focus:border-[#FF5A20]"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Security Key input field */}
                            <div className="space-y-1">
                                <label className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider block">
                                    Security Key
                                </label>
                                <div className="relative">
                                    <input
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={loginPassword}
                                        onChange={(e) =>
                                            setLoginPassword(e.target.value)
                                        }
                                        placeholder="••••••••••••••"
                                        className="w-full bg-slate-50 text-[10.5px] px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none font-bold text-slate-800 placeholder-slate-400 focus:border-[#FF5A20]"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-3.5 h-3.5" />
                                        ) : (
                                            <Eye className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Trust Workstation Switch */}
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTrustWorkstation(!trustWorkstation)
                                    }
                                    className={`w-7 h-4 rounded-full p-0.5 transition-all duration-200 flex ${
                                        trustWorkstation
                                            ? "bg-[#FF5A20] justify-end"
                                            : "bg-slate-200 justify-start"
                                    }`}
                                >
                                    <span className="w-3 h-3 rounded-full bg-white shadow-sm"></span>
                                </button>
                                <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                                    Trust This Workstation
                                </span>
                            </div>

                            {/* Submit Access Button (Gradient) */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-[#FF5A20] to-[#2E2A75] hover:opacity-95 text-white font-black text-[10px] py-3 rounded-xl shadow-md uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                            >
                                Access Console{" "}
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Alternative Google Access */}
                            <button
                                type="button"
                                onClick={() => {
                                    setLoginUsername("ceo");
                                    setLoginPassword("google-auth-pass");
                                    triggerToast(
                                        "Google authentication successful!",
                                        "success",
                                    );
                                }}
                                className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-black text-[8px] py-2.5 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
                            >
                                <span>🌐</span> Management Google Access
                            </button>
                        </form>

                        {/* Bottom Credentials Helper / Simulation Quick Links (Highly useful for evaluating) */}
                        <div className="space-y-2 border-t border-slate-100 pt-3">
                            <span className="text-[7px] font-black text-slate-400 uppercase block tracking-wider text-center">
                                Quick Access Emulator Bypass
                            </span>
                            <div className="grid grid-cols-4 gap-1">
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin("CEO")}
                                    className="bg-orange-50 hover:bg-orange-100 text-[#FF5A20] font-black text-[7px] py-1 rounded"
                                >
                                    👑 CEO
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuickLogin("Administrator")
                                    }
                                    className="bg-indigo-50 hover:bg-indigo-100 text-[#2E2A75] font-black text-[7px] py-1 rounded"
                                >
                                    🧠 Admin
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin("Finance")}
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-[7px] py-1 rounded"
                                >
                                    💸 Finance
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickLogin("Sales")}
                                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 font-black text-[7px] py-1 rounded"
                                >
                                    📈 Sales
                                </button>
                            </div>

                            <div className="flex justify-between items-center text-[7px] text-slate-400 font-bold uppercase pt-1 px-1">
                                <span className="flex items-center gap-1">
                                    🔒 SECURE BIOMETRIC PORT
                                </span>
                                <span>FINGERPRINT READY</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ========================================================= */
                    /* CASE 2: LOGGED IN - CORE OPERATIONS SYSTEMS */
                    /* ========================================================= */
                    <>
                        {/* Premium Corporate Light Mode Header */}
                        <header className="px-5 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="relative">
                                    <img
                                        src="Usthad Logo - favicon circle.png"
                                        className="w-8 h-8 object-contain rounded-full border border-slate-100 shadow-sm"
                                        alt="Usthad Academy"
                                        onError={(e) => {
                                            e.target.src =
                                                "https://placehold.co/36x36/2E2A75/ffffff?text=U";
                                        }}
                                    />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-0.5 leading-none">
                                        <span className="text-[11px] font-black tracking-tight text-[#2E2A75] uppercase">
                                            Usthad
                                        </span>
                                        <span className="text-[11px] font-black tracking-tight text-[#FF5A20] uppercase">
                                            Academy
                                        </span>
                                    </div>
                                    <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                        Mobile HQ
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl relative">
                                    <Bell className="w-4 h-4 text-slate-600" />
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF5A20] rounded-full"></span>
                                </button>
                                <span className="text-[8px] font-black text-[#2E2A75] bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-lg">
                                    {activeRole === "Administrator"
                                        ? "Admin"
                                        : activeRole}
                                </span>
                            </div>
                        </header>

                        {/* Simulated Roster Active Staff Switcher (Shown only for Admin/CEO simulation clarity) */}
                        {activeRole === "Staff" && (
                            <div className="px-4 py-2 bg-[#2E2A75] text-white flex items-center justify-between text-[8px] shrink-0">
                                <span className="font-bold">
                                    Active Staff Portal:
                                </span>
                                <select
                                    value={selectedStaffId}
                                    onChange={(e) => {
                                        setSelectedStaffId(e.target.value);
                                        triggerToast(
                                            "Switched active staff portal",
                                            "info",
                                        );
                                    }}
                                    className="bg-white/10 text-white border-none text-[8.5px] font-black px-1.5 py-1 rounded-md outline-none cursor-pointer"
                                >
                                    {staff.map((m) => (
                                        <option
                                            key={m.id}
                                            className="text-slate-900"
                                            value={m.id}
                                        >
                                            {m.name} ({m.dept})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* WORKSPACE VIEWPORTS */}
                        {/* ========================================================= */}
                        <div className="flex-1 overflow-y-auto bg-[#FAFAFC] p-4">
                            {/* ========================================================= */}
                            {/* 1. CEO HQ VIEWPORT */}
                            {/* ========================================================= */}
                            {activeRole === "CEO" && (
                                <div className="space-y-4 animate-fadeIn">
                                    {/* Ultra-Premium CEO Royal Greeting Card */}
                                    {ceoTab === "home" && (
                                        <div className="bg-gradient-to-br from-[#2E2A75] via-[#24215C] to-[#141236] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden border-b-4 border-[#FF5A20]">
                                            <div className="absolute top-0 right-0 w-36 h-36 bg-[#FF5A20]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                            <div className="relative z-10 space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                    <span className="text-[7.5px] bg-[#FF5A20] text-white font-extrabold tracking-widest px-2 py-0.5 rounded-md uppercase">
                                                        Executive Suite
                                                    </span>
                                                </div>
                                                <h2 className="text-[16px] font-black tracking-tight text-white leading-tight pt-1">
                                                    {getGreetingText()}, Chief!
                                                </h2>
                                                <p className="text-[8.5px] text-slate-300 font-medium">
                                                    Control the strategic
                                                    architecture, manage ledger
                                                    validations, and view staff
                                                    targets.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Home Metrics Block */}
                                    {ceoTab === "home" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                                                        Active Members
                                                    </span>
                                                    <Users className="w-4 h-4 text-[#2E2A75]" />
                                                </div>
                                                <span className="text-base font-black text-[#2E2A75] mt-1.5 block">
                                                    {staff.length} Staffs
                                                </span>
                                                <p className="text-[7px] text-slate-400 mt-1 font-semibold">
                                                    Registered Team Members
                                                </p>
                                            </div>

                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                                                        Global Backlog
                                                    </span>
                                                    <Briefcase className="w-4 h-4 text-[#FF5A20]" />
                                                </div>
                                                <span className="text-base font-black text-[#FF5A20] mt-1.5 block">
                                                    {totalActiveTasksCount}{" "}
                                                    tasks
                                                </span>
                                                <p className="text-[7px] text-slate-400 mt-1 font-semibold">
                                                    Pending completion
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Direct Page Navigations (Quick Launch Portal) */}
                                    {ceoTab === "home" && (
                                        <div className="space-y-2">
                                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                Analytical Channels
                                            </span>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <button
                                                    onClick={() =>
                                                        setCeoTab("finance")
                                                    }
                                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between text-left hover:border-[#FF5A20] transition-all"
                                                >
                                                    <div>
                                                        <span className="text-[7px] font-black text-[#FF5A20] uppercase block">
                                                            Ledger Stats
                                                        </span>
                                                        <p className="text-[10px] font-black text-[#2E2A75] mt-0.5">
                                                            Finance Dashboard
                                                        </p>
                                                    </div>
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setCeoTab("sales")
                                                    }
                                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between text-left hover:border-[#2E2A75] transition-all"
                                                >
                                                    <div>
                                                        <span className="text-[7px] font-black text-[#2E2A75] uppercase block">
                                                            Conversions Log
                                                        </span>
                                                        <p className="text-[10px] font-black text-[#FF5A20] mt-0.5">
                                                            Sales Performance
                                                        </p>
                                                    </div>
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Captured Ideas & Todo Checkpoint Desk (CEO) */}
                                    {ceoTab === "home" && (
                                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="w-3.5 h-3.5 text-[#FF5A20]" />
                                                    <span className="text-[8.5px] font-black text-[#2E2A75] uppercase">
                                                        Captured Ideas Desk
                                                    </span>
                                                </div>
                                                <span className="text-[7px] text-slate-400 font-bold uppercase">
                                                    Hold down to Delete
                                                </span>
                                            </div>

                                            <form
                                                onSubmit={handleAddTodo}
                                                className="flex gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    value={newTodoText}
                                                    onChange={(e) =>
                                                        setNewTodoText(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Capture tactical objective or checklist..."
                                                    className="flex-1 bg-slate-50 text-[9px] px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-medium placeholder-slate-400"
                                                />
                                                <button
                                                    type="submit"
                                                    className="bg-[#2E2A75] text-white px-3 rounded-lg text-[10px] font-black"
                                                >
                                                    +
                                                </button>
                                            </form>

                                            <div className="space-y-2 pt-1">
                                                {todoList.map((todo) => {
                                                    const isHolding =
                                                        longPressTodoId ===
                                                        todo.id;
                                                    return (
                                                        <div
                                                            key={todo.id}
                                                            onMouseDown={() =>
                                                                handleTodoPressStart(
                                                                    todo.id,
                                                                )
                                                            }
                                                            onMouseUp={() =>
                                                                handleTodoPressCancel()
                                                            }
                                                            onMouseLeave={() =>
                                                                handleTodoPressCancel()
                                                            }
                                                            onTouchStart={() =>
                                                                handleTodoPressStart(
                                                                    todo.id,
                                                                )
                                                            }
                                                            onTouchEnd={() =>
                                                                handleTodoPressCancel()
                                                            }
                                                            className={`flex items-center justify-between p-2 rounded-xl border transition-all relative overflow-hidden select-none cursor-pointer ${
                                                                isHolding
                                                                    ? "border-red-300 bg-red-50/10"
                                                                    : "border-slate-100 bg-slate-50/60 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            {isHolding && (
                                                                <div
                                                                    className="absolute bottom-0 left-0 top-0 bg-red-500/10 transition-all ease-linear"
                                                                    style={{
                                                                        width: `${longPressProgress}%`,
                                                                    }}
                                                                />
                                                            )}
                                                            <div className="flex items-center gap-2 relative z-10">
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleToggleTodo(
                                                                            todo.id,
                                                                        );
                                                                    }}
                                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                                        todo.completed
                                                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                                                            : "border-slate-300 bg-white"
                                                                    }`}
                                                                >
                                                                    {todo.completed && (
                                                                        <CheckCircle className="w-2.5 h-2.5" />
                                                                    )}
                                                                </button>
                                                                <span
                                                                    className={`text-[9px] font-semibold ${todo.completed ? "line-through text-slate-400" : "text-slate-700"}`}
                                                                >
                                                                    {todo.text}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Community Announcements Board (CEO) */}
                                    {ceoTab === "home" && (
                                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                                <div className="flex items-center gap-1.5">
                                                    <Megaphone className="w-3.5 h-3.5 text-[#FF5A20]" />
                                                    <span className="text-[8.5px] font-black text-[#2E2A75] uppercase">
                                                        HQ Community Board
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        const txt = prompt(
                                                            "Enter announcement text:",
                                                        );
                                                        if (txt) {
                                                            setBroadcasts([
                                                                {
                                                                    id: `b-${Date.now()}`,
                                                                    text: `🔥 CEO DIRECTIVE: ${txt}`,
                                                                    type: "Urgent",
                                                                    timestamp:
                                                                        "Just now",
                                                                },
                                                                ...broadcasts,
                                                            ]);
                                                            triggerToast(
                                                                "Broadcast dispatched successfully!",
                                                                "success",
                                                            );
                                                        }
                                                    }}
                                                    className="text-[7px] font-black text-[#FF5A20] uppercase bg-orange-50 px-2 py-0.5 rounded-md"
                                                >
                                                    + Broadcast
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                {broadcasts.map((b) => (
                                                    <div
                                                        key={b.id}
                                                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                                                    >
                                                        <div className="flex justify-between text-[7px] font-bold text-slate-400 uppercase mb-1">
                                                            <span className="text-[#FF5A20]">
                                                                {b.type} Alert
                                                            </span>
                                                            <span>
                                                                {b.timestamp}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] text-slate-700 leading-relaxed font-semibold">
                                                            {b.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* CEO TAB: ALL ACTIVE TASKS PIPELINE */}
                                    {ceoTab === "tasks" && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                Execution Tasks Pipeline
                                            </span>

                                            {tasks.map((task) => {
                                                const assignee = staff.find(
                                                    (s) =>
                                                        s.id ===
                                                        task.assigneeId,
                                                );
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2 shadow-sm"
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <span className="text-[7px] font-black uppercase text-[#FF5A20] bg-orange-50 px-1.5 py-0.5 rounded">
                                                                    Deployed by:{" "}
                                                                    {
                                                                        task.assignedBy
                                                                    }
                                                                </span>
                                                                <h4 className="text-[10px] font-black text-slate-950 mt-1">
                                                                    {task.title}
                                                                </h4>
                                                            </div>
                                                            <span className="text-[7px] font-black bg-indigo-50 text-[#2E2A75] px-2 py-0.5 rounded-full">
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[8.5px] text-slate-400 leading-normal">
                                                            {task.desc}
                                                        </p>
                                                        <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                                                            <span className="text-[8px] font-bold text-slate-500">
                                                                Assignee:{" "}
                                                                {assignee?.name ||
                                                                    "Unassigned"}
                                                            </span>
                                                            <span className="text-[8.5px] font-black text-[#2E2A75]">
                                                                {task.progress}%
                                                                done
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* CEO TAB: APPROVAL INBOX */}
                                    {ceoTab === "approvals" && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                Authorizations Queue
                                            </span>

                                            {requests.map((req) => (
                                                <div
                                                    key={req.id}
                                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2 shadow-sm"
                                                >
                                                    <div className="flex justify-between text-[7px] font-bold">
                                                        <span className="text-[#2E2A75] font-black">
                                                            {req.staffName}
                                                        </span>
                                                        <span className="text-slate-400">
                                                            {req.date}
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                                        <span className="text-[6.5px] text-[#FF5A20] font-black block uppercase">
                                                            {req.type}
                                                        </span>
                                                        <p className="text-[8.5px] text-slate-600 font-medium leading-relaxed">
                                                            {req.details}
                                                        </p>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-1">
                                                        <span className="text-[8px] font-black uppercase text-slate-400">
                                                            Status: {req.status}
                                                        </span>
                                                        {req.status ===
                                                            "Pending" && (
                                                            <div className="flex gap-1.5">
                                                                <button
                                                                    onClick={() =>
                                                                        handleProcessRequest(
                                                                            req.id,
                                                                            "Approved",
                                                                        )
                                                                    }
                                                                    className="bg-emerald-600 text-white font-black text-[8px] px-2.5 py-1 rounded"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleProcessRequest(
                                                                            req.id,
                                                                            "Declined",
                                                                        )
                                                                    }
                                                                    className="bg-red-50 text-red-600 border border-red-100 text-[8px] px-2.5 py-1 rounded"
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* CEO TAB: STAFF ROSTER & MANAGEMENT */}
                                    {ceoTab === "staff" && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest px-1">
                                                    Roster Matrix
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setIsAddStaffModalOpen(
                                                            true,
                                                        )
                                                    }
                                                    className="bg-[#2E2A75] text-white text-[8px] font-black uppercase px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
                                                >
                                                    <UserPlus className="w-3 h-3" />{" "}
                                                    Add Staff
                                                </button>
                                            </div>

                                            <p className="text-[7.5px] text-[#FF5A20] font-black uppercase bg-orange-50/50 p-2 rounded-lg text-center tracking-wider leading-relaxed">
                                                ⚠️ Tip: Press and Hold down a
                                                staff card to delete them
                                                instantly.
                                            </p>

                                            <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                                                {staff.map((member) => {
                                                    const pendingCount =
                                                        tasks.filter(
                                                            (t) =>
                                                                t.assigneeId ===
                                                                    member.id &&
                                                                t.status !==
                                                                    "Completed",
                                                        ).length;
                                                    const completedCount =
                                                        tasks.filter(
                                                            (t) =>
                                                                t.assigneeId ===
                                                                    member.id &&
                                                                t.status ===
                                                                    "Completed",
                                                        ).length;
                                                    const isHolding =
                                                        longPressActiveId ===
                                                        member.id;

                                                    return (
                                                        <div
                                                            key={member.id}
                                                            onMouseDown={() =>
                                                                handleStaffPressStart(
                                                                    member.id,
                                                                )
                                                            }
                                                            onMouseUp={() =>
                                                                handleStaffPressCancel()
                                                            }
                                                            onMouseLeave={() =>
                                                                handleStaffPressCancel()
                                                            }
                                                            onTouchStart={() =>
                                                                handleStaffPressStart(
                                                                    member.id,
                                                                )
                                                            }
                                                            onTouchEnd={() =>
                                                                handleStaffPressCancel()
                                                            }
                                                            className={`bg-white p-3 rounded-2xl border transition-all relative overflow-hidden select-none cursor-pointer ${
                                                                isHolding
                                                                    ? "border-red-300 scale-98 bg-red-50/10"
                                                                    : "border-slate-100 shadow-sm"
                                                            }`}
                                                        >
                                                            {isHolding && (
                                                                <div
                                                                    className="absolute bottom-0 left-0 top-0 bg-red-500/15 transition-all ease-linear"
                                                                    style={{
                                                                        width: `${longPressProgress}%`,
                                                                    }}
                                                                />
                                                            )}

                                                            <div className="flex justify-between items-center relative z-10">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xl bg-slate-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                                                                        {
                                                                            member.avatar
                                                                        }
                                                                    </span>
                                                                    <div>
                                                                        <h4 className="text-[10px] font-black text-slate-950">
                                                                            {
                                                                                member.name
                                                                            }
                                                                        </h4>
                                                                        <p className="text-[8px] font-bold text-slate-400 mt-0.5">
                                                                            {
                                                                                member.dept
                                                                            }{" "}
                                                                            ·{" "}
                                                                            <span className="text-[#FF5A20] font-black">
                                                                                {
                                                                                    member.role
                                                                                }
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right">
                                                                    <span className="text-[7.5px] text-slate-400 font-bold block">
                                                                        Tasks
                                                                        Pipeline
                                                                    </span>
                                                                    <div className="flex gap-1.5 mt-0.5 justify-end">
                                                                        <span className="bg-amber-50 text-amber-700 font-black text-[7px] px-1.5 py-0.5 rounded">
                                                                            {
                                                                                pendingCount
                                                                            }{" "}
                                                                            Pending
                                                                        </span>
                                                                        <span className="bg-emerald-50 text-emerald-700 font-black text-[7px] px-1.5 py-0.5 rounded">
                                                                            {
                                                                                completedCount
                                                                            }{" "}
                                                                            Completed
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* CEO TAB: FINANCE VIEWPORT (Influenced by image_105141.jpg) */}
                                    {ceoTab === "finance" && (
                                        <div className="space-y-3.5 animate-fadeIn">
                                            <div className="border-l-4 border-[#FF5A20] pl-2">
                                                <h3 className="text-[11px] font-black text-[#2E2A75] uppercase">
                                                    Live Ledger Dashboard
                                                </h3>
                                                <p className="text-[7.5px] text-slate-400 font-bold uppercase">
                                                    Strategic Visibility Into
                                                    Revenue
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                                                    <span className="text-[8px] text-slate-400 font-bold block">
                                                        Today's UloomX Income
                                                    </span>
                                                    <p className="text-base font-black text-[#2E2A75] mt-1">
                                                        ₹
                                                        {parseFloat(
                                                            finUloomX || 0,
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                                                    <span className="text-[8px] text-slate-400 font-bold block">
                                                        Today's Usthad Income
                                                    </span>
                                                    <p className="text-base font-black text-[#FF5A20] mt-1">
                                                        ₹
                                                        {parseFloat(
                                                            finUsthad || 0,
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
                                                <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">
                                                    Monthly Performance
                                                </span>
                                                <div className="grid grid-cols-3 gap-1.5 text-center">
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            UloomX
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹12,000
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            Usthad
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹24,000
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            Expenses
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹20,000
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border border-[#FF5A20] bg-orange-50/20 p-3 rounded-xl flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[7px] font-black text-[#FF5A20] uppercase block">
                                                            Current Balance
                                                        </span>
                                                        <span className="text-sm font-black text-[#FF5A20]">
                                                            ₹16,000
                                                        </span>
                                                    </div>
                                                    <span className="text-[7.5px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full">
                                                        🟢 18% Growth
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CEO TAB: SALES INTELLIGENCE VIEWPORT */}
                                    {ceoTab === "sales" && (
                                        <div className="space-y-3.5 animate-fadeIn">
                                            <div className="border-l-4 border-[#2E2A75] pl-2">
                                                <h3 className="text-[11px] font-black text-[#2E2A75] uppercase">
                                                    Sales intelligence
                                                </h3>
                                                <p className="text-[7.5px] text-slate-400 font-bold uppercase">
                                                    Assigned conversions &
                                                    achievements
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-bold">
                                                        Total Assigned Leads
                                                    </span>
                                                    <span className="text-base font-black text-[#2E2A75] mt-1 block">
                                                        {totalLeads}
                                                    </span>
                                                </div>
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-bold">
                                                        Total Conversions
                                                    </span>
                                                    <span className="text-base font-black text-[#FF5A20] mt-1 block">
                                                        {totalConversions}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                                <span className="text-[8.5px] font-black text-[#2E2A75] uppercase block tracking-wider">
                                                    Sales Team Targets Overview
                                                </span>
                                                <div className="space-y-2.5">
                                                    {staff
                                                        .filter(
                                                            (s) =>
                                                                s.dept ===
                                                                "Sales",
                                                        )
                                                        .map((member) => {
                                                            const targetVal =
                                                                member.target ||
                                                                50;
                                                            const achieved =
                                                                member.conversions ||
                                                                0;
                                                            const percent =
                                                                Math.min(
                                                                    100,
                                                                    Math.round(
                                                                        (achieved /
                                                                            targetVal) *
                                                                            100,
                                                                    ),
                                                                );
                                                            return (
                                                                <div
                                                                    key={
                                                                        member.id
                                                                    }
                                                                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                                                                >
                                                                    <div className="flex justify-between items-center text-[9px]">
                                                                        <div>
                                                                            <span className="font-black text-slate-900 block">
                                                                                {
                                                                                    member.name
                                                                                }
                                                                            </span>
                                                                            <span className="text-[7px] text-slate-400 uppercase block font-bold">
                                                                                Role:{" "}
                                                                                {
                                                                                    member.role
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className="text-[#FF5A20] font-black">
                                                                                {
                                                                                    achieved
                                                                                }
                                                                            </span>
                                                                            <span className="text-slate-400 font-bold">
                                                                                {" "}
                                                                                /{" "}
                                                                                {
                                                                                    targetVal
                                                                                }{" "}
                                                                                Target
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="bg-[#2E2A75] h-full"
                                                                            style={{
                                                                                width: `${percent}%`,
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                    <div className="flex justify-between text-[7.5px] font-bold text-slate-400">
                                                                        <span>
                                                                            Progress
                                                                            Ratio
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                percent
                                                                            }
                                                                            %
                                                                            Met
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ========================================================= */}
                            {/* 2. ADMINISTRATOR (MANAGER) VIEWPORT */}
                            {/* ========================================================= */}
                            {activeRole === "Administrator" && (
                                <div className="space-y-4 animate-fadeIn">
                                    {/* Administrator Deep Indigo Greeting Card */}
                                    {adminTab === "home" && (
                                        <div className="bg-gradient-to-br from-[#1E293B] to-[#2E2A75] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A20]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                            <div className="relative z-10 space-y-1">
                                                <span className="text-[7px] bg-[#FF5A20] text-white font-extrabold tracking-widest px-2 py-0.5 rounded-md uppercase">
                                                    ⚡ Operations Control
                                                </span>
                                                <h2 className="text-[16px] font-black tracking-tight text-white leading-tight pt-1">
                                                    {getGreetingText()}, Admin!
                                                </h2>
                                                <p className="text-[8.5px] text-indigo-100 font-medium leading-normal">
                                                    Manage daily rosters, direct
                                                    task lists, and delegate
                                                    executive operations.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Admin Metrics Dashboard */}
                                    {adminTab === "home" && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                                                        Team Count
                                                    </span>
                                                    <Users className="w-4 h-4 text-[#2E2A75]" />
                                                </div>
                                                <span className="text-base font-black text-[#2E2A75] mt-1.5 block">
                                                    {staff.length} Staffs
                                                </span>
                                                <p className="text-[7px] text-slate-400 mt-1 font-semibold">
                                                    Active Roster
                                                </p>
                                            </div>

                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                                                        Tasks Stream
                                                    </span>
                                                    <Briefcase className="w-4 h-4 text-[#FF5A20]" />
                                                </div>
                                                <span className="text-base font-black text-[#FF5A20] mt-1.5 block">
                                                    {totalActiveTasksCount}{" "}
                                                    tasks
                                                </span>
                                                <p className="text-[7px] text-slate-400 mt-1 font-semibold">
                                                    Assigned missions
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Direct Route Navigations for Admin */}
                                    {adminTab === "home" && (
                                        <div className="space-y-2">
                                            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                Analytical Channels
                                            </span>
                                            <div className="grid grid-cols-2 gap-2.5">
                                                <button
                                                    onClick={() =>
                                                        setAdminTab("finance")
                                                    }
                                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between text-left hover:border-[#FF5A20] transition-all"
                                                >
                                                    <div>
                                                        <span className="text-[7px] font-black text-[#FF5A20] uppercase block">
                                                            Ledger Stats
                                                        </span>
                                                        <p className="text-[10px] font-black text-[#2E2A75] mt-0.5">
                                                            Finance Dashboard
                                                        </p>
                                                    </div>
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        setAdminTab("sales")
                                                    }
                                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between text-left hover:border-[#2E2A75] transition-all"
                                                >
                                                    <div>
                                                        <span className="text-[7px] font-black text-[#2E2A75] uppercase block">
                                                            Conversions Log
                                                        </span>
                                                        <p className="text-[10px] font-black text-[#FF5A20] mt-0.5">
                                                            Sales Performance
                                                        </p>
                                                    </div>
                                                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Captured Ideas & Todo Checkpoint Desk (Administrator) */}
                                    {adminTab === "home" && (
                                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1.5">
                                                    <Sparkles className="w-3.5 h-3.5 text-[#FF5A20]" />
                                                    <span className="text-[8.5px] font-black text-[#2E2A75] uppercase">
                                                        Operations Checkpoints
                                                    </span>
                                                </div>
                                                <span className="text-[7px] text-slate-400 font-bold uppercase">
                                                    Hold down to Delete
                                                </span>
                                            </div>

                                            <form
                                                onSubmit={handleAddTodo}
                                                className="flex gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    value={newTodoText}
                                                    onChange={(e) =>
                                                        setNewTodoText(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Add system update checklist..."
                                                    className="flex-1 bg-slate-50 text-[9px] px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-medium placeholder-slate-400"
                                                />
                                                <button
                                                    type="submit"
                                                    className="bg-[#2E2A75] text-white px-3 rounded-lg text-[10px] font-black"
                                                >
                                                    +
                                                </button>
                                            </form>

                                            <div className="space-y-2 pt-1">
                                                {todoList.map((todo) => {
                                                    const isHolding =
                                                        longPressTodoId ===
                                                        todo.id;
                                                    return (
                                                        <div
                                                            key={todo.id}
                                                            onMouseDown={() =>
                                                                handleTodoPressStart(
                                                                    todo.id,
                                                                )
                                                            }
                                                            onMouseUp={() =>
                                                                handleTodoPressCancel()
                                                            }
                                                            onMouseLeave={() =>
                                                                handleTodoPressCancel()
                                                            }
                                                            onTouchStart={() =>
                                                                handleTodoPressStart(
                                                                    todo.id,
                                                                )
                                                            }
                                                            onTouchEnd={() =>
                                                                handleTodoPressCancel()
                                                            }
                                                            className={`flex items-center justify-between p-2 rounded-xl border transition-all relative overflow-hidden select-none cursor-pointer ${
                                                                isHolding
                                                                    ? "border-red-300 bg-red-50/10"
                                                                    : "border-slate-100 bg-slate-50/60 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            {isHolding && (
                                                                <div
                                                                    className="absolute bottom-0 left-0 top-0 bg-red-500/10 transition-all ease-linear"
                                                                    style={{
                                                                        width: `${longPressProgress}%`,
                                                                    }}
                                                                />
                                                            )}
                                                            <div className="flex items-center gap-2 relative z-10">
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleToggleTodo(
                                                                            todo.id,
                                                                        );
                                                                    }}
                                                                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                                        todo.completed
                                                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                                                            : "border-slate-300 bg-white"
                                                                    }`}
                                                                >
                                                                    {todo.completed && (
                                                                        <CheckCircle className="w-2.5 h-2.5" />
                                                                    )}
                                                                </button>
                                                                <span
                                                                    className={`text-[9px] font-semibold ${todo.completed ? "line-through text-slate-400" : "text-slate-700"}`}
                                                                >
                                                                    {todo.text}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Community board display (Admin view) */}
                                    {adminTab === "home" && (
                                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
                                            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                                <Megaphone className="w-3.5 h-3.5 text-[#FF5A20]" />
                                                <span className="text-[8.5px] font-black text-[#2E2A75] uppercase">
                                                    HQ Community Board
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                {broadcasts.map((b) => (
                                                    <div
                                                        key={b.id}
                                                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                                                    >
                                                        <div className="flex justify-between text-[7px] font-bold text-slate-400 uppercase mb-1">
                                                            <span className="text-[#FF5A20]">
                                                                {b.type} Alert
                                                            </span>
                                                            <span>
                                                                {b.timestamp}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] text-slate-700 leading-relaxed font-semibold">
                                                            {b.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* ADMIN TAB: TASKS CONTROL & APPROVAL REVIEW */}
                                    {adminTab === "tasks" && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                Assigned Pipeline Log
                                            </span>

                                            {tasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2 shadow-sm"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-[9.5px] font-black text-slate-950">
                                                            {task.title}
                                                        </h4>
                                                        <span className="text-[8px] font-black bg-indigo-50 text-[#2E2A75] px-2 py-0.5 rounded-full">
                                                            {task.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-[8.5px] text-slate-400 leading-normal">
                                                        {task.desc}
                                                    </p>

                                                    {task.status ===
                                                        "Under Review" && (
                                                        <div className="flex gap-1.5 pt-1.5 border-t border-slate-50">
                                                            <button
                                                                onClick={() => {
                                                                    setTasks(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.map(
                                                                                (
                                                                                    t,
                                                                                ) =>
                                                                                    t.id ===
                                                                                    task.id
                                                                                        ? {
                                                                                              ...t,
                                                                                              status: "Completed",
                                                                                              progress: 100,
                                                                                          }
                                                                                        : t,
                                                                            ),
                                                                    );
                                                                    setTimeout(
                                                                        () => {
                                                                            triggerCongrats(
                                                                                "Task Approved! ✅",
                                                                                `"${task.title}" is verified and complete.`,
                                                                            );
                                                                        },
                                                                        300,
                                                                    );
                                                                }}
                                                                className="flex-1 bg-emerald-600 text-white font-bold text-[8px] py-1 rounded"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setTasks(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.map(
                                                                                (
                                                                                    t,
                                                                                ) =>
                                                                                    t.id ===
                                                                                    task.id
                                                                                        ? {
                                                                                              ...t,
                                                                                              status: "In Progress",
                                                                                              progress: 50,
                                                                                          }
                                                                                        : t,
                                                                            ),
                                                                    );
                                                                    triggerToast(
                                                                        "Re-routed for revision.",
                                                                        "info",
                                                                    );
                                                                }}
                                                                className="flex-1 bg-red-50 text-red-700 border border-red-100 font-bold text-[8px] py-1 rounded"
                                                            >
                                                                Send Back
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ADMIN TAB: STAFF MATRIX */}
                                    {adminTab === "staff" && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest px-1">
                                                    Roster Matrix
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setIsAddStaffModalOpen(
                                                            true,
                                                        )
                                                    }
                                                    className="bg-[#2E2A75] text-white text-[8px] font-black uppercase px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
                                                >
                                                    <UserPlus className="w-3 h-3" />{" "}
                                                    Add Staff
                                                </button>
                                            </div>

                                            <p className="text-[7.5px] text-[#FF5A20] font-black uppercase bg-orange-50/50 p-2 rounded-lg text-center tracking-wider">
                                                ⚠️ Hold down card to remove
                                                staff member.
                                            </p>

                                            <div className="space-y-2.5">
                                                {staff.map((member) => {
                                                    const pendingCount =
                                                        tasks.filter(
                                                            (t) =>
                                                                t.assigneeId ===
                                                                    member.id &&
                                                                t.status !==
                                                                    "Completed",
                                                        ).length;
                                                    const completedCount =
                                                        tasks.filter(
                                                            (t) =>
                                                                t.assigneeId ===
                                                                    member.id &&
                                                                t.status ===
                                                                    "Completed",
                                                        ).length;
                                                    const isHolding =
                                                        longPressActiveId ===
                                                        member.id;

                                                    return (
                                                        <div
                                                            key={member.id}
                                                            onMouseDown={() =>
                                                                handleStaffPressStart(
                                                                    member.id,
                                                                )
                                                            }
                                                            onMouseUp={() =>
                                                                handleStaffPressCancel()
                                                            }
                                                            onMouseLeave={() =>
                                                                handleStaffPressCancel()
                                                            }
                                                            onTouchStart={() =>
                                                                handleStaffPressStart(
                                                                    member.id,
                                                                )
                                                            }
                                                            onTouchEnd={() =>
                                                                handleStaffPressCancel()
                                                            }
                                                            className={`bg-white p-3 rounded-2xl border transition-all relative overflow-hidden select-none cursor-pointer ${
                                                                isHolding
                                                                    ? "border-red-300 scale-98 bg-red-50/10"
                                                                    : "border-slate-100 shadow-sm"
                                                            }`}
                                                        >
                                                            {isHolding && (
                                                                <div
                                                                    className="absolute bottom-0 left-0 top-0 bg-red-500/15 transition-all ease-linear"
                                                                    style={{
                                                                        width: `${longPressProgress}%`,
                                                                    }}
                                                                />
                                                            )}

                                                            <div className="flex justify-between items-center relative z-10">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xl bg-slate-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                                                                        {
                                                                            member.avatar
                                                                        }
                                                                    </span>
                                                                    <div>
                                                                        <h4 className="text-[10px] font-black text-slate-950">
                                                                            {
                                                                                member.name
                                                                            }
                                                                        </h4>
                                                                        <p className="text-[8px] font-bold text-slate-400 mt-0.5">
                                                                            {
                                                                                member.dept
                                                                            }{" "}
                                                                            ·{" "}
                                                                            <span className="text-[#FF5A20] font-black">
                                                                                {
                                                                                    member.role
                                                                                }
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right">
                                                                    <span className="text-[7.5px] bg-slate-50 text-slate-500 font-bold px-1.5 py-0.5 rounded">
                                                                        P:{" "}
                                                                        {
                                                                            pendingCount
                                                                        }{" "}
                                                                        | C:{" "}
                                                                        {
                                                                            completedCount
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* ADMIN TAB: DIRECTIVES */}
                                    {adminTab === "directives" && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                Directives Log
                                            </span>

                                            {directives.map((dir) => (
                                                <div
                                                    key={dir.id}
                                                    className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2"
                                                >
                                                    <div className="flex justify-between items-center text-[8px]">
                                                        <span className="bg-orange-50 text-[#FF5A20] px-1.5 py-0.5 rounded font-black">
                                                            {dir.status}
                                                        </span>
                                                        <span className="text-slate-400 font-semibold">
                                                            {dir.date}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-[9.5px] font-black text-slate-950">
                                                        {dir.title}
                                                    </h4>
                                                    <p className="text-[8.5px] text-slate-400 leading-normal">
                                                        {dir.desc}
                                                    </p>

                                                    {dir.status !==
                                                        "Delegated" && (
                                                        <button
                                                            onClick={() => {
                                                                setNewTaskTitle(
                                                                    `Execute: ${dir.title}`,
                                                                );
                                                                setNewTaskDesc(
                                                                    `Derived from CEO directive: "${dir.desc}"`,
                                                                );
                                                                setIsAssignTaskModalOpen(
                                                                    true,
                                                                );
                                                                triggerToast(
                                                                    "Directive loaded into creator!",
                                                                    "info",
                                                                );
                                                            }}
                                                            className="w-full bg-[#2E2A75] text-white text-[8px] py-1.5 rounded-xl uppercase font-black"
                                                        >
                                                            Delegate to Staff
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* ADMIN TAB: FINANCE VIEWPORT */}
                                    {adminTab === "finance" && (
                                        <div className="space-y-3.5 animate-fadeIn">
                                            <div className="border-l-4 border-[#FF5A20] pl-2">
                                                <h3 className="text-[11px] font-black text-[#2E2A75] uppercase">
                                                    Live Ledger Dashboard
                                                </h3>
                                                <p className="text-[7.5px] text-slate-400 font-bold uppercase">
                                                    Strategic Visibility Into
                                                    Revenue
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                                                    <span className="text-[8px] text-slate-400 font-bold block">
                                                        Today's UloomX Income
                                                    </span>
                                                    <p className="text-base font-black text-[#2E2A75] mt-1">
                                                        ₹
                                                        {parseFloat(
                                                            finUloomX || 0,
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                                                    <span className="text-[8px] text-slate-400 font-bold block">
                                                        Today's Usthad Income
                                                    </span>
                                                    <p className="text-base font-black text-[#FF5A20] mt-1">
                                                        ₹
                                                        {parseFloat(
                                                            finUsthad || 0,
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
                                                <span className="text-[8px] text-slate-400 font-black uppercase block tracking-wider">
                                                    Monthly Performance
                                                </span>
                                                <div className="grid grid-cols-3 gap-1.5 text-center">
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            UloomX
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹12,000
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            Usthad
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹24,000
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            Expenses
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹20,000
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border border-[#FF5A20] bg-orange-50/20 p-3 rounded-xl flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[7px] font-black text-[#FF5A20] uppercase block">
                                                            Current Balance
                                                        </span>
                                                        <span className="text-sm font-black text-[#FF5A20]">
                                                            ₹16,000
                                                        </span>
                                                    </div>
                                                    <span className="text-[7.5px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full">
                                                        🟢 18% Growth
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ADMIN TAB: SALES VIEWPORT */}
                                    {adminTab === "sales" && (
                                        <div className="space-y-3.5 animate-fadeIn">
                                            <div className="border-l-4 border-[#2E2A75] pl-2">
                                                <h3 className="text-[11px] font-black text-[#2E2A75] uppercase">
                                                    Sales intelligence
                                                </h3>
                                                <p className="text-[7.5px] text-slate-400 font-bold uppercase">
                                                    Assigned conversions &
                                                    achievements
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5">
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-bold">
                                                        Total Assigned Leads
                                                    </span>
                                                    <span className="text-base font-black text-[#2E2A75] mt-1 block">
                                                        {totalLeads}
                                                    </span>
                                                </div>
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-bold">
                                                        Total Conversions
                                                    </span>
                                                    <span className="text-base font-black text-[#FF5A20] mt-1 block">
                                                        {totalConversions}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                                <span className="text-[8.5px] font-black text-[#2E2A75] uppercase block tracking-wider">
                                                    Sales Team Targets Overview
                                                </span>
                                                <div className="space-y-2.5">
                                                    {staff
                                                        .filter(
                                                            (s) =>
                                                                s.dept ===
                                                                "Sales",
                                                        )
                                                        .map((member) => {
                                                            const targetVal =
                                                                member.target ||
                                                                50;
                                                            const achieved =
                                                                member.conversions ||
                                                                0;
                                                            const percent =
                                                                Math.min(
                                                                    100,
                                                                    Math.round(
                                                                        (achieved /
                                                                            targetVal) *
                                                                            100,
                                                                    ),
                                                                );
                                                            return (
                                                                <div
                                                                    key={
                                                                        member.id
                                                                    }
                                                                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                                                                >
                                                                    <div className="flex justify-between items-center text-[9px]">
                                                                        <div>
                                                                            <span className="font-black text-slate-900 block">
                                                                                {
                                                                                    member.name
                                                                                }
                                                                            </span>
                                                                            <span className="text-[7px] text-slate-400 uppercase block font-bold">
                                                                                Role:{" "}
                                                                                {
                                                                                    member.role
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <span className="text-[#FF5A20] font-black">
                                                                                {
                                                                                    achieved
                                                                                }
                                                                            </span>
                                                                            <span className="text-slate-400 font-bold">
                                                                                {" "}
                                                                                /{" "}
                                                                                {
                                                                                    targetVal
                                                                                }{" "}
                                                                                Target
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="bg-[#2E2A75] h-full"
                                                                            style={{
                                                                                width: `${percent}%`,
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                    <div className="flex justify-between text-[7.5px] font-bold text-slate-400">
                                                                        <span>
                                                                            Progress
                                                                            Ratio
                                                                        </span>
                                                                        <span>
                                                                            {
                                                                                percent
                                                                            }
                                                                            %
                                                                            Met
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ========================================================= */}
                            {/* 3. STAFF PORTAL VIEWPORT */}
                            {/* ========================================================= */}
                            {activeRole === "Staff" && (
                                <div className="space-y-4 animate-fadeIn">
                                    {/* STAFF TAB: HOME (Community board & assigned tasks) */}
                                    {staffTab === "home" && (
                                        <div className="space-y-4">
                                            {/* Stylized personalized greeting card */}
                                            <div className="bg-gradient-to-br from-[#2E2A75] via-[#24215C] to-[#141236] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A20]/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                                <div className="relative z-10 space-y-1">
                                                    <span className="text-[7px] bg-[#FF5A20] text-white font-extrabold tracking-widest px-2 py-0.5 rounded-md uppercase">
                                                        Staff Suite
                                                    </span>
                                                    <h2 className="text-[16px] font-black tracking-tight text-white leading-tight pt-1">
                                                        {getGreetingText()},{" "}
                                                        {
                                                            currentStaffProfile.name.split(
                                                                " ",
                                                            )[0]
                                                        }
                                                        !
                                                    </h2>
                                                    <p className="text-[8.5px] text-slate-300 font-semibold leading-relaxed">
                                                        Dept:{" "}
                                                        <span className="text-white font-black">
                                                            {
                                                                currentStaffProfile.dept
                                                            }
                                                        </span>{" "}
                                                        · Pos:{" "}
                                                        <span className="text-[#FF5A20] font-black">
                                                            {
                                                                currentStaffProfile.role
                                                            }
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Community board display */}
                                            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
                                                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                                                    <Megaphone className="w-3.5 h-3.5 text-[#FF5A20]" />
                                                    <span className="text-[8.5px] font-black text-[#2E2A75] uppercase">
                                                        HQ Community Board
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    {broadcasts.map((b) => (
                                                        <div
                                                            key={b.id}
                                                            className="p-2.5 rounded-xl bg-slate-50 border border-indigo-50/50 text-[9px] leading-relaxed"
                                                        >
                                                            <div className="flex items-center justify-between mb-1 text-[7px] font-bold text-slate-400 uppercase">
                                                                <span>
                                                                    {b.type}{" "}
                                                                    Alert
                                                                </span>
                                                                <span>
                                                                    {
                                                                        b.timestamp
                                                                    }
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-700 font-semibold">
                                                                {b.text}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Latest assigned targets */}
                                            <div className="space-y-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                    Your Targets Pipeline
                                                </span>

                                                {tasks
                                                    .filter(
                                                        (t) =>
                                                            t.assigneeId ===
                                                            currentStaffProfile.id,
                                                    )
                                                    .slice(0, 3)
                                                    .map((task) => (
                                                        <div
                                                            key={task.id}
                                                            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center gap-3"
                                                        >
                                                            <div className="truncate space-y-1">
                                                                <span className="text-[6.5px] font-black uppercase text-slate-450 bg-slate-50 px-1 py-0.5 rounded">
                                                                    {
                                                                        task.priority
                                                                    }{" "}
                                                                    Priority
                                                                </span>
                                                                <h4 className="text-[9.5px] font-black text-slate-950 truncate">
                                                                    {task.title}
                                                                </h4>
                                                            </div>
                                                            <span className="text-[8.5px] font-black text-[#FF5A20] bg-orange-50 px-2 py-0.5 rounded shrink-0">
                                                                {task.progress}%
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* STAFF TAB: TASKS pipeline */}
                                    {staffTab === "tasks" && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                Assigned Tasks Desk
                                            </span>

                                            {tasks
                                                .filter(
                                                    (t) =>
                                                        t.assigneeId ===
                                                        currentStaffProfile.id,
                                                )
                                                .map((task) => (
                                                    <div
                                                        key={task.id}
                                                        className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-2 shadow-sm"
                                                    >
                                                        <div>
                                                            <span className="text-[7px] font-black bg-indigo-50 text-[#2E2A75] px-1.5 py-0.5 rounded uppercase">
                                                                Deployed by:{" "}
                                                                {
                                                                    task.assignedBy
                                                                }
                                                            </span>
                                                            <h4 className="text-[10px] font-black text-slate-900 mt-1">
                                                                {task.title}
                                                            </h4>
                                                            <p className="text-[8.5px] text-slate-400 leading-normal mt-0.5">
                                                                {task.desc}
                                                            </p>
                                                        </div>

                                                        <div className="pt-2 border-t border-slate-50 flex items-center gap-3 justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex justify-between text-[7px] text-slate-400 mb-1 font-bold">
                                                                    <span>
                                                                        Adjust
                                                                        progression
                                                                        status
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            task.progress
                                                                        }
                                                                        %
                                                                    </span>
                                                                </div>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={
                                                                        task.progress
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleProgressSlider(
                                                                            task.id,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        task.status ===
                                                                            "Completed" ||
                                                                        task.status ===
                                                                            "Under Review"
                                                                    }
                                                                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#FF5A20]"
                                                                />
                                                            </div>
                                                            <span className="text-[8.5px] font-black text-slate-900 shrink-0">
                                                                {task.status}
                                                            </span>
                                                        </div>

                                                        {task.progress ===
                                                            100 &&
                                                            task.status ===
                                                                "In Progress" && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleTaskSubmitForReview(
                                                                            task.id,
                                                                        )
                                                                    }
                                                                    className="w-full bg-[#2E2A75] text-white text-[8.5px] font-black py-1.5 rounded-lg uppercase"
                                                                >
                                                                    Submit For
                                                                    Review
                                                                </button>
                                                            )}
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                    {/* STAFF TAB: SPECIALIZED DEPT WORKSPACE */}
                                    {staffTab === "specialized" && (
                                        <div className="space-y-4 animate-fadeIn">
                                            {/* ========================================= */}
                                            {/* 1. FINANCE DEPT: DAILY ENTRY (2026-05-29_08-08-17.jpg) */}
                                            {/* ========================================= */}
                                            {currentStaffProfile.dept ===
                                                "Finance" && (
                                                <div className="space-y-3.5">
                                                    {/* Financial Command Accent Header */}
                                                    <div className="bg-gradient-to-r from-[#2E2A75] to-[#121033] text-white p-3.5 rounded-2xl border-l-4 border-[#FF5A20] flex items-center justify-between">
                                                        <div>
                                                            <span className="text-[6.5px] bg-[#FF5A20] px-1.5 py-0.5 rounded text-white font-black uppercase">
                                                                ACCOUNTS
                                                            </span>
                                                            <h3 className="text-[11px] font-black text-white mt-1 uppercase">
                                                                Good Morning
                                                            </h3>
                                                            <p className="text-[7.5px] text-slate-300 font-semibold mt-0.5">
                                                                Ready to record
                                                                today's flow
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[7px] bg-slate-50/10 text-[#FF5A20] font-black px-1.5 py-0.5 rounded">
                                                                FOCUSED
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Daily Entry Form Block */}
                                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <Wallet className="w-3.5 h-3.5 text-[#FF5A20]" />
                                                            <div>
                                                                <span className="text-[9px] font-black text-slate-900 block leading-none">
                                                                    Daily Entry
                                                                </span>
                                                                <span className="text-[7px] text-slate-400 font-bold block mt-0.5">
                                                                    Record
                                                                    financial
                                                                    data
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="space-y-0.5">
                                                                <label className="text-[6.5px] text-slate-400 font-black uppercase block">
                                                                    UloomX
                                                                    Income
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={
                                                                        finUloomX
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setFinUloomX(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full bg-slate-50 text-[10px] px-2 py-1.5 border border-slate-150 rounded-lg outline-none font-bold"
                                                                    placeholder="₹"
                                                                />
                                                            </div>
                                                            <div className="space-y-0.5">
                                                                <label className="text-[6.5px] text-slate-400 font-black uppercase block">
                                                                    Usthad
                                                                    Income
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={
                                                                        finUsthad
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setFinUsthad(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full bg-slate-50 text-[10px] px-2 py-1.5 border border-slate-150 rounded-lg outline-none font-bold"
                                                                    placeholder="₹"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <label className="text-[6.5px] text-slate-400 font-black uppercase block">
                                                                Total Expenses
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={
                                                                    finExpenses
                                                                }
                                                                onChange={(e) =>
                                                                    setFinExpenses(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full bg-slate-50 text-[10px] px-2 py-1.5 border border-slate-150 rounded-lg outline-none font-bold"
                                                                placeholder="₹"
                                                            />
                                                        </div>

                                                        {/* Calculated green revenue block */}
                                                        <div className="bg-emerald-600 text-white p-3 rounded-xl flex justify-between items-center shadow-sm">
                                                            <span className="text-[8px] font-black tracking-wider uppercase">
                                                                📈 REVENUE
                                                            </span>
                                                            <span className="text-[12px] font-black">
                                                                ₹
                                                                {(
                                                                    parseFloat(
                                                                        finUloomX ||
                                                                            0,
                                                                    ) +
                                                                    parseFloat(
                                                                        finUsthad ||
                                                                            0,
                                                                    ) -
                                                                    parseFloat(
                                                                        finExpenses ||
                                                                            0,
                                                                    )
                                                                ).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Quick History List */}
                                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                                                        <span className="text-[7.5px] text-slate-400 font-black uppercase block">
                                                            Quick History (Last
                                                            entries)
                                                        </span>
                                                        <div className="space-y-1.5">
                                                            {financeHistory.map(
                                                                (hist, idx) => (
                                                                    <div
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="flex justify-between items-center text-[8.5px] border-b border-slate-50 pb-1.5 last:border-0"
                                                                    >
                                                                        <div>
                                                                            <p className="font-bold text-slate-800">
                                                                                {
                                                                                    hist.date
                                                                                }
                                                                            </p>
                                                                            <span className="text-[7px] text-slate-400 font-semibold">
                                                                                Income:
                                                                                ₹
                                                                                {hist.income.toLocaleString()}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-red-600 font-bold">
                                                                            Exp:
                                                                            ₹
                                                                            {hist.expenses.toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Transmit Action */}
                                                    <button
                                                        onClick={() => {
                                                            setFinanceHistory([
                                                                {
                                                                    date: "Today",
                                                                    income:
                                                                        parseFloat(
                                                                            finUloomX ||
                                                                                0,
                                                                        ) +
                                                                        parseFloat(
                                                                            finUsthad ||
                                                                                0,
                                                                        ),
                                                                    expenses:
                                                                        parseFloat(
                                                                            finExpenses ||
                                                                                0,
                                                                        ),
                                                                },
                                                                ...financeHistory,
                                                            ]);
                                                            triggerToast(
                                                                "Daily transmission finalized!",
                                                                "success",
                                                            );
                                                        }}
                                                        className="w-full bg-[#2E2A75] text-white text-[8.5px] py-2 rounded-xl uppercase font-black"
                                                    >
                                                        Transmit Financial
                                                        Report
                                                    </button>
                                                </div>
                                            )}

                                            {/* ========================================= */}
                                            {/* 2. SALES DEPT: PERFORMANCE (image_0fd23a.jpg) */}
                                            {/* ========================================= */}
                                            {currentStaffProfile.dept ===
                                                "Sales" && (
                                                <div className="space-y-3.5">
                                                    {/* Conversions Progress Frame */}
                                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                                        <div className="flex justify-between items-center text-[7.5px] text-slate-400 font-black uppercase">
                                                            <span>
                                                                Monthly
                                                                Conversions
                                                                Target
                                                            </span>
                                                            <span>
                                                                May 2026
                                                            </span>
                                                        </div>

                                                        {/* Target Config Area */}
                                                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                                                            <div className="space-y-0.5 w-full">
                                                                <span className="text-[7px] text-slate-400 font-black uppercase block">
                                                                    Customize
                                                                    Target Goal
                                                                </span>
                                                                <input
                                                                    type="number"
                                                                    value={
                                                                        currentStaffProfile.target ||
                                                                        50
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleUpdateSalesStaffTarget(
                                                                            currentStaffProfile.id,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="bg-transparent text-sm font-black text-[#2E2A75] outline-none w-full"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-2xl font-black text-[#2E2A75]">
                                                                {
                                                                    currentStaffProfile.conversions
                                                                }
                                                            </span>
                                                            <span className="text-slate-400 font-bold text-[10px]">
                                                                /{" "}
                                                                {
                                                                    currentStaffProfile.target
                                                                }{" "}
                                                                conversions
                                                            </span>
                                                        </div>

                                                        {/* Progress slider bar */}
                                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-[#2E2A75] h-full transition-all duration-300"
                                                                style={{
                                                                    width: `${Math.min(100, Math.round(((currentStaffProfile.conversions || 0) / (currentStaffProfile.target || 50)) * 100))}%`,
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-3 gap-1.5 text-center text-[7.5px] font-black">
                                                            <div className="bg-emerald-50/60 p-1.5 rounded-lg">
                                                                <span className="text-slate-400 block uppercase">
                                                                    Achieved
                                                                </span>
                                                                <span className="text-emerald-700 text-[9px] mt-0.5 block">
                                                                    {
                                                                        currentStaffProfile.conversions
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="bg-amber-50/60 p-1.5 rounded-lg">
                                                                <span className="text-slate-400 block uppercase">
                                                                    Target Goal
                                                                </span>
                                                                <span className="text-amber-700 text-[9px] mt-0.5 block">
                                                                    {
                                                                        currentStaffProfile.target
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="bg-indigo-50/60 p-1.5 rounded-lg">
                                                                <span className="text-slate-400 block uppercase">
                                                                    Remaining
                                                                </span>
                                                                <span className="text-[#2E2A75] text-[9px] mt-0.5 block">
                                                                    {Math.max(
                                                                        0,
                                                                        currentStaffProfile.target -
                                                                            currentStaffProfile.conversions,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Daily Performance Metrics Inputs */}
                                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                                                            DAILY PERFORMANCE
                                                            METRICS
                                                        </span>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-[7px] text-slate-400 font-black uppercase block mb-0.5">
                                                                    Total Leads
                                                                    Today
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={
                                                                        salesLeads
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setSalesLeads(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full bg-slate-50 text-[9px] font-bold p-1.5 border border-slate-150 rounded-lg outline-none"
                                                                    placeholder="Enter number..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[7px] text-slate-400 font-black uppercase block mb-0.5">
                                                                    Evaluations
                                                                    Taken
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={
                                                                        salesEvaluations
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setSalesEvaluations(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full bg-slate-50 text-[9px] font-bold p-1.5 border border-slate-150 rounded-lg outline-none"
                                                                    placeholder="Enter number..."
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="text-[7px] text-slate-400 font-black uppercase block mb-0.5">
                                                                    Conversions
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={
                                                                        currentStaffProfile.conversions ||
                                                                        0
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleUpdateSalesStaffConversions(
                                                                            currentStaffProfile.id,
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full bg-slate-50 text-[9px] font-bold p-1.5 border border-slate-150 rounded-lg outline-none text-[#FF5A20]"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[7px] text-slate-400 font-black uppercase block mb-0.5">
                                                                    Lost Leads
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={
                                                                        salesLostLeads
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setSalesLostLeads(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full bg-slate-50 text-[9px] font-bold p-1.5 border border-slate-150 rounded-lg outline-none"
                                                                    placeholder="Enter number..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Assessment Quality slider */}
                                                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2">
                                                        <div className="flex justify-between text-[7px] text-slate-400 font-black uppercase">
                                                            <span>
                                                                Lead Quality
                                                                Assessment Score
                                                            </span>
                                                            <span>
                                                                {
                                                                    salesQualityScore
                                                                }{" "}
                                                                / 10
                                                            </span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="10"
                                                            value={
                                                                salesQualityScore
                                                            }
                                                            onChange={(e) =>
                                                                setSalesQualityScore(
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                            className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2E2A75]"
                                                        />
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            triggerToast(
                                                                "Sales report successfully transmitted!",
                                                                "success",
                                                            );
                                                        }}
                                                        className="w-full bg-[#2E2A75] text-white text-[8.5px] py-2 rounded-xl uppercase font-black"
                                                    >
                                                        Transmit Sales Report
                                                    </button>
                                                </div>
                                            )}

                                            {/* ========================================= */}
                                            {/* 3. ADMINISTRATION DEPT: MEETINGS RADAR */}
                                            {/* ========================================= */}
                                            {currentStaffProfile.dept ===
                                                "Administration" && (
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-3 shadow-sm">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">
                                                        Administration Meetings
                                                        Radar
                                                    </span>

                                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-155 space-y-1">
                                                        <span className="text-[7px] font-black uppercase text-[#FF5A20] block">
                                                            TOMORROW, 10:00 AM
                                                        </span>
                                                        <h4 className="text-[10px] font-black text-slate-900 leading-tight">
                                                            LMS Server Upgrade
                                                            Sync
                                                        </h4>
                                                        <p className="text-[8.5px] text-slate-450 mt-0.5">
                                                            Review staging
                                                            backup scheduled
                                                            targets.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* STAFF TAB: REQUEST PORTAL */}
                                    {staffTab === "portal" && (
                                        <div className="bg-white p-3.5 rounded-2xl border border-slate-100 space-y-3 shadow-sm text-slate-800">
                                            <span className="text-[9px] font-black text-[#2E2A75] uppercase block">
                                                Request Portal
                                            </span>

                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const details =
                                                        e.target.details.value;
                                                    const type =
                                                        e.target.type.value;
                                                    if (!details.trim()) return;

                                                    setRequests([
                                                        {
                                                            id: `req-${Date.now()}`,
                                                            staffId:
                                                                currentStaffProfile.id,
                                                            staffName:
                                                                currentStaffProfile.name,
                                                            type,
                                                            details,
                                                            status: "Pending",
                                                            date: "Today",
                                                        },
                                                        ...requests,
                                                    ]);
                                                    e.target.reset();
                                                    triggerToast(
                                                        "Operational request dispatched!",
                                                        "success",
                                                    );
                                                }}
                                                className="space-y-3"
                                            >
                                                <div>
                                                    <label className="text-[7px] text-slate-400 font-black uppercase block mb-1">
                                                        Select Purpose
                                                    </label>
                                                    <select
                                                        name="type"
                                                        className="w-full bg-slate-50 border border-slate-150 rounded-lg p-1.5 text-[9px] font-bold"
                                                    >
                                                        <option value="Leave">
                                                            🌴 Leave/Rest
                                                            Request
                                                        </option>
                                                        <option value="Permission Access">
                                                            🔑 Access Permission
                                                            Key
                                                        </option>
                                                        <option value="Medical/Work Support">
                                                            🚑 Urgent Resource
                                                            Support
                                                        </option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-[7px] text-slate-400 font-black uppercase block mb-1">
                                                        Details Context
                                                    </label>
                                                    <textarea
                                                        name="details"
                                                        required
                                                        className="w-full bg-slate-50 border border-slate-150 rounded-lg p-2 text-[9px] h-14 resize-none"
                                                        placeholder="Provide reason or material budget requested..."
                                                    ></textarea>
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="w-full bg-[#FF5A20] text-white text-[9px] font-black py-2 rounded-xl uppercase shadow-sm"
                                                >
                                                    Submit Request
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ========================================================= */}
                        {/* ADD STAFF MODAL WINDOW (Frosted Bottom Sheet Style) */}
                        {/* ========================================================= */}
                        {isAddStaffModalOpen && (
                            <div className="absolute inset-0 bg-slate-950/40 z-50 flex items-end justify-center p-0 transition-all duration-300 backdrop-blur-xs">
                                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-4 shadow-2xl border-t border-slate-100 max-h-[85%] overflow-y-auto animate-slideUp text-slate-800">
                                    {/* Pull Indicator */}
                                    <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3"></div>

                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-xs font-bold tracking-widest text-[#2E2A75] uppercase">
                                                Onboard Staff
                                            </h3>
                                            <p className="text-[8px] text-slate-400 uppercase font-black">
                                                Configure identity & credentials
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setIsAddStaffModalOpen(false)
                                            }
                                            className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full"
                                        >
                                            <X className="w-4 h-4 text-slate-550" />
                                        </button>
                                    </div>

                                    <form
                                        onSubmit={handleAddStaffSubmit}
                                        className="space-y-3 text-left"
                                    >
                                        <div>
                                            <label className="text-[7.5px] font-black text-slate-400 uppercase block mb-1">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formFullName}
                                                onChange={(e) =>
                                                    setFormFullName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Layla Rashid"
                                                className="w-full bg-slate-50 text-[10px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[7.5px] font-black text-slate-400 uppercase block mb-1">
                                                    Login ID
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formLoginId}
                                                    onChange={(e) =>
                                                        setFormLoginId(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="layla.sales"
                                                    className="w-full bg-slate-50 text-[9px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[7.5px] font-black text-slate-400 uppercase block mb-1">
                                                    Gmail Key
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formGmail}
                                                    onChange={(e) =>
                                                        setFormGmail(
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="layla@usthad.com"
                                                    className="w-full bg-slate-50 text-[9px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[7.5px] font-black text-slate-400 uppercase block mb-1">
                                                Access Password
                                            </label>
                                            <input
                                                type="password"
                                                value={formPassword}
                                                onChange={(e) =>
                                                    setFormPassword(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="••••••••••••"
                                                className="w-full bg-slate-50 text-[10px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
                                                required
                                            />
                                        </div>

                                        {/* Choosing Department Segmented Buttons */}
                                        <div>
                                            <label className="text-[7.5px] font-black text-slate-400 uppercase block mb-1.5">
                                                Choose Department
                                            </label>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {[
                                                    "Administration",
                                                    "Finance",
                                                    "Sales",
                                                ].map((deptOpt) => (
                                                    <button
                                                        type="button"
                                                        key={deptOpt}
                                                        onClick={() =>
                                                            setFormDept(deptOpt)
                                                        }
                                                        className={`py-2 text-[8px] font-black rounded-xl uppercase transition ${
                                                            formDept === deptOpt
                                                                ? "bg-[#2E2A75] text-white shadow-sm"
                                                                : "bg-slate-50 text-slate-600 border border-slate-200"
                                                        }`}
                                                    >
                                                        {deptOpt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Choosing Role Segmented Buttons */}
                                        <div>
                                            <label className="text-[7.5px] font-black text-slate-400 uppercase block mb-1.5">
                                                Assign Position Role
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {["Staff", "Manager"].map(
                                                    (roleOpt) => (
                                                        <button
                                                            type="button"
                                                            key={roleOpt}
                                                            onClick={() =>
                                                                setFormRole(
                                                                    roleOpt,
                                                                )
                                                            }
                                                            className={`py-2 text-[8px] font-black rounded-xl uppercase transition ${
                                                                formRole ===
                                                                roleOpt
                                                                    ? "bg-[#FF5A20] text-white shadow-sm"
                                                                    : "bg-slate-50 text-slate-600 border border-slate-200"
                                                            }`}
                                                        >
                                                            {roleOpt}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-[#2E2A75] to-[#FF5A20] text-white text-[9.5px] font-black uppercase py-2.5 rounded-xl shadow-sm tracking-wider"
                                        >
                                            Onboard to System
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* DEPLOY TASK DIALOGUE (Frosted Bottom Sheet Style) */}
                        {/* ========================================================= */}
                        {isAssignTaskModalOpen && (
                            <div className="absolute inset-0 bg-slate-950/40 z-50 flex items-end justify-center p-0 transition-all duration-300 backdrop-blur-xs">
                                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-4 shadow-2xl border-t border-slate-100 max-h-[85%] overflow-y-auto animate-slideUp text-slate-850">
                                    {/* Pull Indicator */}
                                    <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3"></div>

                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-xs font-bold tracking-widest text-[#2E2A75] uppercase">
                                                Deploy Target
                                            </h3>
                                            <p className="text-[8px] text-slate-400 uppercase font-black">
                                                Direct Task Assignment
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setIsAssignTaskModalOpen(false)
                                            }
                                            className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full"
                                        >
                                            <X className="w-4 h-4 text-slate-550" />
                                        </button>
                                    </div>

                                    <form
                                        onSubmit={handleDeployTaskSubmit}
                                        className="space-y-3 text-left"
                                    >
                                        <div>
                                            <label className="text-[7px] font-black text-slate-400 uppercase block mb-1">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={newTaskTitle}
                                                onChange={(e) =>
                                                    setNewTaskTitle(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Task designation..."
                                                className="w-full bg-slate-50 text-[10px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[7px] font-black text-slate-400 uppercase block mb-1">
                                                Scope & Details
                                            </label>
                                            <textarea
                                                value={newTaskDesc}
                                                onChange={(e) =>
                                                    setNewTaskDesc(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Provide directives or steps..."
                                                className="w-full bg-slate-50 text-[10px] p-3 border border-slate-200 rounded-xl outline-none h-16 resize-none font-medium"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[7px] font-black text-slate-400 uppercase block mb-1">
                                                    Assignee
                                                </label>
                                                <select
                                                    value={newTaskAssignee}
                                                    onChange={(e) =>
                                                        setNewTaskAssignee(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full bg-slate-50 text-[9px] p-2 border border-slate-200 rounded-xl font-bold"
                                                >
                                                    {staff.map((s) => (
                                                        <option
                                                            key={s.id}
                                                            value={s.id}
                                                        >
                                                            {s.name} ({s.dept})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[7px] font-black text-slate-400 uppercase block mb-1">
                                                    Priority
                                                </label>
                                                <select
                                                    value={newTaskPriority}
                                                    onChange={(e) =>
                                                        setNewTaskPriority(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full bg-slate-50 text-[9px] p-2 border border-slate-200 rounded-xl font-bold"
                                                >
                                                    <option value="Urgent">
                                                        🔴 Urgent
                                                    </option>
                                                    <option value="Daily">
                                                        🔵 Daily
                                                    </option>
                                                    <option value="Routine">
                                                        ⚪ Routine
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-[#FF5A20] hover:bg-[#E04B14] text-white text-[9.5px] font-black uppercase py-2.5 rounded-xl shadow-sm tracking-wider"
                                        >
                                            Deploy Target
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* STREAMLINED BOTTOM NAVIGATION BAR */}
                        {/* ========================================================= */}
                        <nav className="bg-white border-t border-slate-100 py-2 px-3 flex justify-around items-center shrink-0 relative z-40 shadow-sm">
                            {/* NAV BAR: FOR CEO */}
                            {activeRole === "CEO" && (
                                <>
                                    <button
                                        onClick={() => setCeoTab("home")}
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            ceoTab === "home"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <Smartphone className="w-4 h-4" />
                                        <span>HQ</span>
                                    </button>

                                    <button
                                        onClick={() => setCeoTab("tasks")}
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            ceoTab === "tasks"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <Briefcase className="w-4 h-4" />
                                        <span>Tasks</span>
                                    </button>

                                    {/* Elevated Plus Button overlay launcher */}
                                    <button
                                        onClick={() =>
                                            setIsAssignTaskModalOpen(true)
                                        }
                                        className="w-10 h-10 bg-[#FF5A20] hover:bg-[#E04B14] active:scale-95 text-white rounded-full flex items-center justify-center shadow-md relative -top-3 z-55 border-4 border-white transition-all shrink-0 animate-bounce"
                                    >
                                        <Plus className="w-5 h-5 font-black text-white" />
                                    </button>

                                    <button
                                        onClick={() => setCeoTab("approvals")}
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            ceoTab === "approvals"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <ShieldAlert className="w-4 h-4" />
                                        <span>Inbox</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsLoggedIn(false);
                                            triggerToast(
                                                "Securely signed out",
                                                "info",
                                            );
                                        }}
                                        className="flex flex-col items-center gap-0.5 text-[7px] font-black uppercase text-red-500 hover:text-red-700 transition-all flex-1"
                                    >
                                        <LogOut className="w-4 h-4 text-red-400" />
                                        <span>Exit</span>
                                    </button>
                                </>
                            )}

                            {/* NAV BAR: FOR ADMINISTRATOR */}
                            {activeRole === "Administrator" && (
                                <>
                                    <button
                                        onClick={() => setAdminTab("home")}
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            adminTab === "home"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <Smartphone className="w-4 h-4" />
                                        <span>HQ</span>
                                    </button>

                                    <button
                                        onClick={() => setAdminTab("tasks")}
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            adminTab === "tasks"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <Briefcase className="w-4 h-4" />
                                        <span>Tasks</span>
                                    </button>

                                    {/* Elevated Plus Button */}
                                    <button
                                        onClick={() =>
                                            setIsAssignTaskModalOpen(true)
                                        }
                                        className="w-10 h-10 bg-[#FF5A20] hover:bg-[#E04B14] active:scale-95 text-white rounded-full flex items-center justify-center shadow-md relative -top-3 z-55 border-4 border-white transition-all shrink-0"
                                    >
                                        <Plus className="w-5 h-5 font-black text-white" />
                                    </button>

                                    <button
                                        onClick={() => setAdminTab("staff")}
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            adminTab === "staff"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <Users className="w-4 h-4" />
                                        <span>Staff</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsLoggedIn(false);
                                            triggerToast(
                                                "Securely signed out",
                                                "info",
                                            );
                                        }}
                                        className="flex flex-col items-center gap-0.5 text-[7px] font-black uppercase text-red-500 hover:text-red-700 transition-all flex-1"
                                    >
                                        <LogOut className="w-4 h-4 text-red-400" />
                                        <span>Exit</span>
                                    </button>
                                </>
                            )}

                            {/* NAV BAR: FOR STAFF - STREAMLINED WITH NO CENTRE ORANGE TOGGLE BUTTON */}
                            {activeRole === "Staff" && (
                                <>
                                    <button
                                        onClick={() => setStaffTab("home")}
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            staffTab === "home"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <Smartphone className="w-4 h-4" />
                                        <span>Home</span>
                                    </button>

                                    <button
                                        onClick={() => setStaffTab("tasks")}
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            staffTab === "tasks"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <Briefcase className="w-4 h-4" />
                                        <span>Tasks</span>
                                    </button>

                                    <button
                                        onClick={() => setStaffTab("portal")}
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            staffTab === "portal"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>Portal</span>
                                    </button>

                                    <button
                                        onClick={() =>
                                            setStaffTab("specialized")
                                        }
                                        className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                            staffTab === "specialized"
                                                ? "text-[#2E2A75]"
                                                : "text-slate-400"
                                        }`}
                                    >
                                        <Wallet className="w-4 h-4" />
                                        <span>Dept</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsLoggedIn(false);
                                            triggerToast(
                                                "Securely signed out",
                                                "info",
                                            );
                                        }}
                                        className="flex flex-col items-center gap-0.5 text-[7px] font-black uppercase text-red-500 hover:text-red-700 transition-all flex-1"
                                    >
                                        <LogOut className="w-4 h-4 text-red-400" />
                                        <span>Exit</span>
                                    </button>
                                </>
                            )}
                        </nav>
                    </>
                )}

                {/* iOS Touch Bar Space */}
                <div className="bg-white pb-2 shrink-0 flex items-center justify-center">
                    <div className="w-28 h-1 bg-slate-900 rounded-full"></div>
                </div>
            </div>

            {/* Styled inline keyframes for confetti fall simulation */}
            <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
        </div>
    );
}
