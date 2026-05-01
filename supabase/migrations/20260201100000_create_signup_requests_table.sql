-- Create signup_requests table for user sign-up approvals
-- Run this in your Supabase SQL Editor

-- Drop existing table if exists (optional - remove if you want to keep data)
-- DROP TABLE IF EXISTS signup_requests;

-- Create the table
CREATE TABLE IF NOT EXISTS signup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_signup_requests_status ON signup_requests(status);
CREATE INDEX IF NOT EXISTS idx_signup_requests_email ON signup_requests(email);

-- Enable Row Level Security
ALTER TABLE signup_requests ENABLE ROW LEVEL SECURITY;

-- Create policies one at a time
CREATE POLICY "Users can view signup requests" ON signup_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "CEO can update signup requests" ON signup_requests FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
);

-- Note: For INSERT, we use a different approach since service role API handles it
-- The API uses supabase-admin which bypasses RLS

