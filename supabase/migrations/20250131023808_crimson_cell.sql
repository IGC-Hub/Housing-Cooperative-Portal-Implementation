/*
  # Add Task Validation Fields

  1. Changes
    - Add new columns to tasks table:
      - `status` (text): Task status (pending, completed, late)
      - `validated_by` (uuid): Reference to the admin/committee member who validated the task
      - `proof_url` (text): URL to the proof/photo in Supabase Storage
      - `validation_comment` (text): Required comment for task validation
      - `validation_timestamp` (timestamptz): When the task was validated
      - `proof_required` (boolean): Whether proof is required for this task
      - `min_comment_length` (integer): Minimum length for validation comment

  2. Security
    - Maintain existing RLS policies
    - Add new policies for task validation
*/

-- Add new columns to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'completed', 'late')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS validated_by uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS proof_url text,
ADD COLUMN IF NOT EXISTS validation_comment text,
ADD COLUMN IF NOT EXISTS validation_timestamp timestamptz,
ADD COLUMN IF NOT EXISTS proof_required boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS min_comment_length integer DEFAULT 20;

-- Add comments for documentation
COMMENT ON COLUMN tasks.status IS 'Task status: pending, completed, or late';
COMMENT ON COLUMN tasks.validated_by IS 'UUID of the administrator/committee member who validated the task';
COMMENT ON COLUMN tasks.proof_url IS 'URL to proof/photo stored in Supabase Storage';
COMMENT ON COLUMN tasks.validation_comment IS 'Required comment for task validation';
COMMENT ON COLUMN tasks.validation_timestamp IS 'When the task was validated';
COMMENT ON COLUMN tasks.proof_required IS 'Whether proof is required for this task';
COMMENT ON COLUMN tasks.min_comment_length IS 'Minimum length for validation comment';

-- Add validation policies
DO $$ BEGIN
  -- Policy for task validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tasks' AND policyname = 'Admins and committee members can validate tasks'
  ) THEN
    CREATE POLICY "Admins and committee members can validate tasks"
      ON tasks
      FOR UPDATE
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
  END IF;
END $$;