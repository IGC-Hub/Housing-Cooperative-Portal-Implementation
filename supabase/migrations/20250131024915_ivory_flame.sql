/*
  # Create meetings table

  1. New Tables
    - `meetings`
      - `id` (bigserial, primary key)
      - `type` (text, enum: 'AG', 'CA', 'committee')
      - `title` (text)
      - `scheduled_at` (timestamptz)
      - `agenda_items` (jsonb array)
      - `agenda_deadline` (timestamptz)
      - `quorum_required` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references users)
      - `status` (text, enum: 'scheduled', 'in_progress', 'completed', 'cancelled')

  2. Security
    - Enable RLS on meetings table
    - Add policies for authenticated users to view meetings
    - Add policies for admins to manage meetings
*/

CREATE TABLE meetings (
  id bigserial PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('AG', 'CA', 'committee')),
  title text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  agenda_items jsonb[] DEFAULT array[]::jsonb[],
  agenda_deadline timestamptz NOT NULL,
  quorum_required integer NOT NULL CHECK (quorum_required > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- Create index for common queries
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX idx_meetings_type ON meetings(type);
CREATE INDEX idx_meetings_status ON meetings(status);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can view meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage meetings"
  ON meetings
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

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_meetings_updated_at();