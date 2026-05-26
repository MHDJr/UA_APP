"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mail, Megaphone, Lightbulb, Trophy, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageToggle } from "@/components/message-dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useTabResiliency } from "./tab-resiliency-engine";

// Brand colors
const BRAND_COLORS = {
    indigo: "#31267D",
    orange: "#F14D24",
};

// Idea type interface
interface Idea {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    created_by: string;
    created_by_name?: string;
    created_at: string;
}

// Victory type interface
interface Victory {
    id: string;
    staff: string;
    achievement: string;
    time: string;
    points: number;
}

export function CEOInbox() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [victories, setVictories] = useState<Victory[]>([]);
    const [loading, setLoading] = useState(true);
    const [clearingAll, setClearingAll] = useState(false);
    const [inboxFilter, setInboxFilter] = useState<'all' | 'directives' | 'alerts'>('all');
    const dailyIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Tab Resiliency Engine Integration
    useTabResiliency(
        () => {
            fetchIdeas();
            fetchVictories();
        },
        loading,
        setLoading
    );

    useEffect(() => {
        fetchIdeas();
        fetchVictories();

        // Set up daily refresh at midnight to clear the victory feed
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        const midnightTimer = setTimeout(() => {
            fetchIdeas();
            fetchVictories(); // Refresh at midnight to clear previous day's victories

            // Set up recurring daily refresh
            dailyIntervalRef.current = setInterval(() => {
                fetchIdeas();
                fetchVictories();
            }, 24 * 60 * 60 * 1000);
        }, msUntilMidnight);

        return () => {
            clearTimeout(midnightTimer);
            if (dailyIntervalRef.current) {
                clearInterval(dailyIntervalRef.current);
            }
        };
    }, []);

    const fetchIdeas = async () => {
        try {
            setLoading(true);
            
            console.log("Fetching ideas from database...");
            
            // Check current user and their role
            const { data: { user } } = await supabase.auth.getUser();
            console.log("Current user:", user);
            
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, full_name')
                    .eq('id', user.id)
                    .single();
                console.log("User profile:", profile);
            }
            
            const { data, error } = await supabase
                .from("ideas")
                .select(`
                    *,
                    profiles!ideas_created_by_fkey (
                        full_name,
                        username
                    )
                `)
                .eq("status", "active")
                .order("created_at", { ascending: false })
                .limit(50);

            console.log("Ideas fetch result:", { data, error });
            console.log("Number of ideas fetched:", data?.length || 0);

            if (error) {
                console.error("Error fetching ideas:", error);
                throw error;
            }

            // Transform ideas to display format
            const transformedIdeas: Idea[] = (data || []).map((idea: any) => {
                console.log("Processing idea:", idea);
                const creatorName = idea.profiles?.full_name || idea.profiles?.username || "Unknown";
                
                // Format timestamp
                const ideaTime = new Date(idea.created_at);
                const now = new Date();
                const diffInHours = Math.floor((now.getTime() - ideaTime.getTime()) / (1000 * 60 * 60));
                
                let timeString;
                if (diffInHours < 1) timeString = "Just now";
                else if (diffInHours < 24) timeString = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                else timeString = `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;

                return {
                    id: idea.id,
                    title: idea.title,
                    description: idea.description,
                    category: idea.category,
                    priority: idea.priority,
                    status: idea.status,
                    created_by: idea.created_by,
                    created_by_name: creatorName,
                    created_at: timeString
                };
            });

            setIdeas(transformedIdeas);
        } catch (error) {
            console.error("Error fetching ideas:", error);
            setIdeas([]);
        }
    };

    const clearAllIdeas = async () => {
        try {
            setClearingAll(true);
            
            console.log("Clearing all ideas...");
            
            const { error } = await supabase
                .from("ideas")
                .delete()
                .gte("created_at", "1970-01-01"); // Delete all ideas (WHERE clause required by RLS)

            console.log("Clear all ideas result:", { error });

            if (error) throw error;

            toast.success("All ideas cleared successfully");
            fetchIdeas(); // Refresh the ideas list
        } catch (error: any) {
            console.error("Error clearing ideas:", error);
            toast.error(error.message || "Failed to clear ideas");
        } finally {
            setClearingAll(false);
        }
    };

    const deleteIdea = async (ideaId: string) => {
        try {
            console.log("Deleting idea:", ideaId);
            
            const { error } = await supabase
                .from("ideas")
                .delete()
                .eq("id", ideaId);

            console.log("Delete idea result:", { error });

            if (error) throw error;

            toast.success("Idea deleted successfully");
            fetchIdeas(); // Refresh the ideas list
        } catch (error: any) {
            console.error("Error deleting idea:", error);
            toast.error(error.message || "Failed to delete idea");
        }
    };

    const fetchVictories = async () => {
        try {
            // Fetch completed tasks from today only
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            
            const { data: completedTasks, error } = await supabase
                .from("tasks")
                .select(`
                    *,
                    profiles!tasks_assigned_to_fkey (
                        full_name,
                        username
                    )
                `)
                .eq("status", "completed")
                .gte("updated_at", startOfDay.toISOString())
                .lt("updated_at", endOfDay.toISOString())
                .order("updated_at", { ascending: false })
                .limit(20);

            if (error) throw error;

            // Transform tasks to victories
            const transformedVictories: Victory[] = (completedTasks || []).map((task: any) => {
                const staffName = task.profiles?.full_name || task.profiles?.username || "Unknown Staff";
                
                // Calculate points based on task priority and complexity
                let points = 50; // Base points
                if (task.priority === "urgent") points = 200;
                else if (task.priority === "high") points = 150;
                else if (task.priority === "medium") points = 100;
                
                // Add bonus for complex tasks
                if (task.description && task.description.length > 100) points += 25;

                // Format time
                const taskTime = new Date(task.updated_at);
                const now = new Date();
                const diffInHours = Math.floor((now.getTime() - taskTime.getTime()) / (1000 * 60 * 60));
                
                let timeString;
                if (diffInHours < 1) timeString = "Just now";
                else if (diffInHours < 24) timeString = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
                else timeString = `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;

                return {
                    id: task.id,
                    staff: staffName,
                    achievement: task.title || "Completed a task",
                    time: timeString,
                    points
                };
            });

            setVictories(transformedVictories);
        } catch (error) {
            console.error("Error fetching victories:", error);
            setVictories([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#050505] p-2 md:p-6 lg:p-8">
            {/* Premium Glass-Morphism Header */}
            <div className="mb-6 md:mb-8 bg-white/60 dark:bg-zinc-900/50 backdrop-blur-xl border border-white/40 dark:border-zinc-800/60 rounded-[20px] md:rounded-[24px] shadow-sm p-4 md:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
                    {/* Title and Quote */}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl md:text-3xl lg:text-4xl font-black text-[#1e293b] dark:text-zinc-100 uppercase tracking-tight leading-tight truncate">
                            Command Intelligence
                        </h1>
                        <p className="text-xs md:text-sm italic text-slate-400 dark:text-zinc-400 mt-0.5 md:mt-1 line-clamp-2">
                            "Executive Dashboard & Communications Hub."
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row h-[calc(100vh-220px)] gap-6">
                {/* Spark Inbox - Center Column */}
                <div className="flex-1 backdrop-blur-lg bg-white/80 border border-white/20 rounded-2xl p-8 shadow-xl overflow-y-auto">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-3xl font-bold" style={{ color: BRAND_COLORS.indigo }}>
                                The 'Spark' Inbox
                            </h2>
                            {ideas.length > 0 && (
                                <Button
                                    onClick={clearAllIdeas}
                                    disabled={clearingAll}
                                    variant="ghost"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 text-red-500/70 border border-red-500/20 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/30"
                                >
                                    {clearingAll ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Clearing...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Clear All
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                        <p className="text-gray-600 dark:text-zinc-400 mb-6">Innovation sparks from your team</p>

                        <div className="flex items-center gap-2 mb-6 bg-gray-100/50 dark:bg-zinc-800/50 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setInboxFilter('all')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    inboxFilter === 'all'
                                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                                }`}
                            >
                                All Sparks
                            </button>
                            <button
                                onClick={() => setInboxFilter('directives')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    inboxFilter === 'directives'
                                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                                }`}
                            >
                                Directives
                            </button>
                            <button
                                onClick={() => setInboxFilter('alerts')}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    inboxFilter === 'alerts'
                                        ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-300'
                                }`}
                            >
                                System Alerts
                            </button>
                        </div>

                        <div className="space-y-3">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                        <span className="text-gray-500 text-sm">Loading ideas...</span>
                                    </div>
                                </div>
                            ) : ideas.length === 0 ? (
                                <div className="text-center py-8">
                                    <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 text-sm font-medium">No ideas yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Start capturing your innovation sparks</p>
                                </div>
                            ) : (
                                ideas.map((idea) => (
                                    <div
                                        key={idea.id}
                                        className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg p-4 hover:shadow-md hover:translate-x-1 transition-all duration-200 hover:border-gray-200 dark:hover:border-zinc-700 cursor-pointer"
                                        style={{ borderLeftWidth: 3, borderLeftColor: BRAND_COLORS.orange }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-medium"
                                                style={{ backgroundColor: BRAND_COLORS.indigo }}
                                            >
                                                {idea.created_by_name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{idea.created_by_name}</h3>
                                                        <span className="text-xs text-slate-400 dark:text-zinc-500">{idea.created_at}</span>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteIdea(idea.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-red-50 text-red-500 hover:text-red-600"
                                                        title="Delete idea"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-zinc-100 text-sm leading-tight truncate">{idea.title}</h4>
                                                    <div className="flex items-start gap-2">
                                                        <Lightbulb
                                                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                                                            style={{ color: BRAND_COLORS.orange }}
                                                        />
                                                        <p className="text-gray-600 dark:text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Victory Feed - Right Sidebar */}
                <div className="flex-1 lg:max-w-md backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl overflow-y-auto" style={{ background: `linear-gradient(180deg, ${BRAND_COLORS.indigo} 0%, #1E1A5C 100%)` }}>
                    <h2 className="text-xl font-bold mb-6 text-white">
                        Victory Feed
                    </h2>
                    <p className="text-indigo-200 text-sm mb-8">Daily wins from the team</p>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin text-white/70" />
                                    <span className="text-white/70 text-sm">Loading victories...</span>
                                </div>
                            </div>
                        ) : victories.length === 0 ? (
                            <div className="text-center py-8">
                                <Trophy className="w-12 h-12 text-white/30 mx-auto mb-3" />
                                <p className="text-white/50 text-sm">No victories today yet</p>
                                <p className="text-white/30 text-xs mt-1">Completed tasks will appear here</p>
                            </div>
                        ) : (
                            victories.map((victory: Victory) => (
                                <div
                                    key={victory.id}
                                    className="bg-white/10 border border-white/20 rounded-xl p-5 hover:bg-white/15 hover:translate-x-1 transition-all duration-200"
                                >
                                    <div className="flex items-start gap-3">
                                        <Trophy className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-white text-base">{victory.staff}</h4>
                                            <p className="text-indigo-200 text-sm mt-2 leading-relaxed">{victory.achievement}</p>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-xs text-indigo-300/80">{victory.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
