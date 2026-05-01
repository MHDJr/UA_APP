-- Migration: Update requests table for new request types
-- Date: 2026-04-07
-- Description: Ensures the requests table supports all new request types from RequestModal

-- Note: The type column is already TEXT type, so it accepts any string value.
-- This migration adds comments and indexes for the new request types.

-- Add comment to document the request types
COMMENT ON COLUMN requests.type IS 'Request type: leave, permission, work_adjustment, expense, feedback, budget, access_elevation, role_change';

-- Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

-- Add signal_cleared column if it doesn't exist (for CEO dashboard integration)
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS signal_cleared BOOLEAN DEFAULT false;

-- Update existing RLS policies to ensure they cover all operations
-- Drop and recreate policies to ensure they're up to date
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

DROP POLICY IF EXISTS "CEO can update requests" ON requests;
CREATE POLICY "CEO can update requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Create a view for pending requests (useful for CEO dashboard)
CREATE OR REPLACE VIEW pending_requests_view AS
SELECT 
    r.*,
    p.full_name as submitted_by_name,
    p.email as submitted_by_email
FROM requests r
LEFT JOIN profiles p ON r.submitted_by = p.id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- Grant access to the view
GRANT SELECT ON pending_requests_view TO authenticated;

-- Function to get request counts by type (for analytics)
CREATE OR REPLACE FUNCTION get_request_stats()
RETURNS TABLE (
    request_type TEXT,
    total_count BIGINT,
    pending_count BIGINT,
    approved_count BIGINT,
    rejected_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.type as request_type,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE r.status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE r.status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE r.status = 'rejected') as rejected_count
    FROM requests r
    GROUP BY r.type;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_request_stats() TO authenticated;
