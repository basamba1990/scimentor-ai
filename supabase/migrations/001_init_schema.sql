-- Ensure required extension for gen_random_uuid
create extension if not exists pgcrypto;

-- Create notebooks table
CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  s3_key TEXT NOT NULL,
  s3_url TEXT NOT NULL,
  content_hash TEXT,
  cell_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notebook_path TEXT NOT NULL,
  feedback_data JSONB NOT NULL,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);

-- Enable Row Level Security on your own tables
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies for notebooks
CREATE POLICY "Users can view their own notebooks"
  ON notebooks FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own notebooks"
  ON notebooks FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own notebooks"
  ON notebooks FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own notebooks"
  ON notebooks FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- RLS policies for analyses
CREATE POLICY "Users can view their own analyses"
  ON analyses FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own analyses"
  ON analyses FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own analyses"
  ON analyses FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own analyses"
  ON analyses FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Create storage bucket for notebooks (id must be unique)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notebooks', 'notebooks', false)
ON CONFLICT (id) DO NOTHING;

-- Do NOT alter storage.objects RLS; it is already enabled by default.

-- Storage RLS: folder structure notebooks/{user_id}/...
CREATE POLICY "Users can upload their own notebooks"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'notebooks'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own notebooks"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'notebooks'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own notebooks"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'notebooks'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

-- Optional: allow users to rename/move their own files
-- Uncomment if needed
-- CREATE POLICY "Users can update their own notebooks"
--   ON storage.objects FOR UPDATE TO authenticated
--   USING (
--     bucket_id = 'notebooks'
--     AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
--   )
--   WITH CHECK (
--     bucket_id = 'notebooks'
--     AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
--   );
