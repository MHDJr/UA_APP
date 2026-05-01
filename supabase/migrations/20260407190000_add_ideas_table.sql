-- =====================================================
-- IDEAS TABLE FOR CEO INTELLIGENCE & DIRECTIVES
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. IDEAS TABLE (Store CEO ideas and strategic thoughts)
-- =====================================================
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'strategy', 'product', 'operation', 'marketing', 'other'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status TEXT DEFAULT 'active', -- 'active', 'archived', 'implemented', 'discarded'
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- CEO can view all ideas
DROP POLICY IF EXISTS "CEO can view all ideas" ON ideas;
CREATE POLICY "CEO can view all ideas"
  ON ideas FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- CEO can create ideas
DROP POLICY IF EXISTS "CEO can create ideas" ON ideas;
CREATE POLICY "CEO can create ideas"
  ON ideas FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- CEO can update ideas
DROP POLICY IF EXISTS "CEO can update ideas" ON ideas;
CREATE POLICY "CEO can update ideas"
  ON ideas FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- CEO can delete ideas
DROP POLICY IF EXISTS "CEO can delete ideas" ON ideas;
CREATE POLICY "CEO can delete ideas"
  ON ideas FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ideas_category ON ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_priority ON ideas(priority);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_created_by ON ideas(created_by);

-- =====================================================
-- 4. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ideas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ideas_updated_at_trigger ON ideas;
CREATE TRIGGER update_ideas_updated_at_trigger
    BEFORE UPDATE ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_ideas_updated_at();

-- =====================================================
-- 5. VIEWS FOR DASHBOARDS
-- =====================================================

-- View for ideas with creator info
DROP VIEW IF EXISTS ideas_with_creator_view;
CREATE VIEW ideas_with_creator_view AS
SELECT 
    i.*,
    p.full_name as created_by_name,
    p.email as created_by_email,
    p.avatar_url as created_by_avatar
FROM ideas i
LEFT JOIN profiles p ON i.created_by = p.id
ORDER BY i.created_at DESC;

GRANT SELECT ON ideas_with_creator_view TO authenticated;

-- View for ideas by category count
DROP VIEW IF EXISTS ideas_category_stats_view;
CREATE VIEW ideas_category_stats_view AS
SELECT 
    category,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE status = 'active') as active_count,
    COUNT(*) FILTER (WHERE status = 'implemented') as implemented_count,
    COUNT(*) FILTER (WHERE priority = 'critical') as critical_count,
    COUNT(*) FILTER (WHERE priority = 'high') as high_count
FROM ideas
GROUP BY category;

GRANT SELECT ON ideas_category_stats_view TO authenticated;

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE ideas IS 'CEO ideas and strategic thoughts for Intelligence & Directives section';
COMMENT ON COLUMN ideas.category IS 'Idea category: strategy, product, operation, marketing, other';
COMMENT ON COLUMN ideas.priority IS 'Priority level: low, medium, high, critical';
COMMENT ON COLUMN ideas.status IS 'Current status: active, archived, implemented, discarded';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
