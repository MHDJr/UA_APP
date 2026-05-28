-- Alter broadcasts table to add target and type columns
ALTER TABLE broadcasts 
ADD COLUMN IF NOT EXISTS target TEXT DEFAULT 'CEO_BROADCAST',
ADD COLUMN IF NOT EXISTS type TEXT;

-- Drop existing INSERT policy if it exists and recreate to allow managers
DROP POLICY IF EXISTS "CEO can create broadcasts" ON broadcasts;

CREATE POLICY "CEO and Manager can create broadcasts"
  ON broadcasts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'ceo' OR role = 'manager' OR is_manager = true)
    )
  );
