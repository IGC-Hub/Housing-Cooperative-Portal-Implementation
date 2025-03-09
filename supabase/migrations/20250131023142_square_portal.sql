/*
  # Communication System Schema

  1. New Tables
    - `announcements`: Stores important announcements
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `priority` (text)
      - `category` (text)
      - `created_at` (timestamptz)
      - `created_by` (uuid)
      - `expires_at` (timestamptz)
      - `acknowledgment_required` (boolean)
      - `target_audience` (text[])

    - `announcement_acknowledgments`: Tracks who has acknowledged announcements
      - `id` (uuid, primary key)
      - `announcement_id` (uuid)
      - `user_id` (uuid)
      - `acknowledged_at` (timestamptz)

    - `faq_categories`: FAQ category organization
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `order` (integer)

    - `faq_items`: Individual FAQ entries
      - `id` (uuid, primary key)
      - `category_id` (uuid)
      - `question` (text)
      - `answer` (text)
      - `status` (text)
      - `votes` (integer)
      - `tags` (text[])

    - `faq_votes`: Tracks user votes on FAQ items
      - `id` (uuid, primary key)
      - `faq_item_id` (uuid)
      - `user_id` (uuid)
      - `vote_type` (text)

    - `faq_suggestions`: User-submitted FAQ questions
      - `id` (uuid, primary key)
      - `question` (text)
      - `context` (text)
      - `status` (text)
      - `submitted_by` (uuid)

  2. Security
    - Enable RLS on all tables
    - Add policies for read/write access based on user roles
    - Ensure proper data isolation and access control
*/

-- Announcements
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  category text NOT NULL CHECK (category IN ('maintenance', 'security', 'event', 'task', 'other')),
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  expires_at timestamptz,
  acknowledgment_required boolean DEFAULT false,
  target_audience text[] DEFAULT '{}'::text[],
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE announcement_acknowledgments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  acknowledged_at timestamptz DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

-- FAQ
CREATE TABLE faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES faq_categories(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'pending', 'archived')),
  votes integer DEFAULT 0,
  tags text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

CREATE TABLE faq_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_item_id uuid REFERENCES faq_items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(faq_item_id, user_id)
);

CREATE TABLE faq_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  context text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  comments text
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_acknowledgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_suggestions ENABLE ROW LEVEL SECURITY;

-- Announcement policies
CREATE POLICY "Anyone can view announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    CASE
      WHEN array_length(target_audience, 1) IS NULL THEN true
      WHEN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = ANY(target_audience)
      ) THEN true
      ELSE false
    END
  );

CREATE POLICY "Only admins can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Acknowledgment policies
CREATE POLICY "Users can view their own acknowledgments"
  ON announcement_acknowledgments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own acknowledgments"
  ON announcement_acknowledgments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- FAQ policies
CREATE POLICY "Anyone can view published FAQ items"
  ON faq_items FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Admins can manage FAQ items"
  ON faq_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- FAQ votes policies
CREATE POLICY "Users can view all FAQ votes"
  ON faq_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can vote once per FAQ item"
  ON faq_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- FAQ suggestions policies
CREATE POLICY "Users can create suggestions"
  ON faq_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Users can view their own suggestions"
  ON faq_suggestions FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

CREATE POLICY "Admins can view all suggestions"
  ON faq_suggestions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );