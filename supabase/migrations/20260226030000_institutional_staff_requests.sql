-- Enhance requests table for institutional requirements
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS total_days INTEGER,
ADD COLUMN IF NOT EXISTS purpose TEXT,
ADD COLUMN IF NOT EXISTS dates TEXT, -- Store as JSON string or formatted text
ADD COLUMN IF NOT EXISTS time_range TEXT,
ADD COLUMN IF NOT EXISTS is_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Update RLS policies to be more strict
DROP POLICY IF EXISTS "Users can view own requests and CEO can view all" ON requests;
CREATE POLICY "Users can view own requests and CEO can view all"
  ON requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = submitted_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  );

DROP POLICY IF EXISTS "Staff can create requests" ON requests;
CREATE POLICY "Staff can create requests"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

-- Ensure staff cannot update or delete their own requests
DROP POLICY IF EXISTS "CEO can update requests" ON requests;
CREATE POLICY "CEO can update requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Cleanup function for expired requests
CREATE OR REPLACE FUNCTION handle_request_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changes from pending to something else, set expiry
    IF (NEW.status = 'approved' OR NEW.status = 'rejected') AND OLD.status = 'pending' THEN
        NEW.expires_at := now() + interval '24 hours';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_request_expiry ON requests;
CREATE TRIGGER trigger_set_request_expiry
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION handle_request_expiry();

-- Note: Actual deletion would ideally be handled by a cron job
-- For this implementation, we will also filter in the SELECT policy or UI
-- to ensure they don't see expired records.
