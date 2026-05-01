-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Block inserts for CEO during lockdown
CREATE POLICY "Block notifications for CEO during lockdown"
  ON notifications FOR INSERT
  WITH CHECK (
    NOT EXISTS (
      SELECT 1
      FROM profiles
      WHERE
        id = notifications.user_id AND
        role = 'ceo' AND
        status = 'lockdown'
    )
  );

-- Allow inserts for everyone else
CREATE POLICY "Allow notifications for non-lockdown users"
  ON notifications FOR INSERT
  WITH CHECK (true);
