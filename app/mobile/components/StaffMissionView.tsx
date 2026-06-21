"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { 
    useTasks, 
    useRequests, 
    useMeetings 
} from "@/hooks/use-dashboard-data";
import { BottomSheet } from "./BottomSheet";
import { 
    Clock, 
    Power, 
    AlertTriangle, 
    CheckCircle2, 
    ChevronRight, 
    Calendar, 
    Bell, 
    FileText, 
    UserCheck, 
    Zap, 
    Plus, 
    Timer, 
    Send, 
    Sparkles, 
    Sun, 
    Moon, 
    Coffee, 
    Megaphone,
    BookOpen,
    ListTodo,
    Check,
    Lightbulb,
    X,
    Loader2,
    Sliders,
    Award,
    Activity,
    Circle,
    ArrowUpRight,
    LogOut
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface StaffMissionViewProps {
    activeTab: "mission" | "requests" | "directives" | "financial-intelligence" | "sales-intelligence" | "community";
}

export function StaffMissionView({ activeTab }: StaffMissionViewProps) {
    const { profile } = useAuth();
    const queryClient = useQueryClient();

    const triggerHaptic = (type: "light" | "success" | "warning" = "light") => {
        if (typeof window !== "undefined" && navigator.vibrate) {
            switch (type) {
                case "success":
                    navigator.vibrate([20, 30, 20]);
                    break;
                case "warning":
                    navigator.vibrate([40, 40, 40]);
                    break;
                case "light":
                default:
                    navigator.vibrate(12);
                    break;
            }
        }
    };

    // ----------------------------------------------------
    // DATA HOOKS
    // ----------------------------------------------------
    const { activeTasks = [], completedTasks = [], isLoading: isLoadingTasks } = useTasks();
    const { data: meetings = [], isLoading: isLoadingMeetings } = useMeetings();
    const { data: rawRequests = [], isLoading: isLoadingRequests } = useRequests();

    // ----------------------------------------------------
    // COMPONENT LOCAL STATES
    // ----------------------------------------------------
    const [currentTime, setCurrentTime] = useState("");
    const [vibeGreeting, setVibeGreeting] = useState({ text: "Good Day", icon: <Sun className="w-6 h-6 text-orange-400" /> });
    
    // Duty Control States
    const [userStatus, setUserStatus] = useState<"off_duty" | "on_mission">("off_duty");
    const [sessionStart, setSessionStart] = useState<Date | null>(null);
    const [sessionElapsed, setSessionElapsed] = useState("00:00:00");
    const [clockingInProgress, setClockingInProgress] = useState(false);

    // Slide-to-Activate mechanics states
    const [sliderDragOffset, setSliderDragOffset] = useState(0);
    const [isSliderDragging, setIsSliderDragging] = useState(false);
    const sliderTrackRef = React.useRef<HTMLDivElement>(null);

    // Captured strategic thoughts states
    const [capturedThoughts, setCapturedThoughts] = useState<any[]>([]);
    const [fetchingThoughts, setFetchingThoughts] = useState(false);

    // Feeds states
    const [broadcasts, setBroadcasts] = useState<any[]>([]);
    const [activeBroadcastIndex, setActiveBroadcastIndex] = useState(0);
    const [preMeetingTasksCounts, setPreMeetingTasksCounts] = useState<Record<string, number>>({});

    // Task and Modals States
    const [taskFilter, setTaskFilter] = useState<"ALL" | "URGENT" | "DAILY" | "COMPLETED">("ALL");
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [taskProgress, setTaskProgress] = useState(0);
    const [updatingTaskProgress, setUpdatingTaskProgress] = useState(false);

    // Request desk sheets
    const [isLeaveOpen, setIsLeaveOpen] = useState(false);
    const [isPermissionOpen, setIsPermissionOpen] = useState(false);
    
    // Forms state
    const [leaveForm, setLeaveForm] = useState({ category: "casual", reason: "", start_date: "", end_date: "" });
    const [permissionForm, setPermissionForm] = useState({ subject: "", priority: "medium", justification: "", cost: "" });
    const [submittingLeave, setSubmittingLeave] = useState(false);
    const [submittingPermission, setSubmittingPermission] = useState(false);

    // Directives capture states
    const [directiveForm, setDirectiveForm] = useState({ title: "", content: "", priority: "medium" });
    const [submittingDirective, setSubmittingDirective] = useState(false);

    // ----------------------------------------------------
    // INITIALIZATION & TIMERS
    // ----------------------------------------------------
    
    // Live clock and greeting
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const seconds = now.getSeconds().toString().padStart(2, "0");
            const ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12;
            setCurrentTime(`${hours}:${minutes}:${seconds} ${ampm}`);

            // Greeting
            const hr = now.getHours();
            if (hr < 12) {
                setVibeGreeting({ text: "Good Morning", icon: <Sun className="w-6 h-6 text-orange-400" /> });
            } else if (hr < 18) {
                setVibeGreeting({ text: "Good Afternoon", icon: <Coffee className="w-6 h-6 text-amber-500" /> });
            } else {
                setVibeGreeting({ text: "Good Evening", icon: <Moon className="w-6 h-6 text-indigo-400" /> });
            }
        };

        updateClock();
        const clockInterval = setInterval(updateClock, 1000);
        return () => clearInterval(clockInterval);
    }, []);

    // Session active elapsed timer
    useEffect(() => {
        if (userStatus !== "on_mission" || !sessionStart) {
            setSessionElapsed("00:00:00");
            return;
        }

        const updateElapsed = () => {
            const diffMs = new Date().getTime() - sessionStart.getTime();
            const diffSecs = Math.floor(diffMs / 1000);
            const hrs = Math.floor(diffSecs / 3600).toString().padStart(2, "0");
            const mins = Math.floor((diffSecs % 3600) / 60).toString().padStart(2, "0");
            const secs = (diffSecs % 60).toString().padStart(2, "0");
            setSessionElapsed(`${hrs}:${mins}:${secs}`);
        };

        updateElapsed();
        const elapsedInterval = setInterval(updateElapsed, 1000);
        return () => clearInterval(elapsedInterval);
    }, [userStatus, sessionStart]);

    // Retrieve active session from Supabase on load
    useEffect(() => {
        if (!profile) return;
        
        const checkPresence = async () => {
            const { data, error } = await supabase
                .from("staff_presence")
                .select("*")
                .eq("user_id", profile.id)
                .maybeSingle();
                
            if (data && !error) {
                if (data.status === "online") {
                    setUserStatus("on_mission");
                    if (data.session_start) {
                        setSessionStart(new Date(data.session_start));
                    } else {
                        setSessionStart(new Date());
                    }
                }
            }
        };

        checkPresence();
    }, [profile]);

    // Fetch announcements broadcasts
    useEffect(() => {
        const fetchBroadcasts = async () => {
            const { data } = await supabase
                .from("broadcasts")
                .select("*")
                .gte("expires_at", new Date().toISOString())
                .order("created_at", { ascending: false });
            if (data) {
                setBroadcasts(data);
            }
        };
        fetchBroadcasts();
    }, []);

    // Auto rotate broadcasts carousel
    useEffect(() => {
        if (broadcasts.length <= 1) return;
        const rotate = setInterval(() => {
            setActiveBroadcastIndex(prev => (prev + 1) % broadcasts.length);
        }, 6000);
        return () => clearInterval(rotate);
    }, [broadcasts]);

    // Pre-meeting tasks query
    useEffect(() => {
        if (!profile || meetings.length === 0) return;

        meetings.forEach(async (meeting) => {
            const { data, error } = await supabase
                .from("tasks")
                .select("id")
                .eq("assigned_to", profile.id)
                .eq("status", "pending")
                .or(`title.ilike.%pre-meeting%,description.ilike.%summit%,description.ilike.%meeting%`);

            if (data && !error) {
                setPreMeetingTasksCounts(prev => ({
                    ...prev,
                    [meeting.id]: data.length
                }));
            }
        });
    }, [profile, meetings]);

    // Fetch captured strategic thoughts
    const fetchCapturedThoughts = useCallback(async () => {
        if (!profile) return;
        setFetchingThoughts(true);
        try {
            const { data, error } = await supabase
                .from("ideas")
                .select("*")
                .eq("created_by", profile.id)
                .order("created_at", { ascending: false });
            if (data && !error) {
                setCapturedThoughts(data);
            }
        } catch (e) {
            console.error("Failed to load captured thoughts:", e);
        } finally {
            setFetchingThoughts(false);
        }
    }, [profile]);

    useEffect(() => {
        if (profile) {
            fetchCapturedThoughts();
        }
    }, [profile, fetchCapturedThoughts]);

    // Confetti effect helper
    const playConfetti = () => {
        const colors = ["#31267D", "#FA4616", "#10B981", "#F59E0B"];
        for (let i = 0; i < 30; i++) {
            const div = document.createElement("div");
            div.style.cssText = `
                position: fixed;
                top: 40%;
                left: 50%;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 999;
                transform: translate(-50%, -50%);
            `;
            document.body.appendChild(div);
            
            const angle = Math.random() * Math.PI * 2;
            const force = 3 + Math.random() * 5;
            let x = 0;
            let y = 0;
            let opacity = 1;
            
            const animate = () => {
                x += Math.cos(angle) * force;
                y += Math.sin(angle) * force + 1.2;
                opacity -= 0.025;
                div.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
                div.style.opacity = opacity.toString();
                if (opacity > 0) {
                    requestAnimationFrame(animate);
                } else {
                    document.body.removeChild(div);
                }
            };
            requestAnimationFrame(animate);
        }
    };

    // ----------------------------------------------------
    // OPERATIONS AND MUTATIONS
    // ----------------------------------------------------
    
    // Toggle active clock-in / clock-out duty session
    const handleDutyToggle = async () => {
        if (!profile) return;
        setClockingInProgress(true);

        try {
            if (userStatus === "off_duty") {
                // Clock-in
                const clockInTime = new Date().toISOString();
                
                await supabase.from("staff_attendance").insert({
                    user_id: profile.id,
                    clock_in: clockInTime,
                    date: clockInTime.split("T")[0],
                    status: "active"
                });

                await supabase.from("staff_presence").upsert({
                    user_id: profile.id,
                    status: "online",
                    updated_at: clockInTime,
                    session_start: clockInTime
                });

                await supabase.from("notifications").insert({
                    user_id: "ceo-profile-id", // CEO default alerting identifier
                    title: "Mission Start Alert",
                    message: `${profile.full_name || profile.username} is now ACTIVE ON MISSION`,
                    type: "alert",
                    created_at: clockInTime
                });

                setUserStatus("on_mission");
                setSessionStart(new Date());
                toast.success("Duty initiated successfully. Stay focused!");
            } else {
                // Clock-out
                const clockOutTime = new Date().toISOString();
                
                await supabase.from("staff_attendance")
                    .update({ clock_out: clockOutTime, status: "completed" })
                    .eq("user_id", profile.id)
                    .eq("date", clockOutTime.split("T")[0])
                    .is("clock_out", null);

                await supabase.from("staff_presence")
                    .update({ status: "offline", updated_at: clockOutTime })
                    .eq("user_id", profile.id);

                setUserStatus("off_duty");
                setSessionStart(null);
                toast.success("Duty session terminated. Rest well!");
            }
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to switch mission status.");
        } finally {
            setClockingInProgress(false);
        }
    };

    // Slider touch and drag handles
    const handleSliderStart = (clientX: number) => {
        if (clockingInProgress) return;
        setIsSliderDragging(true);
    };

    const handleSliderMove = useCallback((clientX: number) => {
        if (!isSliderDragging || !sliderTrackRef.current) return;
        const rect = sliderTrackRef.current.getBoundingClientRect();
        const maxOffset = rect.width - 48 - 8; // Knob size: w-12 = 48px + padding
        let offset = clientX - rect.left - 24; // Center user finger on knob
        if (offset < 0) offset = 0;
        if (offset > maxOffset) offset = maxOffset;
        setSliderDragOffset(offset);

        // Buzz micro-haptic ticks during sliding
        if (typeof window !== "undefined" && navigator.vibrate) {
            if (Math.round(offset) % 35 === 0) {
                navigator.vibrate(5);
            }
        }
    }, [isSliderDragging]);

    const handleSliderEnd = useCallback(async () => {
        if (!isSliderDragging || !sliderTrackRef.current) return;
        setIsSliderDragging(false);
        const rect = sliderTrackRef.current.getBoundingClientRect();
        const maxOffset = rect.width - 48 - 8;

        // Slide activation threshold at 85%
        if (sliderDragOffset >= maxOffset * 0.85) {
            setSliderDragOffset(maxOffset);
            if (typeof window !== "undefined" && navigator.vibrate) {
                navigator.vibrate([40, 50, 40]);
            }
            await handleDutyToggle();
        }
        
        // Reset position
        setSliderDragOffset(0);
    }, [isSliderDragging, sliderDragOffset]);

    useEffect(() => {
        if (!isSliderDragging) return;

        const onMove = (e: MouseEvent) => handleSliderMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                handleSliderMove(e.touches[0].clientX);
            }
        };
        const onEnd = () => handleSliderEnd();

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onEnd);
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("touchend", onEnd);

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onEnd);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onEnd);
        };
    }, [isSliderDragging, handleSliderMove, handleSliderEnd]);

    // Open single task drawer details sheet
    const handleOpenTask = (task: any) => {
        setSelectedTask(task);
        setTaskProgress(task.progress || 0);
    };

    // Update task progress parameters
    const handleUpdateProgress = async () => {
        if (!selectedTask) return;
        setUpdatingTaskProgress(true);

        const status = taskProgress === 100 
            ? "COMPLETED" 
            : taskProgress > 0 
            ? "in_progress" 
            : "pending";

        try {
            const updatePayload: any = {
                progress: taskProgress,
                status: status,
                updated_at: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            if (taskProgress === 100) {
                updatePayload.completed_at = new Date().toISOString();
                playConfetti();
            }

            const { error } = await supabase
                .from("tasks")
                .update(updatePayload)
                .eq("id", selectedTask.id);

            if (error) throw error;

            toast.success(taskProgress === 100 ? "Task Completed! Outstanding job!" : "Progress updated successfully.");
            setSelectedTask(null);
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to update task progress.");
        } finally {
            setUpdatingTaskProgress(false);
        }
    };

    // Submit leave request drawer form
    const handleSubmitLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { category, reason, start_date, end_date } = leaveForm;
        if (!reason || !start_date || !end_date) {
            toast.error("Complete leave parameters required");
            return;
        }

        setSubmittingLeave(true);
        try {
            const start = new Date(start_date);
            const end = new Date(end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            const { error } = await supabase.from("requests").insert({
                type: "leave",
                title: "Leave Request",
                description: `${category.toUpperCase()} LEAVE: ${reason}`,
                dates: `${start_date} -> ${end_date}`,
                total_days: days,
                submitted_by: profile?.id,
                status: "pending",
                priority: "medium",
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            toast.success("Leave Request submitted successfully!");
            setIsLeaveOpen(false);
            setLeaveForm({ category: "casual", reason: "", start_date: "", end_date: "" });
            queryClient.invalidateQueries({ queryKey: ["requests"] });
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to submit leave request");
        } finally {
            setSubmittingLeave(false);
        }
    };

    // Submit permission request drawer form
    const handleSubmitPermission = async (e: React.FormEvent) => {
        e.preventDefault();
        const { subject, priority, justification, cost } = permissionForm;
        if (!subject || !justification) {
            toast.error("Subject and Justification required");
            return;
        }

        setSubmittingPermission(true);
        try {
            let details = justification;
            if (cost) details += ` | Cost allocation request: RS${cost}`;

            const { error } = await supabase.from("requests").insert({
                type: "permission",
                title: `Permission: ${subject}`,
                description: details,
                submitted_by: profile?.id,
                status: "pending",
                priority: priority as any,
                amount: cost ? parseFloat(cost) : null,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            toast.success("Permission Request submitted successfully!");
            setIsPermissionOpen(false);
            setPermissionForm({ subject: "", priority: "medium", justification: "", cost: "" });
            queryClient.invalidateQueries({ queryKey: ["requests"] });
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to submit permission request");
        } finally {
            setSubmittingPermission(false);
        }
    };

    // Directive thought capture
    const handleCaptureDirective = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!directiveForm.content.trim()) {
            toast.error("Thought content cannot be empty.");
            return;
        }

        setSubmittingDirective(true);
        try {
            const { error } = await supabase.from("ideas").insert({
                title: directiveForm.title.trim() || null,
                content: directiveForm.content.trim(),
                priority: directiveForm.priority,
                status: "directive",
                created_by: profile?.id,
                archived: false,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            playConfetti();
            toast.success("Strategic thought captured!");
            setDirectiveForm({ title: "", content: "", priority: "medium" });
            fetchCapturedThoughts();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to capture thought");
        } finally {
            setSubmittingDirective(false);
        }
    };

    // Discard directive / thought
    const handleDiscardThought = async (id: string) => {
        if (typeof window !== "undefined" && navigator.vibrate) {
            navigator.vibrate(30);
        }
        try {
            const { error } = await supabase
                .from("ideas")
                .delete()
                .eq("id", id);
            
            if (error) throw error;
            toast.success("Thought discarded successfully.");
            fetchCapturedThoughts();
        } catch (e: any) {
            console.error(e);
            toast.error(e.message || "Failed to discard thought");
        }
    };

    // Filter tasks feed
    const filteredTasks = useMemo(() => {
        if (taskFilter === "COMPLETED") {
            return completedTasks;
        }
        
        return activeTasks.filter((t: any) => {
            if (taskFilter === "URGENT") {
                return t.priority === "urgent" || t.priority === "high";
            }
            if (taskFilter === "DAILY") {
                return t.is_daily_task || t.repeat_daily;
            }
            return true; // ALL active
        });
    }, [activeTasks, completedTasks, taskFilter]);

    // ----------------------------------------------------
    // COMPONENT WORKSPACES RENDER
    // ----------------------------------------------------

    // TAB 1: MISSION CONTROL
    const renderMissionControl = () => {
        const activeAnnounce = broadcasts[activeBroadcastIndex];
        const activeBroadcasts = broadcasts.filter(b => b.target === "CEO_BROADCAST" || b.target === "ALL");

        return (
            <div className="space-y-5">
                {/* Typographic Greeting Header */}
                <div className="flex items-center justify-between mb-2 shrink-0 animate-fade-in text-zinc-900">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-zinc-900 leading-none">
                            {new Date().getHours() < 12 ? "Good Morning" : "Good Evening"}, {profile?.full_name?.split(" ")[0] || "Operative"}
                        </h1>
                        <p className="text-xs text-zinc-500 font-medium mt-1">
                            Operational Briefing - System Online
                        </p>
                    </div>
                    {/* Sleek, bordered circular profile avatar inline */}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0 select-none">
                        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#31267D] to-[#FA4616] flex items-center justify-center text-white text-xs font-black">
                            {profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "OP"}
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------ */}
                {/* MISSION TERMINAL - DUTY CONTROL CARD */}
                {/* ------------------------------------------------ */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md relative overflow-hidden animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Clock className={cn("w-4 h-4", userStatus === "on_mission" ? "text-emerald-500" : "text-zinc-400")} />
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                {userStatus === "on_mission" ? "Active Session" : "Mission Terminal"}
                            </span>
                        </div>
                        {userStatus === "on_mission" && (
                            <span className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                                <span className="text-[7.5px] font-black text-emerald-600 uppercase tracking-widest">On-Duty</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <span className="text-3xl font-extrabold text-zinc-900 leading-none tracking-tight tabular-nums">
                                {userStatus === "on_mission" ? sessionElapsed : currentTime}
                            </span>
                            <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1 tracking-wider">
                                {userStatus === "on_mission" ? "Elapsed Mission Time" : "Standard System Time"}
                            </p>
                        </div>

                        {/* Slide-to-Activate Track */}
                        <div 
                            ref={sliderTrackRef}
                            className="flex-1 h-12 bg-zinc-50 border border-zinc-100 rounded-xl relative flex items-center px-1 overflow-hidden"
                        >
                            {/* Sliding Knob */}
                            <div 
                                onMouseDown={(e) => handleSliderStart(e.clientX)}
                                onTouchStart={(e) => handleSliderStart(e.touches[0].clientX)}
                                style={{ transform: `translateX(${sliderDragOffset}px)` }}
                                className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-shadow z-20 shadow-sm",
                                    userStatus === "on_mission" ? "bg-rose-500 text-white" : "bg-[#31267D] text-white",
                                    isSliderDragging && "shadow-lg scale-95"
                                )}
                            >
                                {clockingInProgress ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : userStatus === "on_mission" ? (
                                    <LogOut className="w-4 h-4" />
                                ) : (
                                    <Zap className="w-4 h-4" />
                                )}
                            </div>

                            {/* Track Label */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-[7.5px] font-black uppercase tracking-[0.2em] text-zinc-300 ml-8">
                                    {userStatus === "on_mission" ? "Slide to Terminate" : "Slide to Activate"}
                                </span>
                            </div>

                            {/* Progress Fill */}
                            <div 
                                style={{ width: `${sliderDragOffset + 40}px` }}
                                className={cn(
                                    "absolute inset-y-0 left-0 opacity-20",
                                    userStatus === "on_mission" ? "bg-rose-500" : "bg-[#31267D]"
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Live feed for CEO broadcasts */}
                {activeBroadcasts.length > 0 && activeAnnounce && (
                    <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex items-start gap-3.5 animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/[0.02] rounded-full blur-xl pointer-events-none" />
                        <div className="p-2.5 bg-orange-50 text-[#FA4616] rounded-xl flex-shrink-0">
                            <Megaphone className="w-4.5 h-4.5 animate-pulse" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[8px] font-black uppercase text-[#FA4616] tracking-widest block">
                                Live CEO Broadcast Alert
                            </span>
                            <p className="text-xs font-bold text-zinc-800 mt-1 leading-relaxed">
                                {activeAnnounce.message}
                            </p>
                        </div>
                    </div>
                )}

                {/* ------------------------------------------------ */}
                {/* PREMIUM INLINE TASK DIRECTIVES GRID */}
                {/* ------------------------------------------------ */}
                <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-widest text-[#31267D] flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-[#FA4616]" /> Premium Directives
                        </h2>
                        
                        {/* Filters pill badges */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide select-none max-w-[60%]">
                            {(["ALL", "URGENT", "DAILY", "COMPLETED"] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { triggerHaptic(); setTaskFilter(tab); }}
                                    className={cn(
                                        "px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider shrink-0 transition-all border",
                                        taskFilter === tab
                                            ? "bg-[#31267D] text-white border-[#31267D]"
                                            : "bg-white text-zinc-500 border-zinc-200/80 hover:text-[#31267D]"
                                    )}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center border border-zinc-200/80 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-1.5 animate-pulse" />
                            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Directives Clear</p>
                        </div>
                    ) : (
                        <div className="space-y-3.5">
                            {filteredTasks.map(task => {
                                const isCompleted = task.status === "completed" || task.status === "COMPLETED";
                                
                                // Premium borders and accents
                                const priorityAccents = {
                                    urgent: "border-l-[#FA4616] bg-orange-500/[0.01]",
                                    high: "border-l-amber-500/80 bg-amber-500/[0.01]",
                                    medium: "border-l-[#31267D] bg-indigo-500/[0.01]",
                                    low: "border-l-zinc-300 bg-zinc-100/[0.01]",
                                }[task.priority?.toLowerCase() as "urgent"|"high"|"medium"|"low"] || "border-l-zinc-350";

                                return (
                                    <div 
                                        key={task.id} 
                                        onClick={() => handleOpenTask(task)}
                                        className={cn(
                                            "bg-white border border-zinc-200/80 border-l-4 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-3.5 group active:scale-98 transition-all relative overflow-hidden",
                                            priorityAccents
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1 space-y-1.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-xs font-black uppercase text-zinc-900 truncate">{task.title}</p>
                                                    {task.is_daily_task || task.repeat_daily ? (
                                                        <span className="text-[6px] font-black uppercase tracking-wider bg-indigo-50 text-[#31267D] px-1.5 py-0.5 rounded border border-indigo-100">
                                                            Daily
                                                        </span>
                                                    ) : null}
                                                    {task.priority === "urgent" && (
                                                        <span className="text-[6px] bg-orange-50 text-[#FA4616] border border-orange-100 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                                                            Urgent
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[9.5px] text-zinc-500 truncate leading-relaxed font-medium">
                                                    {task.description || "No description provided."}
                                                </p>
                                            </div>

                                            <div className="flex-shrink-0">
                                                {isCompleted ? (
                                                    <div className="w-5.5 h-5.5 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-250 flex items-center justify-center">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : (
                                                    <div className="w-5.5 h-5.5 rounded-full bg-slate-50 border border-zinc-200 flex items-center justify-center text-zinc-400">
                                                        <Circle className="w-1.5 h-1.5 fill-current animate-pulse text-zinc-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 border-t border-zinc-100 pt-3">
                                            <div className="flex items-center justify-between text-[7.5px] font-black uppercase tracking-wider text-zinc-400">
                                                <span className="flex items-center gap-1.5 font-bold">
                                                    <Timer className="w-3 h-3 text-[#FA4616]" /> 
                                                    {task.due_date 
                                                        ? `DUE: ${new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                                                        : "NO DEADLINE"
                                                    }
                                                </span>
                                                <span className="font-mono text-[#31267D] font-extrabold">{task.progress || 0}% Completed</span>
                                            </div>

                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full border border-slate-200/50">
                                                <div 
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        isCompleted 
                                                            ? "bg-emerald-500" 
                                                            : "bg-gradient-to-r from-[#31267D] via-[#4d3fa1] to-[#FA4616]"
                                                    )}
                                                    style={{ width: `${task.progress || 0}%` }}
                                                />
                                            </div>

                                            {/* Creator/Assigner Identification */}
                                            <div className="flex items-center justify-between gap-1.5 pt-0.5 flex-wrap">
                                                <div className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-450 uppercase tracking-wider">
                                                    <span>Assigned by:</span>
                                                    <span className="text-[#31267D] font-black">{task.creator?.full_name || "CEO"}</span>
                                                    <span className="bg-slate-50 border border-slate-200/80 text-zinc-500 px-1 py-0.2 rounded text-[6px] font-black tracking-normal">
                                                        {task.creator?.role === "ceo" ? "CEO" : "Manager"}
                                                    </span>
                                                </div>
                                                {isCompleted && (task.reviewed_at || task.ceo_reviewed) && (
                                                    <span className="inline-flex items-center gap-1 text-[7.5px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                                                        <Check className="w-2.5 h-2.5 text-emerald-500" />
                                                        {(task.reviewed_by_info || "Management").toUpperCase()} REVIEWED OK
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Summit Meetings List Workspace */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[#31267D] flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#FA4616]" /> Operational Summits
                    </h2>

                    {meetings.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic text-center py-6">No summits scheduled in current weekly window.</p>
                    ) : (
                        <div className="space-y-3">
                            {meetings.map(meeting => {
                                const prepCount = preMeetingTasksCounts[meeting.id] || 0;
                                return (
                                    <div key={meeting.id} className="bg-white border border-zinc-200/80 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3 relative overflow-hidden">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-black uppercase text-zinc-900 truncate">{meeting.title}</p>
                                                <p className="text-[9px] text-zinc-400 font-bold mt-1">
                                                    | {new Date(meeting.scheduled_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(meeting.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {meeting.meeting_link && (
                                                <a 
                                                    href={meeting.meeting_link} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="w-8 h-8 rounded-xl bg-indigo-50 text-[#31267D] flex items-center justify-center border border-indigo-100 shrink-0"
                                                >
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>

                                        {/* Summit Preparatory Checklist Counts */}
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider border",
                                            prepCount > 0 
                                                ? "bg-orange-50 text-[#FA4616] border-orange-100"
                                                : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                        )}>
                                            <ListTodo className="w-3.5 h-3.5" />
                                            <span>Pre-Summit tasks pending: {prepCount}</span>
                                            {prepCount > 0 && (
                                                <span className="ml-auto text-[7px] bg-[#FA4616] text-white px-2 py-0.5 rounded-full font-black tracking-widest animate-pulse">
                                                    Action Required
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // TAB 3: REQUEST DESK
    const renderRequestDesk = () => {
        const staffRequests = rawRequests.filter((r: any) => r.submitted_by?.id === profile?.id);

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 uppercase leading-none">
                        Request Desk
                    </h1>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                        Executive Leaves & Authorizations
                    </p>
                </div>

                {/* Form trigger blocks */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => setIsLeaveOpen(true)}
                        className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-28 relative overflow-hidden group active:scale-98 transition-all text-left text-zinc-900"
                    >
                        <div className="p-2 bg-indigo-50 text-[#31267D] rounded-lg w-fit">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight leading-none text-[#31267D]">Request Leave</p>
                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">Submit Casual/Medical Request</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setIsPermissionOpen(true)}
                        className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-28 relative overflow-hidden group active:scale-98 transition-all text-left text-zinc-900"
                    >
                        <div className="p-2 bg-orange-50 text-[#FA4616] rounded-lg w-fit">
                            <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-tight leading-none text-[#31267D]">Permission Key</p>
                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mt-1.5">Request Access or budget parameters</p>
                        </div>
                    </button>
                </div>

                {/* Log history lists */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[#31267D] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#FA4616]" /> Request History Log
                    </h2>
                    {staffRequests.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic text-center py-6">No historical requests submitted.</p>
                    ) : (
                        <div className="space-y-3">
                            {staffRequests.map((r: any) => (
                                <div key={r.id} className="bg-white border border-zinc-200/80 p-4.5 rounded-2xl flex items-center justify-between gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-zinc-900">
                                    <div className="min-w-0">
                                        <p className="text-xs font-black uppercase text-zinc-900 truncate">{r.title}</p>
                                        <p className="text-[9.5px] text-zinc-500 mt-1 truncate font-medium">{r.description}</p>
                                    </div>
                                    
                                    <span className={cn(
                                        "px-2.5 py-1 rounded-full text-[7.5px] font-black uppercase tracking-widest shrink-0 border",
                                        r.status === "approved" 
                                            ? "bg-emerald-55 text-emerald-600 border-emerald-100" 
                                            : r.status === "rejected" 
                                            ? "bg-rose-50 text-rose-500 border-rose-100"
                                            : "bg-amber-55 text-amber-600 border-amber-100"
                                    )}>
                                        {r.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // TAB 4: COMMUNITY BOARD & SHARE IDEA
    const renderCommunity = () => {
        const communityAnnouncements = broadcasts.filter((b: any) => b.target === 'COMMUNITY_BOARD');

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 uppercase leading-none">
                        Community Board
                    </h1>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                        Corporate Bulletins & Collective Strategic Ideas
                    </p>
                </div>

                {/* Combined Community Feed */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[#31267D] flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-[#FA4616]" /> Shared Board Bulletins
                    </h2>
                    
                    {communityAnnouncements.length === 0 && capturedThoughts.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic text-center py-8 bg-white border border-zinc-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            No community messages active at this time.
                        </p>
                    ) : (
                        <div className="space-y-3.5">
                            {/* Render Community Announcements from CEO */}
                            {communityAnnouncements.map((ann) => (
                                <div 
                                    key={ann.id} 
                                    className="bg-orange-50/40 border border-orange-100 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col gap-2 relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#FA4616]/10 text-[#FA4616] flex items-center justify-center font-black text-xs">
                                                CEO
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-[#FA4616] leading-none">Salim PA (CEO)</p>
                                                <p className="text-[7px] text-zinc-450 uppercase font-bold tracking-wider mt-0.5">Corporate Broadcast</p>
                                            </div>
                                        </div>
                                        <span className="text-[7.5px] font-black uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">
                                            Priority Notice
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-800 font-bold leading-relaxed whitespace-pre-wrap mt-1">
                                        {ann.message}
                                    </p>
                                </div>
                            ))}

                            {/* Render Captured Staff Ideas */}
                            {capturedThoughts.map((thought) => {
                                const isCompleted = thought.completed === true || thought.status === "completed";
                                const isDelegated = thought.status === "delegated";

                                return (
                                    <div 
                                        key={thought.id} 
                                        className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col gap-3 relative overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-[#31267D] text-white flex items-center justify-center font-black text-xs">
                                                        {profile?.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "OP"}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-zinc-900 leading-none">{profile?.full_name || "Teammate"}</p>
                                                        <p className="text-[7px] text-zinc-450 uppercase font-black tracking-widest mt-0.5">{profile?.department || "Operations"}</p>
                                                    </div>
                                                </div>
                                                
                                                {thought.title && (
                                                    <p className="text-xs font-black uppercase text-[#31267D] pt-2">{thought.title}</p>
                                                )}
                                                <p className="text-[10px] text-zinc-650 leading-relaxed font-medium pt-1 whitespace-pre-wrap">
                                                    {thought.content}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-[7.5px] font-black uppercase tracking-widest border",
                                                    isCompleted 
                                                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                                        : isDelegated 
                                                        ? "bg-indigo-50 text-[#31267D] border-indigo-100" 
                                                        : "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    {isCompleted ? "Approved" : isDelegated ? "Delegated" : "Under Review"}
                                                </span>
                                                <span className="text-[7px] text-zinc-400 font-bold uppercase tracking-wider">
                                                    {new Date(thought.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-zinc-100 pt-2.5 mt-1">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[6.5px] font-black uppercase tracking-wider border",
                                                thought.priority === "urgent" 
                                                    ? "bg-rose-50 text-rose-500 border-rose-100"
                                                    : "bg-slate-50 text-zinc-450 border-zinc-200/80"
                                            )}>
                                                {thought.priority || "medium"} priority
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => handleDiscardThought(thought.id)}
                                                className="flex items-center gap-1 text-[8px] font-black uppercase text-zinc-400 hover:text-rose-500 active:scale-95 transition-all tracking-wider"
                                            >
                                                <X className="w-3.5 h-3.5" /> Discard Idea
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Share Strategic Idea Form */}
                <div className="bg-white border border-zinc-200/80 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
                    <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FA4616] flex items-center justify-center shadow-sm">
                            <Sparkles className="w-4.5 h-4.5" />
                        </div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-[#31267D]">Share Idea with CEO</h2>
                    </div>

                    <form onSubmit={handleCaptureDirective} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Idea Heading (optional)</label>
                            <input 
                                type="text"
                                placeholder="Strategic topic or subject..."
                                value={directiveForm.title}
                                onChange={(e) => setDirectiveForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-zinc-200/80 rounded-2xl text-xs text-zinc-900 placeholder-zinc-400 focus:border-[#31267D] focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Detailed Suggestion</label>
                            <textarea 
                                rows={4}
                                required
                                placeholder="Explain your innovative proposal, targeted improvement details, or thought registers for CEO evaluation..."
                                value={directiveForm.content}
                                onChange={(e) => setDirectiveForm(prev => ({ ...prev, content: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-zinc-200/80 rounded-2xl text-xs text-zinc-900 placeholder-zinc-400 focus:border-[#31267D] focus:outline-none resize-none leading-relaxed"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Priority Weight</label>
                            <select 
                                value={directiveForm.priority}
                                onChange={(e) => setDirectiveForm(prev => ({ ...prev, priority: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-zinc-200/80 rounded-2xl text-xs text-zinc-900 focus:border-[#31267D] focus:outline-none"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="urgent">Urgent Priority</option>
                            </select>
                        </div>

                        <button 
                            type="submit"
                            disabled={submittingDirective}
                            className="w-full py-4 text-white bg-[#FA4616] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {submittingDirective ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" /> Submit Strategic Idea
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    // ----------------------------------------------------
    // MAIN TAB SWITCH ROUTER
    // ----------------------------------------------------
    return (
        <div className="flex-1 w-full max-w-full pb-20">
            {activeTab === "mission" && renderMissionControl()}
            {activeTab === "requests" && renderRequestDesk()}
            {activeTab === "community" && renderCommunity()}

            {/* ------------------------------------------------ */}
            {/* BOTTOM SHEETS FOR WORKPLACE OPERATIONS */}
            {/* ------------------------------------------------ */}

            {/* 1. TASK DETAILS & PROGRESS DRAWER */}
            <BottomSheet 
                isOpen={!!selectedTask} 
                onClose={() => setSelectedTask(null)} 
                title="Directive Control"
            >
                {selectedTask && (
                    <div className="space-y-5">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border",
                                    selectedTask.priority === "urgent" 
                                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                        : "bg-slate-100 dark:bg-zinc-900 text-zinc-500 border-slate-200/50 dark:border-zinc-800"
                                )}>
                                    {selectedTask.priority} priority
                                </span>
                                {selectedTask.due_date && (
                                    <span className="text-[9px] text-zinc-400 font-bold">
                                        | DUE: {new Date(selectedTask.due_date).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-zinc-100 mt-2">{selectedTask.title}</h4>
                        </div>

                        <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-2xl text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed max-h-40 overflow-y-auto font-medium">
                            {selectedTask.description || "No detail description supplied for this task."}
                        </div>

                        {/* Interactive Progress Slider */}
                        <div className="space-y-2 bg-slate-50/50 dark:bg-zinc-900/20 p-4 rounded-2xl border border-slate-100 dark:border-zinc-900">
                            <div className="flex items-center justify-between text-xs font-black uppercase text-zinc-900 dark:text-zinc-200">
                                <span>Adjust Progress</span>
                                <span className="text-[#FA4616] font-mono">{taskProgress}%</span>
                            </div>
                            
                            <input 
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={taskProgress}
                                onChange={(e) => setTaskProgress(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FA4616] dark:accent-orange-500"
                            />
                            
                            <div className="flex justify-between text-[7px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                                <span>Pending</span>
                                <span>In Progress</span>
                                <span>Authorized (100%)</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleUpdateProgress}
                            disabled={updatingTaskProgress}
                            className="w-full py-4 text-white bg-[#FA4616] rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {updatingTaskProgress ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" /> Save Mission Progress
                                </>
                            )}
                        </button>
                    </div>
                )}
            </BottomSheet>

            {/* 2. LEAVE REQUEST BOTTOM SHEET */}
            <BottomSheet 
                isOpen={isLeaveOpen} 
                onClose={() => setIsLeaveOpen(false)} 
                title="Leave Application"
            >
                <form onSubmit={handleSubmitLeave} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Leave Category</label>
                        <select 
                            value={leaveForm.category}
                            onChange={(e) => setLeaveForm(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                            <option value="casual">Casual Leave</option>
                            <option value="medical">Medical Leave</option>
                            <option value="emergency">Emergency Leave</option>
                            <option value="early">Early dismissal / Off-duty</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Start Date</label>
                            <input 
                                type="date"
                                required
                                value={leaveForm.start_date}
                                onChange={(e) => setLeaveForm(prev => ({ ...prev, start_date: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">End Date</label>
                            <input 
                                type="date"
                                required
                                value={leaveForm.end_date}
                                onChange={(e) => setLeaveForm(prev => ({ ...prev, end_date: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Reason for absence</label>
                        <textarea 
                            rows={3}
                            required
                            placeholder="State mission-critical justification for leave request..."
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={submittingLeave}
                        className="w-full py-4 text-white bg-[#31267D] dark:bg-purple-600 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {submittingLeave ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> File Leave Ticket
                            </>
                        )}
                    </button>
                </form>
            </BottomSheet>

            {/* 3. PERMISSION BOTTOM SHEET */}
            <BottomSheet 
                isOpen={isPermissionOpen} 
                onClose={() => setIsPermissionOpen(false)} 
                title="Request Permission"
            >
                <form onSubmit={handleSubmitPermission} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Subject Title</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. Budget elevation"
                                value={permissionForm.subject}
                                onChange={(e) => setPermissionForm(prev => ({ ...prev, subject: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Priority Weight</label>
                            <select 
                                value={permissionForm.priority}
                                onChange={(e) => setPermissionForm(prev => ({ ...prev, priority: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="urgent">Urgent Priority</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Requested Budget Cost (optional)</label>
                        <input 
                            type="number"
                            placeholder="RS cost amount (if requesting expense)"
                            value={permissionForm.cost}
                            onChange={(e) => setPermissionForm(prev => ({ ...prev, cost: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">Justification Details</label>
                        <textarea 
                            rows={3}
                            required
                            placeholder="State detailed business justification for requested parameters elevation..."
                            value={permissionForm.justification}
                            onChange={(e) => setPermissionForm(prev => ({ ...prev, justification: e.target.value }))}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none resize-none"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={submittingPermission}
                        className="w-full py-4 text-white bg-[#31267D] dark:bg-purple-600 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        {submittingPermission ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> File Permission Request
                            </>
                        )}
                    </button>
                </form>
            </BottomSheet>
        </div>
    );
}

export default StaffMissionView;
