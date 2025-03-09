/*
  # Create meeting proposals and attendances tables

  1. New Tables
    - `meeting_proposals`
      - `id` (bigserial, primary key)
      - `meeting_id` (bigint, references meetings)
      - `proposed_by` (uuid, references users)
      - `details` (text)
      - `status` (text: pending, accepted, rejected)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `reviewed_by` (uuid, references users)
      - `reviewed_at` (timestamptz)
      - `review_comments` (text)

    - `attendances`
      - `meeting_id` (bigint, references meetings)
      - `user_id` (uuid, references users)
      - `attending` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `reason` (text, for absence justification)

  2. Security
    - Enable RLS on both tables
    - Add policies for viewing and managing proposals
    - Add policies for managing attendance records
*/

-- Create meeting proposals table
CREATE TABLE meeting_proposals (
  id bigserial PRIMARY KEY,
  meeting_id bigint REFERENCES meetings(id) ON DELETE CASCADE,
  proposed_by uuid REFERENCES auth.users(id),
  details text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_comments text,
  CONSTRAINT meeting_proposals_details_not_empty CHECK (length(trim(details)) > 0)
);

-- Create attendances table with composite primary key
CREATE TABLE attendances (
  meeting_id bigint REFERENCES meetings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  attending boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reason text,
  PRIMARY KEY (meeting_id, user_id)
);

-- Create indexes for common queries
CREATE INDEX idx_meeting_proposals_meeting_id ON meeting_proposals(meeting_id);
CREATE INDEX idx_meeting_proposals_proposed_by ON meeting_proposals(proposed_by);
CREATE INDEX idx_meeting_proposals_status ON meeting_proposals(status);
CREATE INDEX idx_attendances_meeting_id ON attendances(meeting_id);
CREATE INDEX idx_attendances_user_id ON attendances(user_id);

-- Enable Row Level Security
ALTER TABLE meeting_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

-- Policies for meeting proposals
CREATE POLICY "Users can view all meeting proposals"
  ON meeting_proposals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own proposals"
  ON meeting_proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (proposed_by = auth.uid());

CREATE POLICY "Admins can manage all proposals"
  ON meeting_proposals
  FOR ALL
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

-- Policies for attendances
CREATE POLICY "Users can view all attendances"
  ON attendances
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own attendance"
  ON attendances
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all attendances"
  ON attendances
  FOR ALL
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

-- Create triggers for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_meeting_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meeting_proposals_updated_at
  BEFORE UPDATE ON meeting_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_proposals_updated_at();

CREATE OR REPLACE FUNCTION update_attendances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER attendances_updated_at
  BEFORE UPDATE ON attendances
  FOR EACH ROW
  EXECUTE FUNCTION update_attendances_updated_at();