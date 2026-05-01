-- Migration to ensure is_daily_task column exists in tasks table
-- Run this in Supabase SQL Editor to fix the schema cache issue

-- Ensure the is_daily_task column exists
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_daily_task BOOLEAN DEFAULT FALSE;

-- Ensure other columns needed for the daily task system exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repeat_daily BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS overdue_notified BOOLEAN DEFAULT FALSE;

-- Create daily_task_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    task_title TEXT NOT NULL,
    task_description TEXT,
    priority TEXT DEFAULT 'medium',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on daily_task_templates
ALTER TABLE daily_task_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Allow full access to authenticated users" 
ON daily_task_templates FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

