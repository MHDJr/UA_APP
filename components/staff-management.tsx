"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Star, CheckCircle2, Clock, XCircle, Wifi, Building2, Pencil, Trash2, Loader2, X } from "lucide-react";
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
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [staffData, setStaffData] = useState<StaffMember[]>([]);
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        present: 0,
        remote: 0,
        late: 0,
        absent: 0,
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });

    const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [confirmName, setConfirmName] = useState("");

    const deleteStaff = async () => {
        if (!staffToDelete) return;

        try {
            console.log("Attempting to delete staff:", staffToDelete);
            
            // Use the cascade deletion function
            const { error: cascadeError } = await supabase.rpc('delete_profile_cascade', {
                profile_uuid: staffToDelete.id
            });

            console.log("Cascade delete result:", { cascadeError });

            if (cascadeError) {
                console.log("Cascade delete failed, trying manual deletion:", cascadeError);
                
                // Fallback to manual deletion
                // 1. Unassign active tasks
                const { error: taskError } = await supabase
                    .from("tasks")
                    .update({ assigned_to: null })
                    .eq("assigned_to", staffToDelete.id);
                
                if (taskError) {
                    console.error("Error unassigning tasks:", taskError);
                }

                // 2. Permanently delete from database
                const { error: deleteError } = await supabase
                    .from("profiles")
                    .delete()
                    .eq("id", staffToDelete.id);

                console.log("Manual delete result:", { deleteError });

                if (deleteError) {
                    console.log("Manual delete failed, trying soft delete:", deleteError);
                    // Fallback to soft delete
                    const { error: updateError } = await supabase
                        .from("profiles")
                        .update({ full_name: "[DELETED]", status: "offline" })
                        .eq("id", staffToDelete.id);
                    
                    console.log("Soft delete result:", { updateError });
                    
                    if (updateError) {
                        throw new Error(`All deletion methods failed: ${updateError.message}`);
                    }
                }
            }

            toast.success("Staff member terminated successfully");
            
            // Update local state immediately
            setStaffData(prev => prev.filter(s => s.id !== staffToDelete.id));
            
            // Close modal and reset state
            setIsDeleteModalOpen(false);
            setStaffToDelete(null);
            setConfirmName("");
            
            // Refresh data to ensure consistency
            await fetchStaffData();
        } catch (e) {
            console.error("Complete deletion error:", e);
            toast.error(`Failed to delete staff member: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    };

    useEffect(() => {
        fetchStaffData();
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            // Fetch pending requests with staff profile data (excluding ideas)
            const { data: requests, error: requestsError } = await supabase
                .from("requests")
                .select(`
                    *,
                    profiles!requests_submitted_by_fkey (
                        id,
                        full_name,
                        username,
                        avatar_url
                    )
                `)
                .eq("status", "pending")
                .neq("type", "idea") // Exclude ideas from requests
                .order("created_at", { ascending: false });

            if (requestsError) throw requestsError;

            // Transform requests to PendingRequest format
            const transformedRequests: PendingRequest[] = (requests || []).map((req: Request & { profiles: Profile }) => {
                const staffName = req.profiles?.full_name || req.profiles?.username || "Unknown Staff";
                const staffInitials = staffName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                // Map request type to PendingRequest type
                let requestType: PendingRequest["requestType"];
                switch (req.type) {
                    case "leave":
                        requestType = "leave";
                        break;
                    case "permission":
                        requestType = "permission";
                        break;
                    case "work_adjustment":
                        requestType = "work_adjustment";
                        break;
                    case "expense":
                        requestType = "expense";
                        break;
                    case "feedback":
                        requestType = "feedback";
                        break;
                    case "budget":
                        requestType = "budget";
                        break;
                    case "access_elevation":
                        requestType = "access_elevation";
                        break;
                    case "role_change":
                        requestType = "role_change";
                        break;
                    default:
                        requestType = "leave"; // Default to leave instead of other
                }

                // Extract leave type for leave requests
                let leaveType: PendingRequest["leaveType"];
                if (req.type === "leave") {
                    // Determine leave type from purpose or title
                    const purpose = req.purpose?.toLowerCase() || req.title?.toLowerCase() || req.description?.toLowerCase() || "";
                    if (purpose.includes("medical") || purpose.includes("sick") || purpose.includes("health")) {
                        leaveType = "medical";
                    } else if (purpose.includes("emergency") || purpose.includes("urgent")) {
                        leaveType = "emergency";
                    } else if (purpose.includes("early") || purpose.includes("half day")) {
                        leaveType = "early";
                    } else {
                        leaveType = "casual"; // Default to casual leave
                    }
                }

                return {
                    id: req.id,
                    staffId: req.submitted_by,
                    staffName,
                    staffInitials,
                    requestType,
                    description: req.description || req.title || "No description provided",
                    requestedAt: req.created_at,
                    urgency: req.priority === "urgent" ? "urgent" : req.priority === "high" ? "high" : undefined,
                    // Leave-specific fields
                    leaveType: requestType === "leave" ? leaveType : undefined,
                    dates: req.dates,
                    totalDays: req.total_days,
                };
            });

            setPendingRequests(transformedRequests);

            // Update stats with real counts
            setStats((prev) => ({
                ...prev,
                pending: transformedRequests.length,
            }));
        } catch (err) {
            console.error("Error fetching pending requests:", err);
            // Set empty array on error to avoid showing dummy data
            setPendingRequests([]);
        }
    };

    const fetchStaffData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch staff profiles (excluding CEO)
            const { data: profiles, error: profilesError } = await supabase
                .from("profiles")
                .select("*")
                .in("role", ["staff", "sales"])
                .order("created_at", { ascending: false });

            if (profilesError) throw profilesError;

            // Fetch all tasks to calculate completion rates
            const { data: tasks, error: tasksError } = await supabase
                .from("tasks")
                .select("assigned_to, status");

            if (tasksError) throw tasksError;

            // Fetch requests stats
            const { data: allRequests, error: allRequestsError } = await supabase
                .from("requests")
                .select("status");

            if (allRequestsError) throw allRequestsError;

            // Process staff data
            const processedStaff: StaffMember[] = (profiles || []).map((profile: Profile) => {
                // Count tasks for this staff member
                const staffTasks = tasks?.filter((t: any) => t.assigned_to === profile.id) || [];
                const completedTasks = staffTasks.filter((t: any) => t.status === "completed").length;
                const totalTasks = staffTasks.length;

                return {
                    id: profile.id,
                    name: profile.full_name || profile.username || "Unknown",
                    role: profile.designation || profile.role || "Staff",
                    department: profile.department || "General",
                    status: mapProfileStatus(profile.status),
                    tasksCompleted: completedTasks,
                    tasksTotal: totalTasks || 1, // Avoid division by zero
                    rating: Math.round(calculateRating(completedTasks, totalTasks || 1) * 10) / 10,
                    avatar: profile.avatar_url || "",
                    email: profile.email || "",
                    phone: profile.phone || "",
                };
            });

            setStaffData(processedStaff);

            // Calculate stats with real data
            const pendingCount = allRequests?.filter((r: any) => r.status === "pending").length || 0;
            const approvedCount = allRequests?.filter((r: any) => r.status === "approved").length || 0;
            const rejectedCount = allRequests?.filter((r: any) => r.status === "rejected").length || 0;

            const newStats = {
                present: processedStaff.filter((s) => s.status === "Present").length,
                remote: processedStaff.filter((s) => s.status === "Remote").length,
                late: processedStaff.filter((s) => s.status === "Late").length,
                absent: processedStaff.filter((s) => s.status === "Absent").length,
                total: processedStaff.length,
                pending: pendingCount,
                approved: approvedCount,
                rejected: rejectedCount,
            };
            setStats(newStats);
        } catch (err) {
            console.error("Error fetching staff data:", err);
            setError("Failed to load staff data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staffData.filter(
        (staff) =>
            staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats cards data (dynamic based on real data)
    const statsData = [
        { label: "Present", value: stats.present, color: "bg-emerald-500", icon: CheckCircle2 },
        { label: "Remote", value: stats.remote, color: "bg-blue-500", icon: Wifi },
        { label: "Late", value: stats.late, color: "bg-orange-500", icon: Clock },
        { label: "Absent", value: stats.absent, color: "bg-red-500", icon: XCircle },
    ];

    if (loading) {
        return (
            <div className="h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND_COLORS.indigo }} />
                    <span className="text-gray-500 font-medium">Loading staff data...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen bg-[#F9FAFB] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-medium mb-3">{error}</p>
                    <Button
                        onClick={fetchStaffData}
                        className="px-4 py-2 rounded-xl text-white font-semibold text-sm"
                        style={{ backgroundColor: BRAND_COLORS.indigo }}
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[#F9FAFB] overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                Staff Management
                            </h1>
                            <p className="text-gray-500 mt-1">
                                {stats.total} active staff member{stats.total !== 1 ? "s" : ""} across multiple departments
                            </p>
                        </div>
                    </div>

                    {/* Updated Metric Cards */}
                    <StatCards
                        activeStaff={stats.total}
                        pending={stats.pending}
                        approved={stats.approved}
                        rejected={stats.rejected}
                        className="mb-8"
                    />

                    {/* Priority Action Hub - Pending Approvals */}
                    <PendingApprovals
                        requests={pendingRequests}
                        onApprove={async (id) => {
                            try {
                                // Update request in database
                                const { error } = await supabase
                                    .from("requests")
                                    .update({
                                        status: "approved",
                                        reviewed_at: new Date().toISOString(),
                                        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
                                    })
                                    .eq("id", id);

                                if (error) throw error;

                                // Refresh requests and stats
                                await fetchPendingRequests();
                                await fetchStaffData();
                            } catch (err) {
                                console.error("Error approving request:", err);
                            }
                        }}
                        onDecline={async (id) => {
                            try {
                                // Update request in database
                                const { error } = await supabase
                                    .from("requests")
                                    .update({
                                        status: "rejected",
                                        reviewed_at: new Date().toISOString(),
                                        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
                                    })
                                    .eq("id", id);

                                if (error) throw error;

                                // Refresh requests and stats
                                await fetchPendingRequests();
                                await fetchStaffData();
                            } catch (err) {
                                console.error("Error declining request:", err);
                            }
                        }}
                        className="mb-8"
                    />
                </div>

                {/* Staff Table Section - More Visible */}
                <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Staff Directory</h2>
                                <p className="text-sm text-gray-500">Manage and monitor all team members</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search staff..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2.5 w-72 bg-white border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#31267D]/20 focus:border-[#31267D]"
                                    />
                                </div>
                                <Button
                                    onClick={() => setIsAddStaffOpen(true)}
                                    className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all"
                                    style={{ backgroundColor: BRAND_COLORS.orange }}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Staff
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        {filteredStaff.length === 0 ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No staff members found</p>
                                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                                </div>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50/80 sticky top-0 z-10">
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Staff Member
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Tasks
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map((staff) => {
                                        const statusStyle = statusStyles[staff.status];
                                        const StatusIcon = statusStyle.icon;
                                        const progressPercent = (staff.tasksCompleted / staff.tasksTotal) * 100;
                                        const isHovered = hoveredRow === staff.id;

                                        return (
                                            <tr
                                                key={staff.id}
                                                className={cn(
                                                    "border-b border-gray-100 last:border-0 transition-all duration-200",
                                                    isHovered && "bg-gray-50"
                                                )}
                                                onMouseEnter={() => setHoveredRow(staff.id)}
                                                onMouseLeave={() => setHoveredRow(null)}
                                            >
                                                {/* Staff Member */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                                            <AvatarImage src={staff.avatar} alt={staff.name} />
                                                            <AvatarFallback
                                                                className="text-white text-sm font-bold"
                                                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                                                            >
                                                                {staff.name.split(" ").map((n) => n[0]).join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-sm leading-tight">{staff.name}</p>
                                                            <p className="text-xs text-gray-500">{staff.role}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Department */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Building2 className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm">{staff.department}</span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-6">
                                                    <span
                                                        className={cn(
                                                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                                                            statusStyle.bg,
                                                            statusStyle.text
                                                        )}
                                                    >
                                                        <StatusIcon className="w-3.5 h-3.5" />
                                                        {staff.status}
                                                    </span>
                                                </td>

                                                {/* Tasks Progress */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${progressPercent}%`,
                                                                    backgroundColor: BRAND_COLORS.indigo,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500 font-medium min-w-[50px]">
                                                            {staff.tasksCompleted}/{staff.tasksTotal}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Rating */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1.5">
                                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {staff.rating}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions - Edit & Terminate */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        // ✅ CORRECTED
<button
    onClick={() => {
        setStaffToDelete(staff);
        setIsDeleteModalOpen(true);
    }}
    className={cn(
        "p-2 rounded-lg transition-all duration-200",
        isHovered
            ? "opacity-100 bg-red-50 text-red-600"
            : "opacity-50 text-gray-400",
        "hover:bg-red-100 hover:scale-105"
    )}
    title="Terminate"
>
    <Trash2 className="w-4 h-4" />
</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            <AddStaffDialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen} />

            {/* Delete Staff Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md p-0 bg-white border-gray-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Terminate Staff</h3>
                                <p className="text-sm opacity-80">This action cannot be undone</p>
                            </div>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="text-white/60 hover:text-white/80 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-white">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Confirm Termination</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                    Are you sure you want to permanently delete <span className="font-semibold">{staffToDelete?.name}</span>?
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type <span className="font-semibold">{staffToDelete?.name}</span> to confirm:
                                </label>
                                <Input
                                    value={confirmName}
                                    onChange={(e) => setConfirmName(e.target.value)}
                                    placeholder="Enter full name"
                                    className="w-full"
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    disabled={confirmName !== staffToDelete?.name}
                                    onClick={deleteStaff}
                                    className="min-w-[120px]"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};


export default StaffManagement;
