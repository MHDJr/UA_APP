"use client";

import { useState } from "react";
import { User, Megaphone, ChevronDown, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Brand colors
const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
};

// Mock staff list for direct command
const staffList = [
    { id: 1, name: "Afeef", role: "Senior Developer", avatar: "A" },
    { id: 2, name: "Sarah", role: "Education Coordinator", avatar: "S" },
    { id: 3, name: "Chandu", role: "Technical Lead", avatar: "C" },
];

type DispatchMode = "direct" | "global";

interface CommandDispatchProps {
    className?: string;
}

export function CommandDispatch({ className }: CommandDispatchProps) {
    const [mode, setMode] = useState<DispatchMode>("direct");
    const [selectedStaff, setSelectedStaff] = useState(staffList[0]);
    const [message, setMessage] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPriority, setIsPriority] = useState(false);

    const handleExecute = () => {
        if (message.trim()) {
            if (mode === "direct") {
                console.log(`Direct command to ${selectedStaff.name}: ${message}`);
            } else {
                console.log(`Global announcement${isPriority ? " (PRIORITY)" : ""}: ${message}`);
            }
            setMessage("");
            setIsPriority(false);
        }
    };

    return (
        <div className={cn("backdrop-blur-2xl bg-white/80 border border-white/10 rounded-3xl p-8 shadow-2xl", className)}>
            {/* Pill Selector Toggle */}
            <div className="relative mb-8">
                <div className="flex bg-gray-100 rounded-full p-1 relative">
                    {/* Sliding Background */}
                    <div
                        className="absolute top-1 left-1 h-[calc(100%-8px)] rounded-full transition-all duration-300 ease-out"
                        style={{
                            width: "calc(50% - 4px)",
                            backgroundColor: mode === "global" ? BRAND_COLORS.orange : BRAND_COLORS.indigo,
                            transform: mode === "global" ? "translateX(100%)" : "translateX(0)"
                        }}
                    />
                    
                    {/* Direct Command Option */}
                    <button
                        onClick={() => setMode("direct")}
                        className="relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full transition-all duration-300"
                    >
                        <User className="w-4 h-4" style={{ color: mode === "direct" ? "white" : BRAND_COLORS.indigo }} />
                        <span className="font-semibold text-sm" style={{ color: mode === "direct" ? "white" : BRAND_COLORS.indigo }}>
                            Direct Command
                        </span>
                    </button>
                    
                    {/* Global Announcement Option */}
                    <button
                        onClick={() => setMode("global")}
                        className="relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full transition-all duration-300"
                    >
                        <Megaphone className="w-4 h-4" style={{ color: mode === "global" ? "white" : BRAND_COLORS.indigo }} />
                        <span className="font-semibold text-sm" style={{ color: mode === "global" ? "white" : BRAND_COLORS.indigo }}>
                            Global Announcement
                        </span>
                    </button>
                </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="space-y-6">
                {/* Staff Dropdown - Only for Direct Mode */}
                {mode === "direct" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Send To
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-4 py-4 text-left bg-white/90 border border-gray-200 rounded-2xl shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
                                        style={{ backgroundColor: BRAND_COLORS.indigo }}
                                    >
                                        {selectedStaff.avatar}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{selectedStaff.name}</div>
                                        <div className="text-xs text-gray-500">{selectedStaff.role}</div>
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                            
                            {isDropdownOpen && (
                                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl">
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
                                                {staff.avatar}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{staff.name}</div>
                                                <div className="text-xs text-gray-500">{staff.role}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Message Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {mode === "direct" ? "Command Message" : "Announcement Message"}
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={mode === "direct" ? "Enter your directive..." : "Compose your announcement..."}
                        className={cn(
                            "w-full px-4 py-4 bg-white/90 border rounded-2xl shadow-sm resize-none h-40 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400",
                            mode === "global" ? "border-orange-300 focus:ring-orange-500" : "border-gray-200 focus:ring-blue-500"
                        )}
                        style={{
                            boxShadow: mode === "global" ? `0 0 0 1px ${BRAND_COLORS.orange}20, 0 4px 6px -1px rgba(0, 0, 0, 0.1)` : undefined
                        }}
                    />
                </div>

                {/* Priority Checkbox - Only for Global Mode */}
                {mode === "global" && (
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="priority"
                            checked={isPriority}
                            onChange={(e) => setIsPriority(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            style={{ accentColor: BRAND_COLORS.orange }}
                        />
                        <label htmlFor="priority" className="text-sm font-medium text-gray-700">
                            Send as Priority Announcement
                        </label>
                    </div>
                )}

                {/* Execute Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleExecute}
                        className={cn(
                            "px-8 py-4 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-3",
                            mode === "global" && "animate-pulse"
                        )}
                        style={{ backgroundColor: mode === "global" ? BRAND_COLORS.orange : BRAND_COLORS.indigo }}
                    >
                        <Send className="w-5 h-5" />
                        {mode === "direct" ? "Execute Command" : "Broadcast Announcement"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
