-- Private bucket for internal PDF-generation assets (Cameron's signature).
-- Read via the submit-visa-request edge function using the service role.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('internal-assets', 'internal-assets', false, 5242880,
        ARRAY['image/png','image/jpeg','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'internal_assets_admin_select' AND tablename = 'objects') THEN
    CREATE POLICY internal_assets_admin_select ON storage.objects
      FOR SELECT TO authenticated USING (bucket_id = 'internal-assets');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'internal_assets_admin_insert' AND tablename = 'objects') THEN
    CREATE POLICY internal_assets_admin_insert ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'internal-assets');
  END IF;
END $$;
