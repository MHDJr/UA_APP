-- =====================================================
-- COMPREHENSIVE SQL MIGRATION FOR UA SOFTWARE
-- This file contains all necessary SQL updates not yet applied to Supabase
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: PROFILES TABLE UPDATES
-- =====================================================

-- Add is_sales_staff column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_sales_staff BOOLEAN DEFAULT FALSE;

-- Add is_tutor column to profiles if not exists  
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_tutor BOOLEAN DEFAULT FALSE;

-- =====================================================
-- PART 2: LEADS TABLE COLUMNS
-- =====================================================

-- Ensure all required columns exist in leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS place TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_outcome TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS conversion_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_tutor_id UUID REFERENCES profiles(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS demo_time TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- =====================================================
-- PART 3: TUTOR AVAILABILITY TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS tutor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'unavailable' CHECK (status IN ('available', 'busy', 'unavailable')),
    note TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;

-- Policy: tutors can update their own availability
DROP POLICY IF EXISTS "Tutors can update own availability" ON tutor_availability;
CREATE POLICY "Tutors can update own availability" ON tutor_availability FOR ALL
USING (auth.uid() = tutor_id)
WITH CHECK (auth.uid() = tutor_id);

-- Policy: sales and CEO can view availability
DROP POLICY IF EXISTS "Sales and CEO can view availability" ON tutor_availability;
CREATE POLICY "Sales and CEO can view availability" ON tutor_availability FOR SELECT
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
    OR auth.uid() = tutor_id
);

-- =====================================================
-- PART 4: DEMO REQUESTS TABLE (if not exists)
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

-- RLS for demo_requests
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Demo requests visible to authorized" ON demo_requests;
CREATE POLICY "Demo requests visible to authorized" ON demo_requests FOR SELECT
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
    OR auth.uid() = tutor_id
);

DROP POLICY IF EXISTS "Sales can insert demo requests" ON demo_requests;
CREATE POLICY "Sales can insert demo requests" ON demo_requests FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

DROP POLICY IF EXISTS "Tutor can respond to demo requests" ON demo_requests;
CREATE POLICY "Tutor can respond to demo requests" ON demo_requests FOR UPDATE
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
    OR auth.uid() = tutor_id
);

-- =====================================================
-- PART 5: NOTIFICATIONS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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

-- =====================================================
-- PART 6: INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_demo_requests_lead ON demo_requests(lead_id);
CREATE INDEX IF NOT EXISTS idx_demo_requests_tutor ON demo_requests(tutor_id);
CREATE INDEX IF NOT EXISTS idx_demo_requests_status ON demo_requests(status);
CREATE INDEX IF NOT EXISTS idx_leads_demo_tutor ON leads(demo_tutor_id);
CREATE INDEX IF NOT EXISTS idx_leads_demo_time ON leads(demo_time);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor ON tutor_availability(tutor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =====================================================
-- PART 7: SEED DATA FOR TUTOR AVAILABILITY
-- =====================================================

-- Insert availability records for existing tutors
INSERT INTO tutor_availability (tutor_id, status, note)
SELECT id, 'unavailable', 'Default availability'
FROM profiles 
WHERE is_tutor = true
ON CONFLICT DO NOTHING;

-- =====================================================
-- PART 8: UPDATE EXISTING RECORDS
-- =====================================================

-- Set is_sales_staff for existing sales department members
UPDATE profiles 
SET is_sales_staff = true 
WHERE department = 'sales' 
AND is_sales_staff IS NOT TRUE;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if columns exist in profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('is_sales_staff', 'is_tutor');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN ('place', 'demo_tutor_id', 'demo_time', 'priority');

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- =====================================================
-- SUMMARY: All Required Tables
-- =====================================================
-- The following 19 tables are sufficient for the application:
-- 1. profiles      - User profiles (staff, sales, CEO)
-- 2. tasks        - Task management
-- 3. requests     - Leave, budget, expense requests
-- 4. meetings     - Scheduled meetings
-- 5. broadcasts   - System broadcasts
-- 6. knocks       - Staff "at door" requests
-- 7. attendance   - Staff attendance tracking
-- 8. signup_requests - New user signup requests
-- 9. agent_status - AI agent status
-- 10. executive_reports - CEO reports
-- 11. ceo_programs - CEO programs
-- 12. roadmap_goals - Strategic roadmap goals
-- 13. roadmap_updates - Roadmap updates
-- 14. demo_requests - Demo scheduling requests
-- 15. demo_sessions - Completed demo sessions
-- 16. ceo_bookmarks - CEO quick links
-- 17. tutor_availability - Tutor availability status
-- 18. leads - Sales leads
-- 19. notifications - User notifications

