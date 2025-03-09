/*
  # Add Document Type and Signature Fields

  1. Changes
    - Add new columns to documents table:
      - `type` (text): Document type (regulation, contract, policy)
      - `file_url` (text): URL to the file in Supabase Storage
      - `requires_signature` (boolean): Whether the document requires signature

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to documents table
DO $$ BEGIN
  -- Add type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'type'
  ) THEN
    ALTER TABLE documents
    ADD COLUMN type text CHECK (type IN ('regulation', 'contract', 'policy'));
  END IF;

  -- Add file_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE documents
    ADD COLUMN file_url text NOT NULL;
  END IF;

  -- Add requires_signature column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'requires_signature'
  ) THEN
    ALTER TABLE documents
    ADD COLUMN requires_signature boolean DEFAULT false;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN documents.type IS 'Document type: regulation, contract, or policy';
COMMENT ON COLUMN documents.file_url IS 'URL to the file stored in Supabase Storage';
COMMENT ON COLUMN documents.requires_signature IS 'Whether the document requires electronic signature';