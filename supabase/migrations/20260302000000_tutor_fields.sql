-- Add tutor-specific fields to profiles table
-- Subject, Language, and Rating for tutors

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tutor_subject TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tutor_language TEXT DEFAULT 'both' CHECK (tutor_language IN ('english', 'malayalam', 'both'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tutor_rating INTEGER DEFAULT 0 CHECK (tutor_rating BETWEEN 0 AND 5);

-- Create index for faster tutor queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_tutor ON profiles(is_tutor);
CREATE INDEX IF NOT EXISTS idx_profiles_tutor_subject ON profiles(tutor_subject) WHERE is_tutor = true;

