-- Add acknowledgment tracking to ideas table
ALTER TABLE ideas
ADD COLUMN IF NOT EXISTS acknowledged_by UUID[] DEFAULT '{}';
