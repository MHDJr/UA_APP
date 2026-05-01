CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    attendees UUID[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- CEO and attendees can view
CREATE POLICY "Users can view relevant meetings"
ON meetings
FOR SELECT
TO authenticated
USING (
    auth.uid() = ANY(attendees) OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON meetings(scheduled_at);
