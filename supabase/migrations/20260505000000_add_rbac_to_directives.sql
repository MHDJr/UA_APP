-- =====================================================

-- RBAC SYSTEM FOR CEO DIRECTIVES
-- Add assignedTo field for role-based delegation
-- =====================================================

-- Add assigned_to field to ceo_directives table
ALTER TABLE ceo_directives 
ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(50) DEFAULT 'MANAGER',
ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS delegated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS delegated_by_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS delegated_at TIMESTAMPTZ;

-- Add constraint for assigned_to values
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ceo_directives_assigned_to_check'
    ) THEN
        ALTER TABLE ceo_directives 
        ADD CONSTRAINT ceo_directives_assigned_to_check 
        CHECK (assigned_to IN ('CEO', 'MANAGER', 'STAFF'));
    END IF;
END $$;

-- Create index for filtering by assigned_to
CREATE INDEX IF NOT EXISTS idx_ceo_directives_assigned_to ON ceo_directives(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ceo_directives_assigned_to_user_id ON ceo_directives(assigned_to_user_id);

-- Update RLS policy to allow managers to see directives assigned to them
DROP POLICY IF EXISTS "Directives viewable by target staff" ON ceo_directives;
CREATE POLICY "Directives viewable by target staff"
    ON ceo_directives FOR SELECT
    TO authenticated
    USING (
        is_active = true 
        AND (
            target_all_staff = true 
            OR assigned_to = 'MANAGER'  -- Managers can see directives assigned to MANAGER role
            OR EXISTS (
                SELECT 1 FROM directive_acknowledgments da 
                WHERE da.directive_id = ceo_directives.id AND da.user_id = auth.uid()
            )
            OR assigned_to_user_id = auth.uid()  -- Directly assigned to user
            OR EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND role = 'ceo'
            )
        )
    );

-- Drop existing view before recreating
DROP VIEW IF EXISTS staff_directives;

-- Recreate view to include assigned_to information
CREATE VIEW staff_directives AS
SELECT 
    d.id,
    d.title,
    d.message,
    d.priority,
    d.created_at,
    d.expires_at,
    d.target_all_staff,
    d.assigned_to,
    d.assigned_to_user_id,
    CASE WHEN da.id IS NOT NULL THEN true ELSE false END AS is_acknowledged,
    da.acknowledged_at
FROM ceo_directives d
LEFT JOIN directive_acknowledgments da ON d.id = da.directive_id AND da.user_id = auth.uid()
WHERE d.is_active = true 
    AND (d.expires_at IS NULL OR d.expires_at > NOW())
    AND (
        d.target_all_staff = true 
        OR d.assigned_to = 'MANAGER'
        OR da.user_id IS NOT NULL
        OR d.assigned_to_user_id = auth.uid()
    )
ORDER BY 
    CASE d.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
    d.created_at DESC;

-- =====================================================
-- TEMPORARY MANAGER CREDENTIALS
-- Create default manager user for testing
-- WARNING: This should be removed in production
-- =====================================================
-- 
-- NOTE: Run the script create-manager-user.js to create the manager user
-- This script will create both the auth user and the profile
-- 
-- Credentials:
-- Email: manager@ua.academy
-- Password: 1234
-- 
-- To run: node create-manager-user.js
-- 
-- Or manually create through Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add user"
-- 3. Email: manager@ua.academy
-- 4. Password: 1234
-- 5. Auto-confirm email: Yes
-- 6. After creation, note the user ID and run:
--    UPDATE profiles SET is_manager = true, role = 'manager' WHERE email = 'manager@ua.academy';
