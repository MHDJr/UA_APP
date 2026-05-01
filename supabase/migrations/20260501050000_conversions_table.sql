-- Create conversions table to track individual student conversions
CREATE TABLE IF NOT EXISTS conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    staff_name TEXT NOT NULL,
    student_name TEXT NOT NULL,
    conversion_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversions_staff_id ON conversions(staff_id);
CREATE INDEX IF NOT EXISTS idx_conversions_date ON conversions(conversion_date);
CREATE INDEX IF NOT EXISTS idx_conversions_created_at ON conversions(created_at);

-- Add RLS policies
ALTER TABLE conversions ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can only manage their own conversions
CREATE POLICY "Staff can manage own conversions" ON conversions
    FOR ALL USING (
        auth.uid() = staff_id
    );

-- Policy: CEO can view all conversions
CREATE POLICY "CEO can view all conversions" ON conversions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'ceo'
        )
    );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversions_updated_at 
    BEFORE UPDATE ON conversions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
