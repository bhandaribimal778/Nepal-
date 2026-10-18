-- ==============================================================================
-- NEPAL NEWS: SUPABASE STORAGE BUCKET & ARTICLE CRUD MIGRATION
-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yaawyaimhhfqpnexuxgb/sql
-- ==============================================================================

-- 1. ADD alt_text COLUMN TO articles TABLE (If not already present)
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS alt_text TEXT DEFAULT '';

-- 2. CREATE STORAGE BUCKET FOR ARTICLE COVERS
-- Restricts file size to 5MB and allowed mime types to JPEG, PNG, WEBP, GIF
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'article-covers',
    'article-covers',
    true,
    5242880, -- 5 MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

-- 3. ENABLE RLS ON storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. STORAGE ACCESS POLICIES

-- 4.1 Anyone can view and download article covers publicly
DROP POLICY IF EXISTS "Public can view article cover images" ON storage.objects;
CREATE POLICY "Public can view article cover images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-covers');

-- 4.2 Authenticated admins can upload cover images
DROP POLICY IF EXISTS "Admins can upload article covers" ON storage.objects;
CREATE POLICY "Admins can upload article covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'article-covers' 
    AND (public.is_admin() OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
);

-- 4.3 Authenticated admins can update cover images
DROP POLICY IF EXISTS "Admins can update article covers" ON storage.objects;
CREATE POLICY "Admins can update article covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'article-covers' 
    AND (public.is_admin() OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
);

-- 4.4 Authenticated admins can delete cover images
DROP POLICY IF EXISTS "Admins can delete article covers" ON storage.objects;
CREATE POLICY "Admins can delete article covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'article-covers' 
    AND (public.is_admin() OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
);
