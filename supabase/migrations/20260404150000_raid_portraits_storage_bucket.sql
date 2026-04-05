-- Bucket công khai cho portrait champion (mirror từ HellHades → Storage).
-- Chạy migration xong có thể: npm run mirror:raid-portraits (cần SUPABASE_SERVICE_ROLE_KEY).

INSERT INTO storage.buckets (id, name, public)
VALUES ('raid-portraits', 'raid-portraits', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "raid_portraits_public_read" ON storage.objects;
CREATE POLICY "raid_portraits_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'raid-portraits');
