-- Public bucket for article images uploaded from the admin editor.
-- Files are written under <auth.uid()>/<timestamp>-<uuid>.<ext>.

INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "post_images_public_read" ON storage.objects;
CREATE POLICY "post_images_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "post_images_authenticated_insert_own_folder" ON storage.objects;
CREATE POLICY "post_images_authenticated_insert_own_folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
