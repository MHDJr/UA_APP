-- =====================================================
-- THOUGHT CAPTURE SCHEMA FIX
-- This migration fixes the ideas table schema for thought capture
-- =====================================================

-- Step 1: Create ideas table if it doesn't exist
CREATE TABLE IF NOT EXISTS ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'archived')),
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    follow_up_date TIMESTAMP WITH TIME ZONE,
    auto_tagged BOOLEAN DEFAULT FALSE,
    shared_with UUID[] DEFAULT '{}',
    archived BOOLEAN DEFAULT FALSE,
    signal_cleared BOOLEAN DEFAULT FALSE,
    reactions UUID[] DEFAULT '{}'
);

-- Step 2: Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_ideas_created_by ON ideas(created_by);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_priority ON ideas(priority);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);

-- Step 3: Add missing columns if they don't exist
DO $$
BEGIN
    -- Add content column if missing (rename description to content if needed)
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'ideas' AND column_name = 'content'
    ) THEN
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'ideas' AND column_name = 'description'
        ) THEN
            ALTER TABLE ideas RENAME COLUMN description TO content;
        ELSE
            ALTER TABLE ideas ADD COLUMN content TEXT NOT NULL DEFAULT '';
        END IF;
    END IF;
    
    -- Add other missing columns
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'tags') THEN
        ALTER TABLE ideas ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'follow_up_date') THEN
        ALTER TABLE ideas ADD COLUMN follow_up_date TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'auto_tagged') THEN
        ALTER TABLE ideas ADD COLUMN auto_tagged BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'shared_with') THEN
        ALTER TABLE ideas ADD COLUMN shared_with UUID[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'archived') THEN
        ALTER TABLE ideas ADD COLUMN archived BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'signal_cleared') THEN
        ALTER TABLE ideas ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'reactions') THEN
        ALTER TABLE ideas ADD COLUMN reactions UUID[] DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = 'updated_at') THEN
        ALTER TABLE ideas ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Step 4: Enable RLS (Row Level Security)
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
DROP POLICY IF EXISTS "Users can view own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can insert own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can update own ideas" ON ideas;
DROP POLICY IF EXISTS "Users can delete own ideas" ON ideas;
DROP POLICY IF EXISTS "CEO can manage all ideas" ON ideas;

CREATE POLICY "Users can view own ideas" ON ideas
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert own ideas" ON ideas
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own ideas" ON ideas
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own ideas" ON ideas
    FOR DELETE USING (auth.uid() = created_by);

CREATE POLICY "CEO can manage all ideas" ON ideas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ceo'
        )
    );

-- Step 6: Create function to auto-tag ideas
CREATE OR REPLACE FUNCTION auto_tag_idea()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-tag based on content
    IF LOWER(NEW.content) LIKE '%urgent%' OR LOWER(NEW.content) LIKE '%asap%' THEN
        NEW.priority := 'high';
    END IF;
    
    IF LOWER(NEW.content) LIKE '%meeting%' OR LOWER(NEW.content) LIKE '%schedule%' THEN
        NEW.tags := array_append(NEW.tags, 'meeting');
    END IF;
    
    IF LOWER(NEW.content) LIKE '%follow up%' OR LOWER(NEW.content) LIKE '%followup%' THEN
        NEW.tags := array_append(NEW.tags, 'follow-up');
    END IF;
    
    NEW.auto_tagged := TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create trigger for auto-tagging
DROP TRIGGER IF EXISTS trigger_auto_tag_idea ON ideas;
CREATE TRIGGER trigger_auto_tag_idea
    BEFORE INSERT ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION auto_tag_idea();

-- Step 8: Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_ideas_updated_at ON ideas;
CREATE TRIGGER trigger_update_ideas_updated_at
    BEFORE UPDATE ON ideas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migration complete
