-- Executive Intelligence Engine Database Schema
-- Run this in Supabase SQL Editor

-- 1. Create executive_reports table for AI-generated reports
CREATE TABLE IF NOT EXISTS public.executive_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_type TEXT NOT NULL, -- 'weekly_summary', 'meeting_brief', 'staff_dossier'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Create attendance_logs table for punctuality tracking
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out TIMESTAMP WITH TIME ZONE,
  expected_clock_in TIMESTAMP WITH TIME ZONE,
  variance_minutes INTEGER, -- Calculated: actual - expected in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_executive_reports_type ON public.executive_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_executive_reports_created_at ON public.executive_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_staff_id ON public.attendance_logs(staff_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_clock_in ON public.attendance_logs(clock_in DESC);

-- 4. RLS Policies
ALTER TABLE public.executive_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- CEO can view all reports
CREATE POLICY "CEO can view all executive reports" 
  ON public.executive_reports FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo'));

-- CEO can insert reports
CREATE POLICY "CEO can insert executive reports" 
  ON public.executive_reports FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo'));

-- CEO can view all attendance logs
CREATE POLICY "CEO can view all attendance logs" 
  ON public.attendance_logs FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo'));

-- Staff can view their own attendance
CREATE POLICY "Staff can view own attendance" 
  ON public.attendance_logs FOR SELECT 
  USING (auth.uid() = staff_id);

-- Staff can insert their own attendance
CREATE POLICY "Staff can insert own attendance" 
  ON public.attendance_logs FOR INSERT 
  WITH CHECK (auth.uid() = staff_id);

-- 5. Create calculate_staff_efficiency function
CREATE OR REPLACE FUNCTION calculate_staff_efficiency(target_staff_id UUID)
RETURNS TABLE (
  staff_id UUID,
  staff_name TEXT,
  efficiency_score NUMERIC,
  completed_tasks INTEGER,
  total_tasks INTEGER,
  pending_tasks INTEGER,
  in_progress_tasks INTEGER,
  avg_punctuality_variance NUMERIC,
  punctuality_status TEXT,
  stuck_task_name TEXT,
  stuck_task_days INTEGER,
  recent_strengths TEXT[],
  recent_weaknesses TEXT[]
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_completed INTEGER;
  v_total INTEGER;
  v_pending INTEGER;
  v_in_progress INTEGER;
  v_efficiency NUMERIC;
  v_avg_variance NUMERIC;
  v_punctuality TEXT;
  v_stuck_task TEXT;
  v_stuck_days INTEGER;
  v_strengths TEXT[];
  v_weaknesses TEXT[];
  v_staff_name TEXT;
BEGIN
  -- Get staff name
  SELECT full_name INTO v_staff_name 
  FROM profiles 
  WHERE id = target_staff_id;

  -- Calculate task metrics
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'in_progress')
  INTO v_completed, v_total, v_pending, v_in_progress
  FROM tasks
  WHERE assigned_to = target_staff_id;

  -- Calculate efficiency (avoid division by zero)
  v_efficiency := CASE 
    WHEN v_total > 0 THEN ROUND((v_completed::NUMERIC / v_total::NUMERIC) * 100, 2)
    ELSE 0
  END;

  -- Calculate average punctuality variance
  SELECT COALESCE(AVG(variance_minutes), 0)
  INTO v_avg_variance
  FROM attendance_logs
  WHERE staff_id = target_staff_id
    AND clock_in >= NOW() - INTERVAL '30 days';

  -- Determine punctuality status
  v_punctuality := CASE
    WHEN v_avg_variance <= -5 THEN 'Consistently Early'
    WHEN v_avg_variance <= 5 THEN 'Punctual'
    WHEN v_avg_variance <= 15 THEN 'Occasionally Late'
    ELSE 'Frequently Late'
  END;

  -- Find stuck task (in_progress for more than 3 days)
  SELECT title, EXTRACT(DAY FROM NOW() - updated_at)::INTEGER
  INTO v_stuck_task, v_stuck_days
  FROM tasks
  WHERE assigned_to = target_staff_id
    AND status = 'in_progress'
    AND updated_at < NOW() - INTERVAL '3 days'
  ORDER BY updated_at ASC
  LIMIT 1;

  -- Analyze strengths
  v_strengths := ARRAY[]::TEXT[];
  IF v_efficiency >= 80 THEN
    v_strengths := array_append(v_strengths, 'High task completion rate');
  END IF;
  IF v_avg_variance <= 0 THEN
    v_strengths := array_append(v_strengths, 'Excellent punctuality');
  END IF;
  IF v_in_progress > 0 THEN
    v_strengths := array_append(v_strengths, 'Actively working on assignments');
  END IF;

  -- Analyze weaknesses
  v_weaknesses := ARRAY[]::TEXT[];
  IF v_efficiency < 50 THEN
    v_weaknesses := array_append(v_weaknesses, 'Low task completion rate');
  END IF;
  IF v_avg_variance > 15 THEN
    v_weaknesses := array_append(v_weaknesses, 'Punctuality needs improvement');
  END IF;
  IF v_stuck_task IS NOT NULL THEN
    v_weaknesses := array_append(v_weaknesses, 'Has tasks stuck in progress');
  END IF;
  IF v_pending > 5 THEN
    v_weaknesses := array_append(v_weaknesses, 'High pending task backlog');
  END IF;

  -- Return the result
  RETURN QUERY SELECT
    target_staff_id,
    v_staff_name,
    v_efficiency,
    v_completed,
    v_total,
    v_pending,
    v_in_progress,
    v_avg_variance,
    v_punctuality,
    v_stuck_task,
    v_stuck_days,
    v_strengths,
    v_weaknesses;
END;
$$;

-- 6. Create function to get upcoming meetings
CREATE OR REPLACE FUNCTION get_upcoming_meetings(minutes_ahead INTEGER DEFAULT 15)
RETURNS TABLE (
  meeting_id UUID,
  meeting_title TEXT,
  meeting_start TIMESTAMP WITH TIME ZONE,
  participant_ids UUID[],
  participant_names TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.start_time,
    m.participants,
    ARRAY(
      SELECT p.full_name 
      FROM profiles p 
      WHERE p.id = ANY(m.participants)
    ) AS participant_names
  FROM meetings m
  WHERE m.start_time > NOW()
    AND m.start_time <= NOW() + (minutes_ahead || ' minutes')::INTERVAL
    AND m.notification_sent = FALSE
  ORDER BY m.start_time ASC;
END;
$$;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_staff_efficiency(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_meetings(INTEGER) TO authenticated;
