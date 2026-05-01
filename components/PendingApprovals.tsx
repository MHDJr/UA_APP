"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Shield,
    Calendar,
    Briefcase,
    ArrowUpRight,
    Check,
    X,
    AlertCircle,
    Inbox,
    DollarSign,
    FileText,
    Clock,
    MessageSquare,
    Settings,
} from "lucide-react";

// Brand colors
const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
};

// Types of pending requests
export type RequestType = "leave" | "permission" | "work_adjustment" | "expense" | "feedback" | "budget" | "access_elevation" | "role_change";

export interface PendingRequest {
    id: string;
    staffId: string;
    staffName: string;
    staffAvatar?: string;
    staffInitials: string;
    requestType: RequestType;
    description: string;
    requestedAt: string;
    urgency?: "normal" | "high" | "urgent";
    // Leave request specific fields
    leaveType?: "casual" | "medical" | "emergency" | "early";
    dates?: string;
    totalDays?: number;
}

interface PendingApprovalsProps {
    requests: PendingRequest[];
    onApprove: (requestId: string) => void;
    onDecline: (requestId: string) => void;
    className?: string;
}

// Request type configuration
const requestTypeConfig: Record<
    RequestType,
    { icon: React.ElementType; label: string; color: string; bgColor: string }
> = {
    leave: {
        icon: Calendar,
        label: "Leave Request",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
    },
    permission: {
        icon: Clock,
        label: "Permission Request",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
    },
    work_adjustment: {
        icon: Settings,
        label: "Work Adjustment",
        color: "text-gray-600",
        bgColor: "bg-gray-50",
    },
    expense: {
        icon: DollarSign,
        label: "Expense Request",
        color: "text-green-600",
        bgColor: "bg-green-50",
    },
    feedback: {
        icon: MessageSquare,
        label: "Feedback Request",
        color: "text-indigo-600",
        bgColor: "bg-indigo-50",
    },
    budget: {
        icon: FileText,
        label: "Budget Request",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
    },
    role_change: {
        icon: Briefcase,
        label: "Role Change",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
    },
    access_elevation: {
        icon: Shield,
        label: "Access Elevation",
        color: "text-[#31267D]",
        bgColor: "bg-[#31267D]/10",
    },
};

// Leave type configuration
const leaveTypeConfig: Record<
    NonNullable<PendingRequest["leaveType"]>,
    { label: string; color: string; bgColor: string }
> = {
    casual: {
        label: "Casual Leave",
        color: "text-blue-500",
        bgColor: "bg-blue-100",
    },
    medical: {
        label: "Medical Leave",
        color: "text-red-500",
        bgColor: "bg-red-100",
    },
    emergency: {
        label: "Emergency Leave",
        color: "text-orange-500",
        bgColor: "bg-orange-100",
    },
    early: {
        label: "Early Leave",
        color: "text-purple-500",
        bgColor: "bg-purple-100",
    },
};

// Format relative time
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Individual request row component
const RequestRow = ({
    request,
    onApprove,
    onDecline,
    isProcessing,
}: {
    request: PendingRequest;
    onApprove: (id: string) => void;
    onDecline: (id: string) => void;
    isProcessing: boolean;
}) => {
    const config = requestTypeConfig[request.requestType];
    const Icon = config.icon;
    const urgencyColor =
        request.urgency === "urgent"
            ? "text-rose-600 bg-rose-50 border-rose-200"
            : request.urgency === "high"
            ? "text-amber-600 bg-amber-50 border-amber-200"
            : null;

    return (
        <div
            className={cn(
                "group flex items-center gap-4 p-4 rounded-xl",
                "transition-all duration-300",
                "hover:bg-white/60 hover:shadow-sm",
                "border border-transparent hover:border-[#31267D]/10"
            )}
        >
            {/* Avatar */}
            <Avatar className="w-11 h-11 border-2 border-white shadow-sm flex-shrink-0">
                <AvatarImage src={request.staffAvatar} alt={request.staffName} />
                <AvatarFallback
                    className="text-white text-xs font-semibold"
                    style={{ backgroundColor: BRAND_COLORS.indigo }}
                >
                    {request.staffInitials}
                </AvatarFallback>
            </Avatar>

            {/* Request Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">
                        {request.staffName}
                    </span>
                    <span className="text-gray-400">·</span>
                    <div
                        className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium",
                            config.bgColor,
                            config.color
                        )}
                    >
                        <Icon className="w-3 h-3" />
                        {config.label}
                    </div>
                    {request.urgency && request.urgency !== "normal" && (
                        <span
                            className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                urgencyColor
                            )}
                        >
                            {request.urgency === "urgent" ? "Urgent" : "High Priority"}
                        </span>
                    )}
                    {/* Leave type badge for leave requests */}
                    {request.requestType === "leave" && request.leaveType && (
                        <span
                            className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium",
                                leaveTypeConfig[request.leaveType].bgColor,
                                leaveTypeConfig[request.leaveType].color
                            )}
                        >
                            {leaveTypeConfig[request.leaveType].label}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600 mt-0.5 truncate">
                    {request.description}
                </p>
                {/* Leave date information for leave requests */}
                {request.requestType === "leave" && (request.dates || request.totalDays) && (
                    <div className="flex items-center gap-3 mt-1">
                        {request.dates && (
                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{request.dates}</span>
                            </div>
                        )}
                        {request.totalDays && (
                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{request.totalDays} day{request.totalDays > 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                )}
                <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatRelativeTime(request.requestedAt)}
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                    size="sm"
                    onClick={() => onDecline(request.id)}
                    disabled={isProcessing}
                    className={cn(
                        "h-9 px-4 rounded-lg text-white text-xs font-semibold",
                        "shadow-lg shadow-red-500/20",
                        "hover:shadow-xl hover:shadow-red-500/30 hover:scale-[1.02]",
                        "active:scale-[0.98]",
                        "transition-all duration-200"
                    )}
                    style={{ backgroundColor: "#EF4444" }}
                >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Reject
                </Button>
                <Button
                    size="sm"
                    onClick={() => onApprove(request.id)}
                    disabled={isProcessing}
                    className={cn(
                        "h-9 px-4 rounded-lg text-white text-xs font-semibold",
                        "shadow-lg shadow-green-500/20",
                        "hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.02]",
                        "active:scale-[0.98]",
                        "transition-all duration-200"
                    )}
                    style={{ backgroundColor: "#10B981" }}
                >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Approve
                </Button>
            </div>
        </div>
    );
};

// Empty state component
const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
        <div
            className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                "bg-gradient-to-br from-[#31267D]/10 to-[#31267D]/5"
            )}
        >
            <Shield className="w-7 h-7 text-[#31267D]" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 tracking-tight">
            System Fully Authorized
        </h3>
        <p className="text-sm text-gray-500 mt-1 text-center max-w-xs">
            All pending requests have been processed. No approvals required at this time.
        </p>
    </div>
);

export function PendingApprovals({
    requests,
    onApprove,
    onDecline,
    className,
}: PendingApprovalsProps) {
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    const handleApprove = async (requestId: string) => {
        setProcessingIds((prev) => new Set(prev).add(requestId));
        try {
            await onApprove(requestId);
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const handleDecline = async (requestId: string) => {
        setProcessingIds((prev) => new Set(prev).add(requestId));
        try {
            await onDecline(requestId);
        } finally {
            setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    const pendingCount = requests.filter(
        (r) => !processingIds.has(r.id)
    ).length;

    return (
        <div
            className={cn(
                "relative rounded-2xl overflow-hidden",
                "backdrop-blur-xl bg-white/60",
                "border border-[#31267D]/10",
                "shadow-[0_4px_24px_rgba(49,38,125,0.06)]",
                className
            )}
        >
            {/* Subtle indigo tint overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    background: `linear-gradient(180deg, rgba(49,38,125,0.03) 0%, transparent 50%)`,
                }}
            />

            {/* Header */}
            <div className="relative flex items-center justify-between px-5 py-4 border-b border-[#31267D]/10">
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center",
                            "bg-[#31267D]/10"
                        )}
                    >
                        <Inbox className="w-4 h-4 text-[#31267D]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                            Priority Action Hub
                        </h3>
                        <p className="text-[11px] text-gray-500">
                            {pendingCount > 0
                                ? `${pendingCount} request${pendingCount !== 1 ? "s" : ""} awaiting your review`
                                : "All caught up"}
                        </p>
                    </div>
                </div>

                {pendingCount > 0 && (
                    <span
                        className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold",
                            "bg-[#F14D24]/10 text-[#F14D24]"
                        )}
                    >
                        {pendingCount}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="relative p-2">
                {requests.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-1">
                        {requests.map((request, index) => (
                            <div
                                key={request.id}
                                className="ua-entry-animate"
                                style={{ animationDelay: `${index * 80}ms` }}
                            >
                                <RequestRow
                                    request={request}
                                    onApprove={handleApprove}
                                    onDecline={handleDecline}
                                    isProcessing={processingIds.has(request.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer - only show if there are requests */}
            {requests.length > 0 && (
                <div className="relative px-5 py-3 border-t border-[#31267D]/10 bg-white/40">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Review requests carefully before approval</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PendingApprovals;
