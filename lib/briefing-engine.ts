import { supabase, Task, Meeting, Request, Attendance } from "./supabase";

export type BriefingData = {
    programmesToday: number;
    pendingTasks: number;
    moraleStatus: "High" | "Stable" | "Low";
    priorityQueue: Task[];
};

export async function generateBriefing(userId: string): Promise<BriefingData> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [meetings, tasks, requests, attendance] = await Promise.all([
        // 1. Meetings scheduled for today
        supabase
            .from("meetings")
            .select("*")
            .gte("start_time", today.toISOString())
            .lt("start_time", tomorrow.toISOString()),

        // 2. Pending/overdue tasks from previous days
        supabase
            .from("tasks")
            .select("*")
            .in("status", ["pending", "in_progress"])
            .lt("created_at", today.toISOString()),

        // 3. Pending requests today
        supabase
            .from("requests")
            .select("*")
            .eq("status", "pending"),

        // 4. Attendance today
        supabase
            .from("attendance")
            .select("*")
            .eq("date", today.toISOString().split('T')[0]),
    ]);

    const meetingsTodayCount = meetings.data?.length || 0;
    const pendingTasksCount = tasks.data?.length || 0;
    const attendanceCount = attendance.data?.length || 0;
    const pendingRequestsCount = requests.data?.length || 0;

    // Morale calculation logic: Attendance vs Pending Requests
    // Ratio > 2: High, 1-2: Stable, < 1: Low (assuming attendance is usually higher than requests)
    let morale: "High" | "Stable" | "Low" = "Stable";
    const ratio = pendingRequestsCount === 0 ? attendanceCount : attendanceCount / pendingRequestsCount;
    
    if (ratio > 3) morale = "High";
    else if (ratio < 1) morale = "Low";
    else morale = "Stable";

    // Auto-Priority Queue: Top 3 tasks sorted by urgency
    const priorityMap = { urgent: 4, high: 3, medium: 2, low: 1 };
    const priorityQueue = (tasks.data || [])
        .sort((a, b) => {
            const pA = priorityMap[a.priority as keyof typeof priorityMap] || 0;
            const pB = priorityMap[b.priority as keyof typeof priorityMap] || 0;
            if (pB !== pA) return pB - pA;
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        })
        .slice(0, 3);

    return {
        programmesToday: meetingsTodayCount,
        pendingTasks: pendingTasksCount,
        moraleStatus: morale,
        priorityQueue,
    };
}
