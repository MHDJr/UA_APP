"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/lib/supabase";
import {
    Users,
    Target,
    Rocket,
    CheckCircle2,
    XCircle,
    Clock,
    Zap,
    Calendar,
    Search,
    ChevronDown,
    Send,
    ChevronRight,
    Bell,
    LogOut,
    Settings,
    Video,
    MapPin,
    FileText,
    Crown,
    Radio,
    Wifi,
    Power,
    AlertTriangle,
    LayoutDashboard,
    Sparkles,
    Coffee,
    Smile,
    Activity,
    Plus,
    Lightbulb,
    RefreshCw,
    AlertCircle,
    Briefcase,
    TrendingUp,
    UserCheck,
    MoreHorizontal,
    Filter,
    Check,
    X,
    Info,
    Sun,
    Moon,
    BarChart3,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import Link from "next/link";

// Brand colors - Professional Navy, White, Orange (Matching Staff Hub)
const BRAND = {
    navy: "#2F1E73",
    orange: "#F15A24",
    lightNavy: "#3F348C",
    softOrange: "#FEF2EE",
    bg: "#F4F7FE",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    cardBg: "#FFFFFF",
};

// Mock data for team members with departments
const mockStaffData = [
    {
        id: "1",
        name: "John Smith",
        role: "Sales Executive",
        department: "Sales",
        email: "john@ua.academy",
        status: "active",
        vibe: "Focused",
        currentTask: "Following up on leads",
        avatar: "JS",
        lastActive: "2 min ago",
    },
    {
        id: "2",
        name: "Sarah Johnson",
        role: "Senior Tutor",
        department: "Education",
        email: "sarah@ua.academy",
        status: "active",
        vibe: "Energized",
        currentTask: "Preparing lesson plan",
        avatar: "SJ",
        lastActive: "Just now",
    },
    {
        id: "3",
        name: "Mike Davis",
        role: "Operations Staff",
        department: "Operations",
        email: "mike@ua.academy",
        status: "on_break",
        vibe: "Relaxed",
        currentTask: "On break - Lunch",
        avatar: "MD",
        lastActive: "15 min ago",
    },
    {
        id: "4",
        name: "Emily Chen",
        role: "Marketing Lead",
        department: "Marketing",
        email: "emily@ua.academy",
        status: "active",
        vibe: "Creative",
        currentTask: "Designing campaign",
        avatar: "EC",
        lastActive: "5 min ago",
    },
    {
        id: "5",
        name: "David Wilson",
        role: "Tutor",
        department: "Education",
        email: "david@ua.academy",
        status: "active",
        vibe: "Focused",
        currentTask: "Student assessment",
        avatar: "DW",
        lastActive: "1 min ago",
    },
    {
        id: "6",
        name: "Lisa Anderson",
        role: "Sales Representative",
        department: "Sales",
        email: "lisa@ua.academy",
        status: "offline",
        vibe: "Offline",
        currentTask: "Not available",
        avatar: "LA",
        lastActive: "2 hours ago",
    },
    {
        id: "7",
        name: "Tom Martinez",
        role: "Operations Manager",
        department: "Operations",
        email: "tom@ua.academy",
        status: "active",
        vibe: "Productive",
        currentTask: "Reviewing workflows",
        avatar: "TM",
        lastActive: "30 min ago",
    },
    {
        id: "8",
        name: "Rachel Green",
        role: "Marketing Coordinator",
        department: "Marketing",
        email: "rachel@ua.academy",
        status: "active",
        vibe: "Inspired",
        currentTask: "Content creation",
        avatar: "RG",
        lastActive: "45 min ago",
    },
];

// Mock task history
const mockRecentTasks = [
    {
        id: "1",
        title: "Q2 Performance Review",
        assignedTo: "John Smith",
        priority: "high",
        status: "completed",
        completedAt: "2 hours ago",
    },
    {
        id: "2",
        title: "Update Course Materials",
        assignedTo: "Sarah Johnson",
        priority: "medium",
        status: "in_progress",
        completedAt: null,
    },
    {
        id: "3",
        title: "Client Follow-up Calls",
        assignedTo: "Mike Davis",
        priority: "high",
        status: "pending",
        completedAt: null,
    },
];

interface ManagerCommandCenterProps {
    className?: string;
}

export function ManagerCommandCenter({ className }: ManagerCommandCenterProps) {
    const { profile, user } = useAuth();
    const [staffData] = useState(mockStaffData);
    const [recentTasks] = useState(mockRecentTasks);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("ALL");
    const [showCompleted, setShowCompleted] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);
    
    // Task deployment form state
    const [taskDescription, setTaskDescription] = useState("");
    const [selectedStaff, setSelectedStaff] = useState("");
    const [priorityLevel, setPriorityLevel] = useState<"urgent" | "daily" | "routine">("daily");
    const [searchStaffQuery, setSearchStaffQuery] = useState("");
    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

    // Get manager's department access based on system role
    const managerDepartmentAccess = useMemo(() => {
        // Use the system role to determine department access
        const role = profile?.role;
        if (role === "sales") return ["Sales"];
        if (role === "staff") return ["Administration"]; // For administration staff
        // CEO or full-access managers can see all departments
        if (profile?.role === "ceo" || profile?.is_manager) return null; // null means full access
        return ["Sales"]; // Default fallback
    }, [profile]);

    // Filter staff based on manager's department access
    const accessibleStaff = useMemo(() => {
        if (!managerDepartmentAccess) return staffData; // Full access
        return staffData.filter(staff => managerDepartmentAccess.includes(staff.department));
    }, [staffData, managerDepartmentAccess]);

    // Stats
    const stats = useMemo(() => {
        const activeStaff = accessibleStaff.filter(s => s.status === "active").length;
        const totalStaff = accessibleStaff.length;
        const completionRate = 88; // Hardcoded as per requirements
        return {
            activeStaff,
            totalStaff,
            completionRate,
        };
    }, [accessibleStaff]);

    // Filtered staff for dropdown (only accessible staff)
    const filteredStaff = useMemo(() => {
        return accessibleStaff.filter(staff =>
            staff.name.toLowerCase().includes(searchStaffQuery.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchStaffQuery.toLowerCase()) ||
            staff.department.toLowerCase().includes(searchStaffQuery.toLowerCase())
        );
    }, [accessibleStaff, searchStaffQuery]);

    // Filter tasks based on active tab
    const filteredTasks = useMemo(() => {
        if (showCompleted) return completedTasks;
        
        return tasks.filter(task => {
            if (activeTab === "ALL") return true;
            if (activeTab === "URGENT") return task.priority === "urgent";
            if (activeTab === "DAILY") return task.is_daily_task;
            return false;
        });
    }, [tasks, completedTasks, activeTab, showCompleted]);

    const fetchTasks = async () => {
        if (!profile) return;
        
        try {
            // Fetch tasks assigned to staff in manager's department
            const { data: tasksData, error } = await supabase
                .from("tasks")
                .select("*")
                .in("status", ["pending", "in_progress"])
                .order("created_at", { ascending: false });
            
            if (error) {
                console.error('Error fetching tasks:', error);
                return;
            }
            
            if (tasksData) {
                setTasks(tasksData);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // Fetch tasks from database
    useEffect(() => {
        fetchTasks();
    }, [profile]);

    // Get vibe icon
    const getVibeIcon = (vibe: string) => {
        switch (vibe.toLowerCase()) {
            case "energized": return <Zap className="w-3 h-3" />;
            case "focused": return <Target className="w-3 h-3" />;
            case "creative": return <Sparkles className="w-3 h-3" />;
            case "relaxed": return <Coffee className="w-3 h-3" />;
            case "happy": return <Smile className="w-3 h-3" />;
            default: return <Activity className="w-3 h-3" />;
        }
    };

    // Get vibe color
    const getVibeColor = (vibe: string) => {
        switch (vibe.toLowerCase()) {
            case "energized": return "text-orange-500 bg-orange-50";
            case "focused": return "text-blue-500 bg-blue-50";
            case "creative": return "text-purple-500 bg-purple-50";
            case "relaxed": return "text-green-500 bg-green-50";
            case "happy": return "text-yellow-500 bg-yellow-50";
            default: return "text-slate-500 bg-slate-50";
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case "active": return "bg-green-500";
            case "on_break": return "bg-yellow-500";
            case "offline": return "bg-slate-300";
            default: return "bg-slate-300";
        }
    };

    // Get priority badge style
    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case "urgent":
            case "high":
                return "bg-red-100 text-red-700 border-red-200";
            case "daily":
            case "medium":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "routine":
            case "low":
            case "normal":
                return "bg-slate-100 text-slate-700 border-slate-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    // Get priority icon
    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "urgent": return <AlertCircle className="w-3 h-3" />;
            case "daily": return <Clock className="w-3 h-3" />;
            case "routine": return <Calendar className="w-3 h-3" />;
            default: return <Clock className="w-3 h-3" />;
        }
    };

    // Handle task deployment
    const handleDeployTask = async () => {
        if (!taskDescription.trim()) {
            toast.error("Please enter a task description");
            return;
        }
        if (!selectedStaff) {
            toast.error("Please select a staff member");
            return;
        }
        if (!profile) {
            toast.error("User not authenticated");
            return;
        }

        setIsDeploying(true);

        try {
            // Save task to database
            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    assigned_to: selectedStaff,
                    title: taskDescription,
                    description: taskDescription,
                    priority: priorityLevel === 'urgent' ? 'urgent' : priorityLevel === 'daily' ? 'medium' : 'low',
                    priority_level: priorityLevel,
                    task_type: 'assignment',
                    created_by: profile.id,
                    status: 'pending'
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating task:', error);
                toast.error("Failed to create task");
                return;
            }

            const staffMember = staffData.find(s => s.id === selectedStaff);
            toast.success(`Task assigned to ${staffMember?.name}`, {
                description: `Priority: ${priorityLevel.charAt(0).toUpperCase() + priorityLevel.slice(1)}`,
            });

            // Reset form
            setTaskDescription("");
            setSelectedStaff("");
            setPriorityLevel("daily");
            setIsDeploying(false);
            
            // Refresh tasks list
            await fetchTasks();

        } catch (error) {
            console.error('Error deploying task:', error);
            toast.error("An error occurred while assigning task");
            setIsDeploying(false);
        }
    };

    // Get selected staff member
    const selectedStaffMember = accessibleStaff.find(s => s.id === selectedStaff);

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: "Good Morning", icon: <Sun className="w-8 h-8 text-orange-400" /> };
        if (hour < 18) return { text: "Good Afternoon", icon: <Sun className="w-8 h-8 text-orange-500" /> };
        return { text: "Good Evening", icon: <Moon className="w-8 h-8 text-indigo-400" /> };
    };

    const greeting = getGreeting();

    return (
        <div className={`min-h-screen ${className}`} style={{ backgroundColor: BRAND.bg }}>
            {/* Header - Mirroring Staff Hub Exactly */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-[1700px] mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#2F1E73] rounded-xl flex items-center justify-center shadow-lg">
                                <Crown className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#2F1E73]">
                                Manager Hub
                            </span>
                        </div>

                        {/* Center Badge & Status */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex items-center px-4 py-2 bg-[#2F1E73]/10 rounded-xl">
                                <span className="text-sm font-bold text-[#2F1E73] uppercase tracking-wider">
                                    MANAGER HUB | COMMAND CENTER
                                </span>
                            </div>
                            <Badge 
                                variant="outline" 
                                className="bg-green-50 text-green-600 border-green-200 px-3 py-1.5"
                            >
                                <span className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    ON DUTY
                                </span>
                            </Badge>
                        </div>

                        {/* Profile */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900">
                                    {profile?.full_name || "Manager"}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {profile?.role === "ceo" ? "Executive" : 
                                     (() => {
                                         const role = profile?.role || "";
                                         if (role === "sales") return "Sales Manager";
                                         if (role === "staff") return "Department Manager";
                                         return "Department Manager";
                                     })()}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2F1E73] to-[#F15A24] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {(profile?.full_name || "M").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - Staff Hub Layout */}
            <main className="p-4 md:p-8 max-w-[1700px] mx-auto grid grid-cols-12 gap-4 md:gap-8">
                {/* Top Greeting Banner */}
                <div className="col-span-12">
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative overflow-hidden">
                        <div className="flex items-center gap-3 md:gap-6 relative z-10">
                            <div className="w-12 h-12 md:w-20 md:h-20 bg-orange-50 rounded-xl md:rounded-[2rem] flex items-center justify-center shadow-inner shrink-0">
                                {greeting.icon}
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-bold text-slate-900 tracking-tight">
                                    {greeting.text}, {profile?.full_name?.split(' ')[0] || 'Manager'}
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Deploy missions and oversee your department operations
                                </p>
                            </div>
                        </div>
                        
                        {/* Department Metrics */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#2F1E73]/5 rounded-xl border border-[#2F1E73]/10">
                                <BarChart3 className="w-5 h-5 text-[#2F1E73]" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Team Velocity</p>
                                    <p className="text-lg font-bold text-[#2F1E73]">88%</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 rounded-xl border border-green-100">
                                <Wifi className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Staff Online</p>
                                    <p className="text-lg font-bold text-green-600">{stats.activeStaff}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Column - Quick Actions, CEO Broadcast & Team Live Feed */}
                <div className="col-span-12 lg:col-span-3 space-y-6 order-3 lg:order-1">
                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-8 h-8 bg-[#2F1E73]/10 rounded-lg flex items-center justify-center">
                                <Zap className="w-4 h-4 text-[#2F1E73]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                                <p className="text-xs text-slate-500">Department tools</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Link href="/manager/sales">
                                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-[#2F1E73]/5 border border-slate-200 hover:border-[#2F1E73]/20 transition-all group">
                                    <div className="w-10 h-10 rounded-lg bg-[#2F1E73]/10 flex items-center justify-center group-hover:bg-[#2F1E73]/20 transition-colors">
                                        <TrendingUp className="w-5 h-5 text-[#2F1E73]" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-slate-900">Manage Department Sales</p>
                                        <p className="text-xs text-slate-500">View team metrics & performance</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-[#2F1E73] transition-colors" />
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* CEO Broadcast Card */}],
                    <div 
                        style={{ backgroundColor: BRAND.navy }}
                        className="rounded-2xl md:rounded-[2.5rem] p-5 md:p-7 text-white shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500 rounded-full blur-3xl" />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <Radio className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider">CEO Broadcast</h3>
                                    <p className="text-xs text-white/70">Direct from Executive</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                                            <Crown className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">Q2 Goals Alignment</p>
                                            <p className="text-xs text-white/70 mt-1">
                                                Focus on team velocity and student satisfaction metrics this quarter.
                                            </p>
                                            <p className="text-[10px] text-white/50 mt-2">2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                                            <Target className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">New Initiative Launch</p>
                                            <p className="text-xs text-white/70 mt-1">
                                                Prepare teams for the upcoming digital transformation rollout.
                                            </p>
                                            <p className="text-[10px] text-white/50 mt-2">Yesterday</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Live Feed */}
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Team Live Feed</h3>
                                    <p className="text-xs text-slate-500">Real-time status</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                                <span className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    Live
                                </span>
                            </Badge>
                        </div>
                        
                        <ScrollArea className="h-[320px] pr-2">
                            <div className="space-y-3">
                                {accessibleStaff.map((staff) => (
                                    <div 
                                        key={staff.id}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                                    >
                                        <div className="relative">
                                            <div 
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                                                style={{ backgroundColor: staff.status === "offline" ? "#94a3b8" : BRAND.navy }}
                                            >
                                                {staff.avatar}
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(staff.status)}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{staff.name}</p>
                                                <Badge 
                                                    variant="outline" 
                                                    className={`text-[10px] px-1.5 py-0.5 ${getVibeColor(staff.vibe)}`}
                                                >
                                                    <span className="flex items-center gap-1">
                                                        {getVibeIcon(staff.vibe)}
                                                        {staff.vibe}
                                                    </span>
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">{staff.currentTask}</p>
                                            <p className="text-[10px] text-slate-400">{staff.lastActive}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                {/* Middle Column - MISSION CONTROL */}
                <div className="col-span-12 lg:col-span-6 space-y-4 md:space-y-6 order-1 lg:order-2">
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-0 border border-slate-100 md:border-0 md:bg-transparent shadow-sm md:shadow-none">
                        <div className="flex flex-col gap-3 md:px-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-2 md:gap-3">
                                        Mission Control{" "}
                                        <Target className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium hidden md:block">
                                        Tasks assigned by CEO to your team
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDeploying(!isDeploying)}
                                    className="px-3 py-2 bg-[#2F1E73] text-white rounded-xl text-xs font-semibold hover:bg-[#2F1E73]/90 transition-all flex items-center gap-2"
                                >
                                    <Plus className="w-3 h-3" />
                                    Assign Task
                                </button>
                            </div>
                            {/* Mobile: Horizontal scrolling filter tabs */}
                            <div className="flex bg-white md:bg-transparent p-1 rounded-xl md:rounded-2xl shadow-sm md:shadow-none border md:border-0 border-slate-100 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                                {["ALL", "URGENT", "DAILY", "COMPLETED"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => {
                                            setActiveTab(tab);
                                            setShowCompleted(tab === "COMPLETED");
                                        }}
                                        className={`px-3 md:px-4 py-2.5 md:py-2 rounded-lg md:rounded-xl text-[10px] font-black transition-all flex items-center gap-2 whitespace-nowrap min-h-[44px] md:min-h-0 ${
                                            activeTab === tab
                                                ? "text-white shadow-lg"
                                                : "text-slate-400"
                                        }`}
                                        style={{
                                            backgroundColor:
                                                activeTab === tab
                                                    ? BRAND.navy
                                                    : "transparent",
                                        }}
                                    >
                                        {tab}
                                        {tab === "COMPLETED" && completedTasks.length > 0 && (
                                            <span className="bg-blue-500 text-white text-[7px] px-1.5 py-0.5 rounded-full">
                                                {completedTasks.length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Task Assignment Form (shown when Assign Task is clicked) */}
                        {isDeploying && (
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] p-5 md:p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
                                {/* Decorative gradient accent */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2F1E73] via-[#F15A24] to-[#2F1E73]" />
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#F15A24] to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 relative">
                                        <Plus className="w-5 h-5 text-white" />
                                        <div className="absolute inset-0 bg-orange-400/20 rounded-xl animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Assign New Task</h3>
                                        <p className="text-sm text-slate-500">Deploy task to your team member</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Task Description */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-lg bg-[#2F1E73]/10 flex items-center justify-center">
                                                <FileText className="w-3 h-3 text-[#2F1E73]" />
                                            </div>
                                            Task Details
                                        </label>
                                        <Textarea
                                            placeholder="Describe the task objectives, deliverables, and requirements..."
                                            value={taskDescription}
                                            onChange={(e) => setTaskDescription(e.target.value)}
                                            className="min-h-[100px] bg-white border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#2F1E73]/20 focus:border-[#2F1E73] resize-none shadow-inner text-sm"
                                            style={{ boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.05)' }}
                                        />
                                    </div>

                                    {/* Staff Selection */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-lg bg-[#2F1E73]/10 flex items-center justify-center">
                                                <Users className="w-3 h-3 text-[#2F1E73]" />
                                            </div>
                                            Assign To
                                        </label>
                                        <div className="relative">
                                            <button
                                                onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                                                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-[#2F1E73]/40 hover:shadow-md transition-all text-left shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {selectedStaffMember ? (
                                                        <>
                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md" style={{ backgroundColor: BRAND.navy }}>
                                                                {selectedStaffMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">{selectedStaffMember.name}</p>
                                                                <p className="text-xs text-slate-500">{selectedStaffMember.role}</p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm">Select a team member...</span>
                                                    )}
                                                </div>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isStaffDropdownOpen ? "rotate-180" : ""}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isStaffDropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden"
                                                    >
                                                        {/* Search in dropdown */}
                                                        <div className="p-3 border-b border-slate-100">
                                                            <div className="relative">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                                <Input
                                                                    placeholder="Search staff..."
                                                                    value={searchStaffQuery}
                                                                    onChange={(e) => setSearchStaffQuery(e.target.value)}
                                                                    className="pl-9 h-8 text-sm border-slate-200 rounded-lg"
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* Staff list */}
                                                        <div className="max-h-[200px] overflow-y-auto">
                                                            {filteredStaff.map((staff) => (
                                                                <button
                                                                    key={staff.id}
                                                                    onClick={() => {
                                                                        setSelectedStaff(staff.id);
                                                                        setIsStaffDropdownOpen(false);
                                                                        setSearchStaffQuery("");
                                                                    }}
                                                                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors ${selectedStaff === staff.id ? "bg-slate-50" : ""}`}
                                                                >
                                                                    <div className="relative">
                                                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: BRAND.navy }}>
                                                                            {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                                        </div>
                                                                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white ${getStatusColor(staff.status)}`} />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-medium text-slate-900">{staff.name}</p>
                                                                            <Badge 
                                                                                variant="outline" 
                                                                                className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-600 border-slate-200"
                                                                            >
                                                                                {staff.department}
                                                                            </Badge>
                                                                        </div>
                                                                        <p className="text-xs text-slate-500">{staff.role}</p>
                                                                    </div>
                                                                    {selectedStaff === staff.id && (
                                                                        <Check className="w-3 h-3 text-green-500" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Priority Level Selector */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-lg bg-[#2F1E73]/10 flex items-center justify-center">
                                                <AlertCircle className="w-3 h-3 text-[#2F1E73]" />
                                            </div>
                                            Priority Level
                                        </label>
                                        <div className="flex rounded-xl border-2 border-slate-200 p-1 bg-slate-50">
                                            {[
                                                { value: "routine", label: "Routine", color: "#10B981" },
                                                { value: "daily", label: "Daily", color: "#2F1E73" },
                                                { value: "urgent", label: "Urgent", color: "#EF4444" },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setPriorityLevel(option.value as any)}
                                                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        priorityLevel === option.value
                                                            ? 'bg-white shadow-sm text-white'
                                                            : 'text-slate-600 hover:text-slate-800'
                                                    }`}
                                                    style={{
                                                        backgroundColor: priorityLevel === option.value ? option.color : 'transparent'
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Deploy Button */}
                                    <div className="pt-2">
                                        <Button
                                            onClick={handleDeployTask}
                                            disabled={isDeploying || !taskDescription.trim() || !selectedStaff}
                                            className={`w-full h-12 text-sm font-bold uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group ${
                                                priorityLevel === 'urgent' ? 'shadow-lg shadow-orange-500/30' : 'shadow-lg'
                                            }`}
                                            style={{ 
                                                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                                                color: "white",
                                            }}
                                        >
                                            {isDeploying ? (
                                                <span className="relative z-10 flex items-center">
                                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                    Assigning...
                                                </span>
                                            ) : (
                                                <span className="relative z-10 flex items-center group-hover:translate-x-1 transition-transform duration-200">
                                                    <Send className="w-4 h-4 mr-2 group-hover:translate-x-0.5 transition-transform duration-200" />
                                                    Assign Task
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Task List */}
                        <div className="mt-4 md:mt-0 space-y-3 md:space-y-4">
                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-8 md:py-12">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                                    {showCompleted ? (
                                        <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
                                    ) : (
                                        <Target className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
                                    )}
                                </div>
                                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase mb-2">
                                    {showCompleted ? "No Completed Tasks" : "No Active Tasks"}
                                </h3>
                                <p className="text-xs md:text-sm text-slate-400">
                                    {showCompleted
                                        ? "Tasks completed by your team will appear here"
                                        : "No tasks assigned by CEO currently."}
                                </p>
                            </div>
                        ) : (
                            filteredTasks.map((task) => (
                            <div
                                key={task.id}
                                className={`bg-white rounded-2xl md:rounded-[2.5rem] transition-all border-2 overflow-hidden ${
                                    expandedTask && expandedTask === task.id
                                        ? "shadow-xl"
                                        : "shadow-sm border-transparent"
                                }`}
                                style={{
                                    borderColor:
                                        expandedTask && expandedTask === task.id
                                            ? BRAND.orange
                                            : "transparent",
                                }}
                            >
                                <div
                                    className="p-4 md:p-7 cursor-pointer flex items-center justify-between min-h-[56px]"
                                    onClick={() =>
                                        setExpandedTask(
                                            expandedTask &&
                                                expandedTask === task.id
                                                ? null
                                                : task.id,
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-3 md:gap-5">
                                        <div
                                            className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-3xl flex items-center justify-center relative shrink-0 ${
                                                showCompleted
                                                    ? "bg-emerald-50 text-emerald-500"
                                                   : task.priority === "urgent"
                                                        ? "bg-red-50 text-red-500"
                                                        : "bg-slate-50 text-slate-400"
                                            }`}
                                        >
                                            {showCompleted ? (
                                                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                                            ) : task.priority === "urgent" ? (
                                                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
                                            ) : (
                                                <LayoutDashboard className="w-5 h-5 md:w-6 md:h-6" />
                                            )}
                                            {task.is_daily_task && !showCompleted && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-orange-500 rounded-xl md:rounded-2xl border-2 border-white flex items-center justify-center shadow-md">
                                                    <Target className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <span
                                                    className="text-[8px] md:text-[9px] font-black uppercase tracking-wider"
                                                    style={{
                                                        color: showCompleted
                                                            ? "#10b981"
                                                            : task.priority === "urgent"
                                                                ? BRAND.orange
                                                                : "#94a3b8",
                                                    }}
                                                >
                                                    {showCompleted ? "COMPLETED" : task.priority?.toUpperCase()}
                                                </span>
                                                {task.is_daily_task && !showCompleted && (
                                                    <span className="flex items-center gap-1 text-[8px] md:text-[9px] font-black text-orange-600 bg-orange-50 px-1.5 md:px-2 py-0.5 rounded-lg uppercase tracking-tighter">
                                                        <Sparkles className="w-2 h-2" />{" "}
                                                        Daily
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-base md:text-xl font-black text-slate-900 leading-tight">
                                                {task.title}
                                            </h3>
                                            {task.due_date && (
                                                <div className="flex items-center gap-1.5 mt-1 text-red-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                                        Due: {new Date(task.due_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 text-slate-300 transition-transform ${expandedTask && expandedTask === task.id ? "rotate-180 text-orange-500" : ""}`}
                                    />
                                </div>
                                {expandedTask && expandedTask === task.id && (
                                    <div className="px-7 pb-7 space-y-5">
                                        <div className="p-5 bg-slate-50 rounded-3xl italic text-sm text-slate-600 border border-slate-100 flex items-start gap-3">
                                            <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                            "{task.description}"
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                        )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Scheduled Meetings & Pending Approvals */}
                <div className="col-span-12 lg:col-span-3 space-y-6 order-2 lg:order-3">
                    {/* Scheduled Meetings Card */}
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#2F1E73]/10 rounded-lg flex items-center justify-center">
                                    <Video className="w-4 h-4 text-[#2F1E73]" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Scheduled Meetings</h3>
                                    <p className="text-xs text-slate-500">Upcoming sessions</p>
                                </div>
                            </div>
                            <Badge 
                                variant="outline" 
                                className="text-xs bg-[#2F1E73]/5 text-[#2F1E73] border-[#2F1E73]/20"
                            >
                                3 Today
                            </Badge>
                        </div>

                        <div className="space-y-3">
                            {[
                                { time: "10:00 AM", title: "Team Standup", type: "Daily", color: "bg-blue-500" },
                                { time: "2:00 PM", title: "Q2 Review", type: "Review", color: "bg-orange-500" },
                                { time: "4:30 PM", title: "1:1 with Sarah", type: "1:1", color: "bg-purple-500" },
                            ].map((meeting, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className={`w-1 h-10 rounded-full ${meeting.color}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-900">{meeting.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Clock className="w-3 h-3" />
                                            {meeting.time}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] bg-white">
                                        {meeting.type}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-4 py-2.5 text-sm font-semibold text-[#2F1E73] bg-[#2F1E73]/5 rounded-xl hover:bg-[#2F1E73]/10 transition-colors">
                            View All Meetings
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}
