"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase, Task, Profile } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Clock,
    Power,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    ChevronDown,
    Calendar,
    Bell,
    FileText,
    UserCheck,
    Settings,
    MessageSquare,
    ArrowRight,
    Zap,
    ShieldAlert,
    Plus,
    Timer,
    LayoutDashboard,
    LogOut,
    X,
    Send,
    Info,
    Activity,
    Target,
    Sun,
    Moon,
    Coffee,
    Sparkles,
    Smile,
    Megaphone,
    History,
    Users,
    Video,
    MapPin,
    TrendingUp,
    Award,
    Check,
    Lightbulb,
    RefreshCw,
    ListTodo,
    BarChart3,
    Home,
    User,
    Wallet,
    Circle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import MobileNavigation from "@/components/mobile-navigation";
import { format, differenceInMinutes } from "date-fns";
import { RequestModal } from "@/components/RequestModal";
import { LeaveRequestModal } from "@/components/LeaveRequestModal";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Confetti effect function
const triggerConfetti = () => {
    const colors = ["#2F1E73", "#F15A24", "#16a34a", "#f59e0b"];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement("div");
        confetti.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            pointer-events: none;
            z-index: 9999;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        `;
        document.body.appendChild(confetti);

        const angle = (Math.PI * 2 * i) / confettiCount;
        const velocity = 5 + Math.random() * 5;

        let opacity = 1;
        let scale = 1;
        let x = 0;
        let y = 0;

        const animate = () => {
            x += Math.cos(angle) * velocity;
            y += Math.sin(angle) * velocity + 2;
            opacity -= 0.02;
            scale -= 0.01;

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

// Format duration function
const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
};

// Modal Component
interface ModalProps {
    title: string;
    type: string;
    onClose: () => void;
    children: React.ReactNode;
    onSubmitSuccess?: () => void;
    setInteracting?: (interacting: boolean) => void;
}

const Modal: React.FC<ModalProps> = ({ title, type, onClose, children, onSubmitSuccess, setInteracting }) => {
    const { profile } = useAuth();
    
    const handleSubmit = async () => {
        // Set user interacting to prevent refresh during submission
        if (setInteracting) setInteracting(true);
        
        if (!profile) {
            toast.error("Please login to submit requests");
            if (setInteracting) setInteracting(false);
            return;
        }

        try {
            // Collect form data based on type
            let requestData: any = {
                type: type,
                submitted_by: profile.id,
                status: 'pending',
                created_at: new Date().toISOString()
            };

            if (type === "permission") {
                // Get form values
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) {
                    const formData = new FormData(form);
                    const subject = formData.get('subject') as string;
                    const priority = formData.get('priority') as string;
                    const justification = formData.get('justification') as string;
                    const cost = formData.get('cost') as string;
                    
                    // Include cost in description if provided
                    let description = `[${priority?.toUpperCase() || 'STANDARD'}] ${subject || 'No subject provided'}: ${justification || 'No justification provided'}`;
                    if (cost) {
                        description += ` | Cost: ${cost}`;
                    }
                    
                    requestData.title = "Permission Request";
                    requestData.description = description;
                    requestData.priority = priority || 'standard';
                }
            } else if (type === "leave") {
                // Get form values
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) {
                    const formData = new FormData(form);
                    const category = formData.get('category') as string;
                    const reason = formData.get('reason') as string;
                    const startDate = formData.get('start_date') as string;
                    const endDate = formData.get('end_date') as string;
                    
                    requestData.title = "Leave Request";
                    requestData.description = `${category ? category.charAt(0).toUpperCase() + category.slice(1) + ' Leave' : 'Casual Leave'}: ${reason || 'No reason provided'}`;
                    requestData.dates = startDate && endDate ? `${startDate} - ${endDate}` : 'Date not specified';
                    requestData.priority = 'medium';
                    
                    // Calculate total days
                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                        requestData.total_days = days;
                    }
                }
            } else if (type === "idea") {
                // Get form values
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) {
                    const formData = new FormData(form);
                    const title = formData.get('idea_title') as string;
                    const description = formData.get('idea_description') as string;
                    
                    // Submit ideas to the ideas table instead of requests
                    const ideaData: any = {
                        title: title || "Idea Submission",
                        content: description || "No description provided",
                        created_by: profile.id
                    };
                    
                    // Add optional fields only if they exist in the schema
                    try {
                        // Try to include category, priority, and status if they exist
                        ideaData.category = "other";
                        ideaData.priority = 'medium';
                        ideaData.status = 'active';
                    } catch (schemaError) {
                        console.log("Some optional fields may not exist in schema, using minimal data");
                    }
                    
                    console.log("Submitting idea to ideas table:", ideaData);
                    
                    const { data, error } = await supabase.from('ideas').insert(ideaData).select();
                    
                    console.log("Idea submission result:", { data, error });
                    
                    if (error) {
                        console.error('Submit error:', error);
                        toast.error("Failed to submit idea: " + error.message);
                    } else {
                        console.log("Idea submitted successfully:", data);
                        toast.success("Idea submitted successfully!");
                        onClose();
                        // Call refresh callback
                        if (onSubmitSuccess) onSubmitSuccess();
                    }
                    return; // Exit early for ideas
                } else {
                    // Fallback for idea modal without form
                    const ideaData = {
                        title: "Idea Submission",
                        content: "Idea submitted from staff portal",
                        category: "other",
                        priority: 'medium',
                        status: 'active',
                        created_by: profile.id
                    };
                    
                    const { error } = await supabase.from('ideas').insert(ideaData);
                    
                    if (error) {
                        console.error('Submit error:', error);
                        toast.error("Failed to submit idea: " + error.message);
                    } else {
                        toast.success("Idea submitted successfully!");
                        onClose();
                        // Call refresh callback
                        if (onSubmitSuccess) onSubmitSuccess();
                    }
                    return; // Exit early for ideas
                }
            }

            // Submit to database for other request types
            const { error } = await supabase.from('requests').insert(requestData);
            
            if (error) {
                console.error('Submit error:', error);
                toast.error("Failed to submit request: " + error.message);
            } else {
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} request submitted successfully!`);
                onClose();
                // Call refresh callback
                if (onSubmitSuccess) onSubmitSuccess();
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error("Failed to submit request");
        } finally {
            // Reset interaction state after submission
            if (setInteracting) setInteracting(false);
        }
    };

    return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        ></div>
        <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div
                style={{ backgroundColor: "#2C2171" }}
                className="p-6 text-white flex justify-between items-center"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded-xl">
                        {type === "leave" && (
                            <Calendar className="w-5 h-5 text-orange-400" />
                        )}
                        {type === "permission" && (
                            <UserCheck className="w-5 h-5 text-orange-400" />
                        )}
                        {type === "work" && (
                            <Zap className="w-5 h-5 text-orange-400" />
                        )}
                        {type === "report" && (
                            <FileText className="w-5 h-5 text-orange-400" />
                        )}
                        {type === "idea" && (
                            <Lightbulb className="w-5 h-5 text-orange-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">
                            {title}
                        </h3>
                        <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest">
                            Command Portal
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>
            <div className="p-8 space-y-4">
                {children}
                <div className="pt-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 border border-slate-200 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        style={{ backgroundColor: "#F15A29" }}
                        className="flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <Send className="w-4 h-4" /> Execute
                    </button>
                </div>
            </div>
        </div>
    </div>
    );
};

// Pre-meeting tasks component
const PreMeetingTasksIndicator = ({ meetingId, userId, meetingTitle }: { meetingId: string; userId: string; meetingTitle?: string }) => {
    const [tasksCount, setTasksCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPreMeetingTasks = async () => {
            try {
                console.log("Fetching pre-meeting tasks for meeting:", meetingId, "user:", userId, "title:", meetingTitle);
                
                // Fetch all pending pre-meeting tasks for the user
                const { data: tasks, error } = await supabase
                    .from("tasks")
                    .select("*")
                    .eq("assigned_to", userId)
                    .eq("status", "pending")
                    .or(`title.ilike.%pre-meeting%,description.ilike.%preparatory task for summit%,description.ilike.%preparatory task for meeting%`);

                console.log("Pre-meeting tasks fetched:", tasks);
                console.log("Error:", error);

                if (!error && tasks) {
                    // Filter tasks that are actually related to this specific meeting
                    const meetingTasks = tasks.filter(task => {
                        const taskTitle = task.title?.toLowerCase() || '';
                        const taskDescription = task.description?.toLowerCase() || '';
                        
                        // Check if task mentions this specific meeting
                        const mentionsMeetingId = taskTitle.includes(meetingId) || taskDescription.includes(meetingId);
                        
                        // Check if task mentions meeting title (if available)
                        const mentionsMeetingTitle = meetingTitle && (
                            taskTitle.includes(meetingTitle.toLowerCase()) || 
                            taskDescription.includes(meetingTitle.toLowerCase())
                        );
                        
                        // Check for meeting-specific keywords in task
                        const hasMeetingSpecificKeywords = 
                            taskTitle.includes('summit') || taskDescription.includes('summit') ||
                            taskTitle.includes('meeting') || taskDescription.includes('meeting') ||
                            taskTitle.includes('conference') || taskDescription.includes('conference');
                        
                        // Only count tasks that are clearly related to this meeting
                        const isRelatedToThisMeeting = mentionsMeetingId || mentionsMeetingTitle;
                        
                        console.log("Task:", task.title);
                        console.log("  - Mentions meeting ID:", mentionsMeetingId);
                        console.log("  - Mentions meeting title:", mentionsMeetingTitle);
                        console.log("  - Has meeting keywords:", hasMeetingSpecificKeywords);
                        console.log("  - Is related to this meeting:", isRelatedToThisMeeting);
                        
                        // Only return tasks that are specifically related to this meeting
                        return isRelatedToThisMeeting;
                    });
                    
                    console.log("Final meeting tasks count:", meetingTasks.length);
                    setTasksCount(meetingTasks.length);
                } else {
                    console.log("No tasks found or error occurred");
                    setTasksCount(0);
                }
            } catch (error) {
                console.error("Error fetching pre-meeting tasks:", error);
                setTasksCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchPreMeetingTasks();
    }, [meetingId, userId, meetingTitle]);

    if (loading) {
        return (
            <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border border-orange-500 border-t-transparent rounded-full"></div>
                    <p className="text-[8px] font-bold text-orange-600">
                        Loading tasks...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
                <ListTodo className="w-3 h-3 text-orange-500" />
                <p className="text-[8px] font-bold text-orange-600">
                    Pre-meeting tasks: {tasksCount}
                </p>
                {tasksCount > 0 && (
                    <span className="text-[7px] bg-orange-500 text-white px-2 py-0.5 rounded-full">
                        Action Required
                    </span>
                )}
            </div>
        </div>
    );
};

// Helper to parse and format request tracker items
const formatTrackerRequest = (req: any) => {
    // 1. Determine Title
    let title = req.type?.replace("_", " ").toUpperCase() || "REQUEST";
    if (req.type === "access_elevation") title = "Access Elevation";
    else if (req.type === "role_change") title = "Role Elevation";
    else if (req.type === "permission") title = "Permission Access";
    else if (req.type === "leave") title = "Leave Authorization";
    else if (req.type === "budget") title = "Budget Allocation";
    
    // 2. Determine cleaned secondary metadata/description
    let detail = "";
    if (req.description) {
        let desc = req.description;
        // Check if it's a pipe-separated metadata string
        if (desc.startsWith("[") && desc.endsWith("]")) {
            const parts = desc.slice(1, -1).split("|");
            const systemPart = parts.find((p: string) => p.trim().startsWith("System:"));
            const justificationPart = parts.find((p: string) => p.trim().startsWith("Justification:"));
            
            const systemVal = systemPart ? systemPart.split(":")[1]?.trim() : "";
            const justificationVal = justificationPart ? justificationPart.split(":")[1]?.trim() : "";
            
            if (systemVal && justificationVal) {
                detail = `${systemVal} • "${justificationVal}"`;
            } else if (justificationVal) {
                detail = justificationVal;
            } else {
                detail = desc;
            }
        } else if (req.type === 'leave') {
            const descParts = desc.split(':');
            const category = descParts[0] || '';
            const reason = descParts[1] || desc;
            detail = category ? `${category} • "${reason.trim()}"` : reason.trim();
        } else if (desc.includes("|")) {
            // Replace pipes with elegant bullets
            detail = desc.split("|").map((p: string) => p.trim()).join(" • ");
        } else {
            detail = desc;
        }
    }
    
    // Truncate detail for scannability
    if (detail.length > 55) {
        detail = detail.slice(0, 52) + "...";
    }
    
    return { title, detail };
};

export default function StaffPortal() {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [time, setTime] = useState("");
    const [vibe, setVibe] = useState("Focused");
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
    const [taskCreators, setTaskCreators] = useState<Record<string, Profile>>(
        {},
    );
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    // Add state to track user interactions
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [userStatus, setUserStatus] = useState<"off_duty" | "on_mission">(
        "off_duty",
    );
    const [sessionStart, setSessionStart] = useState<Date | null>(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [isOnDuty, setIsOnDuty] = useState(false);

    const [acknowledgedMessages, setAcknowledgedMessages] = useState<
        (number | string)[]
    >([]);
    // Task filter tabs state
    const [activeTab, setActiveTab] = useState("ALL");
    const [showCompleted, setShowCompleted] = useState(false);
    // Mobile bottom nav state
    const [mobileNavTab, setMobileNavTab] = useState("home");

    // Brand Palette
    const brand = {
        navy: "#2C2171",
        orange: "#F15A29",
        lightNavy: "#3F348C",
        softOrange: "#FEF2EE",
        bg: "#F4F7FE",
    };

    // 12-Hour Format Timer Logic
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const seconds = now.getSeconds().toString().padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12;
            setTime(`${hours}:${minutes}:${seconds} ${ampm}`);
        };

        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12)
            return {
                text: "Good Morning",
                icon: <Sun className="w-8 h-8 text-orange-400" />,
            };
        if (hour < 18)
            return {
                text: "Good Afternoon",
                icon: <Coffee className="w-8 h-8 text-orange-400" />,
            };
        return {
            text: "Good Evening",
            icon: <Moon className="w-8 h-8 text-orange-400" />,
        };
    };

    // Optimized fetch function with 15-second refresh
    const fetchData = useCallback(async () => {
        if (!profile) return;
        
        // Skip refresh if user is actively interacting
        if (isUserInteracting) {
            console.log('Skipping refresh - user is interacting');
            return;
        }
        
        if (!isInitialLoading) {
            setIsRefreshing(true);
        }

        try {
            // Batch all queries for better performance
            const [
                tasksData,
                completedTasksData,
                broadcastsData,
                requestsData,
                notificationsData,
                profilesData,
                participantsData,
                mNotificationsData,
            ] = await Promise.all([
                supabase
                    .from("tasks")
                    .select("*")
                    .eq("assigned_to", profile.id)
                    .in("status", ["pending", "in_progress"])
                    .order("created_at", { ascending: false }),
                supabase
                    .from("tasks")
                    .select("*")
                    .eq("assigned_to", profile.id)
                    .eq("status", "completed")
                    .order("updated_at", { ascending: false }),
                supabase
                    .from("broadcasts")
                    .select("*")
                    .gte("expires_at", new Date().toISOString())
                    .order("created_at", { ascending: false }),
                supabase
                    .from("requests")
                    .select("*, submitted_by:profiles!requests_submitted_by_fkey(id, full_name)")
                    .eq("submitted_by", profile.id)
                    .neq("type", "idea") // Exclude ideas from requests
                    .order("created_at", { ascending: false }),
                supabase
                    .from("notifications")
                    .select("*")
                    .eq("user_id", profile.id)
                    .order("created_at", { ascending: false })
                    .limit(20),
                supabase.from("profiles").select("*"),
                supabase
                    .from("meeting_participants")
                    .select("meeting_id, acknowledged_at")
                    .eq("user_id", profile.id),
                supabase
                    .from("meeting_notifications")
                    .select("*")
                    .eq("recipient_id", profile.id)
                    .is("read_at", null)
                    .order("created_at", { ascending: false }),
            ]);

            // Process data efficiently
            if (tasksData.data) {
                setTasks(tasksData.data);
                // Build creators map efficiently
                const creators: Record<string, Profile> = {};
                if (profilesData.data) {
                    const creatorIds = new Set(
                        tasksData.data.map((t: any) => t.created_by),
                    );
                    profilesData.data.forEach((p: Profile) => {
                        if (creatorIds.has(p.id)) creators[p.id] = p;
                    });
                }
                setTaskCreators(creators);
            }

            if (completedTasksData.data) {
                setCompletedTasks(completedTasksData.data);
            }

            if (broadcastsData.data) setBroadcasts(broadcastsData.data);
            if (requestsData.data) {
                setRequests(requestsData.data);
            } else {
                console.log('No requests data found');
            }
            if (notificationsData.data)
                setNotifications(notificationsData.data);
            if (profilesData.data) setProfiles(profilesData.data);

            // Process meetings data
            if (participantsData.data && participantsData.data.length > 0) {
                const meetingIds = participantsData.data.map(
                    (p) => p.meeting_id,
                );
                const { data: meetings } = await supabase
                    .from("meetings")
                    .select("*")
                    .in("id", meetingIds)
                    .gte("scheduled_at", new Date().toISOString())
                    .order("scheduled_at", { ascending: true });

                if (meetings) {
                    const merged = meetings.map((m) => ({
                        ...m,
                        acknowledged_at: participantsData.data.find(
                            (p) => p.meeting_id === m.id,
                        )?.acknowledged_at,
                    }));
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [profile, isUserInteracting, isInitialLoading]);

    const checkTodayAttendance = async () => {
        if (!profile) return;

        // Load presence status
        const { data: presenceData } = await supabase
            .from("staff_presence")
            .select("*")
            .eq("user_id", profile.id)
            .single();
        if (presenceData) {
            setUserStatus(
                presenceData.status === "online" ? "on_mission" : "off_duty",
            );
            if (presenceData.session_start)
                setSessionStart(new Date(presenceData.session_start));
        }
    };

    const handleMissionToggle = async () => {
        if (!profile) return;

        if (userStatus === "off_duty") {
            // Start mission - create attendance record
            const { error: attendanceError } = await supabase
                .from("staff_attendance")
                .insert({
                    user_id: profile.id,
                    clock_in: new Date().toISOString(),
                    date: new Date().toISOString().split("T")[0],
                    status: "active",
                });

            // Update presence
            const { error: presenceError } = await supabase
                .from("staff_presence")
                .upsert({
                    user_id: profile.id,
                    status: "online",
                    updated_at: new Date().toISOString(),
                    session_start: new Date().toISOString(),
                });

            // Create CEO notification
            if (!attendanceError && !presenceError) {
                await supabase.from("notifications").insert({
                    user_id: "ceo-profile-id",
                    title: "Mission Start Alert",
                    message: `${profile.full_name || profile.email} is now ON MISSION`,
                    type: "alert",
                    created_at: new Date().toISOString(),
                });

                setUserStatus("on_mission");
                setSessionStart(new Date());
                setIsOnDuty(true);
                localStorage.setItem("staff_active_session", "true");
                toast.success("Mission started - ON DUTY");
            }
        } else {
            // End mission - update attendance record
            const { error: attendanceError } = await supabase
                .from("staff_attendance")
                .update({
                    clock_out: new Date().toISOString(),
                    status: "completed",
                })
                .eq("user_id", profile.id)
                .eq("date", new Date().toISOString().split("T")[0])
                .is("clock_out", null);

            // Update presence
            const { error: presenceError } = await supabase
                .from("staff_presence")
                .update({
                    status: "offline",
                    updated_at: new Date().toISOString(),
                })
                .eq("user_id", profile.id);

            if (!attendanceError && !presenceError) {
                setUserStatus("off_duty");
                setSessionStart(null);
                setIsOnDuty(false);
                localStorage.removeItem("staff_active_session");
                toast.success("Mission ended - OFF DUTY");
            }
        }
    };

    // Load user profile and initial data
    useEffect(() => {
        if (!user) return;

        const loadProfile = async () => {
            const { data: profileData, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Profile load error:", error);
                return;
            }

            setProfile(profileData);
            setIsInitialLoading(false);
        };

        loadProfile();
    }, [user]);

    // Load data when profile is available
    useEffect(() => {
        if (!profile) return;

        // Instant load
        fetchData();
        checkTodayAttendance();

        // Optimized 15-second polling
        const interval = setInterval(fetchData, 15000);

        return () => {
            clearInterval(interval);
        };
    }, [profile?.id, fetchData]);


    // Session timer effect
    useEffect(() => {
        if (sessionStart) {
            const interval = setInterval(() => {
                setSessionDuration(Math.floor((new Date().getTime() - sessionStart.getTime()) / 1000));
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [sessionStart]);

    // Filter tasks based on active tab
    const filteredTasks = useMemo(() => {
        const taskList = tasks.map((task) => ({
            ...task,
            priority: task.priority,
            category:
                task.priority === "urgent"
                    ? "URGENT"
                    : task.priority === "high"
                      ? "HIGH"
                      : "MEDIUM",
            description: task.description || "No description provided",
            status: task.status === "pending" ? "PENDING" : "IN PROGRESS",
            isDaily: task.is_daily_task || task.priority === "urgent",
            is_daily_task: task.is_daily_task,
            dueDate: task.due_date
                ? format(new Date(task.due_date), "MMM d, h:mm a")
                : null,
            due_date: task.due_date,
        }));

        if (activeTab === "ALL") return taskList;
        if (activeTab === "URGENT")
            return taskList.filter((task) => task.priority === "urgent");
        if (activeTab === "DAILY")
            return taskList.filter((task) => task.is_daily_task === true);
        return taskList;
    }, [tasks, activeTab]);

    const handleAcknowledge = (id: number | string) => {
        if (!acknowledgedMessages.includes(id)) {
            setAcknowledgedMessages([...acknowledgedMessages, id]);
        }
    };

    const removeCompletedTask = async (taskId: string) => {
        try {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("id", taskId);
                
            if (error) {
                console.error("Delete task error:", error);
                toast.error("Failed to delete task: " + error.message);
                return;
            }
            
            toast.success("Task permanently deleted");
            fetchData();
        } catch (error) {
            console.error("Delete task exception:", error);
            toast.error("Something went wrong deleting task");
        }
    };

    const clearAllCompletedTasks = async () => {
        if (!confirm("Delete all completed tasks permanently? This action cannot be undone.")) return;
        
        try {
            const { error } = await supabase
                .from("tasks")
                .delete()
                .eq("assigned_to", profile?.id)
                .eq("status", "completed");
                
            if (error) {
                console.error("Clear all completed error:", error);
                toast.error("Failed to delete completed tasks: " + error.message);
                return;
            }
            
            toast.success("All completed tasks permanently deleted");
            fetchData();
        } catch (error) {
            console.error("Clear all completed exception:", error);
            toast.error("Something went wrong deleting completed tasks");
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push("/");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to logout");
        }
    };

    const today = format(new Date(), "yyyy-MM-dd");
    const urgentToday = useMemo(
        () =>
            tasks.filter(
                (t) =>
                    t.priority === "urgent" &&
                    t.due_date === today &&
                    ["pending", "in_progress"].includes(t.status || ""),
            ),
        [tasks, today],
    );

    // Calculate efficiency
    const efficiency = useMemo(() => {
        const completedToday = tasks.filter(
            (t) => t.status === "completed",
        ).length;
        const totalTasks = tasks.length;
        return totalTasks > 0
            ? Math.round((completedToday / totalTasks) * 100)
            : 0;
    }, [tasks]);

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-[#2F1E73] border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F7FE] text-slate-800 font-sans selection:bg-orange-100 pt-[calc(env(safe-area-inset-top)+4rem)] md:pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8 max-w-[100vw] overflow-x-hidden">
            {/* Mobile-Only Header Status Bar - Hidden (MobileBottomNav handles this) */}
            <div className="hidden md:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8">
                        <img
                            src="/images/usthadacademylogo2.svg"
                            alt="UA Logo"
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#2F1E73]">
                        Staff Hub
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-2 h-2 rounded-full ${isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                        ></div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">
                            {isOnDuty ? "On Duty" : "Off Duty"}
                        </span>
                    </div>
                    {/* Mobile Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Desktop Header - Hidden on Mobile */}
            <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        {/* Logo with new image */}
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
                        <div className="hidden md:flex items-center px-3 py-1.5 bg-[#2F1E73]/10 rounded-lg">
                            <span className="text-sm font-semibold text-[#2F1E73] uppercase tracking-wider">
                                STAFF HUB | COMMAND CENTER
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={handleMissionToggle}
                        className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
                            isOnDuty
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                    >
                        <div
                            className={`w-2 h-2 rounded-full ${isOnDuty ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
                        ></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isOnDuty ? "On Duty" : "On Break"}
                        </span>
                    </button>

                    <button
                        onClick={fetchData}
                        disabled={isRefreshing}
                        className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-full transition-all duration-300 shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Refresh
                    </button>

                    {/* Sales Report Button - Only for Sales Staff without Manager Access */}
                    {(profile?.role === "sales" || profile?.is_sales_staff) && !profile?.is_manager && (
                        <a
                            href="/sales"
                            className="relative group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                backgroundColor: brand.navy,
                                boxShadow: `0 4px 14px ${brand.navy}40`,
                            }}
                        >
                            <BarChart3 className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                Sales Page
                            </span>
                        </a>
                    )}

                    {/* Accounts Button - Only for Accounts Staff without Manager Access */}
                    {profile?.role === "accounts" && !profile?.is_manager && (
                        <a
                            href="/accounts"
                            className="relative group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                backgroundColor: "#ff4d00",
                                boxShadow: `0 4px 14px rgba(255, 77, 0, 0.4)`,
                            }}
                        >
                            <Wallet className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                Accounts
                            </span>
                        </a>
                    )}

                    {/* Manage Button - Only for Staff with Manager Access */}
                    {profile?.is_manager && (
                        <a
                            href="/manager"
                            className="relative group flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                backgroundColor: brand.orange,
                                boxShadow: `0 4px 14px ${brand.orange}40`,
                            }}
                        >
                            <Users className="w-4 h-4 text-white" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                Manage
                            </span>
                        </a>
                    )}

                    <button
                        onClick={handleLogout}
                        className="hidden md:flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 hover:border-red-300 hover:bg-red-100 rounded-full transition-all duration-300 shadow-sm text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-800"
                        title="Logout"
                    >
                        <LogOut className="w-3 h-3" />
                        Logout
                    </button>

                    <div
                        style={{ backgroundColor: brand.navy }}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                    >
                        {profile?.full_name?.[0] || profile?.email?.[0] || "U"}
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-8 max-w-[1700px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
                {/* Top Greeting Banner - Mobile Optimized */}
                <div className="col-span-1 md:col-span-12">
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative overflow-hidden">
                        <div className="flex items-center gap-3 md:gap-6 relative z-10">
                            <div className="w-12 h-12 md:w-20 md:h-20 bg-orange-50 rounded-xl md:rounded-[2rem] flex items-center justify-center shadow-inner shrink-0">
                                {React.cloneElement(getGreeting().icon as React.ReactElement, { className: "w-5 h-5 md:w-8 md:h-8 text-orange-400" })}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg md:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                                    {getGreeting().text},{" "}
                                    <span style={{ color: brand.navy }}>
                                        {profile?.full_name
                                            ?.split(" ")[0]
                                            ?.toUpperCase() || "USER"}
                                    </span>
                                </h2>
                                <p className="hidden md:flex text-slate-400 font-bold text-sm mt-2 items-center gap-2 italic">
                                    &quot;Your focus is the academy&apos;s greatest asset
                                    today.&quot;{" "}
                                    <Sparkles className="w-4 h-4 text-orange-400" />
                                </p>
                            </div>
                        </div>

                        {/* Mobile Stats Row - Horizontal Cards */}
                        <div className="flex md:hidden items-center gap-2 relative z-10">
                            <div className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100 text-center">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                    Score
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                                    <span className="text-sm font-black text-slate-800">
                                        {efficiency}%
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 bg-slate-50 rounded-xl p-2 border border-slate-100 text-center">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                    Rank
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                    <Award className="w-3 h-3 text-orange-500" />
                                    <span className="text-sm font-black text-slate-800">
                                        Top 5
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    setVibe(
                                        vibe === "Focused"
                                            ? "Unstoppable"
                                            : "Focused",
                                    )
                                }
                                className="flex-1 bg-orange-50 rounded-xl p-2 border border-orange-100 text-center"
                            >
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                    Vibe
                                </p>
                                <p className="text-xs font-black text-orange-500 flex items-center justify-center gap-1">
                                    <Smile className="w-3 h-3" /> {vibe}
                                </p>
                            </button>
                        </div>

                        <div className="hidden xl:flex items-center gap-8 relative z-10 px-8 border-x border-slate-100">
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
                                    Weekly Score
                                </p>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xl font-black text-slate-800">
                                        {efficiency}%
                                    </span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">
                                    Rank
                                </p>
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-orange-500" />
                                    <span className="text-xl font-black text-slate-800">
                                        Top 5
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-4 bg-slate-50 p-3 rounded-3xl border border-slate-100 relative z-10">
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
                                <p className="text-xs font-black text-orange-500 flex items-center gap-1 uppercase">
                                    <Smile className="w-3 h-3" /> {vibe}
                                </p>
                            </button>
                        </div>

                        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-orange-50/50 to-transparent pointer-events-none"></div>
                    </div>
                </div>

                {/* Mobile: CEO Broadcast at Top */}
                <div className="col-span-12 lg:hidden order-first">
                    <div
                        style={{ backgroundColor: brand.navy }}
                        className="rounded-2xl md:rounded-[2.5rem] p-4 md:p-7 text-white shadow-2xl relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Megaphone className="w-4 h-4 text-orange-400 animate-bounce" />
                                    <span className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                                        CEO Broadcast
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                        </span>
                                    </span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></div>
                            </div>
                            <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin">
                                {notifications.slice(0, 3).map((msg) => {
                                    const isAck = acknowledgedMessages.includes(
                                        msg.id,
                                    );
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`p-3 rounded-xl border transition-all ${msg.type === "alert" ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/10"}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span
                                                    className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${msg.type === "alert" ? "bg-orange-500 text-white" : "bg-indigo-400/20 text-indigo-200"}`}
                                                >
                                                    {msg.type}
                                                </span>
                                                <span className="text-[8px] text-white/40 font-bold">
                                                    {format(
                                                        new Date(
                                                            msg.created_at,
                                                        ),
                                                        "h ago",
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-medium leading-relaxed text-white/90 mb-2">
                                                {msg.message}
                                            </p>

                                            <button
                                                disabled={isAck}
                                                onClick={() =>
                                                    handleAcknowledge(msg.id)
                                                }
                                                className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border ${
                                                    isAck
                                                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                                                        : "bg-white/10 border-white/10 hover:bg-white/20 text-white"
                                                }`}
                                            >
                                                {isAck ? (
                                                    <>
                                                        <Check className="w-3 h-3" />{" "}
                                                        Seen
                                                    </>
                                                ) : (
                                                    "Acknowledge"
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                                {notifications.length === 0 && (
                                    <div className="text-center py-4 text-white/50 text-xs">
                                        No new broadcasts
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Column - Hidden on mobile (moved to bottom or inside Mission Control flow) */}
                <div className="col-span-12 lg:col-span-3 space-y-6 hidden lg:block">
                    <div
                        style={{ backgroundColor: brand.navy }}
                        className="rounded-[2.5rem] p-7 text-white shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-white/20 dark:border-zinc-800/30 relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <Megaphone className="w-4 h-4 text-orange-400 animate-bounce" />
                                    <span className="text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                                        CEO Broadcast
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                        </span>
                                    </span>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></div>
                            </div>
                            <div className="space-y-4">
                                {notifications.slice(0, 3).map((msg) => {
                                    const isAck = acknowledgedMessages.includes(
                                        msg.id,
                                    );
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`p-4 rounded-2xl border transition-all ${msg.type === "alert" ? "bg-orange-500/10 border-orange-500/30" : "bg-white/5 border-white/10"}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span
                                                    className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${msg.type === "alert" ? "bg-orange-500 text-white" : "bg-indigo-400/20 text-indigo-200"}`}
                                                >
                                                    {msg.type}
                                                </span>
                                                <span className="text-[8px] text-white/40 font-bold">
                                                    {format(
                                                        new Date(
                                                            msg.created_at,
                                                        ),
                                                        "h ago",
                                                    )}
                                                </span>
                                            </div>
                                            <p className="text-[11px] font-medium leading-relaxed text-white/90 mb-3">
                                                {msg.message}
                                            </p>

                                            <button
                                                disabled={isAck}
                                                onClick={() =>
                                                    handleAcknowledge(msg.id)
                                                }
                                                className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border ${
                                                    isAck
                                                        ? "bg-emerald-50/20 border-emerald-50/30 text-emerald-400"
                                                        : "bg-white/10 border-white/10 hover:bg-white/20 text-white"
                                                }`}
                                            >
                                                {isAck ? (
                                                    <>
                                                        <Check className="w-3 h-3" />{" "}
                                                        Seen
                                                    </>
                                                ) : (
                                                    "Acknowledge"
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* New Share Idea Card */}
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.02)] border border-white/60 dark:border-zinc-800/50 group hover:border-orange-200 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-50 rounded-xl">
                                <Lightbulb className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                                    Innovation Lab
                                </span>
                                <h4 className="text-xs font-black text-slate-800 uppercase">
                                    Share a Spark
                                </h4>
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mb-5 leading-relaxed font-medium">
                            Have a good idea for the Academy? Share it directly
                            with CEO.
                        </p>
                        <button
                            onClick={() => setActiveModal("idea")}
                            style={{ color: brand.orange }}
                            className="w-full py-3 bg-orange-50 hover:bg-orange-100 rounded-2xl font-black text-[9px] tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                        >
                            Submit Idea <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.02)] border border-white/60 dark:border-zinc-800/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <History className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                                    Request Tracker
                                </span>
                            </div>
                            <button
                                onClick={async () => {
                                    // Permanently delete all non-pending requests from database
                                    const nonPendingRequests = requests.filter(req => req.status !== 'pending');
                                    
                                    if (nonPendingRequests.length === 0) {
                                        toast.info("No non-pending requests to clear");
                                        return;
                                    }
                                    
                                    try {
                                        // Use the new function to clear staff's own non-pending requests
                                        const { data, error } = await supabase.rpc('clear_my_requests');
                                            
                                        if (error) {
                                            console.error('Clear requests error:', error);
                                            toast.error("Failed to clear requests: " + error.message);
                                        } else {
                                            // Update local state to remove cleared requests
                                            setRequests(prev => prev.filter(req => req.status === 'pending'));
                                            const clearedCount = data || nonPendingRequests.length;
                                            toast.success(`Cleared ${clearedCount} non-pending requests permanently`);
                                        }
                                    } catch (error) {
                                        console.error('Clear requests error:', error);
                                        toast.error("Failed to clear requests");
                                    }
                                }}
                                className="text-xs text-red-500 hover:text-red-700 font-semibold uppercase tracking-wider hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                            >
                                Clear Requests
                            </button>
                        </div>
                        <div className="space-y-1">
                            <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
                                {requests.filter(req => req.status === 'pending' || req.status === 'rejected' || req.status === 'approved').map((req) => {
                                    const { title, detail } = formatTrackerRequest(req);
                                    
                                    return (
                                        <div
                                            key={req.id}
                                            className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-zinc-800/40 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 px-2 transition-all"
                                        >
                                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center shadow-sm shrink-0 border border-slate-100 dark:border-zinc-700/50">
                                                    <Calendar className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 tracking-wide">
                                                        {title}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-1 truncate tracking-tight uppercase">
                                                        {detail ? `${detail} • ` : ""}{format(new Date(req.created_at), "MMM d, h:mm a")}
                                                    </p>
                                                </div>
                                            </div>
                                            <span
                                                className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ml-3 ${
                                                    req.status === "approved"
                                                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                                                        : req.status === "pending"
                                                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                                                          : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                                                }`}
                                            >
                                                {req.status?.toUpperCase() || "PENDING"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            {requests.filter(req => req.status === 'pending' || req.status === 'rejected' || req.status === 'approved').length === 0 && (
                                <div className="text-center py-6">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">No requests found</p>
                                    <p className="text-[8px] text-slate-500 mt-2">Submit a request to see it here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Middle Column - MISSION CONTROL */}
                <div className="col-span-12 lg:col-span-6 space-y-4 md:space-y-6 order-2 lg:order-none">
                    <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-4 md:p-0 border border-slate-100 md:border-0 md:bg-transparent shadow-sm md:shadow-none">
                        <div className="flex flex-col gap-3 md:px-2">
                            <div>
                                <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-2 md:gap-3">
                                    Mission Control{" "}
                                    <Target className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                                </h2>
                                <p className="text-xs text-slate-400 font-medium hidden md:block">
                                    Your primary objectives for this shift
                                </p>
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
                                                    ? brand.navy
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

                        {showCompleted && (
                            <div className="flex justify-end mt-3 md:mt-4 md:mb-4">
                                <button
                                    onClick={clearAllCompletedTasks}
                                    className="px-3 py-2 md:py-1 text-[8px] font-black uppercase bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded transition-all border-none min-h-[36px] md:min-h-0"
                                >
                                    Delete All Completed
                                </button>
                            </div>
                        )}

                        {/* Mobile: Full-width card with task content */}
                        <div className="mt-4 md:mt-0 space-y-3 md:space-y-4">
                        {(showCompleted ? completedTasks : filteredTasks).length === 0 ? (
                            <div className="text-center py-8 md:py-12">
                                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-100 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-3 md:mb-4">
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
                                        ? "Tasks you complete will appear here"
                                        : "All caught up! No tasks assigned currently."}
                                </p>
                            </div>
                        ) : (
                            (showCompleted ? completedTasks : filteredTasks).map((task) => (
                            <div
                                key={task.id}
                                className={`bg-white dark:bg-zinc-900 rounded-2xl md:rounded-[2.5rem] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md border border-white/60 dark:border-zinc-800/50 overflow-hidden ${
                                    showCompleted 
                                        ? "border-l-[4px] border-l-emerald-500" 
                                        : task.priority === "urgent" 
                                            ? "border-l-[4px] border-l-rose-500" 
                                            : task.priority === "high" 
                                                ? "border-l-[4px] border-l-amber-500" 
                                                : task.priority === "medium" 
                                                    ? "border-l-[4px] border-l-indigo-600 dark:border-l-indigo-500" 
                                                    : "border-l-[4px] border-l-slate-300 dark:border-l-zinc-700"
                                } ${
                                    expandedTask && expandedTask === task.id
                                        ? "shadow-md ring-1 ring-orange-500/20"
                                        : "shadow-[0_12px_40px_rgba(0,0,0,0.02)]"
                                }`}
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
                                    <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
                                        <div
                                            className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center relative shrink-0 ${
                                                showCompleted
                                                    ? "bg-emerald-50 text-emerald-500"
                                                   : (task.priority === "urgent" || (task as any).category === "URGENT")
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
                                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase border ${
                                                        showCompleted
                                                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20"
                                                            : task.priority === "urgent"
                                                                ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/20"
                                                                : "bg-slate-50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-400 border-slate-100 dark:border-zinc-800/30"
                                                    }`}
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
                                            <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-zinc-100 leading-tight">
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
                                            {taskCreators[task.created_by] && (
                                                <div className="flex items-center gap-1.5 mt-2 text-slate-600 dark:text-zinc-400 text-[10px] font-bold tracking-wider uppercase">
                                                    <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                                                    <span>
                                                        Assigned by: <span className="text-slate-850 dark:text-zinc-250 font-extrabold">{
                                                            taskCreators[task.created_by].role === 'ceo' 
                                                                ? 'CEO' 
                                                                : (taskCreators[task.created_by].is_manager || taskCreators[task.created_by].role === 'manager')
                                                                    ? 'Manager'
                                                                    : taskCreators[task.created_by].full_name || 'System'
                                                        }</span>
                                                    </span>
                                                </div>
                                            )}                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-3">
                                        {!showCompleted ? (
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    if (typeof window !== "undefined" && (window as any).confetti) {
                                                        (window as any).confetti();
                                                    }
                                                    toast.success("Task completed!");
                                                    
                                                    try {
                                                        const { error } = await supabase
                                                            .from("tasks")
                                                            .update({ 
                                                                status: "completed",
                                                                updated_at: new Date().toISOString() 
                                                            })
                                                            .eq("id", task.id);
                                                            
                                                        if (error) {
                                                            console.error('Task update error:', error);
                                                            toast.error("Failed to complete task in database");
                                                            return;
                                                        }
                                                        
                                                        setTasks(prev => prev.filter(t => t.id !== task.id));
                                                        setCompletedTasks(prev => [...prev, { ...task, status: "completed" }]);
                                                    } catch (err) {
                                                        console.error('Task complete error:', err);
                                                    }
                                                }}
                                                className="group/btn p-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-full transition-all shrink-0"
                                                title="Complete Task"
                                            >
                                                <Circle className="w-5 h-5 text-slate-300 dark:text-zinc-650 group-hover/btn:text-emerald-500 group-hover/btn:scale-110 transition-all duration-200" />
                                            </button>
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        )}
                                        <ChevronDown
                                            className={`w-5 h-5 text-slate-350 transition-transform ${expandedTask && expandedTask === task.id ? "rotate-180 text-orange-500" : ""}`}
                                        />
                                    </div>
                                </div>
                                {expandedTask && expandedTask === task.id && (
                                    <div className="px-7 pb-7 space-y-5">
                                        <div className="p-5 bg-slate-50 rounded-3xl italic text-sm text-slate-600 border border-slate-100 flex items-start gap-3">
                                            <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                            &quot;{task.description}&quot;
                                        </div>
                                        <div className="flex gap-3">
                                            {showCompleted ? (
                                                <>
                                                    <button
                                                        onClick={() => removeCompletedTask(task.id)}
                                                        className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" />{" "}
                                                        Delete Permanently
                                                    </button>
                                                    {(task as any).ceo_reviewed && (
                                                        <div className="px-3 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[9px] font-black uppercase border border-blue-200 flex items-center gap-2">
                                                            <Check className="w-3 h-3" />
                                                            CEO Reviewed
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        console.log('Starting task completion for:', task.id);
                                                        triggerConfetti();
                                                        
                                                        try {
                                                            // Update task status to completed
                                                            const { error, data } = await supabase
                                                                .from("tasks")
                                                                .update({
                                                                    status: "completed",
                                                                    updated_at: new Date().toISOString()
                                                                })
                                                                .eq("id", task.id)
                                                                .select();
                                                            
                                                            if (error) {
                                                                console.error('Task completion error:', error);
                                                                toast.error("Failed to complete task: " + error.message);
                                                                return;
                                                            }
                                                            
                                                            console.log('Task completion successful:', data);
                                                            
                                                            // Remove from active tasks in local state
                                                            setTasks((prev) =>
                                                                prev.filter(
                                                                    (t) =>
                                                                        t.id !==
                                                                        task.id,
                                                                ),
                                                            );
                                                            
                                                            // Add to completed tasks immediately
                                                            setCompletedTasks((prev) => [
                                                                ...prev,
                                                                { ...task, status: "completed" },
                                                            ]);
                                                            
                                                            toast.success(
                                                                "Task completed! Added to completed section.",
                                                            );
                                                        } catch (err) {
                                                            console.error('Task completion exception:', err);
                                                            toast.error("Something went wrong completing the task");
                                                        }
                                                    }}
                                                    className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />{" "}
                                                    Completed
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                        )}
                        </div>
                    </div>
                </div>

                {/* Mobile: Stacked Request Tracker & Action Portal (beneath Mission Control) */}
                <div id="mobile-request-tracker" className="col-span-12 lg:hidden order-3 space-y-4">
                    {/* Mobile Request Tracker */}
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-white/60 dark:border-zinc-800/60">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                                    Request Tracker
                                </span>
                            </div>
                            <button
                                onClick={async () => {
                                    const nonPendingRequests = requests.filter(req => req.status !== 'pending');
                                    if (nonPendingRequests.length === 0) {
                                        toast.info("No non-pending requests to clear");
                                        return;
                                    }
                                    try {
                                        const { data, error } = await supabase.rpc('clear_my_requests');
                                        if (error) {
                                            toast.error("Failed to clear requests: " + error.message);
                                        } else {
                                            setRequests(prev => prev.filter(req => req.status === 'pending'));
                                            toast.success(`Cleared ${data || nonPendingRequests.length} non-pending requests`);
                                        }
                                    } catch (error) {
                                        toast.error("Failed to clear requests");
                                    }
                                }}
                                className="text-[10px] text-red-500 hover:text-red-700 font-semibold uppercase tracking-wider"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                            {requests.filter(req => req.status === 'pending' || req.status === 'rejected' || req.status === 'approved').slice(0, 5).map((req) => {
                                const { title, detail } = formatTrackerRequest(req);
                                
                                return (
                                    <div
                                        key={req.id}
                                        className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-zinc-800/40 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-zinc-950/20 px-1 transition-all"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center shadow-sm shrink-0 border border-slate-100 dark:border-zinc-700/50">
                                                <Calendar className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 tracking-wide">
                                                    {title}
                                                </p>
                                                <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium mt-1 truncate tracking-tight uppercase">
                                                    {detail ? `${detail} • ` : ""}{format(new Date(req.created_at), "MMM d, h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ml-3 ${
                                                req.status === "approved"
                                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30"
                                                    : req.status === "pending"
                                                      ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"
                                                      : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30"
                                            }`}
                                        >
                                            {req.status?.toUpperCase() || "PENDING"}
                                        </span>
                                    </div>
                                );
                            })}
                            {requests.filter(req => req.status === 'pending' || req.status === 'rejected' || req.status === 'approved').length === 0 && (
                                <div className="text-center py-4">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">No requests found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Action Portal */}
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-white/60 dark:border-zinc-800/60">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl" style={{ backgroundColor: brand.softOrange }}>
                                <FileText className="w-4 h-4" style={{ color: brand.orange }} />
                            </div>
                            <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                                Action Portal
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: "new_request", label: "New Request", icon: Plus },
                                { id: "leave_request", label: "Leave", icon: Calendar },
                                { id: "idea", label: "Share Idea", icon: Lightbulb },
                            ].map((item, index, array) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (item.id === "new_request") {
                                            setIsRequestModalOpen(true);
                                        } else if (item.id === "leave_request") {
                                            setIsLeaveModalOpen(true);
                                        } else {
                                            setActiveModal(item.id);
                                        }
                                    }}
                                    style={{ backgroundColor: brand.navy }}
                                    className={cn(
                                        "p-4 rounded-2xl flex items-center justify-center gap-2 text-white hover:opacity-90 transition-all shadow-lg shadow-indigo-100/50 min-h-[60px]",
                                        index === array.length - 1 && index % 2 === 0 ? "col-span-2" : ""
                                    )}
                                >
                                    <item.icon className="w-4 h-4 text-orange-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile: COMMUNITY & NOTICE BOARD */}
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)] border border-white/60 dark:border-zinc-800/50">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20">
                                <Megaphone className="w-4 h-4 text-orange-500 animate-pulse" />
                            </div>
                            <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                                Community Board
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                            {[
                                {
                                    icon: "🎯",
                                    title: "General Staff Meeting",
                                    time: "Today at 4:00 PM",
                                    description: "Reviewing weekly summits & new tactical objectives."
                                },
                                {
                                    icon: "💡",
                                    title: "Submit Monthly Sparks",
                                    time: "Due Friday",
                                    description: "Pitch your ideas to the CEO Command OS innovation lab."
                                }
                            ].map((notice, idx) => (
                                <div 
                                    key={idx}
                                    className="p-4 bg-slate-50/50 dark:bg-zinc-950/30 rounded-2xl border border-slate-100/50 dark:border-zinc-800/30 hover:border-orange-500/20 hover:bg-slate-50 dark:hover:bg-zinc-950/50 transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{notice.icon}</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                            {notice.title}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold mt-1 uppercase tracking-wider">
                                        {notice.time}
                                    </p>
                                    <p className="text-[10px] text-slate-550 dark:text-zinc-400 mt-1 leading-relaxed">
                                        {notice.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-3 space-y-6 hidden lg:block">
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.02)] border border-white/60 dark:border-zinc-800/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-8">
                            <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: brand.softOrange }}
                            >
                                <FileText
                                    className="w-4 h-4"
                                    style={{ color: brand.orange }}
                                />
                            </div>
                            <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                                Action Portal
                            </span>
                        </div>
                        <div className="space-y-3">
                            {[
                                {
                                    id: "new_request",
                                    label: "New Request",
                                    icon: Plus,
                                },
                                {
                                    id: "leave_request",
                                    label: "Leave Request",
                                    icon: Calendar,
                                },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                    if (item.id === "new_request") {
                                        setIsRequestModalOpen(true);
                                    } else if (item.id === "leave_request") {
                                        setIsLeaveModalOpen(true);
                                    } else {
                                        setActiveModal(item.id);
                                    }
                                }}
                                    style={{ backgroundColor: brand.navy }}
                                    className="w-full p-4 rounded-2xl flex items-center justify-between text-white hover:opacity-90 transition-all group shadow-lg shadow-indigo-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 text-orange-400" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">
                                            {item.label}
                                        </span>
                                    </div>
                                    <Plus className="w-4 h-4 opacity-40 group-hover:rotate-90 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Desktop: COMMUNITY & NOTICE BOARD */}
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.02)] border border-white/60 dark:border-zinc-800/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                                <Megaphone className="w-4 h-4 text-orange-500 animate-pulse" />
                            </div>
                            <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                                Community Board
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {[
                                {
                                    icon: "🎯",
                                    title: "General Staff Meeting",
                                    time: "Today at 4:00 PM",
                                    description: "Reviewing weekly summits & new tactical objectives."
                                },
                                {
                                    icon: "💡",
                                    title: "Submit Monthly Sparks",
                                    time: "Due Friday",
                                    description: "Pitch your ideas to the CEO Command OS innovation lab."
                                }
                            ].map((notice, idx) => (
                                <div 
                                    key={idx}
                                    className="p-4 bg-slate-50/50 dark:bg-zinc-950/30 rounded-2xl border border-slate-100/50 dark:border-zinc-800/30 hover:border-orange-500/20 hover:bg-slate-50 dark:hover:bg-zinc-950/50 transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{notice.icon}</span>
                                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                            {notice.title}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold mt-1 uppercase tracking-wider">
                                        {notice.time}
                                    </p>
                                    <p className="text-[10px] text-slate-550 dark:text-zinc-400 mt-1 leading-relaxed">
                                        {notice.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Leave Request Modal */}
            <LeaveRequestModal
                isOpen={isLeaveModalOpen}
                onClose={() => setIsLeaveModalOpen(false)}
                onSubmitSuccess={() => fetchData()}
                setInteracting={setIsUserInteracting}
            />

            {/* General Request Modal */}
            <RequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                onSubmitSuccess={() => fetchData()}
                setInteracting={setIsUserInteracting}
            />

            {/* Legacy Modals */}
            {activeModal && (
                <Modal
                    title={
                        activeModal === "idea"
                            ? "Innovation Spark"
                            : activeModal.charAt(0).toUpperCase() +
                              activeModal.slice(1) +
                              " Request"
                    }
                    type={activeModal}
                    onClose={() => setActiveModal(null)}
                    onSubmitSuccess={() => fetchData()}
                    setInteracting={setIsUserInteracting}
                >
                    {activeModal === "idea" && (
                        <form className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    Concept Title
                                </label>
                                <input
                                    name="idea_title"
                                    placeholder="A catchy name for your idea"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    The &quot;Why&quot;
                                </label>
                                <textarea
                                    name="idea_description"
                                    placeholder="Explain how this benefits the academy..."
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold min-h-[120px]"
                                    required
                                />
                            </div>
                        </form>
                    )}
                    {activeModal === "leave" && (
                        <form className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    Leave Category
                                </label>
                                <select 
                                    name="category"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                                >
                                    <option value="">Select category...</option>
                                    <option value="casual">Casual Leave</option>
                                    <option value="medical">Medical Leave</option>
                                    <option value="duty">Duty Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    Reason
                                </label>
                                <textarea
                                    name="reason"
                                    placeholder="Describe reason for leave..."
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold min-h-[100px]"
                                />
                            </div>
                        </form>
                    )}
                    {activeModal === "permission" && (
                        <form className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    MISSION OBJECTIVE
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    placeholder="e.g., Budget Approval for Marketing, Access to Server, New Hardware Purchase"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    PRIORITY LEVEL
                                </label>
                                <select 
                                    name="priority"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                                >
                                    <option value="low">Low: Non-urgent, review at leisure</option>
                                    <option value="standard">Standard: General operations</option>
                                    <option value="critical">Critical: Requires immediate action</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    IMPACT / JUSTIFICATION
                                </label>
                                <textarea
                                    name="justification"
                                    placeholder="Briefly describe the benefit or necessity..."
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold min-h-[100px]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    COST / RESOURCE (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="cost"
                                    placeholder="e.g., $500, 3 Hours, Team of 2"
                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold"
                                />
                            </div>
                        </form>
                    )}
                    {activeModal === "work" && (
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                    Adjustment Type
                                </label>
                                <select className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-bold">
                                    <option>Extra Hours</option>
                                    <option>Shift Swap</option>
                                    <option>Remote Working</option>
                                </select>
                            </div>
                        </div>
                    )}
                </Modal>
            )}



        </div>
    );
}
