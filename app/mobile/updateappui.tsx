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
    Fingerprint,
    AlertTriangle,
    Stethoscope,
    Shield,
    Key,
    Target,
    RefreshCw,
    Camera
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
    const [isLoggingIn, setIsLoggingIn] = useState(false);
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
    const [newTaskAssignee, setNewTaskAssignee] = useState("");
    const [staffSearchQuery, setStaffSearchQuery] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState("Medium");
    const [newTaskDeadlineDate, setNewTaskDeadlineDate] = useState("");
    const [newTaskDeadlineTime, setNewTaskDeadlineTime] = useState("");
    const [isTaskDaily, setIsTaskDaily] = useState(false);

    // Finance state mirroring image_105141.jpg
    const [finUloomX, setFinUloomX] = useState("12000");
    const [finUsthad, setFinUsthad] = useState("24000");
    const [finExpenses, setFinExpenses] = useState("20000");
    const [todayUloomx, setTodayUloomx] = useState(0);
    const [todayUsthad, setTodayUsthad] = useState(0);
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
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isGeneralReqModalOpen, setIsGeneralReqModalOpen] = useState(false);
    const [isLeaveReqModalOpen, setIsLeaveReqModalOpen] = useState(false);
    const [isCommunityBoardOpen, setIsCommunityBoardOpen] = useState(false);
    const [notification, setNotification] = useState(null);

    // General request wizard states
    const [genReqStep, setGenReqStep] = useState(1);
    const [genReqType, setGenReqType] = useState('budget');
    const [budgetAmt, setBudgetAmt] = useState('');
    const [budgetCat, setBudgetCat] = useState('marketing');
    const [budgetCatOther, setBudgetCatOther] = useState('');
    const [budgetReason, setBudgetReason] = useState('');
    const [accessSystem, setAccessSystem] = useState('finance');
    const [accessSystemOther, setAccessSystemOther] = useState('');
    const [accessDuration, setAccessDuration] = useState('temporary');
    const [accessJustification, setAccessJustification] = useState('');
    const [roleDesignation, setRoleDesignation] = useState('');
    const [roleEffectiveDate, setRoleEffectiveDate] = useState('');
    const [roleReason, setRoleReason] = useState('');
    const [permAction, setPermAction] = useState('delete_records');
    const [permActionOther, setPermActionOther] = useState('');
    const [permUrgency, setPermUrgency] = useState('medium');
    const [permJustification, setPermJustification] = useState('');

    // Leave request wizard states
    const [leaveStep, setLeaveStep] = useState(1);
    const [leaveType, setLeaveType] = useState('medical');
    const [leaveStartDate, setLeaveStartDate] = useState('');
    const [leaveEndDate, setLeaveEndDate] = useState('');
    const [leaveEarlyTime, setLeaveEarlyTime] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [leaveTotalDays, setLeaveTotalDays] = useState(1);
    const [taskFilterStatus, setTaskFilterStatus] = useState("All");
    const [rawLeads, setRawLeads] = useState([]);
    const [salesEvaluationsTaken, setSalesEvaluationsTaken] = useState("25");

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
        // Automatically dismiss after 2.5 seconds
        setTimeout(() => {
            setCongratsData(null);
        }, 2500);
    };

    const requestNotificationPermission = async () => {
        try {
            console.log("Requesting notification permissions...");
            // 1. Web Standard notification prompt
            if (typeof window !== "undefined" && "Notification" in window) {
                const permission = await window.Notification.requestPermission();
                if (permission === "granted") {
                    console.log("Web notification permission granted.");
                    triggerToast("Notifications enabled!", "success");
                    return;
                }
            }
            
            // 2. Capacitor Native notification prompt (for iOS/Android App builds)
            const cap = (window as any).Capacitor;
            if (cap) {
                console.log("Capacitor shell detected. Requesting native permissions...");
                const localNotifications = cap.Plugins?.LocalNotifications;
                if (localNotifications) {
                    const status = await localNotifications.requestPermissions();
                    if (status.display === "granted") {
                        triggerToast("Native notifications enabled!", "success");
                    }
                }
                const pushNotifications = cap.Plugins?.PushNotifications;
                if (pushNotifications) {
                    const status = await pushNotifications.requestPermissions();
                    if (status.receive === "granted") {
                        await pushNotifications.register();
                    }
                }
            }
        } catch (err) {
            console.error("Failed to request notification permission:", err);
        }
    };

    const totalLeads = rawLeads.length;
    const totalConversions = rawLeads.filter(l => l.status === "converted").length;
    const totalActiveTasksCount = tasks.filter(
        (t) => t.status !== "Completed",
    ).length;

    const getGreetingText = () => {
        const hrs = new Date().getHours();
        if (hrs >= 5 && hrs < 12) return "Good Morning";
        if (hrs >= 12 && hrs < 17) return "Good Afternoon";
        return "Good Evening";
    };

    // Calculate leave total days
    useEffect(() => {
        if (leaveStartDate && leaveEndDate) {
            const start = new Date(leaveStartDate);
            const end = new Date(leaveEndDate);
            if (end >= start) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setLeaveTotalDays(diffDays);
            } else {
                setLeaveTotalDays(1);
            }
        }
    }, [leaveStartDate, leaveEndDate]);

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
            // 1. Fetch Leads first to calculate stats
            const { data: leadsData } = await supabase
                .from("leads")
                .select("*");
            
            if (leadsData) {
                setRawLeads(leadsData);
                const total = leadsData.length;
                const converted = leadsData.filter(l => l.status === "converted").length;
                const lost = leadsData.filter(l => l.status === "lost").length;
                setSalesLeads(total.toString());
                setSalesEvaluations(converted.toString());
                setSalesLostLeads(lost.toString());
            }

            // 2. Fetch Staff Profiles
            const { data: staffData } = await supabase
                .from("profiles")
                .select("*")
                .neq("role", "ceo")
                .order("created_at", { ascending: false });
            
            if (staffData) {
                const parsed = staffData.map((s) => {
                    const memberLeads = leadsData ? leadsData.filter(l => l.assigned_to === s.id) : [];
                    const memberConversions = memberLeads.filter(l => l.status === "converted");
                    return {
                        id: s.id,
                        name: s.full_name || s.username || "Operative",
                        loginId: s.username || "",
                        email: s.email || "",
                        role: s.role === 'manager' ? 'Manager' : 'Staff',
                        dept: s.department || "Sales",
                        avatar: s.avatar_url || (s.department === "Finance" ? "👨‍💻" : s.department === "Sales" ? "👩‍🎨" : "👩‍💼"),
                        leads: memberLeads.length || (s.is_sales_staff ? 150 : 80),
                        conversions: memberConversions.length || (s.is_sales_staff ? 48 : 18),
                        target: s.is_sales_staff ? 80 : 20,
                    };
                });
                setStaff(parsed);
            }

            // 3. Fetch Tasks
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
                    status: (t.status === "completed" || t.status === "COMPLETED") ? "Completed" : t.status === "in_review" ? "Under Review" : "In Progress",
                    assignedBy: t.creator?.full_name || "CEO",
                    reviewedByInfo: t.reviewed_by_info,
                    reviewedAt: t.reviewed_at,
                    ceoReviewed: t.ceo_reviewed
                }));
                setTasks(parsed);
            }

            // 4. Fetch Requests
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

            // 5. Fetch Broadcasts
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

            // 6. Fetch Todo Checklist (Ideas)
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

            // 7. Fetch Financials
            const { data: entries } = await supabase
                .from('financial_entries')
                .select('*')
                .order('entry_date', { ascending: false });
            
            if (entries && entries.length > 0) {
                const today = new Date().toISOString().split('T')[0];
                const todayEntries = entries.filter(e => e.entry_date === today);
                const tUloomx = todayEntries.reduce((sum, e) => sum + (parseFloat(e.uloomx_income) || 0), 0);
                const tUsthad = todayEntries.reduce((sum, e) => sum + (parseFloat(e.usthad_income) || 0), 0);
                setTodayUloomx(tUloomx);
                setTodayUsthad(tUsthad);

                const currentMonth = new Date().toISOString().slice(0, 7);
                const monthEntries = entries.filter(e => e.entry_date.startsWith(currentMonth));
                const mUloomx = monthEntries.reduce((sum, e) => sum + (parseFloat(e.uloomx_income) || 0), 0);
                const mUsthad = monthEntries.reduce((sum, e) => sum + (parseFloat(e.usthad_income) || 0), 0);
                const mExpenses = monthEntries.reduce((sum, e) => sum + (parseFloat(e.total_expenses) || 0), 0);

                setFinUloomX(mUloomx.toString());
                setFinUsthad(mUsthad.toString());
                setFinExpenses(mExpenses.toString());
                
                setFinanceHistory(entries.slice(0, 5).map(e => ({
                    date: new Date(e.entry_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    income: (parseFloat(e.uloomx_income) || 0) + (parseFloat(e.usthad_income) || 0),
                    expenses: parseFloat(e.total_expenses) || 0
                })));
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

        setIsLoggingIn(true);
        try {
            const input = loginUsername.toLowerCase().trim();
            const isEmail = input.includes("@");
            let emailToUse = input;

            try {
                if (!isEmail) {
                    // Resolve username to email using live Supabase profile
                    const { data: profData, error } = await supabase
                        .from("profiles")
                        .select("email")
                        .ilike("username", input)
                        .maybeSingle();
                    
                    if (error || !profData) {
                        throw new Error(
                            error
                                ? "System error during identity verification"
                                : "User not found with this username"
                        );
                    }
                    emailToUse = profData.email;
                }

                await signIn(emailToUse, loginPassword);
                
                // Request Notification Permission on successful identity authentication
                await requestNotificationPermission();
                
                // Immediately resolve active profile to load role and transition view instantly
                const { data: { user: authedUser } } = await supabase.auth.getUser();
                if (authedUser) {
                    const { data: activeProfile } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", authedUser.id)
                        .single();
                    
                    if (activeProfile) {
                        if (activeProfile.role === 'ceo') {
                            setActiveRole("CEO");
                        } else if (activeProfile.role === 'admin' || activeProfile.role === 'manager' || activeProfile.is_manager) {
                            setActiveRole("Administrator");
                        } else {
                            setActiveRole("Staff");
                        }
                        setSelectedStaffId(activeProfile.id);
                    }
                }
                
                setIsLoggedIn(true);
                triggerToast("Identity verified. Initializing secure session...", "success");
            } catch (authError) {
                throw authError;
            }
        } catch (err) {
            console.error("Login verification failed:", err);
            triggerToast(err.message || "SECURITY ALERT: Verification failed", "error");
        } finally {
            setIsLoggingIn(false);
        }
    };



    const handleUpdateAvatar = async (newAvatarUrl) => {
        try {
            if (user) {
                const { error } = await supabase
                    .from("profiles")
                    .update({ avatar_url: newAvatarUrl })
                    .eq("id", user.id);
                
                if (error) throw error;
                
                triggerToast("Identity avatar updated successfully!", "success");
                
                // Fetch latest data to force update
                fetchLiveDatabaseData();
            } else {
                // Simulation update
                triggerToast("Avatar updated (Simulation)", "success");
            }
        } catch (err) {
            console.error("Failed to update avatar:", err);
            triggerToast("Failed to update avatar", "error");
        }
    };

    // Assign new directive (task)
    const handleDeployTaskSubmit = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !newTaskDesc.trim() || !newTaskAssignee) {
            triggerToast("Assignee and title are required", "error");
            return;
        }
        try {
            let dueDateTime = null;
            if (newTaskDeadlineDate) {
                dueDateTime = newTaskDeadlineTime 
                    ? new Date(`${newTaskDeadlineDate}T${newTaskDeadlineTime}`).toISOString()
                    : new Date(newTaskDeadlineDate).toISOString();
            }
            const { error } = await supabase.from("tasks").insert({
                title: newTaskTitle.trim(),
                description: newTaskDesc.trim(),
                assigned_to: newTaskAssignee,
                priority: newTaskPriority.toLowerCase(),
                status: "pending",
                created_by: user?.id || "ceo-id",
                is_daily_task: isTaskDaily,
                due_date: dueDateTime,
            });
            if (!error) {
                setNewTaskTitle("");
                setNewTaskDesc("");
                setNewTaskAssignee("");
                setNewTaskDeadlineDate("");
                setNewTaskDeadlineTime("");
                setIsTaskDaily(false);
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

    const handleGeneralRequestSubmit = async (e) => {
        e.preventDefault();
        let title = '';
        let description = '';
        let amountVal = null;

        if (genReqType === 'budget') {
            if (!budgetAmt || !budgetReason) { triggerToast('Complete details first', 'error'); return; }
            const finalCat = budgetCat === 'other' ? budgetCatOther : budgetCat;
            title = "Budget Request: " + finalCat.toUpperCase();
            description = "Amount: $" + budgetAmt + " | Category: " + finalCat + " | Reason: " + budgetReason;
            amountVal = parseFloat(budgetAmt);
        } 
        else if (genReqType === 'access_elevation') {
            if (!accessJustification) { triggerToast('Complete system justification', 'error'); return; }
            const finalSys = accessSystem === 'other' ? accessSystemOther : accessSystem;
            title = "Access Request: " + finalSys.toUpperCase();
            description = "System: " + finalSys + " | Duration: " + accessDuration + " | Justification: " + accessJustification;
        }
        else if (genReqType === 'role_change') {
            if (!roleDesignation || !roleEffectiveDate || !roleReason) { triggerToast('Fill required fields', 'error'); return; }
            title = "Role Change: " + roleDesignation;
            description = "New Designation: " + roleDesignation + " | Effective: " + roleEffectiveDate + " | Reason: " + roleReason;
        }
        else if (genReqType === 'permission') {
            if (!permJustification) { triggerToast('Please clarify permissions required', 'error'); return; }
            const finalAct = permAction === 'custom' ? permActionOther : permAction;
            title = "Permission: " + finalAct.toUpperCase();
            description = "Action: " + finalAct + " | Urgency: " + permUrgency + " | Justification: " + permJustification;
        }

        try {
            const { error } = await supabase.from("requests").insert({
                type: genReqType,
                submitted_by: user?.id || selectedStaffId,
                title,
                description,
                amount: amountVal,
                priority: 'normal',
                status: 'pending'
            });

            if (!error) {
                setGenReqStep(4);
                triggerToast("Your system request has been filed!", "success");
                fetchLiveDatabaseData();
            } else {
                throw error;
            }
        } catch (err) {
            console.error("General request failed:", err);
            triggerToast("Failed to file system request", "error");
        }
    };

    const handleLeaveRequestSubmit = async (e) => {
        e.preventDefault();
        if (!leaveReason) { triggerToast('Provide CEO Note reason', 'error'); return; }

        let title = '';
        let description = '';

        const categoryLabel = leaveType.toUpperCase() + " LEAVE";

        if (leaveType === 'early') {
            if (!leaveEarlyTime) { triggerToast('Select Departure Time', 'error'); return; }
            title = "Early Leave: " + leaveEarlyTime;
            description = "[EARLY LEAVE] Departure Time: " + leaveEarlyTime + " | Reason: " + leaveReason;
        } else {
            if (!leaveStartDate || !leaveEndDate) { triggerToast('Select Dates', 'error'); return; }
            title = categoryLabel + ": " + leaveStartDate + " - " + leaveEndDate;
            description = "[" + categoryLabel + "] " + leaveTotalDays + " day(s): " + leaveReason;
        }

        try {
            const { error } = await supabase.from("requests").insert({
                type: 'leave',
                submitted_by: user?.id || selectedStaffId,
                title,
                description,
                status: 'pending',
                dates: leaveType === 'early' ? null : `${leaveStartDate} - ${leaveEndDate}`,
                total_days: leaveType === 'early' ? null : leaveTotalDays,
                time_range: leaveType === 'early' ? leaveEarlyTime : null,
                purpose: leaveType
            });

            if (!error) {
                setLeaveStep(3);
                triggerToast("Your leave request has been submitted!", "success");
                fetchLiveDatabaseData();
            } else {
                throw error;
            }
        } catch (err) {
            console.error("Leave request failed:", err);
            triggerToast("Failed to submit leave request", "error");
        }
    };

    const handleApplyQuickDays = (daysCount) => {
        if (!leaveStartDate) {
            triggerToast("Select Start Date first", "error");
            return;
        }
        const start = new Date(leaveStartDate);
        const end = new Date(start.getTime() + (daysCount - 1) * 24 * 60 * 60 * 1000);
        setLeaveEndDate(end.toISOString().split('T')[0]);
    };

    const getSalesOverviewStats = () => {
        const todayStr = new Date().toDateString();
        
        const todaysLeads = rawLeads.filter(l => {
            return l.created_at && new Date(l.created_at).toDateString() === todayStr;
        });
        const todaysConversions = todaysLeads.filter(l => l.status === "converted");

        // Staff Performance List (Sales staff name, leads, conversions)
        const salesStaff = staff.filter(s => s.dept === "Sales" || s.dept?.toLowerCase() === "sales");
        const staffPerformance = salesStaff.map(member => {
            const memberLeads = rawLeads.filter(l => l.assigned_to === member.id);
            const memberConversions = memberLeads.filter(l => l.status === "converted");
            return {
                id: member.id,
                name: member.name,
                avatar: member.avatar,
                role: member.role,
                leads: memberLeads.length,
                conversions: memberConversions.length
            };
        });

        return {
            todaysLeadsCount: todaysLeads.length,
            todaysConversionsCount: todaysConversions.length,
            staffPerformance
        };
    };

    const handleTransmitDailySalesReport = async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const leadsNum = parseInt(salesLeads) || 0;
            const convsNum = parseInt(salesEvaluations) || 0;
            const evalsNum = parseInt(salesEvaluationsTaken) || convsNum;
            const lostNum = parseInt(salesLostLeads) || 0;
            const qualityNum = salesQualityScore || 7;

            const { error: error1 } = await supabase
                .from("daily_sales_tracking")
                .upsert({
                    profile_id: profile?.id,
                    tracking_date: todayStr,
                    total_leads: leadsNum,
                    conversions: convsNum,
                    evaluations_taken: evalsNum,
                    lost_leads: lostNum,
                    lead_quality_rating: qualityNum,
                    updated_at: new Date().toISOString()
                });

            if (error1) throw error1;

            const rate = leadsNum > 0 ? Math.round((convsNum / leadsNum) * 100) : 0;
            const efficiency = (convsNum + lostNum) > 0 ? Math.round((convsNum / (convsNum + lostNum)) * 100) : 0;

            const { error: error2 } = await supabase
                .from("daily_reports")
                .upsert({
                    user_id: user?.id,
                    profile_id: profile?.id,
                    reporter_name: profile?.full_name || "Sales Agent",
                    report_date: todayStr,
                    total_leads: leadsNum,
                    conversions: convsNum,
                    evaluations_taken: evalsNum,
                    lost_leads: lostNum,
                    lead_quality_rating: qualityNum,
                    conversion_rate: rate,
                    efficiency_score: efficiency,
                    submitted_at: new Date().toISOString()
                });

            if (error2) throw error2;

            triggerToast("Daily Sales Report Synchronized successfully!", "success");
            triggerCongrats("Daily Report Transmitted! 🚀", "Daily conversion pipeline metrics locked and compiled for executive audit.");
            fetchLiveDatabaseData();
        } catch (err) {
            console.error("Failed to transmit sales report:", err);
            triggerToast("Failed to transmit sales report", "error");
        }
    };

    const handleTransmitFinancialReport = async () => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const uloomx = parseFloat(finUloomX) || 0;
            const usthad = parseFloat(finUsthad) || 0;
            const expenses = parseFloat(finExpenses) || 0;
            const revenue = uloomx + usthad - expenses;

            const { error } = await supabase
                .from("financial_entries")
                .insert({
                    user_id: user?.id,
                    entry_date: todayStr,
                    uloomx_income: uloomx,
                    usthad_income: usthad,
                    total_expenses: expenses,
                    revenue: revenue,
                    status: 'pending',
                    submitted_by: profile?.full_name || "Finance Agent"
                });

            if (error) throw error;

            triggerToast("Daily Ledger transaction synchronized successfully!", "success");
            triggerCongrats("Ledger Synchronized! 💸", "Financial distributions locked and compiled for audit review.");
            fetchLiveDatabaseData();
        } catch (err) {
            console.error("Failed to transmit financial report:", err);
            triggerToast("Failed to transmit financial report", "error");
        }
    };

    const getAdminFilteredTasks = () => {
        const isManager = profile?.role === "manager" || profile?.is_manager;
        const dept = profile?.department || "Sales";

        let list = tasks;

        if (isManager && dept !== "Administration") {
            if (taskFilterStatus === "My Tasks") {
                return list.filter(t => t.assigneeId === profile?.id);
            } else {
                return list.filter(t => {
                    const assignee = staff.find(s => s.id === t.assigneeId);
                    return assignee?.dept?.toLowerCase() === dept.toLowerCase();
                });
            }
        }

        if (taskFilterStatus === "All") return list;
        if (taskFilterStatus === "My Tasks") return list.filter(t => t.assigneeId === profile?.id);
        
        return list.filter(t => {
            const assignee = staff.find(s => s.id === t.assigneeId);
            return assignee?.dept?.toLowerCase() === taskFilterStatus.toLowerCase();
        });
    };

    const renderRequestHub = () => {
        const filedRequests = requests.filter(r => r.staffId === user?.id || r.staffId === profile?.id);
        return (
            <div className="space-y-4 animate-fadeIn">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
                    <span className="text-[9.5px] font-black text-[#2E2A75] uppercase block tracking-wider">
                        Communication & Requests Hub
                    </span>
                    <p className="text-[8px] text-slate-400 leading-relaxed font-bold text-slate-500">
                        Submit operational leaves or request access authorizations directly into the central database.
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setLeaveStep(1);
                                setIsLeaveReqModalOpen(true);
                            }}
                            className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-rose-100/50 transition duration-200"
                        >
                            <span className="p-1.5 bg-rose-500 rounded-xl text-white mb-2 shadow-sm">
                                <Stethoscope className="w-5 h-5" />
                            </span>
                            <span className="text-[9.5px] font-black text-rose-900 uppercase">
                                Request Leave
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setGenReqStep(1);
                                setIsGeneralReqModalOpen(true);
                            }}
                            className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-indigo-100/50 transition duration-200"
                        >
                            <span className="p-1.5 bg-[#2E2A75] rounded-xl text-white mb-2 shadow-sm">
                                <Plus className="w-5 h-5" />
                            </span>
                            <span className="text-[9.5px] font-black text-indigo-900 uppercase">
                                Elevate Access
                            </span>
                        </button>
                    </div>
                </div>

                {/* Display recent Request statuses */}
                <div className="space-y-2">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block px-1">
                        Your Filed Applications
                    </span>
                    {filedRequests.length === 0 ? (
                        <div className="p-4 bg-slate-50 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-[8.5px] font-semibold">
                            No requests filed yet.
                        </div>
                    ) : (
                        filedRequests.map((req) => (
                            <div
                                key={req.id}
                                className="bg-white p-3 rounded-2xl border border-slate-100 flex justify-between items-center text-[9px]"
                            >
                                <div className="truncate pr-4">
                                    <p className="font-bold text-slate-800 truncate">{req.title}</p>
                                    <span className="text-[7.5px] text-slate-400 uppercase block">
                                        {req.date}
                                    </span>
                                </div>
                                <span
                                    className={`text-[7px] font-black px-2 py-0.5 rounded-full uppercase ${
                                        req.status === "Approved" || req.status === "approved"
                                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                                            : req.status === "Declined" || req.status === "rejected" || req.status === "Declined"
                                            ? "bg-red-50 text-red-800 border border-red-100"
                                            : "bg-amber-50 text-amber-800 border border-amber-100"
                                    }`}
                                >
                                    {req.status}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
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
                    triggerToast(`Task "${todoItem.text}" completed!`, "success");
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
        const status = progressVal === 100 ? "COMPLETED" : progressVal > 0 ? "in_progress" : "pending";
        try {
            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? { ...t, progress: progressVal, status: progressVal === 100 ? "Completed" : status } : t))
            );
            
            const updatePayload: any = {
                progress: progressVal,
                status: status,
                updated_at: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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

    // Complete task directly
    const handleCompleteTask = async (taskId) => {
        try {
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
            if (!error) {
                triggerCongrats("Task Completed! 🚀", `Directive officially 100% finished.`);
                fetchLiveDatabaseData();
            }
        } catch (err) {
            console.error("Task complete error:", err);
        }
    };

    // Submit task for review
    const handleTaskSubmitForReview = async (taskId) => {
        try {
            const { error } = await supabase
                .from("tasks")
                .update({ 
                    status: "in_review", 
                    progress: 100, 
                    updated_at: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                })
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
        <div className="fixed inset-0 bg-[#FAFAFC] flex flex-col font-sans text-slate-850 selection:bg-orange-200 overflow-hidden touch-none">
            {/* Main Application Container */}
            <div className="relative flex-1 w-full overflow-hidden flex flex-col">

                {/* GLOBAL PREMIUM LOADING OVERLAY */}
                {isLoggingIn && (
                    <div className="absolute inset-0 bg-[#2E2A75]/30 backdrop-blur-md z-60 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                        <div className="bg-white/95 p-8 rounded-3xl shadow-2xl border border-white/50 flex flex-col items-center space-y-4 max-w-[280px]">
                            {/* Spinning glow logo container */}
                            <div className="w-16 h-16 p-2 rounded-2xl bg-white border border-slate-100 shadow-lg flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 rounded-2xl border-4 border-t-[#FF5A20] border-r-transparent border-b-transparent border-l-[#FF5A20] animate-spin"></div>
                                <img
                                    src="/images/usthadacademylogo2.svg"
                                    className="w-10 h-10 object-contain"
                                    alt="Usthad Academy"
                                    onError={(e) => {
                                        (e.target as any).src = "https://placehold.co/44x44/2E2A75/ffffff?text=UA";
                                    }}
                                />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-[#2E2A75] uppercase tracking-widest animate-pulse">
                                    Verifying Identity
                                </h3>
                                <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-1 leading-normal">
                                    Establishing Secure Cryptographic Port...
                                </p>
                            </div>
                            {/* Animated loading bar */}
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden relative">
                                <div className="absolute bg-[#FF5A20] h-full left-0 top-0 w-1/2 rounded-full animate-loadingBar"></div>
                            </div>
                        </div>
                    </div>
                )}

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

                {/* CONGRATULATIONS CELEBRATION MODAL IN VIEWPORT - SIMPLE & PREMIUM GLASS POPUP */}
                {congratsData && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-55 flex items-center justify-center p-6 text-center animate-fadeIn">
                        <div className="bg-white text-slate-800 rounded-[28px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col items-center space-y-4 max-w-[280px] w-full animate-scaleUp">
                            <div className="bg-gradient-to-br from-amber-400 to-[#FF5A20] p-3 rounded-full shadow-md text-white animate-bounce">
                                <Award className="w-8 h-8" />
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-[13px] font-black tracking-wider text-[#2E2A75] uppercase font-sans">
                                    {congratsData.title}
                                </h2>
                                <p className="text-[9.5px] text-slate-500 font-bold leading-normal px-2 font-sans">
                                    {congratsData.desc}
                                </p>
                            </div>

                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-gradient-to-r from-amber-400 to-[#FF5A20] h-full animate-congratsProgress" />
                            </div>
                        </div>
                    </div>
                )}

                {/* CASE 1: NOT LOGGED IN - MOBILE IDENTITY SUITE */}
                {!isLoggedIn ? (
                    <div className="flex-1 bg-white overflow-y-auto flex flex-col justify-between px-6 pt-[env(safe-area-inset-top,44px)] pb-[env(safe-area-inset-bottom,34px)] relative selection:bg-orange-200 touch-pan-y">
                        {/* Soft, beautiful light mode gradients */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                            <div className="w-[300px] h-[300px] bg-indigo-50 absolute -top-[10%] -left-[10%] rounded-full opacity-60 blur-[60px]" />
                            <div className="w-[300px] h-[300px] bg-orange-50 absolute -bottom-[10%] -right-[10%] rounded-full opacity-60 blur-[50px]" />
                        </div>

                        {/* Top Bar (stretching at the top) */}
                        <div className="relative z-10 pt-4 animate-loginEntrance shrink-0">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A20] animate-pulse"></span>
                                    <span className="text-[7.5px] font-black text-slate-455 uppercase tracking-[0.2em]">
                                        ENCRYPTED EXECUTIVE NODE
                                    </span>
                                </div>
                                <span className="text-[7px] bg-slate-100 text-[#2E2A75] border border-slate-200 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    V4.2.0 STABLE
                                </span>
                            </div>
                        </div>

                        {/* Middle Content Wrapper (logo + auth box perfectly stacked and centered) */}
                        <div className="my-auto py-6 relative z-10 w-full max-w-sm mx-auto flex flex-col justify-center animate-loginEntrance" style={{ animationDelay: '0.1s' }}>
                            {/* Console Logo Brand */}
                            <div className="flex flex-col items-center text-center space-y-3 mb-6">
                                <div className="w-14 h-14 p-2 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-center justify-center animate-logoZoom">
                                    <img
                                        src="/images/usthadacademylogo2.svg"
                                        className="w-full h-full object-contain"
                                        alt="Usthad Academy"
                                        onError={(e) => {
                                            e.target.src = "https://placehold.co/44x44/2E2A75/ffffff?text=UA";
                                        }}
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center justify-center gap-1">
                                        <span className="text-xl font-black text-[#2E2A75] tracking-tight uppercase">
                                            Usthad
                                        </span>
                                        <span className="text-xl font-black text-[#FF5A20] tracking-tight uppercase">
                                            Console.
                                        </span>
                                    </div>
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-1">
                                        Executive Portal Node
                                    </p>
                                </div>
                            </div>

                            {/* Authentication Box (The Form) */}
                            <form
                                onSubmit={(e) => { requestNotificationPermission(); handleAuthSubmit(e); }}
                                className="space-y-5 w-full bg-slate-50/40 border border-slate-100 rounded-3xl p-6 shadow-md"
                            >
                                <div className="space-y-1 text-center">
                                    <h2 className="text-[14px] font-black text-[#2E2A75] uppercase tracking-wider">
                                        Identity Authentication
                                    </h2>
                                    <p className="text-[8px] text-slate-450 font-bold uppercase tracking-[0.2em]">
                                        Verify security clearance to proceed.
                                    </p>
                                </div>

                                {/* Access Identifier input field */}
                                <div className="space-y-1.5">
                                    <label className="text-[8px] text-[#2E2A75] font-black uppercase tracking-[0.15em] ml-1 block">
                                        Access Identifier
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={loginUsername}
                                            onChange={(e) =>
                                                setLoginUsername(e.target.value)
                                            }
                                            placeholder="Username or Email"
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#FF5A20] outline-none transition-all shadow-sm h-13"
                                            required
                                        />
                                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400/60" />
                                    </div>
                                </div>

                                {/* Security Key input field */}
                                <div className="space-y-1.5">
                                    <label className="text-[8px] text-[#2E2A75] font-black uppercase tracking-[0.15em] ml-1 block">
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
                                            placeholder="••••••••••••"
                                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:border-[#FF5A20] outline-none transition-all shadow-sm tracking-widest h-13"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Trust Workstation Switch */}
                                <div className="flex items-center gap-2.5 pt-1 ml-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTrustWorkstation(!trustWorkstation)
                                        }
                                        className="relative flex items-center cursor-pointer h-4 w-7"
                                    >
                                        <div
                                            className={`w-7 h-4 rounded-full transition-all duration-300 ${
                                                trustWorkstation ? "bg-[#FF5A20]" : "bg-slate-200"
                                            }`}
                                        />
                                        <div
                                            className={`absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${
                                                trustWorkstation ? "translate-x-3" : ""
                                            }`}
                                        />
                                    </button>
                                    <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest animate-pulse">
                                        Trust This Workstation
                                    </span>
                                </div>

                                {/* Submit Button */}
                                <div className="space-y-3 pt-2">
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-[#FF5A20] to-[#2E2A75] hover:opacity-95 text-white font-black text-[10px] py-4 rounded-2xl shadow-md uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                                    >
                                        {isLoggingIn ? "Verifying..." : "Access Console"}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>


                            </form>
                        </div>

                        {/* Footer */}
                        <div className="text-center pt-6 opacity-60 relative z-10 pb-2 shrink-0">
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                Proprietary Administrative System © 2026 USTHAD ACADEMY
                            </p>
                        </div>
                    </div>
                ) : (
                    /* ========================================================= */
                    /* CASE 2: LOGGED IN - CORE OPERATIONS SYSTEMS */
                    /* ========================================================= */
                    <>
                        {/* Premium Corporate Light Mode Header */}
                        {!isProfileModalOpen && (
                        <header className="mx-4 mb-safe rounded-[24px] px-5 pt-[calc(env(safe-area-inset-top,44px)+12px)] pb-3.5 bg-white/80 backdrop-blur-md border border-slate-100 flex items-center justify-between shrink-0 relative z-40 shadow-[0_8px_32px_rgba(0,0,0,0.03)] transition-all">
                            <div className="flex items-center gap-2.5">
                                <div className="relative">
                                    <img
                                        src="/images/usthadacademylogo2.svg"
                                        className="w-8 h-8 object-contain rounded-full border border-slate-100 shadow-sm bg-white p-0.5"
                                        alt="Usthad Academy"
                                        onError={(e) => {
                                            (e.target as any).src =
                                                "https://placehold.co/36x36/2E2A75/ffffff?text=UA";
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
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setIsCommunityBoardOpen(true)}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl relative transition-all active:scale-95"
                                >
                                    <Bell className="w-4 h-4 text-slate-600" />
                                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF5A20] rounded-full animate-pulse"></span>
                                </button>
                                
                                {/* User Profile Avatar Button */}
                                <button 
                                    onClick={() => setIsProfileModalOpen(true)}
                                    className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#e86123] to-[#351e6a] flex items-center justify-center text-white border border-slate-200/50 shadow-sm relative active:scale-95 transition-all overflow-hidden"
                                >
                                    {profile?.avatar_url && (profile.avatar_url.startsWith("http") || profile.avatar_url.startsWith("data:")) ? (
                                        <img src={profile.avatar_url} className="w-full h-full object-cover" alt="User Avatar" />
                                    ) : (
                                        <span className="text-xs font-black select-none">
                                            {profile?.avatar_url || (activeRole === "CEO" ? "👑" : "👤")}
                                        </span>
                                    )}
                                </button>
                                
                                {activeRole === "CEO" && (
                                    <span className="text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                                        CEO
                                    </span>
                                )}
                                {activeRole === "Administrator" && (
                                    <span className="text-[8px] font-black text-indigo-700 bg-indigo-50 border border-indigo-150 px-2.5 py-1 rounded-lg">
                                        Admin
                                    </span>
                                )}
                                {activeRole === "Staff" && (
                                    <span className="text-[8px] font-black text-orange-700 bg-orange-50 border border-orange-150 px-2.5 py-1 rounded-lg">
                                        Staff
                                    </span>
                                )}
                            </div>
                        </header>
                        )}



                        {/* ========================================================= */}
                        {/* WORKSPACE VIEWPORTS */}
                        {/* ========================================================= */}
                        <div className="flex-1 overflow-y-auto bg-[#FAFAFC] p-4 touch-pan-y">
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
                                                    className="flex-1 bg-slate-50 text-slate-800 text-[9px] px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-medium placeholder-slate-400"
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
                                                                        if (!todo.completed) {
                                                                            triggerToast("Checklist item completed!", "success");
                                                                        }
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
                                                        {task.status === "Completed" && (task.reviewedAt || task.ceoReviewed) && (
                                                            <span className="text-[7.5px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider block mt-1.5 w-fit">
                                                                ✓ {(task.reviewedByInfo || "Management").toUpperCase()} REVIEWED OK
                                                            </span>
                                                        )}
                                                        <div className="pt-2 border-t border-slate-50 flex justify-between items-center gap-3">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="text-[8px] text-slate-500">
                                                                    <strong className="font-black text-slate-700 font-sans">Staff Name:</strong>{" "}
                                                                    {assignee ? assignee.name : "Unassigned"}
                                                                </span>
                                                                {assignee && (
                                                                    <span className="text-[8px] text-slate-500">
                                                                        <strong className="font-black text-slate-700 font-sans">Designation:</strong>{" "}
                                                                        {assignee.dept} ({assignee.role})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Circular Blue Loader Progress with Percentage */}
                                                            {(() => {
                                                                const radius = 10;
                                                                const strokeWidth = 2.2;
                                                                const circumference = 2 * Math.PI * radius;
                                                                const strokeDashoffset = circumference - (task.progress / 100) * circumference;
                                                                return (
                                                                    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                                                                        <svg className="w-full h-full transform -rotate-90">
                                                                            <circle
                                                                                cx="16"
                                                                                cy="16"
                                                                                r={radius}
                                                                                className="stroke-slate-100"
                                                                                strokeWidth={strokeWidth}
                                                                                fill="transparent"
                                                                            />
                                                                            <circle
                                                                                cx="16"
                                                                                cy="16"
                                                                                r={radius}
                                                                                className="stroke-blue-600 transition-all duration-500 ease-out"
                                                                                strokeWidth={strokeWidth}
                                                                                strokeDasharray={circumference}
                                                                                strokeDashoffset={strokeDashoffset}
                                                                                strokeLinecap="round"
                                                                                fill="transparent"
                                                                            />
                                                                        </svg>
                                                                        <span className="absolute text-[7px] font-black text-blue-700 font-sans">
                                                                            {task.progress}%
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })()}
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
                                                        <span className="text-[8px] font-black uppercase text-slate-400 font-sans">
                                                            Status: {req.status}
                                                        </span>
                                                        {req.status === "Pending" && (
                                                            <div className="flex gap-1.5">
                                                                <button
                                                                    onClick={() =>
                                                                        handleProcessRequest(
                                                                            req.id,
                                                                            "Approved",
                                                                        )
                                                                    }
                                                                    className="bg-emerald-600 text-white font-black text-[8px] px-2.5 py-1 rounded hover:scale-105 active:scale-95 transition-all font-sans"
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
                                                                    className="bg-red-50 text-red-600 border border-red-100 text-[8px] px-2.5 py-1 rounded hover:scale-105 active:scale-95 transition-all font-sans"
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
                                                        {todayUloomx.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                                                    <span className="text-[8px] text-slate-400 font-bold block">
                                                        Today's Usthad Income
                                                    </span>
                                                    <p className="text-base font-black text-[#FF5A20] mt-1">
                                                        ₹
                                                        {todayUsthad.toLocaleString()}
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
                                                            ₹{parseFloat(finUloomX || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            Usthad
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹{parseFloat(finUsthad || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            Expenses
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹{parseFloat(finExpenses || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border border-[#FF5A20] bg-orange-50/20 p-3 rounded-xl flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[7px] font-black text-[#FF5A20] uppercase block">
                                                            Current Balance
                                                        </span>
                                                        <span className="text-sm font-black text-[#FF5A20]">
                                                            ₹{(parseFloat(finUloomX || 0) + parseFloat(finUsthad || 0) - parseFloat(finExpenses || 0)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span className="text-[7.5px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full">
                                                        🟢 Active Cycle
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
                                                    className="flex-1 bg-slate-50 text-slate-800 text-[9px] px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none font-medium placeholder-slate-400"
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

                                    {adminTab === "home" && renderRequestHub()}

                                    {/* ADMIN TAB: TASKS CONTROL & APPROVAL REVIEW */}
                                    {adminTab === "tasks" && (
                                        <div className="space-y-3 animate-fadeIn">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                Assigned Pipeline Log
                                            </span>

                                            {/* Manager-safe Filter Pills */}
                                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                                {(
                                                    (profile?.role === "manager" || profile?.is_manager) && profile?.department !== "Administration"
                                                        ? ["All", "My Tasks"]
                                                        : ["All", "My Tasks", "Sales", "Finance", "Marketing", "Administration"]
                                                ).map((filterVal) => {
                                                    const isActive = taskFilterStatus === filterVal;
                                                    return (
                                                        <button
                                                            key={filterVal}
                                                            type="button"
                                                            onClick={() => setTaskFilterStatus(filterVal)}
                                                            className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-full transition-all shrink-0 border ${
                                                                isActive
                                                                    ? "bg-[#2E2A75] text-white border-[#2E2A75]"
                                                                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                                                            }`}
                                                        >
                                                            {filterVal}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {getAdminFilteredTasks().map((task) => {
                                                const assignee = staff.find(
                                                    (s) =>
                                                        s.id === task.assigneeId || s.id === task.assigned_to,
                                                );
                                                return (
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
                                                        {task.status === "Completed" && (task.reviewedAt || task.ceoReviewed) && (
                                                            <span className="text-[7.5px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider block mt-1.5 w-fit">
                                                                ✓ {(task.reviewedByInfo || "Management").toUpperCase()} REVIEWED OK
                                                            </span>
                                                        )}

                                                        <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                                                            <div className="flex flex-col gap-0.5">
                                                                 <span className="text-[8px] text-slate-500">
                                                                     <strong className="font-black text-slate-700 font-sans">Staff Name:</strong>{" "}
                                                                     {assignee ? assignee.name : "Unassigned"}
                                                                 </span>
                                                                 {assignee && (
                                                                     <span className="text-[8px] text-slate-500">
                                                                         <strong className="font-black text-slate-700 font-sans">Designation:</strong>{" "}
                                                                         {assignee.dept} ({assignee.role})
                                                                     </span>
                                                                 )}
                                                             </div>
                                                             {/* Circular Blue Loader Progress with Percentage */}
                                                             {(() => {
                                                                 const radius = 10;
                                                                 const strokeWidth = 2.2;
                                                                 const circumference = 2 * Math.PI * radius;
                                                                 const strokeDashoffset = circumference - (task.progress / 100) * circumference;
                                                                 return (
                                                                     <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                                                                         <svg className="w-full h-full transform -rotate-90">
                                                                             <circle
                                                                                 cx="16"
                                                                                 cy="16"
                                                                                 r={radius}
                                                                                 className="stroke-slate-100"
                                                                                 strokeWidth={strokeWidth}
                                                                                 fill="transparent"
                                                                             />
                                                                             <circle
                                                                                 cx="16"
                                                                                 cy="16"
                                                                                 r={radius}
                                                                                 className="stroke-blue-600 transition-all duration-500 ease-out"
                                                                                 strokeWidth={strokeWidth}
                                                                                 strokeDasharray={circumference}
                                                                                 strokeDashoffset={strokeDashoffset}
                                                                                 strokeLinecap="round"
                                                                                 fill="transparent"
                                                                             />
                                                                         </svg>
                                                                         <span className="absolute text-[7px] font-black text-blue-700 font-sans">
                                                                             {task.progress}%
                                                                         </span>
                                                                     </div>
                                                                 );
                                                             })()}
                                                         </div>

                                                         {task.status ===
                                                            "Under Review" && (
                                                            <div className="flex gap-1.5 pt-1.5 border-t border-slate-50">
                                                                 <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const { error } = await supabase
                                                                                .from("tasks")
                                                                                .update({ 
                                                                                    status: "COMPLETED", 
                                                                                    progress: 100, 
                                                                                    completed_at: new Date().toISOString(), 
                                                                                    updated_at: new Date().toISOString(),
                                                                                    updatedAt: new Date().toISOString(),
                                                                                    reviewed_by_info: "Admin",
                                                                                    reviewed_at: new Date().toISOString()
                                                                                })
                                                                                .eq("id", task.id);
                                                                            if (!error) {
                                                                                triggerCongrats(
                                                                                    "Task Approved! ✅",
                                                                                    `"${task.title}" is verified and complete.`,
                                                                                );
                                                                                fetchLiveDatabaseData();
                                                                            }
                                                                        } catch (err) {
                                                                            console.error("Admin approve error:", err);
                                                                        }
                                                                    }}
                                                                    className="flex-1 bg-emerald-600 text-white font-bold text-[8px] py-1 rounded font-sans"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const { error } = await supabase
                                                                                .from("tasks")
                                                                                .update({ 
                                                                                    status: "in_progress", 
                                                                                    progress: 50, 
                                                                                    updated_at: new Date().toISOString(),
                                                                                    updatedAt: new Date().toISOString()
                                                                                })
                                                                                .eq("id", task.id);
                                                                            if (!error) {
                                                                                triggerToast(
                                                                                    "Re-routed for revision.",
                                                                                    "info",
                                                                                );
                                                                                fetchLiveDatabaseData();
                                                                            }
                                                                        } catch (err) {
                                                                            console.error("Admin send back error:", err);
                                                                        }
                                                                    }}
                                                                    className="flex-1 bg-red-50 text-red-700 border border-red-100 font-bold text-[8px] py-1 rounded font-sans"
                                                                >
                                                                    Send Back
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
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
                                                        {todayUloomx.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                                                    <span className="text-[8px] text-slate-400 font-bold block">
                                                        Today's Usthad Income
                                                    </span>
                                                    <p className="text-base font-black text-[#FF5A20] mt-1">
                                                        ₹
                                                        {todayUsthad.toLocaleString()}
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
                                                            ₹{parseFloat(finUloomX || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            Usthad
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹{parseFloat(finUsthad || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="bg-slate-50 p-2 rounded-xl">
                                                        <span className="text-[6.5px] font-bold text-slate-400 block">
                                                            Expenses
                                                        </span>
                                                        <span className="text-[9px] font-black text-slate-900 block mt-0.5">
                                                            ₹{parseFloat(finExpenses || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="border border-[#FF5A20] bg-orange-50/20 p-3 rounded-xl flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[7px] font-black text-[#FF5A20] uppercase block">
                                                            Current Balance
                                                        </span>
                                                        <span className="text-sm font-black text-[#FF5A20]">
                                                            ₹{(parseFloat(finUloomX || 0) + parseFloat(finUsthad || 0) - parseFloat(finExpenses || 0)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span className="text-[7.5px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.5 rounded-full">
                                                        🟢 Active Cycle
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ADMIN TAB: SALES VIEWPORT */}
                                    {adminTab === "sales" && (() => {
                                        const { todaysLeadsCount, todaysConversionsCount, staffPerformance } = getSalesOverviewStats();
                                        return (
                                            <div className="space-y-3.5 animate-fadeIn">
                                                <div className="border-l-4 border-[#2E2A75] pl-2">
                                                    <h3 className="text-[11px] font-black text-[#2E2A75] uppercase">
                                                        Sales intelligence
                                                    </h3>
                                                    <p className="text-[7.5px] text-slate-400 font-bold uppercase">
                                                        Assigned conversions & achievements
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2.5">
                                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                                        <span className="text-[7.5px] font-black text-slate-450 uppercase tracking-widest block font-bold">
                                                            Today's Total Leads
                                                        </span>
                                                        <span className="text-base font-black text-[#2E2A75] mt-1 block">
                                                            {todaysLeadsCount}
                                                        </span>
                                                    </div>
                                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm text-center">
                                                        <span className="text-[7.5px] font-black text-slate-455 uppercase tracking-widest block font-bold">
                                                            Today's Conversions
                                                        </span>
                                                        <span className="text-base font-black text-[#FF5A20] mt-1 block">
                                                            {todaysConversionsCount}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                                                    <span className="text-[8.5px] font-black text-[#2E2A75] uppercase block tracking-wider">
                                                        Sales Staff Performance
                                                    </span>
                                                    <div className="space-y-2.5">
                                                        {staffPerformance.map((member) => (
                                                            <div
                                                                key={member.id}
                                                                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-[9px]"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xl">{member.avatar}</span>
                                                                    <div>
                                                                        <span className="font-black text-slate-900 block">
                                                                            {member.name}
                                                                        </span>
                                                                        <span className="text-[7px] text-slate-400 uppercase block font-bold">
                                                                            {member.role}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right flex items-center gap-3">
                                                                    <div>
                                                                        <span className="text-slate-400 font-bold block text-[7px] uppercase">Leads</span>
                                                                        <span className="text-[#2E2A75] font-black block">{member.leads}</span>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-slate-400 font-bold block text-[7px] uppercase">Conversions</span>
                                                                        <span className="text-[#FF5A20] font-black block">{member.conversions}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
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

                                            {/* Assigned Tasks Pipeline (Moved from Tasks page) */}
                                            <div className="space-y-3 animate-fadeIn">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block px-1">
                                                    Your Tasks Desk
                                                </span>

                                                {tasks
                                                    .filter(
                                                        (t) =>
                                                            t.assigneeId ===
                                                            currentStaffProfile.id,
                                                    )
                                                    .map((task) => {
                                                        const radius = 11;
                                                        const strokeWidth = 2.5;
                                                        const circumference = 2 * Math.PI * radius;
                                                        const strokeDashoffset = circumference - (task.progress / 100) * circumference;

                                                        return (
                                                            <div
                                                                key={task.id}
                                                                className="bg-white p-4 rounded-[24px] border border-slate-100 space-y-3.5 shadow-sm relative overflow-hidden text-slate-800"
                                                            >
                                                                <div className="flex justify-between items-start gap-3">
                                                                    <div className="space-y-1.5 flex-1">
                                                                        <span className="text-[7px] font-black bg-indigo-50 text-[#2E2A75] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                                            Deployed by: {task.assignedBy}
                                                                        </span>
                                                                        <h4 className="text-[11px] font-black text-slate-950 leading-tight">
                                                                            {task.title}
                                                                        </h4>
                                                                        <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                                                                            {task.desc}
                                                                        </p>
                                                                        {task.status === "Completed" && (task.reviewedAt || task.ceoReviewed) && (
                                                                            <span className="text-[7.5px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider block mt-1.5 w-fit">
                                                                                ✓ {(task.reviewedByInfo || "Management").toUpperCase()} REVIEWED OK
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Circular Blue Loader Progress with Percentage */}
                                                                    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                                                                        <svg className="w-full h-full transform -rotate-90">
                                                                            <circle
                                                                                cx="18"
                                                                                cy="18"
                                                                                r={radius}
                                                                                className="stroke-slate-100"
                                                                                strokeWidth={strokeWidth}
                                                                                fill="transparent"
                                                                            />
                                                                            <circle
                                                                                cx="18"
                                                                                cy="18"
                                                                                r={radius}
                                                                                className="stroke-blue-600 transition-all duration-500 ease-out"
                                                                                strokeWidth={strokeWidth}
                                                                                strokeDasharray={circumference}
                                                                                strokeDashoffset={strokeDashoffset}
                                                                                strokeLinecap="round"
                                                                                fill="transparent"
                                                                            />
                                                                        </svg>
                                                                        <span className="absolute text-[7.5px] font-black text-blue-700 font-sans">
                                                                            {task.progress}%
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Progress Slider (Only if not completed) */}
                                                                {task.status !== "Completed" ? (
                                                                    <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                                                                        <div className="flex justify-between text-[7.5px] text-slate-450 font-black uppercase tracking-wider">
                                                                            <span>Drag to Adjust Progress</span>
                                                                            <span className="text-[#FF5A20]">{task.progress}%</span>
                                                                        </div>
                                                                        <input
                                                                            type="range"
                                                                            min="0"
                                                                            max="100"
                                                                            value={task.progress}
                                                                            onChange={(e) =>
                                                                                handleProgressSlider(
                                                                                    task.id,
                                                                                    e.target.value,
                                                                                )
                                                                            }
                                                                            className="w-full h-1 bg-slate-200/70 rounded-lg appearance-none cursor-pointer accent-[#FF5A20]"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="bg-emerald-50 text-emerald-700 text-[8px] font-black py-2 rounded-xl text-center uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-1.5 animate-fadeIn">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                                        Task fully completed & approved
                                                                    </div>
                                                                )}

                                                                {/* Complete Button when slider hits 100 but status is not Completed */}
                                                                {task.progress === 100 && task.status !== "Completed" && (
                                                                    <button
                                                                        onClick={() => handleCompleteTask(task.id)}
                                                                        className="w-full bg-[#FF5A20] hover:bg-[#E04B14] active:scale-[0.98] text-white text-[9px] font-black py-2.5 rounded-xl uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 animate-bounce"
                                                                    >
                                                                        <Award className="w-3.5 h-3.5" />
                                                                        Click to Complete Task 🚀
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
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
                                                                    className="w-full bg-slate-50 text-slate-800 text-[10px] px-2 py-1.5 border border-slate-150 rounded-lg outline-none font-bold"
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
                                                                    className="w-full bg-slate-50 text-slate-800 text-[10px] px-2 py-1.5 border border-slate-150 rounded-lg outline-none font-bold"
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
                                                                className="w-full bg-slate-50 text-slate-800 text-[10px] px-2 py-1.5 border border-slate-150 rounded-lg outline-none font-bold"
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
                                                        onClick={handleTransmitFinancialReport}
                                                        className="w-full bg-[#2E2A75] text-white text-[8.5px] py-2 rounded-xl uppercase font-black"
                                                    >
                                                        Transmit Financial Report
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
                                                                    className="w-full bg-slate-50 text-slate-800 text-[9px] font-bold p-1.5 border border-slate-150 rounded-lg outline-none"
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
                                                                    className="w-full bg-slate-50 text-slate-800 text-[9px] font-bold p-1.5 border border-slate-150 rounded-lg outline-none"
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
                                                                    className="w-full bg-slate-50 text-slate-800 text-[9px] font-bold p-1.5 border border-slate-150 rounded-lg outline-none text-[#FF5A20]"
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
                                                                    className="w-full bg-slate-50 text-slate-800 text-[9px] font-bold p-1.5 border border-slate-150 rounded-lg outline-none"
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
                                                        onClick={handleTransmitDailySalesReport}
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
                                        <div className="space-y-4">
                                            {renderRequestHub()}
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
                                                className="w-full bg-slate-50 text-slate-800 text-[10px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
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
                                                    className="w-full bg-slate-50 text-slate-800 text-[9px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
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
                                                    className="w-full bg-slate-50 text-slate-800 text-[9px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
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
                                                className="w-full bg-slate-50 text-slate-800 text-[10px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
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
                                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-4 shadow-2xl border-t border-slate-100 max-h-[85%] overflow-y-auto animate-slideUp text-slate-800">
                                    {/* Pull Indicator */}
                                    <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3"></div>

                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-xs font-bold tracking-widest text-[#2E2A75] uppercase">
                                                Assign Task
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
                                            <X className="w-4 h-4 text-slate-600" />
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
                                                className="w-full bg-slate-50 text-slate-850 text-[10px] px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-[#FF5A20] font-bold"
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
                                                className="w-full bg-slate-50 text-slate-850 text-[10px] p-3 border border-slate-200 rounded-xl outline-none h-16 resize-none font-medium"
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
                                                    className="w-full bg-slate-50 text-slate-850 text-[9px] p-2 border border-slate-200 rounded-xl font-bold"
                                                    required
                                                >
                                                    <option value="">Select Assignee...</option>
                                                    {staff
                                                        .map((s) => (
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
                                                    className="w-full bg-slate-50 text-slate-850 text-[9px] p-2 border border-slate-200 rounded-xl font-bold"
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

                                        {/* Deadline picker */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[7px] font-black text-slate-400 uppercase block mb-1">
                                                    Deadline Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newTaskDeadlineDate}
                                                    onChange={(e) => setNewTaskDeadlineDate(e.target.value)}
                                                    className="w-full bg-slate-50 text-slate-850 text-[9px] p-2 border border-slate-200 rounded-xl font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[7px] font-black text-slate-400 uppercase block mb-1">
                                                    Deadline Time
                                                </label>
                                                <input
                                                    type="time"
                                                    value={newTaskDeadlineTime}
                                                    onChange={(e) => setNewTaskDeadlineTime(e.target.value)}
                                                    className="w-full bg-slate-50 text-slate-850 text-[9px] p-2 border border-slate-200 rounded-xl font-bold"
                                                />
                                            </div>
                                        </div>

                                        {/* Repeat Daily Option */}
                                        <div className="flex items-center gap-2 py-1">
                                            <input
                                                type="checkbox"
                                                id="isTaskDaily"
                                                checked={isTaskDaily}
                                                onChange={(e) => setIsTaskDaily(e.target.checked)}
                                                className="w-4 h-4 text-[#FF5A20] focus:ring-[#FF5A20] border-slate-350 rounded"
                                            />
                                            <label htmlFor="isTaskDaily" className="text-[9.5px] font-bold text-slate-700 select-none">
                                                Repeat Daily Task
                                            </label>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full bg-[#FF5A20] hover:bg-[#E04B14] text-white text-[9.5px] font-black uppercase py-2.5 rounded-xl shadow-sm tracking-wider"
                                        >
                                            Assign Task
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* EXECUTIVE PROFILE & IDENTITY SUITE DRAWER */}
                        {/* ========================================================= */}
                        {isProfileModalOpen && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-55 flex items-end justify-center animate-fadeIn">
                                {/* Backdrop tap closer */}
                                <div 
                                    className="absolute inset-0 z-10" 
                                    onClick={() => setIsProfileModalOpen(false)}
                                />
                                
                                {/* Drawer panel */}
                                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-5 shadow-2xl border-t border-slate-100 max-h-[85%] overflow-y-auto animate-slideUp text-slate-800 relative z-20 touch-pan-y">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-xs font-black uppercase text-[#351e6a] tracking-wider">
                                                Executive Identity Control
                                            </h3>
                                            <p className="text-[7.5px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                Manage your cryptographic executive profile
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => setIsProfileModalOpen(false)}
                                            className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full"
                                        >
                                            <X className="w-3.5 h-3.5 text-slate-500" />
                                        </button>
                                    </div>

                                    {/* Profile Details Card */}
                                    <div className="bg-gradient-to-br from-[#f8f9fc] to-[#f1f5f9] border border-slate-200/50 p-4 rounded-2xl flex items-center gap-4 animate-exec-slide-up">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#e86123] to-[#351e6a] flex items-center justify-center text-white border-2 border-white shadow-md overflow-hidden relative">
                                            {profile?.avatar_url && (profile.avatar_url.startsWith("http") || profile.avatar_url.startsWith("data:")) ? (
                                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="User Avatar" />
                                            ) : (
                                                <span className="text-2xl font-black select-none">
                                                    {profile?.avatar_url || (activeRole === "CEO" ? "👑" : "👤")}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-slate-850 leading-tight">
                                                {profile?.full_name || user?.email || "Academy Operative"}
                                            </h4>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[7.5px] font-black bg-[#351e6a] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                                                    {activeRole}
                                                </span>
                                                <span className="text-[7.5px] font-bold text-slate-500">
                                                    {profile?.department || "Operations HQ"}
                                                </span>
                                            </div>
                                            <p className="text-[8px] font-medium text-slate-400">
                                                {profile?.email || user?.email || "no-email@usthad.com"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Select Premium Business Avatar Emojis */}
                                    <div className="space-y-2 animate-exec-slide-up ua-entry-delay-1">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                                            Select Profile Avatar / Symbol
                                        </label>
                                        <div className="grid grid-cols-8 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/40">
                                            {["👩‍💼", "👨‍💼", "👨‍💻", "👩‍🎨", "🕵️‍♂️", "🧠", "🚀", "👑"].map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleUpdateAvatar(emoji)}
                                                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all bg-white border shadow-xs hover:scale-105 active:scale-95 ${
                                                        profile?.avatar_url === emoji 
                                                            ? "border-[#e86123] bg-orange-50/50 shadow-md ring-2 ring-orange-500/20" 
                                                            : "border-slate-200 hover:border-slate-300"
                                                    }`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Upload Image from Device input field */}
                                    <div className="space-y-1.5 animate-exec-slide-up ua-entry-delay-2">
                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block ml-1">
                                            Or Upload Photo from Device
                                        </label>
                                        <div className="flex flex-col gap-2">
                                            {/* Hidden file input */}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    
                                                    // Limit size to 2MB to keep Base64 payload reasonable
                                                    if (file.size > 2 * 1024 * 1024) {
                                                        triggerToast("Image must be under 2MB", "error");
                                                        return;
                                                    }
                                                    
                                                    const reader = new FileReader();
                                                    reader.onloadend = async () => {
                                                        const base64String = reader.result;
                                                        await handleUpdateAvatar(base64String);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }}
                                                className="hidden"
                                                id="avatar-file-upload-input"
                                            />
                                            
                                            {/* Custom Upload Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    document.getElementById("avatar-file-upload-input")?.click();
                                                }}
                                                className="w-full bg-[#351e6a] hover:bg-[#251654] text-white text-[9.5px] font-black py-3 rounded-xl shadow-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
                                            >
                                                📷 Select Photo from Library
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsProfileModalOpen(false)}
                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[9.5px] font-black uppercase py-3 rounded-xl tracking-wider text-center block"
                                    >
                                        Done
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* NEW REQUEST WIZARD MODAL (Z-INDEX ELEVATION AND SCROLL FIX) */}
                        {/* ========================================================= */}
                        {isGeneralReqModalOpen && (
                            <div className="absolute inset-0 bg-slate-950/40 z-[100] flex items-end justify-center p-0 backdrop-blur-xs">
                                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-4 shadow-2xl border-t border-slate-100 max-h-[85%] overflow-y-auto animate-slideUp text-slate-800">
                                    <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3"></div>

                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-xs font-bold tracking-widest text-[#2E2A75] uppercase">General Request</h3>
                                            <p className="text-[7.5px] text-slate-400 font-extrabold uppercase">Step {genReqStep} of 4</p>
                                        </div>
                                        <button onClick={() => setIsGeneralReqModalOpen(false)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full">
                                            <X className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>

                                    {genReqStep === 1 && (
                                        <div className="space-y-3">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Choose Request Purpose</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => { setGenReqType('budget'); setGenReqStep(2); }}
                                                    className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                                                >
                                                    <Wallet className="w-6 h-6 text-[#FF5A20] mb-1" />
                                                    <span className="text-[9px] font-black uppercase text-slate-900">Budget Request</span>
                                                </button>
                                                <button
                                                    onClick={() => { setGenReqType('access_elevation'); setGenReqStep(2); }}
                                                    className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                                                >
                                                    <Key className="w-6 h-6 text-[#2E2A75] mb-1" />
                                                    <span className="text-[9px] font-black uppercase text-slate-900">Access Elevation</span>
                                                </button>
                                                <button
                                                    onClick={() => { setGenReqType('role_change'); setGenReqStep(2); }}
                                                    className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                                                >
                                                    <Users className="w-6 h-6 text-emerald-600 mb-1" />
                                                    <span className="text-[9px] font-black uppercase text-slate-900">Role Change</span>
                                                </button>
                                                <button
                                                    onClick={() => { setGenReqType('permission'); setGenReqStep(2); }}
                                                    className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                                                >
                                                    <ShieldCheck className="w-6 h-6 text-indigo-600 mb-1" />
                                                    <span className="text-[9px] font-black uppercase text-slate-900">Permissions</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {genReqStep === 2 && (
                                        <form onSubmit={(e) => { e.preventDefault(); setGenReqStep(3); }} className="space-y-3 text-left">
                                            {genReqType === 'budget' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Requested Amount ($)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-extrabold text-[#FF5A20]">$</span>
                                                            <input
                                                                type="number" step="0.01" value={budgetAmt} onChange={(e) => setBudgetAmt(e.target.value)}
                                                                className="w-full bg-slate-50 text-[10px] pl-7 pr-3 py-2 border border-slate-200 rounded-xl font-black outline-none text-slate-850" placeholder="0.00" required
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Category</label>
                                                        <div className="grid grid-cols-4 gap-1">
                                                            {['marketing', 'development', 'office', 'other'].map(cat => (
                                                                <button
                                                                    type="button" key={cat} onClick={() => setBudgetCat(cat)}
                                                                    className={`py-1.5 text-[8px] font-black rounded-lg uppercase ${
                                                                        budgetCat === cat ? 'bg-[#FF5A20] text-white' : 'bg-slate-100 text-slate-650 font-bold'
                                                                    }`}
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {budgetCat === 'other' && (
                                                        <div>
                                                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Custom Category Name</label>
                                                            <input
                                                                type="text" value={budgetCatOther} onChange={(e) => setBudgetCatOther(e.target.value)}
                                                                className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-850" placeholder="Specific category" required
                                                            />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Justification Reason</label>
                                                        <textarea
                                                            rows={4} value={budgetReason} onChange={(e) => setBudgetReason(e.target.value)}
                                                            className="w-full bg-slate-50 text-[9.5px] p-3 border border-slate-200 rounded-xl resize-none font-semibold text-slate-850" placeholder="Provide cost details..." required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {genReqType === 'access_elevation' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Select Targeted System</label>
                                                        <div className="space-y-1.5">
                                                            {['finance', 'student_db', 'admin_panel', 'other'].map(sys => (
                                                                <label key={sys} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
                                                                    <input 
                                                                        type="radio" name="access_system" checked={accessSystem === sys} onChange={() => setAccessSystem(sys)}
                                                                        className="accent-[#FF5A20]"
                                                                    />
                                                                    <span className="text-[9px] font-bold text-slate-700 uppercase">{sys.replace('_', ' ')}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {accessSystem === 'other' && (
                                                        <div>
                                                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Custom System Name</label>
                                                            <input
                                                                type="text" value={accessSystemOther} onChange={(e) => setAccessSystemOther(e.target.value)}
                                                                className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-855" placeholder="System key identifier" required
                                                            />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Duration Constraints</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {['temporary', 'permanent'].map(dur => (
                                                                <button
                                                                    type="button" key={dur} onClick={() => setAccessDuration(dur)}
                                                                    className={`py-2 text-[8px] font-black rounded-lg uppercase ${
                                                                        accessDuration === dur ? 'bg-[#2E2A75] text-white shadow-sm' : 'bg-slate-100 text-slate-650 font-bold'
                                                                    }`}
                                                                >
                                                                    {dur}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Administrative Justification</label>
                                                        <textarea
                                                            rows={3} value={accessJustification} onChange={(e) => setAccessJustification(e.target.value)}
                                                            className="w-full bg-slate-50 text-[9.5px] p-2.5 border border-slate-200 rounded-xl resize-none font-semibold text-slate-855" placeholder="Describe reasons..." required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {genReqType === 'role_change' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">New Designation Title</label>
                                                        <input
                                                            type="text" value={roleDesignation} onChange={(e) => setRoleDesignation(e.target.value)}
                                                            placeholder="e.g. Senior Curriculum Specialist" className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none text-slate-855" required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Effective Date</label>
                                                        <input
                                                            type="date" value={roleEffectiveDate} onChange={(e) => setRoleEffectiveDate(e.target.value)}
                                                            className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold outline-none text-slate-855" required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Executive Motives / Reason</label>
                                                        <textarea
                                                            rows={4} value={roleReason} onChange={(e) => setRoleReason(e.target.value)}
                                                            className="w-full bg-slate-50 text-[9.5px] p-3 border border-slate-200 rounded-xl resize-none font-semibold text-slate-855" placeholder="Detail history track justifications..." required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {genReqType === 'permission' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Action Specific Authority</label>
                                                        <div className="space-y-1">
                                                            {['delete_records', 'export_data', 'modify_financial', 'approve_expenses', 'custom'].map(act => (
                                                                <label key={act} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
                                                                    <input 
                                                                        type="radio" name="perm_action" checked={permAction === act} onChange={() => setPermAction(act)}
                                                                        className="accent-[#FF5A20]"
                                                                    />
                                                                    <span className="text-[9px] font-bold text-slate-700 uppercase">{act.replace('_', ' ')}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {permAction === 'custom' && (
                                                        <div>
                                                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Specify Custom Action</label>
                                                            <input
                                                                type="text" value={permActionOther} onChange={(e) => setPermActionOther(e.target.value)}
                                                                className="w-full bg-slate-50 text-[9.5px] px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-855" placeholder="Describe scope" required
                                                            />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1.5">Administrative Urgency Level</label>
                                                        <div className="grid grid-cols-4 gap-1">
                                                            {['low', 'medium', 'high', 'urgent'].map(urg => (
                                                                <button
                                                                    type="button" key={urg} onClick={() => setPermUrgency(urg)}
                                                                    className={`py-1.5 text-[8px] font-black rounded-lg uppercase ${
                                                                        permUrgency === urg ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-650 font-bold'
                                                                    }`}
                                                                >
                                                                    {urg}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Justification Analysis</label>
                                                        <textarea
                                                            rows={4} value={permJustification} onChange={(e) => setPermJustification(e.target.value)}
                                                            className="w-full bg-slate-50 text-[9.5px] p-3 border border-slate-200 rounded-xl resize-none font-semibold text-slate-855" placeholder="Detail risk assessments..." required
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-2">
                                                <button type="button" onClick={() => setGenReqStep(1)} className="flex-1 bg-slate-100 text-slate-650 text-[9px] font-black py-2.5 rounded-xl uppercase">Back</button>
                                                <button type="submit" className="flex-1 bg-[#2E2A75] text-white text-[9px] font-black py-2.5 rounded-xl uppercase">Save details</button>
                                            </div>
                                        </form>
                                    )}

                                    {genReqStep === 3 && (
                                        <div className="space-y-4 text-left">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Review entries</span>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-[10px]">
                                                <div>
                                                    <span className="text-slate-400 font-bold block">Application Type:</span>
                                                    <span className="font-extrabold text-[#2E2A75] uppercase">{genReqType}</span>
                                                </div>
                                                {genReqType === 'budget' && (
                                                    <>
                                                        <div>
                                                            <span className="text-slate-400 font-bold block">Budget Limit:</span>
                                                            <span className="font-extrabold text-[#FF5A20]">${budgetAmt}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 font-bold block">Reason Justified:</span>
                                                            <p className="text-slate-600 italic">"{budgetReason}"</p>
                                                        </div>
                                                    </>
                                                )}
                                                {genReqType === 'access_elevation' && (
                                                    <>
                                                        <div>
                                                            <span className="text-slate-400 font-bold block">Target System:</span>
                                                            <span className="font-extrabold text-slate-800 uppercase">{accessSystem}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400 font-bold block">Access Justification:</span>
                                                            <p className="text-slate-600 italic">"{accessJustification}"</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <button onClick={() => setGenReqStep(2)} className="flex-1 bg-slate-100 text-slate-650 text-[9px] font-black py-2.5 rounded-xl uppercase">Modify</button>
                                                <button onClick={handleGeneralRequestSubmit} className="flex-1 bg-[#2E2A75] text-white text-[9px] font-black py-2.5 rounded-xl uppercase">Confirm & Transmit</button>
                                            </div>
                                        </div>
                                    )}

                                    {genReqStep === 4 && (
                                        <div className="space-y-4 text-center py-6">
                                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-sm">
                                                <CheckSquare className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-sm font-black text-[#2E2A75] uppercase">Application Filed!</h4>
                                            <button onClick={() => setIsGeneralReqModalOpen(false)} className="w-full bg-[#2E2A75] text-white text-[9.5px] py-2.5 rounded-xl uppercase font-black">Return to Hub</button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* LEAVE REQUEST WIZARD SHEET MODAL (SCROLL AND POSITION FIX) */}
                        {/* ========================================================= */}
                        {isLeaveReqModalOpen && (
                            <div className="absolute inset-0 bg-slate-950/40 z-[100] flex items-end justify-center p-0 backdrop-blur-xs">
                                <div className="bg-white w-full rounded-t-[32px] p-6 space-y-4 shadow-2xl border-t border-slate-100 max-h-[85%] overflow-y-auto animate-slideUp text-slate-800">
                                    <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto -mt-2 mb-3"></div>

                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <div>
                                            <h3 className="text-xs font-bold tracking-widest text-[#2E2A75] uppercase">Leave Request Portal</h3>
                                            <p className="text-[7.5px] text-slate-400 font-extrabold uppercase">Step {leaveStep} of 3</p>
                                        </div>
                                        <button onClick={() => setIsLeaveReqModalOpen(false)} className="p-1 bg-slate-100 hover:bg-slate-200 rounded-full">
                                            <X className="w-4 h-4 text-slate-600" />
                                        </button>
                                    </div>

                                    {leaveStep === 1 && (
                                        <div className="space-y-3">
                                            <span className="text-[8px] font-black text-slate-400 uppercase block">Select Leave Type</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => { setLeaveType('medical'); setLeaveStep(2); }}
                                                    className="bg-rose-50 border border-rose-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                                                >
                                                    <span className="p-1.5 bg-rose-500 rounded-xl text-white mb-2"><Stethoscope className="w-5 h-5" /></span>
                                                    <span className="text-[9.5px] font-black text-rose-900 uppercase">Medical Leave</span>
                                                </button>
                                                <button
                                                    onClick={() => { setLeaveType('casual'); setLeaveStep(2); }}
                                                    className="bg-amber-50 border border-amber-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                                                >
                                                    <span className="p-1.5 bg-amber-500 rounded-xl text-white mb-2"><Coffee className="w-5 h-5" /></span>
                                                    <span className="text-[9.5px] font-black text-amber-900 uppercase">Casual Leave</span>
                                                </button>
                                                <button
                                                    onClick={() => { setLeaveType('early'); setLeaveStep(2); }}
                                                    className="bg-orange-50 border border-orange-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                                                >
                                                    <span className="p-1.5 bg-orange-600 rounded-xl text-white mb-2"><LogOut className="w-5 h-5" /></span>
                                                    <span className="text-[9.5px] font-black text-orange-900 uppercase">Early Leave</span>
                                                </button>
                                                <button
                                                    onClick={() => { setLeaveType('emergency'); setLeaveStep(2); }}
                                                    className="bg-red-50 border border-red-100 p-3 rounded-2xl flex flex-col items-center justify-center text-center"
                                                >
                                                    <span className="p-1.5 bg-red-600 rounded-xl text-white mb-2"><AlertTriangle className="w-5 h-5" /></span>
                                                    <span className="text-[9.5px] font-black text-red-900 uppercase">Emergency</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {leaveStep === 2 && (
                                        <form onSubmit={handleLeaveRequestSubmit} className="space-y-3 text-left">
                                            {leaveType === 'early' ? (
                                                <div>
                                                    <label className="text-[7.5px] font-black text-[#2E2A75] uppercase block mb-1">Requested Departure Time</label>
                                                    <input
                                                        type="time" value={leaveEarlyTime} onChange={(e) => setLeaveEarlyTime(e.target.value)}
                                                        className="w-full bg-slate-50 text-[10px] px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-850" required
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">Start Date</label>
                                                            <input
                                                                type="date" value={leaveStartDate} onChange={(e) => setLeaveStartDate(e.target.value)}
                                                                className="w-full bg-slate-50 text-[9.5px] px-2 py-2 border border-slate-200 rounded-xl font-bold text-slate-850" required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">End Date</label>
                                                            <input
                                                                type="date" value={leaveEndDate} onChange={(e) => setLeaveEndDate(e.target.value)} min={leaveStartDate}
                                                                className="w-full bg-slate-50 text-[9.5px] px-2 py-2 border border-slate-200 rounded-xl font-bold text-slate-850" required
                                                            />
                                                        </div>
                                                    </div>

                                                    {leaveStartDate && (
                                                        <div className="space-y-1">
                                                            <span className="text-[6.5px] text-slate-400 font-extrabold uppercase block">Quick Duration</span>
                                                            <div className="flex gap-1.5">
                                                                <button type="button" onClick={() => handleApplyQuickDays(1)} className="bg-slate-100 text-slate-700 text-[8px] font-black px-2.5 py-1 rounded">1 Day</button>
                                                                <button type="button" onClick={() => handleApplyQuickDays(3)} className="bg-slate-100 text-slate-700 text-[8px] font-black px-2.5 py-1 rounded">3 Days</button>
                                                                <button type="button" onClick={() => handleApplyQuickDays(7)} className="bg-slate-100 text-slate-700 text-[8px] font-black px-2.5 py-1 rounded">1 Week</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div>
                                                <label className="text-[7px] font-black text-[#2E2A75] uppercase block mb-1">CEO Note & Reason</label>
                                                <textarea
                                                    rows={4} value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)}
                                                    className="w-full bg-slate-50 text-[9.5px] p-3 border border-slate-200 rounded-xl resize-none font-semibold text-slate-800 text-slate-850" placeholder="Provide note..." required
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setLeaveStep(1)} className="flex-1 bg-slate-100 text-slate-650 text-[9px] font-black py-2.5 rounded-xl uppercase">Back</button>
                                                <button type="submit" className="flex-1 bg-[#2E2A75] text-white text-[9px] font-black py-2.5 rounded-xl uppercase">Apply Leave</button>
                                            </div>
                                        </form>
                                    )}

                                    {leaveStep === 3 && (
                                        <div className="space-y-4 text-center py-6">
                                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto">
                                                <CheckSquare className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-sm font-black text-[#2E2A75] uppercase">Leave Request Sent!</h4>
                                            <button onClick={() => setIsLeaveReqModalOpen(false)} className="w-full bg-[#2E2A75] text-white text-[9.5px] py-2.5 rounded-xl uppercase font-black">Got it</button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* COMMUNITY BOARD POPUP MODAL (NOTIFICATIONS OVERLAY) */}
                        {/* ========================================================= */}
                        {isCommunityBoardOpen && (
                            <div className="absolute inset-0 bg-slate-950/50 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
                                <div className="bg-white w-full rounded-3xl p-5 space-y-4 shadow-2xl border border-slate-100 max-h-[80%] overflow-y-auto animate-fadeIn text-slate-800">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                                        <div className="flex items-center gap-1.5">
                                            <Megaphone className="w-4 h-4 text-[#FF5A20]" />
                                            <span className="text-[10px] font-black text-[#2E2A75] uppercase">Community Board Alerts</span>
                                        </div>
                                        <button onClick={() => setIsCommunityBoardOpen(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full">
                                            <X className="w-3.5 h-3.5 text-slate-600" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {broadcasts.map(b => (
                                            <div key={b.id} className="p-3 rounded-xl bg-slate-50 border border-slate-150 text-[9px] leading-relaxed space-y-1">
                                                <div className="flex justify-between items-center text-[7.5px] font-black text-slate-400 uppercase">
                                                    <span className="text-[#FF5A20]">{b.type} ALERT</span>
                                                    <span>{b.timestamp}</span>
                                                </div>
                                                <p className="font-semibold text-slate-800">{b.text}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => {
                                            triggerToast("Marked all board notifications read!", "info");
                                            setIsCommunityBoardOpen(false);
                                        }}
                                        className="w-full bg-[#2E2A75] text-white font-black text-[9.5px] py-2 rounded-xl uppercase"
                                    >
                                        Clear & Close
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* FLOATING SIDE ROUNDED EXECUTIVE TAB BAR */}
                        {/* ========================================================= */}
                        {!isProfileModalOpen && (
                        <nav className="bg-white/85 backdrop-blur-md border border-slate-200/60 mx-4 mb-[calc(env(safe-area-inset-bottom,16px)+12px)] py-2.5 px-4 rounded-[24px] flex justify-around items-center shrink-0 relative z-40 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all">
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
                                        onClick={async () => {
                                            await signOut();
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

                                    {((profile?.role === "manager" || profile?.is_manager) && (profile?.department === "Sales" || profile?.department === "Marketing")) ? (
                                        <button
                                            onClick={() => setAdminTab("sales")}
                                            className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                                adminTab === "sales"
                                                    ? "text-[#2E2A75]"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            <TrendingUp className="w-4 h-4" />
                                            <span>Sales</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={async () => {
                                                await signOut();
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
                                    )}
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

                                    {/* Specialized Dept Button (Sales/Marketing/Finance only) */}
                                    {(currentStaffProfile.dept === "Sales" || currentStaffProfile.dept === "Marketing") && (
                                        <button
                                            onClick={() => setStaffTab("specialized")}
                                            className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                                staffTab === "specialized"
                                                    ? "text-[#2E2A75]"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            <TrendingUp className="w-4 h-4" />
                                            <span>Daily Update</span>
                                        </button>
                                    )}

                                    {currentStaffProfile.dept === "Finance" && (
                                        <button
                                            onClick={() => setStaffTab("specialized")}
                                            className={`flex flex-col items-center gap-0.5 text-[7px] font-black uppercase transition-all flex-1 ${
                                                staffTab === "specialized"
                                                    ? "text-[#2E2A75]"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            <Wallet className="w-4 h-4" />
                                            <span>Finance</span>
                                        </button>
                                    )}

                                    <button
                                        onClick={async () => {
                                            await signOut();
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
                        )}
                    </>
                )}

            </div>

            {/* Styled inline keyframes for confetti fall simulation */}
            <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(500px) rotate(360deg); opacity: 0; }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleUp {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes congratsProgress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-congratsProgress {
          animation: congratsProgress 2.5s linear forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes loginEntrance {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-loginEntrance {
          animation: loginEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes logoZoom {
          0% { opacity: 0; transform: scale(0.4) rotate(-5deg); }
          70% { transform: scale(1.1) rotate(3deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .animate-logoZoom {
          animation: logoZoom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        @keyframes execSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-exec-slide-up {
          animation: execSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .ua-entry-delay-1 {
          animation-delay: 0.1s;
          animation-fill-mode: both;
        }
        .ua-entry-delay-2 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
        @keyframes loadingBar {
          0% { left: -50%; width: 50%; }
          100% { left: 100%; width: 30%; }
        }
        .animate-loadingBar {
          animation: loadingBar 1.2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Force dark text color inside inputs/selects on light/slate backgrounds for both light & dark mode viewports */
        .fixed.inset-0 input,
        .fixed.inset-0 select,
        .fixed.inset-0 textarea {
          color: #1e293b !important;
        }
        .fixed.inset-0 input::placeholder,
        .fixed.inset-0 textarea::placeholder {
          color: #94a3b8 !important;
        }
        /* Except range inputs and custom color classes */
        .fixed.inset-0 input[type="range"] {
          color: inherit !important;
        }
        .fixed.inset-0 input.text-\[\#FF5A20\] {
          color: #FF5A20 !important;
        }
        
        /* Rigid viewport lock: Disables native WebView bouncing/overscrolling entirely on physical devices */
        html, body {
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          touch-action: none !important;
          -webkit-overflow-scrolling: auto !important;
        }
        
        /* Glassmorphism custom classes with Webkit support for Safari/iOS WebViews */
        .bg-white\/80 {
          background-color: rgba(255, 255, 255, 0.8) !important;
        }
        .backdrop-blur-md {
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
        }
      `}} />
        </div>
    );
}
