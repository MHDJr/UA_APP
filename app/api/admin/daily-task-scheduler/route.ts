import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        // Get all active daily task templates
        const { data: templates, error: templateError } = await supabaseAdmin
            .from("daily_task_templates")
            .select("*")
            .eq("is_active", true);

        if (templateError) {
            console.error("Error fetching templates:", templateError);
            return NextResponse.json(
                { error: templateError.message },
                { status: 500 },
            );
        }

        const today = new Date().toISOString().split("T")[0];
        let tasksCreated = 0;

        // Create tasks for each template
        for (const template of templates || []) {
            // Check if task already exists for today
            const { data: existingTask } = await supabaseAdmin
                .from("tasks")
                .select("id")
                .eq("assigned_to", template.staff_id)
                .eq("title", template.task_title)
                .gte("created_at", `${today}T00:00:00Z`)
                .lt("created_at", `${today}T23:59:59Z`)
                .maybeSingle();

            if (!existingTask) {
                const { error: insertError } = await supabaseAdmin
                    .from("tasks")
                    .insert({
                        title: template.task_title,
                        description: template.task_description,
                        assigned_to: template.staff_id,
                        priority: template.priority || "medium",
                        created_by: template.created_by,
                        repeat_daily: true,
                        is_daily_task: true,
                        due_date: today,
                    });

                if (!insertError) {
                    tasksCreated++;

                    // Notify staff about new daily task
                    await supabaseAdmin.from("notifications").insert({
                        user_id: template.staff_id,
                        title: "NEW DAILY TASK ASSIGNED",
                        message: `Your daily task: ${template.task_title}`,
                        type: "task",
                    });
                }
            }
        }

        // Check for overdue tasks and notify CEO
        const { data: overdueTasks, error: overdueError } = await supabaseAdmin
            .from("tasks")
            .select("*, assigned_to:profiles!assigned_to(full_name, email)")
            .eq("status", "pending")
            .lt("due_date", today)
            .eq("overdue_notified", false);

        if (!overdueError && overdueTasks && overdueTasks.length > 0) {
            // Get CEO profile
            const { data: ceo } = await supabaseAdmin
                .from("profiles")
                .select("id, email")
                .eq("role", "ceo")
                .maybeSingle();

            if (ceo) {
                const overdueList = overdueTasks
                    .map(
                        (t: any) =>
                            `- ${t.title} (${t.assigned_to?.full_name || "Unknown"})`,
                    )
                    .join("\n");

                // Notify CEO about overdue tasks
                await supabaseAdmin.from("notifications").insert({
                    user_id: ceo.id,
                    title: "⚠️ OVERDUE TASKS ALERT",
                    message: `The following tasks are overdue:\n${overdueList}`,
                    type: "alert",
                });

                // Mark tasks as notified
                for (const task of overdueTasks) {
                    await supabaseAdmin
                        .from("tasks")
                        .update({ overdue_notified: true })
                        .eq("id", task.id);
                }
            }
        }

        return NextResponse.json({
            success: true,
            tasksCreated,
            overdueNotified: overdueTasks?.length || 0,
        });
    } catch (error: any) {
        console.error("Daily task scheduler error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
