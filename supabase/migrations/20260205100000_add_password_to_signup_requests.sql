-- Add password column to signup_requests table to preserve staff-chosen passwords
ALTER TABLE signup_requests ADD COLUMN IF NOT EXISTS password TEXT;
