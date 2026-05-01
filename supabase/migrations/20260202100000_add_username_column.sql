-- Add username column to signup_requests table
ALTER TABLE signup_requests ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add username column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_signup_requests_username ON signup_requests(username);

