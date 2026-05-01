-- ============================================
-- COMPREHENSIVE FIX: Database Schema & Authentication
-- Run this in your Supabase SQL Editor FIRST
-- ============================================

-- 1. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  message text NOT NULL,
  type text DEFAULT 'general',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Enable RLS on notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create notifications RLS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FIX PROFILES TABLE - CRITICAL FOR LOGIN
-- ============================================

-- 4. Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create a permissive read policy for authenticated users (REQUIRED FOR LOGIN)
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
CREATE POLICY "Anyone can read profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 6. Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. Allow CEO to delete staff (but not themselves)
DROP POLICY IF EXISTS "CEO can delete staff" ON profiles;
CREATE POLICY "CEO can delete staff" ON profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ceo'
    )
  );

-- ============================================
-- FIX TASKS TABLE RLS
-- ============================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CEO can manage all tasks" ON tasks;
CREATE POLICY "CEO can manage all tasks" ON tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ceo'
    )
  );

DROP POLICY IF EXISTS "Staff can see own tasks" ON tasks;
CREATE POLICY "Staff can see own tasks" ON tasks
  FOR SELECT
  USING (assigned_to = auth.uid());

DROP POLICY IF EXISTS "Staff can update own tasks" ON tasks;
CREATE POLICY "Staff can update own tasks" ON tasks
  FOR UPDATE
  USING (assigned_to = auth.uid());

-- ============================================
-- FIX ATTENDANCE TABLE RLS  
-- ============================================

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CEO can manage attendance" ON attendance;
CREATE POLICY "CEO can manage attendance" ON attendance
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ceo'
    )
  );

DROP POLICY IF EXISTS "Staff can manage own attendance" ON attendance;
CREATE POLICY "Staff can manage own attendance" ON attendance
  FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- FIX KNOCKS TABLE RLS
-- ============================================

ALTER TABLE knocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "CEO can manage knocks" ON knocks;
CREATE POLICY "CEO can manage knocks" ON knocks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'ceo'
    )
  );

DROP POLICY IF EXISTS "Staff can create knocks" ON knocks;
CREATE POLICY "Staff can create knocks" ON knocks
  FOR INSERT
  WITH CHECK (knocked_by = auth.uid());

-- ============================================
-- ENABLE REALTIME
-- ============================================

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE knocks;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all tables exist
SELECT 'profiles' as table_name FROM information_schema.tables WHERE table_name = 'profiles'
UNION ALL
SELECT 'tasks' FROM information_schema.tables WHERE table_name = 'tasks'
UNION ALL
SELECT 'attendance' FROM information_schema.tables WHERE table_name = 'attendance'
UNION ALL
SELECT 'notifications' FROM information_schema.tables WHERE table_name = 'notifications'
UNION ALL
SELECT 'knocks' FROM information_schema.tables WHERE table_name = 'knocks';

-- Check your CEO profile exists
SELECT id, email, role, full_name, status FROM profiles WHERE email IN ('saleemsaquafi@gmail.com', 'muhammedpsofficial@gmail.com');

-- Check RLS policies on profiles
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- ============================================
-- MANUAL CEO CREATION (IF NEEDED)
-- ============================================
-- If you don't have a CEO profile, run this after getting your auth.users id:
-- INSERT INTO profiles (id, email, full_name, role, status)
-- VALUES ('YOUR-AUTH-USER-ID-HERE', 'your-email@gmail.com', 'Your Name', 'ceo', 'online');

