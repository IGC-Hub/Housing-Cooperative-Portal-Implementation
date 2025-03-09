/*
  # Add new fields to documents table

  1. Changes
    - Add 'type' field with CHECK constraint for document types
    - Add 'file_url' field for Supabase Storage links
    - Add 'requires_signature' field with default false

  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Add type field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'type'
  ) THEN
    ALTER TABLE documents 
    ADD COLUMN type TEXT CHECK (type IN ('regulation', 'contract', 'policy'));
  END IF;

  -- Add file_url field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE documents 
    ADD COLUMN file_url TEXT NOT NULL DEFAULT '';
  END IF;

  -- Add requires_signature field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'requires_signature'
  ) THEN
    ALTER TABLE documents 
    ADD COLUMN requires_signature BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;