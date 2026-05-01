-- Add repeat_daily field to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repeat_daily BOOLEAN DEFAULT FALSE;

-- Add is_daily_task field to track auto-generated daily tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_daily_task BOOLEAN DEFAULT FALSE;

-- Add overdue notification tracking
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS overdue_notified BOOLEAN DEFAULT FALSE;

-- Create index for efficient daily task queries
CREATE INDEX IF NOT EXISTS idx_tasks_repeat_daily ON tasks(repeat_daily) WHERE repeat_daily = true;
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Create a table to store daily task templates
CREATE TABLE IF NOT EXISTS daily_task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS on daily_task_templates
ALTER TABLE daily_task_templates ENABLE ROW LEVEL SECURITY;

-- Policy for CEO to manage daily task templates
CREATE POLICY "CEO can manage daily task templates" ON daily_task_templates
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
    );

