import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StaffIntelligence {
  staff_id: string;
  staff_name: string;
  efficiency_score: number;
  completed_tasks: number;
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  avg_punctuality_variance: number;
  punctuality_status: string;
  stuck_task_name: string | null;
  stuck_task_days: number | null;
  recent_strengths: string[];
  recent_weaknesses: string[];
}

interface Meeting {
  meeting_id: string;
  meeting_title: string;
  meeting_start: string;
  participant_ids: string[];
  participant_names: string[];
}

// Generate AI briefing using Groq
async function generateAIBriefing(intel: StaffIntelligence): Promise<string> {
  const groqApiKey = Deno.env.get("GROQ_API_KEY");
  
  if (!groqApiKey) {
    console.error("GROQ_API_KEY not set");
    return `Sir, ${intel.staff_name} has an ${intel.efficiency_score}% efficiency rating. They are currently ${intel.punctuality_status}. ${intel.stuck_task_name ? `Notable issue: Task "${intel.stuck_task_name}" has been in progress for ${intel.stuck_task_days} days.` : "No stuck tasks."}`;
  }

  const prompt = `You are an AI Chief of Staff for a CEO. Generate a concise 3-sentence briefing about this staff member for an upcoming meeting:

Staff: ${intel.staff_name}
Efficiency: ${intel.efficiency_score}%
Tasks: ${intel.completed_tasks}/${intel.total_tasks} completed, ${intel.in_progress_tasks} in progress
Punctuality: ${intel.punctuality_status} (avg ${intel.avg_punctuality_variance} min variance)
Stuck Task: ${intel.stuck_task_name || "None"} ${intel.stuck_task_days ? `(${intel.stuck_task_days} days)` : ""}
Strengths: ${intel.recent_strengths.join(", ") || "None identified"}
Weaknesses: ${intel.recent_weaknesses.join(", ") || "None identified"}

Format: "Sir, [Name] has an [X]% rating. They are currently [Status]. Notable issue: [Issue or 'performing well']."
Keep it professional, concise, and actionable. Maximum 3 sentences.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a professional AI Chief of Staff assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Briefing generation failed.";
  } catch (error) {
    console.error("Groq API error:", error);
    return `Sir, ${intel.staff_name} has an ${intel.efficiency_score}% efficiency rating. They are currently ${intel.punctuality_status}. ${intel.stuck_task_name ? `Notable issue: Task "${intel.stuck_task_name}" has been in progress for ${intel.stuck_task_days} days.` : "No stuck tasks."}`;
  }
}

// Meeting Whisperer Routine
async function meetingWhisperer(supabase: any) {
  console.log("🔔 Running Meeting Whisperer routine...");

  // Get upcoming meetings (15 minutes ahead)
  const { data: meetings, error: meetingsError } = await supabase
    .rpc("get_upcoming_meetings", { minutes_ahead: 15 });

  if (meetingsError) {
    console.error("Error fetching meetings:", meetingsError);
    return { success: false, error: meetingsError };
  }

  if (!meetings || meetings.length === 0) {
    console.log("No upcoming meetings in the next 15 minutes.");
    return { success: true, message: "No meetings" };
  }

  const briefings = [];

  for (const meeting of meetings as Meeting[]) {
    console.log(`📅 Meeting: ${meeting.meeting_title} at ${meeting.meeting_start}`);

    // Generate briefings for each participant
    for (const participantId of meeting.participant_ids) {
      // Get staff intelligence
      const { data: intel, error: intelError } = await supabase
        .rpc("calculate_staff_efficiency", { target_staff_id: participantId });

      if (intelError || !intel || intel.length === 0) {
        console.error(`Error fetching intelligence for ${participantId}:`, intelError);
        continue;
      }

      const staffIntel = intel[0] as StaffIntelligence;
      
      // Generate AI briefing
      const briefing = await generateAIBriefing(staffIntel);
      
      // Save briefing to executive_reports
      const { error: saveError } = await supabase
        .from("executive_reports")
        .insert({
          report_type: "meeting_brief",
          title: `Meeting Brief: ${staffIntel.staff_name} - ${meeting.meeting_title}`,
          content: briefing,
          metadata: {
            meeting_id: meeting.meeting_id,
            staff_id: staffIntel.staff_id,
            meeting_start: meeting.meeting_start,
            efficiency_score: staffIntel.efficiency_score,
          },
        });

      if (saveError) {
        console.error("Error saving briefing:", saveError);
      } else {
        console.log(`✅ Briefing saved for ${staffIntel.staff_name}`);
        briefings.push({
          staff_name: staffIntel.staff_name,
          briefing,
        });
      }
    }

    // Mark meeting as notified
    await supabase
      .from("meetings")
      .update({ notification_sent: true })
      .eq("id", meeting.meeting_id);
  }

  return { success: true, briefings };
}

// Weekly Intelligence Routine
async function weeklyIntelligence(supabase: any) {
  console.log("📊 Running Weekly Intelligence routine...");

  // Get all staff
  const { data: staff, error: staffError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .neq("role", "ceo");

  if (staffError) {
    console.error("Error fetching staff:", staffError);
    return { success: false, error: staffError };
  }

  let reportContent = `# Usthad Academy Weekly Intelligence Report\n\n`;
  reportContent += `**Generated:** ${new Date().toLocaleString()}\n\n`;
  reportContent += `## Staff Performance Summary\n\n`;

  // Analyze each staff member
  for (const member of staff) {
    const { data: intel, error: intelError } = await supabase
      .rpc("calculate_staff_efficiency", { target_staff_id: member.id });

    if (intelError || !intel || intel.length === 0) continue;

    const staffIntel = intel[0] as StaffIntelligence;
    
    reportContent += `### ${staffIntel.staff_name}\n`;
    reportContent += `- **Efficiency:** ${staffIntel.efficiency_score}%\n`;
    reportContent += `- **Tasks:** ${staffIntel.completed_tasks}/${staffIntel.total_tasks} completed\n`;
    reportContent += `- **Punctuality:** ${staffIntel.punctuality_status}\n`;
    
    if (staffIntel.recent_strengths.length > 0) {
      reportContent += `- **Strengths:** ${staffIntel.recent_strengths.join(", ")}\n`;
    }
    
    if (staffIntel.recent_weaknesses.length > 0) {
      reportContent += `- **Areas for Improvement:** ${staffIntel.recent_weaknesses.join(", ")}\n`;
    }
    
    reportContent += `\n`;
  }

  // Save weekly report
  const { error: saveError } = await supabase
    .from("executive_reports")
    .insert({
      report_type: "weekly_summary",
      title: `Weekly Academy Report - ${new Date().toLocaleDateString()}`,
      content: reportContent,
      metadata: {
        staff_count: staff.length,
        generated_at: new Date().toISOString(),
      },
    });

  if (saveError) {
    console.error("Error saving weekly report:", saveError);
  } else {
    console.log("✅ Weekly report saved");
  }

  // Database cleanup: Delete old approved/rejected requests (7+ days old)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { error: deleteRequestsError } = await supabase
    .from("requests")
    .delete()
    .in("status", ["approved", "rejected"])
    .lt("created_at", sevenDaysAgo.toISOString());

  if (deleteRequestsError) {
    console.error("Error deleting old requests:", deleteRequestsError);
  } else {
    console.log("✅ Old requests cleaned up");
  }

  // Delete old knocks (7+ days old)
  const { error: deleteKnocksError } = await supabase
    .from("knocks")
    .delete()
    .lt("created_at", sevenDaysAgo.toISOString());

  if (deleteKnocksError) {
    console.error("Error deleting old knocks:", deleteKnocksError);
  } else {
    console.log("✅ Old knocks cleaned up");
  }

  return { success: true, message: "Weekly intelligence complete" };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { routine } = await req.json();

    let result;

    if (routine === "meeting_whisperer") {
      result = await meetingWhisperer(supabase);
    } else if (routine === "weekly_intelligence") {
      result = await weeklyIntelligence(supabase);
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid routine. Use 'meeting_whisperer' or 'weekly_intelligence'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
