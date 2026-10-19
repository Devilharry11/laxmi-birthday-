-- Supabase PostgreSQL Schema & Security Policies for DOS LAXMI

-- 1. Create content table for draft and published website versions
CREATE TABLE IF NOT EXISTS public.birthday_content (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL UNIQUE CHECK (status IN ('draft', 'published')),
  version INT NOT NULL DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create media library table
CREATE TABLE IF NOT EXISTS public.media_files (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('photo', 'video', 'audio')),
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  caption TEXT,
  alt_text TEXT,
  size BIGINT,
  mime_type TEXT,
  is_hero BOOLEAN DEFAULT false,
  scrapbook_page_id VARCHAR(64),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.birthday_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for birthday_content

-- PUBLIC ACCESS: Anyone can view ONLY published content
DROP POLICY IF EXISTS "Public can view published birthday content" ON public.birthday_content;
CREATE POLICY "Public can view published birthday content"
  ON public.birthday_content
  FOR SELECT
  USING (status = 'published');

-- ADMIN ACCESS: Only authenticated users (Aryan) can view and modify all content
DROP POLICY IF EXISTS "Authenticated admin has full access to birthday content" ON public.birthday_content;
CREATE POLICY "Authenticated admin has full access to birthday content"
  ON public.birthday_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. RLS Policies for media_files

-- PUBLIC ACCESS: Anyone can view media files
DROP POLICY IF EXISTS "Public can view media files" ON public.media_files;
CREATE POLICY "Public can view media files"
  ON public.media_files
  FOR SELECT
  USING (true);

-- ADMIN ACCESS: Only authenticated admin can insert, update, or delete media
DROP POLICY IF EXISTS "Authenticated admin can manage media" ON public.media_files;
CREATE POLICY "Authenticated admin can manage media"
  ON public.media_files
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Storage Buckets configuration (Run in Supabase Storage SQL or Dashboard)
-- Create 'media' public bucket for photos, videos, and music
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public read
DROP POLICY IF EXISTS "Public Media Read" ON storage.objects;
CREATE POLICY "Public Media Read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Storage RLS: Admin upload and delete
DROP POLICY IF EXISTS "Admin Media Upload" ON storage.objects;
CREATE POLICY "Admin Media Upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin Media Delete" ON storage.objects;
CREATE POLICY "Admin Media Delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');
