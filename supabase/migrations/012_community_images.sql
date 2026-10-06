-- Public photos, stored under the authenticated author's UUID.
-- The Storage API enforces both the size and MIME restrictions below.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('community-images','community-images',true,1048576,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT(id) DO UPDATE SET public=EXCLUDED.public,
  file_size_limit=EXCLUDED.file_size_limit,allowed_mime_types=EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS community_images_read ON storage.objects;
CREATE POLICY community_images_read ON storage.objects FOR SELECT
USING(bucket_id='community-images');

DROP POLICY IF EXISTS community_images_insert ON storage.objects;
CREATE POLICY community_images_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='community-images'
  AND (storage.foldername(name))[1]=auth.uid()::text
  AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_active));

-- Immutable upload names: replacing an object would change already published posts.
DROP POLICY IF EXISTS community_images_delete ON storage.objects;
CREATE POLICY community_images_delete ON storage.objects FOR DELETE TO authenticated
USING(bucket_id='community-images' AND (storage.foldername(name))[1]=auth.uid()::text);
