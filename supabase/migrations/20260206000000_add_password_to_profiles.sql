-- Add password column to profiles table to store the staff password for reference and simple login
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;
