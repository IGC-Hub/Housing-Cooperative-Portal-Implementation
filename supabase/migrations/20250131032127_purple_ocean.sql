-- Create forum attachments table
CREATE TABLE IF NOT EXISTS forum_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES forum_topics(id) ON DELETE CASCADE,
  reply_id uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  url text NOT NULL,
  name text NOT NULL,
  size integer NOT NULL CHECK (size > 0),
  type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT topic_or_reply_required CHECK (
    (topic_id IS NOT NULL AND reply_id IS NULL) OR
    (topic_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forum_attachments_topic ON forum_attachments(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_attachments_reply ON forum_attachments(reply_id);
CREATE INDEX IF NOT EXISTS idx_forum_attachments_created_by ON forum_attachments(created_by);

-- Enable Row Level Security
ALTER TABLE forum_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view attachments"
  ON forum_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create attachments"
  ON forum_attachments FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own attachments"
  ON forum_attachments FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create storage bucket for forum attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-attachments', 'forum-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
UPDATE storage.buckets 
SET public = false,
    avif_autodetection = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf']::text[]
WHERE id = 'forum-attachments';

-- Create storage policy for viewing files
CREATE POLICY "Authenticated users can view forum attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'forum-attachments' AND
  EXISTS (
    SELECT 1 FROM forum_attachments
    WHERE url = storage.objects.name
  )
);

-- Create storage policy for uploading files
CREATE POLICY "Authenticated users can upload forum attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'forum-attachments' AND
  auth.role() = 'authenticated'
);

-- Create storage policy for deleting files
CREATE POLICY "Users can delete their own forum attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'forum-attachments' AND
  EXISTS (
    SELECT 1 FROM forum_attachments
    WHERE url = storage.objects.name
    AND created_by = auth.uid()
  )
);