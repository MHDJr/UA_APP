-- Add missing attendees column to meetings table
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS attendees UUID[] NOT NULL DEFAULT '{}';

-- Re-verify RLS involves attendees
DROP POLICY IF EXISTS "Users can view relevant meetings" ON meetings;
CREATE POLICY "Users can view relevant meetings"
ON meetings
FOR SELECT
TO authenticated
USING (
    auth.uid() = ANY(attendees) OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
);
