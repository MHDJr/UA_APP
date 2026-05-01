-- =====================================================
-- COMPLETE SUPABASE SETUP FOR REQUEST SYSTEM
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. REQUESTS TABLE (Core table for all request types)
-- =====================================================
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'leave', 'budget', 'access_elevation', 'role_change', 'permission', 'work_adjustment', 'expense', 'feedback'
    submitted_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    amount NUMERIC,
    priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    -- Leave request specific fields
    dates TEXT, -- Date range for leave requests
    total_days INTEGER, -- Number of days for leave
    time_range TEXT, -- For early leave (e.g., "14:30")
    purpose TEXT, -- Purpose/category of leave
    is_confirmed BOOLEAN DEFAULT false,
    -- Metadata
    signal_cleared BOOLEAN DEFAULT false, -- For CEO dashboard notifications
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Staff can view their own requests, CEO can view all
DROP POLICY IF EXISTS "Users can view own requests and CEO can view all" ON requests;
CREATE POLICY "Users can view own requests and CEO can view all"
  ON requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = submitted_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  );

-- Staff can create their own requests
DROP POLICY IF EXISTS "Staff can create requests" ON requests;
CREATE POLICY "Staff can create requests"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

-- Only CEO can update requests (approve/reject)
DROP POLICY IF EXISTS "CEO can update requests" ON requests;
CREATE POLICY "CEO can update requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Only CEO can delete requests
DROP POLICY IF EXISTS "CEO can delete requests" ON requests;
CREATE POLICY "CEO can delete requests"
  ON requests FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_requests_submitted_by ON requests(submitted_by);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_type ON requests(type);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_signal_cleared ON requests(signal_cleared);

-- =====================================================
-- 4. TRIGGERS AND FUNCTIONS
-- =====================================================

-- Auto-set expiry when request is approved/rejected
CREATE OR REPLACE FUNCTION handle_request_expiry()
RETURNS TRIGGER AS $$
BEGIN
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

-- Auto-update updated_at timestamp (if you add that column)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column if not exists
ALTER TABLE requests 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DROP TRIGGER IF EXISTS update_requests_updated_at ON requests;
CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. VIEWS FOR DASHBOARDS
-- =====================================================

-- Drop existing views first (to avoid column name change errors)
DROP VIEW IF EXISTS pending_requests_view;
DROP VIEW IF EXISTS request_stats_view;

-- View for pending requests (CEO dashboard)
CREATE VIEW pending_requests_view AS
SELECT 
    r.*,
    p.full_name as submitted_by_name,
    p.email as submitted_by_email,
    p.avatar_url as submitted_by_avatar
FROM requests r
LEFT JOIN profiles p ON r.submitted_by = p.id
WHERE r.status = 'pending'
ORDER BY 
    CASE r.priority 
        WHEN 'urgent' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'normal' THEN 3 
        ELSE 4 
    END,
    r.created_at DESC;

GRANT SELECT ON pending_requests_view TO authenticated;

-- View for request statistics
CREATE VIEW request_stats_view AS
SELECT 
    r.type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE r.status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE r.status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE r.status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE r.created_at >= date_trunc('month', now())) as this_month
FROM requests r
GROUP BY r.type;

GRANT SELECT ON request_stats_view TO authenticated;

-- =====================================================
-- 6. ANALYTICS FUNCTIONS
-- =====================================================

-- Function to get request counts by type
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

GRANT EXECUTE ON FUNCTION get_request_stats() TO authenticated;

-- Function to get staff request history
CREATE OR REPLACE FUNCTION get_staff_requests(staff_id UUID)
RETURNS TABLE (
    request_id UUID,
    request_type TEXT,
    request_title TEXT,
    request_status TEXT,
    request_priority TEXT,
    created_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as request_id,
        r.type as request_type,
        r.title as request_title,
        r.status as request_status,
        r.priority as request_priority,
        r.created_at,
        r.reviewed_at
    FROM requests r
    WHERE r.submitted_by = staff_id
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_staff_requests(UUID) TO authenticated;

-- =====================================================
-- 7. NOTIFICATIONS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info', -- 'info', 'alert', 'success', 'warning'
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days')
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE requests IS 'Staff requests including leave, budget, access elevation, role change, and permissions';
COMMENT ON COLUMN requests.type IS 'Request type: leave, budget, access_elevation, role_change, permission, work_adjustment, expense, feedback';
COMMENT ON COLUMN requests.status IS 'Current status: pending, approved, rejected';
COMMENT ON COLUMN requests.priority IS 'Priority level: low, normal, high, urgent';
COMMENT ON COLUMN requests.signal_cleared IS 'Whether the CEO has dismissed the notification for this request';

-- =====================================================
-- 9. SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Uncomment to insert test data:
/*
INSERT INTO requests (type, submitted_by, title, description, status, priority, created_at) VALUES
('leave', '00000000-0000-0000-0000-000000000000', 'Medical Leave: Jan 15', '[MEDICAL LEAVE] 2 days: Doctor appointment', 'pending', 'normal', now()),
('budget', '00000000-0000-0000-0000-000000000000', 'Budget Request: MARKETING', 'Amount: $500 | Category: marketing | Reason: Marketing campaign', 'pending', 'high', now()),
('access_elevation', '00000000-0000-0000-0000-000000000000', 'Access Request: FINANCE', 'System: finance | Duration: temporary | Justification: Need access for month-end reports', 'pending', 'normal', now()),
('role_change', '00000000-0000-0000-0000-000000000000', 'Role Change: Senior Developer', 'New Designation: Senior Developer | Effective: 2026-05-01 | Reason: Promotion after 2 years', 'pending', 'normal', now()),
('permission', '00000000-0000-0000-0000-000000000000', 'Permission: DELETE RECORDS', 'Action: delete_records | Urgency: medium | Justification: Need to clean up old test data', 'pending', 'medium', now());
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
