-- Add enhanced task fields for the Instruction Dispatch modal
-- This migration adds new columns to support the enhanced task assignment features

-- Add task_description field (detailed description)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_description TEXT;

-- Add subtasks field (JSON array of subtasks)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subtasks JSONB;

-- Add attachment_url field (for mission assets/attachments)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Add is_draft field (to save tasks as drafts)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;

-- Add task_tags field (for categorizing tasks)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_tags TEXT[];

-- Add is_new field (to track new tasks)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT TRUE;

-- Create index for efficient queries on is_draft
CREATE INDEX IF NOT EXISTS idx_tasks_is_draft ON tasks(is_draft) WHERE is_draft = true;

-- Create index for efficient queries on is_new
CREATE INDEX IF NOT EXISTS idx_tasks_is_new ON tasks(is_new) WHERE is_new = true;

-- Create index for efficient queries on subtasks (if using JSONB)
CREATE INDEX IF NOT EXISTS idx_tasks_subtasks ON tasks USING gin(subtasks);

-- Add policy for staff to view their own tasks (in addition to existing policies)
-- This ensures staff can see tasks assigned to them
DO $$
BEGIN
    -- Check if policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Staff can view own assigned tasks'
    ) THEN
        CREATE POLICY "Staff can view own assigned tasks" ON tasks
            FOR SELECT
            TO authenticated
            USING (auth.uid() = assigned_to);
    END IF;
END
$$;
