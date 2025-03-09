/*
  # Create forum and notifications tables

  1. New Tables
    - forum_categories: Forum categories
    - forum_topics: Forum topics/threads
    - forum_replies: Forum replies
    - forum_reports: Content moderation reports
    - notifications: System notifications
    
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Forum tables
CREATE TABLE IF NOT EXISTS forum_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_position integer NOT NULL DEFAULT 0,
  moderators uuid[] DEFAULT '{}'::uuid[],
  rules text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES forum_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'locked')),
  pinned boolean DEFAULT false,
  views integer DEFAULT 0,
  last_reply_at timestamptz,
  last_reply_by uuid REFERENCES auth.users(id),
  tags text[] DEFAULT '{}'::text[]
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  edited_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted')),
  parent_id uuid REFERENCES forum_replies(id),
  likes integer DEFAULT 0,
  liked_by uuid[] DEFAULT '{}'::uuid[]
);

CREATE TABLE IF NOT EXISTS forum_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('topic', 'reply')),
  content_id uuid NOT NULL,
  reported_by uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  resolution_notes text
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('document', 'task', 'meeting', 'forum', 'announcement')),
  title text NOT NULL,
  content text,
  link text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_by ON forum_topics(created_by);
CREATE INDEX IF NOT EXISTS idx_forum_topics_status ON forum_topics(status);
CREATE INDEX IF NOT EXISTS idx_forum_replies_topic ON forum_replies(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_created_by ON forum_replies(created_by);
CREATE INDEX IF NOT EXISTS idx_forum_replies_parent ON forum_replies(parent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable Row Level Security
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Forum categories policies
CREATE POLICY "Anyone can view forum categories"
  ON forum_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage forum categories"
  ON forum_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Forum topics policies
CREATE POLICY "Anyone can view topics"
  ON forum_topics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create topics"
  ON forum_topics FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can edit their own topics"
  ON forum_topics FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Forum replies policies
CREATE POLICY "Anyone can view replies"
  ON forum_replies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create replies"
  ON forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can edit their own replies"
  ON forum_replies FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Forum reports policies
CREATE POLICY "Authenticated users can create reports"
  ON forum_reports FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Only moderators can view and manage reports"
  ON forum_reports FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'committee')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'committee')
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create triggers for updating updated_at timestamp
CREATE TRIGGER update_forum_categories_updated_at
  BEFORE UPDATE ON forum_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_topics_updated_at
  BEFORE UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_replies_updated_at
  BEFORE UPDATE ON forum_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();