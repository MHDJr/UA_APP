-- Add CEO alert columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ceo_alert_message TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ceo_alert_at TIMESTAMPTZ;
