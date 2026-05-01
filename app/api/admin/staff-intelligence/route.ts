import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const { staffId } = await request.json();

        if (!staffId) {
            return NextResponse.json(
                { error: "Staff ID is required" },
                { status: 400 },
            );
        }

        // Create Supabase admin client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Get staff profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, full_name, department, created_at")
            .eq("id", staffId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: "Staff member not found" },
                { status: 404 },
            );
        }

        // Get tasks for the staff member
        const { data: tasks, error: tasksError } = await supabase
            .from("tasks")
            .select("id, title, status, priority, created_at, updated_at")
            .eq("assigned_to", staffId);

        if (tasksError) {
            console.error("Tasks error:", tasksError);
        }

        // Calculate task metrics
        const completedTasks =
            tasks?.filter((t) => t.status === "completed") || [];
        const pendingTasks =
            tasks?.filter(
                (t) =>
                    t.status === "pending" ||
                    !t.status ||
                    t.status === "" ||
                    t.status === "todo",
            ) || [];
        const inProgressTasks =
            tasks?.filter(
                (t) => t.status === "in_progress" || t.status === "in-progress",
            ) || [];
        const totalTasks = tasks?.length || 0;

        // IMPROVED: Calculate efficiency score with more factors
        let efficiencyScore = 0;
        let overdueTasks: any[] = [];
        let highPriorityCompleted = 0;

        if (totalTasks > 0) {
            const completionRate = (completedTasks.length / totalTasks) * 100;

            // Bonus for in-progress tasks (showing activity)
            const activityBonus =
                inProgressTasks.length > 0
                    ? Math.min(15, inProgressTasks.length * 5)
                    : 0;

            // Check for overdue tasks (pending for more than 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            overdueTasks = pendingTasks.filter(
                (t) => new Date(t.created_at) < sevenDaysAgo,
            );
            const overduePenalty = overdueTasks.length * 5; // -5 points per overdue task

            // Quality bonus: completed tasks in last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentCompleted = completedTasks.filter(
                (t) => new Date(t.updated_at) >= thirtyDaysAgo,
            );
            const qualityBonus =
                recentCompleted.length > 0
                    ? Math.min(10, recentCompleted.length * 2)
                    : 0;

            // Priority bonus: completed urgent/high priority tasks
            highPriorityCompleted = completedTasks.filter(
                (t) => t.priority === "urgent" || t.priority === "high",
            ).length;
            const priorityBonus = Math.min(10, highPriorityCompleted * 3);

            efficiencyScore = Math.max(
                0,
                Math.min(
                    100,
                    Math.round(
                        completionRate +
                            activityBonus -
                            overduePenalty +
                            qualityBonus +
                            priorityBonus,
                    ),
                ),
            );
        } else {
            efficiencyScore = 100; // No tasks = perfect score
        }

        // Get attendance records for punctuality calculation
        const { data: attendance } = await supabase
            .from("attendance")
            .select("date, clock_in, clock_out")
            .eq("user_id", staffId)
            .order("date", { ascending: false })
            .limit(30);

        // Calculate average punctuality variance (in minutes)
        let avgPunctualityVariance = 0;
        let punctualityStatus = "On Time";

        if (attendance && attendance.length > 0) {
            const variances = attendance
                .filter((a) => a.clock_in)
                .map((a) => {
                    const expectedTime = new Date(a.date + "T09:00:00");
                    const actualTime = new Date(a.clock_in);
                    return (
                        (actualTime.getTime() - expectedTime.getTime()) / 60000
                    ); // in minutes
                });

            if (variances.length > 0) {
                avgPunctualityVariance = Math.round(
                    variances.reduce((a, b) => a + Math.abs(b), 0) /
                        variances.length,
                );

                if (avgPunctualityVariance <= 5)
                    punctualityStatus = "Excellent";
                else if (avgPunctualityVariance <= 10)
                    punctualityStatus = "Good";
                else if (avgPunctualityVariance <= 15)
                    punctualityStatus = "Needs Improvement";
                else punctualityStatus = "Frequently Late";
            }
        }

        // Find stuck tasks (in progress for more than 3 days)
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const stuckTask = inProgressTasks.find((t) => {
            const updatedAt = new Date(t.updated_at);
            return updatedAt < threeDaysAgo;
        });

        let stuckTaskName = null;
        let stuckTaskDays = null;

        if (stuckTask) {
            stuckTaskName = stuckTask.title;
            const updatedAt = new Date(stuckTask.updated_at);
            stuckTaskDays = Math.ceil(
                (new Date().getTime() - updatedAt.getTime()) /
                    (1000 * 60 * 60 * 24),
            );
        }

        // Get requests submitted by this staff for approval rate calculation
        const { data: requests } = await supabase
            .from("requests")
            .select("status")
            .eq("submitted_by", staffId);

        const approvedRequests =
            requests?.filter((r) => r.status === "approved").length || 0;
        const totalRequests = requests?.length || 0;
        const approvalRate =
            totalRequests > 0
                ? Math.round((approvedRequests / totalRequests) * 100)
                : 100;

        // Generate AI-like strengths and weaknesses based on improved data
        const recentStrengths: string[] = [];
        const recentWeaknesses: string[] = [];

        if (efficiencyScore >= 80) {
            recentStrengths.push("Consistently high efficiency rating");
        }
        if (completedTasks.length >= 5) {
            recentStrengths.push("Strong task completion track record");
        }
        if (punctualityStatus === "Excellent" || punctualityStatus === "Good") {
            recentStrengths.push("Excellent punctuality and reliability");
        }
        if (inProgressTasks.length >= 3) {
            recentStrengths.push("Manages multiple projects effectively");
        }
        if (approvalRate >= 80 && totalRequests > 0) {
            recentStrengths.push("High request approval rate");
        }
        if (highPriorityCompleted >= 3) {
            recentStrengths.push("Handles high-priority tasks well");
        }

        if (efficiencyScore < 50) {
            recentWeaknesses.push("Low efficiency rating - needs improvement");
        }
        if (pendingTasks.length > 5) {
            recentWeaknesses.push("Building up pending task backlog");
        }
        if (stuckTaskName) {
            recentWeaknesses.push(`Task "${stuckTaskName}" has been stalled`);
        }
        if (punctualityStatus === "Frequently Late") {
            recentWeaknesses.push("Punctuality concerns");
        }
        if (overdueTasks.length > 0) {
            recentWeaknesses.push(
                `${overdueTasks.length} overdue task(s) need attention`,
            );
        }
        if (approvalRate < 50 && totalRequests > 3) {
            recentWeaknesses.push(
                "Low request approval rate - consider improving request quality",
            );
        }

        // Build the response
        const intelligenceData = {
            staff_id: profile.id,
            staff_name: profile.full_name,
            efficiency_score: efficiencyScore,
            completed_tasks: completedTasks.length,
            total_tasks: totalTasks,
            pending_tasks: pendingTasks.length,
            in_progress_tasks: inProgressTasks.length,
            overdue_tasks: overdueTasks?.length || 0,
            avg_punctuality_variance: avgPunctualityVariance,
            punctuality_status: punctualityStatus,
            stuck_task_name: stuckTaskName,
            stuck_task_days: stuckTaskDays,
            approval_rate: approvalRate,
            total_requests: totalRequests,
            recent_strengths:
                recentStrengths.length > 0
                    ? recentStrengths
                    : ["No specific strengths identified"],
            recent_weaknesses:
                recentWeaknesses.length > 0
                    ? recentWeaknesses
                    : ["No specific weaknesses identified"],
        };

        return NextResponse.json(intelligenceData);
    } catch (error) {
        console.error("Staff intelligence error:", error);
        return NextResponse.json(
            { error: "Failed to fetch staff intelligence" },
            { status: 500 },
        );
    }
}
