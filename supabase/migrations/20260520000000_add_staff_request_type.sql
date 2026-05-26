-- Add metadata column to requests table if it doesn't exist
ALTER TABLE requests ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add comment to document the new request type
COMMENT ON COLUMN requests.type IS 'Request type: leave, budget, access_elevation, role_change, permission, work_adjustment, expense, feedback, add_staff';
