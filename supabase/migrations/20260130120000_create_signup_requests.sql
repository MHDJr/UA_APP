-- Create signup_requests table for user sign-up approvals
CREATE TABLE IF NOT EXISTS signup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE signup_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert a signup request via server or authenticated users
CREATE POLICY "Allow insert signup requests"
  ON signup_requests FOR INSERT
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow CEO to select and view pending signup requests
CREATE POLICY "CEO can view signup requests"
  ON signup_requests FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

CREATE INDEX IF NOT EXISTS idx_signup_requests_status ON signup_requests(status);
