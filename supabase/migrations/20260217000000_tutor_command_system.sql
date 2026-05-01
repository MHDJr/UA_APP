-- =====================================================
-- TUTOR COMMAND PAGE SYSTEM
-- Professional operational dashboard for tutors
-- =====================================================

-- =====================================================
-- PART 1: CLASSES TABLE
-- Tracks scheduled classes and demos for tutors
-- =====================================================

CREATE TABLE IF NOT EXISTS classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    class_type TEXT DEFAULT 'class' CHECK (class_type IN ('class', 'demo', 'meeting')),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL, -- For demo types
    student_count INTEGER DEFAULT 0,
    max_students INTEGER DEFAULT 1,
    meeting_link TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 2: CLASS SCHEDULES (RECURRING PATTERNS)
-- For regular class schedules
-- =====================================================

CREATE TABLE IF NOT EXISTS class_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 3: ENHANCE TUTOR AVAILABILITY
-- Add auto-status tracking and preferences
-- =====================================================

ALTER TABLE tutor_availability 
ADD COLUMN IF NOT EXISTS auto_status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS preferred_notice_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS max_daily_demos INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS working_hours_start TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS working_hours_end TIME DEFAULT '21:00';

-- =====================================================
-- PART 4: TUTOR NOTIFICATIONS
-- Separate table for tutor-specific notifications
-- =====================================================

CREATE TABLE IF NOT EXISTS tutor_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('class_reminder', 'demo_assigned', 'demo_request', 'class_starting', 'system')),
    title TEXT NOT NULL,
    message TEXT,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    demo_request_id UUID REFERENCES demo_requests(id) ON DELETE SET NULL,
    read BOOLEAN DEFAULT false,
    action_taken BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- =====================================================
-- PART 5: ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Classes: Tutors can see their own, sales/CEO can see all
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tutors can manage their classes" ON classes;
CREATE POLICY "Tutors can manage their classes" ON classes
FOR ALL USING (auth.uid() = tutor_id)
WITH CHECK (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Sales and CEO can view all classes" ON classes;
CREATE POLICY "Sales and CEO can view all classes" ON classes
FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
    OR auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

-- Class schedules: Tutors manage their own
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tutors manage their schedules" ON class_schedules;
CREATE POLICY "Tutors manage their schedules" ON class_schedules
FOR ALL USING (auth.uid() = tutor_id)
WITH CHECK (auth.uid() = tutor_id);

-- Tutor notifications: Tutors see their own
ALTER TABLE tutor_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tutors see their notifications" ON tutor_notifications;
CREATE POLICY "Tutors see their notifications" ON tutor_notifications
FOR ALL USING (auth.uid() = tutor_id)
WITH CHECK (auth.uid() = tutor_id);

DROP POLICY IF EXISTS "Sales can create tutor notifications" ON tutor_notifications;
CREATE POLICY "Sales can create tutor notifications" ON tutor_notifications
FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
    OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
);

-- =====================================================
-- PART 6: INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_classes_tutor_date ON classes(tutor_id, start_time);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_lead ON classes(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_class_schedules_tutor ON class_schedules(tutor_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_tutor_notifications_tutor ON tutor_notifications(tutor_id, read, created_at);

-- =====================================================
-- PART 7: FUNCTIONS FOR AUTO-STATUS MANAGEMENT
-- =====================================================

-- Function to auto-update tutor status based on current class
CREATE OR REPLACE FUNCTION check_tutor_busy_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If tutor has a live or upcoming class within 5 minutes, set to busy
    IF EXISTS (
        SELECT 1 FROM classes 
        WHERE tutor_id = NEW.tutor_id 
        AND status IN ('upcoming', 'live')
        AND start_time <= NOW() + INTERVAL '5 minutes'
        AND end_time > NOW()
    ) THEN
        -- Update availability to busy
        UPDATE tutor_availability 
        SET status = 'busy', last_updated = NOW()
        WHERE tutor_id = NEW.tutor_id AND auto_status = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on class changes
DROP TRIGGER IF EXISTS check_tutor_status_on_class_change ON classes;
CREATE TRIGGER check_tutor_status_on_class_change
    AFTER INSERT OR UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION check_tutor_busy_status();

-- Function to create class reminder notifications
CREATE OR REPLACE FUNCTION create_class_reminder()
RETURNS void AS $$
DECLARE
    class_record RECORD;
BEGIN
    -- Find classes starting in 10-15 minutes without reminders
    FOR class_record IN 
        SELECT c.id, c.tutor_id, c.title, c.start_time
        FROM classes c
        LEFT JOIN tutor_notifications tn ON tn.class_id = c.id AND tn.type = 'class_reminder'
        WHERE c.status = 'upcoming'
        AND c.start_time BETWEEN NOW() + INTERVAL '10 minutes' AND NOW() + INTERVAL '15 minutes'
        AND tn.id IS NULL
    LOOP
        INSERT INTO tutor_notifications (tutor_id, type, title, message, class_id, expires_at)
        VALUES (
            class_record.tutor_id,
            'class_reminder',
            'Class Starting Soon',
            class_record.title || ' starts at ' || TO_CHAR(class_record.start_time, 'HH12:MI AM'),
            class_record.id,
            class_record.start_time
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 8: DEMO REQUEST ENHANCEMENTS
-- Add notification trigger when demo is assigned
-- =====================================================

-- Function to notify tutor when demo is assigned
CREATE OR REPLACE FUNCTION notify_tutor_demo_assigned()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for tutor
    INSERT INTO tutor_notifications (tutor_id, type, title, message, demo_request_id, expires_at)
    VALUES (
        NEW.tutor_id,
        'demo_assigned',
        'New Demo Assigned',
        'A demo has been scheduled for you',
        NEW.id,
        NEW.proposed_time
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on demo request insert
DROP TRIGGER IF EXISTS notify_tutor_on_demo_request ON demo_requests;
CREATE TRIGGER notify_tutor_on_demo_request
    AFTER INSERT ON demo_requests
    FOR EACH ROW
    EXECUTE FUNCTION notify_tutor_demo_assigned();

-- =====================================================
-- PART 9: SEED DATA FOR TESTING
-- =====================================================

-- Insert sample class schedules for testing (optional, comment out in production)
-- INSERT INTO class_schedules (tutor_id, title, description, day_of_week, start_time, end_time)
-- SELECT id, 'Regular Class', 'Standard session', 1, '10:00', '11:00'
-- FROM profiles WHERE is_tutor = true LIMIT 1;
