-- Add signal_cleared column to all tables that feed the signal feed
-- This column will track which items have been cleared from the signal feed

-- Add to tasks table
ALTER TABLE tasks ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;

-- Add to leads table  
ALTER TABLE leads ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;

-- Add to requests table
ALTER TABLE requests ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;

-- Add to ideas table
ALTER TABLE ideas ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;

-- Add to demo_requests table
ALTER TABLE demo_requests ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_signal_cleared ON tasks(signal_cleared);
CREATE INDEX IF NOT EXISTS idx_leads_signal_cleared ON leads(signal_cleared);
CREATE INDEX IF NOT EXISTS idx_requests_signal_cleared ON requests(signal_cleared);
CREATE INDEX IF NOT EXISTS idx_ideas_signal_cleared ON ideas(signal_cleared);
CREATE INDEX IF NOT EXISTS idx_demo_requests_signal_cleared ON demo_requests(signal_cleared);
