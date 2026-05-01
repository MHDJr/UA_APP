"use client";

import { useState, useEffect, useMemo } from "react";
import {
    Plus,
    Calendar,
    Clock,
    Users,
    Target,
    ChevronLeft,
    ChevronRight,
    Video,
    MapPin,
    MoreVertical,
    Loader2,
    Check,
    ArrowRight,
    Rocket,
    ListTodo,
    CheckSquare,
    Edit,
    Trash2,
    X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, addDays, startOfWeek, isSameDay, isToday, parseISO } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase, Profile, Meeting as SupabaseMeeting } from "@/lib/supabase";
import { toast } from "sonner";
import MeetingEditDialog from "@/components/meeting-edit-dialog";

// ============================================
// BRAND COLORS
// ============================================
const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
    background: "#F9FAFB",
};

// ============================================
// TYPES
// ============================================
type MeetingPriority = "standard" | "urgent";

type Participant = {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    initials: string;
};

type EnrichedMeeting = SupabaseMeeting & {
    priority: MeetingPriority;
    participants: Participant[];
    location: string;
    type: "video" | "in-person";
    formattedStartTime: string;
    formattedEndTime: string;
    meetingDate: Date;
    agenda?: string; // Add agenda property
};

// ============================================
// WEEK VIEW SELECTOR COMPONENT
// ============================================
function WeekViewSelector({
    selectedDate,
    onSelectDate,
    meetingDates,
}: {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    meetingDates: Date[];
}) {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const navigateWeek = (direction: "prev" | "next") => {
        const newDate = addDays(selectedDate, direction === "prev" ? -7 : 7);
        onSelectDate(newDate);
    };

    // Helper to check if a day has meetings
    const hasMeetingOnDay = (day: Date) => {
        return meetingDates.some((meetingDate) => isSameDay(meetingDate, day));
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => navigateWeek("prev")}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <ChevronLeft className="w-4 h-4" style={{ color: BRAND_COLORS.indigo }} />
            </button>
            <div className="flex gap-1">
                {weekDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isTodayDate = isToday(day);
                    const hasMeeting = hasMeetingOnDay(day);

                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onSelectDate(day)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[48px] h-14 rounded-xl transition-all duration-200",
                                isSelected
                                    ? "shadow-md"
                                    : "hover:bg-gray-50"
                            )}
                            style={{
                                backgroundColor: isSelected ? BRAND_COLORS.indigo : undefined,
                            }}
                        >
                            <span
                                className={cn(
                                    "text-[10px] font-medium uppercase tracking-wider",
                                    isSelected ? "text-white/70" : "text-gray-400"
                                )}
                            >
                                {format(day, "EEE")}
                            </span>
                            <span
                                className={cn(
                                    "text-sm font-bold",
                                    isSelected ? "text-white" : "text-gray-700",
                                    hasMeeting && !isSelected && "text-red-500"
                                )}
                            >
                                {format(day, "d")}
                            </span>
                            {/* Today indicator dot only */}
                            {isTodayDate && (
                                <div
                                    className="w-1 h-1 rounded-full mt-0.5"
                                    style={{
                                        backgroundColor: isSelected ? "white" : BRAND_COLORS.orange,
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            <button
                onClick={() => navigateWeek("next")}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <ChevronRight className="w-4 h-4" style={{ color: BRAND_COLORS.indigo }} />
            </button>
        </div>
    );
}

// ============================================
// MEETING CARD COMPONENT
// ============================================
function MeetingCard({
    meeting,
    isSelected,
    onClick,
    onEdit,
    onCancel,
}: {
    meeting: EnrichedMeeting;
    isSelected: boolean;
    onClick: () => void;
    onEdit: () => void;
    onCancel: () => void;
}) {
    const borderColor = meeting.priority === "urgent" ? BRAND_COLORS.orange : BRAND_COLORS.indigo;

    return (
        <div
            className={cn(
                "w-full rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
                isSelected && "ring-2 ring-offset-2"
            )}
            style={{
                boxShadow: isSelected ? `0 4px 20px rgba(49, 38, 125, 0.15)` : undefined,
                borderRadius: "12px",
                "--tw-ring-color": isSelected ? BRAND_COLORS.indigo : undefined,
            } as React.CSSProperties}
        >
            <div className="flex">
                {/* Left Border Indicator */}
                <div
                    className="w-1 flex-shrink-0"
                    style={{ backgroundColor: borderColor }}
                />

                {/* Card Content */}
                <div className="flex-1 p-4">
                    {/* Time */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{meeting.formattedStartTime} - {meeting.formattedEndTime}</span>
                    </div>

                    {/* Title */}
                    <h3
                        className="font-semibold text-gray-900 mb-3 line-clamp-1"
                        style={{ color: BRAND_COLORS.indigo }}
                    >
                        {meeting.title}
                    </h3>

                    {/* Participant Stack */}
                    <div className="flex items-center">
                        <div className="flex -space-x-2">
                            {meeting.participants.slice(0, 3).map((participant, index) => (
                                <Avatar
                                    key={participant.id}
                                    className="w-7 h-7 border-2 border-white ring-1 ring-gray-100"
                                >
                                    {participant.avatar ? (
                                        <AvatarImage src={participant.avatar} alt={participant.name} />
                                    ) : (
                                        <AvatarFallback
                                            className="text-[10px] font-medium text-white"
                                            style={{
                                                backgroundColor: index === 0 ? BRAND_COLORS.indigo : "#6B7280",
                                            }}
                                        >
                                            {participant.initials}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                            ))}
                        </div>
                        {meeting.participants.length > 3 && (
                            <span className="ml-2 text-xs text-gray-400">
                                +{meeting.participants.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-200">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                    <Target className="w-4 h-4" />
                    View Details
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                >
                    <Edit className="w-4 h-4" />
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCancel();
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                    <Trash2 className="w-4 h-4" />
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ============================================
// MEETING DETAILS PANEL COMPONENT
// ============================================
function MeetingDetailsPanel({ meeting, staffList }: { meeting: EnrichedMeeting | null; staffList: Profile[] }) {
    const [preMeetingTasks, setPreMeetingTasks] = useState<any[]>([]);
    const [loadingTasks, setLoadingTasks] = useState(false);

    // Function to get user name by ID
    const getUserNameById = (userId: string): string => {
        const user = staffList.find(staff => staff.id === userId);
        return user ? user.full_name : userId; // Fallback to ID if not found
    };

    // Fetch pre-meeting tasks for this meeting
    useEffect(() => {
        if (meeting) {
            const fetchPreMeetingTasks = async () => {
                setLoadingTasks(true);
                try {
                    // Get all tasks (not just completed ones) - matching CEO page logic
                    const { data: tasksData, error } = await supabase
                        .from("tasks")
                        .select("*")
                        .order("created_at", { ascending: false });

                    if (!error && tasksData) {
                        console.log("All pre-meeting tasks:", tasksData);
                        console.log("Meeting title:", meeting.title);
                        console.log("Meeting ID:", meeting.id);
                        
                        // Filter tasks that are related to this meeting by checking multiple fields
                        const meetingTasks = tasksData.filter(task => {
                            // First, check if this is a pre-meeting task
                            const isPreMeetingTask = task.title?.toLowerCase().includes('[pre-meeting]') || 
                                                   task.description?.toLowerCase().includes('preparatory task for summit');
                            
                            if (!isPreMeetingTask) return false;
                            
                            const meetingTitle = meeting.title?.toLowerCase() || '';
                            const taskTitle = task.title?.toLowerCase() || '';
                            const taskDescription = task.description?.toLowerCase() || '';
                            
                            // Check if task description mentions this meeting title
                            const descriptionMatch = taskDescription.includes(meetingTitle);
                            
                            // Check if task description contains "summit:" and the meeting title
                            const summitMatch = taskDescription.includes('summit:') && 
                                             taskDescription.includes(meetingTitle);
                            
                            // Check if task title contains meeting title (after [PRE-MEETING])
                            const titleMatch = taskTitle.includes(meetingTitle);
                            
                            console.log(`Task "${taskTitle}" - Description: "${taskDescription}"`);
                            console.log(`Is pre-meeting: ${isPreMeetingTask}`);
                            console.log(`Matches: description=${descriptionMatch}, summit=${summitMatch}, title=${titleMatch}`);
                            
                            return descriptionMatch || summitMatch || titleMatch;
                        });
                        
                        console.log("Filtered meeting tasks:", meetingTasks);
                        setPreMeetingTasks(meetingTasks);
                    }
                } catch (error) {
                    console.error("Failed to fetch pre-meeting tasks:", error);
                } finally {
                    setLoadingTasks(false);
                }
            };

            fetchPreMeetingTasks();
        }
    }, [meeting]);

    // Parse agenda items from enhanced agenda format
    const parseAgendaItems = (agenda: string): Array<{topic: string; time: string; owner: string; completed: boolean}> => {
        if (!agenda) return [];
        
        const items: Array<{topic: string; time: string; owner: string; completed: boolean}> = [];
        
        console.log("Parsing agenda:", agenda);
        
        // Try to extract strategic agenda items
        const strategicAgendaMatch = agenda.match(/STRATEGIC AGENDA:\n([\s\S]*?)(?=\n\nLOGISTICS:|$)/);
        
        if (strategicAgendaMatch && strategicAgendaMatch[1]) {
            const agendaContent = strategicAgendaMatch[1];
            const agendaLines = agendaContent.split('\n').filter((line: string) => line.trim());
            
            console.log("Agenda content:", agendaContent);
            console.log("Agenda lines:", agendaLines);
            
            agendaLines.forEach((line: string) => {
                console.log("Processing line:", line);
                
                // Try the actual format from your example: "1. website report (afeef - 10m)"
                let match = line.match(/^\d+\.\s*(.+?)\s*\(([^)]+)\)$/);
                
                if (match) {
                    // Extract topic and the content inside parentheses
                    const topic = match[1].trim();
                    const parentheticalContent = match[2].trim();
                    
                    // Parse the parenthetical content: "afeef - 10m"
                    const parts = parentheticalContent.split(' - ');
                    const owner = parts[0]?.trim() || 'Unknown';
                    const time = parts[1]?.trim().replace('m', '') || '0';
                    
                    console.log(`Parsed: topic="${topic}", owner="${owner}", time="${time}"`);
                    
                    items.push({
                        topic,
                        owner,
                        time,
                        completed: false
                    });
                }
            });
        }
        
        console.log("Parsed items:", items);
        return items;
    };

    // Parse meeting details from agenda
    const parseMeetingDetails = (agenda: string) => {
        const details: any = {};
        const logisticsMatch = agenda.match(/LOGISTICS:\n([\s\S]*)/);
        
        if (logisticsMatch && logisticsMatch[1]) {
            const logisticsLines = logisticsMatch[1].split('\n');
            logisticsLines.forEach(line => {
                if (line.includes('Location/Link:')) {
                    details.location = line.split('Location/Link:')[1]?.trim();
                } else if (line.includes('Duration:')) {
                    details.duration = line.split('Duration:')[1]?.trim();
                } else if (line.includes('Classification:')) {
                    details.type = line.split('Classification:')[1]?.trim();
                } else if (line.includes('Priority:')) {
                    details.priority = line.split('Priority:')[1]?.trim();
                }
            });
        }
        
        return details;
    };

    if (!meeting) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${BRAND_COLORS.indigo}10` }}
                >
                    <Calendar className="w-8 h-8" style={{ color: BRAND_COLORS.indigo }} />
                </div>
                <h3
                    className="text-lg font-semibold mb-2"
                    style={{ color: BRAND_COLORS.indigo }}
                >
                    Select a Meeting
                </h3>
                <p className="text-sm text-gray-400 max-w-[200px]">
                    Click on any meeting card to view its details and intelligence
                </p>
            </div>
        );
    }

    const agendaItems = parseAgendaItems(meeting.agenda || '');
    const meetingDetails = parseMeetingDetails(meeting.agenda || '');

    return (
        <div className="h-full flex flex-col">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2
                                    className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                                >
                                    {meeting.title}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span
                                        className="text-xs font-bold px-3 py-1 rounded-full"
                                        style={{
                                            backgroundColor: meeting.priority === "urgent" ? `${BRAND_COLORS.orange}15` : `${BRAND_COLORS.indigo}10`,
                                            color: meeting.priority === "urgent" ? BRAND_COLORS.orange : BRAND_COLORS.indigo,
                                        }}
                                    >
                                        {meeting.priority === "urgent" ? "URGENT" : "STANDARD"}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {meetingDetails.type?.toUpperCase() || 'MEETING'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" style={{ color: BRAND_COLORS.indigo }} />
                                <span>{meeting.formattedStartTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" style={{ color: BRAND_COLORS.indigo }} />
                                <span>{meetingDetails.duration || '60m'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" style={{ color: BRAND_COLORS.indigo }} />
                                <span>{meetingDetails.location || meeting.location}</span>
                            </div>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            <ScrollArea className="flex-1 -mx-6 px-6">
                {/* Strategic Agenda Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                <ListTodo className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                                    Strategic Agenda
                                </h3>
                                <p className="text-sm text-gray-600 font-medium">Discussion points and topics</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {agendaItems.length} Items
                        </div>
                    </div>

                    {agendaItems.length > 0 ? (
                        <div className="space-y-3">
                            {agendaItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-lg flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">{index + 1}</span>
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900">{item.topic}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium">Speaker: {item.owner}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-medium">Duration: {item.time}min</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center ml-4">
                                            <Check className="w-4 h-4 text-green-600" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                            <ListTodo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No structured agenda items defined</p>
                            <p className="text-sm text-gray-400 mt-2">Basic agenda information available below</p>
                        </div>
                    )}

                    {/* Basic Agenda Fallback */}
                    {agendaItems.length === 0 && meeting.agenda && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-2xl">
                            <h4 className="text-sm font-bold text-gray-700 mb-2">Basic Agenda</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {meeting.agenda && meeting.agenda.includes('STRATEGIC AGENDA:') 
                                    ? meeting.agenda.split('\n\n')[1]?.trim() || meeting.agenda
                                    : meeting.agenda}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pre-Meeting Tasks Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                                <CheckSquare className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Pre-Meeting Tasks
                                </h3>
                                <p className="text-sm text-gray-600 font-medium">Required preparation work</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {preMeetingTasks.length} Tasks
                        </div>
                    </div>

                    {loadingTasks ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="ml-2 text-sm text-gray-600">Loading pre-meeting tasks...</span>
                        </div>
                    ) : preMeetingTasks.length > 0 ? (
                        <div className="space-y-3">
                            {preMeetingTasks.map((task, index) => (
                                <div
                                    key={task.id}
                                    className={`bg-gradient-to-r from-blue-50 to-cyan-50 border rounded-2xl p-4 transition-all duration-300 ${
                                        task.status === 'completed' 
                                            ? 'border-green-300 bg-green-50' 
                                            : 'border-blue-200/50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                    task.status === 'completed' 
                                                        ? 'bg-green-500' 
                                                        : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                                                }`}>
                                                    {task.status === 'completed' ? (
                                                        <Check className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <span className="text-white text-xs font-bold">{index + 1}</span>
                                                    )}
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900">{task.title}</h4>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium">Assigned to: {getUserNameById(task.assigned_to)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="font-medium">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</span>
                                                </div>
                                            </div>
                                            {task.description && (
                                                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center ml-4 gap-2">
                                            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                task.status === 'completed' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : task.status === 'in_progress'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {task.status === 'completed' ? 'COMPLETED' : 
                                                 task.status === 'in_progress' ? 'IN PROGRESS' : 'PENDING'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
                            <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No pre-meeting tasks assigned</p>
                            <p className="text-sm text-gray-400 mt-2">All preparation work is complete</p>
                        </div>
                    )}
                </div>

                {/* Key Participants Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Key Participants
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">Operatives assigned to this summit</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {meeting.participants.map((participant) => (
                            <div
                                key={participant.id}
                                className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                                        {participant.avatar ? (
                                            <AvatarImage src={participant.avatar} alt={participant.name} />
                                        ) : (
                                            <AvatarFallback
                                                className="text-sm font-bold text-white"
                                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                                            >
                                                {participant.initials}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-base font-bold text-gray-900">
                                            {participant.name}
                                        </p>
                                        <p className="text-sm text-gray-600 font-medium">{participant.role}</p>
                                    </div>
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Meeting Link if video */}
                {meeting.meeting_link && (
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                <Video className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Meeting Link
                                </h3>
                                <p className="text-sm text-gray-600 font-medium">Virtual meeting access</p>
                            </div>
                        </div>
                        <a
                            href={meeting.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-4 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-600 font-medium break-all flex-1">
                                    {meeting.meeting_link}
                                </span>
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center ml-4">
                                    <ArrowRight className="w-4 h-4 text-blue-600" />
                                </div>
                            </div>
                        </a>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}

// ============================================
// NEW MEETING DIALOG COMPONENT
// ============================================
function NewMeetingDialog({
    open,
    onOpenChange,
    onMeetingCreated,
    staffList,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMeetingCreated: () => void;
    staffList: Profile[];
}) {
    const [loading, setLoading] = useState(false);
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingAgenda, setMeetingAgenda] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
    const [meetingLink, setMeetingLink] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!meetingTitle.trim() || !meetingDate || selectedAttendees.length === 0) {
            toast.error("Please fill in meeting title, date/time, and select at least one attendee.");
            return;
        }

        setLoading(true);

        try {
            const startTime = new Date(meetingDate);
            const endTime = new Date(startTime.getTime() + 60 * 60000); // Default 1 hour

            const { error } = await supabase.from("meetings").insert({
                title: meetingTitle.trim(),
                description: meetingAgenda.trim(),
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                attendees: selectedAttendees,
                meeting_link: meetingLink.trim() || null,
            });

            if (error) throw error;

            // Notify attendees
            await supabase.from("notifications").insert(
                selectedAttendees.map((userId) => ({
                    user_id: userId,
                    title: "NEW MEETING SCHEDULED",
                    message: `CEO has scheduled a meeting: ${meetingTitle} at ${startTime.toLocaleString()}`,
                    type: "announcement",
                }))
            );

            toast.success("Meeting scheduled successfully");
            onOpenChange(false);
            resetForm();
            onMeetingCreated();
        } catch (error: any) {
            toast.error("Failed to schedule meeting: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setMeetingTitle("");
        setMeetingAgenda("");
        setMeetingDate("");
        setSelectedAttendees([]);
        setMeetingLink("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-lg">
                <DialogHeader>
                    <DialogTitle
                        className="text-lg font-bold flex items-center gap-2"
                        style={{ color: BRAND_COLORS.indigo }}
                    >
                        <Calendar className="h-5 w-5" />
                        Schedule New Meeting
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500">
                            Meeting Title
                        </Label>
                        <Input
                            placeholder="e.g. Strategy Sync"
                            value={meetingTitle}
                            onChange={(e) => setMeetingTitle(e.target.value)}
                            className="border-gray-200 focus:border-[#31267D] rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500">
                            Agenda / Goal
                        </Label>
                        <Textarea
                            placeholder="Describe the meeting goals..."
                            value={meetingAgenda}
                            onChange={(e) => setMeetingAgenda(e.target.value)}
                            rows={3}
                            className="border-gray-200 focus:border-[#31267D] rounded-xl resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold tracking-wider text-gray-500">
                                Date & Time
                            </Label>
                            <Input
                                type="datetime-local"
                                value={meetingDate}
                                onChange={(e) => setMeetingDate(e.target.value)}
                                className="border-gray-200 focus:border-[#31267D] rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold tracking-wider text-gray-500">
                                Meeting Link (Optional)
                            </Label>
                            <Input
                                placeholder="Zoom/Meet link..."
                                value={meetingLink}
                                onChange={(e) => setMeetingLink(e.target.value)}
                                className="border-gray-200 focus:border-[#31267D] rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500">
                            Select Attendees
                        </Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100">
                            {staffList.map((s) => {
                                const isSelected = selectedAttendees.includes(s.id);
                                return (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedAttendees(selectedAttendees.filter((id) => id !== s.id));
                                            } else {
                                                setSelectedAttendees([...selectedAttendees, s.id]);
                                            }
                                        }}
                                        className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 ${
                                            isSelected
                                                ? "bg-[#31267D]/10 border-[#31267D] text-gray-900"
                                                : "bg-white border-transparent text-gray-600 hover:border-gray-200"
                                        }`}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                                isSelected ? "bg-[#31267D] text-white" : "bg-gray-200"
                                            }`}
                                        >
                                            {isSelected && (
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className="text-[11px] font-bold truncate">{s.full_name}</div>
                                            <div className="text-[8px] text-gray-400 truncate">{s.department || s.role}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedAttendees.length > 0 && (
                            <div className="flex items-center gap-2 text-[10px]" style={{ color: BRAND_COLORS.indigo }}>
                                <span>
                                    {selectedAttendees.length} attendee{selectedAttendees.length > 1 ? "s" : ""} selected
                                </span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-gray-200 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="text-white font-medium rounded-xl"
                            style={{ backgroundColor: BRAND_COLORS.orange }}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Schedule Meeting
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ============================================
// MAIN SCHEDULED MEETINGS COMPONENT
// ============================================
export default function ScheduledMeetings() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedMeeting, setSelectedMeeting] = useState<EnrichedMeeting | null>(null);
    const [meetings, setMeetings] = useState<EnrichedMeeting[]>([]);
    const [staffList, setStaffList] = useState<Profile[]>([]);
    const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // 3-step meeting dialog states
    const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);
    const [meetingStep, setMeetingStep] = useState(1);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);

    // New edit dialog state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<EnrichedMeeting | null>(null);

    // Edit and Cancel handlers
    const handleEditMeeting = (meeting: EnrichedMeeting) => {
        setEditingMeeting(meeting);
        setIsEditDialogOpen(true);
    };

    const handleCancelMeeting = async (meeting: EnrichedMeeting) => {
        if (!confirm(`Are you sure you want to permanently cancel "${meeting.title}"? This will remove the meeting and all related tasks permanently.`)) {
            return;
        }

        try {
            // 1. Delete the meeting
            const { error: meetingError } = await supabase
                .from("meetings")
                .delete()
                .eq("id", meeting.id);

            if (meetingError) throw meetingError;

            // 2. Delete related pre-meeting tasks
            // First, find all pre-meeting tasks related to this meeting
            const { data: relatedTasks, error: fetchError } = await supabase
                .from("tasks")
                .select("*")
                .ilike("title", `[PRE-MEETING]`)
                .ilike("description", `%${meeting.title}%`);

            if (fetchError) throw fetchError;

            console.log("Found related tasks to delete:", relatedTasks);

            // Delete each related task individually
            for (const task of relatedTasks || []) {
                const { error: deleteError } = await supabase
                    .from("tasks")
                    .delete()
                    .eq("id", task.id);

                if (deleteError) {
                    console.error("Failed to delete task:", task.id, deleteError);
                } else {
                    console.log("Successfully deleted task:", task.id);
                }
            }

            // 3. Delete meeting participants (if table exists)
            try {
                const { error: participantsError } = await supabase
                    .from("meeting_participants")
                    .delete()
                    .eq("meeting_id", meeting.id);

                if (participantsError) {
                    console.log("Meeting participants table not found or error:", participantsError);
                }
            } catch (error) {
                console.log("Could not delete meeting participants:", error);
            }

            toast.success(`Meeting "${meeting.title}" and all related data have been permanently deleted.`);
            
            // Refresh meetings list
            fetchMeetings();
            
            // Clear selected meeting if it was the deleted one
            if (selectedMeeting?.id === meeting.id) {
                setSelectedMeeting(null);
            }
        } catch (error: any) {
            console.error("Failed to cancel meeting:", error);
            toast.error("Failed to cancel meeting: " + error.message);
        }
    };
    const [newMeeting, setNewMeeting] = useState({
        title: "",
        agenda: "",
        date: "",
        time: "",
        duration: "60",
        location: "",
        type: "strategic",
        priority: "medium",
        outcome: "decision",
        participants: [] as string[],
        agendaItems: [] as Array<{ id: string; topic: string; owner: string; time: string }>,
        preMeetingTasks: [] as Array<{ id: string; title: string; assignedTo: string; deadline: string }>,
    });

    // Fetch staff list
    const fetchStaff = async () => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .neq("role", "ceo")
            .order("full_name");

        if (!error && data) {
            setStaffList(data);
        }
    };

    // Handle schedule meeting for 3-step dialog
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

            // Format dynamic agenda items into a single string for now if DB doesn't support JSON yet.
            let fullAgenda = newMeeting.agenda || "";
            if (newMeeting.agendaItems.length > 0) {
                fullAgenda =
                    "STRATEGIC AGENDA:\n" +
                    newMeeting.agendaItems
                        .map((item, i) => {
                            const ownerName =
                                item.owner === "CEO"
                                    ? "CEO"
                                    : staffList.find((s) => s.id === item.owner)?.full_name || "Unknown";
                            return `${i + 1}. ${item.topic} (${item.time}min) - ${ownerName}`;
                        })
                        .join("\n") +
                    "\n\n" +
                    (newMeeting.agenda
                        ? `ADDITIONAL NOTES:\n${newMeeting.agenda}`
                        : "");
            }

            // Append location and other new fields to agenda notes as a fallback
            const meetingDetails = `\n\nLOGISTICS:\nLocation/Link: ${newMeeting.location || "TBD"}\nDuration: ${newMeeting.duration}m\nClassification: ${newMeeting.type.toUpperCase()}\nPriority: ${newMeeting.priority.toUpperCase()}`;
            fullAgenda += meetingDetails;

            // 1. Create meeting with basic fields first
            
            // Calculate start and end times
            const startTime = scheduledAt;
            const endTime = new Date(new Date(scheduledAt).getTime() + (parseInt(newMeeting.duration) || 60) * 60000).toISOString();
            
            try {
                let result;
                if (isEditMode && editingMeetingId) {
                    // Update existing meeting
                    result = await supabase
                        .from("meetings")
                        .update({
                            title: newMeeting.title,
                            agenda: fullAgenda,
                            scheduled_at: scheduledAt,
                            start_time: startTime,
                            end_time: endTime,
                            duration_minutes: parseInt(newMeeting.duration) || 60,
                            attendees: newMeeting.participants,
                            participants: newMeeting.participants,
                        })
                        .eq("id", editingMeetingId)
                        .select()
                        .single();
                } else {
                    // Create new meeting
                    result = await supabase
                        .from("meetings")
                        .insert({
                            title: newMeeting.title,
                            agenda: fullAgenda,
                            scheduled_at: scheduledAt,
                            start_time: startTime,
                            end_time: endTime,
                            duration_minutes: parseInt(newMeeting.duration) || 60,
                            attendees: newMeeting.participants,
                            participants: newMeeting.participants,
                        })
                        .select()
                        .single();
                }

                if (result.error) throw result.error;
                var meeting = result.data;
            } catch (error: any) {
                console.error("Meeting insert failed:", error);
                
                // Fallback: try minimal meeting operation
                let fallbackResult;
                if (isEditMode && editingMeetingId) {
                    fallbackResult = await supabase
                        .from("meetings")
                        .update({
                            title: newMeeting.title,
                            scheduled_at: scheduledAt,
                            start_time: startTime,
                            end_time: endTime,
                            attendees: newMeeting.participants,
                            participants: newMeeting.participants,
                        })
                        .eq("id", editingMeetingId)
                        .select()
                        .single();
                } else {
                    fallbackResult = await supabase
                        .from("meetings")
                        .insert({
                            title: newMeeting.title,
                            scheduled_at: scheduledAt,
                            start_time: startTime,
                            end_time: endTime,
                            attendees: newMeeting.participants,
                            participants: newMeeting.participants,
                        })
                        .select()
                        .single();
                }

                if (fallbackResult.error) throw fallbackResult.error;
                var meeting = fallbackResult.data;
            }

            // 2. Add participants to meeting_participants table
            const participantData = newMeeting.participants.map((pid) => ({
                meeting_id: meeting.id,
                user_id: pid,
            }));

            const { error: participantError } = await supabase
                .from("meeting_participants")
                .insert(participantData);

            if (participantError) {
                console.error("Participant insert failed:", participantError);
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
                        created_by: staffList.find(s => s.role === "ceo")?.id,
                        due_date: newMeeting.date, // Use meeting date as deadline
                    }));

                if (tasksToInsert.length > 0) {
                    await supabase.from("tasks").insert(tasksToInsert);
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
                .from("notifications")
                .insert(notificationData);

            if (notifError) {
                console.error("Notification insert failed:", notifError);
            }

            if (isEditMode) {
                toast.success("EXECUTIVE SUMMIT UPDATED", {
                    description: `Meeting "${newMeeting.title}" has been updated successfully.`,
                });
            } else {
                toast.success("EXECUTIVE SUMMIT DEPLOYED", {
                    description: `Summons sent to ${newMeeting.participants.length} operatives.`,
                });
            }
            setIsScheduleMeetingOpen(false);

            // Reset state
            setNewMeeting({
                title: "",
                type: "strategic",
                priority: "medium",
                outcome: "decision",
                date: "",
                time: "",
                duration: "60",
                location: "",
                agenda: "",
                participants: [],
                agendaItems: [],
                preMeetingTasks: [],
            });
            setMeetingStep(1);
            setIsEditMode(false);
            setEditingMeetingId(null);
            fetchMeetings();
        } catch (error) {
            console.error("Meeting failed:", error);
            toast.error("Failed to deploy summit. Please check mission parameters.");
        }
    };

    // Fetch meetings with enriched data
    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const { data: meetingsData, error: meetingsError } = await supabase
                .from("meetings")
                .select("*")
                .order("start_time", { ascending: true });

            if (meetingsError) throw meetingsError;

            // Fetch all staff profiles for attendee lookup
            const { data: staffData } = await supabase
                .from("profiles")
                .select("*");

            const staffMap = new Map(staffData?.map((s) => [s.id, s]) || []);

            // Enrich meetings with participant details
            const enrichedMeetings: EnrichedMeeting[] = (meetingsData || []).map((meeting) => {
                const startTime = parseISO(meeting.start_time);
                const endTime = parseISO(meeting.end_time);

                // Build participant list from attendees
                const participants: Participant[] = (meeting.attendees || [])
                    .map((attendeeId: string) => {
                        const staff = staffMap.get(attendeeId);
                        return staff
                            ? {
                                  id: staff.id,
                                  name: staff.full_name,
                                  role: staff.designation || staff.department || staff.role,
                                  avatar: staff.avatar_url,
                                  initials: staff.full_name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2),
                              }
                            : null;
                    })
                    .filter((p: any): p is Participant => p !== null);

                // Determine priority based on meeting time proximity
                const hoursUntilMeeting = (startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
                const priority: MeetingPriority = hoursUntilMeeting <= 4 ? "urgent" : "standard";

                // Determine location type
                const hasLink = meeting.meeting_link && meeting.meeting_link.length > 0;
                const location = hasLink ? "Video Call" : "Conference Room";
                const type: "video" | "in-person" = hasLink ? "video" : "in-person";

                return {
                    ...meeting,
                    priority,
                    participants,
                    location,
                    type,
                    formattedStartTime: format(startTime, "h:mm a"),
                    formattedEndTime: format(endTime, "h:mm a"),
                    meetingDate: startTime,
                };
            });

            setMeetings(enrichedMeetings);
        } catch (error: any) {
            toast.error("Failed to load meetings: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchMeetings();
        fetchStaff();
    }, []);

    // Filter meetings for selected date
    const filteredMeetings = useMemo(() => {
        return meetings
            .filter((meeting) => isSameDay(meeting.meetingDate, selectedDate))
            .sort((a, b) => {
                // Sort by priority (urgent first) then by time
                if (a.priority === "urgent" && b.priority !== "urgent") return -1;
                if (a.priority !== "urgent" && b.priority === "urgent") return 1;
                return a.meetingDate.getTime() - b.meetingDate.getTime();
            });
    }, [meetings, selectedDate]);

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header Section */}
            <div className="flex items-center justify-between pt-[40px] pb-6 px-6">
                <div className="flex items-center gap-6">
                    <h1
                        className="text-2xl font-bold"
                        style={{ color: BRAND_COLORS.indigo }}
                    >
                        Scheduled Meetings
                    </h1>
                    <WeekViewSelector
                        selectedDate={selectedDate}
                        onSelectDate={setSelectedDate}
                        meetingDates={meetings.map((m) => m.meetingDate)}
                    />
                </div>
                <Button
                    onClick={() => setIsScheduleMeetingOpen(true)}
                    className="gap-2 text-white font-medium rounded-xl px-4 py-2.5 h-auto shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: BRAND_COLORS.orange }}
                >
                    <Plus className="w-4 h-4" />
                    New Meeting
                </Button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Meeting Feed - Left 60% */}
                <div className="w-[60%] flex flex-col px-6 pb-6">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND_COLORS.indigo }} />
                        </div>
                    ) : (
                        <ScrollArea className="flex-1">
                            <div className="space-y-3 pr-4">
                                {filteredMeetings.length > 0 ? (
                                    filteredMeetings.map((meeting) => (
                                        <MeetingCard
                                            key={meeting.id}
                                            meeting={meeting}
                                            isSelected={selectedMeeting?.id === meeting.id}
                                            onClick={() => setSelectedMeeting(meeting)}
                                            onEdit={() => handleEditMeeting(meeting)}
                                            onCancel={() => handleCancelMeeting(meeting)}
                                        />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                            style={{ backgroundColor: `${BRAND_COLORS.indigo}08` }}
                                        >
                                            <Calendar className="w-7 h-7" style={{ color: `${BRAND_COLORS.indigo}40` }} />
                                        </div>
                                        <p className="text-sm text-gray-400">No meetings scheduled for this day</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Intelligence Panel - Right 40% */}
                <div
                    className="w-[40%] border-l bg-white/50 backdrop-blur-sm"
                    style={{ borderColor: "rgba(0,0,0,0.05)" }}
                >
                    <div className="h-full p-6">
                        <MeetingDetailsPanel meeting={selectedMeeting} staffList={staffList} />
                    </div>
                </div>
            </div>

            {/* 3-Step Schedule Meeting Dialog */}
            <Dialog
                open={isScheduleMeetingOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsScheduleMeetingOpen(false);
                        setIsEditMode(false);
                        setEditingMeetingId(null);
                    } else {
                        setIsScheduleMeetingOpen(true);
                    }
                }}
            >
                <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-4xl rounded-3xl shadow-2xl overflow-hidden p-0 flex flex-col max-h-[90vh]">
                    {/* Header Area */}
                    <div className="bg-[#2F1E73] p-6 text-white relative flex-shrink-0">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FA4616]/20 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                        <div className="relative z-10 flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
                                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md shadow-inner">
                                        <Target className="h-6 w-6 text-[#FA4616]" />
                                    </div>
                                    {isEditMode ? "Edit Executive Summit" : "Executive Summit Deployment"}
                                </DialogTitle>
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2 ml-14">
                                    {isEditMode ? "Modify summit parameters & operative assignments" : "Configure intelligence parameters & operative assignments"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3].map((step) => (
                                    <div
                                        key={step}
                                        className="flex items-center"
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${meetingStep === step ? "bg-[#FA4616] text-white shadow-[0_0_15px_rgba(250,70,22,0.5)]" : meetingStep > step ? "bg-white/20 text-white" : "bg-white/5 text-white/30"}`}
                                        >
                                            {meetingStep > step ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                step
                                            )}
                                        </div>
                                        {step < 3 && (
                                            <div
                                                className={`w-8 h-0.5 mx-1 transition-all duration-300 ${meetingStep > step ? "bg-[#FA4616]/50" : "bg-white/10"}`}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <ScrollArea className="flex-1 p-6 custom-scrollbar">
                        {/* STEP 1: MEETING INFO */}
                        {meetingStep === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-gray-900">Core Parameters</h3>
                                    <p className="text-sm text-gray-600">Configure basic meeting information</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Title */}
                                    <div className="space-y-2 col-span-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500 ml-1">
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
                                            className="border-gray-200 focus:border-[#31267D] rounded-xl h-14 text-base font-bold placeholder:text-gray-400 transition-all px-5"
                                        />
                                    </div>

                                    {/* Type */}
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500 ml-1">
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
                                            <SelectTrigger className="border-gray-200 focus:border-[#31267D] h-14 rounded-xl px-5 font-bold">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                                                <SelectItem
                                                    value="strategic"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    Strategic Planning
                                                </SelectItem>
                                                <SelectItem
                                                    value="review"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    Performance Review
                                                </SelectItem>
                                                <SelectItem
                                                    value="emergency"
                                                    className="font-bold text-red-500 cursor-pointer"
                                                >
                                                    Emergency Protocol
                                                </SelectItem>
                                                <SelectItem
                                                    value="1-on-1"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    Direct 1-on-1
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500 ml-1">
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
                                            <SelectTrigger className="border-gray-200 focus:border-[#31267D] h-14 rounded-xl px-5 font-bold">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                                                <SelectItem
                                                    value="low"
                                                    className="font-bold text-slate-500 cursor-pointer"
                                                >
                                                    Low (Routine)
                                                </SelectItem>
                                                <SelectItem
                                                    value="medium"
                                                    className="font-bold text-blue-500 cursor-pointer"
                                                >
                                                    Medium (Standard)
                                                </SelectItem>
                                                <SelectItem
                                                    value="high"
                                                    className="font-bold text-orange-500 cursor-pointer"
                                                >
                                                    High (Accelerated)
                                                </SelectItem>
                                                <SelectItem
                                                    value="critical"
                                                    className="font-bold text-red-500 cursor-pointer"
                                                >
                                                    Critical (Immediate)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="my-6 border-b border-gray-200" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-gray-900">Logistics</h3>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    {/* Date */}
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500 ml-1">
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
                                            className="border-gray-200 focus:border-[#31267D] rounded-xl h-14 px-5 text-sm font-bold"
                                        />
                                    </div>

                                    {/* Time */}
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500 ml-1">
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
                                            className="border-gray-200 focus:border-[#31267D] rounded-xl h-14 px-5 text-sm font-bold"
                                        />
                                    </div>

                                    {/* Duration */}
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500 ml-1">
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
                                            <SelectTrigger className="border-gray-200 focus:border-[#31267D] h-14 rounded-xl px-5 font-bold">
                                                <SelectValue placeholder="Duration" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                                                <SelectItem
                                                    value="15"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    15 min (Briefing)
                                                </SelectItem>
                                                <SelectItem
                                                    value="30"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    30 min (Standard)
                                                </SelectItem>
                                                <SelectItem
                                                    value="60"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    60 min (Deep Dive)
                                                </SelectItem>
                                                <SelectItem
                                                    value="90"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    90 min (Extended)
                                                </SelectItem>
                                                <SelectItem
                                                    value="120"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    120 min (Summit)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-2">
                                    {/* Location */}
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500 ml-1">
                                            Location / Protocol Link
                                        </Label>
                                        <Input
                                            placeholder="e.g. Boardroom A, Zoom Link..."
                                            value={newMeeting.location}
                                            onChange={(e) =>
                                                setNewMeeting({
                                                    ...newMeeting,
                                                    location: e.target.value,
                                                })
                                            }
                                            className="border-gray-200 focus:border-[#31267D] rounded-xl h-14 text-sm font-bold placeholder:text-gray-400 transition-all px-5"
                                        />
                                    </div>
                                    {/* Outcome */}
                                    <div className="space-y-2">
                                        <Label className="text-xs uppercase font-bold tracking-wider text-gray-500 ml-1">
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
                                            <SelectTrigger className="border-gray-200 focus:border-[#31267D] h-14 rounded-xl px-5 font-bold">
                                                <SelectValue placeholder="Select outcome" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                                                <SelectItem
                                                    value="decision"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    Firm Decision
                                                </SelectItem>
                                                <SelectItem
                                                    value="discussion"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    Strategic Discussion
                                                </SelectItem>
                                                <SelectItem
                                                    value="approval"
                                                    className="font-bold cursor-pointer"
                                                >
                                                    Plan Approval
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold text-gray-900">Operative Selection</h3>
                                            <p className="text-sm text-gray-600">Select required personnel for this summit.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar bg-gray-50 p-3 rounded-2xl border border-gray-200">
                                            {staffList.map((s) => {
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
                                                                ? "bg-[#2F1E73]/5 border-[#2F1E73]"
                                                                : "bg-white border-transparent hover:border-gray-300"
                                                        }`}
                                                    >
                                                        <div className="relative">
                                                            <Avatar className="h-10 w-10 border-2 border-gray-200">
                                                                <AvatarImage
                                                                    src={
                                                                        s.avatar_url
                                                                    }
                                                                />
                                                                <AvatarFallback className="bg-gray-100 text-xs font-black">
                                                                    {s.full_name
                                                                        ?.substring(
                                                                            0,
                                                                            2,
                                                                        )
                                                                        .toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                        <div className="flex flex-col items-start min-w-0 flex-1">
                                                            <span
                                                                className={`text-xs font-black uppercase tracking-tight truncate w-full ${isSelected ? "text-[#2F1E73]" : "text-gray-700"}`}
                                                            >
                                                                {s.full_name}
                                                            </span>
                                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate w-full">
                                                                {s.designation ||
                                                                    s.department ||
                                                                    s.role}
                                                            </span>
                                                        </div>
                                                        <div
                                                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${isSelected ? "bg-[#2F1E73] text-white" : "bg-gray-200 text-transparent"}`}
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
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-gray-900">Strategic Agenda</h3>
                                            </div>
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
                                        <p className="text-sm text-gray-600">Build dynamic discussion points.</p>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {newMeeting.agendaItems.length ===
                                            0 ? (
                                                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                                                    <ListTodo className="h-6 w-6 text-gray-400 mb-2" />
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                        No agenda items defined
                                                    </p>
                                                </div>
                                            ) : (
                                                newMeeting.agendaItems.map(
                                                    (item, index) => (
                                                        <div
                                                            key={item.id}
                                                            className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 relative group"
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
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="space-y-1 pr-6">
                                                                <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500">
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
                                                                    className="h-10 bg-white border-gray-200 text-sm font-bold placeholder:text-gray-400"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500">
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
                                                                        <SelectTrigger className="h-10 bg-white border-gray-200 rounded-xl px-3 font-bold text-xs">
                                                                            <SelectValue placeholder="Assign" />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                                                                            {staffList
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
                                                                    <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500">
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
                                                                        className="h-10 bg-white border-gray-200 text-xs font-bold"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            )}

                                            {/* Textarea Fallback for quick notes if they don't want structured agenda */}
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <Label className="text-[10px] uppercase font-black tracking-wider text-gray-500 ml-1 mb-2 block">
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
                                                    className="bg-gray-50 border-gray-200 focus:border-[#31267D] rounded-xl min-h-[80px] text-xs font-bold placeholder:text-gray-400 transition-all resize-none"
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
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-gray-900">Pre-Meeting Directives</h3>
                                            </div>
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
                                                className="text-blue-600 hover:bg-blue-50 hover:text-blue-600 text-xs font-black uppercase tracking-widest gap-1 h-8 px-3 rounded-lg"
                                            >
                                                <Plus className="w-3 h-3" />{" "}
                                                Assign Task
                                            </Button>
                                        </div>
                                        <p className="text-sm text-gray-600">Assign preparatory tasks required before deployment.</p>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {newMeeting.preMeetingTasks
                                                .length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                                                    <CheckSquare className="h-6 w-6 text-gray-400 mb-2" />
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                        No pre-meeting tasks
                                                        required
                                                    </p>
                                                </div>
                                            ) : (
                                                newMeeting.preMeetingTasks.map(
                                                    (task, index) => (
                                                        <div
                                                            key={task.id}
                                                            className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 relative group"
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
                                                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>

                                                            <div className="space-y-1 pr-6">
                                                                <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500">
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
                                                                    className="h-10 bg-white border-gray-200 text-sm font-bold placeholder:text-gray-400"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500">
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
                                                                        <SelectTrigger className="h-10 bg-white border-gray-200 rounded-xl px-3 font-bold text-xs">
                                                                            <SelectValue placeholder="Assign" />
                                                                        </SelectTrigger>
                                                                        <SelectContent className="bg-white border-gray-200 rounded-xl shadow-xl">
                                                                            {staffList
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
                                                                    <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500">
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
                                                                        className="h-10 bg-white border-gray-200 text-xs font-bold"
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
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold text-gray-900">Deployment Summary</h3>
                                            <p className="text-sm text-gray-600">Review final parameters before executing protocol.</p>
                                        </div>

                                        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg space-y-6">
                                            {/* Header Info */}
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="text-base font-black uppercase tracking-tight text-gray-900 max-w-[200px] truncate">
                                                            {newMeeting.title ||
                                                                "Unnamed Summit"}
                                                        </h4>
                                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
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
                                                        <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">
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

                                            <div className="border-t border-gray-200" />

                                            {/* Operatives */}
                                            <div>
                                                <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500 block mb-3">
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
                                                                    staffList.find(
                                                                        (
                                                                            staff,
                                                                        ) =>
                                                                            staff.id ===
                                                                            id,
                                                                    );
                                                                return s ? (
                                                                    <div
                                                                        key={id}
                                                                        className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full pl-1 pr-3 py-1"
                                                                    >
                                                                        <Avatar className="h-4 w-4">
                                                                            <AvatarImage
                                                                                src={
                                                                                    s.avatar_url
                                                                                }
                                                                            />
                                                                            <AvatarFallback className="bg-gray-100 text-[8px] font-black">
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

                                            <div className="border-t border-gray-200" />

                                            {/* Agenda & Tasks Overviews */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500 block mb-2">
                                                        Agenda Topics
                                                    </Label>
                                                    <div className="text-xs font-black text-gray-900">
                                                        {
                                                            newMeeting
                                                                .agendaItems
                                                                .length
                                                        }{" "}
                                                        Defined
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500 block mb-2">
                                                        Pre-Meeting Tasks
                                                    </Label>
                                                    <div className="text-xs font-black text-gray-900">
                                                        {
                                                            newMeeting
                                                                .preMeetingTasks
                                                                .length
                                                        }{" "}
                                                        Assigned
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <Label className="text-[9px] uppercase font-black tracking-wider text-gray-500 block mb-2">
                                                        Location
                                                    </Label>
                                                    <div className="text-xs font-bold text-gray-900 bg-gray-50 p-2 rounded-lg break-all">
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

                    {/* Fixed Footer Actions */}
                    <div className="p-6 border-t border-gray-200 bg-white/80 backdrop-blur-md flex items-center justify-between flex-shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() =>
                                meetingStep > 1
                                    ? setMeetingStep((prev) => prev - 1)
                                    : setIsScheduleMeetingOpen(false)
                            }
                            className="text-gray-600 hover:text-gray-900 font-bold uppercase tracking-widest text-xs h-12 px-6 rounded-xl"
                        >
                            {meetingStep === 1
                                ? "Cancel Operation"
                                : "Back to Phase 1"}
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
                                className="bg-gray-900 text-white hover:bg-gray-800 h-12 px-8 font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] disabled:opacity-30 flex items-center gap-2"
                            >
                                Proceed <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleScheduleMeeting}
                                className="bg-gradient-to-r from-[#e86123] to-[#351e6a] text-white hover:shadow-lg hover:shadow-orange-500/20 h-12 px-8 font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all flex items-center gap-2 border-none group"
                            >
                                Deploy Meeting{" "}
                                <Rocket className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* New Edit Dialog */}
            <MeetingEditDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                meeting={editingMeeting}
                staffList={staffList}
                onMeetingUpdated={fetchMeetings}
            />
        </div>
    );
}
