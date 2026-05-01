-- Add task visibility columns for CEO and Staff page management
-- This migration adds columns to control task visibility on different pages

-- Add task visibility columns for CEO and Staff pages
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ceo_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS staff_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ceo_reviewed BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_tasks_ceo_visible ON tasks(ceo_visible) WHERE ceo_visible = false;
CREATE INDEX IF NOT EXISTS idx_tasks_staff_visible ON tasks(staff_visible) WHERE staff_visible = false;
CREATE INDEX IF NOT EXISTS idx_tasks_ceo_reviewed ON tasks(ceo_reviewed) WHERE ceo_reviewed = true;

-- Add comments for documentation
COMMENT ON COLUMN tasks.ceo_visible IS 'Controls task visibility on CEO page (FALSE = hidden from CEO only)';
COMMENT ON COLUMN tasks.staff_visible IS 'Controls task visibility on Staff page (FALSE = hidden from staff only)';
COMMENT ON COLUMN tasks.ceo_reviewed IS 'Indicates if CEO has reviewed the completed task';
COMMENT ON COLUMN tasks.reviewed_at IS 'Timestamp when CEO reviewed the task';
