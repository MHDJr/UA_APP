"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    Brain, 
    Zap, 
    Target, 
    Bell, 
    Send,
    X,
    Sparkles,
    Tag,
    Calendar,
    Clock,
    ChevronRight,
    Loader2
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase, Idea } from "@/lib/supabase";
import { toast } from "sonner";
import { autoTagContent, TagCategory, formatTag, getTagMetadata } from "@/lib/ai-tagging";
import { format, addDays, addWeeks } from "date-fns";

interface ThoughtCaptureProps {
    onCapture?: (idea: Idea) => void;
    compact?: boolean;
}

export function ThoughtCapture({ onCapture, compact = false }: ThoughtCaptureProps) {
    const { profile } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState<"reminder" | "directive" | "high_priority">("reminder");
    const [followUpDate, setFollowUpDate] = useState<string>("");
    const [autoTags, setAutoTags] = useState<TagCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCinematic, setShowCinematic] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-tag as user types
    useEffect(() => {
        if (content || title) {
            const { tags } = autoTagContent(content, title);
            setAutoTags(tags);
        }
    }, [content, title]);

    // Handle click outside to collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!content && !title) {
                    setIsExpanded(false);
                }
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [content, title]);

    const handleFocus = () => setIsExpanded(true);

    const quickDates = [
        { label: "Tomorrow", date: addDays(new Date(), 1) },
        { label: "3 Days", date: addDays(new Date(), 3) },
        { label: "1 Week", date: addWeeks(new Date(), 1) },
        { label: "2 Weeks", date: addWeeks(new Date(), 2) },
    ];

    const handleSubmit = async () => {
        if (!content.trim()) {
            toast.error("Please enter your thought");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from("ideas")
                .insert({
                    title: title.trim() || null,
                    content: content.trim(),
                    priority: status === "high_priority" ? "high" : "medium",
                    status: status,
                    tags: autoTags,
                    follow_up_date: followUpDate || null,
                    auto_tagged: true,
                    created_by: profile?.id,
                    shared_with: status === "directive" ? [] : [],
                    archived: false,
                    signal_cleared: false,
                })
                .select()
                .single();

            if (error) throw error;

            // Trigger cinematic animation
            setShowCinematic(true);

            // Reset form
            setTimeout(() => {
                setContent("");
                setTitle("");
                setStatus("reminder");
                setFollowUpDate("");
                setAutoTags([]);
                setIsExpanded(false);
                setShowCinematic(false);
                
                toast.success(
                    status === "reminder" 
                        ? "Reminder captured" 
                        : status === "directive" 
                            ? "Directive issued" 
                            : "High priority directive issued"
                );
                
                onCapture?.(data);
            }, 1200);

        } catch (error) {
            console.error("Error capturing thought:", error);
            toast.error("Failed to capture thought");
            setIsSubmitting(false);
        }
    };

    const statusConfig = {
        reminder: {
            icon: Bell,
            label: "Reminder",
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/30",
            description: "Private note to yourself"
        },
        directive: {
            icon: Target,
            label: "Directive",
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/30",
            description: "Public to staff"
        },
        high_priority: {
            icon: Zap,
            label: "High Priority",
            color: "text-red-400",
            bgColor: "bg-red-500/10",
            borderColor: "border-red-500/30",
            description: "Urgent action required"
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Cinematic Fly Animation */}
            <AnimatePresence>
                {showCinematic && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1, x: 0, y: 0 }}
                        animate={{ 
                            opacity: [0, 1, 1, 0],
                            scale: [1, 1.1, 0.8, 0.5],
                            x: [0, 50, 100, 200],
                            y: [0, -30, -60, -100]
                        }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="fixed z-50 pointer-events-none"
                        style={{ 
                            left: containerRef.current?.getBoundingClientRect().left,
                            top: containerRef.current?.getBoundingClientRect().top 
                        }}
                    >
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/90 text-white text-sm font-bold shadow-2xl">
                            <Sparkles className="w-4 h-4" />
                            Captured!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Container */}
            <motion.div
                layout
                initial={false}
                animate={{ 
                    height: isExpanded ? "auto" : compact ? "48px" : "56px",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`
                    relative overflow-hidden rounded-2xl
                    bg-theme-card
                    border border-theme-border-10
                    shadow-2xl
                    transition-all duration-300
                `}
            >
                {/* Glassmorphic Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30 pointer-events-none" />

                {/* Collapsed State - Quick Input */}
                {!isExpanded && (
                    <div className="relative flex items-center h-full px-4">
                        <Brain className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Capture a Directive..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={handleFocus}
                            className="flex-1 bg-transparent border-0 text-theme-text placeholder:text-theme-text-30 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: content ? 1 : 0, x: content ? 0 : 10 }}
                            className="flex items-center gap-1"
                        >
                            <span className="text-[10px] text-theme-text-40 uppercase tracking-wider font-bold">
                                Press Enter
                            </span>
                            <ChevronRight className="w-4 h-4 text-amber-500/50" />
                        </motion.div>
                    </div>
                )}

                {/* Expanded State - Full Form */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-4 space-y-4"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-theme-text">Thought Capture</span>
                                </div>
                                <button
                                    onClick={() => {
                                        setContent("");
                                        setTitle("");
                                        setIsExpanded(false);
                                    }}
                                    className="w-6 h-6 rounded-full bg-theme-bg-white-5 flex items-center justify-center hover:bg-theme-bg-white-10 transition-colors"
                                >
                                    <X className="w-3 h-3 text-theme-text-50" />
                                </button>
                            </div>

                            {/* Title Input */}
                            <Input
                                type="text"
                                placeholder="Title (optional)..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-theme-bg-white-5 border-theme-border-10 text-theme-text placeholder:text-theme-text-40 focus:border-amber-500/50 text-sm"
                            />

                            {/* Content Textarea */}
                            <textarea
                                placeholder="Capture your strategic thought, directive, or reminder..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={3}
                                className="w-full bg-theme-bg-white-5 border border-theme-border-10 rounded-lg p-3 text-theme-text placeholder:text-theme-text-40 focus:border-amber-500/50 focus:outline-none resize-none text-sm leading-relaxed"
                                autoFocus
                            />

                            {/* AI Auto-Tags */}
                            {autoTags.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <Tag className="w-3 h-3 text-amber-400" />
                                    <span className="text-[10px] text-amber-400/70 uppercase tracking-wider font-bold">
                                        AI Tagged:
                                    </span>
                                    <div className="flex gap-1">
                                        {autoTags.map((tag) => {
                                            const metadata = getTagMetadata(tag);
                                            return (
                                                <Badge
                                                    key={tag}
                                                    className="text-[9px] font-bold uppercase tracking-wider border-0"
                                                    style={{
                                                        backgroundColor: `${metadata.color}20`,
                                                        color: metadata.color
                                                    }}
                                                >
                                                    {formatTag(tag)}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}

                            {/* Status Toggles */}
                            <div className="grid grid-cols-3 gap-2">
                                {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
                                    const config = statusConfig[key];
                                    const Icon = config.icon;
                                    const isActive = status === key;
                                    
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setStatus(key)}
                                            className={`
                                                relative p-2 rounded-xl border text-left transition-all duration-200
                                                ${isActive 
                                                    ? `${config.bgColor} ${config.borderColor} border` 
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <Icon className={`w-3.5 h-3.5 ${isActive ? config.color : 'text-white/40'}`} />
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? config.color : 'text-white/50'}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <span className="text-[8px] text-theme-text-30 leading-tight block">
                                                {config.description}
                                            </span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="statusIndicator"
                                                    className="absolute inset-0 rounded-xl border-2 border-current opacity-20 pointer-events-none"
                                                    style={{ color: config.color.replace('text-', '') }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Follow-up Date */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-amber-400/60" />
                                    <span className="text-[10px] text-theme-text-50 uppercase tracking-wider font-bold">
                                        Follow-up Reminder
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    {quickDates.map((item) => (
                                        <button
                                            key={item.label}
                                            onClick={() => setFollowUpDate(format(item.date, "yyyy-MM-dd"))}
                                            className={`
                                                px-2 py-1 rounded-lg text-[10px] font-bold transition-all
                                                ${followUpDate === format(item.date, "yyyy-MM-dd")
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                    <input
                                        type="date"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                        className="px-2 py-1 rounded-lg text-[10px] bg-theme-bg-white-5 text-theme-text-60 border border-theme-border-10 focus:border-amber-500/50 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-2 text-[10px] text-theme-text-40">
                                    <Clock className="w-3 h-3 text-theme-text-50" />
                                    <span className="text-theme-text-40">{content.length} chars</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setContent("");
                                            setTitle("");
                                            setIsExpanded(false);
                                        }}
                                        className="text-theme-text-50 hover:text-theme-text hover:bg-theme-bg-white-5 text-xs"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !content.trim()}
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-3 h-3 mr-1" />
                                                Capture
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
