/*
  # CEO Command Center Schema

  ## New Tables
  
  1. `profiles`
    - `id` (uuid, references auth.users)
    - `email` (text)
    - `full_name` (text)
    - `role` (text: 'ceo' or 'staff')
    - `phone` (text)
    - `department` (text)
    - `avatar_url` (text)
    - `status` (text: 'online', 'busy', 'away', 'offline')
    - `ceo_door_status` (text: 'open', 'dnd')
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. `tasks`
    - `id` (uuid, primary key)
    - `assigned_to` (uuid, references profiles)
    - `title` (text)
    - `description` (text)
    - `priority` (text: 'low', 'medium', 'high', 'urgent')
    - `status` (text: 'pending', 'in_progress', 'completed')
    - `due_date` (timestamptz)
    - `created_by` (uuid, references profiles)
    - `created_at` (timestamptz)

  3. `requests`
    - `id` (uuid, primary key)
    - `type` (text: 'leave', 'expense', 'feedback', 'budget')
    - `submitted_by` (uuid, references profiles)
    - `title` (text)
    - `description` (text)
    - `amount` (numeric, nullable)
    - `status` (text: 'pending', 'approved', 'rejected')
    - `reviewed_by` (uuid, nullable)
    - `reviewed_at` (timestamptz, nullable)
    - `created_at` (timestamptz)

  4. `broadcasts`
    - `id` (uuid, primary key)
    - `message` (text)
    - `created_by` (uuid, references profiles)
    - `created_at` (timestamptz)
    - `expires_at` (timestamptz)

  5. `knocks`
    - `id` (uuid, primary key)
    - `knocked_by` (uuid, references profiles)
    - `message` (text, nullable)
    - `status` (text: 'pending', 'accepted', 'declined')
    - `created_at` (timestamptz)

  6. `activity_feed`
    - `id` (uuid, primary key)
    - `action_type` (text)
    - `description` (text)
    - `user_id` (uuid, references profiles)
    - `metadata` (jsonb, nullable)
    - `created_at` (timestamptz)

  7. `attendance`
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `clock_in` (timestamptz)
    - `clock_out` (timestamptz, nullable)
    - `date` (date)

  ## Security
  - Enable RLS on all tables
  - Policies for CEO and staff access based on roles
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  phone text,
  department text,
  avatar_url text,
  status text DEFAULT 'offline',
  ceo_door_status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text DEFAULT 'medium',
  status text DEFAULT 'pending',
  due_date timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assigned tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    auth.uid() = assigned_to OR 
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  );

CREATE POLICY "CEO can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  );

CREATE POLICY "CEO and assigned users can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = assigned_to OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  )
  WITH CHECK (
    auth.uid() = assigned_to OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  );

-- Create requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  submitted_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  amount numeric,
  status text DEFAULT 'pending',
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests and CEO can view all"
  ON requests FOR SELECT
  TO authenticated
  USING (
    auth.uid() = submitted_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  );

CREATE POLICY "Staff can create requests"
  ON requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "CEO can update requests"
  ON requests FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Create broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '1 hour')
);

ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view broadcasts"
  ON broadcasts FOR SELECT
  TO authenticated
  USING (expires_at > now());

CREATE POLICY "CEO can create broadcasts"
  ON broadcasts FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo'));

-- Create knocks table
CREATE TABLE IF NOT EXISTS knocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knocked_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE knocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own knocks and CEO can view all"
  ON knocks FOR SELECT
  TO authenticated
  USING (
    auth.uid() = knocked_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  );

CREATE POLICY "Staff can create knocks"
  ON knocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = knocked_by);

CREATE POLICY "CEO and knock owner can update knocks"
  ON knocks FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = knocked_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  )
  WITH CHECK (
    auth.uid() = knocked_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  );

-- Create activity_feed table
CREATE TABLE IF NOT EXISTS activity_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  description text NOT NULL,
  user_id uuid REFERENCES profiles(id),
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view activity feed"
  ON activity_feed FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can create activity"
  ON activity_feed FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  clock_in timestamptz DEFAULT now(),
  clock_out timestamptz,
  date date DEFAULT CURRENT_DATE
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance and CEO can view all"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ceo')
  );

CREATE POLICY "Users can create own attendance"
  ON attendance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance"
  ON attendance FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_requests_submitted_by ON requests(submitted_by);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_broadcasts_expires_at ON broadcasts(expires_at);
