-- Add signal_cleared columns to all tables for signal feed functionality
-- This ensures the signal feed can properly track which items have been cleared

-- Add signal_cleared to tasks table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'signal_cleared'
    ) THEN
        ALTER TABLE tasks ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added signal_cleared column to tasks table';
    END IF;
END $$;

-- Add signal_cleared to leads table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'signal_cleared'
    ) THEN
        ALTER TABLE leads ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added signal_cleared column to leads table';
    END IF;
END $$;

-- Add signal_cleared to requests table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'requests' AND column_name = 'signal_cleared'
    ) THEN
        ALTER TABLE requests ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added signal_cleared column to requests table';
    END IF;
END $$;

-- Add signal_cleared to ideas table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ideas' AND column_name = 'signal_cleared'
    ) THEN
        ALTER TABLE ideas ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added signal_cleared column to ideas table';
    END IF;
END $$;

-- Add signal_cleared to demo_requests table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'demo_requests' AND column_name = 'signal_cleared'
    ) THEN
        ALTER TABLE demo_requests ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added signal_cleared column to demo_requests table';
    END IF;
END $$;

-- Add signal_cleared to profiles table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'signal_cleared'
    ) THEN
        ALTER TABLE profiles ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added signal_cleared column to profiles table';
    END IF;
END $$;

-- Add signal_cleared to meetings table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'meetings' AND column_name = 'signal_cleared'
    ) THEN
        ALTER TABLE meetings ADD COLUMN signal_cleared BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added signal_cleared column to meetings table';
    END IF;
END $$;

-- Create indexes for better performance on signal_cleared queries
CREATE INDEX IF NOT EXISTS idx_tasks_signal_cleared ON tasks(signal_cleared) WHERE signal_cleared = FALSE;
CREATE INDEX IF NOT EXISTS idx_leads_signal_cleared ON leads(signal_cleared) WHERE signal_cleared = FALSE;
CREATE INDEX IF NOT EXISTS idx_requests_signal_cleared ON requests(signal_cleared) WHERE signal_cleared = FALSE;
CREATE INDEX IF NOT EXISTS idx_ideas_signal_cleared ON ideas(signal_cleared) WHERE signal_cleared = FALSE;
CREATE INDEX IF NOT EXISTS idx_demo_requests_signal_cleared ON demo_requests(signal_cleared) WHERE signal_cleared = FALSE;
CREATE INDEX IF NOT EXISTS idx_profiles_signal_cleared ON profiles(signal_cleared) WHERE signal_cleared = FALSE;
CREATE INDEX IF NOT EXISTS idx_meetings_signal_cleared ON meetings(signal_cleared) WHERE signal_cleared = FALSE;

-- Add RLS policies for signal_cleared column (if RLS is enabled)
-- These policies ensure users can only update their own signal_cleared status

-- Tasks policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'tasks' AND rowsecurity = true
    ) THEN
        DROP POLICY IF EXISTS "Users can update signal_cleared on tasks" ON tasks;
        CREATE POLICY "Users can update signal_cleared on tasks" ON tasks
            FOR UPDATE USING (auth.uid()::text = assigned_to::text)
            WITH CHECK (auth.uid()::text = assigned_to::text OR auth.jwt() ->> 'role' = 'ceo');
    END IF;
END $$;

-- Leads policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'leads' AND rowsecurity = true
    ) THEN
        DROP POLICY IF EXISTS "Users can update signal_cleared on leads" ON leads;
        CREATE POLICY "Users can update signal_cleared on leads" ON leads
            FOR UPDATE USING (true)
            WITH CHECK (auth.jwt() ->> 'role' = 'ceo');
    END IF;
END $$;

-- Requests policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'requests' AND rowsecurity = true
    ) THEN
        DROP POLICY IF EXISTS "Users can update signal_cleared on requests" ON requests;
        CREATE POLICY "Users can update signal_cleared on requests" ON requests
            FOR UPDATE USING (auth.uid()::text = submitted_by::text)
            WITH CHECK (auth.uid()::text = submitted_by::text OR auth.jwt() ->> 'role' = 'ceo');
    END IF;
END $$;

-- Ideas policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'ideas' AND rowsecurity = true
    ) THEN
        DROP POLICY IF EXISTS "Users can update signal_cleared on ideas" ON ideas;
        CREATE POLICY "Users can update signal_cleared on ideas" ON ideas
            FOR UPDATE USING (auth.uid()::text = created_by::text)
            WITH CHECK (auth.uid()::text = created_by::text OR auth.jwt() ->> 'role' = 'ceo');
    END IF;
END $$;

-- Demo requests policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'demo_requests' AND rowsecurity = true
    ) THEN
        DROP POLICY IF EXISTS "Users can update signal_cleared on demo_requests" ON demo_requests;
        CREATE POLICY "Users can update signal_cleared on demo_requests" ON demo_requests
            FOR UPDATE USING (true)
            WITH CHECK (auth.jwt() ->> 'role' = 'ceo');
    END IF;
END $$;

-- Profiles policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'profiles' AND rowsecurity = true
    ) THEN
        DROP POLICY IF EXISTS "CEO can update signal_cleared on profiles" ON profiles;
        CREATE POLICY "CEO can update signal_cleared on profiles" ON profiles
            FOR UPDATE USING (auth.jwt() ->> 'role' = 'ceo')
            WITH CHECK (auth.jwt() ->> 'role' = 'ceo');
    END IF;
END $$;

-- Meetings policy
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'meetings' AND rowsecurity = true
    ) THEN
        DROP POLICY IF EXISTS "CEO can update signal_cleared on meetings" ON meetings;
        CREATE POLICY "CEO can update signal_cleared on meetings" ON meetings
            FOR UPDATE USING (true)
            WITH CHECK (auth.jwt() ->> 'role' = 'ceo');
    END IF;
END $$;

-- Signal feed database setup completed successfully
