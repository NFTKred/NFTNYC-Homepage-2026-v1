-- Public storage bucket for manually uploaded resource images (5 MB limit).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resource-images', 'resource-images', true, 5242880,
        ARRAY['image/png','image/jpeg','image/gif','image/webp','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies: authenticated users can upload/update/delete; everyone can read.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'resource_images_insert' AND tablename = 'objects') THEN
    CREATE POLICY resource_images_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resource-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'resource_images_select' AND tablename = 'objects') THEN
    CREATE POLICY resource_images_select ON storage.objects FOR SELECT TO public USING (bucket_id = 'resource-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'resource_images_update' AND tablename = 'objects') THEN
    CREATE POLICY resource_images_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resource-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'resource_images_delete' AND tablename = 'objects') THEN
    CREATE POLICY resource_images_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resource-images');
  END IF;
END $$;
