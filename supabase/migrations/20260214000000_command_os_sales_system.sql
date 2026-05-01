-- =====================================================
-- CEO COMMAND OS & SALES COMMAND PAGE DATABASE SCHEMA
-- =====================================================

-- =====================================================
-- PART 1: CEO COMMAND OS ENHANCEMENTS
-- =====================================================

-- Add CEO mode and enhanced tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ceo_mode_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tasks_completed_today INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tasks_overdue_count INTEGER DEFAULT 0;

-- Create organization health tracking table
CREATE TABLE IF NOT EXISTS org_health_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    attendance_rate INTEGER DEFAULT 0,
    task_completion_rate INTEGER DEFAULT 0,
    decisions_pending INTEGER DEFAULT 0,
    tasks_overdue INTEGER DEFAULT 0,
    staff_online INTEGER DEFAULT 0,
    staff_total INTEGER DEFAULT 0,
    financial_risk_amount DECIMAL(12,2) DEFAULT 0,
    overall_status TEXT DEFAULT 'Strong' -- Strong / Warning / Crisis
);

-- Create daily metrics snapshot
CREATE TABLE IF NOT EXISTS daily_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    new_leads INTEGER DEFAULT 0,
    demos_scheduled INTEGER DEFAULT 0,
    demos_completed INTEGER DEFAULT 0,
    demos_converted INTEGER DEFAULT 0,
    demos_failed INTEGER DEFAULT 0,
    follow_ups_overdue INTEGER DEFAULT 0,
    revenue_today DECIMAL(12,2) DEFAULT 0,
    expenses_today DECIMAL(12,2) DEFAULT 0,
    pending_amount DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 2: SALES COMMAND PAGE TABLES
-- =====================================================

-- Create leads table for sales pipeline
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    program_interest TEXT, -- Course/program interested in
    assigned_to UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'demo_scheduled', 'demo_completed', 'converted', 'lost', 'cold')),
    source TEXT, -- Where lead came from
    notes TEXT,
    next_follow_up TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Create demo sessions table
CREATE TABLE IF NOT EXISTS demo_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES profiles(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'no_show', 'cancelled')),
    outcome TEXT, -- converted / failed / pending
    failure_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create tutor availability table (lightweight status)
CREATE TABLE IF NOT EXISTS tutor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES profiles(id) UNIQUE NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'unavailable')),
    note TEXT, -- Optional note like "Free till 5 PM"
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- Add sales-specific columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_sales_staff BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_tutor BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sales_target INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS leads_assigned INTEGER DEFAULT 0;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_health_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Leads: visible to CEO and assigned sales staff
CREATE POLICY "Leads visible to authorized users"
ON leads FOR SELECT
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() = assigned_to
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

-- Leads: insert by sales staff and CEO
CREATE POLICY "Sales staff can insert leads"
ON leads FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

-- Leads: update by CEO and assigned staff
CREATE POLICY "Authorized users can update leads"
ON leads FOR UPDATE
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() = assigned_to
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

-- Demo sessions: visible to sales and CEO
CREATE POLICY "Demo sessions visible to authorized"
ON demo_sessions FOR SELECT
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
    OR auth.uid() = tutor_id
);

-- Demo sessions: insert by sales staff
CREATE POLICY "Sales can insert demo sessions"
ON demo_sessions FOR INSERT
WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

-- Tutor availability: visible to sales and CEO
CREATE POLICY "Tutor availability visible to sales"
ON tutor_availability FOR SELECT
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
    OR auth.uid() = tutor_id
);

-- Tutor availability: tutors can update their own
CREATE POLICY "Tutors can update own availability"
ON tutor_availability FOR UPDATE
USING (auth.uid() = tutor_id);

-- Org health: CEO only
CREATE POLICY "CEO can view org health"
ON org_health_log FOR SELECT
USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo'));

-- Daily metrics: CEO and sales
CREATE POLICY "Authorized can view daily metrics"
ON daily_metrics FOR SELECT
USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

-- =====================================================
-- SEED DATA FOR TESTING
-- =====================================================

-- Sample leads
INSERT INTO leads (lead_name, email, phone, program_interest, status, source) VALUES
('Ahmed Khan', 'ahmed@example.com', '+971501234567', 'Python Programming', 'new', 'Website'),
('Fatima Al-Sayed', 'fatima@example.com', '+971501234568', 'Data Science', 'contacted', 'Referral'),
('Omar Hassan', 'omar@example.com', '+971501234569', 'Web Development', 'demo_scheduled', 'Social Media'),
('Aisha Mohammed', 'aisha@example.com', '+971501234570', 'AI/ML', 'demo_completed', 'Website'),
('Khalid Ibrahim', 'khalid@example.com', '+971501234571', 'Digital Marketing', 'converted', 'Referral')
ON CONFLICT DO NOTHING;

-- Sample demo session
INSERT INTO demo_sessions (lead_id, tutor_id, scheduled_at, status, outcome)
SELECT 
    l.id,
    p.id,
    NOW() + interval '1 day',
    'scheduled',
    'pending'
FROM leads l, profiles p
WHERE l.status = 'demo_scheduled' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Make some profiles as sales staff and tutors for testing
UPDATE profiles SET is_sales_staff = true WHERE department ILIKE '%sales%';
UPDATE profiles SET is_tutor = true WHERE department ILIKE '%tutor%' OR department ILIKE '%instructor%';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_lead_id ON demo_sessions(lead_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_tutor_id ON demo_sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_demo_sessions_scheduled ON demo_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_tutor_availability_tutor ON tutor_availability(tutor_id);

