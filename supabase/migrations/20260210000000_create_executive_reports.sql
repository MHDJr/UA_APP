-- Create executive_reports table
CREATE TABLE IF NOT EXISTS executive_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    period_start DATE,
    period_end DATE
);

-- Enable RLS
ALTER TABLE executive_reports ENABLE ROW LEVEL SECURITY;

-- CEO can view all reports
CREATE POLICY "CEO can view all executive reports"
ON executive_reports
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Create a table to track agent heartbeat/status
CREATE TABLE IF NOT EXISTS agent_status (
    id TEXT PRIMARY KEY,
    last_run TIMESTAMPTZ,
    status TEXT,
    metadata JSONB
);

-- Insert initial records for the 3 routines
INSERT INTO agent_status (id, status) VALUES ('auto-nudge', 'idle') ON CONFLICT DO NOTHING;
INSERT INTO agent_status (id, status) VALUES ('meeting-whisperer', 'idle') ON CONFLICT DO NOTHING;
INSERT INTO agent_status (id, status) VALUES ('weekly-janitor', 'idle') ON CONFLICT DO NOTHING;

-- Enable RLS on agent_status
ALTER TABLE agent_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CEO can view agent status" ON agent_status FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));
