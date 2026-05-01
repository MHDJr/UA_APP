// This is a template for a Supabase Edge Function
// It implements the 3 routines: Auto-Nudge, Meeting Whisperer, and Weekly Janitor

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const { routine } = await req.json()

  try {
    if (routine === 'auto-nudge') {
      // Routine A: Auto-Nudge (Every 12h)
      const { data: stalledTasks } = await supabase
        .from('tasks')
        .select('*, assigned_to:profiles(*)')
        .in('priority', ['urgent', 'high'])
        .eq('status', 'in_progress')
        .lt('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

      for (const task of stalledTasks || []) {
        await supabase.from('activity_feed').insert({
          action_type: 'nudge',
          description: `AI Nudge: Task "${task.title}" has been stagnant for 48h. @${task.assigned_to.username}, please update status.`,
          user_id: task.assigned_to.id
        })
      }
      
      await supabase.from('agent_status').update({ last_run: new Date().toISOString(), status: 'active' }).eq('id', 'auto-nudge')
      return new Response(JSON.stringify({ success: true, nudged: stalledTasks?.length }), { status: 200 })

    } else if (routine === 'meeting-whisperer') {
      // Routine B: Meeting Whisperer (15m before meetings)
      const now = new Date()
      const windowStart = new Date(now.getTime() + 14 * 60 * 1000).toISOString()
      const windowEnd = new Date(now.getTime() + 16 * 60 * 1000).toISOString()

      const { data: upcomingMeetings } = await supabase
        .from('meetings')
        .select('*')
        .gte('start_time', windowStart)
        .lte('start_time', windowEnd)

      for (const meeting of upcomingMeetings || []) {
        // Fetch intelligence for each attendee (simplified for the CEO briefing)
        const briefing = `Meeting Briefing: "${meeting.title}" starts in 15m.`
        // In a real scenario, we'd loop attendees and aggregate their stats here
        
        await supabase.from('activity_feed').insert({
          action_type: 'briefing',
          description: briefing,
          user_id: meeting.attendees[0] // Target CEO or primary attendee
        })
      }

      await supabase.from('agent_status').update({ last_run: new Date().toISOString(), status: 'active' }).eq('id', 'meeting-whisperer')
      return new Response(JSON.stringify({ success: true }), { status: 200 })

    } else if (routine === 'weekly-janitor') {
      // Routine C: Weekly Janitor & Reporter (Sunday Midnight)
      // 1. Generate Report
      const { data: reportData } = await supabase.rpc('get_weekly_stats') // Assuming a helper RPC exists
      
      await supabase.from('executive_reports').insert({
        title: `Weekly Intelligence Report - ${new Date().toLocaleDateString()}`,
        summary: { stats: reportData },
        period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        period_end: new Date().toISOString()
      })

      // 2. Pruning
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      
      await supabase.from('requests').delete().in('status', ['approved', 'rejected']).lt('created_at', sevenDaysAgo)
      await supabase.from('knocks').delete().lt('created_at', sevenDaysAgo)
      await supabase.from('broadcasts').delete().lt('created_at', sevenDaysAgo)

      await supabase.from('agent_status').update({ last_run: new Date().toISOString(), status: 'active' }).eq('id', 'weekly-janitor')
      return new Response(JSON.stringify({ success: true, pruned: true }), { status: 200 })
    }

    return new Response(JSON.stringify({ error: 'Invalid routine' }), { status: 400 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
