-- Upgrade requests table for Command Queue
ALTER TABLE requests ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS escalated boolean DEFAULT false;

-- Optionally, we can track exactly when an escalation happened
ALTER TABLE requests ADD COLUMN IF NOT EXISTS escalated_at timestamptz;
