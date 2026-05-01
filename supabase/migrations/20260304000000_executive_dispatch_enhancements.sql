-- Executive Dispatch Terminal Enhancements
-- Adds tracking for new tasks with visual feedback

-- Add is_new column to track newly assigned tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_new boolean DEFAULT true;

-- Add task_tags column for categorizing tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_tags text[] DEFAULT '{}';

-- Add index for efficient queries on is_new
CREATE INDEX IF NOT EXISTS idx_tasks_is_new ON tasks(is_new) WHERE is_new = true;

-- Add index for created_at descending order
CREATE INDEX IF NOT EXISTS idx_tasks_created_at_desc ON tasks(created_at DESC);

-- Update RLS policy to allow updating is_new
-- (RLS policies already handle updates based on assigned_to and created_by)

-- Function to auto-clear is_new after 60 seconds
-- This runs automatically when task is viewed
CREATE OR REPLACE FUNCTION clear_task_new_flag(task_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE tasks 
  SET is_new = false 
  WHERE id = task_id AND is_new = true;
END;
$$;

-- Function to clear all new flags for a user (when they view their tasks)
CREATE OR REPLACE FUNCTION clear_user_new_tasks(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE tasks 
  SET is_new = false 
  WHERE assigned_to = user_id AND is_new = true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION clear_task_new_flag(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_user_new_tasks(uuid) TO authenticated;

