"use client";

import { useState, useEffect, useMemo, Fragment } from "react";
import { supabase, Profile, Task, Request, Broadcast, Knock, ActivityFeed, Attendance, SignupRequest, Meeting, ExecutiveReport, AgentStatus, Lead, LeadStatus, DemoRequest, TutorAvailability, TutorNotification, Programme, Idea, SalesSignals } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import {
    Bell,
    Clock,
    FileText,
    UserPlus,
    AlertTriangle,
    Check,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Target,
    PhoneCall,
    Archive,
    Plus,
    MessageSquare,
    Zap,
    TrendingUp,
    ArrowRight,
    Trash2,
    RefreshCw,
    ShieldAlert,
    LogOut,
    Wifi,
    Hourglass,
    Play,
    CheckCircle,
    MessageCircle,
    Rocket,
    ClipboardList,
    DollarSign,
    Calendar,
    Lightbulb,
    AlertCircle,
    Activity,
    ListTodo,
    CheckSquare,
    X,
    Users,
    MapPin,
    Package,
    Video,
    Bookmark,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "./theme-toggle";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import AddStaffDialog from "./AddStaffDialog";
import { NewIdeaDialog } from "./new-idea-dialog";
import { ThoughtCapture } from "./thought-capture";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns";

// ============================================
// TYPES & CONSTANTS
// ============================================

type SystemStatus = "STABLE" | "WARNING" | "CRITICAL";

// ============================================
// UI COMPONENTS (MINIMAL & AUTHORITY FOCUSED)
// ============================================

const SectionHeader = ({
    title,
    color = "bg-theme-bg-white-20",
}: {
    title: string;
    color?: string;
}) => (
    <div className="flex items-center gap-2 mb-4">
        <div className={`w-1 h-4 ${color} rounded-full`} />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-50">
            {title}
        </h3>
    </div>
);

const CommandCard = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={`bg-theme-card border border-theme-border-10 rounded-2xl p-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${className}`}
    >
        {children}
    </div>
);

// ============================================
// MAIN COMPONENT: EXECUTIVE COMMAND
// ============================================

export function ExecutiveCommand({ currentView }: { currentView?: string }) {
    const { profile, signOut } = useAuth();
    const { theme } = useTheme();

    // Data State
    const [staff, setStaff] = useState<Profile[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);

    const [leads, setLeads] = useState<Lead[]>([]);
    const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
    const [ideas, setIdeas] = useState<Idea[]>([]);

    // UI State
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [taskTab, setTaskTab] = useState<
        "active" | "blocked" | "overdue" | "daily" | "completed"
    >("active");
    const [departmentFilter, setDepartmentFilter] = useState<
        "ceo" | "sales" | "marketing" | "accounts" | "administration"
    >("ceo");
    const [showStaffOverview, setShowStaffOverview] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [selectedStaffForChat, setSelectedStaffForChat] =
        useState<Profile | null>(null);
    const [chatMessage, setChatMessage] = useState("");
    const [expandedStaffId, setExpandedStaffId] = useState<string | null>(null);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
    const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
    const [isManageMode, setIsManageMode] = useState(false);
    const [isRemoveStaffModalOpen, setIsRemoveStaffModalOpen] = useState(false);
    const [staffToRemove, setStaffToRemove] = useState<Profile | null>(null);
    const [confirmName, setConfirmName] = useState("");
    const [isIdeasOpen, setIsIdeasOpen] = useState(false);
    const [isNewIdeaDialogOpen, setIsNewIdeaDialogOpen] = useState(false);
    const [deletingTaskIds, setDeletingTaskIds] = useState<Set<string>>(new Set());
    const [completedIdeas, setCompletedIdeas] = useState<Set<string>>(new Set());
    const [newIdea, setNewIdea] = useState({
        title: "",
        description: "",
        priority: "medium",
    });
    const [selectedStaffForIdea, setSelectedStaffForIdea] = useState<string[]>(
        [],
    );
    const [hoveredRequest, setHoveredRequest] = useState<any | null>(null);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [meetings, setMeetings] = useState<any[]>([]);
    const [meetingFilter, setMeetingFilter] = useState<"upcoming" | "today" | "week">("upcoming");

    // Meeting states
    const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);
    const [meetingStep, setMeetingStep] = useState(1);
    const [newMeeting, setNewMeeting] = useState({
        title: "",
        agenda: "",
        date: "",
        time: "",
        participants: [] as string[],
        type: "strategic" as "strategic" | "review" | "emergency" | "1-on-1",
        priority: "medium" as "low" | "medium" | "high" | "critical",
        outcome: "decision" as "decision" | "discussion" | "approval",
        duration: "60",
        location: "Virtual HQ",
        agendaItems: [] as {
            id: string;
            topic: string;
            owner: string;
            time: string;
        }[],
        preMeetingTasks: [] as {
            id: string;
            title: string;
            assignedTo: string;
            deadline: string;
        }[],
        notifications: {
            dashboard: true,
            email: false,
            push: true,
            sms: false,
        },
        reminder: "10",
        notes: "",
    });

    // Toggle completion status
    const toggleIdeaCompletion = (ideaId: string) => {
        setCompletedIdeas(prev => {
            const newSet = new Set(prev);
            if (newSet.has(ideaId)) {
                newSet.delete(ideaId);
            } else {
                newSet.add(ideaId);
            }
            return newSet;
        });
    };

    // Form States

    const [repeatDaily, setRepeatDaily] = useState(false);

    const [newTask, setNewTask] = useState({
        title: "",
        assignedTo: "",
        priority: "medium",
        description: "",
        due_date: "",
        due_time: "",
    });

    // Enhanced Task Form State
    const [taskDescription, setTaskDescription] = useState("");
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [assigneeSearch, setAssigneeSearch] = useState("");
    const [isDraft, setIsDraft] = useState(false);
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [clearedNotifications, setClearedNotifications] = useState<Set<string>>(new Set());

    // LIVE OPERATIONS DATA
    const activities = useMemo(() => {
        const items: any[] = [
            // Escalations (Urgent Tasks)
            ...tasks
                .filter((t) => t.priority === "urgent" && !(t as any).signal_cleared)
                .map((t) => ({
                    id: `esc-${t.id}`,
                    category: "escalation",
                    title: "Operation Escalated",
                    description: `Urgent: ${t.title}`,
                    time: t.updated_at || t.created_at,
                    icon: AlertCircle,
                    color: "#ef4444",
                    colorType: "red",
                    priority: "high",
                })),

            // New Staff Members
            ...staff
                .filter((s) => {
                    const createdAt = new Date(s.created_at);
                    const twoDaysAgo = new Date();
                    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                    return createdAt > twoDaysAgo && !(s as any).signal_cleared;
                })
                .map((s) => ({
                    id: `staff-${s.id}`,
                    category: "staff",
                    title: "New Operative",
                    description: `${s.full_name} joined as ${s.department}`,
                    time: s.created_at,
                    icon: Users,
                    color: "#06b6d4",
                    colorType: "cyan",
                    priority: "medium",
                })),

            // Tasks (Normal/Pending) - Show all new assignments
            ...tasks
                .filter(
                    (t) => t.priority !== "urgent" && t.status === "pending" && !(t as any).signal_cleared,
                )
                .map((t) => ({
                    id: `task-${t.id}`,
                    category: "task",
                    title: "Task Dispatched",
                    description: `${t.title} assigned to ${staff.find((s) => s.id === t.assigned_to)?.full_name || "Operative"}`,
                    time: t.created_at,
                    icon: ClipboardList,
                    color: "#3b82f6",
                    colorType: "blue",
                    priority: "medium",
                })),

            // Completed Tasks (Recent)
            ...completedTasks
                .filter((t) => !(t as any).signal_cleared)
                .slice(0, 5)
                .map((t) => ({
                    id: `completed-${t.id}`,
                    category: "completed",
                    title: "Mission Complete",
                    description: `${t.title} completed by ${staff.find((s) => s.id === t.assigned_to)?.full_name || "Operative"}`,
                    time: t.updated_at,
                    icon: CheckCircle,
                    color: "#10b981",
                    colorType: "green",
                    priority: "low",
                })),

            // New Leads
            ...leads
                .filter((l) => l.status === "new" && !(l as any).signal_cleared)
                .map((l) => ({
                    id: `lead-${l.id}`,
                    category: "lead",
                    title: "New Lead",
                    description: `${l.lead_name}`,
                    time: l.created_at,
                    icon: UserPlus,
                    color: "#f59e0b",
                    colorType: "amber",
                    priority: "medium",
                })),

            // Payments (Converted Leads)
            ...leads
                .filter((l) => l.status === "converted" && !(l as any).signal_cleared)
                .map((l) => ({
                    id: `pay-${l.id}`,
                    category: "payment",
                    title: "Payment Received",
                    description: `Lead conversion: ${l.lead_name}`,
                    time: l.updated_at || l.created_at,
                    icon: DollarSign,
                    color: "#10b981",
                    colorType: "green",
                    priority: "high",
                })),

            // Leave Requests
            ...requests
                .filter((r) => r.type === "leave" && !(r as any).signal_cleared)
                .map((r) => ({
                    id: `leave-${r.id}`,
                    category: "leave",
                    title: "Leave Requested",
                    description: `${r.title} by ${staff.find((s) => s.id === r.submitted_by)?.full_name || "Operative"}`,
                    time: r.created_at,
                    icon: Calendar,
                    color: "#f97316",
                    colorType: "orange",
                    priority: "medium",
                })),

            // Other Requests (Equipment, etc.)
            ...requests
                .filter((r) => r.type !== "leave" && !(r as any).signal_cleared)
                .map((r) => ({
                    id: `req-${r.id}`,
                    category: "request",
                    title: "Resource Request",
                    description: `${r.title} by ${staff.find((s) => s.id === r.submitted_by)?.full_name || "Operative"}`,
                    time: r.created_at,
                    icon: Package,
                    color: "#8b5cf6",
                    colorType: "purple",
                    priority: "medium",
                })),

            // Ideas
            ...ideas.filter((i) => !(i as any).signal_cleared).map((i) => ({
                id: `idea-${i.id}`,
                category: "idea",
                title: "Strategic Idea",
                description: i.title || i.content?.slice(0, 40),
                time: i.created_at,
                icon: Lightbulb,
                color: "#8b5cf6",
                colorType: "purple",
                priority: "medium",
            })),

            // Demo Scheduling
            ...demoRequests.filter((d) => !(d as any).signal_cleared).map((d) => ({
                id: `demo-${d.id}`,
                category: "task",
                title: "Demo Scheduled",
                description: `Session for ${d.lead?.lead_name || "Lead"}`,
                time: d.created_at,
                icon: PhoneCall,
                color: "#3b82f6",
                colorType: "blue",
                priority: "medium",
            })),

            // Upcoming Meetings
            ...meetings
                .filter((m) => {
                    const meetingTime = new Date(m.scheduled_at);
                    const now = new Date();
                    const hoursUntilMeeting = (meetingTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                    return hoursUntilMeeting > 0 && hoursUntilMeeting <= 24 && !(m as any).signal_cleared;
                })
                .map((m) => ({
                    id: `meeting-${m.id}`,
                    category: "meeting",
                    title: "Meeting Scheduled",
                    description: `${m.title} in ${Math.round((new Date(m.scheduled_at).getTime() - new Date().getTime()) / (1000 * 60 * 60))} hours`,
                    time: m.created_at,
                    icon: Video,
                    color: "#ec4899",
                    colorType: "pink",
                    priority: "high",
                })),
        ];

        return items
            .filter((item) => !clearedNotifications.has(item.id))
            .sort((a, b) => {
                // Sort by priority first, then by time
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
                const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
                
                if (aPriority !== bPriority) {
                    return bPriority - aPriority;
                }
                
                return new Date(b.time).getTime() - new Date(a.time).getTime();
            })
            .slice(0, 50); // Increased from 20 to 50
    }, [tasks, ideas, requests, demoRequests, leads, staff, completedTasks, meetings, clearedNotifications]);

    
    // Clear Signal Feed
    const clearSignalFeed = () => {
        // Immediately clear client-side for instant feedback
        const currentActivityIds = new Set(activities.map((act) => act.id));
        setClearedNotifications(currentActivityIds);
        
        // Try database updates in background (fire and forget)
        activities.forEach((act) => {
            const [prefix, id] = act.id.split('-');
            
            switch (prefix) {
                case 'esc': // Escalations (urgent tasks)
                case 'task': // Regular tasks
                case 'completed': // Completed tasks
                    supabase
                        .from("tasks")
                        .update({ signal_cleared: true })
                        .eq("id", id); // Fire and forget
                    break;
                case 'pay': // Payments (converted leads)
                case 'lead': // New leads
                    supabase
                        .from("leads")
                        .update({ signal_cleared: true })
                        .eq("id", id); // Fire and forget
                    break;
                case 'leave': // Leave requests
                case 'req': // Other requests
                    supabase
                        .from("requests")
                        .update({ signal_cleared: true })
                        .eq("id", id); // Fire and forget
                    break;
                case 'idea': // Ideas
                    supabase
                        .from("ideas")
                        .update({ signal_cleared: true })
                        .eq("id", id); // Fire and forget
                    break;
                case 'demo': // Demo requests
                    supabase
                        .from("demo_requests")
                        .update({ signal_cleared: true })
                        .eq("id", id); // Fire and forget
                    break;
                case 'staff': // New staff members
                    supabase
                        .from("profiles")
                        .update({ signal_cleared: true })
                        .eq("id", id); // Fire and forget
                    break;
                case 'meeting': // Upcoming meetings
                    supabase
                        .from("meetings")
                        .update({ signal_cleared: true })
                        .eq("id", id); // Fire and forget
                    break;
            }
        });
        
        toast.success("Signal Feed Cleared");
    };

    // Ensure ceo_reviewed column exists
    const ensureCeoReviewedColumn = async () => {
        try {
            // Try to update a task with ceo_reviewed to see if column exists
            const { error } = await supabase
                .from("tasks")
                .select("id")
                .limit(1)
                .single();

            if (error) {
                console.error('Error checking table:', error);
                return;
            }

            // Try to update with ceo_reviewed column
            const { error: testError } = await supabase
                .from("tasks")
                .update({ ceo_reviewed: false })
                .eq("status", "completed")
                .limit(1);

            if (testError && testError.message.includes('column "ceo_reviewed" does not exist')) {
                console.log('ceo_reviewed column does not exist, tasks will be filtered by reviewed_at only');
                return;
            }

            console.log('ceo_reviewed column exists');
        } catch (error) {
            console.error('Error ensuring ceo_reviewed column:', error);
        }
    };

    // Fetch Data
    const fetchData = async () => {
        if (!profile) return;
        setIsRefreshing(true);

        try {
            const [
                staffRes,
                tasksRes,
                requestsRes,
                leadsRes,
                demosRes,
                ideasRes,
                completedTasksRes,
                meetingsRes,
            ] = await Promise.all([
                // Get all staff including recent ones (last 7 days)
                supabase.from("profiles").select("*").neq("role", "ceo").order("created_at", { ascending: false }),
                
                // Get all active tasks
                supabase.from("tasks").select("*").not("status", "in", '("completed","deleted")').order("updated_at", { ascending: false }),
                
                // Get all pending requests
                supabase
                    .from("requests")
                    .select("*, submitted_by:profiles!submitted_by(*)")
                    .eq("status", "pending")
                    .order("created_at", { ascending: false }),
                
                // Get all leads from last 3 days and all converted leads
                supabase
                    .from("leads")
                    .select("*")
                    .or(
                        `created_at.gte.${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()},status.eq.converted,updated_at.gte.${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()}`,
                    )
                    .order("updated_at", { ascending: false }),
                
                // Get all accepted demo requests
                supabase
                    .from("demo_requests")
                    .select("*, leads:leads(*)")
                    .eq("status", "accepted")
                    .order("created_at", { ascending: false }),
                
                // Get all non-archived ideas
                supabase
                    .from("ideas")
                    .select("*")
                    .eq("archived", false)
                    .order("created_at", { ascending: false }),
                
                // Get recent completed tasks not reviewed
                supabase
                    .from("tasks")
                    .select(
                        "*, assigned_to_user:profiles!assigned_to(full_name, department)",
                    )
                    .eq("status", "completed")
                    .is("reviewed_at", null)
                    .order("updated_at", { ascending: false })
                    .limit(50), // Increased limit
                
                // Get upcoming meetings (next 7 days)
                supabase
                    .from("meetings")
                    .select("*")
                    .gte("scheduled_at", new Date().toISOString())
                    .lte("scheduled_at", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
                    .order("scheduled_at", { ascending: true }),
            ]);

            if (staffRes.data)
                setStaff(
                    staffRes.data.filter((s) => s.full_name !== "[DELETED]"),
                );
            if (tasksRes.data) setTasks(tasksRes.data);
            if (requestsRes.data) setRequests(requestsRes.data);
            if (leadsRes.data) setLeads(leadsRes.data);
            if (demosRes.data) setDemoRequests(demosRes.data);
            if (ideasRes.data) setIdeas(ideasRes.data);
            if (completedTasksRes.data) {
                console.log('Completed tasks fetched:', completedTasksRes.data);
                console.log('Completed tasks with ceo_reviewed status:', completedTasksRes.data.map(t => ({ id: t.id, title: t.title, ceo_reviewed: t.ceo_reviewed })));
                setCompletedTasks(completedTasksRes.data);
            }
            if (meetingsRes.data) setMeetings(meetingsRes.data);
        } catch (e) {
            console.error("Telemetry failed:", e);
            toast.error("Telemetry failed");
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        let channel: any;
        let autoRefreshInterval: NodeJS.Timeout;

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchData();
            }
        };

        const startRealtime = () => {
            channel = supabase
                .channel("exec-command")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "tasks",
                    },
                    (payload: any) => {
                        // Immediately refresh for real-time updates
                        if (!document.hidden) {
                            console.log('Real-time update:', payload);
                            fetchData();
                        }
                    },
                )
                .subscribe();
            
            // Reduce refresh interval for more responsive signal feed
            autoRefreshInterval = setInterval(
                () => !document.hidden && fetchData(),
                15000, // Reduced from 30 to 15 seconds
            );
        };

        // Ensure database column exists first
        ensureCeoReviewedColumn().then(() => {
            fetchData();
            startRealtime();
        });
        
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            if (channel) supabase.removeChannel(channel);
            if (autoRefreshInterval) clearInterval(autoRefreshInterval);
        };
    }, [profile]);

    // Listen for FAB actions from mobile FAB component
    useEffect(() => {
        const handleFabAction = (event: CustomEvent) => {
            const { action } = event.detail;
            switch (action) {
                case "new-idea":
                    setIsNewIdeaDialogOpen(true);
                    break;
                case "add-staff":
                    setIsAddStaffOpen(true);
                    break;
                case "new-directive":
                    setIsAssignTaskOpen(true);
                    break;
            }
        };

        window.addEventListener("fab-action", handleFabAction as EventListener);
        return () => {
            window.removeEventListener("fab-action", handleFabAction as EventListener);
        };
    }, []);

    // Computed Stats
    const stats = useMemo(() => {
        // Sort staff by availability: AVAILABLE ??? BUSY ??? IDLE ??? OFFLINE
        const sortedStaff = [...staff].sort((a, b) => {
            const priority = { online: 0, busy: 1, away: 2, offline: 3 };
            return (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
        });

        const staffOnline = sortedStaff.filter(
            (s) => s.status === "online" || s.status === "busy",
        ).length;

        const recentRequests = requests.filter((r) => {
            const created = new Date(r.created_at).getTime();
            const now = new Date().getTime();
            return now - created < 24 * 60 * 60 * 1000;
        });

        let systemStatus: SystemStatus = "STABLE";
        if (recentRequests.length > 5) systemStatus = "WARNING";
        if (
            recentRequests.some(
                (r) => r.priority === "high" || r.priority === "urgent",
            )
        )
            systemStatus = "CRITICAL";

        // Calculate overdue tasks
        const allOverdueTasks = tasks.filter(
            (t) =>
                t.due_date &&
                new Date(t.due_date) < new Date() &&
                t.status !== "completed",
        );

        const todayStr = new Date().toISOString().split("T")[0];

        // Today Summary Metrics
        const tasksAssignedToday = tasks.filter((t) =>
            t.created_at.startsWith(todayStr),
        ).length;
        const paymentsReceivedToday = leads.filter(
            (l) =>
                l.status === "converted" &&
                (l.updated_at || l.created_at).startsWith(todayStr),
        ).length;
        const leavesRequestedToday = requests.filter(
            (r) => r.type === "leave" && r.created_at.startsWith(todayStr),
        ).length;
        const newLeadsToday = leads.filter((l) =>
            l.created_at.startsWith(todayStr),
        ).length;

        return {
            systemStatus,
            decisionsPending: recentRequests.length,
            staffOnline,
            staffTotal: staff.length,
            tasksInProgress: tasks.length,
            recentRequests,
            sortedStaff,
            overdueCount: allOverdueTasks.length,
            tasksAssignedToday,
            paymentsReceivedToday,
            leavesRequestedToday,
            newLeadsToday,
        };
    }, [staff, requests, tasks, leads]);

    const disposeIdea = async (id: string) => {
        console.log("Dispose idea called with ID:", id);
        
        if (
            !confirm(
                "Dispose of this strategic directive? This action is permanent.",
            )
        )
            return;
            
        console.log("User confirmed deletion, proceeding...");
            
        try {
            const { data, error } = await supabase.from("ideas").delete().eq("id", id).select();
            
            console.log("Delete response:", { data, error });
            
            if (error) {
                console.error("Error deleting idea:", error);
                toast.error(`Failed to dispose: ${error.message}`);
                return;
            }
            
            console.log("Idea deleted successfully:", data);
            toast.success("Directive Disposed");
            fetchData();
        } catch (err) {
            console.error("Exception during idea deletion:", err);
            toast.error("Failed to dispose directive");
        }
    };

    // Actions
    const handleRequest = async (
        id: string,
        status: "approved" | "rejected",
    ) => {
        await supabase
            .from("requests")
            .update({
                status,
                reviewed_by: profile?.id,
                reviewed_at: new Date().toISOString(),
            })
            .eq("id", id);
        toast.success(`Action Executed: ${status.toUpperCase()}`);
        fetchData();
    };

    const assignTask = async (draft = false) => {
        console.log('Assign task called with:', { newTask, draft });
        
        if (!newTask.title || !newTask.assignedTo) {
            console.log('Validation failed:', { title: newTask.title, assignedTo: newTask.assignedTo });
            return toast.error("Title and Assignee required");
        }

        // Combine date and time for due_date
        let dueDateTime = null;
        if (newTask.due_date) {
            if (newTask.due_time) {
                dueDateTime = new Date(`${newTask.due_date}T${newTask.due_time}`).toISOString();
            } else {
                dueDateTime = new Date(newTask.due_date).toISOString();
            }
        }

        const insertPayload: Record<string, unknown> = {
            title: newTask.title,
            description: taskDescription || null,
            assigned_to: newTask.assignedTo,
            priority: newTask.priority,
            status: "pending",
            created_by: profile?.id,
            due_date: dueDateTime,
            is_draft: draft,
            is_new: true,
        };

        // Only include task_description if it has a value
        if (taskDescription) {
            insertPayload.task_description = taskDescription;
        }

        console.log('Insert payload:', insertPayload);

        const { error } = await supabase.from("tasks").insert(insertPayload);

        if (error) {
            console.error("Assign task error:", error);
            toast.error("Failed to assign task: " + error.message);
            return;
        }

        console.log('Task assigned successfully');
        setIsAssignTaskOpen(false);
        toast.success(draft ? "DRAFT SAVED" : "✓ Task assigned successfully");
        resetTaskForm();
        fetchData();
    };

    // Save as Draft
    const saveDraft = async () => {
        if (!newTask.title) {
            return toast.error("Title required for draft");
        }

        setIsDraft(true);
        await assignTask();
    };

    // Reset Task Form
    const resetTaskForm = () => {
        setNewTask({
            title: "",
            assignedTo: "",
            priority: "medium",
            description: "",
            due_date: "",
            due_time: "",
        });
        setTaskDescription("");
        setAttachmentUrl("");
        setAssigneeSearch("");
        setIsDraft(false);
        setShowAssigneeDropdown(false);
        setRepeatDaily(false);
    };

    // Filtered Staff for Search
    const filteredStaff = staff.filter((s) =>
        s.full_name?.toLowerCase().includes(assigneeSearch.toLowerCase()),
    );

    const alertStaff = async (staffId: string, taskTitle: string) => {
        await supabase.from("notifications").insert({
            user_id: staffId,
            title: "STAFF ALERT",
            message: `The CEO is requesting an immediate update on: "${taskTitle}"`,
            type: "alert",
        });
        toast.success("ALERT DISPATCHED");
    };

    const deleteStaff = async () => {
        if (!staffToRemove) return;

        try {
            // 1. Unassign active tasks
            await supabase
                .from("tasks")
                .update({ assigned_to: null })
                .eq("assigned_to", staffToRemove.id);

            // 2. Permanently delete from database
            const { error } = await supabase
                .from("profiles")
                .delete()
                .eq("id", staffToRemove.id);

            if (error) {
                // Fallback to soft delete if FK constraint hits or other issue
                await supabase
                    .from("profiles")
                    .update({ full_name: "[DELETED]", status: "offline" })
                    .eq("id", staffToRemove.id);
            }

            toast.success("OPERATIVE TERMINATED & DATA PURGED");
            setStaff((prev) => prev.filter((s) => s.id !== staffToRemove.id));
            setIsRemoveStaffModalOpen(false);
            setStaffToRemove(null);
            setConfirmName("");
        } catch (e) {
            toast.error("Termination failed");
        }
    };

    const deleteTask = async (id: string) => {
        // Prevent multiple simultaneous deletions of the same task
        if (deletingTaskIds.has(id)) {
            console.log("Task deletion already in progress:", id);
            return;
        }
        
        console.log("Attempting to delete task with ID:", id);
        
        // Add to deleting set
        setDeletingTaskIds(prev => new Set(prev).add(id));
        
        // Check current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Current session:", { session, sessionError });
        
        if (!session) {
            console.error("No active session found");
            toast.error("You must be logged in to delete tasks");
            setDeletingTaskIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            return;
        }
        
        // First, remove task from local state immediately for better UX
        setTasks(prev => prev.filter(task => task.id !== id));
        
        try {
            // First, let's check if the task actually exists before trying to delete it
            console.log("Checking if task exists before deletion...");
            const { data: existingTask, error: checkError } = await supabase
                .from("tasks")
                .select("*")
                .eq("id", id)
                .single();
            
            console.log("Task existence check:", { existingTask, checkError });
            console.log("Existing task details:", JSON.stringify(existingTask, null, 2));
            console.log("Check error details:", JSON.stringify(checkError, null, 2));
            
            if (checkError) {
                console.error("Error checking task existence:", checkError);
                toast.error("Failed to verify task: " + checkError.message);
                fetchData();
                return;
            }
            
            if (!existingTask) {
                console.warn("Task does not exist in database:", id);
                toast.error("Task not found in database");
                fetchData();
                return;
            }
            
            // Now attempt the deletion - try multiple approaches
            console.log("Attempting to delete existing task:", existingTask);
            
            // Approach 1: Simple deletion without .select()
            let { error: error1, count: count1 } = await supabase
                .from("tasks")
                .delete({ count: 'exact' })
                .eq("id", id);
            
            console.log("Approach 1 - Simple deletion result:", { error1, count1 });
            console.log("Error1 details:", JSON.stringify(error1, null, 2));
            console.log("Count1:", count1);
            
            if (!error1 && count1 !== null && count1 > 0) {
                console.log("Task successfully deleted with approach 1");
                toast.success("TASK ANNULLED");
                return;
            }
            
            // Approach 2: Deletion with .select()
            let { error: error2, data } = await supabase.from("tasks").delete().eq("id", id).select();
            
            console.log("Approach 2 - Deletion with select result:", { error2, data });
            console.log("Error2 details:", JSON.stringify(error2, null, 2));
            console.log("Data:", data);
            
            // Combine errors from both approaches
            const hasError = error1 || error2;
            const hasDeletion = (count1 && count1 > 0) || (data && data.length > 0);
            
            // If deletion fails due to permissions, try with service role (if available)
            if (hasError && (error1?.code === '42501' || error2?.code === '42501' || 
                error1?.message?.includes('permission') || error2?.message?.includes('permission'))) {
                console.log("Trying service role deletion...");
                const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
                console.log("Service role key available:", !!serviceKey);
                console.log("Service role key length:", serviceKey?.length || 0);
                
                if (serviceKey) {
                    try {
                        const serviceClient = createClient(
                            process.env.NEXT_PUBLIC_SUPABASE_URL!,
                            serviceKey,
                            {
                                auth: {
                                    autoRefreshToken: false,
                                    persistSession: false
                                }
                            }
                        );
                        
                        const { error: serviceError, data: serviceData } = await serviceClient
                            .from("tasks")
                            .delete()
                            .eq("id", id)
                            .select();
                        
                        console.log("Service role deletion result:", { serviceError, serviceData });
                        
                        if (!serviceError && serviceData && serviceData.length > 0) {
                            console.log("Task successfully deleted with service role:", serviceData);
                            toast.success("TASK ANNULLED");
                            return;
                        }
                    } catch (serviceErr) {
                        console.error("Service role deletion failed:", serviceErr);
                    }
                }
            }
            
            if (hasError) {
                console.error("Delete task error:", { error1, error2 });
                
                // Restore task to local state if deletion failed
                fetchData();
                
                // Check if it's an RLS policy error
                if (error1?.code === '42501' || error2?.code === '42501' || 
                    error1?.message?.includes('row-level security') || error2?.message?.includes('row-level security')) {
                    toast.error("Permission denied: You don't have rights to delete this task");
                } else {
                    toast.error("Failed to delete task: " + (error1?.message || error2?.message));
                }
            } else if (!hasDeletion) {
                console.warn("No task was deleted with either approach - checking RLS policies");
                // Try a different approach - check if we can at least update it
                const { error: updateError } = await supabase
                    .from("tasks")
                    .update({ status: 'deleted' })
                    .eq("id", id);
                
                console.log("Update fallback result:", { updateError });
                console.log("Update error details:", JSON.stringify(updateError, null, 2));
                
                if (updateError) {
                    console.error("Also failed to update task:", updateError);
                    
                    // Final attempt - try service role for update
                    console.log("Trying service role for update...");
                    try {
                        const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
                        if (serviceKey) {
                            const serviceClient = createClient(
                                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                                serviceKey,
                                { auth: { autoRefreshToken: false, persistSession: false } }
                            );
                            
                            const { error: serviceUpdateError } = await serviceClient
                                .from("tasks")
                                .update({ status: 'deleted' })
                                .eq("id", id);
                            
                            console.log("Service role update result:", { serviceUpdateError });
                            
                            if (!serviceUpdateError) {
                                console.log("Task marked as deleted with service role");
                                toast.success("Task marked as deleted");
                                fetchData();
                            } else {
                                console.error("Service role update also failed:", serviceUpdateError);
                                toast.error("Cannot delete or modify task - check database permissions");
                                fetchData();
                            }
                        } else {
                            console.error("No service role key available");
                            toast.error("Cannot delete or modify task - check database permissions");
                            fetchData();
                        }
                    } catch (serviceErr) {
                        console.error("Service role update exception:", serviceErr);
                        toast.error("Cannot delete or modify task - check database permissions");
                        fetchData();
                    }
                } else {
                    console.log("Task marked as deleted instead");
                    toast.success("Task marked as deleted");
                    fetchData();
                }
            } else {
                console.log("Task successfully deleted with one of the approaches");
                toast.success("TASK ANNULLED");
                // fetchData() is not needed here since we already updated local state
            }
        } catch (error) {
            console.error("Delete task exception:", error);
            // Restore task to local state if deletion failed
            fetchData();
            toast.error("Something went wrong deleting task");
        } finally {
            // Remove from deleting set
            setDeletingTaskIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const removeTaskFromCEO = async (id: string) => {
        // Temporarily disable until database columns are added
        toast.info("Remove from CEO view will be available after database update");
        // await supabase
        //     .from("tasks")
        //     .update({ ceo_visible: false })
        //     .eq("id", id);
        // toast.success("Task hidden from CEO view");
        // fetchData();
    };

    const markTaskAsReviewed = async (id: string) => {
        try {
            console.log('Marking task as reviewed:', id);
            const reviewedAt = new Date().toISOString();
            
            // Always update reviewed_at - this is what the query uses to filter
            const updateData = { reviewed_at: reviewedAt };
            
            // Try to also update ceo_reviewed if the column exists
            const { error: reviewedError, data: reviewedData } = await supabase
                .from("tasks")
                .update({ 
                    ...updateData,
                    ceo_reviewed: true
                })
                .eq("id", id)
                .select();

            if (reviewedError) {
                console.error("Mark as reviewed error (ceo_reviewed column):", reviewedError);
                
                // If ceo_reviewed column doesn't exist, update just reviewed_at
                const { error: fallbackError, data: fallbackData } = await supabase
                    .from("tasks")
                    .update(updateData)
                    .eq("id", id)
                    .select();

                if (fallbackError) {
                    console.error("Fallback update also failed:", fallbackError);
                    toast.error("Failed to mark task as reviewed: " + fallbackError.message);
                    return;
                }
                
                console.log('Task marked as reviewed (fallback):', fallbackData);
                toast.success("Task reviewed and permanently removed from CEO view");
            } else {
                console.log('Task marked as reviewed successfully:', reviewedData);
                toast.success("Task reviewed and permanently removed from CEO view");
            }
            
            // Also remove from local completed tasks immediately for better UX
            setCompletedTasks(prev => prev.filter(task => task.id !== id));
            
            fetchData(); // Refresh the data to update the UI
        } catch (error) {
            console.error("Mark as reviewed exception:", error);
            toast.error("Something went wrong marking task as reviewed");
        }
    };

    const clearAllCompletedTasks = async () => {
        if (!confirm("Mark all completed tasks as reviewed? This will permanently remove them from CEO view and make them visible to staff.")) return;
        
        try {
            console.log("Clearing all completed tasks...");
            const reviewedAt = new Date().toISOString();
            
            // First try with ceo_reviewed column
            const { error: error1 } = await supabase
                .from("tasks")
                .update({ 
                    ceo_reviewed: true, 
                    reviewed_at: reviewedAt
                })
                .eq("status", "completed")
                .is("reviewed_at", null);
                
            if (error1) {
                console.error("Clear all completed error (with ceo_reviewed):", error1);
                
                // Fallback: update only reviewed_at column
                const { error: error2 } = await supabase
                    .from("tasks")
                    .update({ 
                        reviewed_at: reviewedAt
                    })
                    .eq("status", "completed")
                    .is("reviewed_at", null);
                
                if (error2) {
                    console.error("Clear all completed error (fallback):", error2);
                    toast.error("Failed to clear completed tasks: " + error2.message);
                    return;
                }
                
                console.log("All completed tasks marked as reviewed (fallback)");
            } else {
                console.log("All completed tasks marked as reviewed successfully");
            }
            
            // Clear local state immediately for better UX
            setCompletedTasks([]);
            
            toast.success("All completed tasks marked as reviewed and removed from CEO view");
            fetchData();
        } catch (error) {
            console.error("Clear all completed exception:", error);
            toast.error("Something went wrong clearing completed tasks");
        }
    };

    const submitIdea = async () => {
        if (!newIdea.title || !newIdea.description)
            return toast.error("Idea title and description required");

        // Use generic untyped insert to bypass strict TS checking if schema is lagging
        const { error } = await supabase.from("ideas").insert({
            title: newIdea.title,
            content: newIdea.description,
            priority: newIdea.priority,
            created_by: profile?.id,
            shared_with: selectedStaffForIdea,
        } as any);

        if (error) return toast.error("Idea dispatch failed");

        toast.success("STRATEGIC IDEA DISPATCHED");
        setNewIdea({ title: "", description: "", priority: "medium" });
        setSelectedStaffForIdea([]);
        setIsIdeasOpen(false);
    };

    const sendChatMessage = async () => {
        if (!selectedStaffForChat || !chatMessage.trim()) return;

        await supabase.from("notifications").insert({
            user_id: selectedStaffForChat.id,
            title: "URGENT MESSAGE FROM CEO",
            message: chatMessage.trim(),
            type: "message",
        });

        toast.success(`Message sent to ${selectedStaffForChat.full_name}`);
        setChatMessage("");
        setIsChatModalOpen(false);
        setSelectedStaffForChat(null);
    };

    const handleScheduleMeeting = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !newMeeting.title ||
            !newMeeting.date ||
            !newMeeting.time ||
            newMeeting.participants.length === 0
        ) {
            return toast.error("Mission parameters incomplete");
        }

        try {
            const scheduledAt = new Date(
                `${newMeeting.date}T${newMeeting.time}`,
            ).toISOString();

            // Format dynamic agenda items into a single string for now if the DB doesn't support JSON yet.
            let fullAgenda = newMeeting.agenda || "";
            if (newMeeting.agendaItems.length > 0) {
                fullAgenda =
                    "STRATEGIC AGENDA:\n" +
                    newMeeting.agendaItems
                        .map((item, i) => {
                            const ownerName =
                                item.owner === "CEO"
                                    ? "CEO"
                                    : staff.find((s) => s.id === item.owner)
                                          ?.full_name || "Unassigned";
                            return `${i + 1}. ${item.topic} (${ownerName} - ${item.time}m)`;
                        })
                        .join("\n") +
                    "\n\n" +
                    (newMeeting.agenda
                        ? `ADDITIONAL NOTES:\n${newMeeting.agenda}`
                        : "");
            }

            // Append location and other new fields to the agenda notes as a fallback
            const meetingDetails = `\n\nLOGISTICS:\nLocation/Link: ${newMeeting.location || "TBD"}\nDuration: ${newMeeting.duration}m\nClassification: ${newMeeting.type.toUpperCase()}\nPriority: ${newMeeting.priority.toUpperCase()}`;
            fullAgenda += meetingDetails;

            // 1. Create meeting with basic fields first
            let meeting: any = null;
            let meetingError: any = null;
            
            // Calculate start and end times
            const startTime = scheduledAt;
            const endTime = new Date(new Date(scheduledAt).getTime() + (parseInt(newMeeting.duration) || 60) * 60000).toISOString();
            
            try {
                const result = await supabase
                    .from("meetings")
                    .insert({
                        title: newMeeting.title,
                        agenda: fullAgenda,
                        scheduled_at: scheduledAt,
                        start_time: startTime,
                        end_time: endTime,
                        duration_minutes: parseInt(newMeeting.duration) || 60,
                        attendees: newMeeting.participants, // Use attendees field as per original schema
                        participants: newMeeting.participants, // Also try participants field in case it exists
                    })
                    .select()
                    .single();
                
                meeting = result.data;
                meetingError = result.error;
            } catch (err) {
                console.error('Meeting creation error:', err);
                meetingError = err;
            }

            if (meetingError || !meeting) {
                console.error("Meeting creation error:", meetingError);
                
                // Try with minimal fields as fallback
                try {
                    const fallbackResult = await supabase
                        .from("meetings")
                        .insert({
                            title: newMeeting.title,
                            scheduled_at: scheduledAt,
                            start_time: startTime,
                            end_time: endTime,
                            attendees: newMeeting.participants, // Add attendees to fallback too
                            participants: newMeeting.participants, // Also add participants
                        })
                        .select()
                        .single();
                    
                    meeting = fallbackResult.data;
                    meetingError = fallbackResult.error;
                } catch (fallbackErr) {
                    console.error("Fallback meeting creation also failed:", fallbackErr);
                    meetingError = fallbackErr;
                }
                
                if (meetingError || !meeting) {
                    throw new Error("Failed to create meeting: " + (meetingError as any)?.message || "Unknown error");
                }
            }

            // 2. Add participants to meeting_participants table
            const participantData = newMeeting.participants.map((pid) => ({
                meeting_id: meeting.id,
                user_id: pid,
            }));

            const { error: partError } = await supabase
                .from("meeting_participants")
                .insert(participantData);

            if (partError) {
                console.error("Participant addition error:", partError);
                throw partError;
            }

            // 3. Dispatch Pre-Meeting Tasks (if any)
            if (newMeeting.preMeetingTasks.length > 0) {
                const tasksToInsert = newMeeting.preMeetingTasks
                    .filter(
                        (t) =>
                            t.title && t.assignedTo && t.assignedTo !== "CEO",
                    )
                    .map((t) => ({
                        title: `[PRE-MEETING] ${t.title}`,
                        description: `Preparatory task for summit: ${newMeeting.title}`,
                        assigned_to: t.assignedTo,
                        priority:
                            newMeeting.priority === "critical"
                                ? "urgent"
                                : "high",
                        status: "pending",
                        created_by: profile?.id,
                        due_date: newMeeting.date, // Use meeting date as deadline
                    }));

                if (tasksToInsert.length > 0) {
                    const { error: tasksError } = await supabase
                        .from("tasks")
                        .insert(tasksToInsert);
                    if (tasksError)
                        console.error(
                            "Failed to assign pre-meeting tasks:",
                            tasksError,
                        );
                }
            }

            // 4. Dispatch notifications to participants
            const notificationData = newMeeting.participants.map((pid) => ({
                recipient_id: pid,
                meeting_id: meeting.id,
                title: `${newMeeting.priority.toUpperCase()} EXECUTIVE SUMMONS`,
                message: `You are summoned for: ${newMeeting.title} at ${format(parseISO(scheduledAt), "p")}. Type: ${newMeeting.type}`,
            }));

            const { error: notifError } = await supabase
                .from("meeting_notifications")
                .insert(notificationData);

            if (notifError) {
                console.error("Notification dispatch error:", notifError);
                // Don't throw error for notifications, just log it
            }

            toast.success("EXECUTIVE SUMMIT DEPLOYED", {
                description: `Summons sent to ${newMeeting.participants.length} operatives.`,
            });
            setIsScheduleMeetingOpen(false);

            // Reset state
            setNewMeeting({
                title: "",
                type: "strategic",
                priority: "medium",
                outcome: "decision",
                duration: "60",
                location: "Virtual HQ",
                agendaItems: [],
                preMeetingTasks: [],
                notifications: { dashboard: true, email: true, push: true, sms: false },
                reminder: "15",
                notes: "",
                agenda: "",
                date: "",
                time: "",
                participants: [],
            });
            setMeetingStep(1);
            fetchData();
        } catch (error) {
            console.error("Meeting failed:", error);
            toast.error("Deployment failure: " + (error as any)?.message || "Unknown error");
        }
    };

    const openChatModal = (staff: Profile) => {
        setSelectedStaffForChat(staff);
        setIsChatModalOpen(true);
    };
    return (
        <div className="min-h-screen bg-ua-mesh-gradient text-theme-text font-sans selection:bg-theme-bg-white-10 p-6 flex flex-col gap-6">
            {/* HEADER WITH LOGO AND CEO IDENTITY */}
            <header className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-6">
                    {/* Usthad Academy Logo */}
                    <div
                        className={`flex items-center gap-4 ${theme === "dark" ? "grayscale opacity-80" : ""}`}
                    >
                        <div className="h-[52px] w-[52px]">
                            <img
                                src={
                                    theme === "light"
                                        ? "/images/usthadacademylogo2.svg"
                                        : "/images/usthadacademylogo.svg"
                                }
                                alt="UA"
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    (
                                        e.target as HTMLImageElement
                                    ).style.display = "none";
                                }}
                            />
                        </div>
                        <div className="h-[60px] w-[220px]">
                            <img
                                src={
                                    theme === "light"
                                        ? "/images/verticallogo.svg"
                                        : "/images/whitevericallogo.svg"
                                }
                                alt="Usthad Academy"
                                className="h-full w-full object-contain object-left"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-black uppercase tracking-[0.2em] text-theme-text-80 mr-4">
                        CEO DASHBOARD
                    </h1>

                    {/* System Health Indicator */}
                    <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border ${stats.systemStatus === "STABLE" && stats.overdueCount === 0 ? "bg-green-500/10 border-green-500/20" : "bg-orange-500/10 border-orange-500/20"}`}
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${stats.systemStatus === "STABLE" && stats.overdueCount === 0 ? "bg-green-500 animate-pulse" : "bg-[#FA4616] animate-pulse"}`}
                        />
                        <span
                            className={`text-[9px] font-bold uppercase tracking-widest ${stats.systemStatus === "STABLE" && stats.overdueCount === 0 ? "text-green-600 dark:text-green-400" : "text-[#FA4616]"}`}
                        >
                            {stats.systemStatus === "STABLE" &&
                            stats.overdueCount === 0
                                ? "SYSTEM STABLE"
                                : "ATTENTION REQUIRED"}
                        </span>
                    </div>
                    <ThemeToggle />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchData}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-3 py-2 bg-theme-nav-bg border border-theme-border-10 hover:border-theme-border-20 hover:bg-theme-bg-white-5 rounded-full transition-all duration-300 shadow-sm text-[10px] font-black uppercase tracking-widest text-theme-text-40 hover:text-theme-text"
                    >
                        <RefreshCw
                            className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => signOut()}
                        className="flex items-center gap-2 px-3 py-2 bg-theme-nav-bg border border-theme-border-10 hover:border-theme-border-20 hover:bg-theme-bg-white-5 rounded-full transition-all duration-300 shadow-sm text-[10px] font-black uppercase tracking-widest text-theme-text-40 hover:text-theme-text"
                    >
                        <LogOut className="w-3 h-3 text-red-500/80" />
                        Logout
                    </Button>
                </div>
            </header>
            {/* 1?????? EXECUTIVE STATUS BAR */}
            <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-7 gap-4 mb-6">
                {/* Glassmorphic Pending Approvals Card */}
                <div className="ua-entry-animate ua-entry-delay-1 glass-card-ua rounded-2xl p-5 flex flex-col gap-1 col-span-2 ua-hover-lift">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-theme-text-40 uppercase tracking-widest leading-none">
                            Pending Approvals
                        </span>
                        <ClipboardList className="w-3.5 h-3.5 text-theme-text-20" />
                    </div>
                    <span className="ua-count-animate text-2xl font-black text-theme-text">
                        {stats.decisionsPending}
                    </span>
                </div>
                {/* Glassmorphic Staff Card */}
                <div className="ua-entry-animate ua-entry-delay-2 glass-card-ua rounded-2xl p-5 flex flex-col gap-1 ua-hover-lift">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-theme-text-40 uppercase tracking-widest leading-none">
                            Staff
                        </span>
                        <Activity className="w-3.5 h-3.5 text-emerald-500/80" />
                    </div>
                    <span className="ua-count-animate text-2xl font-black text-theme-text">
                        {stats.staffOnline}
                        <span className="text-xs text-theme-text-20 ml-1">
                            /{stats.staffTotal}
                        </span>
                    </span>
                </div>
                <div className="ua-entry-animate ua-entry-delay-3 bg-theme-card border border-white/[0.1] shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-2xl p-5 flex flex-col gap-1 shadow-2xl ua-hover-lift">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-theme-text-40 uppercase tracking-widest leading-none">
                            Decisions
                        </span>
                        <CheckSquare className="w-3.5 h-3.5 text-theme-text-20" />
                    </div>
                    <span className="text-2xl font-black text-theme-text">
                        {stats.decisionsPending}
                    </span>
                </div>
                <div className="bg-theme-card border border-white/[0.1] shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-2xl p-5 flex flex-col gap-1 shadow-2xl">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-theme-text-40 uppercase tracking-widest leading-none">
                            Tasks
                        </span>
                        <ListTodo className="w-3.5 h-3.5 text-theme-text-20" />
                    </div>
                    <span className="text-2xl font-black text-theme-text">
                        {stats.tasksInProgress}
                    </span>
                </div>
                <div
                    className={`bg-theme-card border rounded-2xl p-5 flex flex-col gap-1 shadow-2xl ${stats.overdueCount > 0 ? "border-red-500/40 shadow-red-500/5 transition-colors" : "border-theme-border-5"}`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-bold text-theme-text-40 uppercase tracking-widest leading-none">
                            Overdue
                        </span>
                        <AlertTriangle
                            className={`w-3.5 h-3.5 ${stats.overdueCount > 0 ? "text-red-500" : "text-theme-text-20"}`}
                        />
                    </div>
                    <span
                        className={`text-xl font-black ${stats.overdueCount > 0 ? "text-red-500" : "text-theme-text-20"}`}
                    >
                        {stats.overdueCount}
                    </span>
                </div>
            </div>{" "}
            {/* end - status bar grid */}
            {/* 1.5?????? COMMAND PULSE ALERT STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-theme-card border border-theme-border-5 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ua-hover-lift">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-theme-text">
                            {
                                tasks.filter(
                                    (t) =>
                                        t.priority === "urgent" ||
                                        t.priority === "high",
                                ).length
                            }
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-theme-text-40">
                            Urgent Tasks
                        </span>
                    </div>
                </div>

                <div className="bg-theme-card border border-theme-border-5 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ua-hover-lift">
                    <div className="p-2 bg-orange-500/10 rounded-lg text-[#FA4616]">
                        <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-theme-text">
                            {stats.overdueCount}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-theme-text-40">
                            Overdue Tasks
                        </span>
                    </div>
                </div>

                <div className="bg-theme-card border border-theme-border-5 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ua-hover-lift">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-theme-text">
                            {
                                meetings.filter((m) => {
                                    const today = new Date()
                                        .toISOString()
                                        .split("T")[0];
                                    return m.scheduled_at.startsWith(today);
                                }).length
                            }
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-theme-text-40">
                            Meetings Today
                        </span>
                    </div>
                </div>

                <div className="bg-theme-card border border-theme-border-5 rounded-xl p-3 flex items-center gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ua-hover-lift">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-[#2F1E73] dark:text-purple-400">
                        <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-theme-text">
                            {stats.decisionsPending}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-theme-text-40">
                            Pending Approvals
                        </span>
                    </div>
                </div>
            </div>
            <main className="grid grid-cols-12 gap-6 flex-1">
                {/* 2?????? LEFT COLUMN - EXECUTIVE AUTHORITY */}
                <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                    {/* ???? LIVE OPERATIONS SIGNAL PANEL - Hidden on mobile */}
                    <div className="hidden md:flex bg-theme-card border border-theme-border-10 rounded-2xl overflow-hidden shadow-2xl flex-col w-full max-w-[300px] mx-auto lg:mx-0">
                        {/* Today Summary Header - Hidden on mobile */}
                        <div className="hidden md:block p-4 bg-theme-bg-white-5 border-b border-theme-border-5">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-text-40 mb-3">
                                Today Summary
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-theme-card border border-theme-border-5 rounded-xl p-2.5 flex flex-col gap-0.5">
                                    <span className="text-[14px] font-black text-blue-500">
                                        {stats.tasksAssignedToday}
                                    </span>
                                    <span className="text-[8px] font-bold text-theme-text-40 uppercase tracking-tighter">
                                        Tasks Assigned
                                    </span>
                                </div>
                                <div className="bg-theme-card border border-theme-border-5 rounded-xl p-2.5 flex flex-col gap-0.5">
                                    <span className="text-[14px] font-black text-emerald-500">
                                        {stats.paymentsReceivedToday}
                                    </span>
                                    <span className="text-[8px] font-bold text-theme-text-40 uppercase tracking-tighter">
                                        Payments Received
                                    </span>
                                </div>
                                <div className="bg-theme-card border border-theme-border-5 rounded-xl p-2.5 flex flex-col gap-0.5">
                                    <span className="text-[14px] font-black text-orange-500">
                                        {stats.leavesRequestedToday}
                                    </span>
                                    <span className="text-[8px] font-bold text-theme-text-40 uppercase tracking-tighter">
                                        Leaves Requested
                                    </span>
                                </div>
                                <div className="bg-theme-card border border-theme-border-5 rounded-xl p-2.5 flex flex-col gap-0.5">
                                    <span className="text-[14px] font-black text-purple-500">
                                        {stats.newLeadsToday}
                                    </span>
                                    <span className="text-[8px] font-bold text-theme-text-40 uppercase tracking-tighter">
                                        New Leads
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 flex flex-col gap-4 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-80">
                                        Signal Feed
                                    </h3>
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={clearSignalFeed}
                                        className="p-1 rounded hover:bg-theme-border-10 transition-colors"
                                        title="Clear Signal Feed"
                                        disabled={activities.length === 0}
                                    >
                                        <Trash2
                                            className={`w-3 h-3 ${activities.length === 0 ? "text-theme-text-10" : "text-theme-text-20 hover:text-theme-text-40"} transition-colors`}
                                        />
                                    </button>
                                    <RefreshCw
                                        className={`w-3 h-3 text-theme-text-20 ${isRefreshing ? "animate-spin" : ""}`}
                                    />
                                </div>
                            </div>

                            <ScrollArea className="h-[360px] pr-3">
                                <div className="relative pl-4">
                                    {/* Vertical Timeline Line */}
                                    <div className="absolute left-[7px] top-1 bottom-1 w-[1px] bg-theme-border-10" />

                                    <AnimatePresence mode="popLayout">
                                        {activities.length === 0 ? (
                                            <div className="h-40 flex flex-col items-center justify-center text-center p-4">
                                                <Wifi className="w-6 h-6 text-theme-text-10 mb-2 opacity-30" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-theme-text-20">
                                                    Awaiting Signals...
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-6">
                                                {activities.map(
                                                    (act, index) => (
                                                        <motion.div
                                                            key={act.id}
                                                            initial={{
                                                                opacity: 0,
                                                                x: -5,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    index *
                                                                    0.05,
                                                            }}
                                                            className="relative group pr-1"
                                                        >
                                                            {/* Timeline Dot */}
                                                            <div
                                                                className="absolute -left-[12.5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-theme-card z-10 transition-transform group-hover:scale-125"
                                                                style={{
                                                                    backgroundColor:
                                                                        act.color,
                                                                }}
                                                            />

                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <act.icon
                                                                            className="w-3 h-3 shrink-0"
                                                                            style={{
                                                                                color: act.color,
                                                                            }}
                                                                        />
                                                                        <span className="text-[10px] font-black uppercase tracking-tight text-theme-text truncate">
                                                                            {
                                                                                act.title
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[8px] font-bold text-theme-text-20 tabular-nums shrink-0 uppercase tracking-tighter">
                                                                        {format(
                                                                            parseISO(
                                                                                act.time ||
                                                                                    new Date().toISOString(),
                                                                            ),
                                                                            "HH:mm",
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-theme-text-40 leading-[1.3] line-clamp-2 pl-5">
                                                                    {
                                                                        act.description
                                                                    }
                                                                </p>
                                                            </div>

                                                            {/* Subtle Glow on Hover */}
                                                            <div
                                                                className="absolute -inset-2 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity -z-10"
                                                                style={{
                                                                    backgroundColor:
                                                                        act.color,
                                                                }}
                                                            />
                                                        </motion.div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </aside>

                {/* 3?????? CENTER COLUMN - ACTIVE OPERATIONS */}
                <section className="col-span-12 lg:col-span-6 flex flex-col gap-4">
                    <SectionHeader
                        title="Active Operations"
                        color="bg-amber-500"
                    />

                    {departmentFilter === "ceo" && (
                        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 p-1 bg-theme-bg-white-5 rounded-2xl border border-theme-border-10 w-full md:w-fit overflow-x-auto scrollbar-hide">
                            <button
                                onClick={() => setTaskTab("active")}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                    taskTab === "active"
                                        ? "bg-theme-bg-white text-theme-inv-text shadow-lg"
                                        : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                                }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setTaskTab("blocked")}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                    taskTab === "blocked"
                                        ? "bg-red-500 text-theme-text shadow-lg shadow-red-500/20"
                                        : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                                }`}
                            >
                                Urgent
                            </button>
                            <button
                                onClick={() => setTaskTab("overdue")}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                    taskTab === "overdue"
                                        ? "bg-amber-500 text-theme-inv-text shadow-lg shadow-amber-500/20"
                                        : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                                }`}
                            >
                                Overdue
                            </button>
                            <button
                                onClick={() => setTaskTab("completed")}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                    taskTab === "completed"
                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                        : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                                }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setTaskTab("daily")}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                    taskTab === "daily"
                                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                        : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                                }`}
                            >
                                Daily Tasks
                            </button>
                        </div>
                    )}

                    {/* Department Filters */}
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 p-1 bg-theme-bg-white-5 rounded-2xl border border-theme-border-10 w-full md:w-fit overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setDepartmentFilter("ceo")}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                departmentFilter === "ceo"
                                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                                    : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                            }`}
                        >
                            CEO
                        </button>
                        <button
                            onClick={() => setDepartmentFilter("sales")}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                departmentFilter === "sales"
                                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                    : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                            }`}
                        >
                            Sales
                        </button>
                        <button
                            onClick={() => setDepartmentFilter("marketing")}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                departmentFilter === "marketing"
                                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                                    : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                            }`}
                        >
                            Marketing
                        </button>
                        <button
                            onClick={() => setDepartmentFilter("accounts")}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                departmentFilter === "accounts"
                                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                                    : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                            }`}
                        >
                            Accounts
                        </button>
                        <button
                            onClick={() => setDepartmentFilter("administration")}
                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                                departmentFilter === "administration"
                                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                            }`}
                        >
                            Admin
                        </button>
                    </div>

                    {taskTab === "completed" && (
                        <div className="flex justify-end mb-2">
                            <button
                                onClick={clearAllCompletedTasks}
                                className="px-3 py-1 text-[8px] font-black uppercase bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded transition-all border-none"
                            >
                                Clear All Completed
                            </button>
                        </div>
                    )}

                    <div className="flex-1 overflow-hidden">
                        <div className="h-full max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="flex flex-col gap-3">
                        {/* Compute displayed tasks */}
                        {(() => {
                            let displayedTasks;
                            
                            if (taskTab === "completed") {
                                displayedTasks = completedTasks;
                            } else {
                                displayedTasks = tasks.filter((t) => {
                                    // Exclude tasks that are currently being deleted
                                    if (deletingTaskIds.has(t.id)) {
                                        return false;
                                    }
                                    
                                    const isOverdue =
                                        t.due_date &&
                                        new Date(t.due_date) < new Date();
                                    const isDaily =
                                        t.is_daily_task === true ||
                                        t.repeat_daily === true;

                                    // Department filtering - check creator's role
                                    if (departmentFilter !== "ceo") {
                                        const creator = staff.find(s => s.id === t.created_by);
                                        if (!creator) return false;
                                        
                                        const creatorRole = creator.role?.toLowerCase();
                                        switch (departmentFilter) {
                                            case "sales":
                                                return creatorRole === "sales manager" || creatorRole === "sales staff";
                                            case "marketing":
                                                return creatorRole === "marketing manager" || creatorRole === "marketing staff";
                                            case "accounts":
                                                return creatorRole === "accounts manager" || creatorRole === "accounts staff";
                                            case "administration":
                                                return creatorRole === "admin" || creatorRole === "administration" || creatorRole === "hr";
                                            default:
                                                return false;
                                        }
                                    }

                                    // CEO filter - apply task status filters
                                    if (departmentFilter === "ceo") {
                                        if (taskTab === "daily") return isDaily;
                                        if (taskTab === "overdue") return isOverdue;
                                        if (taskTab === "blocked")
                                            return t.priority === "urgent"; // Treat urgent as blocked/high focus
                                        return !isOverdue && t.priority !== "urgent"; // Active default
                                    }

                                    if (taskTab === "daily") return isDaily;
                                    if (taskTab === "overdue") return isOverdue;
                                    if (taskTab === "blocked")
                                        return t.priority === "urgent"; // Treat urgent as blocked/high focus
                                    return !isOverdue && t.priority !== "urgent"; // Active default
                                });
                            }

                            if (displayedTasks.length === 0) {
                                return (
                                    <div className="h-40 border border-dashed border-theme-brand/20 text-center text-theme-text-40 text-[10px] uppercase tracking-widest rounded-3xl bg-theme-bg-white-5 flex flex-col items-center justify-center gap-2 transition-all animate-executive-fade-in shadow-inner">
                                        <CheckCircle className="w-6 h-6 text-theme-brand opacity-80" />
                                        <span>
                                            {taskTab === "completed" ? "No completed tasks" : 
                                             departmentFilter === "ceo" ? "No active operations at the moment" :
                                             departmentFilter === "sales" ? "No sales department tasks" :
                                             departmentFilter === "marketing" ? "No marketing department tasks" :
                                             departmentFilter === "accounts" ? "No accounts department tasks" :
                                             departmentFilter === "administration" ? "No administration department tasks" :
                                             "No active operations at the moment"}
                                        </span>
                                    </div>
                                );
                            }

                            return displayedTasks.map((t) => {
                                const assignee = staff.find(
                                    (s) => s.id === t.assigned_to,
                                );
                                const isOverdue =
                                    t.due_date &&
                                    new Date(t.due_date) < new Date();

                                return (
                                    <div
                                        key={t.id}
                                        className={`group flex flex-col gap-2 p-4 rounded-2xl transition-all duration-300 shadow-xl border border-l-4 hover:-translate-y-[3px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] ${
                                            t.priority === "urgent"
                                                ? "border-l-[#FA4616]"
                                                : t.status === "completed"
                                                  ? "border-l-[#2ecc71]"
                                                  : "border-l-[#2F1E73]"
                                        } ${
                                            isOverdue
                                                ? "bg-red-500/5 hover:bg-red-500/10 border-r-red-500/20 border-y-red-500/20"
                                                : taskTab === "blocked"
                                                  ? "bg-amber-500/5 hover:bg-amber-500/10 border-r-amber-500/20 border-y-amber-500/20"
                                                  : "bg-theme-card hover:bg-theme-hover-brand-bg border-r-theme-border-10 border-y-theme-border-10 hover:border-r-theme-brand/30 hover:border-y-theme-brand/30"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 flex flex-col gap-1">
                                                <h4 className="text-sm font-black text-theme-text leading-tight uppercase">
                                                    {t.title}
                                                </h4>
                                                <p className="text-[10px] text-theme-text-40 line-clamp-2">
                                                    {t.description ||
                                                        "No description provided."}
                                                </p>
                                            </div>
                                            <Badge
                                                className={`text-[8px] uppercase font-black px-2 py-1 flex items-center gap-1 ${
                                                    isOverdue
                                                        ? "bg-red-500 text-theme-text"
                                                        : t.status ===
                                                            "in_progress"
                                                          ? "bg-emerald-500 text-theme-text"
                                                          : t.priority ===
                                                              "urgent"
                                                            ? "bg-amber-500 text-theme-text"
                                                            : "bg-theme-bg-white-10 text-theme-text-60"
                                                }`}
                                            >
                                                {isOverdue ||
                                                t.priority === "urgent" ? (
                                                    <AlertTriangle className="w-2 h-2" />
                                                ) : null}
                                                {isOverdue
                                                    ? "OVERDUE"
                                                    : t.priority === "urgent"
                                                      ? "BLOCKED/URGENT"
                                                      : t.status ===
                                                          "in_progress"
                                                        ? "ACTIVE"
                                                        : "PENDING"}
                                            </Badge>
                                        </div>

                                        <div className="mt-2 pt-3 border-t border-theme-border-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        openChatModal(
                                                            assignee!,
                                                        );
                                                    }}
                                                    disabled={!assignee}
                                                    className="flex items-center gap-2 hover:bg-theme-bg-white-5 p-1 -ml-1 rounded transition-colors group/staff"
                                                >
                                                    <div className="w-5 h-5 rounded-full bg-theme-bg-white-10 border border-theme-border-20 flex items-center justify-center text-[8px] font-black text-theme-text-60 uppercase">
                                                        {assignee?.full_name?.charAt(
                                                            0,
                                                        ) || "?"}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-theme-text-60 group-hover/staff:text-theme-text transition-colors uppercase">
                                                        {assignee?.full_name ||
                                                            "Unassigned"}
                                                    </span>
                                                </button>
                                                {t.due_date && (
                                                    <Fragment>
                                                        <div className="w-[1px] h-3 bg-theme-bg-white-10" />
                                                        <span
                                                            className={`text-[9px] font-bold uppercase ${isOverdue ? "text-red-400" : "text-theme-text-40"}`}
                                                        >
                                                            Due:{" "}
                                                            {format(
                                                                parseISO(
                                                                    t.due_date,
                                                                ),
                                                                "MMM d",
                                                            )}
                                                        </span>
                                                    </Fragment>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {taskTab === "completed" ? (
                                                    <button
                                                        onClick={() => markTaskAsReviewed(t.id)}
                                                        className="h-6 px-2 text-[8px] font-black uppercase bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded transition-all border-none"
                                                    >
                                                        Mark Reviewed
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            console.log("Remove button clicked for task:", t.id, t);
                                                            deleteTask(t.id);
                                                        }}
                                                        disabled={deletingTaskIds.has(t.id)}
                                                        className={`h-6 px-2 text-[8px] font-black uppercase rounded transition-all border-none ${
                                                            deletingTaskIds.has(t.id)
                                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                : 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white'
                                                        }`}
                                                    >
                                                        {deletingTaskIds.has(t.id) ? (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                                                                Deleting...
                                                            </div>
                                                        ) : (
                                                            'Remove'
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                            </div>
                        </div>
                    </div>
                </section>

                
                {/* 4?????? RIGHT COLUMN - INTELLIGENCE & DIRECTIVES (REFINE) */}
                <aside className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                    {/* Ideas & Directives Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <SectionHeader
                                title="CEO Command Log"
                                color="bg-amber-500"
                            />
                            <Button
                                onClick={() => router.push("/ceo/directive-intelligence")}
                                size="sm"
                                className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 text-[8px] font-black uppercase tracking-widest h-7 px-3 rounded-lg transition-all"
                            >
                                <Bookmark className="w-3 h-3 mr-1" />
                                View All
                            </Button>
                        </div>
                        
                        {/* Thought Capture Glassmorphic Input */}
                        <ThoughtCapture 
                            onCapture={() => fetchData()} 
                            compact={true}
                        />
                        {ideas.length === 0 ? (
                            <div className="p-6 border border-dashed border-theme-border-5 text-center text-theme-text-20 text-[9px] uppercase tracking-widest rounded-2xl bg-black/20">
                                No active reminders or directives found
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3 ua-shimmer-effect">
                                {ideas.map((idea) => {
                                    const isCompleted = completedIdeas.has(idea.id);
                                    const acknowledgedCount =
                                        (idea as any).acknowledged_by?.length ||
                                        0;
                                    const unacknowledged =
                                        (idea.shared_with?.length || 0) -
                                        acknowledgedCount;
                                    
                                    // Priority colors
                                    const priorityColors = {
                                        low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                        medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                                        high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
                                        urgent: "bg-red-500/10 text-red-500 border-red-500/20"
                                    };
                                    
                                    return (
                                        <div
                                            key={idea.id}
                                            className={`relative rounded-2xl p-4 flex flex-col gap-3 transition-all duration-300 ${
                                                unacknowledged > 0 ? "border-amber-500/40" : "border-white/20"
                                            }`}
                                            style={{
                                                background: "rgba(255,255,255,0.1)",
                                                backdropFilter: "blur(20px) saturate(180%)",
                                                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                                                border: "1px solid rgba(255,255,255,0.2)",
                                                boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 1px 0px rgba(255,255,255,0.2) inset",
                                            }}
                                        >
                                            {/* Tick Box and Content */}
                                            <div className="flex items-start gap-3">
                                                {/* Circular Tick Box */}
                                                <button
                                                    onClick={() => toggleIdeaCompletion(idea.id)}
                                                    className="w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center transition-all duration-200 flex-shrink-0 mt-0.5"
                                                    style={{
                                                        background: isCompleted ? "rgba(34,197,94,0.2)" : "transparent",
                                                        borderColor: isCompleted ? "rgb(34,197,94)" : "rgba(255,255,255,0.4)",
                                                    }}
                                                >
                                                    {isCompleted && (
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                    )}
                                                </button>
                                                
                                                {/* Content Container */}
                                                <div className="flex-1">
                                                    {/* Header with Title and Priority */}
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {idea.title && (
                                                                <h4 className={`text-sm font-bold leading-tight line-clamp-1 transition-all duration-300 ${
                                                                    isCompleted 
                                                                        ? "text-gray-400 line-through" 
                                                                        : "text-white"
                                                                }`}>
                                                                    {idea.title}
                                                                </h4>
                                                            )}
                                                            <Badge className={`text-[8px] rounded-lg uppercase border-none font-black tracking-wider ${priorityColors[idea.priority as keyof typeof priorityColors] || priorityColors.medium}`}>
                                                                {idea.priority || 'medium'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] text-white/60">
                                                                {format(
                                                                    parseISO(
                                                                        idea.created_at,
                                                                    ),
                                                                    "MMM d",
                                                                )}
                                                            </span>
                                                            {!idea.title && (
                                                                <Badge className="bg-amber-500/10 text-amber-500 text-[8px] rounded-xl uppercase border-none font-black tracking-widest">
                                                                    Directive
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    <p className={`text-sm font-medium leading-relaxed line-clamp-3 transition-all duration-300 ${
                                                        isCompleted 
                                                            ? "text-gray-400 line-through" 
                                                            : "text-white/80"
                                                    }`}>
                                                        {idea.content}
                                                    </p>
                                                    
                                                    {/* Action Date Tag */}
                                                    <div className="mt-2">
                                                        <span className="text-[8px] font-medium text-white/50">
                                                            {isCompleted ? "Completed" : "Due Today"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                                
                                                {/* Staff Sharing Status */}
                                                {(idea.shared_with?.length || 0) > 0 && (
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest">
                                                            <span className={`${unacknowledged > 0 ? "text-amber-500" : "text-white/40"}`}>
                                                                {unacknowledged > 0 ? "Pending" : "All Seen"} ({acknowledgedCount}/{idea.shared_with?.length || 0})
                                                            </span>
                                                            {unacknowledged > 0 && (
                                                                <span className="text-amber-500 animate-pulse">
                                                                    ● {unacknowledged} new
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Staff Avatars */}
                                                        <div className="flex items-center gap-1">
                                                            {(idea.shared_with || []).slice(0, 4).map((staffId: string, index: number) => {
                                                                const staffMember = staff.find(s => s.id === staffId);
                                                                const hasSeen = (idea as any).acknowledged_by?.includes(staffId);
                                                                return (
                                                                    <div key={staffId} className="relative">
                                                                        <Avatar className="w-6 h-6 border-2 border-white/20">
                                                                            <AvatarFallback className="text-[8px] font-bold bg-white/10 text-white/60">
                                                                            {staffMember?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-theme-card ${
                                                                        hasSeen ? "bg-emerald-500" : "bg-gray-400"
                                                                    }`} />
                                                                </div>
                                                            );
                                                        })}
                                                        {(idea.shared_with?.length || 0) > 4 && (
                                                            <div className="w-6 h-6 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                                                                <span className="text-[8px] font-bold text-white/60">
                                                                    +{(idea.shared_with?.length || 0) - 4}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Due Reminders Section */}
                    {(() => {
                        const dueReminders = ideas.filter(idea => {
                            if (!idea.follow_up_date) return false;
                            const date = parseISO(idea.follow_up_date);
                            return isPast(date) || isToday(date) || isTomorrow(date);
                        }).slice(0, 3);
                        
                        if (dueReminders.length === 0) return null;
                        
                        return (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-4 bg-red-500 rounded-full" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
                                        Due Reminders
                                    </h3>
                                    <span className="ml-auto text-[9px] text-red-400/60 font-bold">
                                        {dueReminders.length} pending
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {dueReminders.map(idea => {
                                        const date = parseISO(idea.follow_up_date!);
                                        const isOverdue = isPast(date) && !isToday(date);
                                        const isDueToday = isToday(date);
                                        
                                        return (
                                            <div 
                                                key={idea.id}
                                                className={`
                                                    p-3 rounded-xl border text-xs
                                                    ${isOverdue 
                                                        ? 'bg-red-500/10 border-red-500/30 text-red-300' 
                                                        : isDueToday
                                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                                                            : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="font-bold">
                                                        {isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : 'Due Tomorrow'}
                                                    </span>
                                                </div>
                                                <p className="line-clamp-2 opacity-80">{idea.title || idea.content}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Compact Staff Visibility List */}
                    <div className="flex flex-col gap-3">
                        <SectionHeader
                            title="Staff Presence"
                            color="bg-emerald-500"
                        />
                        <div className="flex flex-col gap-2 bg-theme-card border border-theme-border-5 rounded-2xl p-2 hide-scrollbar max-h-48 overflow-y-auto">
                            {stats.sortedStaff.map((s) => {
                                const staffTasks = tasks.filter(
                                    (t) => t.assigned_to === s.id,
                                );
                                return (
                                    <div
                                        key={s.id}
                                        className="flex items-center justify-between p-2 hover:bg-theme-bg-white-5 rounded-xl transition-colors cursor-pointer"
                                        onClick={() =>
                                            setShowStaffOverview(true)
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-1.5 h-1.5 rounded-full ${s.status === "online" ? "bg-emerald-500" : s.status === "busy" ? "bg-amber-500" : "bg-theme-bg-white-20"}`}
                                            />
                                            <span className="text-[10px] font-bold text-theme-text uppercase">
                                                {s.full_name}
                                            </span>
                                        </div>
                                        <span className="text-[8px] text-theme-text-40 uppercase font-black">
                                            {staffTasks.length} Tasks
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <Button
                            onClick={() => setShowStaffOverview(true)}
                            className="w-full bg-theme-bg-white-5 hover:bg-theme-bg-white-10 text-theme-text-60 hover:text-theme-text text-[9px] font-black uppercase tracking-widest border border-theme-border-10 rounded-xl h-10"
                        >
                            Staff Overview
                        </Button>
                    </div>
                </aside>
            </main>
            {/* 6?????? FLOATING QUICK ACTION BUTTON */}
            <div className="fixed bottom-8 right-8 z-50">
                <div className="relative">
                    {/* Expandable Menu */}
                    <div
                        className={`absolute bottom-full right-0 mb-4 flex flex-col gap-2 items-end transition-all duration-300 ${isActionMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
                    >
                        <button
                            onClick={() => {
                                setIsAssignTaskOpen(true);
                                setIsActionMenuOpen(false);
                            }}
                            className="flex items-center gap-3 bg-theme-card text-theme-text border border-theme-border-10 px-4 py-3 rounded-2xl shadow-lg hover:bg-theme-bg-white-5 hover:border-theme-brand/30 transition-all hover:-translate-x-1"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                Assign Task
                            </span>
                            <div className="p-1.5 bg-[#2F1E73]/10 text-[#2F1E73] dark:text-purple-400 rounded-lg">
                                <Target className="w-4 h-4" />
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setIsScheduleMeetingOpen(true);
                                setIsActionMenuOpen(false);
                            }}
                            className="flex items-center gap-3 bg-theme-card text-theme-text border border-theme-border-10 px-4 py-3 rounded-2xl shadow-lg hover:bg-theme-bg-white-5 hover:border-theme-brand/30 transition-all hover:-translate-x-1"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                Schedule Meeting
                            </span>
                            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
                                <Clock className="w-4 h-4" />
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                setIsAddStaffOpen(true);
                                setIsActionMenuOpen(false);
                            }}
                            className="flex items-center gap-3 bg-theme-card text-theme-text border border-theme-border-10 px-4 py-3 rounded-2xl shadow-lg hover:bg-theme-bg-white-5 hover:border-theme-brand/30 transition-all hover:-translate-x-1"
                        >
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                Add Staff
                            </span>
                            <div className="p-1.5 bg-[#FA4616]/10 text-[#FA4616] rounded-lg">
                                <UserPlus className="w-4 h-4" />
                            </div>
                        </button>
                    </div>

                    {/* Main Button */}
                    <button
                        onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                        className="w-14 h-14 bg-[#FA4616] hover:bg-[#e03f14] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(250,70,22,0.4)] hover:shadow-[0_8px_30px_rgba(250,70,22,0.6)] transition-all hover:scale-110 cursor-pointer relative z-10"
                    >
                        <Plus
                            className={`w-6 h-6 transition-transform duration-300 ${isActionMenuOpen ? "rotate-45" : ""}`}
                        />
                    </button>
                </div>
            </div>
            {/* MODALS */}
            <AddStaffDialog
                open={isAddStaffOpen}
                onOpenChange={setIsAddStaffOpen}
            />
            <NewIdeaDialog
                isOpen={isNewIdeaDialogOpen}
                onClose={() => setIsNewIdeaDialogOpen(false)}
                onIdeaCreated={() => {
                    // Refresh ideas after creating a new one
                    fetchData();
                }}
            />
            {/* ?????? Instruction Dispatch Modal ??? Executive Command Premium ?????? */}
            <Dialog open={isAssignTaskOpen} onOpenChange={setIsAssignTaskOpen}>
                <DialogContent className="bg-white dark:bg-[#1a1625] border border-gray-100 dark:border-white/10 text-[#1a1a2e] dark:text-white max-w-[560px] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.12)] overflow-hidden p-0 flex flex-col max-h-[85vh]">
                    {/* Gradient accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#e86123] to-[#351e6a] z-50 rounded-t-2xl" />

                    {/* Header */}
                    <div className="px-6 pt-7 pb-4 flex items-start justify-between flex-shrink-0">
                        <div>
                            <DialogTitle className="text-lg font-black tracking-tight text-[#1a1a2e] dark:text-white flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#e86123]/10 to-[#351e6a]/10 flex items-center justify-center">
                                    <Target className="w-4 h-4 text-[#e86123]" />
                                </div>
                                Assign Task
                            </DialogTitle>
                            <p className="text-[11px] text-gray-400 dark:text-white/40 font-semibold mt-1 ml-10 uppercase tracking-widest">
                                Deploy a task to staff
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAssignTaskOpen(false)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Scrollable Form */}
                    <ScrollArea className="flex-1 px-6 custom-scrollbar">
                        <div className="space-y-5 pb-6">
                            {/* SECTION 1: Task Title */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40">
                                    Task Title
                                </label>
                                <input
                                    placeholder="e.g. Prepare weekly briefing report"
                                    value={newTask.title}
                                    onChange={(e) =>
                                        setNewTask({
                                            ...newTask,
                                            title: e.target.value,
                                        })
                                    }
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-semibold text-[#1a1a2e] dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#e86123]/30 focus:border-[#e86123]/50 transition-all duration-200"
                                />
                            </div>

                            {/* SECTION 2: Objective */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40">
                                    Objective
                                </label>
                                <textarea
                                    placeholder="Define the purpose and expected outcome..."
                                    value={taskDescription}
                                    onChange={(e) =>
                                        setTaskDescription(e.target.value)
                                    }
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-medium text-[#1a1a2e] dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#351e6a]/30 focus:border-[#351e6a]/50 transition-all duration-200 resize-none leading-relaxed"
                                />
                            </div>

                            {/* SECTION 3: Staff + Deadline */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Assign Staff */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40">
                                        Assign Staff
                                    </label>
                                    <div className="relative">
                                        {newTask.assignedTo ? (
                                            <div
                                                className="flex items-center gap-2 px-3 h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 group/assignee cursor-pointer"
                                                onClick={() => {
                                                    setNewTask({
                                                        ...newTask,
                                                        assignedTo: "",
                                                    });
                                                    setAssigneeSearch("");
                                                }}
                                            >
                                                <Avatar className="h-6 w-6 flex-shrink-0">
                                                    <AvatarImage
                                                        src={
                                                            staff.find(
                                                                (s) =>
                                                                    s.id ===
                                                                    newTask.assignedTo,
                                                            )?.avatar_url
                                                        }
                                                    />
                                                    <AvatarFallback className="bg-[#351e6a] text-white text-[9px] font-black">
                                                        {staff
                                                            .find(
                                                                (s) =>
                                                                    s.id ===
                                                                    newTask.assignedTo,
                                                            )
                                                            ?.full_name?.substring(
                                                                0,
                                                                2,
                                                            )
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="flex-1 text-sm font-semibold text-[#1a1a2e] dark:text-white truncate">
                                                    {
                                                        staff.find(
                                                            (s) =>
                                                                s.id ===
                                                                newTask.assignedTo,
                                                        )?.full_name
                                                    }
                                                </span>
                                                <X className="w-3.5 h-3.5 text-gray-300 group-hover/assignee:text-red-400 transition-colors" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="relative">
                                                    <input
                                                        placeholder="Search staff..."
                                                        value={assigneeSearch}
                                                        onChange={(e) => {
                                                            setAssigneeSearch(
                                                                e.target.value,
                                                            );
                                                            setShowAssigneeDropdown(
                                                                true,
                                                            );
                                                        }}
                                                        onFocus={() =>
                                                            setShowAssigneeDropdown(
                                                                true,
                                                            )
                                                        }
                                                        className="w-full h-11 pl-9 pr-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-semibold text-[#1a1a2e] dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#e86123]/30 focus:border-[#e86123]/50 transition-all duration-200"
                                                    />
                                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-white/20" />
                                                </div>
                                                {showAssigneeDropdown &&
                                                    assigneeSearch && (
                                                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a1625] border border-gray-100 dark:border-white/10 rounded-xl overflow-hidden shadow-xl">
                                                            <ScrollArea className="max-h-[160px]">
                                                                {filteredStaff.length ===
                                                                0 ? (
                                                                    <div className="p-3 text-center text-[11px] text-gray-400 font-semibold">
                                                                        No staff
                                                                        found
                                                                    </div>
                                                                ) : (
                                                                    filteredStaff.map(
                                                                        (s) => (
                                                                            <button
                                                                                key={
                                                                                    s.id
                                                                                }
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setNewTask(
                                                                                        {
                                                                                            ...newTask,
                                                                                            assignedTo:
                                                                                                s.id,
                                                                                        },
                                                                                    );
                                                                                    setAssigneeSearch(
                                                                                        s.full_name ||
                                                                                            "",
                                                                                    );
                                                                                    setShowAssigneeDropdown(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-b border-gray-50 dark:border-white/5 last:border-none"
                                                                            >
                                                                                <Avatar className="h-7 w-7 flex-shrink-0">
                                                                                    <AvatarImage
                                                                                        src={
                                                                                            s.avatar_url
                                                                                        }
                                                                                    />
                                                                                    <AvatarFallback className="bg-[#2D2A77]/10 text-[#2D2A77] dark:text-white text-[9px] font-black">
                                                                                        {s.full_name
                                                                                            ?.substring(
                                                                                                0,
                                                                                                2,
                                                                                            )
                                                                                            .toUpperCase()}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div className="text-left">
                                                                                    <div className="text-xs font-bold text-[#1a1a2e] dark:text-white">
                                                                                        {
                                                                                            s.full_name
                                                                                        }
                                                                                    </div>
                                                                                    <div className="text-[10px] text-gray-400 dark:text-white/40 uppercase">
                                                                                        {s.department ||
                                                                                            "Staff"}
                                                                                    </div>
                                                                                </div>
                                                                            </button>
                                                                        ),
                                                                    )
                                                                )}
                                                            </ScrollArea>
                                                        </div>
                                                    )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40">
                                        Deadline
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="date"
                                            value={newTask.due_date}
                                            onChange={(e) =>
                                                setNewTask({
                                                    ...newTask,
                                                    due_date: e.target.value,
                                                })
                                            }
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-semibold text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e86123]/30 focus:border-[#e86123]/50 transition-all duration-200 [&::-webkit-calendar-picker-indicator]:opacity-40"
                                        />
                                        <input
                                            type="time"
                                            value={newTask.due_time}
                                            onChange={(e) =>
                                                setNewTask({
                                                    ...newTask,
                                                    due_time: e.target.value,
                                                })
                                            }
                                            className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm font-semibold text-[#1a1a2e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#e86123]/30 focus:border-[#e86123]/50 transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: Priority Buttons */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/40">
                                    Priority
                                </label>
                                <div className="flex gap-2">
                                    {(
                                        [
                                            "low",
                                            "medium",
                                            "high",
                                            "urgent",
                                        ] as const
                                    ).map((p) => {
                                        const colors: Record<string, string> = {
                                            low: "bg-emerald-500 border-emerald-500 text-white",
                                            medium: "bg-amber-500 border-amber-500 text-white",
                                            high: "bg-orange-500 border-orange-500 text-white",
                                            urgent: "bg-red-500 border-red-500 text-white",
                                        };
                                        const outline: Record<string, string> =
                                            {
                                                low: "border-emerald-200 text-emerald-500 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/20",
                                                medium: "border-amber-200 text-amber-500 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/20",
                                                high: "border-orange-200 text-orange-500 hover:bg-orange-50 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-900/20",
                                                urgent: "border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20",
                                            };
                                        const active = newTask.priority === p;
                                        return (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() =>
                                                    setNewTask({
                                                        ...newTask,
                                                        priority: p,
                                                    })
                                                }
                                                className={`flex-1 h-9 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${active ? colors[p] : `bg-transparent ${outline[p]}`}`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-white dark:bg-[#1a1625]">
                        <button
                            type="button"
                            onClick={() => setIsAssignTaskOpen(false)}
                            className="text-sm font-semibold text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                console.log('Assign task button clicked');
                                assignTask(false);
                            }}
                            disabled={!newTask.title || !newTask.assignedTo}
                            className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#e86123] to-[#351e6a] text-white text-[11px] font-black uppercase tracking-[0.15em] flex items-center gap-2 hover:shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            <Target className="w-4 h-4" />
                            Assign Task
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Remove Staff Confirmation Modal */}
            <Dialog
                open={isRemoveStaffModalOpen}
                onOpenChange={setIsRemoveStaffModalOpen}
            >
                <DialogContent className="bg-theme-card border-theme-border text-theme-text max-w-md rounded-3xl shadow-2xl overflow-hidden p-0 flex flex-col">
                    {/* Top gradient accent bar - Red for destructive */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-900 z-50" />

                    {/* Header Area */}
                    <div className="px-8 pt-8 pb-4 relative flex-shrink-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-1 text-red-500">
                                    <div className="p-2.5 bg-red-500/10 rounded-xl shadow-inner border border-red-500/20">
                                        <ShieldAlert className="h-5 w-5 text-red-500" />
                                    </div>
                                    Irreversible Termination
                                </DialogTitle>
                                <p className="text-theme-text-40 text-xs font-bold uppercase tracking-widest ml-14">
                                    Execute Data Purge Protocol
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-4 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                            <p className="text-[11px] text-red-500 font-black uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Warning
                            </p>
                            <p className="text-[11px] leading-relaxed text-theme-text-60 font-bold">
                                You are about to permanently remove{" "}
                                <span className="text-theme-text font-black">
                                    {staffToRemove?.full_name}
                                </span>{" "}
                                from the command grid. This action cannot be
                                undone. All access will be immediately revoked.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-theme-text-40 ml-1">
                                Sequence Confirmation
                            </Label>
                            <Input
                                placeholder={`Type "${staffToRemove?.full_name || "name"}" to confirm`}
                                value={confirmName}
                                onChange={(e) => setConfirmName(e.target.value)}
                                className="bg-theme-bg-white-5 border-theme-border-10 focus:border-red-500 focus:ring-1 focus:ring-red-500/30 rounded-xl h-14 text-sm font-bold transition-all px-5 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="p-6 mt-4 border-t border-theme-border-10 bg-theme-card/80 backdrop-blur-md flex items-center justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsRemoveStaffModalOpen(false)}
                            className="text-theme-text-60 hover:text-theme-text font-bold uppercase tracking-widest text-xs h-12 px-6 rounded-xl border border-transparent hover:border-theme-border-10 hover:bg-theme-bg-white-5"
                        >
                            Abort
                        </Button>
                        <Button
                            disabled={confirmName !== staffToRemove?.full_name}
                            onClick={deleteStaff}
                            className="bg-gradient-to-r from-red-600 to-red-800 text-white hover:shadow-lg hover:shadow-red-500/20 h-12 px-8 font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all flex items-center gap-2 border-none disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            Execute Deletion{" "}
                            <Trash2 className="w-4 h-4 ml-1 transition-transform group-hover:scale-110" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Ideas Modal */}
            <Dialog open={isIdeasOpen} onOpenChange={setIsIdeasOpen}>
                <DialogContent className="bg-theme-card border-theme-border text-theme-text max-w-2xl rounded-3xl shadow-2xl overflow-hidden p-0 flex flex-col max-h-[90vh]">
                    {/* Top gradient accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e86123] to-[#351e6a] z-50" />

                    {/* Header Area */}
                    <div className="px-8 pt-8 pb-4 relative flex-shrink-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FA4616]/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-1">
                                    <div className="p-2.5 bg-theme-bg-white-5 rounded-xl shadow-inner border border-theme-border-10">
                                        <Lightbulb className="h-5 w-5 text-[#e86123]" />
                                    </div>
                                    Strategic Idea Dispatch
                                </DialogTitle>
                                <p className="text-theme-text-40 text-xs font-bold uppercase tracking-widest ml-14">
                                    Distribute Visionary Concepts to Select
                                    Operatives
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <ScrollArea className="flex-1 px-8 py-2 custom-scrollbar">
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-4">
                            <SectionHeader
                                title="Core Parameters"
                                color="bg-[#e86123]"
                            />

                            <div className="grid grid-cols-2 gap-6">
                                {/* Idea Title */}
                                <div className="space-y-2 col-span-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-theme-text-40 ml-1">
                                        Idea Codename
                                    </Label>
                                    <Input
                                        placeholder="ENTER IDEA CODENAME..."
                                        value={newIdea.title}
                                        onChange={(e) =>
                                            setNewIdea({
                                                ...newIdea,
                                                title: e.target.value,
                                            })
                                        }
                                        className="bg-theme-bg-white-5 border-theme-border-10 focus:border-theme-brand rounded-xl h-14 text-base font-bold placeholder:text-theme-text-20 transition-all px-5 shadow-inner"
                                    />
                                </div>

                                {/* Vision Description */}
                                <div className="space-y-2 col-span-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-theme-text-40 ml-1">
                                        The Vision
                                    </Label>
                                    <Textarea
                                        placeholder="Describe the strategic initiative..."
                                        value={newIdea.description}
                                        onChange={(e) =>
                                            setNewIdea({
                                                ...newIdea,
                                                description: e.target.value,
                                            })
                                        }
                                        className="bg-theme-bg-white-5 border-theme-border-10 focus:border-theme-brand rounded-xl h-32 text-sm font-semibold transition-all p-5 resize-none shadow-inner leading-relaxed"
                                    />
                                </div>

                                {/* Priority Level */}
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-theme-text-40 ml-1">
                                        Impact Level
                                    </Label>
                                    <Select
                                        value={newIdea.priority}
                                        onValueChange={(v) =>
                                            setNewIdea({
                                                ...newIdea,
                                                priority: v,
                                            })
                                        }
                                    >
                                        <SelectTrigger className="bg-theme-bg-white-5 border-theme-border-10 h-14 rounded-xl px-5 font-bold shadow-inner">
                                            <SelectValue placeholder="Select impact level" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-theme-card border-theme-border text-theme-text">
                                            <SelectItem
                                                value="low"
                                                className="font-bold focus:bg-theme-bg-white-5"
                                            >
                                                LOW
                                            </SelectItem>
                                            <SelectItem
                                                value="medium"
                                                className="font-bold focus:bg-theme-bg-white-5"
                                            >
                                                MEDIUM
                                            </SelectItem>
                                            <SelectItem
                                                value="high"
                                                className="font-bold focus:bg-theme-bg-white-5 text-orange-500"
                                            >
                                                HIGH
                                            </SelectItem>
                                            <SelectItem
                                                value="urgent"
                                                className="font-bold focus:bg-theme-bg-white-5 text-red-500"
                                            >
                                                URGENT
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <SectionHeader
                                title="Target Operatives"
                                color="bg-[#351e6a]"
                            />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-theme-text-40 ml-1">
                                        Share with Staff (Max 3)
                                    </Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {staff.map((s) => {
                                            const isSelected =
                                                selectedStaffForIdea.includes(
                                                    s.id,
                                                );
                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedStaffForIdea(
                                                                (prev) =>
                                                                    prev.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            s.id,
                                                                    ),
                                                            );
                                                        } else if (
                                                            selectedStaffForIdea.length <
                                                            3
                                                        ) {
                                                            setSelectedStaffForIdea(
                                                                (prev) => [
                                                                    ...prev,
                                                                    s.id,
                                                                ],
                                                            );
                                                        } else {
                                                            toast.error(
                                                                "Vision limited to 3 recipients",
                                                            );
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
                                                        isSelected
                                                            ? "bg-theme-brand text-white border-transparent shadow-md"
                                                            : "bg-theme-bg-white-5 text-theme-text-60 border-theme-border-10 hover:border-theme-border-20 hover:text-theme-text"
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-2 h-2 rounded-full ${s.status === "online" ? "bg-emerald-500" : s.status === "busy" ? "bg-amber-500" : "bg-theme-bg-white-20"} ${isSelected ? "border border-white/40" : ""}`}
                                                    />
                                                    <span className="text-[11px] font-black uppercase tracking-wider">
                                                        {s.full_name}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-theme-bg-white-5 border border-theme-border-10 rounded-xl">
                                    <AlertCircle className="w-4 h-4 text-theme-text-40 mt-0.5" />
                                    <p className="text-[11px] font-bold text-theme-text-50 leading-relaxed max-w-[90%]">
                                        Sharing notifies staff without blocking
                                        current workflows. Ideas archive
                                        automatically and are visible only to
                                        selected operatives.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Fixed Footer Actions */}
                    <div className="p-6 border-t border-theme-border-10 bg-theme-card/80 backdrop-blur-md flex items-center justify-between flex-shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsIdeasOpen(false)}
                            className="text-theme-text-60 hover:text-theme-text font-bold uppercase tracking-widest text-xs h-12 px-6 rounded-xl border border-transparent hover:border-theme-border-10 hover:bg-theme-bg-white-5"
                        >
                            Cancel Operation
                        </Button>
                        <Button
                            type="button"
                            onClick={submitIdea}
                            disabled={!newIdea.title || !newIdea.description}
                            className="bg-gradient-to-r from-[#e86123] to-[#351e6a] text-white hover:shadow-lg hover:shadow-orange-500/20 h-12 px-8 font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all flex items-center gap-2 border-none group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Deploy Vision{" "}
                            <Rocket className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Staff Overview Modal */}
            <Dialog
                open={showStaffOverview}
                onOpenChange={setShowStaffOverview}
            >
                <DialogContent className="bg-theme-card border-theme-border text-theme-text max-w-4xl rounded-3xl shadow-2xl overflow-hidden p-0 flex flex-col max-h-[90vh]">
                    {/* Top gradient accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e86123] to-[#351e6a] z-50" />

                    {/* Header Area */}
                    <div className="px-8 pt-8 pb-4 relative flex-shrink-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FA4616]/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-1">
                                    <div className="p-2.5 bg-theme-bg-white-5 rounded-xl shadow-inner border border-theme-border-10">
                                        <ClipboardList className="h-5 w-5 text-[#e86123]" />
                                    </div>
                                    Full Staff Dossier
                                </DialogTitle>
                                <p className="text-theme-text-40 text-xs font-bold uppercase tracking-widest ml-14">
                                    Comprehensive Personnel Overview
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowStaffOverview(false)}
                                className="rounded-full text-theme-text-40 hover:text-theme-text hover:bg-theme-bg-white-10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <ScrollArea className="flex-1 px-8 py-4 custom-scrollbar">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in zoom-in-95 duration-300 pb-4">
                            {stats.sortedStaff.map((s) => {
                                const staffTasks = tasks.filter(
                                    (t) => t.assigned_to === s.id,
                                );
                                return (
                                    <div
                                        key={s.id}
                                        className="border border-theme-border-10 bg-theme-bg-white-5 rounded-2xl p-5 flex flex-col gap-4 hover:border-theme-border-20 transition-all hover:shadow-md group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 shadow-sm border border-theme-border-10">
                                                    <AvatarImage
                                                        src={s.avatar_url}
                                                    />
                                                    <AvatarFallback className="bg-theme-bg-white-10 text-theme-text font-black">
                                                        {s.full_name
                                                            ?.substring(0, 2)
                                                            .toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h5 className="font-bold text-theme-text text-sm">
                                                        {s.full_name}
                                                    </h5>
                                                    <span className="text-[10px] text-theme-text-40 uppercase font-black tracking-widest">
                                                        {s.department ||
                                                            "Staff"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div
                                                className={`w-2.5 h-2.5 rounded-full border-2 border-theme-card shadow-sm ${s.status === "online" ? "bg-emerald-500" : s.status === "busy" ? "bg-amber-500" : "bg-theme-bg-white-20"}`}
                                            />
                                        </div>

                                        <div className="bg-theme-bg-white-5 rounded-xl p-3 flex justify-around">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-theme-text-40 uppercase font-bold tracking-widest">
                                                    Tasks
                                                </span>
                                                <span className="text-base font-black text-theme-text">
                                                    {staffTasks.length}
                                                </span>
                                            </div>
                                            <div className="w-px bg-theme-border-10" />
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-theme-text-40 uppercase font-bold tracking-widest">
                                                    Status
                                                </span>
                                                <span className="text-[10px] font-black text-theme-text-80 uppercase mt-1.5 px-2 py-0.5 rounded-full bg-theme-bg-white-10">
                                                    {s.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="pt-2 mt-auto flex gap-3">
                                            <Button
                                                className="flex-1 h-9 text-[10px] font-black uppercase tracking-widest bg-theme-bg-white text-theme-inv-text hover:bg-theme-bg-white-90 rounded-xl transition-all shadow-sm"
                                                onClick={() => {
                                                    setNewTask((v) => ({
                                                        ...v,
                                                        assignedTo: s.id,
                                                    }));
                                                    setIsAssignTaskOpen(true);
                                                    setShowStaffOverview(false);
                                                }}
                                            >
                                                Assign
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-9 text-[10px] font-black uppercase tracking-widest border-theme-border-10 text-theme-text hover:bg-theme-bg-white-10 hover:border-theme-border-20 rounded-xl transition-all"
                                                onClick={() => {
                                                    openChatModal(s);
                                                    setShowStaffOverview(false);
                                                }}
                                            >
                                                Chat
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            {/* Chat Message Modal */}
            <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
                <DialogContent className="bg-theme-card border-theme-border text-theme-text max-w-md rounded-3xl shadow-2xl overflow-hidden p-0 flex flex-col">
                    {/* Top gradient accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e86123] to-[#351e6a] z-50" />

                    {/* Header Area */}
                    <div className="px-8 pt-8 pb-4 relative flex-shrink-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FA4616]/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3 mb-1">
                                    <div className="p-2.5 bg-theme-bg-white-5 rounded-xl shadow-inner border border-theme-border-10">
                                        <MessageCircle className="h-5 w-5 text-[#e86123]" />
                                    </div>
                                    Direct Dispatch
                                </DialogTitle>
                                <p className="text-theme-text-40 text-xs font-bold uppercase tracking-widest ml-14">
                                    Communicate directly with{" "}
                                    {selectedStaffForChat?.full_name?.split(
                                        " ",
                                    )[0] || "Operative"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-4 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-theme-text-40 ml-1">
                                Urgent Message
                            </Label>
                            <Textarea
                                placeholder="Type your urgent directive here..."
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                className="bg-theme-bg-white-5 border-theme-border-10 focus:border-theme-brand rounded-xl h-32 resize-none text-sm p-4 font-semibold shadow-inner transition-all leading-relaxed"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <p className="text-[10px] text-theme-text-60 font-bold tracking-wider">
                                Message will be transmitted immediately.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 mt-2 border-t border-theme-border-10 bg-theme-card/80 backdrop-blur-md flex items-center justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsChatModalOpen(false)}
                            className="text-theme-text-60 hover:text-theme-text font-bold uppercase tracking-widest text-xs h-12 px-6 rounded-xl border border-transparent hover:border-theme-border-10 hover:bg-theme-bg-white-5"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={sendChatMessage}
                            disabled={!chatMessage.trim()}
                            className="bg-gradient-to-r from-[#e86123] to-[#351e6a] text-white hover:shadow-lg hover:shadow-orange-500/20 h-12 px-8 font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all flex items-center gap-2 border-none group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send Message{" "}
                            <MessageCircle className="w-4 h-4 ml-1 transition-transform group-hover:scale-110" />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Schedule Meeting Dialog */}
            <Dialog
                open={isScheduleMeetingOpen}
                onOpenChange={setIsScheduleMeetingOpen}
            >
                <DialogContent className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 text-slate-900 max-w-6xl rounded-3xl shadow-2xl p-0 flex flex-col max-h-[95vh] backdrop-blur-xl">
                    {/* Enhanced Header Area */}
                    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 p-8 text-white relative flex-shrink-0">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/30 via-pink-500/20 to-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none animate-pulse" />
                        <div className="absolute top-4 left-4 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="text-2xl font-black uppercase tracking-widest flex items-center gap-4">
                                        <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
                                            <Target className="h-8 w-8 text-orange-400 animate-pulse" />
                                        </div>
                                        <div>
                                            <div className="text-3xl font-black bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                                                Executive Summit Deployment
                                            </div>
                                            <p className="text-white/70 text-sm font-medium uppercase tracking-widest mt-2">
                                                Configure intelligence parameters & operative assignments
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {[1, 2, 3].map((step) => (
                                        <div
                                            key={step}
                                            className="flex items-center"
                                        >
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${meetingStep === step ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-500/50 scale-110" : meetingStep > step ? "bg-white/30 text-white border-2 border-white/50" : "bg-white/10 text-white/40 border-2 border-white/20"}`}
                                            >
                                                {meetingStep > step ? (
                                                    <Check className="w-5 h-5" />
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <span>{step}</span>
                                                        {meetingStep === step && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                                                    </span>
                                                )}
                                            </div>
                                            {step < 3 && (
                                                <div
                                                    className={`w-16 h-1 mx-2 transition-all duration-500 ${meetingStep > step ? "bg-gradient-to-r from-orange-400 to-pink-400" : "bg-white/20"}`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Quick Stats Bar */}
                            <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-300">{newMeeting.participants.length}</div>
                                    <div className="text-xs text-white/60 uppercase tracking-wider">Operatives</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-cyan-300">{newMeeting.agendaItems.length}</div>
                                    <div className="text-xs text-white/60 uppercase tracking-wider">Agenda Items</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-pink-300">{newMeeting.preMeetingTasks.length}</div>
                                    <div className="text-xs text-white/60 uppercase tracking-wider">Pre-Tasks</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-300">{newMeeting.duration || '60'}</div>
                                    <div className="text-xs text-white/60 uppercase tracking-wider">Minutes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <ScrollArea className="flex-1 p-6 custom-scrollbar overflow-y-auto" style={{ height: 'calc(95vh - 280px)' }}>
                        {/* STEP 1: MEETING INFO */}
                        {meetingStep === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
                                <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 p-6 rounded-2xl border border-orange-200/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Target className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                                                Core Parameters
                                            </h3>
                                            <p className="text-slate-600 font-medium">Configure basic meeting information and classification</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Title */}
                                        <div className="space-y-3 col-span-2">
                                            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">T</span>
                                                </div>
                                                Summit Designation (Title)
                                            </Label>
                                            <Input
                                                placeholder="e.g. Q3 Strategic Realignment"
                                                value={newMeeting.title}
                                                onChange={(e) =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        title: e.target.value,
                                                    })
                                                }
                                                className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 focus:border-orange-500 focus:shadow-lg focus:shadow-orange-500/20 rounded-2xl h-16 text-lg font-bold placeholder:text-slate-400 transition-all duration-300 px-6"
                                            />
                                        </div>

                                        {/* Type */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">C</span>
                                                </div>
                                                Summit Classification
                                            </Label>
                                            <Select
                                                value={newMeeting.type}
                                                onValueChange={(val: any) =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        type: val,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 rounded-2xl h-16 px-6 font-bold transition-all duration-300">
                                                    <SelectValue placeholder="Select classification" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white/95 backdrop-blur-xl border-2 border-slate-200/50 rounded-2xl shadow-2xl">
                                                    <SelectItem
                                                        value="strategic"
                                                        className="font-bold cursor-pointer hover:bg-blue-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-blue-600 text-xs font-bold">S</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">Strategic Planning</div>
                                                                <div className="text-xs text-slate-500">Long-term organizational goals</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="review"
                                                        className="font-bold cursor-pointer hover:bg-green-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-green-600 text-xs font-bold">R</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">Performance Review</div>
                                                                <div className="text-xs text-slate-500">Quarterly assessments</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="emergency"
                                                        className="font-bold cursor-pointer hover:bg-red-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-red-600 text-xs font-bold">E</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-red-600">Emergency Protocol</div>
                                                                <div className="text-xs text-slate-500">Crisis management</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="1-on-1"
                                                        className="font-bold cursor-pointer hover:bg-purple-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-purple-600 text-xs font-bold">1</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">Direct 1-on-1</div>
                                                                <div className="text-xs text-slate-500">Individual meetings</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Priority */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-400 rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">!</span>
                                                </div>
                                                Priority Level
                                            </Label>
                                            <Select
                                                value={newMeeting.priority}
                                                onValueChange={(val: any) =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        priority: val,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 focus:border-red-500 focus:shadow-lg focus:shadow-red-500/20 rounded-2xl h-16 px-6 font-bold transition-all duration-300">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white/95 backdrop-blur-xl border-2 border-slate-200/50 rounded-2xl shadow-2xl">
                                                    <SelectItem
                                                        value="low"
                                                        className="font-bold cursor-pointer hover:bg-slate-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-slate-600 text-xs font-bold">L</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-slate-600">Low (Routine)</div>
                                                                <div className="text-xs text-slate-500">Standard operations</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="medium"
                                                        className="font-bold cursor-pointer hover:bg-blue-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-blue-600 text-xs font-bold">M</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-blue-600">Medium (Standard)</div>
                                                                <div className="text-xs text-slate-500">Regular priority</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="high"
                                                        className="font-bold cursor-pointer hover:bg-orange-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-orange-600 text-xs font-bold">H</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-orange-600">High (Accelerated)</div>
                                                                <div className="text-xs text-slate-500">Urgent attention</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="critical"
                                                        className="font-bold cursor-pointer hover:bg-red-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-red-600 text-xs font-bold">C</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-red-600">Critical (Immediate)</div>
                                                                <div className="text-xs text-slate-500">Emergency response</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-8 border-t-2 border-slate-200/30" />
                                
                                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6 rounded-2xl border border-blue-200/30">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                            <Clock className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                Logistics & Scheduling
                                            </h3>
                                            <p className="text-slate-600 font-medium">Set timing, location, and expected outcomes</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-8">
                                        {/* Date */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-white" />
                                                </div>
                                                Execution Date
                                            </Label>
                                            <Input
                                                type="date"
                                                value={newMeeting.date}
                                                onChange={(e) =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        date: e.target.value,
                                                    })
                                                }
                                                className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 focus:border-green-500 focus:shadow-lg focus:shadow-green-500/20 rounded-2xl h-16 px-6 text-sm font-bold transition-all duration-300"
                                            />
                                        </div>

                                        {/* Time */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                                                    <Clock className="h-4 w-4 text-white" />
                                                </div>
                                                Launch Time
                                            </Label>
                                            <Input
                                                type="time"
                                                value={newMeeting.time}
                                                onChange={(e) =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        time: e.target.value,
                                                    })
                                                }
                                                className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 rounded-2xl h-16 px-6 text-sm font-bold transition-all duration-300"
                                            />
                                        </div>

                                        {/* Duration */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">⏱</span>
                                                </div>
                                                Duration (Mins)
                                            </Label>
                                            <Select
                                                value={newMeeting.duration}
                                                onValueChange={(val) =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        duration: val,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 focus:border-yellow-500 focus:shadow-lg focus:shadow-yellow-500/20 rounded-2xl h-16 px-6 font-bold transition-all duration-300">
                                                    <SelectValue placeholder="Select duration" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white/95 backdrop-blur-xl border-2 border-slate-200/50 rounded-2xl shadow-2xl">
                                                    <SelectItem
                                                        value="15"
                                                        className="font-bold cursor-pointer hover:bg-yellow-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl font-bold text-yellow-600">15</div>
                                                            <div>
                                                                <div className="font-bold">Briefing</div>
                                                                <div className="text-xs text-slate-500">Quick updates</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="30"
                                                        className="font-bold cursor-pointer hover:bg-green-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl font-bold text-green-600">30</div>
                                                            <div>
                                                                <div className="font-bold">Standard</div>
                                                                <div className="text-xs text-slate-500">Regular meeting</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="60"
                                                        className="font-bold cursor-pointer hover:bg-blue-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl font-bold text-blue-600">60</div>
                                                            <div>
                                                                <div className="font-bold">Deep Dive</div>
                                                                <div className="text-xs text-slate-500">Extended discussion</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="90"
                                                        className="font-bold cursor-pointer hover:bg-purple-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl font-bold text-purple-600">90</div>
                                                            <div>
                                                                <div className="font-bold">Extended</div>
                                                                <div className="text-xs text-slate-500">Comprehensive</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="120"
                                                        className="font-bold cursor-pointer hover:bg-red-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="text-2xl font-bold text-red-600">120</div>
                                                            <div>
                                                                <div className="font-bold">Summit</div>
                                                                <div className="text-xs text-slate-500">Maximum duration</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 pt-4">
                                        {/* Location */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg flex items-center justify-center">
                                                    <MapPin className="h-4 w-4 text-white" />
                                                </div>
                                                Location / Protocol Link
                                            </Label>
                                            <Input
                                                placeholder="e.g. Boardroom A, Zoom Link, Teams Meeting..."
                                                value={newMeeting.location}
                                                onChange={(e) =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        location: e.target.value,
                                                    })
                                                }
                                                className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20 rounded-2xl h-16 text-sm font-bold placeholder:text-slate-400 transition-all duration-300"
                                            />
                                        </div>
                                        {/* Outcome */}
                                        <div className="space-y-3">
                                            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-lg flex items-center justify-center">
                                                    <Target className="h-4 w-4 text-white" />
                                                </div>
                                                Expected Outcome
                                            </Label>
                                            <Select
                                                value={newMeeting.outcome}
                                                onValueChange={(val: any) =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        outcome: val,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 focus:border-teal-500 focus:shadow-lg focus:shadow-teal-500/20 rounded-2xl h-16 px-6 font-bold transition-all duration-300">
                                                    <SelectValue placeholder="Select outcome" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white/95 backdrop-blur-xl border-2 border-slate-200/50 rounded-2xl shadow-2xl">
                                                    <SelectItem
                                                        value="decision"
                                                        className="font-bold cursor-pointer hover:bg-teal-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-teal-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-teal-600 text-xs font-bold">D</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">Firm Decision</div>
                                                                <div className="text-xs text-slate-500">Final resolution</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="discussion"
                                                        className="font-bold cursor-pointer hover:bg-blue-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-blue-600 text-xs font-bold">💬</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">Strategic Discussion</div>
                                                                <div className="text-xs text-slate-500">Brainstorming</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem
                                                        value="approval"
                                                        className="font-bold cursor-pointer hover:bg-green-50 rounded-xl p-3"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-green-600 text-xs font-bold">✓</span>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">Plan Approval</div>
                                                                <div className="text-xs text-slate-500">Go-ahead</div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PARTICIPANTS & AGENDA */}
                        {meetingStep === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Participants */}
                                    <div className="space-y-4">
                                        <SectionHeader
                                            title="Operative Selection"
                                            color="bg-[#351e6a]"
                                        />
                                        <p className="text-xs text-theme-text-40 font-bold px-1 mb-2">
                                            Select required personnel for this
                                            summit.
                                        </p>

                                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar bg-theme-bg-white-5 p-3 rounded-2xl border border-theme-border-5">
                                            {staff.map((s) => {
                                                const isSelected =
                                                    newMeeting.participants.includes(
                                                        s.id,
                                                    );
                                                return (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setNewMeeting({
                                                                ...newMeeting,
                                                                participants:
                                                                    isSelected
                                                                        ? newMeeting.participants.filter(
                                                                              (
                                                                                  id,
                                                                              ) =>
                                                                                  id !==
                                                                                  s.id,
                                                                          )
                                                                        : [
                                                                              ...newMeeting.participants,
                                                                              s.id,
                                                                          ],
                                                            });
                                                        }}
                                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${
                                                            isSelected
                                                                ? "bg-[#2F1E73]/5 border-[#2F1E73] shadow-inner"
                                                                : "bg-theme-card border-transparent hover:border-theme-brand/30"
                                                        }`}
                                                    >
                                                        <div className="relative">
                                                            <Avatar className="h-10 w-10 border-2 border-theme-border">
                                                                <AvatarImage
                                                                    src={
                                                                        s.avatar_url
                                                                    }
                                                                />
                                                                <AvatarFallback className="bg-theme-bg-white-10 text-xs font-black">
                                                                    {s.full_name
                                                                        ?.substring(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div
                                                                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-theme-card ${
                                                                    s.status ===
                                                                    "online"
                                                                        ? "bg-green-500"
                                                                        : s.status ===
                                                                            "busy"
                                                                          ? "bg-red-500"
                                                                          : s.status ===
                                                                              "away"
                                                                            ? "bg-yellow-500"
                                                                            : "bg-gray-400"
                                                                }`}
                                                            />
                                                        </div>
                                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                                            <span
                                                                className={`text-xs font-black uppercase tracking-tight truncate w-full ${isSelected ? "text-[#2F1E73]" : "text-theme-text-80"}`}
                                                            >
                                                                {s.full_name}
                                                            </span>
                                                            <span className="text-[9px] text-theme-text-30 font-bold uppercase tracking-widest truncate w-full">
                                                                {s.designation ||
                                                                    s.department ||
                                                                    s.role}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-[#2F1E73] text-white" : "bg-theme-bg-white-10 text-transparent"}`}
                                                        >
                                                            <Check className="w-3 h-3" />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Right Column: Dynamic Agenda */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <SectionHeader
                                                title="Strategic Agenda"
                                                color="bg-[#FA4616]"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        agendaItems: [
                                                            ...newMeeting.agendaItems,
                                                            {
                                                                id: Date.now().toString(),
                                                                topic: "",
                                                                owner: "",
                                                                time: "10",
                                                            },
                                                        ],
                                                    })
                                                }
                                                className="text-[#FA4616] hover:bg-[#FA4616]/10 hover:text-[#FA4616] text-xs font-black uppercase tracking-widest gap-1 h-8 px-3 rounded-lg"
                                            >
                                                <Plus className="w-3 h-3" /> Add
                                                Topic
                                            </Button>
                                        </div>
                                        <p className="text-xs text-theme-text-40 font-bold px-1 mb-2">
                                            Build dynamic discussion points.
                                        </p>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {newMeeting.agendaItems.length ===
                                            0 ? (
                                                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-theme-border-10 rounded-2xl bg-theme-bg-white-5">
                                                    <ListTodo className="h-6 w-6 text-theme-text-20 mb-2" />
                                                    <p className="text-[10px] font-bold text-theme-text-40 uppercase tracking-widest">
                                                        No agenda items defined
                                                    </p>
                                                </div>
                                            ) : (
                                                newMeeting.agendaItems.map(
                                                    (item, index) => (
                                                        <div
                                                            key={item.id}
                                                            className="bg-theme-bg-white-5 border border-theme-border-10 rounded-2xl p-4 space-y-3 relative group animate-in fade-in slide-in-from-bottom-2"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setNewMeeting(
                                                                        {
                                                                            ...newMeeting,
                                                                            agendaItems:
                                                                                newMeeting.agendaItems.filter(
                                                                                    (
                                                                                        i,
                                                                                    ) =>
                                                                                        i.id !==
                                                                                        item.id,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                                className="absolute top-3 right-3 text-theme-text-20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="space-y-1 pr-6">
                                                                <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40">
                                                                    Topic{" "}
                                                                    {index + 1}
                                                                </Label>
                                                                <Input
                                                                    placeholder="e.g. Q3 Marketing Review"
                                                                    value={
                                                                        item.topic
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newItems =
                                                                            [
                                                                                ...newMeeting.agendaItems,
                                                                            ];
                                                                        newItems[
                                                                            index
                                                                        ].topic =
                                                                            e.target.value;
                                                                        setNewMeeting(
                                                                            {
                                                                                ...newMeeting,
                                                                                agendaItems:
                                                                                    newItems,
                                                                            },
                                                                        );
                                                                    }}
                                                                    className="h-10 bg-theme-card border-none text-sm font-bold placeholder:text-theme-text-20 shadow-inner"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40">
                                                                        Owner
                                                                    </Label>
                                                                    <Select
                                                                        value={
                                                                            item.owner
                                                                        }
                                                                        onValueChange={(
                                                                            val,
                                                                        ) => {
                                                                            const newItems =
                                                                                [
                                                                                    ...newMeeting.agendaItems,
                                                                                ];
                                                                            newItems[
                                                                                index
                                                                            ].owner =
                                                                                val;
                                                                            setNewMeeting(
                                                                                {
                                                                                    ...newMeeting,
                                                                                    agendaItems:
                                                                                        newItems,
                                                                                },
                                                                            );
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="h-10 bg-theme-card border-none rounded-xl px-3 font-bold text-xs shadow-inner">
                                                                            <SelectValue placeholder="Assign" />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-theme-card border-theme-border rounded-xl shadow-xl">
                                                                            {staff
                                                                                .filter(
                                                                                    (
                                                                                        s,
                                                                                    ) =>
                                                                                        newMeeting.participants.includes(
                                                                                            s.id,
                                                                                        ) ||
                                                                                        newMeeting
                                                                                            .participants
                                                                                            .length ===
                                                                                            0,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        s,
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                s.id
                                                                                            }
                                                                                            value={
                                                                                                s.id
                                                                                            }
                                                                                            className="font-bold cursor-pointer text-xs"
                                                                                        >
                                                                                            {
                                                                                                s.full_name
                                                                                            }
                                                                                        </SelectItem>
                                                                                    ),
                                                                                )}
                                                                            <SelectItem
                                                                                value="CEO"
                                                                                className="font-bold cursor-pointer text-xs text-[#FA4616]"
                                                                            >
                                                                                CEO
                                                                                (Self)
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40">
                                                                        Time
                                                                        (Mins)
                                                                    </Label>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={
                                                                            item.time
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const newItems =
                                                                                [
                                                                                    ...newMeeting.agendaItems,
                                                                                ];
                                                                            newItems[
                                                                                index
                                                                            ].time =
                                                                                e.target.value;
                                                                            setNewMeeting(
                                                                                {
                                                                                    ...newMeeting,
                                                                                    agendaItems:
                                                                                        newItems,
                                                                                },
                                                                            );
                                                                        }}
                                                                        className="h-10 bg-theme-card border-none text-xs font-bold shadow-inner"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            )}

                                            {/* Textarea Fallback for quick notes if they don't want structured agenda */}
                                            <div className="mt-4 pt-4 border-t border-theme-border-5">
                                                <Label className="text-[10px] uppercase font-black tracking-widest text-theme-text-40 ml-1 mb-2 block">
                                                    General Notes / Quick Agenda
                                                </Label>
                                                <Textarea
                                                    placeholder="Or paste unformatted agenda / notes here..."
                                                    value={newMeeting.agenda}
                                                    onChange={(e) =>
                                                        setNewMeeting({
                                                            ...newMeeting,
                                                            agenda: e.target
                                                                .value,
                                                        })
                                                    }
                                                    className="bg-theme-bg-white-5 border-theme-border-10 focus:border-theme-brand rounded-xl min-h-[80px] text-xs font-bold placeholder:text-theme-text-20 transition-all resize-none shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: ACTIONS & REVIEW */}
                        {meetingStep === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left Column: Pre-Meeting Tasks */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <SectionHeader
                                                title="Pre-Meeting Directives"
                                                color="bg-[#3b82f6]"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() =>
                                                    setNewMeeting({
                                                        ...newMeeting,
                                                        preMeetingTasks: [
                                                            ...newMeeting.preMeetingTasks,
                                                            {
                                                                id: Date.now().toString(),
                                                                title: "",
                                                                assignedTo: "",
                                                                deadline: "",
                                                            },
                                                        ],
                                                    })
                                                }
                                                className="text-[#3b82f6] hover:bg-[#3b82f6]/10 hover:text-[#3b82f6] text-xs font-black uppercase tracking-widest gap-1 h-8 px-3 rounded-lg"
                                            >
                                                <Plus className="w-3 h-3" />{" "}
                                                Assign Task
                                            </Button>
                                        </div>
                                        <p className="text-xs text-theme-text-40 font-bold px-1 mb-2">
                                            Assign preparatory tasks required
                                            before deployment.
                                        </p>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {newMeeting.preMeetingTasks
                                                .length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-theme-border-10 rounded-2xl bg-theme-bg-white-5">
                                                    <CheckSquare className="h-6 w-6 text-theme-text-20 mb-2" />
                                                    <p className="text-[10px] font-bold text-theme-text-40 uppercase tracking-widest">
                                                        No pre-meeting tasks
                                                        required
                                                    </p>
                                                </div>
                                            ) : (
                                                newMeeting.preMeetingTasks.map(
                                                    (task, index) => (
                                                        <div
                                                            key={task.id}
                                                            className="bg-theme-bg-white-5 border border-theme-border-10 rounded-2xl p-4 space-y-3 relative group animate-in fade-in slide-in-from-bottom-2"
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setNewMeeting(
                                                                        {
                                                                            ...newMeeting,
                                                                            preMeetingTasks:
                                                                                newMeeting.preMeetingTasks.filter(
                                                                                    (
                                                                                        t,
                                                                                    ) =>
                                                                                        t.id !==
                                                                                        task.id,
                                                                                ),
                                                                        },
                                                                    )
                                                                }
                                                                className="absolute top-3 right-3 text-theme-text-20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="space-y-1 pr-6">
                                                                <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40">
                                                                    Task
                                                                    Directive
                                                                </Label>
                                                                <Input
                                                                    placeholder="e.g. Prepare Q3 financial reports"
                                                                    value={
                                                                        task.title
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        const newTasks =
                                                                            [
                                                                                ...newMeeting.preMeetingTasks,
                                                                            ];
                                                                        newTasks[
                                                                            index
                                                                        ].title =
                                                                            e.target.value;
                                                                        setNewMeeting(
                                                                            {
                                                                                ...newMeeting,
                                                                                preMeetingTasks:
                                                                                    newTasks,
                                                                            },
                                                                        );
                                                                    }}
                                                                    className="h-10 bg-theme-card border-none text-sm font-bold placeholder:text-theme-text-20 shadow-inner"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40">
                                                                        Operative
                                                                    </Label>
                                                                    <Select
                                                                        value={
                                                                            task.assignedTo
                                                                        }
                                                                        onValueChange={(
                                                                            val,
                                                                        ) => {
                                                                            const newTasks =
                                                                                [
                                                                                    ...newMeeting.preMeetingTasks,
                                                                                ];
                                                                            newTasks[
                                                                                index
                                                                            ].assignedTo =
                                                                                val;
                                                                            setNewMeeting(
                                                                                {
                                                                                    ...newMeeting,
                                                                                    preMeetingTasks:
                                                                                        newTasks,
                                                                                },
                                                                            );
                                                                        }}
                                                                    >
                                                                        <SelectTrigger className="h-10 bg-theme-card border-none rounded-xl px-3 font-bold text-xs shadow-inner">
                                                                            <SelectValue placeholder="Assign" />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-theme-card border-theme-border rounded-xl shadow-xl">
                                                                            {staff
                                                                                .filter(
                                                                                    (
                                                                                        s,
                                                                                    ) =>
                                                                                        newMeeting.participants.includes(
                                                                                            s.id,
                                                                                        ) ||
                                                                                        newMeeting
                                                                                            .participants
                                                                                            .length ===
                                                                                            0,
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        s,
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                s.id
                                                                                            }
                                                                                            value={
                                                                                                s.id
                                                                                            }
                                                                                            className="font-bold cursor-pointer text-xs"
                                                                                        >
                                                                                            {
                                                                                                s.full_name
                                                                                            }
                                                                                        </SelectItem>
                                                                                    ),
                                                                                )}
                                                                            <SelectItem
                                                                                value="CEO"
                                                                                className="font-bold cursor-pointer text-xs text-[#FA4616]"
                                                                            >
                                                                                CEO
                                                                                (Self)
                                                                            </SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40">
                                                                        Deadline
                                                                    </Label>
                                                                    <Input
                                                                        type="date"
                                                                        value={
                                                                            task.deadline ||
                                                                            newMeeting.date
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) => {
                                                                            const newTasks =
                                                                                [
                                                                                    ...newMeeting.preMeetingTasks,
                                                                                ];
                                                                            newTasks[
                                                                                index
                                                                            ].deadline =
                                                                                e.target.value;
                                                                            setNewMeeting(
                                                                                {
                                                                                    ...newMeeting,
                                                                                    preMeetingTasks:
                                                                                        newTasks,
                                                                                },
                                                                            );
                                                                        }}
                                                                        className="h-10 bg-theme-card border-none text-xs font-bold shadow-inner"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Final Review Summary */}
                                    <div className="space-y-4">
                                        <SectionHeader
                                            title="Deployment Summary"
                                            color="bg-[#10b981]"
                                        />
                                        <p className="text-xs text-theme-text-40 font-bold px-1 mb-2">
                                            Review final parameters before
                                            executing protocol.
                                        </p>

                                        <div className="bg-theme-card border border-theme-border-10 rounded-2xl p-5 shadow-lg space-y-6">
                                            {/* Header Info */}
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-base font-black uppercase tracking-tight text-theme-text max-w-[200px] truncate">
                                                            {newMeeting.title ||
                                                                "Unnamed Summit"}
                                                        </h4>
                                                        <p className="text-[10px] font-bold text-theme-text-40 uppercase tracking-widest mt-1">
                                                            {newMeeting.type} •{" "}
                                                            {
                                                                newMeeting.priority
                                                            }{" "}
                                                            Priority
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-black text-[#FA4616] bg-[#FA4616]/10 px-3 py-1 rounded-lg inline-block">
                                                            {newMeeting.date
                                                                ? new Date(
                                                                      newMeeting.date,
                                                                  ).toLocaleDateString(
                                                                      "en-US",
                                                                      {
                                                                          month: "short",
                                                                          day: "numeric",
                                                                      },
                                                                  )
                                                                : "-- / --"}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-theme-text-40 mt-1 uppercase">
                                                            {newMeeting.time ||
                                                                "--:--"}{" "}
                                                            (
                                                            {
                                                                newMeeting.duration
                                                            }
                                                            m)
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-theme-border-5" />

                                            {/* Operatives */}
                                            <div>
                                                <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40 block mb-3">
                                                    Deployed Operatives (
                                                    {
                                                        newMeeting.participants
                                                            .length
                                                    }
                                                    )
                                                </Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {newMeeting.participants
                                                        .length > 0 ? (
                                                        newMeeting.participants.map(
                                                            (id) => {
                                                                const s =
                                                                    staff.find(
                                                                        (
                                                                            staff,
                                                                        ) =>
                                                                            staff.id ===
                                                                            id,
                                                                    );
                                                                return s ? (
                                                                    <div
                                                                        key={id}
                                                                        className="flex items-center gap-1.5 bg-theme-bg-white-5 border border-theme-border-10 rounded-full pl-1 pr-3 py-1"
                                                                    >
                                                                        <Avatar className="h-4 w-4">
                                                                            <AvatarImage
                                                                                src={
                                                                                    s.avatar_url
                                                                                }
                                                                            />
                                                                            <AvatarFallback className="bg-theme-bg-white-10 text-[8px] font-black">
                                                                                {s.full_name
                                                                                    ?.substring(
                                                                                        0,
                                                                                        2,
                                                                                    )
                                                                                    .toUpperCase()}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="text-[9px] font-bold uppercase truncate max-w-[80px]">
                                                                            {
                                                                                s.full_name?.split(
                                                                                    " ",
                                                                                )[0]
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                ) : null;
                                                            },
                                                        )
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                                                            No operatives
                                                            selected
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="border-t border-theme-border-5" />

                                            {/* Agenda & Tasks Overviews */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40 block mb-2">
                                                        Agenda Topics
                                                    </Label>
                                                    <div className="text-xs font-black text-theme-text">
                                                        {
                                                            newMeeting
                                                                .agendaItems
                                                                .length
                                                        }{" "}
                                                        Defined
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40 block mb-2">
                                                        Pre-Meeting Tasks
                                                    </Label>
                                                    <div className="text-xs font-black text-theme-text">
                                                        {
                                                            newMeeting
                                                                .preMeetingTasks
                                                                .length
                                                        }{" "}
                                                        Assigned
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <Label className="text-[9px] uppercase font-black tracking-widest text-theme-text-40 block mb-2">
                                                        Location
                                                    </Label>
                                                    <div className="text-xs font-bold text-theme-text bg-theme-bg-white-5 p-2 rounded-lg break-all">
                                                        {newMeeting.location ||
                                                            "Not specified"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollArea>

                    {/* Enhanced Fixed Footer Actions */}
                    <div className="p-8 border-t-2 border-slate-200/30 bg-gradient-to-r from-slate-50/90 to-slate-100/90 backdrop-blur-xl flex items-center justify-between flex-shrink-0">
                        <Button
                            type="button"
                            onClick={() =>
                                meetingStep > 1
                                    ? setMeetingStep((prev) => prev - 1)
                                    : setIsScheduleMeetingOpen(false)
                            }
                            className="group relative bg-white/80 backdrop-blur-sm border-2 border-slate-200/50 hover:bg-slate-100 hover:border-slate-300 hover:shadow-lg text-slate-600 font-bold uppercase tracking-widest text-sm h-14 px-8 rounded-2xl transition-all duration-300"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                                    {meetingStep === 1 ? (
                                        <X className="w-4 h-4" />
                                    ) : (
                                        <ChevronLeft className="w-4 h-4" />
                                    )}
                                </div>
                                <span>
                                    {meetingStep === 1
                                        ? "Cancel Deployment"
                                        : "Previous Phase"}
                                </span>
                            </div>
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>

                        {meetingStep < 3 ? (
                            <Button
                                type="button"
                                onClick={() =>
                                    setMeetingStep((prev) => prev + 1)
                                }
                                disabled={
                                    meetingStep === 1 &&
                                    (!newMeeting.title ||
                                        !newMeeting.date ||
                                        !newMeeting.time)
                                }
                                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold uppercase tracking-widest text-sm h-14 px-10 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span>Advance to Phase {meetingStep + 1}</span>
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </div>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl animate-spin-slow opacity-30" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleScheduleMeeting}
                                className="group relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white font-black uppercase tracking-widest text-sm h-16 px-12 rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:shadow-orange-500/40 flex items-center gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <Rocket className="w-6 h-6 text-white animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">Execute Summit Deployment</div>
                                        <div className="text-xs opacity-80">Finalize & notify operatives</div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute -inset-2 bg-gradient-to-r from-orange-500/30 via-red-500/20 to-pink-500/30 rounded-2xl animate-pulse opacity-20" />
                                <div className="absolute top-2 right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-ping">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DispatchLabel({ text }: { text: string }) {
    return (
        <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
            {text}
        </label>
    );
}
