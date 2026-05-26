"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

// ============================================
// SHARED CONFIG
// ============================================
const DASHBOARD_QUERY_CONFIG = {
    staleTime: 1000 * 60 * 5, // 5 minutes before data is considered stale
    gcTime: 1000 * 60 * 10,   // 10 minutes cache retention
};

// ============================================
// TASKS HOOK
// ============================================
export function useTasks() {
    const queryClient = useQueryClient();

    const { data: activeTasks = [], isLoading: isLoadingActive, isFetching: isFetchingActive } = useQuery({
        queryKey: ["tasks", "active"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*, assigned_to_user:profiles!assigned_to(full_name, department), creator:profiles!created_by(role, is_manager)")
                .not("status", "in", '("completed","deleted")')
                .order("updated_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        ...DASHBOARD_QUERY_CONFIG
    });

    const { data: completedTasks = [], isLoading: isLoadingCompleted, isFetching: isFetchingCompleted } = useQuery({
        queryKey: ["tasks", "completed"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("tasks")
                .select("*, assigned_to_user:profiles!assigned_to(full_name, department), creator:profiles!created_by(role, is_manager)")
                .eq("status", "completed")
                .is("reviewed_at", null)
                .order("updated_at", { ascending: false })
                .limit(50);
            if (error) throw error;
            return data;
        },
        ...DASHBOARD_QUERY_CONFIG
    });

    return {
        activeTasks,
        completedTasks,
        isLoading: isLoadingActive || isLoadingCompleted,
        isFetching: isFetchingActive || isFetchingCompleted
    };
}

// ============================================
// STAFF HOOK
// ============================================
export function useStaff() {
    return useQuery({
        queryKey: ["staff"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .neq("role", "ceo")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data.filter((s: any) => s.full_name !== "[DELETED]");
        },
        ...DASHBOARD_QUERY_CONFIG
    });
}

// ============================================
// LEADS & DEMOS HOOK
// ============================================
export function useLeads() {
    const { data: leads = [], isLoading: isLoadingLeads } = useQuery({
        queryKey: ["leads"],
        queryFn: async () => {
            const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
            const { data, error } = await supabase
                .from("leads")
                .select("*")
                .or(`created_at.gte.${threeDaysAgo},status.eq.converted,updated_at.gte.${threeDaysAgo}`)
                .order("updated_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        ...DASHBOARD_QUERY_CONFIG
    });

    const { data: demoRequests = [], isLoading: isLoadingDemos } = useQuery({
        queryKey: ["demo_requests"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("demo_requests")
                .select("*, leads:leads(*)")
                .eq("status", "accepted")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        ...DASHBOARD_QUERY_CONFIG
    });

    return { leads, demoRequests, isLoading: isLoadingLeads || isLoadingDemos };
}

// ============================================
// REQUESTS HOOK
// ============================================
export function useRequests() {
    return useQuery({
        queryKey: ["requests"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("requests")
                .select("*, submitted_by:profiles!submitted_by(*)")
                .eq("status", "pending")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        ...DASHBOARD_QUERY_CONFIG
    });
}

// ============================================
// MEETINGS HOOK
// ============================================
export function useMeetings() {
    return useQuery({
        queryKey: ["meetings"],
        queryFn: async () => {
            const now = new Date().toISOString();
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const { data, error } = await supabase
                .from("meetings")
                .select("*")
                .gte("scheduled_at", now)
                .lte("scheduled_at", nextWeek)
                .order("scheduled_at", { ascending: true });
            if (error) throw error;
            return data;
        },
        ...DASHBOARD_QUERY_CONFIG
    });
}

// ============================================
// CEO DIRECTIVES HOOK (Separate table)
// ============================================
export function useCeoDirectives() {
    const { userRole } = useAuth();
    return useQuery({
        queryKey: ["ceo_directives", userRole],
        queryFn: async () => {
            if (userRole !== 'CEO') return [];
            const { data, error } = await supabase
                .from("ceo_directives")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        ...DASHBOARD_QUERY_CONFIG
    });
}
