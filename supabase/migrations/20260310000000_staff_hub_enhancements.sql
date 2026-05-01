-- Staff Hub Enhancements Migration
-- Add task urgent directive fields + staff_presence table

-- Add to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS ceo_directive TEXT;

-- Create staff_presence table
CREATE TABLE IF NOT EXISTS staff_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'offline',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    session_start TIMESTAMPTZ,
    session_duration INTEGER DEFAULT 0,
    
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_presence_user_id ON staff_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_presence_status ON staff_presence(status);
CREATE INDEX IF NOT EXISTS idx_staff_presence_updated_at ON staff_presence(updated_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_staff_presence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_staff_presence_updated_at BEFORE UPDATE
    ON staff_presence FOR EACH ROW EXECUTE PROCEDURE update_staff_presence_updated_at();

-- RLS for staff_presence
ALTER TABLE staff_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view/update own presence" ON staff_presence FOR ALL
    TO authenticated USING (user_id = auth.uid());

CREATE POLICY "CEO can view all presence" ON staff_presence FOR SELECT
    TO authenticated USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
    );

-- View for CEO presence dashboard
CREATE OR REPLACE VIEW ceo_staff_presence AS
SELECT 
    sp.*,
    p.full_name,
    p.role,
    p.department
FROM staff_presence sp
JOIN profiles p ON sp.user_id = p.id
WHERE p.role = 'staff'
ORDER BY sp.updated_at DESC;
