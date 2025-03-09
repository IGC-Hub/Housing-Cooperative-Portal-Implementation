/*
  # Create properties, penalties and surveys tables

  1. New Tables
    - properties: Store property information
      - id (serial primary key)
      - name (text)
      - address (text)
      - timestamps
    
    - penalties: Track member penalties
      - id (serial primary key)
      - user_id (uuid, references auth.users)
      - start_date, end_date (date)
      - reason (text)
      - discount_suspended (decimal)
      - timestamps
    
    - surveys: Store member evaluations
      - id (serial primary key)
      - admin_id, evaluator_id (uuid, references auth.users)
      - rating (integer, 1-5)
      - comments (text)
      - evaluation_date (date)
      - timestamps

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Penalties table
CREATE TABLE IF NOT EXISTS penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  discount_suspended decimal(5,2) NOT NULL CHECK (discount_suspended >= 0 AND discount_suspended <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments text,
  evaluation_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (admin_id != evaluator_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_penalties_user_id ON penalties(user_id);
CREATE INDEX IF NOT EXISTS idx_penalties_dates ON penalties(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_surveys_admin_id ON surveys(admin_id);
CREATE INDEX IF NOT EXISTS idx_surveys_evaluator_id ON surveys(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_surveys_evaluation_date ON surveys(evaluation_date);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalties ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Authenticated users can view properties"
  ON properties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage properties"
  ON properties FOR ALL
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

-- Penalties policies
CREATE POLICY "Users can view their own penalties"
  ON penalties FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all penalties"
  ON penalties FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage penalties"
  ON penalties FOR ALL
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

-- Surveys policies
CREATE POLICY "Users can view surveys they're involved in"
  ON surveys FOR SELECT
  TO authenticated
  USING (
    admin_id = auth.uid() OR
    evaluator_id = auth.uid()
  );

CREATE POLICY "Admins can manage surveys"
  ON surveys FOR ALL
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_penalties_updated_at
  BEFORE UPDATE ON penalties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();