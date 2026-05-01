-- =====================================================
-- MANAGER OPERATIONS COMMAND SYSTEM
-- Database setup for Manager Operations Command page
-- =====================================================

-- =====================================================
-- PART 1: ADD MANAGER ROLE TO PROFILES
-- =====================================================

-- Add is_manager column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_manager BOOLEAN DEFAULT false;

-- =====================================================
-- PART 2: MANAGER-SPECIFIC TABLES
-- =====================================================

-- Student assignments table (tracks converted leads assigned to tutors)
CREATE TABLE IF NOT EXISTS student_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'cancelled')),
    notes TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- =====================================================
-- PART 3: TUTOR TIME SLOTS
-- Pre-defined available time slots for tutors
-- =====================================================

CREATE TABLE IF NOT EXISTS tutor_time_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tutor_id, day_of_week, start_time)
);

-- =====================================================
-- PART 4: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Student assignments: Manager can see all, tutors see their own
ALTER TABLE student_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can manage all assignments" ON student_assignments;
CREATE POLICY "Managers can manage all assignments" ON student_assignments
FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_manager = true)
    OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
);

DROP POLICY IF EXISTS "Tutors can see their assignments" ON student_assignments;
CREATE POLICY "Tutors can see their assignments" ON student_assignments
FOR SELECT USING (auth.uid() = tutor_id);

-- Tutor time slots: Managers can manage, tutors manage their own
ALTER TABLE tutor_time_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Managers can view all tutor slots" ON tutor_time_slots;
CREATE POLICY "Managers can view all tutor slots" ON tutor_time_slots
FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_manager = true)
    OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
);

DROP POLICY IF EXISTS "Tutors manage their own slots" ON tutor_time_slots;
CREATE POLICY "Tutors manage their own slots" ON tutor_time_slots
FOR ALL USING (auth.uid() = tutor_id)
WITH CHECK (auth.uid() = tutor_id);

-- =====================================================
-- PART 5: INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_student_assignments_tutor ON student_assignments(tutor_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_lead ON student_assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_status ON student_assignments(status);
CREATE INDEX IF NOT EXISTS idx_tutor_slots_tutor ON tutor_time_slots(tutor_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_tutor_slots_available ON tutor_time_slots(tutor_id, is_available) WHERE is_available = true;

-- =====================================================
-- PART 6: ENHANCE CLASSES TABLE FOR MANAGER VIEW
-- =====================================================

-- Add assigned_student_count to track students in a class
ALTER TABLE classes 
ADD COLUMN IF NOT EXISTS assigned_student_count INTEGER DEFAULT 0;

-- =====================================================
-- PART 7: SEED DATA FOR TESTING
-- =====================================================

-- Sample time slots will be created when tutors set their availability
-- This is managed through the TutorCommandPage

