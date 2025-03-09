/*
  # Add notifications table with realtime support

  1. New Tables
    - notifications
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - type (text, enum)
      - title (text)
      - content (text)
      - link (text, optional)
      - read (boolean)
      - created_at (timestamptz)
      - expires_at (timestamptz, optional)
      - metadata (jsonb)

  2. Changes
    - Add indexes for common queries
    - Enable RLS
    - Add policies for user access
    - Enable realtime for notifications
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
  DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('document', 'task', 'meeting', 'forum', 'announcement')),
  title text NOT NULL,
  content text NOT NULL,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;