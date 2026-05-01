-- Add reactions field to ideas table for staff acknowledgments
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS reactions UUID[] DEFAULT '{}';

-- Add index for better performance on reactions
CREATE INDEX IF NOT EXISTS idx_ideas_reactions ON ideas USING GIN(reactions);
