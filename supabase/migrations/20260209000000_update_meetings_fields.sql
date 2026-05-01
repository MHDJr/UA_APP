-- Add new columns to meetings table
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS meeting_link TEXT;

-- Update existing data if possible (optional)
UPDATE meetings 
SET start_time = scheduled_at, 
    end_time = scheduled_at + interval '30 minutes'
WHERE start_time IS NULL;

-- Ensure RLS allows CEO to update
CREATE POLICY "CEO can update meetings"
ON meetings
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- CEO can insert meetings
CREATE POLICY "CEO can insert meetings"
ON meetings
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));
