-- Add assignment fields to conversions table
ALTER TABLE conversions 
ADD COLUMN IF NOT EXISTS assigned_tutor TEXT,
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_assignment';

-- Add index for assigned_tutor for better performance
CREATE INDEX IF NOT EXISTS idx_conversions_assigned_tutor ON conversions(assigned_tutor);

-- Add RLS policy for managers to view all conversions
CREATE POLICY "Managers can view all conversions" ON conversions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND is_manager = true
        )
    );

-- Add RLS policy for managers to update conversions (for assignment)
CREATE POLICY "Managers can update conversions" ON conversions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND is_manager = true
        )
    );
