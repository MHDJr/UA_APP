-- =====================================================
-- CEO COMMAND PROGRAMME SYSTEM
-- Unified scheduling system for CEO-grade command center
-- =====================================================

-- =====================================================
-- PART 1: PROGRAMMES TABLE (Core Entity)
-- Replaces fragmented demo/class/training scheduling
-- =====================================================

CREATE TABLE IF NOT EXISTS programmes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Programme Definition
    title TEXT NOT NULL,
    description TEXT,
    programme_type TEXT NOT NULL CHECK (programme_type IN ('demo', 'class', 'workshop', 'training', 'meeting')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'critical')),
    
    -- Scheduling
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (end_time - start_time)) / 60) STORED,
    
    -- Assignment (Auto or Manual)
    tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    tutor_assigned_at TIMESTAMPTZ,
    assignment_method TEXT DEFAULT 'auto' CHECK (assignment_method IN ('auto', 'manual')),
    
    -- Status Tracking
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'deployed', 'in_progress', 'completed', 'cancelled')),
    deployed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Sales Integration
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL, -- For demo types
    sales_notified BOOLEAN DEFAULT false,
    sales_viewed_at TIMESTAMPTZ,
    
    -- Capacity Intelligence
    required_capacity INTEGER DEFAULT 1, -- Tutor slots needed
    capacity_impact TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60 > 120 THEN 'high'
            WHEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60 > 60 THEN 'medium'
            ELSE 'low'
        END
    ) STORED,
    
    -- Risk Assessment
    risk_level TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN priority = 'critical' AND tutor_id IS NULL THEN 'critical'
            WHEN priority = 'high' AND tutor_id IS NULL THEN 'high'
            WHEN start_time < NOW() + INTERVAL '24 hours' AND status = 'scheduled' THEN 'high'
            ELSE 'normal'
        END
    ) STORED,
    
    -- Metadata
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_time_range CHECK (end_time > start_time),
    CONSTRAINT future_start_time CHECK (start_time > created_at - INTERVAL '1 hour')
);

-- =====================================================
-- PART 2: PROGRAMME TUTORS (Many-to-Many for Multi-Tutor Programmes)
-- =====================================================

CREATE TABLE IF NOT EXISTS programme_tutors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    programme_id UUID REFERENCES programmes(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'primary' CHECK (role IN ('primary', 'secondary', 'observer')),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    
    UNIQUE(programme_id, tutor_id)
);

-- =====================================================
-- PART 3: CAPACITY INTELLIGENCE VIEW
-- Real-time capacity calculation per day
-- =====================================================

CREATE OR REPLACE VIEW daily_capacity_intelligence AS
WITH date_range AS (
    SELECT generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE + INTERVAL '60 days',
        INTERVAL '1 day'
    )::DATE AS date
),
tutor_availability_per_day AS (
    SELECT 
        DATE(ta.last_updated) as date,
        COUNT(*) FILTER (WHERE ta.status = 'available') as available_tutors,
        COUNT(*) FILTER (WHERE ta.status = 'busy') as busy_tutors,
        COUNT(*) FILTER (WHERE ta.status = 'unavailable') as unavailable_tutors,
        COUNT(*) as total_tutors
    FROM tutor_availability ta
    WHERE ta.last_updated >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(ta.last_updated)
),
programmes_per_day AS (
    SELECT 
        DATE(p.start_time) as date,
        COUNT(*) as programme_count,
        SUM(p.required_capacity) as capacity_required,
        COUNT(*) FILTER (WHERE p.priority = 'critical') as critical_count,
        COUNT(*) FILTER (WHERE p.priority = 'high') as high_count,
        COUNT(*) FILTER (WHERE p.tutor_id IS NULL) as unassigned_count
    FROM programmes p
    WHERE p.status NOT IN ('cancelled', 'completed')
    AND p.start_time >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(p.start_time)
)
SELECT 
    d.date,
    COALESCE(ta.available_tutors, 0) as available_tutors,
    COALESCE(ta.busy_tutors, 0) as busy_tutors,
    COALESCE(ta.total_tutors, 0) as total_tutors,
    COALESCE(p.programme_count, 0) as programme_count,
    COALESCE(p.capacity_required, 0) as capacity_required,
    COALESCE(p.critical_count, 0) as critical_count,
    COALESCE(p.high_count, 0) as high_count,
    COALESCE(p.unassigned_count, 0) as unassigned_count,
    
    -- Capacity Status Calculation
    CASE 
        WHEN COALESCE(ta.available_tutors, 0) = 0 THEN 'FULL'
        WHEN COALESCE(ta.available_tutors, 0) <= COALESCE(p.capacity_required, 0) THEN 'LIMITED'
        WHEN COALESCE(ta.available_tutors, 0) <= COALESCE(p.capacity_required, 0) * 1.5 THEN 'MANAGEABLE'
        ELSE 'AVAILABLE'
    END as capacity_status,
    
    -- Risk Indicator
    CASE 
        WHEN COALESCE(p.unassigned_count, 0) > 0 AND d.date <= CURRENT_DATE + INTERVAL '2 days' THEN 'CRITICAL'
        WHEN COALESCE(p.critical_count, 0) > 0 AND COALESCE(p.unassigned_count, 0) > 0 THEN 'HIGH'
        WHEN COALESCE(p.high_count, 0) > 0 AND COALESCE(p.unassigned_count, 0) > 0 THEN 'MEDIUM'
        ELSE 'LOW'
    END as risk_level
    
FROM date_range d
LEFT JOIN tutor_availability_per_day ta ON d.date = ta.date
LEFT JOIN programmes_per_day p ON d.date = p.date
ORDER BY d.date;

-- =====================================================
-- PART 4: TUTOR MATCHING FUNCTION
-- Auto-assign best-fit tutor based on availability, skills, workload
-- =====================================================

CREATE OR REPLACE FUNCTION find_best_tutor(
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_programme_type TEXT
) RETURNS UUID AS $$
DECLARE
    best_tutor_id UUID;
BEGIN
    SELECT t.id INTO best_tutor_id
    FROM profiles t
    JOIN tutor_availability ta ON t.id = ta.tutor_id
    WHERE t.is_tutor = true
    AND ta.status = 'available'
    -- Not already booked during this time
    AND NOT EXISTS (
        SELECT 1 FROM programmes p
        WHERE p.tutor_id = t.id
        AND p.status NOT IN ('cancelled', 'completed')
        AND (p.start_time, p.end_time) OVERLAPS (p_start_time, p_end_time)
    )
    -- Not exceeding daily demo limit
    AND (
        SELECT COUNT(*) FROM programmes p2
        WHERE p2.tutor_id = t.id
        AND DATE(p2.start_time) = DATE(p_start_time)
        AND p2.status NOT IN ('cancelled', 'completed')
    ) < COALESCE(ta.max_daily_demos, 4)
    ORDER BY 
        -- Prefer tutors with fewer bookings today (workload balancing)
        (
            SELECT COUNT(*) FROM programmes p3
            WHERE p3.tutor_id = t.id
            AND DATE(p3.start_time) = DATE(p_start_time)
            AND p3.status NOT IN ('cancelled', 'completed')
        ) ASC,
        -- Prefer available tutors over those with notes
        CASE WHEN ta.note IS NULL THEN 0 ELSE 1 END ASC,
        -- Randomize to prevent always picking the same tutor
        RANDOM()
    LIMIT 1;
    
    RETURN best_tutor_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 5: AUTO-ASSIGN TRIGGER
-- Automatically assign tutor when programme is created without one
-- =====================================================

CREATE OR REPLACE FUNCTION auto_assign_tutor()
RETURNS TRIGGER AS $$
DECLARE
    assigned_tutor_id UUID;
BEGIN
    -- Only auto-assign if no tutor specified and it's a demo/class/training
    IF NEW.tutor_id IS NULL AND NEW.programme_type IN ('demo', 'class', 'workshop', 'training') THEN
        assigned_tutor_id := find_best_tutor(NEW.start_time, NEW.end_time, NEW.programme_type);
        
        IF assigned_tutor_id IS NOT NULL THEN
            NEW.tutor_id := assigned_tutor_id;
            NEW.tutor_assigned_at := NOW();
            NEW.assignment_method := 'auto';
            
            -- Create notification for tutor
            INSERT INTO tutor_notifications (tutor_id, type, title, message, created_at)
            VALUES (
                assigned_tutor_id,
                'demo_assigned',
                'New Programme Assigned',
                'You have been auto-assigned to: ' || NEW.title,
                NOW()
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_assign_tutor ON programmes;
CREATE TRIGGER trigger_auto_assign_tutor
    BEFORE INSERT ON programmes
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_tutor();

-- =====================================================
-- PART 6: SALES NOTIFICATION TRIGGER
-- Notify sales when programme is deployed
-- =====================================================

CREATE OR REPLACE FUNCTION notify_sales_on_deploy()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'deployed' AND OLD.status != 'deployed' THEN
        NEW.deployed_at := NOW();
        NEW.sales_notified := true;
        
        -- Create notification for all sales staff
        INSERT INTO notifications (user_id, title, message, type, created_at)
        SELECT 
            p.id,
            'Programme Deployed',
            NEW.title || ' has been scheduled for ' || TO_CHAR(NEW.start_time, 'YYYY-MM-DD HH12:MI AM'),
            'announcement',
            NOW()
        FROM profiles p
        WHERE p.is_sales_staff = true OR p.role = 'ceo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_sales_deploy ON programmes;
CREATE TRIGGER trigger_notify_sales_deploy
    BEFORE UPDATE ON programmes
    FOR EACH ROW
    WHEN (NEW.status = 'deployed' AND OLD.status IS DISTINCT FROM 'deployed')
    EXECUTE FUNCTION notify_sales_on_deploy();

-- =====================================================
-- PART 7: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_tutors ENABLE ROW LEVEL SECURITY;

-- CEO can manage all programmes
DROP POLICY IF EXISTS "CEO manages all programmes" ON programmes;
CREATE POLICY "CEO manages all programmes" ON programmes
FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
)
WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
);

-- Tutors can view their assigned programmes
DROP POLICY IF EXISTS "Tutors view their programmes" ON programmes;
CREATE POLICY "Tutors view their programmes" ON programmes
FOR SELECT USING (
    tutor_id = auth.uid()
    OR id IN (SELECT programme_id FROM programme_tutors WHERE tutor_id = auth.uid())
);

-- Sales can view all programmes
DROP POLICY IF EXISTS "Sales view all programmes" ON programmes;
CREATE POLICY "Sales view all programmes" ON programmes
FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE is_sales_staff = true)
);

-- Programme tutors table policies
DROP POLICY IF EXISTS "CEO manages programme tutors" ON programme_tutors;
CREATE POLICY "CEO manages programme tutors" ON programme_tutors
FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ceo')
);

DROP POLICY IF EXISTS "Tutors view their programme assignments" ON programme_tutors;
CREATE POLICY "Tutors view their programme assignments" ON programme_tutors
FOR SELECT USING (tutor_id = auth.uid());

-- =====================================================
-- PART 8: INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_programmes_start_time ON programmes(start_time);
CREATE INDEX IF NOT EXISTS idx_programmes_tutor_id ON programmes(tutor_id);
CREATE INDEX IF NOT EXISTS idx_programmes_status ON programmes(status);
CREATE INDEX IF NOT EXISTS idx_programmes_lead_id ON programmes(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_programmes_date_range ON programmes(start_time, end_time) WHERE status NOT IN ('cancelled', 'completed');
CREATE INDEX IF NOT EXISTS idx_programme_tutors_programme_id ON programme_tutors(programme_id);
CREATE INDEX IF NOT EXISTS idx_programme_tutors_tutor_id ON programme_tutors(tutor_id);

-- =====================================================
-- PART 9: REAL-TIME SUBSCRIPTION SETUP
-- Enable real-time for programmes
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE programmes;
ALTER PUBLICATION supabase_realtime ADD TABLE programme_tutors;

-- =====================================================
-- PART 10: MIGRATE EXISTING DATA
-- Convert existing classes to programmes
-- =====================================================

-- Migrate classes to programmes
INSERT INTO programmes (
    title,
    description,
    programme_type,
    priority,
    start_time,
    end_time,
    tutor_id,
    tutor_assigned_at,
    assignment_method,
    status,
    lead_id,
    created_at
)
SELECT 
    c.title,
    c.description,
    CASE c.class_type
        WHEN 'demo' THEN 'demo'
        WHEN 'class' THEN 'class'
        ELSE 'training'
    END::text,
    'normal',
    c.start_time,
    c.end_time,
    c.tutor_id,
    c.created_at,
    'manual',
    CASE c.status
        WHEN 'upcoming' THEN 'scheduled'
        WHEN 'live' THEN 'in_progress'
        WHEN 'completed' THEN 'completed'
        WHEN 'cancelled' THEN 'cancelled'
        ELSE 'scheduled'
    END::text,
    c.lead_id,
    c.created_at
FROM classes c
WHERE NOT EXISTS (SELECT 1 FROM programmes p WHERE p.title = c.title AND p.start_time = c.start_time);

-- Migrate demo requests to programmes
INSERT INTO programmes (
    title,
    programme_type,
    priority,
    start_time,
    end_time,
    tutor_id,
    tutor_assigned_at,
    assignment_method,
    status,
    lead_id,
    created_at
)
SELECT 
    'Demo: ' || l.lead_name,
    'demo',
    'high',
    dr.proposed_time,
    dr.proposed_time + INTERVAL '1 hour',
    dr.tutor_id,
    dr.responded_at,
    'manual',
    CASE dr.status
        WHEN 'accepted' THEN 'deployed'
        WHEN 'pending' THEN 'scheduled'
        WHEN 'declined' THEN 'cancelled'
        ELSE 'scheduled'
    END::text,
    dr.lead_id,
    dr.created_at
FROM demo_requests dr
JOIN leads l ON dr.lead_id = l.id
WHERE dr.status = 'accepted'
AND NOT EXISTS (SELECT 1 FROM programmes p WHERE p.lead_id = dr.lead_id AND p.start_time = dr.proposed_time);

COMMENT ON TABLE programmes IS 'Unified programme scheduling system for CEO command center';
COMMENT ON VIEW daily_capacity_intelligence IS 'Real-time capacity status per day for command calendar';
