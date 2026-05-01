-- =====================================================
-- EXECUTIVE COMMAND SYSTEM - SQL SCHEMA ADDITIONS
-- Usthad Academy - Executive Command System
-- Compatible with existing meetings table
-- =====================================================

-- =====================================================
-- 0. UPDATE EXISTING MEETINGS TABLE (Add missing columns)
-- =====================================================
-- Add columns to existing meetings table if they don't exist
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS agenda TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS scheduled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS scheduled_by_name VARCHAR(255);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'scheduled';
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS target_all_staff BOOLEAN DEFAULT false;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add status constraint if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'meetings_status_check'
    ) THEN
        ALTER TABLE meetings ADD CONSTRAINT meetings_status_check 
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'));
    END IF;
END $$;

-- =====================================================
-- 1. OFFICE ACTIVITY TIMELINE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS office_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Activity details
    activity_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Who performed the action
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    
    -- Target of the action
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_user_name VARCHAR(255),
    
    -- Related entity
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Visibility
    is_visible_to_all BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_office_activities_created_at ON office_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_office_activities_user_id ON office_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_office_activities_activity_type ON office_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_office_activities_target_user_id ON office_activities(target_user_id);

-- =====================================================
-- 2. MEETING ATTENDEES TABLE (New - tracks acknowledgment)
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Attendance tracking
    status VARCHAR(50) DEFAULT 'pending',
    acknowledged_at TIMESTAMPTZ,
    
    UNIQUE(meeting_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_user_id ON meeting_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);

-- =====================================================
-- 3. CEO DIRECTIVES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ceo_directives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Directive details
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    
    -- Sender (CEO)
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sender_name VARCHAR(255),
    
    -- Targeting
    target_all_staff BOOLEAN DEFAULT false,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ
);

-- Directive acknowledgments junction table
CREATE TABLE IF NOT EXISTS directive_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    directive_id UUID NOT NULL REFERENCES ceo_directives(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    acknowledged_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(directive_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ceo_directives_created_at ON ceo_directives(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ceo_directives_priority ON ceo_directives(priority);
CREATE INDEX IF NOT EXISTS idx_ceo_directives_sender_id ON ceo_directives(sender_id);
CREATE INDEX IF NOT EXISTS idx_directive_acknowledgments_user_id ON directive_acknowledgments(user_id);
CREATE INDEX IF NOT EXISTS idx_directive_acknowledgments_directive_id ON directive_acknowledgments(directive_id);

-- =====================================================
-- 4. HELPER FUNCTIONS
-- =====================================================

-- Function to log activity
CREATE OR REPLACE FUNCTION log_office_activity(
    p_activity_type VARCHAR,
    p_title VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL,
    p_user_name VARCHAR DEFAULT NULL,
    p_target_user_id UUID DEFAULT NULL,
    p_target_user_name VARCHAR DEFAULT NULL,
    p_related_entity_type VARCHAR DEFAULT NULL,
    p_related_entity_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_is_visible_to_all BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    INSERT INTO office_activities (
        activity_type, title, description, user_id, user_name,
        target_user_id, target_user_name, related_entity_type, 
        related_entity_id, metadata, is_visible_to_all
    ) VALUES (
        p_activity_type, p_title, p_description, p_user_id, p_user_name,
        p_target_user_id, p_target_user_name, p_related_entity_type,
        p_related_entity_id, p_metadata, p_is_visible_to_all
    )
    RETURNING id INTO v_activity_id;
    
    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to acknowledge a directive
CREATE OR REPLACE FUNCTION acknowledge_directive(
    p_directive_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_already_acknowledged BOOLEAN;
    v_user_name VARCHAR(255);
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM directive_acknowledgments 
        WHERE directive_id = p_directive_id AND user_id = p_user_id
    ) INTO v_already_acknowledged;
    
    IF v_already_acknowledged THEN
        RETURN FALSE;
    END IF;
    
    SELECT full_name INTO v_user_name FROM profiles WHERE id = p_user_id;
    
    INSERT INTO directive_acknowledgments (directive_id, user_id, acknowledged_at)
    VALUES (p_directive_id, p_user_id, NOW());
    
    PERFORM log_office_activity(
        'directive_acknowledged',
        'Directive Acknowledged',
        NULL,
        p_user_id,
        v_user_name,
        NULL,
        NULL,
        'directive',
        p_directive_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to acknowledge a meeting
CREATE OR REPLACE FUNCTION acknowledge_meeting(
    p_meeting_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_already_acknowledged BOOLEAN;
    v_user_name VARCHAR(255);
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM meeting_attendees 
        WHERE meeting_id = p_meeting_id AND user_id = p_user_id AND status = 'acknowledged'
    ) INTO v_already_acknowledged;
    
    IF v_already_acknowledged THEN
        RETURN FALSE;
    END IF;
    
    SELECT full_name INTO v_user_name FROM profiles WHERE id = p_user_id;
    
    INSERT INTO meeting_attendees (meeting_id, user_id, status, acknowledged_at)
    VALUES (p_meeting_id, p_user_id, 'acknowledged', NOW())
    ON CONFLICT (meeting_id, user_id) 
    DO UPDATE SET status = 'acknowledged', acknowledged_at = NOW();
    
    PERFORM log_office_activity(
        'meeting_acknowledged',
        'Meeting Acknowledged',
        NULL,
        p_user_id,
        v_user_name,
        NULL,
        NULL,
        'meeting',
        p_meeting_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. VIEWS
-- =====================================================

-- View: Staff Directives (for staff dashboard)
CREATE OR REPLACE VIEW staff_directives AS
SELECT 
    d.id,
    d.title,
    d.message,
    d.priority,
    d.created_at,
    d.expires_at,
    d.target_all_staff,
    CASE WHEN da.id IS NOT NULL THEN true ELSE false END AS is_acknowledged,
    da.acknowledged_at
FROM ceo_directives d
LEFT JOIN directive_acknowledgments da ON d.id = da.directive_id AND da.user_id = auth.uid()
WHERE d.is_active = true 
    AND (d.expires_at IS NULL OR d.expires_at > NOW())
    AND (d.target_all_staff = true OR da.user_id IS NOT NULL)
ORDER BY 
    CASE d.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
    d.created_at DESC;

-- View: My Meetings (for staff dashboard)
CREATE OR REPLACE VIEW my_meetings AS
SELECT 
    m.id,
    m.title,
    m.description,
    m.scheduled_at,
    m.agenda,
    m.status,
    m.scheduled_by_name,
    ma.status AS acknowledgment_status,
    ma.acknowledged_at
FROM meetings m
LEFT JOIN meeting_attendees ma ON m.id = ma.meeting_id AND ma.user_id = auth.uid()
WHERE auth.uid() = ANY(m.attendees)
ORDER BY m.scheduled_at DESC;

-- View: Directive Acknowledgment Summary (for CEO)
CREATE OR REPLACE VIEW directive_acknowledgment_summary AS
SELECT 
    d.id AS directive_id,
    d.title,
    d.priority,
    d.created_at,
    d.target_all_staff,
    COUNT(DISTINCT p.id) AS total_target_staff,
    COUNT(DISTINCT da.user_id) AS acknowledged_count,
    COUNT(DISTINCT p.id) - COUNT(DISTINCT da.user_id) AS pending_count,
    ARRAY_AGG(
        CASE WHEN da.user_id IS NOT NULL 
        THEN CONCAT(p.full_name, ' (', TO_CHAR(da.acknowledged_at, 'HH24:MI'), ')')
        ELSE NULL END
    ) FILTER (WHERE da.user_id IS NOT NULL) AS acknowledged_by,
    ARRAY_AGG(
        CASE WHEN da.user_id IS NULL 
        THEN p.full_name 
        ELSE NULL END
    ) FILTER (WHERE da.user_id IS NULL) AS pending_from
FROM ceo_directives d
CROSS JOIN LATERAL (
    SELECT p.id, p.full_name 
    FROM profiles p 
    WHERE p.role = 'staff'
    AND (
        d.target_all_staff = true 
        OR EXISTS (
            SELECT 1 FROM directive_acknowledgments da2 
            WHERE da2.directive_id = d.id
        )
    )
) p
LEFT JOIN directive_acknowledgments da ON d.id = da.directive_id AND da.user_id = p.id
WHERE d.is_active = true
    AND (d.expires_at IS NULL OR d.expires_at > NOW())
GROUP BY d.id, d.title, d.priority, d.created_at, d.target_all_staff
ORDER BY d.created_at DESC;

-- =====================================================
-- 6. SECURITY - ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE office_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceo_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE directive_acknowledgments ENABLE ROW LEVEL SECURITY;

-- Office Activities Policy
CREATE POLICY "Office activities are viewable by authenticated users"
    ON office_activities FOR SELECT
    TO authenticated
    USING (
        is_visible_to_all = true 
        OR user_id = auth.uid() 
        OR target_user_id = auth.uid()
    );

-- Meeting Attendees Policy
CREATE POLICY "Users can view their meeting acknowledgments"
    ON meeting_attendees FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- CEO Directives Policies
CREATE POLICY "Directives viewable by target staff"
    ON ceo_directives FOR SELECT
    TO authenticated
    USING (
        is_active = true 
        AND (
            target_all_staff = true 
            OR EXISTS (
                SELECT 1 FROM directive_acknowledgments da 
                WHERE da.directive_id = ceo_directives.id AND da.user_id = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'ceo'
            )
        )
    );

-- =====================================================
-- 7. SEED DATA (Optional - for testing)
-- =====================================================
/*
-- Sample activities
INSERT INTO office_activities (activity_type, title, description, user_name, created_at) VALUES
('clock_in', 'Staff Clocked In', 'Morning check-in', 'Afeef', NOW() - INTERVAL '2 hours'),
('task_completed', 'Task Completed', 'Website Audit finished', 'Muhammed', NOW() - INTERVAL '1 hour'),
('directive_acknowledged', 'Directive Acknowledged', 'Safety protocols acknowledged', 'Rasheeda Salim', NOW() - INTERVAL '30 minutes');

-- Sample directive
INSERT INTO ceo_directives (title, message, priority, sender_name, target_all_staff) VALUES
('Q1 Objectives Review', 'All staff must review and acknowledge the Q1 objectives document by end of week.', 'high', 'CEO', true),
('Safety Protocols Update', 'Updated safety protocols have been posted. Please review and acknowledge.', 'medium', 'CEO', true);
*/

