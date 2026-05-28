-- Add type column to notifications table if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'info';

-- Send schema reload notify
NOTIFY pgrst, 'reload schema';
