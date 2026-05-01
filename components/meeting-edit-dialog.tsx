"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Users, MapPin, Video, Building, AlertCircle, Save, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/lib/supabase";

// Define types locally to avoid circular imports
type MeetingPriority = "standard" | "urgent";

type Participant = {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    initials: string;
};

type EnrichedMeeting = {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    attendees: string[];
    meeting_link?: string;
    created_at: string;
    priority: MeetingPriority;
    participants: Participant[];
    location: string;
    type: "video" | "in-person";
    formattedStartTime: string;
    formattedEndTime: string;
    meetingDate: Date;
    agenda?: string;
};

interface MeetingEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    meeting: EnrichedMeeting | null;
    staffList: Profile[];
    onMeetingUpdated: () => void;
}

const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
    background: "#F9FAFB",
};

export default function MeetingEditDialog({ 
    open, 
    onOpenChange, 
    meeting, 
    staffList, 
    onMeetingUpdated 
}: MeetingEditDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        agenda: "",
        date: new Date(),
        time: "",
        duration: "60",
        location: "",
        type: "in-person" as "in-person" | "video",
        priority: "standard" as "standard" | "urgent",
        participants: [] as string[],
        meeting_link: "",
    });

    // Initialize form data when meeting changes
    useEffect(() => {
        if (meeting) {
            setFormData({
                title: meeting.title || "",
                agenda: meeting.agenda || "",
                date: meeting.meetingDate,
                time: format(meeting.meetingDate, "HH:mm"),
                duration: "60", // Default to 60 minutes
                location: meeting.location || "",
                type: meeting.type || "in-person",
                priority: meeting.priority || "standard",
                participants: meeting.participants?.map((p: Participant) => p.id) || [],
                meeting_link: "", // Will need to extract from agenda if available
            });
        }
    }, [meeting]);

    const handleSave = async () => {
        if (!meeting) return;
        
        if (!formData.title.trim()) {
            toast.error("Meeting title is required");
            return;
        }

        if (!formData.time) {
            toast.error("Meeting time is required");
            return;
        }

        if (formData.participants.length === 0) {
            toast.error("At least one participant is required");
            return;
        }

        setLoading(true);

        try {
            // Combine date and time
            const scheduledAt = new Date(
                `${format(formData.date, "yyyy-MM-dd")}T${formData.time}`
            ).toISOString();

            const endTime = new Date(
                new Date(scheduledAt).getTime() + (parseInt(formData.duration) || 60) * 60000
            ).toISOString();

            // Update meeting
            const { error } = await supabase
                .from("meetings")
                .update({
                    title: formData.title,
                    agenda: formData.agenda,
                    scheduled_at: scheduledAt,
                    start_time: scheduledAt,
                    end_time: endTime,
                    duration_minutes: parseInt(formData.duration) || 60,
                    attendees: formData.participants,
                    participants: formData.participants,
                })
                .eq("id", meeting.id);

            if (error) throw error;

            toast.success("Meeting updated successfully", {
                description: `"${formData.title}" has been updated.`,
            });

            onOpenChange(false);
            onMeetingUpdated();
        } catch (error: any) {
            console.error("Update failed:", error);
            toast.error("Failed to update meeting: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleParticipantToggle = (participantId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            participants: checked
                ? [...prev.participants, participantId]
                : prev.participants.filter(id => id !== participantId)
        }));
    };

    if (!meeting) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border border-gray-300 text-gray-900 max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#2F1E73] to-[#31267D] p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <CalendarIcon className="w-5 h-5 text-[#FA4616]" />
                            </div>
                            Edit Executive Summit
                        </DialogTitle>
                        <p className="text-white/70 text-sm mt-2">
                            Modify meeting parameters and operative assignments
                        </p>
                    </DialogHeader>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-[#31267D]" />
                            Basic Information
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                                    Meeting Title
                                </Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter meeting title"
                                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                                />
                            </div>

                            <div>
                                <Label htmlFor="agenda" className="text-sm font-medium text-gray-700">
                                    Agenda & Details
                                </Label>
                                <Textarea
                                    id="agenda"
                                    value={formData.agenda}
                                    onChange={(e) => setFormData(prev => ({ ...prev, agenda: e.target.value }))}
                                    placeholder="Enter meeting agenda and details"
                                    rows={4}
                                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#31267D]" />
                            Schedule
                        </h3>
                        
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal mt-1 border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(formData.date, "PPP")}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.date}
                                            onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div>
                                <Label htmlFor="time" className="text-sm font-medium text-gray-700">Time</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                                />
                            </div>

                            <div>
                                <Label htmlFor="duration" className="text-sm font-medium text-gray-700">Duration</Label>
                                <Select
                                    value={formData.duration}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                                >
                                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="60">1 hour</SelectItem>
                                        <SelectItem value="90">1.5 hours</SelectItem>
                                        <SelectItem value="120">2 hours</SelectItem>
                                        <SelectItem value="180">3 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Location & Type */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#31267D]" />
                            Location & Type
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type" className="text-sm font-medium text-gray-700">Meeting Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value: "in-person" | "video") => setFormData(prev => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="in-person">
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4" />
                                                In-Person
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="video">
                                            <div className="flex items-center gap-2">
                                                <Video className="w-4 h-4" />
                                                Video Call
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                                    {formData.type === "video" ? "Meeting Link" : "Location"}
                                </Label>
                                <Input
                                    id="location"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder={formData.type === "video" ? "Enter meeting link" : "Enter location"}
                                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#31267D]" />
                            Participants ({formData.participants.length} selected)
                        </h3>
                        
                        <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                            <div className="space-y-3">
                                {staffList.map((staff) => (
                                    <div key={staff.id} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`participant-${staff.id}`}
                                            checked={formData.participants.includes(staff.id)}
                                            onCheckedChange={(checked) => 
                                                handleParticipantToggle(staff.id, checked as boolean)
                                            }
                                        />
                                        <Label
                                            htmlFor={`participant-${staff.id}`}
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2F1E73] to-[#31267D] flex items-center justify-center text-white text-xs font-bold">
                                                {staff.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{staff.full_name}</div>
                                                <div className="text-sm text-gray-500">{staff.designation || staff.role}</div>
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Priority */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-[#31267D]" />
                            Priority Level
                        </h3>
                        
                        <Select
                            value={formData.priority}
                            onValueChange={(value: "standard" | "urgent") => setFormData(prev => ({ ...prev, priority: value }))}
                        >
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300 rounded-xl shadow-xl">
                                <SelectItem value="standard">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        Standard Priority
                                    </div>
                                </SelectItem>
                                <SelectItem value="urgent">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        Urgent Priority
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-300 p-6 flex justify-between items-center bg-gray-50">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2"
                        style={{ backgroundColor: BRAND_COLORS.orange }}
                    >
                        <Save className="w-4 h-4" />
                        {loading ? "Updating..." : "Update Meeting"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
