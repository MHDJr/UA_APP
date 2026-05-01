-- ============================================
-- Instruction Dispatch System Enhancements
-- Adds support for subtasks, attachments, and draft functionality
-- ============================================

-- Add new columns to tasks table for enhanced instruction dispatch
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS task_description TEXT;

-- Create index for faster queries on is_draft
CREATE INDEX IF NOT EXISTS idx_tasks_is_draft ON tasks(is_draft) WHERE is_draft = true;

-- Add comment to explain the new columns
COMMENT ON COLUMN tasks.subtasks IS 'JSON array of subtask items: [{"id": "uuid", "text": "string", "completed": boolean}]';
COMMENT ON COLUMN tasks.attachment_url IS 'URL to linked document or resource';
COMMENT ON COLUMN tasks.is_draft IS 'Whether this task is saved as a draft';
COMMENT ON COLUMN tasks.task_description IS 'Rich text description of the mission objective';

