-- Migration to add title and priority to ideas table
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
