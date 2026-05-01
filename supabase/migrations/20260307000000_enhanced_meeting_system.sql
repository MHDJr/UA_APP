-- Enhanced Executive Meeting System
-- Add comprehensive fields for upgraded summit scheduler

ALTER TABLE public.meetings
ADD COLUMN IF NOT EXISTS meeting_type text DEFAULT 'Strategic',
ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS expected_outcome text,
ADD COLUMN IF NOT EXISTS duration_minutes integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS location jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS agenda_items jsonb[] DEFAULT '{}'::jsonb[],
ADD COLUMN IF NOT EXISTS pre_tasks jsonb[] DEFAULT '{}'::jsonb[],
ADD COLUMN IF NOT EXISTS notification_prefs jsonb DEFAULT '{}'::jsonb;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meetings_type ON public.meetings(meeting_type);
CREATE INDEX IF NOT EXISTS idx_meetings_priority ON public.meetings(priority);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled ON public.meetings(scheduled_at);

COMMENT ON TABLE public.meetings IS 'Enhanced executive meetings with multi-step planning, dynamic agenda/tasks, notifications';

