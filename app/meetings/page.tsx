"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import MobileNavigation from "@/components/mobile-navigation";
import {
    Calendar,
    Clock,
    Video,
    Users,
    RefreshCw,
    Info,
    MapPin,
    Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

interface Meeting {
    id: string;
    title: string;
    scheduled_at: string;
    duration_minutes?: number;
    platform?: string;
    location?: string;
    agenda?: string;
    participants?: any[];
}

export default function MeetingsPage() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        if (!user || !profile) {
            router.push("/");
            return;
        }

        if (!["staff", "manager", "ceo", "sales"].includes(profile.role)) {
            router.push("/");
            return;
        }

        fetchMeetings();
    }, [user, profile, router]);

    const fetchMeetings = async () => {
        try {
            setRefreshing(true);
            console.log("Fetching meetings for mobile page...");
            
            // Use the same approach as staff portal
            const { data: meetings, error: meetingsError } = await supabase
                .from("meetings")
                .select("*")
                .order("scheduled_at", { ascending: true })
                .limit(50);

            console.log("Meetings fetched:", meetings);
            console.log("Meetings error:", meetingsError);
            
            if (meetingsError) {
                console.error("Meetings error:", meetingsError);
                if (meetingsError.message?.includes('permission denied')) {
                    console.error("RLS policy blocking access");
                }
                toast.error("Failed to fetch meetings");
                return;
            }

            if (meetings && meetings.length > 0) {
                console.log(`Found ${meetings.length} meetings, processing...`);
                
                const meetingsWithBasicInfo = meetings.map(meeting => ({
                    ...meeting,
                    participants: [], // Default to empty array
                    title: meeting.title || 'Untitled Meeting',
                    scheduled_at: meeting.scheduled_at,
                    duration_minutes: meeting.duration_minutes || 30,
                    platform: meeting.platform || 'On-Site'
                }));
                
                // Try to get participants
                try {
                    const meetingIds = meetings.map(m => m.id);
                    const { data: participants, error: participantsError } = await supabase
                        .from("meeting_participants")
                        .select(`
                            *,
                            profiles!meeting_participants_user_id_fkey (
                                id,
                                full_name,
                                username,
                                avatar_url
                            )
                        `)
                        .in("meeting_id", meetingIds);

                    if (!participantsError && participants) {
                        const meetingsWithParticipants = meetingsWithBasicInfo.map(meeting => {
                            const meetingParticipants = participants
                                .filter(p => p.meeting_id === meeting.id)
                                .map(p => p.profiles)
                                .filter(Boolean);
                            
                            return {
                                ...meeting,
                                participants: meetingParticipants
                            };
                        });
                        
                        console.log("Meetings with participants loaded:", meetingsWithParticipants.length);
                        setMeetings(meetingsWithParticipants);
                    } else {
                        console.log("Using meetings without participants due to error");
                        setMeetings(meetingsWithBasicInfo);
                    }
                } catch (participantError) {
                    console.error("Error fetching participants:", participantError);
                    console.log("Using meetings without participants");
                    setMeetings(meetingsWithBasicInfo);
                }
            } else {
                console.log("No meetings found in database");
                setMeetings([]);
            }
        } catch (error) {
            console.error("Error fetching meetings:", error);
            toast.error("Something went wrong fetching meetings");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const openMeetingDetails = (meeting: Meeting) => {
        setSelectedMeeting(meeting);
        setIsDetailsOpen(true);
    };

    const closeMeetingDetails = () => {
        setIsDetailsOpen(false);
        setSelectedMeeting(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-[#2C2171]/20 border-t-[#2C2171] rounded-full mx-auto mb-4"></div>
                    <p className="text-sm text-slate-600 font-medium">Loading meetings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F7FE] text-slate-800 font-sans selection:bg-orange-100 pb-24 md:pb-8">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#2C2171] to-[#3F348C] rounded-xl flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900">Meetings</h1>
                            <p className="text-[10px] text-slate-500">Your scheduled meetings</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchMeetings}
                        disabled={refreshing}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="p-4 md:p-8">
                {/* Stats Card */}
                <div className="mb-6">
                    <div className="bg-white rounded-[20px] p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-[#2C2171]" />
                            <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900">{meetings.length}</p>
                        <p className="text-[9px] text-slate-500">Scheduled meetings</p>
                    </div>
                </div>

                {/* Meetings List */}
                <div className="space-y-3">
                    {refreshing ? (
                        <div className="text-center py-8">
                            <div className="animate-spin h-6 w-6 border-2 border-[#2C2171] border-t-transparent rounded-full mx-auto mb-3"></div>
                            <p className="text-sm text-slate-600 font-medium">Refreshing meetings...</p>
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-[20px] border border-slate-100">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No scheduled meetings</h3>
                            <p className="text-sm text-slate-500 mb-4">Check back later for upcoming meetings</p>
                            <Button
                                onClick={fetchMeetings}
                                className="bg-[#2C2171] hover:bg-[#2C2171]/90 text-white rounded-xl"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    ) : (
                        meetings.map((meeting) => {
                            const isAssigned = meeting.participants?.some(p => p.id === profile?.id);
                            const meetingDate = new Date(meeting.scheduled_at);
                            
                            return (
                                <div
                                    key={meeting.id}
                                    className={`bg-white rounded-[20px] p-4 border transition-all ${
                                        isAssigned
                                            ? "border-[#2C2171]/20 shadow-sm"
                                            : "border-slate-200"
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-base font-bold text-slate-900 mb-1">{meeting.title}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{format(meetingDate, "MMM d, yyyy")}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{format(meetingDate, "h:mm a")}</span>
                                                </div>
                                                {meeting.duration_minutes && (
                                                    <div className="flex items-center gap-1">
                                                        <Timer className="w-3 h-3" />
                                                        <span>{meeting.duration_minutes}m</span>
                                                    </div>
                                                )}
                                            </div>
                                            {(meeting.platform || meeting.location) && (
                                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                                    {meeting.platform ? (
                                                        <>
                                                            <Video className="w-3 h-3" />
                                                            <span>{meeting.platform}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MapPin className="w-3 h-3" />
                                                            <span>{meeting.location}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAssigned && (
                                                <div className="w-2 h-2 bg-[#2C2171] rounded-full"></div>
                                            )}
                                            <Button
                                                size="sm"
                                                onClick={() => openMeetingDetails(meeting)}
                                                className="bg-[#2C2171] hover:bg-[#2C2171]/90 text-white rounded-lg h-8 px-3 text-xs"
                                            >
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {meeting.participants && meeting.participants.length > 0 && (
                                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                            <Users className="w-3 h-3 text-slate-400" />
                                            <div className="flex -space-x-2">
                                                {meeting.participants.slice(0, 4).map((participant, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-6 h-6 bg-[#2C2171] text-white rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white"
                                                        title={participant.full_name}
                                                    >
                                                        {participant.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                ))}
                                                {meeting.participants.length > 4 && (
                                                    <div className="w-6 h-6 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white">
                                                        +{meeting.participants.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-slate-500">
                                                {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* Meeting Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={closeMeetingDetails}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-white via-[#F8FAFF] to-white border-0 shadow-2xl">
                    {/* Dialog Header with Gradient Background */}
                    <div className="relative bg-gradient-to-r from-[#2C2171] via-[#3F348C] to-[#2C2171] p-6 text-white">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#FA4615]/20 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10">
                            <DialogHeader className="p-0">
                                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                        <Calendar className="w-6 h-6 text-white" />
                                    </div>
                                    Meeting Details
                                </DialogTitle>
                            </DialogHeader>
                        </div>
                    </div>

                    {selectedMeeting && (
                        <ScrollArea className="max-h-[calc(90vh-120px)]">
                            <div className="p-6 space-y-6">
                                {/* Meeting Title Card */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E5E7EB] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#2C2171]/10 to-transparent rounded-full"></div>
                                    <h3 className="text-2xl font-bold text-[#1E293B] mb-4 pr-20">
                                        {selectedMeeting.title}
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-[#F8FAFF] rounded-xl border border-[#E5E7EB]">
                                            <div className="p-2 bg-[#2C2171] rounded-lg">
                                                <Calendar className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Date</p>
                                                <p className="text-sm font-bold text-[#1E293B]">
                                                    {format(new Date(selectedMeeting.scheduled_at), "MMM d, yyyy")}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 p-3 bg-[#F8FAFF] rounded-xl border border-[#E5E7EB]">
                                            <div className="p-2 bg-blue-500 rounded-lg">
                                                <Clock className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Time</p>
                                                <p className="text-sm font-bold text-[#1E293B]">
                                                    {format(new Date(selectedMeeting.scheduled_at), "h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {selectedMeeting.duration_minutes && (
                                            <div className="flex items-center gap-3 p-3 bg-[#F8FAFF] rounded-xl border border-[#E5E7EB]">
                                                <div className="p-2 bg-green-500 rounded-lg">
                                                    <Timer className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Duration</p>
                                                    <p className="text-sm font-bold text-[#1E293B]">
                                                        {selectedMeeting.duration_minutes}m
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Platform/Location Card */}
                                {(selectedMeeting.platform || selectedMeeting.location) && (
                                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E5E7EB]">
                                        <h4 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-[#FA4615]/20 rounded-lg">
                                                {selectedMeeting.platform ? (
                                                    <Video className="w-5 h-5 text-[#FA4615]" />
                                                ) : (
                                                    <MapPin className="w-5 h-5 text-[#FA4615]" />
                                                )}
                                            </div>
                                            {selectedMeeting.platform ? "Meeting Platform" : "Location"}
                                        </h4>
                                        <div className="p-4 bg-gradient-to-r from-[#FA4615]/10 to-[#FA4615]/5 rounded-xl border border-[#FA4615]/20">
                                            <p className="text-lg font-bold text-[#1E293B]">
                                                {selectedMeeting.platform || selectedMeeting.location}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Participants Card */}
                                {selectedMeeting.participants && selectedMeeting.participants.length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E5E7EB]">
                                        <h4 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-[#2C2171]/20 rounded-lg">
                                                <Users className="w-5 h-5 text-[#2C2171]" />
                                            </div>
                                            Participants ({selectedMeeting.participants.length})
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedMeeting.participants.map((participant: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#F8FAFF] to-white rounded-xl border border-[#E5E7EB] hover:border-[#2C2171]/30 transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-gradient-to-br from-[#2C2171] to-[#3F348C] rounded-full flex items-center justify-center text-white font-bold">
                                                        {participant.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-[#1E293B]">
                                                            {participant.full_name}
                                                        </p>
                                                        <p className="text-xs text-[#64748B]">
                                                            {participant.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Agenda Card */}
                                {selectedMeeting.agenda && (
                                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#E5E7EB]">
                                        <h4 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <Info className="w-5 h-5 text-blue-500" />
                                            </div>
                                            Meeting Agenda
                                        </h4>
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                            <p className="text-sm text-[#1E293B] leading-relaxed whitespace-pre-wrap">
                                                {selectedMeeting.agenda}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Join Meeting Button */}
                                {selectedMeeting.agenda && (() => {
                                    const urlMatch = selectedMeeting.agenda.match(/(https?:\/\/[^\s]+)/);
                                    if (urlMatch) {
                                        return (
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-1 shadow-xl">
                                                <button
                                                    onClick={() => window.open(urlMatch[1], '_blank')}
                                                    className="w-full bg-white rounded-xl p-4 flex items-center justify-center gap-3 transition-all hover:bg-gradient-to-r hover:from-white/95 hover:to-white/90 group"
                                                >
                                                    <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                                                        <Video className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-lg font-bold text-[#1E293B]">Join Meeting</p>
                                                        <p className="text-sm text-[#64748B]">Click to open video call</p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </button>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </ScrollArea>
                    )}
                </DialogContent>
            </Dialog>

            {/* Shared Mobile Navigation */}
            <MobileNavigation currentPage="meetings" />

            {/* Spacer for mobile bottom nav */}
            <div className="md:hidden h-20"></div>
        </div>
    );
}
