-- FIX CEO DEPLOY SCHEMA - Add missing JSONB fields for safe deploys
-- =====================================================

-- Add to meetings table (if missing)
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS agenda TEXT,
ADD COLUMN IF NOT EXISTS pre_tasks TEXT,
ADD COLUMN IF NOT EXISTS notification_prefs JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS meeting_type TEXT,
ADD COLUMN IF NOT EXISTS expected_outcome TEXT,
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;

-- Add to tasks table (safe fields)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS task_tags TEXT[],
ADD COLUMN IF NOT EXISTS repeat_daily BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_daily_task BOOLEAN DEFAULT false;

-- Ensure daily_task_templates exists (optional for repeat_daily)
CREATE TABLE IF NOT EXISTS daily_task_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES profiles(id),
    task_title TEXT NOT NULL,
    task_description TEXT,
    priority TEXT DEFAULT 'medium',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_is_new ON tasks(is_new) WHERE is_new = true;
CREATE INDEX IF NOT EXISTS idx_tasks_repeat_daily ON tasks(repeat_daily);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- RLS policies (CEO full access)
ALTER TABLE daily_task_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CEO manages daily templates" ON daily_task_templates FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo'));

COMMENT ON TABLE daily_task_templates IS 'Safe fallback for repeat_daily deploys';
