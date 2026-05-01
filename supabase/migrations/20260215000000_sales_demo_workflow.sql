-- =====================================================
-- SALES COMMAND & DEMO WORKFLOW SYSTEM
-- Implements human workflow: Sales proposes → Tutor confirms
-- =====================================================

-- =====================================================
-- PART 1: UPDATE LEADS TABLE
-- =====================================================

-- Add missing columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS place TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_outcome TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversion_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_tutor_id UUID REFERENCES profiles(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_time TIMESTAMPTZ;

-- =====================================================
-- PART 2: CREATE DEMO REQUESTS TABLE
-- This table tracks demo PROPOSALS, not confirmed bookings
-- =====================================================

CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES profiles(id) NOT NULL,
    proposed_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    response_note TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- =====================================================
-- PART 3: UPDATE DEMO SESSIONS TABLE
-- =====================================================

ALTER TABLE demo_sessions ADD COLUMN IF NOT EXISTS demo_request_id UUID REFERENCES demo_requests(id);

-- =====================================================
-- PART 4: ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Demo requests: visible to sales staff, CEO, and the assigned tutor
DROP POLICY IF EXISTS "Demo requests visible to authorized" ON demo_requests;
CREATE POLICY "Demo requests visible to authorized" ON demo_requests FOR SELECT
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
    OR auth.uid() = tutor_id
);

-- Demo requests: insert by sales staff and CEO
DROP POLICY IF EXISTS "Sales can insert demo requests" ON demo_requests;
CREATE POLICY "Sales can insert demo requests" ON demo_requests FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

-- Demo requests: update by tutor (accept/decline) or sales/CEO
DROP POLICY IF EXISTS "Tutor can respond to demo requests" ON demo_requests;
CREATE POLICY "Tutor can respond to demo requests" ON demo_requests FOR UPDATE
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
    OR auth.uid() = tutor_id
);

-- =====================================================
-- PART 5: INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_demo_requests_lead ON demo_requests(lead_id);
CREATE INDEX IF NOT EXISTS idx_demo_requests_tutor ON demo_requests(tutor_id);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_leads_demo_tutor ON leads(demo_tutor_id);

-- =====================================================
-- PART 6: NOTIFICATIONS TABLE FOR TUTORS
-- (Using separate create table with IF NOT EXISTS)
-- =====================================================

-- Create notifications table if it doesn't exist (without foreign key to avoid dependency issues)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notification_type TEXT DEFAULT 'general',
    demo_request_id UUID
);

-- RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications visible to owner" ON notifications;
CREATE POLICY "Notifications visible to owner" ON notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authorized can send notifications" ON notifications;
CREATE POLICY "Authorized can send notifications" ON notifications FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

