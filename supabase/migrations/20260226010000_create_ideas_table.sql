-- Create ideas table for strategic idea sharing
CREATE TABLE IF NOT EXISTS ideas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    shared_with UUID[] DEFAULT '{}',
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

-- RLS Policies
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ideas visible to creator and shared staff" ON ideas;
CREATE POLICY "Ideas visible to creator and shared staff" ON ideas FOR SELECT
USING (
    auth.uid() = created_by 
    OR auth.uid() = ANY(shared_with)
    OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
);

DROP POLICY IF EXISTS "CEOs can insert ideas" ON ideas;
CREATE POLICY "CEOs can insert ideas" ON ideas FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
);

-- Index
CREATE INDEX IF NOT EXISTS idx_ideas_created_by ON ideas(created_by);
