"use client";

import { useState, useEffect } from "react";
import { X, Send, User, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

// Brand colors
const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
};

type MessageType = "direct" | "global";

interface StaffProfile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    department?: string;
    avatar_url?: string;
}

interface MessageDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MessageDialog({ isOpen, onClose }: MessageDialogProps) {
    const [messageType, setMessageType] = useState<MessageType>("direct");
    const [selectedStaff, setSelectedStaff] = useState<StaffProfile | null>(null);
    const [message, setMessage] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [staffList, setStaffList] = useState<StaffProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .neq("role", "ceo")
                    .neq("id", user?.id)
                    .order("full_name");

                if (error) throw error;
                setStaffList(data || []);
                if (data && data.length > 0) {
                    setSelectedStaff(data[0]);
                }
            } catch (error) {
                console.error("Error fetching staff:", error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && user) {
            fetchStaff();
        }
    }, [isOpen, user]);

    const handleSend = () => {
        if (message.trim()) {
            if (messageType === "direct" && selectedStaff) {
                console.log(`Direct message to ${selectedStaff.full_name}: ${message}`);
            } else if (messageType === "global") {
                console.log(`Global announcement: ${message}`);
            }
            setMessage("");
            onClose();
        }
    };

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-lg w-full">
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading staff...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9999] flex items-start justify-center pt-[10vh] p-4">
            <div className="backdrop-blur-2xl bg-white/95 border border-white/20 rounded-3xl p-8 shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto my-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Send Message</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Message Type Toggle */}
                <div className="flex bg-gray-100 rounded-full p-1 mb-6">
                    <button
                        onClick={() => setMessageType("direct")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all duration-200 ${
                            messageType === "direct"
                                ? "bg-white shadow-sm"
                                : ""
                        }`}
                    >
                        <User className="w-4 h-4" style={{ color: messageType === "direct" ? BRAND_COLORS.indigo : "#6b7280" }} />
                        <span className="text-sm font-medium" style={{ color: messageType === "direct" ? BRAND_COLORS.indigo : "#6b7280" }}>
                            Direct
                        </span>
                    </button>
                    <button
                        onClick={() => setMessageType("global")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full transition-all duration-200 ${
                            messageType === "global"
                                ? "bg-white shadow-sm"
                                : ""
                        }`}
                    >
                        <Megaphone className="w-4 h-4" style={{ color: messageType === "global" ? BRAND_COLORS.orange : "#6b7280" }} />
                        <span className="text-sm font-medium" style={{ color: messageType === "global" ? BRAND_COLORS.orange : "#6b7280" }}>
                            Broadcast
                        </span>
                    </button>
                </div>

                {/* Staff Selection - Only for Direct */}
                {messageType === "direct" && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Send To
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-4 py-3 text-left bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-between"
                                disabled={staffList.length === 0}
                            >
                                {selectedStaff ? (
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                                            style={{ backgroundColor: BRAND_COLORS.indigo }}
                                        >
                                            {selectedStaff.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{selectedStaff.full_name}</div>
                                            <div className="text-xs text-gray-500">{selectedStaff.role} {selectedStaff.department ? `• ${selectedStaff.department}` : ''}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500">No staff available</div>
                                )}
                                <X className="w-4 h-4 text-gray-400 transform rotate-180" />
                            </button>
                            
                            {isDropdownOpen && staffList.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {staffList.map((staff) => (
                                        <button
                                            key={staff.id}
                                            onClick={() => {
                                                setSelectedStaff(staff);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 flex items-center gap-3 border-b border-gray-100 last:border-0"
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs"
                                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                                            >
                                                {staff.full_name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{staff.full_name}</div>
                                                <div className="text-xs text-gray-500">{staff.role} {staff.department ? `• ${staff.department}` : ''}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Message Input */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={messageType === "direct" ? "Enter your message..." : "Compose your announcement..."}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={handleSend}
                        className="px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                        style={{ backgroundColor: messageType === "global" ? BRAND_COLORS.orange : BRAND_COLORS.indigo }}
                        disabled={(messageType === "direct" && !selectedStaff) || !message.trim()}
                    >
                        <Send className="w-4 h-4" />
                        {messageType === "direct" ? "Send Message" : "Broadcast"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

interface MessageToggleProps {
    className?: string;
}

export function MessageToggle({ className }: MessageToggleProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsDialogOpen(true)}
                className={`px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-3 ${className}`}
                style={{ backgroundColor: BRAND_COLORS.indigo }}
            >
                <Send className="w-5 h-5" />
                Send Message
            </button>
            
            <MessageDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
        </>
    );
}
