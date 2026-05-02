"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase, Idea, Profile } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
    Brain, 
    Target, 
    Zap, 
    Bell, 
    Search,
    Filter,
    Calendar,
    Tag,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowLeft,
    MoreVertical,
    Trash2,
    Edit3,
    Send,
    Sparkles,
    LayoutGrid,
    List,
    ChevronRight,
    X
} from "lucide-react";
import { format, parseISO, isPast, isToday, isTomorrow, isFuture, differenceInDays } from "date-fns";
import { autoTagContent, TagCategory, formatTag, getTagMetadata, TAG_CATEGORIES } from "@/lib/ai-tagging";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// War Room Header Component
function WarRoomHeader({ 
    totalCount, 
    pendingCount, 
    overdueCount 
}: { 
    totalCount: number; 
    pendingCount: number; 
    overdueCount: number;
}) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-black/80 via-indigo-950/50 to-black/80 border border-white/10 p-6 mb-8">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>
            
            {/* Glowing Orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-amber-500/20">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Directive Intelligence
                        </h1>
                        <p className="text-white/50 text-sm font-medium">
                            War Room for Strategic Thought Management
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="flex gap-4">
                    <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-2xl font-black text-white">{totalCount}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Total Directives</div>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="text-2xl font-black text-blue-400">{pendingCount}</div>
                        <div className="text-[10px] text-blue-400/60 uppercase tracking-wider font-bold">Pending</div>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="text-2xl font-black text-red-400">{overdueCount}</div>
                        <div className="text-[10px] text-red-400/60 uppercase tracking-wider font-bold">Overdue</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Directive Card Component
function DirectiveCard({ 
    idea, 
    staff, 
    onUpdate, 
    onDelete,
    viewMode 
}: { 
    idea: Idea; 
    staff: Profile[];
    onUpdate: (id: string, updates: Partial<Idea>) => void;
    onDelete: (id: string) => void;
    viewMode: "grid" | "list";
}) {
    const statusConfig = {
        reminder: {
            icon: Bell,
            label: "Reminder",
            color: "text-blue-400",
            bgColor: "bg-blue-500/10",
            borderColor: "border-blue-500/30",
            gradient: "from-blue-500/20 to-transparent"
        },
        directive: {
            icon: Target,
            label: "Directive",
            color: "text-amber-400",
            bgColor: "bg-amber-500/10",
            borderColor: "border-amber-500/30",
            gradient: "from-amber-500/20 to-transparent"
        },
        high_priority: {
            icon: Zap,
            label: "High Priority",
            color: "text-red-400",
            bgColor: "bg-red-500/10",
            borderColor: "border-red-500/30",
            gradient: "from-red-500/20 to-transparent"
        }
    };

    const currentStatus = idea.status || "reminder";
    const config = statusConfig[currentStatus];
    const StatusIcon = config.icon;

    const followUpDate = idea.follow_up_date ? parseISO(idea.follow_up_date) : null;
    const isOverdue = followUpDate && isPast(followUpDate) && !isToday(followUpDate);
    const isDueToday = followUpDate && isToday(followUpDate);
    const isDueTomorrow = followUpDate && isTomorrow(followUpDate);

    // Get date label
    const getDateLabel = () => {
        if (!followUpDate) return null;
        if (isDueToday) return { text: "Today", color: "text-red-400 bg-red-500/10 border-red-500/20" };
        if (isDueTomorrow) return { text: "Tomorrow", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
        if (isOverdue) return { text: `${Math.abs(differenceInDays(followUpDate, new Date()))} days overdue`, color: "text-red-400 bg-red-500/20 border-red-500/30" };
        return { text: format(followUpDate, "MMM d"), color: "text-white/60 bg-white/5 border-white/10" };
    };

    const dateLabel = getDateLabel();

    if (viewMode === "list") {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`
                    group relative flex items-center gap-4 p-4 rounded-2xl
                    bg-black/40 backdrop-blur-xl border transition-all duration-300
                    ${isOverdue ? 'border-red-500/30' : 'border-white/10 hover:border-white/20'}
                `}
            >
                {/* Status Icon */}
                <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        {idea.title && (
                            <h3 className="text-sm font-bold text-white truncate">{idea.title}</h3>
                        )}
                        <Badge className={`text-[9px] font-bold uppercase tracking-wider border-0 ${config.bgColor} ${config.color}`}>
                            {config.label}
                        </Badge>
                    </div>
                    <p className="text-xs text-white/60 line-clamp-1">{idea.content}</p>
                </div>

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                    <div className="hidden md:flex items-center gap-1">
                        {idea.tags.slice(0, 2).map((tag) => {
                            const metadata = getTagMetadata(tag as TagCategory);
                            return (
                                <Badge
                                    key={tag}
                                    className="text-[8px] font-bold uppercase tracking-wider border-0"
                                    style={{
                                        backgroundColor: `${metadata.color}20`,
                                        color: metadata.color
                                    }}
                                >
                                    {formatTag(tag as TagCategory)}
                                </Badge>
                            );
                        })}
                    </div>
                )}

                {/* Date */}
                {dateLabel && (
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${dateLabel.color}`}>
                        {dateLabel.text}
                    </div>
                )}

                {/* Actions */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                            <MoreVertical className="w-4 h-4 text-white/60" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                        <DropdownMenuItem 
                            onClick={() => onUpdate(idea.id, { status: "reminder" })}
                            className="text-blue-400 focus:text-blue-400 focus:bg-blue-500/10"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Set as Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => onUpdate(idea.id, { status: "directive" })}
                            className="text-amber-400 focus:text-amber-400 focus:bg-amber-500/10"
                        >
                            <Target className="w-4 h-4 mr-2" />
                            Set as Directive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => onUpdate(idea.id, { status: "high_priority" })}
                            className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Set High Priority
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => onDelete(idea.id)}
                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </motion.div>
        );
    }

    // Grid View
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
                group relative p-5 rounded-3xl
                bg-black/40 backdrop-blur-xl border transition-all duration-300
                ${isOverdue ? 'border-red-500/30 shadow-lg shadow-red-500/10' : 'border-white/10 hover:border-white/20'}
            `}
        >
            {/* Top Gradient */}
            <div className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-b ${config.gradient} rounded-t-3xl opacity-50`} />

            <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                        <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex items-center gap-2">
                        {idea.auto_tagged && (
                            <Sparkles className="w-3 h-3 text-amber-400" />
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10">
                                    <MoreVertical className="w-4 h-4 text-white/60" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-black/90 border-white/10">
                                <DropdownMenuItem 
                                    onClick={() => onUpdate(idea.id, { status: "reminder" })}
                                    className="text-blue-400 focus:text-blue-400 focus:bg-blue-500/10"
                                >
                                    <Bell className="w-4 h-4 mr-2" />
                                    Set as Reminder
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => onUpdate(idea.id, { status: "directive" })}
                                    className="text-amber-400 focus:text-amber-400 focus:bg-amber-500/10"
                                >
                                    <Target className="w-4 h-4 mr-2" />
                                    Set as Directive
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => onUpdate(idea.id, { status: "high_priority" })}
                                    className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    Set High Priority
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                    onClick={() => onDelete(idea.id)}
                                    className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Content */}
                {idea.title && (
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{idea.title}</h3>
                )}
                <p className="text-sm text-white/70 leading-relaxed line-clamp-3 mb-4">{idea.content}</p>

                {/* Tags */}
                {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {idea.tags.map((tag) => {
                            const metadata = getTagMetadata(tag as TagCategory);
                            return (
                                <Badge
                                    key={tag}
                                    className="text-[9px] font-bold uppercase tracking-wider border-0"
                                    style={{
                                        backgroundColor: `${metadata.color}20`,
                                        color: metadata.color
                                    }}
                                >
                                    {formatTag(tag as TagCategory)}
                                </Badge>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white/40">
                            {format(parseISO(idea.created_at), "MMM d")}
                        </span>
                    </div>
                    
                    {dateLabel ? (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border ${dateLabel.color}`}>
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{dateLabel.text}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-white/30">
                            <CheckCircle className="w-3 h-3" />
                            <span className="text-[10px]">No follow-up</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Main Page Component
export default function DirectiveIntelligencePage() {
    const { profile, loading } = useAuth();
    const router = useRouter();
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [staff, setStaff] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "reminder" | "directive" | "high_priority">("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        if (!loading && profile && profile.role !== "ceo") {
            router.replace("/");
        }
    }, [profile, loading, router]);

    useEffect(() => {
        if (profile?.id) {
            fetchData();
        }
    }, [profile]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch ideas
            const { data: ideasData, error: ideasError } = await supabase
                .from("ideas")
                .select("*")
                .eq("created_by", profile?.id)
                .eq("archived", false)
                .order("created_at", { ascending: false });

            if (ideasError) throw ideasError;
            setIdeas(ideasData || []);

            // Fetch staff
            const { data: staffData, error: staffError } = await supabase
                .from("profiles")
                .select("id, email, full_name, role, status, created_at, updated_at")
                .eq("role", "staff");

            if (staffError) throw staffError;
            setStaff(staffData || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load directives");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Idea>) => {
        try {
            const { error } = await supabase
                .from("ideas")
                .update(updates)
                .eq("id", id);

            if (error) throw error;
            
            setIdeas(prev => prev.map(idea => 
                idea.id === id ? { ...idea, ...updates } : idea
            ));
            
            toast.success("Directive updated");
        } catch (error) {
            console.error("Error updating idea:", error);
            toast.error("Failed to update directive");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this directive?")) return;

        try {
            const { error } = await supabase
                .from("ideas")
                .delete()
                .eq("id", id);

            if (error) throw error;
            
            setIdeas(prev => prev.filter(idea => idea.id !== id));
            toast.success("Directive deleted");
        } catch (error) {
            console.error("Error deleting idea:", error);
            toast.error("Failed to delete directive");
        }
    };

    // Filter ideas
    const filteredIdeas = useMemo(() => {
        return ideas.filter(idea => {
            const matchesSearch = 
                (idea.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
                idea.content.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === "all" || idea.status === statusFilter;
            
            const matchesTags = selectedTags.length === 0 || 
                (idea.tags && selectedTags.some(tag => idea.tags?.includes(tag)));

            return matchesSearch && matchesStatus && matchesTags;
        });
    }, [ideas, searchQuery, statusFilter, selectedTags]);

    // Stats
    const stats = useMemo(() => {
        const pending = ideas.filter(i => !i.archived).length;
        const overdue = ideas.filter(i => {
            if (!i.follow_up_date) return false;
            const date = parseISO(i.follow_up_date);
            return isPast(date) && !isToday(date);
        }).length;
        return { total: ideas.length, pending, overdue };
    }, [ideas]);

    // All unique tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        ideas.forEach(idea => {
            idea.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags);
    }, [ideas]);

    if (loading || !profile || profile.role !== "ceo") {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* War Room Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => router.push("/ceo")}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white/60" />
                    </button>
                    <div className="flex-1">
                        <WarRoomHeader 
                            totalCount={stats.total}
                            pendingCount={stats.pending}
                            overdueCount={stats.overdue}
                        />
                    </div>
                </div>

                {/* Filters & Controls */}
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                            type="text"
                            placeholder="Search directives..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus:border-amber-500/50"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        {[
                            { key: "all", label: "All", icon: LayoutGrid, color: "text-white" },
                            { key: "reminder", label: "Reminders", icon: Bell, color: "text-blue-400" },
                            { key: "directive", label: "Directives", icon: Target, color: "text-amber-400" },
                            { key: "high_priority", label: "High Priority", icon: Zap, color: "text-red-400" },
                        ].map(({ key, label, icon: Icon, color }) => (
                            <button
                                key={key}
                                onClick={() => setStatusFilter(key as any)}
                                className={`
                                    px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider
                                    flex items-center gap-2 transition-all
                                    ${statusFilter === key 
                                        ? 'bg-white/10 border border-white/20' 
                                        : 'bg-white/5 border border-white/5 hover:bg-white/10'
                                    }
                                `}
                            >
                                <Icon className={`w-3.5 h-3.5 ${statusFilter === key ? color : 'text-white/40'}`} />
                                <span className={statusFilter === key ? 'text-white' : 'text-white/50'}>{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white/5 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                            <LayoutGrid className={`w-4 h-4 ${viewMode === "grid" ? 'text-white' : 'text-white/40'}`} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? 'bg-white/10' : 'hover:bg-white/5'}`}
                        >
                            <List className={`w-4 h-4 ${viewMode === "list" ? 'text-white' : 'text-white/40'}`} />
                        </button>
                    </div>
                </div>

                {/* Tag Filters */}
                {allTags.length > 0 && (
                    <div className="flex items-center gap-2 mb-6 flex-wrap">
                        <Tag className="w-4 h-4 text-white/40" />
                        {allTags.map((tag) => {
                            const metadata = getTagMetadata(tag as TagCategory);
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <button
                                    key={tag}
                                    onClick={() => {
                                        if (isSelected) {
                                            setSelectedTags(prev => prev.filter(t => t !== tag));
                                        } else {
                                            setSelectedTags(prev => [...prev, tag]);
                                        }
                                    }}
                                    className={`
                                        px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                                        transition-all border
                                        ${isSelected 
                                            ? 'border-current' 
                                            : 'border-transparent hover:border-white/20'
                                        }
                                    `}
                                    style={{
                                        backgroundColor: `${metadata.color}20`,
                                        color: metadata.color,
                                        borderColor: isSelected ? metadata.color : 'transparent'
                                    }}
                                >
                                    {formatTag(tag as TagCategory)}
                                </button>
                            );
                        })}
                        {selectedTags.length > 0 && (
                            <button
                                onClick={() => setSelectedTags([])}
                                className="px-2 py-1 rounded-lg text-[10px] text-white/40 hover:text-white/60 hover:bg-white/5 transition-all"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}

                {/* Directives Grid/List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin h-8 w-8 border-2 border-white/20 border-t-white rounded-full" />
                    </div>
                ) : filteredIdeas.length === 0 ? (
                    <div className="text-center py-20">
                        <Brain className="w-16 h-16 text-white/10 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white/60 mb-2">No Directives Found</h3>
                        <p className="text-sm text-white/40">
                            {searchQuery || statusFilter !== "all" 
                                ? "Try adjusting your filters" 
                                : "Capture your first strategic thought from the dashboard"}
                        </p>
                    </div>
                ) : (
                    <motion.div 
                        layout
                        className={`
                            ${viewMode === "grid" 
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                                : 'flex flex-col gap-3'
                            }
                        `}
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredIdeas.map((idea) => (
                                <DirectiveCard
                                    key={idea.id}
                                    idea={idea}
                                    staff={staff}
                                    onUpdate={handleUpdate}
                                    onDelete={handleDelete}
                                    viewMode={viewMode}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
