-- Add card_screenshot column to resources (URL for the outreach-email card preview).
ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS card_screenshot text;

-- Public storage bucket for card preview screenshots (5 MB limit).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resource-card-screenshots', 'resource-card-screenshots', true, 5242880,
        ARRAY['image/png','image/jpeg','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies: authenticated users can upload/update/delete; everyone can read.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'card_screenshots_insert' AND tablename = 'objects') THEN
    CREATE POLICY card_screenshots_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resource-card-screenshots');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'card_screenshots_select' AND tablename = 'objects') THEN
    CREATE POLICY card_screenshots_select ON storage.objects FOR SELECT TO public USING (bucket_id = 'resource-card-screenshots');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'card_screenshots_update' AND tablename = 'objects') THEN
    CREATE POLICY card_screenshots_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'resource-card-screenshots');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'card_screenshots_delete' AND tablename = 'objects') THEN
    CREATE POLICY card_screenshots_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'resource-card-screenshots');
  END IF;
END $$;
