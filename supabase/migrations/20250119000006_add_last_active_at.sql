-- Add last_active_at column to profiles table for session tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON profiles(last_active_at);

-- Update existing rows to have a last_active_at value
UPDATE profiles SET last_active_at = updated_at WHERE last_active_at IS NULL;
