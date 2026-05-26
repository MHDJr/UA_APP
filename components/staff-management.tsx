"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Star, CheckCircle2, Clock, XCircle, Wifi, Building2, Pencil, Trash2, Loader2, X, Mail, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase, Profile, Task, Request } from "@/lib/supabase";
import AddStaffDialog from "./AddStaffDialog";
import { PendingApprovals, PendingRequest } from "./PendingApprovals";
import { StatCards } from "./StatCards";
import { toast } from "sonner";
import { useTabResiliency } from "./tab-resiliency-engine";
import { useAuth } from "@/lib/auth-context";
import { useStaff, useTasks, useRequests } from "@/hooks/use-dashboard-data";
import { useQueryClient } from "@tanstack/react-query";

// Brand colors
const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
};

// Types
type StaffStatus = "Present" | "Remote" | "Late" | "Absent";

interface StaffMember {
    id: string;
    name: string;
    role: string;
    department: string;
    status: StaffStatus;
    tasksCompleted: number;
    tasksTotal: number;
    rating: number;
    avatar: string;
    email: string;
    phone: string;
}

// Status badge styles
const statusStyles: Record<StaffStatus, { bg: string; text: string; icon: React.ElementType }> = {
    Present: { bg: "bg-emerald-50", text: "text-emerald-600", icon: CheckCircle2 },
    Late: { bg: "bg-orange-50", text: "text-orange-600", icon: Clock },
    Absent: { bg: "bg-red-50", text: "text-red-600", icon: XCircle },
    Remote: { bg: "bg-blue-50", text: "text-blue-600", icon: Wifi },
};

// Map profile status to staff status
const mapProfileStatus = (status: string): StaffStatus => {
    switch (status) {
        case "online":
            return "Present";
        case "busy":
            return "Late";
        case "away":
            return "Remote";
        case "offline":
        default:
            return "Absent";
    }
};

// Calculate rating based on task completion
const calculateRating = (completed: number, total: number): number => {
    if (total === 0) return 4.0;
    const ratio = completed / total;
    if (ratio >= 0.9) return 4.8 + Math.random() * 0.2;
    if (ratio >= 0.75) return 4.4 + Math.random() * 0.3;
    if (ratio >= 0.5) return 4.0 + Math.random() * 0.3;
    return 3.5 + Math.random() * 0.4;
};

export function StaffManagement() {
    const { userRole, profile } = useAuth();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    
    // TanStack Query Hooks
    const { data: staffProfiles = [], isLoading: isLoadingStaff } = useStaff();
    const { activeTasks = [], completedTasks = [], isLoading: isLoadingTasks } = useTasks();
    const { data: rawRequests = [], isLoading: isLoadingRequests } = useRequests();

    const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmName, setConfirmName] = useState("");

    const loading = isLoadingStaff || isLoadingTasks || isLoadingRequests;

    // Process staff data for UI
    const staffData = useMemo(() => {
        const allTasks = [...activeTasks, ...completedTasks];
        const taskMap = new Map();
        
        allTasks.forEach(t => {
            if (!taskMap.has(t.assigned_to)) {
                taskMap.set(t.assigned_to, { total: 0, completed: 0 });
            }
            const stats = taskMap.get(t.assigned_to);
            stats.total++;
            if (t.status === "completed") stats.completed++;
        });

        return staffProfiles.map((profile: Profile) => {
            const stats = taskMap.get(profile.id) || { total: 0, completed: 0 };
            return {
                id: profile.id,
                name: profile.full_name || profile.username || "Unknown",
                role: profile.designation || profile.role || "Staff",
                department: profile.department || "General",
                status: mapProfileStatus(profile.status),
                tasksCompleted: stats.completed,
                tasksTotal: stats.total || 0, 
                rating: Math.round(calculateRating(stats.completed, stats.total || 0) * 10) / 10,
                avatar: profile.avatar_url || "",
                email: profile.email || "",
                phone: profile.phone || "",
            };
        });
    }, [staffProfiles, activeTasks, completedTasks]);

    // Process pending requests for UI
    const pendingRequests = useMemo(() => {
        const filtered = rawRequests.filter(req => req.type !== 'idea');
        
        return filtered.map((req: any) => {
            const staffName = req.submitted_by?.full_name || req.submitted_by?.username || "Unknown Staff";
            const staffInitials = staffName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

            let requestType: PendingRequest["requestType"] = "leave";
            switch (req.type) {
                case "leave": requestType = "leave"; break;
                case "permission": requestType = "permission"; break;
                case "work_adjustment": requestType = "work_adjustment"; break;
                case "expense": requestType = "expense"; break;
                case "feedback": requestType = "feedback"; break;
                case "budget": requestType = "budget"; break;
                case "access_elevation": requestType = "access_elevation"; break;
                case "role_change": requestType = "role_change"; break;
                case "add_staff": requestType = "add_staff"; break;
            }

            let leaveType: PendingRequest["leaveType"];
            if (req.type === "leave") {
                const purpose = req.purpose?.toLowerCase() || req.title?.toLowerCase() || "";
                if (purpose.includes("medical")) leaveType = "medical";
                else if (purpose.includes("emergency")) leaveType = "emergency";
                else if (purpose.includes("early")) leaveType = "early";
                else leaveType = "casual";
            }

            return {
                id: req.id,
                staffId: req.submitted_by?.id,
                staffName,
                staffInitials,
                requestType,
                description: req.description || req.title || "No description provided",
                requestedAt: req.created_at,
                urgency: req.priority === "urgent" ? "urgent" : req.priority === "high" ? "high" : undefined,
                amount: req.amount,
                leaveType,
                dates: req.dates,
                totalDays: req.total_days,
            };
        });
    }, [rawRequests]);

    // Calculate overall stats
    const stats = useMemo(() => {
        return {
            present: staffData.filter((s) => s.status === "Present").length,
            remote: staffData.filter((s) => s.status === "Remote").length,
            late: staffData.filter((s) => s.status === "Late").length,
            absent: staffData.filter((s) => s.status === "Absent").length,
            total: staffData.length,
            pending: pendingRequests.length,
            approved: 0, // Placeholder
            rejected: 0, // Placeholder
        };
    }, [staffData, pendingRequests]);

    // Tab Resiliency Engine Integration
    useTabResiliency(
        () => {
            queryClient.invalidateQueries();
        },
        loading,
        () => {}
    );

    const deleteStaff = async () => {
        if (!staffToDelete) return;

        try {
            const { error: cascadeError } = await supabase.rpc('delete_profile_cascade', {
                profile_uuid: staffToDelete.id
            });

            if (cascadeError) {
                await supabase.from("tasks").update({ assigned_to: null }).eq("assigned_to", staffToDelete.id);
                const { error: deleteError } = await supabase.from("profiles").delete().eq("id", staffToDelete.id);
                if (deleteError) {
                    await supabase.from("profiles").update({ full_name: "[DELETED]", status: "offline" }).eq("id", staffToDelete.id);
                }
            }

            toast.success("Personnel terminated successfully");
            setIsDeleteModalOpen(false);
            setStaffToDelete(null);
            setConfirmName("");
            queryClient.invalidateQueries();
        } catch (e) {
            console.error("Deletion error:", e);
            toast.error("Failed to delete staff member");
        }
    };

    useEffect(() => {
        const handleStaffCreated = () => queryClient.invalidateQueries({ queryKey: ["staff"] });
        window.addEventListener('staff-created', handleStaffCreated);
        return () => window.removeEventListener('staff-created', handleStaffCreated);
    }, [queryClient]);

    useEffect(() => {
        const handleFabAction = (event: CustomEvent) => {
            if (event.detail.action === "add-staff") setIsAddStaffOpen(true);
        };
        window.addEventListener("fab-action", handleFabAction as EventListener);
        return () => window.removeEventListener("fab-action", handleFabAction as EventListener);
    }, []);

    const filteredStaff = staffData.filter(
        (staff) =>
            staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND_COLORS.indigo }} />
                    <span className="text-gray-500 font-medium">Synchronizing Personnel Data...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#F9FAFB] overflow-y-auto pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">
                            Staff Management
                        </h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium mt-1 tracking-wide">
                            <span className="text-[#31267D] font-bold">{stats.total}</span> ACTIVE PERSONNEL RECOGNIZED ACROSS ACADEMY DEPARTMENTS
                        </p>
                    </div>
                    {userRole === 'CEO' && (
                        <Button
                            onClick={() => setIsAddStaffOpen(true)}
                            className="w-full md:w-auto px-6 py-6 md:py-2.5 rounded-2xl text-white font-black uppercase tracking-widest text-[11px] items-center gap-2 shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                            style={{ backgroundColor: BRAND_COLORS.orange }}
                        >
                            <Plus className="w-4 h-4 stroke-[3px]" />
                            Provision Personnel
                        </Button>
                    )}
                </div>

                <StatCards
                    activeStaff={stats.total}
                    pending={stats.pending}
                    approved={stats.approved}
                    rejected={stats.rejected}
                    className="mb-8"
                />

                <PendingApprovals
                    requests={pendingRequests}
                    className="mb-8"
                    onApprove={async (id) => {
                        try {
                            const { data: requestData, error: fetchError } = await supabase.from("requests").select("*").eq("id", id).single();
                            if (fetchError) throw fetchError;
                            if (requestData.type === "add_staff" && requestData.metadata) {
                                const { fullName, email, username, designation, password, systemRole, hasManagerAccess, department } = requestData.metadata;
                                const { data: authData, error: authError } = await supabase.auth.signUp({
                                    email, password, options: { data: { full_name: fullName, username: username } }
                                });
                                if (authError) throw authError;
                                if (!authData.user) throw new Error("Auth failed");
                                await supabase.from("profiles").insert({
                                    id: authData.user.id, email, full_name: fullName, username, designation,
                                    role: systemRole === "manager" || hasManagerAccess ? "manager" : systemRole,
                                    is_manager: systemRole === "manager" || hasManagerAccess,
                                    department: department || "Administration", status: "offline"
                                });
                            }
                            
                            const reviewerId = profile?.id || null;
                            const { error: updateError } = await supabase.from("requests").update({
                                status: "approved", 
                                reviewed_at: new Date().toISOString(),
                                reviewed_by: reviewerId
                            }).eq("id", id);
                            
                            if (updateError) throw updateError;
                            
                            queryClient.invalidateQueries();
                            toast.success("Request Approved");
                        } catch (err: any) {
                            console.error("Approval error:", err);
                            toast.error(err.message || "Approval failed");
                        }
                    }}
                    onDecline={async (id) => {
                        try {
                            const reviewerId = profile?.id || null;
                            const { error: updateError } = await supabase.from("requests").update({
                                status: "rejected", 
                                reviewed_at: new Date().toISOString(),
                                reviewed_by: reviewerId
                            }).eq("id", id);
                            
                            if (updateError) throw updateError;
                            
                            queryClient.invalidateQueries();
                            toast.success("Request Declined");
                        } catch (err: any) {
                            console.error("Decline error:", err);
                            toast.error(err.message || "Decline failed");
                        }
                    }}
                />

                <div className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-zinc-800/60 rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="px-6 py-6 border-b border-gray-100 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-900/30">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-[#31267D]/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-[#31267D]" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Personnel Directory</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Active Deployment Monitoring</p>
                                </div>
                            </div>
                            <div className="relative w-full lg:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search personnel..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-11 pr-4 py-6 bg-white border-gray-200 rounded-2xl text-sm text-gray-900 focus:ring-4 focus:ring-[#31267D]/5 focus:border-[#31267D] transition-all shadow-sm placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Card View */}
                    <div className="lg:hidden bg-gray-50/50 p-4 space-y-4">
                        {filteredStaff.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Search className="w-8 h-8 text-gray-300 mb-4" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No Results</p>
                            </div>
                        ) : (
                            filteredStaff.map((staff) => {
                                const style = statusStyles[staff.status];
                                const StatusIcon = style.icon;
                                return (
                                    <div key={staff.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="w-12 h-12 border-2 border-gray-50 shadow-sm">
                                                    <AvatarImage src={staff.avatar} />
                                                    <AvatarFallback className="text-white font-black" style={{ backgroundColor: BRAND_COLORS.indigo }}>
                                                        {staff.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="font-black text-gray-900 text-sm truncate uppercase">{staff.name}</p>
                                                    <p className="text-[10px] font-black uppercase text-[#31267D] tracking-widest">{staff.role}</p>
                                                </div>
                                            </div>
                                            <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest", style.bg, style.text)}>
                                                <StatusIcon className="w-2.5 h-2.5 stroke-[3px]" />
                                                {staff.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 py-3 border-y border-gray-50 mb-4">
                                            <div>
                                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Pulse</p>
                                                <span className="text-[10px] font-black text-gray-900">{staff.tasksCompleted}/{staff.tasksTotal} Tasks</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-[10px] font-black">{staff.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <a href={`mailto:${staff.email}`} className="p-2 rounded-xl bg-gray-50 text-gray-500"><Mail className="w-3.5 h-3.5" /></a>
                                                <a href={`tel:${staff.phone}`} className="p-2 rounded-xl bg-gray-50 text-gray-500"><Wifi className="w-3.5 h-3.5 rotate-90" /></a>
                                            </div>
                                            {userRole === 'CEO' && (
                                                <Button variant="ghost" onClick={() => { setStaffToDelete(staff); setIsDeleteModalOpen(true); }} className="h-8 px-3 rounded-xl text-red-600 font-black uppercase text-[8px] gap-1.5">
                                                    <Trash2 className="w-3 h-3" /> Terminate
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Personnel Profile</th>
                                    <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</th>
                                    <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pulse</th>
                                    <th className="text-left py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Rating</th>
                                    <th className="text-right py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredStaff.map((staff) => {
                                    const style = statusStyles[staff.status];
                                    const isHovered = hoveredRow === staff.id;
                                    return (
                                        <tr key={staff.id} className={cn("group transition-all duration-300", isHovered && "bg-[#31267D]/[0.02]")} onMouseEnter={() => setHoveredRow(staff.id)} onMouseLeave={() => setHoveredRow(null)}>
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                        <AvatarImage src={staff.avatar} />
                                                        <AvatarFallback className="text-white text-xs font-black" style={{ backgroundColor: BRAND_COLORS.indigo }}>
                                                            {staff.name.split(" ").map(n => n[0]).join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-sm leading-tight uppercase tracking-tight">{staff.name}</p>
                                                        <p className="text-[10px] text-[#31267D] font-black uppercase tracking-widest mt-0.5">{staff.role}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-2.5 text-gray-600">
                                                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                                    <span className="text-[11px] font-bold uppercase tracking-tight">{staff.department}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <span className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest", style.bg, style.text)}>
                                                    <style.icon className="w-3 h-3 stroke-[3px]" />
                                                    {staff.status}
                                                </span>
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden w-24">
                                                        <div className="h-full bg-[#31267D] transition-all duration-1000" style={{ width: `${(staff.tasksCompleted / (staff.tasksTotal || 1)) * 100}%` }} />
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-900">{staff.tasksCompleted}/{staff.tasksTotal}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8">
                                                <div className="flex items-center gap-1.5">
                                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-sm font-black text-gray-900">{staff.rating}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-8 text-right">
                                                {userRole === 'CEO' && (
                                                    <button onClick={() => { setStaffToDelete(staff); setIsDeleteModalOpen(true); }} className={cn("p-2 rounded-xl transition-all duration-300", isHovered ? "bg-red-50 text-red-600" : "opacity-0")}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <AddStaffDialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen} />
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border-0">
                    <div className="bg-red-600 px-6 py-6 text-white text-center">
                        <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-black uppercase tracking-widest">Terminate Personnel</h3>
                        <p className="text-[10px] font-bold uppercase tracking-tighter opacity-80 mt-1">Irreversible Deployment Extraction</p>
                    </div>
                    <div className="p-8 bg-white space-y-6">
                        <p className="text-sm text-gray-600 font-medium text-center">Are you certain you want to remove <span className="font-black text-gray-900">@{staffToDelete?.name}</span> from active academy records?</p>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Security Confirmation</label>
                            <Input value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder="Type personnel name to confirm" className="py-6 rounded-2xl border-gray-100 focus:ring-red-500/10 focus:border-red-500" />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border-gray-100">Abort</Button>
                            <Button variant="destructive" disabled={confirmName !== staffToDelete?.name} onClick={deleteStaff} className="flex-1 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-red-600 shadow-lg shadow-red-500/20">Confirm</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default StaffManagement;
